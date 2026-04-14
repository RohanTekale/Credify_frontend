// src/pages/Home.jsx  — Credify Post-Login Hero (Public: marketing landing)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, Globe, TrendingUp, CreditCard,
  Star, ChevronDown, Play, Lock, Users, Activity,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

// ─── Animated number counter ──────────────────────────────────────────────────
const useCounter = (target, dur = 1600, go = false) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!go) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, dur, go]);
  return v;
};

// ─── Particle canvas ─────────────────────────────────────────────────────────
const ParticleField = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.4,
      a: Math.random() * 0.45 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,140,255,${p.a})`;
        ctx.fill();
      });
      // draw connecting lines
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(100,140,255,${0.08 * (1 - d / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

// ─── 3D Floating Card ─────────────────────────────────────────────────────────
const HeroCard = ({ user }) => {
  const cardRef = useRef(null);
  const [rot, setRot] = useState({ x: 8, y: -6 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const name = user?.username || 'CARDHOLDER';

  const onMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const cx = (e.clientX - left) / width;
    const cy = (e.clientY - top) / height;
    setRot({ x: (cy - 0.5) * -22, y: (cx - 0.5) * 22 });
    setShine({ x: cx * 100, y: cy * 100 });
  }, []);

  const onLeave = useCallback(() => {
    setRot({ x: 8, y: -6 });
    setShine({ x: 50, y: 50 });
    setHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        width: 340, height: 204,
        borderRadius: 20,
        transform: `perspective(1000px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) scale(${hovered ? 1.06 : 1})`,
        transition: hovered ? 'transform 0.05s linear' : 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        position: 'relative',
        willChange: 'transform',
      }}
    >
      {/* Card body */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20,
        background: 'linear-gradient(145deg,#1a2a6c 0%,#0d1660 30%,#1a0a3e 65%,#0a1a3a 100%)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.1)`,
        overflow: 'hidden',
      }}>
        {/* Holographic shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at ${shine.x}% ${shine.y}%, rgba(120,140,255,0.22) 0%, transparent 55%)`,
          transition: hovered ? 'none' : 'background 0.6s ease',
          pointerEvents: 'none',
        }} />
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.015) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,0.015) 29px)',
          pointerEvents: 'none',
        }} />
        {/* Top gloss */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)',
          pointerEvents: 'none', borderRadius: '20px 20px 0 0',
        }} />
        {/* Glow orb top-right */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(80,120,255,0.22)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', fontFamily: 'Sora,sans-serif' }}>CREDIFY VIRTUAL</div>
            {/* Chip */}
            <div style={{ width: 34, height: 26, borderRadius: 5, background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, padding: 4 }}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ background: 'rgba(0,0,0,0.28)', borderRadius: 1 }} />)}
            </div>
          </div>

          {/* Card number */}
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 15, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.24em', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            4829 •••• •••• 7234
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Card Holder</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Sora,sans-serif', letterSpacing: '0.05em' }}>{name.toUpperCase().slice(0, 16)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Expires</div>
              <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: 'rgba(255,255,255,0.8)' }}>12/28</div>
            </div>
            {/* Mastercard-style circles */}
            <div style={{ display: 'flex', marginLeft: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,80,50,0.7)', border: '1px solid rgba(255,255,255,0.15)' }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,180,50,0.6)', border: '1px solid rgba(255,255,255,0.15)', marginLeft: -12 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Shadow card behind */}
      <div style={{
        position: 'absolute', top: 14, left: -12, right: 12, bottom: -14,
        borderRadius: 20, zIndex: -1,
        background: 'linear-gradient(145deg,#0d0730,#060d30)',
        opacity: 0.7,
        transform: 'translateZ(-30px)',
      }} />
    </div>
  );
};

