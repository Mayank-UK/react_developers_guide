import { type AxiosInstance, type AxiosError, isAxiosError } from 'axios';
import { AppException } from '../../../core/error-handling/exceptions';
import { axiosErrorToException } from '../../../core/error-handling/guards';

/**
 * RetryInterceptor — retries idempotent requests that fail due to transient
 * network/timeout errors. Mirrors the Flutter guide's `RetryInterceptor`.
 *
 * Note (React vs Flutter): Dio's retry re-dispatches through the full
 * interceptor chain via a custom adapter. With axios we re-send the original
 * request config directly, which is the idiomatic axios approach.
 *
 * Safety:
 *  - Only **idempotent** methods are retried (GET/HEAD/OPTIONS/PUT/DELETE). A
 *    non-idempotent verb (POST/PATCH) whose request reached the server but
 *    whose response was lost is NOT retried, to avoid duplicate writes.
 *  - Backoff is exponential with full jitter to avoid thundering-herd retries
 *    against a recovering server: `random(0, base * 2^(attempt-1))`.
 *  - Errors that are already `AppException`s (e.g. simulated failures thrown by
 *    the failure-injection request interceptor) are never retried — they are
 *    intentional, not transient, so retrying would turn every simulated failure
 *    into a 3-attempt run with backoff.
 */
const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options', 'put', 'delete']);

/**
 * True for transient, no-response axios failures safe to retry (when the method
 * is idempotent). Already-typed `AppException`s are not retried (see above), so
 * injected failures short-circuit the retry loop.
 */
function isTransientNetworkError(error: unknown): boolean {
    // A simulated/typed failure thrown upstream is intentional — never retry.
    if (error instanceof AppException) return false;
    // Only genuine axios errors are candidates for retry.
    if (!isAxiosError(error)) return false;
    // A response means the server answered (even with an error status) —
    // don't retry those here; the data layer maps them to typed failures.
    if (error.response) return false;
    // Explicit cancellation must never be retried.
    if (error.code === 'ERR_CANCELED') return false;
    return true;
}

export class RetryInterceptor {
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;

  constructor(maxRetries = 2, baseDelayMs = 200) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
  }

  attach(instance: AxiosInstance): void {
    instance.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        // A typed AppException thrown by an upstream interceptor (e.g. the
        // failure-injection request interceptor) is intentional, not transient
        // — pass it through unchanged so it never enters the retry loop.
        if (error instanceof AppException) throw error;

        const axiosError = error as AxiosError;
        const config = axiosError.config as
          | (AxiosError['config'] & { __retryCount?: number })
          | undefined;
        if (!config) throw axiosError;

        const method = (config.method ?? 'get').toLowerCase();
        const retryable =
          isTransientNetworkError(axiosError) &&
          IDEMPOTENT_METHODS.has(method);

        config.__retryCount = (config.__retryCount ?? 0) + 1;

        if (retryable && config.__retryCount <= this.maxRetries) {
          await sleep(this.jitteredDelay(config.__retryCount));
          return instance.request(config);
        }

        // No response after exhausting retries → convert to a typed AppException
        // through the single shared mapping in guards.ts. A response (even an
        // error status) is re-thrown raw and mapped downstream.
        throw axiosError.response
          ? axiosError
          : toNetworkException(axiosError);
      },
    );
  }

  /** Exponential backoff with full jitter: uniform in [0, base * 2^(attempt-1)]. */
  private jitteredDelay(attempt: number): number {
    const ceiling = this.baseDelayMs * 2 ** (attempt - 1);
    return Math.random() * ceiling;
  }
}

/**
 * Map an exhausted transient axios error to the most specific AppException.
 * Delegates to the single source of truth in `guards.ts` so the axios-code→
 * exception mapping is not duplicated here.
 */
export function toNetworkException(error: AxiosError): AppException {
  return axiosErrorToException(error);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
