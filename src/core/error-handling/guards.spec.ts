import { describe, expect, it } from 'vitest';
import {
  NetworkException,
  ServerException,
  AppDatabaseException,
} from './exceptions';
import {
  NetworkFailure,
  ServerFailure,
  DatabaseFailure,
  FailureSeverity,
} from './failures';
import { mapExceptionToFailure } from './guards';

describe('mapExceptionToFailure', () => {
  it('maps a network exception to a critical network failure', () => {
    const failure = mapExceptionToFailure(new NetworkException('offline'));
    expect(failure).toBeInstanceOf(NetworkFailure);
    expect(failure.severity).toBe(FailureSeverity.Critical);
    expect(failure.kind).toBe('network');
    expect(failure.message).toBe('offline');
  });

  it('maps a server exception to a critical server failure', () => {
    const failure = mapExceptionToFailure(new ServerException('500'));
    expect(failure).toBeInstanceOf(ServerFailure);
    expect(failure.severity).toBe(FailureSeverity.Critical);
  });

  it('maps a database exception to a critical database failure', () => {
    const failure = mapExceptionToFailure(new AppDatabaseException('read failed'));
    expect(failure).toBeInstanceOf(DatabaseFailure);
    expect(failure.severity).toBe(FailureSeverity.Critical);
  });

  it('chains nested causes into a single failure trail', () => {
    // Mimics: cache read failed, caused by a network failure underneath.
    const network = new NetworkException('no internet');
    const dbError = new AppDatabaseException('cache read failed', {
      cause: network,
    });

    const failure = mapExceptionToFailure(dbError);

    // The top-level failure joins its cause's message with its own.
    expect(failure.message).toBe('no internet + cache read failed');
    // ...and its cause is the mapped network failure.
    expect(failure.cause).toBeInstanceOf(NetworkFailure);
    expect(failure.cause?.message).toBe('no internet');

    // The chain trace lists both, oldest-first.
    expect(failure.chain).toContain('caused by: no internet');
    expect(failure.chain).toContain('cache read failed');
  });
});
