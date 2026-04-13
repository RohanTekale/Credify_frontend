// src/pages/dashboard/UserDashboard.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, TrendingUp, Shield,
  Bell, User, LogOut, Plus, Eye, EyeOff, Lock,
  Unlock, XCircle, RefreshCw, Upload, CheckCircle2,
  AlertTriangle, ChevronRight, ArrowUpRight, Zap,
} from 'lucide-react';
import { cardAPI, transactionAPI, userAPI } from '../../services/api';
import {
  Spinner, Badge, Modal, Confirm, KpiCard, PageHeader,
  DataTable, TR, TD, EmptyState, Field, Button, Select,
  Avatar, Card, useToast, SearchInput, TabBar,
} from '../../components/ui';
import useAuthStore from '../../store/authStore';

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id:'overview',     icon:LayoutDashboard, label:'Overview'       },
  { id:'cards',        icon:CreditCard,      label:'My Cards'       },
  { id:'transactions', icon:TrendingUp,      label:'Transactions'   },
  { id:'kyc',          icon:Shield,          label:'KYC & Security' },
  { id:'profile',      icon:User,            label:'Profile'        },
  { id:'notifications',icon:Bell,            label:'Notifications'  },
];

const Sidebar = ({ active, setActive, onLogout, user }) => (
  <aside style={S.sidebar}>
    <div style={S.sidebarLogo}>
      <div style={S.sidebarLogoIcon}><CreditCard size={14} color="#fff"/></div>
      <span style={S.sidebarLogoText}>Credify</span>
    </div>
    <nav style={S.nav}>
      {NAV.map(({ id, icon:Icon, label }) => (
        <button key={id} onClick={() => setActive(id)} style={{ ...S.navBtn, ...(active===id ? S.navBtnActive : {}) }}>
          <Icon size={15} style={{ flexShrink:0 }}/>
          <span style={{ flex:1, textAlign:'left' }}>{label}</span>
          {active===id && <span style={S.navDot}/>}
        </button>
      ))}
    </nav>
    <div style={S.sidebarFooter}>
      <Avatar name={user?.username || 'U'} size={32}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'#f0f4ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.username}</div>
        <div style={{ fontSize:10, color:'#4b5675', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
      </div>
      <button onClick={onLogout} style={{ background:'none', border:'none', cursor:'pointer', color:'#4b5675', padding:4, borderRadius:6 }} title="Sign out">
        <LogOut size={15}/>
      </button>
    </div>
  </aside>
);

// ── Virtual card visual ───────────────────────────────────────────────────────
const CardVisual = ({ card, revealed, onToggleReveal }) => {
  const GRADIENTS = {
    Basic:    'linear-gradient(135deg,#1a1f3c,#0f1420)',
    Silver:   'linear-gradient(135deg,#2a2d3e,#1a1d2e)',
    Gold:     'linear-gradient(135deg,#2d2410,#1a1500)',
    Platinum: 'linear-gradient(135deg,#1a1a2e,#16213e)',
  };
  const ACCENTS = { Basic:'#3b61f5', Silver:'#94a3b8', Gold:'#d97706', Platinum:'#7c3aed' };
  const accent  = ACCENTS[card.card_type] || '#3b61f5';

  return (
    <div style={{ ...S.cardVisual, background:GRADIENTS[card.card_type] || GRADIENTS.Basic }}>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)`, borderRadius:14, pointerEvents:'none' }}/>
      {/* Chip decoration */}
      <div style={{ position:'absolute', top:16, right:16, display:'flex' }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:`${accent}50`, border:`2px solid ${accent}80` }}/>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,200,50,0.2)', border:'2px solid rgba(255,200,50,0.4)', marginLeft:-10 }}/>
      </div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', marginBottom:4 }}>CREDIFY {card.card_type?.toUpperCase()}</div>
        <Badge status={card.status}/>
      </div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, letterSpacing:'0.18em', color:'rgba(255,255,255,0.88)', marginBottom:18 }}>
        {revealed ? card.card_number?.replace(/(.{4})/g,'$1 ').trim() : `•••• •••• •••• ${card.card_number?.slice(-4)||'****'}`}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Cardholder</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{card.cardholder_name || 'Card Holder'}</div>
        </div>
        <div>
          <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>CVV</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>{revealed ? (card.cvv||'•••') : '•••'}</div>
        </div>
        <div>
          <div style={{ fontSize:7, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>Expires</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>{card.expiry_date || 'MM/YY'}</div>
        </div>
      </div>
      <button onClick={onToggleReveal} style={{ position:'absolute', top:16, left:16, display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:6, padding:'3px 8px', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:10, fontFamily:"'DM Sans',sans-serif" }}>
        {revealed ? <EyeOff size={11}/> : <Eye size={11}/>} {revealed?'Hide':'Show'}
      </button>
    </div>
  );
};

// ── Overview tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ cards, transactions, loading }) => {
  const balance    = cards.reduce((s,c)=>s+(Number(c.available_credit)||0),0);
  const totalSpend = transactions.slice(0,30).reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const activeCards= cards.filter(c=>c.status==='active').length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
        <KpiCard label="Available Credit"  value={`₹${balance.toLocaleString()}`}      color="#3b61f5" icon={CreditCard}   delay={0}   loading={loading}/>
        <KpiCard label="Active Cards"      value={activeCards}                          color="#10b981" icon={Zap}          delay={80}  loading={loading}/>
        <KpiCard label="Total Cards"       value={cards.length}                         color="#8b5cf6" icon={CreditCard}   delay={160} loading={loading}/>
        <KpiCard label="Transactions"      value={transactions.length}                  color="#f59e0b" icon={TrendingUp}   delay={240} loading={loading}/>
      </div>

      {/* Recent transactions */}
      <Card padding="0" style={{ overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#f0f4ff', fontFamily:"'Sora',sans-serif" }}>Recent Transactions</span>
          <Badge status="active" label={`${transactions.length} total`}/>
        </div>
        <DataTable
          loading={loading}
          columns={[{label:'Description'},{label:'Card'},{label:'Date'},{label:'Status'},{label:'Amount',right:true}]}
          empty="No transactions yet. Use a card to get started."
          rows={transactions.slice(0,6).map((t,i)=>(
            <TR key={i}>
              <TD><div style={{ fontWeight:500,fontSize:13 }}>{t.description||'Transaction'}</div><div style={{ fontSize:11,color:'#4b5675' }}>{t.merchant||''}</div></TD>
              <TD mono muted>•••• {t.card_number?.slice(-4)||'****'}</TD>
              <TD muted style={{ fontSize:11 }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : '—'}</TD>
              <TD><Badge status={t.status||'success'}/></TD>
              <TD right style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:parseFloat(t.amount)>=0?'#34d399':'#f0f4ff' }}>
                ₹{Math.abs(parseFloat(t.amount||0)).toFixed(2)}
              </TD>
            </TR>
          ))}
        />
      </Card>
    </div>
  );
};

// ── Cards tab ─────────────────────────────────────────────────────────────────
const CardsTab = ({ cards, onRefresh, loading }) => {
  const toast = useToast();
  const [revealed, setRevealed]   = useState({});
  const [actLoad, setActLoad]     = useState({});
  const [confirm, setConfirm]     = useState(null);
  const [createModal, setCreate]  = useState(false);
  const [form, setForm]           = useState({ card_type:'Basic', income:'', occupation:'', intended_use:'Shopping', is_single_use:false });
  const [creating, setCreating]   = useState(false);

  const doAction = async (card, action) => {
    setActLoad(s=>({...s,[card.id]:action}));
    try {
      await cardAPI[action](card.id);
      toast.success(`Card ${action}d successfully.`);
      onRefresh();
    } catch(err){ toast.error(err.message); }
    finally { setActLoad(s=>({...s,[card.id]:null})); setConfirm(null); }
  };

  const handleCreate = async(e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await cardAPI.createCard({...form, income:Number(form.income)});
      toast.success('Card request submitted! Awaiting admin approval.');
      setCreate(false);
      onRefresh();
    } catch(err){ toast.error(err.message); }
    finally { setCreating(false); }
  };

  return (
    <div>
      <PageHeader title="My Cards" subtitle={`${cards.length} card${cards.length!==1?'s':''} on your account`}
        actions={<Button onClick={()=>setCreate(true)}><Plus size={14}/> Request Card</Button>}/>

      {loading ? <div style={{ textAlign:'center', padding:48 }}><Spinner size={28}/></div>
        : !cards.length ? <EmptyState icon={CreditCard} title="No cards yet" desc="Request your first virtual card to get started." action={{ label:'Request Card', fn:()=>setCreate(true) }}/>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
            {cards.map(card => (
              <Card key={card.id} padding="20px">
                <CardVisual card={card} revealed={!!revealed[card.id]} onToggleReveal={()=>setRevealed(s=>({...s,[card.id]:!s[card.id]}))}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8b96b0', marginBottom:10 }}>
                  <span>Limit: <strong style={{ color:'#f0f4ff' }}>₹{Number(card.credit_limit||0).toLocaleString()}</strong></span>
                  <span>Available: <strong style={{ color:'#10b981' }}>₹{Number(card.available_credit||0).toLocaleString()}</strong></span>
                </div>
                {/* Usage bar */}
                <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden', marginBottom:14 }}>
                  <div style={{ width:`${Math.min(100,((card.credit_limit-card.available_credit)/card.credit_limit)*100||0)}%`, height:'100%', background:'linear-gradient(90deg,#3b61f5,#8b5cf6)', transition:'width 600ms cubic-bezier(0.16,1,0.3,1)' }}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {card.status==='active' && <Button variant="ghost" size="sm" disabled={!!actLoad[card.id]} onClick={()=>setConfirm({card,action:'freeze'})}>{actLoad[card.id]==='freeze'?<Spinner size={10}/>:<Lock size={11}/>} Freeze</Button>}
                  {card.status==='frozen' && <Button variant="success" size="sm" disabled={!!actLoad[card.id]} onClick={()=>doAction(card,'unfreeze')}>{actLoad[card.id]==='unfreeze'?<Spinner size={10}/>:<Unlock size={11}/>} Unfreeze</Button>}
                  {card.status!=='blocked' && <Button variant="danger" size="sm" disabled={!!actLoad[card.id]} onClick={()=>setConfirm({card,action:'block',danger:true})}>{actLoad[card.id]==='block'?<Spinner size={10}/>:<XCircle size={11}/>} Block</Button>}
                  {card.status==='blocked' && <Button variant="success" size="sm" onClick={()=>doAction(card,'unblock')}><Unlock size={11}/> Unblock</Button>}
                </div>
              </Card>
            ))}
          </div>
        )
      }

      <Confirm open={!!confirm} onClose={()=>setConfirm(null)} title={confirm?.action==='block'?'Block Card':'Freeze Card'}
        message={confirm?.action==='block' ? 'This will permanently block the card. Are you sure?' : 'This will pause all transactions on the card.'}
        danger={confirm?.danger} loading={!!actLoad[confirm?.card?.id]}
        onConfirm={()=>doAction(confirm.card, confirm.action)}/>

      <Modal open={createModal} onClose={()=>setCreate(false)} title="Request Virtual Card" width={440}>
        <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Select label="Card Type" value={form.card_type} onChange={e=>setForm(f=>({...f,card_type:e.target.value}))}>
            {['Basic','Silver','Gold','Platinum'].map(t=><option key={t}>{t}</option>)}
          </Select>
          <Field label="Monthly Income (₹)" type="number" placeholder="50000" value={form.income} onChange={e=>setForm(f=>({...f,income:e.target.value}))} required/>
          <Field label="Occupation" placeholder="Software Engineer" value={form.occupation} onChange={e=>setForm(f=>({...f,occupation:e.target.value}))} required/>
          <Field label="Intended Use" placeholder="Shopping, Travel…" value={form.intended_use} onChange={e=>setForm(f=>({...f,intended_use:e.target.value}))} required/>
          <label style={{ display:'flex', alignItems:'center', gap:9, fontSize:13, color:'#8b96b0', cursor:'pointer' }}>
            <input type="checkbox" checked={form.is_single_use} onChange={e=>setForm(f=>({...f,is_single_use:e.target.checked}))}/>
            Single-use card
          </label>
          <Button type="submit" loading={creating} fullWidth style={{ marginTop:4 }}>Submit Request <ChevronRight size={14}/></Button>
        </form>
      </Modal>
    </div>
  );
};

// ── Transactions tab ──────────────────────────────────────────────────────────
const TransactionsTab = ({ cards, transactions, loading, onRefresh }) => {
  const toast = useToast();
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ card_id:'', amount:'', description:'' });
  const [submitting, setSub]    = useState(false);
  const [search, setSearch]     = useState('');

  const filtered = transactions.filter(t =>
    (t.description||'').toLowerCase().includes(search.toLowerCase()) ||
    (t.card_number||'').includes(search)
  );

  const handleSubmit = async(e) => {
    e.preventDefault();
    setSub(true);
    try {
      await transactionAPI.create({...form, card_id:Number(form.card_id), amount:Number(form.amount)});
      toast.success('Transaction created!');
      setModal(false);
      onRefresh();
    } catch(err){ toast.error(err.message); }
    finally { setSub(false); }
  };

  return (
    <div>
      <PageHeader title="Transactions" subtitle="All card transactions"
        actions={<Button onClick={()=>setModal(true)}><Plus size={14}/> Simulate</Button>}/>
      <div style={{ marginBottom:14 }}>
        <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by description or card…"/>
      </div>
      <Card padding="0" style={{ overflow:'hidden' }}>
        <DataTable loading={loading}
          columns={[{label:'Description'},{label:'Card'},{label:'Date'},{label:'Status'},{label:'Amount',right:true}]}
          empty="No transactions found."
          rows={filtered.map((t,i)=>(
            <TR key={i}>
              <TD><div style={{ fontWeight:500,fontSize:13 }}>{t.description||'Transaction'}</div></TD>
              <TD mono muted style={{ fontSize:12 }}>•••• {t.card_number?.slice(-4)||'****'}</TD>
              <TD muted style={{ fontSize:11 }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</TD>
              <TD><Badge status={t.status||'success'}/></TD>
              <TD right style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:parseFloat(t.amount)>=0?'#34d399':'#f0f4ff' }}>
                ₹{Math.abs(parseFloat(t.amount||0)).toFixed(2)}
              </TD>
            </TR>
          ))}
        />
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title="Simulate Transaction" width={420}>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Select label="Select Card" value={form.card_id} onChange={e=>setForm(f=>({...f,card_id:e.target.value}))} required>
            <option value="">Choose a card…</option>
            {cards.filter(c=>c.status==='active').map(c=><option key={c.id} value={c.id}>•••• {c.card_number?.slice(-4)} — {c.card_type}</option>)}
          </Select>
          <Field label="Amount (₹)" type="number" step="0.01" min="1" placeholder="100.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required/>
          <Field label="Description" placeholder="Amazon Shopping…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required/>
          <Button type="submit" loading={submitting} fullWidth style={{ marginTop:4 }}>Process Transaction <ChevronRight size={14}/></Button>
        </form>
      </Modal>
    </div>
  );
};

// ── KYC tab ───────────────────────────────────────────────────────────────────
const KYCTab = ({ user }) => {
  const toast = useToast();
  const [file, setFile]     = useState(null);
  const [status, setStatus] = useState('idle');
  const [drag, setDrag]     = useState(false);
  const ref = React.useRef();

  const handleFile = (f) => { if(f&&f.size<10*1024*1024) setFile(f); };
  const upload = async() => {
    if(!file) return;
    setStatus('uploading');
    const fd = new FormData(); fd.append('kyc_document', file);
    try {
      await userAPI.uploadKYC(fd);
      setStatus('success');
      toast.success('KYC document submitted! Under review.');
    } catch(err){ setStatus('error'); toast.error(err.message); }
  };

  const kycStatus = user?.kyc_status || 'unverified';

  return (
    <div style={{ maxWidth:500 }}>
      <PageHeader title="KYC & Security" subtitle="Verify your identity to unlock all features"/>

      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:12, color:'#4b5675', marginBottom:8 }}>KYC Status</div>
            <Badge status={kycStatus} label={kycStatus.charAt(0).toUpperCase()+kycStatus.slice(1)} size="md"/>
          </div>
          <Shield size={28} color={kycStatus==='verified'?'#10b981':'#4b5675'} style={{ opacity:0.7 }}/>
        </div>
        {kycStatus==='verified' && <p style={{ fontSize:13, color:'#8b96b0', marginTop:14, marginBottom:0, lineHeight:1.6 }}>Your identity is verified. All features are unlocked.</p>}
        {kycStatus!=='verified' && <p style={{ fontSize:13, color:'#8b96b0', marginTop:14, marginBottom:0, lineHeight:1.6 }}>Upload a government-issued ID (Aadhaar, PAN, Passport) to verify your identity.</p>}
      </Card>

      {status==='success' ? (
        <Card style={{ textAlign:'center', padding:32 }}>
          <CheckCircle2 size={42} color="#10b981" style={{ marginBottom:12 }}/>
          <div style={{ fontSize:16, fontWeight:700, color:'#f0f4ff', fontFamily:"'Sora',sans-serif", marginBottom:8 }}>Document Submitted</div>
          <div style={{ fontSize:13, color:'#8b96b0' }}>We'll review it within 24 hours and notify you.</div>
        </Card>
      ) : (
        <Card>
          <div
            onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
            onClick={()=>ref.current?.click()}
            style={{ border:`2px dashed ${drag?'#3b61f5':file?'#10b981':'rgba(255,255,255,0.1)'}`, borderRadius:10, padding:'32px 20px', textAlign:'center', cursor:'pointer', background:drag?'rgba(59,97,245,0.06)':file?'rgba(16,185,129,0.04)':'transparent', transition:'all 200ms', marginBottom:16 }}
          >
            <input ref={ref} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
            {file ? (
              <><CheckCircle2 size={28} color="#10b981" style={{ marginBottom:8 }}/><div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff' }}>{file.name}</div><div style={{ fontSize:11, color:'#4b5675' }}>{(file.size/1024).toFixed(0)} KB</div></>
            ) : (
              <><Upload size={26} color="#4b5675" style={{ marginBottom:10 }}/><div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff', marginBottom:4 }}>Drop document here or click to browse</div><div style={{ fontSize:11, color:'#4b5675' }}>JPG, PNG, PDF · Max 10MB</div></>
            )}
          </div>
          {status==='error' && <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, color:'#f87171', fontSize:13, marginBottom:12 }}><AlertTriangle size={14}/> Upload failed. Please try again.</div>}
          <Button fullWidth disabled={!file||status==='uploading'} loading={status==='uploading'} onClick={upload}>
            <Upload size={14}/> {status==='uploading' ? 'Uploading…' : 'Submit Document'}
          </Button>
        </Card>
      )}
    </div>
  );
};

// ── Profile tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ user, onUpdate }) => {
  const toast = useToast();
  const [form, setForm]   = useState({ phone_number:user?.phone_number||'', address:user?.address||'' });
  const [saving, setSave] = useState(false);

  const handleSave = async(e) => {
    e.preventDefault();
    setSave(true);
    try {
      await userAPI.updateProfile(form);
      onUpdate(form);
      toast.success('Profile updated!');
    } catch(err){ toast.error(err.message); }
    finally { setSave(false); }
  };

  return (
    <div style={{ maxWidth:480 }}>
      <PageHeader title="Profile" subtitle="Manage your account details"/>
      <Card>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22, paddingBottom:18, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <Avatar name={user?.username||'U'} size={52}/>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:'#f0f4ff' }}>{user?.username}</div>
            <div style={{ color:'#8b96b0', fontSize:13 }}>{user?.email}</div>
            <Badge status={user?.kyc_status||'unverified'} style={{ marginTop:6 }}/>
          </div>
        </div>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Field label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone_number} onChange={e=>setForm(f=>({...f,phone_number:e.target.value}))}/>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <label style={{ fontSize:11, fontWeight:700, color:'#4b5675', letterSpacing:'0.07em', textTransform:'uppercase' }}>Address</label>
            <textarea rows={3} placeholder="Your address…" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, padding:'10px 12px', color:'#f0f4ff', fontSize:13, resize:'vertical', outline:'none', fontFamily:"'DM Sans',sans-serif" }}/>
          </div>
          <Button type="submit" loading={saving} fullWidth>Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate();
  const toast    = useToast();
  const { user, logout, updateUser, isAdmin } = useAuthStore();

  const [tab,   setTab]   = useState('overview');
  const [cards, setCards] = useState([]);
  const [txns,  setTxns]  = useState([]);
  const [loadC, setLoadC] = useState(true);
  const [loadT, setLoadT] = useState(true);

  useEffect(() => { if (isAdmin) navigate('/admin', { replace: true }); }, [isAdmin]);

  const fetchCards = useCallback(async()=>{
    setLoadC(true);
    try { const { data } = await cardAPI.getMyCards(); setCards(Array.isArray(data)?data:data?.data?.results||data?.results||[]); }
    catch { toast.error('Failed to load cards.'); }
    finally { setLoadC(false); }
  },[]);

  const fetchTxns = useCallback(async()=>{
    setLoadT(true);
    try { const { data } = await transactionAPI.getAll(); setTxns(Array.isArray(data)?data:data?.data?.results||data?.results||[]); }
    catch {}
    finally { setLoadT(false); }
  },[]);

  const refresh = useCallback(()=>{ fetchCards(); fetchTxns(); },[fetchCards,fetchTxns]);

  useEffect(()=>{ refresh(); },[refresh]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const TABS = {
    overview:     <OverviewTab cards={cards} transactions={txns} loading={loadC||loadT}/>,
    cards:        <CardsTab cards={cards} loading={loadC} onRefresh={fetchCards}/>,
    transactions: <TransactionsTab cards={cards} transactions={txns} loading={loadT} onRefresh={refresh}/>,
    kyc:          <KYCTab user={user}/>,
    profile:      <ProfileTab user={user} onUpdate={updateUser}/>,
    notifications:<EmptyState icon={Bell} title="No notifications" desc="Transaction alerts and account updates will appear here."/>,
  };

  return (
    <div style={S.layout}>
      <Sidebar active={tab} setActive={setTab} onLogout={handleLogout} user={user}/>
      <main style={S.main}>
        <div style={S.mainInner}>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
            <button onClick={refresh} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'6px 12px', color:'#8b96b0', cursor:'pointer', fontSize:12 }}>
              <RefreshCw size={12}/> Refresh
            </button>
          </div>
          {TABS[tab]}
        </div>
      </main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
        select option { background:#0d1321; }
      `}</style>
    </div>
  );
}

