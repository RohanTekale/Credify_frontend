// src/features/console/pages/OnboardingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CredifyMark from '../components/CredifyMark';
import '../console.css';

const OnboardingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="credify-console">
      <section className="full active">
        <div className="authcard" style={{ width: 480 }}>
          <CredifyMark size={40} />
          <h2>Set up your organization</h2>
          <div className="m">Three steps and your team is operational.</div>
          <div className="steps">
            <div className="step on" /><div className="step on" /><div className="step" />
          </div>
          <div className="field">
            <label>Organization name</label>
            <input defaultValue="Credify Pvt Ltd" />
          </div>
          <div className="grid g2">
            <div className="field"><label>Currency</label><select><option>INR (₹)</option></select></div>
            <div className="field"><label>Timezone</label><select><option>Asia/Kolkata</option></select></div>
          </div>
          <hr className="hr" />
          <div className="field">
            <label>Invite teammates</label>
            <input defaultValue="priya@credify.co.in" style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input defaultValue="rahul@credify.co.in" />
              <select style={{ width: 150 }}>
                <option>Approver</option>
                <option>Finance</option>
                <option>Admin</option>
                <option>+ Custom role…</option>
              </select>
            </div>
          </div>
          <div className="note">
            Roles are yours to define. Admin can create custom roles with exact permissions in
            {' '}<b>Settings → Roles</b> — no fixed “Maker” role forced on you.
          </div>
          <button
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/dashboard')}
          >
            Continue → Connect gateway later
          </button>
        </div>
      </section>
    </div>
  );
};

export default OnboardingPage;
