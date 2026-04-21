// src/pages/dev/EnvConfig.jsx — Phase 2: Django Settings Snapshot
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg: 'var(--dev-bg)', bgCard: 'var(--dev-card-bg)', border: 'var(--dev-card-border)',
  brand: '#3b61f5', text: 'var(--dev-text-primary)', textSec: 'var(--dev-text-secondary)', textMuted: 'var(--dev-text-muted)',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
  mono: "'JetBrains Mono',monospace",
};

const MOCK = {
  django_version: '5.0.3',
  environment: { DEBUG: false, TIME_ZONE: 'Asia/Kolkata' },
  apps: { project: ['users','cards','transactions','enquiry','notifications','dev_panel'], third_party: ['rest_framework','corsheaders','celery','django_celery_beat'], total: 22 },
  database: { engine: 'django.db.backends.postgresql', host: 'db', port: '5432', name: 'credify_db', password: '****' },
  cache: { location: 'redis://:**@redis:6379/1' },
  email: { host: 'smtp.gmail.com', port: 587, use_tls: true, from: 'noreply@credify.app', password: '****' },
  jwt: { access_lifetime: '60 minutes' },
  celery: { beat_schedule: ['auto-freeze-inactive-cards','auto-block-inactive-cards','expire-limited-time-subscriptions'] },
  cors: { allowed_origins: ['http://localhost:3001','http://localhost:5173','https://credify.app'] },
};

function Spinner() {
  return <span style={{ display:'inline-block', width:14, height:14, border:`2px solid rgba(59,97,245,0.2)`, borderTop:`2px solid ${C.brand}`, borderRadius:'50%', animation:'spin 0.65s linear infinite' }} />;
}

