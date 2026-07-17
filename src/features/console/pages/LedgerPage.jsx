// src/features/console/pages/LedgerPage.jsx
import React from 'react';
import useConsoleStore, { fmtINR, clock } from '../store/consoleStore';

const LedgerPage = () => {
  const { ledger } = useConsoleStore();

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Ledger</div>
      <h1 className="pg">Ledger</h1>
      <div className="sub">Append-only money postings. Nothing here can be edited or deleted — corrections are new entries.</div>
      <div className="card" style={{ padding: 0 }}>
        {ledger.length === 0 ? (
          <div className="empty" style={{ border: 'none' }}>
            <b>No postings yet</b>
            Ledger entries are created when a payout executes — exactly once.
          </div>
        ) : (
          <table>
            <thead><tr><th>Posted</th><th>Entry</th><th>Payment</th><th>Debit</th><th>Credit</th><th>Source</th></tr></thead>
            <tbody>
              {ledger.map((l, i) => (
                <tr key={i}>
                  <td>{clock(l.at)}</td>
                  <td>{l.entry}</td>
                  <td className="mono">{l.payment}</td>
                  <td>{l.debit ? fmtINR(l.debit) : '—'}</td>
                  <td>{l.credit ? fmtINR(l.credit) : '—'}</td>
                  <td className="mono">{l.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LedgerPage;
