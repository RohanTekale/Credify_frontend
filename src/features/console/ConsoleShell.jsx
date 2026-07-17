// src/features/console/ConsoleShell.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ConsoleSidebar from './components/ConsoleSidebar';
import DemoDrawer from './components/DemoDrawer';
import './console.css';

const ConsoleShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="credify-console">
      <section className="app active">
        <ConsoleSidebar />
        <main className="main">
          <Outlet />
        </main>
      </section>

      <button className="fab" onClick={() => setDrawerOpen((o) => !o)}>
        &#9654; Pilot demo script
      </button>
      <DemoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default ConsoleShell;
