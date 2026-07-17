// src/features/console/pages/ApprovalsPage.jsx
import React, { useState } from 'react';
import { approvalsInbox } from '../data/mockData';
import { useToast } from '../../../components/ui';

const ApprovalsPage = () => {
  const toast = useToast();
  const [rows, setRows] = useState(approvalsInbox.map((r) => ({ ...r, decided: false })));
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');

  const decide = (id, ok) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, decided: true } : r)));
    toast[ok ? 'success' : 'warning'](ok ? 'Approved — moved to next step' : 'Rejected');
  };

  const openReject = (id) => {
    setRejectTarget(id);
    setReason('');
  };

  const closeReject = () => setRejectTarget(null);

  const confirmReject = () => {
    if (!reason.trim()) {
      toast.error('Reason is mandatory');
      return;
    }
    decide(rejectTarget, false);
    setRejectTarget(null);
  };

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Approvals</div>
      <h1 className="pg">Approvals inbox</h1>
      <div className="sub">Requests waiting on <b>you</b>. Approve or reject with a reason — every decision is audited.</div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>Payment</th><th>Amount</th><th>Step</th><th>Requested by</th><th>SLA</th><th style={{ width: 200 }}></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={r.decided ? { opacity: 0.35 } : undefined}>
                <td>{r.payment}</td>
                <td><b>{r.amount}</b></td>
                <td>{r.step}</td>
                <td>{r.by}</td>
                <td><span className={`chip ${r.chip}`}>{r.sla}</span></td>
                <td>
                  <button className="btn sm ok" disabled={r.decided} onClick={() => decide(r.id, true)}>Approve</button>{' '}
                  <button className="btn sm danger" disabled={r.decided} onClick={() => openReject(r.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="warnbox">
        Segregation of duties: you never see requests you created yourself.
        Rejection <b>requires</b> a reason — it is stored on the payment forever.
      </div>

      <div className={`overlay${rejectTarget ? ' active' : ''}`}>
        <div className="modal">
          <h3>Reject payment</h3>
          <div className="m">A reason is mandatory and becomes part of the permanent audit trail.</div>
          <div className="field">
            <label>Reason</label>
            <textarea
              rows={3}
              placeholder="e.g. Duplicate of PAY-2035 — budget hold for Q2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost sm" onClick={closeReject}>Cancel</button>
            <button className="btn danger sm" onClick={confirmReject}>Reject payment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
