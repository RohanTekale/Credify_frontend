// src/features/console/components/ConsoleSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import { userDisplayName, userInitials } from '../utils';

const NAV_ICONS = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  payments: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  approvals: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3 8-8" /><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" />
    </svg>
  ),
  recon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  ),
  events: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  ledger: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" /><path d="M4 9h16M9 9v11" />
    </svg>
  ),
  policies: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    </svg>
  ),
  vendors: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-6h6v6" />
    </svg>
  ),
  roles: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" /><path d="M17 8h5M19.5 5.5v5" />
    </svg>
  ),
  integrations: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3v4M15 3v4M8 21a5 5 0 005-5v-3H7v3a5 5 0 001 3z" /><path d="M6 7h12v4a6 6 0 01-12 0V7z" />
    </svg>
  ),
  design: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1.2" fill="currentColor" /><circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <path d="M8.5 15a5 5 0 007 0" />
    </svg>
  ),
};

const NavItem = ({ to, icon, children, badge, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `nav${isActive ? ' on' : ''}`}
  >
    {NAV_ICONS[icon]}
    {children}
    {badge ? <span className="cnt">{badge}</span> : null}
  </NavLink>
);

const ConsoleSidebar = ({ approvalsCount = 3 }) => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();

  const initials = userInitials(user);
  const displayName = userDisplayName(user);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="side">
      <div className="brand">
        <span
          style={{
            width: 30, height: 30, borderRadius: 8, flex: 'none',
            background: 'linear-gradient(135deg,var(--indigo),var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <rect x="2" y="5" width="17" height="12" rx="2" transform="rotate(-6 10 11)" />
            <path d="M15 15.5l2.5 2.5 4.5-4.5" />
          </svg>
        </span>
        <div><b>Credify</b><span className="org">Credify Pvt Ltd</span></div>
      </div>

      <div className="navlab">Operate</div>
      <NavItem to="/dashboard" icon="dashboard" end>Dashboard</NavItem>
      <NavItem to="/dashboard/payments" icon="payments">Payments</NavItem>
      <NavItem to="/dashboard/approvals" icon="approvals" badge={approvalsCount}>Approvals</NavItem>
      <NavItem to="/dashboard/recon" icon="recon">Reconciliation</NavItem>
      <NavItem to="/dashboard/events" icon="events">Events</NavItem>
      <NavItem to="/dashboard/ledger" icon="ledger">Ledger</NavItem>

      <div className="navlab">Configure</div>
      <NavItem to="/dashboard/policies" icon="policies">Policies</NavItem>
      <NavItem to="/dashboard/vendors" icon="vendors">Vendors</NavItem>
      <NavItem to="/dashboard/roles" icon="roles">Team & Roles</NavItem>
      <NavItem to="/dashboard/integrations" icon="integrations">Integrations</NavItem>

      <div className="navlab">Design</div>
      <NavItem to="/dashboard/design" icon="design">Design system</NavItem>

      <div className="foot">
        <div className="avatar">{initials}</div>
        <div>
          <b style={{ fontSize: 12 }}>{displayName}</b><br />
          <span className={`role ${isAdmin ? 'r-admin' : 'r-custom'}`}>
            {isAdmin ? 'ADMIN' : 'MEMBER'}
          </span>
        </div>
        <button style={{ marginLeft: 'auto', color: 'var(--dim)' }} onClick={handleSignOut} title="Sign out">
          &#9099;
        </button>
      </div>
    </aside>
  );
};

export default ConsoleSidebar;
