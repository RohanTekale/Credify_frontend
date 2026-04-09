// ─── Dev Panel API Service ─────────────────────────────────────────────────────
import { http } from './api';

export const devAPI = {
  // Tables
  getTables:       ()              => http.get('/dev/tables/'),
  getTableData:    (table, params) => http.get(`/dev/tables/${table}/`, { params }),
  getTableSchema:  (table)         => http.get(`/dev/tables/${table}/schema/`),

  // CRUD
  createRow:  (table, data)     => http.post(`/dev/tables/${table}/`, data),
  updateRow:  (table, id, data) => http.put(`/dev/tables/${table}/${id}/`, data),
  deleteRow:  (table, id)       => http.delete(`/dev/tables/${table}/${id}/`),

  // SQL Query runner
  runQuery: (query) => http.post('/dev/query/', { query }),

  // Stats / Meta
  getDbStats: () => http.get('/dev/stats/'),
  getQueryHistory: () => http.get('/dev/query/history/'),

  // API Debugger
  proxyRequest: (method, path, body, headers) =>
    http.post('/dev/proxy/', { method, path, body, headers }),
};
