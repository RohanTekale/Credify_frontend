import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { devAPI } from '../../services/dev.service';

// Mock data for demo — replaced by real API
const MOCK_TABLES = [
  { name: 'users', rows: 1240, size: '4.2 MB', columns: 18, lastWrite: '2m ago', engine: 'heap' },
  { name: 'cards', rows: 987, size: '2.1 MB', columns: 14, lastWrite: '5m ago', engine: 'heap' },
  { name: 'transactions', rows: 34201, size: '88 MB', columns: 22, lastWrite: '30s ago', engine: 'heap' },
  { name: 'sessions', rows: 5401, size: '12 MB', columns: 8, lastWrite: '1m ago', engine: 'heap' },
  { name: 'kyc_documents', rows: 890, size: '420 MB', columns: 11, lastWrite: '10m ago', engine: 'heap' },
  { name: 'subscriptions', rows: 310, size: '1.1 MB', columns: 16, lastWrite: '3h ago', engine: 'heap' },
  { name: 'notifications', rows: 18200, size: '34 MB', columns: 10, lastWrite: '20s ago', engine: 'heap' },
  { name: 'audit_logs', rows: 92400, size: '210 MB', columns: 12, lastWrite: '5s ago', engine: 'heap' },
  { name: 'auth_tokens', rows: 3100, size: '3.9 MB', columns: 7, lastWrite: '1m ago', engine: 'heap' },
  { name: 'plans', rows: 5, size: '16 KB', columns: 9, lastWrite: '2d ago', engine: 'heap' },
  { name: 'reactivation_requests', rows: 48, size: '88 KB', columns: 13, lastWrite: '6h ago', engine: 'heap' },
  { name: 'django_migrations', rows: 34, size: '40 KB', columns: 5, lastWrite: '2d ago', engine: 'heap' },
];

function TableCard({ table, index }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 40); return () => clearTimeout(t); }, [index]);

  const sizeNum = parseFloat(table.size);
  const sizeUnit = table.size.replace(/[\d.]/g, '').trim();
  const heat = table.rows > 10000 ? '#ef4444' : table.rows > 1000 ? '#f59e0b' : '#10b981';

  return (
    <Link
      to={`/dev/tables/${table.name}`}
      style={{
        ...S.card,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: `opacity 350ms ease, transform 350ms ease, border-color 200ms, box-shadow 200ms`,
        borderColor: hovered ? 'rgba(59,97,245,0.3)' : 'rgba(255,255,255,0.07)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,97,245,0.15)' : '0 4px 24px rgba(0,0,0,0.2)',
        textDecoration: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div style={{ ...S.cardAccent, background: heat }} />

      {/* Header */}
      <div style={S.cardHead}>
        <div style={S.tableIconWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={heat} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v2H3V5z"/><path d="M3 9h18M3 13h18M5 21h14a2 2 0 002-2v-2H3v2a2 2 0 002 2z"/>
          </svg>
        </div>
        <span style={S.tableName}>{table.name}</span>
        <span style={{ ...S.heatBadge, color: heat, background: `${heat}18` }}>
          {table.rows > 10000 ? 'HOT' : table.rows > 1000 ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      {/* Metrics */}
      <div style={S.metricsRow}>
        <div style={S.metric}>
          <span style={S.metricVal}>{table.rows.toLocaleString()}</span>
          <span style={S.metricLabel}>rows</span>
        </div>
        <div style={S.metricDiv} />
        <div style={S.metric}>
          <span style={S.metricVal}>{table.columns}</span>
          <span style={S.metricLabel}>cols</span>
        </div>
        <div style={S.metricDiv} />
        <div style={S.metric}>
          <span style={S.metricVal}>{table.size}</span>
          <span style={S.metricLabel}>size</span>
        </div>
      </div>

      {/* Row bar */}
      <div style={S.barTrack}>
        <div style={{
          ...S.barFill,
          width: `${Math.min(100, (table.rows / 100000) * 100)}%`,
          background: heat,
          transition: `width 800ms cubic-bezier(0.16,1,0.3,1) ${index * 60}ms`,
        }} />
      </div>

      {/* Footer */}
      <div style={S.cardFoot}>
        <span style={S.footLabel}>Last write: {table.lastWrite}</span>
        <span style={S.footAction}>Browse →</span>
      </div>
    </Link>
  );
}

export default function TablesPage() {
  const [tables, setTables] = useState(MOCK_TABLES);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rows');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    devAPI.getTables()
      .then(r => setTables(r.data?.tables || MOCK_TABLES))
      .catch(() => setTables(MOCK_TABLES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tables
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'rows' ? b.rows - a.rows : sort === 'name' ? a.name.localeCompare(b.name) : 0);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.pageHead}>
        <div>
          <h2 style={S.title}>Database Tables</h2>
          <p style={S.subtitle}>{tables.length} tables · PostgreSQL</p>
        </div>
        <div style={S.controls}>
          {/* Search */}
          <div style={S.searchWrap}>
            <svg style={S.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={S.searchInput}
              placeholder="Search tables..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Sort */}
          <select style={S.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="rows">Sort: Rows</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={S.loading}>
          <span style={S.spinner} />
          <span style={S.loadingText}>Fetching tables...</span>
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map((t, i) => <TableCard key={t.name} table={t} index={i} />)}
          {filtered.length === 0 && (
            <div style={S.empty}>No tables match "{search}"</div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const C = {
  bg: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSecondary: '#8b96b0', textMuted: '#4b5675',
};

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  pageHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: C.textSecondary },
  controls: { display: 'flex', gap: 10, alignItems: 'center' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 10, color: C.textMuted, pointerEvents: 'none' },
  searchInput: {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, fontSize: 13, padding: '8px 12px 8px 32px', outline: 'none', width: 200,
    fontFamily: "'DM Sans',sans-serif",
  },
  sortSelect: {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.textSecondary, fontSize: 12, padding: '8px 12px', outline: 'none', cursor: 'pointer',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  card: {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '16px', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12,
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '12px 12px 0 0' },
  cardHead: { display: 'flex', alignItems: 'center', gap: 8 },
  tableIconWrap: {
    width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tableName: { flex: 1, fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  heatBadge: { fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4, flexShrink: 0 },
  metricsRow: { display: 'flex', alignItems: 'center', gap: 0 },
  metric: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  metricVal: { fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif" },
  metricLabel: { fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' },
  metricDiv: { width: 1, height: 28, background: 'rgba(255,255,255,0.07)' },
  barTrack: { height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, width: 0 },
  cardFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  footLabel: { fontSize: 11, color: C.textMuted },
  footAction: { fontSize: 12, color: C.brand, fontWeight: 600 },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  spinner: { width: 28, height: 28, borderRadius: '50%', border: `2px solid rgba(59,97,245,0.2)`, borderTopColor: '#3b61f5', animation: 'spin 700ms linear infinite', display: 'inline-block' },
  loadingText: { fontSize: 13, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 13 },
};
