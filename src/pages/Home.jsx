// src/pages/Home.jsx
// WHY: Removed duplicate BackgroundParticles (App already renders it)
// WHY: Added staggered animations (delay-N) for visual rhythm
// WHY: Feature cards now use glass-card class for consistent hover interactions
// WHY: Added icon per feature card for instant scanability
// WHY: Added a stats bar (social proof) — critical for fintech trust
// WHY: Clear visual hierarchy: badge → headline → subhead → CTA
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CreditCard, Zap, Bell, Gift, Receipt,
  ArrowRight, Lock, TrendingUp, Users
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield, title: 'Secure User Management',
    desc: 'Register and verify your identity with KYC uploads, powered by secure JWT authentication and profile management.',
    color: '#10b981',
  },
  {
    icon: CreditCard, title: 'Virtual Card Control',
    desc: 'Issue virtual cards with random 16-digit numbers, set credit limits, and easily freeze, unfreeze, or block cards.',
    color: '#3b61f5',
  },
  {
    icon: Zap, title: 'Smart Transactions',
    desc: 'Simulate purchases, validate against credit limits, and process refunds with real-time transaction tracking.',
    color: '#f59e0b',
  },
  {
    icon: Receipt, title: 'Billing & Payments',
    desc: 'Generate monthly bills, make full or partial payments, and track payment history and outstanding balances.',
    color: '#8b5cf6',
  },
  {
    icon: Gift, title: 'Rewards System',
    desc: 'Earn points on every transaction and redeem them for exclusive benefits, enhancing your financial experience.',
    color: '#ec4899',
  },
  {
    icon: Bell, title: 'Instant Notifications',
    desc: 'Stay informed with email alerts for transactions, payment due reminders, and an in-app notification log.',
    color: '#06b6d4',
  },
];

const STATS = [
  { label: 'Active Users', value: '12K+', icon: Users },
  { label: 'Transactions Processed', value: '$2.4M', icon: TrendingUp },
  { label: 'Cards Issued', value: '38K+', icon: CreditCard },
  { label: 'Uptime', value: '99.9%', icon: Zap },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-64px)]" style={{ paddingTop: 64 }}>

      {/* Ambient glow orbs */}
      <div style={{
        position:'fixed', top:'-10%', left:'-5%', width:500, height:500,
        background:'radial-gradient(circle, rgba(59,97,245,0.12) 0%, transparent 70%)',
        borderRadius:'50%', pointerEvents:'none', zIndex:0,
      }} />
      <div style={{
        position:'fixed', bottom:'10%', right:'-5%', width:400, height:400,
        background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        borderRadius:'50%', pointerEvents:'none', zIndex:0,
      }} />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
          {/* Trust badge */}
          <div className="animate-fade-up flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background: 'rgba(59,97,245,0.12)',
                border: '1px solid rgba(59,97,245,0.25)',
                fontSize: 12, fontWeight: 600,
                color: 'var(--brand-400)',
                fontFamily: 'Sora, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              <Lock size={11} />
              BANK-GRADE SECURITY · TRUSTED BY 12K+ USERS
            </span>
          </div>

          <h1
            className="animate-fade-up delay-100"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', maxWidth: 780, margin: '0 auto 20px' }}
          >
            The Modern{' '}
            <span className="gradient-text">Virtual Card</span>
            {' '}Platform
          </h1>

          <p className="animate-fade-up delay-200" style={{
            fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520,
            margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            Issue, manage, and control virtual credit cards with enterprise-grade security
            and real-time insights — all in one dashboard.
          </p>

          <div className="animate-fade-up delay-300 flex items-center justify-center gap-3 flex-wrap">
            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/register')}>
              Get Started Free <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => navigate('/features')}>
              See Features
            </button>
          </div>

          {/* Floating card visual */}
          <div className="animate-fade-up delay-400 flex justify-center mt-16">
            <div
              className="animate-float"
              style={{
                width: 340, height: 200, borderRadius: 20,
                background: 'linear-gradient(135deg, #1a1f3c 0%, #0f1420 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,97,245,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                padding: 28, display:'flex', flexDirection:'column', justifyContent:'space-between',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Card shine */}
              <div style={{
                position:'absolute', top:0, left:0, right:0, bottom:0,
                background:'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)',
                borderRadius: 20,
              }} />
              {/* Brand mark */}
              <div style={{ position:'absolute', top:24, right:24, width:40, height:40, borderRadius:'50%', background:'rgba(59,97,245,0.3)', border:'2px solid rgba(59,97,245,0.5)' }} />
              <div style={{ position:'absolute', top:24, right:44, width:40, height:40, borderRadius:'50%', background:'rgba(255,200,50,0.25)', border:'2px solid rgba(255,200,50,0.4)' }} />

              <div style={{ fontFamily:'Sora,sans-serif', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.5)', letterSpacing:'0.08em' }}>CREDIFY VIRTUAL</div>
              <div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:15, color:'rgba(255,255,255,0.8)', letterSpacing:'0.2em', marginBottom:12 }}>
                  4829 •••• •••• 7234
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Card Holder</div>
                    <div style={{ fontFamily:'Sora,sans-serif', fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>John Doe</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Expires</div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color:'rgba(255,255,255,0.8)' }}>12/28</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
          <div className="glass-card" style={{ padding: '20px 32px' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map(({ label, value, icon: Icon }, i) => (
                <div key={i} className={`animate-fade-up delay-${(i+1)*100} text-center`}>
                  <div style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, fontFamily: 'Sora,sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <div className="text-center mb-14 animate-fade-up">
            <p style={{ fontSize: 12, fontWeight: 600, color:'var(--brand-400)', letterSpacing:'0.1em', fontFamily:'Sora,sans-serif', marginBottom:10 }}>
              WHY CREDIFY
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', margin:'0 auto 14px', maxWidth: 500 }}>
              Everything you need to manage cards
            </h2>
            <p style={{ color:'var(--text-secondary)', maxWidth:440, margin:'0 auto', fontSize:15 }}>
              Built for individuals and teams who need reliable, secure virtual card infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={i}
                className={`glass-card animate-fade-up delay-${(i % 6 + 1) * 100}`}
                style={{ padding: 28 }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 18,
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8, fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: 14, color:'var(--text-secondary)', lineHeight:1.65, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <div className="glass-card text-center animate-fade-up" style={{ padding: '64px 32px' }}>
            <div style={{
              position:'absolute', inset:0, borderRadius:16,
              background:'radial-gradient(ellipse at 50% 0%, rgba(59,97,245,0.12) 0%, transparent 60%)',
              pointerEvents:'none',
            }} />
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', marginBottom:14 }}>
              Ready to get started?
            </h2>
            <p style={{ color:'var(--text-secondary)', fontSize:16, marginBottom:32, maxWidth:400, margin:'0 auto 32px' }}>
              Join thousands of users managing their virtual cards with Credify.
            </p>
            <button className="btn-primary" style={{ fontSize:15, padding:'14px 32px' }} onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
