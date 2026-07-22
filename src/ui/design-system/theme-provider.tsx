import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ThemeContext,
  getInitialMode,
  type ThemeContextValue,
  type ThemeMode,
} from './theme';

/**
 * ThemeProvider owns light/dark mode, mirroring the Flutter guide's
 * `lightTheme` / `darkTheme` selection. The active theme is written as
 * `data-theme` on <html>, which `tokens.css` keys off of.
 *
 * Note (React vs Flutter): Flutter ships two `ThemeData` objects and the tree
 * reads `Theme.of(context)`. React has no built-in theme, so we use a small
 * context + a `data-theme` attribute that CSS variables resolve. The hook lives
 * in `theme.ts`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem('rdg-theme', mode);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
