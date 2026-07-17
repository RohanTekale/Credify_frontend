// src/features/kyc/KYCDashboard.jsx
// ─── Credify KYC System — World-Class UI (Blueprint v2) ───────────────────────
// • Integrates seamlessly inside Dashboard sidebar (no separate route needed)
// • Full user flow: Start → Upload → OTP verify → Submit → Track → Appeal
// • Reviewer queue with split-pane + AML panel
// • Admin analytics with live stats, risk breakdown, audit trail
// Design: matches Credify design system (CSS vars, DM Sans/Sora, lucide-react)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, ShieldCheck, ShieldX,
  Upload, FileCheck, FileText, File,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  ChevronDown, RefreshCw,
  User, BarChart3, AlertCircle,
  ArrowRight, RotateCcw, MessageSquare, Inbox,
  Fingerprint, Camera, CreditCard, Send, X,
  Check, Loader2, TrendingUp, Activity,
  Lock, ClipboardList, Search,
  ChevronUp, Hash, Award,
} from 'lucide-react';
import { http } from '../../services/api';
import { Spinner, Modal, useToast } from '../../components/ui';
import useAuthStore from '../../store/authStore';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  brand:    '#3b61f5',
  brandDk:  '#1d37cc',
  brandLt:  'rgba(59,97,245,0.12)',
  success:  '#059669',
  successLt:'rgba(5,150,105,0.10)',
  warning:  '#d97706',
  warningLt:'rgba(217,119,6,0.10)',
  danger:   '#dc2626',
  dangerLt: 'rgba(220,38,38,0.08)',
  purple:   '#7c3aed',
  purpleLt: 'rgba(124,58,237,0.10)',
  orange:   '#ea580c',
  info:     '#0284c7',
  font:    "'DM Sans', sans-serif",
  display: "'Sora', sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

// ─── API layer ────────────────────────────────────────────────────────────────
const kycAPI = {
  start:       ()      => http.post('/v2/kyc/start/'),
  status:      ()      => http.get('/v2/kyc/status/'),
  history:     ()      => http.get('/v2/kyc/history/'),
  upload:      (fd)    => http.post('/v2/kyc/documents/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submit:      ()      => http.post('/v2/kyc/submit/'),
  resubmit:    ()      => http.post('/v2/kyc/resubmit/'),
  appeal:      (d)     => http.post('/v2/kyc/appeal/', d),
  sendOTP:     (d)     => http.post('/v2/kyc/otp/send/', d),
  verifyOTP:   (d)     => http.post('/v2/kyc/otp/verify/', d),
  queue:       (p)     => http.get('/v2/kyc/review/queue/', { params: p }),
  claim:       (id)    => http.post(`/v2/kyc/review/${id}/claim/`),
  approve:     (id)    => http.post(`/v2/kyc/review/${id}/approve/`),
  reject:      (id, d) => http.post(`/v2/kyc/review/${id}/reject/`, d),
  requestInfo: (id, d) => http.post(`/v2/kyc/review/${id}/request-info/`, d),
  aml:         (id)    => http.get(`/v2/kyc/review/${id}/aml/`),
  stats:       ()      => http.get('/v2/kyc/admin/stats/'),
  auditLog:    (p)     => http.get('/v2/kyc/admin/audit-log/', { params: p }),
};

// ─── Constants ────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { value: 'AADHAAR_FRONT', label: 'Aadhaar Card (Front)', required: true,  icon: CreditCard, hint: 'Name & Aadhaar number must be visible' },
  { value: 'AADHAAR_BACK',  label: 'Aadhaar Card (Back)',  required: false, icon: CreditCard, hint: 'Address side' },
  { value: 'PAN',           label: 'PAN Card',             required: true,  icon: FileText,   hint: '10-digit PAN must be fully visible' },
  { value: 'SELFIE',        label: 'Live Selfie',          required: true,  icon: Camera,     hint: 'Face clearly lit, no glasses' },
  { value: 'PASSPORT',      label: 'Passport',             required: false, icon: FileText,   hint: 'Bio-data page only' },
  { value: 'DL_FRONT',      label: "Driver's Licence (F)", required: false, icon: CreditCard, hint: 'Front side with photo' },
  { value: 'DL_BACK',       label: "Driver's Licence (B)", required: false, icon: CreditCard, hint: 'Back side with address' },
  { value: 'UTILITY_BILL',  label: 'Utility Bill',         required: false, icon: File,       hint: 'Not older than 3 months' },
];
const REQUIRED_DOCS = ['AADHAAR_FRONT', 'PAN', 'SELFIE'];

const STATUS_CFG = {
  DRAFT:            { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Draft',           icon: FileText,     },
  SUBMITTED:        { color: '#0284c7', bg: 'rgba(2,132,199,0.12)',   label: 'Submitted',        icon: Clock,        },
  PENDING_MANUAL:   { color: '#d97706', bg: 'rgba(217,119,6,0.12)',   label: 'Pending Review',   icon: Clock,        },
  UNDER_REVIEW:     { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Under Review',     icon: Search,       },
  INFO_NEEDED:      { color: '#ea580c', bg: 'rgba(234,88,12,0.12)',   label: 'Info Needed',      icon: AlertCircle,  },
  APPROVED:         { color: '#059669', bg: 'rgba(5,150,105,0.12)',   label: 'Approved',         icon: ShieldCheck,  },
  REJECTED:         { color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   label: 'Rejected',         icon: ShieldX,      },
  APPEAL_SUBMITTED: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Appeal Submitted', icon: MessageSquare,},
  RE_KYC_REQUIRED:  { color: '#d97706', bg: 'rgba(217,119,6,0.12)',   label: 'Re-KYC Required',  icon: RotateCcw,    },
};

const REJECT_REASONS = [
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

const RISK_COLORS = { URGENT: '#dc2626', HIGH: '#d97706', NORMAL: '#3b61f5', LOW: '#64748b', MEDIUM: '#d97706', BLOCKED: '#dc2626' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtFull = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
const card    = (x={}) => ({ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, ...x });

const GLOBAL_CSS = `
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn{ from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  .k-fade  { animation: fadeUp  .4s cubic-bezier(.16,1,.3,1) both }
  .k-scale { animation: scaleIn .3s cubic-bezier(.16,1,.3,1) both }
  .k-card:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,.1); }
  .k-card  { transition: all .2s ease; }
  .k-btn   { transition: all .18s ease; }
  .k-btn:hover { filter:brightness(1.07); transform:translateY(-1px); }
`;

// ──────────────────────────────────────────────────────────────────────────────
// ATOMS
// ──────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status, size='sm' }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.DRAFT;
  const Icon = c.icon;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding: size==='sm' ? '3px 10px' : '5px 14px',
      borderRadius:20, fontSize: size==='sm' ? 11 : 13,
      fontWeight:700, letterSpacing:'.03em',
      color:c.color, background:c.bg, fontFamily:T.font,
    }}>
      <Icon size={size==='sm'?10:13} strokeWidth={2.5} />
      {c.label}
    </span>
  );
};

