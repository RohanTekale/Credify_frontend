// src/services/api.js
// ─── Credify Centralized API Service Layer ────────────────────────────────────
// Single source of truth for all HTTP calls.
// Uses axios with JWT auto-attach, token refresh, and unified error handling.

import axios from 'axios';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const ACCESS_KEY  = 'access_token';
const REFRESH_KEY = 'refresh_token';

// ── Axios instance ─────────────────────────────────────────────────────────────
export const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ──────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — auto-refresh + error normalisation ─────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Auto-refresh on 401
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return http(original);
          })
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem(REFRESH_KEY);
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, { refresh });
        const newAccess = data.data?.access || data.access;

        localStorage.setItem(ACCESS_KEY, newAccess);
        http.defaults.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return http(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Clear auth and redirect to login
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise error message
    const data = err.response?.data;
    const msg =
      data?.message ||
      data?.detail ||
      data?.error ||
      (data?.errors && typeof data.errors === 'object'
        ? Object.values(data.errors).flat()[0]
        : null) ||
      (data && typeof data === 'object' ? Object.values(data).flat()[0] : null) ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(String(msg)));
  }
);

// ── Auth helpers ───────────────────────────────────────────────────────────────
export const tokenStorage = {
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  getAccess:  ()  => localStorage.getItem(ACCESS_KEY),
  getRefresh: ()  => localStorage.getItem(REFRESH_KEY),
  clear:      ()  => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:           (d) => http.post('/users/register/', d),
  login:              (d) => http.post('/users/login/', d),
  refreshToken:       (d) => http.post('/users/token/refresh/', d),
  forgotPassword:     (d) => http.post('/users/forgot_password/', d),
  resetPassword:      (d) => http.post('/users/reset_password/', d),
  changePassword:     (d) => http.post('/users/change_password/', d),
  requestReactivation:(d) => http.post('/users/request_reactivation/', d),
};

