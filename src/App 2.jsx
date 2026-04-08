// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ui';
import useAuthStore from './store/authStore';
import { Spinner } from './components/ui';

// Eager load auth pages (fast first paint)
import Login    from './features/auth/Login';
import Register from './features/auth/Register';

// Lazy load heavier pages
const Home           = lazy(() => import('./pages/Home'));
const Features       = lazy(() => import('./pages/Features'));
const Pricing        = lazy(() => import('./pages/Pricing'));
const FAQ            = lazy(() => import('./pages/FAQ'));
const Dashboard      = lazy(() => import('./features/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));

// ── Route guards ──────────────────────────────────────────────────────────────
const RequireAuth = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const { token, isAdmin } = useAuthStore();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const RequireGuest = ({ children }) => {
  const { token, isAdmin } = useAuthStore();
  if (token) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return children;
};

// ── Loading fallback ───────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12 }}>
    <div style={{ width:36,height:36,borderRadius:'50%',border:'2.5px solid rgba(59,97,245,0.2)',borderTopColor:'#3b61f5',animation:'spin 0.65s linear infinite' }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Ambient background ─────────────────────────────────────────────────────────
const Background = () => (
  <>
    <div style={{ position:'fixed',top:'-15%',left:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(59,97,245,0.09) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none',zIndex:0 }}/>
    <div style={{ position:'fixed',bottom:'-10%',right:'-8%',width:500,height:500,background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 65%)',borderRadius:'50%',pointerEvents:'none',zIndex:0 }}/>
  </>
);

const App = () => (
  <Router>
    <div style={{ position:'relative',minHeight:'100vh',background:'var(--bg-base)' }}>
      <Background/>
      <Navbar/>
      <ToastProvider/>
      <main style={{ position:'relative',zIndex:1 }}>
        <Suspense fallback={<PageLoader/>}>
          <Routes>
            {/* Public */}
            <Route path="/"          element={<Home/>}/>
            <Route path="/features"  element={<Features/>}/>
            <Route path="/pricing"   element={<Pricing/>}/>
            <Route path="/faq"       element={<FAQ/>}/>

            {/* Auth (guest only) */}
            <Route path="/login"    element={<RequireGuest><Login/></RequireGuest>}/>
            <Route path="/register" element={<RequireGuest><Register/></RequireGuest>}/>

            {/* User dashboard */}
            <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>}/>

            {/* Admin panel */}
            <Route path="/admin" element={<RequireAdmin><AdminDashboard/></RequireAdmin>}/>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </Suspense>
      </main>
    </div>
  </Router>
);

export default App;
