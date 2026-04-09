import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import BackgroundParticles from './components/BackgroundParticles';

import Home from './pages/Home';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Features from './pages/Features';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import AdminDashboard from './features/admin/AdminDashboard';

// ── Dev Panel ─────────────────────────────────────────────────────────────────
import DevLayout from './pages/dev/DevLayout';
import DevDashboard from './pages/dev/DevDashboard';
import TablesPage from './pages/dev/TablesPage';
import TableView from './pages/dev/TableView';
import QueryRunner from './pages/dev/QueryRunner';
import ApiDebugger from './pages/dev/ApiDebugger';
import AuditLogs from './pages/dev/AuditLogs';

import useAuthStore from './store/authStore';
import CredilyChatbot from './components/CredilyChatbot';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

// Only admins/staff can access /dev
const DevRoute = ({ children }) => {
  const { token, isAdmin } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Dev pages should hide the global Navbar and BackgroundParticles
const isDevPath = (pathname) => pathname.startsWith('/dev');

const AppInner = () => {
  const { isAdmin } = useAuthStore();
  const { pathname } = useLocation();
  const onDev = isDevPath(pathname);

  return (
    <div className={onDev ? '' : 'relative flex flex-col w-full min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] overflow-x-hidden'}>
      {!onDev && <BackgroundParticles />}
      {!onDev && <Navbar />}
      <ScrollToTop />

      <main className={onDev ? '' : 'relative z-10 flex-1 flex flex-col pt-16'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* ── Dev Panel ─────────────────────────────────────────────── */}
          <Route
            path="/dev"
            element={
              <DevRoute>
                <DevLayout />
              </DevRoute>
            }
          >
            <Route index element={<DevDashboard />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="tables/:table" element={<TableView />} />
            <Route path="query" element={<QueryRunner />} />
            <Route path="api" element={<ApiDebugger />} />
            <Route path="logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </main>

      {!onDev && <CredilyChatbot />}
    </div>
  );
};

const App = () => (
  <Router>
    <AppInner />
  </Router>
);

export default App;
