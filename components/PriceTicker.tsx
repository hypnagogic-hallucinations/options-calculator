'use client';
import React, { useEffect, useRef, useState } from 'react';

export function PriceTicker({ 
  price, 
  change, 
  changePercent, 
  symbol, 
  name 
}: { 
  price: number; 
  change?: number; 
  changePercent?: number; 
  symbol?: string; 
  name?: string;
}) {
  const prevPriceRef = useRef<number>(price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlash('up');
    } else if (price < prevPriceRef.current) {
      setFlash('down');
    }
    prevPriceRef.current = price;

    const timer = setTimeout(() => {
      setFlash(null);
    }, 800); // flash duration

    return () => clearTimeout(timer);
  }, [price]);

  const flashColor = flash === 'up' ? 'var(--greek-gamma, #00FF62)' : flash === 'down' ? 'var(--greek-delta, #EEFF50)' : 'transparent';
  const flashBg = flash === 'up' ? 'var(--tint-gamma)' : flash === 'down' ? 'var(--tint-delta)' : 'transparent';

  const isUp = change !== undefined && change >= 0;
  const isDown = change !== undefined && change < 0;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      padding: '8px', borderRadius: 'var(--radius-md)',
      transition: 'background-color 0.3s ease',
      backgroundColor: flashBg,
    }}>
      {symbol && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: flash ? flashColor : 'var(--text-primary)' }}>{symbol}</span>
          {name && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{name}</span>}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <span style={{ 
          fontSize: '1.5rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          color: flash ? flashColor : 'var(--text-primary)',
          transition: 'color 0.3s ease'
        }}>
          {price.toFixed(2)}
        </span>
        
        {change !== undefined && changePercent !== undefined && (
          <span style={{
            fontSize: '0.85rem', fontWeight: 500,
            color: isUp ? 'var(--greek-gamma, #00FF62)' : isDown ? 'var(--greek-delta, #EEFF50)' : 'var(--text-muted)'
          }}>
            {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        )}
      </div>
    </div>
  );
}
