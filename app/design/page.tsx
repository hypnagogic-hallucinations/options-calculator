'use client';
import React, { useState, useMemo } from 'react';
import { useTheme, PALETTES } from '@/components/ThemeProvider';
import { getHarmony, getContrastColor, hexToHsl, hslToHex } from '@/lib/colorUtils';

// ────────────────────────────────────────────────────────────────
// Color swatch
// ────────────────────────────────────────────────────────────────
function Swatch({ hex, label }: { hex: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const fg = getContrastColor(hex);

  const copy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div onClick={copy} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
      <div
        style={{
          width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
          backgroundColor: hex, boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: fg, fontSize: '11px', fontWeight: 700,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        {copied ? '✓' : ''}
      </div>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{hex}</span>
      {label && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Harmony row
// ────────────────────────────────────────────────────────────────
function HarmonyRow({ title, angle, colors }: { title: string; angle: string; colors: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ width: '130px', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>{angle}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {colors.map((c, i) => <Swatch key={i} hex={c} />)}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────
export default function DesignPage() {
  const { palette, paletteIndex, palettes, setPaletteIndex, setCustomPalette } = useTheme();
  const [pickerColor, setPickerColor] = useState('#7A9682');
  const [sat, setSat] = useState(30);
  const [lit, setLit] = useState(52);

  const effectiveBase = useMemo(() => {
    const [h] = hexToHsl(pickerColor);
    return hslToHex(h, sat, lit);
  }, [pickerColor, sat, lit]);

  const harmony = useMemo(() => getHarmony(effectiveBase), [effectiveBase]);

  const [bh, bs, bl] = hexToHsl(effectiveBase);

  const GREEK_META = [
    { key: 'delta', symbol: 'Δ', name: 'Delta', desc: '方向性' },
    { key: 'gamma', symbol: 'Γ', name: 'Gamma', desc: '曲率' },
    { key: 'vega',  symbol: 'ν', name: 'Vega',  desc: '波動率' },
    { key: 'theta', symbol: 'Θ', name: 'Theta', desc: '時間衰蝕' },
  ] as const;

  const greekColors = [palette.delta, palette.gamma, palette.vega, palette.theta];
  const tintColors = [palette.delta + '1F', palette.gamma + '1F', palette.vega + '1F', palette.theta + '1F'];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '52px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {greekColors.map((c, i) => (
            <div key={i} style={{ width: '4px', height: '24px', borderRadius: '2px', backgroundColor: c }} />
          ))}
        </div>
        <h1 style={{ marginBottom: '10px' }}>Design System</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.75, fontSize: '14px' }}>
          以莫蘭迪色系為靈魂，象牙白為底，四個希臘字母各自擁有一個深思熟慮的低飽和莫蘭迪色，
          並以低透明度版本染色整個 UI。
        </p>
      </div>

      {/* ── Greek Letter Color System ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ marginBottom: '6px' }}>希臘字母色系</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
          四色是設計系統的靈魂。點擊下方七組調色盤切換全站配色。
        </p>

        {/* Current Greek colors */}
        <div className="card" style={{ padding: '32px', marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '24px' }}>
            {palette.emoji} {palette.nameZh} · {palette.name}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '28px' }}>{palette.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {GREEK_META.map((g, i) => (
              <div key={g.key}>
                {/* Solid swatch */}
                <div style={{
                  height: '80px', borderRadius: 'var(--radius-md)',
                  backgroundColor: greekColors[i],
                  marginBottom: '12px',
                  boxShadow: 'var(--shadow-sm)',
                }} />
                {/* Tint swatch */}
                <div style={{
                  height: '32px', borderRadius: 'var(--radius-sm)',
                  backgroundColor: tintColors[i],
                  border: `1px solid ${greekColors[i]}38`,
                  marginBottom: '10px',
                }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, fontStyle: 'italic', color: greekColors[i] }}>{g.symbol}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{g.name}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{g.desc}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {greekColors[i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Palette gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {palettes.map((p, i) => {
            const active = i === paletteIndex;
            const pColors = [p.delta, p.gamma, p.vega, p.theta];
            return (
              <div
                key={p.name}
                onClick={() => setPaletteIndex(i)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: active ? `2px solid ${p.delta}` : '2px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-01)',
                  cursor: 'pointer',
                  boxShadow: active ? `0 0 0 4px ${p.delta}18` : 'none',
                  transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* 4-color stripe */}
                <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                  {pColors.map((c, ci) => (
                    <div key={ci} style={{ flex: 1, backgroundColor: c }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px' }}>{p.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.nameZh}</span>
                  {active && <span style={{
                    marginLeft: 'auto', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                    backgroundColor: p.delta, color: getContrastColor(p.delta),
                    padding: '2px 7px', borderRadius: 'var(--radius-full)',
                  }}>ON</span>}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.description}</div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                  {pColors.map((c, ci) => (
                    <div key={ci} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: c }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Color Harmony Calculator ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ marginBottom: '6px' }}>色彩和諧計算器</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
          輸入任意顏色，自動計算和諧色系，建築屬於您的莫蘭迪調色盤。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', alignItems: 'start' }}>
          {/* Controls */}
          <div className="card" style={{ padding: '28px' }}>
            <h4 style={{ marginBottom: '20px' }}>選色控制</h4>
            <input
              type="color"
              value={pickerColor}
              onChange={e => setPickerColor(e.target.value)}
              style={{ width: '100%', height: '64px', marginBottom: '20px', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-normal)' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>飽和度 — 莫蘭迪降低至 20–40%</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{sat}%</span>
                </div>
                <input type="range" min={0} max={100} value={sat} onChange={e => setSat(+e.target.value)} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>明度 — 建議 40–65%</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{lit}%</span>
                </div>
                <input type="range" min={10} max={90} value={lit} onChange={e => setLit(+e.target.value)} />
              </div>
            </div>

            {/* Preview box */}
            <div style={{
              marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-md)',
              backgroundColor: effectiveBase,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: getContrastColor(effectiveBase), fontFamily: 'monospace' }}>
                {effectiveBase}
              </span>
              <span style={{ fontSize: '11px', color: getContrastColor(effectiveBase), opacity: 0.7 }}>
                H:{bh} S:{bs}% L:{bl}%
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '12px' }}
                onClick={() => {
                  // 用基色 + 三角色 + 補色 + 類比色 組成 4 個希臘字母色
                  setCustomPalette(
                    effectiveBase,
                    harmony.complement,
                    harmony.triadic[0],
                    harmony.analogous[0],
                    '自訂'
                  );
                }}
              >
                套用為希臘字母色
              </button>
            </div>
          </div>

          {/* Harmony result */}
          <div className="card" style={{ padding: '28px' }}>
            <h4 style={{ marginBottom: '4px' }}>和諧色關係</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>點擊色票複製 Hex</p>

            <HarmonyRow title="補色" angle="±180°" colors={[harmony.base, harmony.complement]} />
            <HarmonyRow title="分割補色" angle="±150°" colors={[harmony.base, ...harmony.splitComplement]} />
            <HarmonyRow title="三角色" angle="±120°" colors={[harmony.base, ...harmony.triadic]} />
            <HarmonyRow title="類比色" angle="±30°" colors={[harmony.base, ...harmony.analogous]} />

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '10px' }}>TINTS（加白）</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[harmony.base, ...harmony.tints].map((c, i) => <Swatch key={i} hex={c} />)}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', margin: '16px 0 10px' }}>SHADES（加黑）</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[harmony.base, ...harmony.shades].map((c, i) => <Swatch key={i} hex={c} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Foundation Tokens ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ marginBottom: '28px' }}>固定底色 Foundation</h2>
        <div className="card" style={{ padding: '28px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            底色系統不隨調色盤切換。使用暖象牙色調，確保任何莫蘭迪主題都能和諧融合。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { name: '--bg-ivory',    hex: '#F7F7F5', desc: '頁面底色' },
              { name: '--surface-01',  hex: '#FFFFFF', desc: '主卡片' },
              { name: '--surface-02',  hex: '#F1F0EE', desc: '次要底板' },
              { name: '--surface-03',  hex: '#E8E7E3', desc: '輸入背景' },
              { name: '--text-primary',hex: '#26231E', desc: '主文字' },
              { name: '--text-secondary', hex: '#56524A', desc: '次文字' },
              { name: '--text-muted',  hex: '#9A9590', desc: '說明文字' },
              { name: '--border-subtle',hex: '#E4E2DC', desc: '卡片邊框' },
            ].map(({ name, hex, desc }) => (
              <div key={name}>
                <div style={{ height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: hex, border: '1px solid var(--border-subtle)', marginBottom: '8px' }} />
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)' }}>{name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{desc} · {hex}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Component Preview ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ marginBottom: '28px' }}>組件預覽</h2>
        <div className="card" style={{ padding: '32px' }}>

          {/* Buttons */}
          <h4 style={{ marginBottom: '16px' }}>Buttons</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button className="btn btn-primary">主要按鈕</button>
            <button className="btn btn-ghost">輔助按鈕</button>
            <button className="btn btn-primary" disabled>停用</button>
          </div>

          {/* Greek Tags */}
          <h4 style={{ marginBottom: '16px' }}>Greek Letter Tags</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <span className="greek-tag delta">Δ Delta</span>
            <span className="greek-tag gamma">Γ Gamma</span>
            <span className="greek-tag vega">ν Vega</span>
            <span className="greek-tag theta">Θ Theta</span>
          </div>

          {/* KPI with Greek colors */}
          <h4 style={{ marginBottom: '16px' }}>Greek KPI Cards</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
            {[
              { symbol: 'Δ', name: 'Delta', val: '0.523', color: palette.delta },
              { symbol: 'Γ', name: 'Gamma', val: '0.0082', color: palette.gamma },
              { symbol: 'ν', name: 'Vega', val: '48.35', color: palette.vega },
              { symbol: 'Θ', name: 'Theta', val: '-2.41', color: palette.theta },
            ].map(item => (
              <div key={item.name} style={{
                padding: '16px', borderRadius: 'var(--radius-md)',
                backgroundColor: item.color + '1F',
                border: `1px solid ${item.color}38`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', right: '8px', bottom: '-6px',
                  fontSize: '44px', fontWeight: 700, fontStyle: 'italic',
                  color: item.color, opacity: 0.1, userSelect: 'none',
                }}>{item.symbol}</div>
                <h4 style={{ color: item.color, marginBottom: '8px' }}>{item.symbol} {item.name}</h4>
                <div style={{ fontSize: '20px', fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>{item.val}</div>
              </div>
            ))}
          </div>

          {/* Typography specimen */}
          <h4 style={{ marginBottom: '16px' }}>Typography</h4>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <h1 style={{ marginBottom: '8px' }}>期權定價與希臘字母</h1>
            <h2 style={{ marginBottom: '8px' }}>Black-Scholes Model</h2>
            <h3 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>隱含波動率與到期價值</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '14px' }}>
              選擇權是一種衍生性金融商品，賦予持有人在特定日期前，以特定價格買入或賣出標的資產的合約權利。
            </p>
            <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Options · Derivatives · Greeks · Black-Scholes · Implied Volatility
            </small>
          </div>
        </div>
      </section>

      {/* ── Spacing & Radii tokens ── */}
      <section>
        <h2 style={{ marginBottom: '28px' }}>形狀 Token</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ marginBottom: '20px' }}>Border Radius</h4>
            {[
              { name: '--radius-xs', px: '4px' }, { name: '--radius-sm', px: '8px' },
              { name: '--radius-md', px: '12px' }, { name: '--radius-lg', px: '20px' },
              { name: '--radius-xl', px: '28px' }, { name: '--radius-full', px: '∞' },
            ].map(({ name, px }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <div style={{
                  width: '40px', height: '28px',
                  backgroundColor: palette.delta + '30',
                  border: `1px solid ${palette.delta}60`,
                  borderRadius: px === '∞' ? '9999px' : px, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{px}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ marginBottom: '20px' }}>Shadows</h4>
            {[
              { name: '--shadow-xs', val: '0 1px 2px rgba(42,37,32,0.04)', label: 'Tooltip' },
              { name: '--shadow-sm', val: '0 2px 10px rgba(42,37,32,0.06)', label: 'Card' },
              { name: '--shadow-md', val: '0 8px 28px rgba(42,37,32,0.08)', label: 'Dropdown' },
              { name: '--shadow-lg', val: '0 20px 60px rgba(42,37,32,0.10)', label: 'Modal' },
            ].map(({ name, val, label }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '44px', height: '36px',
                  backgroundColor: 'var(--surface-01)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: val, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
