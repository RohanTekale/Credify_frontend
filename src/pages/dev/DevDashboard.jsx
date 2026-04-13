// src/pages/dev/DevDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { devAPI } from '../../services/dev.service';

const MOCK_ACTIVITY = [
  { type: 'query', msg: 'SELECT * FROM users WHERE is_active = true',          time: '2m ago',  status: 'ok' },
  { type: 'delete', msg: 'DELETE FROM sessions WHERE expired = true',           time: '8m ago',  status: 'ok' },
  { type: 'query', msg: 'SELECT COUNT(*) FROM transactions GROUP BY status',   time: '15m ago', status: 'ok' },
  { type: 'error', msg: 'DROP TABLE users — BLOCKED by safety filter',         time: '1h ago',  status: 'err' },
  { type: 'update', msg: "UPDATE cards SET status = 'frozen' WHERE user_id=42", time: '2h ago', status: 'ok' },
];

function StatCard({ label, value, sub, accent, icon, delay, loading }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay || 0); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{ ...S.statCard, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 380ms ease, transform 380ms ease' }}>
      <div style={{ ...S.statAccent, background: accent }} />
      <div style={S.statTop}>
        <span style={S.statIcon}>{icon}</span>
        <span style={S.statLabel}>{label}</span>
      </div>
      {loading
        ? <div style={S.shimmer} />
        : <div style={{ ...S.statValue, color: accent }}>{value ?? '—'}</div>
      }
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${(v / max) * 100}%`, background: color,
          borderRadius: '2px 2px 0 0',
          opacity: 0.25 + (i / data.length) * 0.75,
          transition: `height 700ms cubic-bezier(0.16,1,0.3,1) ${i * 40}ms`,
          minHeight: 2,
        }} />
      ))}
    </div>
  );
}

function ActivityRow({ item, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay || 0); return () => clearTimeout(t); }, [delay]);

  const typeColors = { query:'#3b61f5', delete:'#ef4444', update:'#f59e0b', error:'#ef4444' };
  const typeBg     = { query:'rgba(59,97,245,0.12)', delete:'rgba(239,68,68,0.12)', update:'rgba(245,158,11,0.12)', error:'rgba(239,68,68,0.12)' };

  return (
    <div style={{ ...S.actRow, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(-8px)', transition: 'opacity 280ms ease, transform 280ms ease' }}>
      <span style={{ ...S.actType, color: typeColors[item.type], background: typeBg[item.type] }}>{item.type}</span>
      <span style={S.actMsg}>{item.msg}</span>
      <span style={S.actTime}>{item.time}</span>
      <span style={{ ...S.actStatus, background: item.status === 'ok' ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)', color: item.status === 'ok' ? '#10b981' : '#ef4444' }}>
        {item.status === 'ok' ? '✓' : '✕'}
      </span>
    </div>
  );
}

export default function DevDashboard() {
  const [stats, setStats]   = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryVol]          = useState([8,14,9,22,31,26,18,40,35,20,28,44]);
  const [tick, setTick]     = useState(0);

  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    Promise.all([
      devAPI.getDbStats().catch(() => null),
      devAPI.getTables().catch(() => null),
    ]).then(([statsRes, tablesRes]) => {
      if (statsRes?.data) setStats(statsRes.data);
      if (tablesRes?.data?.tables) setTables(tablesRes.data.tables.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const s = stats || {};

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.title}>System Overview</h1>
          <p style={S.subtitle}>Real-time PostgreSQL health · Live data</p>
        </div>
        <div style={S.liveChip}>
          <span style={S.liveDot} />
          LIVE · {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stat cards */}
      <div style={S.statsGrid}>
        <StatCard label="Tables"         value={s.table_count}       sub="PostgreSQL"        accent="#3b61f5" icon="⬡" delay={0}   loading={loading} />
        <StatCard label="Total Rows"     value={s.total_rows?.toLocaleString()} sub="approximate"  accent="#8b5cf6" icon="≡" delay={70}  loading={loading} />
        <StatCard label="DB Size"        value={s.db_size}           sub="on disk"           accent="#f59e0b" icon="◈" delay={140} loading={loading} />
        <StatCard label="Queries (24h)"  value={s.query_count_24h}   sub="via dev panel"     accent="#10b981" icon="▶" delay={210} loading={loading} />
        <StatCard label="Cache Hit"      value={s.cache_hit_pct != null ? `${s.cache_hit_pct}%` : null} sub="pg buffer" accent="#10b981" icon="◎" delay={280} loading={loading} />
        <StatCard label="Slow Queries"   value={s.slow_queries}      sub="> 500ms"           accent="#ef4444" icon="⚠" delay={350} loading={loading} />
      </div>

      {/* Mid row */}
      <div style={S.midRow}>
        {/* Query volume chart */}
        <div style={S.chartCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Query Volume</span>
            <span style={S.cardMeta}>Last 12 intervals</span>
          </div>
          <MiniBarChart data={queryVol} color="#3b61f5" />
          <div style={S.chartLabels}>
            {['12h','10h','8h','6h','4h','2h','now'].map(l => (
              <span key={l} style={S.chartLabel}>{l}</span>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={S.quickCard}>
          <div style={S.cardHeader}><span style={S.cardTitle}>Quick Actions</span></div>
          <div style={S.quickGrid}>
            {[
              { to:'/dev/tables', label:'Browse Tables', icon:'⬡', color:'#3b61f5' },
              { to:'/dev/query',  label:'Run SQL',       icon:'▶', color:'#10b981' },
              { to:'/dev/api',    label:'Debug API',     icon:'◎', color:'#8b5cf6' },
              { to:'/dev/logs',   label:'View Logs',     icon:'≡', color:'#f59e0b' },
            ].map(q => (
              <Link key={q.to} to={q.to} style={{ ...S.quickBtn, borderColor:`${q.color}30` }}>
                <span style={{ ...S.quickIcon, color:q.color }}>{q.icon}</span>
                <span style={S.quickLabel}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={S.bottomRow}>
        {/* Hot tables */}
        <div style={S.tableCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Hot Tables</span>
            <Link to="/dev/tables" style={S.cardLink}>View all →</Link>
          </div>
          {loading ? (
            <div style={S.loadingRows}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ ...S.shimmer, height: 36, borderRadius: 6, marginBottom: 4 }} />)}
            </div>
          ) : tables.length === 0 ? (
            <p style={{ color: C.textMuted, fontSize: 13 }}>No tables found</p>
          ) : (
            <div style={S.tableList}>
              {tables.map((t) => (
                <Link key={t.name} to={`/dev/tables/${t.name}`} style={S.tableRow}>
                  <span style={S.tableIcon}>⬡</span>
                  <span style={S.tableName}>{t.name}</span>
                  <span style={S.tableMeta}>{Number(t.rows || 0).toLocaleString()} rows</span>
                  <span style={S.tableMeta}>{t.size || '—'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Audit trail */}
        <div style={S.actCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Recent Activity</span>
            <Link to="/dev/logs" style={S.cardLink}>Full logs →</Link>
          </div>
          <div style={S.actList}>
            {MOCK_ACTIVITY.map((a, i) => (
              <ActivityRow key={i} item={a} delay={i * 55} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const C = {
  bgCard: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSec: '#8b96b0', textMuted: '#4b5675',
};

const S = {
  page:       { display:'flex', flexDirection:'column', gap:20 },
  pageHeader: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:4 },
  title:      { margin:0, fontSize:22, fontWeight:700, color:C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.02em' },
  subtitle:   { margin:'4px 0 0', fontSize:13, color:C.textSec },
  liveChip:   { display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#10b981', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', padding:'5px 10px', borderRadius:20, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.04em' },
  liveDot:    { width:6, height:6, borderRadius:'50%', background:'#10b981', animation:'pulseGlow 1.5s ease infinite' },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 },
  statCard:   { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px', position:'relative', overflow:'hidden', cursor:'default' },
  statAccent: { position:'absolute', top:0, left:0, right:0, height:2, borderRadius:'12px 12px 0 0' },
  statTop:    { display:'flex', alignItems:'center', gap:6, marginBottom:10 },
  statIcon:   { fontSize:13, opacity:0.5 },
  statLabel:  { fontSize:10, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 },
  statValue:  { fontSize:24, fontWeight:800, fontFamily:"'Sora',sans-serif", lineHeight:1, letterSpacing:'-0.03em' },
  statSub:    { fontSize:11, color:C.textMuted, marginTop:4 },
  shimmer:    { height:28, background:'rgba(255,255,255,0.06)', borderRadius:4, animation:'pulseGlow 1.5s ease-in-out infinite' },
  midRow:     { display:'grid', gridTemplateColumns:'1fr 280px', gap:16 },
  chartCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 20px' },
  quickCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 20px' },
  cardHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  cardTitle:  { fontSize:13, fontWeight:700, color:C.text, fontFamily:"'Sora',sans-serif" },
  cardMeta:   { fontSize:11, color:C.textMuted },
  cardLink:   { fontSize:12, color:C.brand, textDecoration:'none', opacity:0.8 },
  chartLabels:{ display:'flex', justifyContent:'space-between', marginTop:8 },
  chartLabel: { fontSize:10, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" },
  quickGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  quickBtn:   { display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid', borderRadius:8, textDecoration:'none', transition:'background 150ms', cursor:'pointer' },
  quickIcon:  { fontSize:16, lineHeight:1 },
  quickLabel: { fontSize:12, fontWeight:600, color:C.text },
  bottomRow:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  tableCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 20px', overflow:'hidden' },
  loadingRows:{ display:'flex', flexDirection:'column', gap:4 },
  tableList:  { display:'flex', flexDirection:'column', gap:2 },
  tableRow:   { display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:7, textDecoration:'none', transition:'background 150ms', cursor:'pointer' },
  tableIcon:  { fontSize:12, color:C.brand, opacity:0.7 },
  tableName:  { flex:1, fontSize:13, fontWeight:600, color:C.text, fontFamily:"'JetBrains Mono',monospace" },
  tableMeta:  { fontSize:11, color:C.textMuted, minWidth:60, textAlign:'right' },
  actCard:    { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 20px', overflow:'hidden' },
  actList:    { display:'flex', flexDirection:'column', gap:6 },
  actRow:     { display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  actType:    { fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', padding:'2px 6px', borderRadius:4, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" },
  actMsg:     { flex:1, fontSize:11, color:C.textSec, fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  actTime:    { fontSize:10, color:C.textMuted, flexShrink:0 },
  actStatus:  { fontSize:11, fontWeight:700, padding:'2px 6px', borderRadius:4, flexShrink:0 },
};
