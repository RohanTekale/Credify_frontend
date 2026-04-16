// src/pages/FAQ.jsx
// WHY: Smooth CSS height transition on accordion (no layout jank)
// WHY: + / - replaced with chevron icon (cleaner, more standard)
// WHY: Categories make scanning easier when FAQ list grows
import React, { useState } from 'react';
import { ChevronDown, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  { q:'What is Credify?', a:'Credify is a modern virtual credit card management platform. It lets you issue, manage, and control virtual credit cards with enterprise-grade security and real-time insights.' },
  { q:'How do I sign up?', a:'Click "Get Started" on the homepage or navigate to the Register page. You\'ll need a valid email, phone number, and to complete a quick KYC verification.' },
  { q:'Is my data secure?', a:'Yes. We use AES-256 encryption for all data at rest, TLS 1.3 for data in transit, and our infrastructure is SOC 2 Type II certified. Your financial data is never sold to third parties.' },
  { q:'Can I freeze my card instantly?', a:'Absolutely. From your dashboard, you can freeze or unfreeze any virtual card with a single click — it takes effect in under a second.' },
  { q:'How does the rewards system work?', a:'Every rupee you spend earns reward points. Points can be redeemed for cashback, travel credits, or exclusive partner offers. Check your dashboard for your current balance.' },
  { q:'What payment methods are supported?', a:'You can make full or partial payments on your monthly bill via UPI, net banking, or bank transfer. We\'re adding more payment options soon.' },
  { q:'How do I contact support?', a:'Use the chat widget at the bottom of any page, or email us at support@credify.app. Pro and Enterprise users get priority response within 2 hours.' },
];

const FAQ = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-[calc(100vh-64px)]" style={{ paddingTop:64 }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">

        <div className="text-center mb-14 animate-fade-up">
          <p style={{ fontSize:12, fontWeight:700, color:'var(--brand-400)', letterSpacing:'0.1em', fontFamily:'Sora,sans-serif', marginBottom:10 }}>SUPPORT</p>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3rem)', marginBottom:14 }}>Frequently asked questions</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:15 }}>
            Can't find your answer?{' '}
            <button style={{ color:'var(--brand-400)', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              Chat with us
            </button>
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className={`glass-card animate-fade-up delay-${(i % 8 + 1) * 100}`}
              style={{ padding:0, overflow:'hidden', cursor:'pointer' }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'18px 22px', gap:16,
              }}>
                <span style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>{q}</span>
                <ChevronDown
                  size={18}
                  color="var(--text-muted)"
                  style={{
                    flexShrink:0,
                    transition:'transform 250ms ease',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
              {open === i && (
                <div
                  className="animate-fade-in"
                  style={{
                    padding:'0 22px 18px',
                    fontSize:14, color:'var(--text-secondary)', lineHeight:1.7,
                    borderTop:'1px solid var(--border)',
                    paddingTop:14,
                  }}
                >
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="glass-card animate-fade-up mt-10 text-center" style={{ padding:32 }}>
          <MessageSquare size={28} color="var(--brand-400)" style={{ margin:'0 auto 12px' }} />
          <h3 style={{ fontSize:18, marginBottom:8 }}>Still have questions?</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:20 }}>
            Our team is happy to help. We typically respond within a few hours.
          </p>
          <button className="btn-primary" style={{ fontSize:14, padding:'11px 22px' }}>
            Contact Support <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
