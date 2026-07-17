// src/features/console/pages/LedgerPage.jsx
import React from 'react';
import { ledgerEntries } from '../data/mockData';

const LedgerPage = () => (
  <div className="pg-view">
    <div className="crumb">Operate · Ledger</div>
    <h1 className="pg">Ledger</h1>
    <div className="sub">Append-only money postings. Nothing here can be edited or deleted — corrections are new entries.</div>
    <div className="card" style={{ padding: 0 }}>
      <table>
        <thead><tr><th>Posted</th><th>Entry</th><th>Payment</th><th>Debit</th><th>Credit</th><th>Source</th></tr></thead>
        <tbody>
          {ledgerEntries.map((l, i) => (
            <tr key={i}>
              <td>{l.posted}</td>
              <td>{l.entry}</td>
              <td className="mono">{l.payment}</td>
              <td>{l.debit}</td>
              <td>{l.credit}</td>
              <td className="mono">{l.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LedgerPage;
