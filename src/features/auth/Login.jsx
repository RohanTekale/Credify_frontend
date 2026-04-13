// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useToast, Field, Button, Spinner } from '../../components/ui';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const { setAuth } = useAuthStore();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [mounted, setMounted] = React.useState(false);

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
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Background glow */}
      <div style={S.glow1} />
      <div style={S.glow2} />

      {/* Card */}
      <div style={{ ...S.card, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)' }}>

        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoIcon}><CreditCard size={18} color="#fff" /></div>
          <span style={S.logoText}>Credify</span>
        </div>

        <h1 style={S.heading}>Welcome back</h1>
        <p style={S.subheading}>Sign in to your account to continue</p>

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
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

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
  logoRow: { display:'flex', alignItems:'center', gap:10, marginBottom:28 },
  logoIcon: { width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3b61f5,#1d37cc)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(59,97,245,0.4)' },
  logoText: { fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:'#f0f4ff', letterSpacing:'-0.03em' },
  heading:  { margin:'0 0 6px', fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.03em' },
  subheading: { margin:'0 0 28px', fontSize:13, color:'#8b96b0' },
  form:   { display:'flex', flexDirection:'column', gap:16 },
  footer: { margin:'20px 0 0', textAlign:'center', fontSize:13, color:'#8b96b0' },
  demoHint: { marginTop:16, textAlign:'center', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:7, border:'1px dashed rgba(255,255,255,0.07)' },
};