// src/features/console/pages/PaymentDetailPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { payments, approvalChain } from '../data/mockData';

const ICON = { ok: '\u2713', pend: '\u25CF' };

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { ref } = useParams();
  const payment = payments.find((p) => p.ref === ref) || payments[0];

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Payments · {payment.ref}</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">{payment.amount} → {payment.vendor}</h1>
          <div className="sub">
            <span className={`chip ${payment.chip}`}>{payment.status}</span>
            {' '}&nbsp; {payment.rail} · HDFC ****4412 · created by {payment.by} · today 10:12
          </div>
        </div>
        <button className="btn ghost" onClick={() => navigate('/dashboard/payments')}>← Back</button>
      </div>

      <div className="grid g3" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>Details</h3>
          <table>
            <tbody>
              <tr><td style={{ color: 'var(--muted)' }}>Reference</td><td className="mono">{payment.ref}</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Vendor</td><td>{payment.vendor}</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Invoice</td><td className="mono">BL-2291.pdf</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Policy</td><td>Band ≥ ₹1,00,000</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Idempotency</td><td className="mono">idem_7Ha2…</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Approval chain</h3>
          <ul className="tl">
            {approvalChain.map((step, i) => (
              <li key={i}>
                <span className={`ic ${step.status}`}>{ICON[step.status] || step.step}</span>
                <div>
                  <b>{step.title}</b>
                  <div className="who">{step.who} · <span className={`role ${step.roleClass}`}>{step.role}</span></div>
                  {step.when && <div className="when">{step.when}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Money trail</h3>
          <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
            Ledger
          </div>
          <div className="empty" style={{ padding: 14, marginBottom: 14 }}>
            No postings yet — created on execution, exactly once.
          </div>
          <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
            Gateway events
          </div>
          <div className="empty" style={{ padding: 14 }}>
            No events yet — will appear after execute.
          </div>
        </div>
      </div>

      <div className="note">
        This is the <b>hero screen</b>: one URL proves control end-to-end (details + chain + money trail).
        This is what closes sales demos.
      </div>
    </div>
  );
};

export default PaymentDetailPage;
