// src/features/console/pages/PaymentsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { payments } from '../data/mockData';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approval', label: 'In approval', color: 'var(--amber)' },
  { key: 'settled', label: 'Settled', color: 'var(--green2)' },
  { key: 'failed', label: 'Failed', color: 'var(--rose)' },
];

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = payments.filter((p) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'approval' && p.status.includes('In approval')) ||
      (filter === 'settled' && p.status === 'Settled') ||
      (filter === 'failed' && p.status.includes('Failed'));
    const matchesQuery = query === '' ||
      p.vendor.toLowerCase().includes(query.toLowerCase()) ||
      p.ref.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="pg-view">
      <div className="crumb">Operate &middot; Payments</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Payments</h1>
          <div className="sub">All outbound money &mdash; every state, one queue.</div>
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
            placeholder="Search vendor, ref&hellip;"
            style={{ marginLeft: 'auto', maxWidth: 220, padding: '6px 12px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr><th>Ref</th><th>Vendor</th><th>Amount</th><th>Rail</th><th>Status</th><th>Created by</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.ref}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/payments/${p.ref}`)}
              >
                <td className="mono">{p.ref}</td>
                <td>{p.vendor}</td>
                <td><b>{p.amount}</b></td>
                <td>{p.rail}</td>
                <td><span className={`chip ${p.chip}`}>{p.status}</span></td>
                <td>{p.by}</td>
                <td><a>{p.action}</a></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><div className="empty">No payments match this filter.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;
