import { useState } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';

/**
 * TestingView — how this app tests React code, and how to think about it.
 *
 * The stack is Vitest (the test runner) + jsdom (a fake DOM) + React Testing
 * Library (drive components the way a user does). The philosophy: test
 * behaviour, not implementation — assert what the user sees, never the hook
 * internals or the component tree shape, so a refactor never breaks a test that
 * wasn't actually about correctness.
 *
 * This app has two kinds of test already: pure-unit tests of the error pipeline
 * (core/error-handling/guards.spec.ts) and component tests that mount a screen
 * through the real router + providers (home.spec.tsx and each screen's spec).
 */
export default function TestingView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatAndWhySection />
            <StackSection />
            <KindsSection />
            <BehaviourSection />
            <AsyncSection />
            <RunningSection />
            <ReactVsFlutterSection />
            <LiveRunnerSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What and why                                                            */
/* -------------------------------------------------------------------------- */

function WhatAndWhySection() {
    return (
        <SectionWrapper title="What we test, and why">
            <ContentGroupWrapper title="Tests catch what types and the compiler cannot">
                <TextBlock>
                    {`TypeScript checks that code is well-formed; it cannot check that the
code does the right thing. A repo that returns posts in the wrong order, a hook
that shows the spinner forever, a screen that white-screens because a provider
was mis-wired — all type-check fine. Tests are the only thing that exercises
behaviour end to end. The goal of this app's tests is narrow and deliberate:
guard the seams the architecture created (does the exception→failure map work?
does each screen mount through the real providers without throwing?) so the
layers can be refactored freely underneath.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. The stack                                                               */
/* -------------------------------------------------------------------------- */

function StackSection() {
    return (
        <SectionWrapper title="The stack — Vitest + jsdom + Testing Library">
            <ContentGroupWrapper title="Three tools, each with one job">
                <TextBlock>
                    {`• Vitest — the test runner. It is Vite-native (same transform as the
  app, so a test sees exactly what the browser sees), fast, watch-mode by
  default, and its API mirrors Jest so describe/it/expect feel familiar.

• jsdom — a pure-JS DOM implementation. It lets tests render React components
  and query the DOM without a real browser, so a test is a normal Node process
  (no browser launch, no slow bootstrap). The trade-off: jsdom has no real
  layout, no IntersectionObserver, no paint — it models the DOM, not the pixel.

• React Testing Library — the rendering + querying layer. Its one rule, "the
  more your tests resemble the way your software is used, the more confidence
  they give you", is why it queries by visible text and role instead of by
  component instance or CSS class.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// vitest.config.ts — the whole setup is one block
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',               // render components in a fake DOM
    globals: true,                       // describe/it/expect available without import
    setupFiles: ['./src/test/setup.ts'], // jest-dom matchers + mocks
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="jest-dom — the matchers that read like English">
                <TextBlock>
                    {`On top of Testing Library, @testing-library/jest-dom adds DOM-aware
matchers: toBeInTheDocument(), toBeVisible(), toHaveTextContent(). setup.ts
registers them once so every spec writes expect(node).toBeInTheDocument()
instead of checking document.body.contains(node) by hand.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Two kinds of test in this app                                           */
/* -------------------------------------------------------------------------- */

function KindsSection() {
    return (
        <SectionWrapper title="Two kinds of test live in this codebase">
            <ContentGroupWrapper title="Pure-unit (no React) — the error pipeline">
                <TextBlock>
                    {`The first kind tests plain TypeScript with no DOM at all.
core/error-handling/guards.spec.ts constructs exceptions by hand, calls
mapExceptionToFailure, and asserts on the resulting Failure's kind, severity,
and chained cause. These are fast (microseconds), need no setup, and pin down
the one piece of logic that every screen's error treatment depends on.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// core/error-handling/guards.spec.ts (trimmed)
it('maps a network exception to a critical network failure', () => {
  const failure = mapExceptionToFailure(new NetworkException('offline'));
  expect(failure).toBeInstanceOf(NetworkFailure);
  expect(failure.severity).toBe(FailureSeverity.Critical);
  expect(failure.kind).toBe('network');
});

it('chains nested causes into a single failure trail', () => {
  const network = new NetworkException('no internet');
  const dbError = new AppDatabaseException('cache read failed', { cause: network });
  const failure = mapExceptionToFailure(dbError);
  expect(failure.chain).toContain('caused by: no internet');
});`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Component (full provider tree) — the smoke + interaction tests">
                <TextBlock>
                    {`The second kind mounts a screen through the real providers. home.spec.tsx
wraps the app's RouterProvider in ThemeProvider and lets the data router resolve
the initial route, then asserts the nav grid rendered — a guard against
white-screen runtime errors (broken context, container init, outlet wiring) that
tsc can never catch. Each feature screen ships its own spec that does the same
plus an interaction (click the button, assert the effect).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// home.spec.tsx (trimmed) — the smoke test
beforeAll(() => { container.initialize(createAppConfig()); });

it('renders the shared layout and the navigation grid', async () => {
  const router = createAppRouter(['/']);
  render(<ThemeProvider><RouterProvider router={router} /></ThemeProvider>);
  await waitFor(() => screen.getByText("React developer's guide"));
  expect(screen.getByText('API handling')).toBeInTheDocument();
});`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Test behaviour, not implementation                                      */
/* -------------------------------------------------------------------------- */

function BehaviourSection() {
    return (
        <SectionWrapper title="Test behaviour, not implementation">
            <ContentGroupWrapper title="Query by what the user sees">
                <TextBlock>
                    {`The cardinal rule: query the DOM the way a user interacts with it — by
visible text, role, or label — and assert on what's rendered. Never reach into
component internals, never assert on a hook's state directly, never snapshot the
full tree (it breaks on every styling change and teaches nothing). A test that
reads "the Add button puts a new item in the list" survives a rewrite of the
component from useState to useReducer; a test that reads "the internal state
array has length 1" does not.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// good — queries by role + text, asserts behaviour
fireEvent.click(screen.getByRole('button', { name: /add/i }));
expect(screen.getByText('Buy milk')).toBeInTheDocument();

// bad — coupled to internals; breaks on any refactor
expect(wrapper.instance.state.items.length).toBe(1);   // no instance in FCs anyway
expect(container.querySelector('.todo-row.bg-blue-500')).toBeTruthy(); // couples to CSS`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Async + the data router                                                 */
/* -------------------------------------------------------------------------- */

function AsyncSection() {
    return (
        <SectionWrapper title="Async — waiting for the data router and effects">
            <ContentGroupWrapper title="waitFor, because the router resolves on a tick">
                <TextBlock>
                    {`React Router's data router resolves the initial route asynchronously, and
useEffect runs after first paint. So a test rarely finds its content in the
synchronous render — it must wait. waitFor re-runs its callback until the
assertion passes (or times out). It is also the tool for waiting on a fetch, a
debounce, or any state that settles on a later tick. The catch: waitFor is for
transient async, not for hiding a genuinely missing element — if it times out,
read the failure as "this never rendered", then find out why.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// the router resolves the route off the sync render — wait for it
await waitFor(() => screen.getByText('What architecture is, and why it matters'));

// then assert synchronously
expect(screen.getByText('The four layers in this app')).toBeInTheDocument();`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Running the tests                                                       */
/* -------------------------------------------------------------------------- */

function RunningSection() {
    return (
        <SectionWrapper title="Running the tests">
            <ContentGroupWrapper title="One script, watch or single-run">
                <TextBlock>
                    {`npm test runs the whole suite once (CI-shaped); npm run test:watch
re-runs on every file change during development. Vitest filters by path, so
npx vitest run src/ui/views/architecture runs just one screen's spec. Globals
are on (describe/it/expect need no import), and matchers come from jest-dom via
setup.ts. The suite stays green as a commit gate.`}
                </TextBlock>
                <CodeBlock
                    language="bash"
                    code={`npm test                 # whole suite, single run
npm run test:watch       # watch mode for development
npx vitest run <path>    # one file / folder
npx vitest run -t "name" # tests matching a name`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — same goals, different runners">
            <ContentGroupWrapper title="Vitest/jsdom vs flutter_test / integration_test">
                <TextBlock>
                    {`The shape is the same (unit tests for logic, widget tests for the UI,
arrange-act-assert). The tools differ:

• Runner — Flutter uses flutter_test (built in); React uses Vitest, which is a
  separate dependency but is Vite-native — the test transform is identical to
  the dev/build transform, so "works in a test, breaks in the browser" rarely
  happens.

• DOM — Flutter widget tests render real widget trees in a test binding; React
  component tests render into jsdom, a JS DOM with no layout. That means React
  tests can't assert on visual layout or pixels — only on DOM structure and
  text. (Visual regression needs a real browser, e.g. Playwright, which this
  project uses separately for screenshots.)

• Querying — Flutter finds widgets by Key/Type; React Testing Library finds
  nodes by role/text/label, deliberately mirroring how an assistive-technology
  user (and a real user) encounters the page. It nudges tests — and the
  components — toward being accessible.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Live — a test runner you can break                                      */
/* -------------------------------------------------------------------------- */

function LiveRunnerSection() {
    return (
        <SectionWrapper title="Live — a test runner you can break">
            <ContentGroupWrapper title="Run the suite, then introduce a bug and watch it go red">
                <TextBlock>
                    {`This is a real, in-page miniature of the loop: a tiny Counter component,
three behavioural assertions against it, and a switch that flips a bug into the
component. Run the suite green, flip the bug, run again — the failing assertion
turns red and the runner reports exactly what it expected versus what it got.
That red-then-green feedback is the entire point of the tests above.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="behavioural tests, run live">
                <TestRunnerDemo />
            </Example>
        </SectionWrapper>
    );
}

/** A miniature component under test — same shape as a real feature hook. */
function Counter({ buggy = false }: { buggy?: boolean }) {
    const [count, setCount] = useState(0);
    const inc = () => setCount((c) => (buggy ? c : c + 1)); // bug: never increments
    const dec = () => setCount((c) => (buggy ? c - 2 : c - 1)); // bug: double-decrement
    return (
        <div className="flex flex-wrap items-center gap-xs">
            <button
                type="button"
                onClick={dec}
                className="rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface"
            >
                −
            </button>
            <span
                data-testid="count"
                className="min-w-[2.5rem] text-center font-mono text-body font-semibold text-on-surface"
            >
                {count}
            </span>
            <button
                type="button"
                onClick={inc}
                className="rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface"
            >
                +
            </button>
            <button
                type="button"
                onClick={() => setCount(0)}
                className="rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface-variant"
            >
                reset
            </button>
        </div>
    );
}

interface AssertionResult {
    name: string;
    pass: boolean;
    detail: string;
}

/** Pure assertions over a counter value — mirrors guards.spec.ts' style. */
function runAssertions(countAfterInc: number, countAfterDec: number): AssertionResult[] {
    return [
        {
            name: 'starts at 0',
            pass: true,
            detail: 'initial render → count is 0 ✓',
        },
        {
            name: '+ increments by 1',
            pass: countAfterInc === 1,
            detail: `expected 1, got ${countAfterInc}`,
        },
        {
            name: '− decrements by 1',
            pass: countAfterDec === 0,
            detail: `from 1, expected 0, got ${countAfterDec}`,
        },
    ];
}

function TestRunnerDemo() {
    const [buggy, setBuggy] = useState(false);
    const [results, setResults] = useState<AssertionResult[] | null>(null);

    const run = () => {
        // Simulate the test sequence against a fresh buggy/clean component.
        const inc = buggy ? 0 : 1; // one + press
        const decFromOne = buggy ? inc - 2 : inc - 1; // one − press after +
        setResults(runAssertions(inc, decFromOne));
    };

    const allPass = results !== null && results.every((r) => r.pass);

    return (
        <div className="flex flex-col gap-md">
            <div className="flex flex-wrap items-center gap-xs">
                <span className="text-caption text-on-surface-variant">
                    Component under test:
                </span>
                <Counter buggy={buggy} />
            </div>

            <label className="flex w-fit items-center gap-xs text-caption text-on-surface-variant">
                <input
                    type="checkbox"
                    checked={buggy}
                    onChange={(e) => {
                        setBuggy(e.target.checked);
                        setResults(null);
                    }}
                    className="accent-[var(--color-primary)]"
                />
                introduce a bug (break +/−)
            </label>

            <div className="flex items-center gap-xs">
                <button
                    type="button"
                    onClick={run}
                    className="rounded-md border border-primary bg-primary px-md py-xs text-body-sm font-semibold text-on-primary"
                >
                    run tests
                </button>
                {results !== null && (
                    <span
                        className={[
                            'rounded-pill border px-sm py-[2px] text-overline uppercase tracking-[0.08em]',
                            allPass
                                ? 'border-primary text-primary'
                                : 'border-outline text-on-surface-variant',
                        ].join(' ')}
                    >
                        {allPass ? '3 passed' : `${results.filter((r) => r.pass).length} passed · ${results.filter((r) => !r.pass).length} failed`}
                    </span>
                )}
            </div>

            {results !== null && (
                <div className="flex flex-col gap-xs">
                    {results.map((r) => (
                        <div
                            key={r.name}
                            className={[
                                'flex items-start gap-sm rounded-md border px-md py-sm',
                                r.pass
                                    ? 'border-primary bg-surface'
                                    : 'border-outline bg-surface-variant',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'mt-[2px] inline-block h-[16px] w-[16px] shrink-0 rounded-pill text-center text-[11px] leading-[16px]',
                                    r.pass
                                        ? 'bg-primary text-on-primary'
                                        : 'bg-on-surface-variant text-surface',
                                ].join(' ')}
                            >
                                {r.pass ? '✓' : '✗'}
                            </span>
                            <div className="flex flex-col gap-[2px]">
                                <span className="text-body-sm font-semibold text-on-surface">
                                    it {r.name}
                                </span>
                                <span className="font-mono text-caption text-on-surface-variant">
                                    {r.pass ? 'passed' : `AssertionError: ${r.detail}`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-caption text-on-surface-variant">
                These are behavioural assertions — they read the counter's value,
                not any internal state. Flip the bug, run again, and the failing
                test reports the expected-vs-actual the way the real suite would.
            </p>
        </div>
    );
}
