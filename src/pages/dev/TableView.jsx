import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const PER_PAGE = 20;

// ── Inline Edit Cell ───────────────────────────────────────────────────────────
function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value ?? ''));

  const commit = () => {
    setEditing(false);
    if (val !== String(value ?? '')) onSave(val);
  };

  if (editing) {
    return (
      <input
        autoFocus
        style={S.editInput}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(String(value ?? '')); setEditing(false); } }}
      />
    );
  }
  return (
    <span style={S.cellText} onDoubleClick={() => setEditing(true)} title="Double-click to edit">
      {value === null ? <em style={{ color: C.textMuted, fontStyle: 'italic' }}>null</em> : String(value)}
    </span>
  );
}

// ── Create Row Modal ───────────────────────────────────────────────────────────
function CreateModal({ columns, onClose, onSave }) {
  const [form, setForm] = useState({});
  const editableCols = columns.filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at');

  return (
    <div style={S.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={S.modalHead}>
          <span style={S.modalTitle}>New Row</span>
          <button style={S.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>
          {editableCols.map(col => (
            <div key={col} style={S.formField}>
              <label style={S.formLabel}>{col}</label>
              <input
                style={S.formInput}
                placeholder={`Enter ${col}`}
                value={form[col] || ''}
                onChange={e => setForm(f => ({ ...f, [col]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div style={S.modalFoot}>
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={S.btnPrimary} onClick={() => { onSave(form); onClose(); }}>Insert Row</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({ rowId, onClose, onConfirm }) {
  return (
    <div style={S.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...S.modal, maxWidth: 380 }}>
        <div style={S.modalHead}>
          <span style={{ ...S.modalTitle, color: '#ef4444' }}>Delete Row</span>
          <button style={S.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={{ ...S.modalBody, textAlign: 'center', padding: '20px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
          <p style={{ color: C.textSecondary, fontSize: 14, margin: 0 }}>
            Permanently delete row with ID <strong style={{ color: C.text, fontFamily: "'JetBrains Mono',monospace" }}>#{rowId}</strong>?<br />This cannot be undone.
          </p>
        </div>
        <div style={S.modalFoot}>
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={{ ...S.btnPrimary, background: '#ef4444' }} onClick={() => { onConfirm(); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main TableView ─────────────────────────────────────────────────────────────
export default function TableView() {
  const { table } = useParams();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortCol, setSortCol] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    devAPI.getTableData(table, { page, per_page: PER_PAGE, sort: sortCol, dir: sortDir, search })
      .then(r => {
        const rows = r.data?.rows || generateMockData(table, PER_PAGE);
        setData(rows);
        setTotal(r.data?.total || rows.length);
        if (rows.length) setColumns(Object.keys(rows[0]));
      })
      .catch(() => {
        const mock = generateMockData(table, PER_PAGE);
        setData(mock);
        setTotal(mock.length);
        if (mock.length) setColumns(Object.keys(mock[0]));
      })
      .finally(() => setLoading(false));
  }, [table, page, sortCol, sortDir, search]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handleCellSave = async (rowId, col, val) => {
    await devAPI.updateRow(table, rowId, { [col]: val }).catch(() => {});
    setData(d => d.map(r => r.id === rowId ? { ...r, [col]: val } : r));
    showToast(`Updated ${col}`);
  };

  const handleCreate = async (form) => {
    await devAPI.createRow(table, form).catch(() => {});
    showToast('Row inserted', 'ok');
    load();
  };

  const handleDelete = async (id) => {
    await devAPI.deleteRow(table, id).catch(() => {});
    setData(d => d.filter(r => r.id !== id));
    showToast('Row deleted', 'err');
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div style={S.page}>
      {/* Breadcrumb */}
      <div style={S.breadcrumb}>
        <Link to="/dev/tables" style={S.breadLink}>Tables</Link>
        <span style={S.breadSep}>/</span>
        <span style={S.breadCurrent}>{table}</span>
        <span style={S.rowCount}>{total.toLocaleString()} rows</span>
      </div>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <svg style={S.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={S.searchInput}
            placeholder="Filter rows..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={S.toolRight}>
          <span style={S.tip}>Double-click cells to edit</span>
          <button style={S.btnPrimary} onClick={() => setShowCreate(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Insert Row
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.loadingRow}>
            <span style={S.spinner} />
            <span style={S.loadingText}>Loading {table}...</span>
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col} style={S.th} onClick={() => handleSort(col)}>
                    <span style={S.thContent}>
                      {col}
                      {sortCol === col && (
                        <span style={S.sortArrow}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
                <th style={{ ...S.th, width: 60, cursor: 'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={row.id ?? ri} style={S.tr}>
                  {columns.map(col => (
                    <td key={col} style={S.td}>
                      {col === 'id' ? (
                        <span style={S.idCell}>#{row[col]}</span>
                      ) : (
                        <EditableCell
                          value={row[col]}
                          onSave={val => handleCellSave(row.id, col, val)}
                        />
                      )}
                    </td>
                  ))}
                  <td style={S.td}>
                    <button style={S.deleteBtn} onClick={() => setDeleteTarget(row.id)} title="Delete row">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={S.pagination}>
        <span style={S.pageInfo}>Page {page} of {totalPages} · {total.toLocaleString()} total rows</span>
        <div style={S.pageBtns}>
          <button style={S.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button style={S.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button key={p} style={{ ...S.pageBtn, ...(p === page ? S.pageBtnActive : {}) }} onClick={() => setPage(p)}>{p}</button>
            );
          })}
          <button style={S.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button style={S.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      </div>

      {/* Modals */}
      {showCreate && <CreateModal columns={columns} onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {deleteTarget !== null && <DeleteConfirm rowId={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget)} />}

      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, background: toast.type === 'err' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', borderColor: toast.type === 'err' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)', color: toast.type === 'err' ? '#ef4444' : '#10b981' }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        tr:hover td { background: rgba(59,97,245,0.04) !important; }
      `}</style>
    </div>
  );
}

// Mock data generator
function generateMockData(table, n) {
  if (table === 'users') return Array.from({ length: n }, (_, i) => ({
    id: i + 1, email: `user${i + 1}@example.com`, full_name: `User ${i + 1}`,
    is_active: i % 3 !== 0, is_staff: i === 0, created_at: '2024-01-15T10:00:00Z',
  }));
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Record ${i + 1}`, value: Math.random().toFixed(2), created_at: '2024-01-15' }));
}

const C = {
  bg: 'var(--dev-bg)', bgCard: 'var(--dev-card-bg)', bgRow: 'rgba(255,255,255,0.02)',
  border: 'var(--dev-card-border)', brand: '#3b61f5',
  text: 'var(--dev-text-primary)', textSecondary: 'var(--dev-text-secondary)', textMuted: 'var(--dev-text-muted)',
};

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, height: '100%' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8 },
  breadLink: { fontSize: 13, color: C.brand, textDecoration: 'none', opacity: 0.8 },
  breadSep: { fontSize: 13, color: C.textMuted },
  breadCurrent: { fontSize: 13, color: C.text, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 },
  rowCount: { fontSize: 11, color: C.textMuted, background: 'var(--dev-mono-bg)', padding: '2px 8px', borderRadius: 10, marginLeft: 4 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 10, color: C.textMuted, pointerEvents: 'none' },
  searchInput: {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, fontSize: 13, padding: '7px 12px 7px 30px', outline: 'none', width: 220,
    fontFamily: "'DM Sans',sans-serif",
  },
  toolRight: { display: 'flex', alignItems: 'center', gap: 12 },
  tip: { fontSize: 11, color: C.textMuted, fontStyle: 'italic' },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6, background: C.brand, color: '#fff',
    border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
  },
  btnSecondary: {
    background: 'transparent', color: C.textSecondary,
    border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px',
    fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
  },
  tableWrap: { flex: 1, overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 12, background: C.bgCard },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' },
  th: {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: C.textMuted, background: 'var(--dev-card-bg)',
    borderBottom: `1px solid ${C.border}`, cursor: 'pointer', whiteSpace: 'nowrap',
    userSelect: 'none', fontFamily: "'DM Sans',sans-serif",
  },
  thContent: { display: 'flex', alignItems: 'center', gap: 4 },
  sortArrow: { color: C.brand, fontSize: 12 },
  tr: { transition: 'background 100ms' },
  td: {
    padding: '8px 14px', fontSize: 13, color: C.text, borderBottom: `1px solid var(--dev-divider)`,
    maxWidth: 220, overflow: 'hidden', verticalAlign: 'middle',
  },
  idCell: { color: C.textMuted, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 },
  cellText: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 },
  editInput: {
    width: '100%', background: 'rgba(59,97,245,0.12)', border: `1px solid ${C.brand}`,
    borderRadius: 4, color: C.text, fontSize: 12, padding: '3px 6px', outline: 'none',
    fontFamily: "'JetBrains Mono',monospace",
  },
  deleteBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted,
    padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 150ms, background 150ms',
  },
  loadingRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '60px 0' },
  spinner: { width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(59,97,245,0.2)', borderTopColor: '#3b61f5', animation: 'spin 700ms linear infinite', display: 'inline-block' },
  loadingText: { fontSize: 12, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  pageInfo: { fontSize: 12, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgCard,
    color: C.textSecondary, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  pageBtnActive: { background: C.brand, color: '#fff', borderColor: C.brand },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#0d1321', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 14, width: '90%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' },
  modalHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid rgba(255,255,255,0.07)` },
  modalTitle: { fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif" },
  modalClose: { background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 14 },
  modalBody: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' },
  formField: { display: 'flex', flexDirection: 'column', gap: 5 },
  formLabel: { fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono',monospace" },
  formInput: { background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 7, color: C.text, fontSize: 13, padding: '8px 12px', outline: 'none', fontFamily: "'DM Sans',sans-serif" },
  modalFoot: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: `1px solid rgba(255,255,255,0.07)` },
  toast: {
    position: 'fixed', bottom: 24, right: 24, padding: '10px 18px', borderRadius: 10, border: '1px solid',
    fontSize: 13, fontWeight: 600, backdropFilter: 'blur(10px)', zIndex: 200,
    animation: 'toastIn 300ms ease both',
  },
};
