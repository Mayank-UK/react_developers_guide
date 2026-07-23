import { createContext, useContext } from 'react';

/**
 * Theme context + hook, split from <ThemeProvider/> so the provider file only
 * exports a component (keeps React Fast Refresh happy).
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const STORAGE_KEY = 'rdg-theme';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
