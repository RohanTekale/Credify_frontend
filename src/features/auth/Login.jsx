// src/features/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Lock, Mail, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useToast, Field, Button, Spinner } from '../../components/ui';
import useAuthStore from '../../store/authStore';

// ── Reactivation Modal ────────────────────────────────────────────────────────
function ReactivationModal({ onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ identifier: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = 'Username or email is required';
    if (!form.reason.trim())     e.reason     = 'Please provide a reason';
    if (form.reason.trim().length < 10) e.reason = 'Reason must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.requestReactivation({ identifier: form.identifier.trim(), reason: form.reason.trim() });
      setSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fully self-contained dark styles — no CSS variable dependency
  const inputStyle = (field) => ({
    width: '100%', padding: '11px 14px',
    background: focusedField === field ? 'rgba(59,97,245,0.06)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${errors[field] ? 'rgba(239,68,68,0.5)' : focusedField === field ? 'rgba(59,97,245,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10, color: '#f0f4ff', fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", outline: 'none',
    boxSizing: 'border-box', transition: 'all 200ms',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(59,97,245,0.12)' : 'none',
  });

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: '#8b96b0',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7,
  };

  return (
    <div style={M.overlay}>
      <div style={M.modal}>
        {/* Header */}
        <div style={M.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={M.headerIcon}>
              <RefreshCw size={16} color="#6089ff" />
            </div>
            <div>
              <div style={M.headerTitle}>Account Reactivation</div>
              <div style={M.headerSub}>Submit a request to restore your account</div>
            </div>
          </div>
          <button onClick={onClose} style={M.closeBtn}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f0f4ff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#4b5675'; }}
            title="Close">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={M.body}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={M.successIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div style={M.successTitle}>Request Submitted!</div>
              <div style={M.successDesc}>
                Your reactivation request has been sent. Our team will review it and contact you via email within 1–2 business days.
              </div>
              <button onClick={onClose} style={{ ...M.submitBtn, marginTop: 24 }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>

              {/* Username / Email field */}
              <div>
                <label style={labelStyle}>Username or Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'identifier' ? '#6089ff' : '#4b5675', transition: 'color 200ms', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    value={form.identifier}
                    onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                    onFocus={() => setFocusedField('identifier')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="username"
                    style={{ ...inputStyle('identifier'), paddingLeft: 38 }}
                  />
                </div>
                {errors.identifier && (
                  <span style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                    <AlertTriangle size={11} /> {errors.identifier}
                  </span>
                )}
              </div>

              {/* Reason textarea */}
              <div>
                <label style={labelStyle}>Reason for Reactivation</label>
                <textarea
                  rows={4}
                  placeholder="Explain why you need your account reactivated…"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  onFocus={() => setFocusedField('reason')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle('reason'),
                    resize: 'vertical', lineHeight: 1.6,
                    minHeight: 100, paddingTop: 11,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  {errors.reason ? (
                    <span style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertTriangle size={11} /> {errors.reason}
                    </span>
                  ) : <span />}
                  <span style={{ fontSize: 11, color: form.reason.length >= 10 ? '#4ade80' : '#4b5675' }}>
                    {form.reason.length} / 10+ chars
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <button type="button" onClick={onClose} style={M.cancelBtn}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f4ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b96b0'; }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ ...M.submitBtn, flex: 1 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Spinner size={14} color="#fff" /> Submitting…
                    </span>
                  ) : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.95) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }
        .react-modal-input::placeholder { color: rgba(240,244,255,0.2) !important; }
      `}</style>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const { setAuth } = useAuthStore();

  const [form, setForm]         = useState({ username: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [mounted, setMounted]   = React.useState(false);
  const [deactivated, setDeact] = useState(false);
  const [showReact, setShowReact] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username or email is required';
    if (!form.password)        e.password = 'Password is required';
    if (form.password && form.password.length < 6) e.password = 'Password is too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setDeact(false);
    try {
      const res  = await authAPI.login(form);
      const data = res.data?.data ?? res.data;

      const access  = data?.access  || data?.data?.access;
      const refresh = data?.refresh || data?.data?.refresh;
      const user    = data?.user    || data?.data?.user || {};

      setAuth(access, refresh, user);

      toast.success('Welcome back!');
      navigate(user.is_staff || user.is_superuser ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      const msg = err.message || '';
      const isDeactivated =
        msg.toLowerCase().includes('deactivated') ||
        msg.toLowerCase().includes('inactive')    ||
        msg.toLowerCase().includes('disabled')    ||
        msg.toLowerCase().includes('reactivat');

      if (isDeactivated) {
        setDeact(true);
      } else {
        toast.error(msg || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showReact && <ReactivationModal onClose={() => setShowReact(false)} />}

      <div style={S.page}>
        {/* Background glows */}
        <div style={S.glow1} />
        <div style={S.glow2} />

        {/* Card */}
        <div style={{
          ...S.card,
          opacity:   mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* Logo */}
          <div style={S.logoRow}>
            <div style={S.logoIcon}><CreditCard size={18} color="#fff" /></div>
            <span style={S.logoText}>Credify</span>
          </div>

          <h1 style={S.heading}>Welcome back</h1>
          <p style={S.subheading}>Sign in to your account to continue</p>

          {/* Deactivated account alert */}
          {deactivated && (
            <div style={S.deactBox}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', marginBottom: 4 }}>
                    Account Deactivated
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(251,191,36,0.75)', lineHeight: 1.55 }}>
                    Your account has been deactivated. You can submit a reactivation request and our team will review it.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReact(true)}
                style={S.deactBtn}
              >
                <RefreshCw size={12} /> Request Reactivation
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form} noValidate>
            <Field
              label="Username or Email"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              error={errors.username}
              icon={<Mail size={14} />}
              autoComplete="username"
            />

            <div style={{ position: 'relative' }}>
              <Field
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password}
                icon={<Lock size={14} />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                style={{ position:'absolute', right:12, top:32, background:'none', border:'none', cursor:'pointer', color:'#8b96b0', padding:4, display:'flex' }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <Link to="/forgot-password" style={{ fontSize:12, color:'#6089ff', textDecoration:'none' }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" style={{ marginTop:4 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p style={S.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#6089ff', textDecoration:'none', fontWeight:600 }}>
              Create one
            </Link>
          </p>

          {/* Always-visible reactivation button — prominent */}
          <div style={S.reactRow}>
            <button
              type="button"
              onClick={() => setShowReact(true)}
              style={S.reactBtn}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(59,97,245,0.18)';
                e.currentTarget.style.borderColor = 'rgba(59,97,245,0.5)';
                e.currentTarget.style.color = '#93aeff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(59,97,245,0.08)';
                e.currentTarget.style.borderColor = 'rgba(59,97,245,0.28)';
                e.currentTarget.style.color = '#7090f5';
              }}
            >
              <RefreshCw size={13} />
              Account deactivated? Request Reactivation
            </button>
          </div>

          {/* Demo creds hint */}
          <div style={S.demoHint}>
            <span style={{ fontSize:10, color:'#4b5675', fontFamily:"'JetBrains Mono',monospace" }}>
              Admin demo: admin@credify / Credifyadmin@00715
            </span>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
          input::placeholder { color: rgba(240,244,255,0.25); }
          textarea::placeholder { color: rgba(240,244,255,0.25); }
          * { box-sizing: border-box; }
        `}</style>
      </div>
    </>
  );
}

// ── Login styles ──────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#080c14', padding: 20, position: 'relative', overflow: 'hidden',
  },
  glow1: { position:'absolute', top:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,97,245,0.12) 0%, transparent 60%)', pointerEvents:'none' },
  glow2: { position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)', pointerEvents:'none' },
  card: {
    width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
    background: 'rgba(255,255,255,0.038)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '36px 36px 28px', backdropFilter: 'blur(20px)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
  },
  logoRow:   { display:'flex', alignItems:'center', gap:10, marginBottom:28 },
  logoIcon:  { width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3b61f5,#1d37cc)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(59,97,245,0.4)' },
  logoText:  { fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:'#f0f4ff', letterSpacing:'-0.03em' },
  heading:   { margin:'0 0 6px', fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em' },
  subheading:{ margin:'0 0 28px', fontSize:13, color:'#8b96b0' },
  form:      { display:'flex', flexDirection:'column', gap:16 },
  footer:    { margin:'20px 0 0', textAlign:'center', fontSize:13, color:'#8b96b0' },
  demoHint:  { marginTop:16, textAlign:'center', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:7, border:'1px dashed rgba(255,255,255,0.07)' },

  // Deactivated alert box
  deactBox: {
    marginBottom: 20,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'rgba(245,158,11,0.07)',
    border: '1px solid rgba(245,158,11,0.22)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  deactBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    width: '100%', padding: '9px 14px',
    borderRadius: 9,
    background: 'rgba(245,158,11,0.15)',
    border: '1px solid rgba(245,158,11,0.3)',
    color: '#fbbf24', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    transition: 'all 0.15s ease',
    justifyContent: 'center',
  },

  // Always-visible reactivation button
  reactRow: {
    marginTop: 14, paddingTop: 14,
    borderTop: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', justifyContent: 'center',
  },
  reactBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    width: '100%', padding: '11px 16px', borderRadius: 11,
    background: 'rgba(59,97,245,0.08)',
    border: '1px solid rgba(59,97,245,0.28)',
    color: '#7090f5',
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    transition: 'all 0.18s ease',
    letterSpacing: '-0.01em',
  },
};

