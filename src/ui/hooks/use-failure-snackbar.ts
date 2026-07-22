import { useCallback, useRef, useState } from 'react';
import type { Failure, FailureKind } from '../../core/error-handling/failures';

export interface SnackbarEntry {
  id: number;
  failure: Failure;
}

export const FAILURE_ICONS: Record<FailureKind, string> = {
  network: '📶',
  server: '☁︎',
  cache: '🗄',
  auth: '🔒',
  database: '🗄',
  unknown: '⚠︎',
};

/**
 * useFailureSnackbar — non-blocking transient notifications for *info/warning*
 * failures. Mirrors the Flutter `FailureSnackbar` + `ScaffoldMessenger`.
 *
 * Pattern: the store exposes a `warning` Failure; the view calls `show(warning)`
 * exactly once per warning via an effect. The toast auto-dismisses after a few
 * seconds. Critical failures use <ShowError/> instead — never this hook.
 */
export function useFailureSnackbar() {
  const [entries, setEntries] = useState<SnackbarEntry[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const show = useCallback(
    (failure: Failure) => {
      const id = nextId.current++;
      setEntries((prev) => [...prev, { id, failure }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return { entries, show, dismiss };
}
