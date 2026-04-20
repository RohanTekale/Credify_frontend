// src/pages/dev/CeleryTasks.jsx — Phase 1: Celery Task Monitor
import { useEffect, useState, useCallback } from 'react';
import { devAPI } from '../../services/dev.service';

const C = {
  bg: '#080c14', bgCard: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
  brand: '#3b61f5', text: '#f0f4ff', textSec: '#8b96b0', textMuted: '#4b5675',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', mono: "'JetBrains Mono',monospace",
};

const STATUS_META = {
  SUCCESS:  { color: C.success, bg: 'rgba(16,185,129,0.12)',  label: 'Success'  },
  FAILURE:  { color: C.danger,  bg: 'rgba(239,68,68,0.12)',   label: 'Failure'  },
  PENDING:  { color: C.warning, bg: 'rgba(245,158,11,0.12)',  label: 'Pending'  },
  REVOKED:  { color: C.textMuted, bg: 'rgba(75,86,117,0.12)', label: 'Revoked'  },
  STARTED:  { color: C.brand,   bg: 'rgba(59,97,245,0.12)',   label: 'Running'  },
};

function StatusBadge({ status }) {
  const s = (status || 'PENDING').toUpperCase();
  const m = STATUS_META[s] || STATUS_META.PENDING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: m.color, background: m.bg }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color }} />
      {m.label}
    </span>
  );
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(59,97,245,0.2)', borderTop: `2px solid ${C.brand}`, borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
  );
}

// Mock data for when API is not yet available
const MOCK_TASKS = [
  { name: 'cards.tasks.process_card_limits', task_id: 'abc-123', status: 'SUCCESS', last_run: '2m ago', result: 'Updated 12 cards', schedule: 'Every 5 min' },
  { name: 'notifications.tasks.send_alerts', task_id: 'def-456', status: 'SUCCESS', last_run: '8m ago', result: 'Sent 3 alerts', schedule: 'Every 10 min' },
  { name: 'kyc.tasks.check_pending_kyc',     task_id: 'ghi-789', status: 'PENDING', last_run: 'Never',  result: null,           schedule: 'Every 30 min' },
  { name: 'reports.tasks.daily_summary',     task_id: 'jkl-012', status: 'FAILURE', last_run: '1h ago', result: 'ConnectionError', schedule: 'Daily 00:00' },
  { name: 'celery.beat.scheduler',           task_id: 'mno-345', status: 'STARTED', last_run: 'Now',    result: 'Running…',     schedule: 'Always' },
];

export default function CeleryTasks() {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [triggering, setTriggering] = useState(null);
  const [toast, setToast]         = useState(null);
  const [filter, setFilter]       = useState('all');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await devAPI.getTasks();
      setTasks(Array.isArray(data?.tasks) ? data.tasks : Array.isArray(data) ? data : MOCK_TASKS);
    } catch {
      setTasks(MOCK_TASKS); // fallback to mock
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const trigger = async (name) => {
    setTriggering(name);
    try {
      await devAPI.triggerTask(name);
      showToast(`Task "${name.split('.').pop()}" triggered successfully`);
      setTimeout(load, 1000);
    } catch (err) {
      showToast(err.message || 'Failed to trigger task', 'error');
    } finally {
      setTriggering(null);
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => (t.status || 'PENDING').toUpperCase() === filter);

  const counts = {
    all: tasks.length,
    SUCCESS: tasks.filter(t => t.status?.toUpperCase() === 'SUCCESS').length,
    FAILURE: tasks.filter(t => t.status?.toUpperCase() === 'FAILURE').length,
    PENDING: tasks.filter(t => t.status?.toUpperCase() === 'PENDING').length,
    STARTED: tasks.filter(t => t.status?.toUpperCase() === 'STARTED').length,
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 10, background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: toast.type === 'error' ? '#f87171' : '#34d399', fontSize: 13, fontWeight: 600 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Celery Task Monitor
          </h2>
          <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>
            Scheduled tasks · Last run results · Manual triggers
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textSec, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          {loading ? <Spinner /> : '↻'} Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Tasks', value: counts.all,    color: C.brand   },
          { label: 'Successful',  value: counts.SUCCESS, color: C.success },
          { label: 'Failed',      value: counts.FAILURE, color: C.danger  },
          { label: 'Running',     value: counts.STARTED, color: C.warning },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '16px 18px', borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, width: 'fit-content', border: `1px solid ${C.border}` }}>
        {[['all', 'All'], ['SUCCESS', 'Success'], ['FAILURE', 'Failed'], ['PENDING', 'Pending'], ['STARTED', 'Running']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: filter === id ? 'rgba(59,97,245,0.18)' : 'transparent', color: filter === id ? '#8ba7ff' : C.textSec, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            {label} {counts[id] > 0 && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>{counts[id]}</span>}
          </button>
        ))}
      </div>

      {/* Task table */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 18px', borderBottom: `1px solid ${C.border}`, gap: 12 }}>
          {['Task Name', 'Status', 'Last Run', 'Result', 'Action'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.textSec }}>
            <Spinner /> <span style={{ marginLeft: 10, fontSize: 13 }}>Loading tasks…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>No tasks found</div>
        ) : (
          filtered.map((task, i) => (
            <div key={task.task_id || i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 18px', borderBottom: i < filtered.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', gap: 12, alignItems: 'center', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.mono, marginBottom: 3 }}>
                  {task.name?.split('.').pop() || task.name}
                </div>
                <div style={{ fontSize: 10, color: C.textMuted, fontFamily: C.mono }}>{task.schedule || '—'}</div>
              </div>
              {/* Status */}
              <div><StatusBadge status={task.status} /></div>
              {/* Last run */}
              <div style={{ fontSize: 12, color: C.textSec, fontFamily: C.mono }}>{task.last_run || '—'}</div>
              {/* Result */}
              <div style={{ fontSize: 11, color: task.status?.toUpperCase() === 'FAILURE' ? '#f87171' : C.textSec, fontFamily: C.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {task.result || '—'}
              </div>
              {/* Trigger */}
              <div>
                <button
                  onClick={() => trigger(task.name)}
                  disabled={triggering === task.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: 'rgba(59,97,245,0.1)', border: '1px solid rgba(59,97,245,0.25)', color: '#8ba7ff', fontSize: 11, fontWeight: 700, cursor: triggering === task.name ? 'wait' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                >
                  {triggering === task.name ? <Spinner /> : '▶'} Run
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
