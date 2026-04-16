// src/components/Navbar.jsx
// Updated: Added dark/light mode toggle, premium light theme defaults
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard, Menu, X, LayoutDashboard, LogOut, User,
  ChevronDown, Bell, Terminal, Sun, Moon,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const avatarPalette = ['#3b61f5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

const DropdownItem = ({ icon: Icon, label, onClick, color = '#aaa', danger, badge }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', padding: '9px 16px',
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: danger ? '#dc2626' : 'var(--text-secondary)',
      fontSize: 13, fontFamily: 'Sora,sans-serif', fontWeight: 500,
      transition: 'all 150ms ease', textAlign: 'left',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.07)' : 'rgba(59,97,245,0.06)';
      e.currentTarget.style.color = danger ? '#dc2626' : 'var(--text-primary)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = danger ? '#dc2626' : 'var(--text-secondary)';
    }}
  >
    <div style={{
      width: 26, height: 26, borderRadius: 7,
      background: `${color}15`, border: `1px solid ${color}22`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={12} color={color} />
    </div>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
        background: `${color}18`, color, padding: '2px 6px',
        borderRadius: 4, textTransform: 'uppercase',
      }}>{badge}</span>
    )}
  </button>
);

/* ── Theme Toggle Button ────────────────────────────────────────────────── */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        width: 36, height: 36, borderRadius: 10,
        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(59,97,245,0.07)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(59,97,245,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 200ms ease',
        color: isDark ? '#f59e0b' : '#3b61f5',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(59,97,245,0.12)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(59,97,245,0.07)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

const Navbar = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const { theme }    = useThemeStore();
  const isDark       = theme === 'dark';

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
    { path: '/',         label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing',  label: 'Pricing' },
    { path: '/faq',      label: 'FAQ' },
  ];

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const initials    = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const avatarColor = user?.username
    ? avatarPalette[user.username.charCodeAt(0) % avatarPalette.length]
    : '#3b61f5';

  const navBg = scrolled
    ? isDark ? 'rgba(8,12,20,0.95)' : 'rgba(255,255,255,0.95)'
    : isDark ? 'rgba(8,12,20,0.5)'  : 'rgba(255,255,255,0.7)';

  const navBorder = scrolled
    ? isDark ? 'rgba(255,255,255,0.07)' : 'rgba(59,97,245,0.1)'
    : 'transparent';

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: navBg,
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: `1px solid ${navBorder}`,
          boxShadow: scrolled
            ? isDark ? '0 1px 20px rgba(0,0,0,0.4)' : '0 1px 20px rgba(59,97,245,0.08)'
            : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #3b61f5, #1d37cc)',
                boxShadow: '0 4px 12px rgba(59,97,245,0.35)',
              }}
            >
              <CreditCard size={17} color="#fff" />
            </div>
            <span style={{
              fontFamily: 'Sora,sans-serif', fontWeight: 800, fontSize: 19,
              letterSpacing: '-0.03em', color: 'var(--text-primary)',
            }}>
              Credify
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
                  borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Sora,sans-serif', fontWeight: 600, fontSize: 13.5,
                  color: isActive(link.path) ? 'var(--brand-400)' : 'var(--text-secondary)',
                  transition: 'all 150ms ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(59,97,245,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = isActive(link.path) ? 'var(--brand-400)' : 'var(--text-secondary)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {link.label}
                {isActive(link.path) && (
                  <span style={{
                    position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'var(--brand-400)',
                  }} />
                )}
              </button>
            ))}

            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: 13.5,
                  color: isActive('/dashboard') ? 'var(--brand-400)' : 'var(--brand-500)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,97,245,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
            )}

            {user && isAdmin && (
              <button
                onClick={() => navigate('/dev')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isActive('/dev') ? 'rgba(59,97,245,0.12)' : 'rgba(59,97,245,0.07)',
                  color: isActive('/dev') ? 'var(--brand-400)' : 'var(--brand-500)',
                  fontSize: 13, fontWeight: 700, fontFamily: 'Sora,sans-serif',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,97,245,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive('/dev') ? 'rgba(59,97,245,0.12)' : 'rgba(59,97,245,0.07)'}
              >
                <Terminal size={13} />
                Dev Panel
                <span style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: '0.08em',
                  background: 'rgba(59,97,245,0.2)', color: 'var(--brand-400)',
                  padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase',
                }}>ADMIN</span>
              </button>
            )}
          </div>

          {/* Right side: Theme toggle + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 10px 5px 5px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(59,97,245,0.06)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(59,97,245,0.15)'}`,
                    borderRadius: 50, cursor: 'pointer', transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(59,97,245,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(59,97,245,0.06)' }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}aa)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Sora,sans-serif',
                    boxShadow: `0 0 0 2px rgba(255,255,255,0.1), 0 2px 8px ${avatarColor}40`,
                  }}>
                    {initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Sora,sans-serif' }}>
                      {user.username}
                    </span>
                    {isAdmin && (
                      <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin</span>
                    )}
                  </div>
                  <ChevronDown size={13} color="var(--text-muted)"
                    style={{ transition: 'transform 200ms', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 224,
                    background: isDark ? 'rgba(9,13,24,0.98)' : 'rgba(255,255,255,0.98)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(59,97,245,0.12)'}`,
                    borderRadius: 16,
                    boxShadow: isDark
                      ? '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)'
                      : '0 16px 48px rgba(59,97,245,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    backdropFilter: 'blur(24px)',
                    overflow: 'hidden', zIndex: 200,
                    animation: 'navDropIn 140ms cubic-bezier(0.16,1,0.3,1)',
                  }}>
                    {/* User header */}
                    <div style={{
                      padding: '14px 16px',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Sora,sans-serif',
                          boxShadow: `0 4px 12px ${avatarColor}40`,
                        }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora,sans-serif' }}>
                            {user.username}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {user.email || (isAdmin ? 'Administrator' : 'Member')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '6px 0' }}>
                      <DropdownItem icon={LayoutDashboard} label="Dashboard"     onClick={() => navigate('/dashboard')} color="#3b61f5" />
                      <DropdownItem icon={User}            label="Profile"       onClick={() => navigate('/dashboard')} color="#8b5cf6" />
                      <DropdownItem icon={Bell}            label="Notifications" onClick={() => navigate('/dashboard')} color="#10b981" />
                      {isAdmin && (
                        <>
                          <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'var(--border)', margin: '4px 0' }} />
                          <DropdownItem icon={Terminal} label="Dev Panel" onClick={() => navigate('/dev')} color="#3b61f5" badge="Admin" />
                        </>
                      )}
                    </div>

                    <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`, padding: '6px 0' }}>
                      <DropdownItem icon={LogOut} label="Sign Out" onClick={handleLogout} color="#dc2626" danger />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Sora,sans-serif', fontWeight: 600, fontSize: 14,
                    color: 'var(--text-secondary)', padding: '8px 14px', borderRadius: 8,
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(59,97,245,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none' }}
                >
                  Log In
                </button>
                <button className="btn-primary" style={{ fontSize: 13.5, padding: '9px 20px' }} onClick={() => navigate('/register')}>
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="md:hidden">
            <ThemeToggle />
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            padding: 16,
            background: isDark ? 'rgba(8,12,20,0.98)' : 'rgba(255,255,255,0.98)',
            borderTop: `1px solid var(--border)`,
            backdropFilter: 'blur(20px)',
          }}>
            {navLinks.map((link) => (
              <button key={link.path} onClick={() => navigate(link.path)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', marginBottom: 2, borderRadius: 10,
                background: isActive(link.path) ? 'rgba(59,97,245,0.1)' : 'transparent',
                color: isActive(link.path) ? 'var(--brand-400)' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontSize: 14,
                fontFamily: 'Sora,sans-serif', fontWeight: 600,
                transition: 'all 150ms',
              }}>{link.label}</button>
            ))}

            {user && (
              <button onClick={() => navigate('/dashboard')} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 14px', marginBottom: 2, borderRadius: 10,
                background: isActive('/dashboard') ? 'rgba(59,97,245,0.1)' : 'transparent',
                color: 'var(--brand-400)', border: 'none', cursor: 'pointer',
                fontSize: 14, fontFamily: 'Sora,sans-serif', fontWeight: 700,
              }}>
                <LayoutDashboard size={15} /> Dashboard
              </button>
            )}

            {user && isAdmin && (
              <button onClick={() => navigate('/dev')} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 14px', marginBottom: 2, borderRadius: 10,
                background: 'rgba(59,97,245,0.08)',
                color: 'var(--brand-400)',
                border: '1px solid rgba(59,97,245,0.15)',
                cursor: 'pointer', fontSize: 14, fontFamily: 'Sora,sans-serif', fontWeight: 700,
              }}>
                <Terminal size={15} />
                Dev Panel
                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--brand-400)', background: 'rgba(59,97,245,0.15)', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.06em', textTransform: 'uppercase', marginLeft: 'auto' }}>ADMIN</span>
              </button>
            )}

            <div style={{ borderTop: `1px solid var(--border)`, marginTop: 8, paddingTop: 12 }}>
              {user ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 8 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>{initials}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora,sans-serif' }}>{user.username}</div>
                      {isAdmin && <div style={{ fontSize: 10, color: '#d97706', fontWeight: 700 }}>ADMIN</div>}
                    </div>
                  </div>
                  <button onClick={handleLogout} style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(220,38,38,0.08)', color: '#dc2626',
                    border: '1px solid rgba(220,38,38,0.15)', cursor: 'pointer',
                    fontSize: 14, fontFamily: 'Sora,sans-serif', fontWeight: 600,
                  }}>Sign Out</button>
                </div>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} style={{ display: 'block', width: '100%', padding: '10px 14px', marginBottom: 8, borderRadius: 10, background: 'rgba(59,97,245,0.06)', color: 'var(--brand-400)', border: '1px solid rgba(59,97,245,0.15)', cursor: 'pointer', fontSize: 14, fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>Log In</button>
                  <button onClick={() => navigate('/register')} style={{ display: 'block', width: '100%', padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#3b61f5,#1d37cc)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Get Started Free</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
