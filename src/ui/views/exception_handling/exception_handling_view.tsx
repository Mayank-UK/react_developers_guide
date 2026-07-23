import { useCallback, useEffect, useState } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import { ShowError } from '../../components/show-error';
import { FailureSnackbarStack } from '../../components/failure-snackbar';
import { useFailureSnackbar } from '../../hooks/use-failure-snackbar';
import { container } from '../../../core/container';
import {
    API_SCENARIOS,
    ApiScenario,
} from '../../../core/scenario/api-scenario';
import {
    DB_SCENARIOS,
    DbScenario,
} from '../../../core/scenario/db-scenario';
import {
    Failure,
    FailureSeverity,
} from '../../../core/error-handling/failures';
import type { PostDTO } from '../../../data/remote/dtos/post-dto';

/**
 * ExceptionHandlingView — how errors travel from a flaky network to the right
 * UI treatment.
 *
 * The app splits "something went wrong" into two distinct types so the mess is
 * contained:
 *  - AppException — low-level, technical, thrown inside the data layer (axios
 *    error, IndexedDB failure, bad JSON). Never shown to users.
 *  - Failure      — clean, user-facing states the UI switches on, each carrying
 *    a severity (critical / warning / info) that decides blocking vs
 *    non-blocking presentation.
 *
 * Three "guards" bridge them: upgrade a raw throw into a typed AppException,
 * map that to a Failure (preserving the cause chain), and wrap a repository
 * call into a Result. This screen walks each piece and then drives the whole
 * pipeline live with every failure path.
 */
