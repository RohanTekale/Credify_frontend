// src/components/ui/index.jsx
// WHY: Centralising primitives ensures every part of the app looks/behaves identically.
import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18, color = 'var(--brand-500)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
    style={{ animation: 'spin 0.65s linear infinite', flexShrink: 0 }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </svg>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_VARIANTS = {
  success: 'badge-success', warning: 'badge-warning',
  danger: 'badge-danger', info: 'badge-info',
  active: 'badge-success', frozen: 'badge-info',
  blocked: 'badge-danger', pending: 'badge-warning',
  verified: 'badge-success', unverified: 'badge-warning',
  rejected: 'badge-danger',
};

export const Badge = ({ status, label, className = '' }) => (
  <span className={`badge ${BADGE_VARIANTS[status] || 'badge-info'} ${className}`}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
    {label || status}
  </span>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const TOAST_ICONS = {
  success: <CheckCircle2 size={16} color="#34d399" />,
  error:   <AlertCircle  size={16} color="#f87171" />,
  warning: <AlertTriangle size={16} color="#fbbf24" />,
  info:    <Info size={16} color="#818cf8" />,
};

const TOAST_COLORS = {
  success: 'rgba(16,185,129,0.1)', error: 'rgba(239,68,68,0.1)',
  warning: 'rgba(245,158,11,0.1)', info:  'rgba(59,97,245,0.1)',
};
const TOAST_BORDERS = {
  success: 'rgba(16,185,129,0.25)', error: 'rgba(239,68,68,0.25)',
  warning: 'rgba(245,158,11,0.25)', info:  'rgba(59,97,245,0.25)',
};

let _setToast = null;
export const toast = {
  success: (msg) => _setToast?.({ type: 'success', msg }),
  error:   (msg) => _setToast?.({ type: 'error', msg }),
  warning: (msg) => _setToast?.({ type: 'warning', msg }),
  info:    (msg) => _setToast?.({ type: 'info', msg }),
};

export const ToastProvider = () => {
  const [t, setT] = React.useState(null);
  useEffect(() => { _setToast = setT; }, []);
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(null), 3500);
    return () => clearTimeout(id);
  }, [t]);

  if (!t) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 12,
      background: TOAST_COLORS[t.type],
      border: `1px solid ${TOAST_BORDERS[t.type]}`,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      maxWidth: 360,
      animation: 'fadeUp 0.3s ease both',
    }}>
      {TOAST_ICONS[t.type]}
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{t.msg}</span>
      <button onClick={() => setT(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}>
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width = 480 }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-fade-up"
        style={{
          width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--bg-muted)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 28,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6, borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, onConfirm, title, message, danger = false, loading = false }) => (
  <Modal open={open} onClose={onClose} title={title} width={400}>
    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.65 }}>{message}</p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button className="btn-secondary" onClick={onClose} disabled={loading} style={{ fontSize: 13 }}>Cancel</button>
      <button
        onClick={onConfirm}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none',
          background: danger ? 'rgba(239,68,68,0.9)' : 'linear-gradient(135deg,#3b61f5,#1d37cc)',
          color: '#fff', opacity: loading ? 0.7 : 1,
        }}
      >
        {loading && <Spinner size={14} color="#fff" />}
        Confirm
      </button>
    </div>
  </Modal>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, desc, action }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
    {Icon && <Icon size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />}
    <h4 style={{ fontSize: 15, marginBottom: 6 }}>{title}</h4>
    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: action ? 20 : 0 }}>{desc}</p>
    {action && <button className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }} onClick={action.fn}>{action.label}</button>}
  </div>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
export const Field = ({ label, icon: Icon, error, ...props }) => (
  <div>
    {label && (
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'Sora,sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <div className={Icon ? 'input-wrapper' : ''}>
      {Icon && <Icon size={14} className="input-icon" />}
      <input className="input-field" {...props} />
    </div>
    {error && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{error}</p>}
  </div>
);

// ─── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
  </div>
);

// ─── Data Table ────────────────────────────────────────────────────────────────
export const DataTable = ({ columns, rows, loading, empty }) => {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={24} /></div>
  );
  if (!rows?.length) return empty || <EmptyState title="No data" desc="Nothing to show here yet." />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ minWidth: 600 }}>
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
export const KpiCard = ({ label, value, delta, deltaPos, sub, icon: Icon, color = '#3b61f5', delay = 0 }) => (
  <div className={`kpi-card animate-fade-up`} style={{ animationDelay: `${delay}ms` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'Sora,sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      {Icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
      )}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.03em', marginBottom: 8 }}>{value}</div>
    {delta && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className={`badge ${deltaPos ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>{delta}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    )}
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 70, height: 70, background: `radial-gradient(circle at 70% 70%, ${color}15, transparent 70%)`, borderRadius: '0 0 14px 0' }} />
  </div>
);
