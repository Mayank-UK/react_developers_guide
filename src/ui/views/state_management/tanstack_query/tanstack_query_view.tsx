import { useState } from 'react';
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { SectionWrapper } from '../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../components/content-group-wrapper';
import { TextBlock } from '../../../components/text-block';
import { CodeBlock } from '../../../components/code-block';
import { Example } from '../../../components/example';

/**
 * TanStackQueryView — managing SERVER state, not UI state.
 *
 * The first three screens held state the app OWNS. TanStack Query holds state
 * the app BORROWS from a server: a list of posts, a user profile, search
 * results. That data is inherently awkward — it can be loading, it can fail,
 * it can go stale, someone else can change it. Writing that by hand (useEffect +
 * fetch + local loading/error flags + manual refetch) is repetitive and buggy.
 * TanStack Query takes a query key + an async function and gives you back
 * isLoading / isError / data, plus caching, retries, background refetching, and
 * invalidation — for free.
 *
 * It is NOT a replacement for useState/Zustand. Use them for client/UI state;
 * use TanStack Query for server state. They compose. Same todo app below, but
 * the todos live "on a server" (a fake async API): every read is a query, every
 * change is a mutation that invalidates the list so it refetches.
 *
 * NOTE on providers: in a real app the <QueryClientProvider> lives at the root
 * (main.tsx), so one cache is shared app-wide. Here it is scoped to this demo.
 */

type Todo = { id: number; text: string; done: boolean };

/* -------------------------------------------------------------------------- */
/* Fake async "server" — an in-memory store with latency and a failure switch.*/
/* -------------------------------------------------------------------------- */

let nextId = 4;
const db: Todo[] = [
    { id: 1, text: 'Fetch the list with useQuery', done: true },
    { id: 2, text: 'Add one with useMutation', done: false },
    { id: 3, text: 'Invalidate to refetch', done: false },
];

const latency = () => new Promise((r) => setTimeout(r, 450));

// Flip to true to see the error state + automatic retry in action.
let failRequests = false;
const setFailRequests = (v: boolean) => {
    failRequests = v;
};

async function fetchTodos(): Promise<Todo[]> {
    await latency();
    if (failRequests) throw new Error('Network error: server unreachable');
    return [...db];
}
async function createTodo(text: string): Promise<void> {
    await latency();
    if (failRequests) throw new Error('Network error');
    db.push({ id: nextId++, text, done: false });
}
async function toggleTodo(id: number): Promise<void> {
    await latency();
    if (failRequests) throw new Error('Network error');
    const t = db.find((x) => x.id === id);
    if (t) t.done = !t.done;
}
async function deleteTodo(id: number): Promise<void> {
    await latency();
    if (failRequests) throw new Error('Network error');
    const i = db.findIndex((x) => x.id === id);
    if (i >= 0) db.splice(i, 1);
}

const TODOS_KEY = ['todos'] as const;

