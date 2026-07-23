import axios, { type AxiosError, type AxiosResponse } from 'axios';
import {
  AppDatabaseException,
  AppException,
  AuthException,
  NetworkException,
  ServerException,
  TimeoutException,
} from './exceptions';
import {
  AuthFailure,
  CacheFailure,
  DatabaseFailure,
  Failure,
  FailureSeverity,
  NetworkFailure,
  ServerFailure,
  UnknownFailure,
} from './failures';
import { failed, type Failed, type Result } from '../result';
import type { Logger } from '../config/logger';

/**
 * Guards — the heart of the error pipeline. Mirrors the Flutter guide's
 * `guards.dart`.
 *
 *  1. `guardedApiCall`  : wraps a raw data-source call and upgrades thrown
 *                        engine errors (axios / fetch / JSON) into typed
 *                        `AppException`s.
 *  2. `mapExceptionToFailure`: turns an `AppException` into a user-facing
 *                        `Failure`, recursively chaining any nested cause.
 *  3. `safeRepositoryCall`: wraps a repository method and returns a `Result`,
 *                        allowing per-error-type fallbacks (e.g. serve cache on
 *                        network error).
 */

/** Wrap a low-level data-source operation. Re-throws typed AppExceptions. */
export async function guardedApiCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (e) {
    throw toAppException(e);
  }
}

/** Convert any thrown value into a typed AppException (idempotent if already one). */
export function toAppException(error: unknown): AppException {
  if (error instanceof AppException) return error;

  if (axios.isAxiosError(error)) return axiosErrorToException(error);

  if (error instanceof TypeError) {
    // fetch()/network failures surface as TypeError ("Failed to fetch").
    return new NetworkException(error.message, { cause: error });
  }
  if (error instanceof SyntaxError) {
    return new ServerException('Invalid response format', { cause: error });
  }

  return new ServerException('Unexpected error', { cause: error });
}

function axiosErrorToException(e: AxiosError): AppException {
  // No response at all → connectivity / cancellation / cert problems.
  if (!e.response) {
    if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
      return new TimeoutException('Request timed out', { cause: e });
    }
    if (e.code === 'ERR_NETWORK') {
      return new NetworkException('No internet connection', { cause: e });
    }
    return new NetworkException(e.message || 'Network error', { cause: e });
  }

  return responseToException(e.response, e);
}

/** Map an HTTP response into a typed exception (also used by the failure-injection interceptor). */
export function responseToException(
  response: AxiosResponse,
  cause?: unknown,
): AppException {
  const status = response.status;
  const data: unknown = response.data;

  if (status === 401 || status === 403) {
    return new AuthException(`Authentication failed (${status})`, { cause });
  }

  const rawMessage =
    typeof data === 'object' && data !== null
      ? (data as Record<string, unknown>).message
      : undefined;
  const serverMessage = typeof rawMessage === 'string' ? rawMessage : undefined;

  return new ServerException(serverMessage ?? `Server returned ${status}`, {
    cause,
  });
}

/** Recursively map an AppException to a Failure, preserving the cause chain. */
export function mapExceptionToFailure(e: AppException): Failure {
  const innerCause =
    e.cause instanceof AppException ? mapExceptionToFailure(e.cause) : undefined;

  if (e instanceof TimeoutException) {
    return new NetworkFailure(e.message, innerCause);
  }
  if (e instanceof NetworkException) {
    return new NetworkFailure(e.message, innerCause);
  }
  if (e instanceof ServerException) {
    return new ServerFailure(e.message, innerCause);
  }
  if (e instanceof AuthException) {
    return new AuthFailure(e.message, innerCause);
  }
  if (e instanceof AppDatabaseException) {
    return new DatabaseFailure(e.message, innerCause);
  }

  return new UnknownFailure(e.message, innerCause);
}

interface SafeRepositoryCallOptions<TResult> {
  call: () => Promise<TResult>;
  logger: Logger;
  /** Fallback when the remote/network throws (e.g. serve local cache). */
  onNetworkError?: (cause: NetworkException) => Promise<Result<TResult>>;
  /** Fallback when the server returns an error status. */
  onServerError?: (cause: ServerException) => Promise<Result<TResult>>;
}

/** Wrap a repository method and return a Result, with optional per-error fallbacks. */
export async function safeRepositoryCall<TResult>({
  call,
  logger,
  onNetworkError,
  onServerError,
}: SafeRepositoryCallOptions<TResult>): Promise<Result<TResult>> {
  try {
    const value = await call();
    return { ok: true, value };
  } catch (e) {
    if (e instanceof NetworkException) {
      if (onNetworkError) return onNetworkError(e);
      return failed(mapExceptionToFailure(e));
    }
    if (e instanceof ServerException) {
      if (onServerError) return onServerError(e);
      return failed(mapExceptionToFailure(e));
    }
    if (
      e instanceof AppDatabaseException ||
      e instanceof AuthException ||
      e instanceof AppException
    ) {
      return failed(mapExceptionToFailure(e));
    }
    logger.error('Unexpected repository error', e);
    return failed(new UnknownFailure());
  }
}

/** Convenience: a Result representing a cache miss that should surface the upstream failure. */
export function forwardNetworkFailure(cause: AppException): Failed {
  return failed(mapExceptionToFailure(cause));
}

/** Used by the cache fallback: chain a CacheFailure on top of an upstream
 *  failure. Marked Critical because the cache was the last resort and it
 *  failed — there is nothing left to show the user. */
export function chainedCacheFailure(
  dbError: AppDatabaseException,
  upstream: Failure,
): Failed {
  return failed(new CacheFailure(dbError.message, upstream, FailureSeverity.Critical));
}
