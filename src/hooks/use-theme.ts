import { useCallback, useEffect, useState } from 'react';

const useTheme = () => {
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const storedTheme = window.localStorage.getItem('theme');
      return storedTheme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark'): void => {
    setTheme(newTheme);
  }, []);

  return { theme, handleThemeChange };
};

export default useTheme;