// ─── Floating stat badge ──────────────────────────────────────────────────────
const FloatBadge = ({ style, icon: Icon, iconColor, label, value }) => (
  <div style={{
    position: 'absolute', ...style,
    background: 'rgba(8,12,24,0.9)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14, padding: '10px 16px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    animation: `fbFloat ${2.8 + Math.random()}s ease-in-out infinite`,
    whiteSpace: 'nowrap',
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${iconColor}18`, border: `1px solid ${iconColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} color={iconColor} />
    </div>
    <div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Sora,sans-serif' }}>{value}</div>
    </div>
  </div>
);

// ─── Feature card ─────────────────────────────────────────────────────────────
const FeatCard = ({ icon: Icon, title, desc, color, delay }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 26px', borderRadius: 20,
        background: hovered ? `linear-gradient(135deg,${color}0c,rgba(255,255,255,0.03))` : 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))',
        border: `1px solid ${hovered ? color + '30' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${color}20` : '0 4px 24px rgba(0,0,0,0.35)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'default',
        animationDelay: `${delay}ms`,
      }}
      className="animate-fade-up"
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon size={20} color={color} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#f0f4ff' }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'rgba(240,244,255,0.5)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
};

// ─── Timeline step ────────────────────────────────────────────────────────────
const TimeStep = ({ n, title, desc, color, last }) => (
  <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, fontFamily: 'Sora,sans-serif', color, flexShrink: 0, boxShadow: `0 0 20px ${color}30` }}>{n}</div>
      {!last && <div style={{ width: 1, flex: 1, background: `linear-gradient(180deg,${color}40,transparent)`, marginTop: 8, minHeight: 40 }} />}
    </div>
    <div style={{ paddingBottom: last ? 0 : 32, paddingTop: 8 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff', marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(240,244,255,0.48)', lineHeight: 1.65 }}>{desc}</div>
    </div>
  </div>
);

