// src/features/console/pages/EventsPage.jsx
import React from 'react';
import { gatewayEvents } from '../data/mockData';

const EventsPage = () => (
  <div className="pg-view">
    <div className="crumb">Operate · Events</div>
    <h1 className="pg">Gateway events</h1>
    <div className="sub">Every inbound webhook, verified and stored once. Duplicates are kept visible — and ignored.</div>
    <div className="card" style={{ padding: 0 }}>
      <table>
        <thead><tr><th>Received</th><th>Event ID</th><th>Type</th><th>Provider</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>
          {gatewayEvents.map((e, i) => (
            <tr key={i} style={e.dim ? { opacity: 0.6 } : undefined}>
              <td>{e.time}</td>
              <td className="mono">{e.id}</td>
              <td className="mono">{e.type}</td>
              <td>{e.provider}</td>
              <td className="mono">{e.payment}</td>
              <td><span className={`chip ${e.chip}`}>{e.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="note">
      Same <span className="mono">event_id</span> arrived 3× — booked exactly once. Show the duplicates deliberately: this screen <b>is</b> the trust story.
    </div>
  </div>
);

export default EventsPage;
