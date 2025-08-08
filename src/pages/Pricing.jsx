import React from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

const Pricing = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] flex items-center justify-center px-4">
      <BackgroundParticles />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-4xl font-bold mb-6">Pricing Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Basic</h2>
            <p className="text-3xl font-bold mb-4">$10/month</p>
            <p className="text-gray-400 mb-6">Essential features for individuals.</p>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200">
              Choose Plan
            </button>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Pro</h2>
            <p className="text-3xl font-bold mb-4">$25/month</p>
            <p className="text-gray-400 mb-6">Advanced features for professionals.</p>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200">
              Choose Plan
            </button>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Enterprise</h2>
            <p className="text-3xl font-bold mb-4">Custom</p>
            <p className="text-gray-400 mb-6">Tailored solutions for businesses.</p>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;