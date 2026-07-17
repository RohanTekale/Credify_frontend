// src/features/console/pages/OnboardingPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CredifyMark from '../components/CredifyMark';
import useConsoleStore from '../store/consoleStore';
import { useToast } from '../../../components/ui';
import '../console.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { org, setOrg } = useConsoleStore();

  const [name, setName] = useState(org?.name || '');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [invite1, setInvite1] = useState('');
  const [invite2, setInvite2] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }
    setOrg({ name, currency, timezone, invites: [invite1.trim(), invite2.trim()] });
    toast.success(`Organization "${name.trim()}" is ready`);
    navigate('/dashboard', { replace: true });
  };

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
            <input
              placeholder="e.g. Credify Pvt Ltd"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
            />
            {error && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{error}</div>}
          </div>
          <div className="grid g2">
            <div className="field">
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option>INR (₹)</option>
              </select>
            </div>
            <div className="field">
              <label>Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option>Asia/Kolkata</option>
              </select>
            </div>
          </div>
          <hr className="hr" />
          <div className="field">
            <label>Invite teammates (optional)</label>
            <input
              placeholder="teammate@company.in"
              value={invite1}
              onChange={(e) => setInvite1(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <input
              placeholder="another@company.in"
              value={invite2}
              onChange={(e) => setInvite2(e.target.value)}
            />
          </div>
          <div className="note">
            Roles are yours to define. Admin can create custom roles with exact permissions in
            {' '}<b>Team &amp; Roles</b> — no fixed “Maker” role forced on you.
          </div>
          <button
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={submit}
          >
            Continue → Connect gateway later
          </button>
        </div>
      </section>
    </div>
  );
};

export default OnboardingPage;
