// src/features/auth/Register.jsx — Cinematic redesign
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, AlertTriangle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Button, useToast, Spinner } from '../../components/ui';

const rules = {
  username: v => !v.trim() ? 'Username is required' : v.length < 3 ? 'Min 3 characters' : '',
  email: v => !v.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email' : '',
  password: v => !v ? 'Password is required' : v.length < 8 ? 'Min 8 characters' : '',
  phone_number: v => v && !/^\d{10}$/.test(v) ? '10-digit number required' : '',
};

/* ── 3D Logo ─────────────────────────────────────────────────────────── */
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
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t.current * 0.8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const alpha = 0.12 + 0.18 * ((Math.sin(t.current * 2 + i) + 1) / 2);
        ctx.beginPath(); ctx.arc(Math.cos(a) * rx * 1.12, Math.sin(a) * rx * 1.12, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,137,255,${alpha})`; ctx.fill();
      }
      ctx.restore();
      ctx.save(); ctx.translate(cx, cy); ctx.scale(pulse, pulse);
      const bg = ctx.createLinearGradient(-rx, -rx, rx, rx);
      bg.addColorStop(0, '#1428a0'); bg.addColorStop(0.5, '#1232d4'); bg.addColorStop(1, '#0c1a8c');
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25); ctx.fillStyle = bg; ctx.fill();
      const ig = ctx.createRadialGradient(-rx * 0.2, -rx * 0.3, 0, 0, 0, rx * 1.2);
      ig.addColorStop(0, 'rgba(120,160,255,0.2)'); ig.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25); ctx.fillStyle = ig; ctx.fill();
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

/* ── Cinematic Input ─────────────────────────────────────────────────── */
const CinemaInput = ({ label, type = 'text', placeholder, value, onChange, error, icon, autoComplete, extra }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--auth-label-color)', marginBottom: 7, textTransform: 'uppercase', fontFamily: 'Sora,sans-serif' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && React.cloneElement(icon, { style: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#6089ff' : 'var(--auth-input-icon)', transition: 'color 200ms', pointerEvents: 'none' }, size: 15 })}
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            paddingRight: extra ? 44 : 14,
            background: 'var(--auth-input-bg)', color: 'var(--auth-input-color)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? 'rgba(96,137,255,0.55)' : 'var(--auth-input-border)'}`,
            borderRadius: 14, fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif",
            boxShadow: focused ? '0 0 0 3px rgba(96,137,255,0.1)' : 'none',
            transition: 'all 200ms ease',
          }}
        />
        {extra}
      </div>
      {error && <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}><AlertTriangle size={11} /> {error}</span>}
    </div>
  );
};

/* ── Register Page ──────────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validateStep1 = () => {
    const e = {};
    ['username', 'email', 'password'].forEach(k => { const msg = rules[k]?.(form[k]); if (msg) e[k] = msg; });
    setErrors(e); return Object.keys(e).length === 0;
  };
  const handleNext = () => { if (validateStep1()) setStep(2); };
  const handleSubmit = async (ev) => {
    ev.preventDefault(); setLoading(true);
    try { await authAPI.register(form); toast.success('Account created! Please sign in.'); navigate('/login'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-25%', right: '-20%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'float 9s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-15%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'floatAlt 11s ease-in-out infinite' }} />
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div className="auth-card" style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
        borderRadius: 28, position: 'relative', zIndex: 1,
        backdropFilter: 'blur(40px)',
        boxShadow: '0 32px 100px rgba(59,97,245,0.14),0 8px 32px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.6)',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 2, background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.6),rgba(56,189,248,0.5),transparent)', borderRadius: '0 0 2px 2px', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <CredifyLogo3D size={44} />
          <span className="auth-logo-text" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>Credify</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 26 }}>
          {[1, 2].map(n => (
            <React.Fragment key={n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Sora,sans-serif', fontSize: 12, fontWeight: 700,
                  background: step >= n ? 'linear-gradient(135deg,#3b61f5,#1d37cc)' : 'var(--border)',
                  color: step >= n ? '#fff' : 'var(--text-muted)',
                  boxShadow: step >= n ? '0 4px 14px rgba(59,97,245,0.4)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {step > n ? '✓' : n}
                </div>
                <span style={{ fontSize: 12, color: step >= n ? '#6089ff' : 'var(--auth-text-muted)', fontWeight: 600, fontFamily: 'Sora,sans-serif' }}>
                  {n === 1 ? 'Account' : 'Details'}
                </span>
              </div>
              {n < 2 && <div style={{ flex: 1, height: 1.5, background: step > n ? 'linear-gradient(90deg,#3b61f5,#a78bfa)' : 'var(--border)', borderRadius: 2, transition: 'background 0.4s ease', maxWidth: 50 }} />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="auth-heading" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
          {step === 1 ? 'Create account' : 'Almost there!'}
        </h1>
        <p className="auth-subheading" style={{ marginBottom: 26 }}>
          {step === 1 ? 'Start your fintech journey with Credify' : 'Optional — you can fill these later'}
        </p>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          {step === 1 ? (
            <>
              <CinemaInput label="Username" placeholder="anjali123" value={form.username} onChange={set('username')} error={errors.username} icon={<User />} autoComplete="username" />
              <CinemaInput label="Email" type="email" placeholder="anjali@example.com" value={form.email} onChange={set('email')} error={errors.email} icon={<Mail />} autoComplete="email" />
              <CinemaInput
                label="Password" type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters"
                value={form.password} onChange={set('password')} error={errors.password}
                icon={<Lock />} autoComplete="new-password"
                extra={<button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--auth-text-muted)', display: 'flex', padding: 4 }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
              />
              <button
                type="submit"
                style={{ width: '100%', padding: '14px 24px', borderRadius: 14, background: 'linear-gradient(135deg,#3b61f5,#2545e8)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, boxShadow: '0 8px 28px rgba(59,97,245,0.36)', transition: 'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,97,245,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,97,245,0.36)'; }}
              >
                Continue <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <CinemaInput label="Phone Number (optional)" type="tel" placeholder="9876543210" value={form.phone_number} onChange={set('phone_number')} error={errors.phone_number} icon={<Phone />} />
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--auth-label-color)', marginBottom: 7, textTransform: 'uppercase', fontFamily: 'Sora,sans-serif' }}>Address (optional)</label>
                <textarea
                  placeholder="Mumbai, India" value={form.address} onChange={set('address')} rows={2}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--auth-input-bg)', border: '1px solid var(--auth-input-border)', borderRadius: 14, padding: '11px 14px', color: 'var(--auth-input-color)', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: "'DM Sans',sans-serif", transition: 'all 200ms ease' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(96,137,255,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(96,137,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--auth-input-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px 18px', borderRadius: 14, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora,sans-serif', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: '13px 20px', borderRadius: 14, background: 'linear-gradient(135deg,#3b61f5,#2545e8)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'Sora,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 8px 28px rgba(59,97,245,0.36)', opacity: loading ? 0.75 : 1, transition: 'all 0.25s ease' }}>
                  {loading ? <><Spinner size={14} color="#fff" /> Creating…</> : <>Create Account <ArrowRight size={15} /></>}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-footer-text" style={{ marginTop: 22 }}>
          Already have an account?{' '}<Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
