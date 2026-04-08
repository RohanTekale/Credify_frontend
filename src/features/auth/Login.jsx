// src/features/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { authAPI, userAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { Spinner } from '../../components/ui';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await authAPI.login(form);

    const token = data.access || data.token;

    // ✅ STEP 1: SAVE TOKEN FIRST
    localStorage.setItem("access_token", token);

    // ✅ STEP 2: Now API calls will work
    let userData = data.user || {};

    try {
      const profileRes = await userAPI.getProfile();
      userData = { ...userData, ...profileRes.data };
    } catch (err) {
      console.warn("Profile fetch failed, using basic data");
    }

    // ✅ STEP 3: SET AUTH STORE
    setAuth(token, userData);

    // ✅ STEP 4: REDIRECT
    if (userData?.is_staff || userData?.is_superuser) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }

  } catch (err) {
    setError(err.message || 'Invalid credentials');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-[calc(100vh-64px)] flex" style={{ paddingTop: 64 }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 flex-1"
        style={{ background: 'linear-gradient(160deg,rgba(59,97,245,0.12) 0%,rgba(8,12,20,0) 60%)', borderRight: '1px solid var(--border)', maxWidth: 460 }}>
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3b61f5,#1d37cc)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(59,97,245,0.4)' }}>
              <CreditCard size={18} color="#fff" />
            </div>
            <span style={{ fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:20,letterSpacing:'-0.03em' }}>Credify</span>
          </div>
          <h2 style={{ fontSize:'clamp(1.75rem,3vw,2.4rem)', marginBottom:14 }}>Welcome back to your financial hub</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7 }}>
            Log in to manage your virtual cards, track transactions, and stay in complete control of your finances.
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:12 }}>
          <Shield size={13} /><span>256-bit SSL encryption · SOC 2 compliant</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width:'100%', maxWidth:400 }}>
          <div className="animate-fade-up">
            <h1 style={{ fontSize:26,marginBottom:6 }}>Sign in</h1>
            <p style={{ color:'var(--text-secondary)',fontSize:13,marginBottom:28 }}>
              No account?{' '}
              <button onClick={() => navigate('/register')} style={{ color:'var(--brand-400)',fontWeight:600,background:'none',border:'none',cursor:'pointer',padding:0 }}>Create one free</button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="animate-fade-up delay-100" style={{ display:'flex',flexDirection:'column',gap:0 }}>
            {error && (
              <div className="animate-fade-in flex items-center gap-2 mb-5 p-3 rounded-xl"
                style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:13 }}>
                <AlertCircle size={14} style={{ flexShrink:0 }} />{error}
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>Username</label>
              <div className="input-wrapper">
                <User size={14} className="input-icon" />
                <input name="username" type="text" placeholder="your_username" value={form.username} onChange={handleChange} required className="input-field" />
              </div>
            </div>
            <div style={{ marginBottom:6 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                <label style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>Password</label>
                <button type="button" onClick={() => navigate('/forgot-password')} style={{ fontSize:11,color:'var(--brand-400)',background:'none',border:'none',cursor:'pointer',padding:0,fontWeight:600 }}>Forgot?</button>
              </div>
              <div className="input-wrapper">
                <Lock size={14} className="input-icon" />
                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-5" style={{ fontSize:14,padding:'13px',opacity:loading?0.75:1 }}>
              {loading ? <><Spinner size={15} color="#fff" /> Signing in…</> : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="animate-fade-up delay-200 text-center mt-6" style={{ fontSize:11,color:'var(--text-muted)' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
