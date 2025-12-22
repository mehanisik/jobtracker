import type { LucideIcon } from 'lucide-react';
import { Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeOption {
  value: 'light' | 'dark';
  icon: LucideIcon;
  label: string;
}

interface ThemeSwitcherProps {
  themes: ThemeOption[];
  defaultTheme?: 'light' | 'dark';
}

export default function ThemeSwitcher({ themes, defaultTheme = 'light' }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);
  const currentTheme = themes.find((t) => t.value === theme);
  const Icon = currentTheme?.icon ?? Moon;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ?? (prefersDark ? 'dark' : defaultTheme);

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    document.body.classList.add('theme-transition');
  }, [defaultTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      type='button'
      onClick={toggleTheme}
      className='bg-secondary hover:bg-secondary/80 text-secondary-foreground focus:ring-ring rounded-full p-2 focus:ring-2 focus:outline-none'
      aria-label={currentTheme?.label ?? `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <Icon className='h-5 w-5' />
    </button>
  );
}
