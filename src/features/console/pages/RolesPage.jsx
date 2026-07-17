// src/features/console/pages/RolesPage.jsx
import React, { useState } from 'react';
import useConsoleStore from '../store/consoleStore';
import { useToast } from '../../../components/ui';

const PERMS_LEFT = [
  { key: 'initiate', label: 'Initiate payments', checked: true },
  { key: 'approve', label: 'Approve payments', checked: false },
  { key: 'vendors', label: 'Manage vendors', checked: true },
  { key: 'policies', label: 'Manage policies', checked: false },
];
const PERMS_RIGHT = [
  { key: 'view-recon', label: 'View reconciliation', checked: true },
  { key: 'resolve-exceptions', label: 'Resolve exceptions', checked: false },
  { key: 'export-audit', label: 'Export audit', checked: false },
  { key: 'manage-team', label: 'Manage team', checked: false },
];

const RolesPage = () => {
  const toast = useToast();
  const { roles, addRole } = useConsoleStore();
  const [showNewRole, setShowNewRole] = useState(false);
  const [roleName, setRoleName] = useState('');

  const createRole = () => {
    const name = roleName.trim();
    if (!name) {
      toast.error('Role name is required');
      return;
    }
    addRole({ name, perms: 'Initiate payments · manage vendors · view recon' });
    setShowNewRole(false);
    setRoleName('');
    toast.success(`Role "${name}" created`);
  };

  return (
    <div className="pg-view">
      <div className="crumb">Configure · Team & Roles</div>
      <div className="pagetop">
        <div>
          <h1 className="pg">Team & Roles</h1>
          <div className="sub">Three built-in roles + any custom roles you need. Permissions, not titles.</div>
        </div>
        <button className="btn" onClick={() => setShowNewRole(true)}>+ Create role</button>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 14 }}>
        <table>
          <thead><tr><th>Role</th><th>Type</th><th>Key permissions</th></tr></thead>
          <tbody>
            {roles.map((r, i) => (
              <tr key={i}>
                <td><span className={`role ${r.roleClass}`}>{r.role}</span></td>
                <td>{r.type}</td>
                <td>{r.perms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewRole && (
        <div className="card">
          <h3>Create custom role</h3>
          <div className="grid g2">
            <div className="field">
              <label>Role name</label>
              <input placeholder="e.g. Treasury Analyst" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            </div>
            <div className="field">
              <label>Badge colour</label>
              <select>
                <option>Amber</option>
                <option>Teal</option>
                <option>Blue</option>
              </select>
            </div>
          </div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.7px', display: 'block', marginBottom: 8 }}>
            Permissions
          </label>
          <div className="grid g2">
            <div>
              {PERMS_LEFT.map((p) => (
                <div className="perm" key={p.key}>
                  <input type="checkbox" defaultChecked={p.checked} /> {p.label}
                </div>
              ))}
            </div>
            <div>
              {PERMS_RIGHT.map((p) => (
                <div className="perm" key={p.key}>
                  <input type="checkbox" defaultChecked={p.checked} /> {p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="warnbox">
            Guardrail: a role with <b>Initiate payments</b> can never also approve its own requests — segregation of duties is enforced by the engine, not by trust.
          </div>
          <button className="btn" onClick={createRole}>Create role</button>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
