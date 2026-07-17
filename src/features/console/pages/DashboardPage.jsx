// src/features/console/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { kpis, waitingOnApproval, recentGatewayEvents } from '../data/mockData';
import useAuthStore from '../../../store/authStore';
import { userDisplayName, greeting } from '../utils';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = userDisplayName(user).split(' ')[0];

  return (
    <div className="pg-view">
      <div className="crumb">Credify Pvt Ltd &middot; Operations</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">{greeting()}, {firstName}</h1>
          <div className="sub">3 approvals need attention &middot; last reconciliation 2h ago &middot; all gateways healthy</div>
        </div>
        <button className="btn" onClick={() => navigate('/dashboard/payments/new')}>+ New payment</button>
      </div>

      <div className="grid g4">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="l">{k.label}</div>
            <div className="v">{k.value}</div>
            <div className={`d ${k.tone || ''}`}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>
            Waiting on approval
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/approvals'); }} style={{ fontSize: 11 }}>
              Open inbox &rarr;
            </a>
          </h3>
          <table>
            <thead><tr><th>Payment</th><th>Amount</th><th>Waiting on</th></tr></thead>
            <tbody>
              {waitingOnApproval.map((w, i) => (
                <tr key={i}>
                  <td>{w.payment}</td>
                  <td><b>{w.amount}</b></td>
                  <td><span className={`role ${w.roleClass}`}>{w.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>
            Recent gateway events
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/events'); }} style={{ fontSize: 11 }}>
              All events &rarr;
            </a>
          </h3>
          <table>
            <thead><tr><th>Event</th><th>Provider</th><th>Status</th></tr></thead>
            <tbody>
              {recentGatewayEvents.map((e, i) => (
                <tr key={i}>
                  <td className="mono">{e.event}</td>
                  <td>{e.provider}</td>
                  <td><span className={`chip ${e.chip}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="note">
        Design rule: this screen shows <b>actionable queues only</b> &mdash; no vanity charts.
        If a number can&rsquo;t be clicked to act, it doesn&rsquo;t belong here.
      </div>
    </div>
  );
};

export default DashboardPage;
