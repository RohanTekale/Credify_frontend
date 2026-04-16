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
};

export default devAPI;
