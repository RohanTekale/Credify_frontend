// src/components/ui/index.jsx
// ─── Credify Design System — Reusable Components ──────────────────────────────
// Single import: import { Spinner, Toast, Modal, Badge, ... } from '@/components/ui'

import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  brand:   '#3b61f5',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  bgCard:  'rgba(255,255,255,0.04)',
  border:  'rgba(255,255,255,0.08)',
  text:    '#f0f4ff',
  textSec: '#8b96b0',
  textMut: '#4b5675',
  font:    "'DM Sans', sans-serif",
  mono:    "'JetBrains Mono', monospace",
  display: "'Sora', sans-serif",
  ease:    'cubic-bezier(0.16,1,0.3,1)',
};

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18, color = T.brand, style: sx }) => (
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
const BADGE_MAP = {
  active:     { color: T.success,  bg: 'rgba(16,185,129,0.12)',  label: 'Active'     },
  inactive:   { color: T.textSec,  bg: 'rgba(255,255,255,0.07)', label: 'Inactive'   },
  frozen:     { color: '#60a5fa',  bg: 'rgba(96,165,250,0.12)',  label: 'Frozen'     },
  blocked:    { color: T.danger,   bg: 'rgba(239,68,68,0.12)',   label: 'Blocked'    },
  pending:    { color: T.warning,  bg: 'rgba(245,158,11,0.12)',  label: 'Pending'    },
  verified:   { color: T.success,  bg: 'rgba(16,185,129,0.12)',  label: 'Verified'   },
  rejected:   { color: T.danger,   bg: 'rgba(239,68,68,0.12)',   label: 'Rejected'   },
  unverified: { color: T.textSec,  bg: 'rgba(255,255,255,0.07)', label: 'Unverified' },
  success:    { color: T.success,  bg: 'rgba(16,185,129,0.12)',  label: 'Success'    },
  failed:     { color: T.danger,   bg: 'rgba(239,68,68,0.12)',   label: 'Failed'     },
  error:      { color: T.danger,   bg: 'rgba(239,68,68,0.12)',   label: 'Error'      },
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
      fontFamily: T.font,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
      {label ?? cfg.label}
    </span>
  );
};

// ── Toast system ──────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

