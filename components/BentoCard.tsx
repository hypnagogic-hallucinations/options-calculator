'use client';
import React from 'react';

export function BentoCard({ 
  children, 
  title,
  style = {}
}: { 
  children: React.ReactNode, 
  title?: string,
  style?: React.CSSProperties 
}) {
  return (
    <div className="card" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      ...style
    }}>
      {title && <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</h3>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
