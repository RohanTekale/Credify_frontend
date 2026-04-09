// ─── Credify API Service Layer ────────────────────────────────────────────────
// All HTTP calls live here. Components import named exports, never raw axios.
// WHY: Interceptors handle JWT injection and error normalisation in one place.
import axios from 'axios';

const BASE = 'http://localhost:8080/api';

export const http = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

// ── JWT auto-attach ───────────────────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Friendly error surfacing ──────────────────────────────────────────────────
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const msg = data?.detail
      || data?.message
      || data?.error
      || (data && typeof data === 'object' ? Object.values(data).flat()[0] : null)
      || 'Something went wrong';
    return Promise.reject(new Error(String(msg)));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:              (d) => http.post('/users/login/', d),
  register:           (d) => http.post('/users/register/', d),
  forgotPassword:     (d) => http.post('/users/forgot_password/', d),
  resetPassword:      (d) => http.post('/users/reset_password/', d),
  changePassword:     (d) => http.post('/users/change_password/', d),
  requestReactivation:(d) => http.post('/users/request_reactivation/', d),
};

// ─── User / Profile ───────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:   ()  => http.get('/users/profile'),
  updateProfile:(d) => http.put('/users/profile/', d),
  uploadKYC:    (fd)=> http.post('/users/kyc_upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Cards ────────────────────────────────────────────────────────────────────
export const cardAPI = {
  getMyCards:  ()   => http.get('/cards/'),
  getCard:     (id) => http.get(`/cards/${id}/`),
  createCard:  (d)  => http.post('/cards/create_card/', d),
  freeze:      (id) => http.patch(`/cards/${id}/freeze/`),
  unfreeze:    (id) => http.patch(`/cards/${id}/unfreeze/`),
  block:       (id) => http.patch(`/cards/${id}/block/`),
  unblock:     (id) => http.patch(`/cards/${id}/unblock/`),
  createSubscription: (d) => http.post('/cards/subscriptions/create_subscription/', d),
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionAPI = {
  create:    (d)      => http.post('/transactions/create_transaction/', d),
  getAll:    ()       => http.get('/transactions/'),
  getByCard: (cardId) => http.get(`/transactions/?card_id=${cardId}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  listUsers:   ()       => http.get('/users'),
  getUser:     (id)     => http.get(`/users/${id}`),
  updateUser:  (id, d)  => http.put(`/users/${id}/`, d),
  deleteUser:  (id)     => http.delete(`/users/${id}`),
  reviewKYC:   (d)      => http.post('/users/kyc_review/', d),
  reviewReactivation: (d) => http.post('/users/review_reactivation_request/', d),
  listAllCards:   ()    => http.get('/cards/list_admin_cards/'),
  approveCardReq: (d)   => http.post('/cards/approve_card_request/', d),
  freezeCard:  (id)     => http.patch(`/cards/${id}/freeze/`),
  unfreezeCard:(id)     => http.patch(`/cards/${id}/unfreeze/`),
  blockCard:   (id)     => http.patch(`/cards/${id}/block/`),
  unblockCard: (id)     => http.patch(`/cards/${id}/unblock/`),
};

export default http;
