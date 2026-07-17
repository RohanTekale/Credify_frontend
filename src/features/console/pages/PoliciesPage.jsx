// src/features/console/pages/PoliciesPage.jsx
import React, { useMemo, useState } from 'react';
import { policyBands } from '../data/mockData';

const SimulateOut = ({ amount }) => {
  if (amount < 10000) return <>&rarr; <span className="chip c-blue">Auto-approve</span></>;
  if (amount < 100000) return <>&rarr; needs <span className="role r-app">APPROVER</span></>;
  return (
    <>
      &rarr; needs <span className="role r-app">APPROVER</span> &rarr;{' '}
      <span className="role r-fin">FINANCE</span> &rarr; <span className="role r-admin">ADMIN</span>
    </>
  );
};

const PoliciesPage = () => {
  const [sim, setSim] = useState(120000);
  const simNum = useMemo(() => Number(sim) || 0, [sim]);

  return (
    <div className="pg-view">
      <div className="crumb">Configure · Policies</div>
      <h1 className="pg">Approval policies</h1>
      <div className="sub">Amount bands decide who must approve. Versioned — old payments keep the policy they were created under.</div>

      <div className="card" style={{ padding: 0, marginBottom: 14 }}>
        <table>
          <thead><tr><th>Band</th><th>Chain</th><th>Version</th><th>Status</th></tr></thead>
          <tbody>
            {policyBands.map((b) => (
              <tr key={b.band}>
                <td><b>{b.band}</b></td>
                <td>
                  {b.chainType === 'blue' && <span className="chip c-blue">{b.chain}</span>}
                  {b.chainType === 'single' && <span className="role r-app">{b.chain}</span>}
                  {b.chainType === 'multi' && (
                    <>
                      <span className="role r-app">APPROVER</span> &rarr;{' '}
                      <span className="role r-fin">FINANCE</span> &rarr;{' '}
                      <span className="role r-admin">ADMIN</span>
                    </>
                  )}
                </td>
                <td className="mono">{b.version}</td>
                <td><span className="chip c-green">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Simulate a payment</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="number" value={sim} style={{ maxWidth: 200 }} onChange={(e) => setSim(e.target.value)} />
          <div style={{ fontSize: 12.5 }}><SimulateOut amount={simNum} /></div>
        </div>
      </div>

      <div className="warnbox">
        Admins can edit bands — but every change is a new <b>version</b> with an audit entry. There is no silent policy change.
      </div>
    </div>
  );
};

export default PoliciesPage;
