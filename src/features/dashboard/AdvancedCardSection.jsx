// src/features/dashboard/AdvancedCardSection.jsx
// Theme-aware (light/dark via CSS vars), real API data, world-class business UI
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CreditCard, Plus, Eye, EyeOff, Lock, Unlock, XCircle,
  Copy, CheckCircle2, TrendingUp, TrendingDown, Globe, Sparkles,
  Shield, AlertTriangle, ChevronRight, RefreshCw, Target,
  BarChart3, Star, Activity, Bell, BellOff, QrCode, X, Check,
  Zap, Gift, Clock, Wifi, ArrowUpRight, ArrowDownLeft,
  PieChart, ChevronsRight, Layers,
} from 'lucide-react';
import { cardAPI, transactionAPI } from '../../services/api';
import {
  Spinner, Badge, Modal, Confirm, PageHeader,
  Button, Select, Field, useToast, EmptyState,
} from '../../components/ui';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

/* ─── helpers ────────────────────────────────────────────────────────────────── */
const fmtINR = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const pct    = (used, limit) => limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
const usedCredit = c => Math.max(0, Number(c?.credit_limit || 0) - Number(c?.available_credit || 0));
const copyText = (txt, cb) => navigator.clipboard.writeText(txt).then(cb).catch(() => {});

/* ─── Card type config ───────────────────────────────────────────────────────── */
const CARD_CFG = {
  Basic:    { grad: 'linear-gradient(145deg,#1228a0,#0d1a7c,#091256)', accent: '#6089ff', emoji: '💳', tier: 1, mult: '1x',  perks: ['Virtual card','Basic rewards','Free transactions'] },
  Silver:   { grad: 'linear-gradient(145deg,#2c3060,#1a1e44,#0f1130)', accent: '#94a3b8', emoji: '🥈', tier: 2, mult: '1.5x', perks: ['Priority support','Silver rewards','FX discounts'] },
  Gold:     { grad: 'linear-gradient(145deg,#4a2e00,#2d1c00,#1a1000)', accent: '#f59e0b', emoji: '🥇', tier: 3, mult: '2x',  perks: ['Concierge 24/7','Gold rewards','Travel insurance'] },
  Platinum: { grad: 'linear-gradient(145deg,#1a1a2e,#12122a,#0a0a1e)', accent: '#a78bfa', emoji: '💎', tier: 4, mult: '3x',  perks: ['Dedicated RM','Platinum rewards','Airport lounge','Zero FX fees'] },
};
const cfg = c => CARD_CFG[c?.card_type] || CARD_CFG.Basic;

