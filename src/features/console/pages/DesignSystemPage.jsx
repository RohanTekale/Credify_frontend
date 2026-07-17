// src/features/console/pages/DesignSystemPage.jsx
import React from 'react';
import CredifyMark from '../components/CredifyMark';

const SWATCHES = [
  { hex: '#4f46e5', label: 'Indigo #4F46E5', desc: 'primary actions' },
  { hex: '#3b82f6', label: 'Blue #3B82F6', desc: 'links, info' },
  { hex: '#10b981', label: 'Green #10B981', desc: 'settled, verified' },
  { hex: '#f59e0b', label: 'Amber #F59E0B', desc: 'pending, SLA' },
  { hex: '#f43f5e', label: 'Rose #F43F5E', desc: 'failed, rejected' },
  { hex: '#8b5cf6', label: 'Violet #8B5CF6', desc: 'admin, audit' },
  { hex: '#0a0d16', label: 'Bg #0A0D16', desc: 'page', border: true },
  { hex: '#131a2c', label: 'Card #131A2C', desc: 'surfaces' },
];

const DesignSystemPage = () => (
  <div className="pg-view">
    <div className="crumb">Design · System</div>
    <h1 className="pg">Design system — pilot tokens</h1>
    <div className="sub">Locked for Sprint 0. FE applies these when killing mock screens. Dark-first, dense, calm.</div>

    <div className="card" style={{ marginBottom: 14 }}>
      <h3>Brand</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <CredifyMark size={56} />
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          Mark: card + check in indigo→blue rounded square (asset: <span className="mono">credify-logo.png</span>).<br />
          Wordmark: Credify, 700 weight, white on dark. Never place logo on gradients or photos.
        </div>
      </div>
    </div>

    <div className="card" style={{ marginBottom: 14 }}>
      <h3>Colour</h3>
      <div className="sw">
        {SWATCHES.map((s) => (
          <div key={s.hex}>
            <div className="c" style={{ background: s.hex, borderBottom: s.border ? '1px solid #232b41' : undefined }} />
            <div className="t">{s.label}<br />{s.desc}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid g2">
      <div className="card">
        <h3>Status chips (canonical set)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span className="chip c-blue">Auto-approved</span><span className="chip c-amber">In approval</span>
          <span className="chip c-green">Approved</span><span className="chip c-rose">Rejected</span>
          <span className="chip c-blue">Processing</span><span className="chip c-green">Settled</span>
          <span className="chip c-rose">Failed</span><span className="chip c-grey">Ignored · duplicate</span>
          <span className="chip c-amber">Exception</span><span className="chip c-green">Matched</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12 }}>
          One status = one colour, everywhere. Never invent a new chip without adding it here first.
        </div>
      </div>
      <div className="card">
        <h3>Role badges</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <span className="role r-admin">ADMIN</span><span className="role r-fin">FINANCE</span>
          <span className="role r-app">APPROVER</span><span className="role r-custom">OPS LEAD (custom)</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
          Built-ins keep fixed colours; custom roles pick from amber/teal/blue. Badges are UPPERCASE, 10.5px, 700.
        </div>
      </div>
    </div>

    <div className="grid g2" style={{ marginTop: 14 }}>
      <div className="card">
        <h3>Rules (do)</h3>
        <div style={{ fontSize: 12.5, lineHeight: 2 }}>
          ✓ Tables first — finance users live in rows<br />
          ✓ Every number clickable to its queue<br />
          ✓ Failures fail loudly (no mock fallbacks)<br />
          ✓ Reject always requires a reason<br />
          ✓ Duplicates stay visible, marked ignored
        </div>
      </div>
      <div className="card">
        <h3>Rules (don&rsquo;t)</h3>
        <div style={{ fontSize: 12.5, lineHeight: 2 }}>
          ✕ No consumer-fintech gradients in the app<br />
          ✕ No 3D/particles inside the console (marketing only)<br />
          ✕ No vanity charts without an action<br />
          ✕ No demo credentials on login<br />
          ✕ No full card/CVV reveal anywhere
        </div>
      </div>
    </div>

    <div className="note">
      <b>Quarantined from pilot UI (decided):</b> KYC-v2 flows, rewards, deep card issuing, GST/e-invoicing,
      support enquiry module. Nav simply doesn&rsquo;t show them — no &ldquo;coming soon&rdquo; placeholders in a finance console.
    </div>
  </div>
);

export default DesignSystemPage;
