// src/features/kyc/KYCDashboard.jsx
// ─── Credify KYC System — Full UI (Sprint 2) ──────────────────────────────────
// Covers: User KYC flow + Reviewer queue + Admin stats
// Design: matches existing Credify design system (CSS vars, DM Sans/Sora, lucide-react)
// API: wired to all Sprint 2 endpoints via api.js pattern

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX,
  Upload, FileCheck, FileText, File, Image,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  ChevronRight, ChevronDown, RefreshCw, Eye, EyeOff,
  User, Users, BarChart3, AlertCircle, Info,
  ArrowRight, RotateCcw, MessageSquare, Inbox,
  Fingerprint, Camera, CreditCard, Send, X,
  Check, Loader2, TrendingUp, Activity, Zap,
  Lock, ClipboardList, Search, Filter, Bell,
} from 'lucide-react';
import { http } from '../../services/api';
import { Spinner, Badge, Modal, useToast, Button } from '../../components/ui';
import useAuthStore from '../../store/authStore';

// ─── Design tokens (match existing system) ────────────────────────────────────
const T = {
  brand:   '#3b61f5',
  brandDk: '#1d37cc',
  success: '#059669',
  warning: '#d97706',
  danger:  '#dc2626',
  info:    '#0284c7',
  font:    "'DM Sans', sans-serif",
  display: "'Sora', sans-serif",
  mono:    "'JetBrains Mono', monospace",
  ease:    'cubic-bezier(0.16,1,0.3,1)',
};

// ─── KYC API layer ─────────────────────────────────────────────────────────────
const kycAPI = {
  start:       ()         => http.post('/v2/kyc/start/'),
  status:      ()         => http.get('/v2/kyc/status/'),
  history:     ()         => http.get('/v2/kyc/history/'),
  upload:      (fd)       => http.post('/v2/kyc/documents/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  viewDoc:     (id)       => http.get(`/v2/kyc/documents/${id}/view/`),
  submit:      ()         => http.post('/v2/kyc/submit/'),
  resubmit:    ()         => http.post('/v2/kyc/resubmit/'),
  appeal:      (d)        => http.post('/v2/kyc/appeal/', d),
  sendOTP:     (d)        => http.post('/v2/kyc/otp/send/', d),
  verifyOTP:   (d)        => http.post('/v2/kyc/otp/verify/', d),
  queue:       (p)        => http.get('/v2/kyc/review/queue/', { params: p }),
  claim:       (id)       => http.post(`/v2/kyc/review/${id}/claim/`),
  approve:     (id)       => http.post(`/v2/kyc/review/${id}/approve/`),
  reject:      (id, d)    => http.post(`/v2/kyc/review/${id}/reject/`, d),
  requestInfo: (id, d)    => http.post(`/v2/kyc/review/${id}/request-info/`, d),
  aml:         (id)       => http.get(`/v2/kyc/review/${id}/aml/`),
  stats:       ()         => http.get('/v2/kyc/admin/stats/'),
  auditLog:    (p)        => http.get('/v2/kyc/admin/audit-log/', { params: p }),
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { value: 'AADHAAR_FRONT', label: 'Aadhaar Card (Front)', required: true,  icon: CreditCard },
  { value: 'AADHAAR_BACK',  label: 'Aadhaar Card (Back)',  required: false, icon: CreditCard },
  { value: 'PAN',           label: 'PAN Card',             required: true,  icon: FileText   },
  { value: 'SELFIE',        label: 'Live Selfie',          required: true,  icon: Camera     },
  { value: 'PASSPORT',      label: 'Passport',             required: false, icon: FileText   },
  { value: 'DL_FRONT',      label: "Driver's Licence (F)", required: false, icon: CreditCard },
  { value: 'DL_BACK',       label: "Driver's Licence (B)", required: false, icon: CreditCard },
  { value: 'UTILITY_BILL',  label: 'Utility Bill',         required: false, icon: File       },
];

const REQUIRED_DOCS = ['AADHAAR_FRONT', 'PAN', 'SELFIE'];

const STATUS_CONFIG = {
  DRAFT:            { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Draft',           icon: FileText    },
  SUBMITTED:        { color: '#0284c7', bg: 'rgba(2,132,199,0.12)',   label: 'Submitted',        icon: Clock       },
  PENDING_MANUAL:   { color: '#d97706', bg: 'rgba(217,119,6,0.12)',   label: 'Pending Review',   icon: Clock       },
  UNDER_REVIEW:     { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Under Review',     icon: Search      },
  INFO_NEEDED:      { color: '#ea580c', bg: 'rgba(234,88,12,0.12)',   label: 'Info Needed',      icon: AlertCircle },
  APPROVED:         { color: '#059669', bg: 'rgba(5,150,105,0.12)',   label: 'Approved',         icon: ShieldCheck },
  REJECTED:         { color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   label: 'Rejected',         icon: ShieldX     },
  APPEAL_SUBMITTED: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Appeal Submitted', icon: MessageSquare },
  RE_KYC_REQUIRED:  { color: '#d97706', bg: 'rgba(217,119,6,0.12)',   label: 'Re-KYC Required',  icon: RotateCcw   },
};

const REJECTION_REASONS = [
  { value: 'DOCUMENT_BLURRY',       label: 'Document image is too blurry' },
  { value: 'DOCUMENT_EXPIRED',      label: 'Document has expired' },
  { value: 'DOCUMENT_MISMATCH',     label: 'Details do not match profile' },
  { value: 'DOCUMENT_INCOMPLETE',   label: 'Document is partially visible' },
  { value: 'DOCUMENT_INVALID_TYPE', label: 'Wrong document type submitted' },
  { value: 'FACE_MISMATCH',         label: 'Selfie does not match ID' },
  { value: 'IDENTITY_DUPLICATE',    label: 'Identity already registered' },
  { value: 'FRAUD_SUSPECTED',       label: 'Suspected fraudulent document' },
  { value: 'OTHER',                 label: 'Other — see details' },
];

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  ...extra,
});

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtFull = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Status Badge ──────────────────────────────────────────────────────────────
const KYCStatusBadge = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '3px 10px' : '5px 14px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 13,
      fontWeight: 700, letterSpacing: '0.03em',
      color: cfg.color, background: cfg.bg,
      fontFamily: T.font,
    }}>
      <Icon size={size === 'sm' ? 10 : 13} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
};

