// src/pages/dev/DevDashboard.jsx — Improved UI + Real API for Recent Activity
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { devAPI } from '../../services/dev.service';

function timeAgo(timeStr) {
  if (!timeStr) return '';
  try {
    const [h, m, s] = timeStr.split(':').map(Number);
    const now = new Date();
    const then = new Date();
    then.setHours(h, m, s, 0);
    let diff = Math.floor((now - then) / 1000);
    if (diff < 0) diff += 86400;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  } catch { return ''; }
}

const LEVEL_META = {
  SQL:   { color: '#3b61f5', bg: 'rgba(59,97,245,0.13)'   },
  INFO:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  WARN:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  ERROR: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  DEBUG: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
};

function StatCard({ label, value, sub, accent, icon, delay, loading }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay || 0); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ ...S.statCard, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 400ms ease, transform 400ms ease' }}>
      <div style={{ ...S.statAccent, background: `linear-gradient(90deg, ${accent}, ${accent}60)` }} />
      <div style={{ ...S.statGlow, background: `${accent}08` }} />
      <div style={S.statTop}>
        <span style={{ ...S.statIcon, color: accent }}>{icon}</span>
        <span style={S.statLabel}>{label}</span>
      </div>
      {loading ? <div style={S.shimmer} /> : <div style={{ ...S.statValue, color: accent }}>{value ?? '—'}</div>}
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, minHeight: 3, borderRadius: '3px 3px 0 0',
          height: `${(v / max) * 100}%`,
          background: `linear-gradient(180deg, ${color}, ${color}70)`,
          opacity: 0.2 + (i / data.length) * 0.8,
          transition: `height 800ms cubic-bezier(0.16,1,0.3,1) ${i * 45}ms`,
          boxShadow: i === data.length - 1 ? `0 0 8px ${color}60` : 'none',
        }} />
      ))}
    </div>
  );
}

