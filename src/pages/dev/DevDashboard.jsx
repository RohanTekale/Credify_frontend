import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { devAPI } from '../../services/dev.service';

const MOCK_STATS = {
  tables: 12,
  totalRows: 48320,
  queryCount: 234,
  dbSize: '186 MB',
  uptime: '99.98%',
  slowQueries: 3,
};

const MOCK_ACTIVITY = [
  { type: 'query', msg: 'SELECT * FROM users WHERE is_active = true', time: '2m ago', status: 'ok' },
  { type: 'delete', msg: 'DELETE FROM sessions WHERE expired = true', time: '8m ago', status: 'ok' },
  { type: 'query', msg: 'SELECT COUNT(*) FROM transactions GROUP BY status', time: '15m ago', status: 'ok' },
  { type: 'error', msg: 'DROP TABLE users — BLOCKED by safety filter', time: '1h ago', status: 'err' },
  { type: 'update', msg: 'UPDATE cards SET status = "frozen" WHERE user_id = 42', time: '2h ago', status: 'ok' },
];

const MOCK_TABLES = [
  { name: 'users', rows: 1240, size: '4.2 MB', lastWrite: '2m ago' },
  { name: 'cards', rows: 987, size: '2.1 MB', lastWrite: '5m ago' },
  { name: 'transactions', rows: 34201, size: '88 MB', lastWrite: '30s ago' },
  { name: 'sessions', rows: 5401, size: '12 MB', lastWrite: '1m ago' },
  { name: 'kyc_documents', rows: 890, size: '420 MB', lastWrite: '10m ago' },
];