const Section = ({ title, icon, children }) => (
  <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', marginBottom:14 }}>
    <div style={{ padding:'13px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:12, fontWeight:700, color:C.text, letterSpacing:'-0.01em' }}>{title}</span>
    </div>
    <div style={{ padding:'14px 18px' }}>{children}</div>
  </div>
);

const Row = ({ label, value, masked, alert, mono }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid var(--dev-divider)` }}>
    <span style={{ fontSize:12, color:C.textSec }}>{label}</span>
    <span style={{ fontSize:12, fontWeight:600, color: masked ? C.textMuted : alert ? C.warning : C.text, fontFamily: mono ? C.mono : 'inherit', background: masked ? 'var(--dev-card-bg)' : 'transparent', padding: masked ? '1px 6px' : 0, borderRadius: masked ? 4 : 0 }}>
      {value}
    </span>
  </div>
);

export default function EnvConfig() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await devAPI.getEnvConfig();
      setData(res);
      setIsMock(false);
    } catch {
      setData(MOCK);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.02em', margin:'0 0 3px' }}>Env Config Viewer</h2>
            <p style={{ fontSize:12, color:C.textSec, margin:0 }}>
              Sanitised Django settings · Secrets masked automatically · <code style={{ background:'var(--dev-card-border)', padding:'1px 5px', borderRadius:3, fontSize:11 }}>GET /api/dev/config/</code>
            </p>
          </div>
        </div>
        <button onClick={load} disabled={loading} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:9, background:C.bgCard, border:`1px solid ${C.border}`, color:C.textSec, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          {loading ? <Spinner /> : '↻'} Refresh
        </button>
      </div>

      {loading && !data ? (
        <div style={{ padding:64, textAlign:'center', color:C.textSec }}><Spinner /> <span style={{ marginLeft:10, fontSize:13 }}>Loading configuration…</span></div>
      ) : data && (
        <>
          {/* DEBUG warning */}
          {data.environment?.DEBUG && (
            <div style={{ padding:'12px 18px', borderRadius:10, marginBottom:20, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:16 }}>🚨</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.danger }}>DEBUG mode is ON</div>
                <div style={{ fontSize:11, color:C.textSec }}>Never deploy to production with DEBUG=True. Sensitive data and stack traces are exposed.</div>
              </div>
            </div>
          )}

          {/* Quick summary row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
            {[
              { label:'Django',     value: data.django_version,              color:C.brand   },
              { label:'DEBUG',      value: data.environment?.DEBUG ? 'ON ⚠' : 'OFF ✓', color: data.environment?.DEBUG ? C.danger : C.success },
              { label:'Timezone',   value: data.environment?.TIME_ZONE,     color:C.text    },
              { label:'Total Apps', value: data.apps?.total,                color:C.text    },
              { label:'JWT Token',  value: data.jwt?.access_lifetime,       color:C.textSec },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding:'14px 16px', borderRadius:12, background:C.bgCard, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:15, fontWeight:800, color, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.01em' }}>{value}</div>
                <div style={{ fontSize:10, color:C.textMuted, marginTop:4, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {/* Apps */}
            <Section title="Installed Apps" icon="📦">
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginBottom:8 }}>Project Apps</div>
                {(data.apps?.project || []).map(app => (
                  <div key={app} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 0', borderBottom:`1px solid var(--dev-divider)` }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:C.success, flexShrink:0 }} />
                    <span style={{ fontSize:12, fontFamily:C.mono, color:C.text }}>{app}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:10, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginBottom:8 }}>Third-party</div>
                {(data.apps?.third_party || []).map(app => (
                  <div key={app} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 0', borderBottom:`1px solid var(--dev-divider)` }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#60a5fa', flexShrink:0 }} />
                    <span style={{ fontSize:12, fontFamily:C.mono, color:C.textSec }}>{app}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Database */}
            <div>
              <Section title="Database" icon="🗄">
                <Row label="Engine"   value={data.database?.engine?.replace('django.db.backends.','')} mono />
                <Row label="Host"     value={data.database?.host}   />
                <Row label="Port"     value={data.database?.port}   mono />
                <Row label="Name"     value={data.database?.name}   mono />
                <Row label="Password" value={data.database?.password} masked />
              </Section>

              <Section title="Cache (Redis)" icon="⚡">
                <Row label="Location" value={data.cache?.location} masked mono />
              </Section>
            </div>

            {/* Email */}
            <Section title="Email (SMTP)" icon="✉️">
              <Row label="Host"     value={data.email?.host} mono />
              <Row label="Port"     value={data.email?.port} mono />
              <Row label="TLS"      value={data.email?.use_tls ? 'Enabled ✓' : 'Disabled'} alert={!data.email?.use_tls} />
              <Row label="From"     value={data.email?.from} />
              <Row label="Password" value={data.email?.password} masked />
            </Section>

            {/* Celery */}
            <Section title="Celery Beat Schedule" icon="⏰">
              {(data.celery?.beat_schedule || []).map((task, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid var(--dev-divider)` }}>
                  <span style={{ fontSize:11, fontFamily:C.mono, color:C.brand }}>▶</span>
                  <span style={{ fontSize:12, fontFamily:C.mono, color:C.textSec }}>{task}</span>
                </div>
              ))}
            </Section>

            {/* CORS */}
            <Section title="CORS Allowed Origins" icon="🌐">
              {(data.cors?.allowed_origins || []).map((origin, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid var(--dev-divider)` }}>
                  <span style={{ fontSize:11, color:C.success }}>✓</span>
                  <span style={{ fontSize:12, fontFamily:C.mono, color:C.text }}>{origin}</span>
                </div>
              ))}
            </Section>
          </div>
        </>
      )}

      {isMock && (
        <div style={{ marginTop:8, padding:'10px 16px', borderRadius:9, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', fontSize:11, color:'#fbbf24' }}>
          ⚠ Showing mock data — connect <code style={{ background:'rgba(0,0,0,0.2)', padding:'1px 5px', borderRadius:3 }}>GET /api/dev/config/</code> to see live Django settings
        </div>
      )}
    </div>
  );
}
