import { useState, useRef, useEffect } from 'react';
import { devAPI } from '../../services/dev.service';

const SAMPLE_QUERIES = [
  { label: 'All users', sql: 'SELECT id, email, full_name, is_active\nFROM users\nORDER BY created_at DESC\nLIMIT 50;' },
  { label: 'Active cards', sql: 'SELECT c.id, c.card_number, u.email\nFROM cards c\nJOIN users u ON u.id = c.user_id\nWHERE c.status = \'active\'\nORDER BY c.created_at DESC;' },
  { label: 'Txn stats', sql: 'SELECT status, COUNT(*) as count, SUM(amount) as total\nFROM transactions\nGROUP BY status\nORDER BY total DESC;' },
  { label: 'Recent errors', sql: 'SELECT * FROM audit_logs\nWHERE level = \'ERROR\'\nORDER BY created_at DESC\nLIMIT 20;' },
];

const BLOCKED = ['drop', 'truncate', 'alter', 'create table', 'pg_dump'];

function isSafe(q) {
  const lower = q.toLowerCase();
  return !BLOCKED.some(b => lower.includes(b));
}

function highlightSQL(sql) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'AS', 'DISTINCT', 'HAVING', 'ASC', 'DESC', 'RETURNING'];
  let result = sql;
  // We keep it simple for textarea overlay
  return result;
}

