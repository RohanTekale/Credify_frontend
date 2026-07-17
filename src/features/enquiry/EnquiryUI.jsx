// ─── Credify Enquiry UI ───────────────────────────────────────────────────────
// All API calls use requestsAPI from ../../services/api.js exactly as defined.
// All design tokens match the existing Dashboard / AdminDashboard patterns.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Plus, Clock, Activity, CheckCheck, XCircle, ChevronRight,
  FileText, MessageSquare, Paperclip, RotateCcw, Upload, Send,
  Star, Inbox, Filter, Search, RefreshCw, Eye, Download,
  AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert,
  CreditCard, Zap, DollarSign, User, Lock, ChevronDown,
  MoreHorizontal, ArrowRight, Flame, TrendingUp, Shield,
  X, Check, Info, Bell, Tag, Hash, Calendar, UserCheck,
} from 'lucide-react';
import { requestsAPI } from '../../services/api';
import {
  Spinner, Badge, Modal, PageHeader, EmptyState,
  Button, useToast,
} from '../../components/ui';

// ─── Shared design tokens ──────────────────────────────────────────────────────
const ACCENT      = '#3b61f5';
const SUCCESS     = '#059669';
const DANGER      = '#dc2626';
const WARNING     = '#d97706';
const INFO        = '#0891b2';

const BG_CARD     = 'var(--dash-card-bg)';
const BG_RAISED   = 'var(--bg-subtle)';
const BORDER      = 'var(--dash-card-border)';
const BORDER_MID  = 'var(--border)';
const TEXT_1      = 'var(--dash-text-primary)';
const TEXT_2      = 'var(--dash-text-secondary)';
const TEXT_3      = 'var(--dash-text-muted)';
const FONT        = "'DM Sans', 'Sora', sans-serif";
const MONO        = "'JetBrains Mono', monospace";

// ─── Request categories & types ───────────────────────────────────────────────
const REQUEST_CATEGORIES = [
  {
    id: 'card', label: 'Card', emoji: '💳', color: ACCENT,
    types: [
      { key: 'credit_limit_increase',   label: 'Credit Limit Increase',    desc: 'Request a higher credit limit' },
      { key: 'credit_limit_decrease',   label: 'Credit Limit Decrease',    desc: 'Lower your current limit' },
      { key: 'card_upgrade',            label: 'Card Upgrade',             desc: 'Move to a premium tier' },
      { key: 'card_downgrade',          label: 'Card Downgrade',           desc: 'Switch to a lower tier' },
      { key: 'card_replacement',        label: 'Card Replacement',         desc: 'Replace lost or compromised card' },
      { key: 'card_cancellation',       label: 'Card Cancellation',        desc: 'Close a specific card' },
      { key: 'single_use_card_request', label: 'Single-Use Card',         desc: 'One-time virtual card' },
      { key: 'card_unfreeze',           label: 'Card Unfreeze',           desc: 'Unfreeze a frozen card' },
    ],
  },
  {
    id: 'transaction', label: 'Transaction', emoji: '💸', color: WARNING,
    types: [
      { key: 'transaction_dispute',       label: 'Transaction Dispute',       desc: 'Dispute an unauthorized charge' },
      { key: 'refund_request',            label: 'Refund Request',            desc: 'Request a refund' },
      { key: 'transaction_clarification', label: 'Transaction Clarification', desc: 'Clarify an unknown charge' },
      { key: 'failed_transaction',        label: 'Failed Transaction',        desc: 'Payment failed but deducted' },
    ],
  },
  {
    id: 'account', label: 'Account', emoji: '👤', color: INFO,
    types: [
      { key: 'kyc_re_submission',      label: 'KYC Re-submission',     desc: 'Re-submit after rejection' },
      { key: 'profile_update_request', label: 'Profile Update',        desc: 'Change name, email or phone' },
      { key: 'account_closure',        label: 'Account Closure',       desc: 'Close your Credify account' },
    ],
  },
  {
    id: 'billing', label: 'Billing', emoji: '🧾', color: SUCCESS,
    types: [
      { key: 'subscription_cancellation', label: 'Cancel Subscription',    desc: 'End your subscription' },
      { key: 'subscription_upgrade',      label: 'Upgrade Subscription',   desc: 'Move to a higher plan' },
      { key: 'billing_dispute',           label: 'Billing Dispute',        desc: 'Dispute a billing charge' },
      { key: 'fee_waiver',               label: 'Fee Waiver',             desc: 'Request a fee to be waived' },
    ],
  },
  {
    id: 'security', label: 'Security', emoji: '🔐', color: DANGER,
    types: [
      { key: 'suspected_fraud', label: 'Report Fraud',        desc: 'Report suspicious activity' },
      { key: 'pin_reset',       label: 'PIN / Security Reset', desc: 'Reset your security credentials' },
    ],
  },
];

const PRIORITY_OPTIONS = [
  { key: 'low',    label: 'Low',    color: TEXT_3,   bg: 'rgba(100,116,139,0.1)' },
  { key: 'normal', label: 'Normal', color: ACCENT,   bg: 'rgba(59,97,245,0.1)'   },
  { key: 'high',   label: 'High',   color: WARNING,  bg: 'rgba(217,119,6,0.1)'   },
  { key: 'urgent', label: 'Urgent', color: DANGER,   bg: 'rgba(220,38,38,0.1)'   },
];

const STATUS_CONFIG = {
  raised:     { color: WARNING, bg: 'rgba(245,158,11,0.12)',  icon: Clock,         label: 'Raised'     },
  in_process: { color: ACCENT,  bg: 'rgba(59,97,245,0.12)',   icon: Activity,      label: 'In Process' },
  completed:  { color: SUCCESS, bg: 'rgba(16,185,129,0.12)',  icon: CheckCheck,    label: 'Completed'  },
  rejected:   { color: DANGER,  bg: 'rgba(220,38,38,0.12)',   icon: XCircle,       label: 'Rejected'   },
};

