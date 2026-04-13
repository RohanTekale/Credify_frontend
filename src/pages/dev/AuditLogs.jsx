// src/pages/dev/AuditLogs.jsx — Real API data + improved UI
import { useState, useEffect, useRef, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG', 'SQL'];
const LEVEL_COLORS = {
  INFO:  '#10b981',
  WARN:  '#f59e0b',
  ERROR: '#ef4444',
  DEBUG: '#8b5cf6',
  SQL:   '#3b61f5',
};

function LogRow({ log, isNew }) {
  const color = LEVEL_COLORS[log.level] || '#8b96b0';
  return (
    <div style={{
      ...S.logRow,
      background: isNew ? 'rgba(59,97,245,0.06)' : 'transparent',
      transition: 'background 600ms ease',
    }}>
      <span style={S.logTime}>{log.time}</span>
      <span style={{ ...S.logLevel, color, background: `${color}15`, border: `1px solid ${color}30` }}>
        {log.level}
      </span>
      <span style={S.logMsg} title={log.msg}>{log.msg}</span>
      {log.user && <span style={S.logUser} title={log.user}>{log.user.split('@')[0]}</span>}
      <span style={S.logMeta}>{log.meta}</span>
    </div>
  );
}

function CountChip({ level, count, active, onClick }) {
  const color = LEVEL_COLORS[level] || '#8b96b0';
  return (
    <button
      onClick={onClick}
      style={{
        ...S.countChip,
        borderColor: active ? `${color}50` : 'rgba(255,255,255,0.07)',
        background: active ? `${color}15` : 'rgba(255,255,255,0.032)',
        color: active ? color : '#4b5675',
      }}
    >
      <span style={{ fontWeight: 800, color: active ? color : '#8b96b0' }}>{count}</span>
      <span>{level}</span>
    </button>
  );
}

export default function AuditLogs() {
  const [logs,      setLogs]      = useState([]);
  const [counts,    setCounts]    = useState({});
  const [total,     setTotal]     = useState(0);
  const [level,     setLevel]     = useState('ALL');
  const [search,    setSearch]    = useState('');
  const [live,      setLive]      = useState(true);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [newIds,    setNewIds]    = useState(new Set());
  const lastIdRef  = useRef(null);

  const fetchLogs = useCallback((isPolling = false) => {
    if (!isPolling) setLoading(true);
    devAPI.getLogs()
      .then(res => {
        const data = res?.data || {};
        const fetchedLogs = data.logs || [];
        setLogs(fetchedLogs);
        setCounts(data.counts || {});
        setTotal(fetchedLogs.length);
        setError(null);

        // Detect new entries (for highlight)
        if (isPolling && lastIdRef.current !== null) {
          const newEntries = fetchedLogs.filter(l => l.id > lastIdRef.current);
          if (newEntries.length > 0) {
            const newSet = new Set(newEntries.map(l => l.id));
            setNewIds(newSet);
            setTimeout(() => setNewIds(new Set()), 1500);
          }
        }
        if (fetchedLogs.length > 0) {
          lastIdRef.current = Math.max(...fetchedLogs.map(l => l.id));
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch logs');
      })
      .finally(() => { if (!isPolling) setLoading(false); });
  }, []);

  // Initial fetch
  useEffect(() => { fetchLogs(false); }, [fetchLogs]);

  // Live polling every 5s
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(t);
  }, [live, fetchLogs]);

  const filtered = logs.filter(l => {
    if (level !== 'ALL' && l.level !== level) return false;
    if (search && !l.msg.toLowerCase().includes(search.toLowerCase()) &&
        !(l.meta || '').toLowerCase().includes(search.toLowerCase()) &&
        !(l.user || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const levelCounts = { ...counts };
  // Also count SQL from logs directly if not in counts
  LEVELS.slice(1).forEach(lvl => {
    if (levelCounts[lvl] === undefined) {
      levelCounts[lvl] = logs.filter(l => l.level === lvl).length;
    }
  });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>Audit Logs</h2>
          <p style={S.subtitle}>Real-time system events · {total} entries from database</p>
        </div>
        <div style={S.headerActions}>
          <button
            style={{ ...S.liveBtn, ...(live ? S.liveBtnOn : S.liveBtnOff) }}
            onClick={() => setLive(l => !l)}
          >
            <span style={{ ...S.liveDot, background: live ? '#10b981' : '#4b5675' }} />
            {live ? 'Live' : 'Paused'}
          </button>
          <button style={S.refreshBtn} onClick={() => fetchLogs(false)} title="Refresh">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button style={S.clearBtn} onClick={() => setLogs([])}>Clear</button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={S.errorBanner}>
          <span style={{ color: '#ef4444' }}>⚠</span>
          <span>{error}</span>
          <button style={S.retryBtn} onClick={() => fetchLogs(false)}>Retry</button>
        </div>
      )}

      {/* Count chips */}
      <div style={S.statsRow}>
        {LEVELS.slice(1).map(lvl => (
          <CountChip
            key={lvl}
            level={lvl}
            count={levelCounts[lvl] || 0}
            active={level === lvl}
            onClick={() => setLevel(level === lvl ? 'ALL' : lvl)}
          />
        ))}
        <div style={{ ...S.countChip, marginLeft: 'auto', cursor: 'default' }}>
          <span style={{ fontWeight: 800, color: '#f0f4ff' }}>{filtered.length}</span>
          <span style={{ color: '#4b5675' }}>SHOWN</span>
        </div>
        <div style={{ ...S.countChip, cursor: 'default' }}>
          <span style={{ fontWeight: 800, color: '#8b96b0' }}>{total}</span>
          <span style={{ color: '#4b5675' }}>TOTAL</span>
        </div>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <div style={S.levelBtns}>
          {['ALL', ...LEVELS.slice(1)].map(l => (
            <button
              key={l}
              style={{
                ...S.lvlBtn,
                ...(level === l ? {
                  background: `${LEVEL_COLORS[l] || '#3b61f5'}20`,
                  color: LEVEL_COLORS[l] || '#3b61f5',
                  borderColor: `${LEVEL_COLORS[l] || '#3b61f5'}40`,
                } : {}),
              }}
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
          <input
            style={S.searchInput}
            placeholder="Filter by message, user, meta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={S.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Log stream */}
      <div style={S.logBox}>
        <div style={S.logHeader}>
          <span style={{ ...S.logCol, width: 74 }}>TIME</span>
          <span style={{ ...S.logCol, width: 74 }}>LEVEL</span>
          <span style={{ ...S.logCol, flex: 1 }}>MESSAGE</span>
          <span style={{ ...S.logCol, width: 90 }}>USER</span>
          <span style={{ ...S.logCol, width: 100 }}>META</span>
        </div>
        <div style={S.logStream}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ ...S.logRow, background: 'transparent' }}>
                  <div style={{ width: 74, height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                  <div style={{ width: 60, height: 18, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                  <div style={{ flex: 1, height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 4, maxWidth: 340 }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}>◎</div>
              <div style={S.emptyText}>No logs match current filters</div>
              {level !== 'ALL' && (
                <button style={S.emptyReset} onClick={() => { setLevel('ALL'); setSearch(''); }}>
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            filtered.map(log => (
              <LogRow key={log.id} log={log} isNew={newIds.has(log.id)} />
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes pulseGlow{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

const C = {
  bgCard:'rgba(255,255,255,0.032)', border:'rgba(255,255,255,0.07)',
  brand:'#3b61f5', text:'#f0f4ff', textSec:'#8b96b0', textMuted:'#4b5675',
};

const S = {
  page:        { display:'flex', flexDirection:'column', gap:16 },
  header:      { display:'flex', alignItems:'flex-start', justifyContent:'space-between' },
  title:       { margin:0, fontSize:22, fontWeight:800, color:C.text, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.03em' },
  subtitle:    { margin:'5px 0 0', fontSize:13, color:C.textSec },
  headerActions:{ display:'flex', gap:8, alignItems:'center' },
  liveBtn:     { display:'flex', alignItems:'center', gap:6, border:'1px solid', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 150ms', fontFamily:"'DM Sans',sans-serif" },
  liveBtnOn:   { background:'rgba(16,185,129,0.1)', color:'#10b981', borderColor:'rgba(16,185,129,0.3)' },
  liveBtnOff:  { background:C.bgCard, color:C.textMuted, borderColor:C.border },
  liveDot:     { width:7, height:7, borderRadius:'50%' },
  refreshBtn:  { display:'flex', alignItems:'center', justifyContent:'center', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, color:C.textMuted, padding:'7px 10px', cursor:'pointer', transition:'all 150ms' },
  clearBtn:    { background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color:C.textMuted, padding:'7px 12px', fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  errorBanner: { display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#fca5a5' },
  retryBtn:    { marginLeft:'auto', background:'rgba(239,68,68,0.15)', border:'none', borderRadius:6, color:'#ef4444', padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  statsRow:    { display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' },
  countChip:   { display:'flex', gap:5, alignItems:'center', border:'1px solid', borderRadius:8, padding:'5px 12px', fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, cursor:'pointer', transition:'all 150ms', background:'rgba(255,255,255,0.032)', borderColor:'rgba(255,255,255,0.07)', color:'#4b5675' },
  filters:     { display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' },
  levelBtns:   { display:'flex', gap:4 },
  lvlBtn:      { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:6, color:C.textMuted, padding:'5px 10px', fontSize:11, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", fontWeight:600, letterSpacing:'0.04em', transition:'all 150ms' },
  searchWrap:  { position:'relative', display:'flex', alignItems:'center', flex:1, maxWidth:300 },
  searchIcon:  { position:'absolute', left:10, color:C.textMuted, pointerEvents:'none' },
  searchInput: { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, padding:'7px 32px 7px 30px', outline:'none', width:'100%', fontFamily:"'DM Sans',sans-serif" },
  clearSearch: { position:'absolute', right:8, background:'transparent', border:'none', color:C.textMuted, cursor:'pointer', fontSize:11, padding:2 },
  logBox:      { flex:1, background:'rgba(0,0,0,0.35)', border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column' },
  logHeader:   { display:'flex', gap:12, padding:'9px 16px', borderBottom:`1px solid ${C.border}`, background:'rgba(255,255,255,0.025)' },
  logCol:      { fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:C.textMuted, flexShrink:0, fontFamily:"'DM Sans',sans-serif" },
  logStream:   { flex:1, overflowY:'auto', maxHeight:500, display:'flex', flexDirection:'column' },
  logRow:      { display:'flex', alignItems:'center', gap:12, padding:'7px 16px', borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background 600ms ease' },
  logTime:     { fontSize:11, color:C.textMuted, width:74, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" },
  logLevel:    { fontSize:9, fontWeight:800, letterSpacing:'0.06em', padding:'2px 6px', borderRadius:4, width:62, textAlign:'center', flexShrink:0, fontFamily:"'JetBrains Mono',monospace", border:'1px solid transparent' },
  logMsg:      { flex:1, fontSize:12, color:C.textSec, fontFamily:"'JetBrains Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  logUser:     { fontSize:10.5, color:'#3b61f5', fontFamily:"'JetBrains Mono',monospace", flexShrink:0, width:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', opacity:0.8 },
  logMeta:     { fontSize:11, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace", flexShrink:0, width:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' },
  emptyState:  { padding:'60px 0', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 },
  emptyIcon:   { fontSize:32, color:C.textMuted, opacity:0.4 },
  emptyText:   { fontSize:13, color:C.textMuted },
  emptyReset:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:6, color:C.textSec, padding:'6px 16px', fontSize:12, cursor:'pointer', marginTop:4 },
};
