'use client';
import { useEffect, useState } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    // Reading browser storage after mount to sync theme — intentional post-hydration setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(localStorage.getItem('valsea-theme') !== 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('valsea-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return { isDark, toggle };
}
