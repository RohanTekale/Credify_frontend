// src/features/console/pages/EventsPage.jsx
import React from 'react';
import useConsoleStore, { clock } from '../store/consoleStore';

const EventsPage = () => {
  const { events } = useConsoleStore();

  return (
    <div className="pg-view">
      <div className="crumb">Operate · Events</div>
      <h1 className="pg">Gateway events</h1>
      <div className="sub">Every inbound webhook, verified and stored once. Duplicates are kept visible — and ignored.</div>
      <div className="card" style={{ padding: 0 }}>
        {events.length === 0 ? (
          <div className="empty" style={{ border: 'none' }}>
            <b>No events yet</b>
            Events arrive when payouts execute and the gateway sends webhooks.
          </div>
        ) : (
          <table>
            <thead><tr><th>Received</th><th>Event ID</th><th>Type</th><th>Provider</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} style={e.status.includes('Ignored') ? { opacity: 0.6 } : undefined}>
                  <td>{clock(e.at)}</td>
                  <td className="mono">{e.id}</td>
                  <td className="mono">{e.type}</td>
                  <td>{e.provider}</td>
                  <td className="mono">{e.payment}</td>
                  <td><span className={`chip ${e.chip}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="note">
        Duplicate <span className="mono">event_id</span>s are booked exactly once — duplicates stay visible and marked ignored.
      </div>
    </div>
  );
};

export default EventsPage;