// ─── Shared helpers ────────────────────────────────────────────────────────────
const parseReqId = (req) => {
  if (!req) return null;
  return String(req.request_id || req.id || '').replace(/^REQ-/i, '');
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const getTypeLabel = (key) => {
  for (const cat of REQUEST_CATEGORIES) {
    const t = cat.types.find(t => t.key === key);
    if (t) return t.label;
  }
  return key === 'other' ? 'Other' : key?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()) || '—';
};

// ─── Shared UI primitives ──────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = 'ghost', disabled, loading, size = 'md', style: sx }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: FONT, fontWeight: 700, borderRadius: 10, border: 'none',
    opacity: disabled || loading ? 0.55 : 1, transition: 'all 0.15s',
    fontSize: size === 'sm' ? 11 : 13,
    padding: size === 'sm' ? '5px 10px' : '9px 16px',
  };
  const variants = {
    primary: { background: ACCENT, color: '#fff', boxShadow: `0 0 18px ${ACCENT}35` },
    ghost:   { background: BG_CARD, color: TEXT_1, border: `1px solid ${BORDER_MID}` },
    danger:  { background: 'rgba(220,38,38,0.1)', color: DANGER, border: '1px solid rgba(220,38,38,0.2)' },
    success: { background: 'rgba(5,150,105,0.1)', color: SUCCESS, border: '1px solid rgba(5,150,105,0.2)' },
    warning: { background: 'rgba(217,119,6,0.1)', color: WARNING, border: '1px solid rgba(217,119,6,0.2)' },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant], ...sx }}>
      {loading ? <Spinner size={13} color={variant === 'primary' ? '#fff' : ACCENT} /> : children}
    </button>
  );
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.raised;
  const Icon = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
};

const PriorityPill = ({ priority }) => {
  const cfg = PRIORITY_OPTIONS.find(p => p.key === priority) || PRIORITY_OPTIONS[1];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      {priority === 'urgent' ? '🔴' : priority === 'high' ? '🟠' : priority === 'normal' ? '🔵' : '⚪'} {cfg.label}
    </span>
  );
};

