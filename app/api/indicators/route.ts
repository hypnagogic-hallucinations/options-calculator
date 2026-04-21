import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new (YahooFinanceClass as any)();
import { RSI } from 'technicalindicators';

export const revalidate = 30; // 30 seconds for indicators

export async function GET() {
  try {
    // 1. Fetch VIX Quote
    const vixQuote = await yahooFinance.quote('^VIX');

    // 2. Fetch Historical SPY data for RSI
    // Get approx 30 calendar days to guarantee at least 15 trading days
    const period1 = new Date();
    period1.setDate(period1.getDate() - 30);
    const history = await yahooFinance.historical('SPY', {
      period1,
      interval: '1d',
    });

    // 3. Calculate 14-day RSI
    const closes = history.map(h => h.close!);
    const rsiInput = {
      values: closes,
      period: 14,
    };
    
    const rsiValues = RSI.calculate(rsiInput);
    const currentRSI = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : 50;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      vix: vixQuote,
      rsi: {
        symbol: 'SPY',
        value: currentRSI,
        period: 14,
      }
    });

  } catch (error) {
    console.error('API /indicators error:', error);
    return NextResponse.json({ error: 'Failed to fetch indicators' }, { status: 500 });
  }
}
