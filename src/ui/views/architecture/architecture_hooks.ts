import { useEffect, useState } from 'react';

/**
 * Architecture screen custom hooks — own the state + logic for the two live
 * demos so the view components stay declarative.
 *   - useLayerExplorer: which layer card is selected.
 *   - useRequestTracer: the animated GetPosts flow, incl. the inject-failure
 *     branch that inserts the extra exception→Failure boundary.
 */

export interface TraceStep {
    layer: string;
    title: string;
    file: string;
    detail: string;
}

const SUCCESS_STEPS: TraceStep[] = [
    {
        layer: 'ui',
        title: 'User action → hook',
        file: 'ui/hooks/use-posts.ts',
        detail: 'A component calls fetch(). The hook dispatches { type: "fetch" } and calls the use case.',
    },
    {
        layer: 'domain',
        title: 'Use case',
        file: 'domain/usecases/get-posts-usecase.ts',
        detail: 'GetPostsUseCase.execute() delegates to the repository contract — a one-liner today, the seam for policy later.',
    },
    {
        layer: 'domain',
        title: 'Repository contract',
        file: 'domain/repositories/post-repository.ts',
        detail: 'The UI depends on this interface (getPosts(): Promise<Result<Post[]>>), not on any implementation.',
    },
    {
        layer: 'data',
        title: 'Repository implementation',
        file: 'data/repositories/post-repository-impl.ts',
        detail: 'PostRepositoryImpl orchestrates: fetch remote, write-through to cache, fall back to cache on failure.',
    },
    {
        layer: 'data',
        title: 'Remote + local sources',
        file: 'data/remote + data/local',
        detail: 'remote.getPosts() (axios) and local.insertPosts() (Dexie/IndexedDB) — the only place frameworks appear.',
    },
    {
        layer: 'core',
        title: 'Result returned up the stack',
        file: 'core/result.ts',
        detail: 'safeRepositoryCall wraps the call; success({ ok: true, value }) travels back up — never a thrown exception.',
    },
    {
        layer: 'ui',
        title: 'Render',
        file: 'ui/hooks/use-posts.ts → components',
        detail: 'The hook dispatches { type: "loaded", posts }; the component renders <PostList/>. Done.',
    },
];

const FAILURE_INSERT: TraceStep = {
    layer: 'core',
    title: 'Exception → Failure at the boundary',
    file: 'core/error-handling/guards.ts',
    detail: 'A NetworkException is caught by safeRepositoryCall and mapped to a Failure with a severity. The UI branches: blocking <ShowError/> or non-blocking snackbar — no try/catch in the component.',
};

/** Selects the failure path's extra "remote throws" + boundary step. */
const FAILURE_THROW: TraceStep = {
    layer: 'data',
    title: 'Remote throws',
    file: 'data/remote/post-remote-data-source.ts',
    detail: 'The remote call rejects with a NetworkException instead of returning posts.',
};

export interface LayerExplorer {
    selected: string;
    select: (key: string) => void;
}

export function useLayerExplorer(initial = 'domain'): LayerExplorer {
    const [selected, setSelected] = useState(initial);
    return { selected, select: setSelected };
}

export interface RequestTracer {
    injectFailure: boolean;
    toggleInjectFailure: (on: boolean) => void;
    active: number; // -1 = idle
    running: boolean;
    steps: TraceStep[];
    run: () => void;
    reset: () => void;
}

export function useRequestTracer(): RequestTracer {
    const [injectFailure, setInjectFailure] = useState(false);
    const [active, setActive] = useState(-1); // -1 = idle
    const [running, setRunning] = useState(false);

    // Injecting the failure swaps in the "remote throws" + boundary steps,
    // replacing the success-path remote/local + Result steps.
    const steps = injectFailure
        ? [
              ...SUCCESS_STEPS.slice(0, 4),
              FAILURE_THROW,
              FAILURE_INSERT,
              ...SUCCESS_STEPS.slice(6),
          ]
        : SUCCESS_STEPS;

    useEffect(() => {
        if (!running) return;
        if (active >= steps.length - 1) {
            // Animation reached the final step — halt. This is event-driven
            // termination inside a timer-driven effect, not a render cascade.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRunning(false);
            return;
        }
        const id = window.setTimeout(() => setActive((a) => a + 1), 850);
        return () => window.clearTimeout(id);
    }, [running, active, steps.length]);

    const run = () => {
        setActive(0);
        setRunning(true);
    };

    const reset = () => {
        setRunning(false);
        setActive(-1);
    };

    const toggleInjectFailure = (on: boolean) => {
        setInjectFailure(on);
        reset();
    };

    return {
        injectFailure,
        toggleInjectFailure,
        active,
        running,
        steps,
        run,
        reset,
    };
}
