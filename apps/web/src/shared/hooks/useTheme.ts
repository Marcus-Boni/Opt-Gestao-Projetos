import { useLayoutEffect, useState } from 'react';

const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (isTheme(stored)) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}
