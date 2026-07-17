// src/features/dashboard/SectionContent.jsx
// Finance-ops section panels for each sidebar item.
// All data is mocked where real API fields don't exist yet.

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw,
  ArrowUpRight, ArrowDownLeft, Zap, Shield, FileText,
  TrendingUp, TrendingDown, BarChart3, Activity, Filter,
  Download, ChevronRight, Plus, Eye, RotateCcw, AlertOctagon,
  CheckSquare, GitMerge, Globe, User, Settings, BellRing, Bell,
} from 'lucide-react';
import { transactionAPI, userAPI } from '../../services/api';
import { Spinner, Badge, useToast, PageHeader, Card, EmptyState } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import { ApprovalStepper, OpsKpiStrip, StatusBadge } from '../../components/ops';
import { Tilt3D } from '../../components/cinema/TouchFX';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtINR  = n  => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = d  => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

// ── Shared mini sparkline ─────────────────────────────────────────────────────
const Spark = ({ data, color, h=32 }) => {
  const w=100, min=Math.min(...data), max=Math.max(...data);
  const pts=data.map((v,i)=>{ const x=(i/(data.length-1))*w; const y=h-((v-min)/(max-min||1))*(h-4)-2; return `${x},${y}`; }).join(' ');
  const id=`s${color.replace('#','')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%',height:h }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ── MetricCard ────────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, delta, positive, color, icon: Icon, spark }) => (
  <Tilt3D strength={6} pop={16} style={{ borderRadius:18 }}>
  <div style={{ padding:'18px 20px',borderRadius:18,background:'var(--dash-card-bg)',border:'1px solid var(--dash-card-border)',position:'relative',overflow:'hidden' }}>
    <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
      <div style={{ width:36,height:36,borderRadius:10,background:`${color}14`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={16} color={color} /></div>
      <div style={{ width:80 }}>{spark && <Spark data={spark} color={color} />}</div>
    </div>
    <p style={{ fontSize:24,fontWeight:800,color:'var(--text-primary)',fontFamily:"'Sora',sans-serif",letterSpacing:'-0.02em',marginBottom:4 }}>{value}</p>
    <p style={{ fontSize:11,color:'var(--text-secondary)',marginBottom:6 }}>{label}</p>
    {delta && (
      <div style={{ display:'flex',alignItems:'center',gap:4 }}>
        {positive ? <TrendingUp size={11} color="#10b981"/> : <TrendingDown size={11} color="#f59e0b"/>}
        <span style={{ fontSize:11,fontWeight:600,color:positive?'#10b981':'#f59e0b' }}>{delta}</span>
      </div>
    )}
  </div>
  </Tilt3D>
);

// ══════════════════════════════════════════════════════════
// OVERVIEW PANELS
// ══════════════════════════════════════════════════════════

export function DashboardOverview() {
  const { user } = useAuthStore();
  const greeting = (() => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; })();
  const KPIS = [
    { id:'vol',   label:'Payment Volume (today)',  value:'₹4.2 Cr',  delta:'+12% vs yesterday', positive:true,  color:'#3b61f5',  Icon:Activity,  spark:[42,48,44,61,58,72,68,79,84,91] },
    { id:'queue', label:'Pending Approvals',        value:'7',         delta:'-3 from yesterday', positive:true,  color:'#f59e0b',  Icon:CheckSquare,spark:[14,12,18,9,11,7,10,8,9,7] },
    { id:'recon', label:'Recon Match Rate',         value:'99.1%',     delta:'3 mismatches open', positive:false, color:'#10b981',  Icon:GitMerge,  spark:[96,98,99,97,99,99,100,99,98,99] },
    { id:'hook',  label:'Webhooks (today)',          value:'1,482',     delta:'12 duplicates dropped',positive:true,color:'#06b6d4', Icon:Zap,       spark:[120,134,118,145,139,152,148,161,157,166] },
  ];
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:6,letterSpacing:'-0.02em' }}>
          {greeting}, {user?.username || 'Finance'}.
        </h1>
        <p style={{ fontSize:14,color:'var(--text-secondary)' }}>7 approvals need your attention today. Reconciliation last ran 2 hours ago.</p>
      </div>
      <OpsKpiStrip kpis={KPIS.map(k=>({ ...k, Icon:k.Icon }))} columns={4} />
      <div style={{ marginTop:24 }}>
        <GatewayHealthPanel />
      </div>
    </div>
  );
}

export function GatewayHealthPanel() {
  const gateways = [
    { name:'Razorpay', status:'operational', latency:'48ms', uptime:'99.98%', color:'#10b981' },
    { name:'Stripe',   status:'operational', latency:'62ms', uptime:'99.95%', color:'#10b981' },
  ];
  return (
    <div style={{ borderRadius:16,background:'var(--dash-card-bg)',border:'1px solid var(--dash-card-border)',padding:'20px',boxShadow:'var(--dash-card-shadow)' }}>
      <h3 style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:16,fontFamily:"'Sora',sans-serif" }}>Gateway Health</h3>
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {gateways.map(({ name, status, latency, uptime, color }) => (
          <div key={name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderRadius:10,background:'var(--bg-subtle)',border:`1px solid ${color}20` }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}` }} />
              <span style={{ fontSize:14,fontWeight:600,color:'var(--text-primary)' }}>{name}</span>
              <StatusBadge status={status === 'operational' ? 'delivered' : 'failed'} />
            </div>
            <div style={{ display:'flex',gap:24 }}>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:11,color:'var(--text-muted)' }}>Latency</p>
                <p style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)',fontFamily:"'JetBrains Mono',monospace" }}>{latency}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:11,color:'var(--text-muted)' }}>Uptime</p>
                <p style={{ fontSize:13,fontWeight:700,color:'#10b981',fontFamily:"'JetBrains Mono',monospace" }}>{uptime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LivePaymentFeed() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    transactionAPI.getAll({ page: 1 })
      .then(res => setTxns((res.data?.data?.results || res.data?.results || []).slice(0, 15)))
      .catch(() => {
        // Mock data when API not available
        setTxns([
          { id:1, description:'Vendor Payment — Acme Corp', amount:-25000, created_at: new Date().toISOString(), category:'vendor',   txn_type:'debit'  },
          { id:2, description:'Customer Refund — INV-8821',  amount:-3400,  created_at: new Date().toISOString(), category:'refund',   txn_type:'debit'  },
          { id:3, description:'Settlement Credit — Razorpay',amount: 84200, created_at: new Date().toISOString(), category:'settlement',txn_type:'credit' },
          { id:4, description:'Vendor Payment — TechServ',   amount:-12000, created_at: new Date().toISOString(), category:'vendor',   txn_type:'debit'  },
          { id:5, description:'Gateway Fee — Stripe',         amount:-840,   created_at: new Date().toISOString(), category:'fee',     txn_type:'debit'  },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:40, textAlign:'center' }}><Spinner /></div>;

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)' }}>Payment Feed</h2>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px #10b981',animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11,color:'#10b981',fontWeight:600 }}>Live</span>
        </div>
      </div>
      <div style={{ borderRadius:16,border:'1px solid var(--dash-card-border)',overflow:'hidden' }}>
        {txns.length === 0
          ? <div style={{ padding:40,textAlign:'center',color:'var(--text-muted)',fontSize:13 }}>No payments yet today.</div>
          : txns.map((t,i) => {
            const isCredit = Number(t.amount) > 0;
            return (
              <div key={t.id || i} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<txns.length-1?'1px solid var(--dash-row-divider)':'none',transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--dash-row-hover)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width:36,height:36,borderRadius:10,background:isCredit?'rgba(16,185,129,0.1)':'rgba(59,97,245,0.08)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {isCredit ? <ArrowDownLeft size={16} color="#10b981"/> : <ArrowUpRight size={16} color="#3b61f5"/>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{t.description || 'Payment'}</p>
                  <p style={{ fontSize:11,color:'var(--text-muted)' }}>{fmtDate(t.created_at)}</p>
                </div>
                <span style={{ fontSize:14,fontWeight:700,color:isCredit?'#10b981':'var(--text-primary)',fontFamily:"'JetBrains Mono',monospace",flexShrink:0 }}>
                  {isCredit?'+':'-'}{fmtINR(Math.abs(Number(t.amount)))}
                </span>
              </div>
            );
          })
        }
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// APPROVALS PANELS
// ══════════════════════════════════════════════════════════

