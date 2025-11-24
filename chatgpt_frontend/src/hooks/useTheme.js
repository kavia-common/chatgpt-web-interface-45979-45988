import { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export function useTheme(defaultTheme = 'light') {
  /** Persisted theme hook using data-theme attribute on <html> */
  const storageKey = 'app.theme';
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, setTheme, toggleTheme };
}

export default useTheme;
