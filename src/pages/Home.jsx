import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundParticles from '../components/BackgroundParticles';
import CreditCard3D from '../components/CreditCard3D';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0F0F1C] text-white font-sans overflow-hidden">
      {/* Background Particles */}
      <BackgroundParticles />

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-12 z-10 relative pt-32 px-6">
        {/* Title and Button */}
        <div className="max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Virtual Credit <br /> Card Management System 
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            All-in-one platform to issue and manage your virtual credit card with ease.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Get Started
          </button>
        </div>

        {/* Centered 3D Credit Card */}
        <div className="flex justify-center items-center min-h-[300px] w-full">
          <CreditCard3D />
        </div>
      </div>

      {/* Project Info Section */}
      <div className="relative z-10 mt-12 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Credify?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Secure User Management</h3>
            <p className="text-gray-400">
              Register and verify your identity with KYC document uploads, powered by secure JWT authentication and profile management.
            </p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Virtual Card Control</h3>
            <p className="text-gray-400">
              Issue virtual cards with random 16-digit numbers, set credit limits, and easily freeze, unfreeze, or block cards as needed.
            </p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Smart Transactions</h3>
            <p className="text-gray-400">
              Simulate purchases, validate against credit limits, and process refunds seamlessly with real-time transaction tracking.
            </p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Billing & Payments</h3>
            <p className="text-gray-400">
              Generate monthly bills, make full or partial payments, and track your payment history and outstanding balances.
            </p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Rewards System</h3>
            <p className="text-gray-400">
              Earn points on every transaction and redeem them for exclusive benefits, enhancing your financial experience.
            </p>
          </div>
          <div className="bg-[#1F2235] p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Instant Notifications</h3>
            <p className="text-gray-400">
              Stay informed with email alerts for transactions, payment due reminders, and an in-app notification log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
