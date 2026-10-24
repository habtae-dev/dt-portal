// context/ThemeContext.jsx
// Drives the public-side accessibility bar: theme (default / high-visibility
// / dark), and font scale (100–150%). Persisted to localStorage so a
// citizen's choice survives a page reload.

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const THEMES = ['default', 'high-visibility', 'dark'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dt_theme') || 'default');
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('dt_font_scale')) || 100);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-high-visibility');
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'high-visibility') root.classList.add('theme-high-visibility');
    localStorage.setItem('dt_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale / 100));
    localStorage.setItem('dt_font_scale', String(fontScale));
  }, [fontScale]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  const increaseFont = () => setFontScale((s) => Math.min(s + 10, 150));
  const decreaseFont = () => setFontScale((s) => Math.max(s - 10, 100));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, fontScale, increaseFont, decreaseFont }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