function StatCard({ label, value, sub, accent, icon, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay || 0); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{ ...S.statCard, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 400ms ease, transform 400ms ease' }}>
      <div style={{ ...S.statAccent, background: accent }} />
      <div style={S.statTop}>
        <span style={S.statIcon}>{icon}</span>
        <span style={S.statLabel}>{label}</span>
      </div>
      <div style={{ ...S.statValue, color: accent }}>{value}</div>
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100}%`,
          background: color,
          borderRadius: '2px 2px 0 0',
          opacity: 0.3 + (i / data.length) * 0.7,
          transition: 'height 600ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      ))}
    </div>
  );
}

function ActivityRow({ item, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay || 0); return () => clearTimeout(t); }, [delay]);

  const typeColors = { query: '#3b61f5', delete: '#ef4444', update: '#f59e0b', error: '#ef4444' };
  const typeBg = { query: 'rgba(59,97,245,0.12)', delete: 'rgba(239,68,68,0.12)', update: 'rgba(245,158,11,0.12)', error: 'rgba(239,68,68,0.12)' };

  return (
    <div style={{ ...S.actRow, opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-8px)', transition: 'opacity 300ms ease, transform 300ms ease' }}>
      <span style={{ ...S.actType, color: typeColors[item.type], background: typeBg[item.type] }}>{item.type}</span>
      <span style={S.actMsg}>{item.msg}</span>
      <span style={S.actTime}>{item.time}</span>
      <span style={{ ...S.actStatus, background: item.status === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: item.status === 'ok' ? '#10b981' : '#ef4444' }}>
        {item.status === 'ok' ? '✓' : '✕'}
      </span>
    </div>
  );
}

export default function DevDashboard() {
  const [stats] = useState(MOCK_STATS);
  const [queryVol] = useState([12, 18, 9, 24, 31, 28, 19, 42, 38, 22, 29, 45]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.title}>System Overview</h1>
          <p style={S.subtitle}>Real-time database and API health · Auto-refreshing</p>
        </div>
        <div style={S.liveChip}>
          <span style={S.liveDot} />
          LIVE · {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stat cards */}
      <div style={S.statsGrid}>
        <StatCard label="Total Tables" value={stats.tables} sub="PostgreSQL" accent="#3b61f5" delay={0} icon="⬡" />
        <StatCard label="Total Rows" value={stats.totalRows.toLocaleString()} sub="across all tables" accent="#8b5cf6" delay={80} icon="≡" />
        <StatCard label="Queries Run" value={stats.queryCount} sub="this session" accent="#10b981" delay={160} icon="▶" />
        <StatCard label="DB Size" value={stats.dbSize} sub="on disk" accent="#f59e0b" delay={240} icon="◈" />
        <StatCard label="Uptime" value={stats.uptime} sub="30d avg" accent="#10b981" delay={320} icon="◎" />
        <StatCard label="Slow Queries" value={stats.slowQueries} sub="> 500ms" accent="#ef4444" delay={400} icon="⚠" />
      </div>

      {/* Row: query volume + quick links */}
      <div style={S.midRow}>
        {/* Query volume chart */}
        <div style={S.chartCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Query Volume</span>
            <span style={S.cardMeta}>Last 12 intervals</span>
          </div>
          <MiniBarChart data={queryVol} color="#3b61f5" />
          <div style={S.chartLabels}>
            {['12h', '10h', '8h', '6h', '4h', '2h', 'now'].map(l => (
              <span key={l} style={S.chartLabel}>{l}</span>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={S.quickCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Quick Actions</span>
          </div>
          <div style={S.quickGrid}>
            {[
              { to: '/dev/tables', label: 'Browse Tables', icon: '⬡', color: '#3b61f5' },
              { to: '/dev/query', label: 'Run SQL', icon: '▶', color: '#10b981' },
              { to: '/dev/api', label: 'Debug API', icon: '◎', color: '#8b5cf6' },
              { to: '/dev/logs', label: 'View Logs', icon: '≡', color: '#f59e0b' },
            ].map(q => (
              <Link key={q.to} to={q.to} style={{ ...S.quickBtn, borderColor: `${q.color}30` }}>
                <span style={{ ...S.quickBtnIcon, color: q.color }}>{q.icon}</span>
                <span style={S.quickBtnLabel}>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row: tables + activity */}
      <div style={S.bottomRow}>
        {/* Table list */}
        <div style={S.tableCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Hot Tables</span>
            <Link to="/dev/tables" style={S.cardLink}>View all →</Link>
          </div>
          <div style={S.tableList}>
            {MOCK_TABLES.map((t, i) => (
              <Link key={t.name} to={`/dev/tables/${t.name}`} style={S.tableRow}>
                <span style={S.tableIcon}>⬡</span>
                <span style={S.tableName}>{t.name}</span>
                <span style={S.tableMeta}>{t.rows.toLocaleString()} rows</span>
                <span style={S.tableMeta}>{t.size}</span>
                <span style={S.tableTime}>{t.lastWrite}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={S.actCard}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Audit Trail</span>
            <Link to="/dev/logs" style={S.cardLink}>Full logs →</Link>
          </div>
          <div style={S.actList}>
            {MOCK_ACTIVITY.map((a, i) => (
              <ActivityRow key={i} item={a} delay={i * 60} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const C = {
  bg: '#080c14', bgCard: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSecondary: '#8b96b0', textMuted: '#4b5675',
};

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%' },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: C.textSecondary },
  liveChip: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10b981',
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
    padding: '5px 10px', borderRadius: 20, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.04em',
  },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulseGlow 1.5s ease infinite' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 },
  statCard: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px',
    position: 'relative', overflow: 'hidden', cursor: 'default',
    transition: 'border-color 200ms, transform 200ms',
  },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '12px 12px 0 0' },
  statTop: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 },
  statIcon: { fontSize: 13, opacity: 0.5 },
  statLabel: { fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 },
  statValue: { fontSize: 26, fontWeight: 800, fontFamily: "'Sora',sans-serif", lineHeight: 1, letterSpacing: '-0.03em' },
  statSub: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  midRow: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 },
  chartCard: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' },
  quickCard: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif" },
  cardMeta: { fontSize: 11, color: C.textMuted },
  cardLink: { fontSize: 12, color: C.brand, textDecoration: 'none', opacity: 0.8 },
  chartLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 6 },
  chartLabel: { fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  quickBtn: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: 8,
    textDecoration: 'none', transition: 'background 150ms, transform 150ms', cursor: 'pointer',
  },
  quickBtnIcon: { fontSize: 16, lineHeight: 1 },
  quickBtnLabel: { fontSize: 12, fontWeight: 600, color: C.text },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  tableCard: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', overflow: 'hidden' },
  tableList: { display: 'flex', flexDirection: 'column', gap: 2 },
  tableRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7,
    textDecoration: 'none', transition: 'background 150ms', cursor: 'pointer',
    background: 'transparent',
  },
  tableIcon: { fontSize: 12, color: C.brand, opacity: 0.7 },
  tableName: { flex: 1, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono',monospace" },
  tableMeta: { fontSize: 11, color: C.textMuted, minWidth: 60, textAlign: 'right' },
  tableTime: { fontSize: 11, color: C.textMuted, minWidth: 50, textAlign: 'right' },
  actCard: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', overflow: 'hidden' },
  actList: { display: 'flex', flexDirection: 'column', gap: 6 },
  actRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` },
  actType: {
    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '2px 6px', borderRadius: 4, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace",
  },
  actMsg: { flex: 1, fontSize: 11, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  actTime: { fontSize: 10, color: C.textMuted, flexShrink: 0 },
  actStatus: { fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0 },
};