function ActivityRow({ item, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay || 0); return () => clearTimeout(t); }, [delay]);
  const lvl = (item.level || 'INFO').toUpperCase();
  const meta = LEVEL_META[lvl] || LEVEL_META.INFO;
  return (
    <div style={{ ...S.actRow, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(-10px)', transition: 'opacity 300ms ease, transform 300ms ease' }}>
      <span style={{ ...S.actType, color: meta.color, background: meta.bg }}>{lvl}</span>
      <span style={S.actMsg} title={item.msg}>{item.msg}</span>
      <span style={S.actMeta} title={item.meta || item.user}>{item.meta || item.user || ''}</span>
      <span style={S.actTime}>{timeAgo(item.time) || item.time}</span>
    </div>
  );
}

function SectionHeader({ title, link, linkLabel, loading: isLoading }) {
  return (
    <div style={S.cardHeader}>
      <div style={S.cardTitleGroup}>
        <div style={S.cardTitleBar} />
        <span style={S.cardTitle}>{title}</span>
        {isLoading && <span style={S.loadingDot} />}
      </div>
      {link && <Link to={link} style={S.cardLink}>{linkLabel || 'View all →'}</Link>}
    </div>
  );
}

// Icon SVGs
const IconTable = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const IconRows  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconDb    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconPlay  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconCache = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IconWarn  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function DevDashboard() {
  const [stats,      setStats]      = useState(null);
  const [tables,     setTables]     = useState([]);
  const [activity,   setActivity]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [actLoading, setActLoading] = useState(true);
  const [queryVol]                  = useState([8,14,9,22,31,26,18,40,35,20,28,44]);
  const [now,        setNow]        = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([
      devAPI.getDbStats().catch(() => null),
      devAPI.getTables().catch(() => null),
    ]).then(([statsRes, tablesRes]) => {
      if (statsRes?.data) setStats(statsRes.data);
      if (tablesRes?.data?.tables) setTables(tablesRes.data.tables.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const fetchActivity = useCallback(() => {
    setActLoading(true);
    devAPI.getLogs({ limit: 6 })
      .then(res => setActivity((res?.data?.logs || []).slice(0, 6)))
      .catch(() => setActivity([]))
      .finally(() => setActLoading(false));
  }, []);

  useEffect(() => {
    fetchActivity();
    const t = setInterval(fetchActivity, 10000);
    return () => clearInterval(t);
  }, [fetchActivity]);

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
          LIVE · {now.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={S.statsGrid}>
        <StatCard label="Tables"        value={s.table_count}       sub="PostgreSQL"   accent="#3b61f5" icon={<IconTable />} delay={0}   loading={loading} />
        <StatCard label="Total Rows"    value={s.total_rows != null ? Number(s.total_rows).toLocaleString() : null} sub="approximate" accent="#8b5cf6" icon={<IconRows />} delay={70} loading={loading} />
        <StatCard label="DB Size"       value={s.db_size}            sub="on disk"      accent="#f59e0b" icon={<IconDb />}   delay={140} loading={loading} />
        <StatCard label="Queries (24h)" value={s.query_count_24h}    sub="via dev panel" accent="#10b981" icon={<IconPlay />} delay={210} loading={loading} />
        <StatCard label="Cache Hit"     value={s.cache_hit_pct != null ? `${parseFloat(s.cache_hit_pct).toFixed(2)}%` : null} sub="pg buffer" accent="#10b981" icon={<IconCache />} delay={280} loading={loading} />
        <StatCard label="Slow Queries"  value={s.slow_queries}       sub="> 500ms"      accent="#ef4444" icon={<IconWarn />} delay={350} loading={loading} />
      </div>

      {/* Mid Row */}
      <div style={S.midRow}>
        <div style={S.chartCard}>
          <SectionHeader title="Query Volume" />
          <MiniBarChart data={queryVol} color="#3b61f5" />
          <div style={S.chartLabels}>
            {['12h','10h','8h','6h','4h','2h','now'].map(l => <span key={l} style={S.chartLabel}>{l}</span>)}
          </div>
        </div>
        <div style={S.quickCard}>
          <SectionHeader title="Quick Actions" />
          <div style={S.quickGrid}>
            {[
              { to:'/dev/tables', label:'Browse Tables', icon:<IconTable />, color:'#3b61f5' },
              { to:'/dev/query',  label:'Run SQL',       icon:<IconPlay />,  color:'#10b981' },
              { to:'/dev/api',    label:'Debug API',     icon:<IconCache />, color:'#8b5cf6' },
              { to:'/dev/logs',   label:'View Logs',     icon:<IconRows />,  color:'#f59e0b' },
            ].map(q => (
              <Link key={q.to} to={q.to} style={S.quickBtn}>
                <span style={{ ...S.quickIcon, color: q.color }}>{q.icon}</span>
                <span style={S.quickLabel}>{q.label}</span>
                <span style={{ fontSize:11, color: q.color, opacity:0.5 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={S.bottomRow}>
        {/* Hot Tables */}
        <div style={S.tableCard}>
          <SectionHeader title="Hot Tables" link="/dev/tables" linkLabel="View all →" />
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ ...S.shimmer, height:38, borderRadius:8, marginBottom:0 }} />)}
            </div>
          ) : tables.length === 0 ? (
            <p style={{ color: C.textMuted, fontSize:13 }}>No tables found</p>
          ) : (
            <div style={S.tableList}>
              {tables.map((t, i) => (
                <Link key={t.name} to={`/dev/tables/${t.name}`} style={S.tableRow}>
                  <span style={{ ...S.tableRank, color: i < 3 ? '#3b61f5' : C.textMuted }}>{String(i+1).padStart(2,'0')}</span>
                  <span style={S.tableName}>{t.name}</span>
                  <span style={S.tableBadge}>{t.columns || 0} cols</span>
                  <span style={{ ...S.tableMeta, color: C.textSec }}>{t.rows === -1 ? '—' : Number(t.rows || 0).toLocaleString()} rows</span>
                  <span style={{ ...S.tableMeta, minWidth:52, color: C.textMuted }}>{t.size || '—'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity — real API */}
        <div style={S.actCard}>
          <SectionHeader title="Recent Activity" link="/dev/logs" linkLabel="Full logs →" loading={actLoading && activity.length > 0} />
          {actLoading && activity.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ ...S.shimmer, height:30, borderRadius:6 }} />)}
            </div>
          ) : activity.length === 0 ? (
            <p style={{ color: C.textMuted, fontSize:13 }}>No recent activity</p>
          ) : (
            <div style={S.actList}>
              {activity.map((a, i) => <ActivityRow key={a.id || i} item={a} delay={i * 50} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulseGlow{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
}

const C = {
  bgCard:'rgba(255,255,255,0.032)', border:'var(--dev-card-border)',
  brand:'#3b61f5', text:'var(--dev-text-primary)', textSec:'var(--dev-text-secondary)', textMuted:'var(--dev-text-muted)',
};

const S = {
  page:       { display:'flex', flexDirection:'column', gap:20 },
  pageHeader: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:2 },
  title:      { margin:0, fontSize:23, fontWeight:800, color:C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.03em' },
  subtitle:   { margin:'5px 0 0', fontSize:13, color:C.textSec },
  liveChip:   { display:'flex', alignItems:'center', gap:7, fontSize:11, color:'#10b981', background:'rgba(16,185,129,0.09)', border:'1px solid rgba(16,185,129,0.22)', padding:'6px 12px', borderRadius:20, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.05em' },
  liveDot:    { width:7, height:7, borderRadius:'50%', background:'#10b981', animation:'pulseGlow 1.6s ease infinite' },
  statsGrid:  { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 },
  statCard:   { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', position:'relative', overflow:'hidden', cursor:'default' },
  statAccent: { position:'absolute', top:0, left:0, right:0, height:2, borderRadius:'14px 14px 0 0' },
  statGlow:   { position:'absolute', top:0, left:0, right:0, bottom:0, pointerEvents:'none' },
  statTop:    { display:'flex', alignItems:'center', gap:7, marginBottom:10 },
  statIcon:   { display:'flex', alignItems:'center', opacity:0.85, flexShrink:0 },
  statLabel:  { fontSize:10, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 },
  statValue:  { fontSize:26, fontWeight:800, fontFamily:"'Sora',sans-serif", lineHeight:1, letterSpacing:'-0.04em' },
  statSub:    { fontSize:11, color:C.textMuted, marginTop:5 },
  shimmer:    { background:'rgba(255,255,255,0.05)', animation:'pulseGlow 1.5s ease-in-out infinite', height:28 },
  loadingDot: { width:6, height:6, borderRadius:'50%', background:'#3b61f5', animation:'pulseGlow 1s ease infinite', flexShrink:0 },
  midRow:     { display:'grid', gridTemplateColumns:'1fr 260px', gap:16 },
  chartCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 20px' },
  quickCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 18px' },
  cardHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  cardTitleGroup: { display:'flex', alignItems:'center', gap:8 },
  cardTitleBar: { width:3, height:14, borderRadius:2, background:'linear-gradient(180deg,#3b61f5,#8b5cf6)', flexShrink:0 },
  cardTitle:  { fontSize:13, fontWeight:700, color:C.text, fontFamily:"'Sora',sans-serif" },
  cardLink:   { fontSize:12, color:C.brand, textDecoration:'none', opacity:0.8, fontWeight:600 },
  chartLabels:{ display:'flex', justifyContent:'space-between', marginTop:10 },
  chartLabel: { fontSize:10, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" },
  quickGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  quickBtn:   { display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--dev-card-bg)', border:`1px solid ${C.border}`, borderRadius:10, textDecoration:'none', cursor:'pointer' },
  quickIcon:  { display:'flex', alignItems:'center', flexShrink:0 },
  quickLabel: { fontSize:12, fontWeight:600, color:C.text, flex:1 },
  bottomRow:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  tableCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 20px', overflow:'hidden' },
  tableList:  { display:'flex', flexDirection:'column', gap:3 },
  tableRow:   { display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9, textDecoration:'none', transition:'background 150ms', cursor:'pointer' },
  tableRank:  { fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, minWidth:22, opacity:0.7 },
  tableName:  { flex:1, fontSize:12.5, fontWeight:600, color:C.text, fontFamily:"'JetBrains Mono',monospace" },
  tableBadge: { fontSize:10, color:C.textMuted, background:'var(--dev-card-bg)', padding:'2px 6px', borderRadius:4, fontFamily:"'JetBrains Mono',monospace" },
  tableMeta:  { fontSize:11, color:C.textMuted, minWidth:60, textAlign:'right', fontFamily:"'JetBrains Mono',monospace" },
  actCard:    { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 20px', overflow:'hidden' },
  actList:    { display:'flex', flexDirection:'column', gap:2 },
  actRow:     { display:'flex', alignItems:'center', gap:9, padding:'7px 8px', borderRadius:7, borderBottom:'1px solid var(--dev-divider)' },
  actType:    { fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em', padding:'2px 7px', borderRadius:4, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" },
  actMsg:     { flex:1, fontSize:11.5, color:C.textSec, fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  actMeta:    { fontSize:10.5, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace", maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flexShrink:0 },
  actTime:    { fontSize:10, color:C.textMuted, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" },
};
