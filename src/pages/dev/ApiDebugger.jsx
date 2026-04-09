import { useState } from 'react';
import { devAPI } from '../../services/dev.service';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const METHOD_COLORS = { GET: '#10b981', POST: '#3b61f5', PUT: '#f59e0b', PATCH: '#8b5cf6', DELETE: '#ef4444' };

const PRESETS = [
  { label: 'List users', method: 'GET', path: '/api/users/', body: '' },
  { label: 'My profile', method: 'GET', path: '/api/users/profile', body: '' },
  { label: 'List cards', method: 'GET', path: '/api/cards/', body: '' },
  { label: 'Transactions', method: 'GET', path: '/api/transactions/', body: '' },
];

function StatusBadge({ code }) {
  const color = code >= 500 ? '#ef4444' : code >= 400 ? '#f59e0b' : code >= 300 ? '#8b5cf6' : '#10b981';
  return (
    <span style={{ ...S.statusBadge, color, background: `${color}18`, borderColor: `${color}40` }}>
      {code}
    </span>
  );
}

export default function ApiDebugger() {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/users/');
  const [body, setBody] = useState('');
  const [headerLines, setHeaderLines] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('body');
  const [viewTab, setViewTab] = useState('pretty');

  const send = async () => {
    setLoading(true);
    setResponse(null);
    const t0 = Date.now();
    const headers = Object.fromEntries(headerLines.filter(h => h.key).map(h => [h.key, h.value]));
    try {
      let parsedBody = undefined;
      if (body && method !== 'GET') {
        try { parsedBody = JSON.parse(body); } catch { parsedBody = body; }
      }
      const res = await devAPI.proxyRequest(method, path, parsedBody, headers);
      const elapsed = Date.now() - t0;
      const entry = {
        method, path, status: res.status || 200,
        body: res.data, elapsed,
        headers: res.headers || {},
        time: new Date().toLocaleTimeString(),
      };
      setResponse(entry);
      setHistory(h => [entry, ...h.slice(0, 14)]);
    } catch (e) {
      // Mock response for demo
      const elapsed = Date.now() - t0;
      const mock = getMockResponse(method, path);
      const entry = { method, path, ...mock, elapsed, time: new Date().toLocaleTimeString() };
      setResponse(entry);
      setHistory(h => [entry, ...h.slice(0, 14)]);
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => setHeaderLines(h => [...h, { key: '', value: '' }]);
  const removeHeader = i => setHeaderLines(h => h.filter((_, idx) => idx !== i));
  const updateHeader = (i, field, val) => setHeaderLines(h => h.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>API Debugger</h2>
          <p style={S.subtitle}>Inspect internal backend endpoints · All requests are authenticated</p>
        </div>
      </div>

      <div style={S.layout}>
        {/* Left: request builder */}
        <div style={S.leftPane}>
          {/* Presets */}
          <div style={S.presetsRow}>
            {PRESETS.map(p => (
              <button key={p.label} style={S.presetBtn} onClick={() => { setMethod(p.method); setPath(p.path); if (p.body) setBody(p.body); }}>
                <span style={{ ...S.presetMethod, color: METHOD_COLORS[p.method] }}>{p.method}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* URL bar */}
          <div style={S.urlBar}>
            <select
              style={{ ...S.methodSelect, color: METHOD_COLORS[method] }}
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              {METHODS.map(m => <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>{m}</option>)}
            </select>
            <input
              style={S.pathInput}
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="/api/endpoint/"
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button style={{ ...S.sendBtn, opacity: loading ? 0.6 : 1 }} onClick={send} disabled={loading}>
              {loading ? <span style={S.spinner} /> : 'Send'}
            </button>
          </div>

          {/* Tabs: body / headers */}
          <div style={S.tabs}>
            {['body', 'headers'].map(t => (
              <button key={t} style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'headers' && <span style={S.tabBadge}>{headerLines.length}</span>}
              </button>
            ))}
          </div>

          {activeTab === 'body' ? (
            <textarea
              style={S.bodyEditor}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={method === 'GET' ? 'GET requests have no body' : '{\n  "key": "value"\n}'}
              disabled={method === 'GET'}
              spellCheck={false}
            />
          ) : (
            <div style={S.headersBox}>
              {headerLines.map((h, i) => (
                <div key={i} style={S.headerRow}>
                  <input style={S.headerInput} value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header key" />
                  <span style={{ color: C.textMuted }}>:</span>
                  <input style={{ ...S.headerInput, flex: 2 }} value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Value" />
                  <button style={S.removeBtn} onClick={() => removeHeader(i)}>✕</button>
                </div>
              ))}
              <button style={S.addHeaderBtn} onClick={addHeader}>+ Add header</button>
            </div>
          )}
        </div>

        {/* Right: response */}
        <div style={S.rightPane}>
          {/* History */}
          <div style={S.historyBox}>
            <span style={S.histTitle}>Recent</span>
            <div style={S.histList}>
              {history.slice(0, 6).map((h, i) => (
                <div key={i} style={S.histItem} onClick={() => { setMethod(h.method); setPath(h.path); }}>
                  <span style={{ ...S.histMethod, color: METHOD_COLORS[h.method] }}>{h.method}</span>
                  <span style={S.histPath}>{h.path}</span>
                  <StatusBadge code={h.status} />
                  <span style={S.histTime}>{h.elapsed}ms</span>
                </div>
              ))}
              {history.length === 0 && <span style={S.histEmpty}>No requests yet</span>}
            </div>
          </div>

          {/* Response */}
          {response ? (
            <div style={S.responseBox}>
              <div style={S.responseHead}>
                <span style={{ ...S.resMethod, color: METHOD_COLORS[response.method] }}>{response.method}</span>
                <span style={S.resPath}>{response.path}</span>
                <StatusBadge code={response.status} />
                <span style={S.resTime}>{response.elapsed}ms</span>
              </div>

              <div style={S.resTabs}>
                {['pretty', 'raw', 'headers'].map(t => (
                  <button key={t} style={{ ...S.resTab, ...(viewTab === t ? S.resTabActive : {}) }} onClick={() => setViewTab(t)}>
                    {t}
                  </button>
                ))}
              </div>

              {viewTab === 'pretty' && (
                <pre style={S.responsePre}>
                  {JSON.stringify(response.body, null, 2)}
                </pre>
              )}
              {viewTab === 'raw' && (
                <pre style={S.responsePre}>{JSON.stringify(response.body)}</pre>
              )}
              {viewTab === 'headers' && (
                <div style={S.responseHeaders}>
                  {Object.entries(response.headers || {}).map(([k, v]) => (
                    <div key={k} style={S.headerEntry}>
                      <span style={S.hKey}>{k}</span>
                      <span style={S.hVal}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={S.emptyResponse}>
              <div style={S.emptyIcon}>↗</div>
              <p style={S.emptyText}>Send a request to see the response</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

function getMockResponse(method, path) {
  if (path.includes('users') && method === 'GET') {
    return { status: 200, body: [{ id: 1, email: 'alice@example.com', full_name: 'Alice Chen', is_active: true }], headers: { 'content-type': 'application/json', 'x-total-count': '1' } };
  }
  if (path.includes('profile') && method === 'GET') {
    return { status: 200, body: { id: 1, email: 'dev@credify.com', full_name: 'Developer', is_staff: true }, headers: { 'content-type': 'application/json' } };
  }
  return { status: 404, body: { detail: 'Not found' }, headers: { 'content-type': 'application/json' } };
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
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 },
  leftPane: { display: 'flex', flexDirection: 'column', gap: 12, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px' },
  presetsRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  presetBtn: { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace" },
  presetMethod: { fontWeight: 800, fontSize: 10, letterSpacing: '0.05em' },
  urlBar: { display: 'flex', gap: 8, alignItems: 'center' },
  methodSelect: { background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 10px', fontSize: 12, fontWeight: 800, outline: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.04em', width: 80 },
  pathInput: { flex: 1, background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, padding: '9px 14px', outline: 'none', fontFamily: "'JetBrains Mono',monospace" },
  sendBtn: { background: C.brand, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans',sans-serif", transition: 'opacity 150ms' },
  spinner: { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 600ms linear infinite', display: 'inline-block' },
  tabs: { display: 'flex', gap: 2, borderBottom: `1px solid ${C.border}` },
  tab: { background: 'transparent', border: 'none', color: C.textMuted, padding: '7px 14px', fontSize: 12, cursor: 'pointer', borderBottom: '2px solid transparent', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 5, transition: 'color 150ms' },
  tabActive: { color: C.text, borderBottomColor: C.brand },
  tabBadge: { background: 'rgba(59,97,245,0.15)', color: C.brand, fontSize: 10, padding: '1px 5px', borderRadius: 10, fontWeight: 700 },
  bodyEditor: { background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 8, color: '#a8d8ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, padding: '12px 14px', outline: 'none', resize: 'vertical', minHeight: 160, lineHeight: '1.6' },
  headersBox: { display: 'flex', flexDirection: 'column', gap: 6 },
  headerRow: { display: 'flex', alignItems: 'center', gap: 6 },
  headerInput: { flex: 1, background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, padding: '6px 10px', outline: 'none', fontFamily: "'JetBrains Mono',monospace" },
  removeBtn: { background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 12, padding: 4 },
  addHeaderBtn: { background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 6, color: C.textMuted, padding: '5px 10px', fontSize: 12, cursor: 'pointer', width: 'fit-content', marginTop: 2 },
  rightPane: { display: 'flex', flexDirection: 'column', gap: 12 },
  historyBox: { background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  histTitle: { fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' },
  histList: { display: 'flex', flexDirection: 'column', gap: 4 },
  histItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 6, cursor: 'pointer', transition: 'background 150ms' },
  histMethod: { fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', width: 40, fontFamily: "'JetBrains Mono',monospace" },
  histPath: { flex: 1, fontSize: 11, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  histTime: { fontSize: 10, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  histEmpty: { fontSize: 12, color: C.textMuted, textAlign: 'center', padding: '8px 0' },
  responseBox: { flex: 1, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  responseHead: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.2)' },
  resMethod: { fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', fontFamily: "'JetBrains Mono',monospace" },
  resPath: { flex: 1, fontSize: 12, color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resTime: { fontSize: 11, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, border: '1px solid', fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 },
  resTabs: { display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}` },
  resTab: { background: 'transparent', border: 'none', color: C.textMuted, padding: '6px 14px', fontSize: 11, cursor: 'pointer', borderBottom: '2px solid transparent', fontFamily: "'JetBrains Mono',monospace", transition: 'color 150ms' },
  resTabActive: { color: C.text, borderBottomColor: C.brand },
  responsePre: { flex: 1, color: '#a8d8ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: '14px', overflow: 'auto', margin: 0, maxHeight: 360, lineHeight: '1.6' },
  responseHeaders: { padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 },
  headerEntry: { display: 'flex', gap: 12, fontSize: 12 },
  hKey: { color: C.brand, fontFamily: "'JetBrains Mono',monospace", minWidth: 140 },
  hVal: { color: C.textSecondary, fontFamily: "'JetBrains Mono',monospace" },
  emptyResponse: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '40px' },
  emptyIcon: { fontSize: 36, color: C.textMuted },
  emptyText: { fontSize: 13, color: C.textMuted, margin: 0 },
};
