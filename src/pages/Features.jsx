// src/pages/Features.jsx
import React from 'react';
import { Shield, CreditCard, Zap, Bell, Gift, Receipt, Lock, BarChart3, RefreshCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: CreditCard, title:'Virtual Card Management', desc:'Create and manage virtual credit cards instantly. Set limits, names, and expiry per card.', color:'#3b61f5', tag:'Core' },
  { icon: Lock, title:'Secure Transactions', desc:'AES-256 encryption on all data. Every transaction is validated, logged, and auditable.', color:'#10b981', tag:'Security' },
  { icon: BarChart3, title:'Real-Time Analytics', desc:'Track spending patterns with beautiful charts and category breakdowns.', color:'#8b5cf6', tag:'Insights' },
  { icon: RefreshCcw, title:'Freeze & Unfreeze', desc:'Control your card status in under a second. No calls, no waiting.', color:'#f59e0b', tag:'Control' },
  { icon: Gift, title:'Rewards System', desc:'Earn cashback points on every swipe. Redeem for travel, shopping, and more.', color:'#ec4899', tag:'Perks' },
  { icon: Bell, title:'Smart Notifications', desc:'Email and push alerts for every transaction, due date, and unusual activity.', color:'#06b6d4', tag:'Alerts' },
  { icon: Receipt, title:'Auto Billing', desc:'Automated monthly billing cycles with flexible payment options.', color:'#f97316', tag:'Billing' },
  { icon: Shield, title:'KYC Verification', desc:'Document-based identity verification that meets regulatory standards.', color:'#6366f1', tag:'Compliance' },
];

const Features = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ paddingTop:64 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-16 animate-fade-up">
          <p style={{ fontSize:12, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.1em', fontFamily:'Sora,sans-serif', marginBottom:10 }}>PLATFORM FEATURES</p>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', marginBottom:16 }}>
            Built for modern{' '}<span className="gradient-text">fintech</span>
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:480, margin:'0 auto' }}>
            Every feature designed to give you complete control, visibility, and security over your virtual cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, tag }, i) => (
            <div key={i} className={`glass-card animate-fade-up delay-${(i % 8 + 1) * 100}`} style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} color={color} />
                </div>
                <span className="badge badge-info" style={{ fontSize:9, padding:'2px 7px' }}>{tag}</span>
              </div>
              <h3 style={{ fontSize:15, marginBottom:8, fontWeight:700 }}>{title}</h3>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.65, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 animate-fade-up">
          <button className="btn-primary" style={{ fontSize:15, padding:'14px 28px' }} onClick={() => navigate('/register')}>
            Start Free <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Features;
