// src/features/admin/AdminDashboard.jsx
// Premium Fintech Admin Panel — Credify Global
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard, Users, CreditCard, Shield, LogOut,
  CheckCircle2, XCircle, AlertTriangle, UserCheck, UserX,
  Lock, Unlock, ChevronRight, RefreshCw, Search, Filter,
  TrendingUp, Activity, BarChart3, Eye, Hash, Globe,
  ArrowUpRight, ArrowDownRight, ChevronDown, Bell,
  Settings, Zap, Database, MoreHorizontal, Copy,
  ShieldCheck, ShieldAlert, Clock, DollarSign
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import {
  Spinner, Badge, Modal, Confirm, toast, KpiCard,
  PageHeader, DataTable, EmptyState
} from '../../components/ui';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const ACCENT      = '#0066FF';
const ACCENT_DARK = '#0052CC';
const SUCCESS     = '#00C48C';
const DANGER      = '#FF4D4F';
const WARNING     = '#FFB020';
const BG_DEEP     = '#05070F';
const BG_CARD     = '#0C0F1E';
const BG_RAISED   = '#111528';
const BORDER      = 'rgba(255,255,255,0.06)';
const BORDER_MID  = 'rgba(255,255,255,0.1)';
const TEXT_1      = '#F0F4FF';
const TEXT_2      = 'rgba(240,244,255,0.55)';
const TEXT_3      = 'rgba(240,244,255,0.30)';

const FONT_DISPLAY = "'DM Sans', 'Sora', sans-serif";
const FONT_MONO    = "'JetBrains Mono', 'Fira Code', monospace";

// ─── Utility styles ────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: BG_CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  ...extra,
});

const pill = (color, bg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', borderRadius: 20, fontSize: 11,
  fontWeight: 700, letterSpacing: '0.04em',
  color, background: bg,
});

const StatusPill = ({ status }) => {
  const map = {
    active:     { label: 'Active',     color: SUCCESS,  bg: 'rgba(0,196,140,0.12)' },
    inactive:   { label: 'Inactive',   color: TEXT_2,   bg: 'rgba(255,255,255,0.06)' },
    blocked:    { label: 'Blocked',    color: DANGER,   bg: 'rgba(255,77,79,0.12)' },
    frozen:     { label: 'Frozen',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
    verified:   { label: 'Verified',   color: SUCCESS,  bg: 'rgba(0,196,140,0.12)' },
    pending:    { label: 'Pending',    color: WARNING,  bg: 'rgba(255,176,32,0.12)' },
    rejected:   { label: 'Rejected',  color: DANGER,   bg: 'rgba(255,77,79,0.12)' },
    unverified: { label: 'Unverified', color: TEXT_2,  bg: 'rgba(255,255,255,0.06)' },
  };
  const cfg = map[status?.toLowerCase()] || map.unverified;
  return (
    <span style={pill(cfg.color, cfg.bg)}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block' }}/>
      {cfg.label}
    </span>
  );
};

// ─── Metric KPI Card ───────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, icon: Icon, accent, trend, delay = 0 }) => (
  <div style={{
    ...card({ padding: '20px 22px' }),
    position: 'relative', overflow: 'hidden',
    animation: `fadeUp 0.5s ease ${delay}ms both`,
  }}>
    <div style={{
      position: 'absolute', top: -30, right: -30, width: 100, height: 100,
      borderRadius: '50%', background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
      pointerEvents: 'none',
    }}/>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={accent}/>
      </div>
      {trend !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? SUCCESS : DANGER, display: 'flex', alignItems: 'center', gap: 2 }}>
          {trend >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 800, color: TEXT_1, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: TEXT_2, marginTop: 6, fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: TEXT_3, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 800, color: TEXT_1, letterSpacing: '-0.02em', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: TEXT_2, margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
  </div>
);