const InfoBanner = ({ type, icon: Icon, title, body, action }) => {
  const map = {
    success:{ border:'rgba(5,150,105,.3)',  bg:'rgba(5,150,105,.06)',  color:T.success },
    danger: { border:'rgba(220,38,38,.25)', bg:T.dangerLt,             color:T.danger  },
    warning:{ border:'rgba(234,88,12,.3)',  bg:'rgba(234,88,12,.06)',   color:T.orange  },
    info:   { border:'rgba(124,58,237,.2)', bg:T.purpleLt,             color:T.purple  },
  };
  const c = map[type] || map.info;
  return (
    <div className="k-fade" style={{ ...card({ padding:18, marginBottom:16, border:`1px solid ${c.border}`, background:c.bg }) }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={18} color={c.color} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:T.font, fontWeight:700, fontSize:14, color:c.color, marginBottom:4 }}>{title}</div>
          {body && <div style={{ fontSize:13, color:'var(--text-secondary)', fontFamily:T.font, lineHeight:1.6 }}>{body}</div>}
          {action}
        </div>
      </div>
    </div>
  );
};

// ─── Progress stepper ─────────────────────────────────────────────────────────
const StepBar = ({ status }) => {
  const steps = [
    { label:'Start KYC',    sub:'Begin',         icon:Fingerprint, active:['DRAFT','RE_KYC_REQUIRED'] },
    { label:'Upload Docs',  sub:'Submit',        icon:Upload,      active:['DRAFT','INFO_NEEDED']     },
    { label:'Under Review', sub:'Team checks',   icon:Search,      active:['SUBMITTED','PENDING_MANUAL','UNDER_REVIEW','APPEAL_SUBMITTED'] },
    { label:'Completed',    sub:'Decision',      icon:Award,       active:['APPROVED','REJECTED']     },
  ];
  const ORDER = ['DRAFT','SUBMITTED','PENDING_MANUAL','UNDER_REVIEW','INFO_NEEDED','APPEAL_SUBMITTED','APPROVED','REJECTED','RE_KYC_REQUIRED'];
  const cur = ORDER.indexOf(status);
  const state = (s) => {
    if (s.active.includes(status)) return 'active';
    return cur > Math.max(...s.active.map(v => ORDER.indexOf(v))) ? 'done' : 'upcoming';
  };
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
      {steps.map((s, i) => {
        const st = state(s);
        const Icon = s.icon;
        return (
          <React.Fragment key={s.label}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', zIndex:1 }}>
              <div style={{
                width:38, height:38, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: st==='done' ? T.brand : st==='active' ? 'var(--bg-card)' : 'var(--bg-subtle)',
                border: st!=='upcoming' ? `2px solid ${T.brand}` : '2px solid var(--border)',
                color: st==='done' ? '#fff' : st==='active' ? T.brand : 'var(--text-muted)',
                boxShadow: st==='active' ? `0 0 0 4px ${T.brandLt},0 0 14px rgba(59,97,245,.25)` : 'none',
                transition:'all .35s cubic-bezier(.16,1,.3,1)',
              }}>
                {st==='done' ? <Check size={15} strokeWidth={3}/> : <Icon size={15} strokeWidth={1.8}/>}
              </div>
              <div style={{ textAlign:'center', marginTop:5, minWidth:58 }}>
                <div style={{ fontSize:10, fontWeight:700, color:st!=='upcoming'?'var(--text-primary)':'var(--text-muted)', fontFamily:T.font, whiteSpace:'nowrap' }}>{s.label}</div>
                <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:T.font, marginTop:1 }}>{s.sub}</div>
              </div>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:2, margin:'0 3px', marginBottom:26, background:'var(--bg-subtle)', borderRadius:2, overflow:'hidden', position:'relative' }}>
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg,${T.brand},${T.brandDk})`, transform: st==='done'?'scaleX(1)':'scaleX(0)', transformOrigin:'left', transition:'transform .55s cubic-bezier(.16,1,.3,1)', borderRadius:2 }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Document upload card ──────────────────────────────────────────────────────
const DocCard = ({ docType, uploaded, onUpload }) => {
  const cfg = DOC_TYPES.find(d => d.value === docType);
  const Icon = cfg?.icon || FileText;
  const [drag, setDrag]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [preview, setPreview] = useState(null);
  const ref = useRef();

  const handle = async (file) => {
    if (!file || file.size > 10*1024*1024) return;
    if (file.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = e => setPreview(e.target.result);
      r.readAsDataURL(file);
    }
    setBusy(true);
    try { await onUpload(docType, file); } finally { setBusy(false); }
  };

  return (
    <div
      className="k-card"
      style={{
        ...card({ padding:14 }),
        border: `1.5px ${drag?'dashed':'solid'} ${uploaded?'rgba(5,150,105,.4)':drag?T.brand:'var(--border)'}`,
        background: uploaded?'rgba(5,150,105,.04)':drag?T.brandLt:'var(--bg-card)',
        cursor: uploaded?'default':'pointer',
        position:'relative', overflow:'hidden',
      }}
      onDragOver={e=>{e.preventDefault();setDrag(true);}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0]);}}
      onClick={()=>!uploaded&&ref.current?.click()}
    >
      {uploaded && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.success},#10b981)` }} />}
      <input ref={ref} type="file" accept="image/jpeg,image/png,application/pdf" style={{ display:'none' }} onChange={e=>handle(e.target.files[0])} />

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:uploaded?T.successLt:T.brandLt, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:`1px solid ${uploaded?'rgba(5,150,105,.2)':'rgba(59,97,245,.15)'}` }}>
          {preview && uploaded
            ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : uploaded
              ? <FileCheck size={20} color={T.success} />
              : busy
                ? <Loader2 size={18} color={T.brand} style={{ animation:'spin 1s linear infinite' }} />
                : <Icon size={20} color={T.brand} />
          }
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
            <span style={{ fontFamily:T.font, fontWeight:600, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {cfg?.label}
            </span>
            {cfg?.required && <span style={{ fontSize:9, color:T.brand, fontWeight:800, background:T.brandLt, padding:'2px 5px', borderRadius:4, letterSpacing:'.05em' }}>REQ</span>}
          </div>
          {uploaded ? (
            <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
              {(uploaded.rule_check_notes||[]).slice(0,3).map((r,i) => (
                <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 6px', borderRadius:5, fontSize:9, fontWeight:700, fontFamily:T.font, background:r.passed?T.successLt:T.dangerLt, color:r.passed?T.success:T.danger }}>
                  {r.passed ? <Check size={8} strokeWidth={3}/> : <X size={8} strokeWidth={3}/>}
                  {r.rule?.replace(/_CHECK|_DETECTED/,'').replace(/_/g,' ')}
                </span>
              ))}
              {uploaded.rule_check_passed===null && <span style={{ fontSize:10, color:T.warning, fontFamily:T.font, display:'flex', alignItems:'center', gap:4 }}><Loader2 size={10} style={{ animation:'spin 1s linear infinite' }}/> Checking…</span>}
              {uploaded.rule_check_passed===true && !(uploaded.rule_check_notes?.length) && <span style={{ fontSize:10, color:T.success, fontFamily:T.font, fontWeight:700 }}>✓ All checks passed</span>}
            </div>
          ) : (
            <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.font }}>{cfg?.hint || 'JPG, PNG or PDF · Max 10MB'}</span>
          )}
        </div>

        <div onClick={e=>e.stopPropagation()}>
          <button onClick={()=>ref.current?.click()} disabled={busy} className="k-btn" style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'7px 12px', borderRadius:9, fontSize:12, fontWeight:600,
            border:`1px solid ${uploaded?'rgba(5,150,105,.35)':'rgba(59,97,245,.3)'}`,
            background:uploaded?T.successLt:T.brandLt,
            color:uploaded?T.success:T.brand,
            cursor:'pointer', fontFamily:T.font, whiteSpace:'nowrap',
          }}>
            {busy ? <Loader2 size={11} style={{ animation:'spin 1s linear infinite' }}/> : uploaded ? <RotateCcw size={11}/> : <Upload size={11}/>}
            {busy ? '…' : uploaded ? 'Replace' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── OTP modal ────────────────────────────────────────────────────────────────
const OTPModal = ({ open, onClose, onVerified }) => {
  const [step, setStep]   = useState('send');
  const [otp, setOtp]     = useState(['','','','','','']);
  const [busy, setBusy]   = useState(false);
  const [ch, setCh]       = useState('email');
  const [cd, setCd]       = useState(0);
  const refs = Array.from({length:6},()=>useRef());
  const toast = useToast();

  useEffect(()=>{
    if(cd>0){const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t);}
  },[cd]);

  const send = async () => {
    setBusy(true);
    try { await kycAPI.sendOTP({channel:ch}); setStep('verify'); setCd(60); toast.success(`OTP sent to your ${ch}!`); }
    catch(e){ toast.error(e.message); }
    finally{ setBusy(false); }
  };

  const verify = async () => {
    const code = otp.join('');
    if(code.length!==6) return;
    setBusy(true);
    try {
      await kycAPI.verifyOTP({otp:code});
      toast.success('Verified!');
      onVerified(); onClose();
    } catch(e){
      toast.error('Invalid OTP');
      setOtp(['','','','','','']);
      refs[0].current?.focus();
    }
    finally{ setBusy(false); }
  };

  const digit = (i, v) => {
    if(!/^\d?$/.test(v)) return;
    const n=[...otp]; n[i]=v; setOtp(n);
    if(v && i<5) refs[i+1].current?.focus();
  };

  if(!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Verify Your Identity">
      <style>{GLOBAL_CSS}</style>
      <div style={{ padding:'8px 0' }} className="k-scale">
        {step==='send' ? (
          <>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:T.brandLt, border:`1px solid rgba(59,97,245,.2)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Shield size={28} color={T.brand}/>
              </div>
              <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, fontFamily:T.font }}>
                Verify your contact before submitting KYC. This ensures only you can submit your application.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[{key:'email',label:'Email OTP',icon:'📧',desc:'Sent to your email'},{key:'sms',label:'SMS OTP',icon:'📱',desc:'Sent to your phone'}].map(c=>(
                <button key={c.key} onClick={()=>setCh(c.key)} style={{ padding:'12px 14px', borderRadius:12, fontSize:13, fontWeight:600, textAlign:'left', border:`1.5px solid ${ch===c.key?T.brand:'var(--border)'}`, background:ch===c.key?T.brandLt:'transparent', color:ch===c.key?T.brand:'var(--text-secondary)', cursor:'pointer', fontFamily:T.font, transition:'all .2s' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{c.icon}</div>
                  <div>{c.label}</div>
                  <div style={{ fontSize:10, opacity:.7, marginTop:1 }}>{c.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={send} disabled={busy} className="k-btn" style={{ width:'100%', padding:'13px', borderRadius:12, fontSize:14, fontWeight:700, background:`linear-gradient(135deg,${T.brand},${T.brandDk})`, color:'#fff', border:'none', cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(59,97,245,.35)' }}>
              {busy ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={15}/>} Send OTP
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, fontFamily:T.font, textAlign:'center', marginBottom:20 }}>
              Enter the 6-digit code sent to your {ch}.<br/>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>Valid for 10 minutes.</span>
            </p>
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:28 }}>
              {otp.map((d,i)=>(
                <input key={i} ref={refs[i]} value={d} maxLength={1}
                  onChange={e=>digit(i,e.target.value)}
                  onKeyDown={e=>{if(e.key==='Backspace'&&!d&&i>0)refs[i-1].current?.focus(); if(e.key==='Enter')verify();}}
                  style={{ width:46, height:54, textAlign:'center', fontSize:24, fontWeight:700, fontFamily:T.mono, borderRadius:12, border:`2px solid ${d?T.brand:'var(--border)'}`, background:d?T.brandLt:'var(--bg-subtle)', color:'var(--text-primary)', outline:'none', transition:'all .2s', boxShadow:d?`0 0 8px rgba(59,97,245,.2)`:'none' }}
                />
              ))}
            </div>
            <button onClick={verify} disabled={busy||otp.join('').length!==6} className="k-btn" style={{ width:'100%', padding:'13px', borderRadius:12, fontSize:14, fontWeight:700, background:otp.join('').length===6?`linear-gradient(135deg,${T.brand},${T.brandDk})`:'var(--bg-muted)', color:otp.join('').length===6?'#fff':'var(--text-muted)', border:'none', cursor:otp.join('').length===6?'pointer':'not-allowed', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
              {busy ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : <ShieldCheck size={15}/>} Verify & Proceed
            </button>
            <div style={{ textAlign:'center', marginTop:12 }}>
              {cd>0
                ? <span style={{ fontSize:12, color:'var(--text-muted)', fontFamily:T.font }}>Resend in {cd}s</span>
                : <button onClick={()=>{setStep('send');setOtp(['','','','','','']);}} style={{ fontSize:12, color:T.brand, background:'none', border:'none', cursor:'pointer', fontFamily:T.font }}>← Try another method</button>
              }
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

// ─── Status timeline ──────────────────────────────────────────────────────────
const Timeline = ({ history }) => (
  <div>
    {history.map((h,i)=>{
      const c = STATUS_CFG[h.to_status]||STATUS_CFG.DRAFT;
      const Icon = c.icon;
      return (
        <div key={h.id||i} style={{ display:'flex', gap:12, marginBottom:i<history.length-1?20:0, position:'relative' }}>
          {i<history.length-1 && <div style={{ position:'absolute', left:15, top:32, bottom:-20, width:1.5, background:'var(--bg-muted)', borderRadius:1 }}/>}
          <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:c.bg, border:`1px solid ${c.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={13} color={c.color}/>
          </div>
          <div style={{ paddingTop:5 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontFamily:T.font, marginBottom:2 }}>
              {h.from_status && <span style={{ color:'var(--text-muted)', fontWeight:400 }}>{h.from_status.replace(/_/g,' ')} → </span>}
              <span style={{ color:c.color }}>{h.to_status?.replace(/_/g,' ')}</span>
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.mono }}>{fmtFull(h.timestamp)}{h.changed_by_username?` · ${h.changed_by_username}`:''}</div>
            {h.change_reason && <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:3, fontFamily:T.font, lineHeight:1.5 }}>{h.change_reason}</div>}
          </div>
        </div>
      );
    })}
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// USER KYC VIEW
// ──────────────────────────────────────────────────────────────────────────────
const UserKYCView = () => {
  const { user } = useAuthStore();
  const toast    = useToast();
  const [app, setApp]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [otpModal, setOtp]          = useState(false);
  const [appealText, setAppealText] = useState('');
  const [appealModal, setAppealModal] = useState(false);
  const [histOpen, setHistOpen]     = useState(false);
  const [histData, setHistData]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting]     = useState(false);
  const [showOpt, setShowOpt]       = useState(false);

  const load = useCallback(async () => {
    try { const r=await kycAPI.status(); setApp(r.data); }
    catch { setApp(null); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const startKYC = async () => {
    setStarting(true);
    try { await kycAPI.start(); await load(); toast.success('KYC started!'); }
    catch(e){ toast.error(e.message); }
    finally { setStarting(false); }
  };

  const uploadDoc = async (docType, file) => {
    const fd = new FormData();
    fd.append('doc_type', docType);
    fd.append('file', file);
    try { await kycAPI.upload(fd); await load(); toast.success(`${docType.replace(/_/g,' ')} uploaded!`); }
    catch(e){ toast.error(e.message); throw e; }
  };

  const submit = async () => {
    if(!user?.is_email_verified){ setOtp(true); return; }
    setSubmitting(true);
    try { await kycAPI.submit(); await load(); toast.success('Submitted for review! We\'ll respond within 24 hours.'); }
    catch(e){ toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const resubmit = async () => {
    setSubmitting(true);
    try { await kycAPI.resubmit(); await load(); toast.success('Resubmitted!'); }
    catch(e){ toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const submitAppeal = async () => {
    if(appealText.trim().length<20){ toast.error('Please write at least 20 characters.'); return; }
    setSubmitting(true);
    try {
      await kycAPI.appeal({ reason: appealText });
      await load();
      setAppealModal(false); setAppealText('');
      toast.success('Appeal submitted. Senior team responds in 72 hours.');
    }
    catch(e){ toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const loadHistory = async () => {
    try { const r=await kycAPI.history(); setHistData(r.data.history||[]); } catch{}
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if(loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:80, gap:14 }}>
      <Spinner size={30}/>
      <span style={{ fontSize:13, color:'var(--text-muted)', fontFamily:T.font }}>Loading KYC status…</span>
    </div>
  );

  // ── No application ─────────────────────────────────────────────────────────
  if(!app) return (
    <div style={{ maxWidth:540, margin:'0 auto' }} className="k-fade">
      <style>{GLOBAL_CSS}</style>
      <div style={{ ...card({ padding:40, textAlign:'center', overflow:'hidden', position:'relative' }) }}>
        <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,97,245,.1) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ width:80, height:80, borderRadius:24, margin:'0 auto 24px', background:T.brandLt, border:`1px solid rgba(59,97,245,.2)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 0 10px rgba(59,97,245,.05)` }}>
            <Fingerprint size={36} color={T.brand}/>
          </div>
          <h2 style={{ fontFamily:T.display, fontSize:24, fontWeight:800, marginBottom:10, color:'var(--text-primary)', letterSpacing:'-.02em' }}>Verify Your Identity</h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:28, fontFamily:T.font, maxWidth:340, margin:'0 auto 28px' }}>
            Complete KYC to unlock your Credify credit card and all premium features. Takes under 5 minutes.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
            {[{icon:'🪪',title:'Upload ID',desc:'Aadhaar + PAN'},{icon:'🤳',title:'Live Selfie',desc:'Face match'},{icon:'✅',title:'Get Verified',desc:'Under 24h'}].map((s,i)=>(
              <div key={i} style={{ padding:'14px 10px', borderRadius:14, background:'var(--bg-subtle)', border:'1px solid var(--border)', textAlign:'center' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-primary)', fontFamily:T.font }}>{s.title}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:T.font, marginTop:1 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:'11px 14px', borderRadius:10, background:T.brandLt, border:`1px solid rgba(59,97,245,.15)`, marginBottom:22, display:'flex', alignItems:'center', gap:9 }}>
            <Lock size={13} color={T.brand}/>
            <span style={{ fontSize:12, color:T.brand, fontFamily:T.font, fontWeight:500 }}>AES-256 encrypted · Stored on private Cloudinary storage · Never shared</span>
          </div>
          <button onClick={startKYC} disabled={starting} className="k-btn" style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:15, fontWeight:700, background:`linear-gradient(135deg,${T.brand},${T.brandDk})`, color:'#fff', border:'none', cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 22px rgba(59,97,245,.4)' }}>
            {starting ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> : <ArrowRight size={18}/>}
            Start KYC Verification
          </button>
        </div>
      </div>
      <OTPModal open={otpModal} onClose={()=>setOtp(false)} onVerified={load}/>
    </div>
  );

  // ── Main state variables ───────────────────────────────────────────────────
  const status      = app.status;
  const uploadedMap = {};
  (app.documents||[]).forEach(d=>{ uploadedMap[d.doc_type]=d; });
  const missing     = (app.missing_doc_types||[]).filter(d=>REQUIRED_DOCS.includes(d));
  const allDone     = missing.length===0;
  const anyFailed   = (app.documents||[]).some(d=>d.rule_check_passed===false);
  const canSubmit   = status==='DRAFT' && allDone && !anyFailed;
  const progress    = Math.round(((REQUIRED_DOCS.length-missing.length)/REQUIRED_DOCS.length)*100);

  return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }} className="k-fade">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h2 style={{ fontFamily:T.display, fontSize:20, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-.02em' }}>KYC Verification</h2>
            <StatusBadge status={status}/>
          </div>
          {app.application_number && <span style={{ fontFamily:T.mono, fontSize:11, color:'var(--text-muted)' }}>{app.application_number}</span>}
        </div>
        <button onClick={load} style={{ padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:T.font, transition:'all .15s' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.brand}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
        >
          <RefreshCw size={12}/> Refresh
        </button>
      </div>

      {/* Steps */}
      <StepBar status={status}/>

      {/* Status banners */}
      {status==='APPROVED' && <InfoBanner type="success" icon={ShieldCheck} title={`KYC Approved — Expires ${fmt(app.expires_at)}`} body={`Verified on ${fmt(app.approved_at)}. All Credify features are now unlocked.`}/>}
      {status==='REJECTED' && <InfoBanner type="danger" icon={ShieldX} title={`Rejected — ${app.rejection_reason?.replace(/_/g,' ')}`} body={app.rejection_details||'Your application was not approved. Submit an appeal if you believe this is an error.'}
        action={<button onClick={()=>setAppealModal(true)} className="k-btn" style={{ marginTop:10, padding:'8px 16px', borderRadius:9, fontSize:13, fontWeight:600, background:T.dangerLt, border:`1px solid rgba(220,38,38,.3)`, color:T.danger, cursor:'pointer', fontFamily:T.font, display:'inline-flex', alignItems:'center', gap:6 }}><MessageSquare size={13}/> Submit Appeal</button>}
      />}
      {status==='INFO_NEEDED' && <InfoBanner type="warning" icon={AlertCircle} title={`Additional Document Required: ${app.info_needed_doc_type?.replace(/_/g,' ')}`} body={app.info_needed_message||'Upload the requested document and resubmit.'}
        action={<button onClick={resubmit} disabled={submitting} style={{ marginTop:10, padding:'8px 16px', borderRadius:9, fontSize:13, fontWeight:600, background:'rgba(234,88,12,.12)', border:`1px solid rgba(234,88,12,.3)`, color:T.orange, cursor:'pointer', fontFamily:T.font, display:'inline-flex', alignItems:'center', gap:6 }}><RotateCcw size={13}/> Resubmit</button>}
      />}
      {(status==='PENDING_MANUAL'||status==='UNDER_REVIEW') && <InfoBanner type="info" icon={Clock} title="Under review — estimated 24 hours" body={`Submitted ${fmtFull(app.submitted_at)}. We'll notify you by email when there's an update.`}/>}
      {status==='APPEAL_SUBMITTED' && <InfoBanner type="info" icon={MessageSquare} title="Appeal submitted — response within 72 hours" body="Our senior review team will assess your appeal and respond via email."/>}
      {status==='RE_KYC_REQUIRED' && <InfoBanner type="warning" icon={RotateCcw} title="Re-KYC Required — your verification has expired" body="Complete a new KYC verification to continue using your Credify card."
        action={<button onClick={startKYC} disabled={starting} style={{ marginTop:10, padding:'8px 16px', borderRadius:9, fontSize:13, fontWeight:600, background:T.warningLt, border:`1px solid rgba(217,119,6,.3)`, color:T.warning, cursor:'pointer', fontFamily:T.font, display:'inline-flex', alignItems:'center', gap:6 }}><ArrowRight size={13}/> Start Re-KYC</button>}
      />}

      {/* Document upload */}
      {(status==='DRAFT'||status==='INFO_NEEDED') && (
        <div style={{ ...card({ padding:22, marginBottom:16 }) }} className="k-fade">
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>Required Documents</h3>
              <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.font }}>{REQUIRED_DOCS.length-missing.length} of {REQUIRED_DOCS.length} uploaded</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:20, fontWeight:800, color:T.brand, fontFamily:T.display }}>{progress}%</div>
              <div style={{ width:80, height:4, borderRadius:2, background:'var(--bg-muted)', overflow:'hidden', marginTop:4 }}>
                <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${T.brand},#10b981)`, borderRadius:2, transition:'width .6s cubic-bezier(.16,1,.3,1)' }}/>
              </div>
            </div>
          </div>

          {/* Email verify warning */}
          {!user?.is_email_verified && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:T.warningLt, border:`1px solid rgba(217,119,6,.25)`, marginBottom:14 }}>
              <AlertTriangle size={14} color={T.warning}/>
              <span style={{ fontSize:12, color:T.warning, fontFamily:T.font, flex:1 }}>Verify your email before submitting.</span>
              <button onClick={()=>setOtp(true)} style={{ fontSize:11, fontWeight:700, color:T.warning, background:'transparent', border:'none', cursor:'pointer', fontFamily:T.font, textDecoration:'underline' }}>Verify now</button>
            </div>
          )}

          {/* Required docs */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {DOC_TYPES.filter(d=>d.required).map(dt=>(
              <DocCard key={dt.value} docType={dt.value} uploaded={uploadedMap[dt.value]} onUpload={uploadDoc}/>
            ))}
          </div>

          {/* Optional docs toggle */}
          <button onClick={()=>setShowOpt(!showOpt)} style={{ width:'100%', display:'flex', alignItems:'center', gap:6, marginTop:14, padding:'10px 0', background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--text-muted)', fontFamily:T.font }}>
            {showOpt ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
            {showOpt ? 'Hide' : 'Add'} optional documents ({DOC_TYPES.filter(d=>!d.required).length} available)
          </button>
          {showOpt && (
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:4 }}>
              {DOC_TYPES.filter(d=>!d.required).map(dt=>(
                <DocCard key={dt.value} docType={dt.value} uploaded={uploadedMap[dt.value]} onUpload={uploadDoc}/>
              ))}
            </div>
          )}

          {/* Submit section */}
          {status==='DRAFT' && (
            <div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid var(--border)' }}>
              {!allDone && <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8, fontFamily:T.font, display:'flex', alignItems:'center', gap:6 }}><AlertCircle size={11} color={T.warning}/> Needed: {missing.map(d=>d.replace(/_/g,' ')).join(', ')}</div>}
              {anyFailed && <div style={{ fontSize:12, color:T.danger, marginBottom:8, fontFamily:T.font, display:'flex', alignItems:'center', gap:6 }}><XCircle size={11}/> Some documents failed checks. Re-upload them.</div>}
              <button onClick={submit} disabled={!canSubmit||submitting} className="k-btn" style={{ width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:700, background:canSubmit?`linear-gradient(135deg,${T.brand},${T.brandDk})`:'var(--bg-muted)', color:canSubmit?'#fff':'var(--text-muted)', border:'none', cursor:canSubmit?'pointer':'not-allowed', fontFamily:T.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:canSubmit?'0 6px 18px rgba(59,97,245,.35)':'none', transition:'all .2s' }}>
                {submitting ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={16}/>} Submit for Review
              </button>
              {canSubmit && <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', fontFamily:T.font, marginTop:10 }}>🔒 Securely submitted · Avg review: 24 hours</p>}
            </div>
          )}
        </div>
      )}

      {/* Submitted docs read-only */}
      {!['DRAFT','INFO_NEEDED'].includes(status) && (app.documents||[]).length>0 && (
        <div style={{ ...card({ padding:18, marginBottom:16 }) }} className="k-fade">
          <h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:12 }}>Submitted Documents</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {(app.documents||[]).map(doc=>(
              <div key={doc.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:doc.reviewer_approved?T.successLt:T.brandLt, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FileCheck size={14} color={doc.reviewer_approved?T.success:T.brand}/>
                </div>
                <span style={{ fontSize:13, fontFamily:T.font, color:'var(--text-primary)', flex:1 }}>{doc.doc_type.replace(/_/g,' ')}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.mono }}>{doc.file_size_kb}KB</span>
                {doc.rule_check_passed!==null && (
                  <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:5, background:doc.rule_check_passed?T.successLt:T.dangerLt, color:doc.rule_check_passed?T.success:T.danger, fontFamily:T.font }}>
                    {doc.rule_check_passed ? 'PASSED' : 'FAILED'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application details */}
      {(app.risk_level || app.submitted_at) && (
        <div style={{ ...card({ padding:18, marginBottom:16 }) }}>
          <h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:12 }}>Application Details</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              ['Application #', app.application_number, T.mono],
              ['Risk Level',    app.risk_level||'—',    null],
              ['Submitted',     fmt(app.submitted_at),  T.mono],
              ['Expires',       app.expires_at?fmt(app.expires_at):'N/A', T.mono],
            ].map(([label,val,fnt])=>(
              <div key={label} style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-subtle)' }}>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:T.font, marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontFamily:fnt||T.font }}>{val||'—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ ...card({ padding:18 }) }}>
        <button onClick={async()=>{ if(!histOpen) await loadHistory(); setHistOpen(h=>!h); }}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <span style={{ fontFamily:T.font, fontWeight:700, fontSize:14, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={14} color={T.brand}/> Status History
          </span>
          <ChevronDown size={14} color="var(--text-muted)" style={{ transform:histOpen?'rotate(180deg)':'none', transition:'transform .2s' }}/>
        </button>
        {histOpen && (
          <div style={{ marginTop:16 }}>
            {histData.length>0 ? <Timeline history={histData}/> : <div style={{ fontSize:13, color:'var(--text-muted)', fontFamily:T.font }}>No history yet.</div>}
          </div>
        )}
      </div>

      {/* Appeal modal */}
      <Modal open={appealModal} onClose={()=>setAppealModal(false)} title="Submit an Appeal">
        <div style={{ padding:'8px 0' }}>
          <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:14, lineHeight:1.6, fontFamily:T.font }}>
            Explain why you believe the rejection was incorrect. Our senior team responds within 72 hours.
          </p>
          <textarea value={appealText} onChange={e=>setAppealText(e.target.value)} rows={5}
            placeholder="Describe your appeal reason in detail (minimum 20 characters)…"
            style={{ width:'100%', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:T.font, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', resize:'vertical', outline:'none', boxSizing:'border-box', lineHeight:1.6 }}
          />
          <div style={{ fontSize:11, color:appealText.length<20?T.danger:T.success, textAlign:'right', marginTop:4, fontFamily:T.mono }}>{appealText.length}/20 min</div>
          <button onClick={submitAppeal} disabled={submitting||appealText.trim().length<20} style={{ marginTop:14, width:'100%', padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, background:T.brand, color:'#fff', border:'none', cursor:'pointer', fontFamily:T.font, opacity:appealText.trim().length<20?.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {submitting ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={15}/>} Submit Appeal
          </button>
        </div>
      </Modal>

      <OTPModal open={otpModal} onClose={()=>setOtp(false)} onVerified={load}/>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// REVIEWER VIEW
// ──────────────────────────────────────────────────────────────────────────────
const ReviewerView = () => {
  const toast = useToast();
  const [queue, setQueue]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSel]    = useState(null);
  const [riskF, setRiskF]     = useState('');
  const [search, setSearch]   = useState('');
  const [rejectModal, setRM]  = useState(false);
  const [infoModal, setIM]    = useState(false);
  const [aml, setAml]         = useState(null);
  const [amlLoad, setAmlLoad] = useState(false);
  const [rData, setRData]     = useState({ rejection_reason:'', rejection_details:'' });
  const [iData, setIData]     = useState({ doc_type:'AADHAAR_FRONT', message:'' });
  const [acting, setActing]   = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const p = riskF ? { risk_level:riskF } : {};
      const r = await kycAPI.queue(p);
      setQueue(r.data.results||[]);
    } catch(e){ toast.error(e.message); }
    finally { setLoading(false); }
  },[riskF]);

  useEffect(()=>{ loadQueue(); },[loadQueue]);

  const act = async (fn, msg) => {
    setActing(true);
    try { await fn(); await loadQueue(); setSel(null); toast.success(msg); }
    catch(e){ toast.error(e.message); }
    finally { setActing(false); }
  };

  const selectApp = async (item) => {
    setSel(item);
    setAml(null); setAmlLoad(true);
    try { const r=await kycAPI.aml(item.application_id); setAml(r.data); }
    catch{ setAml(null); }
    finally { setAmlLoad(false); }
  };

  const filtered = queue.filter(item =>
    !search || item.user_username?.toLowerCase().includes(search.toLowerCase()) || item.application_number?.includes(search)
  );

  return (
    <div style={{ display:'flex', gap:14, height:'calc(100vh - 130px)', minHeight:500 }}>
      <style>{GLOBAL_CSS}</style>

      {/* Queue panel */}
      <div style={{ width:280, flexShrink:0, display:'flex', flexDirection:'column', gap:9 }}>
        <div style={{ position:'relative' }}>
          <Search size={12} color="var(--text-muted)" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or #…"
            style={{ width:'100%', padding:'8px 10px 8px 30px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:12, fontFamily:T.font, outline:'none', boxSizing:'border-box' }}
          />
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {['','HIGH','MEDIUM','LOW'].map(f=>(
            <button key={f} onClick={()=>setRiskF(f)} style={{ flex:1, padding:'5px 0', borderRadius:7, fontSize:10, fontWeight:700, border:`1px solid ${riskF===f?T.brand:'var(--border)'}`, background:riskF===f?T.brandLt:'transparent', color:riskF===f?T.brand:'var(--text-secondary)', cursor:'pointer', fontFamily:T.font }}>
              {f||'All'}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.font }}>
          {filtered.length} application{filtered.length!==1?'s':''} in queue
        </div>
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
          {loading
            ? <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner size={22}/></div>
            : filtered.length===0
              ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13, fontFamily:T.font }}>
                  <Inbox size={26} style={{ marginBottom:8, opacity:.4, display:'block', margin:'0 auto 8px' }}/> Queue is empty
                </div>
              : filtered.map(item=>(
                  <button key={item.id} onClick={()=>selectApp(item)} style={{ width:'100%', textAlign:'left', padding:13, borderRadius:12, border:`1px solid ${selected?.id===item.id?T.brand:'var(--border)'}`, background:selected?.id===item.id?T.brandLt:'var(--bg-card)', cursor:'pointer', transition:'all .15s' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontFamily:T.mono, fontSize:10, color:'var(--text-muted)' }}>{item.application_number}</span>
                      <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:5, color:RISK_COLORS[item.priority]||T.brand, background:`${RISK_COLORS[item.priority]||T.brand}18`, fontFamily:T.font }}>
                        {item.priority}
                      </span>
                    </div>
                    <div style={{ fontFamily:T.font, fontWeight:600, fontSize:13, color:'var(--text-primary)', marginBottom:5 }}>{item.user_username}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <StatusBadge status={item.app_status}/>
                      {item.is_sla_breached
                        ? <span style={{ fontSize:9, color:T.danger, fontFamily:T.font, fontWeight:700 }}>⚠ SLA BREACH</span>
                        : item.hours_until_sla!=null
                          ? <span style={{ fontSize:9, color:item.hours_until_sla<4?T.warning:'var(--text-muted)', fontFamily:T.mono }}>{item.hours_until_sla}h left</span>
                          : null
                      }
                    </div>
                  </button>
                ))
          }
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex:1, ...card({ padding:22, overflowY:'auto' }) }}>
        {!selected
          ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
              <div style={{ width:60, height:60, borderRadius:18, background:'var(--bg-subtle)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ClipboardList size={26} color="var(--text-muted)" strokeWidth={1.5}/>
              </div>
              <span style={{ fontSize:14, color:'var(--text-muted)', fontFamily:T.font }}>Select an application to review</span>
            </div>
          : <div className="k-scale">
              {/* App header */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, paddingBottom:18, borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:T.brandLt, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:T.brand, fontFamily:T.display }}>
                    {selected.user_username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <h2 style={{ fontFamily:T.display, fontWeight:700, fontSize:17, color:'var(--text-primary)' }}>{selected.user_username}</h2>
                      <StatusBadge status={selected.app_status}/>
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.font }}>{selected.user_email} · {selected.application_number}</div>
                  </div>
                </div>
                <span style={{ fontSize:11, padding:'4px 10px', borderRadius:6, fontWeight:700, fontFamily:T.font, background:`${RISK_COLORS[selected.risk_level]||T.brand}18`, color:RISK_COLORS[selected.risk_level]||T.brand }}>
                  {selected.risk_level||'?'} risk · {selected.risk_score??'?'}pts
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                {selected.app_status==='PENDING_MANUAL' && (
                  <button onClick={()=>act(()=>kycAPI.claim(selected.application_id),'Application claimed!')} disabled={acting}
                    style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, border:`1px solid ${T.brand}`, background:T.brandLt, color:T.brand, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', gap:7 }}>
                    {acting?<Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>:<User size={13}/>} Claim
                  </button>
                )}
                {(selected.app_status==='UNDER_REVIEW'||selected.app_status==='APPEAL_SUBMITTED') && (<>
                  <button onClick={()=>act(()=>kycAPI.approve(selected.application_id),'KYC Approved!')} disabled={acting}
                    style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, border:`1px solid ${T.success}`, background:T.successLt, color:T.success, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', gap:7 }}>
                    {acting?<Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>:<CheckCircle2 size={13}/>}
                    {selected.app_status==='APPEAL_SUBMITTED'?'Approve Appeal':'Approve'}
                  </button>
                  <button onClick={()=>setRM(true)} style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, border:`1px solid ${T.danger}`, background:T.dangerLt, color:T.danger, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', gap:7 }}>
                    <XCircle size={13}/> {selected.app_status==='APPEAL_SUBMITTED'?'Reject Appeal':'Reject'}
                  </button>
                  {selected.app_status==='UNDER_REVIEW' && (
                    <button onClick={()=>setIM(true)} style={{ padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, border:`1px solid ${T.warning}`, background:T.warningLt, color:T.warning, cursor:'pointer', fontFamily:T.font, display:'flex', alignItems:'center', gap:7 }}>
                      <AlertCircle size={13}/> Request Info
                    </button>
                  )}
                </>)}
              </div>

              {/* Details grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                {[['Submitted',fmtFull(selected.submitted_at)],['SLA Deadline',selected.sla_deadline?fmtFull(selected.sla_deadline):'—'],['Risk Score',selected.risk_score??'—'],['Assigned To',selected.assigned_to??'Unassigned']].map(([l,v])=>(
                  <div key={l} style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-subtle)' }}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:T.font, marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontFamily:T.mono }}>{String(v)}</div>
                  </div>
                ))}
              </div>

              {/* AML panel */}
              <div style={{ ...card({ padding:16 }) }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <Shield size={14} color={T.brand}/><h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>AML Screening</h3>
                </div>
                {amlLoad
                  ? <div style={{ display:'flex', justifyContent:'center', padding:14 }}><Spinner size={18}/></div>
                  : aml
                    ? <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        {[['OFAC Match',aml.is_ofac_match?'⚠ HIT':'✓ Clear',aml.is_ofac_match?T.danger:T.success],['UN Match',aml.is_un_match?'⚠ HIT':'✓ Clear',aml.is_un_match?T.danger:T.success],['Risk Rating',aml.risk_rating||'—',RISK_COLORS[aml.risk_rating]||'var(--text-primary)'],['Match Score',aml.match_score!=null?`${(aml.match_score*100).toFixed(0)}%`:'—','var(--text-primary)']].map(([l,v,c])=>(
                          <div key={l} style={{ padding:'9px 12px', borderRadius:8, background:'var(--bg-subtle)' }}>
                            <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:T.font, marginBottom:2 }}>{l}</div>
                            <div style={{ fontSize:13, fontWeight:700, color:c, fontFamily:T.mono }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    : <div style={{ fontSize:12, color:'var(--text-muted)', fontFamily:T.font }}>AML data not available.</div>
                }
              </div>
            </div>
        }
      </div>

      {/* Reject modal */}
      <Modal open={rejectModal} onClose={()=>setRM(false)} title="Reject KYC Application">
        <div style={{ padding:'8px 0' }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', fontFamily:T.font, display:'block', marginBottom:6 }}>Rejection Reason</label>
            <select value={rData.rejection_reason} onChange={e=>setRData(d=>({...d,rejection_reason:e.target.value}))}
              style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:13, fontFamily:T.font, outline:'none' }}>
              <option value=''>Select a reason…</option>
              {REJECT_REASONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', fontFamily:T.font, display:'block', marginBottom:6 }}>Details (shown to user)</label>
            <textarea value={rData.rejection_details} onChange={e=>setRData(d=>({...d,rejection_details:e.target.value}))} rows={3} placeholder="Explain what the user needs to do…"
              style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:13, fontFamily:T.font, resize:'vertical', outline:'none', boxSizing:'border-box' }}
            />
          </div>
          <button onClick={()=>act(()=>kycAPI.reject(selected.application_id,rData).then(()=>setRM(false)),'KYC Rejected')}
            disabled={acting||!rData.rejection_reason}
            style={{ width:'100%', padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, background:T.danger, color:'#fff', border:'none', cursor:'pointer', fontFamily:T.font, opacity:!rData.rejection_reason?.5:1 }}>
            Confirm Rejection
          </button>
        </div>
      </Modal>

      {/* Request info modal */}
      <Modal open={infoModal} onClose={()=>setIM(false)} title="Request Additional Document">
        <div style={{ padding:'8px 0' }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', fontFamily:T.font, display:'block', marginBottom:6 }}>Document Needed</label>
            <select value={iData.doc_type} onChange={e=>setIData(d=>({...d,doc_type:e.target.value}))}
              style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:13, fontFamily:T.font, outline:'none' }}>
              {DOC_TYPES.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', fontFamily:T.font, display:'block', marginBottom:6 }}>Message to User</label>
            <textarea value={iData.message} onChange={e=>setIData(d=>({...d,message:e.target.value}))} rows={3} placeholder="Explain what you need and why…"
              style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-primary)', fontSize:13, fontFamily:T.font, resize:'vertical', outline:'none', boxSizing:'border-box' }}
            />
          </div>
          <button onClick={()=>act(()=>kycAPI.requestInfo(selected.application_id,iData).then(()=>setIM(false)),'Info requested')}
            disabled={acting}
            style={{ width:'100%', padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, background:T.warning, color:'#fff', border:'none', cursor:'pointer', fontFamily:T.font }}>
            Send Request
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN STATS VIEW
// ──────────────────────────────────────────────────────────────────────────────
const AdminStatsView = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setL]   = useState(true);
  const [auditL, setAL]   = useState(true);

  useEffect(()=>{
    kycAPI.stats().then(r=>setStats(r.data)).catch(e=>toast.error(e.message)).finally(()=>setL(false));
    kycAPI.auditLog({limit:20}).then(r=>setAudit(r.data.results||[])).catch(()=>{}).finally(()=>setAL(false));
  },[]);

  const EVT = { APPLICATION_CREATED:T.brand, STATUS_CHANGED:T.purple, DOCUMENT_UPLOADED:T.success, DOCUMENT_VIEWED:T.info, REVIEWER_APPROVED:T.success, REVIEWER_REJECTED:T.danger, AML_SCREENED:T.warning, EMAIL_SENT:'#64748b' };

  if(loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={28}/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <style>{GLOBAL_CSS}</style>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Applications', value:stats?.total_applications??0,       icon:FileText,     color:T.brand,   trend:'+12%' },
          { label:'Pending in Queue',   value:stats?.pending_in_queue??0,          icon:Clock,        color:T.warning, trend:null   },
          { label:'SLA Breached',       value:stats?.sla_breached_count??0,        icon:AlertTriangle,color:T.danger,  trend:null   },
          { label:'Approval Rate',      value:`${stats?.approval_rate_percent??0}%`,icon:TrendingUp,  color:T.success, trend:'+3%'  },
        ].map(({label,value,icon:Icon,color,trend})=>(
          <div key={label} className="k-card" style={{ ...card({padding:18}) }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:T.font, lineHeight:1.3 }}>{label}</span>
              <div style={{ width:32, height:32, borderRadius:9, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={15} color={color}/>
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:800, fontFamily:T.display, color:'var(--text-primary)', letterSpacing:'-.02em', marginBottom:trend?5:0 }}>{value}</div>
            {trend && <div style={{ fontSize:11, color:T.success, fontFamily:T.font, fontWeight:600 }}>↑ {trend} this month</div>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={{ ...card({padding:20}) }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Activity size={13} color={T.brand}/><h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>Today's Activity</h3>
          </div>
          {[{label:"Approved today",value:stats?.approved_today??0,color:T.success},{label:"Rejected today",value:stats?.rejected_today??0,color:T.danger},{label:"Avg review time",value:`${stats?.avg_review_hours??0}h`,color:T.brand}].map(({label,value,color})=>(
            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, color:'var(--text-secondary)', fontFamily:T.font }}>{label}</span>
              <span style={{ fontSize:18, fontWeight:800, fontFamily:T.display, color }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card({padding:20}) }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <BarChart3 size={13} color={T.brand}/><h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>By Status</h3>
          </div>
          {Object.entries(stats?.by_status||{}).map(([s,count])=>{
            const c=STATUS_CFG[s]; if(!c) return null;
            const pct=Math.round((count/(stats.total_applications||1))*100);
            return (
              <div key={s} style={{ marginBottom:9 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:T.font }}>{c.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:c.color, fontFamily:T.mono }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height:5, borderRadius:99, background:'var(--bg-muted)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:c.color, borderRadius:99, transition:'width .8s cubic-bezier(.16,1,.3,1)', opacity:.85 }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit trail */}
      <div style={{ ...card({padding:20}) }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Hash size={13} color={T.brand}/><h3 style={{ fontFamily:T.font, fontWeight:700, fontSize:13, color:'var(--text-primary)' }}>Audit Trail</h3>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 9px', borderRadius:6, background:T.successLt, border:`1px solid rgba(5,150,105,.2)` }}>
            <Lock size={9} color={T.success}/>
            <span style={{ fontSize:10, color:T.success, fontFamily:T.font, fontWeight:700 }}>Hash-chain verified</span>
          </div>
        </div>
        {auditL
          ? <div style={{ display:'flex', justifyContent:'center', padding:20 }}><Spinner size={18}/></div>
          : <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {audit.slice(0,15).map((e,i)=>(
                <div key={e.id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'var(--bg-subtle)' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background:EVT[e.event_type]||'#64748b' }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:EVT[e.event_type]||'#64748b', fontFamily:T.font, minWidth:160 }}>{e.event_type?.replace(/_/g,' ')}</span>
                  <span style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:T.font, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.application??'—'}{e.actor?` · by ${e.actor}`:''}</span>
                  <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:T.mono, flexShrink:0 }}>{fmtFull(e.timestamp)}</span>
                </div>
              ))}
              {audit.length===0 && <div style={{ fontSize:13, color:'var(--text-muted)', fontFamily:T.font, textAlign:'center', padding:20 }}>No audit entries yet.</div>}
            </div>
        }
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// Designed to live inside Dashboard sidebar as the 'kyc' tab.
// Also still exported for /kyc route fallback.
// ──────────────────────────────────────────────────────────────────────────────
export default function KYCDashboard() {
  const { user, isAdmin } = useAuthStore();
  const isSupport = user?.is_support || isAdmin;
  const [tab, setTab] = useState(isAdmin ? 'admin' : isSupport ? 'reviewer' : 'user');

  const TABS = [
    { key:'user',     label:'My KYC',       icon:Shield,       show:true       },
    { key:'reviewer', label:'Review Queue',  icon:ClipboardList,show:isSupport  },
    { key:'admin',    label:'KYC Analytics', icon:BarChart3,    show:isAdmin    },
  ].filter(t=>t.show);

  return (
    <div>
      <style>{GLOBAL_CSS}</style>

      {/* Sub-tabs (only for support/admin) */}
      {TABS.length > 1 && (
        <div style={{ display:'flex', gap:4, marginBottom:24, padding:'4px', background:'var(--bg-subtle)', borderRadius:12, width:'fit-content' }}>
          {TABS.map(t=>{
            const Icon=t.icon; const active=tab===t.key;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', fontFamily:T.font, background:active?'var(--bg-card)':'transparent', color:active?'var(--text-primary)':'var(--text-muted)', boxShadow:active?'0 1px 6px rgba(0,0,0,.08)':'none', transition:'all .2s' }}>
                <Icon size={13} color={active?T.brand:'var(--text-muted)'}/> {t.label}
              </button>
            );
          })}
        </div>
      )}

      {tab==='user'     && <UserKYCView/>}
      {tab==='reviewer' && <ReviewerView/>}
      {tab==='admin'    && <AdminStatsView/>}
    </div>
  );
}