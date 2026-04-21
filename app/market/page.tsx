'use client';
import React, { useEffect, useState } from 'react';
import { BentoCard } from '@/components/BentoCard';
import { PriceTicker } from '@/components/PriceTicker';
import { useLocale } from '@/components/LocaleProvider';

export default function MarketPage() {
  const { t } = useLocale();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const res = await fetch('/api/market', { cache: 'no-store' });
      const json = await res.json();
      if (json.indices) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const renderGrid = (items: any[], title: string) => (
    <BentoCard title={title}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {items.map(item => (
          <PriceTicker 
            key={item.symbol}
            symbol={item.symbol}
            name={item.shortName || item.longName}
            price={item.regularMarketPrice}
            change={item.regularMarketChange}
            changePercent={item.regularMarketChangePercent}
          />
        ))}
      </div>
    </BentoCard>
  );

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>{t.navMarket || 'Market Overview'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>Live Indices, Sectors, and Popular Tech</p>
      </header>

      {loading && !data ? (
        <div>{t.fetchStatusWait || 'Loading...'}</div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {renderGrid(data.indices || [], 'Major Indices')}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {renderGrid(data.sectors || [], 'Key Sectors (ETFs)')}
            {renderGrid(data.tech || [], 'Big Tech')}
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>No data available.</div>
      )}
    </main>
  );
}
