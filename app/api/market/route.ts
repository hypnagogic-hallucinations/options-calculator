import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new (YahooFinanceClass as any)();

// Revalidate every 15 seconds to prevent rate limits while keeping data "live"
export const revalidate = 15;

const INDICES = ['^GSPC', '^DJI', '^IXIC'];
const SECTORS = ['XLK', 'XLF', 'XLI', 'SMH', 'SPY', 'QQQ'];
const BIG_TECH = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];

export async function GET() {
  try {
    const allSymbols = [...INDICES, ...SECTORS, ...BIG_TECH];
    const quotes = await yahooFinance.quote(allSymbols);
    
    // Group quotes
    const indices = quotes.filter(q => INDICES.includes(q.symbol));
    const sectors = quotes.filter(q => SECTORS.includes(q.symbol));
    const tech = quotes.filter(q => BIG_TECH.includes(q.symbol));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      indices,
      sectors,
      tech,
    });
  } catch (error) {
    console.error('API /market error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
