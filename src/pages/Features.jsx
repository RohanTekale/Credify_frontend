// src/pages/Features.jsx — Credify Features: 4 deep sections with anchor IDs
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CheckSquare, GitMerge, Monitor, Zap, Webhook } from 'lucide-react';
import { FEATURE_SECTIONS } from '../content/credifyStory';
import { ApprovalStepper, StatusBadge } from '../components/ops';

const ICON_MAP = { CheckSquare, GitMerge, Monitor, Zap, Webhook };

const DetailItem = ({ label, desc, color }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ padding:'14px 16px',borderRadius:12,background:open?`${color}08`:'var(--bg-subtle)', border:`1px solid ${open?color+'28':'var(--border)'}`, cursor:'pointer', transition:'all 0.2s ease', marginBottom:8 }}
    >
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        <CheckCircle2 size={14} color={color} style={{ flexShrink:0 }} />
        <span style={{ fontSize:14,fontWeight:600,color:'var(--text-primary)',flex:1 }}>{label}</span>
        <span style={{ fontSize:18,color:'var(--text-muted)',transform:open?'rotate(45deg)':'none',transition:'transform 0.2s' }}>+</span>
      </div>
      {open && <p style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.7,marginTop:10,paddingLeft:24 }}>{desc}</p>}
    </div>
  );
};

const ApprovalDemo = ({ color }) => (
  <ApprovalStepper amount="₹2,50,000" steps={[
    { role:'Auto-approve',    limit:'< ₹50K',  status:'approved' },
    { role:'Finance Manager', limit:'₹50K–5L', status:'approved' },
    { role:'CFO',             limit:'> ₹5L',   status:'pending'  },
  ]} />
);

