import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFailureSnackbar } from './use-failure-snackbar';
import { AuthFailure } from '../../core/error-handling/failures';

/**
 * Behavior spec for the non-blocking snackbar queue. Covers the oldest-dropped
 * cap added so toasts cannot stack indefinitely.
 */
describe('useFailureSnackbar', () => {
    const warn = (message: string) => new AuthFailure(message);

    it('caps visible entries and drops the oldest when a new one arrives', () => {
        const { result } = renderHook(() => useFailureSnackbar());

        act(() => {
            result.current.show(warn('first'));
            result.current.show(warn('second'));
            result.current.show(warn('third'));
            result.current.show(warn('fourth'));
        });

        // The cap is 3; the oldest ('first') is dropped, newest three remain.
        expect(result.current.entries).toHaveLength(3);
        expect(
            result.current.entries.map((e) => e.failure.message),
        ).toEqual(['second', 'third', 'fourth']);
    });

    it('dismiss removes a specific entry by id', () => {
        const { result } = renderHook(() => useFailureSnackbar());

        act(() => {
            result.current.show(warn('one'));
            result.current.show(warn('two'));
        });
        const firstId = result.current.entries[0]!.id;

        act(() => {
            result.current.dismiss(firstId);
        });

        expect(result.current.entries).toHaveLength(1);
        expect(result.current.entries[0]!.failure.message).toBe('two');
    });
});
