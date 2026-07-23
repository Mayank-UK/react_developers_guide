import type { AxiosInstance, AxiosError } from 'axios';
import { NetworkException, TimeoutException } from '../../../core/error-handling/exceptions';

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
 */
const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options', 'put', 'delete']);

/** True for transient, no-response failures safe to retry (when idempotent). */
function isTransientNetworkError(error: AxiosError): boolean {
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
      async (error: AxiosError) => {
        const config = error.config as
          | (AxiosError['config'] & { __retryCount?: number })
          | undefined;
        if (!config) throw error;

        const method = (config.method ?? 'get').toLowerCase();
        const retryable =
          isTransientNetworkError(error) && IDEMPOTENT_METHODS.has(method);

        config.__retryCount = (config.__retryCount ?? 0) + 1;

        if (retryable && config.__retryCount <= this.maxRetries) {
          await sleep(this.jitteredDelay(config.__retryCount));
          return instance.request(config);
        }

        throw error.response ? error : toNetworkException(error);
      },
    );
  }

  /** Exponential backoff with full jitter: uniform in [0, base * 2^(attempt-1)]. */
  private jitteredDelay(attempt: number): number {
    const ceiling = this.baseDelayMs * 2 ** (attempt - 1);
    return Math.random() * ceiling;
  }
}

/** Map an exhausted transient axios error to the most specific AppException. */
function toNetworkException(error: AxiosError): NetworkException {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new TimeoutException('Request timed out', { cause: error });
  }
  return new NetworkException(error.message, { cause: error });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