// ─── Logged-in Hero ───────────────────────────────────────────────────────────
const LoggedInHome = ({ user, navigate }) => {
  const [phase, setPhase] = useState(0); // 0=name-in, 1=rest
  const [countGo, setCountGo] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setCountGo(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const c1 = useCounter(2400000, 2000, countGo);
  const c2 = useCounter(99, 1600, countGo);
  const c3 = useCounter(38000, 2000, countGo);

  const FEATURES = [
    { icon: Shield,     title: 'Bank-grade Security',    desc: 'End-to-end encryption, biometric auth, and real-time fraud monitoring protecting every transaction.',              color: '#10b981', delay: 0 },
    { icon: Zap,        title: 'Instant Virtual Cards',  desc: 'Issue 16-digit virtual cards in seconds. Set limits, freeze, or block — all from your dashboard.',               color: '#3b61f5', delay: 80 },
    { icon: TrendingUp, title: 'AI Spend Intelligence',  desc: 'Smart categorisation of every spend with predictive insights that help you stay ahead of your financial goals.', color: '#8b5cf6', delay: 160 },
    { icon: Globe,      title: 'Multi-currency Support', desc: 'Transact globally. Automatic best-rate forex selection across all your linked cards, no hidden fees.',           color: '#06b6d4', delay: 240 },
    { icon: Activity,   title: 'Real-time Analytics',    desc: 'Live dashboards, sparklines, and deep transaction breakdowns — your money at a glance, always.',                 color: '#f59e0b', delay: 320 },
    { icon: Star,       title: 'Rewards That Scale',     desc: 'Earn points on every purchase automatically maximised across cards. Redeem for cashback, vouchers, and more.',   color: '#ec4899', delay: 400 },
  ];

  const STEPS = [
    { title: 'Create your account',       desc: 'Sign up in under 60 seconds with your email. No paperwork.',          color: '#3b61f5' },
    { title: 'Complete KYC verification', desc: 'Upload a government ID. Our AI reviews it within 24 hours.',          color: '#8b5cf6' },
    { title: 'Request a virtual card',    desc: 'Choose Basic, Silver, Gold, or Platinum — your limit, your control.', color: '#10b981' },
    { title: 'Spend & earn rewards',      desc: 'Every transaction builds your reward balance. Track it live.',         color: '#f59e0b' },
  ];

  const avatarPalette = ['#3b61f5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  const avatarColor = user?.username ? avatarPalette[user.username.charCodeAt(0) % avatarPalette.length] : '#3b61f5';

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ══ HERO SECTION ══════════════════════════════════════════════════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <ParticleField />

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: 650, height: 650, borderRadius: '50%', background: `radial-gradient(circle,${avatarColor}12 0%,transparent 70%)`, pointerEvents: 'none', animation: 'orbDrift1 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)', pointerEvents: 'none', animation: 'orbDrift2 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', left: '38%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />

        {/* Diagonal grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(59,97,245,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,97,245,0.04) 1px,transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)',
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', minHeight: '85vh' }}>

            {/* LEFT — Text */}
            <div>
              {/* Welcome pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: `${avatarColor}12`, border: `1px solid ${avatarColor}28`,
                borderRadius: 100, padding: '6px 16px 6px 8px',
                marginBottom: 28,
                opacity: phase >= 0 ? 1 : 0,
                transform: phase >= 0 ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${avatarColor},${avatarColor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: 'Sora,sans-serif' }}>
                  {(user?.username || 'U').slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: avatarColor, fontFamily: 'Sora,sans-serif' }}>
                  {greeting}, {user?.username || 'User'}! {greetEmoji}
                </span>
              </div>

              {/* Headline — name animates in first */}
              <h1 style={{
                fontSize: 'clamp(2.8rem,5.5vw,4.4rem)',
                lineHeight: 1.05, letterSpacing: '-0.04em',
                margin: '0 0 24px',
                opacity: phase >= 0 ? 1 : 0,
                transform: phase >= 0 ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)',
              }}>
                Your money,{' '}
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(90deg,#6089ff 0%,#a78bfa 40%,#38bdf8 80%,#6089ff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradShift 4s linear infinite',
                  opacity: phase >= 1 ? 1 : 0,
                  transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.6s 0.45s ease, transform 0.6s 0.45s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  fully in control.
                </span>
              </h1>

              <p style={{
                fontSize: 17, lineHeight: 1.75, color: 'rgba(240,244,255,0.55)',
                maxWidth: 480, margin: '0 0 36px',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.6s 0.6s cubic-bezier(0.16,1,0.3,1)',
              }}>
                One intelligent hub for all your virtual cards, rewards and spending — 
                built for the global professional who demands more.
              </p>

              {/* CTA buttons */}
              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.6s 0.75s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary"
                  style={{ fontSize: 14, padding: '13px 28px', borderRadius: 13, position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.querySelector('.sheen').style.transform = 'translateX(100%)'}
                  onMouseLeave={e => e.currentTarget.querySelector('.sheen').style.transform = 'translateX(-100%)'}
                >
                  <div className="sheen" style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', transform: 'translateX(-100%)', transition: 'transform 0.5s ease', pointerEvents: 'none' }} />
                  Open Dashboard <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-secondary"
                  style={{ fontSize: 14, padding: '13px 24px', borderRadius: 13 }}
                >
                  <Play size={14} /> Explore features
                </button>
              </div>

              {/* Trust strip */}
              <div style={{
                display: 'flex', gap: 20, marginTop: 40, alignItems: 'center',
                opacity: phase >= 1 ? 1 : 0,
                transition: 'opacity 0.6s 1s ease',
              }}>
                {[
                  { label: 'ISO 27001', sub: 'Certified' },
                  { label: 'PCI DSS', sub: 'Compliant' },
                  { label: '256-bit', sub: 'Encrypted' },
                ].map(({ label, sub }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={11} color="#10b981" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f0f4ff' }}>{label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(240,244,255,0.35)' }}>{sub}</div>
                    </div>
                    {i < 2 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', marginLeft: 14 }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — 3D card scene */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              position: 'relative', height: 440,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'translateX(0)' : 'translateX(40px)',
              transition: 'all 0.9s 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}>
              {/* Rotating ring */}
              <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '1px solid rgba(59,97,245,0.1)', animation: 'spinRing 25s linear infinite', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#3b61f5', boxShadow: '0 0 12px rgba(59,97,245,0.8)' }} />
              </div>
              <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.08)', animation: 'spinRing 18s linear infinite reverse', pointerEvents: 'none' }} />

              <HeroCard user={user} />

              {/* Floating badges */}
              <FloatBadge icon={TrendingUp} iconColor="#10b981" label="Salary credited" value="+₹62,000" style={{ top: 30, right: -20 }} />
              <FloatBadge icon={Star} iconColor="#f59e0b" label="Reward points" value="4,820 pts" style={{ bottom: 60, right: -20 }} />
              <FloatBadge icon={Shield} iconColor="#3b61f5" label="Security status" value="Verified ✓" style={{ bottom: 20, left: -10 }} />
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4, animation: 'bounce 2.4s ease-in-out infinite' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', fontFamily: 'Sora,sans-serif' }}>SCROLL</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
      </section>

      {/* ══ LIVE STATS TICKER ════════════════════════════════════════════════ */}
      <div style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { label: 'Transactions Processed', value: `$${(c1 / 1000000).toFixed(1)}M+`, color: '#3b61f5' },
              { label: 'Platform Uptime',        value: `${c2}.9%`,                       color: '#10b981' },
              { label: 'Cards Issued',           value: `${(c3 / 1000).toFixed(0)}K+`,    color: '#8b5cf6' },
              { label: 'Active Users',           value: '12,000+',                        color: '#f59e0b' },
            ].map(({ label, value, color }, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 800, fontFamily: 'Sora,sans-serif', color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.4)', marginTop: 4, letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FEATURES SECTION ═════════════════════════════════════════════════ */}
      <section id="features-section" style={{ padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b61f5', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Sora,sans-serif' }}>Platform capabilities</span>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', margin: '12px 0 16px', lineHeight: 1.1 }}>
              Everything the modern{' '}<span className="gradient-text">fintech user</span>{' '}needs
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(240,244,255,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Credify combines enterprise-grade infrastructure with a consumer-first experience.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => <FeatCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Sora,sans-serif' }}>How it works</span>
              <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', margin: '12px 0 40px', lineHeight: 1.1 }}>From signup to first<br /><span className="gradient-text">transaction in minutes</span></h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {STEPS.map((s, i) => <TimeStep key={i} n={i + 1} {...s} last={i === STEPS.length - 1} />)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Average time to first card', value: '< 2 minutes', color: '#3b61f5', icon: Zap },
                { label: 'KYC approval rate',          value: '97.4%',       color: '#10b981', icon: Shield },
                { label: 'Transaction success rate',   value: '99.97%',      color: '#8b5cf6', icon: Activity },
                { label: 'Customer satisfaction',      value: '4.9 / 5.0',   color: '#f59e0b', icon: Star },
              ].map(({ label, value, color, icon: Icon }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderRadius: 16, background: 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}14`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'rgba(240,244,255,0.45)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: '#f0f4ff', letterSpacing: '-0.02em' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div style={{
            borderRadius: 28, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg,rgba(59,97,245,0.12) 0%,rgba(139,92,246,0.08) 50%,rgba(6,182,212,0.08) 100%)',
            border: '1px solid rgba(59,97,245,0.2)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          }}>
            <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,97,245,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 22 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.8)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', fontFamily: 'Sora,sans-serif' }}>Your account is ready</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', margin: '0 auto 16px', maxWidth: 500, lineHeight: 1.1 }}>
                Ready to take control of your finances?
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(240,244,255,0.5)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.7 }}>
                Your dashboard is waiting. Explore cards, transactions, rewards, and real-time analytics.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
                style={{ fontSize: 15, padding: '15px 36px', borderRadius: 14 }}
              >
                <Users size={16} /> Go to My Dashboard <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── keyframes ── */}
      <style>{`
        @keyframes gradShift    { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes spinRing     { to{transform:rotate(360deg)} }
        @keyframes orbDrift1    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
        @keyframes orbDrift2    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
        @keyframes bounce       { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        @keyframes fbFloat      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }
      `}</style>
    </div>
  );
};

// ─── Public Home (unauthenticated) ────────────────────────────────────────────
const PublicHome = ({ navigate }) => {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 300); return () => clearTimeout(t); }, []);
  const c1 = useCounter(12000, 1800, go);

  const FEATURES = [
    { icon: Lock,       title: 'Secure by design',   desc: 'ISO 27001 certified. PCI DSS compliant. End-to-end encryption on every request.',                         color: '#10b981' },
    { icon: Zap,        title: 'Instant issuance',   desc: 'Virtual cards issued in seconds. No waiting, no paperwork.',                                               color: '#3b61f5' },
    { icon: TrendingUp, title: 'Smart insights',     desc: 'AI-powered spend analytics that work for you, not just at you.',                                           color: '#8b5cf6' },
    { icon: Globe,      title: 'Built for global',   desc: 'Multi-currency, multi-region. Designed for the international financial market.',                           color: '#06b6d4' },
    { icon: Star,       title: 'Rewards platform',   desc: 'Every spend earns. Every point counts. Redeem for cashback or vouchers instantly.',                        color: '#f59e0b' },
    { icon: Activity,   title: 'Live monitoring',    desc: 'Real-time transaction alerts and live dashboard — always know where your money is.',                       color: '#ec4899' },
  ];

  return (
    <div style={{ overflowX: 'hidden' }}>
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <ParticleField />
        <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,97,245,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(59,97,245,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,97,245,0.04) 1px,transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%)',
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', minHeight: '85vh' }}>
            <div>
              <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(59,97,245,0.1)', border: '1px solid rgba(59,97,245,0.22)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
                <Lock size={11} color="#6089ff" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6089ff', fontFamily: 'Sora,sans-serif', letterSpacing: '0.04em' }}>BANK-GRADE SECURITY · {c1.toLocaleString()}+ USERS</span>
              </div>
              <h1 className="animate-fade-up delay-100" style={{ fontSize: 'clamp(2.8rem,5.5vw,4.4rem)', lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 24px' }}>
                The modern{' '}
                <span className="gradient-text">virtual card</span><br />
                platform
              </h1>
              <p className="animate-fade-up delay-200" style={{ fontSize: 17, lineHeight: 1.75, color: 'rgba(240,244,255,0.55)', maxWidth: 460, margin: '0 0 36px' }}>
                Issue, manage and control virtual credit cards with enterprise-grade security and real-time intelligence. Built for the global financial market.
              </p>
              <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ fontSize: 14, padding: '13px 28px', borderRadius: 13 }} onClick={() => navigate('/register')}>Get Started Free <ArrowRight size={15} /></button>
                <button className="btn-secondary" style={{ fontSize: 14, padding: '13px 24px', borderRadius: 13 }} onClick={() => navigate('/features')}>See Features</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 440 }} className="animate-fade-up delay-400">
              <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '1px solid rgba(59,97,245,0.1)', animation: 'spinRing 25s linear infinite', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#3b61f5', boxShadow: '0 0 12px rgba(59,97,245,0.8)' }} />
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                <HeroCard user={{ username: 'JOHN DOE' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[{ v: '$2.4M+', l: 'Transactions' }, { v: '99.9%', l: 'Uptime' }, { v: '38K+', l: 'Cards Issued' }, { v: '12K+', l: 'Active Users' }].map(({ v, l }, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 800, fontFamily: 'Sora,sans-serif', color: '#f0f4ff', letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.4)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="features-section" style={{ padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b61f5', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Sora,sans-serif' }}>Why Credify</span>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', margin: '12px 0 16px', lineHeight: 1.1 }}>Everything you <span className="gradient-text">need</span></h2>
            <p style={{ fontSize: 15, color: 'rgba(240,244,255,0.5)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>Built for individuals and teams who need secure, modern virtual card infrastructure.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => <FeatCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div style={{ borderRadius: 28, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,rgba(59,97,245,0.12),rgba(139,92,246,0.08))', border: '1px solid rgba(59,97,245,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', margin: '0 auto 16px', maxWidth: 500, lineHeight: 1.1 }}>Ready to get started?</h2>
            <p style={{ fontSize: 16, color: 'rgba(240,244,255,0.5)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>Join thousands managing virtual cards with Credify.</p>
            <button className="btn-primary" style={{ fontSize: 15, padding: '15px 36px', borderRadius: 14 }} onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spinRing { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return user
    ? <LoggedInHome user={user} navigate={navigate} />
    : <PublicHome navigate={navigate} />;
};

export default Home;