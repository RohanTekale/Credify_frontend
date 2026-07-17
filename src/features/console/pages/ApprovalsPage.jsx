// src/features/console/pages/ApprovalsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import useConsoleStore, { fmtINR } from '../store/consoleStore';
import { useToast } from '../../../components/ui';
import { userDisplayName } from '../utils';

const ApprovalsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { payments, decidePayment } = useConsoleStore();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');

  const me = userDisplayName(user);
  const pending = payments.filter((p) => p.status === 'in_approval');

  const approve = (ref) => {
    decidePayment(ref, true, { by: me });
    toast.success('Approved — moved to next step');
  };

  const confirmReject = () => {
    if (!reason.trim()) {
      toast.error('Reason is mandatory');
      return;
    }
    decidePayment(rejectTarget, false, { by: me, note: reason.trim() });
    toast.warning('Rejected — payment halted');
    setRejectTarget(null);
    setReason('');
  };

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Approvals</div>
      <h1 className="pg">Approvals inbox</h1>
      <div className="sub">Requests waiting on <b>you</b>. Approve or reject with a reason — every decision is audited.</div>

      <div className="card" style={{ padding: 0 }}>
        {pending.length === 0 ? (
          <div className="empty" style={{ border: 'none' }}>
            <b>Nothing waiting on you</b>
            New payments above ₹10,000 will appear here for approval.
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Payment</th><th>Amount</th><th>Step</th><th>Requested by</th><th style={{ width: 200 }}></th></tr>
            </thead>
            <tbody>
              {pending.map((p) => {
                const done = p.chain.filter((s) => s.status === 'ok').length;
                return (
                  <tr key={p.ref}>
                    <td>
                      <a style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/payments/${p.ref}`)}>
                        {p.vendor} · {p.purpose}
                      </a>
                    </td>
                    <td><b>{fmtINR(p.amount)}</b></td>
                    <td>{done + 1} of {p.chain.length}</td>
                    <td>{p.createdBy}</td>
                    <td>
                      <button className="btn sm ok" onClick={() => approve(p.ref)}>Approve</button>{' '}
                      <button className="btn sm danger" onClick={() => { setRejectTarget(p.ref); setReason(''); }}>Reject</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="warnbox">
        Segregation of duties: rejection <b>requires</b> a reason — it is stored on the payment forever.
      </div>

      <div className={`overlay${rejectTarget ? ' active' : ''}`}>
        <div className="modal">
          <h3>Reject payment</h3>
          <div className="m">A reason is mandatory and becomes part of the permanent audit trail.</div>
          <div className="field">
            <label>Reason</label>
            <textarea
              rows={3}
              placeholder="e.g. Duplicate invoice — budget hold for Q2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost sm" onClick={() => setRejectTarget(null)}>Cancel</button>
            <button className="btn danger sm" onClick={confirmReject}>Reject payment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
