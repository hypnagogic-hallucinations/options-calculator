import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new (YahooFinanceClass as any)();

export const dynamic = 'force-dynamic';

function toMs(raw: unknown): number {
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === 'number') return raw < 1e12 ? raw * 1000 : raw; // seconds vs ms
  if (typeof raw === 'string') return new Date(raw).getTime();
  return Date.now();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase()?.trim();

  if (!ticker) {
    return NextResponse.json({ news: [] });
  }

  try {
    const data = await yahooFinance.search(ticker, { quotesCount: 0, newsCount: 8 });

    const news = (data?.news ?? []).map((item: any) => ({
      title: item.title as string,
      link: item.link as string,
      publisher: (item.publisher || '') as string,
      providerPublishTime: toMs(item.providerPublishTime), // always unix ms
      thumbnail: item.thumbnail?.resolutions?.[0]?.url as string | undefined,
    }));

    return NextResponse.json({ news });
  } catch (error: any) {
    console.error('News API Error:', error);
    return NextResponse.json({ news: [] });
  }
}