// ─── Button variants ───────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = 'ghost', disabled, size = 'md', style: sx }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: FONT_DISPLAY, fontWeight: 700, borderRadius: 10, border: 'none',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s',
    fontSize: size === 'sm' ? 11 : 13,
    padding: size === 'sm' ? '5px 10px' : '9px 16px',
  };
  const variants = {
    primary: { background: ACCENT, color: '#fff', boxShadow: `0 0 20px ${ACCENT}40` },
    ghost: { background: 'rgba(255,255,255,0.05)', color: TEXT_1, border: `1px solid ${BORDER_MID}` },
    danger: { background: 'rgba(255,77,79,0.1)', color: DANGER, border: '1px solid rgba(255,77,79,0.2)' },
    success: { background: 'rgba(0,196,140,0.1)', color: SUCCESS, border: '1px solid rgba(0,196,140,0.2)' },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...sx }}>{children}</button>;
};

// ─── Input Field ───────────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>}
    <input style={{
      width: '100%', background: BG_DEEP, border: `1px solid ${BORDER_MID}`,
      borderRadius: 10, padding: '10px 14px', color: TEXT_1, fontSize: 13,
      fontFamily: FONT_DISPLAY, outline: 'none', boxSizing: 'border-box',
    }} {...props}/>
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>}
    <select style={{
      width: '100%', background: BG_DEEP, border: `1px solid ${BORDER_MID}`,
      borderRadius: 10, padding: '10px 14px', color: TEXT_1, fontSize: 13,
      fontFamily: FONT_DISPLAY, outline: 'none', appearance: 'none',
    }} {...props}>{children}</select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: TEXT_3, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>}
    <textarea style={{
      width: '100%', background: BG_DEEP, border: `1px solid ${BORDER_MID}`,
      borderRadius: 10, padding: '10px 14px', color: TEXT_1, fontSize: 13,
      fontFamily: FONT_DISPLAY, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    }} {...props}/>
  </div>
);

// ─── Premium Modal ─────────────────────────────────────────────────────────────
const PModal = ({ open, onClose, title, children, width = 460 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...card({ padding: 28 }), width: '100%', maxWidth: width, animation: 'fadeUp 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 800, color: TEXT_1, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT_2, cursor: 'pointer', padding: 4 }}>
            <XCircle size={18}/>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Premium Table ─────────────────────────────────────────────────────────────
const PTable = ({ columns, rows, empty }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
          {columns.map((c, i) => (
            <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: TEXT_3, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 48, color: TEXT_2, fontSize: 13 }}>{empty || 'No records found.'}</td></tr>
        ) : rows}
      </tbody>
    </table>
  </div>
);

const TR = ({ children, onClick }) => (
  <tr style={{ borderBottom: `1px solid ${BORDER}`, cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    onClick={onClick}>
    {children}
  </tr>
);

const TD = ({ children, mono, muted, style: sx }) => (
  <td style={{ padding: '14px 16px', fontSize: 13, color: muted ? TEXT_2 : TEXT_1, fontFamily: mono ? FONT_MONO : FONT_DISPLAY, verticalAlign: 'middle', ...sx }}>{children}</td>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 32 }) => {
  const initials = (name || 'U')[0].toUpperCase();
  const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},60%,35%)`, border: `2px solid hsl(${hue},60%,50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0, fontFamily: FONT_DISPLAY }}>
      {initials}
    </div>
  );
};

// ─── Search Bar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative', marginBottom: 16 }}>
    <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: TEXT_3, pointerEvents: 'none' }}/>
    <input
      style={{ width: '100%', background: BG_DEEP, border: `1px solid ${BORDER_MID}`, borderRadius: 12, padding: '11px 14px 11px 38px', color: TEXT_1, fontSize: 13, fontFamily: FONT_DISPLAY, outline: 'none', boxSizing: 'border-box' }}
      placeholder={placeholder || 'Search…'} value={value} onChange={onChange}
    />
  </div>
);

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',  icon: LayoutDashboard, label: 'Overview'    },
  { id: 'users',     icon: Users,           label: 'Users'       },
  { id: 'cards',     icon: CreditCard,      label: 'Cards'       },
  { id: 'kyc',       icon: Shield,          label: 'KYC Review'  },
  { id: 'analytics', icon: BarChart3,       label: 'Analytics'   },
];

