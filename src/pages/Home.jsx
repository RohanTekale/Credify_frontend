// src/pages/Home.jsx — Premium Fintech Dashboard Home
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft,
  ArrowRight, Lock, Users, Zap, LayoutDashboard,
  ChevronRight, Shield, Bell, Plus, Activity,
  Gift, Eye, EyeOff, Wifi, Sparkles
} from 'lucide-react';
import useAuthStore from '../store/authStore';

// ─── Animated counter ──────────────────────────────────────────────────────────
const useCounter = (target, duration = 1400, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
};

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, color, height = 36 }) => {
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaBottom = `${(data.length - 1) / (data.length - 1) * w},${h} 0,${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaBottom}`} fill={`url(#sg${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Animated bar ──────────────────────────────────────────────────────────────
const Bar = ({ pct, color, delay }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', borderRadius: 99, background: color, width: `${w}%`, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 6px ${color}80` }} />
    </div>
  );
};

// ─── Virtual Card ──────────────────────────────────────────────────────────────
const VCard = ({ name, last4, revealed, onToggle, color1 = '#1e3a8a', color2 = '#0f172a' }) => (
  <div
    onClick={onToggle}
    style={{
      borderRadius: 18, padding: '22px 24px', cursor: 'pointer',
      background: `linear-gradient(145deg, ${color1} 0%, ${color2} 100%)`,
      position: 'relative', overflow: 'hidden', userSelect: 'none',
      boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)`,
      transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1)',
      minHeight: 170,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) rotate(-0.8deg) scale(1.01)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotate(0) scale(1)'; }}
  >
    {/* Holographic shine */}
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 40%,rgba(255,255,255,0.05) 100%)', borderRadius:18, pointerEvents:'none' }} />
    {/* Grid texture */}
    <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.02) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.02) 40px)', borderRadius:18, pointerEvents:'none' }} />
    {/* Glow orb */}
    <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, borderRadius:'50%', background:'rgba(96,137,255,0.2)', filter:'blur(30px)', pointerEvents:'none' }} />
    {/* Chip */}
    <div style={{ position:'absolute', top:22, right:22 }}>
      <div style={{ width:32, height:24, borderRadius:5, background:'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, padding:3 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ background:'rgba(0,0,0,0.25)', borderRadius:1 }} />)}
      </div>
    </div>
    {/* WiFi / contactless */}
    <div style={{ position:'absolute', top:24, right:64 }}>
      <Wifi size={16} color="rgba(255,255,255,0.4)" style={{ transform:'rotate(90deg)' }} />
    </div>

    <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.12em', marginBottom:28, fontFamily:'Sora,sans-serif' }}>CREDIFY VIRTUAL</div>

    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:16, color:'rgba(255,255,255,0.92)', letterSpacing:'0.22em', marginBottom:22, textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
      {revealed ? `4829 3741 8820 ${last4}` : `•••• •••• •••• ${last4}`}
    </div>

    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
      <div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Card Holder</div>
        <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:'Sora,sans-serif', letterSpacing:'0.02em' }}>{name || 'User'}</div>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Valid Thru</div>
        <div style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace', color:'rgba(255,255,255,0.8)' }}>12/28</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggle(); }} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:7, padding:'5px 9px', display:'flex', alignItems:'center', gap:4, cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:10 }}>
        {revealed ? <EyeOff size={11}/> : <Eye size={11}/>}
        {revealed ? 'Hide' : 'Show'}
      </button>
    </div>
  </div>
);

// ─── KPI Card ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, subPos, color, icon: Icon, sparkData, delay, animStart }) => {
  const num = parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
  const counted = useCounter(num, 1300, animStart);
  const display = String(value).replace(/[0-9,]+/, counted.toLocaleString());

  return (
    <div
      className="animate-fade-up"
      style={{
        padding:'20px 22px', borderRadius:18, position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))',
        border:'1px solid rgba(255,255,255,0.08)',
        boxShadow:'0 4px 30px rgba(0,0,0,0.4)',
        animationDelay:`${delay}ms`,
        transition:'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
        cursor:'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${color}35`; e.currentTarget.style.borderColor=`${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 30px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:`${color}0e`, pointerEvents:'none' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ width:36,height:36,borderRadius:10,background:`${color}18`,border:`1px solid ${color}28`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize:9,fontWeight:700,color:color,background:`${color}14`,border:`1px solid ${color}25`,borderRadius:20,padding:'2px 8px',letterSpacing:'0.06em' }}>LIVE</span>
      </div>
      <div style={{ fontSize:'clamp(1.25rem,2.2vw,1.65rem)',fontWeight:800,fontFamily:'Sora,sans-serif',letterSpacing:'-0.03em',color:'var(--text-primary)',marginBottom:2 }}>{display}</div>
      <div style={{ fontSize:11,color:'var(--text-muted)',fontWeight:500,marginBottom:6 }}>{label}</div>
      {sub && <div style={{ fontSize:10,fontWeight:600,color:subPos?'#10b981':'#f59e0b' }}>{sub}</div>}
      {sparkData && (
        <div style={{ marginTop:10, opacity:0.7 }}>
          <Sparkline data={sparkData} color={color} height={32} />
        </div>
      )}
    </div>
  );
};

// ─── Transaction row ───────────────────────────────────────────────────────────
const TxRow = ({ icon, label, sub, amount, positive, delay, category }) => {
  const catColors = { food:'#f59e0b', salary:'#10b981', shopping:'#8b5cf6', reward:'#ec4899', subscription:'#06b6d4', transfer:'#3b61f5' };
  const c = catColors[category] || '#6089ff';
  return (
    <div
      className="animate-fade-up"
      style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)', animationDelay:`${delay}ms`, transition:'background 150ms' }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.margin='0 -12px'; e.currentTarget.style.padding='12px 12px'; e.currentTarget.style.borderRadius='8px'; }}
      onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.margin=''; e.currentTarget.style.padding='12px 0'; e.currentTarget.style.borderRadius=''; }}
    >
      <div style={{ width:38,height:38,borderRadius:11,flexShrink:0,background:`${c}12`,border:`1px solid ${c}22`,display:'flex',alignItems:'center',justifyContent:'center' }}>
        {positive ? <ArrowDownLeft size={15} color={c} /> : <ArrowUpRight size={15} color={c} />}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{label}</div>
        <div style={{ fontSize:10,color:'var(--text-muted)' }}>{sub}</div>
      </div>
      <div style={{ textAlign:'right',flexShrink:0 }}>
        <div style={{ fontSize:13,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:positive?'#10b981':'var(--text-primary)' }}>
          {positive?'+':'-'}{amount}
        </div>
        <div style={{ fontSize:9,color:'var(--text-muted)',marginTop:1,textTransform:'capitalize' }}>{category}</div>
      </div>
    </div>
  );
};

// ─── Logged-In Home ────────────────────────────────────────────────────────────
const LoggedInHome = ({ user, isAdmin, navigate }) => {
  const [revealed, setRevealed] = useState(false);
  const [animStart, setAnimStart] = useState(false);
  const [visible, setVisible] = useState(false);

  const avatarPalette = ['#3b61f5','#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4'];
  const avatarColor = user?.username ? avatarPalette[user.username.charCodeAt(0) % avatarPalette.length] : '#3b61f5';
  const initials = user?.username ? user.username.slice(0,2).toUpperCase() : 'U';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setAnimStart(true), 200);
    return () => clearTimeout(t);
  }, []);

  const KPIS = [
    { label:'Available Credit',  value:'₹84,500', sub:'↑ ₹12K this month', subPos:true,  color:'#3b61f5', icon:CreditCard,  delay:0,   sparkData:[40,55,48,70,62,78,84] },
    { label:'Total Spent',       value:'₹23,140', sub:'↑ 8.2% vs last mo',  subPos:false, color:'#8b5cf6', icon:TrendingUp,  delay:80,  sparkData:[30,45,38,55,60,48,70] },
    { label:'Active Cards',      value:'3',        sub:'1 expiring soon',    subPos:false, color:'#10b981', icon:Zap,         delay:160, sparkData:[2,2,3,3,2,3,3] },
    { label:'Reward Points',     value:'4,820',    sub:'≈ ₹482 cashback',   subPos:true,  color:'#f59e0b', icon:Gift,        delay:240, sparkData:[2000,2600,3100,3800,4200,4600,4820] },
  ];

  const SPENDS = [
    { label:'Shopping', pct:68, color:'#3b61f5', amount:'₹8,240', delay:600 },
    { label:'Dining',   pct:42, color:'#8b5cf6', amount:'₹4,820', delay:700 },
    { label:'Travel',   pct:29, color:'#10b981', amount:'₹3,500', delay:800 },
    { label:'Utilities',pct:18, color:'#f59e0b', amount:'₹2,100', delay:900 },
  ];

  const TXS = [
    { label:'Salary Credit',   sub:'Today, 9:00 AM',     amount:'₹62,000', positive:true,  category:'salary'       },
    { label:'Swiggy Order',    sub:'Today, 1:22 PM',      amount:'₹340',    positive:false, category:'food'         },
    { label:'Amazon Purchase', sub:'Yesterday, 6:45 PM',  amount:'₹2,199',  positive:false, category:'shopping'     },
    { label:'Cashback Reward', sub:'Yesterday, 12:00 PM', amount:'₹150',    positive:true,  category:'reward'       },
    { label:'Netflix',         sub:'Apr 7, 10:00 AM',     amount:'₹649',    positive:false, category:'subscription' },
    { label:'UPI Received',    sub:'Apr 5, 3:15 PM',      amount:'₹5,000',  positive:true,  category:'transfer'     },
  ];

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', paddingTop:88, paddingBottom:60, opacity:visible?1:0, transition:'opacity 350ms ease' }}>

      {/* Ambient glows */}
      <div style={{ position:'fixed',top:'0%',left:'-10%',width:700,height:700,background:`radial-gradient(circle,${avatarColor}0d 0%,transparent 60%)`,borderRadius:'50%',pointerEvents:'none',zIndex:0 }} />
      <div style={{ position:'fixed',bottom:'0%',right:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 60%)',borderRadius:'50%',pointerEvents:'none',zIndex:0 }} />
      <div style={{ position:'fixed',top:'45%',left:'30%',width:400,height:400,background:'radial-gradient(circle,rgba(16,185,129,0.04) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none',zIndex:0 }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ position:'relative',zIndex:1 }}>

        {/* ── GREETING HEADER ── */}
        <div className="animate-fade-up" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:32 }}>
          <div style={{ display:'flex',alignItems:'center',gap:16 }}>
            {/* Pulsing avatar */}
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute',inset:-5,borderRadius:'50%',background:`${avatarColor}20`,animation:'pulse-glow 2.8s ease-in-out infinite' }} />
              <div style={{ width:58,height:58,borderRadius:'50%',background:`linear-gradient(145deg,${avatarColor},${avatarColor}bb)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff',fontFamily:'Sora,sans-serif',position:'relative',zIndex:1,boxShadow:`0 8px 28px ${avatarColor}55` }}>
                {initials}
              </div>
              <div style={{ position:'absolute',bottom:2,right:2,width:14,height:14,borderRadius:'50%',background:'#10b981',border:'2.5px solid #080c14',zIndex:2,boxShadow:'0 0 8px rgba(16,185,129,0.7)' }} />
            </div>
            <div>
              <div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:3,display:'flex',alignItems:'center',gap:8 }}>
                <span>{greeting} {greetEmoji}</span>
                {isAdmin && <span style={{ fontSize:9,fontWeight:700,color:'#f59e0b',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:20,padding:'1px 8px',letterSpacing:'0.06em' }}>⭐ ADMIN</span>}
              </div>
              <h1 style={{ fontSize:'clamp(1.4rem,3vw,2rem)',margin:0,letterSpacing:'-0.03em',lineHeight:1.1,color:'var(--text-primary)' }}>
                {user?.username || 'User'}'s{' '}
                <span className="gradient-text">Financial Hub</span>
              </h1>
              <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:4,display:'flex',alignItems:'center',gap:6 }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px rgba(16,185,129,0.8)' }} />
                All systems operational
              </div>
            </div>
          </div>

          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ fontSize:13,padding:'10px 16px',gap:7 }}>
              <Bell size={14} /> Notifications
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary animate-pulse-glow" style={{ fontSize:13,padding:'10px 20px' }}>
              <LayoutDashboard size={15} /> Open Dashboard <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── KPI GRID ── */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:24 }}>
          {KPIS.map((k,i) => <KPI key={i} {...k} animStart={animStart} />)}
        </div>

        {/* ── MAIN 3-COL GRID ── */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 320px',gap:18,alignItems:'start' }}>

          {/* COL 1 — Card + Spend Breakdown */}
          <div style={{ display:'flex',flexDirection:'column',gap:18 }}>

            {/* Virtual Card panel */}
            <div className="animate-fade-up delay-200" style={{ padding:22,borderRadius:20,background:'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 28px rgba(0,0,0,0.4)' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase' }}>My Virtual Card</div>
                  <div style={{ fontSize:10,color:'var(--text-muted)',marginTop:2 }}>Click to reveal/hide details</div>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{ fontSize:11,color:'var(--brand-400)',background:'rgba(59,97,245,0.1)',border:'1px solid rgba(59,97,245,0.2)',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontFamily:'Sora,sans-serif',fontWeight:600,display:'flex',alignItems:'center',gap:4 }}>
                  Manage <ArrowRight size={10} />
                </button>
              </div>
              <VCard name={user?.username} last4="7234" revealed={revealed} onToggle={() => setRevealed(r=>!r)} />
              {/* Credit usage bar */}
              <div style={{ marginTop:18 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                  <span style={{ fontSize:11,color:'var(--text-muted)' }}>Credit Used</span>
                  <span style={{ fontSize:11,fontWeight:700,color:'var(--text-primary)',fontFamily:'JetBrains Mono,monospace' }}>₹23,140 / ₹1,00,000</span>
                </div>
                <div style={{ height:5,borderRadius:99,background:'rgba(255,255,255,0.06)',overflow:'hidden' }}>
                  <div style={{ height:'100%',width:'23.14%',borderRadius:99,background:'linear-gradient(90deg,#3b61f5,#8b5cf6)',boxShadow:'0 0 10px rgba(59,97,245,0.5)',transition:'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
                  <span style={{ fontSize:10,color:'#10b981',fontWeight:600 }}>23% used</span>
                  <span style={{ fontSize:10,color:'var(--text-muted)' }}>₹76,860 available</span>
                </div>
              </div>
            </div>

            {/* Spend breakdown */}
            <div className="animate-fade-up delay-300" style={{ padding:22,borderRadius:20,background:'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 28px rgba(0,0,0,0.4)' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
                <div style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase' }}>Spend by Category</div>
                <span style={{ fontSize:10,color:'var(--text-muted)',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'3px 8px' }}>This month</span>
              </div>
              {SPENDS.map(({ label,pct,color,amount,delay },i) => (
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:5 }}>
                    <span style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:500,width:65,flexShrink:0 }}>{label}</span>
                    <Bar pct={pct} color={color} delay={delay} />
                    <span style={{ fontSize:11,fontWeight:700,color:'var(--text-primary)',fontFamily:'JetBrains Mono,monospace',width:60,textAlign:'right',flexShrink:0 }}>{amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2 — Recent Transactions */}
          <div className="animate-fade-up delay-200" style={{ padding:22,borderRadius:20,background:'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 28px rgba(0,0,0,0.4)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
              <div style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase' }}>Recent Activity</div>
              <button onClick={() => navigate('/dashboard')} style={{ fontSize:11,color:'var(--brand-400)',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'Sora,sans-serif',fontWeight:600 }}>
                View all <ArrowRight size={10} />
              </button>
            </div>
            <div>
              {TXS.map((tx,i) => <TxRow key={i} {...tx} delay={280+i*55} />)}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ width:'100%',marginTop:16,padding:'11px',borderRadius:10,background:'rgba(59,97,245,0.07)',border:'1px solid rgba(59,97,245,0.15)',color:'var(--brand-400)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all 200ms' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(59,97,245,0.13)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(59,97,245,0.07)'}
            >
              <Activity size={13} /> All Transactions
            </button>
          </div>

          {/* COL 3 — Quick Actions + Rewards + Security */}
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

            {/* Quick Actions */}
            <div className="animate-fade-up delay-300" style={{ padding:20,borderRadius:20,background:'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 28px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                {[
                  { icon:Plus,         label:'New Card',  color:'#3b61f5' },
                  { icon:ArrowUpRight, label:'Pay Bill',  color:'#8b5cf6' },
                  { icon:TrendingUp,   label:'Analytics', color:'#10b981' },
                  { icon:Shield,       label:'KYC',       color:'#f59e0b' },
                  { icon:Gift,         label:'Rewards',   color:'#ec4899' },
                  { icon:Bell,         label:'Alerts',    color:'#06b6d4' },
                ].map(({ icon:Icon,label,color },i) => (
                  <button
                    key={label}
                    onClick={() => navigate('/dashboard')}
                    style={{ padding:'12px 8px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all 200ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}30`; e.currentTarget.style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='none'; }}
                  >
                    <div style={{ width:32,height:32,borderRadius:9,background:`${color}18`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <Icon size={14} color={color} />
                    </div>
                    <span style={{ fontSize:10,fontWeight:600,color:'var(--text-secondary)',fontFamily:'Sora,sans-serif' }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="animate-fade-up delay-400" style={{ padding:20,borderRadius:20,position:'relative',overflow:'hidden',background:'linear-gradient(145deg,#130a2e,#0a0518)',border:'1px solid rgba(139,92,246,0.25)',boxShadow:'0 4px 28px rgba(0,0,0,0.5),0 0 50px rgba(139,92,246,0.07)' }}>
              <div style={{ position:'absolute',top:-40,right:-40,width:150,height:150,borderRadius:'50%',background:'rgba(139,92,246,0.18)',filter:'blur(40px)',pointerEvents:'none' }} />
              <div style={{ position:'absolute',bottom:-20,left:-20,width:100,height:100,borderRadius:'50%',background:'rgba(236,72,153,0.12)',filter:'blur(30px)',pointerEvents:'none' }} />
              <div style={{ position:'relative',zIndex:1 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:9,fontWeight:700,color:'rgba(167,139,250,0.8)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4 }}>Rewards Balance</div>
                    <div style={{ fontSize:'1.75rem',fontWeight:800,fontFamily:'Sora,sans-serif',letterSpacing:'-0.03em',color:'#fff',lineHeight:1 }}>
                      4,820 <span style={{ fontSize:12,color:'rgba(255,255,255,0.35)',fontWeight:400 }}>pts</span>
                    </div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:4 }}>≈ ₹482 cashback value</div>
                  </div>
                  <div style={{ width:38,height:38,borderRadius:10,background:'rgba(139,92,246,0.2)',border:'1px solid rgba(139,92,246,0.35)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <Sparkles size={16} color="#c4b5fd" />
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                    <span style={{ fontSize:9,color:'rgba(255,255,255,0.35)' }}>Next tier: 6,000 pts</span>
                    <span style={{ fontSize:9,color:'#a78bfa',fontWeight:700 }}>80%</span>
                  </div>
                  <div style={{ height:4,borderRadius:99,background:'rgba(255,255,255,0.08)' }}>
                    <div style={{ height:'100%',width:'80%',borderRadius:99,background:'linear-gradient(90deg,#7c3aed,#ec4899)',boxShadow:'0 0 12px rgba(124,58,237,0.6)',transition:'width 1.3s cubic-bezier(0.16,1,0.3,1)' }} />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ width:'100%',padding:'10px',borderRadius:10,background:'rgba(139,92,246,0.18)',border:'1px solid rgba(139,92,246,0.3)',color:'#c4b5fd',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'Sora,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all 200ms' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.28)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.18)'}
                >
                  <Gift size={12} /> Redeem Points
                </button>
              </div>
            </div>

            {/* Security badge */}
            <div className="animate-fade-up delay-500" style={{ padding:'16px 18px',borderRadius:16,background:'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))',border:'1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Shield size={15} color="#10b981" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:'var(--text-primary)',marginBottom:1 }}>Account Secured</div>
                  <div style={{ fontSize:10,color:'var(--text-muted)' }}>KYC verified · 2FA active</div>
                </div>
                <div style={{ width:8,height:8,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px rgba(16,185,129,0.7)',flexShrink:0,animation:'pulse-glow 2.2s ease-in-out infinite' }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-glow {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.6; transform:scale(1.15); }
        }
      `}</style>
    </div>
  );
};

// ─── Public Home ───────────────────────────────────────────────────────────────
const STATS = [
  { label:'Active Users',          value:'12K+' },
  { label:'Transactions Processed',value:'$2.4M'},
  { label:'Cards Issued',          value:'38K+' },
  { label:'Uptime',                value:'99.9%'},
];
const FEATURES = [
  { title:'Secure Identity',    desc:'KYC uploads & JWT auth for verified access.',       color:'#10b981' },
  { title:'Virtual Cards',      desc:'Issue 16-digit cards, set limits, freeze instantly.',color:'#3b61f5' },
  { title:'Smart Transactions', desc:'Real-time spend tracking & refund processing.',      color:'#f59e0b' },
  { title:'Billing & Payments', desc:'Monthly bills, partial payments, full history.',     color:'#8b5cf6' },
  { title:'Rewards System',     desc:'Earn points on every purchase, redeem anytime.',     color:'#ec4899' },
  { title:'Instant Alerts',     desc:'Email & in-app notifications for all activity.',     color:'#06b6d4' },
];

const PublicHome = ({ navigate }) => (
  <div className="relative min-h-[calc(100vh-64px)]" style={{ paddingTop:64 }}>
    <div style={{ position:'fixed',top:'-10%',left:'-5%',width:500,height:500,background:'radial-gradient(circle,rgba(59,97,245,0.12) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0 }} />
    <div style={{ position:'fixed',bottom:'10%',right:'-5%',width:400,height:400,background:'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0 }} />
    <div className="relative" style={{ zIndex:1 }}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
        <div className="animate-fade-up flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background:'rgba(59,97,245,0.12)',border:'1px solid rgba(59,97,245,0.25)',fontSize:12,fontWeight:600,color:'var(--brand-400)',fontFamily:'Sora,sans-serif',letterSpacing:'0.04em' }}>
            <Lock size={11} /> BANK-GRADE SECURITY · TRUSTED BY 12K+ USERS
          </span>
        </div>
        <h1 className="animate-fade-up delay-100" style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)',maxWidth:780,margin:'0 auto 20px' }}>
          The Modern <span className="gradient-text">Virtual Card</span> Platform
        </h1>
        <p className="animate-fade-up delay-200" style={{ fontSize:18,color:'var(--text-secondary)',maxWidth:520,margin:'0 auto 36px',lineHeight:1.7 }}>
          Issue, manage, and control virtual credit cards with enterprise-grade security and real-time insights.
        </p>
        <div className="animate-fade-up delay-300 flex items-center justify-center gap-3 flex-wrap">
          <button className="btn-primary" style={{ fontSize:15,padding:'14px 28px' }} onClick={() => navigate('/register')}>Get Started Free <ArrowRight size={16} /></button>
          <button className="btn-secondary" style={{ fontSize:15,padding:'14px 28px' }} onClick={() => navigate('/features')}>See Features</button>
        </div>
        <div className="animate-fade-up delay-400 flex justify-center mt-16">
          <div className="animate-float" style={{ width:340,height:200,borderRadius:20,background:'linear-gradient(135deg,#1a1f3c,#0f1420)',border:'1px solid rgba(255,255,255,0.12)',boxShadow:'0 20px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.08)',padding:28,display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.06),transparent 50%)',borderRadius:20 }} />
            <div style={{ position:'absolute',top:24,right:24,width:40,height:40,borderRadius:'50%',background:'rgba(59,97,245,0.3)',border:'2px solid rgba(59,97,245,0.5)' }} />
            <div style={{ position:'absolute',top:24,right:44,width:40,height:40,borderRadius:'50%',background:'rgba(255,200,50,0.25)',border:'2px solid rgba(255,200,50,0.4)' }} />
            <div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.5)',letterSpacing:'0.08em' }}>CREDIFY VIRTUAL</div>
            <div>
              <div style={{ fontFamily:'JetBrains Mono,monospace',fontSize:15,color:'rgba(255,255,255,0.8)',letterSpacing:'0.2em',marginBottom:12 }}>4829 •••• •••• 7234</div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <div><div style={{ fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2 }}>Card Holder</div><div style={{ fontFamily:'Sora,sans-serif',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.8)' }}>John Doe</div></div>
                <div><div style={{ fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2 }}>Expires</div><div style={{ fontFamily:'JetBrains Mono,monospace',fontSize:13,color:'rgba(255,255,255,0.8)' }}>12/28</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="glass-card" style={{ padding:'20px 32px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label,value },i) => (
              <div key={i} className={`animate-fade-up delay-${(i+1)*100} text-center`}>
                <div style={{ fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:800,fontFamily:'Sora,sans-serif',color:'var(--text-primary)',letterSpacing:'-0.03em' }}>{value}</div>
                <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:2,fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-14 animate-fade-up">
          <p style={{ fontSize:11,fontWeight:700,color:'var(--brand-400)',letterSpacing:'0.1em',fontFamily:'Sora,sans-serif',marginBottom:8,textTransform:'uppercase' }}>Why Credify</p>
          <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.75rem)',margin:'0 auto 12px',maxWidth:500 }}>Everything you need</h2>
          <p style={{ color:'var(--text-secondary)',maxWidth:400,margin:'0 auto',fontSize:15 }}>Built for individuals who need secure virtual card infrastructure.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ title,desc,color },i) => (
            <div key={i} className={`glass-card animate-fade-up delay-${(i%6+1)*100}`} style={{ padding:24 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:color,boxShadow:`0 0 8px ${color}`,marginBottom:14 }} />
              <h3 style={{ fontSize:15,marginBottom:7,fontWeight:700 }}>{title}</h3>
              <p style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.65,margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="glass-card text-center animate-fade-up mt-12" style={{ padding:'56px 32px',position:'relative' }}>
          <div style={{ position:'absolute',inset:0,borderRadius:16,background:'radial-gradient(ellipse at 50% 0%,rgba(59,97,245,0.12),transparent 60%)',pointerEvents:'none' }} />
          <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)',marginBottom:12 }}>Ready to get started?</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:16,maxWidth:400,margin:'0 auto 28px' }}>Join thousands managing their virtual cards with Credify.</p>
          <button className="btn-primary" style={{ fontSize:15,padding:'14px 32px' }} onClick={() => navigate('/register')}>Create Free Account <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  </div>
);

// ─── Root ──────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  return user ? <LoggedInHome user={user} isAdmin={isAdmin} navigate={navigate} /> : <PublicHome navigate={navigate} />;
};

export default Home;