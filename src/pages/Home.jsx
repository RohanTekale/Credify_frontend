// src/pages/Home.jsx — Credify Finance Ops Platform — 6-chapter scroll redesign
// Chapters: Hero → Problems → Solutions → Interactive Demo → Dashboard Preview → CTA

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, RefreshCw, BarChart3, Zap,
  CheckCircle2, CheckSquare, GitMerge, Monitor, Webhook,
  TrendingUp, TrendingDown, Clock, ChevronDown,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { STATS, PROBLEMS, SOLUTIONS } from '../content/credifyStory';
import { ApprovalStepper, OpsKpiStrip, StatusBadge } from '../components/ops';
import CinematicHero from '../components/cinema/CinematicHero';
import CardReveal from '../components/cinema/CardReveal';
import ScrollChapter from '../components/cinema/ScrollChapter';
import { CanvasManagerProvider } from '../components/cinema/CanvasManager';

/* ── Exported 3D Canvas Logo (used by Navbar) ─────────────────────────────── */
export const CredifyLogo3D = ({ size = 48 }) => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const t         = useRef(0);
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
      ctx.beginPath(); ctx.roundRect(-rx, -rx, rx * 2, rx * 2, rx * 0.25);
      ctx.fillStyle = bg; ctx.fill();
      const s = size / 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 1.5 * s;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.roundRect(-8*s, -5*s, 16*s, 11*s, 2*s); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-8*s, -2*s, 16*s, 2.2*s);
      ctx.fillStyle = 'rgba(245,158,11,0.9)';
      ctx.beginPath(); ctx.roundRect(-7*s, 1.8*s, 3.5*s, 2.5*s, 0.5*s); ctx.fill();
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.8*s;
      ctx.beginPath(); ctx.moveTo(5*s,-8*s); ctx.lineTo(7*s,-5.5*s); ctx.lineTo(10*s,-9.5*s); ctx.stroke();
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);
  return <canvas ref={canvasRef} style={{ width: size, height: size, display: 'block' }} />;
};

/* ── Animated counter ──────────────────────────────────────────────────────── */
const CountUp = ({ target, suffix='', prefix='' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null); const started = useRef(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const n = parseFloat(String(target).replace(/[^0-9.]/g,''));
        const inc = n/60; let cur = 0;
        const timer = setInterval(() => {
          cur += inc;
          if (cur >= n) { setDisplay(n); clearInterval(timer); } else setDisplay(Math.floor(cur*10)/10);
        }, 25);
      }
    }, { threshold: 0.4 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [target]);
  const fmt = Number.isInteger(Number(display)) ? display : display.toFixed(1);
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
};

/* ── Problem card ──────────────────────────────────────────────────────────── */
const ProblemCard = React.memo(({ icon: Icon, color, headline, body, stat, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding:'28px 24px', borderRadius:20, background:'var(--bg-card)',
        border:`1px solid ${hovered ? color+'30' : 'var(--border)'}`,
        boxShadow: hovered ? `0 20px 60px ${color}18,0 4px 16px rgba(0,0,0,0.1)` : 'var(--shadow-card)',
        transition:'all 0.3s var(--ease-spring)', transform: hovered ? 'translateY(-6px)' : 'none',
        position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity: hovered?1:0.4, transition:'opacity 0.3s' }} />
      <div style={{ width:44,height:44,borderRadius:12,background:`${color}12`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
        <Icon size={20} color={color} />
      </div>
      <h3 style={{ fontSize:16,fontWeight:700,marginBottom:10,color:'var(--text-primary)',lineHeight:1.4,fontFamily:"'Sora',sans-serif" }}>{headline}</h3>
      <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:16 }}>{body}</p>
      <div style={{ padding:'8px 12px',borderRadius:8,background:`${color}08`,border:`1px solid ${color}18` }}>
        <p style={{ fontSize:12,fontWeight:600,color,margin:0 }}>{stat}</p>
      </div>
    </div>
  );
});

