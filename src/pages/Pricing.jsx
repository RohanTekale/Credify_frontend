// src/pages/Pricing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap } from 'lucide-react';

const PLANS = [
  {
    name:'Starter', price:'Free', period:'forever',
    desc:'Perfect for individuals getting started.',
    features:['1 virtual card','Basic transactions','Email support','KYC verification'],
    cta:'Get Started', highlight: false,
  },
  {
    name:'Pro', price:'₹499', period:'/ month',
    desc:'For power users who need more control.',
    features:['Unlimited virtual cards','Real-time analytics','Priority support','Rewards & cashback','Card freeze/unfreeze','Advanced billing'],
    cta:'Start Pro Trial', highlight: true,
  },
  {
    name:'Enterprise', price:'Custom', period:'',
    desc:'Tailored solutions for businesses at scale.',
    features:['Everything in Pro','Custom card limits','Dedicated account manager','API access','SLA guarantees','Compliance reporting'],
    cta:'Contact Sales', highlight: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ paddingTop:64 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-16 animate-fade-up">
          <p style={{ fontSize:12, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.1em', fontFamily:'Sora,sans-serif', marginBottom:10 }}>PRICING</p>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', marginBottom:16 }}>Simple, transparent pricing</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:420, margin:'0 auto' }}>
            No hidden fees, no surprises. Pay only for what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(({ name, price, period, desc, features, cta, highlight }, i) => (
            <div
              key={i}
              className={`animate-fade-up delay-${(i+1)*100}`}
              style={{
                borderRadius:20,
                padding: highlight ? '32px 28px' : '28px',
                background: highlight
                  ? 'linear-gradient(160deg, rgba(59,97,245,0.2) 0%, rgba(59,97,245,0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: highlight ? '1px solid rgba(59,97,245,0.4)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: highlight ? '0 8px 40px rgba(59,97,245,0.2)' : 'var(--shadow-card)',
                position:'relative',
              }}
            >
              {highlight && (
                <div style={{
                  position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                  background:'linear-gradient(135deg,#3b61f5,#8b5cf6)',
                  borderRadius:999, padding:'4px 14px',
                  fontSize:11, fontWeight:700, fontFamily:'Sora,sans-serif',
                  color:'#fff', letterSpacing:'0.06em', whiteSpace:'nowrap',
                }}>
                  <Zap size={10} style={{ display:'inline', marginRight:4 }} />
                  MOST POPULAR
                </div>
              )}

              <p style={{ fontSize:13, fontWeight:600, color:highlight?'var(--brand-400)':'var(--text-muted)', fontFamily:'Sora,sans-serif', letterSpacing:'0.06em', marginBottom:8 }}>
                {name.toUpperCase()}
              </p>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:8 }}>
                <span style={{ fontSize:36, fontWeight:800, fontFamily:'Sora,sans-serif', letterSpacing:'-0.03em' }}>{price}</span>
                <span style={{ fontSize:14, color:'var(--text-muted)' }}>{period}</span>
              </div>
              <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:24, lineHeight:1.6 }}>{desc}</p>

              <hr className="divider" style={{ marginBottom:24 }} />

              <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px', display:'flex', flexDirection:'column', gap:10 }}>
                {features.map((f, j) => (
                  <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:'var(--text-secondary)' }}>
                    <Check size={14} color="#10b981" style={{ flexShrink:0, marginTop:2 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}
                style={{ fontSize:14 }}
                onClick={() => navigate(name === 'Enterprise' ? '/faq' : '/register')}
              >
                {cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
