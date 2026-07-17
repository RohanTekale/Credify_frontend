// src/features/console/pages/VendorsPage.jsx
import React from 'react';
import { vendors } from '../data/mockData';
import { useToast } from '../../../components/ui';

const VendorsPage = () => {
  const toast = useToast();

  return (
    <div className="pg-view">
      <div className="crumb">Configure · Vendors</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Vendors</h1>
          <div className="sub">Payee master — bank details verified before first payout.</div>
        </div>
        <button className="btn" onClick={() => toast.info('Add vendor form coming soon')}>+ Add vendor</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Vendor</th><th>Account</th><th>IFSC</th><th>Verification</th><th>Paid (30d)</th></tr></thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.name}>
                <td><b>{v.name}</b></td>
                <td className="mono">{v.account}</td>
                <td className="mono">{v.ifsc}</td>
                <td><span className={`chip ${v.chip}`}>{v.status}</span></td>
                <td>{v.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorsPage;
