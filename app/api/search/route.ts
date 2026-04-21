import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new (YahooFinanceClass as any)();

export const dynamic = 'force-dynamic';

// US-listed exchanges only
const US_EXCHANGES = new Set([
  'NMS',  // NASDAQ Global Select
  'NGM',  // NASDAQ Global Market
  'NCM',  // NASDAQ Capital Market
  'NYQ',  // NYSE
  'PCX',  // NYSE Arca
  'ASE',  // NYSE American (AMEX)
  'BTS',  // NYSE MKT
  'PNK',  // OTC Pink Sheets (optional, some may want this)
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await yahooFinance.search(q, { newsCount: 0, quotesCount: 12 });

    const results = (data?.quotes ?? [])
      .filter((item: any) => {
        if (!item.symbol) return false;
        if (item.quoteType === 'FUTURE' || item.quoteType === 'CURRENCY' || item.quoteType === 'CRYPTOCURRENCY') return false;
        // Only US exchanges
        if (!US_EXCHANGES.has(item.exchange)) return false;
        return true;
      })
      .slice(0, 8)
      .map((item: any) => ({
        symbol: item.symbol as string,
        shortname: (item.shortname || item.longname || '') as string,
        exchange: (item.exchange || '') as string,
        quoteType: (item.quoteType || '') as string,
      }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ results: [] });
  }
}