// ── Step progress bar ──────────────────────────────────────────────────────────
const KYCStepBar = ({ status }) => {
  const steps = [
    { key: 'start',  label: 'Start',   statuses: ['DRAFT'] },
    { key: 'docs',   label: 'Documents', statuses: ['DRAFT'] },
    { key: 'review', label: 'Review',  statuses: ['SUBMITTED', 'PENDING_MANUAL', 'UNDER_REVIEW', 'INFO_NEEDED', 'APPEAL_SUBMITTED'] },
    { key: 'done',   label: 'Complete', statuses: ['APPROVED', 'REJECTED', 'RE_KYC_REQUIRED'] },
  ];
  const getStepState = (s) => {
    if (s.statuses.includes(status)) return 'active';
    const order = ['DRAFT', 'SUBMITTED', 'PENDING_MANUAL', 'UNDER_REVIEW', 'APPROVED'];
    const curIdx = order.indexOf(status);
    const stepIdx = Math.max(...s.statuses.map(sv => order.indexOf(sv)));
    if (curIdx > stepIdx) return 'done';
    return 'upcoming';
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const state = getStepState(s);
        return (
          <React.Fragment key={s.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.font, fontWeight: 700, fontSize: 13,
                background: state === 'done' ? T.brand : state === 'active' ? T.brand : 'var(--bg-muted)',
                color: state !== 'upcoming' ? '#fff' : 'var(--text-muted)',
                border: state === 'active' ? `3px solid rgba(59,97,245,0.3)` : '2px solid transparent',
                transition: 'all 0.3s',
                boxShadow: state === 'active' ? `0 0 12px rgba(59,97,245,0.4)` : 'none',
              }}>
                {state === 'done' ? <Check size={15} strokeWidth={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, marginTop: 6, color: state !== 'upcoming' ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: T.font }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2, flex: 2,
                background: state === 'done' ? T.brand : 'var(--bg-muted)',
                borderRadius: 2, marginBottom: 18, transition: 'background 0.4s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Document upload card ───────────────────────────────────────────────────────
const DocUploadCard = ({ docType, uploaded, onUpload, loading }) => {
  const cfg = DOC_TYPES.find(d => d.value === docType);
  const Icon = cfg?.icon || FileText;
  const [drag, setDrag] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    setLocalLoading(true);
    try { await onUpload(docType, file); } finally { setLocalLoading(false); }
  };

  const ruleIcon = (passed) => {
    if (passed === null || passed === undefined) return <Clock size={10} color={T.warning} />;
    return passed ? <Check size={10} color={T.success} strokeWidth={3} /> : <X size={10} color={T.danger} strokeWidth={3} />;
  };

  return (
    <div style={{
      ...card(),
      padding: 16,
      border: uploaded
        ? `1px solid rgba(5,150,105,0.35)`
        : drag ? `1.5px dashed ${T.brand}` : '1px solid var(--border)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {uploaded && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${T.success}, #10b981)`,
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: uploaded ? 'rgba(5,150,105,0.12)' : 'rgba(59,97,245,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {uploaded
            ? <FileCheck size={18} color={T.success} />
            : <Icon size={18} color={T.brand} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
              {cfg?.label}
            </span>
            {cfg?.required && (
              <span style={{ fontSize: 10, color: T.brand, fontWeight: 700, letterSpacing: '0.04em' }}>REQUIRED</span>
            )}
          </div>

          {uploaded ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: T.mono }}>
                  {uploaded.file_size_kb}KB · {uploaded.mime_type?.split('/')[1]?.toUpperCase()}
                </span>
              </div>
              {/* Rule check results */}
              {uploaded.rule_check_notes?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {uploaded.rule_check_notes.slice(0, 4).map((r, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '2px 6px', borderRadius: 6, fontSize: 10, fontFamily: T.font,
                      background: r.passed ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
                      color: r.passed ? T.success : T.danger,
                    }}>
                      {ruleIcon(r.passed)}
                      {r.rule.replace(/_CHECK|_DETECTED/, '').replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
              {uploaded.rule_check_passed === null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.warning }}>
                  <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  Running quality checks…
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: T.font }}>
              JPG, PNG or PDF · Max 10MB
            </span>
          )}
        </div>

        <div>
          <input
            ref={inputRef} type="file"
            accept="image/jpeg,image/png,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={localLoading || loading}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${uploaded ? 'rgba(5,150,105,0.3)' : 'rgba(59,97,245,0.3)'}`,
              background: uploaded ? 'rgba(5,150,105,0.08)' : 'rgba(59,97,245,0.08)',
              color: uploaded ? T.success : T.brand,
              cursor: 'pointer', fontFamily: T.font,
              transition: 'all 0.2s',
            }}
          >
            {localLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : uploaded ? <RotateCcw size={12} /> : <Upload size={12} />}
            {localLoading ? 'Uploading…' : uploaded ? 'Replace' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── OTP Modal ──────────────────────────────────────────────────────────────────
const OTPModal = ({ open, onClose, onVerified }) => {
  const [step, setStep]       = useState('send');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState('email');
  const refs = Array.from({ length: 6 }, () => useRef());
  const toast = useToast();

  const sendOTP = async () => {
    setLoading(true);
    try {
      await kycAPI.sendOTP({ channel });
      setStep('verify');
      toast.success('OTP sent!');
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await kycAPI.verifyOTP({ otp: code });
      toast.success('Email verified!');
      onVerified();
      onClose();
    } catch (e) { toast.error(e.message); setOtp(['', '', '', '', '', '']); }
    finally { setLoading(false); }
  };

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Verify Your Email">
      <div style={{ padding: '8px 0' }}>
        {step === 'send' ? (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              We need to verify your email before you can submit KYC documents. Choose your preferred method.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {['email', 'sms'].map(c => (
                <button key={c} onClick={() => setChannel(c)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${channel === c ? T.brand : 'var(--border)'}`,
                  background: channel === c ? 'rgba(59,97,245,0.08)' : 'transparent',
                  color: channel === c ? T.brand : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: T.font, transition: 'all 0.2s',
                }}>
                  {c === 'email' ? '📧 Email' : '📱 SMS'}
                </button>
              ))}
            </div>
            <button onClick={sendOTP} disabled={loading} style={{
              width: '100%', padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: T.brand, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              Send OTP
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Enter the 6-digit code sent to your {channel}. Valid for 10 minutes.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {otp.map((d, i) => (
                <input key={i} ref={refs[i]} value={d} maxLength={1}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) refs[i - 1].current?.focus(); }}
                  style={{
                    width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
                    fontFamily: T.mono, borderRadius: 10, border: `1.5px solid ${d ? T.brand : 'var(--border)'}`,
                    background: 'var(--bg-subtle)', color: 'var(--text-primary)',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                />
              ))}
            </div>
            <button onClick={verifyOTP} disabled={loading || otp.join('').length !== 6} style={{
              width: '100%', padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: T.brand, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: otp.join('').length !== 6 ? 0.6 : 1,
            }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
              Verify Code
            </button>
            <button onClick={() => setStep('send')} style={{
              width: '100%', marginTop: 10, padding: '8px 0', borderRadius: 10, fontSize: 13,
              border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: T.font,
            }}>
              ← Resend OTP
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

// ── KYC Status timeline ────────────────────────────────────────────────────────
const StatusTimeline = ({ history }) => (
  <div style={{ position: 'relative' }}>
    {history.map((h, i) => {
      const cfg = STATUS_CONFIG[h.to_status] || STATUS_CONFIG.DRAFT;
      const Icon = cfg.icon;
      return (
        <div key={h.id} style={{ display: 'flex', gap: 12, marginBottom: i < history.length - 1 ? 20 : 0, position: 'relative' }}>
          {i < history.length - 1 && (
            <div style={{ position: 'absolute', left: 15, top: 32, bottom: -20, width: 1.5, background: 'var(--bg-muted)' }} />
          )}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={cfg.color} />
          </div>
          <div style={{ paddingTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: T.font, marginBottom: 2 }}>
              {h.from_status ? `${h.from_status} → ` : ''}<span style={{ color: cfg.color }}>{h.to_status}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: T.mono }}>
              {fmtFull(h.timestamp)}{h.changed_by_username ? ` · by ${h.changed_by_username}` : ''}
            </div>
            {h.change_reason && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontFamily: T.font }}>
                {h.change_reason}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// USER KYC VIEW
// ─────────────────────────────────────────────────────────────────────────────
const UserKYCView = () => {
  const { user } = useAuthStore();
  const toast = useToast();

  const [app, setApp]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [otpModal, setOtpModal]   = useState(false);
  const [appealText, setAppeal]   = useState('');
  const [appealModal, setAppealModal] = useState(false);
  const [historyOpen, setHistory] = useState(false);
  const [submitting, setSubmit]   = useState(false);
  const [starting, setStarting]   = useState(false);
//   const [history, setHistory]     = useState([]);

  const loadStatus = useCallback(async () => {
    try {
      const r = await kycAPI.status();
      setApp(r.data);
    } catch {
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const startKYC = async () => {
    setStarting(true);
    try {
      await kycAPI.start();
      await loadStatus();
      toast.success('KYC application started!');
    } catch (e) { toast.error(e.message); }
    finally { setStarting(false); }
  };

  const uploadDoc = async (docType, file) => {
    const fd = new FormData();
    fd.append('doc_type', docType);
    fd.append('file', file);
    try {
      await kycAPI.upload(fd);
      await loadStatus();
      toast.success(`${docType.replace('_', ' ')} uploaded!`);
    } catch (e) { toast.error(e.message); throw e; }
  };

  const submit = async () => {
    if (!user?.is_email_verified) { setOtpModal(true); return; }
    setSubmit(true);
    try {
      await kycAPI.submit();
      await loadStatus();
      toast.success('KYC submitted for review!');
    } catch (e) { toast.error(e.message); }
    finally { setSubmit(false); }
  };

  const resubmit = async () => {
    setSubmit(true);
    try {
      await kycAPI.resubmit();
      await loadStatus();
      toast.success('Resubmitted successfully!');
    } catch (e) { toast.error(e.message); }
    finally { setSubmit(false); }
  };

  const submitAppeal = async () => {
    if (appealText.trim().length < 20) { toast.error('Appeal reason must be at least 20 characters.'); return; }
    setSubmit(true);
    try {
      await kycAPI.appeal({ reason: appealText });
      await loadStatus();
      setAppealModal(false);
      setAppeal('');
      toast.success('Appeal submitted!');
    } catch (e) { toast.error(e.message); }
    finally { setSubmit(false); }
  };

  const loadHistory = async () => {
    try {
      const r = await kycAPI.history();
      setHistory(r.data.history || []);
      setHistory(h => h);
    } catch {}
    setHistory(prev => prev);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <Spinner size={32} />
    </div>
  );

  // ── No application yet ─────────────────────────────────────────────────────
  if (!app) return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{
        ...card({ padding: 40, textAlign: 'center' }),
        background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-subtle-glass) 100%)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
          background: 'rgba(59,97,245,0.12)', border: '1px solid rgba(59,97,245,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Fingerprint size={32} color={T.brand} />
        </div>
        <h2 style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
          Verify Your Identity
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, fontFamily: T.font }}>
          Complete KYC verification to unlock your Credify credit card. The process takes under 5 minutes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {[
            { icon: FileText, text: 'Upload Aadhaar + PAN card' },
            { icon: Camera,   text: 'Take a live selfie' },
            { icon: ShieldCheck, text: 'Get verified in 24 hours' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-subtle)' }}>
                <Icon size={16} color={T.brand} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: T.font }}>{item.text}</span>
              </div>
            );
          })}
        </div>
        <button onClick={startKYC} disabled={starting} style={{
          width: '100%', padding: '13px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
          background: `linear-gradient(135deg, ${T.brand}, ${T.brandDk})`,
          color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.font,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(59,97,245,0.35)',
        }}>
          {starting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
          Start KYC Verification
        </button>
      </div>
      <OTPModal open={otpModal} onClose={() => setOtpModal(false)} onVerified={loadStatus} />
    </div>
  );

  const status = app.status;
  const uploadedMap = {};
  (app.documents || []).forEach(d => { uploadedMap[d.doc_type] = d; });
  const missingRequired = (app.missing_doc_types || []).filter(d => REQUIRED_DOCS.includes(d));
  const allRequiredUploaded = missingRequired.length === 0;
  const anyFailedCheck = (app.documents || []).some(d => d.rule_check_passed === false);
  const canSubmit = status === 'DRAFT' && allRequiredUploaded && !anyFailedCheck;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            KYC Verification
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: 'var(--text-muted)' }}>
              {app.application_number}
            </span>
            <KYCStatusBadge status={status} />
          </div>
        </div>
        <button onClick={loadStatus} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: T.font }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Step progress */}
      <KYCStepBar status={status} />

      {/* Status-specific banners */}
      {status === 'APPROVED' && (
        <div style={{ ...card({ padding: 20, marginBottom: 20, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.3)' }) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={28} color={T.success} />
            <div>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: T.success }}>KYC Approved</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: T.font }}>
                Approved {fmt(app.approved_at)} · Expires {fmt(app.expires_at)}
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'REJECTED' && (
        <div style={{ ...card({ padding: 20, marginBottom: 20, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)' }) }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <ShieldX size={22} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: T.danger, marginBottom: 4 }}>
                KYC Rejected — {app.rejection_reason?.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: T.font, lineHeight: 1.6, marginBottom: 12 }}>
                {app.rejection_details || 'Please review your documents and submit an appeal if you believe this is an error.'}
              </div>
              <button onClick={() => setAppealModal(true)} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                color: T.danger, cursor: 'pointer', fontFamily: T.font,
              }}>
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'INFO_NEEDED' && (
        <div style={{ ...card({ padding: 20, marginBottom: 20, background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.3)' }) }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={22} color='#ea580c' style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: '#ea580c', marginBottom: 4 }}>
                Additional Document Required: {app.info_needed_doc_type?.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: T.font, lineHeight: 1.6, marginBottom: 12 }}>
                {app.info_needed_message || 'Please upload the requested document and resubmit.'}
              </div>
              <button onClick={resubmit} disabled={submitting} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)',
                color: '#ea580c', cursor: 'pointer', fontFamily: T.font,
              }}>
                Resubmit Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {(status === 'PENDING_MANUAL' || status === 'UNDER_REVIEW') && (
        <div style={{ ...card({ padding: 20, marginBottom: 20, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color='#7c3aed' style={{ animation: 'pulse 2s ease infinite' }} />
            </div>
            <div>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                Under Review — Estimated 24 hours
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: T.font }}>
                Submitted {fmtFull(app.submitted_at)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document upload section — only in DRAFT / INFO_NEEDED */}
      {(status === 'DRAFT' || status === 'INFO_NEEDED') && (
        <div style={{ ...card({ padding: 20, marginBottom: 16 }) }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              Documents
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: T.font }}>
              {(app.documents || []).length} / {REQUIRED_DOCS.length} required uploaded
            </div>
          </div>

          {!user?.is_email_verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', marginBottom: 14 }}>
              <AlertTriangle size={15} color={T.warning} />
              <span style={{ fontSize: 12, color: T.warning, fontFamily: T.font, flex: 1 }}>
                Verify your email before submitting.
              </span>
              <button onClick={() => setOtpModal(true)} style={{ fontSize: 11, fontWeight: 700, color: T.warning, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.font }}>
                Verify now →
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DOC_TYPES.filter(d => d.required || uploadedMap[d.value]).map(dt => (
              <DocUploadCard
                key={dt.value}
                docType={dt.value}
                uploaded={uploadedMap[dt.value]}
                onUpload={uploadDoc}
              />
            ))}
          </div>

          {/* Optional docs toggle */}
          <details style={{ marginTop: 12 }}>
            <summary style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: T.font, userSelect: 'none' }}>
              + Add optional supporting documents
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {DOC_TYPES.filter(d => !d.required && !uploadedMap[d.value]).map(dt => (
                <DocUploadCard key={dt.value} docType={dt.value} uploaded={uploadedMap[dt.value]} onUpload={uploadDoc} />
              ))}
            </div>
          </details>

          {/* Submit button */}
          {status === 'DRAFT' && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {!allRequiredUploaded && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontFamily: T.font }}>
                  Still needed: {missingRequired.map(d => d.replace(/_/g, ' ')).join(', ')}
                </div>
              )}
              {anyFailedCheck && (
                <div style={{ fontSize: 12, color: T.danger, marginBottom: 10, fontFamily: T.font }}>
                  Some documents failed quality checks. Re-upload them to continue.
                </div>
              )}
              <button onClick={submit} disabled={!canSubmit || submitting} style={{
                width: '100%', padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: canSubmit ? `linear-gradient(135deg, ${T.brand}, ${T.brandDk})` : 'var(--bg-muted)',
                color: canSubmit ? '#fff' : 'var(--text-muted)',
                border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: T.font, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: canSubmit ? '0 4px 16px rgba(59,97,245,0.35)' : 'none',
              }}>
                {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                Submit for Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Documents summary (read-only when in review) */}
      {!['DRAFT', 'INFO_NEEDED'].includes(status) && (app.documents || []).length > 0 && (
        <div style={{ ...card({ padding: 16, marginBottom: 16 }) }}>
          <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>
            Submitted Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(app.documents || []).map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-subtle)' }}>
                <FileCheck size={14} color={doc.reviewer_approved ? T.success : T.brand} />
                <span style={{ fontSize: 13, fontFamily: T.font, color: 'var(--text-primary)', flex: 1 }}>
                  {doc.doc_type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: T.mono }}>{doc.file_size_kb}KB</span>
                {doc.rule_check_passed !== null && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: doc.rule_check_passed ? T.success : T.danger }}>
                    {doc.rule_check_passed ? 'PASSED' : 'FAILED'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status history */}
      <div style={{ ...card({ padding: 16 }) }}>
        <button
          onClick={async () => {
            if (!historyOpen) await loadHistory();
            setHistory(prev => prev);
            setHistoryOpen(h => !h);
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            Status History
          </span>
          <ChevronDown size={16} color='var(--text-muted)' style={{ transform: historyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {historyOpen && history.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <StatusTimeline history={history} />
          </div>
        )}
        {historyOpen && history.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, fontFamily: T.font }}>No history yet.</div>
        )}
      </div>

      {/* Appeal modal */}
      <Modal open={appealModal} onClose={() => setAppealModal(false)} title="Submit an Appeal">
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6, fontFamily: T.font }}>
            Explain why you believe the rejection was incorrect. Our senior review team will respond within 72 hours.
          </p>
          <textarea
            value={appealText}
            onChange={e => setAppeal(e.target.value)}
            placeholder="Describe your appeal reason in detail (minimum 20 characters)…"
            rows={5}
            style={{
              width: '100%', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: T.font,
              border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
            }}
          />
          <div style={{ fontSize: 11, color: appealText.length < 20 ? T.danger : 'var(--text-muted)', textAlign: 'right', marginTop: 4, fontFamily: T.mono }}>
            {appealText.length}/20 min characters
          </div>
          <button onClick={submitAppeal} disabled={submitting || appealText.trim().length < 20} style={{
            marginTop: 14, width: '100%', padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: T.brand, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.font,
            opacity: appealText.trim().length < 20 ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
            Submit Appeal
          </button>
        </div>
      </Modal>

      <OTPModal open={otpModal} onClose={() => setOtpModal(false)} onVerified={loadStatus} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWER VIEW
// ─────────────────────────────────────────────────────────────────────────────
const ReviewerView = () => {
  const toast = useToast();
  const [queue, setQueue]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState('');
  const [rejectModal, setReject]  = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [rejectData, setRejectData] = useState({ rejection_reason: '', rejection_details: '' });
  const [infoData, setInfoData]   = useState({ doc_type: 'AADHAAR_FRONT', message: '' });
  const [acting, setActing]       = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.risk_level = filter;
      const r = await kycAPI.queue(params);
      setQueue(r.data.results || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const act = async (fn, successMsg) => {
    setActing(true);
    try {
      await fn();
      await loadQueue();
      setSelected(null);
      toast.success(successMsg);
    } catch (e) { toast.error(e.message); }
    finally { setActing(false); }
  };

  const PRIORITY_COLORS = { URGENT: T.danger, HIGH: T.warning, NORMAL: T.brand, LOW: '#64748b' };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 160px)', minHeight: 500 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Queue list */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
              border: `1px solid ${filter === f ? T.brand : 'var(--border)'}`,
              background: filter === f ? 'rgba(59,97,245,0.1)' : 'transparent',
              color: filter === f ? T.brand : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: T.font,
            }}>
              {f || 'All'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={24} /></div>
          ) : queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, fontFamily: T.font }}>
              Queue is empty
            </div>
          ) : queue.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              style={{
                width: '100%', textAlign: 'left', padding: 14, borderRadius: 12,
                border: `1px solid ${selected?.id === item.id ? T.brand : 'var(--border)'}`,
                background: selected?.id === item.id ? 'rgba(59,97,245,0.06)' : 'var(--bg-card)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: 'var(--text-muted)' }}>{item.application_number}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                  color: PRIORITY_COLORS[item.priority] || T.brand,
                  background: `${PRIORITY_COLORS[item.priority] || T.brand}18`,
                  fontFamily: T.font,
                }}>
                  {item.priority}
                </span>
              </div>
              <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                {item.user_username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <KYCStatusBadge status={item.app_status} />
                <span style={{ fontSize: 10, color: item.is_sla_breached ? T.danger : 'var(--text-muted)', fontFamily: T.mono }}>
                  {item.is_sla_breached ? '⚠ SLA breached' : item.hours_until_sla != null ? `${item.hours_until_sla}h left` : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, ...card({ padding: 24, overflowY: 'auto' }) }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <ClipboardList size={40} color='var(--text-muted)' strokeWidth={1.5} />
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: T.font }}>Select an application to review</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontFamily: T.display, fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                    {selected.user_username}
                  </h2>
                  <KYCStatusBadge status={selected.app_status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: T.font }}>
                  {selected.user_email} · {selected.application_number}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontFamily: T.font, background: `${PRIORITY_COLORS[selected.risk_level] || T.brand}18`, color: PRIORITY_COLORS[selected.risk_level] || T.brand }}>
                  {selected.risk_level} risk · score {selected.risk_score}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {selected.app_status === 'PENDING_MANUAL' && (
                <button onClick={() => act(() => kycAPI.claim(selected.application_id), 'Application claimed!')} disabled={acting} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${T.brand}`, background: 'rgba(59,97,245,0.1)', color: T.brand, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {acting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <User size={13} />} Claim
                </button>
              )}
              {selected.app_status === 'UNDER_REVIEW' && (<>
                <button onClick={() => act(() => kycAPI.approve(selected.application_id), 'KYC Approved!')} disabled={acting} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${T.success}`, background: 'rgba(5,150,105,0.1)', color: T.success, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {acting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={13} />} Approve
                </button>
                <button onClick={() => setReject(true)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${T.danger}`, background: 'rgba(220,38,38,0.1)', color: T.danger, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={13} /> Reject
                </button>
                <button onClick={() => setInfoModal(true)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${T.warning}`, background: 'rgba(217,119,6,0.1)', color: T.warning, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={13} /> Request Info
                </button>
              </>)}
              {selected.app_status === 'APPEAL_SUBMITTED' && (<>
                <button onClick={() => act(() => kycAPI.approve(selected.application_id), 'Appeal approved!')} disabled={acting} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${T.success}`, background: 'rgba(5,150,105,0.1)', color: T.success, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} /> Approve Appeal
                </button>
                <button onClick={() => setReject(true)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: `1px solid ${T.danger}`, background: 'rgba(220,38,38,0.1)', color: T.danger, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={13} /> Reject Appeal
                </button>
              </>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Submitted', fmtFull(selected.submitted_at)],
                ['SLA Deadline', selected.sla_deadline ? fmtFull(selected.sla_deadline) : '—'],
                ['Risk Score', selected.risk_score ?? '—'],
                ['Assigned To', selected.assigned_to ?? 'Unassigned'],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-subtle)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: T.font, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: T.mono }}>{String(val)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reject modal */}
      <Modal open={rejectModal} onClose={() => setReject(false)} title="Reject KYC Application">
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: T.font, display: 'block', marginBottom: 6 }}>Rejection Reason</label>
            <select
              value={rejectData.rejection_reason}
              onChange={e => setRejectData(d => ({ ...d, rejection_reason: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 13, fontFamily: T.font, outline: 'none' }}
            >
              <option value=''>Select a reason…</option>
              {REJECTION_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: T.font, display: 'block', marginBottom: 6 }}>Details (shown to user)</label>
            <textarea
              value={rejectData.rejection_details}
              onChange={e => setRejectData(d => ({ ...d, rejection_details: e.target.value }))}
              rows={3} placeholder="Explain clearly what the user needs to do…"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 13, fontFamily: T.font, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={() => act(() => kycAPI.reject(selected.application_id, rejectData).then(() => setReject(false)), 'KYC Rejected')}
            disabled={acting || !rejectData.rejection_reason}
            style={{ width: '100%', padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, background: T.danger, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.font, opacity: !rejectData.rejection_reason ? 0.5 : 1 }}
          >
            Confirm Rejection
          </button>
        </div>
      </Modal>

      {/* Request info modal */}
      <Modal open={infoModal} onClose={() => setInfoModal(false)} title="Request Additional Document">
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: T.font, display: 'block', marginBottom: 6 }}>Document Type Needed</label>
            <select
              value={infoData.doc_type}
              onChange={e => setInfoData(d => ({ ...d, doc_type: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 13, fontFamily: T.font, outline: 'none' }}
            >
              {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: T.font, display: 'block', marginBottom: 6 }}>Message to User</label>
            <textarea
              value={infoData.message}
              onChange={e => setInfoData(d => ({ ...d, message: e.target.value }))}
              rows={3} placeholder="Explain what you need and why…"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 13, fontFamily: T.font, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            onClick={() => act(() => kycAPI.requestInfo(selected.application_id, infoData).then(() => setInfoModal(false)), 'Info requested')}
            disabled={acting}
            style={{ width: '100%', padding: '11px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, background: T.warning, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.font }}
          >
            Send Request
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN STATS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const AdminStatsView = () => {
  const toast = useToast();
  const [stats, setStats]   = useState(null);
  const [audit, setAudit]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [auditLoad, setAL]  = useState(true);

  useEffect(() => {
    kycAPI.stats()
      .then(r => setStats(r.data))
      .catch(e => toast.error(e.message))
      .finally(() => setLoad(false));
    kycAPI.auditLog({ limit: 20 })
      .then(r => setAudit(r.data.results || []))
      .catch(() => {})
      .finally(() => setAL(false));
  }, []);

  const EVENT_COLORS = {
    APPLICATION_CREATED: T.brand, STATUS_CHANGED: '#7c3aed', DOCUMENT_UPLOADED: T.success,
    DOCUMENT_VIEWED: '#0284c7', REVIEWER_APPROVED: T.success, REVIEWER_REJECTED: T.danger,
    AML_SCREENED: T.warning, EMAIL_SENT: '#64748b',
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Applications', value: stats?.total_applications ?? 0, icon: FileText, color: T.brand },
          { label: 'Pending in Queue', value: stats?.pending_in_queue ?? 0, icon: Clock, color: T.warning },
          { label: 'SLA Breached', value: stats?.sla_breached_count ?? 0, icon: AlertTriangle, color: T.danger },
          { label: 'Approval Rate', value: `${stats?.approval_rate_percent ?? 0}%`, icon: TrendingUp, color: T.success },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ ...card({ padding: 18 }) }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: T.font }}>{label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: T.display, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Today's activity + Status breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ ...card({ padding: 20 }) }}>
          <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>Today's Activity</h3>
          {[
            { label: 'Approved', value: stats?.approved_today ?? 0, color: T.success },
            { label: 'Rejected', value: stats?.rejected_today ?? 0, color: T.danger },
            { label: 'Avg Review Time', value: `${stats?.avg_review_hours ?? 0}h`, color: T.brand },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: T.font }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: T.display, color }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ ...card({ padding: 20 }) }}>
          <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>By Status</h3>
          {Object.entries(stats?.by_status || {}).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            if (!cfg) return null;
            const total = stats.total_applications || 1;
            return (
              <div key={status} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: T.font }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, fontFamily: T.mono }}>{count}</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: cfg.color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit log */}
      <div style={{ ...card({ padding: 20 }) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            Recent Audit Trail
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: T.mono }}>Hash-chained · Tamper-evident</span>
        </div>
        {auditLoad ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Spinner size={20} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {audit.slice(0, 15).map((entry) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-subtle)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: EVENT_COLORS[entry.event_type] || '#64748b' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: EVENT_COLORS[entry.event_type] || '#64748b', fontFamily: T.font, minWidth: 160 }}>
                  {entry.event_type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: T.font, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.application ?? '—'} {entry.actor ? `by ${entry.actor}` : ''}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: T.mono, flexShrink: 0 }}>
                  {fmtFull(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function KYCDashboard() {
  const { user, isAdmin } = useAuthStore();
  const isSupport = user?.is_support || isAdmin;
  const [tab, setTab] = useState(isAdmin ? 'admin' : isSupport ? 'reviewer' : 'user');

  const tabs = [
    ...(true        ? [{ key: 'user',     label: 'My KYC',       icon: Shield     }] : []),
    ...(isSupport   ? [{ key: 'reviewer', label: 'Review Queue',  icon: ClipboardList }] : []),
    ...(isAdmin     ? [{ key: 'admin',    label: 'KYC Analytics', icon: BarChart3  }] : []),
  ];

  return (
    <div style={{ padding: '24px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,97,245,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color={T.brand} />
            </div>
            <h1 style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              KYC Verification
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: T.font, marginLeft: 46 }}>
            Identity verification system · Credify
          </p>
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', background: 'var(--bg-subtle)', borderRadius: 12, width: 'fit-content' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', fontFamily: T.font,
                background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}>
                <Icon size={14} color={tab === t.key ? T.brand : 'var(--text-muted)'} />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {tab === 'user'     && <UserKYCView />}
      {tab === 'reviewer' && <ReviewerView />}
      {tab === 'admin'    && <AdminStatsView />}
    </div>
  );
}
