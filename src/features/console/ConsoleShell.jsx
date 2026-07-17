// src/features/console/ConsoleShell.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import ConsoleSidebar from './components/ConsoleSidebar';
import './console.css';

const ConsoleShell = () => (
  <div className="credify-console">
    <section className="app active">
      <ConsoleSidebar />
      <main className="main">
        <Outlet />
      </main>
    </section>
  </div>
);

export default ConsoleShell;
