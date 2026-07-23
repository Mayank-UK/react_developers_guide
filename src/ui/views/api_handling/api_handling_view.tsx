import { useEffect, useRef, useState } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import { ShowError } from '../../components/show-error';
import { FailureSnackbarStack } from '../../components/failure-snackbar';
import { useFailureSnackbar } from '../../hooks/use-failure-snackbar';
import { usePosts, isBlocking } from '../../hooks/use-posts';
import { container } from '../../../core/container';
import {
    API_SCENARIOS,
    ApiScenario,
} from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';
import type { Failure } from '../../../core/error-handling/failures';

/**
 * ApiHandlingView — how data reaches the UI in this app.
 *
 * Fetching "posts" looks like one call in the component, but it travels a
 * deliberate pipeline: view-model hook → use case → repository → remote data
 * source → HTTP client → REST API, and the answer comes back as DTOs → domain
 * models → a Result. Every layer has one job and a narrow interface, so any
 * layer can be swapped (fake vs real API, axios vs fetch, IndexedDB vs anything)
 * without the layers above or below noticing.
 *
 * This is the same shape as the Flutter guide; the React-specific differences
 * (no codegen, plain interfaces for DTOs, a useReducer hook instead of a Bloc,
 * axios instead of dio) are called out inline. The whole pipeline already
 * exists in src/domain + src/data — this screen walks through it layer by layer
 * and then drives it live.
 */
