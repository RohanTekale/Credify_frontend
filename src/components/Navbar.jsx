// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Menu, X, LayoutDashboard, LogOut, User, ChevronDown, Bell, Terminal } from 'lucide-react';
import useAuthStore from '../store/authStore';

const avatarPalette = ['#3b61f5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const DropdownItem = ({ icon: Icon, label, onClick, color = '#aaa', danger, badge }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', padding: '9px 16px',
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: danger ? '#f87171' : '#b0bbd4',
      fontSize: 13, fontFamily: 'Sora,sans-serif', fontWeight: 500,
      transition: 'all 150ms ease', textAlign: 'left',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)';
      e.currentTarget.style.color = danger ? '#ff6b6b' : '#fff';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = danger ? '#f87171' : '#b0bbd4';
    }}
  >
    <div style={{
      width: 26, height: 26, borderRadius: 7,
      background: `${color}18`, border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={12} color={color} />
    </div>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
        background: `${color}20`, color, padding: '2px 6px',
        borderRadius: 4, textTransform: 'uppercase',
      }}>{badge}</span>
    )}
  </button>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();

  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials    = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const avatarColor = user?.username
    ? avatarPalette[user.username.charCodeAt(0) % avatarPalette.length]
    : '#3b61f5';

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,12,20,0.95)' : 'rgba(8,12,20,0.5)',
          backdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3b61f5,#1d37cc)', boxShadow: '0 4px 12px rgba(59,97,245,0.35)' }}>
              <CreditCard size={16} color="#fff" />
            </div>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, letterSpacing:'-0.03em', color:'#fff' }}>
              Credify
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button key={link.path} onClick={() => navigate(link.path)} className="btn-ghost"
                style={{ color: isActive(link.path) && link.path !== '/' ? '#fff' : location.pathname === link.path ? '#fff' : '#aaa' }}>
                {link.label}
              </button>
            ))}

            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-ghost"
                style={{ color: isActive('/dashboard') ? '#fff' : '#6089ff', display:'flex', alignItems:'center', gap:5, fontWeight:600 }}
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
            )}

            {/* ── Dev Panel tab — only for admin users ── */}
            {user && isAdmin && (
              <button
                onClick={() => navigate('/dev')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isActive('/dev')
                    ? 'rgba(59,97,245,0.15)'
                    : 'rgba(59,97,245,0.08)',
                  color: isActive('/dev') ? '#8ba7ff' : '#6089ff',
                  fontSize: 13, fontWeight: 700,
                  fontFamily: 'Sora,sans-serif',
                  transition: 'all 200ms',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,97,245,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive('/dev') ? 'rgba(59,97,245,0.15)' : 'rgba(59,97,245,0.08)'}
              >
                <Terminal size={13} />
                Dev Panel
                <span style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: '0.08em',
                  background: 'rgba(59,97,245,0.3)', color: '#8ba7ff',
                  padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase',
                }}>
                  ADMIN
                </span>
              </button>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                {/* Avatar pill */}
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px 5px 5px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 50, cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `linear-gradient(135deg,${avatarColor},${avatarColor}aa)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Sora,sans-serif',
                    boxShadow: `0 0 0 2px rgba(255,255,255,0.07), 0 2px 8px ${avatarColor}40`,
                  }}>
                    {initials}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', lineHeight:1.2 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#fff', fontFamily:'Sora,sans-serif' }}>
                      {user.username}
                    </span>
                    {isAdmin && (
                      <span style={{ fontSize:9, color:'#f59e0b', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>Admin</span>
                    )}
                  </div>
                  <ChevronDown size={13} color="#666"
                    style={{ transition:'transform 200ms', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div style={{
                    position:'absolute', top:'calc(100% + 10px)', right:0, width:220,
                    background:'rgba(9,13,24,0.98)',
                    border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:14,
                    boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
                    backdropFilter:'blur(24px)',
                    overflow:'hidden', zIndex:200,
                    animation:'navDropIn 140ms cubic-bezier(0.16,1,0.3,1)',
                  }}>
                    {/* User header */}
                    <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:36, height:36, borderRadius:'50%',
                          background:`linear-gradient(135deg,${avatarColor},${avatarColor}99)`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:700, color:'#fff', fontFamily:'Sora,sans-serif',
                          boxShadow:`0 4px 12px ${avatarColor}40`,
                        }}>{initials}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:'Sora,sans-serif' }}>
                            {user.username}
                          </div>
                          <div style={{ fontSize:11, color:'#4b5675', marginTop:1 }}>
                            {user.email || (isAdmin ? 'Administrator' : 'Member')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding:'6px 0' }}>
                      <DropdownItem icon={LayoutDashboard} label="Dashboard"    onClick={() => navigate('/dashboard')} color="#3b61f5" />
                      <DropdownItem icon={User}            label="Profile"      onClick={() => navigate('/dashboard')} color="#8b5cf6" />
                      <DropdownItem icon={Bell}            label="Notifications" onClick={() => navigate('/dashboard')} color="#10b981" />

                      {/* Dev Panel entry — admin only */}
                      {isAdmin && (
                        <>
                          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                          <DropdownItem
                            icon={Terminal}
                            label="Dev Panel"
                            onClick={() => navigate('/dev')}
                            color="#3b61f5"
                            badge="Admin"
                          />
                        </>
                      )}
                    </div>

                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'6px 0' }}>
                      <DropdownItem icon={LogOut} label="Sign Out" onClick={handleLogout} color="#ef4444" danger />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/login')}>Log In</button>
                <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa' }}
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ padding:16, background:'rgba(8,12,20,0.98)', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            {navLinks.map((link) => (
              <button key={link.path} onClick={() => navigate(link.path)} style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'10px 12px', marginBottom:2, borderRadius:8,
                background: location.pathname === link.path ? 'rgba(59,97,245,0.12)' : 'transparent',
                color: location.pathname === link.path ? '#fff' : '#aaa',
                border:'none', cursor:'pointer', fontSize:14,
                fontFamily:'Sora,sans-serif', fontWeight:500,
              }}>{link.label}</button>
            ))}

            {user && (
              <button onClick={() => navigate('/dashboard')} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%',
                padding:'10px 12px', marginBottom:2, borderRadius:8,
                background: isActive('/dashboard') ? 'rgba(59,97,245,0.12)' : 'transparent',
                color:'#6089ff', border:'none', cursor:'pointer',
                fontSize:14, fontFamily:'Sora,sans-serif', fontWeight:600,
              }}>
                <LayoutDashboard size={15}/> Dashboard
              </button>
            )}

            {/* Dev Panel mobile link — admin only */}
            {user && isAdmin && (
              <button onClick={() => navigate('/dev')} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%',
                padding:'10px 12px', marginBottom:2, borderRadius:8,
                background: isActive('/dev') ? 'rgba(59,97,245,0.15)' : 'rgba(59,97,245,0.07)',
                color:'#8ba7ff', border:'1px solid rgba(59,97,245,0.2)',
                cursor:'pointer', fontSize:14, fontFamily:'Sora,sans-serif', fontWeight:700,
              }}>
                <Terminal size={15}/>
                Dev Panel
                <span style={{ fontSize:9, fontWeight:800, color:'#8ba7ff', background:'rgba(59,97,245,0.2)', padding:'2px 6px', borderRadius:3, letterSpacing:'0.06em', textTransform:'uppercase', marginLeft:'auto' }}>ADMIN</span>
              </button>
            )}

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:8, paddingTop:12 }}>
              {user ? (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:8 }}>
                    <div style={{
                      width:32, height:32, borderRadius:'50%',
                      background:`linear-gradient(135deg,${avatarColor},${avatarColor}cc)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, color:'#fff',
                    }}>{initials}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:'Sora,sans-serif' }}>{user.username}</div>
                      {isAdmin && <div style={{ fontSize:10, color:'#f59e0b', fontWeight:700 }}>ADMIN</div>}
                    </div>
                  </div>
                  <button onClick={handleLogout} style={{
                    width:'100%', padding:'10px 12px', borderRadius:8,
                    background:'rgba(239,68,68,0.12)', color:'#f87171',
                    border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer',
                    fontSize:14, fontFamily:'Sora,sans-serif', fontWeight:600,
                  }}>Sign Out</button>
                </div>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} style={{ display:'block',width:'100%',padding:'10px 12px',marginBottom:8,borderRadius:8,background:'rgba(255,255,255,0.05)',color:'#fff',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontSize:14,fontFamily:'Sora,sans-serif',fontWeight:500 }}>Log In</button>
                  <button onClick={() => navigate('/register')} style={{ display:'block',width:'100%',padding:'10px 12px',borderRadius:8,background:'linear-gradient(135deg,#3b61f5,#1d37cc)',color:'#fff',border:'none',cursor:'pointer',fontSize:14,fontFamily:'Sora,sans-serif',fontWeight:600 }}>Get Started</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes navDropIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
