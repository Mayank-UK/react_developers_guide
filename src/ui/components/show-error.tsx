import type { Failure } from '../../core/error-handling/failures';
import { FAILURE_KIND_ICONS } from '../failure-icons';

interface ShowErrorProps {
  failure: Failure;
  onRetry?: () => void;
}

/**
 * ShowError — full-screen blocking error for *critical* failures, with an
 * optional Retry. Mirrors the Flutter `ShowError` widget. The UI looks only at
 * the Failure (never where it came from) to decide how to render.
 */
export function ShowError({ failure, onRetry }: ShowErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-md p-lg text-center">
      <span className="text-[64px] leading-none text-error" aria-hidden>
        {FAILURE_KIND_ICONS[failure.kind]}
      </span>
      <p className="max-w-prose text-body text-on-surface">
        {failure.message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md px-lg py-sm font-medium text-on-primary shadow-button-card hover:shadow-button-card-hover"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          ↻ Retry
        </button>
      )}
    </div>
  );
}
