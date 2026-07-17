// src/features/console/pages/ReconPage.jsx
import React from 'react';
import useConsoleStore from '../store/consoleStore';

const ReconPage = () => {
  const { ledger, payments } = useConsoleStore();

  const settled = payments.filter((p) => p.status === 'settled').length;

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Reconciliation</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Reconciliation</h1>
          <div className="sub">Internal ledger vs gateway settlement vs bank.</div>
        </div>
      </div>

      <div className="grid g4">
        <div className="kpi"><div className="l">Ledger postings</div><div className="v">{ledger.length}</div></div>
        <div className="kpi"><div className="l">Settled payouts</div><div className="v">{settled}</div></div>
        <div className="kpi"><div className="l">Exceptions open</div><div className="v">0</div><div className="d">nothing to review</div></div>
        <div className="kpi"><div className="l">Duplicates ignored</div><div className="v">0</div><div className="d">zero double-posts</div></div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>Exception workbench</h3>
        <div className="empty">
          <b>No exceptions</b>
          Reconciliation compares your ledger against gateway settlement files.
          Exceptions appear here once a gateway is connected and a recon run completes.
        </div>
      </div>

      <div className="note">
        Humans only ever see the exceptions, never the matches. Recon runs need a connected
        gateway (see <b>Integrations</b>) — the backend matcher lands in Sprint 5.
      </div>
    </div>
  );
};

export default ReconPage;
