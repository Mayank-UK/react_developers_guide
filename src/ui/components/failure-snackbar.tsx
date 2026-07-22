import type { SnackbarEntry } from '../hooks/use-failure-snackbar';
import { FAILURE_ICONS } from '../hooks/use-failure-snackbar';
import type { FailureKind } from '../../core/error-handling/failures';

interface FailureSnackbarStackProps {
  entries: SnackbarEntry[];
  onDismiss: (id: number) => void;
}

/**
 * FailureSnackbarStack — renders queued non-blocking toasts for info/warning
 * failures. Mirrors the Flutter `FailureSnackbar` widget. Render once near the
 * screen root. Critical failures use <ShowError/> instead.
 */
export function FailureSnackbarStack({
  entries,
  onDismiss,
}: FailureSnackbarStackProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-md z-50 flex flex-col items-center gap-sm px-md"
      role="status"
      aria-live="polite"
    >
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onDismiss(entry.id)}
          className="pointer-events-auto flex w-full max-w-[var(--content-max-width)] items-center gap-md rounded-md px-md py-sm text-left shadow-modal"
          style={{ backgroundColor: 'var(--color-on-surface)', color: 'var(--color-surface)' }}
        >
          <span aria-hidden>{FAILURE_ICONS[entry.failure.kind as FailureKind]}</span>
          <span className="flex-1 text-[var(--text-body-sm)]">
            {entry.failure.message}
          </span>
        </button>
      ))}
    </div>
  );
}
