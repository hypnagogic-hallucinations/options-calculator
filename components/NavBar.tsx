'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

export function NavBar() {
  const { palette, paletteIndex } = useTheme();
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: '52px',
      backgroundColor: 'rgba(246, 243, 238, 0.88)',
      backdropFilter: 'blur(12px) saturate(120%)',
      WebkitBackdropFilter: 'blur(12px) saturate(120%)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Left: brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[palette.delta, palette.gamma, palette.vega, palette.theta].map((c, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c, opacity: 0.85 }} />
          ))}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Options Lab
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
          · {palette.emoji} {palette.nameZh}
        </span>
      </div>

      {/* Right: nav links */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {[
          { href: '/', label: '期權計算' },
          { href: '/design', label: '設計系統' },
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
      </div>
    </nav>
  );
}