export default function ApiHandlingView() {
    return (
        <div className="flex flex-col gap-md">
            <PipelineSection />
            <DomainSection />
            <DtoSection />
            <RemoteSection />
            <ResultSection />
            <LiveDemoSection />
            <ConsumeSection />
            <ReactVsFlutterSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. The whole pipeline at a glance                                          */
/* -------------------------------------------------------------------------- */

function PipelineSection() {
    return (
        <SectionWrapper title="The whole pipeline at a glance">
            <ContentGroupWrapper title="Why so many layers for one list of posts">
                <TextBlock>
                    {`A component never talks to the network directly. Between
"the UI wants posts" and "the REST server returns JSON" there is a chain of
single-purpose types, and the chain is the point: each link can be replaced,
tested in isolation, or rerouted (real API ↔ fake, remote ↔ cache) without
touching its neighbours. The UI depends on a contract (an interface), not on
axios, not on JSON, not on a URL. That independence is what makes the feature
maintainable.`}
                </TextBlock>
            </ContentGroupWrapper>
            <CodeBlock
                language="text"
                defaultOpen
                code={`UI  (view + usePosts hook)
        │  execute()
        ▼
GetPostsUseCase              ← domain: orchestration seam (policy goes here)
        │  getPosts()
        ▼
PostRepository (interface)   ← domain: the CONTRACT the UI depends on
        │  implemented by
        ▼
PostRepositoryImpl           ← data: remote-first + cache fallback
   ├──► PostRemoteDataSource ─► HttpClient (axios) ─► REST API /posts
   │        returns PostDTO[]        (interceptors: auth, retry, fail-inject)
   └──► AppDatabase (write-through cache)  ◄── posts saved on every success

        │  maps DTO → Post, wraps in Result<Post[]>
        ▼
Result<Post[]> travels back up unchanged — the UI switches on it`}
            />
            <ContentGroupWrapper title="What each layer is responsible for">
                <TextBlock>
                    {`Use case — one app action ("get posts"). Thin today; the seam
where cross-cutting policy lives (combine sources, enforce a rule, log). Keeps
repositories focused on a single data source.

Repository (interface) — the contract. The UI and use cases depend on this and
nothing concrete. Swapping the implementation is invisible to them.

Repository implementation — orchestrates sources: try remote, write-through to
the local cache, and fall back to that cache when the network fails (offline-
first). This is where "where does the data come from?" is answered.

Remote data source + HTTP client — the only place that knows about the network.
The data source returns DTOs and upgrades raw engine errors into typed
exceptions; the HTTP client owns the axios instance, base URL, and interceptors.

DTO — the wire/on-disk shape. It (de)serializes JSON and maps to the domain
model. DTOs never leak past the repository.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Domain layer — the contract                                             */
/* -------------------------------------------------------------------------- */

function DomainSection() {
    return (
        <SectionWrapper title="Domain layer — the contract the UI depends on">
            <ContentGroupWrapper title="A repository is just an interface">
                <TextBlock>
                    {`The domain layer has no imports from axios, IndexedDB, or any
data-source concrete class. It declares what "reading posts" means as a plain
interface. The use case depends on this interface; the UI depends on the use
case. Neither knows or cares that the implementation hits a REST API behind a
cache. That is the dependency rule: dependencies point inward, toward the
domain, which depends on nothing.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/domain/repositories/post-repository.ts
import type { Post } from '../models/post';
import type { Result } from '../../core/result';

export interface PostRepository {
  getPosts(): Promise<Result<Post[]>>;
}

// src/domain/usecases/get-posts-usecase.ts
export class GetPostsUseCase {
  constructor(private readonly repository: PostRepository) {}

  execute(): Promise<Result<Post[]>> {
    return this.repository.getPosts();
  }
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Why a use case when it just delegates">
                <TextBlock>
                    {`It is a one-liner today, but the boundary matters. The use case
is where you later add "get posts, but only the published ones, and log the
call" without bloating the repository or leaking that rule into the UI. The
repository stays single-source; the use case owns the app's policy for that
action. This mirrors the Flutter guide's GetPostsUseCase exactly.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. DTOs — the wire shape                                                   */
/* -------------------------------------------------------------------------- */

function DtoSection() {
    return (
        <SectionWrapper title="DTOs — the shape on the wire, not in the app">
            <ContentGroupWrapper title="DTO ≠ domain model, on purpose">
                <TextBlock>
                    {`The JSON the API returns is not the object the rest of the app
works with. A DTO (Data Transfer Object) is the raw transport shape — it can
change when the API changes, carry fields the app doesn't care about, and need
coercion (numbers that arrive as strings, missing fields). The DTO owns that
mess: it deserializes JSON into something trustworthy, and maps to the clean
domain model one layer up. If the API renames a field, you fix one mapper, not
every screen.

Note (React vs Flutter): in Dart a DTO is a runtime class with a fromJson
factory. In TypeScript types are erased at runtime, so a DTO is a plain
interface plus pure conversion functions — no class needed.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/remote/dtos/post-dto.ts
export interface PostDTO {
  id: number;
  title: string;
  body: string;
}

// JSON → DTO (coerce everything; never trust the wire)
export function postDtoFromJson(json: Record<string, unknown>): PostDTO {
  return {
    id: Number(json.id),
    title: String(json.title ?? ''),
    body: String(json.body ?? ''),
  };
}

// DTO → domain model (the mapping happens here, once, in the data layer)
export function toPost(dto: PostDTO): Post {
  return { id: dto.id, title: dto.title, body: dto.body };
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Remote data source + HTTP client                                        */
/* -------------------------------------------------------------------------- */

function RemoteSection() {
    return (
        <SectionWrapper title="Remote data source + HTTP client — the only place that knows the network">
            <ContentGroupWrapper title="The HTTP client owns the axios instance and interceptors">
                <TextBlock>
                    {`createHttpClient builds one configured axios instance: a base URL,
a timeout, and a chain of interceptors that run on every request/response —
attach the auth token, retry transient failures, and (in dev) inject simulated
failures. The data source never constructs axios; it receives the instance, so
the wiring lives in one debuggable place. This mirrors the Flutter guide's
dio(...) provider.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/remote/http-client.ts
export function createHttpClient(deps: HttpClientDeps): AxiosInstance {
  const instance = axios.create({
    baseURL: deps.config.baseUrl,
    timeout: 10_000,
  });
  // order matters: auth → retry → (dev) failure-injection → logging
  new AuthTokenInterceptor(deps.getToken).attach(instance);
  new RetryInterceptor().attach(instance);
  if (deps.config.environment === 'dev') {
    new FailureInjectionInterceptor(deps.getScenario)
      .attach(instance.interceptors.request);
  }
  return instance;
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="The data source returns DTOs and upgrades errors">
                <TextBlock>
                    {`The remote data source calls the endpoint, checks the response,
and deserializes into DTOs. Crucially it wraps the work in guardedApiCall so
that any raw engine error (axios error, JSON parse, TypeError "failed to fetch")
is upgraded into a typed AppException before it leaves the data layer. The
repository above never sees an axios error — only typed exceptions it can branch
on. Non-2xx responses become a ServerException.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/remote/post-remote-data-source.ts
getPosts(): Promise<PostDTO[]> {
  return guardedApiCall(async () => {
    const response = await this.http.get<unknown>('/posts');
    if (response.status < 200 || response.status >= 300) {
      throw responseToException(response); // → ServerException / AuthException
    }
    if (!Array.isArray(response.data)) {
      throw new ServerException('Expected a list of posts');
    }
    return response.data.map((item) => postDtoFromJson(item));
  });
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. The Result type — failures are values, not thrown across layers         */
/* -------------------------------------------------------------------------- */

function ResultSection() {
    return (
        <SectionWrapper title="The Result type — failures are values, not exceptions">
            <ContentGroupWrapper title="Why the repository returns Result instead of throwing">
                <TextBlock>
                    {`Expected failures (no network, server 500, empty cache) are not
bugs — they're outcomes the UI must handle. So the repository does not throw
them at the UI; it returns a Result, a discriminated union: Success carries the
value (and an optional non-blocking warning), Failed carries the blocking
Failure. The component switches on result.ok with full type narrowing. Only
truly unexpected errors throw; everything anticipated is a value travelling up
the pipeline.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/result.ts
export type Result<T> = Success<T> | Failed;

export interface Success<T> {
  ok: true;
  value: T;
  warning?: Failure;   // non-blocking, e.g. "showed stale cache"
}
export interface Failed {
  ok: false;
  failure: Failure;    // blocking
}

// caller narrows cleanly:
const result = await getPostsUseCase.execute();
if (result.ok) {
  setPosts(result.value);          // result.value is Post[]
  if (result.warning) warn(result.warning);
} else {
  setError(result.failure);        // result.failure is narrowed
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Live — drive the real pipeline                                          */
/* -------------------------------------------------------------------------- */

const SCENARIO_LABEL: Record<ApiScenario, string> = {
    [ApiScenario.Success]: 'success',
    [ApiScenario.NetworkError]: 'network error',
    [ApiScenario.Timeout]: 'timeout',
    [ApiScenario.ServerError]: 'server error (500)',
    [ApiScenario.InvalidJson]: 'invalid JSON',
};

function LiveDemoSection() {
    return (
        <SectionWrapper title="Live — fetch posts through the real pipeline">
            <ContentGroupWrapper title="Watch loading, success, and the offline-first fallback">
                <TextBlock>
                    {`This is not a mock — it is the actual pipeline. The demo calls
the same usePosts hook the home screen uses, which calls GetPostsUseCase →
PostRepositoryImpl → the remote data source. In dev the container wires in a
FakeApiService (with latency) so you can steer the outcome:

• success — posts arrive and are written to the cache.
• network error / server error — the remote fails, so the repository falls back
  to the cache. Because the previous success cached the posts, you still see
  them, plus a non-blocking warning toast. That is the offline-first strategy
  in action.
• flip "treat cache as empty" too, and a network error becomes a cache miss → a
  blocking full-screen error (Retry re-runs the pipeline).`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Real usePosts → use case → repository → remote/cache">
                <PostsDemo />
            </Example>
        </SectionWrapper>
    );
}

function PostsDemo() {
    const { state, fetch } = usePosts();
    const snackbar = useFailureSnackbar();
    const [scenario, setScenario] = useState<ApiScenario>(
        container.getApiScenario(),
    );
    const [emptyCache, setEmptyCache] = useState(false);
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

    const changeScenario = (next: ApiScenario) => {
        setScenario(next);
        container.setApiScenario(next);
        fetch();
    };

    const toggleEmptyCache = (empty: boolean) => {
        setEmptyCache(empty);
        // Empty cache makes a network/server failure a cache miss (blocking).
        container.setDbScenario(empty ? DbScenario.Empty : DbScenario.Success);
        fetch();
    };

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-xs">
                <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                    API scenario
                    <select
                        value={scenario}
                        onChange={(e) =>
                            changeScenario(e.target.value as ApiScenario)
                        }
                        className="rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    >
                        {API_SCENARIOS.map((s) => (
                            <option key={s} value={s}>
                                {SCENARIO_LABEL[s]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex cursor-pointer items-center gap-xs text-caption text-on-surface-variant">
                    <input
                        type="checkbox"
                        checked={emptyCache}
                        onChange={(e) => toggleEmptyCache(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    treat cache as empty
                </label>
                <button
                    type="button"
                    onClick={() => fetch()}
                    className="rounded-md border border-outline px-sm py-xs text-caption text-on-surface-variant hover:bg-surface-variant"
                >
                    ↻ refetch
                </button>
            </div>

            {state.status === 'loading' && (
                <p
                    className="rounded-md border border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant"
                    data-testid="posts-loading"
                >
                    Loading posts through the pipeline…
                </p>
            )}

            {state.status === 'error' && isBlocking(state.failure) && (
                <div data-testid="posts-error">
                    <ShowError failure={state.failure} onRetry={() => fetch()} />
                </div>
            )}

            {state.status === 'loaded' && (
                <ul className="flex flex-col gap-xs" data-testid="posts-list">
                    {state.posts.map((p) => (
                        <li
                            key={p.id}
                            className="rounded-md border border-outline bg-surface px-md py-sm"
                        >
                            <p className="text-body-sm font-medium text-on-surface">
                                {p.title}
                            </p>
                            <p className="text-caption text-on-surface-variant">
                                {p.body}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-caption text-on-surface-variant">
                {state.status === 'loaded'
                    ? state.warning
                        ? `served ${state.posts.length} posts from cache (remote failed)`
                        : `${state.posts.length} posts from the remote`
                    : '—'}
            </p>

            <FailureSnackbarStack
                entries={snackbar.entries}
                onDismiss={snackbar.dismiss}
            />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. How the UI consumes it                                                  */
/* -------------------------------------------------------------------------- */

function ConsumeSection() {
    return (
        <SectionWrapper title="How the UI consumes it — a hook, not a framework">
            <ContentGroupWrapper title="usePosts is the React analogue of a Flutter Bloc">
                <TextBlock>
                    {`The pipeline produces a Result; the UI still needs loading /
loaded / error states to render. The idiomatic React home for that is a
useReducer exposed as a hook — same states and transitions a Bloc would emit,
no extra library. It drives the use case, holds the state machine, and surfaces
any Failure so the component can branch on severity (blocking ShowError vs
non-blocking snackbar). The component itself stays declarative: it reads state
and renders.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// src/ui/hooks/use-posts.ts (trimmed)
type PostsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; posts: Post[]; warning?: Failure }
  | { status: 'error'; failure: Failure };

export function usePosts(getPostsUseCase = container.getPostsUseCase) {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });

  const fetch = useCallback(() => {
    dispatch({ type: 'fetch' });
    getPostsUseCase.execute().then((result) => {
      if (result.ok) dispatch({ type: 'loaded', posts: result.value,
                                          warning: result.warning });
      else          dispatch({ type: 'error', failure: result.failure });
    });
  }, [getPostsUseCase]);

  useEffect(() => { fetch(); }, [fetch]);   // auto-fetch on mount
  return { state, fetch };
}

// in the component — purely declarative
const { state } = usePosts();
if (state.status === 'loading') return <Loading />;
if (state.status === 'error')   return <ShowError failure={state.failure} />;
return <PostList posts={state.posts} warning={state.warning} />;`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — same architecture, different idioms">
            <ContentGroupWrapper title="Where the standard React way differs">
                <TextBlock>
                    {`The layering is identical to the Flutter guide. What changes is
the plumbing each ecosystem considers standard:

• Dependency injection — Flutter uses get_it + @injectable codegen so
  constructors auto-wire. React has no equivalent standard, so the app uses a
  small hand-rolled service locator (src/core/container.ts) — register once,
  resolve anywhere. (Covered on the Dependency management screen.)
• State machine — Flutter encodes events + states in a Bloc and emits a stream.
  React's standard equivalent is a useReducer exposed as a hook. Same states,
  same transitions, no library. (Redux/Zustand/TanStack Query live on their own
  State management screens for the cases where they're worth it.)
• HTTP client — dio (Flutter) vs axios (React). Same interceptor concept; the
  auth / retry / failure-injection chain maps one-to-one.
• DTOs — Dart uses runtime classes with fromJson/toJson. TypeScript types are
  erased at runtime, so a DTO is an interface plus pure functions.
• Errors — both use a Result return + typed exceptions → failures pipeline; the
  chained-cause + severity model is identical. (Covered on the Exception
  handling screen.)`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
