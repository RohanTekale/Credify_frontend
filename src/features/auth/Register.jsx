import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/users/register/', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] flex items-center justify-center px-4">
      <div className="bg-[#1F2235] p-10 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create Your Account</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md bg-[#2C2E3E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md bg-[#2C2E3E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md bg-[#2C2E3E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md bg-[#2C2E3E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
          >
            Register
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
