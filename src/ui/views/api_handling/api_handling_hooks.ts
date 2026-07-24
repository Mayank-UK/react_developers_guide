import { useCallback, useEffect, useRef, useState } from 'react';
import { usePosts } from '../../hooks/use-posts';
import { useFailureSnackbar } from '../../hooks/use-failure-snackbar';
import { container } from '../../../core/container';
import { type ApiScenario } from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';
import type { Failure } from '../../../core/error-handling/failures';

/**
 * useApiHandlingDemo — the custom hook behind the API-handling screen's live demo.
 *
 * Mirrors the per-screen view-model hooks used elsewhere (home, ui-hub): it owns
 * the demo's state + orchestration so `PostsDemo` stays a pure, declarative
 * render. Specifically it owns:
 *   - the `usePosts` state machine (loading / loaded(warning?) / error),
 *   - the non-blocking warning snackbar (surfaced once per distinct warning),
 *   - the API scenario, cache-empty, and cache-read-error controls, and
 *   - the fake-vs-live data-source toggle.
 *
 * All controls mutate the live container scenario/impl holders, then refetch.
 */
export type DataSourceMode = 'fake' | 'live';

export const DATA_SOURCE_OPTIONS: readonly DataSourceMode[] = ['fake', 'live'];

export const DATA_SOURCE_LABEL: Record<DataSourceMode, string> = {
    fake: 'fake (canned)',
    live: 'live (jsonplaceholder)',
};

/**
 * The cache behaves as a single `DbScenario`, but the UI exposes two orthogonal
 * switches (empty / read-error). Resolve them to one value, read-error winning:
 * a read error is the only way to reach the chained CacheFailure path.
 */
function effectiveDbScenario(empty: boolean, readError: boolean): DbScenario {
    if (readError) return DbScenario.ReadError;
    if (empty) return DbScenario.Empty;
    return DbScenario.Success;
}

export interface ApiHandlingDemo {
    state: ReturnType<typeof usePosts>['state'];
    /** Re-run the pipeline with the current settings. */
    refetch: () => void;
    scenario: ApiScenario;
    changeScenario: (next: ApiScenario) => void;
    emptyCache: boolean;
    toggleEmptyCache: (empty: boolean) => void;
    cacheReadError: boolean;
    toggleCacheReadError: (on: boolean) => void;
    dataSource: DataSourceMode;
    changeDataSource: (next: DataSourceMode) => void;
    snackbar: ReturnType<typeof useFailureSnackbar>;
}

export function useApiHandlingDemo(): ApiHandlingDemo {
    // Resolve the use case on every render. When the data source is swapped,
    // `setUseFakeApi` rebuilds the GetPostsUseCase singleton; the new identity
    // flows in here, changes `usePosts`' dep, and its effect refetches.
    const { state, fetch } = usePosts(container.getPostsUseCase);
    const snackbar = useFailureSnackbar();

    const [scenario, setScenario] = useState<ApiScenario>(
        container.getApiScenario(),
    );
    const [emptyCache, setEmptyCache] = useState(false);
    const [cacheReadError, setCacheReadError] = useState(false);
    const [dataSource, setDataSource] = useState<DataSourceMode>(
        container.getUseFakeApi() ? 'fake' : 'live',
    );
    const shownWarning = useRef<Failure | null>(null);

    // Surface a non-blocking warning exactly once per distinct warning object.
    useEffect(() => {
        if (
            state.status === 'loaded' &&
            state.warning &&
            state.warning !== shownWarning.current
        ) {
            shownWarning.current = state.warning;
            snackbar.show(state.warning);
        }
    }, [state, snackbar]);

    const changeScenario = useCallback(
        (next: ApiScenario) => {
            setScenario(next);
            container.setApiScenario(next);
            fetch();
        },
        [fetch],
    );

    const toggleEmptyCache = useCallback(
        (empty: boolean) => {
            setEmptyCache(empty);
            container.setDbScenario(effectiveDbScenario(empty, cacheReadError));
            fetch();
        },
        [cacheReadError, fetch],
    );

    const toggleCacheReadError = useCallback(
        (on: boolean) => {
            setCacheReadError(on);
            container.setDbScenario(effectiveDbScenario(emptyCache, on));
            fetch();
        },
        [emptyCache, fetch],
    );

    const changeDataSource = useCallback((next: DataSourceMode) => {
        container.setUseFakeApi(next === 'fake');
        setDataSource(next);
        // No manual fetch(): the rebuild changes the GetPostsUseCase identity,
        // so `usePosts` refetches via its dep-driven effect on the next render.
    }, []);

    const refetch = useCallback(() => {
        fetch();
    }, [fetch]);

    return {
        state,
        refetch,
        scenario,
        changeScenario,
        emptyCache,
        toggleEmptyCache,
        cacheReadError,
        toggleCacheReadError,
        dataSource,
        changeDataSource,
        snackbar,
    };
}
