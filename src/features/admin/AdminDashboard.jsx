// ─── Credify Fintech Admin Panel v2.0 ────────────────────────────────────────
// Full redesign: Top Navbar + Dynamic Sidebar + Role-Based Access
// Drop-in replacement for src/features/admin/AdminDashboard.jsx
// All API calls use existing api.js services — no new endpoints needed for core
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  // Layout
  LayoutDashboard, Menu, X, ChevronRight, ChevronDown,
  // Operations
  Users, CreditCard, Shield, FileText, ArrowLeftRight,
  // Finance
  DollarSign, Receipt, FileBarChart, CreditCard as CC,
  Repeat, TrendingUp, Wallet,
  // Analytics
  BarChart3, UserPlus, PieChart, Activity, Layers,
  // Risk
  AlertTriangle, Star, ShieldAlert, Eye, MessageSquare,
  Flame, Lock, Unlock,
  // Support
  Inbox, LifeBuoy, Phone, TrendingDown, BookOpen, ThumbsUp, Ticket,
  // Growth
  Gift, Megaphone, Users2, Tag, Bell,
  // System
  Key, UserCog, Terminal, Flag, Plug, Cpu, ClipboardList,
  // Actions
  RefreshCw, Search, LogOut, Settings, Moon, Sun,
  CheckCircle2, XCircle, Hash, ArrowUpRight, ArrowDownRight,
  Clock, CheckCheck, Send, Upload, Paperclip, RotateCcw,
  Filter, MoreHorizontal, Copy, ShieldCheck, Database,
  Zap, Globe, UserCheck, UserX, Plus, Info, Loader, AlertOctagon,
} from 'lucide-react';
import { adminAPI, requestsAPI, kycAPI } from '../../services/api';
import { Spinner, toast, Badge } from '../../components/ui';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const T = {
  accent:     '#3b61f5',
  accentDark: '#1d37cc',
  accentGlow: 'rgba(59,97,245,0.18)',
  success:    '#10b981',
  danger:     '#ef4444',
  warning:    '#f59e0b',
  purple:     '#7c3aed',
  teal:       '#0d9488',
  bgBase:     'var(--bg-base)',
  bgCard:     'var(--dash-card-bg, var(--bg-card))',
  bgSubtle:   'var(--bg-subtle)',
  border:     'var(--dash-card-border, var(--border))',
  borderMid:  'var(--border)',
  text1:      'var(--dash-text-primary, var(--text-primary))',
  text2:      'var(--dash-text-secondary, var(--text-secondary))',
  text3:      'var(--dash-text-muted, var(--text-muted))',
  font:       "'DM Sans','Sora',sans-serif",
  mono:       "'JetBrains Mono','Fira Code',monospace",
};

// ─── Module Config (JSON-driven nav + sidebar) — Credify Finance Ops ──────────
const MODULES = [
  {
    id: 'operations', label: 'Operations', icon: LayoutDashboard,
    roles: ['admin','finance','risk'],
    sidebar: [
      { id: 'overview',      icon: LayoutDashboard, label: 'Overview'          },
      { id: 'users',         icon: Users,           label: 'Users'             },
      { id: 'kyc',           icon: Shield,          label: 'KYC Review',  badge: 'kycPending' },
      { id: 'approval-mgmt', icon: CheckCircle2,    label: 'Approval Chains'   },
      { id: 'transactions',  icon: ArrowLeftRight,  label: 'Transactions'      },
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: DollarSign,
    roles: ['admin','finance'],
    sidebar: [
      { id: 'fin-overview',  icon: LayoutDashboard, label: 'Overview'          },
      { id: 'payments',      icon: Wallet,          label: 'Payments'          },
      { id: 'reconciliation',icon: Repeat,          label: 'Reconciliation'    },
      { id: 'settlement',    icon: FileText,        label: 'Settlement Files'  },
      { id: 'mismatches',    icon: AlertTriangle,   label: 'Mismatches',  badge: '3' },
      { id: 'revenue',       icon: TrendingUp,      label: 'Revenue Reports'   },
    ],
  },
  {
    id: 'integrations', label: 'Integrations', icon: Plug,
    roles: ['admin','finance'],
    sidebar: [
      { id: 'gateways',      icon: Globe,           label: 'Gateway Connectors' },
      { id: 'webhooks',      icon: Zap,             label: 'Webhook Endpoints'  },
      { id: 'event-log',     icon: ClipboardList,   label: 'Event Log'          },
      { id: 'dlq',           icon: AlertOctagon,    label: 'Dead-Letter Queue'  },
      { id: 'api-keys',      icon: Key,             label: 'API Keys'           },
    ],
  },
  {
    id: 'system', label: 'System', icon: Settings,
    roles: ['admin'],
    sidebar: [
      { id: 'roles',         icon: Key,             label: 'Roles & Permissions' },
      { id: 'admin-users',   icon: UserCog,         label: 'Admin Users'         },
      { id: 'api-logs',      icon: Terminal,        label: 'API Logs'            },
      { id: 'flags',         icon: Flag,            label: 'Feature Flags'       },
      { id: 'health',        icon: Cpu,             label: 'System Health', badge: 'healthStatus' },
      { id: 'audit-log',     icon: ClipboardList,   label: 'Audit Log'           },
      { id: '__devpanel__',  icon: Terminal,        label: 'Dev Panel', isLink: true, to: '/dev' },
    ],
  },
];

const ROLE_MODULES = {
  admin:   MODULES.map(m => m.id),
  finance: ['operations','finance','integrations'],
  risk:    ['operations','finance'],
  support: ['operations'],
};

// ─── Shared Primitives ──────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: T.bgCard,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  ...extra,
});

const StatusPill = ({ status }) => {
  const map = {
    active:     { label: 'Active',     c: '#059669', bg: 'rgba(16,185,129,0.12)' },
    inactive:   { label: 'Inactive',   c: '#64748b', bg: 'rgba(100,116,139,0.14)' },
    blocked:    { label: 'Blocked',    c: T.danger,  bg: 'rgba(239,68,68,0.12)' },
    frozen:     { label: 'Frozen',     c: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    verified:   { label: 'Verified',   c: '#059669', bg: 'rgba(16,185,129,0.12)' },
    pending:    { label: 'Pending',    c: '#d97706', bg: 'rgba(245,158,11,0.12)' },
    rejected:   { label: 'Rejected',  c: T.danger,  bg: 'rgba(239,68,68,0.12)' },
    unverified: { label: 'Unverified', c: '#64748b', bg: 'rgba(100,116,139,0.14)' },
    raised:     { label: 'Raised',     c: '#d97706', bg: 'rgba(245,158,11,0.12)' },
    in_process: { label: 'In Process', c: T.accent,  bg: 'rgba(59,97,245,0.12)' },
    completed:  { label: 'Completed',  c: '#059669', bg: 'rgba(16,185,129,0.12)' },
  };
  const cfg = map[status?.toLowerCase()?.replace(' ','_')] || map.unverified;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:cfg.c, background:cfg.bg }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.c, display:'inline-block' }}/>
      {cfg.label}
    </span>
  );
};

