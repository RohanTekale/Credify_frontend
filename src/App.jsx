// src/App.jsx
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

import useAuthStore from './store/authStore';

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

// Dev route: must be logged in AND be admin/staff
const DevRoute = ({ children }) => {
  const { token, isAdmin } = useAuthStore();
  if (!token)   return <Navigate to="/login"     replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Inner app wrapper (needs router context for useLocation) ──────────────────
const AppInner = () => {
  const { isAdmin } = useAuthStore();
  const { pathname } = useLocation();

  const isDevPath = pathname.startsWith('/dev');

  return (
    <div
      className={
        isDevPath
          ? ''
          : 'relative flex flex-col w-full min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] overflow-x-hidden'
      }
    >
      {!isDevPath && <BackgroundParticles />}
      {!isDevPath && <Navbar />}
      <ScrollToTop />

      <main className={isDevPath ? '' : 'relative z-10 flex-1 flex flex-col pt-16'}>
        <Routes>

          {/* ── Public pages ──────────────────────────────────────────────── */}
          <Route path="/"         element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing"  element={<Pricing />} />
          <Route path="/faq"      element={<FAQ />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── User / Admin dashboard ────────────────────────────────────── */}
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

          {/* ── Dev Panel (admin only) ────────────────────────────────────── */}
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
          </Route>

          {/* ── 404 ──────────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      {!isDevPath && <CredilyChatbot />}
    </div>
  );
};

// ── App root ──────────────────────────────────────────────────────────────────
// FIX: <ToastProvider /> was a self-closing sibling tag inside AppInner,
// so it had no children and the Context value was never in scope for any
// route — causing `useToast must be used inside <ToastProvider>` on Login.
//
// Fix: move ToastProvider HERE as a wrapper around AppInner so every page,
// including Login, receives the context.
const App = () => (
  <Router
    future={{
      v7_startTransition:   true,   // silences React Router v7 console warning
      v7_relativeSplatPath: true,   // silences React Router v7 console warning
    }}
  >
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  </Router>
);

export default App;