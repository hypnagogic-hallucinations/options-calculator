'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { calculateValues, BSInputs } from '@/lib/blackscholes';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
const GREEKS = [
  { key: 'delta', symbol: 'Δ', name: 'Delta', desc: '方向性敏感度', cssVar: '--greek-delta', tintVar: '--tint-delta', semiVar: '--semi-delta' },
  { key: 'gamma', symbol: 'Γ', name: 'Gamma', desc: '曲率 / 二階敏感度', cssVar: '--greek-gamma', tintVar: '--tint-gamma', semiVar: '--semi-gamma' },
  { key: 'vega',  symbol: 'ν', name: 'Vega',  desc: '波動率敏感度', cssVar: '--greek-vega',  tintVar: '--tint-vega',  semiVar: '--semi-vega' },
  { key: 'theta', symbol: 'Θ', name: 'Theta', desc: '時間衰蝕速率', cssVar: '--greek-theta', tintVar: '--tint-theta', semiVar: '--semi-theta' },
] as const;

// ─────────────────────────────────────────────────────────────────
// Palette Switcher
// ─────────────────────────────────────────────────────────────────
function PaletteSwitcher() {
  const { palettes, paletteIndex, setPaletteIndex, palette } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em' }}>
        PALETTE
      </span>
      <div style={{ display: 'flex', gap: '5px' }}>
        {palettes.map((p, i) => {
          const active = i === paletteIndex;
          return (
            <button
              key={p.name}
              onClick={() => setPaletteIndex(i)}
              title={`${p.emoji} ${p.nameZh} — ${p.description}`}
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: active ? '2px solid var(--text-primary)' : '2px solid transparent',
                padding: 0, cursor: 'pointer',
                background: `conic-gradient(${p.delta} 0% 25%, ${p.gamma} 25% 50%, ${p.vega} 50% 75%, ${p.theta} 75% 100%)`,
                boxShadow: active ? '0 0 0 3px var(--bg-ivory)' : 'none',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {palette.nameZh}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Greek KPI Card
// ─────────────────────────────────────────────────────────────────
function GreekCard({ greek, value }: { greek: typeof GREEKS[number]; value: number }) {
  const decimals = greek.key === 'gamma' ? 4 : greek.key === 'delta' ? 3 : 2;
  const display = isFinite(value) ? value.toFixed(decimals) : '—';

  return (
    <div style={{
      padding: '20px 22px',
      borderRadius: 'var(--radius-lg)',
      background: `var(${greek.tintVar})`,
      border: `1px solid var(${greek.semiVar})`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background symbol watermark */}
      <div style={{
        position: 'absolute', right: '12px', bottom: '-8px',
        fontSize: '64px', fontWeight: 700, lineHeight: 1,
        color: `var(${greek.cssVar})`, opacity: 0.08,
        userSelect: 'none', pointerEvents: 'none',
        fontStyle: 'italic',
      }}>
        {greek.symbol}
      </div>

      <h4 style={{ color: `var(${greek.cssVar})`, marginBottom: '10px' }}>
        {greek.symbol} {greek.name}
      </h4>
      <div className="metric-number" style={{ color: `var(${greek.cssVar})` }}>
        {display}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
        {greek.desc}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Slim Slider row
// ─────────────────────────────────────────────────────────────────
function SliderRow({ label, value, display, min, max, step, onChange }: {
  label: string; value: number; display: string;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: '12px', fontWeight: 600, fontFamily: 'monospace',
          color: 'var(--text-secondary)', letterSpacing: '0.02em',
        }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [ticker, setTicker] = useState('NVDA');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const { palette } = useTheme();

  const [inputs, setInputs] = useState<BSInputs>({
    S: 850, K: 850, T: 30 / 365, v: 0.5, r: 0.05, type: 'Call',
  });

  const results = useMemo(() => calculateValues(inputs), [inputs]);

  const fetchLive = useCallback(async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setStatus({ text: '請稍候…', ok: true });
    try {
      const res = await fetch(`/api/quote?ticker=${ticker.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      setInputs(prev => ({ ...prev, S: data.price, K: data.strike, v: data.iv / 100, T: data.dte / 365 }));
      setStatus({ text: `已更新 · ${ticker.toUpperCase()}`, ok: true });
    } catch (e: any) {
      setStatus({ text: e.message, ok: false });
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => { fetchLive(); }, []);

  const updateInput = (key: keyof BSInputs, v: any) =>
    setInputs(prev => ({ ...prev, [key]: v }));

  // ── Chart ──
  const chartData = useMemo(() => {
    const N = 60;
    const sMin = inputs.S * 0.55, sMax = inputs.S * 1.45;
    const labels: string[] = [];
    const curve: number[] = [], intrinsic: number[] = [];

    for (let i = 0; i <= N; i++) {
      const s = sMin + (sMax - sMin) * (i / N);
      labels.push(s.toFixed(0));
      const v = calculateValues({ ...inputs, S: s });
      curve.push(v.premium);
      intrinsic.push(v.intrinsic);
    }

    return {
      labels,
      datasets: [
        {
          label: '理論收益曲線',
          data: curve,
          borderColor: palette.delta,
          backgroundColor: palette.delta + '18',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: palette.delta,
        },
        {
          label: '內含價值（到期）',
          data: intrinsic,
          borderColor: palette.gamma + 'AA',
          borderWidth: 1.5,
          borderDash: [4, 4],
          fill: false,
          tension: 0,
          pointRadius: 0,
        },
      ],
    };
  }, [inputs, palette]);

  const chartOpts = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 }, color: '#5A554C' },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#FDFCF9',
        titleColor: '#2A2520',
        bodyColor: '#5A554C',
        borderColor: '#E4DFD6',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { maxTicksLimit: 6, color: '#9A9388', font: { size: 10 } },
        border: { display: false },
      },
      y: {
        position: 'right' as const,
        grid: { color: '#E4DFD6', lineWidth: 1 },
        ticks: { color: '#9A9388', font: { size: 10 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
  }), []);

  const greekValues = {
    delta: results.delta,
    gamma: results.gamma,
    vega: results.vega,
    theta: results.theta,
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px 64px' }}>

      {/* ── Title row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.12em', marginBottom: '6px' }}>
            OPTIONS CALCULATOR
          </div>
          <h1>Black–Scholes 期權定價</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            即時市場資料 · 希臘字母分析 · 損益模擬
          </p>
        </div>
        <PaletteSwitcher />
      </div>

      {/* ── 4 Greek KPI cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '20px',
      }}>
        {GREEKS.map(g => (
          <GreekCard key={g.key} greek={g} value={greekValues[g.key as keyof typeof greekValues]} />
        ))}
      </div>

      {/* ── Premium value (big) + Type toggle ── */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>PREMIUM</span>
          <span style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {isFinite(results.premium) ? results.premium.toFixed(2) : '—'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>USD</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Call / Put toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-02)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            {(['Call', 'Put'] as const).map(t => (
              <label key={t} style={{
                padding: '6px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer',
                background: inputs.type === t ? 'var(--surface-01)' : 'transparent',
                color: inputs.type === t ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: inputs.type === t ? 'var(--shadow-xs)' : 'none',
                border: inputs.type === t ? '1px solid var(--border-subtle)' : '1px solid transparent',
              }}>
                <input type="radio" value={t} checked={inputs.type === t}
                  onChange={e => updateInput('type', e.target.value)} style={{ display: 'none' }} />
                {t === 'Call' ? '買權 Call' : '賣權 Put'}
              </label>
            ))}
          </div>

          {/* Ticker fetch */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" value={ticker} onChange={e => setTicker(e.target.value)}
              placeholder="AAPL" style={{ width: '80px', textAlign: 'center', textTransform: 'uppercase' }}
              onKeyDown={e => e.key === 'Enter' && fetchLive()} />
            <button onClick={fetchLive} disabled={loading} className="btn btn-primary">
              {loading ? '…' : '獲取'}
            </button>
            {status && (
              <span style={{ fontSize: '12px', color: status.ok ? 'var(--text-muted)' : 'var(--greek-delta)', fontWeight: status.ok ? 400 : 500 }}>
                {status.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="card" style={{ padding: '24px', marginBottom: '16px', height: '280px' }}>
        <Line data={chartData} options={chartOpts} />
      </div>

      {/* ── Sliders ── */}
      <div className="card" style={{ padding: '28px' }}>
        <h4 style={{ marginBottom: '24px' }}>模型參數</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 40px' }}>
          <SliderRow
            label="標的物股價 S"
            value={inputs.S}
            display={`$${inputs.S.toFixed(0)}`}
            min={10} max={Math.max(2000, inputs.S * 2)} step={1}
            onChange={v => updateInput('S', v)}
          />
          <SliderRow
            label="履約價 K"
            value={inputs.K}
            display={`$${inputs.K.toFixed(0)}`}
            min={10} max={Math.max(2000, inputs.K * 2)} step={1}
            onChange={v => updateInput('K', v)}
          />
          <SliderRow
            label="距到期天數 T"
            value={Math.round(inputs.T * 365)}
            display={`${Math.round(inputs.T * 365)} 天`}
            min={1} max={730} step={1}
            onChange={v => updateInput('T', v / 365)}
          />
          <SliderRow
            label="隱含波動率 IV"
            value={Math.round(inputs.v * 100)}
            display={`${Math.round(inputs.v * 100)}%`}
            min={1} max={200} step={1}
            onChange={v => updateInput('v', v / 100)}
          />
        </div>

        {/* Quick-info about moneyness */}
        <div style={{
          marginTop: '24px', paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: '24px', flexWrap: 'wrap',
        }}>
          {[
            { label: '價值狀態', value: inputs.K === inputs.S ? 'ATM 平值' : inputs.type === 'Call' ? (inputs.S > inputs.K ? 'ITM 實值' : 'OTM 虛值') : (inputs.S < inputs.K ? 'ITM 實值' : 'OTM 虛值') },
            { label: '內含價值', value: `$${results.intrinsic.toFixed(2)}` },
            { label: '時間價值', value: `$${Math.max(0, results.premium - results.intrinsic).toFixed(2)}` },
            { label: '年化波動', value: `${(inputs.v * 100).toFixed(0)}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
