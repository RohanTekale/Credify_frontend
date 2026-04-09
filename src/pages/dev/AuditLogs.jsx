import { useState, useEffect, useRef } from 'react';

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
const LEVEL_COLORS = { INFO: '#10b981', WARN: '#f59e0b', ERROR: '#ef4444', DEBUG: '#8b5cf6', SQL: '#3b61f5' };

function generateLog(i) {
  const types = [
    { level: 'SQL', msg: `SELECT * FROM users WHERE id = ${Math.floor(Math.random() * 100)}`, meta: `${Math.floor(Math.random() * 80 + 5)}ms` },
    { level: 'INFO', msg: `GET /api/users/profile 200 OK`, meta: 'user:42' },
    { level: 'SQL', msg: `UPDATE cards SET status='frozen' WHERE user_id = ${Math.floor(Math.random() * 50)}`, meta: `${Math.floor(Math.random() * 60)}ms` },
    { level: 'WARN', msg: `Rate limit approaching for IP 10.0.0.${Math.floor(Math.random() * 255)}`, meta: 'rate-limiter' },
    { level: 'INFO', msg: `POST /api/transactions/create_transaction/ 201`, meta: 'user:17' },
    { level: 'ERROR', msg: `Foreign key constraint failed on table "sessions"`, meta: 'db-error' },
    { level: 'DEBUG', msg: `JWT token decoded successfully for user:${Math.floor(Math.random() * 100)}`, meta: 'auth' },
    { level: 'INFO', msg: `KYC document uploaded by user:${Math.floor(Math.random() * 200)}`, meta: 'kyc' },
  ];
  const t = types[Math.floor(Math.random() * types.length)];
  return { id: Date.now() + i, ...t, time: new Date().toLocaleTimeString('en-US', { hour12: false }) };
}

function LogRow({ log, visible }) {
  const color = LEVEL_COLORS[log.level] || '#8b96b0';
  return (
    <div style={{ ...S.logRow, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-4px)', transition: 'opacity 200ms ease, transform 200ms ease' }}>
      <span style={S.logTime}>{log.time}</span>
      <span style={{ ...S.logLevel, color, background: `${color}15` }}>{log.level}</span>
      <span style={S.logMsg}>{log.msg}</span>
      <span style={S.logMeta}>{log.meta}</span>
    </div>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState(() => Array.from({ length: 20 }, (_, i) => generateLog(i)));
  const [level, setLevel] = useState('ALL');
  const [search, setSearch] = useState('');
  const [live, setLive] = useState(true);
  const [newIds, setNewIds] = useState(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const log = generateLog(Math.random());
      setLogs(l => [log, ...l.slice(0, 199)]);
      setNewIds(s => new Set([...s, log.id]));
      setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(log.id); return n; }), 500);
    }, 2000);
    return () => clearInterval(t);
  }, [live]);

  const filtered = logs.filter(l => {
    if (level !== 'ALL' && l.level !== level) return false;
    if (search && !l.msg.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = LEVELS.slice(1).reduce((acc, lvl) => {
    acc[lvl] = logs.filter(l => l.level === lvl).length;
    return acc;
  }, {});

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>Audit Logs</h2>
          <p style={S.subtitle}>Real-time system events · Last 200 entries in memory</p>
        </div>
        <div style={S.liveToggle}>
          <button
            style={{ ...S.liveBtn, ...(live ? S.liveBtnOn : S.liveBtnOff) }}
            onClick={() => setLive(l => !l)}
          >
            <span style={{ ...S.liveDot, background: live ? '#10b981' : C.textMuted }} />
            {live ? 'Live' : 'Paused'}
          </button>
          <button style={S.clearBtn} onClick={() => setLogs([])}>Clear</button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={S.statsRow}>
        {LEVELS.slice(1).map(lvl => (
          <div key={lvl} style={S.statChip}>
            <span style={{ color: LEVEL_COLORS[lvl], fontWeight: 700 }}>{counts[lvl] || 0}</span>
            <span style={{ color: C.textMuted }}>{lvl}</span>
          </div>
        ))}
        <div style={{ ...S.statChip, marginLeft: 'auto' }}>
          <span style={{ color: C.text, fontWeight: 700 }}>{logs.length}</span>
          <span style={{ color: C.textMuted }}>TOTAL</span>
        </div>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <div style={S.levelBtns}>
          {LEVELS.map(l => (
            <button
              key={l}
              style={{ ...S.lvlBtn, ...(level === l ? { background: `${LEVEL_COLORS[l] || C.brand}20`, color: LEVEL_COLORS[l] || C.brand, borderColor: `${LEVEL_COLORS[l] || C.brand}40` } : {}) }}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={S.searchWrap}>
          <svg style={S.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input style={S.searchInput} placeholder="Filter messages..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Log stream */}
      <div style={S.logBox}>
        <div style={S.logHeader}>
          <span style={S.logCol}>TIME</span>
          <span style={S.logCol}>LEVEL</span>
          <span style={{ ...S.logCol, flex: 1 }}>MESSAGE</span>
          <span style={S.logCol}>META</span>
        </div>
        <div style={S.logStream}>
          {filtered.length === 0 ? (
            <div style={S.emptyMsg}>No logs match current filters</div>
          ) : (
            filtered.map(log => (
              <LogRow key={log.id} log={log} visible={true} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const C = {
  bgCard: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSecondary: '#8b96b0', textMuted: '#4b5675',
};

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: C.textSecondary },
  liveToggle: { display: 'flex', gap: 8, alignItems: 'center' },
  liveBtn: { display: 'flex', alignItems: 'center', gap: 6, border: '1px solid', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms', fontFamily: "'DM Sans',sans-serif" },
  liveBtnOn: { background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' },
  liveBtnOff: { background: C.bgCard, color: C.textMuted, borderColor: C.border },
  liveDot: { width: 7, height: 7, borderRadius: '50%' },
  clearBtn: { background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, padding: '7px 12px', fontSize: 12, cursor: 'pointer' },
  statsRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  statChip: { display: 'flex', gap: 5, alignItems: 'center', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 },
  filters: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  levelBtns: { display: 'flex', gap: 4 },
  lvlBtn: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, letterSpacing: '0.04em', transition: 'all 150ms' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 10, color: C.textMuted, pointerEvents: 'none' },
  searchInput: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, padding: '7px 12px 7px 30px', outline: 'none', width: 220, fontFamily: "'DM Sans',sans-serif" },
  logBox: { flex: 1, background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  logHeader: { display: 'flex', gap: 12, padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.03)' },
  logCol: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, width: 80, flexShrink: 0, fontFamily: "'DM Sans',sans-serif" },
  logStream: { flex: 1, overflowY: 'auto', maxHeight: 500, display: 'flex', flexDirection: 'column' },
  logRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '7px 16px', borderBottom: `1px solid rgba(255,255,255,0.03)` },
  logTime: { fontSize: 11, color: C.textMuted, width: 80, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" },
  logLevel: { fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', padding: '2px 6px', borderRadius: 4, width: 68, textAlign: 'center', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" },
  logMsg: { flex: 1, fontSize: 12, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logMeta: { fontSize: 11, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 },
  emptyMsg: { padding: '40px 0', textAlign: 'center', color: C.textMuted, fontSize: 13 },
};
