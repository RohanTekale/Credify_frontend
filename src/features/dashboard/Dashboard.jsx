// src/features/dashboard/Dashboard.jsx — Credify World-Class User Dashboard
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, TrendingUp, Shield,
  Bell, User, LogOut, Plus, Eye, EyeOff, Lock,
  Unlock, XCircle, RefreshCw, Upload, CheckCircle2,
  AlertTriangle, ChevronRight, ArrowUpRight, ArrowDownLeft,
  Zap, Sparkles, Gift, Activity, Search, Settings,
  MoreHorizontal, ArrowRight, Globe, Star,
  FileText, MessageSquare, Filter, RotateCcw, Paperclip, Send,
  Clock, AlertCircle, CheckCheck,
} from 'lucide-react';
import { cardAPI, transactionAPI, userAPI, requestsAPI } from '../../services/api';
import {
  Spinner, Badge, Modal, Confirm, PageHeader,
  DataTable, TR, TD, EmptyState, Field, Button, Select,
  Avatar, Card, useToast, SearchInput,
} from '../../components/ui';
import useAuthStore from '../../store/authStore';

// ── Animated counter ──────────────────────────────────────────────────────────
const useCounter = (target, dur = 1200, go = false) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!go || !target) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, dur, go]);
  return v;
};

// ── Animated progress bar ─────────────────────────────────────────────────────
const ProgressBar = ({ pct, color, delay = 0, height = 5 }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay + 300); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height, borderRadius: 99, background: 'var(--progress-track)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${w}%`, borderRadius: 99, background: color, transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 8px ${color}55` }} />
    </div>
  );
};

// ── Mini sparkline ────────────────────────────────────────────────────────────
const Spark = ({ data, color, h = 32 }) => {
  const w = 90;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const area = `${(data.length - 1) / (data.length - 1) * w},${h} 0,${h}`;
  const id = `sg${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${area}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── 3D Virtual Card ───────────────────────────────────────────────────────────
const VirtualCard3D = ({ card, revealed, onToggleReveal, user }) => {
  const cardRef = useRef(null);
  const [rot, setRot] = useState({ x: 4, y: -3 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [hov, setHov] = useState(false);

  const GRADS = {
    Basic:    'linear-gradient(145deg,#1a2a6c 0%,#0d1660 40%,#0a1a3a 100%)',
    Silver:   'linear-gradient(145deg,#2a3050 0%,#1a1d3e 40%,#0d0f26 100%)',
    Gold:     'linear-gradient(145deg,#3d2800 0%,#2a1a00 40%,#1a0e00 100%)',
    Platinum: 'linear-gradient(145deg,#1a1a2e 0%,#16213e 40%,#0f0e17 100%)',
  };
  const ACCENT = { Basic: '#3b61f5', Silver: '#94a3b8', Gold: '#d97706', Platinum: '#7c3aed' };
  const grad = GRADS[card?.card_type] || GRADS.Basic;
  const accent = ACCENT[card?.card_type] || '#3b61f5';

  const onMove = (e) => {
    const el = cardRef.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const cx = (e.clientX - left) / width, cy = (e.clientY - top) / height;
    setRot({ x: (cy - 0.5) * -18, y: (cx - 0.5) * 18 });
    setShine({ x: cx * 100, y: cy * 100 });
  };
  const onLeave = () => { setRot({ x: 4, y: -3 }); setShine({ x: 50, y: 50 }); setHov(false); };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
      style={{
        width: '100%', aspectRatio: '1.586',
        borderRadius: 18,
        transform: `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hov ? 1.03 : 1})`,
        transition: hov ? 'transform 0.05s linear' : 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        transformStyle: 'preserve-3d', cursor: 'pointer',
        position: 'relative', willChange: 'transform',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18,
        background: grad,
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: `0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.1)`,
        overflow: 'hidden',
      }}>
        {/* Holographic shimmer */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${shine.x}% ${shine.y}%, ${accent}30 0%, transparent 55%)`, transition: hov ? 'none' : 'background 0.5s', pointerEvents: 'none' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.012) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,0.012) 29px)', pointerEvents: 'none' }} />
        {/* Top gloss */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg,rgba(255,255,255,0.06) 0%,transparent 100%)', pointerEvents: 'none', borderRadius: '18px 18px 0 0' }} />
        {/* Glow orb */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: `${accent}25`, filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '18px 22px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <button onClick={e => { e.stopPropagation(); onToggleReveal(); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'DM Sans,sans-serif' }}>
              {revealed ? <EyeOff size={10} /> : <Eye size={10} />} {revealed ? 'Hide' : 'Show'}
            </button>
            {/* Chip */}
            <div style={{ width: 32, height: 24, borderRadius: 5, background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, padding: 3 }}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 1 }} />)}
            </div>
          </div>
          {/* Brand label */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', fontFamily: 'Sora,sans-serif', textTransform: 'uppercase' }}>
            CREDIFY {card?.card_type || 'VIRTUAL'}
          </div>
          {/* Card number */}
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 15, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.2em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {revealed ? card?.card_number?.replace(/(.{4})/g, '$1 ').trim() : `•••• •••• •••• ${card?.card_number?.slice(-4) || '****'}`}
          </div>
          {/* Row bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Card Holder</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Sora,sans-serif' }}>
                {card?.cardholder_name ||
                  (user?.first_name || user?.last_name
                    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                    : user?.name || user?.username || 'CARDHOLDER'
                  )
                }
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>CVV</div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{revealed ? (card?.cvv || '•••') : '•••'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Expires</div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{card?.expiry_date || 'MM/YY'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── KPI metric card ───────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, subPos, color, icon: Icon, sparkData, delay, go }) => {
  const num = parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
  const counted = useCounter(num, 1200, go);
  const display = String(value).replace(/[0-9,]+/, counted.toLocaleString());

  return (
    <div
      className="animate-fade-up metric-card"
      style={{ padding: '20px 22px', borderRadius: 20, position: 'relative', overflow: 'hidden', cursor: 'default', background: 'var(--dash-metric-bg)', border: '1px solid var(--dash-metric-border)', boxShadow: 'var(--dash-metric-shadow)', transition: 'transform 0.25s,box-shadow 0.25s,border-color 0.25s', animationDelay: `${delay}ms` }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${color}25`; e.currentTarget.style.borderColor = `${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      {/* Glow orb */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `${color}0d`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color, background: `${color}14`, border: `1px solid ${color}25`, borderRadius: 20, padding: '2px 8px', letterSpacing: '0.06em' }}>LIVE</span>
      </div>
      <div className="metric-value" style={{ fontSize: 'clamp(1.3rem,2vw,1.6rem)', fontWeight: 800, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.03em', color: 'var(--metric-value-color)', marginBottom: 3 }}>{display}</div>
      <div className="metric-label" style={{ fontSize: 11, color: 'var(--metric-label-color)', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, fontWeight: 600, color: subPos ? '#10b981' : '#f59e0b' }}>{sub}</div>}
      {sparkData && <div style={{ marginTop: 10, opacity: 0.75 }}><Spark data={sparkData} color={color} /></div>}
    </div>
  );
};

