import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { Post } from '../../domain/models/post';
import type { Failure } from '../../core/error-handling/failures';
import { FailureSeverity } from '../../core/error-handling/failures';
import type { GetPostsUseCase } from '../../domain/usecases/get-posts-usecase';
import { container } from '../../core/container';

/**
 * usePosts — the React analogue of the Flutter `PostsBloc`. It owns the
 * `idle / loading / loaded(warning?) / error(failure)` state machine, drives the
 * `GetPostsUseCase`, and surfaces the resulting `Failure` so the UI can branch
 * on severity (blocking ShowError vs non-blocking snackbar).
 *
 * Note (React vs Flutter): Flutter encodes events + states in Bloc classes and
 * emits stream states. The idiomatic React equivalent is a `useReducer` store
 * exposed via a hook — same states, same transitions, no extra library.
 * (Redux/Zustand/TanStack Query are demonstrated on their own dedicated screens.)
 */

type PostsState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'loaded'; posts: Post[]; warning?: Failure }
    | { status: 'error'; failure: Failure };

type PostsAction =
    | { type: 'fetch' }
    | { type: 'loaded'; posts: Post[]; warning?: Failure }
    | { type: 'error'; failure: Failure };

function reducer(_state: PostsState, action: PostsAction): PostsState {
    switch (action.type) {
        case 'fetch':
            return { status: 'loading' };
        case 'loaded':
            return {
                status: 'loaded',
                posts: action.posts,
                warning: action.warning,
            };
        case 'error':
            return { status: 'error', failure: action.failure };
    }
}

export interface UsePostsResult {
    state: PostsState;
    fetch: () => void;
}

export function usePosts(
    getPostsUseCase: GetPostsUseCase = container.getPostsUseCase,
): UsePostsResult {
    const [state, dispatch] = useReducer(reducer, { status: 'idle' });
    // Holds the AbortController for the most recent fetch so a new `fetch()`
    // call can abort the previous one before kicking off its own.
    const currentAbort = useRef<AbortController | null>(null);

    const fetch = useCallback(() => {
        // Abort the previous in-flight fetch so a slower stale request can't
        // overwrite the result of a newer one (e.g. when the user refetches or
        // the scenario changes before the first resolves). One controller per
        // fetch; the signal is checked after the await — the underlying data
        // path (usecase → repository → http-client) does not thread an
        // AbortSignal to axios, so an outstanding network call is not truly
        // cancelled at the transport layer; we only suppress its state-write.
        if (currentAbort.current) {
            currentAbort.current.abort();
        }
        const controller = new AbortController();
        currentAbort.current = controller;
        void (async () => {
            dispatch({ type: 'fetch' });
            let result;
            try {
                result = await getPostsUseCase.execute();
            } catch (e) {
                if (controller.signal.aborted) return;
                throw e;
            }
            // A newer fetch (or unmount) aborted this controller while the
            // request was in flight — drop the stale result.
            if (controller.signal.aborted) return;
            if (result.ok) {
                dispatch({
                    type: 'loaded',
                    posts: result.value,
                    warning: result.warning,
                });
            } else {
                dispatch({ type: 'error', failure: result.failure });
            }
        })();
        return () => {
            controller.abort();
        };
    }, [getPostsUseCase]);

    useEffect(() => {
        const cleanup = fetch();
        return cleanup;
    }, [fetch]);

    return useMemo(() => ({ state, fetch }), [state, fetch]);
}

/** True when a failure should block the whole screen (critical). */
export function isBlocking(failure: Failure): boolean {
    return failure.severity === FailureSeverity.Critical;
}
