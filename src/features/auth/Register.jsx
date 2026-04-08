// src/features/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, Mail, Lock, Phone, AlertCircle, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Spinner, toast } from '../../components/ui';

const FIELDS = [
  { name:'username',     type:'text',     label:'Username',    placeholder:'your_username',   icon:User  },
  { name:'email',        type:'email',    label:'Email',       placeholder:'you@example.com', icon:Mail  },
  { name:'password',     type:'password', label:'Password',    placeholder:'Min. 8 chars',    icon:Lock  },
  { name:'phone_number', type:'tel',      label:'Phone',       placeholder:'+91 98765 43210', icon:Phone },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'',email:'',password:'',phone_number:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex" style={{ paddingTop:64 }}>
      <div className="hidden lg:flex flex-col justify-between p-12 flex-1"
        style={{ background:'linear-gradient(160deg,rgba(59,97,245,0.12) 0%,rgba(8,12,20,0) 60%)',borderRight:'1px solid var(--border)',maxWidth:460 }}>
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3b61f5,#1d37cc)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <CreditCard size={18} color="#fff" />
            </div>
            <span style={{ fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:20,letterSpacing:'-0.03em' }}>Credify</span>
          </div>
          <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.25rem)',marginBottom:14 }}>Start managing virtual cards today</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:14,lineHeight:1.7,marginBottom:28 }}>
            Get instant access to powerful card management, real-time insights, and bank-grade security.
          </p>
          {['Issue unlimited virtual cards','Real-time transaction tracking','Bank-grade encryption','Instant freeze & unfreeze'].map((p,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
              <CheckCircle2 size={15} color="#10b981" style={{ flexShrink:0 }} />
              <span style={{ fontSize:13,color:'var(--text-secondary)' }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:6,color:'var(--text-muted)',fontSize:12 }}>
          <Shield size={13}/><span>256-bit SSL · SOC 2 · Free forever plan</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div style={{ width:'100%',maxWidth:400 }}>
          <div className="animate-fade-up">
            <h1 style={{ fontSize:26,marginBottom:6 }}>Create account</h1>
            <p style={{ color:'var(--text-secondary)',fontSize:13,marginBottom:28 }}>
              Already have one?{' '}
              <button onClick={() => navigate('/login')} style={{ color:'var(--brand-400)',fontWeight:600,background:'none',border:'none',cursor:'pointer',padding:0 }}>Sign in</button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="animate-fade-up delay-100">
            {error && (
              <div className="animate-fade-in flex items-center gap-2 mb-4 p-3 rounded-xl"
                style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:13 }}>
                <AlertCircle size={14} style={{ flexShrink:0 }}/>{error}
              </div>
            )}
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {FIELDS.map(({ name,type,label,placeholder,icon:Icon }) => (
                <div key={name}>
                  <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>{label}</label>
                  <div className="input-wrapper">
                    <Icon size={14} className="input-icon" />
                    <input type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} required className="input-field" />
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-5" style={{ fontSize:14,padding:'13px',opacity:loading?0.75:1 }}>
              {loading ? <><Spinner size={15} color="#fff" /> Creating account…</> : <>Create Account <ArrowRight size={15}/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