// ── Modal styles ──────────────────────────────────────────────────────────────
const M = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(4,7,14,0.7)', backdropFilter: 'blur(8px)',
    padding: 20,
    animation: 'overlayIn 200ms ease both',
  },
  modal: {
    width: '100%', maxWidth: 440,
    background: 'rgba(12,17,32,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,97,245,0.1)',
    overflow: 'hidden',
    animation: 'modalIn 280ms cubic-bezier(0.16,1,0.3,1) both',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  headerIcon: {
    width: 34, height: 34, borderRadius: 10,
    background: 'rgba(59,97,245,0.12)', border: '1px solid rgba(59,97,245,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerTitle: { fontSize: 15, fontWeight: 700, color: '#f0f4ff', fontFamily: "'Sora',sans-serif" },
  headerSub:   { fontSize: 11, color: '#8b96b0', marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
    cursor: 'pointer', color: '#4b5675', transition: 'all 0.15s',
    flexShrink: 0,
  },
  body: { padding: '20px 20px 22px' },

  textareaLabel: { fontSize: 11, fontWeight: 700, color: 'rgba(240,244,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase' },
  textarea: {
    width: '100%', padding: '10px 13px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#f0f4ff', fontSize: 13,
    resize: 'vertical', outline: 'none',
    fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6,
    transition: 'border-color 200ms',
    minHeight: 100,
  },

  cancelBtn: {
    flex: 1, padding: '10px 16px', borderRadius: 10,
    background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
    color: '#8b96b0', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    transition: 'all 0.15s',
  },
  submitBtn: {
    padding: '10px 20px', borderRadius: 10,
    background: 'linear-gradient(135deg,#3b61f5,#1d37cc)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    boxShadow: '0 4px 16px rgba(59,97,245,0.35)',
    transition: 'all 0.15s',
    display: 'block', width: '100%', textAlign: 'center',
  },

  successIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  successTitle: { fontSize: 16, fontWeight: 700, color: '#f0f4ff', fontFamily: "'Sora',sans-serif", marginBottom: 8 },
  successDesc:  { fontSize: 13, color: '#8b96b0', lineHeight: 1.6 },
};
