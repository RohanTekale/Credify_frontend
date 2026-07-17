// src/features/console/ConsoleShell.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import ConsoleSidebar from './components/ConsoleSidebar';
import useConsoleStore from './store/consoleStore';
import './console.css';

const ConsoleShell = () => {
  const org = useConsoleStore((s) => s.org);

  // First visit: no organization yet — run onboarding before the console.
  if (!org) return <Navigate to="/onboarding" replace />;

  return (
    <div className="credify-console">
      <section className="app active">
        <ConsoleSidebar />
        <main className="main">
          <Outlet />
        </main>
      </section>
    </div>
  );
};

export default ConsoleShell;
