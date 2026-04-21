'use client';
import React, { useEffect, useState } from 'react';
import { BentoCard } from '@/components/BentoCard';
import { SentimentGauge } from '@/components/SentimentGauge';
import { useLocale } from '@/components/LocaleProvider';

export default function IndicatorsPage() {
  const { t } = useLocale();
  const [indData, setIndData] = useState<any>(null);
  const [gammaData, setGammaData] = useState<any>(null);
  const [loadingInd, setLoadingInd] = useState(true);
  const [loadingGamma, setLoadingGamma] = useState(true);

  useEffect(() => {
    // 1. Fetch VIX and RSI
    fetch('/api/indicators')
      .then(r => r.json())
      .then(d => { setIndData(d); setLoadingInd(false); })
      .catch(e => { console.error(e); setLoadingInd(false); });

    // 2. Fetch Gamma Squeeze data
    fetch('/api/gamma')
      .then(r => r.json())
      .then(d => { setGammaData(d); setLoadingGamma(false); })
      .catch(e => { console.error(e); setLoadingGamma(false); });

    // Poll every 30s
    const interval = setInterval(() => {
      fetch('/api/indicators').then(r => r.json()).then(setIndData);
      fetch('/api/gamma').then(r => r.json()).then(setGammaData);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>{t.navIndicators || 'Market Indicators & Scanners'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>VIX, RSI, and Gamma Squeeze Risk Model</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Indicators Card */}
        <BentoCard title="Macro Sentiment">
          {loadingInd ? <div style={{ padding: '20px' }}>Loading...</div> : indData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <SentimentGauge 
                label="VIX (Fear Index)" 
                description=">30 indicates high fear, <15 indicates complacency"
                value={indData.vix?.regularMarketPrice || 0} 
                min={10} max={40} invertColor={true} 
              />
              <SentimentGauge 
                label={`RSI (14d ${indData.rsi?.symbol})`} 
                description=">70 Overbought, <30 Oversold"
                value={indData.rsi?.value || 50} 
                min={0} max={100} invertColor={false} 
              />
            </div>
          ) : (
            <div style={{ padding: '20px', color: 'var(--text-muted)' }}>No Indicator Data</div>
          )}
        </BentoCard>

        {/* Gamma Squeeze Scanner Card */}
        <BentoCard title="Gamma Squeeze Scanner (Beta)">
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Scans specific high-volatility tickers for OTM Call OI vs Daily Volume anomalies.
          </p>
          {loadingGamma ? <div>Scanning options chains...</div> : gammaData?.data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {gammaData.data.map((item: any) => {
                const highRisk = item.score > 80;
                return (
                  <div key={item.symbol} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px', borderRadius: 'var(--radius-sm)',
                    backgroundColor: highRisk ? 'var(--tint-delta)' : 'var(--surface-02)',
                    border: highRisk ? '1px solid var(--greek-delta)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: highRisk ? 'var(--greek-delta)' : 'var(--text-primary)' }}>
                        {item.symbol} {highRisk && '🔥'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Score: {item.score}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500 }}>Call/Vol: {item.callShareRatio}%</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg IV: {item.avgIV}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>Gamma logic failed.</div>
          )}
        </BentoCard>
      </div>
    </main>
  );
}