// ── Transaction row ───────────────────────────────────────────────────────────
const TxRow = ({ desc, card, date, status, amount, positive, category, delay }) => {
  const CAT_COLOR = { food: '#f59e0b', salary: '#10b981', shopping: '#8b5cf6', reward: '#ec4899', subscription: '#06b6d4', transfer: '#3b61f5', refund: '#10b981' };
  const c = CAT_COLOR[category?.toLowerCase()] || '#3b61f5';
  return (
    <div className="animate-fade-up tx-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--dash-row-divider)', animationDelay: `${delay}ms`, transition: 'background 150ms, padding 150ms, margin 150ms, border-radius 150ms' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--dash-row-hover)'; e.currentTarget.style.margin = '0 -12px'; e.currentTarget.style.padding = '12px 12px'; e.currentTarget.style.borderRadius = '10px'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.margin = ''; e.currentTarget.style.padding = '12px 0'; e.currentTarget.style.borderRadius = ''; }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c}12`, border: `1px solid ${c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {positive ? <ArrowDownLeft size={15} color={c} /> : <ArrowUpRight size={15} color={c} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-title-color)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
        <div style={{ fontSize: 10, color: 'var(--tx-sub-color)' }}>{date}{card && ` · ••••${card.slice(-4)}`}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: positive ? '#10b981' : 'var(--tx-amount-color)' }}>
          {positive ? '+' : '−'}₹{Math.abs(parseFloat(amount || 0)).toFixed(2)}
        </div>
        <Badge status={status || 'success'} style={{ marginTop: 3 }} />
      </div>
    </div>
  );
};

// ── Sidebar nav ───────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',      icon: LayoutDashboard, label: 'Overview'       },
  { id: 'cards',         icon: CreditCard,      label: 'My Cards'       },
  { id: 'transactions',  icon: TrendingUp,      label: 'Transactions'   },
  { id: 'kyc',           icon: Shield,          label: 'KYC & Security' },
  { id: 'requests',      icon: FileText,        label: 'Raise Request'  },
  { id: 'profile',       icon: User,            label: 'Profile'        },
  { id: 'notifications', icon: Bell,            label: 'Notifications'  },
];

