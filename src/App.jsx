import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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

import useAuthStore from './store/authStore';


// ✅ Scroll fix (VERY IMPORTANT)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};


const App = () => {
  const { isAdmin } = useAuthStore();

  return (
    <Router>
      <div className="relative flex flex-col w-full min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] overflow-x-hidden">
        
        <BackgroundParticles />
        <Navbar />
        <ScrollToTop />

        <main className="relative z-10 flex-1 flex flex-col pt-16">
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🔥 ADMIN LOGIC */}
            <Route
              path="/dashboard"
              element={isAdmin ? <AdminDashboard /> : <Dashboard />}
            />

            <Route
              path="/admin"
              element={isAdmin ? <AdminDashboard /> : <Dashboard />}
            />

          </Routes>
        </main>

      </div>
    </Router>
  );
};

export default App;