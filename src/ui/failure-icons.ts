import type { FailureKind } from '../core/error-handling/failures';

/**
 * Shared glyph per `FailureKind`, used by both the blocking <ShowError/> and
 * the non-blocking failure snackbar. Defined once so the two presentations
 * never drift.
 */
export const FAILURE_KIND_ICONS: Record<FailureKind, string> = {
  network: '📶',
  server: '☁︎',
  cache: '🗄',
  auth: '🔒',
  database: '🛢',
  unknown: '⚠︎',
};
