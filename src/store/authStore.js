// src/store/authStore.js
// ─── Credify Auth State ────────────────────────────────────────────────────────
import { create } from 'zustand';
import { tokenStorage, userAPI } from '../services/api';

const parseJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  token:   tokenStorage.getAccess() || null,
  user:    JSON.parse(localStorage.getItem('user') || 'null'),
  isAdmin: localStorage.getItem('is_admin') === 'true',

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Called after successful login.
   * Stores tokens and parses user data.
   */
  setAuth: (accessToken, refreshToken, userData = {}) => {
    const payload = parseJWT(accessToken);

    const isAdmin =
      userData?.is_staff ||
      userData?.is_superuser ||
      payload?.is_staff ||
      payload?.is_superuser ||
      false;

    tokenStorage.setTokens(accessToken, refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('is_admin', String(isAdmin));

    set({ token: accessToken, user: userData, isAdmin });
  },

  /**
   * Clear all auth state and storage.
   */
  logout: () => {
    tokenStorage.clear();
    localStorage.removeItem('is_admin');
    set({ token: null, user: null, isAdmin: false });
  },

  /**
   * Fetch the real profile from the backend and refresh user + role.
   * Called after login and on app boot so role gating always reflects the API,
   * not stale localStorage data.
   */
  hydrateProfile: async () => {
    if (!get().token) return null;
    const res = await userAPI.getProfile();
    const profile = res.data?.data ?? res.data;
    if (!profile || typeof profile !== 'object') return null;

    const isAdmin = !!(profile.is_staff || profile.is_superuser);
    localStorage.setItem('user', JSON.stringify(profile));
    localStorage.setItem('is_admin', String(isAdmin));
    set({ user: profile, isAdmin });
    return profile;
  },

  /**
   * Partial update to user object (e.g. after profile edit).
   */
  updateUser: (updates) => {
    set((s) => {
      const updated = { ...s.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
  },

  /**
   * Check if token is still valid (not expired).
   */
  isTokenValid: () => {
    const token = get().token;
    if (!token) return false;
    const payload = parseJWT(token);
    if (!payload?.exp) return false;
    return Date.now() < payload.exp * 1000;
  },
}));

export default useAuthStore;