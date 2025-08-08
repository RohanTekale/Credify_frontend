import React from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

const Features = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] flex items-center justify-center px-4">
      <BackgroundParticles />
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Virtual Card Management</h2>
            <p className="text-gray-400">Create and manage virtual credit cards with ease.</p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Secure Transactions</h2>
            <p className="text-gray-400">Industry-standard encryption for all transactions.</p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Real-Time Analytics</h2>
            <p className="text-gray-400">Track spending with detailed insights.</p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Freeze/Unfreeze</h2>
            <p className="text-gray-400">Control your card status instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;