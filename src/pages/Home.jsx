// src/pages/Home.jsx
// Premium redesign:
// - Personalized animated welcome for logged-in users (name + greeting + wave)
// - Light theme default, dark mode toggle
// - No repeated features section (replaced with How It Works, Security Trust, Testimonials, CTA)
// - Stats bar with animated counters
// - Hero with illustrated card mockup + floating badges
// - Premium aesthetic throughout

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, TrendingUp, Users, CreditCard,
  CheckCircle, Star, Lock, Globe, Clock, Award,
  Sparkles, ChevronRight, BarChart3, Smartphone, RefreshCw,
  HeartHandshake
} from 'lucide-react';
import useAuthStore from '../store/authStore';

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
          if (current >= numeric) {
            setDisplay(numeric);
            clearInterval(timer);
          } else {
            setDisplay(Math.floor(current * 10) / 10);
          }
        }, duration / steps);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const formatted = Number.isInteger(Number(display)) ? display : display.toFixed(1);
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
};

/* ── Welcome Banner (logged in) ───────────────────────────────────────────── */
const WelcomeBanner = ({ user }) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.first_name || user?.username || 'there';

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`animate-welcome-in`}
      style={{
        margin: '0 auto 40px',
        maxWidth: 860,
        padding: '28px 36px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(59,97,245,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.05) 100%)',
        border: '1px solid rgba(59,97,245,0.15)',
        boxShadow: '0 8px 32px rgba(59,97,245,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(59,97,245,0.5), rgba(139,92,246,0.5), transparent)',
        borderRadius: '20px 20px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b61f5, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#fff',
          fontFamily: 'Sora, sans-serif',
          boxShadow: '0 4px 16px rgba(59,97,245,0.35)',
        }}>
          {displayName.slice(0, 1).toUpperCase()}
        </div>

        <div>
          <div style={{
            fontSize: 13, color: 'var(--brand-400)', fontWeight: 600,
            fontFamily: 'Sora, sans-serif', letterSpacing: '0.04em',
            marginBottom: 3,
          }}>
            <span className="animate-wave" style={{ marginRight: 6 }}>👋</span>
            {greeting}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
              fontFamily: 'Sora, sans-serif', fontWeight: 800,
              color: 'var(--text-primary)', letterSpacing: '-0.02em',
            }}>
              Welcome back,{' '}
            </span>
            <span
              className="animate-welcome-name delay-200"
              style={{
                fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #3b61f5, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {displayName}!
            </span>
          </div>
          <p style={{
            margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5,
          }}>
            Your dashboard is ready. You have full control of your virtual cards.
          </p>
        </div>
      </div>

      {/* Quick action */}
      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary"
        style={{ flexShrink: 0, gap: 8, fontSize: 14, padding: '12px 22px' }}
      >
        <BarChart3 size={15} />
        Open Dashboard
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

/* ── How It Works ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    step: '01',
    icon: Users,
    color: '#3b61f5',
    title: 'Create Your Account',
    desc: 'Sign up in seconds. Complete a quick KYC verification to unlock full card management capabilities.',
  },
  {
    step: '02',
    icon: CreditCard,
    color: '#8b5cf6',
    title: 'Issue Virtual Cards',
    desc: 'Generate virtual credit cards instantly. Set custom limits, names, and expiry dates for each card.',
  },
  {
    step: '03',
    icon: Zap,
    color: '#06b6d4',
    title: 'Transact & Track',
    desc: 'Use your cards anywhere. Every transaction is tracked in real-time with detailed analytics.',
  },
  {
    step: '04',
    icon: TrendingUp,
    color: '#10b981',
    title: 'Earn & Redeem Rewards',
    desc: 'Accumulate points on every purchase. Redeem them for benefits, cashback, and exclusive perks.',
  },
];

/* ── Security Pillars ─────────────────────────────────────────────────────── */
const SECURITY = [
  { icon: Shield,    color: '#3b61f5', title: 'Bank-Grade Encryption', desc: '256-bit AES encryption for all data at rest and in transit.' },
  { icon: Lock,      color: '#8b5cf6', title: 'JWT Authentication',     desc: 'Stateless, secure token-based auth with refresh rotation.' },
  { icon: Globe,     color: '#06b6d4', title: 'Global Compliance',       desc: 'KYC-compliant identity verification built into every account.' },
  { icon: Clock,     color: '#f59e0b', title: '99.9% Uptime SLA',        desc: 'High-availability infrastructure with redundant failover.' },
];

/* ── Testimonials ─────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Freelance Designer',
    avatar: 'S',
    color: '#ec4899',
    stars: 5,
    text: 'Credify changed how I manage client subscriptions. Virtual cards per project means zero budget bleed.',
  },
  {
    name: 'Rohan K.',
    role: 'Startup Founder',
    avatar: 'R',
    color: '#3b61f5',
    stars: 5,
    text: 'The rewards system genuinely adds up. I redeemed for benefits worth ₹4,000 last month alone.',
  },
  {
    name: 'Priya T.',
    role: 'Finance Manager',
    avatar: 'P',
    color: '#8b5cf6',
    stars: 5,
    text: 'The admin dashboard is exceptional. Real-time transaction visibility with zero complexity.',
  },
];

/* ── Stats ────────────────────────────────────────────────────────────────── */
const STATS = [
  { label: 'Active Users',            value: '12K', suffix: '+',  icon: Users,      color: '#3b61f5' },
  { label: 'Transactions Processed',  value: '2.4', suffix: 'M+', prefix: '$', icon: TrendingUp,  color: '#8b5cf6' },
  { label: 'Cards Issued',            value: '38K', suffix: '+',  icon: CreditCard, color: '#06b6d4' },
  { label: 'Uptime Guaranteed',       value: '99.9',suffix: '%',  icon: Zap,        color: '#10b981' },
];

/* ── App Capabilities (replaces duplicate Features section) ──────────────── */
const CAPABILITIES = [
  {
    icon: Smartphone,
    color: '#3b61f5',
    title: 'Mobile-First Design',
    desc: 'Fully responsive interface optimised for desktop, tablet, and mobile — manage cards from anywhere.',
  },
  {
    icon: RefreshCw,
    color: '#8b5cf6',
    title: 'Real-Time Sync',
    desc: 'Transaction data and card status sync instantly across all sessions — no refresh needed.',
  },
  {
    icon: BarChart3,
    color: '#06b6d4',
    title: 'Spending Analytics',
    desc: 'Visual spending breakdowns by category, time period, and card — actionable insights at a glance.',
  },
  {
    icon: Award,
    color: '#f59e0b',
    title: 'Tiered Rewards',
    desc: 'Earn 1–3× points based on spend categories. Unlock Silver, Gold, Platinum status automatically.',
  },
  {
    icon: HeartHandshake,
    color: '#10b981',
    title: 'Dedicated Support',
    desc: 'In-app chatbot available 24/7. Priority email support for Pro members with <2h response time.',
  },
  {
    icon: Globe,
    color: '#ec4899',
    title: 'Multi-Currency Ready',
    desc: 'Cards work globally. Automatic FX rate display at the moment of each transaction.',
  },
];


/* ══════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const isLoggedIn = !!token;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', paddingTop: 64 }}>

      {/* ── Ambient background ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '-15%', left: '-10%', width: 600, height: 600,
        background: `radial-gradient(circle, var(--glow-1) 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '5%', right: '-8%', width: 500, height: 500,
        background: `radial-gradient(circle, var(--glow-2) 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Logged-in Welcome */}
          {isLoggedIn && user && <WelcomeBanner user={user} />}

          {/* Hero Content */}
          <div style={{ textAlign: 'center' }}>

            {/* Trust badge */}
            <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 18px', borderRadius: 999,
                background: 'rgba(59,97,245,0.08)',
                border: '1px solid rgba(59,97,245,0.2)',
                fontSize: 12, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                color: 'var(--brand-400)', letterSpacing: '0.04em',
              }}>
                <Sparkles size={11} />
                TRUSTED BY 12,000+ USERS WORLDWIDE
              </span>
            </div>

            <h1
              className="animate-fade-up delay-100"
              style={{
                fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
                maxWidth: 820, margin: '0 auto 20px',
                fontFamily: 'Sora, sans-serif', fontWeight: 800,
                letterSpacing: '-0.03em', lineHeight: 1.1,
              }}
            >
              {isLoggedIn
                ? <>Your <span className="gradient-text">Smart Card</span> Hub</>
                : <>The Modern <span className="gradient-text">Virtual Card</span> Platform</>
              }
            </h1>

            <p
              className="animate-fade-up delay-200"
              style={{
                fontSize: 18, color: 'var(--text-secondary)',
                maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7,
              }}
            >
              {isLoggedIn
                ? 'Issue cards, track spending, earn rewards — everything in one intelligent dashboard.'
                : 'Issue, manage, and control virtual credit cards with enterprise-grade security and real-time insights — all in one place.'
              }
            </p>

            <div
              className="animate-fade-up delay-300"
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
            >
              {isLoggedIn ? (
                <>
                  <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/dashboard')}>
                    Go to Dashboard <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/pricing')}>
                    View Plans
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/register')}>
                    Get Started Free <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Hero Card Visual */}
            <div className="animate-fade-up delay-400" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>

              {/* Background card (tilted) */}
              <div style={{
                position: 'absolute',
                width: 300, height: 178, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(6,182,212,0.2) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                transform: 'rotate(-6deg) translateY(8px) translateX(-20px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              }} />

              {/* Main card */}
              <div
                className="animate-float"
                style={{
                  width: 340, height: 200, borderRadius: 20,
                  background: 'linear-gradient(135deg, #1a1f3c 0%, #0f1420 100%)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(59,97,245,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                  padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative', overflow: 'hidden', zIndex: 2,
                }}
              >
                {/* Shine */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
                  borderRadius: 20,
                }} />
                {/* Chip */}
                <div style={{
                  position: 'absolute', top: 22, left: 24,
                  width: 32, height: 24, borderRadius: 5,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
                }} />
                {/* Network circles */}
                <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,97,245,0.4)', border: '1px solid rgba(59,97,245,0.6)' }} />
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,200,50,0.3)', border: '1px solid rgba(255,200,50,0.5)', marginLeft: -14 }} />
                </div>

                <div style={{ marginTop: 28 }}>
                  <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>CREDIFY VIRTUAL</div>
                  <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.18em', marginBottom: 16 }}>
                    4829 •••• •••• 7234
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Card Holder</div>
                      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Your Name'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Expires</div>
                      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>12/28</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div
                className="animate-float-alt"
                style={{
                  position: 'absolute', bottom: 12, right: 'calc(50% - 230px)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)' }}>Transaction</div>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>+$240.00 approved</div>
                </div>
              </div>

              <div
                className="animate-float"
                style={{
                  position: 'absolute', top: 0, left: 'calc(50% - 230px)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', gap: 8, zIndex: 3,
                  backdropFilter: 'blur(12px)',
                  animationDelay: '1s',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,97,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={16} color="#3b61f5" fill="#3b61f5" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)' }}>Rewards</div>
                  <div style={{ fontSize: 10, color: 'var(--brand-400)', fontWeight: 600 }}>+120 points earned</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ STATS BAR ══════════════════════════════════════════════════ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
          <div className="glass-card" style={{ padding: '28px 36px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24,
            }}>
              {STATS.map(({ label, value, suffix, prefix, icon: Icon, color }, i) => (
                <div
                  key={i}
                  className={`animate-fade-up delay-${(i + 1) * 100}`}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, margin: '0 auto 10px',
                    background: `${color}15`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{
                    fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800,
                    fontFamily: 'Sora,sans-serif', letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                  }}>
                    <AnimatedNumber target={value} suffix={suffix} prefix={prefix} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ═══════════════════════════════════════════════ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
          <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-400)', letterSpacing: '0.12em', fontFamily: 'Sora,sans-serif', marginBottom: 10, textTransform: 'uppercase' }}>
              HOW IT WORKS
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', margin: '0 auto 14px', maxWidth: 520 }}>
              Up and running in minutes
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto', fontSize: 15 }}>
              Four simple steps from sign-up to your first transaction.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            position: 'relative',
          }}>
            {STEPS.map(({ step, icon: Icon, color, title, desc }, i) => (
              <div
                key={i}
                className={`glass-card animate-fade-up delay-${(i + 1) * 100}`}
                style={{ padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'visible' }}
              >
                {/* Step connector */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 44, right: -12,
                    width: 24, height: 2,
                    background: `linear-gradient(90deg, ${color}40, transparent)`,
                    zIndex: 10,
                    display: window.innerWidth < 768 ? 'none' : 'block',
                  }} />
                )}

                <div style={{
                  fontSize: 11, fontWeight: 800, fontFamily: 'Sora,sans-serif',
                  color: `${color}80`, letterSpacing: '0.1em', marginBottom: 16,
                }}>
                  STEP {step}
                </div>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
                  background: `${color}12`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 10, fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CAPABILITIES (new - not repeating Features page) ══════════ */}
        <section style={{
          padding: '80px 24px',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-400)', letterSpacing: '0.12em', fontFamily: 'Sora,sans-serif', marginBottom: 10, textTransform: 'uppercase' }}>
                PLATFORM CAPABILITIES
              </p>
              <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', margin: '0 auto 14px', maxWidth: 560 }}>
                Built for the way you actually work
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', fontSize: 15 }}>
                Beyond basic card management — Credify is a complete financial operations platform.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {CAPABILITIES.map(({ icon: Icon, color, title, desc }, i) => (
                <div
                  key={i}
                  className={`glass-card animate-fade-up delay-${(i % 6 + 1) * 100}`}
                  style={{ padding: '24px 26px', display: 'flex', gap: 18, alignItems: 'flex-start' }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0, marginTop: 2,
                    background: `${color}12`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 6, fontWeight: 700, margin: '0 0 6px' }}>{title}</h3>
                    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SECURITY TRUST ════════════════════════════════════════════ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            {/* Left: security content */}
            <div className="animate-fade-up">
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-400)', letterSpacing: '0.12em', fontFamily: 'Sora,sans-serif', marginBottom: 10, textTransform: 'uppercase' }}>
                ENTERPRISE SECURITY
              </p>
              <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.5rem)', marginBottom: 16 }}>
                Your security is our{' '}
                <span className="gradient-text">top priority</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Every Credify account is protected by multiple layers of enterprise-grade security.
                We never compromise on protecting your financial data.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['SOC 2 Type II Compliant', 'End-to-end encrypted card data', 'Two-factor authentication support', 'Automatic fraud detection'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: security pillars grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {SECURITY.map(({ icon: Icon, color, title, desc }, i) => (
                <div
                  key={i}
                  className={`glass-card animate-fade-up delay-${(i + 1) * 100}`}
                  style={{ padding: '22px 20px' }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                    background: `${color}12`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
        <section style={{
          padding: '80px 24px',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-400)', letterSpacing: '0.12em', fontFamily: 'Sora,sans-serif', marginBottom: 10, textTransform: 'uppercase' }}>
                LOVED BY USERS
              </p>
              <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', margin: '0 auto', maxWidth: 480 }}>
                What our users say
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {TESTIMONIALS.map(({ name, role, avatar, color, stars, text }, i) => (
                <div
                  key={i}
                  className={`glass-card animate-fade-up delay-${(i + 1) * 100}`}
                  style={{ padding: '28px 26px' }}
                >
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} size={13} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>
                    "{text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${color}, ${color}99)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Sora,sans-serif',
                      flexShrink: 0,
                    }}>
                      {avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)' }}>{name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <div
            className="glass-card animate-fade-up"
            style={{
              padding: '72px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(59,97,245,0.06) 0%, rgba(139,92,246,0.04) 50%, rgba(6,182,212,0.03) 100%)',
            }}
          >
            {/* Top glow */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 400, height: 200,
              background: 'radial-gradient(ellipse at top, rgba(59,97,245,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(59,97,245,0.5), rgba(139,92,246,0.5), transparent)',
              borderRadius: 2,
            }} />

            {!isLoggedIn && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999, marginBottom: 20,
                background: 'rgba(59,97,245,0.08)',
                border: '1px solid rgba(59,97,245,0.2)',
                fontSize: 11, fontWeight: 700, color: 'var(--brand-400)',
                fontFamily: 'Sora,sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                <Sparkles size={10} /> FREE TO START
              </div>
            )}

            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: 14, position: 'relative' }}>
              {isLoggedIn ? 'Ready to manage your cards?' : 'Start for free today'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7, position: 'relative' }}>
              {isLoggedIn
                ? 'Head to your dashboard to issue new cards, track transactions, and redeem rewards.'
                : 'Join over 12,000 users who trust Credify to manage their virtual cards securely.'
              }
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              {isLoggedIn ? (
                <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => navigate('/dashboard')}>
                  Open Dashboard <ArrowRight size={16} />
                </button>
              ) : (
                <>
                  <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => navigate('/register')}>
                    Create Free Account <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/pricing')}>
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
