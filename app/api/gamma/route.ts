import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new (YahooFinanceClass as any)();

export const revalidate = 60; // 60 seconds (options chains are heavy)

const DEFAULT_SYMBOLS = ['GME', 'TSLA', 'NVDA', 'AMC', 'MARA', 'PLTR', 'SMCI'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',') : DEFAULT_SYMBOLS;

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          // Get quote for current price and volume
          const quote = await yahooFinance.quote(symbol);
          const currentPrice = quote.regularMarketPrice;
          const avgVolume = quote.averageDailyVolume10Day || quote.regularMarketVolume || 1;

          if (!currentPrice) throw new Error('No price available');

          // Get the closest expiration options chain
          const options = await yahooFinance.options(symbol);
          if (!options || !options.options || options.options.length === 0) {
             return null;
          }

          const nearTermChain = options.options[0];
          const calls = nearTermChain.calls || [];

          // Find Out-Of-The-Money (OTM) calls (strike > currentPrice)
          const otmCalls = calls.filter(c => c.strike > currentPrice);
          
          // Total OTM Call Open Interest
          const totalOTMCallOI = otmCalls.reduce((sum, c) => sum + (c.openInterest || 0), 0);
          
          // Avg Implied Volatility for OTM Calls
          const otmCallsWithIV = otmCalls.filter(c => c.impliedVolatility);
          const avgIV = otmCallsWithIV.length > 0 
            ? otmCallsWithIV.reduce((sum, c) => sum + c.impliedVolatility!, 0) / otmCallsWithIV.length 
            : 0;

          // Simple heuristic Gamma Risk Score:
          // 1 contract = 100 shares. Total shares involved = totalOTMCallOI * 100
          // Ratio of shares in OTM calls vs average daily volume
          const callShareRatio = (totalOTMCallOI * 100) / avgVolume;
          
          // Normalize score to 0-100.
          // Let's say if call shares equal 5% of daily volume, score = 50.
          // Also factor in IV.
          let score = (callShareRatio * 1000) + (avgIV * 20); 
          score = Math.min(100, Math.max(0, score));

          return {
            symbol,
            price: currentPrice,
            score: parseFloat(score.toFixed(2)),
            callShareRatio: parseFloat((callShareRatio * 100).toFixed(2)), // as percentage
            avgIV: parseFloat((avgIV * 100).toFixed(2)), // as percentage
            totalOTMCallOI,
          };
        } catch (err) {
          console.warn(`Gamma scan failed for ${symbol}`, err);
          return null;
        }
      })
    );

    const validResults = results.filter(r => r !== null).sort((a, b) => b!.score - a!.score);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data: validResults,
    });

  } catch (error) {
    console.error('API /gamma error:', error);
    return NextResponse.json({ error: 'Failed to calculate gamma squeeze risk' }, { status: 500 });
  }
}
