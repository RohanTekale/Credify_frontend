import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BackgroundParticles from './components/BackgroundParticles';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Features from './pages/Features';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';

const App = () => {
  return (
    <Router>
      <div className="relative min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F]">
        <BackgroundParticles />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;