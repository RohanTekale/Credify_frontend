// src/pages/Pricing.jsx — Credify finance-ops pricing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap, MessageSquare } from 'lucide-react';
import { PLANS } from '../content/credifyStory';

const Pricing = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight:'calc(100vh - 64px)' }}>
      {/* Hero */}
      <div style={{ padding:'clamp(60px,10vh,100px) 24px 0', textAlign:'center', maxWidth:640, margin:'0 auto' }}>
        <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3b61f5',fontFamily:"'Sora',sans-serif" }}>PRICING</span>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>
          Priced for finance teams, not developers.
        </h1>
        <p style={{ fontSize:16,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:16 }}>
          All plans include approvals, reconciliation, webhook handling, and the ops dashboard. You pay for volume and team size.
        </p>
        <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:8,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',marginBottom:64 }}>
          <div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981' }} />
          <span style={{ fontSize:12,fontWeight:600,color:'#10b981' }}>14-day free trial — no credit card required</span>
        </div>
      </div>

      {/* Plans */}
      <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 24px 80px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20,alignItems:'start' }}>
        {PLANS.map(({ name, price, period, desc, features, cta, highlight }, i) => (
          <div
            key={name}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{
              borderRadius:20,
              padding: highlight ? '32px 28px' : '28px',
              background: highlight
                ? 'linear-gradient(160deg,rgba(59,97,245,0.12) 0%,rgba(59,97,245,0.04) 100%)'
                : 'var(--bg-card)',
              border: highlight ? '1px solid rgba(59,97,245,0.3)' : '1px solid var(--border)',
              boxShadow: highlight
                ? '0 8px 40px rgba(59,97,245,0.18)'
                : hovered===i ? '0 20px 40px rgba(0,0,0,0.1)' : 'var(--shadow-card)',
              position:'relative',
              transition:'all 0.3s var(--ease-spring)',
              transform: highlight && hovered===i ? 'translateY(-4px)' : 'none',
            }}
          >
            {highlight && (
              <div style={{ position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#3b61f5,#8b5cf6)',borderRadius:999,padding:'4px 14px',fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'#fff',letterSpacing:'0.06em',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:5 }}>
                <Zap size={10} /> MOST POPULAR
              </div>
            )}

            <p style={{ fontSize:12,fontWeight:700,color:highlight?'#3b61f5':'var(--text-muted)',fontFamily:"'Sora',sans-serif",letterSpacing:'0.06em',marginBottom:8 }}>{name.toUpperCase()}</p>
            <div style={{ display:'flex',alignItems:'baseline',gap:4,marginBottom:8 }}>
              <span style={{ fontSize:38,fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.04em' }}>{price}</span>
              {period && <span style={{ fontSize:14,color:'var(--text-muted)' }}>{period}</span>}
            </div>
            <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:24,lineHeight:1.6 }}>{desc}</p>

            <button
              className={highlight ? 'btn-primary' : ''}
              onClick={() => name === 'Enterprise' ? navigate('/faq') : navigate('/register')}
              style={highlight ? { width:'100%',justifyContent:'center',marginBottom:28,display:'flex',alignItems:'center',gap:8 } : {
                width:'100%',padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'transparent',color:'var(--text-secondary)',cursor:'pointer',fontWeight:600,fontSize:14,fontFamily:"'DM Sans',sans-serif",marginBottom:28,display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all 0.2s',
              }}
              onMouseEnter={e=>{if(!highlight){e.currentTarget.style.borderColor='#3b61f5';e.currentTarget.style.color='#3b61f5';}}}
              onMouseLeave={e=>{if(!highlight){e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}}
            >
              {cta} <ArrowRight size={14} />
            </button>

            <div style={{ borderTop:'1px solid var(--border)',paddingTop:24,display:'flex',flexDirection:'column',gap:10 }}>
              {features.map((f,fi) => (
                <div key={fi} style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                  <Check size={14} color={highlight?'#3b61f5':'#10b981'} style={{ marginTop:2,flexShrink:0 }} />
                  <span style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ strip */}
      <div style={{ maxWidth:740,margin:'0 auto',padding:'0 24px 100px',textAlign:'center' }}>
        <div style={{ padding:'32px',borderRadius:20,background:'var(--bg-subtle)',border:'1px solid var(--border)' }}>
          <MessageSquare size={24} color="#3b61f5" style={{ marginBottom:12 }} />
          <h3 style={{ fontSize:20,fontWeight:700,marginBottom:8,fontFamily:"'Sora',sans-serif" }}>Questions about pricing?</h3>
          <p style={{ fontSize:14,color:'var(--text-secondary)',marginBottom:20,lineHeight:1.65 }}>
            We're happy to walk you through which plan fits your payment volume and team size. Most mid-size companies start on Scale.
          </p>
          <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/faq')} style={{ fontSize:14,padding:'10px 22px' }}>See FAQ</button>
            <button onClick={() => navigate('/register')} style={{ fontSize:14,padding:'10px 22px',borderRadius:10,border:'1px solid var(--border)',background:'transparent',color:'var(--text-secondary)',cursor:'pointer',fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>Start free trial</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
