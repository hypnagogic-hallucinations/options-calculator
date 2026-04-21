'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, CYBER } from '@/components/ThemeProvider';
import { useLocale } from '@/components/LocaleProvider';

export function NavBar() {
  const { palette, darkMode } = useTheme();
  const pathname = usePathname();
  const { t, toggle } = useLocale();
  const isCyberpunk = darkMode === 'cyberpunk';

  const dotColors: readonly string[] = isCyberpunk
    ? [CYBER.greek.delta, CYBER.greek.gamma, CYBER.greek.vega, CYBER.greek.theta]
    : [palette.delta, palette.gamma, palette.vega, palette.theta];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: '52px',
      backgroundColor: 'var(--surface-03)',
      backdropFilter: 'blur(12px) saturate(120%)',
      WebkitBackdropFilter: 'blur(12px) saturate(120%)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Left: brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {dotColors.map((c, i) => (
            <div
              key={i}
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: c, opacity: 0.9,
              }}
            />
          ))}
        </div>
        <span style={{
          fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em',
          color: isCyberpunk ? CYBER.text.primary : 'var(--text-primary)',
        }}>
          Options Lab
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
          · {palette.emoji} {palette.name}
        </span>
      </div>

      {/* Right: nav links + lang toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[
          { href: '/', label: t.navCalc },
          { href: '/market', label: t.navMarket },
          { href: '/indicators', label: t.navIndicators },
          { href: '/design', label: t.navDesign },
        ].map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: active ? 'var(--surface-02)' : 'transparent',
              letterSpacing: '-0.01em',
            }}>
              {label}
            </Link>
          );
        })}

        {/* Language toggle */}
        <button
          onClick={toggle}
          title="Switch language / 切換語言"
          style={{
            marginLeft: '6px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '28px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
            background: 'var(--surface-02)',
            border: '1px solid var(--border-normal)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          {t.langToggle}
        </button>
      </div>
    </nav>
  );
}