const FilterTabs = ({ options, active, onChange }) => (
  <div style={{ display: 'flex', gap: 3, padding: 4, background: BG_RAISED, borderRadius: 12, width: 'fit-content', border: `1px solid ${BORDER_MID}`, flexWrap: 'wrap' }}>
    {options.map(({ id, label, count }) => (
      <button key={id} onClick={() => onChange(id)} style={{
        padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
        background: active === id ? BG_CARD : 'transparent',
        color: active === id ? ACCENT : TEXT_2,
        fontFamily: FONT, fontSize: 12, fontWeight: 700,
        boxShadow: active === id ? `0 0 0 1px ${ACCENT}25` : 'none',
        transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {label}
        {count != null && (
          <span style={{ background: active === id ? ACCENT : 'var(--bg-muted)', color: active === id ? '#fff' : TEXT_3, borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>
            {count}
          </span>
        )}
      </button>
    ))}
  </div>
);

const card = (extra = {}) => ({ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 16, ...extra });

const SLABadge = ({ slaDeadline, slaBreached }) => {
  if (!slaDeadline) return null;
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const hoursLeft = (deadline - now) / 36e5;
  if (slaBreached) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: DANGER, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
      <Flame size={9} /> SLA Breached
    </span>
  );
  if (hoursLeft < 4) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: WARNING, background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)' }}>
      <Clock size={9} /> Due soon
    </span>
  );
  return null;
};

// ═════════════════════════════════════════════════════════════════════════════
// USER SECTION — RaiseRequestTab
// Drop into Dashboard.jsx replacing the existing RaiseRequestTab component
// ═════════════════════════════════════════════════════════════════════════════

export const RaiseRequestTab = () => {
  const toast = useToast();

  // List state
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');

  // Create modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [activeCategory, setActiveCategory] = useState('card');
  const [form, setForm] = useState({ request_type: '', description: '', priority: 'normal', is_other: false });
  const [submitting, setSubmitting]   = useState(false);

  // Detail modal state
  const [selectedReq, setSelectedReq] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('details');

  // Actions state
  const [userComment, setUserComment] = useState('');
  const [commenting, setCommenting]   = useState(false);
  const [docFile, setDocFile]         = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [reraiseDesc, setReraiseDesc] = useState('');
  const [reraiseModal, setReraiseModal] = useState(false);
  const [reraising, setReraising]     = useState(false);
  const [rating, setRating]           = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const docRef = useRef();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await requestsAPI.getMyRequests();
      setRequests(Array.isArray(data) ? data : (data?.results || []));
    } catch { setRequests([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const counts = {
    all:        requests.length,
    raised:     requests.filter(r => r.status === 'raised').length,
    in_process: requests.filter(r => r.status === 'in_process').length,
    completed:  requests.filter(r => r.status === 'completed').length,
    rejected:   requests.filter(r => r.status === 'rejected').length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const type = form.is_other ? 'other' : form.request_type;
    if (!type) { toast.error('Please select a request type.'); return; }
    if (type === 'other' && !form.description.trim()) { toast.error('Please describe your request.'); return; }
    setSubmitting(true);
    try {
      const { data } = await requestsAPI.raise({ request_type: type, description: form.description, priority: form.priority });
      toast.success(`Request submitted! ID: ${data.request_id}`);
      setShowCreate(false);
      setForm({ request_type: '', description: '', priority: 'normal', is_other: false });
      fetchRequests();
    } catch (err) { toast.error(err.message || 'Failed to submit.'); }
    finally { setSubmitting(false); }
  };

  const handleComment = async () => {
    if (!userComment.trim()) return;
    setCommenting(true);
    try {
      await requestsAPI.addComment(parseReqId(selectedReq), { user_comment: userComment });
      toast.success('Comment added!');
      setUserComment('');
      fetchRequests();
    } catch (err) { toast.error(err.message); }
    finally { setCommenting(false); }
  };

  const handleDocUpload = async () => {
    if (!docFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('document', docFile);
    try {
      await requestsAPI.uploadDoc(parseReqId(selectedReq), fd);
      toast.success('Document uploaded!');
      setDocFile(null);
      fetchRequests();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleReraise = async () => {
    setReraising(true);
    try {
      const { data } = await requestsAPI.reraise(parseReqId(selectedReq), reraiseDesc ? { description: reraiseDesc } : {});
      toast.success(`Re-raised! New ID: ${data.request_id}`);
      setReraiseModal(false); setReraiseDesc(''); setDetailModal(false);
      fetchRequests();
    } catch (err) { toast.error(err.message); }
    finally { setReraising(false); }
  };

  const handleRate = async () => {
    if (!rating) { toast.error('Please select a rating.'); return; }
    setSubmittingRating(true);
    try {
      await requestsAPI.rate(parseReqId(selectedReq), { user_rating: rating, user_feedback: ratingFeedback });
      toast.success('Thank you for your feedback!');
      setRating(0); setRatingFeedback('');
      fetchRequests(); setDetailModal(false);
    } catch (err) { toast.error(err.message); }
    finally { setSubmittingRating(false); }
  };

  const openDetail = (req) => {
    setSelectedReq(req); setDetailModal(true);
    setUserComment(''); setDocFile(null); setActiveDetailTab('details');
    setRating(req.user_rating || 0); setRatingFeedback(req.user_feedback || '');
  };

  const FILTER_TABS = [
    { id: 'all',        label: 'All',        count: counts.all },
    { id: 'raised',     label: 'Raised',     count: counts.raised },
    { id: 'in_process', label: 'In Process', count: counts.in_process },
    { id: 'completed',  label: 'Completed',  count: counts.completed },
    { id: 'rejected',   label: 'Rejected',   count: counts.rejected },
  ];

  const selCat = REQUEST_CATEGORIES.find(c => c.id === activeCategory) || REQUEST_CATEGORIES[0];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0;transform:translateY(10px); } to { opacity:1;transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0;transform:translateX(8px); } to { opacity:1;transform:translateX(0); } }
        .req-card:hover { transform:translateY(-2px)!important; box-shadow:0 8px 32px rgba(0,0,0,0.15)!important; }
        .type-chip:hover { border-color:${ACCENT}!important; background:rgba(59,97,245,0.08)!important; }
        .star-btn:hover svg { fill:${WARNING}!important; stroke:${WARNING}!important; }
        textarea:focus, input:focus, select:focus { outline:none!important; border-color:${ACCENT}!important; box-shadow:0 0 0 3px ${ACCENT}15!important; }
      `}</style>

      <PageHeader
        title="My Requests"
        subtitle={`${requests.length} total · ${counts.raised} awaiting response`}
        actions={<Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> New Request</Btn>}
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Raised', val: counts.raised,     color: WARNING, icon: Clock },
          { label: 'In Process', val: counts.in_process, color: ACCENT,  icon: Activity },
          { label: 'Completed', val: counts.completed, color: SUCCESS, icon: CheckCheck },
          { label: 'Rejected', val: counts.rejected,  color: DANGER,  icon: XCircle },
        ].map(({ label, val, color, icon: Icon }, i) => (
          <div key={label} style={{ ...card({ padding: '16px 18px' }), position: 'relative', overflow: 'hidden', animation: `fadeUp 0.4s ease ${i * 60}ms both`, cursor: 'pointer' }}
            onClick={() => setFilter(label.toLowerCase().replace(' ', '_'))}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT_1, letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: 11, color: TEXT_3, fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ marginBottom: 16 }}>
        <FilterTabs options={FILTER_TABS} active={filter} onChange={setFilter} />
      </div>

      {/* Requests list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card({ padding: 48 }), textAlign: 'center' }}>
          <Inbox size={44} color={TEXT_3} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT_1, marginBottom: 6 }}>No requests found</div>
          <div style={{ color: TEXT_2, fontSize: 13, marginBottom: 20 }}>
            {filter === 'all' ? "You haven't raised any requests yet." : `No ${filter.replace('_', ' ')} requests.`}
          </div>
          <Btn variant="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Raise a Request</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((req, i) => {
            const rid = req.request_id || `REQ-${req.id}`;
            const unread = !req.is_viewed_by_user && req.status !== 'raised';
            return (
              <div key={rid} className="req-card" onClick={() => openDetail(req)} style={{
                ...card({ padding: '16px 20px' }),
                cursor: 'pointer', transition: 'all 0.2s',
                animation: `fadeUp 0.35s ease ${i * 40}ms both`,
                borderLeft: `3px solid ${STATUS_CONFIG[req.status]?.color || ACCENT}`,
                position: 'relative',
              }}>
                {unread && (
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ACCENT, background: `${ACCENT}12`, padding: '2px 8px', borderRadius: 6 }}>{rid}</span>
                      <StatusPill status={req.status} />
                      {req.priority && req.priority !== 'normal' && <PriorityPill priority={req.priority} />}
                      {req.sla_breached && <SLABadge slaDeadline={req.sla_deadline} slaBreached={req.sla_breached} />}
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT_1, marginBottom: 4 }}>
                      {getTypeLabel(req.request_type)}
                    </div>
                    {req.description && (
                      <div style={{ fontSize: 12, color: TEXT_2, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {req.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: TEXT_3 }}>{fmtDate(req.created_at)}</span>
                      {req.document && <span style={{ fontSize: 11, color: TEXT_3, display: 'flex', alignItems: 'center', gap: 3 }}><Paperclip size={10} /> Doc attached</span>}
                      {req.user_rating && (
                        <span style={{ fontSize: 11, color: WARNING, display: 'flex', alignItems: 'center', gap: 3 }}>
                          {'★'.repeat(req.user_rating)} Rated
                        </span>
                      )}
                      {req.reraise_count > 0 && <span style={{ fontSize: 11, color: TEXT_3 }}>↺ Re-raised {req.reraise_count}×</span>}
                    </div>
                  </div>
                  <ChevronRight size={16} color={TEXT_3} style={{ flexShrink: 0, marginTop: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Raise a New Request" width={600}>
        <form onSubmit={handleSubmit}>
          {/* Category selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {REQUEST_CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => { setActiveCategory(cat.id); setForm(f => ({ ...f, request_type: '', is_other: false })); }}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: `1px solid ${activeCategory === cat.id ? cat.color : BORDER_MID}`,
                    background: activeCategory === cat.id ? `${cat.color}12` : BG_RAISED,
                    color: activeCategory === cat.id ? cat.color : TEXT_2,
                    fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type chips */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Request Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {selCat.types.map(type => {
                const selected = form.request_type === type.key && !form.is_other;
                return (
                  <div key={type.key} className="type-chip" onClick={() => setForm(f => ({ ...f, request_type: type.key, is_other: false }))}
                    style={{
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                      border: `1px solid ${selected ? ACCENT : BORDER_MID}`,
                      background: selected ? `${ACCENT}10` : BG_RAISED,
                    }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: selected ? ACCENT : TEXT_1, marginBottom: 2 }}>{type.label}</div>
                    <div style={{ fontSize: 11, color: TEXT_3 }}>{type.desc}</div>
                  </div>
                );
              })}
              {/* Other option */}
              <div className="type-chip" onClick={() => setForm(f => ({ ...f, request_type: 'other', is_other: true }))}
                style={{
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                  border: `1px solid ${form.is_other ? ACCENT : BORDER_MID}`,
                  background: form.is_other ? `${ACCENT}10` : BG_RAISED,
                }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: form.is_other ? ACCENT : TEXT_1, marginBottom: 2 }}>Other</div>
                <div style={{ fontSize: 11, color: TEXT_3 }}>Something else</div>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Priority</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {PRIORITY_OPTIONS.map(p => (
                <button key={p.key} type="button" onClick={() => setForm(f => ({ ...f, priority: p.key }))}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${form.priority === p.key ? p.color : BORDER_MID}`,
                    background: form.priority === p.key ? p.bg : BG_RAISED,
                    color: form.priority === p.key ? p.color : TEXT_2,
                    fontFamily: FONT, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Description {form.is_other && <span style={{ color: DANGER }}>*</span>}
            </label>
            <textarea
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4} placeholder={form.is_other ? 'Please describe your request in detail (required)…' : 'Provide any additional details to help us process your request faster…'}
              style={{
                width: '100%', background: BG_RAISED, border: `1px solid ${BORDER_MID}`, borderRadius: 10,
                padding: '10px 14px', color: TEXT_1, fontSize: 13, fontFamily: FONT,
                resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            />
          </div>

          <Btn variant="primary" loading={submitting} style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
            <Send size={14} /> Submit Request
          </Btn>
        </form>
      </Modal>

      {/* ── DETAIL MODAL ─────────────────────────────────────────────────────── */}
      {selectedReq && (
        <Modal open={detailModal} onClose={() => setDetailModal(false)} title={`Request ${selectedReq.request_id || `REQ-${selectedReq.id}`}`} width={580}>
          {/* Status banner */}
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: `${STATUS_CONFIG[selectedReq.status]?.color || ACCENT}10`,
            border: `1px solid ${STATUS_CONFIG[selectedReq.status]?.color || ACCENT}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusPill status={selectedReq.status} />
              {selectedReq.priority && <PriorityPill priority={selectedReq.priority} />}
              {selectedReq.sla_breached && <SLABadge slaDeadline={selectedReq.sla_deadline} slaBreached />}
            </div>
            <div style={{ fontSize: 11, color: TEXT_3 }}>{fmtDate(selectedReq.created_at)} {fmtTime(selectedReq.created_at)}</div>
          </div>

          {/* Detail tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER_MID}`, marginBottom: 20, gap: 0 }}>
            {[
              { id: 'details',  label: 'Details'  },
              { id: 'comments', label: 'Comments' },
              { id: 'actions',  label: 'Actions'  },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)} style={{
                padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: FONT, fontSize: 12, fontWeight: 700,
                color: activeDetailTab === tab.id ? ACCENT : TEXT_2,
                borderBottom: `2px solid ${activeDetailTab === tab.id ? ACCENT : 'transparent'}`,
                transition: 'all 0.15s', marginBottom: -1,
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Details tab */}
          {activeDetailTab === 'details' && (
            <div style={{ animation: 'slideIn 0.2s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Type', value: getTypeLabel(selectedReq.request_type) },
                  { label: 'Status', value: <StatusPill status={selectedReq.status} /> },
                  { label: 'Priority', value: <PriorityPill priority={selectedReq.priority || 'normal'} /> },
                  { label: 'Raised on', value: fmtDate(selectedReq.created_at) },
                  ...(selectedReq.resolved_at ? [{ label: 'Resolved on', value: fmtDate(selectedReq.resolved_at) }] : []),
                  ...(selectedReq.sla_deadline ? [{ label: 'SLA deadline', value: fmtDate(selectedReq.sla_deadline) }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '10px 12px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}` }}>
                    <div style={{ fontSize: 10, color: TEXT_3, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_1 }}>{value}</div>
                  </div>
                ))}
              </div>
              {selectedReq.description && (
                <div style={{ padding: '12px 14px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}`, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: TEXT_3, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Your description</div>
                  <div style={{ fontSize: 13, color: TEXT_1, lineHeight: 1.6 }}>{selectedReq.description}</div>
                </div>
              )}
              {selectedReq.admin_comment && (
                <div style={{ padding: '12px 14px', background: `${ACCENT}08`, borderRadius: 10, border: `1px solid ${ACCENT}25`, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Admin response</div>
                  <div style={{ fontSize: 13, color: TEXT_1, lineHeight: 1.6 }}>{selectedReq.admin_comment}</div>
                </div>
              )}
              {/* Document */}
              {selectedReq.document && (
                <a href={selectedReq.document} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}`, textDecoration: 'none', color: TEXT_1, fontSize: 12, fontWeight: 600 }}>
                  <Paperclip size={14} color={ACCENT} /> View attached document <ArrowRight size={12} color={TEXT_3} style={{ marginLeft: 'auto' }} />
                </a>
              )}
              {/* Rating for completed requests */}
              {selectedReq.status === 'completed' && (
                <div style={{ padding: '14px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}`, marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: TEXT_3, fontWeight: 700, marginBottom: 10, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    {selectedReq.user_rating ? 'Your rating' : 'Rate this resolution'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} className="star-btn" type="button"
                        disabled={!!selectedReq.user_rating}
                        onClick={() => !selectedReq.user_rating && setRating(n)}
                        style={{ background: 'none', border: 'none', cursor: selectedReq.user_rating ? 'default' : 'pointer', padding: 2 }}>
                        <Star size={22} color={n <= (rating || selectedReq.user_rating || 0) ? WARNING : BORDER_MID}
                          fill={n <= (rating || selectedReq.user_rating || 0) ? WARNING : 'none'} />
                      </button>
                    ))}
                  </div>
                  {!selectedReq.user_rating && (
                    <>
                      <textarea value={ratingFeedback} onChange={e => setRatingFeedback(e.target.value)}
                        placeholder="Optional feedback…" rows={2}
                        style={{ width: '100%', background: BG_CARD, border: `1px solid ${BORDER_MID}`, borderRadius: 8, padding: '8px 10px', color: TEXT_1, fontSize: 12, fontFamily: FONT, resize: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                      />
                      <Btn variant="primary" loading={submittingRating} size="sm" onClick={handleRate}><Star size={11} /> Submit Rating</Btn>
                    </>
                  )}
                  {selectedReq.user_feedback && <div style={{ fontSize: 12, color: TEXT_2, marginTop: 4, fontStyle: 'italic' }}>{selectedReq.user_feedback}</div>}
                </div>
              )}
            </div>
          )}

          {/* Comments tab */}
          {activeDetailTab === 'comments' && (
            <div style={{ animation: 'slideIn 0.2s ease' }}>
              {(selectedReq.comments || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: TEXT_3 }}>
                  <MessageSquare size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontSize: 13 }}>No comments yet</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {(selectedReq.comments || []).map((c, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_1 }}>{c.author_name || 'You'}</span>
                        <span style={{ fontSize: 11, color: TEXT_3 }}>{fmtDate(c.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: TEXT_2, lineHeight: 1.5 }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea value={userComment} onChange={e => setUserComment(e.target.value)}
                  placeholder="Add a comment…" rows={3}
                  style={{ flex: 1, background: BG_RAISED, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '10px 12px', color: TEXT_1, fontSize: 13, fontFamily: FONT, resize: 'none', boxSizing: 'border-box' }}
                />
                <Btn variant="primary" size="sm" loading={commenting} onClick={handleComment}><Send size={13} /></Btn>
              </div>
            </div>
          )}

          {/* Actions tab */}
          {activeDetailTab === 'actions' && (
            <div style={{ animation: 'slideIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Upload document */}
              <div style={{ padding: '14px', background: BG_RAISED, borderRadius: 12, border: `1px solid ${BORDER_MID}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={14} color={ACCENT} /> Upload Document</div>
                <input type="file" ref={docRef} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                  onChange={e => setDocFile(e.target.files[0])} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Btn variant="ghost" size="sm" onClick={() => docRef.current?.click()}><Paperclip size={12} /> {docFile ? docFile.name : 'Choose file'}</Btn>
                  {docFile && <Btn variant="primary" size="sm" loading={uploading} onClick={handleDocUpload}><Upload size={12} /> Upload</Btn>}
                </div>
                <div style={{ fontSize: 11, color: TEXT_3, marginTop: 6 }}>PDF, JPG, PNG — max 5MB</div>
              </div>

              {/* Re-raise (only for rejected) */}
              {selectedReq.status === 'rejected' && (
                <div style={{ padding: '14px', background: `${WARNING}08`, borderRadius: 12, border: `1px solid ${WARNING}25` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={14} color={WARNING} /> Re-raise This Request</div>
                  <div style={{ fontSize: 12, color: TEXT_2, marginBottom: 10, lineHeight: 1.5 }}>This request was rejected. You can re-raise it — optionally with an updated description.</div>
                  <Btn variant="warning" onClick={() => setReraiseModal(true)}><RotateCcw size={13} /> Re-raise Request</Btn>
                </div>
              )}

              {/* Expected resolution */}
              {selectedReq.sla_deadline && selectedReq.status !== 'completed' && selectedReq.status !== 'rejected' && (
                <div style={{ padding: '14px', background: BG_RAISED, borderRadius: 12, border: `1px solid ${BORDER_MID}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_1, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} color={INFO} /> Expected Resolution</div>
                  <div style={{ fontSize: 13, color: TEXT_2 }}>By {fmtDate(selectedReq.sla_deadline)} {fmtTime(selectedReq.sla_deadline)}</div>
                  {selectedReq.sla_breached && <div style={{ fontSize: 11, color: DANGER, marginTop: 4 }}>⚠ SLA deadline has passed — our team has been alerted.</div>}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Re-raise modal */}
      <Modal open={reraiseModal} onClose={() => setReraiseModal(false)} title="Re-raise Request" width={440}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Updated Description (optional)</label>
          <textarea value={reraiseDesc} onChange={e => setReraiseDesc(e.target.value)} rows={4}
            placeholder="Add any new information or clarification…"
            style={{ width: '100%', background: BG_RAISED, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '10px 12px', color: TEXT_1, fontSize: 13, fontFamily: FONT, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setReraiseModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="primary" loading={reraising} onClick={handleReraise} style={{ flex: 1, justifyContent: 'center' }}><RotateCcw size={13} /> Re-raise</Btn>
        </div>
      </Modal>
    </>
  );
};


// ═════════════════════════════════════════════════════════════════════════════
// ADMIN SECTION — RequestsReceivedTab
// Drop into AdminDashboard.jsx replacing the existing RequestsReceivedTab
// ═════════════════════════════════════════════════════════════════════════════

const ADMIN_STATUS_OPTS = [
  { value: 'in_process', label: 'Mark In Process', color: ACCENT   },
  { value: 'completed',  label: 'Mark Completed',  color: SUCCESS  },
  { value: 'rejected',   label: 'Reject Request',  color: DANGER   },
];

export const RequestsReceivedTab = ({ onRefresh }) => {
  const toast = useToast();

  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [selectedReq, setSelectedReq] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  const [actionStatus, setActionStatus]   = useState('');
  const [adminComment, setAdminComment]   = useState('');
  const [isInternal, setIsInternal]       = useState(false);
  const [takingAction, setTakingAction]   = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [commentBody, setCommentBody]     = useState('');
  const [commentInternal, setCommentInternal] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await requestsAPI.listAll();
      setRequests(Array.isArray(data) ? data : (data?.results || []));
    } catch { setRequests([]); toast.error('Failed to load requests.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const counts = {
    all:        requests.length,
    raised:     requests.filter(r => r.status === 'raised').length,
    in_process: requests.filter(r => r.status === 'in_process').length,
    completed:  requests.filter(r => r.status === 'completed').length,
    rejected:   requests.filter(r => r.status === 'rejected').length,
    sla_breach: requests.filter(r => r.sla_breached).length,
  };

  const filtered = requests.filter(r => {
    if (filter === 'sla_breach') return r.sla_breached;
    if (filter !== 'all' && r.status !== filter) return false;
    if (typeFilter !== 'all' && r.request_type !== typeFilter) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (r.request_id || '').toLowerCase().includes(q) ||
        (r.user_name || '').toLowerCase().includes(q) ||
        (r.user_email || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        getTypeLabel(r.request_type).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = async () => {
    if (!actionStatus) { toast.error('Select a status.'); return; }
    setTakingAction(true);
    try {
      await requestsAPI.takeAction(parseReqId(selectedReq), {
        status: actionStatus,
        admin_comment: adminComment || undefined,
        is_internal: isInternal,
      });
      toast.success(`Request marked as ${actionStatus}.`);
      setActionStatus(''); setAdminComment(''); setIsInternal(false);
      setDetailModal(false);
      fetchRequests(); onRefresh?.();
    } catch (err) { toast.error(err.message); }
    finally { setTakingAction(false); }
  };

  const handleAddComment = async () => {
    if (!commentBody.trim()) return;
    setAddingComment(true);
    try {
      await requestsAPI.adminComment(parseReqId(selectedReq), { body: commentBody, is_internal: commentInternal });
      toast.success('Comment added!');
      setCommentBody(''); setCommentInternal(false);
      fetchRequests();
    } catch (err) { toast.error(err.message); }
    finally { setAddingComment(false); }
  };

  const openDetail = (req) => {
    setSelectedReq(req); setDetailModal(true);
    setActionStatus(''); setAdminComment(''); setIsInternal(false);
    setCommentBody(''); setCommentInternal(false);
    setActiveDetailTab('overview');
  };

  const FILTER_TABS = [
    { id: 'all',        label: 'All',         count: counts.all },
    { id: 'raised',     label: 'Raised',      count: counts.raised },
    { id: 'in_process', label: 'In Process',  count: counts.in_process },
    { id: 'completed',  label: 'Completed',   count: counts.completed },
    { id: 'rejected',   label: 'Rejected',    count: counts.rejected },
    { id: 'sla_breach', label: '🔥 SLA Breach', count: counts.sla_breach },
  ];

  const allTypes = [...new Set(requests.map(r => r.request_type))];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideIn { from{opacity:0;transform:translateX(8px);}to{opacity:1;transform:translateX(0);} }
        .req-row:hover { background:var(--bg-subtle)!important; }
        textarea:focus,input:focus,select:focus { outline:none!important; border-color:${ACCENT}!important; box-shadow:0 0 0 3px ${ACCENT}15!important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TEXT_1, letterSpacing: '-0.02em', margin: 0 }}>Requests Received</h2>
          <p style={{ fontSize: 13, color: TEXT_2, margin: '4px 0 0' }}>{requests.length} total · {counts.raised} awaiting action · {counts.sla_breach} SLA breached</p>
        </div>
        <Btn variant="ghost" size="sm" onClick={fetchRequests}><RefreshCw size={12} /> Refresh</Btn>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'New Raised',  val: counts.raised,     color: WARNING, icon: Inbox     },
          { label: 'In Process',  val: counts.in_process, color: ACCENT,  icon: Activity  },
          { label: 'Completed',   val: counts.completed,  color: SUCCESS, icon: CheckCheck },
          { label: 'Rejected',    val: counts.rejected,   color: DANGER,  icon: XCircle   },
          { label: 'SLA Breached',val: counts.sla_breach, color: DANGER,  icon: Flame     },
        ].map(({ label, val, color, icon: Icon }, i) => (
          <div key={label} style={{ ...card({ padding: '14px 16px' }), position: 'relative', overflow: 'hidden', animation: `fadeUp 0.35s ease ${i*50}ms both` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: TEXT_1, letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: 10, color: TEXT_3, fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterTabs options={FILTER_TABS} active={filter} onChange={setFilter} />
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={13} color={TEXT_3} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, user, type…"
            style={{ width: '100%', background: BG_CARD, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '8px 12px 8px 32px', color: TEXT_1, fontSize: 12, fontFamily: FONT, boxSizing: 'border-box' }} />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          style={{ background: BG_CARD, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '8px 12px', color: TEXT_1, fontSize: 12, fontFamily: FONT }}>
          <option value="all">All Priorities</option>
          {PRIORITY_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background: BG_CARD, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '8px 12px', color: TEXT_1, fontSize: 12, fontFamily: FONT }}>
          <option value="all">All Types</option>
          {allTypes.map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card({ padding: 48 }), textAlign: 'center' }}>
          <Inbox size={44} color={TEXT_3} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT_1, marginBottom: 6 }}>No requests found</div>
          <div style={{ color: TEXT_2, fontSize: 13 }}>{search ? 'Try a different search term.' : `No ${filter === 'all' ? '' : filter.replace('_', ' ')} requests.`}</div>
        </div>
      ) : (
        <div style={{ ...card(), overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['Request ID', 'User', 'Type', 'Priority', 'Status', 'SLA', 'Raised', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: TEXT_3, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => {
                const rid = req.request_id || `REQ-${req.id}`;
                return (
                  <tr key={rid} className="req-row" onClick={() => openDetail(req)}
                    style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.1s', animation: `fadeUp 0.3s ease ${i * 30}ms both` }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {req.sla_breached && <Flame size={11} color={DANGER} />}
                        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ACCENT, background: `${ACCENT}10`, padding: '2px 7px', borderRadius: 6 }}>{rid}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_1 }}>{req.user_name || '—'}</div>
                      <div style={{ fontSize: 11, color: TEXT_3 }}>{req.user_email || `UID: ${req.user_id}`}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_1, maxWidth: 150 }}>{getTypeLabel(req.request_type)}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}><PriorityPill priority={req.priority || 'normal'} /></td>
                    <td style={{ padding: '12px 14px' }}><StatusPill status={req.status} /></td>
                    <td style={{ padding: '12px 14px' }}>
                      {req.sla_breached
                        ? <span style={{ fontSize: 11, color: DANGER, fontWeight: 700 }}>🔥 Breached</span>
                        : req.sla_deadline
                          ? <span style={{ fontSize: 11, color: TEXT_3 }}>{fmtDate(req.sla_deadline)}</span>
                          : <span style={{ fontSize: 11, color: TEXT_3 }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: TEXT_3 }}>{fmtDate(req.created_at)}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Btn variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openDetail(req); }}><Eye size={12} /> View</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 14px', fontSize: 12, color: TEXT_3, borderTop: `1px solid ${BORDER}` }}>
            Showing {filtered.length} of {requests.length} requests
          </div>
        </div>
      )}

      {/* ── ADMIN DETAIL MODAL ───────────────────────────────────────────────── */}
      {selectedReq && (
        <Modal open={detailModal} onClose={() => setDetailModal(false)} title={`${selectedReq.request_id || `REQ-${selectedReq.id}`} — ${getTypeLabel(selectedReq.request_type)}`} width={640}>
          {/* Status banner */}
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: `${STATUS_CONFIG[selectedReq.status]?.color || ACCENT}10`,
            border: `1px solid ${STATUS_CONFIG[selectedReq.status]?.color || ACCENT}30`,
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <StatusPill status={selectedReq.status} />
            <PriorityPill priority={selectedReq.priority || 'normal'} />
            {selectedReq.sla_breached && <SLABadge slaDeadline={selectedReq.sla_deadline} slaBreached />}
            <div style={{ marginLeft: 'auto', fontSize: 11, color: TEXT_3 }}>{fmtDate(selectedReq.created_at)}</div>
          </div>

          {/* Admin detail tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER_MID}`, marginBottom: 20, gap: 0 }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'action',   label: 'Take Action' },
              { id: 'comments', label: 'Comments' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)} style={{
                padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: FONT, fontSize: 12, fontWeight: 700,
                color: activeDetailTab === tab.id ? ACCENT : TEXT_2,
                borderBottom: `2px solid ${activeDetailTab === tab.id ? ACCENT : 'transparent'}`,
                transition: 'all 0.15s', marginBottom: -1,
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Overview */}
          {activeDetailTab === 'overview' && (
            <div style={{ animation: 'slideIn 0.2s ease' }}>
              {/* User info */}
              <div style={{ padding: '12px 14px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}`, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: TEXT_3, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>User</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: ACCENT }}>
                    {(selectedReq.user_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_1 }}>{selectedReq.user_name || '—'}</div>
                    <div style={{ fontSize: 11, color: TEXT_3 }}>{selectedReq.user_email} · UID {selectedReq.user_id}</div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'Type',     value: getTypeLabel(selectedReq.request_type) },
                  { label: 'Status',   value: <StatusPill status={selectedReq.status} /> },
                  { label: 'Priority', value: <PriorityPill priority={selectedReq.priority || 'normal'} /> },
                  { label: 'Raised',   value: fmtDate(selectedReq.created_at) },
                  ...(selectedReq.resolved_at ? [{ label: 'Resolved', value: fmtDate(selectedReq.resolved_at) }] : []),
                  ...(selectedReq.sla_deadline ? [{ label: 'SLA Deadline', value: fmtDate(selectedReq.sla_deadline) }] : []),
                  ...(selectedReq.comment_count != null ? [{ label: 'Comments', value: String(selectedReq.comment_count) }] : []),
                  ...(selectedReq.reraise_count ? [{ label: 'Re-raised', value: `${selectedReq.reraise_count}×` }] : []),
                  ...(selectedReq.user_rating ? [{ label: 'User Rating', value: '★'.repeat(selectedReq.user_rating) + ` (${selectedReq.user_rating}/5)` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '10px 12px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}` }}>
                    <div style={{ fontSize: 10, color: TEXT_3, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_1 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selectedReq.description && (
                <div style={{ padding: '12px 14px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}`, marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: TEXT_3, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>User's description</div>
                  <div style={{ fontSize: 13, color: TEXT_1, lineHeight: 1.6 }}>{selectedReq.description}</div>
                </div>
              )}

              {/* User comment */}
              {selectedReq.user_comment && (
                <div style={{ padding: '12px 14px', background: `${WARNING}08`, borderRadius: 10, border: `1px solid ${WARNING}25`, marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: WARNING, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>User comment</div>
                  <div style={{ fontSize: 13, color: TEXT_1, lineHeight: 1.6 }}>{selectedReq.user_comment}</div>
                </div>
              )}

              {/* Document */}
              {selectedReq.document && (
                <a href={selectedReq.document} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${BORDER_MID}`, textDecoration: 'none', color: TEXT_1, fontSize: 12, fontWeight: 600 }}>
                  <Paperclip size={14} color={ACCENT} /> View attached document <ArrowRight size={12} color={TEXT_3} style={{ marginLeft: 'auto' }} />
                </a>
              )}
            </div>
          )}

          {/* Take Action */}
          {activeDetailTab === 'action' && (
            <div style={{ animation: 'slideIn 0.2s ease' }}>
              {/* Status buttons */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Update Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {ADMIN_STATUS_OPTS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setActionStatus(opt.value)}
                      style={{
                        padding: '10px 0', borderRadius: 10, border: `1px solid ${actionStatus === opt.value ? opt.color : BORDER_MID}`,
                        background: actionStatus === opt.value ? `${opt.color}15` : BG_RAISED,
                        color: actionStatus === opt.value ? opt.color : TEXT_2,
                        fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Comment (optional)</label>
                <textarea value={adminComment} onChange={e => setAdminComment(e.target.value)} rows={4}
                  placeholder="Add a message to the user or an internal note…"
                  style={{ width: '100%', background: BG_RAISED, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '10px 12px', color: TEXT_1, fontSize: 13, fontFamily: FONT, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Internal toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 12px', background: BG_RAISED, borderRadius: 10, border: `1px solid ${isInternal ? WARNING : BORDER_MID}` }}>
                <button type="button" onClick={() => setIsInternal(v => !v)}
                  style={{
                    width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    background: isInternal ? WARNING : BORDER_MID, flexShrink: 0,
                  }}>
                  <div style={{ position: 'absolute', top: 2, left: isInternal ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isInternal ? WARNING : TEXT_1 }}>Internal note {isInternal ? '(admin-only)' : '(visible to user)'}</div>
                  <div style={{ fontSize: 11, color: TEXT_3 }}>Internal notes are never shown to the user</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={() => setDetailModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
                <Btn variant="primary" loading={takingAction} onClick={handleAction} style={{ flex: 1, justifyContent: 'center' }} disabled={!actionStatus}>
                  <Check size={14} /> Confirm Action
                </Btn>
              </div>
            </div>
          )}

          {/* Comments */}
          {activeDetailTab === 'comments' && (
            <div style={{ animation: 'slideIn 0.2s ease' }}>
              {/* Comment thread */}
              <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {(selectedReq.comments || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: TEXT_3 }}>
                    <MessageSquare size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontSize: 13 }}>No comments yet</div>
                  </div>
                ) : (selectedReq.comments || []).map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: 10, border: `1px solid ${c.is_internal ? `${WARNING}40` : BORDER_MID}`,
                    background: c.is_internal ? `${WARNING}06` : BG_RAISED,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_1 }}>{c.author_name || 'Support'}</span>
                        {c.is_internal && <span style={{ fontSize: 10, color: WARNING, background: `${WARNING}15`, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Internal</span>}
                      </div>
                      <span style={{ fontSize: 11, color: TEXT_3 }}>{fmtDate(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: TEXT_2, lineHeight: 1.5 }}>{c.body}</div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <div style={{ borderTop: `1px solid ${BORDER_MID}`, paddingTop: 14 }}>
                <textarea value={commentBody} onChange={e => setCommentBody(e.target.value)} rows={3}
                  placeholder="Add a comment…"
                  style={{ width: '100%', background: BG_RAISED, border: `1px solid ${BORDER_MID}`, borderRadius: 10, padding: '10px 12px', color: TEXT_1, fontSize: 13, fontFamily: FONT, resize: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button type="button" onClick={() => setCommentInternal(v => !v)}
                      style={{ width: 28, height: 16, borderRadius: 8, border: 'none', cursor: 'pointer', position: 'relative', background: commentInternal ? WARNING : BORDER_MID, flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 1, left: commentInternal ? 13 : 1, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                    </button>
                    <span style={{ fontSize: 11, color: commentInternal ? WARNING : TEXT_3, fontWeight: 600 }}>
                      {commentInternal ? 'Internal note' : 'Visible to user'}
                    </span>
                  </div>
                  <Btn variant="primary" size="sm" loading={addingComment} onClick={handleAddComment}><Send size={12} /> Post</Btn>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default { RaiseRequestTab, RequestsReceivedTab };