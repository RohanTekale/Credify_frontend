// src/pages/Home.jsx — Ultra-Premium Apple-Style Redesign
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, TrendingUp, Users, CreditCard,
  CheckCircle, Star, Lock, Globe, Clock, Award,
  Sparkles, BarChart3, Smartphone, RefreshCw, HeartHandshake,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

/* ── Animated Counter ─────────────────────────────────────────────────────── */
const AnimatedNumber = ({ target, suffix = '', prefix = '' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
        const duration = 1800;
        const steps = 60;
        const increment = numeric / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numeric) { setDisplay(numeric); clearInterval(timer); }
          else { setDisplay(Math.floor(current * 10) / 10); }
        }, duration / steps);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const formatted = Number.isInteger(Number(display)) ? display : display.toFixed(1);
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
};

/* ── Data ─────────────────────────────────────────────────────────────────── */
const STATS = [
  { label: 'Active Users',           value: '12K',  suffix: '+',  icon: Users,      color: '#3b61f5' },
  { label: 'Transactions Processed', value: '2.4',  suffix: 'M+', prefix: '$', icon: TrendingUp, color: '#8b5cf6' },
  { label: 'Cards Issued',           value: '38K',  suffix: '+',  icon: CreditCard, color: '#06b6d4' },
  { label: 'Uptime Guaranteed',      value: '99.9', suffix: '%',  icon: Zap,        color: '#10b981' },
];
const STEPS = [
  { step:'01', icon:Users,      color:'#3b61f5', title:'Create Your Account',   desc:'Sign up in seconds. Complete a quick KYC verification to unlock full card management capabilities.' },
  { step:'02', icon:CreditCard, color:'#8b5cf6', title:'Issue Virtual Cards',   desc:'Generate virtual credit cards instantly. Set custom limits, names, and expiry dates for each card.' },
  { step:'03', icon:Zap,        color:'#06b6d4', title:'Transact & Track',      desc:'Use your cards anywhere. Every transaction is tracked in real-time with detailed analytics.' },
  { step:'04', icon:TrendingUp, color:'#10b981', title:'Earn & Redeem Rewards', desc:'Accumulate points on every purchase. Redeem them for benefits, cashback, and exclusive perks.' },
];
const SECURITY = [
  { icon:Shield, color:'#3b61f5', title:'Bank-Grade Encryption', desc:'256-bit AES encryption for all data at rest and in transit.' },
  { icon:Lock,   color:'#8b5cf6', title:'JWT Authentication',    desc:'Stateless, secure token-based auth with refresh rotation.' },
  { icon:Globe,  color:'#06b6d4', title:'Global Compliance',      desc:'KYC-compliant identity verification built into every account.' },
  { icon:Clock,  color:'#f59e0b', title:'99.9% Uptime SLA',       desc:'High-availability infrastructure with redundant failover.' },
];
const TESTIMONIALS = [
  { name:'Sarah M.', role:'Freelance Designer', avatar:'S', color:'#ec4899', stars:5, text:'Credify changed how I manage client subscriptions. Virtual cards per project means zero budget bleed.' },
  { name:'Rohan K.',  role:'Startup Founder',    avatar:'R', color:'#3b61f5', stars:5, text:'The rewards system genuinely adds up. I redeemed for benefits worth ₹4,000 last month alone.' },
  { name:'Priya T.',  role:'Finance Manager',    avatar:'P', color:'#8b5cf6', stars:5, text:'The admin dashboard is exceptional. Real-time transaction visibility with zero complexity.' },
];
const CAPABILITIES = [
  { icon:Smartphone,     color:'#3b61f5', title:'Mobile-First Design',  desc:'Fully responsive interface optimised for desktop, tablet, and mobile — manage cards from anywhere.' },
  { icon:RefreshCw,      color:'#8b5cf6', title:'Real-Time Sync',       desc:'Transaction data and card status sync instantly across all sessions — no refresh needed.' },
  { icon:BarChart3,      color:'#06b6d4', title:'Spending Analytics',   desc:'Visual spending breakdowns by category, time period, and card — actionable insights at a glance.' },
  { icon:Award,          color:'#f59e0b', title:'Tiered Rewards',       desc:'Earn 1–3× points based on spend categories. Unlock Silver, Gold, Platinum status automatically.' },
  { icon:HeartHandshake, color:'#10b981', title:'Dedicated Support',    desc:'In-app chatbot available 24/7. Priority email support for Pro members with <2h response time.' },
  { icon:Globe,          color:'#ec4899', title:'Multi-Currency Ready', desc:'Cards work globally. Automatic FX rate display at the moment of each transaction.' },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const isLoggedIn = !!token;
  const displayName = user?.first_name || user?.username || 'there';

  // Parallax — RAF-based, smooth lerp, no jitter
  const bgRef1 = useRef(null);
  const bgRef2 = useRef(null);
  const rafId  = useRef(null);
  const mSmooth = useRef({ x: 0, y: 0 });
  const mTarget = useRef({ x: 0, y: 0 });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const onMove = (e) => {
      mTarget.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      const l = 0.055;
      mSmooth.current.x += (mTarget.current.x - mSmooth.current.x) * l;
      mSmooth.current.y += (mTarget.current.y - mSmooth.current.y) * l;
      const { x, y } = mSmooth.current;
      if (bgRef1.current) bgRef1.current.style.transform = `translate(${x * 13}px,${y * 13}px)`;
      if (bgRef2.current) bgRef2.current.style.transform = `translate(${x * -11}px,${y * -11}px)`;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId.current); };
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', paddingTop: 64 }}>

      {/* ── Premium layered background ───────────────────────────────── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'var(--hero-gradient)' }} />
      <div ref={bgRef1} style={{
        position:'fixed', top:'-20%', left:'-15%', width:700, height:700,
        background:'radial-gradient(circle, rgba(59,97,245,0.1) 0%, rgba(59,97,245,0.03) 40%, transparent 70%)',
        borderRadius:'50%', pointerEvents:'none', zIndex:0, willChange:'transform',
      }} />
      <div ref={bgRef2} style={{
        position:'fixed', bottom:'-5%', right:'-12%', width:620, height:620,
        background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)',
        borderRadius:'50%', pointerEvents:'none', zIndex:0, willChange:'transform',
      }} />

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section style={{ maxWidth:1200, margin:'0 auto', padding:'64px 24px 40px' }}>

          {/* Centered Hero Text */}
          <div style={{ textAlign:'center', marginBottom:60, position:'relative' }}>

            {/* Radial glow behind text */}
            <div style={{
              position:'absolute', top:'40%', left:'50%',
              transform:'translate(-50%,-50%)',
              width:640, height:360,
              background:'radial-gradient(ellipse, rgba(59,97,245,0.11) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)',
              pointerEvents:'none', zIndex:0,
            }} />

            {/* Greeting pill */}
            {isLoggedIn && (
              <div className="hero-item" style={{ marginBottom:20, position:'relative', zIndex:1 }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  padding:'7px 20px', borderRadius:999,
                  background:'rgba(59,97,245,0.07)', border:'1px solid rgba(59,97,245,0.16)',
                  fontSize:12, fontWeight:700, fontFamily:'Sora,sans-serif',
                  color:'var(--brand-400)', letterSpacing:'0.05em',
                  backdropFilter:'blur(10px)',
                }}>
                  <span style={{ display:'inline-block', animation:'waveHand 1.2s ease-in-out 2' }}>👋</span>
                  {greeting}
                </span>
              </div>
            )}

            {!isLoggedIn && (
              <div className="hero-item" style={{ marginBottom:24, position:'relative', zIndex:1 }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  padding:'7px 18px', borderRadius:999,
                  background:'rgba(59,97,245,0.07)', border:'1px solid rgba(59,97,245,0.16)',
                  fontSize:12, fontWeight:700, fontFamily:'Sora,sans-serif',
                  color:'var(--brand-400)', letterSpacing:'0.04em',
                  backdropFilter:'blur(10px)',
                }}>
                  <Sparkles size={11} /> TRUSTED BY 12,000+ USERS WORLDWIDE
                </span>
              </div>
            )}

            {/* Main heading — LARGE */}
            <h1 className="hero-item hero-delay-1" style={{
              fontSize:'clamp(2.8rem, 7.5vw, 5.2rem)',
              fontFamily:'Sora, sans-serif', fontWeight:800,
              letterSpacing:'-0.04em', lineHeight:1.04,
              margin:'0 auto 18px', maxWidth:800,
              color:'var(--text-primary)',
              position:'relative', zIndex:1,
            }}>
              {isLoggedIn
                ? <>Welcome,{' '}
                    <span style={{
                      background:'linear-gradient(135deg,#3b61f5 0%,#7c3aed 45%,#06b6d4 100%)',
                      WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                    }}>{displayName}</span>
                  </>
                : <>The Modern{' '}
                    <span style={{
                      background:'linear-gradient(135deg,#3b61f5 0%,#7c3aed 45%,#06b6d4 100%)',
                      WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                    }}>Virtual Card</span>{' '}Platform
                  </>
              }
            </h1>

            {/* Subtext */}
            <p className="hero-item hero-delay-2" style={{
              fontSize:18, color:'var(--text-secondary)',
              maxWidth:460, margin:'0 auto 44px', lineHeight:1.68,
              position:'relative', zIndex:1,
            }}>
              {isLoggedIn
                ? 'Your dashboard is ready — cards, analytics, and rewards all in one place.'
                : 'Issue, manage, and control virtual credit cards with enterprise-grade security and real-time insights.'}
            </p>

            {/* CTAs */}
            <div className="hero-item hero-delay-3" style={{
              display:'flex', gap:12, justifyContent:'center',
              flexWrap:'wrap', position:'relative', zIndex:1,
            }}>
              {isLoggedIn ? (
                <>
                  <button className="btn-primary" style={{ fontSize:15, padding:'14px 28px' }} onClick={() => navigate('/dashboard')}>
                    Open Dashboard <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary" style={{ fontSize:15, padding:'14px 28px' }} onClick={() => navigate('/pricing')}>
                    View Plans
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" style={{ fontSize:15, padding:'14px 28px' }} onClick={() => navigate('/register')}>
                    Get Started Free <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary" style={{ fontSize:15, padding:'14px 28px' }} onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Floating Card Visual */}
          <div className="hero-item hero-delay-4" style={{ display:'flex', justifyContent:'center', position:'relative', marginBottom:80 }}>
            {/* Tilted BG card */}
            <div style={{
              position:'absolute', width:300, height:178, borderRadius:18,
              background:'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(6,182,212,0.13) 100%)',
              border:'1px solid rgba(255,255,255,0.1)',
              transform:'rotate(-6deg) translateY(10px) translateX(-22px)',
              boxShadow:'0 12px 40px rgba(0,0,0,0.09)',
              backdropFilter:'blur(8px)',
            }} />

            {/* Main card */}
            <div style={{
              width:340, height:200, borderRadius:20,
              background:'linear-gradient(135deg,#1a1f3c 0%,#0f1420 100%)',
              border:'1px solid rgba(255,255,255,0.14)',
              boxShadow:'0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(59,97,245,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              padding:28, display:'flex', flexDirection:'column', justifyContent:'space-between',
              position:'relative', overflow:'hidden', zIndex:2,
              animation:'float 4s ease-in-out infinite',
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)', borderRadius:20 }} />
              <div style={{ position:'absolute', top:22, left:24, width:32, height:24, borderRadius:5, background:'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.2)' }} />
              <div style={{ position:'absolute', top:20, right:24, display:'flex' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(59,97,245,0.4)', border:'1px solid rgba(59,97,245,0.6)' }} />
                <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,200,50,0.3)', border:'1px solid rgba(255,200,50,0.5)', marginLeft:-14 }} />
              </div>
              <div style={{ marginTop:28 }}>
                <div style={{ fontFamily:'Sora,sans-serif', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>CREDIFY VIRTUAL</div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:16, color:'rgba(255,255,255,0.85)', letterSpacing:'0.18em', marginBottom:16 }}>4829 •••• •••• 7234</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Card Holder</div>
                    <div style={{ fontFamily:'Sora,sans-serif', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>
                      {user?.first_name ? `${user.first_name} ${user.last_name||''}`.trim() : user?.username || 'Your Name'}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Expires</div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color:'rgba(255,255,255,0.85)' }}>12/28</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge: Transaction */}
            <div style={{
              position:'absolute', bottom:12, right:'calc(50% - 230px)',
              background:'rgba(255,255,255,0.88)',
              border:'1px solid rgba(59,97,245,0.1)',
              borderRadius:14, padding:'10px 16px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
              display:'flex', alignItems:'center', gap:10, zIndex:3,
              backdropFilter:'blur(20px)', animation:'floatAlt 5s ease-in-out infinite',
            }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CheckCircle size={16} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, fontFamily:'Sora,sans-serif', color:'#0f1623' }}>Transaction</div>
                <div style={{ fontSize:10, color:'#10b981', fontWeight:600 }}>+$240.00 approved</div>
              </div>
            </div>

            {/* Badge: Rewards */}
            <div style={{
              position:'absolute', top:0, left:'calc(50% - 230px)',
              background:'rgba(255,255,255,0.88)',
              border:'1px solid rgba(59,97,245,0.1)',
              borderRadius:14, padding:'10px 16px',
              boxShadow:'0 8px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
              display:'flex', alignItems:'center', gap:10, zIndex:3,
              backdropFilter:'blur(20px)', animation:'float 4s ease-in-out infinite', animationDelay:'1s',
            }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'rgba(59,97,245,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Star size={16} color="#3b61f5" fill="#3b61f5" />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, fontFamily:'Sora,sans-serif', color:'#0f1623' }}>Rewards</div>
                <div style={{ fontSize:10, color:'var(--brand-400)', fontWeight:600 }}>+120 points earned</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ═════════════════════════════════════════════════════ */}
        <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 80px' }}>
          <div className="premium-card" style={{ padding:'32px 40px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:32 }}>
              {STATS.map(({ label, value, suffix, prefix, icon:Icon, color }, i) => (
                <div key={i} className="stagger-item" style={{ textAlign:'center', animationDelay:`${600 + i*120}ms` }}>
                  <div style={{
                    width:44, height:44, borderRadius:12, margin:'0 auto 12px',
                    background:`${color}12`, border:`1px solid ${color}22`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:`0 4px 14px ${color}15`,
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, fontFamily:'Sora,sans-serif', letterSpacing:'-0.03em', color:'var(--text-primary)' }}>
                    <AnimatedNumber target={value} suffix={suffix} prefix={prefix} />
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4, fontWeight:500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
        <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 100px' }}>
          <div className="animate-fade-up" style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.14em', fontFamily:'Sora,sans-serif', marginBottom:10, textTransform:'uppercase' }}>HOW IT WORKS</p>
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)', margin:'0 auto 14px', maxWidth:520 }}>Up and running in minutes</h2>
            <p style={{ color:'var(--text-secondary)', maxWidth:400, margin:'0 auto', fontSize:15 }}>Four simple steps from sign-up to your first transaction.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
            {STEPS.map(({ step, icon:Icon, color, title, desc }, i) => (
              <div key={i} className="premium-card stagger-item" style={{ padding:'32px 24px', textAlign:'center', animationDelay:`${i*130}ms` }}>
                <div style={{ fontSize:10, fontWeight:800, fontFamily:'Sora,sans-serif', color:`${color}65`, letterSpacing:'0.12em', marginBottom:16, textTransform:'uppercase' }}>STEP {step}</div>
                <div style={{ width:56, height:56, borderRadius:16, margin:'0 auto 20px', background:`${color}10`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 20px ${color}12` }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize:15, margin:'0 0 10px', fontWeight:700 }}>{title}</h3>
                <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.65, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CAPABILITIES ══════════════════════════════════════════════ */}
        <section style={{ padding:'80px 24px', background:'var(--bg-subtle-glass)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div className="animate-fade-up" style={{ textAlign:'center', marginBottom:56 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.14em', fontFamily:'Sora,sans-serif', marginBottom:10, textTransform:'uppercase' }}>PLATFORM CAPABILITIES</p>
              <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)', margin:'0 auto 14px', maxWidth:560 }}>Built for the way you actually work</h2>
              <p style={{ color:'var(--text-secondary)', maxWidth:460, margin:'0 auto', fontSize:15 }}>Beyond basic card management — Credify is a complete financial operations platform.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
              {CAPABILITIES.map(({ icon:Icon, color, title, desc }, i) => (
                <div key={i} className="premium-card stagger-item" style={{ padding:'24px 26px', display:'flex', gap:18, alignItems:'flex-start', animationDelay:`${i*80}ms` }}>
                  <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, marginTop:2, background:`${color}10`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${color}12` }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize:15, margin:'0 0 6px', fontWeight:700 }}>{title}</h3>
                    <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.65, margin:0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SECURITY ══════════════════════════════════════════════════ */}
        <section style={{ maxWidth:1100, margin:'0 auto', padding:'80px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
            <div className="animate-fade-up">
              <p style={{ fontSize:11, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.14em', fontFamily:'Sora,sans-serif', marginBottom:10, textTransform:'uppercase' }}>ENTERPRISE SECURITY</p>
              <h2 style={{ fontSize:'clamp(1.6rem,4vw,2.5rem)', marginBottom:16 }}>
                Your security is our{' '}
                <span style={{ background:'linear-gradient(135deg,#3b61f5,#7c3aed,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>top priority</span>
              </h2>
              <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.75, marginBottom:32 }}>
                Every Credify account is protected by multiple layers of enterprise-grade security. We never compromise on protecting your financial data.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {['SOC 2 Type II Compliant','End-to-end encrypted card data','Two-factor authentication support','Automatic fraud detection'].map((item,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize:14, color:'var(--text-secondary)', fontWeight:500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {SECURITY.map(({ icon:Icon, color, title, desc }, i) => (
                <div key={i} className="premium-card stagger-item" style={{ padding:'22px 20px', animationDelay:`${i*100}ms` }}>
                  <div style={{ width:40, height:40, borderRadius:10, marginBottom:14, background:`${color}10`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${color}12` }}>
                    <Icon size={18} color={color} />
                  </div>
                  <h4 style={{ fontSize:14, fontWeight:700, margin:'0 0 6px' }}>{title}</h4>
                  <p style={{ fontSize:12.5, color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
        <section style={{ padding:'80px 24px', background:'var(--bg-subtle-glass)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div className="animate-fade-up" style={{ textAlign:'center', marginBottom:52 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.14em', fontFamily:'Sora,sans-serif', marginBottom:10, textTransform:'uppercase' }}>LOVED BY USERS</p>
              <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)', margin:'0 auto', maxWidth:480 }}>What our users say</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
              {TESTIMONIALS.map(({ name, role, avatar, color, stars, text }, i) => (
                <div key={i} className="premium-card stagger-item" style={{ padding:'28px 26px', animationDelay:`${i*120}ms` }}>
                  <div style={{ display:'flex', gap:3, marginBottom:16 }}>
                    {Array.from({ length:stars }).map((_,j) => <Star key={j} size={13} color="#f59e0b" fill="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize:14.5, color:'var(--text-secondary)', lineHeight:1.72, margin:'0 0 20px', fontStyle:'italic' }}>"{text}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12, borderTop:'1px solid var(--border)', paddingTop:16 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${color},${color}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Sora,sans-serif', flexShrink:0 }}>
                      {avatar}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, fontFamily:'Sora,sans-serif', color:'var(--text-primary)' }}>{name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section style={{ maxWidth:1100, margin:'0 auto', padding:'80px 24px' }}>
          <div className="premium-card" style={{ padding:'72px 40px', textAlign:'center', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,rgba(59,97,245,0.05) 0%,rgba(139,92,246,0.03) 50%,rgba(6,182,212,0.02) 100%)' }}>
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:500, height:200, background:'radial-gradient(ellipse at top,rgba(59,97,245,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg,transparent,rgba(59,97,245,0.4),rgba(139,92,246,0.4),transparent)' }} />
            {!isLoggedIn && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:999, marginBottom:20, background:'rgba(59,97,245,0.07)', border:'1px solid rgba(59,97,245,0.18)', fontSize:11, fontWeight:700, color:'var(--brand-400)', fontFamily:'Sora,sans-serif', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                <Sparkles size={10} /> FREE TO START
              </div>
            )}
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)', marginBottom:14, position:'relative' }}>
              {isLoggedIn ? 'Ready to manage your cards?' : 'Start for free today'}
            </h2>
            <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:440, margin:'0 auto 36px', lineHeight:1.7, position:'relative' }}>
              {isLoggedIn ? 'Head to your dashboard to issue new cards, track transactions, and redeem rewards.' : 'Join over 12,000 users who trust Credify to manage their virtual cards securely.'}
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', position:'relative' }}>
              {isLoggedIn ? (
                <button className="btn-primary" style={{ fontSize:15, padding:'14px 32px' }} onClick={() => navigate('/dashboard')}>
                  Open Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button className="btn-primary" style={{ fontSize:15, padding:'14px 32px' }} onClick={() => navigate('/register')}>
                    Create Free Account <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary" style={{ fontSize:15, padding:'14px 28px' }} onClick={() => navigate('/pricing')}>
                    View Pricing
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;