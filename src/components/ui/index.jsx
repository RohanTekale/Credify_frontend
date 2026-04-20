// src/components/ui/index.jsx
// ─── Credify Design System — Reusable Components ──────────────────────────────
// Theme-aware: uses CSS variables so both light and dark mode work correctly.

import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

// ── Fixed color constants (same in both themes) ───────────────────────────────
const C = {
  brand:   '#3b61f5',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  font:    "'DM Sans', sans-serif",
  mono:    "'JetBrains Mono', monospace",
  display: "'Sora', sans-serif",
  ease:    'cubic-bezier(0.16,1,0.3,1)',
};

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18, color = C.brand, style: sx }) => (
  <>
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: `2px solid ${color}30`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      flexShrink: 0,
      ...sx,
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </>
);

// ── Badge / Status pill ───────────────────────────────────────────────────────
// Uses solid RGBA backgrounds that work in both themes
const BADGE_MAP = {
  active:     { color: '#059669',  bg: 'rgba(16,185,129,0.12)',  label: 'Active'     },
  inactive:   { color: '#64748b',  bg: 'rgba(100,116,139,0.14)', label: 'Inactive'   },
  frozen:     { color: '#3b82f6',  bg: 'rgba(59,130,246,0.12)',  label: 'Frozen'     },
  blocked:    { color: '#dc2626',  bg: 'rgba(239,68,68,0.12)',   label: 'Blocked'    },
  pending:    { color: '#d97706',  bg: 'rgba(245,158,11,0.12)',  label: 'Pending'    },
  verified:   { color: '#059669',  bg: 'rgba(16,185,129,0.12)',  label: 'Verified'   },
  rejected:   { color: '#dc2626',  bg: 'rgba(239,68,68,0.12)',   label: 'Rejected'   },
  unverified: { color: '#64748b',  bg: 'rgba(100,116,139,0.14)', label: 'Unverified' },
  success:    { color: '#059669',  bg: 'rgba(16,185,129,0.12)',  label: 'Success'    },
  failed:     { color: '#dc2626',  bg: 'rgba(239,68,68,0.12)',   label: 'Failed'     },
  error:      { color: '#dc2626',  bg: 'rgba(239,68,68,0.12)',   label: 'Error'      },
  raised:     { color: '#d97706',  bg: 'rgba(245,158,11,0.12)',  label: 'Raised'     },
  'in process':{ color: '#3b61f5', bg: 'rgba(59,97,245,0.12)',   label: 'In Process' },
  completed:  { color: '#059669',  bg: 'rgba(16,185,129,0.12)',  label: 'Completed'  },
  approved:   { color: '#059669',  bg: 'rgba(16,185,129,0.12)',  label: 'Approved'   },
};

export const Badge = ({ status, label, size = 'sm' }) => {
  const cfg = BADGE_MAP[status?.toLowerCase()] || BADGE_MAP.inactive;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '3px 9px' : '5px 12px',
      borderRadius: 20, fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 700, letterSpacing: '0.03em',
      color: cfg.color, background: cfg.bg,
      fontFamily: C.font,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
      {label ?? cfg.label}
    </span>
  );
};

// ── Toast system ──────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

const TOAST_ICONS   = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const TOAST_COLORS  = {
  success: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: C.success },
  error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: C.danger  },
  warning: { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  color: C.warning },
  info:    { bg: 'rgba(59,97,245,0.12)',   border: 'rgba(59,97,245,0.3)',   color: C.brand   },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  };

  const api = {
    success: (msg, dur) => push(msg, 'success', dur),
    error:   (msg, dur) => push(msg, 'error',   dur),
    warning: (msg, dur) => push(msg, 'warning', dur),
    info:    (msg, dur) => push(msg, 'info',    dur),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = TOAST_COLORS[t.type];
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 10,
              background: 'var(--dash-card-bg)',
              border: `1px solid ${c.border}`,
              backdropFilter: 'blur(12px)',
              color: 'var(--dash-text-primary)', fontSize: 13, fontFamily: C.font, fontWeight: 500,
              animation: 'toastIn 280ms cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              pointerEvents: 'auto',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: c.color, flexShrink: 0 }}>{TOAST_ICONS[t.type]}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }`}</style>
    </ToastCtx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// Singleton fallback (for files that don't use the hook)
export const toast = {
  success: (m) => console.log('[toast success]', m),
  error:   (m) => console.error('[toast error]', m),
  warning: (m) => console.warn('[toast warning]', m),
  info:    (m) => console.log('[toast info]', m),
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width = 460, footer }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div style={{
        background: 'var(--dash-card-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid var(--dash-card-border)`,
        borderRadius: 16, width: '100%', maxWidth: width,
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        animation: 'modalIn 220ms cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid var(--dash-card-border)`, flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: C.display, letterSpacing: '-0.01em' }}>{title}</h3>
            <button onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4, borderRadius: 6, transition: 'color 150ms' }}
              onMouseEnter={e => e.target.style.color = 'var(--dash-text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--dash-text-muted)'}>
              ✕
            </button>
          </div>
        )}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 22px', borderTop: `1px solid var(--dash-card-border)`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
};

