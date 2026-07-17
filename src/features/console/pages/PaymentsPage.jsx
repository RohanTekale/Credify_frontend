// src/features/console/pages/PaymentsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useConsoleStore, { fmtINR, paymentStatusMeta } from '../store/consoleStore';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'in_approval', label: 'In approval', color: 'var(--amber)' },
  { key: 'settled', label: 'Settled', color: 'var(--green2)' },
  { key: 'rejected', label: 'Rejected', color: 'var(--rose)' },
];

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { payments } = useConsoleStore();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = payments.filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const q = query.toLowerCase();
    const matchesQuery = q === '' ||
      p.vendor.toLowerCase().includes(q) ||
      p.ref.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Payments</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Payments</h1>
          <div className="sub">All outbound money — every state, one queue.</div>
        </div>
        <button className="btn" onClick={() => navigate('/dashboard/payments/new')}>+ New payment</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className="btn sm ghost"
              style={{ color: f.color, opacity: filter === f.key ? 1 : 0.65 }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <input
            placeholder="Search vendor, ref…"
            style={{ marginLeft: 'auto', maxWidth: 220, padding: '6px 12px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty" style={{ border: 'none' }}>
            <b>{payments.length === 0 ? 'No payments yet' : 'No payments match this filter'}</b>
            {payments.length === 0 && 'Create your first payment — policy will route it for approval.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Ref</th><th>Vendor</th><th>Amount</th><th>Rail</th><th>Status</th><th>Created by</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const meta = paymentStatusMeta(p);
                return (
                  <tr key={p.ref} style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/payments/${p.ref}`)}>
                    <td className="mono">{p.ref}</td>
                    <td>{p.vendor}</td>
                    <td><b>{fmtINR(p.amount)}</b></td>
                    <td>{p.rail}</td>
                    <td><span className={`chip ${meta.chip}`}>{meta.label}</span></td>
                    <td>{p.createdBy}</td>
                    <td><a>View →</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