const MetricCard = ({ label, value, sub, icon:Icon, accent, trend, delay=0 }) => (
  <div style={{ ...card({ padding:'20px 22px' }), position:'relative', overflow:'hidden', animation:`fadeUp 0.5s ease ${delay}ms both` }}>
    <div style={{ position:'absolute', top:-30, right:-30, width:90, height:90, borderRadius:'50%', background:`radial-gradient(circle, ${accent}22 0%, transparent 70%)`, pointerEvents:'none' }}/>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
      <div style={{ width:34, height:34, borderRadius:9, background:`${accent}18`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={15} color={accent}/>
      </div>
      {trend !== undefined && (
        <span style={{ fontSize:11, fontWeight:700, color: trend>=0 ? T.success : T.danger, display:'flex', alignItems:'center', gap:2 }}>
          {trend>=0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontFamily:T.font, fontSize:26, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, color:T.text2, marginTop:5, fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>{sub}</div>}
  </div>
);

const Btn = ({ children, onClick, variant='ghost', disabled, size='md', style:sx, type }) => {
  const base = { display:'inline-flex', alignItems:'center', gap:6, cursor:disabled?'not-allowed':'pointer', fontFamily:T.font, fontWeight:700, borderRadius:9, border:'none', opacity:disabled?0.5:1, transition:'all 0.15s', fontSize:size==='sm'?11:13, padding:size==='sm'?'5px 10px':'9px 16px' };
  const variants = {
    primary: { background:T.accent, color:'#fff', boxShadow:`0 0 20px ${T.accent}40` },
    ghost:   { background:'var(--bg-card,#fff)', color:T.text1, border:`1px solid ${T.borderMid}` },
    danger:  { background:'rgba(239,68,68,0.1)', color:T.danger, border:'1px solid rgba(239,68,68,0.2)' },
    success: { background:'rgba(16,185,129,0.1)', color:T.success, border:'1px solid rgba(16,185,129,0.2)' },
  };
  return <button type={type||'button'} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...sx }}>{children}</button>;
};

const Input = ({ label, ...props }) => (
  <div>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.text3, marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</label>}
    <input style={{ width:'100%', background:'var(--bg-card,#fff)', border:`1px solid ${T.borderMid}`, borderRadius:9, padding:'10px 14px', color:T.text1, fontSize:13, fontFamily:T.font, outline:'none', boxSizing:'border-box' }} {...props}/>
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.text3, marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</label>}
    <select style={{ width:'100%', background:'var(--bg-card,#fff)', border:`1px solid ${T.borderMid}`, borderRadius:9, padding:'10px 14px', color:T.text1, fontSize:13, fontFamily:T.font, outline:'none', appearance:'none' }} {...props}>{children}</select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:700, color:T.text3, marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</label>}
    <textarea style={{ width:'100%', background:'var(--bg-card,#fff)', border:`1px solid ${T.borderMid}`, borderRadius:9, padding:'10px 14px', color:T.text1, fontSize:13, fontFamily:T.font, outline:'none', resize:'vertical', boxSizing:'border-box' }} {...props}/>
  </div>
);

