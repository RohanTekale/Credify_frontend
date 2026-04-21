// src/pages/dev/MigrationStatus.jsx
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg: 'var(--dev-bg)', bgCard: 'var(--dev-card-bg)', border: 'var(--dev-card-border)',
  brand: '#3b61f5', text: 'var(--dev-text-primary)', textSec: 'var(--dev-text-secondary)', textMuted: 'var(--dev-text-muted)',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', mono: "'JetBrains Mono',monospace",
};

function Spinner() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(59,97,245,0.2)', borderTop: `2px solid ${C.brand}`, borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />;
}

export default function MigrationStatus() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await devAPI.getMigrations();
      setData(res.data ?? null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleApp = (app) => setExpanded(e => ({ ...e, [app]: !e[app] }));

  if (loading) return (
    <div style={{ padding: 64, textAlign: 'center', color: C.textSec }}>
      <Spinner /> <span style={{ marginLeft: 10, fontSize: 13 }}>Loading migration status…</span>
    </div>
  );

  if (!data || !data.apps) return (
    <div style={{ padding: 64, textAlign: 'center', color: C.danger, fontSize: 13 }}>
      Failed to load migration data.
    </div>
  );

  const apps          = data.apps ?? [];
  const totalApplied  = data.total_applied ?? 0;
  const totalPending  = data.total_pending ?? 0;
  const totalMigs     = totalApplied + totalPending;

  // Find the most recent last_applied_at across all apps
  const lastMigratedAt = apps
    .map(a => a.last_applied_at)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em', margin: '0 0 4px' }}>Migration Status</h2>
          <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>Applied migrations · Pending count · Per-app breakdown</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textSec, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Apps',       value: apps.length,   color: C.brand   },
          { label: 'Total Migrations', value: totalMigs,     color: C.textSec },
          { label: 'Applied',          value: totalApplied,  color: C.success },
          { label: 'Pending',          value: totalPending,  color: totalPending > 0 ? C.danger : C.success },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '16px 18px', borderRadius: 12, background: C.bgCard, border: `1px solid ${totalPending > 0 && label === 'Pending' ? 'rgba(239,68,68,0.3)' : C.border}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Health banner */}
      <div style={{ padding: '12px 18px', borderRadius: 10, marginBottom: 20, background: totalPending === 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${totalPending === 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{totalPending === 0 ? '✅' : '⚠️'}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: totalPending === 0 ? '#34d399' : '#f87171' }}>
            {totalPending === 0
              ? 'All migrations applied — database is up to date'
              : `${totalPending} pending migration${totalPending > 1 ? 's' : ''} — run manage.py migrate`}
          </div>
          {lastMigratedAt && (
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, fontFamily: C.mono }}>Last migrated: {lastMigratedAt}</div>
          )}
        </div>
      </div>

      {/* Per-app breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {apps.map((appData) => {
          const appPending  = appData.pending_count ?? 0;
          const appApplied  = appData.applied_count ?? 0;
          const pendingList = appData.pending ?? [];
          const isExpanded  = expanded[appData.app];

          return (
            <div key={appData.app} style={{ background: C.bgCard, border: `1px solid ${appPending > 0 ? 'rgba(239,68,68,0.25)' : C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* App header */}
              <button onClick={() => toggleApp(appData.app)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{appData.app}</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{appApplied + appPending} migration{(appApplied + appPending) !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {appPending > 0 ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 20 }}>
                      {appPending} pending
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 20 }}>✓ all applied</span>
                  )}
                  <span style={{ color: C.textMuted, fontSize: 12 }}>{isExpanded ? '▴' : '▾'}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  {/* Applied count row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px 9px 32px', borderBottom: pendingList.length > 0 ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
                    <span style={{ fontSize: 14 }}>✅</span>
                    <span style={{ fontSize: 11, fontFamily: C.mono, color: C.textSec, flex: 1 }}>{appApplied} applied migration{appApplied !== 1 ? 's' : ''}</span>
                    {appData.last_applied_at && (
                      <span style={{ fontSize: 10, color: C.textMuted, fontFamily: C.mono }}>last: {appData.last_applied_at.replace('T', ' ').slice(0, 19)}</span>
                    )}
                  </div>
                  {/* Pending migrations listed individually */}
                  {pendingList.map((name, i) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px 9px 32px', borderBottom: i < pendingList.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
                      <span style={{ fontSize: 14 }}>⏳</span>
                      <span style={{ fontSize: 11, fontFamily: C.mono, color: '#fbbf24', flex: 1 }}>{name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: 10 }}>Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}