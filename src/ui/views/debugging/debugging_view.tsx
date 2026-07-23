import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import { Logger } from '../../../core/config/logger';

/**
 * DebuggingView — how to find out what is wrong when a React app misbehaves.
 *
 * Debugging in a browser React app is three toolboxes stacked: the app's own
 * structured logging (the Logger), the browser DevTools (sources, network,
 * breakpoints, the Vite error overlay), and React DevTools (the component tree
 * and hooks). Plus the one piece of code you write for the production case you
 * can't debug live: an error boundary, which catches a render crash and shows a
 * fallback instead of a white screen.
 */
export default function DebuggingView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatAndWhySection />
            <LoggerSection />
            <BrowserDevToolsSection />
            <ReactDevToolsSection />
            <ErrorBoundarySection />
            <ReadingFailuresSection />
            <ReactVsFlutterSection />
            <LiveLoggerSection />
            <LiveBoundarySection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What and why                                                            */
/* -------------------------------------------------------------------------- */

function WhatAndWhySection() {
    return (
        <SectionWrapper title="Debugging — three toolboxes, one missing thing to find">
            <ContentGroupWrapper title="Narrow the search before you read anything">
                <TextBlock>
                    {`Debugging is the process of turning "something is wrong" into "this
exact line, given this exact input". The discipline is to narrow before you
read: reproduce it reliably, then bisect — is it a render problem, a data
problem, or a network problem? Each toolbox answers one of those. The app's
Logger tells you what the data layer did; the browser Network panel tells you
what left and returned; React DevTools tells you what the tree looks like and
what each hook holds. Reach for the one that matches the symptom, not all of
them at once.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. The app's own logging                                                   */
/* -------------------------------------------------------------------------- */

function LoggerSection() {
    return (
        <SectionWrapper title="First stop — the app's own Logger">
            <ContentGroupWrapper title="Structured, level-filtered, env-aware">
                <TextBlock>
                    {`This app wraps console.log behind a Logger (core/config/logger.ts).
Every service (the repository, the data sources, the container) takes a Logger
and tags its output with a name and a level — debug / info / warning / error.
In dev, everything is emitted; in production, only error-level lines survive
(enableLogs is false for prod). That keeps the console clean for users and noisy
for developers. The repository logs the cache-fallback decision; the container
logs what it wired; the guards log the chained failure trail. Start reading
here: the logs usually say what happened before you have to inspect anything.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// core/config/logger.ts — level priority gates output
const LEVEL_PRIORITY = { debug: 10, info: 20, warning: 30, error: 40 };

constructor(name: string, enableLogs = true) {
  this.minPriority = enableLogs ? LEVEL_PRIORITY.debug   // dev: everything
                                : LEVEL_PRIORITY.error;  // prod: errors only
}
// → "[PostsRepositoryImpl] WARNING: Remote fetch failed (NetworkException)…"

// repository uses it to narrate the offline-first decision:
this.logger.warning('Remote fetch failed (…), falling back to cache');
this.logger.error(\`Cache fallback also failed:\\n\${chained.chain}\`);`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Browser DevTools                                                        */
/* -------------------------------------------------------------------------- */

function BrowserDevToolsSection() {
    return (
        <SectionWrapper title="Browser DevTools — sources, network, the Vite overlay">
            <ContentGroupWrapper title="The four panels you reach for">
                <TextBlock>
                    {`• Console — the catch-all. Uncaught errors, the Logger's output, and
  warnings from React itself (development-only warnings about keys, effects,
  hooks rules) all land here. In dev React is deliberately noisy — read those
  warnings, they are almost always real bugs.

• Sources — set a breakpoint and pause execution. Vite serves source maps, so
  the file you see is your original TypeScript, not the bundled output — set the
  breakpoint on the real line, inspect variables in scope, step through. The
  debugger; statement works as a breakpoint you can commit.

• Network — every request, its status, headers, and body. This is where you
  confirm "the API really did return 500" or "the payload was malformed" rather
  than guessing from the UI. Match it against the Logger to see the full path.

• Vite overlay — when a compile or runtime error hits during dev, Vite draws a
  red overlay on the page with the file + line. It is the fastest possible
  feedback loop; fix the line, save, the overlay clears on its own.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// a breakpoint you can commit — pauses here when the effect runs
useEffect(() => {
  debugger;                       // DevTools pauses; inspect \`result\`, \`dispatch\`
  if (result.ok) dispatch({ type: 'loaded', posts: result.value });
}, [result]);`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. React DevTools                                                          */
/* -------------------------------------------------------------------------- */

function ReactDevToolsSection() {
    return (
        <SectionWrapper title="React DevTools — the component tree and its hooks">
            <ContentGroupWrapper title="See what the tree actually is, and what each hook holds">
                <TextBlock>
                    {`React DevTools (a browser extension) shows two things the DOM cannot:
the component tree (not the DOM tree — components have no DOM node of their
own), and the current value of every hook in a selected component. When a screen
renders the wrong thing, the first question is "what does the hook hold?" — and
the Profiler tab answers the second question, "why did this re-render?". The
Profiler records a render pass and shows which components rendered and why
(state changed, parent rendered, context changed), which is the only way to
chase down a slow screen.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    code={`Components tab:  the tree as React sees it, with props + hook values
  └ App
    └ ThemeProvider  { theme: 'light' }
    └ RootLayout
      └ ArchitectureView  { }        ← click to inspect its hooks
          └ useReducer  state: { status: 'loaded', posts: [...] }

Profiler tab:    Record → interact → stop. Shows every component that
                 rendered and WHY (state changed / parent rendered / ctx).`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Error boundaries                                                        */
/* -------------------------------------------------------------------------- */

function ErrorBoundarySection() {
    return (
        <SectionWrapper title="Error boundaries — the production safety net">
            <ContentGroupWrapper title="The one piece of code you write for the crash you can't debug live">
                <TextBlock>
                    {`try/catch cannot catch errors thrown during render or in a hook body —
React's render is synchronous and there is nowhere to put the catch. The
escape hatch is an error boundary: a class component (still the only way to
write one) that implements getDerivedStateFromError + componentDidCatch and
renders a fallback instead of the crashed subtree. It does not replace
debugging — it prevents a single broken component from white-screening the
whole app, and it gives you a place to ship the error to your logger. The live
demo below is a real error boundary you can trigger.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; } // flip state → fallback
  componentDidCatch(error: Error, info: ErrorInfo) {               // ship to logger/Sentry
    logger.error('Render crashed', { error, info });
  }
  render() {
    return this.state.hasError ? <Fallback error={…}/> : this.props.children;
  }
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Reading the failure trail                                               */
/* -------------------------------------------------------------------------- */

function ReadingFailuresSection() {
    return (
        <SectionWrapper title="Reading the failure trail the architecture builds for you">
            <ContentGroupWrapper title="The chained Failure is a pre-built debugging narrative">
                <TextBlock>
                    {`Because this app converts exceptions into chained Failures at the data
boundary (see the Exception handling screen), a failure arrives at the UI with
its whole cause chain attached — the cache read failure, caused by the network
failure underneath. The Failure.chain string renders that as "caused by: …"
oldest-first, and the Logger logs it. So before you open DevTools, read the
failure card on screen and the matching log line: the chain usually tells you
which layer failed and what triggered it, which is the same narrowing the
manual toolboxes do.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — same panels, different runtimes">
            <ContentGroupWrapper title="Browser DevTools vs Flutter DevTools, error boundary vs ErrorWidget">
                <TextBlock>
                    {`• DevTools — Flutter has its own Flutter DevTools (widget inspector,
  timeline, network via the VM service). React splits the job across the
  browser's built-in DevTools (sources, network, DOM) and the React DevTools
  extension (component tree, hooks, profiler). The mental model is the same:
  inspect state, profile renders, read the network.

• Logging — Flutter's print + the dart:developer logger map to this app's
  Logger; both gate by level and environment.

• Crash safety — Flutter shows a red error widget in dev and (without work) a
  grey screen in release. React white-screens on an uncaught render error
  unless you wrap the tree in an error boundary — so the boundary is not
  optional in React the way ErrorWidget.builder is in Flutter, it is the default
  you must add yourself.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Live — the logger playground                                            */
/* -------------------------------------------------------------------------- */

function LiveLoggerSection() {
    return (
        <SectionWrapper title="Live — the logger playground">
            <ContentGroupWrapper title="Emit at each level, toggle the env gate">
                <TextBlock>
                    {`This is the real Logger. Emit a line at each level and watch it appear
in the console (open DevTools to see it). Toggle "production" and the gate
jumps to error-only — debug, info, and warning lines are silently dropped, the
same filter the prod build applies. That is the whole logging model: one gate,
per environment.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="core/config/logger.ts — live">
                <LoggerDemo />
            </Example>
        </SectionWrapper>
    );
}

const LEVELS = ['debug', 'info', 'warning', 'error'] as const;
type Level = (typeof LEVELS)[number];

function LoggerDemo() {
    const [prodMode, setProdMode] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const emit = (level: Level) => {
        const logger = new Logger('Playground', !prodMode);
        const before = console.log;
        const captured: string[] = [];
        // Demo-only: temporarily monkeypatch console.log to capture what the
        // Logger actually emits. Mutating a host global is intentionally
        // pedagogical — restored in the `finally` below.
        // eslint-disable-next-line react-hooks/immutability
        console.log = (...args: unknown[]) => {
            captured.push(args.map(String).join(' '));
        };
        try {
            logger[level](`emitted at ${level} level`);
        } finally {
            console.log = before;
        }
        // If the gate dropped it (captured empty), say so explicitly.
        const line =
            captured.length > 0
                ? (captured[0] ?? '')
                : `(dropped — below ${prodMode ? 'error' : 'debug'} gate)`;
        setLog((l) => [line, ...l].slice(0, 8));
    };

    return (
        <div className="flex flex-col gap-md">
            <div className="flex flex-wrap items-center gap-xs">
                {LEVELS.map((lvl) => (
                    <button
                        key={lvl}
                        type="button"
                        onClick={() => emit(lvl)}
                        className="rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                    >
                        logger.{lvl}()
                    </button>
                ))}
                <label className="ml-xs flex items-center gap-xs text-caption text-on-surface-variant">
                    <input
                        type="checkbox"
                        checked={prodMode}
                        onChange={(e) => setProdMode(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    production (error-only gate)
                </label>
            </div>

            <div className="flex flex-col gap-[2px] rounded-md border border-outline bg-surface-variant px-md py-sm font-mono text-caption text-on-surface">
                <span className="text-on-surface-variant"># console</span>
                {log.length === 0 ? (
                    <span className="text-on-surface-variant">(empty — emit a line)</span>
                ) : (
                    log.map((l, i) => <span key={i}>{l}</span>)
                )}
            </div>
            <p className="text-caption text-on-surface-variant">
                The same lines also print to the real browser console — open
                DevTools to see them alongside the rest of the app's output.
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 9. Live — error boundary you can trigger                                   */
/* -------------------------------------------------------------------------- */

interface BoundaryState {
    hasError: boolean;
    message: string;
}

class DemoBoundary extends Component<{ children: ReactNode }, BoundaryState> {
    override state: BoundaryState = { hasError: false, message: '' };

    static getDerivedStateFromError(error: Error): BoundaryState {
        return { hasError: true, message: error.message };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        // In the real app this would go to the Logger / Sentry.
        console.log('[DemoBoundary] caught render error:', error.message, info);
    }

    reset = () => this.setState({ hasError: false, message: '' });

    override render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col gap-sm rounded-md border border-outline bg-surface-variant p-md">
                    <p className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                        ⚠ error boundary caught it
                    </p>
                    <p className="font-mono text-body-sm text-on-surface">
                        {this.state.message}
                    </p>
                    <p className="text-caption text-on-surface-variant">
                        Without the boundary, this render crash would have
                        unmounted the whole subtree (a white screen in
                        production). The boundary isolates it.
                    </p>
                    <button
                        type="button"
                        onClick={this.reset}
                        className="w-fit rounded-md border border-primary bg-primary px-md py-xs text-body-sm font-semibold text-on-primary"
                    >
                        reset boundary
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/** A component that throws on demand — the thing the boundary catches. */
function Crashable({ shouldCrash }: { shouldCrash: boolean }) {
    if (shouldCrash) {
        throw new Error('TypeError: Cannot read properties of undefined (rendering post list)');
    }
    return (
        <p className="text-body-sm text-on-surface">
            Healthy subtree — rendering normally.
        </p>
    );
}

function LiveBoundarySection() {
    const [crash, setCrash] = useState(false);
    return (
        <SectionWrapper title="Live — trigger a render crash, watch the boundary catch it">
            <ContentGroupWrapper title="The boundary isolates the crash instead of white-screening">
                <TextBlock>
                    {`Toggle "crash the subtree" to throw during render. The DemoBoundary
wrapping it calls getDerivedStateFromError, flips to its fallback, and the rest
of the page stays alive — exactly what a production error boundary does. The
message it shows is the real Error.message that was thrown.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="error boundary — catch a render crash">
                <div className="flex flex-col gap-md">
                    <DemoBoundary>
                        <div className="flex flex-wrap items-center justify-between gap-sm rounded-md border border-outline bg-surface p-md">
                            <Crashable shouldCrash={crash} />
                            <button
                                type="button"
                                onClick={() => setCrash((c) => !c)}
                                className="rounded-md border border-outline bg-surface-variant px-md py-xs text-body-sm text-on-surface hover:bg-surface"
                            >
                                {crash ? 'render healthy' : 'crash the subtree'}
                            </button>
                        </div>
                    </DemoBoundary>
                    <p className="text-caption text-on-surface-variant">
                        A boundary catches errors in render, in lifecycle, and in
                        constructors of the whole subtree below it. It does NOT
                        catch event handlers, async code, or effects — those stay
                        try/catch territory (which is why the data layer wraps
                        its async calls in guards).
                    </p>
                </div>
            </Example>
        </SectionWrapper>
    );
}