const PModal = ({ open, onClose, title, children, width=460 }) => {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ ...card({ padding:28 }), width:'100%', maxWidth:width, animation:'fadeUp 0.2s ease', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ fontFamily:T.font, fontSize:16, fontWeight:800, color:T.text1, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.text2, cursor:'pointer', padding:4 }}><XCircle size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const PTable = ({ columns, rows, empty }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
        <tr style={{ borderBottom:`1px solid ${T.border}` }}>
          {columns.map((c,i) => <th key={i} style={{ padding:'11px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:T.text3, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length===0
          ? <tr><td colSpan={columns.length} style={{ textAlign:'center', padding:48, color:T.text2, fontSize:13 }}>{empty||'No records found.'}</td></tr>
          : rows}
      </tbody>
    </table>
  </div>
);

const TR = ({ children, onClick }) => (
  <tr style={{ borderBottom:`1px solid ${T.border}`, cursor:onClick?'pointer':'default', transition:'background 0.15s' }}
    onMouseEnter={e=>e.currentTarget.style.background='var(--dash-row-hover,rgba(59,97,245,0.04))'}
    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
    onClick={onClick}>{children}</tr>
);
const TD = ({ children, mono, muted, style:sx }) => (
  <td style={{ padding:'13px 16px', fontSize:13, color:muted?T.text2:T.text1, fontFamily:mono?T.mono:T.font, verticalAlign:'middle', ...sx }}>{children}</td>
);

const Avatar = ({ name, size=32 }) => {
  const hue = (name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0)%360;
  return <div style={{ width:size, height:size, borderRadius:'50%', background:`hsl(${hue},55%,32%)`, border:`2px solid hsl(${hue},55%,48%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.38, fontWeight:800, color:'#fff', flexShrink:0, fontFamily:T.font }}>
    {(name||'U')[0].toUpperCase()}
  </div>;
};

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position:'relative', marginBottom:16 }}>
    <Search size={14} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:T.text3, pointerEvents:'none' }}/>
    <input style={{ width:'100%', background:T.bgSubtle, border:`1px solid ${T.borderMid}`, borderRadius:11, padding:'10px 14px 10px 36px', color:T.text1, fontSize:13, fontFamily:T.font, outline:'none', boxSizing:'border-box' }}
      placeholder={placeholder||'Search…'} value={value} onChange={onChange}/>
  </div>
);

const SectionHeader = ({ title, subtitle, actions }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
    <div>
      <h2 style={{ fontFamily:T.font, fontSize:19, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', margin:0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize:13, color:T.text2, margin:'4px 0 0' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display:'flex', gap:8 }}>{actions}</div>}
  </div>
);

const ComingSoonPane = ({ label }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:12 }}>
    <div style={{ width:56, height:56, borderRadius:16, background:T.accentGlow, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Zap size={26} color={T.accent}/>
    </div>
    <div style={{ fontFamily:T.font, fontSize:17, fontWeight:800, color:T.text1 }}>{label}</div>
    <div style={{ fontSize:13, color:T.text2 }}>Coming soon — this module is under construction.</div>
  </div>
);

// ─── Logo ─────────────────────────────────────────────────────────────────────
const CredifyLogo = ({ size=32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#logo-g)"/>
    <path d="M20 7 L30 11 L30 21 Q30 29 20 33 Q10 29 10 21 L10 11 Z" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="13" y="16" width="11" height="8" rx="1.5" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3"/>
    <line x1="13" y1="19.5" x2="24" y2="19.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1"/>
    <path d="M17.5 16 L17.5 14.5 Q17.5 13 19 13 Q20.5 13 20.5 14.5 L20.5 16" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M26 14 L28 16.5 L32 12" stroke="#4ade80" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="logo-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b61f5"/><stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── TOP NAVBAR ───────────────────────────────────────────────────────────────
const TopNav = ({ activeModule, setActiveModule, user, onLogout, badges, theme, toggleTheme, role }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const allowedModules = ROLE_MODULES[role] || ROLE_MODULES.admin;

  return (
    <header style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200,
      height:56, background:'var(--navbar-bg, rgba(240,243,255,0.96))',
      backdropFilter:'blur(12px)', borderBottom:`1px solid var(--navbar-border, rgba(59,97,245,0.12))`,
      display:'flex', alignItems:'center', padding:'0 20px', gap:0,
      fontFamily:T.font,
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:28, flexShrink:0 }}>
        <CredifyLogo size={30}/>
        <div>
          <div style={{ fontSize:15, fontWeight:900, color:T.text1, letterSpacing:'-0.03em', lineHeight:1 }}>Credify</div>
          <div style={{ fontSize:9, fontWeight:700, color:T.danger, letterSpacing:'0.1em', textTransform:'uppercase' }}>Admin</div>
        </div>
      </div>

      {/* Module Tabs */}
      <nav style={{ display:'flex', alignItems:'center', gap:2, flex:1, overflow:'auto' }}>
        {MODULES.filter(m => allowedModules.includes(m.id)).map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'7px 13px',
              borderRadius:9, border:'none', cursor:'pointer', fontFamily:T.font,
              fontSize:13, fontWeight: isActive ? 700 : 500, transition:'all 0.18s',
              background: isActive ? T.accentGlow : 'transparent',
              color: isActive ? T.accent : T.text2,
              borderBottom: isActive ? `2px solid ${T.accent}` : '2px solid transparent',
              whiteSpace:'nowrap',
            }}>
              <Icon size={14}/>
              {mod.label}
            </button>
          );
        })}
      </nav>

      {/* Right controls */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        {/* Global Search */}
        <div style={{ position:'relative' }}>
          {searchOpen ? (
            <div style={{ display:'flex', alignItems:'center', background:T.bgSubtle, border:`1px solid ${T.borderMid}`, borderRadius:9, overflow:'hidden' }}>
              <Search size={13} style={{ marginLeft:10, color:T.text3, flexShrink:0 }}/>
              <input autoFocus placeholder="Search users, cards…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                style={{ background:'transparent', border:'none', outline:'none', padding:'8px 10px', fontSize:13, color:T.text1, fontFamily:T.font, width:200 }}
                onBlur={()=>{ if(!searchQ) setSearchOpen(false); }}/>
              {searchQ && <button onClick={()=>{setSearchQ('');setSearchOpen(false);}} style={{ background:'none', border:'none', padding:'0 8px', cursor:'pointer', color:T.text3 }}><X size={12}/></button>}
            </div>
          ) : (
            <button onClick={()=>setSearchOpen(true)} style={{ background:'transparent', border:'none', padding:7, borderRadius:8, cursor:'pointer', color:T.text2, display:'flex' }}>
              <Search size={16}/>
            </button>
          )}
        </div>

        {/* Notification bell */}
        <button style={{ background:'transparent', border:'none', padding:7, borderRadius:8, cursor:'pointer', color:T.text2, display:'flex', position:'relative' }}>
          <Bell size={16}/>
          {(badges.kycPending + badges.fraudAlerts) > 0 && (
            <span style={{ position:'absolute', top:4, right:4, width:7, height:7, borderRadius:'50%', background:T.danger }}/>
          )}
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{ background:'transparent', border:'none', padding:7, borderRadius:8, cursor:'pointer', color:T.text2, display:'flex' }}>
          {theme==='dark' ? <Sun size={16}/> : <Moon size={16}/>}
        </button>

        {/* Refresh */}
        <button style={{ background:'transparent', border:'none', padding:7, borderRadius:8, cursor:'pointer', color:T.text2, display:'flex' }}>
          <RefreshCw size={15}/>
        </button>

        {/* Admin profile */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:10, background:T.accentGlow, border:`1px solid rgba(59,97,245,0.2)`, cursor:'pointer' }} onClick={onLogout}>
          <Avatar name={user?.username||'A'} size={24}/>
          <div style={{ lineHeight:1.2 }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.text1 }}>{user?.username||'Admin'}</div>
            <div style={{ fontSize:9, color:T.accent, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>Admin</div>
          </div>
          <LogOut size={13} color={T.text3}/>
        </div>
      </div>
    </header>
  );
};

// ─── DYNAMIC SIDEBAR ─────────────────────────────────────────────────────────
const Sidebar = ({ module, activeItem, setActiveItem, badges, navigate }) => {
  const mod = MODULES.find(m => m.id === module);
  if (!mod) return null;

  const QUICK_LINKS = [
    { id: '__console__', icon: LayoutDashboard, label: 'Ops Console', to: '/dashboard' },
    { id: '__audit__',   icon: ClipboardList, label: 'Audit Logs',    to: null },
    { id: '__health__',  icon: Cpu,           label: 'System Health', to: null },
    { id: '__dev__',     icon: Terminal,      label: 'Dev Panel',     to: '/dev', adminOnly: true },
  ];

  const getBadge = (key) => {
    if (!key || !badges[key]) return null;
    const v = badges[key];
    if (key==='healthStatus') return (
      <span style={{ fontSize:9, fontWeight:700, background:'rgba(16,185,129,0.15)', color:T.success, padding:'2px 6px', borderRadius:5, letterSpacing:'0.06em' }}>OK</span>
    );
    return <span style={{ minWidth:18, height:18, borderRadius:9, background:T.danger, color:'#fff', fontSize:10, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>{v>99?'99+':v}</span>;
  };

  return (
    <aside style={{
      width:220, flexShrink:0, background:T.bgCard,
      borderRight:`1px solid ${T.border}`,
      display:'flex', flexDirection:'column', height:'calc(100vh - 56px)',
      padding:'16px 10px 12px', overflowY:'auto', position:'sticky', top:56,
    }}>
      {/* Section title */}
      <div style={{ fontSize:9, fontWeight:800, color:T.text3, letterSpacing:'0.14em', padding:'0 8px', marginBottom:10, textTransform:'uppercase' }}>
        {mod.label}
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
        {mod.sidebar.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const badgeEl = item.badge ? getBadge(item.badge) : null;

          // Dev Panel — special link button with distinct styling
          if (item.isLink) {
            return (
              <React.Fragment key={item.id}>
                <div style={{ height:1, background:T.border, margin:'6px 4px' }}/>
                <button onClick={() => navigate(item.to)} style={{
                  display:'flex', alignItems:'center', gap:9, padding:'9px 10px',
                  borderRadius:9, cursor:'pointer', fontFamily:T.font, fontSize:13, fontWeight:700,
                  textAlign:'left', width:'100%', transition:'all 0.14s',
                  background:'rgba(59,97,245,0.08)', border:'1px solid rgba(59,97,245,0.22)',
                  color:'#7b9bff',
                }}>
                  <Icon size={14} style={{ flexShrink:0 }}/>
                  <span style={{ flex:1 }}>{item.label}</span>
                  <span style={{ fontSize:8, fontWeight:800, background:'rgba(59,97,245,0.2)', color:'#7b9bff', padding:'2px 5px', borderRadius:3, letterSpacing:'0.08em' }}>ADMIN</span>
                </button>
              </React.Fragment>
            );
          }

          return (
            <button key={item.id} onClick={() => setActiveItem(item.id)} style={{
              display:'flex', alignItems:'center', gap:9, padding:'9px 10px',
              borderRadius:9, border: isActive ? `1px solid ${T.accent}25` : '1px solid transparent',
              background: isActive ? `${T.accent}12` : 'transparent',
              color: isActive ? T.accent : T.text2,
              cursor:'pointer', fontFamily:T.font, fontSize:13, fontWeight: isActive?700:500,
              transition:'all 0.14s', textAlign:'left', width:'100%',
              borderLeft: isActive ? `3px solid ${T.accent}` : '3px solid transparent',
            }}>
              <Icon size={14} style={{ flexShrink:0 }}/>
              <span style={{ flex:1 }}>{item.label}</span>
              {badgeEl}
              {isActive && !badgeEl && <div style={{ width:4, height:4, borderRadius:'50%', background:T.accent }}/>}
            </button>
          );
        })}
      </nav>

      {/* Quick Links */}
      <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:10, marginTop:8 }}>
        <div style={{ fontSize:9, fontWeight:800, color:T.text3, letterSpacing:'0.12em', padding:'0 8px', marginBottom:8, textTransform:'uppercase' }}>Quick Links</div>
        {QUICK_LINKS.map(ql => {
          const Icon = ql.icon;
          const isDevPanel = ql.id === '__dev__';
          return (
            <button key={ql.id}
              onClick={() => ql.to ? navigate(ql.to) : setActiveItem(ql.id.replace(/__/g,''))}
              style={{
                display:'flex', alignItems:'center', gap:9, padding:'8px 10px',
                borderRadius:8, cursor:'pointer', fontFamily:T.font, fontSize:12, fontWeight: isDevPanel ? 700 : 500,
                transition:'all 0.14s', textAlign:'left', width:'100%',
                // Dev Panel gets a glowing accent button treatment
                background: isDevPanel ? 'rgba(59,97,245,0.1)' : 'transparent',
                border: isDevPanel ? '1px solid rgba(59,97,245,0.2)' : '1px solid transparent',
                color: isDevPanel ? '#7b9bff' : T.text2,
              }}>
              <Icon size={13} style={{ flexShrink:0 }}/>
              <span style={{ flex:1 }}>{ql.label}</span>
              {isDevPanel && (
                <span style={{ fontSize:8, fontWeight:800, background:'rgba(59,97,245,0.2)', color:'#7b9bff', padding:'1px 5px', borderRadius:3, letterSpacing:'0.08em' }}>ADMIN</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

// ─── OPERATIONS MODULE ────────────────────────────────────────────────────────
const OperationsOverview = ({ users, cards, loading }) => {
  const pending     = users.filter(u=>u.kyc_status==='pending'||!u.kyc_status).length;
  const verified    = users.filter(u=>u.kyc_status==='verified').length;
  const activeCards = cards.filter(c=>c.status==='active').length;
  const blocked     = cards.filter(c=>c.status==='blocked').length;
  const totalCredit = cards.reduce((s,c)=>s+Number(c.credit_limit||0),0);

  return (
    <div>
      <SectionHeader title="Operations Overview" subtitle="Platform-wide health at a glance"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:14, marginBottom:24 }}>
        <MetricCard label="Total Users"   value={loading?'—':users.length}  icon={Users}      accent={T.accent}   trend={12} delay={0}/>
        <MetricCard label="KYC Pending"   value={loading?'—':pending}       icon={ShieldAlert} accent={T.warning}  trend={-3} delay={80}/>
        <MetricCard label="Active Cards"  value={loading?'—':activeCards}   icon={CreditCard}  accent={T.success}  trend={8}  delay={160}/>
        <MetricCard label="Blocked Cards" value={loading?'—':blocked}       icon={XCircle}     accent={T.danger}   delay={240}/>
        <MetricCard label="Total Credit"  value={loading?'—':`₹${(totalCredit/100000).toFixed(1)}L`} icon={DollarSign} accent={T.purple} sub="across all cards" delay={320}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ ...card({ padding:0, overflow:'hidden' }) }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:T.font, fontSize:14, fontWeight:700, color:T.text1 }}>Recent Users</span>
            <Users size={14} color={T.text3}/>
          </div>
          {loading ? <div style={{ padding:32, textAlign:'center' }}><Spinner/></div> : (
            <PTable columns={['User','KYC','Status']} rows={users.slice(0,6).map((u,i)=>(
              <TR key={i}>
                <TD><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar name={u.username} size={26}/><span style={{ fontWeight:600, fontSize:13 }}>{u.username}</span></div></TD>
                <TD><StatusPill status={u.kyc_status||'unverified'}/></TD>
                <TD><StatusPill status={u.is_active!==false?'active':'inactive'}/></TD>
              </TR>
            ))}/>
          )}
        </div>
        <div style={{ ...card({ padding:0, overflow:'hidden' }) }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:T.font, fontSize:14, fontWeight:700, color:T.text1 }}>Recent Cards</span>
            <CreditCard size={14} color={T.text3}/>
          </div>
          {loading ? <div style={{ padding:32, textAlign:'center' }}><Spinner/></div> : (
            <PTable columns={['Card','Limit','Status']} rows={cards.slice(0,6).map((c,i)=>(
              <TR key={i}>
                <TD mono style={{ fontSize:12 }}><span style={{ color:T.text3 }}>••••</span> {c.card_number?.slice(-4)||'****'}</TD>
                <TD mono muted>₹{Number(c.credit_limit||0).toLocaleString()}</TD>
                <TD><StatusPill status={c.status||'active'}/></TD>
              </TR>
            ))}/>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ users, loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [reactivateModal, setReactivateModal] = useState(false);
  const [reactivateForm, setReactivateForm] = useState({ request_id:'', status:'approved', admin_comments:'' });

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.id).includes(search)
  );

  const openEdit = (u) => {
    setSelected(u);
    setEditForm({ username:u.username, email:u.email, phone_number:u.phone_number||'', address:u.address||'' });
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try { await adminAPI.updateUser(selected.id, editForm); toast.success('User updated.'); setEditModal(false); onRefresh(); }
    catch(err){ toast.error(err.message); }
  };

  const handleReactivate = async (e) => {
    e.preventDefault();
    try { await adminAPI.reviewReactivation(reactivateForm); toast.success('Processed.'); setReactivateModal(false); onRefresh(); }
    catch(err){ toast.error(err.message); }
  };

  return (
    <div>
      <SectionHeader title="User Management" subtitle={`${users.length} registered users`}
        actions={<Btn variant="ghost" onClick={()=>setReactivateModal(true)}><UserCheck size={13}/> Reactivation</Btn>}/>
      <SearchBar value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, or ID…"/>
      <div style={{ ...card({ padding:0, overflow:'hidden' }) }}>
        {loading ? <div style={{ padding:48, textAlign:'center' }}><Spinner size={24}/></div> : (
          <PTable columns={['User','ID','Email','Phone','KYC','Account','Joined','Actions']} empty="No users found."
            rows={filtered.map(u=>(
              <TR key={u.id}>
                <TD><div style={{ display:'flex', alignItems:'center', gap:9 }}><Avatar name={u.username} size={30}/><div><div style={{ fontWeight:700, fontSize:13 }}>{u.username}</div></div></div></TD>
                <TD mono muted><div style={{ display:'flex', alignItems:'center', gap:4 }}><Hash size={10} color={T.text3}/>{u.id}</div></TD>
                <TD muted style={{ fontSize:12 }}>{u.email}</TD>
                <TD muted style={{ fontSize:12 }}>{u.phone_number||'—'}</TD>
                <TD><StatusPill status={u.kyc_status||'unverified'}/></TD>
                <TD><StatusPill status={u.is_active!==false?'active':'inactive'}/></TD>
                <TD muted style={{ fontSize:11 }}>{u.date_joined?new Date(u.date_joined).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</TD>
                <TD><div style={{ display:'flex', gap:5 }}>
                  <Btn size="sm" variant="ghost" onClick={()=>openEdit(u)}><Eye size={11}/> Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={async()=>{ try{ await adminAPI.deleteUser(u.id); toast.success('Deactivated.'); onRefresh(); }catch(err){ toast.error(err.message); } }}><UserX size={11}/> Deactivate</Btn>
                </div></TD>
              </TR>
            ))}
          />
        )}
      </div>

      <PModal open={editModal} onClose={()=>setEditModal(false)} title={`Edit: ${selected?.username}`}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[{key:'username',label:'Username'},{key:'email',label:'Email'},{key:'phone_number',label:'Phone'},{key:'address',label:'Address'}].map(({key,label})=>(
            <Input key={key} label={label} value={editForm[key]||''} onChange={e=>setEditForm(s=>({...s,[key]:e.target.value}))}/>
          ))}
          <Btn variant="primary" onClick={handleEdit} style={{ justifyContent:'center' }}>Save Changes</Btn>
        </div>
      </PModal>

      <PModal open={reactivateModal} onClose={()=>setReactivateModal(false)} title="Review Reactivation Request">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Request ID" type="number" placeholder="Enter request ID" value={reactivateForm.request_id} onChange={e=>setReactivateForm(s=>({...s,request_id:e.target.value}))}/>
          <Select label="Decision" value={reactivateForm.status} onChange={e=>setReactivateForm(s=>({...s,status:e.target.value}))}>
            <option value="approved">Approve</option><option value="rejected">Reject</option>
          </Select>
          <Textarea label="Admin Comments" rows={3} value={reactivateForm.admin_comments} onChange={e=>setReactivateForm(s=>({...s,admin_comments:e.target.value}))}/>
          <Btn variant="primary" onClick={handleReactivate} style={{ justifyContent:'center' }}>Submit Decision</Btn>
        </div>
      </PModal>
    </div>
  );
};

const KYCTab = ({ users, loading, onRefresh }) => {
  const [filter, setFilter] = useState('pending');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ user_id:'', kyc_status:'verified', reviewer_comments:'' });
  const [submitting, setSubmitting] = useState(false);

  const groups = {
    pending:  users.filter(u=>!u.kyc_status||u.kyc_status==='pending'||u.kyc_status==='unverified'),
    verified: users.filter(u=>u.kyc_status==='verified'),
    rejected: users.filter(u=>u.kyc_status==='rejected'),
  };
  const shown = groups[filter]||[];

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await adminAPI.reviewKYC({...form, user_id:Number(form.user_id)}); toast.success('KYC decision submitted.'); setModal(false); onRefresh(); }
    catch(err){ toast.error(err.message); }
    finally{ setSubmitting(false); }
  };

  const quickReview = (uid, status) => {
    setForm({ user_id:String(uid), kyc_status:status, reviewer_comments: status==='verified'?'Document valid':'Document rejected' });
    setModal(true);
  };

  return (
    <div>
      <SectionHeader title="KYC Review" subtitle={`${groups.pending.length} pending · ${groups.verified.length} verified · ${groups.rejected.length} rejected`}
        actions={<Btn variant="primary" onClick={()=>{ setForm({user_id:'',kyc_status:'verified',reviewer_comments:''}); setModal(true); }}><Shield size={13}/> Manual Review</Btn>}/>
      
      <div style={{ display:'flex', gap:4, marginBottom:16, padding:4, background:T.bgBase, borderRadius:12, width:'fit-content', border:`1px solid ${T.border}` }}>
        {[{id:'pending',label:`Pending (${groups.pending.length})`,c:T.warning},{id:'verified',label:`Verified (${groups.verified.length})`,c:T.success},{id:'rejected',label:`Rejected (${groups.rejected.length})`,c:T.danger}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{ padding:'6px 14px', borderRadius:9, border:'none', cursor:'pointer', background:filter===f.id?T.bgCard:'transparent', color:filter===f.id?f.c:T.text2, fontFamily:T.font, fontSize:12, fontWeight:700, transition:'all 0.15s', boxShadow:filter===f.id?`0 0 0 1px ${f.c}30`:'' }}>{f.label}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign:'center', padding:48 }}><Spinner size={24}/></div> : shown.length===0 ? (
        <div style={{ ...card({ padding:48 }), textAlign:'center' }}>
          <CheckCircle2 size={36} color={T.success} style={{ margin:'0 auto 12px' }}/>
          <div style={{ fontFamily:T.font, fontSize:15, fontWeight:700, color:T.text1, marginBottom:4 }}>All caught up!</div>
          <div style={{ color:T.text2, fontSize:13 }}>No {filter} KYC reviews.</div>
        </div>
      ) : (
        <div style={{ ...card({ padding:0, overflow:'hidden' }) }}>
          <PTable columns={['User','ID','Email','KYC Status','Joined','Actions']}
            rows={shown.map(u=>(
              <TR key={u.id}>
                <TD><div style={{ display:'flex', alignItems:'center', gap:9 }}><Avatar name={u.username} size={29}/><span style={{ fontWeight:600, fontSize:13 }}>{u.username}</span></div></TD>
                <TD mono muted><div style={{ display:'flex', alignItems:'center', gap:4 }}><Hash size={10} color={T.text3}/>{u.id}</div></TD>
                <TD muted style={{ fontSize:12 }}>{u.email}</TD>
                <TD><StatusPill status={u.kyc_status||'unverified'}/></TD>
                <TD muted style={{ fontSize:11 }}>{u.date_joined?new Date(u.date_joined).toLocaleDateString('en-IN'):'—'}</TD>
                <TD><div style={{ display:'flex', gap:5 }}>
                  <Btn size="sm" variant="success" onClick={()=>quickReview(u.id,'verified')}><CheckCircle2 size={11}/> Approve</Btn>
                  <Btn size="sm" variant="danger" onClick={()=>quickReview(u.id,'rejected')}><XCircle size={11}/> Reject</Btn>
                </div></TD>
              </TR>
            ))}
          />
        </div>
      )}

      <PModal open={modal} onClose={()=>setModal(false)} title="KYC Review Decision" width={420}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="User ID" type="number" placeholder="Enter user ID" value={form.user_id} onChange={e=>setForm(s=>({...s,user_id:e.target.value}))}/>
          <Select label="Decision" value={form.kyc_status} onChange={e=>setForm(s=>({...s,kyc_status:e.target.value}))}>
            <option value="verified">Verified</option><option value="rejected">Rejected</option><option value="pending">Pending</option>
          </Select>
          <Textarea label="Comments" rows={3} value={form.reviewer_comments} onChange={e=>setForm(s=>({...s,reviewer_comments:e.target.value}))}/>
          <Btn variant="primary" onClick={handleSubmit} disabled={submitting} style={{ justifyContent:'center' }}>
            {submitting?<><Spinner size={13} color="#fff"/> Submitting…</>:'Submit Decision'}
          </Btn>
        </div>
      </PModal>
    </div>
  );
};

const CardsTab = ({ cards, loading, onRefresh }) => {
  const [search, setSearch]   = useState('');
  const [approveModal, setApproveModal] = useState(false);
  const [approveForm, setApproveForm]   = useState({ request_id:'', approve:true });
  const [actionLoading, setActionLoading] = useState({});

  const filtered = cards.filter(c =>
    c.card_number?.includes(search) ||
    String(c.cardholder_name||c.user||'').toLowerCase().includes(search.toLowerCase()) ||
    String(c.id).includes(search)
  );

  const doAction = async (card, action) => {
    setActionLoading(s=>({...s,[card.id]:action}));
    try { await adminAPI[action+'Card'](card.id); toast.success(`Card ${action}d.`); onRefresh(); }
    catch(err){ toast.error(err.message); }
    finally{ setActionLoading(s=>({...s,[card.id]:null})); }
  };

  const handleApprove = async () => {
    try { await adminAPI.approveCardReq({ request_id:Number(approveForm.request_id), approve:approveForm.approve }); toast.success('Done.'); setApproveModal(false); onRefresh(); }
    catch(err){ toast.error(err.message); }
  };

  const typeBadge = (type) => {
    const map={ Platinum:'#C0A060', Gold:'#D4A017', Silver:'#A0A0B0', Basic:T.text2 };
    const c=map[type]||T.text2;
    return <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:700, color:c, background:`${c}18`, border:`1px solid ${c}30`, padding:'2px 8px', borderRadius:5 }}>{type||'Basic'}</span>;
  };

  return (
    <div>
      <SectionHeader title="Card Management" subtitle={`${cards.length} total cards`}
        actions={<Btn variant="primary" onClick={()=>setApproveModal(true)}><CheckCircle2 size={13}/> Review Request</Btn>}/>
      <SearchBar value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by card number, holder, or ID…"/>
      <div style={{ ...card({ padding:0, overflow:'hidden' }) }}>
        {loading ? <div style={{ padding:48, textAlign:'center' }}><Spinner size={24}/></div> : (
          <PTable columns={['Card','ID','Holder','Type','Limit','Available','Status','Actions']} empty="No cards found."
            rows={filtered.map(c=>(
              <TR key={c.id}>
                <TD mono style={{ fontSize:12 }}><span style={{ color:T.text3 }}>•••• •••• ••••</span> {c.card_number?.slice(-4)||'****'}</TD>
                <TD mono muted><div style={{ display:'flex', alignItems:'center', gap:4 }}><Hash size={10} color={T.text3}/>{c.id}</div></TD>
                <TD><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar name={c.cardholder_name||c.user} size={26}/><span style={{ fontSize:13 }}>{c.cardholder_name||c.user||'—'}</span></div></TD>
                <TD>{typeBadge(c.card_type)}</TD>
                <TD mono style={{ fontSize:12 }}>₹{Number(c.credit_limit||0).toLocaleString()}</TD>
                <TD mono style={{ fontSize:12, color:T.success }}>₹{Number(c.available_credit||0).toLocaleString()}</TD>
                <TD><StatusPill status={c.status||'active'}/></TD>
                <TD><div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {c.status==='active'  && <Btn size="sm" variant="ghost"   disabled={!!actionLoading[c.id]} onClick={()=>doAction(c,'freeze')}><Lock size={10}/> Freeze</Btn>}
                  {c.status==='frozen'  && <Btn size="sm" variant="success" disabled={!!actionLoading[c.id]} onClick={()=>doAction(c,'unfreeze')}><Unlock size={10}/> Unfreeze</Btn>}
                  {c.status!=='blocked' && <Btn size="sm" variant="danger"  disabled={!!actionLoading[c.id]} onClick={()=>doAction(c,'block')}><XCircle size={10}/> Block</Btn>}
                  {c.status==='blocked' && <Btn size="sm" variant="success" onClick={()=>doAction(c,'unblock')}><Unlock size={10}/> Unblock</Btn>}
                </div></TD>
              </TR>
            ))}
          />
        )}
      </div>

      <PModal open={approveModal} onClose={()=>setApproveModal(false)} title="Review Card Request" width={400}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Request ID" type="number" placeholder="Enter request ID" value={approveForm.request_id} onChange={e=>setApproveForm(s=>({...s,request_id:e.target.value}))}/>
          <Select label="Decision" value={String(approveForm.approve)} onChange={e=>setApproveForm(s=>({...s,approve:e.target.value==='true'}))}>
            <option value="true">Approve</option><option value="false">Reject</option>
          </Select>
          <Btn variant="primary" onClick={handleApprove} style={{ justifyContent:'center' }}>Submit Decision</Btn>
        </div>
      </PModal>
    </div>
  );
};

const TransactionsTab = () => <ComingSoonPane label="Transactions"/>;

// ─── ANALYTICS MODULE ─────────────────────────────────────────────────────────
const AnalyticsKPI = ({ users, cards }) => {
  const kycB = { verified:users.filter(u=>u.kyc_status==='verified').length, pending:users.filter(u=>u.kyc_status==='pending'||!u.kyc_status).length, rejected:users.filter(u=>u.kyc_status==='rejected').length };
  const cardB = { active:cards.filter(c=>c.status==='active').length, frozen:cards.filter(c=>c.status==='frozen').length, blocked:cards.filter(c=>c.status==='blocked').length };
  const total = cards.reduce((s,c)=>s+Number(c.credit_limit||0),0);
  const kycRate = users.length>0 ? Math.round((kycB.verified/users.length)*100) : 0;

  const Bar = ({ label, value, max, color }) => {
    const pct = max>0 ? Math.min(100,(value/max)*100) : 0;
    return (
      <div style={{ marginBottom:13 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
          <span style={{ color:T.text2 }}>{label}</span>
          <div style={{ display:'flex', gap:8 }}><span style={{ color:T.text3, fontSize:11, fontFamily:T.mono }}>{pct.toFixed(0)}%</span><span style={{ fontWeight:800, color:T.text1, fontFamily:T.mono }}>{value}</span></div>
        </div>
        <div style={{ height:5, borderRadius:3, background:'rgba(0,0,0,0.07)', overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', borderRadius:3, background:color, transition:'width 800ms cubic-bezier(0.16,1,0.3,1)', boxShadow:`0 0 6px ${color}40` }}/>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SectionHeader title="KPI Dashboard" subtitle="Live platform metrics and analytics"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Total Users',   value:users.length,    accent:T.accent,   icon:Users },
          { label:'Active Cards',  value:cardB.active,    accent:T.success,  icon:CreditCard },
          { label:'KYC Rate',      value:`${kycRate}%`,   accent:T.success,  icon:Shield },
          { label:'Pending KYC',   value:kycB.pending,    accent:T.warning,  icon:Clock },
          { label:'Total Credit',  value:`₹${(total/100000).toFixed(2)}L`, accent:T.purple, icon:DollarSign },
          { label:'Blocked Cards', value:cardB.blocked,   accent:T.danger,   icon:XCircle },
        ].map(({label,value,accent,icon:Icon})=>(
          <div key={label} style={{ ...card({ padding:'16px 18px' }) }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`${accent}15`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}><Icon size={13} color={accent}/></div>
            <div style={{ fontSize:22, fontWeight:800, color:accent, fontFamily:T.font, letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:11, color:T.text3, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
        <div style={{ ...card({ padding:22 }) }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}><Shield size={13} color={T.accent}/><span style={{ fontFamily:T.font, fontSize:13, fontWeight:700, color:T.text1 }}>KYC Status</span></div>
          <Bar label="Verified" value={kycB.verified} max={users.length} color={T.success}/>
          <Bar label="Pending"  value={kycB.pending}  max={users.length} color={T.warning}/>
          <Bar label="Rejected" value={kycB.rejected} max={users.length} color={T.danger}/>
        </div>
        <div style={{ ...card({ padding:22 }) }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}><CreditCard size={13} color={T.success}/><span style={{ fontFamily:T.font, fontSize:13, fontWeight:700, color:T.text1 }}>Card Status</span></div>
          <Bar label="Active"  value={cardB.active}  max={Math.max(cards.length,1)} color={T.success}/>
          <Bar label="Frozen"  value={cardB.frozen}  max={Math.max(cards.length,1)} color="#60A5FA"/>
          <Bar label="Blocked" value={cardB.blocked} max={Math.max(cards.length,1)} color={T.danger}/>
        </div>
        <div style={{ ...card({ padding:22 }) }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}><BarChart3 size={13} color={T.purple}/><span style={{ fontFamily:T.font, fontSize:13, fontWeight:700, color:T.text1 }}>Card Types</span></div>
          {['Basic','Silver','Gold','Platinum'].map(type=>{
            const count=cards.filter(c=>c.card_type===type).length;
            const c={Basic:'#60A5FA',Silver:'#94a3b8',Gold:T.warning,Platinum:T.purple}[type];
            return <Bar key={type} label={type} value={count} max={Math.max(...['Basic','Silver','Gold','Platinum'].map(t=>cards.filter(c=>c.card_type===t).length),1)} color={c}/>;
          })}
        </div>
      </div>
    </div>
  );
};

// ─── SUPPORT MODULE ───────────────────────────────────────────────────────────
// Strip "REQ-" prefix so we always send the numeric ID to the backend
const parseReqId = (req) =>
  String(req?.request_id || req?.id || '').replace(/^REQ-/i, '');

const RequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail]     = useState(null);
  const [actionForm, setActionForm] = useState({ status:'in_process', admin_comment:'' });
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? { status:filter } : {};
      const res = await requestsAPI.listAll(params);
      setRequests(Array.isArray(res.data)?res.data:res.data?.results||[]);
    } catch(err){ toast.error(err.message); }
    finally{ setLoading(false); }
  }, [filter]);

  useEffect(()=>{ load(); }, [load]);

  const openDetail = async (req) => {
    setSelected(req); setDetailLoading(true); setDetail(null);
    try {
      const res = await requestsAPI.adminDetail(parseReqId(req));
      setDetail(res.data);
    } catch(err){ toast.error(err.message); }
    finally{ setDetailLoading(false); }
  };

  const handleAction = async () => {
    setSubmitting(true);
    try {
      await requestsAPI.takeAction(parseReqId(selected), actionForm);
      toast.success('Action taken.');
      setSelected(null); load();
    } catch(err){ toast.error(err.message); }
    finally{ setSubmitting(false); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await requestsAPI.adminComment(parseReqId(selected), { body:commentText, is_internal:false });
      toast.success('Comment added.');
      setCommentText('');
      openDetail(selected);
    } catch(err){ toast.error(err.message); }
    finally{ setSubmitting(false); }
  };

  const filtered = requests.filter(r =>
    (r.user_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (r.request_type||'').toLowerCase().includes(search.toLowerCase()) ||
    String(r.request_id||r.id).includes(search)
  );

  return (
    <div>
      <SectionHeader title="Requests / Approvals" subtitle={`${requests.length} total requests`}
        actions={<Btn variant="ghost" onClick={load}><RefreshCw size={13}/> Refresh</Btn>}/>
      
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <SearchBar value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by user or type…"/>
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          {[{v:'',l:'All'},{v:'raised',l:'Raised'},{v:'in_process',l:'In Process'},{v:'completed',l:'Completed'},{v:'rejected',l:'Rejected'}].map(f=>(
            <button key={f.v} onClick={()=>setFilter(f.v)} style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', background:filter===f.v?T.accentGlow:T.bgSubtle, color:filter===f.v?T.accent:T.text2, fontFamily:T.font, fontSize:12, fontWeight:700, transition:'all 0.14s' }}>{f.l}</button>
          ))}
        </div>
      </div>

      <div style={{ ...card({ padding:0, overflow:'hidden' }) }}>
        {loading ? <div style={{ padding:48, textAlign:'center' }}><Spinner size={24}/></div> : (
          <PTable columns={['ID','User','Type','Status','Created','Actions']} empty="No requests found."
            rows={filtered.map(r=>(
              <TR key={r.request_id||r.id} onClick={()=>openDetail(r)}>
                <TD mono muted style={{ fontSize:11 }}>{r.request_id||r.id}</TD>
                <TD><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar name={r.user_name} size={26}/><div><div style={{ fontWeight:600, fontSize:13 }}>{r.user_name||'—'}</div><div style={{ fontSize:11, color:T.text3 }}>{r.user_email}</div></div></div></TD>
                <TD style={{ fontSize:12 }}>{(r.request_type||'').replace(/_/g,' ')}</TD>
                <TD><StatusPill status={r.status}/></TD>
                <TD muted style={{ fontSize:11 }}>{r.created_at?new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}):'—'}</TD>
                <TD><Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();openDetail(r);}}><Eye size={11}/> View</Btn></TD>
              </TR>
            ))}
          />
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', zIndex:500, display:'flex', justifyContent:'flex-end' }} onClick={()=>setSelected(null)}>
          <div style={{ width:480, height:'100%', background:T.bgCard, borderLeft:`1px solid ${T.border}`, overflowY:'auto', padding:24, animation:'slideIn 0.25s ease' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:T.font, fontSize:16, fontWeight:800, color:T.text1, margin:0 }}>Request #{selected.request_id||selected.id}</h2>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:T.text2 }}><X size={18}/></button>
            </div>

            {detailLoading ? <div style={{ textAlign:'center', padding:48 }}><Spinner size={24}/></div> : (
              <>
                <div style={{ ...card({ padding:14 }), marginBottom:16 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      {l:'User',v:selected.user_name},
                      {l:'Email',v:selected.user_email},
                      {l:'Type',v:(selected.request_type||'').replace(/_/g,' ')},
                      {l:'Status',v:<StatusPill status={selected.status}/>},
                    ].map(({l,v})=>(
                      <div key={l}>
                        <div style={{ fontSize:10, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:13, color:T.text1, fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {selected.description && <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Description</div>
                    <div style={{ fontSize:13, color:T.text2, lineHeight:1.5 }}>{selected.description}</div>
                  </div>}
                </div>

                {/* Action */}
                <div style={{ ...card({ padding:16 }), marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text1, marginBottom:12 }}>Take Action</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <Select label="Update Status" value={actionForm.status} onChange={e=>setActionForm(s=>({...s,status:e.target.value}))}>
                      <option value="in_process">In Process</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                    <Textarea label="Admin Comment" rows={2} value={actionForm.admin_comment} onChange={e=>setActionForm(s=>({...s,admin_comment:e.target.value}))} placeholder="Add a note for the user…"/>
                    <Btn variant="primary" onClick={handleAction} disabled={submitting} style={{ justifyContent:'center' }}>
                      {submitting?<><Spinner size={13} color="#fff"/> Processing…</>:'Submit Action'}
                    </Btn>
                  </div>
                </div>

                {/* Comment */}
                <div style={{ ...card({ padding:16 }) }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.text1, marginBottom:12 }}>Add Comment</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Write a comment…"
                      style={{ flex:1, background:T.bgSubtle, border:`1px solid ${T.borderMid}`, borderRadius:8, padding:'9px 12px', color:T.text1, fontSize:13, fontFamily:T.font, outline:'none' }}/>
                    <Btn variant="primary" onClick={handleComment} disabled={submitting||!commentText.trim()}><Send size={13}/></Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DEV PANEL LAUNCHER ───────────────────────────────────────────────────────
const DEV_TOOLS = [
  { icon: Database,      label: 'DB Tables',       desc: 'Browse and inspect all database tables',     to: '/dev/tables',     color: T.accent   },
  { icon: Terminal,      label: 'Query Runner',     desc: 'Run raw SQL queries on the database',        to: '/dev/query',      color: '#7c3aed'  },
  { icon: Zap,           label: 'API Debugger',     desc: 'Test and trace any backend API endpoint',    to: '/dev/api',        color: T.teal     },
  { icon: ClipboardList, label: 'Audit Logs',       desc: 'View all system-level audit events',         to: '/dev/logs',       color: T.warning  },
  { icon: Activity,      label: 'Celery Tasks',     desc: 'Monitor async task queue and workers',       to: '/dev/tasks',      color: T.success  },
  { icon: AlertTriangle, label: 'Sentry Errors',    desc: 'Live error tracking and stack traces',       to: '/dev/sentry',     color: T.danger   },
  { icon: Database,      label: 'Migrations',       desc: 'Check Django migration status',              to: '/dev/migrations', color: '#0891b2'  },
  { icon: Cpu,           label: 'Redis Inspector',  desc: 'Inspect Redis keys, queues, and memory',    to: '/dev/redis',      color: '#e11d48'  },
  { icon: Settings,      label: 'Env Config',       desc: 'View environment variables and settings',   to: '/dev/config',     color: '#64748b'  },
  { icon: BarChart3,     label: 'Index Health',     desc: 'Analyze database index performance',        to: '/dev/indexes',    color: '#d97706'  },
];

const DevPanelLauncher = ({ navigate }) => (
  <div>
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'rgba(59,97,245,0.12)', border:'1px solid rgba(59,97,245,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Terminal size={20} color={T.accent}/>
          </div>
          <div>
            <h1 style={{ fontFamily:T.font, fontSize:22, fontWeight:900, color:T.text1, letterSpacing:'-0.03em', margin:0 }}>Dev Panel</h1>
            <div style={{ fontSize:12, color:T.text3, marginTop:2 }}>Internal developer tools — Admin only</div>
          </div>
        </div>
      </div>
      <Btn variant="primary" onClick={() => navigate('/dev')} style={{ gap:8 }}>
        <Terminal size={13}/> Open Full Dev Panel <ChevronRight size={13}/>
      </Btn>
    </div>

    {/* Warning banner */}
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderRadius:12, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', marginBottom:24 }}>
      <AlertTriangle size={16} color={T.warning} style={{ flexShrink:0, marginTop:1 }}/>
      <div style={{ fontSize:13, color:T.text2, lineHeight:1.5 }}>
        <span style={{ fontWeight:700, color:T.warning }}>Admin only.</span> These tools provide direct access to database tables, raw query execution, and live system configuration. Use with caution in production.
      </div>
    </div>

    {/* Tool cards grid */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
      {DEV_TOOLS.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <button key={tool.to} onClick={() => navigate(tool.to)} style={{
            ...card({ padding:'18px 20px' }),
            textAlign:'left', cursor:'pointer', fontFamily:T.font,
            display:'flex', alignItems:'flex-start', gap:14,
            transition:'all 0.18s', animation:`fadeUp 0.4s ease ${i * 40}ms both`,
            border:`1px solid ${T.border}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 28px ${tool.color}18`; e.currentTarget.style.borderColor=`${tool.color}40`; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor=T.border; }}
          >
            <div style={{ width:38, height:38, borderRadius:10, background:`${tool.color}14`, border:`1px solid ${tool.color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={17} color={tool.color}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.text1, marginBottom:4 }}>{tool.label}</div>
              <div style={{ fontSize:12, color:T.text3, lineHeight:1.5 }}>{tool.desc}</div>
            </div>
            <ChevronRight size={14} color={T.text3} style={{ flexShrink:0, marginTop:2 }}/>
          </button>
        );
      })}
    </div>

    {/* Quick launch full panel */}
    <div style={{ ...card({ padding:'18px 22px' }), marginTop:20, display:'flex', alignItems:'center', gap:16, background:`${T.accent}08`, border:`1px solid ${T.accent}20` }}>
      <div style={{ width:42, height:42, borderRadius:12, background:`${T.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Terminal size={20} color={T.accent}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:700, color:T.text1, marginBottom:3 }}>Open Full Dev Panel</div>
        <div style={{ fontSize:12, color:T.text3 }}>Switch to the dedicated developer dashboard with all tools in one view.</div>
      </div>
      <Btn variant="primary" onClick={() => navigate('/dev')}>
        Launch <ChevronRight size={13}/>
      </Btn>
    </div>
  </div>
);

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { isAdmin, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(()=>{ if (!isAdmin) navigate('/dashboard'); }, [isAdmin]);

  const [activeModule, setActiveModule] = useState('operations');
  const [activeItem, setActiveItem]     = useState('overview');
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme')||'light');

  // Badges / notification counts
  const [badges, setBadges] = useState({ kycPending:0, fraudAlerts:0, openTickets:0, healthStatus:'ok' });

  const role = 'admin'; // In real app: derive from user.role

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        adminAPI.listUsers().catch(()=>({ data:[] })),
        adminAPI.listAllCards().catch(()=>({ data:[] })),
      ]);
      const u = Array.isArray(uRes.data)?uRes.data:uRes.data?.results||[];
      const c = Array.isArray(cRes.data)?cRes.data:cRes.data?.results||[];
      setUsers(u);
      setCards(c);
      const kycPending = u.filter(x=>!x.kyc_status||x.kyc_status==='pending').length;
      setBadges(b=>({...b, kycPending, healthStatus:'ok'}));
    } catch { toast.error('Failed to load admin data.'); }
    finally{ setLoading(false); }
  }, []);

  useEffect(()=>{ fetchAll(); }, [fetchAll]);

  // When module changes, set default sidebar item
  const handleModuleChange = (mod) => {
    setActiveModule(mod);
    const m = MODULES.find(x=>x.id===mod);
    if (m?.sidebar?.[0]) setActiveItem(m.sidebar[0].id);
  };

  const toggleTheme = () => {
    const next = theme==='dark'?'light':'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Content resolver ────────────────────────────────────────────────────────
  const renderContent = () => {
    // Operations
    if (activeModule==='operations') {
      if (activeItem==='overview')     return <OperationsOverview users={users} cards={cards} loading={loading}/>;
      if (activeItem==='users')        return <UsersTab users={users} loading={loading} onRefresh={fetchAll}/>;
      if (activeItem==='kyc')          return <KYCTab users={users} loading={loading} onRefresh={fetchAll}/>;
      if (activeItem==='cards')        return <CardsTab cards={cards} loading={loading} onRefresh={fetchAll}/>;
      if (activeItem==='transactions') return <TransactionsTab/>;
    }
    // Analytics
    if (activeModule==='analytics') {
      if (activeItem==='kpi') return <AnalyticsKPI users={users} cards={cards}/>;
      return <ComingSoonPane label={activeItem}/>;
    }
    // Support
    if (activeModule==='support') {
      if (activeItem==='requests') return <RequestsTab/>;
      return <ComingSoonPane label={activeItem}/>;
    }
    // System — Dev Panel gets a launch card
    if (activeModule==='system') {
      if (activeItem==='__devpanel__') return <DevPanelLauncher navigate={navigate}/>;
      return <ComingSoonPane label={activeItem}/>;
    }
    // Catch-all for modules under construction
    return <ComingSoonPane label={activeItem}/>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes pulse2 { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 60%{box-shadow:0 0 0 7px rgba(239,68,68,0)} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(59,97,245,0.2); border-radius:2px; }
        input::placeholder,textarea::placeholder { color:var(--text-muted); }
        select option { background:var(--bg-card); color:var(--text-primary); }
        button:active { transform:scale(0.97); }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:T.bgBase, fontFamily:T.font }}>
        <TopNav
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
          user={user}
          onLogout={handleLogout}
          badges={badges}
          theme={theme}
          toggleTheme={toggleTheme}
          role={role}
        />

        <div style={{ display:'flex', marginTop:56, minHeight:'calc(100vh - 56px)' }}>
          <Sidebar
            module={activeModule}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            badges={badges}
            navigate={navigate}
          />

          <main style={{ flex:1, overflowY:'auto', padding:'28px 28px 48px', minWidth:0 }}>
            <div style={{ maxWidth:1200, margin:'0 auto', animation:'fadeUp 0.3s ease' }}>
              {/* Breadcrumb */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20, fontSize:12, color:T.text3 }}>
                <span style={{ fontWeight:700, color:T.accent, textTransform:'capitalize' }}>{activeModule}</span>
                <ChevronRight size={12}/>
                <span style={{ textTransform:'capitalize' }}>{(activeItem||'').replace(/-/g,' ')}</span>
                <div style={{ flex:1 }}/>
                <div style={{ fontSize:11, color:T.text3 }}>Updated {new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                <Btn variant="ghost" size="sm" onClick={fetchAll}><RefreshCw size={11}/> Refresh</Btn>
              </div>

              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;