const MOCK_APPROVALS = [
  { id:'APR-1041', vendor:'Acme Corp',        amount:250000,  tier:2, status:'pending',  sla:'1h 43m', requester:'Priya Sharma', created:'2h ago' },
  { id:'APR-1040', vendor:'TechServ Pvt Ltd', amount:89000,   tier:1, status:'pending',  sla:'0h 21m', requester:'Rahul Mehta',  created:'4h ago' },
  { id:'APR-1039', vendor:'LogiPack India',   amount:1450000, tier:3, status:'escalated',sla:'Overdue',requester:'Sunita Rao',   created:'1d ago' },
  { id:'APR-1038', vendor:'CloudBase Inc',    amount:42000,   tier:1, status:'approved', sla:'—',      requester:'Dev Iyer',     created:'1d ago' },
  { id:'APR-1037', vendor:'MediaLink',        amount:78500,   tier:2, status:'rejected', sla:'—',      requester:'Anita Singh',  created:'2d ago' },
];

export function ApprovalQueue() {
  const toast = useToast();
  const [approvals, setApprovals] = useState(MOCK_APPROVALS.filter(a => ['pending','escalated'].includes(a.status)));
  const [selected, setSelected] = useState(null);

  const handleApprove = (id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setSelected(null);
    toast.success(`Payment ${id} approved.`);
  };
  const handleReject = (id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setSelected(null);
    toast.error(`Payment ${id} rejected.`);
  };

  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:4 }}>Approval Queue</h2>
          <p style={{ fontSize:13,color:'var(--text-secondary)' }}>{approvals.length} payments awaiting approval</p>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:selected?'1fr 360px':'1fr',gap:20 }}>
        <div style={{ borderRadius:16,border:'1px solid var(--dash-card-border)',overflow:'hidden' }}>
          {approvals.length === 0 ? (
            <div style={{ padding:48,textAlign:'center' }}>
              <CheckCircle2 size={40} color="#10b981" style={{ marginBottom:12 }} />
              <p style={{ fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:6 }}>Queue is clear</p>
              <p style={{ fontSize:13,color:'var(--text-muted)' }}>No pending approvals right now.</p>
            </div>
          ) : approvals.map((apr,i) => (
            <div key={apr.id} onClick={() => setSelected(selected?.id===apr.id?null:apr)}
              style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<approvals.length-1?'1px solid var(--dash-row-divider)':'none',cursor:'pointer',background:selected?.id===apr.id?'rgba(59,97,245,0.06)':'transparent',transition:'background 0.15s' }}
              onMouseEnter={e=>{if(selected?.id!==apr.id)e.currentTarget.style.background='var(--dash-row-hover)';}}
              onMouseLeave={e=>{if(selected?.id!==apr.id)e.currentTarget.style.background='transparent';}}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)' }}>{apr.vendor}</span>
                  <StatusBadge status={apr.status} />
                </div>
                <div style={{ display:'flex',gap:16 }}>
                  <span style={{ fontSize:11,color:'var(--text-muted)' }}>Tier {apr.tier} approval</span>
                  <span style={{ fontSize:11,color:'var(--text-muted)' }}>By {apr.requester}</span>
                  <span style={{ fontSize:11,color:apr.sla==='Overdue'?'#ef4444':'var(--text-muted)',fontWeight:apr.sla==='Overdue'?700:400 }}>SLA: {apr.sla}</span>
                </div>
              </div>
              <span style={{ fontSize:16,fontWeight:800,color:'var(--text-primary)',fontFamily:"'Sora',sans-serif",flexShrink:0 }}>{fmtINR(apr.amount)}</span>
              <ChevronRight size={14} color="var(--text-muted)" />
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ borderRadius:16,border:'1px solid rgba(59,97,245,0.2)',padding:'20px',background:'rgba(59,97,245,0.03)' }}>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:12,color:'var(--text-muted)',marginBottom:4 }}>{selected.id} · {selected.requester}</p>
              <p style={{ fontSize:22,fontWeight:800,color:'var(--text-primary)',fontFamily:"'Sora',sans-serif",marginBottom:4 }}>{fmtINR(selected.amount)}</p>
              <p style={{ fontSize:13,color:'var(--text-secondary)' }}>{selected.vendor}</p>
            </div>
            <ApprovalStepper amount={fmtINR(selected.amount)} compact steps={[
              { role:'Auto-approve',    limit:'< ₹50K',  status: selected.amount<50000?'approved':'approved' },
              { role:'Finance Manager', limit:'₹50K–5L', status: selected.amount>=50000&&selected.amount<500000?'pending':'approved' },
              { role:'CFO',             limit:'> ₹5L',   status: selected.amount>=500000?'pending':'pending' },
            ]} />
            <div style={{ display:'flex',gap:10,marginTop:20 }}>
              <button onClick={() => handleApprove(selected.id)} className="btn-primary" style={{ flex:1,padding:'10px',justifyContent:'center',display:'flex',gap:6,alignItems:'center',fontSize:13 }}>
                <CheckCircle2 size={14}/> Approve
              </button>
              <button onClick={() => handleReject(selected.id)} style={{ flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.06)',color:'#ef4444',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:'flex',gap:6,alignItems:'center',justifyContent:'center' }}>
                <XCircle size={14}/> Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApprovalHistory() {
  return (
    <div>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:20 }}>Approval History</h2>
      <div style={{ borderRadius:16,border:'1px solid var(--dash-card-border)',overflow:'hidden' }}>
        {MOCK_APPROVALS.map((apr,i) => (
          <div key={apr.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<MOCK_APPROVALS.length-1?'1px solid var(--dash-row-divider)':'none' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
                <span style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)' }}>{apr.vendor}</span>
                <StatusBadge status={apr.status} />
              </div>
              <div style={{ display:'flex',gap:16 }}>
                <code style={{ fontSize:11,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{apr.id}</code>
                <span style={{ fontSize:11,color:'var(--text-muted)' }}>{apr.created}</span>
              </div>
            </div>
            <span style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)',fontFamily:"'JetBrains Mono',monospace" }}>{fmtINR(apr.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApprovalRules() {
  const rules = [
    { tier:1, label:'Auto-approve',    range:'< ₹50,000',      approver:'System',           active:true },
    { tier:2, label:'Manager review',  range:'₹50K – ₹5,00,000',approver:'Finance Manager',  active:true },
    { tier:3, label:'CFO approval',    range:'> ₹5,00,000',    approver:'CFO',              active:true },
  ];
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)' }}>Threshold Rules</h2>
        <button className="btn-primary" style={{ fontSize:12,padding:'8px 16px',display:'flex',alignItems:'center',gap:6 }}><Plus size={12}/>Add Rule</button>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {rules.map(({ tier, label, range, approver, active }) => (
          <div key={tier} style={{ padding:'18px 20px',borderRadius:14,background:'var(--dash-card-bg)',border:'1px solid var(--dash-card-border)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:32,height:32,borderRadius:10,background:'rgba(59,97,245,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#3b61f5',fontFamily:"'Sora',sans-serif" }}>{tier}</div>
                <div>
                  <p style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:3 }}>{label}</p>
                  <p style={{ fontSize:12,color:'var(--text-muted)' }}>{range} · Approver: {approver}</p>
                </div>
              </div>
              <div style={{ width:40,height:22,borderRadius:11,background:active?'#3b61f5':'var(--bg-subtle)',position:'relative',cursor:'pointer',transition:'all 0.2s' }}>
                <div style={{ width:16,height:16,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:active?20:4,transition:'left 0.2s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EscalationsPanel() {
  const escalated = MOCK_APPROVALS.filter(a => a.status === 'escalated');
  return (
    <div>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:6 }}>Escalations</h2>
      <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:20 }}>Payments where approval SLA was breached.</p>
      {escalated.length === 0 ? (
        <div style={{ padding:48,textAlign:'center',color:'var(--text-muted)' }}>No escalations — great work!</div>
      ) : escalated.map((apr,i) => (
        <div key={apr.id} style={{ padding:'16px 18px',borderRadius:14,border:'1px solid rgba(239,68,68,0.25)',background:'rgba(239,68,68,0.04)',marginBottom:10 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)' }}>{apr.vendor}</span>
            <StatusBadge status="escalated" />
          </div>
          <div style={{ display:'flex',gap:20 }}>
            <span style={{ fontSize:12,color:'var(--text-secondary)' }}>Amount: {fmtINR(apr.amount)}</span>
            <span style={{ fontSize:12,color:'#ef4444',fontWeight:600 }}>SLA: {apr.sla}</span>
            <span style={{ fontSize:12,color:'var(--text-muted)' }}>By: {apr.requester}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// RECONCILIATION PANELS
// ══════════════════════════════════════════════════════════

const MOCK_RECON = [
  { txn:'TXN-9901', desc:'Vendor — Acme Corp',    internal:45200,  gateway:45200,  diff:0,    status:'matched'  },
  { txn:'TXN-9900', desc:'Customer refund',         internal:12400,  gateway:12337,  diff:63,   status:'mismatch' },
  { txn:'TXN-9899', desc:'Subscription renewal',    internal:8750,   gateway:8750,   diff:0,    status:'matched'  },
  { txn:'TXN-9898', desc:'Settlement credit',        internal:180000, gateway:0,      diff:180000,status:'mismatch'},
  { txn:'TXN-9897', desc:'Vendor — TechServ',       internal:34500,  gateway:34500,  diff:0,    status:'matched'  },
  { txn:'TXN-9896', desc:'Gateway fee',              internal:840,    gateway:840,    diff:0,    status:'matched'  },
];

export function ReconLatest() {
  const mismatches = MOCK_RECON.filter(r => r.status === 'mismatch');
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:4 }}>Latest Reconciliation Run</h2>
          <p style={{ fontSize:13,color:'var(--text-secondary)' }}>Ran 2 hours ago · {MOCK_RECON.length} records · {mismatches.length} mismatches</p>
        </div>
        <div style={{ display:'flex',gap:10 }}>
          <button style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,border:'1px solid var(--border)',background:'transparent',color:'var(--text-secondary)',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}><Download size={13}/>Export</button>
          {mismatches.length > 0 && <StatusBadge status="mismatch" />}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24 }}>
        {[
          { label:'Matched',    value:MOCK_RECON.filter(r=>r.status==='matched').length,  color:'#10b981' },
          { label:'Mismatches', value:mismatches.length,                                   color:'#ef4444' },
          { label:'Match rate', value:`${Math.round((MOCK_RECON.filter(r=>r.status==='matched').length/MOCK_RECON.length)*100)}%`, color:'#3b61f5' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding:'14px 18px',borderRadius:14,background:'var(--dash-card-bg)',border:`1px solid ${color}20` }}>
            <p style={{ fontSize:24,fontWeight:800,color,fontFamily:"'Sora',sans-serif" }}>{value}</p>
            <p style={{ fontSize:12,color:'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ borderRadius:16,border:'1px solid var(--dash-card-border)',overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'var(--bg-subtle)' }}>{['Transaction','Description','Internal','Gateway','Diff','Status'].map(h=>(
            <th key={h} style={{ textAlign:'left',padding:'10px 14px',color:'var(--text-muted)',fontWeight:700,fontSize:10,letterSpacing:'0.06em',borderBottom:'1px solid var(--border)' }}>{h}</th>
          ))}</tr></thead>
          <tbody>{MOCK_RECON.map((r,i)=>(
            <tr key={r.txn} style={{ background:r.status==='mismatch'?'rgba(239,68,68,0.02)':'transparent',transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--dash-row-hover)'}
              onMouseLeave={e=>e.currentTarget.style.background=r.status==='mismatch'?'rgba(239,68,68,0.02)':'transparent'}>
              <td style={{ padding:'12px 14px',borderBottom:i<MOCK_RECON.length-1?'1px solid var(--dash-row-divider)':'none' }}><code style={{ fontSize:11,color:'var(--text-secondary)',fontFamily:"'JetBrains Mono',monospace" }}>{r.txn}</code></td>
              <td style={{ padding:'12px 14px',borderBottom:i<MOCK_RECON.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:13,color:'var(--text-secondary)' }}>{r.desc}</td>
              <td style={{ padding:'12px 14px',borderBottom:i<MOCK_RECON.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:13,fontWeight:600,color:'var(--text-primary)',fontFamily:"'JetBrains Mono',monospace" }}>{fmtINR(r.internal)}</td>
              <td style={{ padding:'12px 14px',borderBottom:i<MOCK_RECON.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:13,fontWeight:600,color:r.gateway?'var(--text-primary)':'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{r.gateway?fmtINR(r.gateway):'—'}</td>
              <td style={{ padding:'12px 14px',borderBottom:i<MOCK_RECON.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:13,fontWeight:700,color:r.diff===0?'#10b981':'#ef4444',fontFamily:"'JetBrains Mono',monospace" }}>{r.diff===0?'₹0':fmtINR(r.diff)}</td>
              <td style={{ padding:'12px 14px',borderBottom:i<MOCK_RECON.length-1?'1px solid var(--dash-row-divider)':'none' }}><StatusBadge status={r.status} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function ReconMismatches() {
  const toast = useToast();
  const mismatches = MOCK_RECON.filter(r => r.status === 'mismatch');
  return (
    <div>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:20 }}>Mismatches</h2>
      {mismatches.map((r,i) => (
        <div key={r.txn} style={{ padding:'18px 20px',borderRadius:14,border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.03)',marginBottom:10 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
            <div>
              <code style={{ fontSize:11,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{r.txn}</code>
              <p style={{ fontSize:14,fontWeight:600,color:'var(--text-primary)',marginTop:4 }}>{r.desc}</p>
              <div style={{ display:'flex',gap:16,marginTop:8 }}>
                <span style={{ fontSize:12,color:'var(--text-secondary)' }}>Internal: <strong>{fmtINR(r.internal)}</strong></span>
                <span style={{ fontSize:12,color:'var(--text-secondary)' }}>Gateway: <strong style={{ color:r.gateway?'inherit':'var(--text-muted)' }}>{r.gateway?fmtINR(r.gateway):'Missing'}</strong></span>
                <span style={{ fontSize:12,color:'#ef4444',fontWeight:700 }}>Diff: {fmtINR(r.diff)}</span>
              </div>
            </div>
            <button onClick={()=>toast.info(`Dispute raised for ${r.txn}`)} style={{ padding:'8px 14px',borderRadius:9,border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.06)',color:'#ef4444',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap' }}>
              Raise Dispute
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// WEBHOOK PANELS
// ══════════════════════════════════════════════════════════

const MOCK_WEBHOOKS = [
  { id:'pay_01HZ8A', type:'payment.captured',  gateway:'Razorpay', status:'delivered', ts:'14:23:01', ms:48  },
  { id:'pay_01HZ8A', type:'payment.captured',  gateway:'Razorpay', status:'duplicate', ts:'14:23:03', ms:4   },
  { id:'ord_09XK2F', type:'order.paid',         gateway:'Razorpay', status:'delivered', ts:'14:22:47', ms:61  },
  { id:'ref_07BN1C', type:'refund.processed',   gateway:'Stripe',   status:'delivered', ts:'14:22:31', ms:39  },
  { id:'pay_03DM5E', type:'payment.failed',     gateway:'Stripe',   status:'failed',    ts:'14:22:18', ms:112 },
  { id:'sub_12KX9D', type:'subscription.created',gateway:'Stripe',  status:'delivered', ts:'14:21:55', ms:55  },
  { id:'cus_44BQ1A', type:'customer.updated',   gateway:'Stripe',   status:'delivered', ts:'14:21:40', ms:44  },
];

export function WebhookEventLog() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? MOCK_WEBHOOKS : MOCK_WEBHOOKS.filter(w => w.status === filter);
  return (
    <div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:4 }}>Webhook Event Log</h2>
          <p style={{ fontSize:13,color:'var(--text-secondary)' }}>1 duplicate dropped today · 1,482 delivered</p>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          {['all','delivered','duplicate','failed'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:'5px 12px',borderRadius:8,border:`1px solid ${filter===f?'rgba(59,97,245,0.4)':'var(--border)'}`,background:filter===f?'rgba(59,97,245,0.1)':'transparent',color:filter===f?'#3b61f5':'var(--text-muted)',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:"'Sora',sans-serif",textTransform:'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius:16,border:'1px solid var(--dash-card-border)',overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'var(--bg-subtle)' }}>{['Status','Event Type','Event ID','Gateway','Time','Latency'].map(h=>(
            <th key={h} style={{ textAlign:'left',padding:'10px 14px',color:'var(--text-muted)',fontWeight:700,fontSize:10,letterSpacing:'0.06em',borderBottom:'1px solid var(--border)' }}>{h}</th>
          ))}</tr></thead>
          <tbody>{filtered.map((ev,i)=>(
            <tr key={i} style={{ transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--dash-row-hover)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding:'11px 14px',borderBottom:i<filtered.length-1?'1px solid var(--dash-row-divider)':'none' }}><StatusBadge status={ev.status} /></td>
              <td style={{ padding:'11px 14px',borderBottom:i<filtered.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:12,fontWeight:600,color:'var(--text-primary)' }}>{ev.type}</td>
              <td style={{ padding:'11px 14px',borderBottom:i<filtered.length-1?'1px solid var(--dash-row-divider)':'none' }}><code style={{ fontSize:11,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{ev.id}</code></td>
              <td style={{ padding:'11px 14px',borderBottom:i<filtered.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:12,color:'var(--text-secondary)' }}>{ev.gateway}</td>
              <td style={{ padding:'11px 14px',borderBottom:i<filtered.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:11,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{ev.ts}</td>
              <td style={{ padding:'11px 14px',borderBottom:i<filtered.length-1?'1px solid var(--dash-row-divider)':'none',fontSize:11,color:ev.status==='duplicate'?'#10b981':'var(--text-secondary)',fontFamily:"'JetBrains Mono',monospace" }}>
                {ev.status==='duplicate'?`${ev.ms}ms (dropped)`:`${ev.ms}ms`}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function WebhookDuplicates() {
  const dupes = MOCK_WEBHOOKS.filter(w => w.status === 'duplicate');
  return (
    <div>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:6 }}>Duplicates Dropped</h2>
      <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:20 }}>Events detected as duplicates by event ID fingerprinting and silently discarded.</p>
      <div style={{ padding:'16px 20px',borderRadius:14,background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',marginBottom:20 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <CheckCircle2 size={18} color="#10b981" />
          <div>
            <p style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)' }}>12 duplicates dropped today</p>
            <p style={{ fontSize:12,color:'var(--text-secondary)' }}>None reached your application. Avg detection: 4ms.</p>
          </div>
        </div>
      </div>
      {dupes.map((ev,i) => (
        <div key={i} style={{ padding:'14px 18px',borderRadius:12,background:'var(--dash-card-bg)',border:'1px solid var(--dash-card-border)',marginBottom:8 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <StatusBadge status="duplicate" />
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)' }}>{ev.type}</p>
              <code style={{ fontSize:10,color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace" }}>{ev.id}</code>
            </div>
            <span style={{ fontSize:11,color:'#10b981',fontWeight:600 }}>Dropped in {ev.ms}ms</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DeadLetterQueue() {
  return (
    <div>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:6 }}>Dead-Letter Queue</h2>
      <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:20 }}>Events that failed processing after 3 retries. Inspect and replay manually.</p>
      <div style={{ padding:48,textAlign:'center',borderRadius:16,border:'1px dashed var(--border)',color:'var(--text-muted)' }}>
        <CheckCircle2 size={36} color="#10b981" style={{ marginBottom:12 }} />
        <p style={{ fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:6 }}>DLQ is empty</p>
        <p style={{ fontSize:13 }}>All webhooks processed successfully.</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PROFILE PANELS
// ══════════════════════════════════════════════════════════
export function PersonalInfo() {
  const { user } = useAuthStore();
  return (
    <div style={{ maxWidth:520 }}>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:20 }}>Personal Info</h2>
      <div style={{ borderRadius:16,background:'var(--dash-card-bg)',border:'1px solid var(--dash-card-border)',padding:24 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:18 }}>
          {[
            { label:'Name',      value: user?.username || 'Finance User' },
            { label:'Email',     value: user?.email || 'user@company.com' },
            { label:'Role',      value: 'Finance Manager' },
            { label:'Company',   value: 'Biddano Pvt Ltd' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <p style={{ fontSize:10,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.07em' }}>{label.toUpperCase()}</p>
              <p style={{ fontSize:14,fontWeight:500,color:'var(--text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SecuritySettings() {
  return (
    <div style={{ maxWidth:520 }}>
      <h2 style={{ fontSize:18,fontWeight:700,fontFamily:"'Sora',sans-serif",color:'var(--text-primary)',marginBottom:20 }}>Security</h2>
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {[
          { title:'Change password',         desc:'Last changed 30 days ago',             color:'#3b61f5' },
          { title:'Two-factor authentication',desc:'Not enabled — strongly recommended',   color:'#f59e0b' },
          { title:'API key management',       desc:'3 active keys',                        color:'#10b981' },
          { title:'Session management',       desc:'1 active session',                     color:'#8b5cf6' },
        ].map(({ title, desc, color }) => (
          <div key={title} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderRadius:12,background:'var(--dash-card-bg)',border:'1px solid var(--dash-card-border)',cursor:'pointer' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${color}30`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--dash-card-border)';}}>
            <div>
              <p style={{ fontSize:14,fontWeight:600,color:'var(--text-primary)',marginBottom:4 }}>{title}</p>
              <p style={{ fontSize:12,color:'var(--text-secondary)' }}>{desc}</p>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Kept for backwards compat with old SectionContent imports
export function KYCStatus() { return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>KYC panel — available on the KYC page (/kyc).</div>; }
export function NotificationSettings() { return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Notification settings coming soon.</div>; }
export function SpendingSummary() { return <LivePaymentFeed />; }
export function QuickActionsPanel() { return <ApprovalQueue />; }
export function NotificationsPanel() { return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>No new notifications.</div>; }
export function AllTransactions() { return <LivePaymentFeed />; }
export function TransactionCategories() { return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Category breakdown coming soon.</div>; }
export function CurrentBill() { return <ReconLatest />; }
export function AutoPaySetup() { return <ApprovalRules />; }
export function SpendAnalytics() { return <DashboardOverview />; }
export function CreditScorePanel() { return <GatewayHealthPanel />; }
export function PointsBalance() { return <WebhookEventLog />; }
export function OffersPanel() { return <WebhookDuplicates />; }
export function HelpCenter() { return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Help centre — email support@credify.io</div>; }
export function MyTickets() { return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>No open tickets.</div>; }
