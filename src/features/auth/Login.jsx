// src/features/auth/Login.jsx — Cinematic redesign
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, RefreshCw, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useToast, Field, Button, Spinner } from '../../components/ui';
import useAuthStore from '../../store/authStore';

/* ── Cinematic 3D Logo (canvas) ─────────────────────────────────────────── */
const CredifyLogo3D = ({ size = 44 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const draw = () => {
      t.current += 0.02; ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2, rx = size * 0.42;
      const pulse = 0.97 + Math.sin(t.current * 2.6) * 0.03;
      // Orbit dots
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t.current * 0.8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const alpha = 0.12 + 0.18 * ((Math.sin(t.current * 2 + i) + 1) / 2);
        ctx.beginPath(); ctx.arc(Math.cos(a) * rx * 1.12, Math.sin(a) * rx * 1.12, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,137,255,${alpha})`; ctx.fill();
      }
      ctx.restore();
      // Body
      ctx.save(); ctx.translate(cx, cy); ctx.scale(pulse, pulse);
      const bg = ctx.createLinearGradient(-rx, -rx, rx, rx);
      bg.addColorStop(0, '#1428a0'); bg.addColorStop(0.5, '#1232d4'); bg.addColorStop(1, '#0c1a8c');
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25); ctx.fillStyle = bg; ctx.fill();
      const ig = ctx.createRadialGradient(-rx * 0.2, -rx * 0.3, 0, 0, 0, rx * 1.2);
      ig.addColorStop(0, 'rgba(120,160,255,0.2)'); ig.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25); ctx.fillStyle = ig; ctx.fill();
      const sw = Math.sin(t.current * 1.3) * rx;
      const sg = ctx.createLinearGradient(sw - rx * 0.5, -rx, sw + rx * 0.5, rx);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25); ctx.fillStyle = sg; ctx.fill();
      const s = size / 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.roundRect(-8 * s, -5 * s, 16 * s, 11 * s, 2 * s); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-8 * s, -2 * s, 16 * s, 2.2 * s);
      ctx.fillStyle = 'rgba(245,158,11,0.9)'; ctx.beginPath(); ctx.roundRect(-7 * s, 1.8 * s, 3.5 * s, 2.5 * s, 0.5 * s); ctx.fill();
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.7 * s;
      ctx.beginPath(); ctx.moveTo(5 * s, -8 * s); ctx.lineTo(7 * s, -5.5 * s); ctx.lineTo(10 * s, -9.5 * s); ctx.stroke();
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);
  return <canvas ref={canvasRef} style={{ width: size, height: size, display: 'block' }} />;
};

/* ── Reactivation Modal ─────────────────────────────────────────────────── */
function ReactivationModal({ onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ identifier: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocused] = useState(null);
  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = 'Username or email is required';
    if (!form.reason.trim()) e.reason = 'Please provide a reason';
    if (form.reason.trim().length < 10) e.reason = 'Reason must be at least 10 characters';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const handleSubmit = async (ev) => {
    ev.preventDefault(); if (!validate()) return; setLoading(true);
    try { await authAPI.requestReactivation({ identifier: form.identifier.trim(), reason: form.reason.trim() }); setSuccess(true); }
    catch (err) { toast.error(err.message || 'Failed to submit request.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal" style={{ maxWidth: 460, borderRadius: 24 }}>
        <div className="auth-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="auth-modal-header-icon"><RefreshCw size={16} color="#6089ff" /></div>
            <div><div className="auth-modal-title">Account Reactivation</div><div className="auth-modal-subtitle">Submit a request to restore your account</div></div>
          </div>
          <button onClick={onClose} className="auth-modal-close-btn" title="Close"><X size={15} /></button>
        </div>
        <div className="auth-modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="auth-success-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
              <div className="auth-success-title">Request Submitted!</div>
              <div className="auth-success-desc">Your reactivation request has been sent. Our team will review it within 1–2 business days.</div>
              <button onClick={onClose} className="auth-modal-submit-btn" style={{ marginTop: 24 }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
              <div>
                <label className="auth-label">Username or Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'identifier' ? 'var(--brand-400)' : 'var(--auth-input-icon)', transition: 'color 200ms', pointerEvents: 'none' }} />
                  <input type="text" placeholder="Enter your username or email" value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))} onFocus={() => setFocused('identifier')} onBlur={() => setFocused(null)} autoComplete="username" className="auth-input" style={{ paddingLeft: 38, borderColor: errors.identifier ? 'rgba(239,68,68,0.5)' : undefined }} />
                </div>
                {errors.identifier && <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}><AlertTriangle size={11} /> {errors.identifier}</span>}
              </div>
              <div>
                <label className="auth-label">Reason for Reactivation</label>
                <textarea rows={4} placeholder="Explain why you need your account reactivated…" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} onFocus={() => setFocused('reason')} onBlur={() => setFocused(null)} className="auth-input" style={{ resize: 'vertical', lineHeight: 1.6, minHeight: 100, paddingTop: 11, borderColor: errors.reason ? 'rgba(239,68,68,0.5)' : undefined }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  {errors.reason ? <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={11} /> {errors.reason}</span> : <span />}
                  <span style={{ fontSize: 11, color: form.reason.length >= 10 ? '#34d399' : 'var(--auth-text-muted)' }}>{form.reason.length} / 10+ chars</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <button type="button" onClick={onClose} className="auth-modal-cancel-btn">Cancel</button>
                <button type="submit" disabled={loading} className="auth-modal-submit-btn" style={{ flex: 1 }}>
                  {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Submitting…</span> : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Login Page ─────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deactivated, setDeact] = useState(false);
  const [showReact, setShowReact] = useState(false);
  const [focusedField, setFocused] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username or email is required';
    if (!form.password) e.password = 'Password is required';
    if (form.password && form.password.length < 6) e.password = 'Password is too short';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true); setDeact(false);
    try {
      const res = await authAPI.login(form);
      const data = res.data?.data ?? res.data;
      const access = data?.access || data?.data?.access;
      const refresh = data?.refresh || data?.data?.refresh;
      const user = data?.user || data?.data?.user || {};
      setAuth(access, refresh, user);
      toast.success('Welcome back!');
      navigate(user.is_staff || user.is_superuser ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      const msg = err.message || '';
      const isDeact = msg.toLowerCase().includes('deactivated') || msg.toLowerCase().includes('inactive') || msg.toLowerCase().includes('disabled') || msg.toLowerCase().includes('reactivat');
      if (isDeact) setDeact(true); else toast.error(msg || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <>
      {showReact && <ReactivationModal onClose={() => setShowReact(false)} />}
      <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Cinematic background orbs */}
        <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,97,245,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'floatAlt 10s ease-in-out infinite' }} />
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />

        <div className="auth-card" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
          transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
          borderRadius: 28,
          position: 'relative', zIndex: 1,
          backdropFilter: 'blur(40px)',
          boxShadow: '0 32px 100px rgba(59,97,245,0.14), 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 2, background: 'linear-gradient(90deg,transparent,rgba(96,137,255,0.6),rgba(167,139,250,0.5),transparent)', borderRadius: '0 0 2px 2px', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <CredifyLogo3D size={44} />
            <span className="auth-logo-text" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>Credify</span>
          </div>

          <h1 className="auth-heading" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>Welcome back</h1>
          <p className="auth-subheading" style={{ marginBottom: 28 }}>Sign in to your account to continue</p>

          {deactivated && (
            <div className="auth-deact-box">
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color="var(--auth-deact-title)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div className="auth-deact-title">Account Deactivated</div>
                  <div className="auth-deact-text">Your account has been deactivated. You can submit a reactivation request and our team will review it.</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowReact(true)} className="auth-deact-btn"><RefreshCw size={12} /> Request Reactivation</button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            {/* Username field */}
            <div>
              <label className="auth-label">USERNAME OR EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'username' ? '#6089ff' : 'var(--auth-input-icon)', transition: 'color 200ms', pointerEvents: 'none' }} />
                <input
                  type="text" placeholder="admin@credify" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  onFocus={() => setFocused('username')} onBlur={() => setFocused(null)}
                  autoComplete="username" className="auth-input"
                  style={{ paddingLeft: 42, borderRadius: 14, borderColor: errors.username ? 'rgba(239,68,68,0.5)' : focusedField === 'username' ? 'rgba(96,137,255,0.55)' : undefined }}
                />
              </div>
              {errors.username && <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}><AlertTriangle size={11} /> {errors.username}</span>}
            </div>

            {/* Password field */}
            <div>
              <label className="auth-label">PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#6089ff' : 'var(--auth-input-icon)', transition: 'color 200ms', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  autoComplete="current-password" className="auth-input"
                  style={{ paddingLeft: 42, paddingRight: 44, borderRadius: 14, borderColor: errors.password ? 'rgba(239,68,68,0.5)' : focusedField === 'password' ? 'rgba(96,137,255,0.55)' : undefined }}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--auth-text-muted)', padding: 4, display: 'flex' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}><AlertTriangle size={11} /> {errors.password}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12 }}>Forgot password?</Link>
            </div>

            {/* Submit button */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg,#3b61f5,#2545e8)', color: '#fff',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 700, fontFamily: 'Sora,sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.25s ease',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(59,97,245,0.36)',
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,97,245,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,97,245,0.36)'; }}
            >
              {loading ? <><Spinner size={15} color="#fff" /> Signing in…</> : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: 22 }}>
            Don't have an account?{' '}<Link to="/register" className="auth-link">Create one</Link>
          </p>

          <div className="auth-react-row">
            <button type="button" onClick={() => setShowReact(true)} className="auth-react-btn" style={{ borderRadius: 12 }}>
              <RefreshCw size={13} /> Account deactivated? Request Reactivation
            </button>
          </div>

          <div className="auth-demo-hint" style={{ borderRadius: 12, fontSize: 11 }}>
            Admin demo: admin@credify / Credifyadmin@00715
          </div>
        </div>
      </div>
    </>
  );
}
