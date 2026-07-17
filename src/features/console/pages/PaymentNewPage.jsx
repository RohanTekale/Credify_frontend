// src/features/console/pages/PaymentNewPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../components/ui';
import useAuthStore from '../../../store/authStore';
import useConsoleStore, { policyChain, ROLE_CLASS } from '../store/consoleStore';
import { userDisplayName } from '../utils';

const ChainPreview = ({ amount }) => {
  const roles = policyChain(amount);
  if (roles.length === 0) {
    return (
      <>
        <div className="chip c-blue" style={{ marginBottom: 10 }}>Auto-approve</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Below ₹10,000 — executes immediately after submit. Still logged & reconciled.
        </div>
      </>
    );
  }
  const label = roles.length === 1
    ? '₹10k – ₹1L band · one approval'
    : 'Above ₹1,00,000 · sequential 3-step chain';
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
  const { user } = useAuthStore();
  const { vendors, createPayment } = useConsoleStore();

  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [rail, setRail] = useState('NEFT');
  const [purpose, setPurpose] = useState('');
  const [errors, setErrors] = useState({});

  const amountNum = useMemo(() => Number(amount) || 0, [amount]);

  const handleSubmit = () => {
    const e = {};
    const vendor = vendors.find((v) => String(v.id) === vendorId);
    if (!vendor) e.vendor = 'Select a vendor';
    if (amountNum <= 0) e.amount = 'Enter an amount greater than 0';
    if (!purpose.trim()) e.purpose = 'Purpose is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    const ref = createPayment({
      vendorName: vendor.name,
      amount: amountNum,
      rail,
      purpose: purpose.trim(),
      createdBy: userDisplayName(user),
    });
    toast.success(
      amountNum < 10000
        ? `Payment ${ref} auto-approved — ready to execute`
        : `Payment ${ref} submitted — approval chain started`
    );
    navigate(`/dashboard/payments/${ref}`);
  };

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Payments · New</div>
      <h1 className="pg">Create payment</h1>
      <div className="sub">Policy is evaluated live — you see the approval chain before you submit.</div>

      <div className="grid g2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="field">
            <label>Vendor</label>
            {vendors.length === 0 ? (
              <div className="empty" style={{ padding: 16 }}>
                <b>No vendors yet</b>
                <Link to="/dashboard/vendors">Add a vendor first →</Link>
              </div>
            ) : (
              <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">Select vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · ****{v.account.slice(-4)}
                  </option>
                ))}
              </select>
            )}
            {errors.vendor && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{errors.vendor}</div>}
          </div>
          <div className="grid g2">
            <div className="field">
              <label>Amount (₹)</label>
              <input type="number" min="1" placeholder="200000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              {errors.amount && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
            </div>
            <div className="field">
              <label>Rail</label>
              <select value={rail} onChange={(e) => setRail(e.target.value)}>
                <option>NEFT</option>
                <option>IMPS</option>
                <option>UPI</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Purpose / description</label>
            <textarea rows={2} placeholder="e.g. Vendor invoice #BL-2291 — July logistics" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            {errors.purpose && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{errors.purpose}</div>}
          </div>
          <button className="btn" onClick={handleSubmit} disabled={vendors.length === 0}>
            Submit for approval
          </button>
        </div>

        <div className="card">
          <h3>Policy preview</h3>
          <div><ChainPreview amount={amountNum} /></div>
          <div className="note" style={{ marginTop: 14 }}>
            This preview is computed by the same policy engine that enforces the chain.
            What you see is what will be enforced — <b>no bypass</b>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentNewPage;
