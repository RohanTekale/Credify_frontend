// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Field, Button, useToast } from '../../components/ui';

const rules = {
  username: v => !v.trim() ? 'Username is required' : v.length < 3 ? 'Min 3 characters' : '',
  email:    v => !v.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email' : '',
  password: v => !v ? 'Password is required' : v.length < 8 ? 'Min 8 characters' : '',
  phone_number: v => v && !/^\d{10}$/.test(v) ? '10-digit number required' : '',
};

export default function Register() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [form, setForm]       = useState({ username:'', email:'', password:'', phone_number:'', address:'' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep]       = useState(1);  // 2-step form
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validateStep1 = () => {
    const e = {};
    ['username','email','password'].forEach(k => { const msg = rules[k]?.(form[k]); if (msg) e[k] = msg; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.glow} />

      <div style={{ ...S.card, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:'all 500ms cubic-bezier(0.16,1,0.3,1)' }}>

        <div style={S.logoRow}>
          <div style={S.logoIcon}><CreditCard size={16} color="#fff"/></div>
          <span style={S.logoText}>Credify</span>
        </div>

        {/* Step indicator */}
        <div style={S.stepRow}>
          {[1,2].map(n => (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ ...S.stepDot, background: step>=n ? '#3b61f5' : 'rgba(255,255,255,0.1)', boxShadow: step>=n ? '0 0 10px rgba(59,97,245,0.5)' : 'none' }}>
                {step > n ? '✓' : n}
              </div>
              <span style={{ fontSize:11, color: step>=n ? '#8ba7ff' : '#4b5675', fontWeight:600 }}>
                {n===1 ? 'Account' : 'Details'}
              </span>
              {n < 2 && <div style={{ width:40, height:1, background: step>n ? '#3b61f5' : 'rgba(255,255,255,0.1)', marginLeft:4 }}/>}
            </div>
          ))}
        </div>

        <h1 style={S.heading}>{step===1 ? 'Create account' : 'Almost there!'}</h1>
        <p style={S.sub}>{step===1 ? 'Start your fintech journey with Credify' : 'Optional — you can fill these later'}</p>

        <form onSubmit={step===1 ? (e)=>{e.preventDefault();handleNext();} : handleSubmit} style={S.form} noValidate>
          {step === 1 ? (
            <>
              <Field label="Username" placeholder="anjali123" value={form.username} onChange={set('username')} error={errors.username} icon={<User size={13}/>} autoComplete="username" />
              <Field label="Email" type="email" placeholder="anjali@example.com" value={form.email} onChange={set('email')} error={errors.email} icon={<Mail size={13}/>} autoComplete="email" />
              <div style={{ position:'relative' }}>
                <Field label="Password" type={showPwd?'text':'password'} placeholder="Min 8 characters" value={form.password} onChange={set('password')} error={errors.password} icon={<Lock size={13}/>} autoComplete="new-password"/>
                <button type="button" onClick={()=>setShowPwd(s=>!s)} style={{ position:'absolute', right:12, top:32, background:'none', border:'none', cursor:'pointer', color:'#8b96b0', display:'flex' }}>
                  {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              <Button type="submit" fullWidth size="lg" style={{ marginTop:4 }}>Continue →</Button>
            </>
          ) : (
            <>
              <Field label="Phone Number (optional)" type="tel" placeholder="9876543210" value={form.phone_number} onChange={set('phone_number')} error={errors.phone_number} icon={<Phone size={13}/>} />
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <label style={{ fontSize:11, fontWeight:700, color:'#4b5675', letterSpacing:'0.07em', textTransform:'uppercase' }}>Address (optional)</label>
                <textarea
                  placeholder="Mumbai, India"
                  value={form.address}
                  onChange={set('address')}
                  rows={2}
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'10px 12px', color:'#f0f4ff', fontSize:13, resize:'vertical', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
                />
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <Button variant="ghost" onClick={()=>setStep(1)} style={{ flex:1 }} type="button">← Back</Button>
                <Button type="submit" loading={loading} style={{ flex:2 }}>{loading ? 'Creating…' : 'Create Account'}</Button>
              </div>
            </>
          )}
        </form>

        <p style={S.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#6089ff', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c14', padding:20, position:'relative', overflow:'hidden' },
  glow: { position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,97,245,0.1) 0%, transparent 60%)', pointerEvents:'none' },
  card: { width:'100%', maxWidth:420, background:'rgba(255,255,255,0.038)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'36px 36px 28px', backdropFilter:'blur(20px)', boxShadow:'0 32px 80px rgba(0,0,0,0.5)', position:'relative', zIndex:1 },
  logoRow: { display:'flex', alignItems:'center', gap:10, marginBottom:24 },
  logoIcon: { width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#3b61f5,#1d37cc)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoText: { fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, color:'#f0f4ff' },
  stepRow: { display:'flex', alignItems:'center', gap:4, marginBottom:22 },
  stepDot: { width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0, transition:'all 300ms' },
  heading: { margin:'0 0 5px', fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.02em' },
  sub: { margin:'0 0 24px', fontSize:13, color:'#8b96b0' },
  form: { display:'flex', flexDirection:'column', gap:14 },
  footer: { margin:'18px 0 0', textAlign:'center', fontSize:13, color:'#8b96b0' },
};