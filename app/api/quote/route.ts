import { NextResponse } from 'next/server';
import YahooFinanceClass from 'yahoo-finance2';

// v3: default export 是 class，需要 new 出 instance
const yahooFinance = new (YahooFinanceClass as any)();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  try {
    // yahoo-finance2 預設匯出就是已初始化的 instance，直接使用即可
    const result = await yahooFinance.options(ticker);

    if (!result || !result.quote) {
      throw new Error('No options data found for this ticker');
    }

    const currentPrice = result.quote.regularMarketPrice as number;
    const optionsInfo = result.options?.[0];
    const calls = optionsInfo?.calls || [];

    let strike = currentPrice;
    let iv = 50;

    if (calls.length > 0) {
      // 找最靠近目前股價的履約價 (ATM)
      const closestCall = calls.reduce((prev: any, curr: any) =>
        Math.abs(curr.strike - currentPrice) < Math.abs(prev.strike - currentPrice) ? curr : prev
      );
      strike = closestCall.strike;
      iv = (closestCall.impliedVolatility ?? 0.5) * 100;
      if (isNaN(iv) || iv <= 0) iv = 50;
    }

    let dteDays = 30;
    if (optionsInfo?.expirationDate) {
      const expMs = optionsInfo.expirationDate instanceof Date
        ? optionsInfo.expirationDate.getTime()
        : Number(optionsInfo.expirationDate) * 1000;
      dteDays = Math.max(1, Math.round((expMs - Date.now()) / 86400000));
    }

    return NextResponse.json({ price: currentPrice, strike, iv, dte: dteDays });

  } catch (error: any) {
    console.error('API Error: ', error);
    return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
  }
}
