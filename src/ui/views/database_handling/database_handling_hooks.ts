import { useCallback, useEffect, useState } from 'react';
import { container } from '../../../core/container';
import { DbScenario } from '../../../core/scenario/db-scenario';
import { stringify } from '../../../core/error-handling/stringify';
import type { Post } from '../../../domain/models/post';

/**
 * Database-handling screen custom hooks — own the CacheDemo's state + logic so
 * the view stays a pure render. Drives the real container.appDatabase, flips
 * the dev DbScenario, and exposes write/read handlers plus the async cache
 * state machine (idle / reading / read / error).
 *
 * Note: the sample seed is typed as the domain `Post`, never the data-layer
 * `PostDTO` — a view depends only on domain models (see ARCHITECTURE.md).
 */

const SAMPLE_POSTS: Post[] = [
    { id: 1, title: 'Cached post', body: 'Written to the local store.' },
    {
        id: 2,
        title: 'Offline-first',
        body: 'Served when the remote is unreachable.',
    },
];

type CacheState =
    | { status: 'idle' }
    | { status: 'reading' }
    | { status: 'error'; message: string }
    | { status: 'read'; posts: Post[] };

export interface CacheDemo {
    scenario: DbScenario;
    applyScenario: (next: DbScenario) => void;
    cache: CacheState;
    note: string | null;
    write: () => Promise<void>;
    read: () => Promise<void>;
}

export function useCacheDemo(): CacheDemo {
    const db = container.appDatabase;
    const [scenario, setScenario] = useState<DbScenario>(
        container.getDbScenario(),
    );
    const [cache, setCache] = useState<CacheState>({ status: 'idle' });
    const [note, setNote] = useState<string | null>(null);

    const applyScenario = (next: DbScenario) => {
        setScenario(next);
        container.setDbScenario(next);
    };

    const write = useCallback(async () => {
        setNote(null);
        try {
            await db.insertPosts(SAMPLE_POSTS);
            setNote(`Wrote ${SAMPLE_POSTS.length} posts to the cache.`);
        } catch (e) {
            setNote(`AppDatabaseException: ${stringify(e)}`);
        }
    }, [db]);

    const read = useCallback(async () => {
        setNote(null);
        setCache({ status: 'reading' });
        try {
            const posts = await db.getPosts();
            setCache({ status: 'read', posts });
        } catch (e) {
            setCache({ status: 'error', message: stringify(e) });
        }
    }, [db]);

    // Show the cached contents as soon as the demo mounts. "Load on mount" is
    // the canonical effect use; `read` resolves async and setState happens
    // after the awaited work, not as a synchronous render cascade.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void read();
    }, [read]);

    return { scenario, applyScenario, cache, note, write, read };
}
