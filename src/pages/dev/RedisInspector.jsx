// src/pages/dev/RedisInspector.jsx — Phase 2: Live Redis Cache Stats
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg: 'var(--dev-bg)', bgCard: 'var(--dev-card-bg)', border: 'var(--dev-card-border)',
  brand: '#3b61f5', text: 'var(--dev-text-primary)', textSec: 'var(--dev-text-secondary)', textMuted: 'var(--dev-text-muted)',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
  redis: '#ef4444', mono: "'JetBrains Mono',monospace",
};

const MOCK = {
  connected: true, version: '7.2.4', uptime_days: 12, connected_clients: 3,
  memory: { used: '2.4 MB', peak: '4.1 MB', fragmentation_ratio: 1.12 },
  stats: { hit_rate_pct: 87.4, evicted_keys: 0, expired_keys: 214 },
  keyspace: { total_keys: 1847 },
};

function Spinner() {
  return <span style={{ display:'inline-block', width:14, height:14, border:`2px solid rgba(59,97,245,0.2)`, borderTop:`2px solid ${C.brand}`, borderRadius:'50%', animation:'spin 0.65s linear infinite' }} />;
}

const Stat = ({ label, value, sub, color = C.text, alert }) => (
  <div style={{ padding:'18px 20px', borderRadius:12, background: alert ? 'rgba(239,68,68,0.06)' : C.bgCard, border:`1px solid ${alert ? 'rgba(239,68,68,0.25)' : C.border}`, transition:'all 200ms' }}>
    <div style={{ fontSize:22, fontWeight:800, color: color || C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:11, color: C.textMuted, marginTop:5, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color: C.textSec, marginTop:4 }}>{sub}</div>}
  </div>
);

const GaugeBar = ({ label, pct, color, threshold, value, unit = '%' }) => {
  const isAlert = threshold && pct < threshold;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
        <span style={{ fontSize:12, color: C.textSec, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:800, color: isAlert ? C.danger : color, fontFamily: C.mono }}>
          {value ?? pct}{unit}
          {isAlert && <span style={{ marginLeft:6, fontSize:10, color: C.danger }}>⚠ Low</span>}
        </span>
      </div>
      <div style={{ height:6, borderRadius:3, background:'var(--dev-card-border)', overflow:'hidden' }}>
        <div style={{ width:`${Math.min(100, pct)}%`, height:'100%', borderRadius:3, background: isAlert ? C.danger : color, transition:'width 900ms cubic-bezier(0.16,1,0.3,1)', boxShadow:`0 0 8px ${isAlert ? C.danger : color}50` }} />
      </div>
    </div>
  );
};