const Sidebar = ({ active, setActive, onLogout, user }) => {
  const avatarPalette = ['#3b61f5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  const avatarColor = user?.username ? avatarPalette[user.username.charCodeAt(0) % 6] : '#3b61f5';
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--dash-sidebar-bg)',
      borderRight: '1px solid var(--dash-border)',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 16px',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 20px', borderBottom: '1px solid var(--dash-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3b61f5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,97,245,0.4)' }}>
            <CreditCard size={15} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--dash-text-primary)', letterSpacing: '-0.03em' }}>Credify</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 11, background: isActive ? 'var(--dash-link-active-bg)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--dash-link-active-border)' : 'transparent'}`,
                color: isActive ? 'var(--dash-link-active)' : 'var(--dash-link-inactive)',
                cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: isActive ? 600 : 500,
                transition: 'all 0.18s ease', width: '100%', position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(59,97,245,0.06)'; e.currentTarget.style.color = 'var(--dash-text-primary)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--dash-link-inactive)'; } }}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: '#3b61f5', boxShadow: '0 0 8px rgba(59,97,245,0.7)' }} />}
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {id === 'notifications' && (
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom — user + logout */}
      <div style={{ margin: '16px 10px 0', padding: '14px', borderRadius: 14, background: 'var(--dash-user-pill-bg)', border: '1px solid var(--dash-user-pill-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${avatarColor},${avatarColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Sora,sans-serif', flexShrink: 0, boxShadow: `0 4px 12px ${avatarColor}50` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
            <div style={{ fontSize: 10, color: 'var(--dash-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
          <button onClick={onLogout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dash-text-muted)', padding: 4, borderRadius: 7, transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--dash-text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ cards, transactions, loading, user }) => {
  const navigate = useNavigate();
  const [go, setGo] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t); }, []);

  const balance = cards.reduce((s, c) => s + (Number(c.available_credit) || 0), 0);
  const totalSpend = transactions.slice(0, 30).reduce((s, t) => s + Math.abs(parseFloat(t.amount || 0)), 0);
  const activeCards = cards.filter(c => c.status === 'active').length;
  const featuredCard = cards.find(c => c.status === 'active') || cards[0];

  const KPIS = [
    { label: 'Available Credit',  value: `₹${balance.toLocaleString() || '0'}`,       sub: '↑ ₹12K this month', subPos: true,  color: '#3b61f5', icon: CreditCard,  delay: 0,   sparkData: [40, 55, 48, 70, 62, 78, balance / 1000 || 84] },
    { label: 'Total Spent',       value: `₹${totalSpend.toLocaleString() || '0'}`,     sub: '↑ 8.2% vs last mo',  subPos: false, color: '#8b5cf6', icon: TrendingUp,  delay: 80,  sparkData: [30, 45, 38, 55, 60, 48, totalSpend / 100 || 70] },
    { label: 'Active Cards',      value: String(activeCards),                          sub: `${cards.length} total`, subPos: true, color: '#10b981', icon: Zap,         delay: 160, sparkData: [1, 2, 2, 3, 2, 3, activeCards || 3] },
    { label: 'Transactions',      value: String(transactions.length),                  sub: '≈ ₹482 earned',      subPos: true,  color: '#f59e0b', icon: Gift,         delay: 240, sparkData: [2, 6, 8, 12, 15, 18, transactions.length || 22] },
  ];

  const SPENDS = [
    { label: 'Shopping', pct: 68, color: '#3b61f5', amount: '₹8,240' },
    { label: 'Dining',   pct: 42, color: '#8b5cf6', amount: '₹4,820' },
    { label: 'Travel',   pct: 29, color: '#10b981', amount: '₹3,500' },
    { label: 'Utilities',pct: 18, color: '#f59e0b', amount: '₹2,100' },
  ];

  // Prepare tx display: use real if available, else fallback
  const displayTxs = transactions.length > 0
    ? transactions.slice(0, 6).map((t, i) => ({
        desc: t.description || 'Transaction',
        card: t.card_number,
        date: t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—',
        status: t.status || 'success',
        amount: t.amount,
        positive: parseFloat(t.amount) >= 0,
        category: t.merchant_type || 'transfer',
        delay: i * 55,
      }))
    : [
        { desc: 'Salary Credit',   card: '7234', date: 'Today',     status: 'success', amount: '62000',  positive: true,  category: 'salary',       delay: 0 },
        { desc: 'Swiggy Order',    card: '7234', date: 'Today',     status: 'success', amount: '340',    positive: false, category: 'food',         delay: 55 },
        { desc: 'Amazon Purchase', card: '7234', date: 'Yesterday', status: 'success', amount: '2199',   positive: false, category: 'shopping',     delay: 110 },
        { desc: 'Cashback Reward', card: '7234', date: 'Yesterday', status: 'success', amount: '150',    positive: true,  category: 'reward',       delay: 165 },
        { desc: 'Netflix',         card: '7234', date: 'Apr 7',     status: 'success', amount: '649',    positive: false, category: 'subscription', delay: 220 },
        { desc: 'UPI Received',    card: '7234', date: 'Apr 5',     status: 'success', amount: '5000',   positive: true,  category: 'transfer',     delay: 275 },
      ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting header */}
      <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            {greeting}, <span className="gradient-text">{user?.username || 'User'}</span> 👋
          </h1>
          <div style={{ fontSize: 12, color: 'var(--dash-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
            All systems operational · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '9px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={13} /> Alerts <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </button>
          <button className="btn-primary" style={{ fontSize: 12, padding: '9px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} /> AI Insights
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      {loading
        ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ height: 140, borderRadius: 20, background: 'var(--shimmer-bg)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}</div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
          {KPIS.map((k, i) => <MetricCard key={i} {...k} go={go} />)}
        </div>
      }

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr 290px', gap: 18, alignItems: 'start' }}>

        {/* COL 1 — Card + Spend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card panel */}
          <div className="animate-fade-up delay-200 panel-card" style={{ padding: 22, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>My Virtual Card</div>
                <div style={{ fontSize: 10, color: 'var(--dash-text-muted)', marginTop: 2 }}>Hover to interact · click to reveal</div>
              </div>
              <button onClick={() => {}} style={{ fontSize: 11, color: '#6089ff', background: 'rgba(59,97,245,0.1)', border: '1px solid rgba(59,97,245,0.2)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'Sora,sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Manage <ArrowRight size={10} />
              </button>
            </div>

            {featuredCard
              ? <VirtualCard3D card={featuredCard} revealed={revealed} onToggleReveal={() => setRevealed(r => !r)} user={user} />
              : <div style={{ aspectRatio: '1.586', borderRadius: 18, background: 'var(--dash-card-bg)', border: '2px dashed var(--dash-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--dash-text-muted)' }}>
                  <CreditCard size={28} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No card yet</div>
                  <div style={{ fontSize: 11, textAlign: 'center', maxWidth: 180, lineHeight: 1.5 }}>Request your first virtual card to get started</div>
                </div>
            }

            {featuredCard && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Credit Used</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>
                    ₹{((featuredCard.credit_limit || 0) - (featuredCard.available_credit || 0)).toLocaleString()} / ₹{Number(featuredCard.credit_limit || 0).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={featuredCard.credit_limit ? Math.min(100, (((featuredCard.credit_limit - featuredCard.available_credit) / featuredCard.credit_limit) * 100)) : 23}
                  color="linear-gradient(90deg,#3b61f5,#8b5cf6)"
                  height={5}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>
                    {featuredCard.credit_limit ? `${Math.round(((featuredCard.credit_limit - featuredCard.available_credit) / featuredCard.credit_limit) * 100)}% used` : '23% used'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>₹{Number(featuredCard.available_credit || 76860).toLocaleString()} available</span>
                </div>
              </div>
            )}
          </div>

          {/* Spend breakdown */}
          <div className="animate-fade-up delay-300 panel-card" style={{ padding: 22, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Spend by Category</div>
              <span style={{ fontSize: 10, color: 'var(--dash-text-muted)', background: 'rgba(59,97,245,0.06)', border: '1px solid rgba(59,97,245,0.1)', borderRadius: 7, padding: '3px 8px' }}>This month</span>
            </div>
            {SPENDS.map(({ label, pct, color, amount }, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--dash-text-secondary)', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>{amount}</span>
                </div>
                <ProgressBar pct={pct} color={color} delay={i * 120} />
              </div>
            ))}
          </div>
        </div>

        {/* COL 2 — Transactions */}
        <div className="animate-fade-up delay-200 panel-card" style={{ padding: 22, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent Activity</div>
            <button style={{ fontSize: 11, color: '#6089ff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
              View all <ArrowRight size={10} />
            </button>
          </div>

          {loading
            ? <div style={{ textAlign: 'center', padding: 32 }}><Spinner size={22} /></div>
            : displayTxs.map((tx, i) => <TxRow key={i} {...tx} />)
          }

          <button
            style={{ width: '100%', marginTop: 16, padding: '11px', borderRadius: 11, background: 'rgba(59,97,245,0.07)', border: '1px solid rgba(59,97,245,0.15)', color: '#6089ff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 200ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,97,245,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,97,245,0.07)'}
          >
            <Activity size={13} /> All Transactions
          </button>
        </div>

        {/* COL 3 — Quick actions + Rewards + Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Quick Actions */}
          <div className="animate-fade-up delay-300 panel-card" style={{ padding: 18, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: Plus,         label: 'New Card',  color: '#3b61f5' },
                { icon: ArrowUpRight, label: 'Pay Bill',  color: '#8b5cf6' },
                { icon: TrendingUp,   label: 'Analytics', color: '#10b981' },
                { icon: Shield,       label: 'KYC',       color: '#f59e0b' },
                { icon: Gift,         label: 'Rewards',   color: '#ec4899' },
                { icon: Globe,        label: 'Send',      color: '#06b6d4' },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  style={{ padding: '12px 8px', borderRadius: 13, background: 'var(--quick-action-bg)', border: '1px solid var(--quick-action-border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s ease', fontFamily: 'DM Sans,sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--quick-action-bg)'; e.currentTarget.style.borderColor = 'var(--quick-action-border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}16`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--quick-action-label)', fontFamily: 'Sora,sans-serif' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="animate-fade-up delay-400" style={{ padding: 20, borderRadius: 20, position: 'relative', overflow: 'hidden', background: 'var(--rewards-bg)', border: '1px solid var(--rewards-border)', boxShadow: '0 4px 28px rgba(0,0,0,0.25)' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', filter: 'blur(28px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(167,139,250,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Rewards Balance</div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.03em', color: 'var(--rewards-title)', lineHeight: 1 }}>
                    4,820 <span style={{ fontSize: 12, color: 'var(--dash-text-muted)', fontWeight: 400 }}>pts</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--dash-text-muted)', marginTop: 4 }}>≈ ₹482 cashback value</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={15} color="#c4b5fd" />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: 'var(--dash-text-muted)' }}>Next tier: 6,000 pts</span>
                  <span style={{ fontSize: 9, color: '#a78bfa', fontWeight: 700 }}>80%</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'var(--progress-track)' }}>
                  <div style={{ height: '100%', width: '80%', borderRadius: 99, background: 'linear-gradient(90deg,#7c3aed,#ec4899)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }} />
                </div>
              </div>
              <button style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.28)', color: '#c4b5fd', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 200ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
              >
                <Gift size={12} /> Redeem Points
              </button>
            </div>
          </div>

          {/* KYC Status Card */}
          <div
            onClick={() => navigate('/kyc')}
            className="animate-fade-up delay-400"
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: 'linear-gradient(135deg,rgba(59,97,245,0.07),rgba(59,97,245,0.02))',
              border: '1px solid rgba(59,97,245,0.14)',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(59,97,245,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgba(59,97,245,0.14)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  KYC Status
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-text-primary)', marginTop: 4 }}>
                  {user?.kyc_status || 'unverified'}
                </div>
              </div>
              <Shield size={18} color="#3b61f5" />
            </div>
          </div>

          {/* Security badge */}
          <div className="animate-fade-up delay-500" style={{ padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.14)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={15} color="#10b981" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--secured-label)', marginBottom: 1 }}>Account Secured</div>
                <div style={{ fontSize: 10, color: 'var(--secured-sub)' }}>KYC verified · 2FA active</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)', animation: 'pulse-glow 2.2s ease-in-out infinite', flexShrink: 0 }} />
            </div>
          </div>

          {/* Upcoming bills teaser */}
          <div className="animate-fade-up delay-500" style={{ padding: '16px 18px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(245,158,11,0.07),rgba(245,158,11,0.02))', border: '1px solid rgba(245,158,11,0.14)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Upcoming Bills</div>
            {[
              { name: 'Netflix', date: 'Apr 20', amount: '₹649', color: '#ef4444' },
              { name: 'Spotify', date: 'Apr 22', amount: '₹119', color: '#1db954' },
            ].map(({ name, date, amount, color }) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 12, color: 'var(--bill-name)', fontWeight: 500 }}>{name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--bill-amount)', fontFamily: 'JetBrains Mono,monospace' }}>{amount}</div>
                  <div style={{ fontSize: 9, color: 'var(--bill-date)' }}>{date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Cards Tab ─────────────────────────────────────────────────────────────────
const CardsTab = ({ cards, onRefresh, loading, user }) => {
  const toast = useToast();
  const [revealed, setRevealed] = useState({});
  const [actLoad, setActLoad] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [createModal, setCreate] = useState(false);
  const [form, setForm] = useState({ card_type: 'Basic', income: '', occupation: '', intended_use: 'Shopping', is_single_use: false });
  const [creating, setCreating] = useState(false);

  const doAction = async (card, action) => {
    setActLoad(s => ({ ...s, [card.id]: action }));
    try {
      await cardAPI[action](card.id);
      toast.success(`Card ${action}d successfully.`);
      onRefresh();
    } catch (err) { toast.error(err.message); }
    finally { setActLoad(s => ({ ...s, [card.id]: null })); setConfirm(null); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true);
    try {
      await cardAPI.createCard({ ...form, income: Number(form.income) });
      toast.success('Card request submitted! Awaiting admin approval.');
      setCreate(false); onRefresh();
    } catch (err) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  return (
    <div>
      <PageHeader title="My Cards" subtitle={`${cards.length} card${cards.length !== 1 ? 's' : ''} on account`}
        actions={<Button onClick={() => setCreate(true)}><Plus size={14} /> Request Card</Button>} />
      {loading
        ? <div style={{ textAlign: 'center', padding: 48 }}><Spinner size={28} /></div>
        : !cards.length
          ? <EmptyState icon={CreditCard} title="No cards yet" desc="Request your first virtual card to get started." action={{ label: 'Request Card', fn: () => setCreate(true) }} />
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
            {cards.map(card => (
              <div key={card.id} style={{ padding: 20, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
                <VirtualCard3D card={card} revealed={!!revealed[card.id]} onToggleReveal={() => setRevealed(s => ({ ...s, [card.id]: !s[card.id] }))} user={user} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--dash-text-muted)', marginBottom: 10, marginTop: 14 }}>
                  <span>Limit: <strong style={{ color: 'var(--dash-text-primary)' }}>₹{Number(card.credit_limit || 0).toLocaleString()}</strong></span>
                  <span>Available: <strong style={{ color: '#10b981' }}>₹{Number(card.available_credit || 0).toLocaleString()}</strong></span>
                </div>
                <ProgressBar pct={Math.min(100, (((card.credit_limit - card.available_credit) / card.credit_limit) * 100) || 0)} color="linear-gradient(90deg,#3b61f5,#8b5cf6)" height={4} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                  {card.status === 'active' && <Button variant="ghost" size="sm" disabled={!!actLoad[card.id]} onClick={() => setConfirm({ card, action: 'freeze' })}>{actLoad[card.id] === 'freeze' ? <Spinner size={10} /> : <Lock size={11} />} Freeze</Button>}
                  {card.status === 'frozen' && <Button variant="success" size="sm" disabled={!!actLoad[card.id]} onClick={() => doAction(card, 'unfreeze')}><Unlock size={11} /> Unfreeze</Button>}
                  {card.status !== 'blocked' && <Button variant="danger" size="sm" disabled={!!actLoad[card.id]} onClick={() => setConfirm({ card, action: 'block', danger: true })}><XCircle size={11} /> Block</Button>}
                  {card.status === 'blocked' && <Button variant="success" size="sm" onClick={() => doAction(card, 'unblock')}><Unlock size={11} /> Unblock</Button>}
                </div>
              </div>
            ))}
          </div>
      }
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.action === 'block' ? 'Block Card' : 'Freeze Card'}
        message={confirm?.action === 'block' ? 'This will permanently block the card.' : 'This will pause all transactions.'}
        danger={confirm?.danger} loading={!!actLoad[confirm?.card?.id]}
        onConfirm={() => doAction(confirm.card, confirm.action)} />
      <Modal open={createModal} onClose={() => setCreate(false)} title="Request Virtual Card" width={440}>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Card Type" value={form.card_type} onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))}>
            {['Basic', 'Silver', 'Gold', 'Platinum'].map(t => <option key={t}>{t}</option>)}
          </Select>
          <Field label="Monthly Income (₹)" type="number" placeholder="50000" value={form.income} onChange={e => setForm(f => ({ ...f, income: e.target.value }))} required />
          <Field label="Occupation" placeholder="Software Engineer" value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} required />
          <Field label="Intended Use" placeholder="Shopping, Travel…" value={form.intended_use} onChange={e => setForm(f => ({ ...f, intended_use: e.target.value }))} required />
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--dash-text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_single_use} onChange={e => setForm(f => ({ ...f, is_single_use: e.target.checked }))} />
            Single-use card
          </label>
          <Button type="submit" loading={creating} fullWidth style={{ marginTop: 4 }}>Submit Request <ChevronRight size={14} /></Button>
        </form>
      </Modal>
    </div>
  );
};

// ── Transactions Tab ──────────────────────────────────────────────────────────
const TransactionsTab = ({ cards, transactions, loading, onRefresh }) => {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ card_id: '', amount: '', description: '' });
  const [submitting, setSub] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t =>
    (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.card_number || '').includes(search)
  );

  const handleSubmit = async (e) => {
    e.preventDefault(); setSub(true);
    try {
      await transactionAPI.create({ ...form, card_id: Number(form.card_id), amount: Number(form.amount) });
      toast.success('Transaction created!'); setModal(false); onRefresh();
    } catch (err) { toast.error(err.message); }
    finally { setSub(false); }
  };

  return (
    <div>
      <PageHeader title="Transactions" subtitle="All card transactions"
        actions={<Button onClick={() => setModal(true)}><Plus size={14} /> Simulate</Button>} />
      <div style={{ marginBottom: 14 }}>
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by description or card…" />
      </div>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <DataTable loading={loading}
          columns={[{ label: 'Description' }, { label: 'Card' }, { label: 'Date' }, { label: 'Status' }, { label: 'Amount', right: true }]}
          empty="No transactions found."
          rows={filtered.map((t, i) => (
            <TR key={i}>
              <TD><div style={{ fontWeight: 500, fontSize: 13 }}>{t.description || 'Transaction'}</div></TD>
              <TD mono muted style={{ fontSize: 12 }}>•••• {t.card_number?.slice(-4) || '****'}</TD>
              <TD muted style={{ fontSize: 11 }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TD>
              <TD><Badge status={t.status || 'success'} /></TD>
              <TD right style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: parseFloat(t.amount) >= 0 ? '#10b981' : 'var(--dash-text-primary)' }}>
                ₹{Math.abs(parseFloat(t.amount || 0)).toFixed(2)}
              </TD>
            </TR>
          ))}
        />
      </Card>
      <Modal open={modal} onClose={() => setModal(false)} title="Simulate Transaction" width={420}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Select Card" value={form.card_id} onChange={e => setForm(f => ({ ...f, card_id: e.target.value }))} required>
            <option value="">Choose a card…</option>
            {cards.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>•••• {c.card_number?.slice(-4)} — {c.card_type}</option>)}
          </Select>
          <Field label="Amount (₹)" type="number" step="0.01" min="1" placeholder="100.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          <Field label="Description" placeholder="Amazon Shopping…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          <Button type="submit" loading={submitting} fullWidth style={{ marginTop: 4 }}>Process <ChevronRight size={14} /></Button>
        </form>
      </Modal>
    </div>
  );
};

// ── KYC Tab ───────────────────────────────────────────────────────────────────
const KYCTab = ({ user }) => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [drag, setDrag] = useState(false);
  const ref = React.useRef();

  const handleFile = (f) => { if (f && f.size < 10 * 1024 * 1024) setFile(f); };
  const upload = async () => {
    if (!file) return; setStatus('uploading');
    const fd = new FormData(); fd.append('kyc_document', file);
    try { await userAPI.uploadKYC(fd); setStatus('success'); toast.success('KYC document submitted!'); }
    catch (err) { setStatus('error'); toast.error(err.message); }
  };

  const kycStatus = user?.kyc_status || 'unverified';
  return (
    <div style={{ maxWidth: 520 }}>
      <PageHeader title="KYC & Security" subtitle="Verify your identity to unlock all features" />
      <div style={{ padding: 20, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--dash-text-muted)', marginBottom: 8 }}>KYC Status</div>
            <Badge status={kycStatus} label={kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)} size="md" />
          </div>
          <Shield size={28} color={kycStatus === 'verified' ? '#10b981' : 'var(--dash-text-muted)'} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--dash-text-secondary)', marginTop: 14, marginBottom: 0, lineHeight: 1.65 }}>
          {kycStatus === 'verified' ? 'Your identity is verified. All features are unlocked.' : 'Upload a government-issued ID (Aadhaar, PAN, Passport) to verify.'}
        </p>
      </div>
      {status === 'success'
        ? <div style={{ textAlign: 'center', padding: 40, borderRadius: 20, background: 'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.15)' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: 'Sora,sans-serif', marginBottom: 8 }}>Document Submitted</div>
          <div style={{ fontSize: 13, color: 'var(--dash-text-secondary)' }}>We'll review it within 24 hours and notify you.</div>
        </div>
        : <div style={{ padding: 20, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => ref.current?.click()}
            style={{ border: `2px dashed ${drag ? '#3b61f5' : file ? '#10b981' : 'var(--border)'}`, borderRadius: 14, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: drag ? 'rgba(59,97,245,0.06)' : file ? 'rgba(16,185,129,0.04)' : 'transparent', transition: 'all 200ms', marginBottom: 16 }}
          >
            <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file
              ? <><CheckCircle2 size={28} color="#10b981" style={{ marginBottom: 8 }} /><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-text-primary)' }}>{file.name}</div><div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</div></>
              : <><Upload size={26} color="var(--dash-text-muted)" style={{ marginBottom: 10 }} /><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-text-primary)', marginBottom: 4 }}>Drop document here or click to browse</div><div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>JPG, PNG, PDF · Max 10MB</div></>
            }
          </div>
          {status === 'error' && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 12 }}><AlertTriangle size={14} /> Upload failed. Please try again.</div>}
          <Button fullWidth disabled={!file || status === 'uploading'} loading={status === 'uploading'} onClick={upload}><Upload size={14} /> Submit Document</Button>
        </div>
      }
    </div>
  );
};

// ── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ user, onUpdate }) => {
  const toast = useToast();
  const [form, setForm] = useState({ phone_number: user?.phone_number || '', address: user?.address || '' });
  const [saving, setSave] = useState(false);
  const avatarPalette = ['#3b61f5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  const avatarColor = user?.username ? avatarPalette[user.username.charCodeAt(0) % 6] : '#3b61f5';

  const handleSave = async (e) => {
    e.preventDefault(); setSave(true);
    try { await userAPI.updateProfile(form); onUpdate(form); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.message); }
    finally { setSave(false); }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <div style={{ padding: 22, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingBottom: 20, borderBottom: '1px solid var(--dash-border)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${avatarColor},${avatarColor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Sora,sans-serif', flexShrink: 0, boxShadow: `0 6px 20px ${avatarColor}50` }}>
            {(user?.username || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--dash-text-primary)', fontFamily: 'Sora,sans-serif' }}>{user?.username}</div>
            <div style={{ color: 'var(--dash-text-secondary)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
            <Badge status={user?.kyc_status || 'unverified'} style={{ marginTop: 6 }} />
          </div>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Address</label>
            <textarea rows={3} placeholder="Your address…" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'DM Sans,sans-serif', lineHeight: 1.6 }} />
          </div>
          <Button type="submit" loading={saving} fullWidth>Save Changes</Button>
        </form>
      </div>
    </div>
  );
};

// ── Notifications Tab ─────────────────────────────────────────────────────────
const NotificationsTab = () => {
  const NOTIFS = [
    { icon: '💰', title: 'Salary credited', desc: '₹62,000 received · Today 9:00 AM', color: '#10b981', time: '2h ago' },
    { icon: '🎁', title: 'Cashback earned', desc: '₹150 cashback on Amazon', color: '#f59e0b', time: '1d ago' },
    { icon: '⚠️', title: 'Card expiring soon', desc: 'Your Basic card expires in 3 months', color: '#f59e0b', time: '2d ago' },
    { icon: '🔒', title: 'Security alert', desc: 'New login from Mumbai, India', color: '#ef4444', time: '3d ago' },
    { icon: '✅', title: 'KYC approved', desc: 'Your identity verification is complete', color: '#10b981', time: '1w ago' },
  ];
  return (
    <div style={{ maxWidth: 600 }}>
      <PageHeader title="Notifications" subtitle="Your latest alerts and updates" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NOTIFS.map(({ icon, title, desc, color, time }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', transition: 'all 200ms', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}35`; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--dash-card-border)'; e.currentTarget.style.background = 'var(--dash-card-bg)'; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}12`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dash-text-primary)', marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--dash-text-secondary)' }}>{desc}</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--dash-text-muted)', flexShrink: 0 }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Raise Request Tab ─────────────────────────────────────────────────────────
// All request_type keys and labels match backend REQUEST_TYPES exactly
const REQUEST_CATEGORIES = [
  {
    label: '💳 Card',
    types: [
      { key: 'credit_limit_increase',   label: 'Credit Limit Increase'      },
      { key: 'credit_limit_decrease',   label: 'Credit Limit Decrease'      },
      { key: 'card_upgrade',            label: 'Card Upgrade'               },
      { key: 'card_downgrade',          label: 'Card Downgrade'             },
      { key: 'card_replacement',        label: 'Card Replacement'           },
      { key: 'card_cancellation',       label: 'Card Cancellation'          },
      { key: 'single_use_card_request', label: 'Single-Use Card Request'    },
      { key: 'card_unfreeze',           label: 'Card Unfreeze Request'      },
    ],
  },
  {
    label: '💸 Transaction',
    types: [
      { key: 'transaction_dispute',        label: 'Transaction Dispute'         },
      { key: 'refund_request',             label: 'Refund Request'              },
      { key: 'transaction_clarification',  label: 'Transaction Clarification'   },
      { key: 'failed_transaction',         label: 'Failed Transaction Report'   },
    ],
  },
  {
    label: '👤 Account',
    types: [
      { key: 'kyc_re_submission',      label: 'KYC Re-submission Request' },
      { key: 'account_reactivation',   label: 'Account Reactivation'      },
      { key: 'profile_update_request', label: 'Profile Update Request'    },
      { key: 'account_closure',        label: 'Account Closure'           },
    ],
  },
  {
    label: '🧾 Billing',
    types: [
      { key: 'subscription_cancellation', label: 'Subscription Cancellation' },
      { key: 'subscription_upgrade',      label: 'Subscription Upgrade'      },
      { key: 'billing_dispute',           label: 'Billing Dispute'           },
      { key: 'fee_waiver',               label: 'Fee Waiver Request'        },
    ],
  },
  {
    label: '🔐 Security',
    types: [
      { key: 'suspected_fraud', label: 'Suspected Fraud Report'  },
      { key: 'pin_reset',       label: 'PIN / Security Reset'    },
    ],
  },
];

// Backend status values use underscore: raised | in_process | completed | rejected
const STATUS_CONFIG = {
  raised:     { color: '#d97706', bg: 'rgba(245,158,11,0.12)',  icon: Clock,        label: 'Raised'     },
  in_process: { color: '#3b61f5', bg: 'rgba(59,97,245,0.12)',   icon: Activity,     label: 'In Process' },
  completed:  { color: '#059669', bg: 'rgba(16,185,129,0.12)',  icon: CheckCheck,   label: 'Completed'  },
  rejected:   { color: '#dc2626', bg: 'rgba(239,68,68,0.12)',   icon: XCircle,      label: 'Rejected'   },
};

const RequestStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.raised;
  const Icon = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
};

// Helper: extract numeric ID from "REQ-12" → "12"
const parseReqId = (req) => {
  if (!req) return null;
  const rid = req.request_id || req.id || '';
  return String(rid).replace(/^REQ-/i, '');
};
import { RaiseRequestTab } from '../enquiry/EnquiryUI';

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, updateUser, isAdmin } = useAuthStore();

  const [tab, setTab] = useState('overview');
  const [cards, setCards] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loadC, setLoadC] = useState(true);
  const [loadT, setLoadT] = useState(true);

  useEffect(() => { if (isAdmin) navigate('/admin', { replace: true }); }, [isAdmin]);

  const fetchCards = useCallback(async () => {
    setLoadC(true);
    try {
      const { data } = await cardAPI.getMyCards();
      setCards(Array.isArray(data) ? data : data?.data?.results || data?.results || []);
    } catch { toast.error('Failed to load cards.'); }
    finally { setLoadC(false); }
  }, []);

  const fetchTxns = useCallback(async () => {
    setLoadT(true);
    try {
      const { data } = await transactionAPI.getAll();
      setTxns(Array.isArray(data) ? data : data?.data?.results || data?.results || []);
    } catch {}
    finally { setLoadT(false); }
  }, []);

  const refresh = useCallback(() => { fetchCards(); fetchTxns(); }, [fetchCards, fetchTxns]);
  useEffect(() => { refresh(); }, [refresh]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const TABS = {
    overview:      <OverviewTab cards={cards} transactions={txns} loading={loadC || loadT} user={user} />,
    cards:         <CardsTab cards={cards} loading={loadC} onRefresh={fetchCards} user={user} />,
    transactions:  <TransactionsTab cards={cards} transactions={txns} loading={loadT} onRefresh={refresh} />,
    kyc:           <KYCTab user={user} />,
    requests:      <RaiseRequestTab />,
    profile:       <ProfileTab user={user} onUpdate={updateUser} />,
    notifications: <NotificationsTab />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'DM Sans,sans-serif' }}>
      {/* Ambient background */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,var(--glow-1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,var(--glow-2) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Sidebar active={tab} setActive={setTab} onLogout={handleLogout} user={user} />

      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', background: 'var(--navbar-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--dash-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-text-muted)', textTransform: 'capitalize' }}>
              {NAV.find(n => n.id === tab)?.label || 'Overview'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 13px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(59,97,245,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: '28px 28px 60px' }}>
          {TABS[tab]}
        </div>
      </main>

      <style>{`
        @keyframes pulse-glow { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }
        @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,97,245,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}