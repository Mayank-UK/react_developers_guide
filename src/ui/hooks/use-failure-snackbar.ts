import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/** Max simultaneously visible toasts; beyond this the oldest is dropped. */
const SNACKBAR_MAX = 3;

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
      setEntries((prev) => {
        // Cap visible entries: keep the newest SNACKBAR_MAX, drop the oldest.
        const next = [...prev, { id, failure }];
        if (next.length > SNACKBAR_MAX) next.shift();
        return next;
      });
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        dismiss(id);
      }, 4000);
      timers.current.add(timer);
    },
    [dismiss],
  );

  // Memoize the returned object so consumers that depend on it in their own
  // effect deps see a stable reference between renders (entries/show/dismiss are
  // each referentially stable unless they actually change).
  return useMemo(() => ({ entries, show, dismiss }), [entries, show, dismiss]);
}