export default function RedisInspector() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await devAPI.getCacheStats();
      setData(res);
      setIsMock(false);
    } catch {
      setData(MOCK);
      setIsMock(true);
    } finally {
      setLoading(false);
      setLastRefresh(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isOffline = data && !data.connected;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.redis} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.02em', margin:'0 0 3px' }}>Redis Inspector</h2>
            <p style={{ fontSize:12, color:C.textSec, margin:0 }}>
              Live cache stats via <code style={{ background:'var(--dev-card-border)', padding:'1px 5px', borderRadius:3, fontSize:11 }}>GET /api/dev/cache/</code>
              {lastRefresh && <span style={{ marginLeft:10, color:C.textMuted }}>· refreshed {lastRefresh}</span>}
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, background:C.bgCard, border:`1px solid ${C.border}`, color:C.textSec, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          {loading ? <Spinner /> : '↻'} Refresh
        </button>
      </div>

      {loading && !data ? (
        <div style={{ padding:64, textAlign:'center', color:C.textSec }}><Spinner /> <span style={{ marginLeft:10, fontSize:13 }}>Connecting to Redis…</span></div>
      ) : isOffline ? (
        <div style={{ padding:'40px 24px', textAlign:'center', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:16 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔴</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.danger, marginBottom:6 }}>Redis Offline</div>
          <div style={{ fontSize:13, color:C.textSec }}>{data?.error || 'Cannot connect to Redis. Check CACHES config in settings.'}</div>
        </div>
      ) : data && (
        <>
          {/* Connection status */}
          <div style={{ padding:'10px 16px', borderRadius:10, marginBottom:20, background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:C.success, boxShadow:`0 0 8px ${C.success}`, display:'inline-block' }} />
            <span style={{ fontSize:13, fontWeight:600, color:C.success }}>Redis Connected</span>
            <span style={{ color:C.textMuted, fontSize:12 }}>· version {data.version}</span>
            <span style={{ color:C.textMuted, fontSize:12 }}>· {data.uptime_days}d uptime</span>
            <span style={{ color:C.textMuted, fontSize:12 }}>· {data.connected_clients} client{data.connected_clients !== 1 ? 's' : ''}</span>
          </div>

          {/* KPI row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
            <Stat label="Total Keys"        value={data.keyspace?.total_keys?.toLocaleString() ?? '—'}   color={C.brand}   />
            <Stat label="Memory Used"       value={data.memory?.used ?? '—'}                             color={C.text}    />
            <Stat label="Memory Peak"       value={data.memory?.peak ?? '—'}                             color={C.textSec} />
            <Stat label="Hit Rate"          value={`${data.stats?.hit_rate_pct ?? '—'}%`}               color={data.stats?.hit_rate_pct >= 60 ? C.success : C.danger} alert={data.stats?.hit_rate_pct < 60} />
            <Stat label="Evicted Keys"      value={data.stats?.evicted_keys ?? 0}                        color={data.stats?.evicted_keys > 0 ? C.warning : C.success} />
            <Stat label="Expired Keys"      value={data.stats?.expired_keys?.toLocaleString() ?? '—'}    color={C.textSec} sub="since last restart" />
          </div>

          {/* Performance */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            {/* Hit rate gauge */}
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:18 }}>Cache Effectiveness</div>
              <GaugeBar label="Hit Rate" pct={data.stats?.hit_rate_pct ?? 0} color="#10b981" threshold={60} unit="%" />
              <div style={{ marginTop:16, padding:'10px 14px', borderRadius:9, background: data.stats?.hit_rate_pct >= 60 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)', border:`1px solid ${data.stats?.hit_rate_pct >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <div style={{ fontSize:11, color: data.stats?.hit_rate_pct >= 60 ? C.success : C.danger }}>
                  {data.stats?.hit_rate_pct >= 60
                    ? '✓ Cache is performing well'
                    : '⚠ Below 60% — cache is not effective. Check TTL and cache keys.'}
                </div>
              </div>
            </div>

            {/* Memory health */}
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:18 }}>Memory Health</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Memory Used',   value:data.memory?.used  },
                  { label:'Memory Peak',   value:data.memory?.peak  },
                  { label:'Fragmentation', value:`${data.memory?.fragmentation_ratio ?? '—'}×`, alert: data.memory?.fragmentation_ratio > 1.5 },
                  { label:'Evicted Keys',  value:data.stats?.evicted_keys ?? 0, alert: data.stats?.evicted_keys > 0 },
                ].map(({ label, value, alert }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid var(--dev-divider)` }}>
                    <span style={{ fontSize:12, color:C.textSec }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color: alert ? C.warning : C.text, fontFamily:C.mono }}>
                      {value}
                      {alert && ' ⚠'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isMock && (
        <div style={{ marginTop:16, padding:'10px 16px', borderRadius:9, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', fontSize:11, color:'#fbbf24' }}>
          ⚠ Showing mock data — connect <code style={{ background:'rgba(0,0,0,0.2)', padding:'1px 5px', borderRadius:3 }}>GET /api/dev/cache/</code> to see live Redis stats
        </div>
      )}
    </div>
  );
}