/* ── Solution card ─────────────────────────────────────────────────────────── */
const SolutionCard = React.memo(({ icon: Icon, color, headline, body, badge, metrics }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding:'28px 24px', borderRadius:20,
        background: hovered ? `linear-gradient(145deg,${color}0a,var(--bg-card))` : 'var(--bg-card)',
        border:`1px solid ${hovered ? color+'28' : 'var(--border)'}`,
        boxShadow: hovered ? `0 20px 60px ${color}14,0 4px 16px rgba(0,0,0,0.08)` : 'var(--shadow-card)',
        transition:'all 0.3s var(--ease-spring)', transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
        <div style={{ width:44,height:44,borderRadius:12,background:`${color}14`,border:`1px solid ${color}28`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon size={20} color={color} />
        </div>
        <span style={{ fontSize:10,fontWeight:700,letterSpacing:'0.08em',background:`${color}14`,border:`1px solid ${color}22`,color,padding:'4px 10px',borderRadius:6,fontFamily:"'Sora',sans-serif" }}>{badge}</span>
      </div>
      <h3 style={{ fontSize:16,fontWeight:700,marginBottom:8,color:'var(--text-primary)',lineHeight:1.4,fontFamily:"'Sora',sans-serif" }}>{headline}</h3>
      <p style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:16 }}>{body}</p>
      <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
        {metrics.map((m,i) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:8 }}>
            <CheckCircle2 size={13} color={color} style={{ flexShrink:0 }} />
            <span style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:500 }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── Interactive demo panel ────────────────────────────────────────────────── */
const DemoPanel = ({ activeTab: controlledTab, onTabChange, progress = null }) => {
  const [internalTab, setInternalTab] = useState('approval');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (id) => { onTabChange ? onTabChange(id) : setInternalTab(id); };

  const tabs = [
    { id:'approval', label:'Approval Chain', icon:CheckSquare, color:'#3b61f5' },
    { id:'webhook',  label:'Webhook Events', icon:Zap,         color:'#06b6d4' },
    { id:'recon',    label:'Recon Delta',    icon:RefreshCw,   color:'#10b981' },
  ];
  const WEBHOOK_EVENTS = [
    { id:'pay_01HZ8', type:'payment.captured',  gateway:'Razorpay', status:'delivered', ts:'14:23:01' },
    { id:'pay_01HZ8', type:'payment.captured',  gateway:'Razorpay', status:'duplicate', ts:'14:23:03' },
    { id:'ord_09XK2', type:'order.paid',         gateway:'Razorpay', status:'delivered', ts:'14:22:47' },
    { id:'ref_07BN1', type:'refund.processed',   gateway:'Stripe',   status:'delivered', ts:'14:22:31' },
    { id:'pay_03DM5', type:'payment.failed',     gateway:'Stripe',   status:'failed',    ts:'14:22:18' },
  ];
  const RECON_ROWS = [
    { txn:'TXN-8821', internal:'₹12,400', gateway:'₹12,400', diff:'₹0',     status:'matched'  },
    { txn:'TXN-8820', internal:'₹5,200',  gateway:'₹5,143',  diff:'₹57',    status:'mismatch' },
    { txn:'TXN-8819', internal:'₹18,750', gateway:'₹18,750', diff:'₹0',     status:'matched'  },
    { txn:'TXN-8818', internal:'₹3,100',  gateway:'—',        diff:'₹3,100', status:'mismatch' },
  ];
  return (
    <div style={{ borderRadius:24, background:'var(--bg-card)', border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.15)', fontFamily:"'DM Sans','Sora',sans-serif" }}>
      {/* Scroll-progress rail — only rendered when driven by a pinned ScrollChapter */}
      {progress !== null && (
        <div style={{ height:3, background:'var(--bg-subtle)', position:'relative' }}>
          <div style={{ position:'absolute', inset:'0 auto 0 0', width:`${progress*100}%`, background:'linear-gradient(90deg,#3b61f5,#8b5cf6,#06b6d4)', transition:'width 0.05s linear' }} />
        </div>
      )}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)', padding:'12px 16px', gap:8 }}>
        {tabs.map(({ id, label, icon: Icon, color }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8,
              border: active ? `1px solid ${color}30` : '1px solid transparent',
              background: active ? `${color}12` : 'transparent',
              color: active ? color : 'var(--text-muted)', fontSize:13, fontWeight:600,
              cursor:'pointer', transition:'all 0.2s ease', fontFamily:"'Sora',sans-serif",
            }}>
              <Icon size={14} />{label}
            </button>
          );
        })}
        {progress !== null && (
          <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.04em' }}>
              {tabs.findIndex(t => t.id === activeTab) + 1} / {tabs.length} · SCROLL TO EXPLORE
            </span>
          </span>
        )}
      </div>
      <div style={{ padding:'24px' }}>
        {activeTab === 'approval' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Payment Request — Vendor Invoice #1491</p>
              <p style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', fontFamily:"'Sora',sans-serif" }}>₹1,20,000</p>
            </div>
            <ApprovalStepper amount="₹1,20,000" compact steps={[
              { role:'Auto-approve',    limit:'< ₹50K',  status:'approved' },
              { role:'Finance Manager', limit:'₹50K–5L', status:'pending'  },
              { role:'CFO',             limit:'> ₹5L',   status:'pending'  },
            ]} />
            <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10, background:'rgba(59,97,245,0.06)', border:'1px solid rgba(59,97,245,0.14)' }}>
              <p style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:"'JetBrains Mono',monospace" }}>
                Awaiting Finance Manager — SLA 2hr — Escalation in 1h 43m
              </p>
            </div>
          </div>
        )}
        {activeTab === 'webhook' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>Last 5 events — 1 duplicate dropped</p>
              <StatusBadge status="delivered" />
            </div>
            {WEBHOOK_EVENTS.map((ev,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<WEBHOOK_EVENTS.length-1 ? '1px solid var(--border)' : 'none' }}>
                <StatusBadge status={ev.status} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{ev.type}</p>
                  <code style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'JetBrains Mono',monospace" }}>{ev.id}</code>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{ev.gateway}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'JetBrains Mono',monospace" }}>{ev.ts}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'recon' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>Nightly reconciliation — 2 mismatches</p>
              <StatusBadge status="mismatch" />
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead><tr>{['Transaction','Internal','Gateway','Diff','Status'].map(h=>(
                  <th key={h} style={{ textAlign:'left',padding:'6px 8px',color:'var(--text-muted)',fontWeight:600,fontSize:10,letterSpacing:'0.06em',borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}</tr></thead>
                <tbody>{RECON_ROWS.map((row,i)=>(
                  <tr key={i}>
                    <td style={{ padding:'10px 8px' }}><code style={{ fontSize:11,color:'var(--text-secondary)',fontFamily:"'JetBrains Mono',monospace" }}>{row.txn}</code></td>
                    <td style={{ padding:'10px 8px',color:'var(--text-primary)',fontWeight:500 }}>{row.internal}</td>
                    <td style={{ padding:'10px 8px',color:'var(--text-primary)',fontWeight:500 }}>{row.gateway}</td>
                    <td style={{ padding:'10px 8px',color:row.diff==='₹0'?'#10b981':'#ef4444',fontWeight:700 }}>{row.diff}</td>
                    <td style={{ padding:'10px 8px' }}><StatusBadge status={row.status} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Dashboard preview ─────────────────────────────────────────────────────── */
const DashboardPreview = React.memo(() => {
  const sidebarItems = [
    { label:'Overview',       active:true  },
    { label:'Payments',       active:false },
    { label:'Approvals',      active:false, badge:7 },
    { label:'Reconciliation', active:false },
    { label:'Webhooks',       active:false },
    { label:'Reports',        active:false },
  ];
  return (
    <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid var(--border)', boxShadow:'0 40px 80px rgba(0,0,0,0.2)', background:'var(--bg-base)' }}>
      <div style={{ height:40, background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 16px', gap:8 }}>
        {['#ef4444','#f59e0b','#10b981'].map(c=>(<div key={c} style={{ width:10,height:10,borderRadius:'50%',background:c }} />))}
        <div style={{ height:22, borderRadius:6, background:'var(--bg-muted)', padding:'0 10px', display:'flex', alignItems:'center', marginLeft:12 }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'JetBrains Mono',monospace" }}>app.credify.io/dashboard</span>
        </div>
      </div>
      <div style={{ display:'flex', height:360 }}>
        <div style={{ width:180, background:'var(--dash-sidebar-bg,var(--bg-subtle))', borderRight:'1px solid var(--border)', padding:'16px 0', flexShrink:0 }}>
          <div style={{ padding:'0 16px', marginBottom:16 }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#3b61f5', letterSpacing:'0.1em' }}>CREDIFY</p>
          </div>
          {sidebarItems.map(({ label, active, badge }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px', background:active?'rgba(59,97,245,0.08)':'transparent', borderLeft:active?'2px solid #3b61f5':'2px solid transparent' }}>
              <span style={{ fontSize:12, fontWeight:active?600:400, color:active?'#3b61f5':'var(--text-muted)' }}>{label}</span>
              {badge && <span style={{ fontSize:9, fontWeight:700, background:'rgba(245,158,11,0.15)', color:'#f59e0b', padding:'2px 6px', borderRadius:4 }}>{badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ flex:1, padding:'20px', overflow:'hidden' }}>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12, fontFamily:"'Sora',sans-serif" }}>
            7 approvals need your attention today.
          </p>
          <OpsKpiStrip columns={2} kpis={[
            { id:'vol',   label:'Volume (today)',    value:'₹4.2 Cr', delta:'+12%', positive:true,  color:'#3b61f5', Icon:TrendingUp, spark:[42,48,44,61,58,72,68,79,84,91] },
            { id:'queue', label:'Pending Approvals', value:'7',       delta:'-3',   positive:true,  color:'#f59e0b', Icon:Clock,      spark:[14,12,18,9,11,7,10,8,9,7] },
          ]} />
        </div>
      </div>
    </div>
  );
});

/* ── Home ──────────────────────────────────────────────────────────────────── */
const ICON_MAP = { Shield, RefreshCw, BarChart3, Zap, CheckSquare, GitMerge, Monitor, Webhook };

const Home = () => {
  const navigate  = useNavigate();
  const { token } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark    = theme === 'dark';
  const [demoTab, setDemoTab]           = useState('approval');
  const [demoProgress, setDemoProgress] = useState(0);

  const problems  = useMemo(() => PROBLEMS.map(p  => ({ ...p,  icon: ICON_MAP[p.icon]  })), []);
  const solutions = useMemo(() => SOLUTIONS.map(s => ({ ...s,  icon: ICON_MAP[s.icon]  })), []);

  return (
    <CanvasManagerProvider>
    <div style={{ position:'relative', overflow:'hidden' }}>

      {/* ── Chapter 1: Hero ─────────────────────────────────────────────── */}
      <ScrollChapter mode="reveal" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(80px,15vh,140px) 24px 60px' }}>
        <CinematicHero />
        <div style={{ position:'absolute',top:'20%',left:'50%',transform:'translate(-50%,-50%)', width:600,height:400, background:'radial-gradient(ellipse,rgba(59,97,245,0.12) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', width:'100%' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:999,background:'rgba(59,97,245,0.1)',border:'1px solid rgba(59,97,245,0.25)',marginBottom:28 }}>
          <div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px #10b981' }} />
          <span style={{ fontSize:11,fontWeight:700,color:'#3b61f5',letterSpacing:'0.08em',fontFamily:"'Sora',sans-serif" }}>FINANCE OPERATIONS PLATFORM</span>
        </div>

        <h1 style={{ fontSize:'clamp(2.6rem,7vw,5.5rem)',fontWeight:800,lineHeight:1.08,letterSpacing:'-0.04em',maxWidth:900,marginBottom:24,fontFamily:"'Sora',sans-serif" }}>
          Finance operations,{' '}
          <span style={{ background:'linear-gradient(135deg,#3b61f5 0%,#8b5cf6 50%,#06b6d4 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            finally in control.
          </span>
        </h1>

        <p style={{ fontSize:'clamp(16px,2.2vw,20px)', color:'var(--text-secondary)', maxWidth:580, lineHeight:1.65, marginBottom:40 }}>
          Multi-step approval chains, automated reconciliation, and real-time ops visibility — built on top of Razorpay and Stripe, not instead of them.
        </p>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
          <button className="btn-primary" onClick={() => navigate(token ? '/dashboard' : '/register')} style={{ fontSize:15, padding:'14px 28px', display:'flex', alignItems:'center', gap:8 }}>
            Get started free <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/features')} style={{ fontSize:15,padding:'14px 28px',borderRadius:12,background:'transparent',border:'1px solid var(--border)',color:'var(--text-secondary)',cursor:'pointer',transition:'all 0.2s ease',fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b61f5';e.currentTarget.style.color='#3b61f5';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}>
            See how it works
          </button>
        </div>

        <CardReveal width={420} height={280} style={{ marginTop: 80 }} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, maxWidth:760, marginTop:72, paddingTop:48, borderTop:'1px solid var(--border)', width:'100%' }}>
          {STATS.map(({ value, suffix, label }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <p style={{ fontSize:'clamp(1.6rem,3.5vw,2.6rem)',fontWeight:800,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em',background:'linear-gradient(135deg,#3b61f5,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:4 }}>
                <CountUp target={parseFloat(String(value).replace(/[^0-9.]/g,''))} suffix={suffix} prefix={String(value).startsWith('₹')?'₹':''} />
              </p>
              <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.4 }}>{label}</p>
            </div>
          ))}
        </div>
        </div>

        <div style={{ position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,color:'var(--text-muted)',fontSize:11, zIndex:1 }}>
          <span>Scroll to explore</span>
          <ChevronDown size={16} style={{ animation:'bounce 1.5s ease infinite' }} />
        </div>
      </ScrollChapter>

      {/* ── Chapter 2: Problems ──────────────────────────────────────────── */}
      <ScrollChapter mode="reveal" style={{ padding:'clamp(80px,12vh,120px) 24px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#ef4444',fontFamily:"'Sora',sans-serif" }}>THE PROBLEM</span>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>Finance ops without Credify</h2>
          <p style={{ fontSize:16,color:'var(--text-secondary)',maxWidth:480,margin:'0 auto' }}>These aren't edge cases. They're what finance teams deal with every month.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {problems.map((p,i) => <ProblemCard key={p.id} {...p} index={i} />)}
        </div>
      </ScrollChapter>

      {/* ── Chapter 3: Solutions ─────────────────────────────────────────── */}
      <ScrollChapter mode="reveal" style={{ padding:'clamp(80px,12vh,120px) 24px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#10b981',fontFamily:"'Sora',sans-serif" }}>THE SOLUTION</span>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>What Credify adds on top</h2>
          <p style={{ fontSize:16,color:'var(--text-secondary)',maxWidth:520,margin:'0 auto' }}>Credify connects to your existing gateways and adds the control layer your finance team never had.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {solutions.map((s,i) => <SolutionCard key={s.id} {...s} index={i} />)}
        </div>
      </ScrollChapter>

      {/* ── Chapter 4: Interactive Demo — pin + scrub ─────────────────────── */}
      <ScrollChapter
        mode="pin"
        pinDuration="+=150%"
        onProgress={(p) => {
          // Map normalized scroll progress (0→1) across the pin to one of
          // three discrete tabs — this is the actual scroll-driven storytelling:
          // scrubbing down through this section narrates approval → webhook → recon.
          const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
          const nextTab = ['approval', 'webhook', 'recon'][idx];
          setDemoTab(prev => (prev === nextTab ? prev : nextTab));
          setDemoProgress(p);
        }}
        style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'24px' }}
      >
        <div style={{ maxWidth:900, margin:'0 auto', width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#3b61f5',fontFamily:"'Sora',sans-serif" }}>SEE IT IN ACTION</span>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>Explore the platform</h2>
            <p style={{ fontSize:16,color:'var(--text-secondary)',maxWidth:440,margin:'0 auto' }}>Keep scrolling — this panel narrates approval chains, webhook events, and reconciliation as you go.</p>
          </div>
          <DemoPanel activeTab={demoTab} onTabChange={setDemoTab} progress={demoProgress} />
        </div>
      </ScrollChapter>

      {/* ── Chapter 5: Dashboard Preview ─────────────────────────────────── */}
      <ScrollChapter mode="reveal" style={{ padding:'clamp(60px,10vh,100px) 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:'#8b5cf6',fontFamily:"'Sora',sans-serif" }}>THE DASHBOARD</span>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:800,marginTop:12,marginBottom:16,fontFamily:"'Sora',sans-serif",letterSpacing:'-0.03em' }}>Your ops command centre</h2>
            <p style={{ fontSize:16,color:'var(--text-secondary)',maxWidth:440,margin:'0 auto' }}>One screen for payment volume, approval queue, gateway health, and reconciliation status.</p>
          </div>
          <DashboardPreview />
        </div>
      </ScrollChapter>

      {/* ── Chapter 6: CTA ───────────────────────────────────────────────── */}
      <ScrollChapter mode="reveal" style={{ padding:'clamp(100px,14vh,160px) 24px', textAlign:'center' }}>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:700,height:400,background:'radial-gradient(ellipse,rgba(59,97,245,0.1) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ maxWidth:640, margin:'0 auto', position:'relative' }}>
          <h2 style={{ fontSize:'clamp(2rem,5vw,3.6rem)',fontWeight:800,lineHeight:1.1,letterSpacing:'-0.04em',marginBottom:20,fontFamily:"'Sora',sans-serif" }}>
            Ready to stop reconciling by hand?
          </h2>
          <p style={{ fontSize:17,color:'var(--text-secondary)',lineHeight:1.65,marginBottom:40 }}>
            Most teams are live in under a day. Connect your gateway, configure approval rules, and go.
          </p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize:16,padding:'16px 32px',display:'flex',alignItems:'center',gap:8 }}>
              Start free trial <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/pricing')} style={{ fontSize:15,padding:'16px 28px',borderRadius:12,background:'transparent',border:'1px solid var(--border)',color:'var(--text-secondary)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600,transition:'all 0.2s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b61f5';e.currentTarget.style.color='#3b61f5';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}>
              View pricing
            </button>
          </div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:20,marginTop:40,flexWrap:'wrap' }}>
            {['No credit card required','Live in under a day','Works with Razorpay & Stripe'].map(text=>(
              <div key={text} style={{ display:'flex',alignItems:'center',gap:6 }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ fontSize:13,color:'var(--text-muted)',fontWeight:500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollChapter>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}`}</style>
    </div>
    </CanvasManagerProvider>
  );
};

export default Home;
