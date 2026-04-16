// src/store/themeStore.js
// Manages light/dark theme with persistence
import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('credify_theme');
  if (saved) return saved;
  // Default to light
  return 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('credify_theme', theme);
};

const useThemeStore = create((set, get) => {
  const initial = getInitialTheme();
  // Apply immediately
  if (typeof document !== 'undefined') applyTheme(initial);

  return {
    theme: initial,

    toggleTheme: () => {
      const next = get().theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      set({ theme: next });
    },

    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
  };
});

export default useThemeStore;
