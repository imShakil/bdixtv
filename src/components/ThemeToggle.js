'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const THEME_KEY = 'bdiptv_theme_mode';

function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

export default function ThemeToggle({ mobile = false }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const saved = window.localStorage.getItem(THEME_KEY);
    const resolved = saved === 'dark' ? 'dark' : 'light';
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, next);
    }
  };

  const commonClasses = mobile
    ? 'flex w-full items-center justify-between rounded-lg border border-steel/20 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50'
    : 'inline-flex items-center gap-1.5 rounded-full border border-steel/20 bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:bg-slate-50';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={commonClasses}
    >
      <span className="leading-none">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
    </button>
  );
}
