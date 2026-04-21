'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────
// Translation dictionary
// ─────────────────────────────────────────────────────────────────
const dict = {
  zh: {
    appTagline: '即時市場資料 · 希臘字母分析 · 損益模擬',
    appSubLabel: 'OPTIONS CALCULATOR',
    appTitle: 'Black–Scholes 期權定價',
    palette: 'PALETTE',
    premium: 'PREMIUM',
    fetchBtn: '獲取',
    fetching: '…',
    fetchPlaceholder: '美股代號',
    fetchStatusWait: '請稍候…',
    fetchErrNoPrice: '無法取得有效股價，請確認代號',
    callLabel: '買權 Call',
    putLabel: '賣權 Put',
    sectionParams: '模型參數',
    labelS: '標的物股價 S',
    labelK: '履約價 K',
    labelT: '距到期天數 T',
    labelIV: '隱含波動率 IV',
    labelDays: '天',
    infoMoneyness: '價值狀態',
    infoIntrinsic: '內含價值',
    infoTimeValue: '時間價值',
    infoAnnualVol: '年化波動',
    atm: 'ATM 平值', itm: 'ITM 實值', otm: 'OTM 虛值',
    xAxis: '標的物股價 S (USD)',
    yAxis: '期權價值 (USD)',
    chartLabelCurve: '理論收益曲線',
    chartLabelIntrinsic: '內含價值（到期）',
    newsTitle: '相關財經新聞',
    newsNoData: '暫無最新新聞',
    newsLoadErr: '無法載入新聞',
    newsFrom: '來源',
    greekDesc: {
      delta: '方向性敏感度',
      gamma: '曲率 / 二階敏感度',
      vega: '波動率敏感度',
      theta: '時間衰蝕速率',
    },
    navCalc: '期權計算',
    navMarket: '大盤板塊',
    navIndicators: '異常監控',
    navDesign: '設計系統',
    langToggle: 'EN',
  },
  en: {
    appTagline: 'Live Market Data · Greeks Analysis · P&L Simulation',
    appSubLabel: 'OPTIONS CALCULATOR',
    appTitle: 'Black–Scholes Pricing',
    palette: 'PALETTE',
    premium: 'PREMIUM',
    fetchBtn: 'Fetch',
    fetching: '…',
    fetchPlaceholder: 'US Ticker',
    fetchStatusWait: 'Loading…',
    fetchErrNoPrice: 'Invalid price data. Check the ticker symbol.',
    callLabel: 'Call',
    putLabel: 'Put',
    sectionParams: 'Model Parameters',
    labelS: 'Spot Price S',
    labelK: 'Strike K',
    labelT: 'Days to Expiry T',
    labelIV: 'Implied Volatility IV',
    labelDays: 'days',
    infoMoneyness: 'Moneyness',
    infoIntrinsic: 'Intrinsic Value',
    infoTimeValue: 'Time Value',
    infoAnnualVol: 'Annual Vol',
    atm: 'ATM', itm: 'ITM', otm: 'OTM',
    xAxis: 'Spot Price S (USD)',
    yAxis: 'Option Value (USD)',
    chartLabelCurve: 'Theoretical P&L Curve',
    chartLabelIntrinsic: 'Intrinsic Value (at expiry)',
    newsTitle: 'Related Financial News',
    newsNoData: 'No recent news available',
    newsLoadErr: 'Failed to load news',
    newsFrom: 'via',
    greekDesc: {
      delta: 'Directional sensitivity',
      gamma: 'Curvature / 2nd-order sensitivity',
      vega: 'Volatility sensitivity',
      theta: 'Time decay rate',
    },
    navCalc: 'Calculator',
    navMarket: 'Market',
    navIndicators: 'Indicators',
    navDesign: 'Design System',
    langToggle: '中',
  },
} as const;

export type Locale = keyof typeof dict;
export type T = typeof dict['zh'];

type LocaleCtx = { locale: Locale; t: T; toggle: () => void };
const LocaleContext = createContext<LocaleCtx>({
  locale: 'zh', t: dict.zh, toggle: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh');
  const toggle = useCallback(() => setLocale(l => l === 'zh' ? 'en' : 'zh'), []);
  return (
    <LocaleContext.Provider value={{ locale, t: dict[locale], toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() { return useContext(LocaleContext); }
