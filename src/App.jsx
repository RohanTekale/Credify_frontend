// src/App.jsx
// Updated: uses themeStore so dark/light background is applied correctly
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes, Route, Navigate, useLocation,
} from 'react-router-dom';

import Navbar              from './components/Navbar';
import BackgroundParticles from './components/BackgroundParticles';
import CredilyChatbot      from './components/CredilyChatbot';
import { ToastProvider }   from './components/ui';

import Home     from './pages/Home';
import Pricing  from './pages/Pricing';
import FAQ      from './pages/FAQ';
import Features from './pages/Features';

import Login          from './features/auth/Login';
import Register       from './features/auth/Register';
import Dashboard      from './features/dashboard/Dashboard';
import AdminDashboard from './features/admin/AdminDashboard';

// ── Dev Panel pages ────────────────────────────────────────────────────────────
import DevLayout    from './pages/dev/DevLayout';
import DevDashboard from './pages/dev/DevDashboard';
import TablesPage   from './pages/dev/TablesPage';
import TableView    from './pages/dev/TableView';
import QueryRunner  from './pages/dev/QueryRunner';
import ApiDebugger  from './pages/dev/ApiDebugger';
import AuditLogs    from './pages/dev/AuditLogs';
import CeleryTasks  from './pages/dev/CeleryTasks';
import SentryErrors from './pages/dev/SentryErrors';
import MigrationStatus from './pages/dev/MigrationStatus';
import ComingSoon      from './pages/dev/ComingSoon';
import RedisInspector  from './pages/dev/RedisInspector';
import EnvConfig       from './pages/dev/EnvConfig';
import IndexHealth     from './pages/dev/IndexHealth';

import useAuthStore  from './store/authStore';
import useThemeStore from './store/themeStore';
import KYCDashboard from './features/kyc/KYCDashboard';


// ── Scroll to top on route change ─────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ── Route guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const DevRoute = ({ children }) => {
  const { token, isAdmin } = useAuthStore();
  if (!token)   return <Navigate to="/login"     replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Inner app wrapper ─────────────────────────────────────────────────────────
const AppInner = () => {
  const { isAdmin }  = useAuthStore();
  const { theme }    = useThemeStore();
  const { pathname } = useLocation();

  const isDevPath  = pathname.startsWith('/dev');
  const isDark     = theme === 'dark';

  return (
    <div
      style={
        isDevPath
          ? {}
          : {
              position:  'relative',
              display:   'flex',
              flexDirection: 'column',
              width:     '100%',
              minHeight: '100vh',
              background: 'var(--bg-base)',
              overflowX: 'hidden',
              transition: 'background 300ms ease',
            }
      }
    >
      {!isDevPath && isDark && <BackgroundParticles />}
      {!isDevPath && <Navbar />}
      <ScrollToTop />

      <main className={isDevPath ? '' : 'relative z-10 flex-1 flex flex-col pt-16'}>
        <Routes>
          {/* ── Public pages ──────────────────────────────────────────── */}
          <Route path="/"         element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing"  element={<Pricing />} />
          <Route path="/faq"      element={<FAQ />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── User / Admin dashboard ────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {isAdmin ? <AdminDashboard /> : <Dashboard />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {isAdmin ? <AdminDashboard /> : <Dashboard />}
              </ProtectedRoute>
            }
          />
       
          <Route
            path="/kyc"
            element={
              <ProtectedRoute>
                <KYCDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Dev Panel (admin only) ────────────────────────────────── */}
          <Route
            path="/dev"
            element={
              <DevRoute>
                <DevLayout />
              </DevRoute>
            }
          >
            <Route index                element={<DevDashboard />} />
            <Route path="tables"        element={<TablesPage />} />
            <Route path="tables/:table" element={<TableView />} />
            <Route path="query"         element={<QueryRunner />} />
            <Route path="api"           element={<ApiDebugger />} />
            <Route path="logs"          element={<AuditLogs />} />
            {/* Phase 1 */}
            <Route path="tasks"         element={<CeleryTasks />} />
            <Route path="sentry"        element={<SentryErrors />} />
            <Route path="migrations"    element={<MigrationStatus />} />
            {/* Phase 2 — coming soon */}
            <Route path="redis"         element={<RedisInspector />} />
            <Route path="config"        element={<EnvConfig />} />
            <Route path="indexes"       element={<IndexHealth />} />
          </Route>

          {/* ── 404 ──────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDevPath && <CredilyChatbot />}
    </div>
  );
};

// ── App root ──────────────────────────────────────────────────────────────────
const App = () => (
  <Router
    future={{
      v7_startTransition:   true,
      v7_relativeSplatPath: true,
    }}
  >
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  </Router>
);

export default App;