const S = {
  layout: { display:'flex', minHeight:'100vh', background:'#080c14', fontFamily:"'DM Sans',sans-serif" },
  sidebar: { width:220, flexShrink:0, background:'rgba(8,12,20,0.95)', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', padding:'22px 10px', position:'sticky', top:0, height:'100vh', overflowY:'auto' },
  sidebarLogo: { display:'flex', alignItems:'center', gap:9, padding:'0 10px', marginBottom:28 },
  sidebarLogoIcon: { width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#3b61f5,#1d37cc)', display:'flex', alignItems:'center', justifyContent:'center' },
  sidebarLogoText: { fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:'#f0f4ff', letterSpacing:'-0.03em' },
  nav: { flex:1, display:'flex', flexDirection:'column', gap:2 },
  navBtn: { display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:9, background:'none', border:'1px solid transparent', color:'#8b96b0', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, transition:'all 0.15s', width:'100%' },
  navBtnActive: { background:'rgba(59,97,245,0.12)', border:'1px solid rgba(59,97,245,0.25)', color:'#8ba7ff' },
  navDot: { width:5, height:5, borderRadius:'50%', background:'#3b61f5', flexShrink:0 },
  sidebarFooter: { display:'flex', alignItems:'center', gap:10, padding:'12px 10px 0', borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:12 },
  main: { flex:1, overflowY:'auto' },
  mainInner: { maxWidth:1100, margin:'0 auto', padding:'28px 24px 48px' },
  cardVisual: { borderRadius:14, padding:20, position:'relative', overflow:'hidden', marginBottom:16, minHeight:168 },
};