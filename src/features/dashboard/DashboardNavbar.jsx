// src/features/dashboard/DashboardNavbar.jsx
// Finance-ops top navbar — rebrand to Credify ops sections
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, CheckSquare, GitMerge,
  Zap, FileBarChart, User, Bell, Sun, Moon,
  LogOut, Terminal, RefreshCw, ChevronDown, Settings, Home,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

export const TOP_NAV_ITEMS = [
  { id: 'home',           label: 'Home',           icon: Home            },
  { id: 'overview',       label: 'Overview',        icon: LayoutDashboard },
  { id: 'payments',       label: 'Payments',        icon: CreditCard      },
  { id: 'approvals',      label: 'Approvals',       icon: CheckSquare,  badge: 7 },
  { id: 'reconciliation', label: 'Reconciliation',  icon: GitMerge        },
  { id: 'webhooks',       label: 'Webhooks',        icon: Zap             },
  { id: 'reports',        label: 'Reports',         icon: FileBarChart    },
  { id: 'profile',        label: 'Profile',         icon: User            },
];

const avatarPalette = ['#3b61f5','#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4'];

const DashboardNavbar = ({ activeSection, setActiveSection, onRefresh }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark  = theme === 'dark';
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const avatarColor = user?.username
    ? avatarPalette[user.username.charCodeAt(0) % avatarPalette.length]
    : '#3b61f5';
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: isDark ? 'rgba(7,9,15,0.97)' : 'rgba(246,248,255,0.97)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,97,245,0.1)'}`,
      boxShadow: isDark ? '0 1px 20px rgba(0,0,0,0.5)' : '0 1px 16px rgba(59,97,245,0.07)',
    }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 20px', height:56, gap:4 }}>
        {/* Logo */}
        <button onClick={() => setActiveSection('overview')} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:'6px 12px 6px 4px', borderRadius:10, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#3b61f5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(59,97,245,0.4)' }}>
            <GitMerge size={14} color="#fff" />
          </div>
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, letterSpacing:'-0.02em', color:'var(--text-primary)' }}>
            Credify
          </span>
        </button>

        {/* Nav items */}
        <nav style={{ display:'flex', alignItems:'center', gap:2, marginLeft:16, flex:1, overflow:'auto' }}>
          {TOP_NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
            const active = activeSection === id;
            return (
              <button key={id} onClick={() => setActiveSection(id)} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 12px', borderRadius:8, border:'none',
                background: active ? (isDark ? 'rgba(59,97,245,0.15)' : 'rgba(59,97,245,0.1)') : 'transparent',
                color: active ? '#3b61f5' : 'var(--text-muted)',
                fontSize:13, fontWeight: active ? 700 : 500,
                cursor:'pointer', transition:'all 0.15s ease',
                fontFamily:"'DM Sans','Sora',sans-serif",
                whiteSpace:'nowrap', position:'relative',
              }}
              onMouseEnter={e => { if(!active) { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(59,97,245,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={e => { if(!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
              >
                <Icon size={14} />
                {label}
                {badge && (
                  <span style={{ fontSize:9, fontWeight:800, background:'rgba(245,158,11,0.2)', color:'#f59e0b', padding:'1px 5px', borderRadius:4 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 }}>
          {onRefresh && (
            <button onClick={onRefresh} title="Refresh" style={{ width:34,height:34,borderRadius:9,border:'1px solid var(--border)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-muted)',transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#3b61f5';e.currentTarget.style.borderColor='rgba(59,97,245,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.borderColor='var(--border)';}}>
              <RefreshCw size={14} />
            </button>
          )}
          <button onClick={toggleTheme} style={{ width:34,height:34,borderRadius:9,border:'1px solid var(--border)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:isDark?'#f59e0b':'#3b61f5',transition:'all 0.2s' }}>
            {isDark ? <Sun size={14}/> : <Moon size={14}/>}
          </button>
          {isAdmin && (
            <button onClick={() => navigate('/dev')} title="Dev Panel" style={{ width:34,height:34,borderRadius:9,border:'1px solid var(--border)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--text-muted)',transition:'all 0.2s' }}>
              <Terminal size={14} />
            </button>
          )}
          {/* Avatar dropdown */}
          <div ref={dropRef} style={{ position:'relative' }}>
            <button onClick={() => setDropOpen(!dropOpen)} style={{ display:'flex',alignItems:'center',gap:7,padding:'5px 10px',borderRadius:10,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',transition:'all 0.15s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(59,97,245,0.3)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';}}>
              <div style={{ width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,${avatarColor},${avatarColor}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',fontFamily:"'Sora',sans-serif" }}>{initials}</div>
              <span style={{ fontSize:12,fontWeight:600,color:'var(--text-primary)',fontFamily:"'DM Sans',sans-serif",maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.username || 'User'}</span>
              <ChevronDown size={12} color="var(--text-muted)" style={{ transform:dropOpen?'rotate(180deg)':'none',transition:'transform 0.2s' }} />
            </button>

            {dropOpen && (
              <div style={{ position:'absolute',top:'calc(100% + 8px)',right:0,minWidth:180,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',overflow:'hidden',zIndex:100 }}>
                <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)' }}>
                  <p style={{ fontSize:12,fontWeight:700,color:'var(--text-primary)',marginBottom:2 }}>{user?.username}</p>
                  <p style={{ fontSize:11,color:'var(--text-muted)' }}>{user?.email || 'Finance Ops'}</p>
                </div>
                {[
                  { icon:Home,     label:'My Home',  onClick:()=>{navigate('/user-home');setDropOpen(false);} },
                  { icon:Settings, label:'Settings', onClick:()=>{setActiveSection('profile');setDropOpen(false);} },
                  { icon:LogOut,   label:'Logout',   onClick:handleLogout, danger:true },
                ].map(({ icon:Icon, label, onClick, danger }) => (
                  <button key={label} onClick={onClick} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',color:danger?'#ef4444':'var(--text-secondary)',fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:500,textAlign:'left',transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=danger?'rgba(239,68,68,0.07)':'rgba(59,97,245,0.05)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;