// ─────────────────────────────────────────────────────────────────────────────
// USER / PROFILE API
// ─────────────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:   ()    => http.get('/users/profile'),
  updateProfile:(d)   => http.put('/users/profile/', d),
  uploadKYC:    (fd)  => http.post('/users/kyc_upload/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CARDS API
// ─────────────────────────────────────────────────────────────────────────────
export const cardAPI = {
  getMyCards:   (params) => http.get('/cards/', { params }),
  getCard:      (id)     => http.get(`/cards/${id}/`),
  createCard:   (d)      => http.post('/cards/create_card/', d),
  freeze:       (id)     => http.patch(`/cards/${id}/freeze/`),
  unfreeze:     (id)     => http.patch(`/cards/${id}/unfreeze/`),
  block:        (id)     => http.patch(`/cards/${id}/block/`),
  unblock:      (id)     => http.patch(`/cards/${id}/unblock/`),
  createSubscription: (d) => http.post('/cards/subscriptions/create_subscription/', d),
};


export const kycAPI = {
  // User flow
  start:       ()        => http.post('/v2/kyc/start/'),
  status:      ()        => http.get('/v2/kyc/status/'),
  history:     ()        => http.get('/v2/kyc/history/'),
  upload:      (fd)      => http.post('/v2/kyc/documents/upload/', fd, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                            }),
  viewDoc:     (id)      => http.get(`/v2/kyc/documents/${id}/view/`),
  submit:      ()        => http.post('/v2/kyc/submit/'),
  resubmit:    ()        => http.post('/v2/kyc/resubmit/'),
  appeal:      (d)       => http.post('/v2/kyc/appeal/', d),
  sendOTP:     (d)       => http.post('/v2/kyc/otp/send/', d),
  verifyOTP:   (d)       => http.post('/v2/kyc/otp/verify/', d),

  // Reviewer
  queue:       (params)  => http.get('/v2/kyc/review/queue/', { params }),
  claim:       (appId)   => http.post(`/v2/kyc/review/${appId}/claim/`),
  approve:     (appId)   => http.post(`/v2/kyc/review/${appId}/approve/`),
  reject:      (appId, d) => http.post(`/v2/kyc/review/${appId}/reject/`, d),
  requestInfo: (appId, d) => http.post(`/v2/kyc/review/${appId}/request-info/`, d),
  aml:         (appId)   => http.get(`/v2/kyc/review/${appId}/aml/`),

  // Admin
  stats:       ()        => http.get('/v2/kyc/admin/stats/'),
  auditLog:    (params)  => http.get('/v2/kyc/admin/audit-log/', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTIONS API
// ─────────────────────────────────────────────────────────────────────────────
export const transactionAPI = {
  create:    (d)      => http.post('/transactions/create_transaction/', d),
  getAll:    (params) => http.get('/transactions/', { params }),
  getByCard: (cardId) => http.get('/transactions/', { params: { card_id: cardId } }),
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTS API  (exact endpoints from backend curl reference)
// ─────────────────────────────────────────────────────────────────────────────
export const requestsAPI = {
  // ── User endpoints ──────────────────────────────────────────────────────────
  // POST /api/requests/raise/
  // Body: { request_type, description }  — description REQUIRED when type=other
  // Returns: { message, request_id: "REQ-12", status: "raised" }
  raise: (d) => http.post('/requests/raise/', d),

  // GET /api/requests/my/?status=<raised|in_process|completed|rejected>
  // Returns: [{ request_id, request_type, description, status, admin_comment,
  //             user_comment, document, created_at, updated_at }]
  getMyRequests: (params) => http.get('/requests/my/', { params }),

  // GET /api/requests/{id}/detail/
  // Returns full detail with public comments + status history
  // Also marks is_viewed_by_user=true (clears unread badge)
  getMyDetail: (id) => http.get(`/requests/${id}/detail/`),

  // POST /api/requests/{id}/comment/
  // Body: { user_comment }
  // Returns: { message: "Comment added." }
  addComment: (id, d) => http.post(`/requests/${id}/comment/`, d),

  // POST /api/requests/{id}/document/   (multipart/form-data, field: "document")
  // Returns: { message, url }
  uploadDoc: (id, fd) => http.post(`/requests/${id}/document/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  // POST /api/requests/{id}/rate/
  // Body: { user_rating: 1-5, user_feedback?: string }
  // Only available when status='completed' and not yet rated
  rate: (id, d) => http.post(`/requests/${id}/rate/`, d),

  // POST /api/requests/{id}/reraise/
  // Body: { description? }  — optional updated description
  // Only works on status="rejected" requests belonging to the user
  // Returns: { message, request_id: "REQ-19" }
  reraise: (id, d = {}) => http.post(`/requests/${id}/reraise/`, d),

  // ── Admin endpoints ─────────────────────────────────────────────────────────
  // GET /api/requests/admin/?status=<raised|in_process|completed|rejected>
  // Returns: [{ request_id, user_id, user_name, user_email, request_type,
  //             description, status, admin_comment, user_comment, document,
  //             created_at, updated_at }]
  listAll: (params) => http.get('/requests/admin/', { params }),

  // GET /api/requests/{id}/admin/detail/
  // Returns full detail with ALL comments (including internal) + history
  adminDetail: (id) => http.get(`/requests/${id}/admin/detail/`),

  // POST /api/requests/{id}/action/
  // Body: { status: "in_process"|"completed"|"rejected", admin_comment? }
  // Returns: { message: "Request completed." }
  takeAction: (id, d) => http.post(`/requests/${id}/action/`, d),

  // POST /api/requests/{id}/admin/comment/
  // Body: { body, is_internal: bool }
  // is_internal=true → admin-only note, never shown to user
  adminComment: (id, d) => http.post(`/requests/${id}/admin/comment/`, d),
   // POST /api/requests/{id}/assign/
  // Body: { assigned_to: <user_id of support agent> }
  assign: (id, d) => http.post(`/requests/${id}/assign/`, d),
 
  // DELETE /api/requests/{id}/archive/
  // Soft-deletes — hides from all default queries, preserves in DB
  archive: (id) => http.delete(`/requests/${id}/archive/`),

  // GET /api/requests/{id}/document/  (admin view)
  // Returns: { document: "<cloudinary_url>" } or { document: null, message }
  getDocument: (id) => http.get(`/requests/${id}/document/`),
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN API
// ─────────────────────────────────────────────────────────────────────────────
export const adminAPI = {
  // Users
  listUsers:          (params) => http.get('/users/', { params }),
  getUser:            (id)     => http.get(`/users/${id}/`),
  updateUser:         (id, d)  => http.put(`/users/${id}/`, d),
  deleteUser:         (id)     => http.delete(`/users/${id}/`),
  reviewKYC:          (d)      => http.post('/users/kyc_review/', d),
  reviewReactivation: (d)      => http.post('/users/review_reactivation_request/', d),

  // Cards
  listAllCards:    (params) => http.get('/cards/list_admin_cards/', { params }),
  approveCardReq:  (d)      => http.post('/cards/approve_card_request/', d),
  freezeCard:      (id)     => http.patch(`/cards/${id}/freeze/`),
  unfreezeCard:    (id)     => http.patch(`/cards/${id}/unfreeze/`),
  blockCard:       (id)     => http.patch(`/cards/${id}/block/`),
  unblockCard:     (id)     => http.patch(`/cards/${id}/unblock/`),
};

export default http;
// ─────────────────────────────────────────────────────────────────────────────
// RECONCILIATION API  (mock — real endpoints TBD per backend)
// ─────────────────────────────────────────────────────────────────────────────
export const reconAPI = {
  // GET /api/recon/runs/  — list reconciliation runs
  listRuns: (params) => http.get('/recon/runs/', { params }).catch(() => ({
    data: { results: [
      { id: 1, ran_at: new Date().toISOString(), total: 142, matched: 139, mismatches: 3, match_rate: 97.9 },
    ]},
  })),

  // GET /api/recon/runs/:id/delta/  — diff for a specific run
  getDelta: (id) => http.get(`/recon/runs/${id}/delta/`).catch(() => ({
    data: { results: [] },
  })),

  // GET /api/recon/mismatches/  — all open mismatches
  getMismatches: (params) => http.get('/recon/mismatches/', { params }).catch(() => ({
    data: { results: [] },
  })),

  // POST /api/recon/mismatches/:id/dispute/  — raise dispute
  raiseDispute: (id) => http.post(`/recon/mismatches/${id}/dispute/`).catch(() => ({
    data: { message: 'Dispute raised (mock).' },
  })),

  // POST /api/recon/trigger/  — manually trigger a reconciliation run
  triggerRun: () => http.post('/recon/trigger/').catch(() => ({
    data: { message: 'Reconciliation triggered (mock).' },
  })),
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK API  (mock — real endpoints TBD per backend)
// ─────────────────────────────────────────────────────────────────────────────
export const webhookAPI = {
  // GET /api/webhooks/events/  — event log with status filter
  listEvents: (params) => http.get('/webhooks/events/', { params }).catch(() => ({
    data: { results: [] },
  })),

  // GET /api/webhooks/dlq/  — dead-letter queue
  getDLQ: (params) => http.get('/webhooks/dlq/', { params }).catch(() => ({
    data: { results: [] },
  })),

  // POST /api/webhooks/dlq/:id/replay/  — replay a DLQ event
  replayEvent: (id) => http.post(`/webhooks/dlq/${id}/replay/`).catch(() => ({
    data: { message: 'Event replayed (mock).' },
  })),

  // GET /api/webhooks/stats/  — delivery stats (total, delivered, duplicates, failed)
  getStats: () => http.get('/webhooks/stats/').catch(() => ({
    data: { total: 1482, delivered: 1469, duplicates_dropped: 12, failed: 1 },
  })),
};

// ─────────────────────────────────────────────────────────────────────────────
// APPROVALS API  (mock — real endpoints TBD per backend)
// ─────────────────────────────────────────────────────────────────────────────
export const approvalsAPI = {
  // GET /api/approvals/queue/  — pending approval requests
  getQueue: (params) => http.get('/approvals/queue/', { params }).catch(() => ({
    data: { results: [] },
  })),

  // POST /api/approvals/:id/approve/
  approve: (id, d) => http.post(`/approvals/${id}/approve/`, d).catch(() => ({
    data: { message: 'Approved (mock).' },
  })),

  // POST /api/approvals/:id/reject/
  reject: (id, d) => http.post(`/approvals/${id}/reject/`, d).catch(() => ({
    data: { message: 'Rejected (mock).' },
  })),

  // GET /api/approvals/rules/  — threshold rules
  getRules: () => http.get('/approvals/rules/').catch(() => ({
    data: { results: [] },
  })),
};