export default function TanStackQueryView() {
    return (
        <div className="flex flex-col gap-md">
            <ServerStateSection />
            <DemoSection />
            <CacheSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Server vs client state                                                  */
/* -------------------------------------------------------------------------- */

function ServerStateSection() {
    return (
        <SectionWrapper title="Server state is a different problem">
            <ContentGroupWrapper title="Why this isn't just another useState">
                <TextBlock>
                    {`Server data has properties local state doesn't: it's asynchronous
(loading matters), it can fail (errors matter), and it goes stale (the server
can change it while you're not looking). TanStack Query models all of that. You
declare a query — a unique key plus a function that fetches the data — and it
hands you { data, isLoading, isError, error, refetch, isFetching }. Behind the
scenes it caches by key, dedupes concurrent requests, retries failures, and can
refetch in the background on window focus or after a mutation invalidates the
key. Mutations (writes) use useMutation; on success you invalidate the list's key
so it refetches the fresh server truth.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// read
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});

// write
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
});
mutation.mutate('Learn caching');`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Live demo — scoped QueryClientProvider                                  */
/* -------------------------------------------------------------------------- */

function DemoSection() {
    // A fresh client per mount keeps the demo's cache isolated from the app.
    const [client] = useState(() => new QueryClient());
    return (
        <SectionWrapper title="Todos from a server — loading, error, refetch">
            <ContentGroupWrapper title="Watch the states the other screens never had">
                <TextBlock>
                    {`Flip the "fail requests" switch to see the error path (TanStack
Query retries automatically, then surfaces isError). Add a todo to watch the
mutation run and then invalidate → refetch the list. The "loading…" and the
refetch button are states the useState/Zustand/Redux demos didn't need — because
those held local data. This one is borrowing from a server.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Same todos — but every read is a query, every write a mutation">
                <QueryClientProvider client={client}>
                    <QueryTodoDemo />
                </QueryClientProvider>
            </Example>
        </SectionWrapper>
    );
}

function QueryTodoDemo() {
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: TODOS_KEY, queryFn: fetchTodos });
    const [draft, setDraft] = useState('');
    const [failing, setFailing] = useState(false);

    /** Invalidate the list key after a write so TanStack refetches fresh truth. */
    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    };
    const addMutation = useMutation({
        mutationFn: createTodo,
    });
    const toggleMutation = useMutation({
        mutationFn: toggleTodo,
    });
    const removeMutation = useMutation({
        mutationFn: deleteTodo,
    });

    const addTodo = () => {
        const text = draft.trim();
        if (!text) return;
        addMutation.mutate(text, {
            onSuccess: invalidate,
        });
        setDraft('');
    };

    const todos = query.data ?? [];
    const remaining = todos.filter((t) => !t.done).length;

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-xs">
                <button
                    type="button"
                    onClick={() => {
                        void query.refetch();
                    }}
                    className="rounded-md border border-outline px-sm py-xs text-caption text-on-surface-variant hover:bg-surface-variant"
                >
                    ↻ refetch
                </button>
                <label className="flex cursor-pointer items-center gap-xs text-caption text-on-surface-variant">
                    <input
                        type="checkbox"
                        checked={failing}
                        onChange={(e) => {
                            setFailing(e.target.checked);
                            setFailRequests(e.target.checked);
                            if (e.target.checked) void query.refetch();
                        }}
                        className="accent-[var(--color-primary)]"
                    />
                    fail requests
                </label>
                {query.isFetching && (
                    <span
                        className="text-caption text-on-surface-variant"
                        data-testid="fetching"
                    >
                        fetching…
                    </span>
                )}
            </div>

            <div className="flex gap-xs">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Add a todo…"
                    aria-label="Add a todo"
                    className="flex-1 rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                />
                <button
                    type="button"
                    onClick={addTodo}
                    disabled={addMutation.isPending}
                    className="rounded-md px-md py-xs text-body-sm text-on-primary shadow-button-card hover:shadow-button-card-hover disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    {addMutation.isPending ? '…' : 'Add'}
                </button>
            </div>

            {query.isLoading && (
                <p
                    className="rounded-md border border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant"
                    data-testid="loading"
                >
                    Loading todos from the server…
                </p>
            )}
            {query.isError && (
                <p
                    className="rounded-md border border-outline bg-surface-variant px-md py-md text-body-sm text-on-surface"
                    data-testid="error"
                >
                    ⚠ {query.error instanceof Error
                        ? query.error.message
                        : 'Failed to load'}
                </p>
            )}
            {query.isSuccess && todos.length === 0 && (
                <p className="rounded-md border border-dashed border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant">
                    Nothing yet — add one above.
                </p>
            )}
            {query.isSuccess && todos.length > 0 && (
                <ul className="flex flex-col gap-xs" data-testid="todo-list">
                    {todos.map((t) => (
                        <li
                            key={t.id}
                            className="flex items-center gap-sm rounded-md border border-outline bg-surface px-md py-xs"
                        >
                            <label className="flex flex-1 cursor-pointer items-center gap-sm text-body-sm text-on-surface">
                                <input
                                    type="checkbox"
                                    checked={t.done}
                                    onChange={() =>
                                        toggleMutation.mutate(t.id, {
                                            onSuccess: invalidate,
                                        })
                                    }
                                    className="accent-[var(--color-primary)]"
                                />
                                <span
                                    className={
                                        t.done
                                            ? 'line-through text-on-surface-variant'
                                            : ''
                                    }
                                >
                                    {t.text}
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    removeMutation.mutate(t.id, {
                                        onSuccess: invalidate,
                                    })
                                }
                                aria-label={`Remove ${t.text}`}
                                className="rounded-sm px-xs text-caption text-on-surface-variant hover:bg-black/5 hover:text-on-surface"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <p className="text-caption text-on-surface-variant">
                {query.isSuccess
                    ? `${remaining} remaining · ${todos.length} total`
                    : '—'}
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The cache — keyed, shared, invalidated                                  */
/* -------------------------------------------------------------------------- */

function CacheSection() {
    return (
        <SectionWrapper title="The cache is the point">
            <ContentGroupWrapper title="One key = one source of server truth">
                <TextBlock>
                    {`Every query is identified by its key (here ['todos']). The first
component to need it fetches; a second component using the same key gets the
cached value instantly and a background refresh. Navigate away and back and the
stale data shows immediately while it refetches — no loading flash. Writes
invalidate the key, so every component watching it stays consistent. This is why
TanStack Query replaces hand-rolled fetch logic: the key is the contract, and
the cache manages freshness, dedup, and retries around it.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            In a real app these live where the data layer is wired (e.g. next to
                            the repository/use-case), and the provider sits at the root.
                        </span>
                    }
                    code={`// same key anywhere → same cache entry, deduped + shared
useQuery({ queryKey: ['todos'], queryFn: fetchTodos });

// tune freshness + retries per query (or globally on the QueryClient)
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 10_000,   // fresh for 10s — no refetch on refocus/remount
  retry: 2,            // retry failures twice before isError
});

// after a write, invalidate so readers refetch the server truth
queryClient.invalidateQueries({ queryKey: ['todos'] });`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
