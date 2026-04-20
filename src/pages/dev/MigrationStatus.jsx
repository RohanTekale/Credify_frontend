// src/pages/dev/MigrationStatus.jsx — Phase 1: Django Migration Status
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg: '#080c14', bgCard: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSec: '#8b96b0', textMuted: '#4b5675',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', mono: "'JetBrains Mono',monospace",
};

const MOCK_DATA = {
  pending_count: 0,
  last_migrated_at: '2026-04-18 23:01:22',
  apps: [
    { app: 'auth',         migrations: [{ name: '0001_initial', applied: true }, { name: '0002_alter_permission', applied: true }] },
    { app: 'users',        migrations: [{ name: '0001_initial', applied: true }, { name: '0002_add_kyc_fields', applied: true }, { name: '0003_add_referral', applied: true }] },
    { app: 'cards',        migrations: [{ name: '0001_initial', applied: true }, { name: '0002_add_virtual_card', applied: true }] },
    { app: 'enquiry',      migrations: [{ name: '0001_initial', applied: true }, { name: '0002_add_document', applied: true }, { name: '0003_add_admin_comment', applied: false }] },
    { app: 'transactions', migrations: [{ name: '0001_initial', applied: true }, { name: '0002_add_merchant', applied: true }] },
    { app: 'notifications',migrations: [{ name: '0001_initial', applied: true }] },
    { app: 'dev_panel',    migrations: [{ name: '0001_initial', applied: true }, { name: '0002_add_auditlog', applied: true }] },
  ],
};

function Spinner() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(59,97,245,0.2)', borderTop: `2px solid ${C.brand}`, borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />;
}

export default function MigrationStatus() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await devAPI.getMigrations();
      setData(res.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleApp = (app) => setExpanded(e => ({ ...e, [app]: !e[app] }));

  if (loading) return <div style={{ padding: 64, textAlign: 'center', color: C.textSec }}><Spinner /> <span style={{ marginLeft: 10, fontSize: 13 }}>Loading migration status…</span></div>;
  if (!data) return null;

  const totalMigrations = data.apps?.reduce((s, a) => s + a.migrations.length, 0) || 0;
  const appliedCount    = data.apps?.reduce((s, a) => s + a.migrations.filter(m => m.applied).length, 0) || 0;
  const pending         = data.pending_count ?? (totalMigrations - appliedCount);

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
          { label: 'Total Apps',       value: data.apps?.length || 0, color: C.brand   },
          { label: 'Total Migrations', value: totalMigrations,         color: C.textSec },
          { label: 'Applied',          value: appliedCount,            color: C.success },
          { label: 'Pending',          value: pending,                 color: pending > 0 ? C.danger : C.success },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '16px 18px', borderRadius: 12, background: C.bgCard, border: `1px solid ${pending > 0 && label === 'Pending' ? 'rgba(239,68,68,0.3)' : C.border}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Health banner */}
      <div style={{ padding: '12px 18px', borderRadius: 10, marginBottom: 20, background: pending === 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${pending === 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{pending === 0 ? '✅' : '⚠️'}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: pending === 0 ? '#34d399' : '#f87171' }}>
            {pending === 0 ? 'All migrations applied — database is up to date' : `${pending} pending migration${pending > 1 ? 's' : ''} — run manage.py migrate`}
          </div>
          {data.last_migrated_at && (
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, fontFamily: C.mono }}>Last migrated: {data.last_migrated_at}</div>
          )}
        </div>
      </div>

      {/* Per-app breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(data.apps || []).map((appData) => {
          const appPending = appData.migrations.filter(m => !m.applied).length;
          const isExpanded = expanded[appData.app];
          return (
            <div key={appData.app} style={{ background: C.bgCard, border: `1px solid ${appPending > 0 ? 'rgba(239,68,68,0.25)' : C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* App header */}
              <button onClick={() => toggleApp(appData.app)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.mono }}>{appData.app}</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{appData.migrations.length} migration{appData.migrations.length !== 1 ? 's' : ''}</span>
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

              {/* Migration list */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  {appData.migrations.map((m, i) => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px 9px 32px', borderBottom: i < appData.migrations.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{m.applied ? '✅' : '⏳'}</span>
                      <span style={{ fontSize: 11, fontFamily: C.mono, color: m.applied ? C.textSec : '#fbbf24', flex: 1 }}>{m.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: m.applied ? '#34d399' : '#fbbf24', background: m.applied ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: 10 }}>
                        {m.applied ? 'Applied' : 'Pending'}
                      </span>
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