/* ─── Animated progress bar (theme-aware) ────────────────────────────────────── */
const Prog = ({ value, max, color, height = 6, delay = 0 }) => {
  const [w, setW] = useState(0);
  const p = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  useEffect(() => { const t = setTimeout(() => setW(p), delay + 400); return () => clearTimeout(t); }, [p]);
  return (
    <div style={{ height, borderRadius: 99, background: 'var(--progress-track)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${w}%`, borderRadius: 99, background: color, transition: 'width 1.3s cubic-bezier(0.16,1,0.3,1)' }} />
    </div>
  );
};

/* ─── 3-D holographic card ───────────────────────────────────────────────────── */
const HoloCard = ({ card, revealed, onReveal, user }) => {
  const ref = useRef(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [sh, setSh] = useState({ x: 50, y: 50 });
  const [hov, setHov] = useState(false);
  const [copied, setCopied] = useState(null);
  const c = cfg(card);
  const name = card?.cardholder_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'CARDHOLDER';
  const isFrozen  = card?.status === 'frozen';
  const isBlocked = card?.status === 'blocked';

  const onMove = e => {
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const cx = (e.clientX - left) / width, cy = (e.clientY - top) / height;
    setRot({ x: (cy - 0.5) * -20, y: (cx - 0.5) * 20 });
    setSh({ x: cx * 100, y: cy * 100 });
  };

  const doCopy = (val, key) => {
    if (!revealed || !val) return;
    copyText(val, () => { setCopied(key); setTimeout(() => setCopied(null), 1800); });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setRot({ x: 0, y: 0 }); setSh({ x: 50, y: 50 }); setHov(false); }}
      style={{ width: '100%', aspectRatio: '1.586', borderRadius: 20,
        transform: `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hov ? 1.04 : 1})`,
        transition: hov ? 'transform 0.06s linear' : 'transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', willChange: 'transform',
        filter: isBlocked ? 'grayscale(0.7) opacity(0.65)' : isFrozen ? 'brightness(0.7) saturate(0.35)' : 'none',
      }}>

      {/* Status overlay */}
      {(isFrozen || isBlocked) && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: 20, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {isFrozen ? <Lock size={26} color="#94a3b8" /> : <XCircle size={26} color="#ef4444" />}
          <span style={{ fontSize: 11, fontWeight: 800, color: isFrozen ? '#94a3b8' : '#ef4444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{isFrozen ? 'Frozen' : 'Blocked'}</span>
        </div>
      )}

      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: c.grad, border: '1px solid rgba(255,255,255,0.15)', boxShadow: `0 30px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)`, overflow: 'hidden' }}>
        {/* Shimmer */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${sh.x}% ${sh.y}%, ${c.accent}40 0%, transparent 60%)`, transition: hov ? 'none' : 'background 0.5s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.013) 29px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg,rgba(255,255,255,0.08),transparent)', borderRadius: '20px 20px 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `${c.accent}22`, filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '18px 22px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={e => { e.stopPropagation(); onReveal(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'DM Sans,sans-serif' }}>
              {revealed ? <EyeOff size={9} /> : <Eye size={9} />} {revealed ? 'Hide' : 'Reveal'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={11} color={`${c.accent}99`} />
              <div style={{ display: 'flex' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(59,97,245,0.6)', border: '1px solid rgba(59,97,245,0.9)' }} />
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,200,50,0.4)', border: '1px solid rgba(255,200,50,0.7)', marginLeft: -10 }} />
              </div>
            </div>
          </div>

          {/* Chip + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 26, borderRadius: 5, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 4 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ background: 'rgba(0,0,0,0.28)', borderRadius: 2 }} />)}
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>CREDIFY {card?.card_type?.toUpperCase()} {c.emoji}</span>
          </div>

          {/* Card number */}
          <div onClick={() => doCopy(card?.card_number, 'num')}
            style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.22em', cursor: revealed ? 'copy' : 'default', userSelect: revealed ? 'text' : 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            {revealed ? (card?.card_number?.replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••') : `•••• •••• •••• ${card?.card_number?.slice(-4) || '••••'}`}
            {copied === 'num' && <span style={{ fontSize: 9, color: '#34d399' }}>Copied!</span>}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Card Holder</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: 'Sora,sans-serif', letterSpacing: '0.04em' }}>{name.toUpperCase().slice(0, 22)}</div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div onClick={() => doCopy(card?.cvv, 'cvv')} style={{ textAlign: 'center', cursor: revealed ? 'copy' : 'default' }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>CVV</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {revealed ? (card?.cvv || '•••') : '•••'} {copied === 'cvv' && <span style={{ fontSize: 8, color: '#34d399' }}>✓</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Expires</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{card?.expiry_date || 'MM/YY'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Section label ──────────────────────────────────────────────────────────── */
const SLabel = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--panel-label-color)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>{children}</div>
);

/* ─── Card health ring ───────────────────────────────────────────────────────── */
const HealthRing = ({ card }) => {
  const u = pct(usedCredit(card), Number(card?.credit_limit || 0));
  const score = Math.max(30, 100 - Math.floor(u * 0.55) - (card?.status !== 'active' ? 20 : 0));
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair';
  const C = 2 * Math.PI * 22;
  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
      <SLabel>Card Health</SLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', width: 54, height: 54, flexShrink: 0 }}>
          <svg viewBox="0 0 56 56" width="54" height="54" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="28" cy="28" r="22" fill="none" stroke="var(--progress-track)" strokeWidth="5" />
            <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={`${(score / 100) * C} ${C}`} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color, fontFamily: 'Sora,sans-serif' }}>{score}</div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--dash-text-secondary)', lineHeight: 1.5 }}>
            Utilization: <strong>{u}%</strong><br />
            Status: <strong style={{ textTransform: 'capitalize' }}>{card?.status || 'active'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Stat mini card ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--panel-label-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <Icon size={13} color={color} />
    </div>
    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--dash-text-primary)', fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em', marginBottom: 2 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>{sub}</div>}
  </div>
);

/* ─── Quick action button ────────────────────────────────────────────────────── */
const QA = ({ icon: Icon, label, color, onClick, loading }) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '14px 8px', borderRadius: 14, background: 'var(--quick-action-bg)', border: `1px solid var(--quick-action-border)`, cursor: 'pointer', flex: 1, transition: 'all 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}14`; e.currentTarget.style.borderColor = `${color}35`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--quick-action-bg)'; e.currentTarget.style.borderColor = 'var(--quick-action-border)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ width: 36, height: 36, borderRadius: 11, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading ? <Spinner size={13} color={color} /> : <Icon size={15} color={color} />}
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--quick-action-label)', whiteSpace: 'nowrap' }}>{label}</span>
  </button>
);