const Sidebar = ({ active, setActive, onLogout }) => (
  <aside style={{ width: 230, flexShrink: 0, background: BG_CARD, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', padding: '20px 12px', minHeight: '100vh' }}>
    {/* Logo */}
    <div style={{ padding: '4px 10px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="#fff"/>
        </div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 900, color: TEXT_1, letterSpacing: '-0.03em' }}>Credify</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: DANGER, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin</div>
        </div>
      </div>
    </div>

    {/* Admin badge */}
    <div style={{ margin: '0 2px 20px', padding: '10px 12px', borderRadius: 12, background: 'rgba(255,77,79,0.06)', border: '1px solid rgba(255,77,79,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ShieldCheck size={13} color={DANGER}/>
        <span style={{ fontSize: 10, fontWeight: 800, color: DANGER, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Access</span>
      </div>
      <div style={{ fontSize: 11, color: TEXT_3, marginTop: 3 }}>Full system control</div>
    </div>

    <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_3, letterSpacing: '0.1em', padding: '0 10px', marginBottom: 8, textTransform: 'uppercase' }}>Management</div>

    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => setActive(id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
            background: isActive ? `${ACCENT}18` : 'none', border: isActive ? `1px solid ${ACCENT}30` : '1px solid transparent',
            color: isActive ? ACCENT : TEXT_2, cursor: 'pointer', fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: isActive ? 700 : 500,
            transition: 'all 0.15s', textAlign: 'left', width: '100%',
          }}>
            <Icon size={15} style={{ flexShrink: 0 }}/>
            <span style={{ flex: 1 }}>{label}</span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: ACCENT }}/>}
          </button>
        );
      })}
    </nav>

    <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'none', border: '1px solid transparent', color: DANGER, cursor: 'pointer', fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 500, transition: 'all 0.15s', textAlign: 'left', width: '100%' }}>
        <LogOut size={15}/> Sign Out
      </button>
    </div>
  </aside>
);

