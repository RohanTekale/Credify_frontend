// src/features/console/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import useConsoleStore, { fmtINR, ROLE_CLASS } from '../store/consoleStore';
import { userDisplayName, greeting } from '../utils';

const isToday = (iso) => iso && new Date(iso).toDateString() === new Date().toDateString();

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { payments, events, org } = useConsoleStore();
  const firstName = userDisplayName(user).split(' ')[0];

  const paidToday = payments
    .filter((p) => p.status === 'settled' && isToday(p.settledAt))
    .reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'in_approval');
  const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
  const readyToExecute = payments.filter((p) => p.status === 'approved' || p.status === 'auto').length;
  const rejected = payments.filter((p) => p.status === 'rejected').length;

  const waitingRows = pending.slice(0, 5).map((p) => {
    const step = p.chain.find((s) => s.status === 'pend');
    return { ...p, waitingOn: step?.role || '—' };
  });
  const recentEvents = events.slice(0, 5);

  return (
    <div className="pg-view">
      <div className="crumb">{org?.name || 'Credify'} &middot; Operations</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">{greeting()}, {firstName}</h1>
          <div className="sub">
            {pending.length > 0
              ? `${pending.length} approval${pending.length > 1 ? 's' : ''} need attention`
              : 'No approvals waiting'}
            {' '}&middot; {readyToExecute > 0 ? `${readyToExecute} ready to execute` : 'nothing ready to execute'}
          </div>
        </div>
        <button className="btn" onClick={() => navigate('/dashboard/payments/new')}>+ New payment</button>
      </div>

      <div className="grid g4">
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/payments')}>
          <div className="l">Paid today</div>
          <div className="v">{fmtINR(paidToday)}</div>
          <div className="d up">{payments.filter((p) => p.status === 'settled' && isToday(p.settledAt)).length} payouts settled</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/approvals')}>
          <div className="l">Pending approval</div>
          <div className="v">{fmtINR(pendingAmount)}</div>
          <div className="d wn">{pending.length} request{pending.length === 1 ? '' : 's'} waiting</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/payments')}>
          <div className="l">Ready to execute</div>
          <div className="v">{readyToExecute}</div>
          <div className="d">{readyToExecute > 0 ? 'approved, not yet paid out' : 'all clear'}</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/payments')}>
          <div className="l">Rejected</div>
          <div className="v">{rejected}</div>
          <div className={`d ${rejected > 0 ? 'dn' : ''}`}>{rejected > 0 ? 'halted by approvers' : 'none halted'}</div>
        </div>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>
            Waiting on approval
            <a style={{ fontSize: 11, cursor: 'pointer' }} onClick={() => navigate('/dashboard/approvals')}>
              Open inbox &rarr;
            </a>
          </h3>
          {waitingRows.length === 0 ? (
            <div className="empty" style={{ padding: 18 }}>
              <b>Queue is clear</b>
              Payments above ₹10,000 wait here for approval.
            </div>
          ) : (
            <table>
              <thead><tr><th>Payment</th><th>Amount</th><th>Waiting on</th></tr></thead>
              <tbody>
                {waitingRows.map((p) => (
                  <tr key={p.ref} style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/payments/${p.ref}`)}>
                    <td>{p.vendor} &middot; {p.purpose}</td>
                    <td><b>{fmtINR(p.amount)}</b></td>
                    <td><span className={`role ${ROLE_CLASS[p.waitingOn] || 'r-custom'}`}>{p.waitingOn}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>
            Recent gateway events
            <a style={{ fontSize: 11, cursor: 'pointer' }} onClick={() => navigate('/dashboard/events')}>
              All events &rarr;
            </a>
          </h3>
          {recentEvents.length === 0 ? (
            <div className="empty" style={{ padding: 18 }}>
              <b>No events yet</b>
              Gateway webhooks appear here after a payout executes.
            </div>
          ) : (
            <table>
              <thead><tr><th>Event</th><th>Provider</th><th>Status</th></tr></thead>
              <tbody>
                {recentEvents.map((e, i) => (
                  <tr key={i}>
                    <td className="mono">{e.type} &middot; {e.id}</td>
                    <td>{e.provider}</td>
                    <td><span className={`chip ${e.chip}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
