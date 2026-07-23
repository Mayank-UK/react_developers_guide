import { useCallback, useEffect, useMemo, useReducer } from 'react';
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

    const fetch = useCallback(() => {
        let cancelled = false;
        void (async () => {
            dispatch({ type: 'fetch' });
            const result = await getPostsUseCase.execute();
            // `cancelled` is flipped by the cleanup closure below; the type
            // checker can't see that cross-closure mutation, so it looks always
            // false here. The guard is genuinely needed to avoid dispatching
            // after unmount.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (cancelled) return;
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
            cancelled = true;
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
