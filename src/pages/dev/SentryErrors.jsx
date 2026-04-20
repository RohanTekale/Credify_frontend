// src/pages/dev/SentryErrors.jsx — Phase 1: Sentry Error Feed
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg: '#080c14', bgCard: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSec: '#8b96b0', textMuted: '#4b5675',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', mono: "'JetBrains Mono',monospace",
};

const LEVEL_META = {
  critical: { color: '#f87171', bg: 'rgba(239,68,68,0.15)',  icon: '⬤', label: 'Critical' },
  error:    { color: '#fb923c', bg: 'rgba(251,146,60,0.13)', icon: '⬤', label: 'Error'    },
  warning:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', icon: '▲', label: 'Warning'  },
  info:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: 'ℹ', label: 'Info'     },
};

const MOCK_ISSUES = [
  { id: '1', title: 'ConnectionRefusedError: [Errno 111] Connection refused', level: 'error',    count: 47,  first_seen: '3d ago', last_seen: '2m ago',  url: '#' },
  { id: '2', title: 'KeyError: \'user_id\' at /api/requests/raise/',          level: 'error',    count: 12,  first_seen: '1d ago', last_seen: '15m ago', url: '#' },
  { id: '3', title: 'IntegrityError: duplicate key value violates constraint', level: 'critical', count: 3,   first_seen: '6h ago', last_seen: '1h ago',  url: '#' },
  { id: '4', title: 'RateLimitExceeded at /api/dev/tasks/',                   level: 'warning',  count: 231, first_seen: '5d ago', last_seen: '30s ago', url: '#' },
  { id: '5', title: 'DeprecationWarning: Using legacy token format',          level: 'warning',  count: 8,   first_seen: '2d ago', last_seen: '4h ago',  url: '#' },
  { id: '6', title: 'SMTPConnectError: Failed to send email notification',    level: 'error',    count: 19,  first_seen: '12h ago',last_seen: '45m ago', url: '#' },
];

function Spinner() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(59,97,245,0.2)', borderTop: `2px solid ${C.brand}`, borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />;
}

export default function SentryErrors() {
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await devAPI.getSentryIssues();
      setIssues(Array.isArray(data?.issues) ? data.issues : Array.isArray(data) ? data : MOCK_ISSUES);
    } catch {
      setIssues(MOCK_ISSUES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = issues
    .filter(i => filter === 'all' || i.level === filter)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all:      issues.length,
    critical: issues.filter(i => i.level === 'critical').length,
    error:    issues.filter(i => i.level === 'error').length,
    warning:  issues.filter(i => i.level === 'warning').length,
  };

  const totalEvents = issues.reduce((s, i) => s + (i.count || 0), 0);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em', margin: '0 0 4px' }}>Sentry Error Feed</h2>
          <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>Top unresolved issues · Error levels · Direct links</p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textSec, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          {loading ? <Spinner /> : '↻'} Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Issues',  value: counts.all,       color: C.brand   },
          { label: 'Critical',      value: counts.critical,  color: '#f87171' },
          { label: 'Errors',        value: counts.error,     color: '#fb923c' },
          { label: 'Total Events',  value: totalEvents,      color: C.warning },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '16px 18px', borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${C.border}` }}>
          {[['all','All'], ['critical','Critical'], ['error','Error'], ['warning','Warning']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ padding: '6px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', background: filter === id ? 'rgba(59,97,245,0.18)' : 'transparent', color: filter === id ? '#8ba7ff' : C.textSec, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
              {label} {counts[id] != null && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>{counts[id]}</span>}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search errors…" style={{ flex: 1, minWidth: 200, padding: '8px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
      </div>

      {/* Issues list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.textSec }}><Spinner /> <span style={{ marginLeft: 10, fontSize: 13 }}>Fetching issues…</span></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.textMuted, fontSize: 13, background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}` }}>No issues found — great job! 🎉</div>
        ) : filtered.map((issue) => {
          const meta = LEVEL_META[issue.level] || LEVEL_META.error;
          return (
            <div key={issue.id} style={{ padding: '16px 20px', borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}`, transition: 'border-color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(59,97,245,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Level badge */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, flexShrink: 0, marginTop: 1 }}>
                  {meta.label}
                </span>
                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.mono, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.title}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: C.textMuted, flexWrap: 'wrap' }}>
                    <span>First seen: <span style={{ color: C.textSec }}>{issue.first_seen}</span></span>
                    <span>Last seen: <span style={{ color: C.textSec }}>{issue.last_seen}</span></span>
                    <span>Events: <span style={{ color: meta.color, fontWeight: 700 }}>{issue.count}</span></span>
                  </div>
                </div>
                {/* Link */}
                {issue.url && issue.url !== '#' && (
                  <a href={issue.url} target="_blank" rel="noreferrer" style={{ padding: '5px 11px', borderRadius: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 11, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                    View →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && issues === MOCK_ISSUES && (
        <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 9, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 11, color: '#fbbf24' }}>
          ⚠ Showing mock data — connect <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 3 }}>GET /api/dev/sentry/</code> to see live Sentry issues
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
