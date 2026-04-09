// src/features/dashboard/Dashboard.jsx
// Full user dashboard connected to all Credify APIs
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CreditCard, TrendingUp, Shield, Bell,
  Settings, LogOut, Plus, Eye, EyeOff, Zap, RefreshCw,
  Lock, Unlock, XCircle, CheckCircle2, ArrowUpRight, ArrowDownLeft,
  User, Upload, ChevronRight, MoreHorizontal, AlertTriangle
} from 'lucide-react';
import { cardAPI, transactionAPI, userAPI } from '../../services/api';
import {
  Spinner, Badge, Modal, Confirm, toast,
  KpiCard, PageHeader, DataTable, EmptyState, Field
} from '../../components/ui';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:'overview',     icon:LayoutDashboard, label:'Overview'      },
  { id:'cards',        icon:CreditCard,      label:'My Cards'      },
  { id:'transactions', icon:TrendingUp,      label:'Transactions'  },
  { id:'kyc',          icon:Shield,          label:'KYC & Security'},
  { id:'profile',      icon:User,            label:'Profile'       },
  { id:'notifications',icon:Bell,            label:'Notifications' },
];

const Sidebar = ({ active, setActive, onLogout }) => (
  <aside className="sidebar hidden lg:flex flex-col" style={{ width:220, flexShrink:0, padding:'24px 10px' }}>
    <div style={{ display:'flex',alignItems:'center',gap:8,padding:'0 12px',marginBottom:28 }}>
      <div style={{ width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#3b61f5,#1d37cc)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <CreditCard size={14} color="#fff"/>
      </div>
      <span style={{ fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:16,letterSpacing:'-0.03em' }}>Credify</span>
    </div>
    <p style={{ fontSize:9,fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.1em',padding:'0 12px',marginBottom:8,textTransform:'uppercase' }}>Menu</p>
    <nav style={{ flex:1,display:'flex',flexDirection:'column',gap:2 }}>
      {NAV.map(({ id,icon:Icon,label }) => (
        <button key={id} onClick={() => setActive(id)}
          className={`sidebar-link ${active===id?'active':''}`}
          style={{ background:'none',border:'none' }}>
          <Icon size={15} style={{ flexShrink:0 }}/><span style={{ flex:1 }}>{label}</span>
        </button>
      ))}
    </nav>
    <div style={{ borderTop:'1px solid var(--border)',paddingTop:12,marginTop:12 }}>
      <button onClick={onLogout} className="sidebar-link w-full" style={{ background:'none',border:'none',color:'#f87171' }}>
        <LogOut size={14}/> Sign Out
      </button>
    </div>
  </aside>
);

// ─── Virtual Card Visual ──────────────────────────────────────────────────────
const CardVisual = ({ card, revealed, onReveal, onAction }) => {
  const statusColor = { active:'#10b981', frozen:'#3b61f5', blocked:'#ef4444' }[card.status] || '#8b96b0';
  return (
    <div style={{ borderRadius:16,padding:22,background:'linear-gradient(135deg,#1a1f3c,#0f1420)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 12px 40px rgba(0,0,0,0.5)',position:'relative',overflow:'hidden',marginBottom:16 }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(135deg,rgba(255,255,255,0.06),transparent 50%)',borderRadius:16,pointerEvents:'none' }}/>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.4)',letterSpacing:'.1em',marginBottom:4 }}>CREDIFY {card.card_type?.toUpperCase()}</div>
          <Badge status={card.status} label={card.status} />
        </div>
        <button onClick={onReveal} style={{ display:'flex',alignItems:'center',gap:4,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:6,padding:'4px 8px',cursor:'pointer',color:'rgba(255,255,255,0.6)',fontSize:11 }}>
          {revealed ? <EyeOff size={12}/> : <Eye size={12}/>} {revealed?'Hide':'Show'}
        </button>
      </div>
      <div style={{ fontFamily:'JetBrains Mono,monospace',fontSize:14,color:'rgba(255,255,255,0.85)',letterSpacing:'0.18em',marginBottom:18 }}>
        {revealed ? card.card_number?.replace(/(.{4})/g,'$1 ').trim() : '•••• •••• •••• ' + (card.card_number?.slice(-4)||'****')}
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end' }}>
        <div><div style={{ fontSize:7,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2 }}>Holder</div><div style={{ fontFamily:'Sora,sans-serif',fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.8)' }}>{card.cardholder_name||'Card Holder'}</div></div>
        <div><div style={{ fontSize:7,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2 }}>CVV</div><div style={{ fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'rgba(255,255,255,0.8)' }}>{revealed?(card.cvv||'•••'):'•••'}</div></div>
        <div><div style={{ fontSize:7,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2 }}>Expires</div><div style={{ fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'rgba(255,255,255,0.8)' }}>{card.expiry_date||'MM/YY'}</div></div>
      </div>
      <div style={{ position:'absolute',top:16,right:16,width:36,height:36,borderRadius:'50%',background:'rgba(59,97,245,0.3)',border:'2px solid rgba(59,97,245,0.5)' }}/>
      <div style={{ position:'absolute',top:16,right:36,width:36,height:36,borderRadius:'50%',background:'rgba(255,200,50,0.2)',border:'2px solid rgba(255,200,50,0.35)' }}/>
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ cards, transactions, loading }) => {
  const totalBalance = cards.reduce((s,c) => s + (c.available_credit||0), 0);
  const totalSpend   = transactions.slice(0,10).reduce((s,t) => s + parseFloat(t.amount||0), 0);
  const activeCards  = cards.filter(c=>c.status==='active').length;

  return (
    <div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:24 }}>
        <KpiCard label="Available Credit" value={`₹${totalBalance.toLocaleString()}`} delta="+Active" deltaPos icon={CreditCard} color="#3b61f5" delay={0} />
        <KpiCard label="Active Cards"     value={activeCards} delta={`${cards.length} total`} deltaPos icon={Zap} color="#10b981" delay={100} />
        <KpiCard label="Recent Spend"     value={`₹${Math.abs(totalSpend).toFixed(0)}`} delta="Last 10 txns" deltaPos={false} icon={TrendingUp} color="#8b5cf6" delay={200} />
        <KpiCard label="Transactions"     value={transactions.length} delta="All time" deltaPos icon={ArrowUpRight} color="#f59e0b" delay={300} />
      </div>

      {/* Recent Transactions */}
      <div className="glass-card" style={{ padding:0,overflow:'hidden' }}>
        <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <h3 style={{ fontSize:15,fontWeight:700 }}>Recent Transactions</h3>
        </div>
        {loading ? <div style={{ padding:32,textAlign:'center' }}><Spinner/></div> :
          !transactions.length ? <EmptyState icon={TrendingUp} title="No transactions yet" desc="Transactions will appear here once you use a card." /> :
          <table className="data-table">
            <thead><tr><th>Merchant</th><th>Card</th><th>Status</th><th style={{ textAlign:'right' }}>Amount</th></tr></thead>
            <tbody>
              {transactions.slice(0,8).map((t,i) => (
                <tr key={i}>
                  <td><div style={{ fontWeight:500,color:'var(--text-primary)',fontSize:13 }}>{t.description||t.merchant||'Transaction'}</div><div style={{ fontSize:11,color:'var(--text-muted)' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</div></td>
                  <td style={{ fontSize:12 }}>•••• {t.card_number?.slice(-4)||'****'}</td>
                  <td><Badge status={t.status||'success'} label={t.status||'success'}/></td>
                  <td style={{ textAlign:'right',fontFamily:'JetBrains Mono,monospace',fontSize:13,fontWeight:700,color:parseFloat(t.amount)>0?'#34d399':'var(--text-primary)' }}>
                    {parseFloat(t.amount)>0?'+':''}{parseFloat(t.amount||0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
};

// ─── Cards Tab ────────────────────────────────────────────────────────────────
const CardsTab = ({ cards, onRefresh, loading }) => {
  const [revealed, setRevealed] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ card_type:'Basic',income:'',occupation:'',intended_use:'Shopping',is_single_use:false });

  const doAction = async (card, action) => {
    setActionLoading(s => ({ ...s, [card.id]:action }));
    try {
      await cardAPI[action](card.id);
      toast.success(`Card ${action}d successfully.`);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(s => ({ ...s, [card.id]:null }));
      setConfirm(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await cardAPI.createCard({ ...createForm, income: Number(createForm.income) });
      toast.success('Card request submitted! Awaiting admin approval.');
      setCreateModal(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="My Cards" subtitle={`${cards.length} card${cards.length!==1?'s':''} on your account`}
        actions={<button className="btn-primary" style={{ fontSize:13,padding:'9px 16px' }} onClick={() => setCreateModal(true)}><Plus size={14}/> Request Card</button>} />

      {loading ? <div style={{ textAlign:'center',padding:48 }}><Spinner size={28}/></div> :
        !cards.length ? <EmptyState icon={CreditCard} title="No cards yet" desc="Request your first virtual card to get started."
          action={{ label:'Request Card', fn:() => setCreateModal(true) }} /> :
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20 }}>
          {cards.map(card => (
            <div key={card.id} className="glass-card" style={{ padding:22 }}>
              <CardVisual card={card} revealed={!!revealed[card.id]}
                onReveal={() => setRevealed(s => ({ ...s, [card.id]:!s[card.id] }))}
                onAction={(a) => setConfirm({ card, action:a })} />
              {/* Card meta */}
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:14 }}>
                <span>Limit: <strong style={{ color:'var(--text-primary)' }}>₹{Number(card.credit_limit||0).toLocaleString()}</strong></span>
                <span>Available: <strong style={{ color:'#10b981' }}>₹{Number(card.available_credit||0).toLocaleString()}</strong></span>
              </div>
              {/* Credit usage bar */}
              <div style={{ marginBottom:16 }}>
                <div style={{ height:4,borderRadius:2,background:'rgba(255,255,255,0.08)',overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(100,((card.credit_limit-card.available_credit)/card.credit_limit)*100||0)}%`,height:'100%',borderRadius:2,background:'linear-gradient(90deg,#3b61f5,#8b5cf6)',transition:'width 600ms ease' }}/>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                {card.status==='active' && (
                  <button className="btn-secondary" style={{ fontSize:12,padding:'8px',borderRadius:8 }}
                    disabled={!!actionLoading[card.id]}
                    onClick={() => setConfirm({ card, action:'freeze', label:'Freeze', msg:'Freeze this card? Transactions will be paused.' })}>
                    {actionLoading[card.id]==='freeze'?<Spinner size={12}/>:<Lock size={12}/>} Freeze
                  </button>
                )}
                {card.status==='frozen' && (
                  <button className="btn-secondary" style={{ fontSize:12,padding:'8px',borderRadius:8 }}
                    disabled={!!actionLoading[card.id]}
                    onClick={() => doAction(card,'unfreeze')}>
                    {actionLoading[card.id]==='unfreeze'?<Spinner size={12}/>:<Unlock size={12}/>} Unfreeze
                  </button>
                )}
                {card.status!=='blocked' && (
                  <button style={{ fontSize:12,padding:'8px',borderRadius:8,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}
                    onClick={() => setConfirm({ card, action:'block', label:'Block', msg:'Block this card permanently? This cannot be undone.', danger:true })}>
                    <XCircle size={12}/> Block
                  </button>
                )}
                {card.status==='blocked' && (
                  <button className="btn-secondary" style={{ fontSize:12,padding:'8px',borderRadius:8 }}
                    onClick={() => doAction(card,'unblock')}>
                    <Unlock size={12}/> Unblock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      }

      {/* Confirm dialog */}
      <Confirm open={!!confirm} onClose={() => setConfirm(null)}
        title={confirm?.label||'Confirm Action'}
        message={confirm?.msg||'Are you sure?'}
        danger={confirm?.danger}
        loading={!!actionLoading[confirm?.card?.id]}
        onConfirm={() => doAction(confirm.card, confirm.action)} />

      {/* Create card modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Request Virtual Card" width={440}>
        <form onSubmit={handleCreate} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>Card Type</label>
            <select value={createForm.card_type} onChange={e=>setCreateForm(s=>({...s,card_type:e.target.value}))} className="input-field">
              {['Basic','Silver','Gold','Platinum'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Monthly Income (₹)" type="number" placeholder="50000" value={createForm.income} onChange={e=>setCreateForm(s=>({...s,income:e.target.value}))} required />
          <Field label="Occupation" type="text" placeholder="Engineer" value={createForm.occupation} onChange={e=>setCreateForm(s=>({...s,occupation:e.target.value}))} required />
          <Field label="Intended Use" type="text" placeholder="Shopping, Travel…" value={createForm.intended_use} onChange={e=>setCreateForm(s=>({...s,intended_use:e.target.value}))} required />
          <label style={{ display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--text-secondary)',cursor:'pointer' }}>
            <input type="checkbox" checked={createForm.is_single_use} onChange={e=>setCreateForm(s=>({...s,is_single_use:e.target.checked}))} />
            Single-use card
          </label>
          <button type="submit" className="btn-primary" style={{ marginTop:4,fontSize:14 }}>Submit Request <ChevronRight size={14}/></button>
        </form>
      </Modal>
    </div>
  );
};

// ─── Transactions Tab ─────────────────────────────────────────────────────────
const TransactionsTab = ({ cards, transactions, loading, onRefresh }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ card_id:'', amount:'', description:'' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transactionAPI.create({ ...form, card_id:Number(form.card_id), amount:Number(form.amount) });
      toast.success('Transaction created successfully!');
      setModal(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Transactions" subtitle="All card transactions"
        actions={
          <button className="btn-primary" style={{ fontSize:13,padding:'9px 16px' }} onClick={() => setModal(true)}>
            <Plus size={14}/> Simulate
          </button>
        } />

      <div className="glass-card" style={{ padding:0,overflow:'hidden' }}>
        {loading ? <div style={{ padding:48,textAlign:'center' }}><Spinner size={24}/></div> :
          !transactions.length ? <EmptyState icon={TrendingUp} title="No transactions" desc="Transactions appear here after you use a card." /> :
          <table className="data-table">
            <thead><tr><th>Description</th><th>Card</th><th>Date</th><th>Status</th><th style={{ textAlign:'right' }}>Amount</th></tr></thead>
            <tbody>
              {transactions.map((t,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:500,color:'var(--text-primary)',fontSize:13 }}>{t.description||t.merchant||'Transaction'}</td>
                  <td style={{ fontSize:12,fontFamily:'JetBrains Mono,monospace' }}>•••• {t.card_number?.slice(-4)||'****'}</td>
                  <td style={{ fontSize:12 }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                  <td><Badge status={t.status||'success'} label={t.status||'success'}/></td>
                  <td style={{ textAlign:'right',fontFamily:'JetBrains Mono,monospace',fontSize:13,fontWeight:700,color:parseFloat(t.amount)>=0?'#34d399':'var(--text-primary)' }}>
                    ₹{Math.abs(parseFloat(t.amount||0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Simulate Transaction" width={420}>
        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>Select Card</label>
            <select value={form.card_id} onChange={e=>setForm(s=>({...s,card_id:e.target.value}))} className="input-field" required>
              <option value="">Choose a card…</option>
              {cards.filter(c=>c.status==='active').map(c=><option key={c.id} value={c.id}>•••• {c.card_number?.slice(-4)} — {c.card_type}</option>)}
            </select>
          </div>
          <Field label="Amount (₹)" type="number" step="0.01" placeholder="100.00" value={form.amount} onChange={e=>setForm(s=>({...s,amount:e.target.value}))} required />
          <Field label="Description / Merchant" type="text" placeholder="Amazon, Zomato…" value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))} required />
          <button type="submit" disabled={submitting} className="btn-primary" style={{ marginTop:4,fontSize:14,opacity:submitting?0.75:1 }}>
            {submitting?<><Spinner size={15} color="#fff"/> Processing…</>:<>Process Transaction <ChevronRight size={14}/></>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

// ─── KYC Tab ──────────────────────────────────────────────────────────────────
const KYCTab = ({ user }) => {
  const [file, setFile]     = useState(null);
  const [status, setStatus] = useState('idle');
  const [drag, setDrag]     = useState(false);
  const inputRef = React.useRef();

  const handleFile = (f) => { if(f && f.size < 10*1024*1024) setFile(f); };
  const upload = async () => {
    if(!file) return;
    setStatus('uploading');
    const fd = new FormData();
    fd.append('document', file);
    try {
      await userAPI.uploadKYC(fd);
      setStatus('success');
      toast.success('KYC document submitted!');
    } catch(err) {
      setStatus('error');
      toast.error(err.message);
    }
  };

  const kycStatus = user?.kyc_status || 'unverified';
  return (
    <div style={{ maxWidth:520 }}>
      <PageHeader title="KYC & Security" subtitle="Verify your identity to unlock all features" />
      <div className="kpi-card animate-fade-up" style={{ marginBottom:20 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div><div style={{ fontSize:12,color:'var(--text-muted)',marginBottom:6 }}>KYC Status</div><Badge status={kycStatus} label={kycStatus.charAt(0).toUpperCase()+kycStatus.slice(1)}/></div>
          <Shield size={28} color={kycStatus==='verified'?'#10b981':'var(--text-muted)'}/>
        </div>
        {kycStatus==='verified' && <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:12 }}>Your identity has been verified. All features are unlocked.</p>}
        {kycStatus==='unverified' && <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:12 }}>Upload a government-issued ID to verify your identity and unlock higher card limits.</p>}
      </div>

      {status==='success' ? (
        <div className="glass-card animate-fade-in" style={{ padding:32,textAlign:'center' }}>
          <CheckCircle2 size={44} color="#10b981" style={{ margin:'0 auto 12px' }}/>
          <h3 style={{ fontSize:17,marginBottom:8 }}>Document Submitted</h3>
          <p style={{ color:'var(--text-secondary)',fontSize:13 }}>We'll review it within 24 hours and notify you by email.</p>
        </div>
      ) : (
        <div className="glass-card animate-fade-up delay-100" style={{ padding:24 }}>
          <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
            onClick={() => inputRef.current?.click()}
            style={{ border:`2px dashed ${drag?'var(--brand-500)':file?'#10b981':'rgba(255,255,255,0.1)'}`,borderRadius:12,padding:'32px 20px',textAlign:'center',cursor:'pointer',background:drag?'rgba(59,97,245,0.06)':file?'rgba(16,185,129,0.04)':'rgba(255,255,255,0.02)',transition:'all 200ms',marginBottom:16 }}>
            <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
            {file ? (
              <div><CheckCircle2 size={28} color="#10b981" style={{ margin:'0 auto 8px' }}/><p style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)' }}>{file.name}</p><p style={{ fontSize:11,color:'var(--text-muted)' }}>{(file.size/1024).toFixed(0)} KB</p></div>
            ) : (
              <div><Upload size={26} color="var(--text-muted)" style={{ margin:'0 auto 10px' }}/><p style={{ fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:4 }}>Drop document here</p><p style={{ fontSize:11,color:'var(--text-muted)' }}>JPG, PNG, PDF · Max 10MB</p></div>
            )}
          </div>
          {status==='error' && <div className="animate-fade-in flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:13 }}><AlertTriangle size={14}/>Upload failed. Try again.</div>}
          <button className="btn-primary w-full" disabled={!file||status==='uploading'} onClick={upload} style={{ fontSize:14,opacity:(!file||status==='uploading')?0.6:1 }}>
            {status==='uploading'?<><Spinner size={15} color="#fff"/>Uploading…</>:<><Upload size={14}/>Submit Document</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────
const ProfileTab = ({ user, onUpdate }) => {
  const [form, setForm] = useState({ phone_number: user?.phone_number||'', address: user?.address||'' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile(form);
      onUpdate(form);
      toast.success('Profile updated!');
    } catch(err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:480 }}>
      <PageHeader title="Profile" subtitle="Manage your account information" />
      <div className="glass-card animate-fade-up" style={{ padding:28 }}>
        <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:24 }}>
          <div style={{ width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#3b61f5,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:20,color:'#fff' }}>
            {user?.username?.[0]?.toUpperCase()||'U'}
          </div>
          <div><div style={{ fontWeight:700,fontSize:16 }}>{user?.username}</div><div style={{ color:'var(--text-secondary)',fontSize:13 }}>{user?.email}</div></div>
        </div>
        <hr className="divider" style={{ marginBottom:20 }}/>
        <form onSubmit={handleSave} style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>Phone Number</label>
            <input className="input-field" type="tel" value={form.phone_number} onChange={e=>setForm(s=>({...s,phone_number:e.target.value}))} placeholder="+91 98765 43210"/>
          </div>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginBottom:6,fontFamily:'Sora,sans-serif',letterSpacing:'0.05em',textTransform:'uppercase' }}>Address</label>
            <textarea className="input-field" rows={3} value={form.address} onChange={e=>setForm(s=>({...s,address:e.target.value}))} placeholder="Your address…" style={{ resize:'vertical' }}/>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize:13,opacity:loading?0.75:1 }}>
            {loading?<><Spinner size={14} color="#fff"/>Saving…</>:'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate  = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin]);
  const [tab, setTab]   = useState('overview');
  const [cards, setCards] = useState([]);
  const [txns,  setTxns]  = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTxns,  setLoadingTxns]  = useState(true);

  const fetchCards = useCallback(async () => {
    setLoadingCards(true);
    try { const { data } = await cardAPI.getMyCards(); setCards(Array.isArray(data)?data:data.results||[]); }
    catch { toast.error('Failed to load cards.'); }
    finally { setLoadingCards(false); }
  }, []);

  const fetchTxns = useCallback(async () => {
    setLoadingTxns(true);
    try { const { data } = await transactionAPI.getAll(); setTxns(Array.isArray(data)?data:data.results||[]); }
    catch {}
    finally { setLoadingTxns(false); }
  }, []);

  const refresh = useCallback(() => { fetchCards(); fetchTxns(); }, [fetchCards, fetchTxns]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const TABS = {
    overview:     <OverviewTab cards={cards} transactions={txns} loading={loadingCards||loadingTxns}/>,
    cards:        <CardsTab cards={cards} loading={loadingCards} onRefresh={fetchCards}/>,
    transactions: <TransactionsTab cards={cards} transactions={txns} loading={loadingTxns} onRefresh={refresh}/>,
    kyc:          <KYCTab user={user}/>,
    profile:      <ProfileTab user={user} onUpdate={updateUser}/>,
    notifications:<EmptyState icon={Bell} title="No notifications" desc="Alerts for transactions and payments will appear here."/>,
  };

  return (
    <div style={{ minHeight:'calc(100vh - 64px)',display:'flex',paddingTop:64 }}>
      <Sidebar active={tab} setActive={setTab} onLogout={handleLogout}/>
      <main style={{ flex:1,overflowY:'auto',padding:'28px 24px' }}>
        <div style={{ maxWidth:1000,margin:'0 auto' }}>
          {TABS[tab]}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
