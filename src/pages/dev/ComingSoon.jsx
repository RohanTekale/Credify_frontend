// src/pages/dev/ComingSoon.jsx — Phase 2 placeholder pages
import { useLocation } from 'react-router-dom';

const C = {
  bgCard: 'var(--dev-card-bg)', border: 'var(--dev-card-border)',
  brand: '#3b61f5', text: 'var(--dev-text-primary)', textSec: 'var(--dev-text-secondary)', textMuted: 'var(--dev-text-muted)',
  mono: "'JetBrains Mono',monospace",
};

const PAGE_META = {
  '/dev/redis': {
    title: 'Redis Inspector',
    desc: 'Inspect Redis cache — memory usage, hit/miss ratio, connected clients, key count and TTL scan.',
    endpoint: 'GET /api/dev/cache/',
    features: ['Memory used / peak', 'Hit/miss ratio', 'Connected clients', 'Key count + TTL scan'],
    color: '#ef4444',
    icon: '⬡',
    phase: 'Phase 2',
  },
  '/dev/config': {
    title: 'Env Config Viewer',
    desc: 'Read-only snapshot of Django settings — DEBUG flag, ALLOWED_HOSTS, installed apps, and masked secrets.',
    endpoint: 'GET /api/dev/config/',
    features: ['Django settings snapshot', 'DEBUG / ALLOWED_HOSTS', 'Installed apps list', 'Secrets masked'],
    color: '#3b82f6',
    icon: '⚙',
    phase: 'Phase 2',
  },
  '/dev/indexes': {
    title: 'Index Health',
    desc: 'Analyse PostgreSQL index usage — seq scans vs index scans, unused indexes, and bloat estimates per table.',
    endpoint: 'GET /api/dev/indexes/',
    features: ['All indexes per table', 'Unused index scan', 'Seq scan vs idx scan ratio', 'Bloat estimate'],
    color: '#f97316',
    icon: '◈',
    phase: 'Phase 2',
  },
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || {
    title: 'Coming Soon',
    desc: 'This feature is under development.',
    features: [],
    color: '#3b61f5',
    icon: '◎',
    phase: 'Phase 2',
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '0 20px' }}>
        {/* Icon */}
        <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.7 }}>{meta.icon}</div>

        {/* Phase badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, letterSpacing: '0.08em', marginBottom: 16 }}>
          {meta.phase} — Coming Soon
        </span>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          {meta.title}
        </h2>
        <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.7, margin: '0 0 28px' }}>{meta.desc}</p>

        {/* Endpoint */}
        {meta.endpoint && (
          <div style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--dev-card-bg)', border: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            {meta.endpoint}
          </div>
        )}

        {/* Features list */}
        {meta.features.length > 0 && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', textAlign: 'left' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              What you'll see here
            </div>
            {meta.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < meta.features.length - 1 ? `1px solid var(--dev-divider)` : 'none' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: meta.color, flexShrink: 0 }}>
                  ✓
                </span>
                <span style={{ fontSize: 13, color: C.textSec }}>{f}</span>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 24, lineHeight: 1.6 }}>
          Build the backend endpoint and this page will auto-populate with live data.
        </p>
      </div>
    </div>
  );
}
