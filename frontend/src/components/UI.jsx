/**
 * Shared reusable UI components for HealthTrack
 */

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = true, glow = '' }) {
  return (
    <div
      className={hover ? 'card-hover' : ''}
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'var(--color-surface)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: glow ? `0 0 24px ${glow}` : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', fontFamily: 'Space Grotesk' }}>
      {children}
    </h3>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = '#6366f1', style = {} }) {
  return (
    <span
      className="badge"
      style={{
        background: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'success', children }) {
  const config = {
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#6ee7b7', icon: '✅' },
    error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  color: '#fca5a5', icon: '❌' },
    info:    { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', color: '#a5b4fc', icon: 'ℹ️' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#fcd34d', icon: '⚠️' },
  };
  const c = config[type];
  return (
    <div style={{ padding: '12px 14px', borderRadius: '10px', background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0 }}>{c.icon}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── StatMini ─────────────────────────────────────────────────────────────────
export function StatMini({ icon, label, value, color = '#6366f1' }) {
  return (
    <div className="card-hover" style={{ padding: '16px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600, marginTop: '2px', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message, linkTo, linkLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
      <div style={{ fontSize: '44px', marginBottom: '10px' }}>{icon}</div>
      <p style={{ fontSize: '14px' }}>{message}</p>
      {linkTo && (
        <a href={linkTo} style={{ fontSize: '13px', color: 'var(--color-primary-light)', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
          {linkLabel} →
        </a>
      )}
    </div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height: i === 0 ? '80px' : '60px', borderRadius: '14px', opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

// ─── ScoreRing ────────────────────────────────────────────────────────────────
export function ScoreRing({ score, label, color = '#6366f1', size = 96 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const center = size / 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
        <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
        <text x={center} y={center + 5} textAnchor="middle" fill="white"
          fontSize={size > 80 ? '15' : '12'} fontWeight="700" fontFamily="Space Grotesk">{score}%</text>
      </svg>
      <span style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 500 }}>{label}</span>
    </div>
  );
}