// ── Confirm dialog ────────────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, title, message, onConfirm, danger, loading }) => (
  <Modal open={open} onClose={onClose} title={title} width={400}>
    <p style={{ margin: '0 0 22px', fontSize: 14, color: 'var(--dash-text-secondary)', lineHeight: 1.6 }}>{message}</p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
        {danger ? 'Confirm' : 'OK'}
      </Button>
    </div>
  </Modal>
);

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, loading, fullWidth, type = 'button', style: sx }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: C.font, fontWeight: 700, borderRadius: 10, border: 'none',
    opacity: disabled ? 0.55 : 1,
    transition: 'all 0.15s',
    fontSize: size === 'sm' ? 11 : size === 'lg' ? 15 : 13,
    padding: size === 'sm' ? '5px 11px' : size === 'lg' ? '13px 24px' : '9px 18px',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: C.brand,  color: '#fff', boxShadow: `0 0 20px ${C.brand}35` },
    ghost:   { background: 'var(--bg-subtle)', color: 'var(--dash-text-primary)', border: `1px solid var(--border)` },
    danger:  { background: 'rgba(239,68,68,0.1)',  color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)'  },
    success: { background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' },
    warning: { background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' },
    link:    { background: 'transparent', color: C.brand, padding: 0 },
  };
  return (
    <button type={type} onClick={disabled || loading ? undefined : onClick} style={{ ...base, ...variants[variant], ...sx }}>
      {loading ? <Spinner size={12} color={variant === 'primary' ? '#fff' : C.brand} /> : null}
      {children}
    </button>
  );
};

// ── Field / Input ─────────────────────────────────────────────────────────────
export const Field = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border)`,
        borderRadius: 10, padding: '10px 13px',
        color: 'var(--dash-text-primary)', fontSize: 13, fontFamily: C.font,
        outline: 'none', width: '100%', boxSizing: 'border-box',
        transition: 'border-color 150ms',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = C.brand; if (props.onFocus) props.onFocus(e); }}
      onBlur={e  => { e.target.style.borderColor = 'var(--border)'; if (props.onBlur) props.onBlur(e); }}
    />
  </div>
);

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = ({ label, children, style: sx, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <select
      {...props}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--border)`,
        borderRadius: 10, padding: '10px 13px',
        color: 'var(--dash-text-primary)', fontSize: 13, fontFamily: C.font,
        outline: 'none', appearance: 'none', width: '100%', boxSizing: 'border-box',
        ...sx,
      }}
    >
      {children}
    </select>
  </div>
);

// ── KpiCard ───────────────────────────────────────────────────────────────────
export const KpiCard = ({ label, value, icon: Icon, color, trend, sub, delay = 0 }) => (
  <div style={{
    padding: '20px 22px', borderRadius: 16,
    background: 'var(--dash-card-bg)',
    border: '1px solid var(--dash-card-border)',
    position: 'relative', overflow: 'hidden',
    animation: `fadeUp 0.5s ease ${delay}ms both`,
  }}>
    <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon && <Icon size={16} color={color} />}
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? C.success : C.danger }}>
          {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontFamily: C.display, fontSize: 28, fontWeight: 800, color: 'var(--dash-text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--dash-text-secondary)', marginTop: 6, fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--dash-text-muted)', marginTop: 3 }}>{sub}</div>}
  </div>
);

