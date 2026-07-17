// src/features/console/components/DemoDrawer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { demoSteps } from '../data/mockData';

const DemoDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();

  const jump = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <div className={`drawer${open ? ' open' : ''}`}>
      <h3 style={{ marginBottom: 4 }}>8-step pilot demo</h3>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
        The storyboard every sprint builds toward. Click to jump.
      </div>
      {demoSteps.map((s) => (
        <div className="dstep" key={s.n}>
          <span className="n">{s.n}</span>
          <div>
            {s.text}
            <a onClick={() => jump(s.to)} style={{ cursor: 'pointer' }}>{s.label}</a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DemoDrawer;