/* ─── Transaction mini-row ───────────────────────────────────────────────────── */
const TxMini = ({ tx }) => {
  const isCredit = parseFloat(tx.amount) >= 0;
  const cats = { food: '#f59e0b', salary: '#10b981', shopping: '#8b5cf6', reward: '#ec4899', subscription: '#06b6d4', transfer: '#3b61f5' };
  const color = cats[tx.merchant_type?.toLowerCase()] || '#3b61f5';
  const date = tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--dash-row-divider)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}14`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isCredit ? <ArrowDownLeft size={13} color={color} /> : <ArrowUpRight size={13} color={color} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description || 'Transaction'}</div>
        <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>{date}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: isCredit ? '#10b981' : 'var(--dash-text-primary)', fontFamily: 'JetBrains Mono,monospace', flexShrink: 0 }}>
        {isCredit ? '+' : '-'}₹{Math.abs(parseFloat(tx.amount || 0)).toLocaleString('en-IN')}
      </div>
    </div>
  );
};

/* ─── Spend donut ────────────────────────────────────────────────────────────── */
const SpendDonut = ({ txns }) => {
  const cats = [
    { label: 'Shopping',  color: '#6089ff', keys: ['shopping','retail'] },
    { label: 'Food',      color: '#f59e0b', keys: ['food','dining'] },
    { label: 'Travel',    color: '#10b981', keys: ['travel','transport'] },
    { label: 'Bills',     color: '#a78bfa', keys: ['bill','utility','subscription'] },
    { label: 'Other',     color: '#94a3b8', keys: [] },
  ];
  // tally from real txns
  const totals = cats.map(() => 0);
  let grand = 0;
  txns.filter(t => parseFloat(t.amount) < 0).forEach(t => {
    const amt = Math.abs(parseFloat(t.amount));
    const mtype = (t.merchant_type || '').toLowerCase();
    let matched = false;
    cats.forEach((c, i) => { if (c.keys.some(k => mtype.includes(k))) { totals[i] += amt; matched = true; } });
    if (!matched) totals[cats.length - 1] += amt;
    grand += amt;
  });
  const segments = cats.map((c, i) => ({ ...c, pct: grand ? Math.round((totals[i] / grand) * 100) : 0 })).filter(s => s.pct > 0);
  if (!segments.length) segments.push({ label: 'No data', color: '#94a3b8', pct: 100 });

  const r = 40, C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
      <SLabel>Spend Breakdown</SLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ flexShrink: 0 }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--progress-track)" strokeWidth="18" />
          {segments.map(({ color, pct: p }, i) => {
            const dash = (p / 100) * C;
            const seg = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="18"
              strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />;
            offset += dash;
            return seg;
          })}
          <circle cx="50" cy="50" r="27" fill="var(--dash-card-bg)" />
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {segments.map(({ label, pct: p, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--dash-text-secondary)', flex: 1 }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>{p}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Limit editor modal body ────────────────────────────────────────────────── */
const LimitEditor = ({ card, onClose }) => {
  const [val, setVal] = useState(Number(card?.credit_limit) || 50000);
  const toast = useToast();
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--dash-text-secondary)', marginBottom: 18, lineHeight: 1.65 }}>Drag to set your preferred monthly credit limit. Changes are reviewed within 24 hours.</p>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>Monthly Limit</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--dash-text-primary)', fontFamily: 'Sora,sans-serif' }}>{fmtINR(val)}</span>
        </div>
        <input type="range" min="10000" max="500000" step="5000" value={val} onChange={e => setVal(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#3b61f5' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>₹10,000</span>
          <span style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>₹5,00,000</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => { toast.success(`Limit change to ${fmtINR(val)} submitted`); onClose(); }} style={{ flex: 1 }}>Submit Request</Button>
      </div>
    </div>
  );
};

/* ─── Create card form ───────────────────────────────────────────────────────── */
const CreateCardForm = ({ onClose, onCreated }) => {
  const toast = useToast();
  const [form, setForm] = useState({ card_type: 'Basic', income: '', occupation: '', intended_use: 'Shopping', is_single_use: false });
  const [loading, setLoading] = useState(false);
  const c = CARD_CFG[form.card_type];

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await cardAPI.createCard({ ...form, income: Number(form.income) });
      toast.success('Card request submitted! Awaiting approval.');
      onCreated?.();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Choose Card Type</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(CARD_CFG).map(([type, cfg]) => (
            <button key={type} type="button" onClick={() => setForm(f => ({ ...f, card_type: type }))}
              style={{ padding: '12px', borderRadius: 12, background: form.card_type === type ? 'rgba(59,97,245,0.08)' : 'var(--quick-action-bg)', border: `1px solid ${form.card_type === type ? '#3b61f5' : 'var(--dash-card-border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dash-text-primary)' }}>{type}</div>
                <div style={{ fontSize: 10, color: '#3b61f5' }}>{cfg.mult} rewards</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Perks preview */}
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(59,97,245,0.05)', border: '1px solid rgba(59,97,245,0.12)' }}>
        <div style={{ fontSize: 10, color: '#3b61f5', fontWeight: 700, marginBottom: 6 }}>Included perks</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {c.perks.map(p => <span key={p} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, background: 'rgba(59,97,245,0.08)', color: '#3b61f5', fontWeight: 600 }}>{p}</span>)}
        </div>
      </div>

      <Field label="Monthly Income (₹)" type="number" placeholder="50000" value={form.income} onChange={e => setForm(f => ({ ...f, income: e.target.value }))} required />
      <Field label="Occupation" placeholder="Software Engineer" value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} required />
      <Select label="Intended Use" value={form.intended_use} onChange={e => setForm(f => ({ ...f, intended_use: e.target.value }))}>
        {['Shopping', 'Travel', 'Business', 'Subscription', 'Medical', 'Other'].map(t => <option key={t}>{t}</option>)}
      </Select>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--dash-text-secondary)', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.is_single_use} onChange={e => setForm(f => ({ ...f, is_single_use: e.target.checked }))} />
        Single-use card (auto-blocks after first transaction)
      </label>
      <Button type="submit" loading={loading} fullWidth>Submit Request <ChevronRight size={14} /></Button>
    </form>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function AdvancedCardSection({ cards: propCards = [], loading, onRefresh, user }) {
  const toast = useToast();
  const { theme } = useThemeStore();

  const [selIdx, setSelIdx]         = useState(0);
  const [revealed, setRevealed]     = useState({});
  const [actLoad, setActLoad]       = useState({});
  const [confirm, setConfirm]       = useState(null);
  const [modal, setModal]           = useState(null); // 'create' | 'limit' | 'qr'
  const [activeTab, setActiveTab]   = useState('overview');
  const [cardTxns, setCardTxns]     = useState([]);
  const [txLoading, setTxLoading]   = useState(false);
  const [notif, setNotif]           = useState(true);

  const card = propCards[selIdx] || propCards[0];
  const c = cfg(card);
  const usedAmt = usedCredit(card);
  const limitAmt = Number(card?.credit_limit || 0);
  const availAmt = Number(card?.available_credit || 0);
  const utilPct = pct(usedAmt, limitAmt);

  // Fetch real transactions for selected card
  const fetchTxns = useCallback(async () => {
    if (!card?.id) return;
    setTxLoading(true);
    try {
      const { data } = await transactionAPI.getByCard(card.id);
      const arr = Array.isArray(data) ? data : data?.data?.results || data?.results || [];
      setCardTxns(arr);
    } catch { setCardTxns([]); }
    finally { setTxLoading(false); }
  }, [card?.id]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  // Card actions
  const doAction = async (c, action) => {
    setActLoad(s => ({ ...s, [c.id]: action }));
    try {
      await cardAPI[action](c.id);
      toast.success(`Card ${action}d successfully.`);
      onRefresh?.();
    } catch (err) { toast.error(err.message || 'Action failed'); }
    finally { setActLoad(s => ({ ...s, [c.id]: null })); setConfirm(null); }
  };

  const TABS = [
    { id: 'overview',      label: 'Overview',      icon: BarChart3 },
    { id: 'transactions',  label: 'Transactions',  icon: Activity  },
    { id: 'analytics',     label: 'Analytics',     icon: PieChart  },
    { id: 'perks',         label: 'Perks',         icon: Star      },
  ];

  /* Loading state */
  if (loading) return (
    <div>
      <PageHeader title="My Cards" subtitle="Loading…" />
      <div style={{ textAlign: 'center', padding: 80 }}><Spinner size={32} /></div>
    </div>
  );

  /* Empty state */
  if (!propCards.length) return (
    <div>
      <PageHeader title="My Cards" subtitle="No cards on account"
        actions={<Button onClick={() => setModal('create')}><Plus size={14} /> Request Card</Button>} />
      <EmptyState icon={CreditCard} title="No cards yet" desc="Request your first virtual card to get started."
        action={{ label: 'Request Card', fn: () => setModal('create') }} />
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Request Virtual Card" width={460}>
        <CreateCardForm onClose={() => setModal(null)} onCreated={onRefresh} />
      </Modal>
    </div>
  );

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <PageHeader
        title="My Cards"
        subtitle={`${propCards.length} card${propCards.length !== 1 ? 's' : ''} · ${propCards.filter(c => c.status === 'active').length} active`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onRefresh} title="Refresh"><RefreshCw size={13} /></Button>
            <Button onClick={() => setModal('create')}><Plus size={14} /> Request Card</Button>
          </div>
        }
      />

      {/* Card selector strip */}
      {propCards.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
          {propCards.map((card, i) => {
            const cc = cfg(card);
            const sel = i === selIdx;
            return (
              <button key={card.id} onClick={() => { setSelIdx(i); setActiveTab('overview'); }}
                style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', transition: 'all 0.2s',
                  background: sel ? 'var(--dash-card-bg)' : 'transparent',
                  border: `1px solid ${sel ? cc.accent + '55' : 'var(--dash-card-border)'}`,
                  boxShadow: sel ? `0 4px 16px ${cc.accent}20` : 'none',
                }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: cc.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{cc.emoji}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: sel ? 'var(--dash-text-primary)' : 'var(--dash-text-muted)' }}>{card.card_type} ••••{card.card_number?.slice(-4)}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: card.status === 'active' ? '#10b981' : card.status === 'frozen' ? '#3b82f6' : '#ef4444' }}>{card.status}</div>
                </div>
              </button>
            );
          })}
          <button onClick={() => setModal('create')}
            style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'transparent', border: '1px dashed var(--dash-card-border)', color: '#3b61f5', fontSize: 11, fontWeight: 600, fontFamily: 'Sora,sans-serif' }}>
            <Plus size={13} /> Add Card
          </button>
        </div>
      )}

      {/* Main panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Card visual + actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Holographic card */}
          <div style={{ padding: 20, borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
            <HoloCard card={card} revealed={!!revealed[card?.id]} onReveal={() => setRevealed(s => ({ ...s, [card.id]: !s[card.id] }))} user={user} />

            {/* Utilization */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Credit Used</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>
                  {fmtINR(usedAmt)} / {fmtINR(limitAmt)}
                </span>
              </div>
              <Prog value={usedAmt} max={limitAmt} color={utilPct > 80 ? '#ef4444' : utilPct > 60 ? '#f59e0b' : '#3b61f5'} height={6} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: utilPct > 80 ? '#ef4444' : '#10b981' }}>{utilPct}% used</span>
                <span style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>{fmtINR(availAmt)} available</span>
              </div>
            </div>

            {/* Copy row (only when revealed) */}
            {revealed[card?.id] && (
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {[{ label: 'Card No.', val: card?.card_number }, { label: 'CVV', val: card?.cvv }, { label: 'Expiry', val: card?.expiry_date }].map(({ label, val }) => (
                  <button key={label} onClick={() => copyText(val, () => toast.success(`${label} copied!`))}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 9, background: 'var(--quick-action-bg)', border: '1px solid var(--dash-card-border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b61f5'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--dash-card-border)'}
                  >
                    <span style={{ fontSize: 8, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Copy size={9} color="var(--dash-text-muted)" />
                      <span style={{ fontSize: 10, color: 'var(--dash-text-secondary)', fontFamily: 'JetBrains Mono,monospace' }}>{val?.slice(0, 8)}…</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ padding: '16px', borderRadius: 16, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
            <SLabel>Quick Actions</SLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {card?.status === 'active' && (
                <QA icon={Lock} label="Freeze" color="#3b82f6" loading={actLoad[card?.id] === 'freeze'}
                  onClick={() => setConfirm({ card, action: 'freeze' })} />
              )}
              {card?.status === 'frozen' && (
                <QA icon={Unlock} label="Unfreeze" color="#10b981" loading={actLoad[card?.id] === 'unfreeze'}
                  onClick={() => doAction(card, 'unfreeze')} />
              )}
              {card?.status !== 'blocked' && (
                <QA icon={XCircle} label="Block" color="#ef4444" loading={actLoad[card?.id] === 'block'}
                  onClick={() => setConfirm({ card, action: 'block', danger: true })} />
              )}
              {card?.status === 'blocked' && (
                <QA icon={Unlock} label="Unblock" color="#10b981" loading={actLoad[card?.id] === 'unblock'}
                  onClick={() => doAction(card, 'unblock')} />
              )}
              <QA icon={Target} label="Set Limit" color="#f59e0b" onClick={() => setModal('limit')} />
              <QA icon={QrCode}  label="QR Pay"   color="#3b61f5" onClick={() => setModal('qr')} />
              <QA icon={notif ? Bell : BellOff} label="Alerts" color={notif ? '#a78bfa' : '#94a3b8'}
                onClick={() => { setNotif(n => !n); toast.success(notif ? 'Alerts disabled' : 'Alerts enabled'); }} />
            </div>
          </div>

          {/* Card info panel */}
          <div style={{ padding: '16px 18px', borderRadius: 16, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)' }}>
            <SLabel>Card Details</SLabel>
            {[
              { label: 'Card Type',  value: `${card?.card_type} ${c.emoji}` },
              { label: 'Status',     value: <Badge status={card?.status || 'active'} /> },
              { label: 'Credit Limit', value: fmtINR(limitAmt) },
              { label: 'Available',  value: fmtINR(availAmt) },
              { label: 'Expires',    value: card?.expiry_date || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--dash-row-divider)' }}>
                <span style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-primary)', fontFamily: typeof value === 'string' && value.startsWith('₹') ? 'JetBrains Mono,monospace' : 'inherit' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Tabbed detail panel ── */}
        <div style={{ borderRadius: 20, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)', overflow: 'hidden' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dash-card-border)', padding: '0 6px' }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{ flex: 1, padding: '14px 6px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderBottom: `2px solid ${active ? '#3b61f5' : 'transparent'}`, transition: 'all 0.2s', fontFamily: 'Sora,sans-serif' }}>
                  <Icon size={14} color={active ? '#3b61f5' : 'var(--panel-label-color)'} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: active ? '#3b61f5' : 'var(--panel-label-color)' }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ padding: 20, overflowY: 'auto', maxHeight: 620 }}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <HealthRing card={card} />

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <StatCard label="Rewards Rate" value={`${c.mult}`} sub="on all purchases" icon={Gift}       color="#f59e0b" />
                  <StatCard label="This Month"   value={fmtINR(usedAmt)} sub="total spent"  icon={TrendingDown} color="#3b61f5" />
                  <StatCard label="Points"       value="4,820"  sub="≈ ₹482 value"           icon={Sparkles}   color="#a78bfa" />
                  <StatCard label="FX Markup"    value="1.2%"   sub="on international"       icon={Globe}      color="#10b981" />
                </div>

                {/* Recent transactions on this card */}
                <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--dash-metric-bg)', border: '1px solid var(--dash-metric-border)' }}>
                  <SLabel>Recent Transactions</SLabel>
                  {txLoading ? <div style={{ textAlign: 'center', padding: 20 }}><Spinner size={20} /></div>
                    : cardTxns.length === 0
                      ? <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: 'var(--dash-text-muted)' }}>No transactions yet on this card.</div>
                      : cardTxns.slice(0, 5).map((tx, i) => <TxMini key={i} tx={tx} />)
                  }
                </div>

                {/* Upcoming bills */}
                <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--dash-metric-bg)', border: '1px solid var(--dash-metric-border)' }}>
                  <SLabel>Upcoming Bills</SLabel>
                  {[{ name: 'Netflix', date: 'Apr 20', amt: 649, color: '#ef4444' }, { name: 'Spotify', date: 'Apr 22', amt: 119, color: '#1db954' }, { name: 'Amazon Prime', date: 'Apr 28', amt: 299, color: '#ff9900' }].map(({ name, date, amt, color }) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--dash-row-divider)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 12, color: 'var(--dash-text-primary)', fontWeight: 500 }}>{name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dash-text-primary)', fontFamily: 'JetBrains Mono,monospace' }}>₹{amt}</div>
                        <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>{date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TRANSACTIONS ── */}
            {activeTab === 'transactions' && (
              <div>
                {txLoading
                  ? <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={24} /></div>
                  : cardTxns.length === 0
                    ? <EmptyState icon={Activity} title="No transactions" desc="No transactions found for this card." />
                    : cardTxns.map((tx, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--dash-row-divider)' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(59,97,245,0.08)', border: '1px solid rgba(59,97,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {parseFloat(tx.amount) >= 0 ? <ArrowDownLeft size={14} color="#10b981" /> : <ArrowUpRight size={14} color="#3b61f5" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || 'Transaction'}</div>
                          <div style={{ fontSize: 10, color: 'var(--dash-text-muted)', display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                            <span>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                            <Badge status={tx.status || 'success'} />
                          </div>
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 14, fontWeight: 700, color: parseFloat(tx.amount) >= 0 ? '#10b981' : 'var(--dash-text-primary)', flexShrink: 0 }}>
                          {parseFloat(tx.amount) >= 0 ? '+' : '-'}₹{Math.abs(parseFloat(tx.amount)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))
                }
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <SpendDonut txns={cardTxns} />

                {/* Monthly bar chart */}
                <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--dash-metric-bg)', border: '1px solid var(--dash-metric-border)' }}>
                  <SLabel>Monthly Spend Trend</SLabel>
                  {(() => {
                    // Build last 6 months from real data
                    const months = Array.from({ length: 6 }, (_, i) => {
                      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
                      return { label: d.toLocaleString('default', { month: 'short' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, total: 0 };
                    });
                    cardTxns.filter(t => parseFloat(t.amount) < 0).forEach(t => {
                      if (!t.created_at) return;
                      const key = t.created_at.slice(0, 7);
                      const m = months.find(m => m.key === key);
                      if (m) m.total += Math.abs(parseFloat(t.amount));
                    });
                    const max = Math.max(...months.map(m => m.total), 1);
                    return (
                      <div>
                        <div style={{ display: 'flex', gap: 6, height: 80, alignItems: 'flex-end' }}>
                          {months.map((m, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ width: '100%', height: `${Math.max(4, (m.total / max) * 70)}px`, borderRadius: '5px 5px 0 0', background: i === 5 ? '#3b61f5' : 'rgba(59,97,245,0.25)', transition: 'height 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          {months.map((m, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--dash-text-muted)' }}>{m.label}</div>)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Utilization gauge */}
                <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--dash-metric-bg)', border: '1px solid var(--dash-metric-border)' }}>
                  <SLabel>Credit Utilization</SLabel>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--dash-text-secondary)' }}>Current</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: utilPct > 70 ? '#ef4444' : '#10b981', fontFamily: 'Sora,sans-serif' }}>{utilPct}%</span>
                  </div>
                  <Prog value={usedAmt} max={limitAmt} color={utilPct > 80 ? '#ef4444' : utilPct > 60 ? '#f59e0b' : '#10b981'} height={8} />
                  <div style={{ fontSize: 11, color: 'var(--dash-text-muted)', marginTop: 8 }}>
                    {utilPct < 30 ? '✅ Great! Low utilization boosts your credit score.' : utilPct < 70 ? '⚠️ Moderate. Try to keep below 30% for best score.' : '🔴 High utilization may impact your credit score.'}
                  </div>
                </div>
              </div>
            )}

            {/* ── PERKS ── */}
            {activeTab === 'perks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Tier card */}
                <div style={{ padding: '18px', borderRadius: 16, background: cfg(card).grad, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${c.accent}30`, filter: 'blur(30px)' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 28 }}>{c.emoji}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'Sora,sans-serif' }}>{card?.card_type} Benefits</div>
                        <div style={{ fontSize: 11, color: c.accent, fontWeight: 600 }}>{c.mult} rewards on all spends</div>
                      </div>
                    </div>
                    {c.perks.map((perk, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <CheckCircle2 size={13} color={c.accent} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade prompt */}
                {(CARD_CFG[card?.card_type]?.tier || 1) < 4 && (
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Sparkles size={18} color="#a78bfa" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 2 }}>Upgrade Available</div>
                      <div style={{ fontSize: 11, color: 'var(--dash-text-secondary)', lineHeight: 1.5 }}>Unlock more perks and higher rewards with Platinum.</div>
                    </div>
                    <Button variant="ghost" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => setModal('create')}>Upgrade →</Button>
                  </div>
                )}

                {/* Rewards balance */}
                <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--rewards-bg)', border: '1px solid var(--rewards-border)' }}>
                  <SLabel>Rewards Points</SLabel>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--rewards-title)', fontFamily: 'Sora,sans-serif', letterSpacing: '-0.03em', marginBottom: 4 }}>
                    4,820 <span style={{ fontSize: 14, color: 'var(--dash-text-muted)', fontWeight: 400 }}>pts</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dash-text-muted)', marginBottom: 12 }}>≈ ₹482 cashback value</div>
                  <Prog value={4820} max={6000} color="linear-gradient(90deg,#7c3aed,#ec4899)" height={5} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                    <span style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>Current</span>
                    <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>1,180 pts to Gold tier</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All cards bottom strip */}
      {propCards.length > 1 && (
        <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 16, background: 'var(--dash-card-bg)', border: '1px solid var(--dash-card-border)', boxShadow: 'var(--dash-card-shadow)', display: 'flex', gap: 10, alignItems: 'center', overflowX: 'auto' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--panel-label-color)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>All Cards</span>
          {propCards.map((card, i) => {
            const cc = cfg(card);
            const sel = i === selIdx;
            return (
              <button key={card.id} onClick={() => { setSelIdx(i); setActiveTab('overview'); }}
                style={{ flexShrink: 0, width: 170, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px', cursor: 'pointer', transition: 'all 0.2s',
                  background: sel ? cc.grad : 'var(--quick-action-bg)',
                  border: `1px solid ${sel ? cc.accent + '50' : 'var(--dash-card-border)'}`,
                  transform: sel ? 'scale(1.03)' : 'scale(1)',
                }}>
                <span style={{ fontSize: 16 }}>{cc.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: sel ? '#fff' : 'var(--dash-text-muted)' }}>••••{card.card_number?.slice(-4)}</div>
                  <div style={{ fontSize: 9, color: sel ? cc.accent : 'var(--dash-text-muted)' }}>{card.card_type}</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: card.status === 'active' ? '#10b981' : card.status === 'frozen' ? '#3b82f6' : '#ef4444', boxShadow: card.status === 'active' ? '0 0 5px rgba(16,185,129,0.7)' : 'none' }} />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      <Confirm open={!!confirm} onClose={() => setConfirm(null)}
        title={confirm?.action === 'block' ? '⚠️ Block Card' : '❄️ Freeze Card'}
        message={confirm?.action === 'block' ? 'This will permanently block the card. This cannot be undone.' : 'This will temporarily pause all transactions on this card.'}
        danger={confirm?.danger} loading={!!actLoad[confirm?.card?.id]}
        onConfirm={() => doAction(confirm.card, confirm.action)} />

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Request Virtual Card" width={460}>
        <CreateCardForm onClose={() => setModal(null)} onCreated={onRefresh} />
      </Modal>

      <Modal open={modal === 'limit'} onClose={() => setModal(null)} title="Adjust Credit Limit" width={420}>
        <LimitEditor card={card} onClose={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'qr'} onClose={() => setModal(null)} title="Card QR Code" width={320}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 160, height: 160, margin: '0 auto 14px', borderRadius: 16, background: 'var(--quick-action-bg)', border: '1px solid var(--dash-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={110} color="var(--dash-text-primary)" />
          </div>
          <div style={{ fontSize: 13, color: 'var(--dash-text-secondary)', marginBottom: 4 }}>Scan to pay with this card</div>
          <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>•••• •••• •••• {card?.card_number?.slice(-4)}</div>
        </div>
      </Modal>
    </div>
  );
}