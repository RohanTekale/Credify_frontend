// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore'; // ✅ added

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isAdmin } = useAuthStore(); // ✅ added

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,12,20,0.92)' : 'rgba(8,12,20,0.5)',
          backdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b61f5, #1d37cc)' }}
            >
              <CreditCard size={16} color="#fff" />
            </div>
            <span className="text-white font-bold text-lg">Credify</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="btn-ghost"
                style={{
                  color: isActive(link.path) ? '#fff' : '#aaa',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* 🔥 AUTH SECTION UPDATED */}
          <div className="hidden md:flex items-center gap-3">

            {user ? (
              <>
                {/* Welcome User */}
                <div className="text-sm text-gray-300">
                  Welcome,{' '}
                  <span className="text-white font-semibold">
                    {user.username}
                  </span>

                  {isAdmin && (
                    <span className="ml-2 text-xs text-red-400">(Admin)</span>
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-ghost"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </button>

                <button
                  className="btn-primary"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
              </>
            )}

          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden p-4 bg-black border-t border-gray-700">

            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="block w-full text-left mb-2 text-gray-300"
              >
                {link.label}
              </button>
            ))}

            <hr className="my-3" />

            {user ? (
              <>
                <div className="text-sm text-gray-300 mb-2">
                  Welcome,{' '}
                  <span className="text-white font-semibold">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500/20 text-red-400 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full mb-2 bg-gray-700 text-white py-2 rounded"
                >
                  Log In
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  Get Started
                </button>
              </>
            )}

          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;