const ReconDemo = ({ color }) => {
  const rows = [
    { txn:'TXN-9901', internal:'₹45,200', gateway:'₹45,200', diff:'₹0',    status:'matched'  },
    { txn:'TXN-9900', internal:'₹12,400', gateway:'₹12,337', diff:'₹63',   status:'mismatch' },
    { txn:'TXN-9899', internal:'₹8,750',  gateway:'₹8,750',  diff:'₹0',    status:'matched'  },
  ];
  return (
    <div style={{ borderRadius:16,border:'1px solid var(--border)',overflow:'hidden',background:'var(--bg-subtle)' }}>
      <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:12,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.06em' }}>RECONCILIATION DELTA</span>
        <StatusBadge status="mismatch" />
      </div>
      <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
        <thead><tr>{['Transaction','Internal','Gateway','Diff','Status'].map(h=>(
          <th key={h} style={{ textAlign:'left',padding:'8px 12px',color:'var(--text-muted)',fontWeight:600,fontSize:10,letterSpacing:'0.06em',borderBottom:'1px solid var(--border)' }}>{h}</th>
        ))}</tr></thead>
        <tbody>{rows.map((row,i)=>(
          <tr key={i}>
            <td style={{ padding:'10px 12px' }}><code style={{ fontSize:11,color:'var(--text-secondary)',fontFamily:"'JetBrains Mono',monospace" }}>{row.txn}</code></td>
            <td style={{ padding:'10px 12px',color:'var(--text-primary)',fontWeight:500 }}>{row.internal}</td>
            <td style={{ padding:'10px 12px',color:'var(--text-primary)',fontWeight:500 }}>{row.gateway}</td>
            <td style={{ padding:'10px 12px',color:row.diff==='₹0'?'#10b981':'#ef4444',fontWeight:700 }}>{row.diff}</td>
            <td style={{ padding:'10px 12px' }}><StatusBadge status={row.status} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
};

const KpiDemo = ({ color }) => (
  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
    {[
      { label:'Live Payment Volume', value:'₹4.2 Cr', note:'Real-time, sub-second', color:'#3b61f5' },
      { label:'Approval Queue',      value:'7',       note:'3 past SLA threshold', color:'#f59e0b' },
      { label:'Gateway Health',      value:'99.9%',   note:'Razorpay normal',       color:'#10b981' },
      { label:'Recon Coverage',      value:'99.1%',   note:'2 mismatches flagged',  color:'#8b5cf6' },
    ].map(({ label,value,note,color:c })=>(
      <div key={label} style={{ padding:'16px',borderRadius:12,background:'var(--bg-subtle)',border:`1px solid ${c}20` }}>
        <p style={{ fontSize:22,fontWeight:800,color:'var(--text-primary)',fontFamily:"'Sora',sans-serif",letterSpacing:'-0.02em',marginBottom:4 }}>{value}</p>
        <p style={{ fontSize:11,fontWeight:600,color:c,marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:11,color:'var(--text-muted)' }}>{note}</p>
      </div>
    ))}
  </div>
);

const WebhookDemo = ({ color }) => {
  const events = [
    { id:'pay_01HZ8A', type:'payment.captured',  status:'delivered', ts:'14:23:01', note:'Processed once' },
    { id:'pay_01HZ8A', type:'payment.captured',  status:'duplicate', ts:'14:23:03', note:'Duplicate — dropped in 4ms' },
    { id:'ord_09XK2F', type:'order.paid',         status:'delivered', ts:'14:22:47', note:'Processed once' },
    { id:'ref_07BN1C', type:'refund.processed',   status:'delivered', ts:'14:22:31', note:'Processed once' },
  ];
  return (
    <div style={{ borderRadius:16,border:'1px solid var(--border)',overflow:'hidden',background:'var(--bg-subtle)' }}>
      <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:12,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.06em' }}>WEBHOOK EVENT LOG</span>
        <span style={{ fontSize:11,color:'#06b6d4',fontWeight:600 }}>1 duplicate dropped</span>
      </div>
      {events.map((ev,i)=>(
        <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:i<events.length-1?'1px solid var(--border)':'none' }}>
          <StatusBadge status={ev.status} />
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontSize:12,fontWeight:600,color:'var(--text-primary)' }}>{ev.type}</p>
            <code style={{ fontSize:10,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{ev.id}</code>
          </div>
          <span style={{ fontSize:11,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{ev.ts}</span>
          <span style={{ fontSize:10,color:ev.status==='duplicate'?'#ef4444':'#10b981',fontWeight:500,maxWidth:130,textAlign:'right' }}>{ev.note}</span>
        </div>
      ))}
    </div>
  );
};

const DEMOS = { 'approval-stepper': ApprovalDemo, 'recon-table': ReconDemo, 'kpi-strip': KpiDemo, 'webhook-log': WebhookDemo };

const sections = FEATURE_SECTIONS.map(s => ({ ...s, icon: ICON_MAP[s.icon] }));

const Features = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'calc(100vh - 64px)' }}>
      {/* Hero */}
      <div style={{ padding:'clamp(60px,10vh,100px) 24px 0', textAlign:'center', maxWidth:720, margin:'0 auto' }}>
        <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3b61f5',fontFamily:"'Sora',sans-serif" }}>PLATFORM FEATURES</span>
        <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>
          Every layer of finance ops,{' '}
          <span className="gradient-text">covered.</span>
        </h1>
        <p style={{ fontSize:17,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:40 }}>
          Approvals, reconciliation, real-time dashboards, and webhook handling — built for the CFO, Finance Manager, and ops team that's tired of doing this manually.
        </p>
        {/* Anchor nav */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:60 }}>
          {sections.map(({ anchor, eyebrow, color }) => (
            <a key={anchor} href={`#${anchor}`} style={{
              display:'inline-flex',alignItems:'center',gap:6,
              padding:'8px 16px',borderRadius:8,
              background:`${color}0f`,border:`1px solid ${color}25`,
              color,fontSize:12,fontWeight:700,letterSpacing:'0.06em',
              textDecoration:'none',transition:'all 0.2s ease',
              fontFamily:"'Sora',sans-serif",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${color}1a`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${color}0f`;}}
            >
              {eyebrow}
            </a>
          ))}
        </div>
      </div>

      {/* Feature sections */}
      {sections.map(({ id, anchor, eyebrow, headline, description, color, icon: Icon, details, demo }, idx) => {
        const Demo = DEMOS[demo];
        const isEven = idx % 2 === 0;
        return (
          <section key={id} id={anchor} style={{
            padding:'clamp(80px,12vh,120px) 24px',
            background: idx % 2 === 1 ? 'var(--bg-subtle)' : 'transparent',
          }}>
            <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
              {/* Copy side */}
              <div style={{ order: isEven ? 0 : 1 }}>
                <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color,fontFamily:"'Sora',sans-serif" }}>{eyebrow}</span>
                <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.6rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>{headline}</h2>
                <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.75,marginBottom:28 }}>{description}</p>
                <div style={{ marginBottom:32 }}>
                  {details.map((d,i) => <DetailItem key={i} {...d} color={color} />)}
                </div>
                <button className="btn-primary" onClick={() => navigate('/register')} style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:14,padding:'12px 24px',background:color,boxShadow:`0 4px 20px ${color}40` }}>
                  Get started <ArrowRight size={14} />
                </button>
              </div>
              {/* Demo side */}
              <div style={{ order: isEven ? 1 : 0 }}>
                <Demo color={color} />
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section style={{ padding:'clamp(80px,12vh,120px) 24px', textAlign:'center' }}>
        <div style={{ maxWidth:580, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:800,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>
            Every feature out of the box.
          </h2>
          <p style={{ fontSize:16,color:'var(--text-secondary)',marginBottom:32,lineHeight:1.65 }}>
            No custom development. No weeks of setup. Connect your gateway and your finance team is running in under a day.
          </p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize:15,padding:'14px 28px',display:'flex',alignItems:'center',gap:8 }}>
              Start free trial <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/pricing')} style={{ fontSize:15,padding:'14px 28px',borderRadius:12,background:'transparent',border:'1px solid var(--border)',color:'var(--text-secondary)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
              View pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
