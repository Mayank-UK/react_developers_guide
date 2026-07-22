import type { AxiosInstance, AxiosError } from 'axios';
import { NetworkException } from '../../../core/error-handling/exceptions';

/**
 * RetryInterceptor — retries idempotent requests that fail due to transient
 * network/timeout errors. Mirrors the Flutter guide's `RetryInterceptor`.
 *
 * Note (React vs Flutter): Dio's retry re-dispatches through the full
 * interceptor chain via a custom adapter. With axios we re-send the original
 * request config directly, which is the idiomatic axios approach.
 */
export class RetryInterceptor {
  private readonly maxRetries: number;
  private readonly delayMs: number;

  constructor(maxRetries = 2, delayMs = 400) {
    this.maxRetries = maxRetries;
    this.delayMs = delayMs;
  }

  attach(instance: AxiosInstance): void {
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as
          | (AxiosError['config'] & { __retryCount?: number })
          | undefined;
        if (!config) throw error;

        const retryable =
          !error.response && // network/timeout/cancel — no HTTP response
          error.code !== 'ERR_CANCELED';

        config.__retryCount = (config.__retryCount ?? 0) + 1;

        if (retryable && config.__retryCount <= this.maxRetries) {
          await sleep(this.delayMs * config.__retryCount);
          return instance.request(config);
        }

        throw error.response
          ? error
          : new NetworkException(error.message, { cause: error });
      },
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