// ─── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ users, cards, loading }) => {
  const pending     = users.filter(u => u.kyc_status === 'pending' || !u.kyc_status).length;
  const verified    = users.filter(u => u.kyc_status === 'verified').length;
  const activeCards = cards.filter(c => c.status === 'active').length;
  const blocked     = cards.filter(c => c.status === 'blocked').length;
  const totalCredit = cards.reduce((s, c) => s + Number(c.credit_limit || 0), 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <MetricCard label="Total Users"     value={loading ? '—' : users.length}  icon={Users}      accent={ACCENT}   trend={12} delay={0}  />
        <MetricCard label="KYC Pending"     value={loading ? '—' : pending}         icon={ShieldAlert} accent={WARNING}  trend={-3} delay={80} />
        <MetricCard label="Active Cards"    value={loading ? '—' : activeCards}     icon={CreditCard}  accent={SUCCESS}  trend={8}  delay={160}/>
        <MetricCard label="Blocked Cards"   value={loading ? '—' : blocked}         icon={XCircle}     accent={DANGER}   delay={240}/>
        <MetricCard label="Total Credit"    value={loading ? '—' : `₹${(totalCredit/100000).toFixed(1)}L`} icon={DollarSign} accent="#7C3AED" sub="across all cards" delay={320}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Recent Users */}
        <div style={card({ padding: 0, overflow: 'hidden' })}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: TEXT_1 }}>Recent Users</span>
            <Users size={14} color={TEXT_3}/>
          </div>
          {loading ? <div style={{ padding: 32, textAlign: 'center' }}><Spinner/></div> : (
            <PTable
              columns={['User', 'ID', 'KYC', 'Status']}
              rows={users.slice(0, 5).map((u, i) => (
                <TR key={i}>
                  <TD><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={u.username} size={28}/><span style={{ fontWeight: 600, fontSize: 13 }}>{u.username}</span></div></TD>
                  <TD mono muted>#{u.id}</TD>
                  <TD><StatusPill status={u.kyc_status || 'unverified'}/></TD>
                  <TD><StatusPill status={u.is_active !== false ? 'active' : 'inactive'}/></TD>
                </TR>
              ))}
            />
          )}
        </div>

        {/* Recent Cards */}
        <div style={card({ padding: 0, overflow: 'hidden' })}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: TEXT_1 }}>Recent Cards</span>
            <CreditCard size={14} color={TEXT_3}/>
          </div>
          {loading ? <div style={{ padding: 32, textAlign: 'center' }}><Spinner/></div> : (
            <PTable
              columns={['Card', 'Holder', 'Limit', 'Status']}
              rows={cards.slice(0, 5).map((c, i) => (
                <TR key={i}>
                  <TD mono style={{ fontSize: 12 }}>•••• {c.card_number?.slice(-4) || '****'}</TD>
                  <TD>{c.cardholder_name || c.user || '—'}</TD>
                  <TD mono muted>₹{Number(c.credit_limit || 0).toLocaleString()}</TD>
                  <TD><StatusPill status={c.status || 'active'}/></TD>
                </TR>
              ))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Users Management Tab ──────────────────────────────────────────────────────
const UsersTab = ({ users, loading, onRefresh }) => {
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);
  const [editModal, setEditModal]       = useState(false);
  const [editForm, setEditForm]         = useState({});
  const [confirm, setConfirm]           = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [reactivateModal, setReactivateModal] = useState(false);
  const [reactivateForm, setReactivateForm]   = useState({ request_id: '', status: 'approved', admin_comments: '' });

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.id).includes(search)
  );

  const openEdit = (u) => {
    setSelected(u);
    setEditForm({ username: u.username, email: u.email, phone_number: u.phone_number || '', address: u.address || '' });
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(selected.id, editForm);
      toast.success('User updated.');
      setEditModal(false);
      onRefresh();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    setActionLoading(s => ({ ...s, [confirm.id]: 'delete' }));
    try {
      await adminAPI.deleteUser(confirm.id);
      toast.success('User deactivated.');
      onRefresh();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(s => ({ ...s, [confirm.id]: null })); setConfirm(null); }
  };

  const handleReactivate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.reviewReactivation(reactivateForm);
      toast.success('Reactivation request processed.');
      setReactivateModal(false);
      onRefresh();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <SectionHeader
        title="User Management"
        subtitle={`${users.length} total users registered`}
        actions={
          <Btn variant="ghost" onClick={() => setReactivateModal(true)}>
            <UserCheck size={14}/> Review Reactivation
          </Btn>
        }
      />

      <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or user ID…"/>

      <div style={card({ padding: 0, overflow: 'hidden' })}>
        {loading
          ? <div style={{ padding: 48, textAlign: 'center' }}><Spinner size={24}/></div>
          : (
            <PTable
              columns={['User', 'User ID', 'Email', 'Phone', 'KYC Status', 'Account', 'Joined', 'Actions']}
              empty="No users match your search."
              rows={filtered.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.username} size={32}/>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: TEXT_1 }}>{u.username}</div>
                        <div style={{ fontSize: 11, color: TEXT_3 }}>{u.email}</div>
                      </div>
                    </div>
                  </TD>
                  <TD mono muted>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Hash size={10} color={TEXT_3}/>
                      <span>{u.id}</span>
                    </div>
                  </TD>
                  <TD muted style={{ fontSize: 12 }}>{u.email}</TD>
                  <TD muted style={{ fontSize: 12 }}>{u.phone_number || '—'}</TD>
                  <TD><StatusPill status={u.kyc_status || 'unverified'}/></TD>
                  <TD><StatusPill status={u.is_active !== false ? 'active' : 'inactive'}/></TD>
                  <TD muted style={{ fontSize: 11 }}>
                    {u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(u)}><Eye size={11}/> Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setConfirm(u)}><UserX size={11}/> Deactivate</Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            />
          )}
      </div>

      {/* Edit modal */}
      <PModal open={editModal} onClose={() => setEditModal(false)} title={`Edit User: ${selected?.username}`} width={460}>
        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(0,102,255,0.08)', border: `1px solid rgba(0,102,255,0.2)`, marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: TEXT_3, marginBottom: 2 }}>User ID</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: ACCENT, fontWeight: 700 }}>#{selected?.id}</div>
          </div>
          {[
            { key: 'username',     label: 'Username' },
            { key: 'email',        label: 'Email Address' },
            { key: 'phone_number', label: 'Phone Number' },
            { key: 'address',      label: 'Address' },
          ].map(({ key, label }) => (
            <Input key={key} label={label} value={editForm[key] || ''} onChange={e => setEditForm(s => ({ ...s, [key]: e.target.value }))}/>
          ))}
          <Btn variant="primary" onClick={handleEdit} style={{ justifyContent: 'center', marginTop: 4 }}>Save Changes</Btn>
        </form>
      </PModal>

      {/* Reactivation modal */}
      <PModal open={reactivateModal} onClose={() => setReactivateModal(false)} title="Review Reactivation Request" width={440}>
        <form onSubmit={handleReactivate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Request ID" type="number" placeholder="Enter request ID" value={reactivateForm.request_id} onChange={e => setReactivateForm(s => ({ ...s, request_id: e.target.value }))} required/>
          <Select label="Decision" value={reactivateForm.status} onChange={e => setReactivateForm(s => ({ ...s, status: e.target.value }))}>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </Select>
          <Textarea label="Admin Comments" rows={3} placeholder="Account restored because…" value={reactivateForm.admin_comments} onChange={e => setReactivateForm(s => ({ ...s, admin_comments: e.target.value }))}/>
          <Btn variant="primary" onClick={handleReactivate} style={{ justifyContent: 'center' }}>Submit Decision</Btn>
        </form>
      </PModal>

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} title="Deactivate User"
        message={`Deactivate ${confirm?.username} (ID #${confirm?.id})? Their account will be suspended.`}
        danger loading={!!actionLoading[confirm?.id]} onConfirm={handleDelete}/>
    </div>
  );
};