// ── Data Table ────────────────────────────────────────────────────────────────
export const DataTable = ({ columns, rows, loading, empty = 'No data found.', onSort, sortCol, sortDir }) => (
  <div style={{ overflowX: 'auto' }}>
    {loading ? (
      <div style={{ padding: '48px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--dash-text-secondary)' }}>
        <Spinner /> <span style={{ fontSize: 13 }}>Loading...</span>
      </div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid var(--dash-card-border)` }}>
            {columns.map((c, i) => (
              <th
                key={i}
                onClick={() => c.sortable && onSort?.(c.key)}
                style={{
                  padding: '11px 14px', textAlign: c.right ? 'right' : 'left', fontSize: 11,
                  fontWeight: 700, color: 'var(--dash-text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase',
                  fontFamily: C.font, whiteSpace: 'nowrap',
                  cursor: c.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                {c.label}
                {c.sortable && sortCol === c.key && (
                  <span style={{ marginLeft: 4, color: C.brand }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '48px 14px', textAlign: 'center', color: 'var(--dash-text-secondary)', fontSize: 13 }}>
                {empty}
              </td>
            </tr>
          ) : rows}
        </tbody>
      </table>
    )}
  </div>
);

export const TR = ({ children, onClick }) => (
  <tr
    onClick={onClick}
    style={{ borderBottom: `1px solid var(--dash-row-divider)`, transition: 'background 100ms', cursor: onClick ? 'pointer' : 'default' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--dash-row-hover)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
  >
    {children}
  </tr>
);

export const TD = ({ children, mono, muted, right, style: sx }) => (
  <td style={{
    padding: '12px 14px', fontSize: 13,
    color: muted ? 'var(--dash-text-secondary)' : 'var(--dash-text-primary)',
    fontFamily: mono ? C.mono : C.font,
    textAlign: right ? 'right' : 'left',
    verticalAlign: 'middle',
    ...sx,
  }}>
    {children}
  </td>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, desc, action }) => (
  <div style={{ padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    {Icon && <Icon size={40} color="var(--dash-text-muted)" style={{ opacity: 0.5 }} />}
    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: C.display }}>{title}</div>
    {desc && <div style={{ fontSize: 13, color: 'var(--dash-text-secondary)', maxWidth: 320, lineHeight: 1.6 }}>{desc}</div>}
    {action && (
      <Button variant="primary" onClick={action.fn} style={{ marginTop: 8 }}>{action.label}</Button>
    )}
  </div>
);

// ── Page header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--dash-text-primary)', fontFamily: C.display, letterSpacing: '-0.02em' }}>{title}</h2>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dash-text-secondary)' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max, color = C.brand, height = 4, label }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dash-text-secondary)', marginBottom: 5 }}>
          <span>{label}</span><span style={{ fontFamily: C.mono }}>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div style={{ height, borderRadius: height, background: 'var(--progress-track)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height, transition: `width 700ms ${C.ease}` }} />
      </div>
    </div>
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name = '', size = 32, src }) => {
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    : (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `hsl(${hue},55%,38%)`, border: `2px solid hsl(${hue},55%,52%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 800, color: '#fff', flexShrink: 0, fontFamily: C.display,
      }}>
        {(name[0] || '?').toUpperCase()}
      </div>
    );
};

// ── Search input ──────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search…', style: sx }) => (
  <div style={{ position: 'relative', ...sx }}>
    <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.45 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dash-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', background: 'var(--bg-subtle)', border: `1px solid var(--border)`,
        borderRadius: 9, padding: '9px 12px 9px 34px', color: 'var(--dash-text-primary)', fontSize: 13,
        fontFamily: C.font, outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms',
      }}
      onFocus={e => e.target.style.borderColor = C.brand}
      onBlur={e  => e.target.style.borderColor = 'var(--border)'}
    />
  </div>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, padding = '20px', style: sx }) => (
  <div style={{
    background: 'var(--dash-card-bg)',
    border: `1px solid var(--dash-card-border)`,
    borderRadius: 14,
    padding, overflow: 'hidden', ...sx,
  }}>
    {children}
  </div>
);

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 2, padding: 4, background: 'var(--bg-subtle)', borderRadius: 10, border: `1px solid var(--border)`, width: 'fit-content' }}>
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
          background: active === t.id ? 'rgba(59,97,245,0.12)' : 'transparent',
          color: active === t.id ? C.brand : 'var(--dash-text-secondary)',
          fontSize: 12, fontWeight: 700, fontFamily: C.font,
          transition: 'all 150ms', letterSpacing: '-0.01em',
          boxShadow: active === t.id ? '0 0 0 1px rgba(59,97,245,0.25)' : 'none',
        }}
      >
        {t.icon && <span style={{ marginRight: 5 }}>{t.icon}</span>}
        {t.label}
        {t.count !== undefined && (
          <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 8, fontFamily: C.mono, color: 'var(--dash-text-muted)' }}>
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
