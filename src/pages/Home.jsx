// src/pages/Home.jsx — World-class cinematic redesign v3
// Fixes: dark mode applied via CSS vars, 360° card rotation, premium UI
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, TrendingUp, Users, CreditCard,
  CheckCircle, Star, Lock, Globe, Clock, Award,
  Sparkles, BarChart3, Smartphone, RefreshCw, HeartHandshake,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

/* ── Exported 3D Canvas Logo (used by Navbar) ─────────────────────────── */
export const CredifyLogo3D = ({ size = 48 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const draw = () => {
      t.current += 0.02;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2, rx = size * 0.42;
      const pulse = 0.97 + Math.sin(t.current * 2.6) * 0.03;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t.current * 0.8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const alpha = 0.15 + 0.2 * ((Math.sin(t.current * 2 + i) + 1) / 2);
        ctx.beginPath(); ctx.arc(Math.cos(a) * rx * 1.12, Math.sin(a) * rx * 1.12, 1.8, 0, Math.PI * 2);
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
      const sw = Math.sin(t.current * 1.3) * rx;
      const sg = ctx.createLinearGradient(sw - rx * 0.5, -rx, sw + rx * 0.5, rx);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25); ctx.fillStyle = sg; ctx.fill();
      const s = size / 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.roundRect(-8 * s, -5 * s, 16 * s, 11 * s, 2 * s); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-8 * s, -2 * s, 16 * s, 2.2 * s);
      ctx.fillStyle = 'rgba(245,158,11,0.9)'; ctx.beginPath(); ctx.roundRect(-7 * s, 1.8 * s, 3.5 * s, 2.5 * s, 0.5 * s); ctx.fill();
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.8 * s;
      ctx.beginPath(); ctx.moveTo(5 * s, -8 * s); ctx.lineTo(7 * s, -5.5 * s); ctx.lineTo(10 * s, -9.5 * s); ctx.stroke();
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);
  return <canvas ref={canvasRef} style={{ width: size, height: size, display: 'block' }} />;
};

/* ── Particle Field ──────────────────────────────────────────────────── */
const ParticleField = ({ isDark }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.8 + 0.4, a: Math.random() * 0.5 + 0.1,
    }));
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const col = isDark ? '96,137,255' : '59,97,245';
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},${p.a * (isDark ? 1 : 0.55)})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 115) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${col},${(1 - d / 115) * (isDark ? 0.13 : 0.07)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize); };
  }, [isDark]);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: isDark ? 0.65 : 0.38 }} />;
};

/* ── AnimatedNumber ──────────────────────────────────────────────────── */
const AnimatedNumber = ({ target, suffix = '', prefix = '' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null); const started = useRef(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const n = parseFloat(target.replace(/[^0-9.]/g, ''));
        const inc = n / 60; let cur = 0;
        const timer = setInterval(() => {
          cur += inc; if (cur >= n) { setDisplay(n); clearInterval(timer); } else setDisplay(Math.floor(cur * 10) / 10);
        }, 30);
      }
    }, { threshold: 0.4 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [target]);
  const fmt = Number.isInteger(Number(display)) ? display : display.toFixed(1);
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
};

/* ── AnimatedName ─────────────────────────────────────────────────────── */
const AnimatedName = ({ name, baseDelay = 0.55 }) => (
  <span style={{ display: 'inline', position: 'relative' }}>
    {name.split('').map((char, i) => (
      <span key={i} className="animate-letter-in" style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg,#6089ff 0%,#a78bfa 50%,#38bdf8 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        animationDelay: `${baseDelay + i * 0.045}s`, animationFillMode: 'both',
      }}>{char === ' ' ? '\u00A0' : char}</span>
    ))}
  </span>
);

