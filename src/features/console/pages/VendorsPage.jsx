// src/features/console/pages/VendorsPage.jsx
import React, { useState } from 'react';
import useConsoleStore, { dayTime } from '../store/consoleStore';
import { useToast } from '../../../components/ui';

const EMPTY_FORM = { name: '', account: '', ifsc: '' };

const VendorsPage = () => {
  const toast = useToast();
  const { vendors, addVendor } = useConsoleStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vendor name is required';
    if (!form.account.trim()) e.account = 'Account number is required';
    else if (!/^\d{6,18}$/.test(form.account.trim())) e.account = 'Account number must be 6–18 digits';
    if (!form.ifsc.trim()) e.ifsc = 'IFSC is required';
    else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(form.ifsc.trim())) e.ifsc = 'Invalid IFSC (e.g. HDFC0001206)';
    setErrors(e);
    if (Object.keys(e).length) return;

    const v = addVendor(form);
    setOpen(false);
    setForm(EMPTY_FORM);
    toast.success(`Vendor "${v.name}" added — pending verification`);
  };

  return (
    <div className="pg-view">
      <div className="crumb">Configure · Vendors</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Vendors</h1>
          <div className="sub">Payee master — bank details verified before first payout.</div>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>+ Add vendor</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {vendors.length === 0 ? (
          <div className="empty" style={{ border: 'none' }}>
            <b>No vendors yet</b>
            Add your first vendor to start creating payments.
          </div>
        ) : (
          <table>
            <thead><tr><th>Vendor</th><th>Account</th><th>IFSC</th><th>Verification</th><th>Added</th></tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td><b>{v.name}</b></td>
                  <td className="mono">****{v.account.slice(-4)}</td>
                  <td className="mono">{v.ifsc}</td>
                  <td><span className={`chip ${v.chip}`}>{v.status}</span></td>
                  <td>{dayTime(v.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={`overlay${open ? ' active' : ''}`}>
        <div className="modal">
          <h3>Add vendor</h3>
          <div className="m">Bank details are penny-drop verified before the first payout.</div>
          <div className="field">
            <label>Vendor name</label>
            <input placeholder="e.g. Bluewave Logistics" value={form.name} onChange={setField('name')} />
            {errors.name && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
          </div>
          <div className="grid g2">
            <div className="field">
              <label>Account number</label>
              <input placeholder="0012345678" value={form.account} onChange={setField('account')} />
              {errors.account && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{errors.account}</div>}
            </div>
            <div className="field">
              <label>IFSC</label>
              <input placeholder="HDFC0001206" value={form.ifsc} onChange={setField('ifsc')} />
              {errors.ifsc && <div style={{ color: 'var(--rose)', fontSize: 11, marginTop: 4 }}>{errors.ifsc}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost sm" onClick={() => { setOpen(false); setErrors({}); }}>Cancel</button>
            <button className="btn sm" onClick={submit}>Add vendor</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
