// src/store/themeStore.js
import { create } from 'zustand';

const getInitialTheme = () => {
  const saved = localStorage.getItem('credify_theme');
  // Only honour an explicit saved choice; everything else → light
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('credify_theme', theme);
};

const useThemeStore = create((set, get) => {
  const initial = getInitialTheme();
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
