import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

const NAV = [
  {
    id: 'overview',
    label: 'Overview',
    to: '/dev',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'tables',
    label: 'Tables',
    to: '/dev/tables',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v2H3V5z"/><path d="M3 9h18M3 13h18M3 17h18M5 21h14a2 2 0 002-2v-2H3v2a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    id: 'query',
    label: 'Query Runner',
    to: '/dev/query',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    id: 'api',
    label: 'API Debug',
    to: '/dev/api',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    id: 'logs',
    label: 'Audit Logs',
    to: '/dev/logs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M9 16h6M9 8h6M5 3H3a2 2 0 00-2 2v16a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2h-2"/>
        <path d="M9 3h6a1 1 0 010 2H9a1 1 0 010-2z"/>
      </svg>
    ),
  },
];

export default function DevLayout() {
  const { user, isAdmin, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={styles.root}>
      {/* ── Grid lines bg ── */}
      <div style={styles.gridBg} />

      {/* ── Sidebar ── */}
      <aside style={{ ...styles.sidebar, width: collapsed ? 68 : 240 }}>
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoMark}>
            <span style={styles.logoIcon}>⬡</span>
          </div>
          {!collapsed && (
            <div style={styles.logoText}>
              <span style={styles.logoName}>DevPanel</span>
              <span style={styles.logoBadge}>ALPHA</span>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={styles.collapseBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <polyline points="13 17 18 12 13 7"/> : <polyline points="11 17 6 12 11 7"/>}
            </svg>
          </button>
        </div>

        {/* System status */}
        {!collapsed && (
          <div style={styles.statusBar}>
            <span style={styles.statusDot} />
            <span style={styles.statusText}>PostgreSQL · Connected</span>
          </div>
        )}

        {/* Nav */}
        <nav style={styles.nav}>
          {NAV.map((item, i) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
                animationDelay: `${i * 60}ms`,
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ ...styles.navIcon, ...(isActive ? styles.navIconActive : {}) }}>
                    {item.icon}
                  </span>
                  {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
                  {isActive && !collapsed && <span style={styles.navActivePip} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ ...styles.sidebarFooter, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={styles.avatar}>
            {(user?.full_name || user?.email || 'D')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.full_name || user?.email || 'Developer'}</span>
              <span style={styles.userRole}>{isAdmin ? 'Admin' : 'Dev'}</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={styles.main}>
        {/* Top bar */}
        <header style={styles.topBar}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbRoot}>dev</span>
            {location.pathname !== '/dev' && (
              <>
                <span style={styles.breadcrumbSep}>/</span>
                <span style={styles.breadcrumbCurrent}>
                  {location.pathname.replace('/dev/', '')}
                </span>
              </>
            )}
          </div>
          <div style={styles.topBarActions}>
            <div style={styles.envBadge}>
              <span style={styles.envDot} />
              <span>localhost:8080</span>
            </div>
            <div style={styles.timeBadge}>{new Date().toLocaleTimeString()}</div>
          </div>
        </header>

        {/* Outlet */}
        <div style={styles.outlet}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulseGlow { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const C = {
  bg: '#080c14',
  bgSubtle: '#0d1321',
  bgCard: 'rgba(255,255,255,0.035)',
  border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5',
  brandGlow: 'rgba(59,97,245,0.15)',
  text: '#f0f4ff',
  textSecondary: '#8b96b0',
  textMuted: '#4b5675',
  success: '#10b981',
};

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    background: C.bg,
    overflow: 'hidden',
    position: 'relative',
    fontFamily: "'DM Sans', sans-serif",
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(rgba(59,97,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,97,245,0.04) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(8,12,20,0.95)',
    borderRight: `1px solid ${C.border}`,
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 10,
    transition: 'width 240ms cubic-bezier(0.16,1,0.3,1)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px 16px',
    borderBottom: `1px solid ${C.border}`,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${C.brand}, #6089ff)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 0 16px rgba(59,97,245,0.4)`,
  },
  logoIcon: { fontSize: 16, color: '#fff' },
  logoText: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  logoName: { fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' },
  logoBadge: {
    fontSize: 9, fontWeight: 700, color: C.brand, letterSpacing: '0.1em',
    background: C.brandGlow, padding: '1px 5px', borderRadius: 3, width: 'fit-content',
  },
  collapseBtn: {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    color: C.textMuted,
    borderRadius: 6,
    width: 24,
    height: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 150ms, color 150ms',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderBottom: `1px solid ${C.border}`,
    background: 'rgba(16,185,129,0.04)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: C.success,
    boxShadow: `0 0 6px ${C.success}`,
    animation: 'pulseGlow 2s ease-in-out infinite',
  },
  statusText: { fontSize: 11, color: C.success, fontFamily: "'JetBrains Mono',monospace" },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 8px', overflowY: 'auto' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
    borderRadius: 8,
    color: C.textSecondary,
    textDecoration: 'none',
    fontSize: 13.5,
    fontWeight: 500,
    transition: 'background 150ms, color 150ms',
    position: 'relative',
    animation: 'slideIn 300ms both',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navLinkActive: {
    background: C.brandGlow,
    color: '#8ba7ff',
    border: `1px solid rgba(59,97,245,0.2)`,
  },
  navIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
    opacity: 0.65,
    transition: 'opacity 150ms',
  },
  navIconActive: { opacity: 1 },
  navLabel: { flex: 1 },
  navActivePip: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: C.brand,
    boxShadow: `0 0 6px ${C.brand}`,
  },
  sidebarFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderTop: `1px solid ${C.border}`,
    marginTop: 'auto',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.brand}, #6089ff)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 },
  userName: { fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: 10, color: C.brand, textTransform: 'uppercase', letterSpacing: '0.05em' },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 5,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    borderBottom: `1px solid ${C.border}`,
    background: 'rgba(8,12,20,0.8)',
    backdropFilter: 'blur(10px)',
    flexShrink: 0,
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 },
  breadcrumbRoot: { color: C.brand },
  breadcrumbSep: { color: C.textMuted },
  breadcrumbCurrent: { color: C.text },
  topBarActions: { display: 'flex', alignItems: 'center', gap: 12 },
  envBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: '4px 10px', fontSize: 11, color: C.textSecondary,
    fontFamily: "'JetBrains Mono',monospace",
  },
  envDot: { width: 6, height: 6, borderRadius: '50%', background: C.success },
  timeBadge: {
    fontSize: 11, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace",
  },
  outlet: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
  },
};
