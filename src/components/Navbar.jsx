// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import Credify3DText from './Credify3DText';

const Navbar = () => {
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
    { path: '/login', label: 'Log In' },
    { path: '/register', label: 'Sign Up' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 w-full p-4 z-50 flex items-center justify-between"
      style={{
        background: 'transparent',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* 3D Credify Logo - anchored to left */}
      <div
        className="cursor-pointer flex items-center"
        style={{ marginLeft: 0, paddingLeft: 0 }}
        onClick={() => navigate('/')}
      >
        <div style={{ width: 500, height: 100 }}>
          <Credify3DText />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap justify-center gap-4">
        {navLinks.map((link) => (
          <Tilt
            key={link.path}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={1000}
            scale={1.05}
            className="inline-block"
          >
            <button
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-md transition duration-200 focus:outline-none ${
                link.label === 'Sign Up'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          </Tilt>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
