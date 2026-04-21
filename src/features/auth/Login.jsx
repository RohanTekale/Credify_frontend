// src/features/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Lock, Mail, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useToast, Field, Button, Spinner } from '../../components/ui';
import useAuthStore from '../../store/authStore';

// ── Credify Logo SVG ──────────────────────────────────────────────────────────
const CredifyLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#credify-grad)"/>
    <path d="M20 7 L30 11 L30 21 Q30 29 20 33 Q10 29 10 21 L10 11 Z"
      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="13" y="16" width="11" height="8" rx="1.5"
      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3"/>
    <line x1="13" y1="19.5" x2="24" y2="19.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1"/>
    <path d="M17.5 16 L17.5 14.5 Q17.5 13 19 13 Q20.5 13 20.5 14.5 L20.5 16"
      stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M26 15 L28 17.5 L32 13" stroke="#4ade80" strokeWidth="1.8"
      fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="credify-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b61f5"/>
        <stop offset="100%" stopColor="#1d37cc"/>
      </linearGradient>
    </defs>
  </svg>
);

// ── Reactivation Modal ────────────────────────────────────────────────────────
function ReactivationModal({ onClose }) {
  const toast = useToast();
  const [form, setForm]           = useState({ identifier: '', reason: '' });
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [focusedField, setFocused] = useState(null);

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

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="auth-modal-header-icon">
              <RefreshCw size={16} color="#6089ff" />
            </div>
            <div>
              <div className="auth-modal-title">Account Reactivation</div>
              <div className="auth-modal-subtitle">Submit a request to restore your account</div>
            </div>
          </div>
          <button onClick={onClose} className="auth-modal-close-btn" title="Close">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="auth-modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="auth-success-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="auth-success-title">Request Submitted!</div>
              <div className="auth-success-desc">
                Your reactivation request has been sent. Our team will review it and contact you via email within 1–2 business days.
              </div>
              <button onClick={onClose} className="auth-modal-submit-btn" style={{ marginTop: 24 }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>

              {/* Username / Email field */}
              <div>
                <label className="auth-label">Username or Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: focusedField === 'identifier' ? 'var(--brand-400)' : 'var(--auth-input-icon)',
                    transition: 'color 200ms', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    value={form.identifier}
                    onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                    onFocus={() => setFocused('identifier')}
                    onBlur={() => setFocused(null)}
                    autoComplete="username"
                    className="auth-input"
                    style={{
                      paddingLeft: 38,
                      borderColor: errors.identifier ? 'rgba(239,68,68,0.5)' : undefined,
                    }}
                  />
                </div>
                {errors.identifier && (
                  <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                    <AlertTriangle size={11} /> {errors.identifier}
                  </span>
                )}
              </div>

              {/* Reason textarea */}
              <div>
                <label className="auth-label">Reason for Reactivation</label>
                <textarea
                  rows={4}
                  placeholder="Explain why you need your account reactivated…"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  onFocus={() => setFocused('reason')}
                  onBlur={() => setFocused(null)}
                  className="auth-input"
                  style={{
                    resize: 'vertical', lineHeight: 1.6, minHeight: 100, paddingTop: 11,
                    borderColor: errors.reason ? 'rgba(239,68,68,0.5)' : undefined,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  {errors.reason ? (
                    <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertTriangle size={11} /> {errors.reason}
                    </span>
                  ) : <span />}
                  <span style={{ fontSize: 11, color: form.reason.length >= 10 ? '#10b981' : 'var(--auth-text-muted)' }}>
                    {form.reason.length} / 10+ chars
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <button type="button" onClick={onClose} className="auth-modal-cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="auth-modal-submit-btn" style={{ flex: 1 }}>
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
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate    = useNavigate();
  const toast       = useToast();
  const { setAuth } = useAuthStore();

  const [form, setForm]           = useState({ username: '', password: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [mounted, setMounted]     = React.useState(false);
  const [deactivated, setDeact]   = useState(false);
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

      <div className="auth-page">
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />

        <div
          className="auth-card"
          style={{
            opacity:   mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b61f5,#1d37cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,97,245,0.4)' }}>
              <CreditCard size={18} color="#fff" />
            </div>
            <span className="auth-logo-text">Credify</span>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to your account to continue</p>

          {/* Deactivated account alert */}
          {deactivated && (
            <div className="auth-deact-box">
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color="var(--auth-deact-title)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div className="auth-deact-title">Account Deactivated</div>
                  <div className="auth-deact-text">
                    Your account has been deactivated. You can submit a reactivation request and our team will review it.
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowReact(true)} className="auth-deact-btn">
                <RefreshCw size={12} /> Request Reactivation
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
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
                style={{ position: 'absolute', right: 12, top: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--auth-text-muted)', padding: 4, display: 'flex' }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" style={{ marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>

          {/* Always-visible reactivation button */}
          <div className="auth-react-row">
            <button type="button" onClick={() => setShowReact(true)} className="auth-react-btn">
              <RefreshCw size={13} />
              Account deactivated? Request Reactivation
            </button>
          </div>

          {/* Demo creds hint */}
          <div className="auth-demo-hint">
            Admin demo: admin@credify / Credifyadmin@00715
          </div>
        </div>
      </div>
    </>
  );
}