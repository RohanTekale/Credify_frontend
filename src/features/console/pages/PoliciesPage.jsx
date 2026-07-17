// src/features/console/pages/PoliciesPage.jsx
import React, { useMemo, useState } from 'react';
import { POLICY_BANDS, policyChain, ROLE_CLASS } from '../store/consoleStore';

const ChainCells = ({ chain }) => {
  if (chain.length === 0) return <span className="chip c-blue">Auto-approve</span>;
  return (
    <>
      {chain.map((r, i) => (
        <React.Fragment key={r}>
          {i > 0 && ' → '}
          <span className={`role ${ROLE_CLASS[r]}`}>{r}</span>
        </React.Fragment>
      ))}
    </>
  );
};

const PoliciesPage = () => {
  const [sim, setSim] = useState(120000);
  const simChain = useMemo(() => policyChain(sim), [sim]);

  return (
    <div className="pg-view">
      <div className="crumb">Configure · Policies</div>
      <h1 className="pg">Approval policies</h1>
      <div className="sub">Amount bands decide who must approve. Versioned — old payments keep the policy they were created under.</div>

      <div className="card" style={{ padding: 0, marginBottom: 14 }}>
        <table>
          <thead><tr><th>Band</th><th>Chain</th><th>Version</th><th>Status</th></tr></thead>
          <tbody>
            {POLICY_BANDS.map((b) => (
              <tr key={b.band}>
                <td><b>{b.band}</b></td>
                <td><ChainCells chain={b.chain} /></td>
                <td className="mono">{b.version}</td>
                <td><span className="chip c-green">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Simulate a payment</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="number" value={sim} style={{ maxWidth: 200 }} onChange={(e) => setSim(e.target.value)} />
          <div style={{ fontSize: 12.5 }}>
            → {simChain.length === 0 ? <span className="chip c-blue">Auto-approve</span> : <>needs <ChainCells chain={simChain} /></>}
          </div>
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          This is the exact engine that routes new payments — the simulation and enforcement share one implementation.
        </div>
      </div>

      <div className="warnbox">
        Admins can edit bands — but every change is a new <b>version</b> with an audit entry. There is no silent policy change.
      </div>
    </div>
  );
};

export default PoliciesPage;