/* ── HeroCard360 — Full 360° continuously rotating card ──────────────── */
const HeroCard360 = ({ user }) => {
  const wrapRef = useRef(null);
  const rotY = useRef(0);
  const animRef = useRef(null);
  const [shine, setShine] = useState({ x: 50, y: 35 });
  const [showBack, setShowBack] = useState(false);
  const isDragging = useRef(false);
  const isHovered = useRef(false);
  const lastX = useRef(0);

  const cardName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'Your Name';

  useEffect(() => {
    const tick = () => {
      if (!isHovered.current && !isDragging.current) {
        rotY.current = (rotY.current + 0.42) % 360;
        if (wrapRef.current) {
          wrapRef.current.style.transform = `perspective(1200px) rotateY(${rotY.current}deg)`;
        }
        setShine({ x: 50 + Math.sin(rotY.current * Math.PI / 180) * 30, y: 35 });
        setShowBack(rotY.current > 90 && rotY.current < 270);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const onMouseEnter = () => { isHovered.current = true; };
  const onMouseLeave = () => { isHovered.current = false; isDragging.current = false; };
  const onMouseDown = (e) => { isDragging.current = true; lastX.current = e.clientX; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    rotY.current = (rotY.current + dx * 0.6 + 360) % 360;
    lastX.current = e.clientX;
    if (wrapRef.current) wrapRef.current.style.transform = `perspective(1200px) rotateY(${rotY.current}deg)`;
    setShowBack(rotY.current > 90 && rotY.current < 270);
  };

  const W = 360, H = 226;

  return (
    <div
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
      style={{ width: W, height: H, cursor: 'grab', position: 'relative', userSelect: 'none' }}
    >
      <div ref={wrapRef} style={{ width: W, height: H, transformStyle: 'preserve-3d', willChange: 'transform', position: 'relative' }}>
        {/* FRONT */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 24, background: 'linear-gradient(145deg,#0d1a5c,#091450 35%,#060e38 70%,#040b2e)', border: '1px solid rgba(96,137,255,0.38)', boxShadow: '0 40px 100px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.12)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${shine.x}% ${shine.y}%,rgba(96,137,255,0.48) 0%,rgba(124,58,237,0.24) 30%,transparent 60%)`, transition: 'background 0.2s', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.012) 29px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.1) 0%,transparent)', pointerEvents: 'none', borderRadius: '24px 24px 0 0' }} />
          <div style={{ position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(59,97,245,0.38)', filter: 'blur(55px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(124,58,237,0.28)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '22px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>CREDIFY VIRTUAL</div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,97,245,0.55)', border: '1px solid rgba(59,97,245,0.9)' }} />
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,200,50,0.35)', border: '1px solid rgba(255,200,50,0.65)', marginLeft: -14 }} />
              </div>
            </div>
            <div style={{ width: 42, height: 32, borderRadius: 7, background: 'linear-gradient(135deg,#f59e0b,#d97706,#b45309)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2),0 2px 8px rgba(0,0,0,0.4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 6 }}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 2 }} />)}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 17, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.22em', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>4829 •••• •••• 7234</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Card Holder</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cardName.toUpperCase()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Expires</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>12/28</div>
              </div>
            </div>
          </div>
        </div>
        {/* BACK */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 24, background: 'linear-gradient(145deg,#060e38,#0d1a5c 50%,#091450)', border: '1px solid rgba(96,137,255,0.3)', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${100 - shine.x}% ${shine.y}%,rgba(167,139,250,0.32) 0%,transparent 55%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 44, left: 0, right: 0, height: 46, background: 'rgba(8,8,18,0.97)' }} />
          <div style={{ position: 'absolute', top: 110, left: 28, right: 28, height: 38, borderRadius: 6, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 12, paddingRight: 10 }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#1a1a2e', fontStyle: 'italic', opacity: 0.7 }}>{cardName}</div>
            <div style={{ background: 'rgba(59,97,245,0.9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono,monospace' }}>CVV</div>
          </div>
          <div style={{ position: 'absolute', bottom: 22, right: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em' }}>CREDIFY</div>
            <CheckCircle size={14} color="#4ade80" />
          </div>
          <div style={{ position: 'absolute', bottom: 22, left: 28 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3a8 8 0 010 16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M11 6a5 5 0 010 10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M11 9a2 2 0 010 4" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <circle cx="11" cy="11" r="1.2" fill="rgba(96,137,255,0.9)"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── CinemaCard ──────────────────────────────────────────────────────── */
const CinemaCard = ({ children, style = {}, glow = '#6089ff' }) => (
  <div
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', position: 'relative', overflow: 'hidden', ...style }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 60px ${glow}28,0 4px 16px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06)`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${glow}50`; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${glow}44,transparent)`, pointerEvents: 'none' }} />
    {children}
  </div>
);

/* ── ScrollReveal ─────────────────────────────────────────────────────── */
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      {children}
    </div>
  );
};

/* ── Section label pill ───────────────────────────────────────────────── */
const SectionLabel = ({ children, isDark }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: isDark ? 'rgba(96,137,255,0.1)' : 'rgba(96,137,255,0.07)', border: '1px solid rgba(96,137,255,0.22)', fontSize: 11, fontWeight: 700, color: '#6089ff', fontFamily: 'Sora,sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>
    {children}
  </div>
);

/* ── Data ──────────────────────────────────────────────────────────────── */
const STATS = [
  { label: 'Active Users', value: '12K', suffix: '+', icon: Users, color: '#6089ff' },
  { label: 'Transactions Processed', value: '2.4', suffix: 'M+', prefix: '$', icon: TrendingUp, color: '#a78bfa' },
  { label: 'Cards Issued', value: '38K', suffix: '+', icon: CreditCard, color: '#38bdf8' },
  { label: 'Uptime Guaranteed', value: '99.9', suffix: '%', icon: Zap, color: '#34d399' },
];
const STEPS = [
  { step: '01', icon: Users, color: '#6089ff', title: 'Create Your Account', desc: 'Sign up in seconds. Complete a quick KYC verification to unlock full card management capabilities.' },
  { step: '02', icon: CreditCard, color: '#a78bfa', title: 'Issue Virtual Cards', desc: 'Generate virtual credit cards instantly. Set custom limits, names, and expiry dates for each card.' },
  { step: '03', icon: Zap, color: '#38bdf8', title: 'Transact & Track', desc: 'Use your cards anywhere. Every transaction is tracked in real-time with detailed analytics.' },
  { step: '04', icon: TrendingUp, color: '#34d399', title: 'Earn & Redeem Rewards', desc: 'Accumulate points on every purchase. Redeem them for benefits, cashback, and exclusive perks.' },
];
const SECURITY = [
  { icon: Shield, color: '#6089ff', title: 'Bank-Grade Encryption', desc: '256-bit AES encryption for all data at rest and in transit.' },
  { icon: Lock, color: '#a78bfa', title: 'JWT Authentication', desc: 'Stateless, secure token-based auth with refresh rotation.' },
  { icon: Globe, color: '#38bdf8', title: 'Global Compliance', desc: 'KYC-compliant identity verification built into every account.' },
  { icon: Clock, color: '#fbbf24', title: '99.9% Uptime SLA', desc: 'High-availability infrastructure with redundant failover.' },
];
const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Freelance Designer', avatar: 'S', color: '#ec4899', stars: 5, text: 'Credify changed how I manage client subscriptions. Virtual cards per project means zero budget bleed.' },
  { name: 'Rohan K.', role: 'Startup Founder', avatar: 'R', color: '#6089ff', stars: 5, text: 'The rewards system genuinely adds up. I redeemed for benefits worth ₹4,000 last month alone.' },
  { name: 'Priya T.', role: 'Finance Manager', avatar: 'P', color: '#a78bfa', stars: 5, text: 'The admin dashboard is exceptional. Real-time transaction visibility with zero complexity.' },
];
const CAPABILITIES = [
  { icon: Smartphone, color: '#6089ff', title: 'Mobile-First Design', desc: 'Fully responsive interface optimised for desktop, tablet, and mobile — manage cards from anywhere.' },
  { icon: RefreshCw, color: '#a78bfa', title: 'Real-Time Sync', desc: 'Transaction data and card status sync instantly across all sessions — no refresh needed.' },
  { icon: BarChart3, color: '#38bdf8', title: 'Spending Analytics', desc: 'Visual spending breakdowns by category, time period, and card — actionable insights at a glance.' },
  { icon: Award, color: '#fbbf24', title: 'Tiered Rewards', desc: 'Earn 1–3x points based on spend categories. Unlock Silver, Gold, Platinum status automatically.' },
  { icon: HeartHandshake, color: '#34d399', title: 'Dedicated Support', desc: 'In-app chatbot available 24/7. Priority email support for Pro members with <2h response time.' },
  { icon: Globe, color: '#ec4899', title: 'Multi-Currency Ready', desc: 'Cards work globally. Automatic FX rate display at the moment of each transaction.' },
];

/* ════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const isLoggedIn = !!token;
  const displayName = user?.first_name || user?.username || 'there';
  const bgRef1 = useRef(null), bgRef2 = useRef(null), rafId = useRef(null);
  const mSmooth = useRef({ x: 0, y: 0 }), mTarget = useRef({ x: 0, y: 0 });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const onMove = (e) => { mTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2; mTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('mousemove', onMove, { passive: true });
    const tick = () => {
      const l = 0.045;
      mSmooth.current.x += (mTarget.current.x - mSmooth.current.x) * l;
      mSmooth.current.y += (mTarget.current.y - mSmooth.current.y) * l;
      const { x, y } = mSmooth.current;
      if (bgRef1.current) bgRef1.current.style.transform = `translate(${x * 20}px,${y * 20}px)`;
      if (bgRef2.current) bgRef2.current.style.transform = `translate(${x * -16}px,${y * -16}px)`;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId.current); };
  }, []);

  const sectionBg = isDark ? 'rgba(6,10,22,0.75)' : 'rgba(228,234,255,0.65)';

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', paddingTop: 64, background: 'transparent', color: 'var(--text-primary)' }}>
      <ParticleField isDark={isDark} />

      {/* Theme-aware hero gradient background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'var(--hero-gradient)' }} />

      {/* Parallax orbs — use CSS vars so they respond to theme */}
      <div ref={bgRef1} style={{ position: 'fixed', top: '-20%', left: '-15%', width: 800, height: 800, background: `radial-gradient(circle,${isDark ? 'rgba(59,97,245,0.14)' : 'rgba(59,97,245,0.08)'} 0%,transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, willChange: 'transform' }} />
      <div ref={bgRef2} style={{ position: 'fixed', bottom: '-10%', right: '-12%', width: 700, height: 700, background: `radial-gradient(circle,${isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)'} 0%,transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, willChange: 'transform' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══ HERO ═══ */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '84px 24px 44px' }}>
          <div style={{ textAlign: 'center', marginBottom: 74, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 820, height: 520, background: `radial-gradient(ellipse,${isDark ? 'rgba(59,97,245,0.16)' : 'rgba(59,97,245,0.07)'} 0%,transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />

            {isLoggedIn ? (
              <div className="hero-item" style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 22px', borderRadius: 999, background: isDark ? 'rgba(96,137,255,0.1)' : 'rgba(96,137,255,0.08)', border: '1px solid rgba(96,137,255,0.25)', fontSize: 12, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: '#6089ff', letterSpacing: '0.06em', backdropFilter: 'blur(12px)' }}>
                  <span style={{ display: 'inline-block', animation: 'waveHand 1.2s ease-in-out 2' }}>👋</span> {greeting}
                </span>
              </div>
            ) : (
              <div className="hero-item" style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 20px', borderRadius: 999, background: isDark ? 'rgba(96,137,255,0.09)' : 'rgba(96,137,255,0.07)', border: '1px solid rgba(96,137,255,0.22)', fontSize: 11, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: '#6089ff', letterSpacing: '0.06em', backdropFilter: 'blur(12px)' }}>
                  <Sparkles size={11} /> TRUSTED BY 12,000+ USERS WORLDWIDE
                </span>
              </div>
            )}

            <h1 className="hero-item hero-delay-1" style={{ fontSize: 'clamp(3rem,8vw,5.8rem)', fontFamily: 'Sora,sans-serif', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.01, margin: '0 auto 26px', maxWidth: 880, color: 'var(--text-primary)', position: 'relative', zIndex: 1 }}>
              {isLoggedIn ? (<>Welcome,{' '}<AnimatedName name={displayName} baseDelay={0.55} /></>) : (<>Finance at the{' '}<span style={{ background: 'linear-gradient(135deg,#6089ff 0%,#a78bfa 45%,#38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Speed of Light</span></>)}
            </h1>

            <p className="hero-item hero-delay-2" style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 52px', lineHeight: 1.78, position: 'relative', zIndex: 1 }}>
              {isLoggedIn ? 'Your dashboard is ready — cards, analytics, and rewards all in one place.' : 'Issue, manage, and control virtual credit cards with enterprise-grade security and real-time insights.'}
            </p>

            <div className="hero-item hero-delay-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              {isLoggedIn ? (
                <>
                  <button className="btn-primary" style={{ fontSize: 15, padding: '15px 32px', borderRadius: 14 }} onClick={() => navigate('/dashboard')}>Open Dashboard <ArrowRight size={16} /></button>
                  <button className="btn-secondary" style={{ fontSize: 15, padding: '15px 32px', borderRadius: 14 }} onClick={() => navigate('/pricing')}>View Plans</button>
                </>
              ) : (
                <>
                  <button className="btn-primary" style={{ fontSize: 15, padding: '15px 32px', borderRadius: 14 }} onClick={() => navigate('/register')}>Get Started Free <ArrowRight size={16} /></button>
                  <button className="btn-secondary" style={{ fontSize: 15, padding: '15px 32px', borderRadius: 14 }} onClick={() => navigate('/login')}>Sign In</button>
                </>
              )}
            </div>

            {!isLoggedIn && (
              <div className="hero-item hero-delay-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
                {['No credit card required', 'Free forever plan', '2-minute setup'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                    <CheckCircle size={13} color="#34d399" />{item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 360° Card hero */}
          <div className="hero-item hero-delay-4" style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 100 }}>
            {/* Ghost cards */}
            <div style={{ position: 'absolute', width: 320, height: 195, borderRadius: 20, background: isDark ? 'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(6,182,212,0.06))' : 'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(6,182,212,0.08))', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(96,137,255,0.1)'}`, transform: 'rotate(-8deg) translateY(20px) translateX(-36px)', backdropFilter: 'blur(8px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', width: 290, height: 178, borderRadius: 18, background: isDark ? 'linear-gradient(135deg,rgba(6,182,212,0.07),rgba(59,97,245,0.05))' : 'linear-gradient(135deg,rgba(6,182,212,0.09),rgba(59,97,245,0.07))', border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(59,97,245,0.09)'}`, transform: 'rotate(6deg) translateY(24px) translateX(32px)', backdropFilter: 'blur(6px)', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <HeroCard360 user={user} />
              <div style={{ position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Sora,sans-serif', fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                <RefreshCw size={10} /> Drag to rotate · Auto-spins 360°
              </div>
            </div>

            {/* Floating badges */}
            <div style={{ position: 'absolute', bottom: 18, right: 'calc(50% - 240px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '11px 18px', boxShadow: 'var(--shadow-float)', display: 'flex', alignItems: 'center', gap: 11, zIndex: 3, backdropFilter: 'blur(24px)', animation: 'floatAlt 5s ease-in-out infinite' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(52,211,153,0.2)' }}><CheckCircle size={17} color="#34d399" /></div>
              <div><div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)' }}>Transaction</div><div style={{ fontSize: 10, color: '#34d399', fontWeight: 600 }}>+$240.00 approved</div></div>
            </div>
            <div style={{ position: 'absolute', top: -8, left: 'calc(50% - 240px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '11px 18px', boxShadow: 'var(--shadow-float)', display: 'flex', alignItems: 'center', gap: 11, zIndex: 3, backdropFilter: 'blur(24px)', animation: 'float 4.5s ease-in-out infinite', animationDelay: '0.8s' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(96,137,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(96,137,255,0.2)' }}><Star size={17} color="#6089ff" fill="#6089ff" /></div>
              <div><div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)' }}>Rewards</div><div style={{ fontSize: 10, color: '#6089ff', fontWeight: 600 }}>+120 points earned</div></div>
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
          <Reveal>
            <CinemaCard style={{ padding: '42px 52px' }} glow="#6089ff">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 42 }}>
                {STATS.map(({ label, value, suffix, prefix, icon: Icon, color }, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ width: 54, height: 54, borderRadius: 16, margin: '0 auto 16px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${color}20` }}><Icon size={24} color={color} /></div>
                    <div style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 800, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}><AnimatedNumber target={value} suffix={suffix} prefix={prefix} /></div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </CinemaCard>
          </Reveal>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 110px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <SectionLabel isDark={isDark}>HOW IT WORKS</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.9rem,4vw,2.9rem)', margin: '0 auto 16px', maxWidth: 540, color: 'var(--text-primary)' }}>Up and running in minutes</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto', fontSize: 15 }}>Four simple steps from sign-up to your first transaction.</p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {STEPS.map(({ step, icon: Icon, color, title, desc }, i) => (
              <Reveal key={i} delay={i * 80}>
                <CinemaCard style={{ padding: '36px 28px', textAlign: 'center', height: '100%' }} glow={color}>
                  <div style={{ fontSize: 9, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: `${color}80`, letterSpacing: '0.16em', marginBottom: 20, textTransform: 'uppercase' }}>STEP {step}</div>
                  <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 24px', background: `${color}12`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 28px ${color}18` }}><Icon size={28} color={color} /></div>
                  <h3 style={{ fontSize: 15, margin: '0 0 10px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.72, margin: 0 }}>{desc}</p>
                </CinemaCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ CAPABILITIES ═══ */}
        <section style={{ padding: '100px 24px', background: sectionBg, backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <SectionLabel isDark={isDark}>PLATFORM CAPABILITIES</SectionLabel>
                <h2 style={{ fontSize: 'clamp(1.9rem,4vw,2.9rem)', margin: '0 auto 16px', maxWidth: 560, color: 'var(--text-primary)' }}>Built for the way you actually work</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', fontSize: 15 }}>Beyond basic card management — Credify is a complete financial operations platform.</p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
              {CAPABILITIES.map(({ icon: Icon, color, title, desc }, i) => (
                <Reveal key={i} delay={i * 60}>
                  <CinemaCard style={{ padding: '28px 30px', display: 'flex', gap: 18, alignItems: 'flex-start' }} glow={color}>
                    <div style={{ width: 50, height: 50, borderRadius: 15, flexShrink: 0, marginTop: 2, background: `${color}12`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 22px ${color}18` }}><Icon size={22} color={color} /></div>
                    <div><h3 style={{ fontSize: 15, margin: '0 0 8px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3><p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{desc}</p></div>
                  </CinemaCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECURITY ═══ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <Reveal>
              <div>
                <SectionLabel isDark={isDark}>ENTERPRISE SECURITY</SectionLabel>
                <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.7rem)', marginBottom: 20, color: 'var(--text-primary)' }}>Your security is our{' '}<span style={{ background: 'linear-gradient(135deg,#6089ff,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>top priority</span></h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.82, marginBottom: 40 }}>Every Credify account is protected by multiple layers of enterprise-grade security. We never compromise on protecting your financial data.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['SOC 2 Type II Compliant', 'End-to-end encrypted card data', 'Two-factor authentication support', 'Automatic fraud detection'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle size={13} color="#34d399" /></div>
                      <span style={{ fontSize: 14.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {SECURITY.map(({ icon: Icon, color, title, desc }, i) => (
                <Reveal key={i} delay={i * 70}>
                  <CinemaCard style={{ padding: '26px 24px' }} glow={color}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, marginBottom: 18, background: `${color}12`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${color}18` }}><Icon size={21} color={color} /></div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>{title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </CinemaCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section style={{ padding: '100px 24px', background: sectionBg, backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <SectionLabel isDark={isDark}>LOVED BY USERS</SectionLabel>
                <h2 style={{ fontSize: 'clamp(1.9rem,4vw,2.9rem)', margin: '0 auto', maxWidth: 480, color: 'var(--text-primary)' }}>What our users say</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
              {TESTIMONIALS.map(({ name, role, avatar, color, stars, text }, i) => (
                <Reveal key={i} delay={i * 100}>
                  <CinemaCard style={{ padding: '32px 30px' }} glow={color}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>{Array.from({ length: stars }).map((_, j) => <Star key={j} size={14} color="#fbbf24" fill="#fbbf24" />)}</div>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.78, margin: '0 0 24px', fontStyle: 'italic' }}>"{text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'Sora,sans-serif', flexShrink: 0, boxShadow: `0 6px 18px ${color}45` }}>{avatar}</div>
                      <div><div style={{ fontSize: 13.5, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)' }}>{name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{role}</div></div>
                    </div>
                  </CinemaCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 120px' }}>
          <Reveal>
            <CinemaCard style={{ padding: '90px 48px', textAlign: 'center', background: isDark ? 'linear-gradient(135deg,rgba(96,137,255,0.07),rgba(167,139,250,0.05) 50%,rgba(6,182,212,0.03))' : 'linear-gradient(135deg,rgba(96,137,255,0.05),rgba(167,139,250,0.04) 50%,rgba(6,182,212,0.02))' }} glow="#6089ff">
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 280, background: `radial-gradient(ellipse at top,${isDark ? 'rgba(96,137,255,0.2)' : 'rgba(96,137,255,0.11)'},transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(96,137,255,0.6),rgba(167,139,250,0.5),transparent)' }} />
              {!isLoggedIn && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, marginBottom: 24, background: isDark ? 'rgba(96,137,255,0.1)' : 'rgba(96,137,255,0.07)', border: '1px solid rgba(96,137,255,0.25)', fontSize: 11, fontWeight: 700, color: '#6089ff', fontFamily: 'Sora,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', position: 'relative' }}><Sparkles size={10} /> FREE TO START</div>
              )}
              <h2 style={{ fontSize: 'clamp(1.9rem,4vw,3rem)', marginBottom: 18, position: 'relative', color: 'var(--text-primary)' }}>{isLoggedIn ? 'Ready to manage your cards?' : 'Start for free today'}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.76, position: 'relative' }}>{isLoggedIn ? 'Head to your dashboard to issue new cards, track transactions, and redeem rewards.' : 'Join over 12,000 users who trust Credify to manage their virtual cards securely.'}</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                {isLoggedIn ? (
                  <button className="btn-primary" style={{ fontSize: 15, padding: '15px 36px', borderRadius: 14 }} onClick={() => navigate('/dashboard')}>Open Dashboard <ArrowRight size={16} /></button>
                ) : (
                  <>
                    <button className="btn-primary" style={{ fontSize: 15, padding: '15px 36px', borderRadius: 14 }} onClick={() => navigate('/register')}>Create Free Account <ArrowRight size={16} /></button>
                    <button className="btn-secondary" style={{ fontSize: 15, padding: '15px 30px', borderRadius: 14 }} onClick={() => navigate('/pricing')}>View Pricing</button>
                  </>
                )}
              </div>
            </CinemaCard>
          </Reveal>
        </section>

      </div>
    </div>
  );
};

export default Home;