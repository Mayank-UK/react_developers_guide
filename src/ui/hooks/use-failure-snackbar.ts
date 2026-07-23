import { useCallback, useEffect, useRef, useState } from 'react';
import type { Failure } from '../../core/error-handling/failures';
import { FAILURE_KIND_ICONS as FAILURE_ICONS } from '../failure-icons';

export interface SnackbarEntry {
  id: number;
  failure: Failure;
}

export { FAILURE_ICONS };

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
  const timers = useRef<Set<number>>(new Set());

  // Clear any pending auto-dismiss timers on unmount.
  useEffect(() => {
    const set = timers.current;
    return () => set.forEach((id) => window.clearTimeout(id));
  }, []);

  const dismiss = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const show = useCallback(
    (failure: Failure) => {
      const id = nextId.current++;
      setEntries((prev) => [...prev, { id, failure }]);
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        dismiss(id);
      }, 4000);
      timers.current.add(timer);
    },
    [dismiss],
  );

  return { entries, show, dismiss };
}
