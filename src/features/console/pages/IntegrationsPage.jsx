// src/features/console/pages/IntegrationsPage.jsx
import React from 'react';

const IntegrationsPage = () => (
  <div className="pg-view">
    <div className="crumb">Configure · Integrations</div>
    <h1 className="pg">Integrations</h1>
    <div className="sub">Connect the rails you already use. Credify never holds your money.</div>
    <div className="grid g2">
      <div className="card">
        <h3>Razorpay <span className="chip c-green">Connected · sandbox</span></h3>
        <div className="field"><label>Key ID</label><input value="rzp_test_9x•••••••••" readOnly /></div>
        <div className="field"><label>Webhook endpoint</label><input className="mono" value="https://api.credify.co.in/webhooks/razorpay/" readOnly /></div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
          Signature verification: <b style={{ color: 'var(--green2)' }}>enabled</b> · Events stored idempotently
        </div>
      </div>
      <div className="card">
        <h3>Stripe <span className="chip c-grey">Not connected</span></h3>
        <div className="empty">
          <b>Connect Stripe</b>For international payouts and refunds.<br /><br />
          <button className="btn sm ghost">Connect →</button>
        </div>
      </div>
      <div className="card">
        <h3>Bank statement import <span className="chip c-amber">Planned · Sprint 7</span></h3>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>CSV / SFTP import of bank statements for three-way reconciliation.</div>
      </div>
      <div className="card">
        <h3>Tally / Zoho Books <span className="chip c-amber">Planned · Sprint 9</span></h3>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Push settled entries to your accounting system after close.</div>
      </div>
    </div>
  </div>
);

export default IntegrationsPage;
