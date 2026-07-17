// src/features/console/pages/PaymentDetailPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import useConsoleStore, {
  fmtINR, clock, dayTime, paymentStatusMeta, bandLabel, ROLE_CLASS,
} from '../store/consoleStore';
import { useToast } from '../../../components/ui';

const STEP_ICON = { ok: '✓', pend: '●', rejected: '✕' };

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { ref } = useParams();
  const { isAdmin } = useAuthStore();
  const { payments, events, ledger, executePayment } = useConsoleStore();

  const payment = payments.find((p) => p.ref === ref);

  if (!payment) {
    return (
      <div className="pg-view">
        <div className="crumb">Operate · Payments</div>
        <h1 className="pg">Payment not found</h1>
        <div className="sub">No payment with reference <span className="mono">{ref}</span> exists.</div>
        <button className="btn ghost" onClick={() => navigate('/dashboard/payments')}>← Back to payments</button>
      </div>
    );
  }

  const meta = paymentStatusMeta(payment);
  const payEvents = events.filter((e) => e.payment === payment.ref);
  const payLedger = ledger.filter((l) => l.payment === payment.ref);
  const canExecute = isAdmin && (payment.status === 'approved' || payment.status === 'auto');

  const execute = () => {
    executePayment(payment.ref);
    toast.success(`${payment.ref} executed — settled via sandbox`);
  };

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Payments · {payment.ref}</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">{fmtINR(payment.amount)} → {payment.vendor}</h1>
          <div className="sub">
            <span className={`chip ${meta.chip}`}>{meta.label}</span>
            {' '}&nbsp; {payment.rail} · created by {payment.createdBy} · {dayTime(payment.createdAt)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canExecute && <button className="btn" onClick={execute}>Execute payout</button>}
          <button className="btn ghost" onClick={() => navigate('/dashboard/payments')}>← Back</button>
        </div>
      </div>

      <div className="grid g3" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>Details</h3>
          <table>
            <tbody>
              <tr><td style={{ color: 'var(--muted)' }}>Reference</td><td className="mono">{payment.ref}</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Vendor</td><td>{payment.vendor}</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Purpose</td><td>{payment.purpose}</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Policy band</td><td>{bandLabel(payment.amount)}</td></tr>
              <tr><td style={{ color: 'var(--muted)' }}>Rail</td><td>{payment.rail}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Approval chain</h3>
          {payment.chain.length === 0 ? (
            <div className="empty" style={{ padding: 14 }}>
              Auto-approved by policy — no approval steps required.
            </div>
          ) : (
            <ul className="tl">
              <li>
                <span className="ic ok">✓</span>
                <div>
                  <b>Submitted</b>
                  <div className="who">{payment.createdBy}</div>
                  <div className="when">{clock(payment.createdAt)}</div>
                </div>
              </li>
              {payment.chain.map((step, i) => (
                <li key={i}>
                  <span className={`ic ${step.status === 'wait' ? 'wait' : step.status === 'rejected' ? 'pend' : step.status}`}>
                    {STEP_ICON[step.status] || i + 1}
                  </span>
                  <div>
                    <b>
                      Step {i + 1} ·{' '}
                      {step.status === 'ok' ? 'Approved' : step.status === 'pend' ? 'Waiting' : step.status === 'rejected' ? 'Rejected' : 'Queued'}
                    </b>
                    <div className="who">
                      <span className={`role ${ROLE_CLASS[step.role]}`}>{step.role}</span>
                      {step.by ? ` · ${step.by}` : ''}
                    </div>
                    {step.at && <div className="when">{clock(step.at)}{step.note ? ` · “${step.note}”` : ''}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Money trail</h3>
          <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
            Ledger
          </div>
          {payLedger.length === 0 ? (
            <div className="empty" style={{ padding: 14, marginBottom: 14 }}>
              No postings yet — created on execution, exactly once.
            </div>
          ) : (
            <table style={{ marginBottom: 14 }}>
              <tbody>
                {payLedger.map((l, i) => (
                  <tr key={i}>
                    <td>{l.entry}</td>
                    <td><b>{fmtINR(l.debit || l.credit)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ fontSize: 11, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
            Gateway events
          </div>
          {payEvents.length === 0 ? (
            <div className="empty" style={{ padding: 14 }}>
              No events yet — will appear after execute.
            </div>
          ) : (
            <table>
              <tbody>
                {payEvents.map((e, i) => (
                  <tr key={i}>
                    <td className="mono">{e.type}</td>
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

export default PaymentDetailPage;
