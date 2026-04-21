// src/pages/dev/DevLayout.jsx
// Supports both light and dark themes via CSS variables
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import useAuthStore  from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV = [
  {
    id: 'overview', label: 'Overview', to: '/dev', end: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'tables', label: 'Tables', to: '/dev/tables',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v2H3V5z"/><path d="M3 9h18M3 13h18M3 17h18M5 21h14a2 2 0 002-2v-2H3v2a2 2 0 002 2z"/></svg>,
  },
  {
    id: 'query', label: 'Query Runner', to: '/dev/query',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  },
  {
    id: 'api', label: 'API Debug', to: '/dev/api',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  },
  {
    id: 'logs', label: 'Audit Logs', to: '/dev/logs',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6M9 16h6M9 8h6M5 3H3a2 2 0 00-2 2v16a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2h-2"/><path d="M9 3h6a1 1 0 010 2H9a1 1 0 010-2z"/></svg>,
  },
  { _divider: true, label: 'Phase 1' },
  {
    id: 'tasks', label: 'Celery Tasks', to: '/dev/tasks', badge: 'NEW',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
  {
    id: 'sentry', label: 'Sentry Errors', to: '/dev/sentry', badge: 'NEW',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    id: 'migrations', label: 'Migrations', to: '/dev/migrations', badge: 'NEW',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  },
  { _divider: true, label: 'Phase 2' },
  {
    id: 'redis', label: 'Redis Inspector', to: '/dev/redis', badge: 'LIVE',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  },
  {
    id: 'config', label: 'Env Config', to: '/dev/config', badge: 'LIVE',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  },
  {
    id: 'indexes', label: 'Index Health', to: '/dev/indexes', badge: 'LIVE',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
];

// ── Badge colors ───────────────────────────────────────────────────────────────
const BADGE_STYLE = {
  NEW:  { bg: 'rgba(59,97,245,0.2)',   color: '#6089ff' },
  LIVE: { bg: 'rgba(16,185,129,0.2)',  color: '#34d399' },
  SOON: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

// ── Credify Dev logo ───────────────────────────────────────────────────────────
const DevLogo = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="9" fill="url(#dev-logo-g)"/>
    <path d="M20 8 L29 12 L29 21 Q29 28 20 32 Q11 28 11 21 L11 12 Z"
      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinejoin="round"/>
    <rect x="14" y="17" width="10" height="7" rx="1.5"
      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2"/>
    <line x1="14" y1="20" x2="24" y2="20" stroke="rgba(255,255,255,0.85)" strokeWidth="0.9"/>
    <path d="M17.5 17 L17.5 15.5 Q17.5 14 19 14 Q20.5 14 20.5 15.5 L20.5 17"
      stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
    <path d="M25 14.5 L27 17 L31 12.5" stroke="#4ade80" strokeWidth="1.7"
      fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="dev-logo-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b61f5"/>
        <stop offset="100%" stopColor="#6d28d9"/>
      </linearGradient>
    </defs>
  </svg>
);

// ── Theme toggle button ────────────────────────────────────────────────────────
const ThemeToggle = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    style={{
      width: 34, height: 34, borderRadius: 8, border: '1px solid var(--dev-card-border)',
      background: 'var(--dev-card-bg)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 200ms', flexShrink: 0,
      color: 'var(--dev-text-secondary)',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,97,245,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,97,245,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--dev-card-bg)'; e.currentTarget.style.borderColor = 'var(--dev-card-border)'; }}
  >
    {isDark ? (
      // Sun icon for "switch to light"
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ) : (
      // Moon icon for "switch to dark"
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    )}
  </button>
);

// ── Main layout ────────────────────────────────────────────────────────────────
export default function DevLayout() {
  const { user, isAdmin, logout }   = useAuthStore();
  const { theme, toggleTheme }      = useThemeStore();
  const navigate                    = useNavigate();
  const location                    = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [time, setTime]             = useState(new Date().toLocaleTimeString());
  const isDark                      = theme === 'dark';

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) navigate('/dashboard', { replace: true });
  }, [isAdmin, navigate]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const breadCrumbPage = location.pathname
    .replace('/dev', '').replace(/^\//, '').split('/')[0] || '';

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%',
      background: 'var(--dev-bg)', overflow: 'hidden',
      position: 'fixed', inset: 0, zIndex: 100,
      fontFamily: "'DM Sans',sans-serif",
      transition: 'background 300ms ease',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--dev-grid) 1px, transparent 1px), linear-gradient(90deg, var(--dev-grid) 1px, transparent 1px)`,
        backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Sidebar ── */}
      <aside style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--dev-sidebar-bg)',
        borderRight: '1px solid var(--dev-sidebar-border)',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 10,
        width: collapsed ? 64 : 240,
        transition: 'width 240ms cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden', flexShrink: 0,
      }}>

        {/* Logo header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 14px 14px',
          borderBottom: '1px solid var(--dev-sidebar-border)',
        }}>
          <DevLogo />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dev-text-primary)', fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>
                DevPanel
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#3b61f5', letterSpacing: '0.1em', background: 'rgba(59,97,245,0.12)', padding: '1px 5px', borderRadius: 3, width: 'fit-content' }}>
                ALPHA
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            title="Toggle sidebar"
            style={{
              background: 'var(--dev-collapse-bg)', border: '1px solid var(--dev-collapse-border)',
              color: 'var(--dev-text-muted)', borderRadius: 6, width: 24, height: 24,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 150ms',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed
                ? <polyline points="13 17 18 12 13 7"/>
                : <polyline points="11 17 6 12 11 7"/>}
            </svg>
          </button>
        </div>

        {/* DB status */}
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderBottom: '1px solid var(--dev-sidebar-border)',
            background: 'var(--dev-status-bg)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'devPulse 2s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#10b981', fontFamily: "'JetBrains Mono',monospace" }}>
              PostgreSQL · Connected
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV.map((item, i) => {
            if (item._divider) {
              if (collapsed) return null;
              return (
                <div key={item.label} style={{ padding: '10px 10px 4px', marginTop: 4 }}>
                  <div style={{ height: 1, background: 'var(--dev-divider)', marginBottom: 6 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--dev-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {item.label}
                  </span>
                </div>
              );
            }

            const isSoon   = item.badge === 'SOON';
            const badgeCfg = item.badge ? BADGE_STYLE[item.badge] : null;

            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                onClick={isSoon ? e => e.preventDefault() : undefined}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8,
                  color: isActive && !isSoon ? 'var(--dev-nav-active-c)' : 'var(--dev-nav-link)',
                  background: isActive && !isSoon ? 'var(--dev-nav-active-bg)' : 'transparent',
                  textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                  transition: 'all 150ms',
                  border: isActive && !isSoon ? '1px solid rgba(59,97,245,0.2)' : '1px solid transparent',
                  position: 'relative', animation: `devSlideIn 300ms ${i * 45}ms both`,
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  paddingLeft: collapsed ? 0 : 10,
                  opacity: isSoon ? 0.45 : 1,
                  cursor: isSoon ? 'default' : 'pointer',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ width: 18, height: 18, flexShrink: 0, opacity: isActive && !isSoon ? 1 : 0.55, transition: 'opacity 150ms' }}>
                      {item.icon}
                    </span>
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && badgeCfg && (
                      <span style={{
                        fontSize: 8, fontWeight: 800, letterSpacing: '0.06em',
                        padding: '2px 5px', borderRadius: 4,
                        background: badgeCfg.bg, color: badgeCfg.color,
                      }}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && !collapsed && !isSoon && (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b61f5', boxShadow: '0 0 6px #3b61f5' }} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Back to admin */}
        {!collapsed && (
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, margin: '0 8px 8px',
              padding: '8px 10px', borderRadius: 8, background: 'transparent',
              border: '1px solid var(--dev-card-border)', color: 'var(--dev-text-muted)',
              cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans',sans-serif",
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--dev-text-secondary)'; e.currentTarget.style.borderColor = 'rgba(59,97,245,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--dev-text-muted)'; e.currentTarget.style.borderColor = 'var(--dev-card-border)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Admin Dashboard
          </button>
        )}

        {/* User footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderTop: '1px solid var(--dev-sidebar-border)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b61f5, #6089ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }} title={user?.username}>
            {(user?.full_name || user?.username || user?.email || 'D')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dev-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || user?.email || 'Developer'}
              </span>
              <span style={{ fontSize: 10, color: '#3b61f5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin · Staff</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--dev-text-muted)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--dev-text-muted)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 5 }}>

        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: 52,
          borderBottom: '1px solid var(--dev-topbar-border)',
          background: 'var(--dev-topbar-bg)', backdropFilter: 'blur(12px)', flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
            <span style={{ color: '#3b61f5', fontWeight: 700 }}>dev</span>
            {breadCrumbPage && (
              <>
                <span style={{ color: 'var(--dev-text-muted)' }}>/</span>
                <span style={{ color: 'var(--dev-text-primary)', fontWeight: 500 }}>{breadCrumbPage}</span>
              </>
            )}
          </div>

          {/* Right side: env chip + clock + theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Server chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--dev-card-bg)', border: '1px solid var(--dev-card-border)',
              borderRadius: 7, padding: '4px 10px',
              fontSize: 11, color: 'var(--dev-text-secondary)',
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              localhost:8000
            </div>
            {/* Clock */}
            <span style={{ fontSize: 11, color: 'var(--dev-text-muted)', fontFamily: "'JetBrains Mono',monospace", minWidth: 70, textAlign: 'right' }}>
              {time}
            </span>
            {/* Theme toggle */}
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes devSlideIn  { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes devPulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(59,97,245,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(59,97,245,0.4); }
      `}</style>
    </div>
  );
}