export default function ExceptionHandlingView() {
    return (
        <div className="flex flex-col gap-md">
            <TwoTypesSection />
            <ExceptionsSection />
            <GuardsSection />
            <FailuresSection />
            <SeveritySection />
            <ChainingSection />
            <LiveDemoSection />
            <ReactVsFlutterSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Two types — AppException vs Failure                                     */
/* -------------------------------------------------------------------------- */

function TwoTypesSection() {
    return (
        <SectionWrapper title="Two types — what broke, and what to tell the user">
            <ContentGroupWrapper title="Separate the technical cause from the user-facing outcome">
                <TextBlock>
                    {`A thrown axios error and a TypeError from fetch are technical
details — useful for debugging, useless (even alarming) to a user. The app keeps
those details inside the data layer as AppExceptions and never lets them cross
upward. What crosses up is a Failure: a small, known set of user-facing states
(network down, server error, auth needed, cache stale) each tagged with a
severity. The UI looks only at the Failure and its severity to decide what to
render — it never inspects an axios response or a Dexie error.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    code={`data layer                           domain / UI
─────────────                         ────────────
raw axios/Dexie/JSON error
        │
        ▼  guardedApiCall
AppException  (NetworkException, …)   ← technical, chained cause, never shown
        │
        ▼  mapExceptionToFailure
                                   Failure (NetworkFailure, …)  ← user-facing
                                   + severity (critical/warning/info)
        │
        ▼  safeRepositoryCall
                                   Result<T>  (Success | Failed)
        │
        ▼
                                   UI switches on failure.severity
                                   critical → blocking <ShowError/>
                                   warning  → non-blocking snackbar`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. AppExceptions                                                           */
/* -------------------------------------------------------------------------- */

function ExceptionsSection() {
    return (
        <SectionWrapper title="AppException — the data-layer vocabulary">
            <ContentGroupWrapper title="A small sealed hierarchy, each carrying its cause">
                <TextBlock>
                    {`AppException is an abstract Error subclass; concrete ones name the
kinds of technical failure the data layer can hit. Each carries an optional
cause — the original error — so the full chain of "what really happened" is
preserved for logs. TimeoutException extends NetworkException because a timeout
is a flavour of network failure. These live strictly in src/data and
src/core/error-handling; the UI never imports them.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/error-handling/exceptions.ts
abstract class AppException extends Error {
  override readonly cause?: AppException | unknown;
}

class NetworkException  extends AppException {}   // no connectivity / fetch failed
class ServerException   extends AppException {}   // non-2xx HTTP response
class TimeoutException  extends NetworkException {} // ECONNABORTED / ETIMEDOUT
class AuthException     extends AppException {}   // 401 / 403
class AppDatabaseException extends AppException {} // IndexedDB / Dexie failure`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The guards — the bridge                                                 */
/* -------------------------------------------------------------------------- */

function GuardsSection() {
    return (
        <SectionWrapper title="The guards — upgrading, mapping, and wrapping">
            <ContentGroupWrapper title="guardedApiCall — turn a raw throw into a typed exception">
                <TextBlock>
                    {`Data sources wrap every call in guardedApiCall. It runs the work
and, on any throw, converts the unknown value into a typed AppException: an
axios error with no response becomes a NetworkException (or TimeoutException for
ECONNABORTED); a 401/403 becomes an AuthException; any other non-2xx response
becomes a ServerException; a TypeError (fetch's "Failed to fetch") becomes a
NetworkException; a SyntaxError becomes a ServerException. If the thrown value
is already an AppException it passes through untouched. The repository above
therefore only ever catches typed exceptions.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/error-handling/guards.ts
export function toAppException(error: unknown): AppException {
  if (error instanceof AppException) return error;       // already typed
  if (axios.isAxiosError(error)) return axiosErrorToException(error);
  if (error instanceof TypeError)   return new NetworkException(error.message, { cause: error });
  if (error instanceof SyntaxError) return new ServerException('Invalid response format', { cause: error });
  return new ServerException('Unexpected error', { cause: error });
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="mapExceptionToFailure — turn an exception into a user-facing Failure">
                <TextBlock>
                    {`The second guard maps a typed exception to its Failure, recursing
into the cause so a chained exception becomes a chained Failure. Each
exception type maps to exactly one Failure type — this is the single place that
decides "a ServerException becomes a ServerFailure (critical)".`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`export function mapExceptionToFailure(e: AppException): Failure {
  const innerCause =
    e.cause instanceof AppException ? mapExceptionToFailure(e.cause) : undefined;
  if (e instanceof TimeoutException) return new NetworkFailure(e.message, innerCause);
  if (e instanceof NetworkException)  return new NetworkFailure(e.message, innerCause);
  if (e instanceof ServerException)   return new ServerFailure(e.message, innerCause);
  if (e instanceof AuthException)     return new AuthFailure(e.message, innerCause);
  if (e instanceof AppDatabaseException) return new DatabaseFailure(e.message, innerCause);
  return new UnknownFailure(e.message, innerCause);
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="safeRepositoryCall — wrap a repository method into a Result">
                <TextBlock>
                    {`The third guard wraps a repository method and returns a Result
instead of throwing. Its superpower is per-error-type fallbacks: pass an
onNetworkError / onServerError callback and the repository can, say, serve the
cache when the network fails — all within the guard, returning a Result either
way. Unexpected throws become an UnknownFailure and are logged.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`export async function safeRepositoryCall<TResult>({
  call, logger, onNetworkError, onServerError,
}: SafeRepositoryCallOptions<TResult>): Promise<Result<TResult>> {
  try {
    return { ok: true, value: await call() };
  } catch (e) {
    if (e instanceof NetworkException && onNetworkError) return onNetworkError(e);
    if (e instanceof ServerException  && onServerError)  return onServerError(e);
    if (e instanceof AppException) return failed(mapExceptionToFailure(e));
    logger.error('Unexpected repository error', e);
    return failed(new UnknownFailure());
  }
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Failures + the mapping table                                            */
/* -------------------------------------------------------------------------- */

function FailuresSection() {
    return (
        <SectionWrapper title="Failure — the user-facing states the UI switches on">
            <ContentGroupWrapper title="Each kind has a fixed severity">
                <TextBlock>
                    {`A Failure is an abstract class with a kind, a severity, a
user-friendly message, and an optional chained cause. The concrete classes are
the complete vocabulary the UI needs to know about — nothing else. Severity is
not random: it is fixed per kind, so the moment the UI has a Failure it also
knows how urgently to surface it. (Severity is a const object + literal union,
not an enum.)`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/error-handling/failures.ts
export const FailureSeverity = {
  Info: 'info',         // dismissible toast; data still usable
  Warning: 'warning',   // non-blocking toast (e.g. showing stale cache)
  Critical: 'critical', // blocking — full-screen error
} as const;

abstract class Failure {
  abstract readonly kind: FailureKind;       // 'network' | 'server' | ...
  abstract readonly severity: FailureSeverity;
  readonly cause?: Failure;
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="The exception → failure → severity map">
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`thrown in data layer        → Failure            severity
──────────────────────────    ──────────────────   ─────────
NetworkException / Timeout    NetworkFailure       critical
ServerException               ServerFailure        critical
AuthException (401/403)       AuthFailure          warning
AppDatabaseException (direct) DatabaseFailure      critical
AppDatabaseException (during  CacheFailure         warning
  cache fallback, chained)
anything else                 UnknownFailure       critical`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Severity → presentation                                                 */
/* -------------------------------------------------------------------------- */

function SeveritySection() {
    return (
        <SectionWrapper title="Severity drives blocking vs non-blocking UI">
            <ContentGroupWrapper title="Two presentation components, picked by severity">
                <TextBlock>
                    {`The UI never decides "is this bad?" — the Failure already did, via
its severity. A critical failure means the screen has no usable data, so the
component renders <ShowError/> full-screen (with an optional Retry that re-runs
the pipeline). A warning or info failure means the data is still usable, so the
component keeps rendering it and queues a <FailureSnackbarStack/> toast that
auto-dismisses. One Failure, two treatments, chosen mechanically.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// in the view-model / component — branch on severity only
if (state.status === 'error') {
  if (isBlocking(state.failure)) return <ShowError failure={state.failure}
                                                    onRetry={refetch} />;
  // non-blocking: keep the screen, show a toast
  snackbar.show(state.failure);
}
// ShowError: full-screen, critical only. Snackbar: transient, info/warning only.`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Chaining — the full story                                               */
/* -------------------------------------------------------------------------- */

function ChainingSection() {
    return (
        <SectionWrapper title="Chaining — preserving the full story">
            <ContentGroupWrapper title="A compound failure is not flattened">
                <TextBlock>
                    {`When one failure causes another, the second carries the first as
its cause instead of replacing it. The classic case in this app: the remote
fails (network), the repository falls back to the cache, and the cache read
fails too — so a CacheFailure is built on top of the NetworkFailure. The
joined message reads "No internet connection + No cached data available", and
the chain trace shows the cause ladder. That chain is what gets logged, so a
post-mortem shows every link, not just the last one.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// building a chained failure during cache fallback
const networkFailure = mapExceptionToFailure(cause);   // NetworkFailure
const chained = new CacheFailure(dbError.message, networkFailure);

chained.message;
// → "No internet connection + No cached data available"

chained.chain;
// → "No cached data available
//     → caused by: No internet connection"

// message joins cause → this; chain lists each link with → caused by:`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Live — drive every failure path                                         */
/* -------------------------------------------------------------------------- */

const API_LABEL: Record<ApiScenario, string> = {
    [ApiScenario.Success]: 'success',
    [ApiScenario.NetworkError]: 'network error',
    [ApiScenario.Timeout]: 'timeout',
    [ApiScenario.ServerError]: 'server error (500)',
    [ApiScenario.InvalidJson]: 'invalid JSON',
};
const DB_LABEL: Record<DbScenario, string> = {
    [DbScenario.Success]: 'success (cache has data)',
    [DbScenario.Empty]: 'empty cache',
    [DbScenario.ReadError]: 'read error',
    [DbScenario.WriteError]: 'write error',
};

type Outcome =
    | { ok: true; count: number; warning?: Failure }
    | { ok: false; failure: Failure };

/** Posts written straight to the cache on mount so fallback paths have data. */
const SEED_POSTS: PostDTO[] = [
    { id: 1, title: 'Cached post', body: 'Seeded so the fallback can serve it.' },
    { id: 2, title: 'Second cached post', body: 'Also in the local store.' },
];

const SEVERITY_STYLE: Record<FailureSeverity, string> = {
    [FailureSeverity.Critical]: 'border-error text-error',
    [FailureSeverity.Warning]: 'border-amber-500 text-amber-600',
    [FailureSeverity.Info]: 'border-outline text-on-surface-variant',
};

function LiveDemoSection() {
    return (
        <SectionWrapper title="Live — drive every failure path">
            <ContentGroupWrapper title="Pick an API outcome and a cache state, then run">
                <TextBlock>
                    {`This runs the real GetPostsUseCase through the repository, so the
guards, the mapping, the chaining, and the severity all fire for real. The
cache is seeded once on mount so the fallback paths work straight away. Try:

• network error + cache-has-data → Success with a non-blocking NetworkFailure
  warning (the snackbar fires; posts still show). The offline-first fallback.
• network error + empty cache → blocking NetworkFailure (full-screen ShowError).
• network error + cache read-error → a chained CacheFailure ← NetworkFailure.
• server error paths → ServerFailure; invalid JSON → ServerFailure.

The detail card shows the resulting Failure's kind, severity, and full chain —
exactly what the guards produced.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Real pipeline → Result → Failure detail + UI treatment">
                <PipelineDemo />
            </Example>
        </SectionWrapper>
    );
}

function PipelineDemo() {
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

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-xs">
                <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                    API
                    <select
                        value={api}
                        onChange={(e) => setApi(e.target.value as ApiScenario)}
                        className="rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    >
                        {API_SCENARIOS.map((s) => (
                            <option key={s} value={s}>
                                {API_LABEL[s]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                    cache
                    <select
                        value={db}
                        onChange={(e) => setDb(e.target.value as DbScenario)}
                        className="rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    >
                        {DB_SCENARIOS.map((s) => (
                            <option key={s} value={s}>
                                {DB_LABEL[s]}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="button"
                    disabled={running}
                    onClick={() => void run(api, db)}
                    className="rounded-md border border-outline px-sm py-xs text-caption text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
                >
                    {running ? 'running…' : 'run pipeline'}
                </button>
            </div>

            <OutcomeCard outcome={outcome} onRetry={() => void run(api, db)} />

            <FailureSnackbarStack
                entries={snackbar.entries}
                onDismiss={snackbar.dismiss}
            />
        </div>
    );
}

function OutcomeCard({
    outcome,
    onRetry,
}: {
    outcome: Outcome | null;
    onRetry: () => void;
}) {
    if (!outcome) {
        return (
            <p className="text-caption text-on-surface-variant">
                Pick scenarios and run.
            </p>
        );
    }

    if (outcome.ok) {
        if (!outcome.warning) {
            return (
                <div
                    className="rounded-md border border-outline bg-surface px-md py-md text-body-sm text-on-surface"
                    data-testid="outcome-ok"
                >
                    <p className="font-medium">✓ Success</p>
                    <p className="text-caption text-on-surface-variant">
                        {outcome.count} posts returned — no failure travelled up.
                    </p>
                </div>
            );
        }
        const w = outcome.warning;
        return (
            <div
                className="flex flex-col gap-xs rounded-md border border-outline bg-surface px-md py-md"
                data-testid="outcome-warning"
            >
                <div className="flex flex-wrap items-center gap-sm">
                    <span className="font-medium text-on-surface">
                        Success + non-blocking warning
                    </span>
                    <FailureBadge kind={w.kind} severity={w.severity} />
                </div>
                <p className="text-body-sm text-on-surface-variant">
                    {`Data was served from cache, so the UI keeps the screen and
fires a snackbar. Note the severity on the badge is the failure's own urgency;
the repository downgraded the presentation to non-blocking because cached data
was available.`}
                </p>
                <FailureDetail failure={w} />
            </div>
        );
    }

    // blocking failure (outcome.ok === false)
    const f = outcome.failure;
    return (
        <div
            className="flex flex-col gap-xs"
            data-testid="outcome-blocking"
        >
            <div className="flex flex-wrap items-center gap-sm rounded-md border border-outline bg-surface px-md py-md">
                <span className="font-medium text-on-surface">
                    Blocking failure
                </span>
                <FailureBadge kind={f.kind} severity={f.severity} />
                <span className="text-caption text-on-surface-variant">
                    UI treatment: full-screen &lt;ShowError/&gt;
                </span>
            </div>
            <FailureDetail failure={f} />
            <div className="max-h-[360px] overflow-auto rounded-md border border-outline">
                <ShowError failure={f} onRetry={onRetry} />
            </div>
        </div>
    );
}

function FailureBadge({
    kind,
    severity,
}: {
    kind: Failure['kind'];
    severity: FailureSeverity;
}) {
    return (
        <span
            className={`rounded-pill border px-sm py-[2px] text-overline uppercase tracking-[0.08em] ${SEVERITY_STYLE[severity]}`}
            style={{
                borderColor:
                    severity === FailureSeverity.Warning
                        ? 'var(--color-current)'
                        : undefined,
            }}
        >
            {kind} · {severity}
        </span>
    );
}

function FailureDetail({ failure }: { failure: Failure }) {
    return (
        <div className="rounded-md border border-outline bg-surface-variant px-md py-sm">
            <p className="font-mono text-caption text-on-surface">
                message: {failure.message}
            </p>
            <pre
                className="mt-xs overflow-x-auto font-mono text-caption leading-relaxed text-on-surface-variant"
                data-testid="failure-chain"
            >
                {failure.chain}
            </pre>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — the model is identical">
            <ContentGroupWrapper title="Same types, same guards, same severity model">
                <TextBlock>
                    {`The error pipeline mirrors the Flutter guide deliberately, because
the design is language-agnostic. What differs is just syntax and a couple of
ecosystem conventions:

• Sealed types — Dart uses sealed classes (exhaustive switch). TypeScript uses
  discriminated unions (Result.ok) and abstract classes with readonly kind for
  Failures, which gives the same narrowing.
• Cause chain — both use the standard Error.cause pattern; the recursive
  mapExceptionToFailure walks it identically.
• Presentation — Flutter uses ScaffoldMessenger.showSnackBar for non-blocking
  and a full-screen ShowError widget for blocking. React uses a useFailureSnackbar
  hook + <FailureSnackbarStack/> for non-blocking and <ShowError/> for blocking.
  Same two treatments, picked by the same severity field.
• Severity as data — both fix severity per Failure kind, so "how urgent" is a
  property of the error, not a decision left to whichever component catches it.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
