// src/features/console/pages/ReconPage.jsx
import React, { useRef, useState } from 'react';
import { reconKpis, reconExceptions } from '../data/mockData';
import { useToast } from '../../../components/ui';

const ReconPage = () => {
  const toast = useToast();
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const workbenchRef = useRef(null);

  const openWorkbench = () => {
    setWorkbenchOpen(true);
    setTimeout(() => workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const matchAsFee = () => {
    toast.success('Matched with ₹560 booked as gateway fee');
    setWorkbenchOpen(false);
  };

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Reconciliation</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Reconciliation</h1>
          <div className="sub">Last run: today 02:00 · internal ledger vs Razorpay settlement vs bank</div>
        </div>
        <button className="btn ghost" onClick={() => toast.info('Recon run started — ~2 min')}>Run now</button>
      </div>

      <div className="grid g4">
        {reconKpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="l">{k.label}</div>
            <div className={`v ${k.tone || ''}`}>{k.value}</div>
            {k.delta && <div className={`d ${k.tone || ''}`}>{k.delta}</div>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3>Exception workbench</h3>
        <table>
          <thead><tr><th>Type</th><th>Ref</th><th>Internal</th><th>Gateway</th><th>Δ</th><th></th></tr></thead>
          <tbody>
            {reconExceptions.map((ex) => (
              <tr key={ex.ref}>
                <td><span className={`chip ${ex.chip}`}>{ex.type}</span></td>
                <td className="mono">{ex.ref}</td>
                <td>{ex.internal}</td>
                <td>{ex.gateway}</td>
                <td className={ex.deltaTone}>{ex.delta}</td>
                <td><button className="btn sm ghost" onClick={openWorkbench}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {workbenchOpen && (
        <div className="card" style={{ marginTop: 14 }} ref={workbenchRef}>
          <h3>
            PAY-2033 · Amount mismatch
            <button className="btn sm ghost" onClick={() => setWorkbenchOpen(false)}>Close</button>
          </h3>
          <div className="split">
            <div className="pane">
              <h5>Internal ledger</h5>
              <div className="row"><span>Amount</span><b>₹56,000</b></div>
              <div className="row"><span>Ref</span><span className="mono">PAY-2033</span></div>
              <div className="row"><span>Timestamp</span><span>15 Jul · 14:02</span></div>
              <div className="row"><span>Fee booked</span><span>₹0</span></div>
            </div>
            <div className="vs">VS</div>
            <div className="pane">
              <h5>Razorpay settlement</h5>
              <div className="row"><span>Amount</span><b className="bad">₹55,440</b></div>
              <div className="row"><span>Ref</span><span className="mono">pout_M2xR91</span></div>
              <div className="row"><span>Timestamp</span><span>15 Jul · 14:04</span></div>
              <div className="row"><span>Fee deducted</span><b className="bad">₹560</b></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn sm ok" onClick={matchAsFee}>Match — book ₹560 as fee</button>
            <button className="btn sm ghost">Write off</button>
            <button className="btn sm ghost">Escalate to Finance</button>
          </div>
        </div>
      )}

      <div className="note">
        Humans only ever see the <b>3 exceptions</b>, never the 1,449 matches. That is the entire recon value proposition.
      </div>
    </div>
  );
};

export default ReconPage;