// ─── Cards Management Tab ──────────────────────────────────────────────────────
const AdminCardsTab = ({ cards, loading, onRefresh }) => {
  const [search, setSearch]             = useState('');
  const [approveModal, setApproveModal] = useState(false);
  const [approveForm, setApproveForm]   = useState({ request_id: '', approve: true });
  const [actionLoading, setActionLoading] = useState({});

  const filtered = cards.filter(c =>
    c.card_number?.includes(search) ||
    String(c.cardholder_name || c.user || '').toLowerCase().includes(search.toLowerCase()) ||
    String(c.id).includes(search)
  );

  const doCardAction = async (card, action) => {
    setActionLoading(s => ({ ...s, [card.id]: action }));
    try {
      await adminAPI[action + 'Card'](card.id);
      toast.success(`Card ${action}d.`);
      onRefresh();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(s => ({ ...s, [card.id]: null })); }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.approveCardReq({ request_id: Number(approveForm.request_id), approve: approveForm.approve });
      toast.success(`Card request ${approveForm.approve ? 'approved' : 'rejected'}.`);
      setApproveModal(false);
      onRefresh();
    } catch (err) { toast.error(err.message); }
  };

  const cardTypeBadge = (type) => {
    const map = { Platinum: '#C0A060', Gold: '#D4A017', Silver: '#A0A0B0', Basic: TEXT_2 };
    const color = map[type] || TEXT_2;
    return <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}30`, padding: '2px 8px', borderRadius: 6 }}>{type || 'Basic'}</span>;
  };

  return (
    <div>
      <SectionHeader
        title="Card Management"
        subtitle={`${cards.length} total cards issued`}
        actions={
          <Btn variant="primary" onClick={() => setApproveModal(true)}>
            <CheckCircle2 size={14}/> Review Request
          </Btn>
        }
      />

      <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by card number, holder name, or card ID…"/>

      <div style={card({ padding: 0, overflow: 'hidden' })}>
        {loading
          ? <div style={{ padding: 48, textAlign: 'center' }}><Spinner size={24}/></div>
          : (
            <PTable
              columns={['Card', 'Card ID', 'Holder', 'Type', 'Credit Limit', 'Available', 'Status', 'Actions']}
              empty="No cards match your search."
              rows={filtered.map((c) => (
                <TR key={c.id}>
                  <TD mono style={{ fontSize: 12, letterSpacing: '0.06em' }}>
                    <span style={{ color: TEXT_3 }}>•••• •••• ••••</span> {c.card_number?.slice(-4) || '****'}
                  </TD>
                  <TD mono muted>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Hash size={10} color={TEXT_3}/>{c.id}
                    </div>
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={c.cardholder_name || c.user} size={28}/>
                      <span style={{ fontSize: 13 }}>{c.cardholder_name || c.user || '—'}</span>
                    </div>
                  </TD>
                  <TD>{cardTypeBadge(c.card_type)}</TD>
                  <TD mono style={{ fontSize: 12, color: TEXT_1 }}>₹{Number(c.credit_limit || 0).toLocaleString()}</TD>
                  <TD mono style={{ fontSize: 12, color: SUCCESS }}>₹{Number(c.available_credit || 0).toLocaleString()}</TD>
                  <TD><StatusPill status={c.status || 'active'}/></TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {c.status === 'active'  && <Btn size="sm" variant="ghost"   disabled={!!actionLoading[c.id]} onClick={() => doCardAction(c, 'freeze')}>{actionLoading[c.id] === 'freeze' ? <Spinner size={10}/> : <Lock size={10}/>} Freeze</Btn>}
                      {c.status === 'frozen'  && <Btn size="sm" variant="success" disabled={!!actionLoading[c.id]} onClick={() => doCardAction(c, 'unfreeze')}>{actionLoading[c.id] === 'unfreeze' ? <Spinner size={10}/> : <Unlock size={10}/>} Unfreeze</Btn>}
                      {c.status !== 'blocked' && <Btn size="sm" variant="danger"  disabled={!!actionLoading[c.id]} onClick={() => doCardAction(c, 'block')}>{actionLoading[c.id] === 'block' ? <Spinner size={10}/> : <XCircle size={10}/>} Block</Btn>}
                      {c.status === 'blocked' && <Btn size="sm" variant="success" onClick={() => doCardAction(c, 'unblock')}><Unlock size={10}/> Unblock</Btn>}
                    </div>
                  </TD>
                </TR>
              ))}
            />
          )}
      </div>

      <PModal open={approveModal} onClose={() => setApproveModal(false)} title="Review Card Request" width={400}>
        <form onSubmit={handleApprove} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Request ID" type="number" placeholder="Enter request ID" value={approveForm.request_id} onChange={e => setApproveForm(s => ({ ...s, request_id: e.target.value }))} required/>
          <Select label="Decision" value={approveForm.approve} onChange={e => setApproveForm(s => ({ ...s, approve: e.target.value === 'true' }))}>
            <option value="true">Approve</option>
            <option value="false">Reject</option>
          </Select>
          <Btn variant="primary" onClick={handleApprove} style={{ justifyContent: 'center' }}>
            Submit Decision <ChevronRight size={14}/>
          </Btn>
        </form>
      </PModal>
    </div>
  );
};

// ─── KYC Review Tab ────────────────────────────────────────────────────────────
const KYCReviewTab = ({ users, loading, onRefresh }) => {
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ user_id: '', kyc_status: 'verified', reviewer_comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter]       = useState('pending');

  const allPending  = users.filter(u => !u.kyc_status || u.kyc_status === 'pending' || u.kyc_status === 'unverified');
  const allVerified = users.filter(u => u.kyc_status === 'verified');
  const allRejected = users.filter(u => u.kyc_status === 'rejected');
  const shown = filter === 'pending' ? allPending : filter === 'verified' ? allVerified : allRejected;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.reviewKYC({ ...form, user_id: Number(form.user_id) });
      toast.success('KYC review submitted.');
      setModal(false);
      onRefresh();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const quickReview = (userId, status) => {
    setForm({ user_id: String(userId), kyc_status: status, reviewer_comments: status === 'verified' ? 'Document is valid' : 'Document rejected' });
    setModal(true);
  };

  return (
    <div>
      <SectionHeader
        title="KYC Review"
        subtitle={`${allPending.length} pending · ${allVerified.length} verified · ${allRejected.length} rejected`}
        actions={
          <Btn variant="primary" onClick={() => { setForm({ user_id: '', kyc_status: 'verified', reviewer_comments: '' }); setModal(true); }}>
            <Shield size={14}/> Manual Review
          </Btn>
        }
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: 4, background: BG_DEEP, borderRadius: 12, width: 'fit-content', border: `1px solid ${BORDER}` }}>
        {[
          { id: 'pending',  label: `Pending (${allPending.length})`,   color: WARNING },
          { id: 'verified', label: `Verified (${allVerified.length})`, color: SUCCESS },
          { id: 'rejected', label: `Rejected (${allRejected.length})`, color: DANGER  },
        ].map(({ id, label, color }) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: filter === id ? BG_RAISED : 'transparent',
            color: filter === id ? color : TEXT_2,
            fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700,
            boxShadow: filter === id ? `0 0 0 1px ${color}30` : 'none',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 48 }}><Spinner size={24}/></div>
        : shown.length === 0
          ? (
            <div style={{ ...card({ padding: 48 }), textAlign: 'center' }}>
              <CheckCircle2 size={40} color={SUCCESS} style={{ margin: '0 auto 12px' }}/>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: TEXT_1, marginBottom: 6 }}>All caught up!</div>
              <div style={{ color: TEXT_2, fontSize: 13 }}>No {filter} KYC reviews.</div>
            </div>
          ) : (
            <div style={card({ padding: 0, overflow: 'hidden' })}>
              <PTable
                columns={['User', 'User ID', 'Email', 'KYC Status', 'Joined', 'Actions']}
                rows={shown.map((u) => (
                  <TR key={u.id}>
                    <TD>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.username} size={32}/>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{u.username}</span>
                      </div>
                    </TD>
                    <TD mono muted>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Hash size={10} color={TEXT_3}/>{u.id}
                      </div>
                    </TD>
                    <TD muted style={{ fontSize: 12 }}>{u.email}</TD>
                    <TD><StatusPill status={u.kyc_status || 'unverified'}/></TD>
                    <TD muted style={{ fontSize: 11 }}>
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN') : '—'}
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" variant="success" onClick={() => quickReview(u.id, 'verified')}><CheckCircle2 size={11}/> Approve</Btn>
                        <Btn size="sm" variant="danger"  onClick={() => quickReview(u.id, 'rejected')}><XCircle size={11}/> Reject</Btn>
                      </div>
                    </TD>
                  </TR>
                ))}
              />
            </div>
          )
      }

      <PModal open={modal} onClose={() => setModal(false)} title="KYC Review Decision" width={420}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="User ID" type="number" placeholder="Enter user ID" value={form.user_id} onChange={e => setForm(s => ({ ...s, user_id: e.target.value }))} required/>
          <Select label="Decision" value={form.kyc_status} onChange={e => setForm(s => ({ ...s, kyc_status: e.target.value }))}>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </Select>
          <Textarea label="Reviewer Comments" rows={3} placeholder="Document is valid…" value={form.reviewer_comments} onChange={e => setForm(s => ({ ...s, reviewer_comments: e.target.value }))}/>
          <Btn variant="primary" onClick={handleSubmit} disabled={submitting} style={{ justifyContent: 'center', opacity: submitting ? 0.75 : 1 }}>
            {submitting ? <><Spinner size={14} color="#fff"/> Submitting…</> : 'Submit Decision'}
          </Btn>
        </form>
      </PModal>
    </div>
  );
};

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
const AnalyticsTab = ({ users, cards }) => {
  const kycBreakdown = {
    verified: users.filter(u => u.kyc_status === 'verified').length,
    pending:  users.filter(u => u.kyc_status === 'pending' || !u.kyc_status).length,
    rejected: users.filter(u => u.kyc_status === 'rejected').length,
  };
  const cardBreakdown = {
    active:  cards.filter(c => c.status === 'active').length,
    frozen:  cards.filter(c => c.status === 'frozen').length,
    blocked: cards.filter(c => c.status === 'blocked').length,
  };
  const cardTypes = ['Basic', 'Silver', 'Gold', 'Platinum'].map(t => ({ type: t, count: cards.filter(c => c.card_type === t).length }));
  const totalCredit = cards.reduce((s, c) => s + Number(c.credit_limit || 0), 0);

  const Bar = ({ label, value, max, color, showPct }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
          <span style={{ color: TEXT_2 }}>{label}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {showPct && <span style={{ color: TEXT_3, fontSize: 11 }}>{pct.toFixed(0)}%</span>}
            <span style={{ fontWeight: 700, color: TEXT_1, fontFamily: FONT_MONO }}>{value}</span>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }}/>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Platform statistics and distribution overview"/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ ...card({ padding: 24 }), animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Shield size={14} color={ACCENT}/>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: TEXT_1, margin: 0 }}>KYC Status</h3>
          </div>
          <Bar label="Verified" value={kycBreakdown.verified} max={users.length} color={SUCCESS} showPct/>
          <Bar label="Pending"  value={kycBreakdown.pending}  max={users.length} color={WARNING} showPct/>
          <Bar label="Rejected" value={kycBreakdown.rejected} max={users.length} color={DANGER}  showPct/>
        </div>

        <div style={{ ...card({ padding: 24 }), animation: 'fadeUp 0.4s ease 80ms both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <CreditCard size={14} color={SUCCESS}/>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: TEXT_1, margin: 0 }}>Card Status</h3>
          </div>
          <Bar label="Active"  value={cardBreakdown.active}  max={cards.length} color={SUCCESS} showPct/>
          <Bar label="Frozen"  value={cardBreakdown.frozen}  max={cards.length} color="#60A5FA" showPct/>
          <Bar label="Blocked" value={cardBreakdown.blocked} max={cards.length} color={DANGER}  showPct/>
        </div>

        <div style={{ ...card({ padding: 24 }), animation: 'fadeUp 0.4s ease 160ms both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BarChart3 size={14} color="#7C3AED"/>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: TEXT_1, margin: 0 }}>Card Types</h3>
          </div>
          {cardTypes.map(({ type, count }) => (
            <Bar key={type} label={type} value={count} max={Math.max(...cardTypes.map(c => c.count), 1)} color="#7C3AED" showPct/>
          ))}
        </div>

        <div style={{ ...card({ padding: 24 }), animation: 'fadeUp 0.4s ease 240ms both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Database size={14} color={WARNING}/>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: TEXT_1, margin: 0 }}>Platform Summary</h3>
          </div>
          {[
            { label: 'Total Users',    value: users.length,              color: ACCENT    },
            { label: 'Total Cards',    value: cards.length,              color: SUCCESS   },
            { label: 'Verified Users', value: kycBreakdown.verified,     color: SUCCESS   },
            { label: 'Pending Reviews',value: kycBreakdown.pending,      color: WARNING   },
            { label: 'Total Credit',   value: `₹${(totalCredit/100000).toFixed(2)}L`, color: '#7C3AED' },
          ].map(({ label, value, color }, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : '' }}>
              <span style={{ fontSize: 12, color: TEXT_2 }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 800, fontFamily: FONT_MONO, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const isAdmin  = useAuthStore((s) => s.isAdmin);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (!isAdmin) navigate('/dashboard'); }, [isAdmin]);

  const [tab, setTab]     = useState('overview');
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        adminAPI.listUsers().catch(() => ({ data: [] })),
        adminAPI.listAllCards().catch(() => ({ data: [] })),
      ]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.results || []);
      setCards(Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || []);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const TABS = {
    overview:  <OverviewTab users={users} cards={cards} loading={loading}/>,
    users:     <UsersTab users={users} loading={loading} onRefresh={fetchAll}/>,
    cards:     <AdminCardsTab cards={cards} loading={loading} onRefresh={fetchAll}/>,
    kyc:       <KYCReviewTab users={users} loading={loading} onRefresh={fetchAll}/>,
    analytics: <AnalyticsTab users={users} cards={cards}/>,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input::placeholder, textarea::placeholder { color: rgba(240,244,255,0.25); }
        select option { background: #0C0F1E; color: #F0F4FF; }
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', background: BG_DEEP, fontFamily: FONT_DISPLAY }}>
        <Sidebar active={tab} setActive={setTab} onLogout={handleLogout}/>

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 10, background: 'rgba(255,77,79,0.06)', border: '1px solid rgba(255,77,79,0.15)' }}>
                <ShieldCheck size={13} color={DANGER}/>
                <span style={{ fontSize: 11, fontWeight: 800, color: DANGER, letterSpacing: '0.07em', fontFamily: FONT_DISPLAY }}>ADMIN MODE</span>
                <span style={{ fontSize: 11, color: TEXT_3 }}>— Full system access</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, color: TEXT_3 }}>
                  Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Btn variant="ghost" size="sm" onClick={fetchAll}>
                  <RefreshCw size={11}/> Refresh
                </Btn>
              </div>
            </div>

            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              {TABS[tab]}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;