const TOAST_ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};
const TOAST_COLORS = {
  success: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: T.success },
  error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: T.danger  },
  warning: { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  color: T.warning },
  info:    { bg: 'rgba(59,97,245,0.12)',   border: 'rgba(59,97,245,0.3)',   color: T.brand   },
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
              padding: '12px 16px', borderRadius: 10, background: c.bg,
              border: `1px solid ${c.border}`,
              backdropFilter: 'blur(12px)',
              color: T.text, fontSize: 13, fontFamily: T.font, fontWeight: 500,
              animation: 'toastIn 280ms cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              pointerEvents: 'auto',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: c.color, flexShrink: 0 }}>{TOAST_ICONS[t.type]}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
      `}</style>
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
  _push: null,
  success: (m) => toast._push?.('success', m),
  error:   (m) => toast._push?.('error',   m),
  warning: (m) => toast._push?.('warning', m),
  info:    (m) => toast._push?.('info',    m),
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
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div style={{
        background:'rgba(9,13,24,0.98)', border:`1px solid ${T.border}`,
        borderRadius:16, width:'100%', maxWidth:width,
        boxShadow:'0 24px 80px rgba(0,0,0,0.7)',
        animation:'modalIn 220ms cubic-bezier(0.16,1,0.3,1)',
        display:'flex', flexDirection:'column', maxHeight:'90vh',
      }}>
        {/* Header */}
        {title && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:T.text, fontFamily:T.display, letterSpacing:'-0.01em' }}>{title}</h3>
            <button onClick={onClose} style={{ background:'transparent', border:'none', color:T.textSec, cursor:'pointer', fontSize:18, lineHeight:1, padding:4, borderRadius:6, transition:'color 150ms' }}
              onMouseEnter={e=>e.target.style.color=T.text} onMouseLeave={e=>e.target.style.color=T.textSec}>
              ✕
            </button>
          </div>
        )}
        {/* Body */}
        <div style={{ padding:'20px 22px', overflowY:'auto', flex:1 }}>{children}</div>
        {/* Footer */}
        {footer && (
          <div style={{ padding:'14px 22px', borderTop:`1px solid ${T.border}`, display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) scale(0.97); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
};

// ── Confirm dialog ────────────────────────────────────────────────────────────
export const Confirm = ({ open, onClose, onConfirm, title, message, loading, danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} width={380}
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {danger ? 'Delete' : 'Confirm'}
        </Button>
      </>
    }
  >
    <p style={{ margin:0, fontSize:14, color:T.textSec, lineHeight:1.6 }}>{message}</p>
  </Modal>
);

// ── Button ────────────────────────────────────────────────────────────────────
const VARIANTS = {
  primary:  { bg:'#3b61f5', color:'#fff', border:'transparent', shadow:'0 4px 14px rgba(59,97,245,0.35)' },
  ghost:    { bg:'rgba(255,255,255,0.05)', color:T.text, border:T.border, shadow:'none' },
  danger:   { bg:'rgba(239,68,68,0.1)', color:'#f87171', border:'rgba(239,68,68,0.25)', shadow:'none' },
  success:  { bg:'rgba(16,185,129,0.1)', color:'#34d399', border:'rgba(16,185,129,0.25)', shadow:'none' },
  outline:  { bg:'transparent', color:T.brand, border:T.brand, shadow:'none' },
};

export const Button = ({ children, variant='primary', loading, disabled, onClick, size='md', fullWidth, style:sx, type='button' }) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const sz = { sm:'7px 12px', md:'9px 18px', lg:'12px 24px' };
  const fs = { sm:11, md:13, lg:15 };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
        padding:sz[size], fontSize:fs[size], fontWeight:700,
        background:v.bg, color:v.color,
        border:`1px solid ${v.border}`, borderRadius:9,
        boxShadow:v.shadow, cursor:disabled||loading ? 'not-allowed' : 'pointer',
        opacity:disabled||loading ? 0.6 : 1,
        transition:'all 0.15s', fontFamily:T.font,
        width:fullWidth ? '100%' : undefined,
        letterSpacing:'-0.01em',
        ...sx,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '1'; }}
    >
      {loading && <Spinner size={fs[size]} color={v.color} />}
      {children}
    </button>
  );
};

// ── Input field ───────────────────────────────────────────────────────────────
export const Field = ({ label, error, hint, icon, ...props }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    {label && (
      <label style={{ fontSize:11, fontWeight:700, color:T.textMut, letterSpacing:'0.07em', textTransform:'uppercase', fontFamily:T.font }}>
        {label}
      </label>
    )}
    <div style={{ position:'relative' }}>
      {icon && (
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:T.textMut, pointerEvents:'none', display:'flex', alignItems:'center' }}>
          {icon}
        </span>
      )}
      <input
        style={{
          width:'100%', background:'rgba(255,255,255,0.04)',
          border:`1px solid ${error ? T.danger : T.border}`,
          borderRadius:9, padding:`10px ${icon ? '12px 12px 36px' : '12px'}`,
          paddingLeft:icon ? 36 : 12,
          color:T.text, fontSize:13, fontFamily:T.font,
          outline:'none', boxSizing:'border-box',
          transition:'border-color 150ms',
        }}
        onFocus={e => e.target.style.borderColor = error ? T.danger : T.brand}
        onBlur={e  => e.target.style.borderColor = error ? T.danger : T.border}
        {...props}
      />
    </div>
    {error && <span style={{ fontSize:11, color:T.danger, fontFamily:T.font }}>{error}</span>}
    {hint && !error && <span style={{ fontSize:11, color:T.textMut, fontFamily:T.font }}>{hint}</span>}
  </div>
);

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, ...props }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    {label && <label style={{ fontSize:11, fontWeight:700, color:T.textMut, letterSpacing:'0.07em', textTransform:'uppercase', fontFamily:T.font }}>{label}</label>}
    <select
      style={{
        width:'100%', background:'rgba(8,12,20,0.9)', border:`1px solid ${error ? T.danger : T.border}`,
        borderRadius:9, padding:'10px 12px', color:T.text, fontSize:13, fontFamily:T.font,
        outline:'none', appearance:'none', cursor:'pointer', boxSizing:'border-box',
      }}
      {...props}
    >
      {children}
    </select>
    {error && <span style={{ fontSize:11, color:T.danger }}>{error}</span>}
  </div>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
export const KpiCard = ({ label, value, delta, deltaPos, icon: Icon, color, delay = 0, loading }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{
      background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14, padding:'18px 20px',
      position:'relative', overflow:'hidden',
      opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(14px)',
      transition:`opacity 400ms ${T.ease}, transform 400ms ${T.ease}`,
    }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        {Icon && (
          <div style={{ width:34, height:34, borderRadius:9, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={15} color={color} />
          </div>
        )}
        {delta !== undefined && (
          <span style={{ fontSize:11, fontWeight:700, color:deltaPos?T.success:T.danger }}>
            {deltaPos?'↑':'↓'} {delta}
          </span>
        )}
      </div>
      {loading
        ? <div style={{ height:28, background:'rgba(255,255,255,0.06)', borderRadius:4, animation:'pulse 1.5s ease-in-out infinite', marginBottom:6 }} />
        : <div style={{ fontSize:26, fontWeight:800, color:T.text, fontFamily:T.display, letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
      }
      <div style={{ fontSize:12, color:T.textSec, marginTop:6, fontWeight:500, fontFamily:T.font }}>{label}</div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
};

// ── Data Table ────────────────────────────────────────────────────────────────
export const DataTable = ({ columns, rows, loading, empty = 'No data found.', onSort, sortCol, sortDir }) => (
  <div style={{ overflowX:'auto' }}>
    {loading ? (
      <div style={{ padding:'48px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:T.textSec }}>
        <Spinner /> <span style={{ fontSize:13 }}>Loading...</span>
      </div>
    ) : (
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${T.border}` }}>
            {columns.map((c, i) => (
              <th
                key={i}
                onClick={() => c.sortable && onSort?.(c.key)}
                style={{
                  padding:'11px 14px', textAlign:'left', fontSize:11,
                  fontWeight:700, color:T.textMut, letterSpacing:'0.07em', textTransform:'uppercase',
                  fontFamily:T.font, whiteSpace:'nowrap',
                  cursor:c.sortable ? 'pointer' : 'default',
                  userSelect:'none',
                }}
              >
                {c.label}
                {c.sortable && sortCol === c.key && (
                  <span style={{ marginLeft:4, color:T.brand }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding:'48px 14px', textAlign:'center', color:T.textSec, fontSize:13 }}>
                {empty}
              </td>
            </tr>
          ) : rows}
        </tbody>
      </table>
    )}
  </div>
);

