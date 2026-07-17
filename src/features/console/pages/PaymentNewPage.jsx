// src/features/console/pages/PaymentNewPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ui';

const ROLE_CLASS = { APPROVER: 'r-app', FINANCE: 'r-fin', ADMIN: 'r-admin' };

const ChainPreview = ({ amount }) => {
  if (amount < 10000) {
    return (
      <>
        <div className="chip c-blue" style={{ marginBottom: 10 }}>Auto-approve</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Below ₹10,000 &mdash; executes immediately after submit. Still logged & reconciled.
        </div>
      </>
    );
  }
  const roles = amount < 100000 ? ['APPROVER'] : ['APPROVER', 'FINANCE', 'ADMIN'];
  const label = amount < 100000
    ? '₹10k \u2013 ₹1L band \u00B7 one approval'
    : 'Above ₹1,00,000 \u00B7 sequential 3-step chain';
  return (
    <>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10 }}>{label}</div>
      <ul className="tl">
        {roles.map((r, i) => (
          <li key={r}>
            <span className={`ic ${i === 0 ? 'pend' : 'wait'}`}>{i + 1}</span>
            <div>
              <b>Step {i + 1}</b>
              <div className="who"><span className={`role ${ROLE_CLASS[r]}`}>{r}</span></div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

const PaymentNewPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [amount, setAmount] = useState(200000);

  const amountNum = useMemo(() => Number(amount) || 0, [amount]);

  const handleSubmit = () => {
    toast.success('Payment PAY-2042 submitted \u2014 approval chain started');
    navigate('/dashboard/payments');
  };

  return (
    <div className="pg-view">
      <div className="crumb">Operate &middot; Payments &middot; New</div>
      <h1 className="pg">Create payment</h1>
      <div className="sub">Policy is evaluated live &mdash; you see the approval chain before you submit.</div>

      <div className="grid g2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="field">
            <label>Vendor</label>
            <select defaultValue="Bluewave Logistics \u00B7 HDFC ****4412">
              <option>Bluewave Logistics &middot; HDFC ****4412</option>
              <option>Nimbus Cloud Services</option>
              <option>Zenith Staffing</option>
              <option>+ Add new vendor</option>
            </select>
          </div>
          <div className="grid g2">
            <div className="field">
              <label>Amount (&#8377;)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Rail</label>
              <select>
                <option>NEFT</option>
                <option>IMPS</option>
                <option>UPI</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Purpose / description</label>
            <textarea rows={2} defaultValue="Vendor invoice #BL-2291 &mdash; July logistics" />
          </div>
          <div className="field">
            <label>Attachment</label>
            <div className="empty" style={{ padding: 16 }}>Drop invoice PDF here</div>
          </div>
          <button className="btn" onClick={handleSubmit}>Submit for approval</button>
        </div>

        <div className="card">
          <h3>Policy preview</h3>
          <div><ChainPreview amount={amountNum} /></div>
          <div className="note" style={{ marginTop: 14 }}>
            This preview is computed by the same policy engine that enforces the chain server-side.
            What you see is what will be enforced &mdash; <b>no bypass</b>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentNewPage;
