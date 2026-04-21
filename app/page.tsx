'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef, forwardRef } from 'react';
import { useTheme, CYBER } from '@/components/ThemeProvider';


import { useLocale } from '@/components/LocaleProvider';
import { calculateValues, BSInputs } from '@/lib/blackscholes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

// ─────────────────────────────────────────────────────────────────
// DatePicker custom chip — forwardRef required by react-datepicker
// ─────────────────────────────────────────────────────────────────
const DateChip = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(({ value, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    type="button"
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px 2px 6px',
      fontSize: '11px', fontWeight: 500, letterSpacing: '0.03em',
      fontFamily: 'monospace',
      color: 'var(--text-secondary)',
      background: 'var(--surface-02)',
      border: '1px solid var(--border-normal)',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      lineHeight: '18px',
    }}
  >
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="2" width="14" height="13" rx="2" />
      <line x1="5" y1="1" x2="5" y2="4" />
      <line x1="11" y1="1" x2="11" y2="4" />
      <line x1="1" y1="7" x2="15" y2="7" />
    </svg>
    {value}
  </button>
));
DateChip.displayName = 'DateChip';

// ─────────────────────────────────────────────────────────────────
// Ticker Search Autocomplete
// Bug-fix: fetchWithTicker receives the symbol directly,
// bypassing React's async state update gap.
// ─────────────────────────────────────────────────────────────────
type SearchResult = { symbol: string; shortname: string; exchange: string; quoteType: string };

function TickerSearch({ value, onChange, onFetchWithTicker }: {
  value: string;
  onChange: (v: string) => void;
  onFetchWithTicker: (sym: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSuggestions(data.results ?? []);
    setOpen((data.results ?? []).length > 0);
    setFocused(-1);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase();
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 280);
  };

  // ⚡ KEY FIX: pass the symbol directly instead of relying on stale ticker state
  const select = (sym: string) => {
    onChange(sym);
    setOpen(false);
    setSuggestions([]);
    onFetchWithTicker(sym);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (focused >= 0) select(suggestions[focused].symbol);
      else onFetchWithTicker(value);
      setOpen(false);
    }
    if (e.key === 'ArrowDown') { setFocused(f => Math.min(f + 1, suggestions.length - 1)); e.preventDefault(); }
    if (e.key === 'ArrowUp') { setFocused(f => Math.max(f - 1, -1)); e.preventDefault(); }
    if (e.key === 'Escape') setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const exchangeLabel = (ex: string) => {
    const map: Record<string, string> = { NMS: 'NASDAQ', NYQ: 'NYSE', PCX: 'NYSE Arca', NGM: 'NASDAQ', NCM: 'NASDAQ', ASE: 'AMEX' };
    return map[ex] ?? ex;
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKey}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="AAPL, NVDA…"
        style={{ width: '110px', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.05em' }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          minWidth: '250px', zIndex: 200,
          background: 'var(--surface-01)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => (
            <div
              key={s.symbol}
              onMouseDown={() => select(s.symbol)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                background: i === focused ? 'var(--surface-02)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                  {s.symbol}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '130px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {s.shortname}
                </span>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                background: 'var(--surface-02)', padding: '1px 5px', borderRadius: '4px',
              }}>
                {exchangeLabel(s.exchange)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// News section
// ─────────────────────────────────────────────────────────────────
type NewsItem = { title: string; link: string; publisher: string; providerPublishTime: number; thumbnail?: string };

function NewsSection({ ticker }: { ticker: string }) {
  const { t } = useLocale();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(false);
    fetch(`/api/news?ticker=${ticker}`)
      .then(r => r.json())
      .then(d => { setNews(d.news ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [ticker]);

  const formatDate = (ts: number | string) => {
    // Yahoo Finance may return a Date ISO string or unix seconds number
    const ms = typeof ts === 'string'
      ? new Date(ts).getTime()
      : ts > 1e10 ? ts : ts * 1000; // already ms vs seconds
    const d = new Date(ms);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="card" style={{ padding: '28px', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <h4 style={{ margin: 0 }}>{t.newsTitle}</h4>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--text-muted)', background: 'var(--surface-02)',
          padding: '2px 7px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-normal)',
        }}>
          {ticker}
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              height: '72px', flex: 1, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(90deg, var(--surface-02) 25%, var(--surface-03) 50%, var(--surface-02) 75%)',
              backgroundSize: '200% 100%',
            }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.newsLoadErr}</p>
      )}

      {!loading && !error && news.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.newsNoData}</p>
      )}

      {!loading && news.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '12px 8px',
                borderRadius: 'var(--radius-sm)',
                borderBottom: i < news.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
                  margin: 0, lineHeight: 1.5, letterSpacing: '0.01em',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {item.title}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                    {item.publisher}
                  </span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border-normal)', flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {formatDate(item.providerPublishTime)}
                  </span>
                </div>
              </div>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: '3px' }}>
                <line x1="3" y1="13" x2="13" y2="3" />
                <polyline points="6 3 13 3 13 10" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Greek constants