function ResultsTable({ rows, columns, execTime }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = sortCol
    ? [...rows].sort((a, b) => {
        const va = a[sortCol], vb = b[sortCol];
        if (va === null) return 1; if (vb === null) return -1;
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : rows;

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const exportCSV = () => {
    const header = columns.join(',');
    const body = rows.map(r => columns.map(c => JSON.stringify(r[c] ?? '')).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'query_result.csv'; a.click();
  };

  return (
    <div style={S.resultsBox}>
      <div style={S.resultsHead}>
        <div style={S.resultsMeta}>
          <span style={S.metaBadge}>{rows.length} rows</span>
          <span style={S.metaBadge}>{columns.length} cols</span>
          {execTime && <span style={{ ...S.metaBadge, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>⚡ {execTime}ms</span>}
        </div>
        <button style={S.exportBtn} onClick={exportCSV}>↓ Export CSV</button>
      </div>
      <div style={S.tableScroll}>
        <table style={S.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={S.th} onClick={() => handleSort(col)}>
                  <span style={S.thInner}>
                    {col}
                    {sortCol === col && <span style={{ color: '#3b61f5' }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, ri) => (
              <tr key={ri} style={S.tr}>
                {columns.map(col => (
                  <td key={col} style={S.td}>
                    {row[col] === null
                      ? <em style={{ color: C.textMuted, fontStyle: 'italic', fontSize: 11 }}>NULL</em>
                      : typeof row[col] === 'boolean'
                        ? <span style={{ color: row[col] ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: 700 }}>{String(row[col])}</span>
                        : <span style={S.cellVal}>{String(row[col])}</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function QueryRunner() {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0].sql);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table | json
  const textareaRef = useRef(null);

  const runQuery = async () => {
    if (!query.trim()) return;
    if (!isSafe(query)) {
      setError('🛡 Query blocked: Destructive operations (DROP, TRUNCATE, ALTER) are disabled in this panel.');
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    const t0 = Date.now();
    try {
      const res = await devAPI.runQuery(query);
      const rows = res.data?.rows || [];
      const cols = res.data?.columns || (rows.length ? Object.keys(rows[0]) : []);
      setResult({ rows, columns: cols, execTime: Date.now() - t0 });
      setHistory(h => [{ sql: query, time: new Date().toLocaleTimeString(), rowCount: rows.length }, ...h.slice(0, 19)]);
    } catch (e) {
      // Demo mock
      const mock = getMockResult(query);
      if (mock) {
        setResult({ ...mock, execTime: Date.now() - t0 });
      } else {
        setError(e.message || 'Query failed');
      }
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = query.substring(0, start) + '  ' + query.substring(end);
      setQuery(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>SQL Query Runner</h2>
          <p style={S.subtitle}>Execute queries against PostgreSQL · <kbd style={S.kbd}>Ctrl+Enter</kbd> to run</p>
        </div>
        <button style={S.histBtn} onClick={() => setShowHistory(h => !h)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          History {history.length > 0 && `(${history.length})`}
        </button>
      </div>

      <div style={S.body}>
        {/* Editor pane */}
        <div style={S.editorPane}>
          {/* Sample queries */}
          <div style={S.sampleRow}>
            {SAMPLE_QUERIES.map(q => (
              <button key={q.label} style={S.sampleBtn} onClick={() => setQuery(q.sql)}>
                {q.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div style={S.editorWrap}>
            <div style={S.lineNums}>
              {query.split('\n').map((_, i) => (
                <span key={i} style={S.lineNum}>{i + 1}</span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              style={S.editor}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="SELECT * FROM users LIMIT 10;"
            />
          </div>

          {/* Run bar */}
          <div style={S.runBar}>
            <div style={S.safetyChip}>
              <span style={{ color: isSafe(query) ? '#10b981' : '#ef4444' }}>
                {isSafe(query) ? '✓ Safe' : '⚠ Blocked operation detected'}
              </span>
            </div>
            <button
              style={{ ...S.runBtn, opacity: running ? 0.6 : 1 }}
              onClick={runQuery}
              disabled={running}
            >
              {running ? (
                <span style={S.miniSpinner} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
              {running ? 'Running...' : 'Run Query'}
            </button>
          </div>
        </div>

        {/* History pane */}
        {showHistory && (
          <div style={S.historyPane}>
            <div style={S.histHead}>
              <span style={S.histTitle}>Query History</span>
              <button style={S.clearBtn} onClick={() => setHistory([])}>Clear</button>
            </div>
            {history.length === 0 ? (
              <p style={S.histEmpty}>No queries yet</p>
            ) : (
              <div style={S.histList}>
                {history.map((h, i) => (
                  <div key={i} style={S.histItem} onClick={() => setQuery(h.sql)}>
                    <span style={S.histTime}>{h.time}</span>
                    <span style={S.histSql}>{h.sql.replace(/\s+/g, ' ').slice(0, 80)}{h.sql.length > 80 ? '…' : ''}</span>
                    <span style={S.histRows}>{h.rowCount} rows</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {error && (
        <div style={S.errorBox}>
          <span style={S.errorIcon}>✕</span>
          <span style={S.errorMsg}>{error}</span>
        </div>
      )}

      {result && (
        <div style={S.resultsSection}>
          <div style={S.viewToggle}>
            <button style={{ ...S.viewBtn, ...(viewMode === 'table' ? S.viewBtnActive : {}) }} onClick={() => setViewMode('table')}>Table</button>
            <button style={{ ...S.viewBtn, ...(viewMode === 'json' ? S.viewBtnActive : {}) }} onClick={() => setViewMode('json')}>JSON</button>
          </div>

          {viewMode === 'table' ? (
            <ResultsTable rows={result.rows} columns={result.columns} execTime={result.execTime} />
          ) : (
            <pre style={S.jsonView}>{JSON.stringify(result.rows, null, 2)}</pre>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea { resize: vertical; }
      `}</style>
    </div>
  );
}

function getMockResult(sql) {
  const lower = sql.toLowerCase();
  if (lower.includes('users')) {
    return {
      columns: ['id', 'email', 'full_name', 'is_active'],
      rows: [
        { id: 1, email: 'alice@example.com', full_name: 'Alice Chen', is_active: true },
        { id: 2, email: 'bob@example.com', full_name: 'Bob Smith', is_active: false },
        { id: 3, email: 'carol@example.com', full_name: 'Carol Wu', is_active: true },
      ]
    };
  }
  if (lower.includes('count') || lower.includes('group')) {
    return {
      columns: ['status', 'count', 'total'],
      rows: [
        { status: 'completed', count: 2840, total: 142000.50 },
        { status: 'pending', count: 430, total: 21500.00 },
        { status: 'failed', count: 89, total: 4450.00 },
      ]
    };
  }
  return null;
}

const C = {
  bgCard: 'var(--dev-card-bg)', border: 'var(--dev-card-border)',
  brand: '#3b61f5', text: 'var(--dev-text-primary)', textSecondary: 'var(--dev-text-secondary)', textMuted: 'var(--dev-text-muted)',
};

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: C.textSecondary },
  kbd: { background: 'var(--dev-card-border)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '1px 5px', fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.text },
  histBtn: { display: 'flex', alignItems: 'center', gap: 6, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textSecondary, padding: '7px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  body: { display: 'flex', gap: 14 },
  editorPane: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px', minWidth: 0 },
  sampleRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  sampleBtn: { background: 'rgba(59,97,245,0.1)', border: '1px solid rgba(59,97,245,0.2)', borderRadius: 6, color: '#8ba7ff', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace', transition: 'background 150ms" },
  editorWrap: { display: 'flex', flex: 1, background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' },
  lineNums: { display: 'flex', flexDirection: 'column', padding: '14px 10px', background: 'rgba(0,0,0,0.2)', borderRight: `1px solid ${C.border}`, userSelect: 'none', minWidth: 36 },
  lineNum: { fontSize: 12, color: C.textMuted, lineHeight: '1.6em', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" },
  editor: {
    flex: 1, background: 'transparent', border: 'none', color: '#a8d8ff',
    fontFamily: "'JetBrains Mono',monospace", fontSize: 13.5, lineHeight: '1.6em',
    padding: '14px 16px', outline: 'none', resize: 'none', minHeight: 200,
    tabSize: 2,
  },
  runBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  safetyChip: { fontSize: 12, fontFamily: "'JetBrains Mono',monospace" },
  runBtn: {
    display: 'flex', alignItems: 'center', gap: 8, background: C.brand, color: '#fff',
    border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    boxShadow: '0 4px 14px rgba(59,97,245,0.4)',
    transition: 'opacity 150ms',
  },
  miniSpinner: { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 600ms linear infinite', display: 'inline-block' },
  historyPane: { width: 280, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 },
  histHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  histTitle: { fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif" },
  clearBtn: { background: 'transparent', border: 'none', color: C.textMuted, fontSize: 12, cursor: 'pointer' },
  histEmpty: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 20 },
  histList: { display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 },
  histItem: { padding: '8px 10px', background: 'var(--dev-card-bg)', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3, transition: 'background 150ms' },
  histTime: { fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  histSql: { fontSize: 11, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace", lineHeight: '1.4' },
  histRows: { fontSize: 10, color: C.brand },
  errorBox: { display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px' },
  errorIcon: { color: '#ef4444', fontWeight: 700, flexShrink: 0 },
  errorMsg: { color: '#fca5a5', fontSize: 13, fontFamily: "'JetBrains Mono',monospace", lineHeight: '1.5' },
  resultsSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  viewToggle: { display: 'flex', gap: 4 },
  viewBtn: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSecondary, padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'background 150ms, color 150ms' },
  viewBtnActive: { background: 'rgba(59,97,245,0.15)', color: '#8ba7ff', borderColor: 'rgba(59,97,245,0.3)' },
  resultsBox: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' },
  resultsHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.2)' },
  resultsMeta: { display: 'flex', gap: 8 },
  metaBadge: { fontSize: 11, color: C.textSecondary, background: 'var(--dev-mono-bg)', border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 10, fontFamily: "'JetBrains Mono',monospace" },
  exportBtn: { background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSecondary, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  tableScroll: { overflowX: 'auto', maxHeight: 400 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, background: 'var(--dev-card-bg)', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' },
  thInner: { display: 'flex', alignItems: 'center', gap: 4 },
  tr: {},
  td: { padding: '7px 14px', fontSize: 12, borderBottom: `1px solid var(--dev-divider)`, maxWidth: 200 },
  cellVal: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono',monospace", color: C.text },
  jsonView: { background: 'rgba(0,0,0,0.4)', color: '#a8d8ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: '16px', borderRadius: 12, border: `1px solid ${C.border}`, overflowX: 'auto', maxHeight: 400, margin: 0 },
};
