// src/pages/FAQ.jsx — Credify finance-ops FAQ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../content/credifyStory';

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map(f => f.category)))];

const FAQ = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [cat, setCat] = useState('All');

  const filtered = cat === 'All' ? FAQS : FAQS.filter(f => f.category === cat);

  return (
    <div style={{ minHeight:'calc(100vh - 64px)' }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'clamp(60px,10vh,100px) 24px 80px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3b61f5',fontFamily:"'Sora',sans-serif" }}>FAQ</span>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)',fontWeight:800,marginTop:12,marginBottom:14,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>
            Questions about Credify
          </h1>
          <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.65 }}>
            Can't find what you need?{' '}
            <button onClick={() => navigate('/register')} style={{ color:'#3b61f5',fontWeight:600,background:'none',border:'none',cursor:'pointer',padding:0,fontSize:15 }}>
              Talk to us
            </button>
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:40 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCat(c); setOpen(null); }} style={{
              padding:'6px 16px', borderRadius:999,
              background: cat===c ? '#3b61f5' : 'transparent',
              border: cat===c ? '1px solid #3b61f5' : '1px solid var(--border)',
              color: cat===c ? '#fff' : 'var(--text-secondary)',
              fontSize:12, fontWeight:600, cursor:'pointer',
              transition:'all 0.2s ease', fontFamily:"'Sora',sans-serif",
            }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {filtered.map(({ q, a, category }, i) => (
            <div
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              style={{ borderRadius:14, border:`1px solid ${open===i?'rgba(59,97,245,0.25)':'var(--border)'}`, background: open===i?'rgba(59,97,245,0.04)':'var(--bg-card)', overflow:'hidden', cursor:'pointer', transition:'all 0.2s ease' }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', gap:16 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:10,fontWeight:700,color:'#3b61f5',letterSpacing:'0.07em',fontFamily:"'Sora',sans-serif",display:'block',marginBottom:4 }}>{category}</span>
                  <span style={{ fontSize:15,fontWeight:600,color:'var(--text-primary)',lineHeight:1.4 }}>{q}</span>
                </div>
                <ChevronDown size={18} color="var(--text-muted)" style={{ flexShrink:0,transition:'transform 250ms ease',transform:open===i?'rotate(180deg)':'rotate(0deg)' }} />
              </div>
              <div style={{ maxHeight: open===i ? 400 : 0, overflow:'hidden', transition:'max-height 300ms ease' }}>
                <p style={{ padding:'0 22px 20px', fontSize:14, color:'var(--text-secondary)', lineHeight:1.75, margin:0 }}>{a}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:64 }}>
          <div style={{ padding:'32px', borderRadius:20, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
            <p style={{ fontSize:17,fontWeight:700,marginBottom:8,fontFamily:"'Sora',sans-serif" }}>Ready to get started?</p>
            <p style={{ fontSize:14,color:'var(--text-secondary)',marginBottom:20 }}>Most finance teams are live in under a day.</p>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize:14,padding:'12px 24px',display:'inline-flex',alignItems:'center',gap:8 }}>
              Start free trial <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