// ─────────────────────────────────────────────────────────────────
const GREEKS = [
  { key: 'delta', symbol: 'Δ', name: 'Delta', cssVar: '--greek-delta', tintVar: '--tint-delta', semiVar: '--semi-delta' },
  { key: 'gamma', symbol: 'Γ', name: 'Gamma', cssVar: '--greek-gamma', tintVar: '--tint-gamma', semiVar: '--semi-gamma' },
  { key: 'vega', symbol: 'ν', name: 'Vega', cssVar: '--greek-vega', tintVar: '--tint-vega', semiVar: '--semi-vega' },
  { key: 'theta', symbol: 'Θ', name: 'Theta', cssVar: '--greek-theta', tintVar: '--tint-theta', semiVar: '--semi-theta' },
] as const;

// ─────────────────────────────────────────────────────────────────
// Palette Switcher
// ─────────────────────────────────────────────────────────────────
function PaletteSwitcher() {
  const { palettes, paletteIndex, setPaletteIndex, palette, darkMode, setDarkMode } = useTheme();
  const { t } = useLocale();
  const isCyberpunk = darkMode === 'cyberpunk';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em' }}>
        {t.palette}
      </span>
      <div style={{ display: 'flex', gap: '5px' }}>
        {palettes.map((p, i) => {
          const active = i === paletteIndex && !isCyberpunk;
          return (
            <button
              key={p.name}
              onClick={() => { setDarkMode('light'); setPaletteIndex(i); }}
              title={`${p.emoji} ${p.name} — ${p.description}`}
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: active ? '2px solid var(--text-primary)' : '2px solid transparent',
                padding: 0, cursor: 'pointer',
                background: `conic-gradient(${p.delta} 0% 25%, ${p.gamma} 25% 50%, ${p.vega} 50% 75%, ${p.theta} 75% 100%)`,
                boxShadow: active ? '0 0 0 3px var(--bg-ivory)' : 'none',
                outline: 'none',
                opacity: isCyberpunk ? 0.4 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Cyberpunk toggle */}
      <button
        onClick={() => setDarkMode(isCyberpunk ? 'light' : 'cyberpunk')}
        title="Cyberpunk dark mode"
        style={{
          padding: '3px 10px',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          border: isCyberpunk ? `1px solid ${CYBER.greek.delta}` : '1px solid var(--border-normal)',
          background: isCyberpunk ? `${CYBER.greek.delta}1E` : 'var(--surface-02)',
          color: isCyberpunk ? CYBER.greek.delta : 'var(--text-muted)',
          boxShadow: isCyberpunk ? `0 0 10px ${CYBER.greek.delta}66` : 'none',
          textShadow: isCyberpunk ? `0 0 6px ${CYBER.greek.delta}` : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        CYBER
      </button>

      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {isCyberpunk ? 'Cyberpunk' : palette.name}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Greek KPI Card
// ─────────────────────────────────────────────────────────────────
function GreekCard({ greek, value }: { greek: typeof GREEKS[number]; value: number }) {
  const { t } = useLocale();
  const decimals = greek.key === 'gamma' ? 4 : greek.key === 'delta' ? 3 : 2;
  const display = isFinite(value) ? value.toFixed(decimals) : '—';
  const descMap: Record<string, string> = {
    delta: t.greekDesc.delta, gamma: t.greekDesc.gamma, vega: t.greekDesc.vega, theta: t.greekDesc.theta,
  };

  return (
    <div style={{
      padding: '20px 22px',
      borderRadius: 'var(--radius-lg)',
      background: `var(${greek.tintVar})`,
      border: `1px solid var(${greek.semiVar})`,
      position: 'relative',
      overflow: 'hidden',
    }}>
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
        {descMap[greek.key]}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Slim Slider row
// ─────────────────────────────────────────────────────────────────
function SliderRow({ label, value, display, displayExtra, accentColor, min, max, step, onChange }: {
  label: string; value: number; display: React.ReactNode; displayExtra?: React.ReactNode;
  accentColor?: string;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {displayExtra}
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: 'monospace',
            color: accentColor ?? 'var(--text-secondary)',
          }}>{display}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        style={{ accentColor: accentColor ?? 'var(--text-primary)' }}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useLocale();
  const [ticker, setTicker] = useState('NVDA');
  // ⚡ Use a ref so fetchLive always reads the current ticker, even before state propagates
  const tickerRef = useRef('NVDA');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [priceBase, setPriceBase] = useState<number | null>(null);
  const [fetchedTicker, setFetchedTicker] = useState('NVDA'); // tracks the last successfully fetched ticker for news
  const { palette, darkMode } = useTheme();

  const [inputs, setInputs] = useState<BSInputs>({
    S: 850, K: 850, T: 30 / 365, v: 0.5, r: 0.05, type: 'Call',
  });

  const results = useMemo(() => calculateValues(inputs), [inputs]);

  // Keep ref in sync with state
  const handleTickerChange = (v: string) => {
    setTicker(v);
    tickerRef.current = v;
  };

  // ⚡ Accepts optional sym override — solves the stale-closure bug in autocomplete
  const fetchLive = useCallback(async (symOverride?: string) => {
    const sym = (symOverride ?? tickerRef.current).trim().toUpperCase();
    if (!sym) return;
    setLoading(true);
    setStatus({ text: t.fetchStatusWait, ok: true });
    try {
      const res = await fetch(`/api/quote?ticker=${sym}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      const price = typeof data.price === 'number' && isFinite(data.price) ? data.price : null;
      const strike = typeof data.strike === 'number' && isFinite(data.strike) ? data.strike : null;
      const iv = typeof data.iv === 'number' && isFinite(data.iv) && data.iv > 0 ? data.iv : null;
      const dte = typeof data.dte === 'number' && isFinite(data.dte) && data.dte > 0 ? data.dte : null;
      if (!price) throw new Error(t.fetchErrNoPrice);
      setInputs(prev => ({
        ...prev,
        S: price,
        K: strike ?? price,
        v: iv != null ? iv / 100 : prev.v,
        T: dte != null ? dte / 365 : prev.T,
      }));
      setPriceBase(price);
      setFetchedTicker(sym);
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStatus({ text: `已更新 · ${sym} · ${timeStr}`, ok: true });
    } catch (e: any) {
      setStatus({ text: e.message, ok: false });
    } finally {
      setLoading(false);
    }
  }, [t]);

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
          label: t.chartLabelCurve,
          data: curve,
          borderColor: palette.delta,
          backgroundColor: darkMode === 'cyberpunk' ? palette.delta + '20' : palette.delta + '18',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: palette.delta,
        },
        {
          label: t.chartLabelIntrinsic,
          data: intrinsic,
          borderColor: darkMode === 'cyberpunk' ? palette.gamma + '80' : palette.gamma + 'AA',
          borderWidth: 1.5,
          borderDash: [4, 4],
          fill: false,
          tension: 0,
          pointRadius: 0,
        },
      ],
    };
  }, [inputs, palette, t, darkMode]);

  const chartOpts = useMemo(() => {
    const isCyber = darkMode === 'cyberpunk';
    const textColor = isCyber ? palette.delta : '#9CA3AF';
    const legendColor = isCyber ? palette.delta : '#777777';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 }, color: legendColor },
        },
        tooltip: {
          mode: 'index' as const, intersect: false,
          backgroundColor: isCyber ? '#0F0F1A' : '#FFFFFF', 
          titleColor: isCyber ? '#E0E0FF' : '#444444', 
          bodyColor: isCyber ? '#A0A0D0' : '#555555',
          borderColor: isCyber ? palette.delta : '#E5E7EB', 
          borderWidth: 1, padding: 10, cornerRadius: 8,
        },
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: { maxTicksLimit: 7, color: textColor, font: { size: 10 } },
          border: { display: false },
          title: {
            display: true, text: t.xAxis, color: textColor,
            font: { size: 10, weight: '500' as const }, padding: { top: 6 },
          },
        },
        y: {
          position: 'right' as const,
          grid: { display: false }, // Removed inner grid lines
          ticks: { color: textColor, font: { size: 10 } },
          border: { display: false }, beginAtZero: true,
          title: {
            display: true, text: t.yAxis, color: textColor,
            font: { size: 10, weight: '500' as const }, padding: { bottom: 6 },
          },
        },
      },
      interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    }
  }, [t, darkMode, palette.delta]);

  const greekValues = {
    delta: results.delta, gamma: results.gamma, vega: results.vega, theta: results.theta,
  };

  const moneynessLabel = () => {
    if (Math.abs(inputs.K - inputs.S) < 0.01) return t.atm;
    if (inputs.type === 'Call') return inputs.S > inputs.K ? t.itm : t.otm;
    return inputs.S < inputs.K ? t.itm : t.otm;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px 64px' }}>

      {/* ── Title row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.12em', marginBottom: '6px' }}>
            {t.appSubLabel}
          </div>
          <h1>{t.appTitle}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {t.appTagline}
          </p>
        </div>
        <PaletteSwitcher />
      </div>

      {/* ── 4 Greek KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {GREEKS.map(g => (
          <GreekCard key={g.key} greek={g} value={greekValues[g.key as keyof typeof greekValues]} />
        ))}
      </div>

      {/* ── Premium value + type toggle + ticker ── */}
      <div className="card" style={{ padding: '16px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>{t.premium}</span>
          <span style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {isFinite(results.premium) ? results.premium.toFixed(2) : '—'}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>USD</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Call / Put toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-02)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            {(['Call', 'Put'] as const).map(type => (
              <label key={type} style={{
                padding: '6px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer',
                background: inputs.type === type ? 'var(--surface-01)' : 'transparent',
                color: inputs.type === type ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: inputs.type === type ? 'var(--shadow-xs)' : 'none',
                border: inputs.type === type ? '1px solid var(--border-subtle)' : '1px solid transparent',
              }}>
                <input type="radio" value={type} checked={inputs.type === type}
                  onChange={e => updateInput('type', e.target.value)} style={{ display: 'none' }} />
                {type === 'Call' ? t.callLabel : t.putLabel}
              </label>
            ))}
          </div>

          {/* Ticker search */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <TickerSearch value={ticker} onChange={handleTickerChange} onFetchWithTicker={fetchLive} />
            <button onClick={() => fetchLive()} disabled={loading} className="btn btn-primary">
              {loading ? t.fetching : t.fetchBtn}
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
      <div className="card" style={{ padding: '24px', marginBottom: '16px', height: '300px' }}>
        <Line data={chartData} options={chartOpts} />
      </div>

      {/* ── Sliders ── */}
      <div className="card" style={{ padding: '28px' }}>
        <h4 style={{ marginBottom: '24px' }}>{t.sectionParams}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 40px' }}>
          <SliderRow
            label={t.labelS}
            value={inputs.S}
            display={`$${inputs.S.toFixed(0)}`}
            accentColor={palette.delta}
            min={priceBase ? Math.max(1, Math.round(priceBase * 0.3)) : 1}
            max={priceBase ? Math.round(priceBase * 1.7) : Math.max(2000, inputs.S * 2)}
            step={inputs.S < 50 ? 0.5 : inputs.S < 500 ? 1 : 5}
            onChange={v => updateInput('S', v)}
          />
          <SliderRow
            label={t.labelK}
            value={inputs.K}
            display={`$${inputs.K.toFixed(0)}`}
            accentColor={palette.gamma}
            min={priceBase ? Math.max(1, Math.round(priceBase * 0.3)) : 1}
            max={priceBase ? Math.round(priceBase * 1.7) : Math.max(2000, inputs.K * 2)}
            step={inputs.K < 50 ? 0.5 : inputs.K < 500 ? 1 : 5}
            onChange={v => updateInput('K', v)}
          />
          <SliderRow
            label={t.labelT}
            value={Math.round(inputs.T * 365)}
            accentColor={palette.vega}
            displayExtra={
              <DatePicker
                selected={addDays(new Date(), Math.round(inputs.T * 365))}
                onChange={(date: Date | null) => {
                  if (date) {
                    const days = Math.max(1, differenceInDays(startOfDay(date), startOfDay(new Date())));
                    updateInput('T', days / 365);
                  }
                }}
                dateFormat="yyyy-MM-dd"
                minDate={addDays(new Date(), 1)}
                popperPlacement="bottom-start"
                popperProps={{ strategy: 'fixed' }}
                customInput={<DateChip />}
              />
            }
            display={`${Math.round(inputs.T * 365)}\u202F${t.labelDays}`}
            min={1} max={365} step={1}
            onChange={v => updateInput('T', v / 365)}
          />
          <SliderRow
            label={t.labelIV}
            value={Math.round(inputs.v * 100)}
            display={`${Math.round(inputs.v * 100)}%`}
            accentColor={palette.theta}
            min={1} max={100} step={1}
            onChange={v => updateInput('v', v / 100)}
          />
        </div>

        {/* Quick info */}
        <div style={{
          marginTop: '24px', paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', gap: '24px', flexWrap: 'wrap',
        }}>
          {[
            { label: t.infoMoneyness, value: moneynessLabel() },
            { label: t.infoIntrinsic, value: `$${results.intrinsic.toFixed(2)}` },
            { label: t.infoTimeValue, value: `$${Math.max(0, results.premium - results.intrinsic).toFixed(2)}` },
            { label: t.infoAnnualVol, value: `${(inputs.v * 100).toFixed(0)}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── News section ── */}
      <NewsSection ticker={fetchedTicker} />

    </div>
  );
}
