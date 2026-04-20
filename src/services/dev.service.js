// src/services/dev.service.js
// ─── Dev Panel API Service ────────────────────────────────────────────────────
// All calls go through Nginx → /api/dev/* → Django backend.
// No hardcoded host needed — same-origin via Nginx proxy.

import axios from 'axios';

const devHttp = axios.create({
  baseURL: '/api/dev',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT
devHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Friendly error surfacing
devHttp.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const msg =
      data?.error ||
      data?.detail ||
      data?.message ||
      (data && typeof data === 'object' ? Object.values(data).flat()[0] : null) ||
      'Dev panel request failed';
    return Promise.reject(new Error(String(msg)));
  }
);

export const devAPI = {
  // ── Stats ───────────────────────────────────────────────────────────────────
  getDbStats: () => devHttp.get('/stats/'),

  // ── Tables ──────────────────────────────────────────────────────────────────
  getTables:      ()              => devHttp.get('/tables/'),
  getTableData:   (table, params) => devHttp.get(`/tables/${table}/`, { params }),
  getTableSchema: (table)         => devHttp.get(`/tables/${table}/schema/`),

  // ── CRUD ────────────────────────────────────────────────────────────────────
  createRow: (table, data)      => devHttp.post(`/tables/${table}/`, data),
  updateRow: (table, id, data)  => devHttp.put(`/tables/${table}/${id}/`, data),
  deleteRow: (table, id)        => devHttp.delete(`/tables/${table}/${id}/`),

  // ── SQL Runner ──────────────────────────────────────────────────────────────
  runQuery:       (query) => devHttp.post('/query/', { query }),
  getQueryHistory: ()     => devHttp.get('/query/history/'),

  // ── Audit Logs ──────────────────────────────────────────────────────────────
  getLogs: (params) => devHttp.get('/logs/', { params }),

  // ── API Proxy/Debugger ───────────────────────────────────────────────────────
  proxyRequest: (method, path, body, headers) =>
    devHttp.post('/proxy/', { method, path, body, headers }),

  // ── Phase 1: Celery Task Monitor ─────────────────────────────────────────────
  // GET /api/dev/tasks/ → { tasks: [{name, task_id, status, last_run, result, schedule}] }
  getTasks:       ()       => devHttp.get('/tasks/'),
  triggerTask:    (name)   => devHttp.post('/tasks/trigger/', { task: name }),

  // ── Phase 1: Sentry Error Feed ───────────────────────────────────────────────
  // GET /api/dev/sentry/ → { issues: [{id, title, level, count, first_seen, last_seen, url}] }
  getSentryIssues: () => devHttp.get('/sentry/'),

  // ── Phase 1: Migration Status ─────────────────────────────────────────────────
  // GET /api/dev/migrations/ → { pending_count, last_migrated_at, apps: [{app, migrations: [{name, applied}]}] }
  getMigrations: () => devHttp.get('/migrations/'),

  // ── Phase 2: Redis Inspector ──────────────────────────────────────────────────
  // GET /api/dev/cache/ → { memory_used, memory_peak, hit_rate, miss_rate, connected_clients, key_count }
  getCacheStats: () => devHttp.get('/cache/'),

  // ── Phase 2: Env Config Viewer ────────────────────────────────────────────────
  // GET /api/dev/config/ → { debug, allowed_hosts, installed_apps, settings: [{key, value, masked}] }
  getEnvConfig: () => devHttp.get('/config/'),

  // ── Phase 2: Index Health ─────────────────────────────────────────────────────
  // GET /api/dev/indexes/ → { indexes: [{table, name, type, seq_scans, idx_scans, bloat_estimate, unused}] }
  getIndexHealth: () => devHttp.get('/indexes/'),
};

export default devAPI;
