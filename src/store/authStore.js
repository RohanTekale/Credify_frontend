import { create } from 'zustand';

const parseJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  token: localStorage.getItem('access_token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAdmin: localStorage.getItem('is_admin') === 'true',

  setAuth: (token, userData = {}) => {
    const payload = parseJWT(token);

    const isAdmin =
      userData?.is_staff ||
      userData?.is_superuser ||
      payload?.is_staff ||
      payload?.is_superuser ||
      false;

    // ✅ STORE FIRST
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('is_admin', String(isAdmin));

    // ✅ THEN UPDATE STATE
    set({
      token,
      user: userData,
      isAdmin,
    });
  },

  logout: () => {
    localStorage.clear();

    set({
      token: null,
      user: null,
      isAdmin: false,
    });
  },

  updateUser: (updates) => {
    set((s) => {
      const updated = { ...s.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return { user: updated };
    });
  },
}));

export default useAuthStore;