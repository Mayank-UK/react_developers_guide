import { useCallback, useEffect, useState } from 'react';
import { container } from '../../../core/container';
import { useFailureSnackbar } from '../../hooks/use-failure-snackbar';
import { ApiScenario } from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';
import { Failure } from '../../../core/error-handling/failures';
import type { Post } from '../../../domain/models/post';

/**
 * Exception-handling screen custom hooks — own the PipelineDemo's state + logic.
 * Drives the real GetPostsUseCase, holds the api/db scenario selectors + the
 * running/outcome state machine, seeds the cache once on mount so the fallback
 * paths have data, and surfaces non-blocking warnings via the snackbar.
 *
 * Note: the seed is typed as the domain `Post`, never the data-layer `PostDTO`
 * — a view depends only on domain models (see ARCHITECTURE.md).
 */

export type Outcome =
    | { ok: true; count: number; warning?: Failure }
    | { ok: false; failure: Failure };

/** Posts written straight to the cache on mount so fallback paths have data. */
const SEED_POSTS: Post[] = [
    { id: 1, title: 'Cached post', body: 'Seeded so the fallback can serve it.' },
    { id: 2, title: 'Second cached post', body: 'Also in the local store.' },
];

export interface PipelineDemo {
    api: ApiScenario;
    setApi: (s: ApiScenario) => void;
    db: DbScenario;
    setDb: (s: DbScenario) => void;
    running: boolean;
    outcome: Outcome | null;
    run: (apiScenario: ApiScenario, dbScenario: DbScenario) => Promise<void>;
    snackbar: ReturnType<typeof useFailureSnackbar>;
}

export function usePipelineDemo(): PipelineDemo {
    const useCase = container.getPostsUseCase;
    const snackbar = useFailureSnackbar();
    const [api, setApi] = useState<ApiScenario>(ApiScenario.Success);
    const [db, setDb] = useState<DbScenario>(DbScenario.Success);
    const [running, setRunning] = useState(false);
    const [outcome, setOutcome] = useState<Outcome | null>(null);

    const run = useCallback(
        async (apiScenario: ApiScenario, dbScenario: DbScenario) => {
            setRunning(true);
            container.setApiScenario(apiScenario);
            container.setDbScenario(dbScenario);
            const result = await useCase.execute();
            if (result.ok) {
                setOutcome({
                    ok: true,
                    count: result.value.length,
                    warning: result.warning,
                });
                if (result.warning) snackbar.show(result.warning);
            } else {
                setOutcome({ ok: false, failure: result.failure });
            }
            setRunning(false);
        },
        [useCase, snackbar],
    );

    // Seed the cache once on mount (a cheap direct DB write, not a full remote
    // round-trip) so the fallback paths have data to serve straight away.
    useEffect(() => {
        container.setApiScenario(ApiScenario.Success);
        container.setDbScenario(DbScenario.Success);
        void container.appDatabase.insertPosts(SEED_POSTS).then(
            () => setOutcome({ ok: true, count: SEED_POSTS.length }),
            () => setOutcome({ ok: true, count: 0 }),
        );
    }, []);

    return { api, setApi, db, setDb, running, outcome, run, snackbar };
}