export const TR = ({ children, onClick, striped }) => (
  <tr
    onClick={onClick}
    style={{ borderBottom:`1px solid rgba(255,255,255,0.04)`, transition:'background 100ms', cursor:onClick?'pointer':'default' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
  >
    {children}
  </tr>
);

export const TD = ({ children, mono, muted, right, style: sx }) => (
  <td style={{
    padding:'12px 14px', fontSize:13,
    color:muted ? T.textSec : T.text,
    fontFamily:mono ? T.mono : T.font,
    textAlign:right ? 'right' : 'left',
    verticalAlign:'middle',
    ...sx,
  }}>
    {children}
  </td>
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, desc, action }) => (
  <div style={{ padding:'56px 24px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
    {Icon && <Icon size={40} color={T.textMut} style={{ opacity:0.5 }} />}
    <div style={{ fontSize:16, fontWeight:700, color:T.text, fontFamily:T.display }}>{title}</div>
    {desc && <div style={{ fontSize:13, color:T.textSec, maxWidth:320, lineHeight:1.6 }}>{desc}</div>}
    {action && (
      <Button variant="primary" onClick={action.fn} style={{ marginTop:8 }}>{action.label}</Button>
    )}
  </div>
);

// ── Page header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, gap:12, flexWrap:'wrap' }}>
    <div>
      <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:T.text, fontFamily:T.display, letterSpacing:'-0.02em' }}>{title}</h2>
      {subtitle && <p style={{ margin:'4px 0 0', fontSize:13, color:T.textSec }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>{actions}</div>}
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max, color = T.brand, height = 4, label }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      {label && (
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:T.textSec, marginBottom:5 }}>
          <span>{label}</span><span style={{ fontFamily:T.mono }}>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div style={{ height, borderRadius:height, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:height, transition:`width 700ms ${T.ease}` }} />
      </div>
    </div>
  );
};

// ── Avatar ────────────────────────────────────────────────────────────────────
export const Avatar = ({ name = '', size = 32, src }) => {
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return src
    ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover' }} />
    : (
      <div style={{
        width:size, height:size, borderRadius:'50%',
        background:`hsl(${hue},55%,35%)`, border:`2px solid hsl(${hue},55%,50%)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:size*0.36, fontWeight:800, color:'#fff', flexShrink:0, fontFamily:T.display,
      }}>
        {(name[0] || '?').toUpperCase()}
      </div>
    );
};

// ── Search input ──────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search…', style: sx }) => (
  <div style={{ position:'relative', ...sx }}>
    <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', opacity:0.4 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${T.border}`,
        borderRadius:9, padding:'9px 12px 9px 34px', color:T.text, fontSize:13,
        fontFamily:T.font, outline:'none', boxSizing:'border-box', transition:'border-color 150ms',
      }}
      onFocus={e => e.target.style.borderColor = T.brand}
      onBlur={e  => e.target.style.borderColor = T.border}
    />
  </div>
);

// ── Card / Glass card ─────────────────────────────────────────────────────────
export const Card = ({ children, padding = '20px', style: sx }) => (
  <div style={{
    background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14,
    padding, overflow:'hidden', ...sx,
  }}>
    {children}
  </div>
);

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display:'flex', gap:2, padding:4, background:'rgba(0,0,0,0.3)', borderRadius:10, border:`1px solid ${T.border}`, width:'fit-content' }}>
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding:'7px 16px', borderRadius:7, border:'none', cursor:'pointer',
          background:active===t.id ? 'rgba(59,97,245,0.15)' : 'transparent',
          color:active===t.id ? '#8ba7ff' : T.textSec,
          fontSize:12, fontWeight:700, fontFamily:T.font,
          transition:'all 150ms', letterSpacing:'-0.01em',
          boxShadow:active===t.id ? '0 0 0 1px rgba(59,97,245,0.25)' : 'none',
        }}
      >
        {t.icon && <span style={{ marginRight:5 }}>{t.icon}</span>}
        {t.label}
        {t.count !== undefined && (
          <span style={{ marginLeft:6, fontSize:10, background:'rgba(255,255,255,0.1)', padding:'1px 5px', borderRadius:8, fontFamily:T.mono }}>
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
);