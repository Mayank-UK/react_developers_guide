import { useEffect, useState } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';

/**
 * LifecycleView — the phases a React component moves through, and how to run
 * code at each one.
 *
 * Modern React (with hooks) has no named lifecycle methods to override —
 * instead you describe side-effects with useEffect, and React runs them at the
 * right moments. The class API (componentDidMount / Update / WillUnmount) still
 * exists in old code, so this screen shows both and maps each class method to
 * its hook equivalent.
 *
 * Mental model: a component MOUNTS (first appearance) → UPDATES zero or more
 * times (state/props change) → UNMOUNTS (removed). useEffect with a dependency
 * array lets you hook into exactly those moments.
 *
 * Every concept ships a live demo that prints the lifecycle events as they
 * happen, because this only makes sense when you watch it run.
 */
export default function LifecycleView() {
    return (
        <div className="flex flex-col gap-md">
            <PhasesSection />
            <EffectDepsSection />
            <MountUnmountSection />
            <CleanupSection />
            <ClassVsHooksSection />
            <StrictModeSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 0. The three phases                                                        */
/* -------------------------------------------------------------------------- */

function PhasesSection() {
    return (
        <SectionWrapper title="The three phases">
            <ContentGroupWrapper title="Mount → Update → Unmount">
                <TextBlock>
                    {`Every component instance lives through the same arc: it MOUNTS when first
inserted into the DOM, UPDATES whenever its state or props change (zero or many
times), and UNMOUNTS when removed. "Lifecycle" is just "which of these am I in,
and run my code at the right one". React's render phase (computing the virtual
DOM) is separate from its commit phase (writing to the real DOM) — effects run
after commit, so the screen is already painted when they fire.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            The one primitive that covers all three phases.
                        </span>
                    }
                    code={`useEffect(() => {
  // runs AFTER mount AND after every update where a dep changed.
  // (the body)             → mount + update

  return () => {
    // runs BEFORE the next effect and before unmount.
    // (the cleanup)         → update-cleanup + unmount
  };
}, [deps]); // [] = mount+unmount only; omitted = every render`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Dependency array — when effects re-run                                 */
/* -------------------------------------------------------------------------- */

function EffectDepsSection() {
    return (
        <SectionWrapper title="The dependency array decides everything">
            <ContentGroupWrapper title="Three ways to wire an effect">
                <TextBlock>
                    {`The second argument to useEffect is the whole story. Omit it and the effect
runs after every render. Pass [] and it runs only on mount (plus its cleanup on
unmount). Pass a list and it runs on mount plus whenever one of those values
changed since last render. Get this array right and your effect re-runs exactly
when it should; get it wrong and you get either stale data (a dep you forgot) or
an infinite loop (a dep that changes every render).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// A — every render (rarely what you want)
useEffect(() => { console.log('render') });

// B — mount only
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);   // tear down on unmount
}, []);

// C — mount + when userId changes
useEffect(() => {
  fetch('/users/' + userId);
}, [userId]);`}
                />
            </ContentGroupWrapper>
            <EffectDepsDemo />
        </SectionWrapper>
    );
}

function EffectDepsDemo() {
    const [count, setCount] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [effectRuns, setEffectRuns] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Effect keyed on `multiplier` only — re-runs when multiplier changes,
    // NOT when count changes. Demonstrates selective dependency. The setState
    // calls ARE the lesson (they record that the effect fired), so this is an
    // intentional synchronous-in-effect pattern.
    /* eslint-disable react-hooks/set-state-in-effect -- the setState calls ARE
       the lesson: they record that the effect fired. Intentional. */
    useEffect(() => {
        setEffectRuns((n) => n + 1);
        setLogs((l) =>
            [
                `effect ran — multiplier is now ${multiplier}`,
                ...l,
            ].slice(0, 6),
        );
    }, [multiplier]);
    /* eslint-enable react-hooks/set-state-in-effect */

    return (
        <Example label="Watch which renders trigger the effect">
            <p className="text-body-sm text-on-surface-variant">
                The effect depends on <code className="font-mono">[multiplier]</code>{' '}
                only. Increment <em>count</em> and nothing happens; change{' '}
                <em>multiplier</em> and the effect fires.
            </p>
            <div className="flex flex-wrap gap-sm">
                <button
                    type="button"
                    onClick={() => setCount((c) => c + 1)}
                    className="rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                >
                    count++ ({count})
                </button>
                <button
                    type="button"
                    onClick={() => setMultiplier((m) => m + 1)}
                    className="rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                    data-testid="mult-btn"
                >
                    multiplier++ ({multiplier})
                </button>
            </div>
            <div className="rounded-md border border-outline bg-surface p-md">
                <p className="text-overline text-on-surface-variant">
                    effect fired {effectRuns}× (deps: [multiplier])
                </p>
                <ul
                    className="mt-xs flex flex-col gap-xs font-mono text-caption text-on-surface"
                    data-testid="effect-logs"
                >
                    {logs.length === 0 ? (
                        <li className="text-on-surface-variant">— no runs yet —</li>
                    ) : (
                        logs.map((line, i) => <li key={i}>{line}</li>)
                    )}
                </ul>
            </div>
        </Example>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Mount + unmount with cleanup                                           */
/* -------------------------------------------------------------------------- */

function MountUnmountSection() {
    const [show, setShow] = useState(false);
    return (
        <SectionWrapper title="Mount & unmount — set up, then tear down">
            <ContentGroupWrapper title="Every subscription needs a matching teardown">
                <TextBlock>
                    {`When a component mounts you often start something — a timer, a listener, a
WebSocket, a fetch. When it unmounts you MUST stop that thing, or it keeps
running against a dead component (the classic "setState on unmounted component"
warning / memory leak). The function you return from useEffect is the cleanup;
React calls it on unmount and before each re-run. Mount and unmount are a pair —
never start something you don't also tear down.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`function Timer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);   // ← tear down on unmount
  }, []);
  return <p>{secs}s</p>;
}`}
                />
            </ContentGroupWrapper>
            <Example label="Mount/unmount a live timer — watch the log">
                <p className="text-body-sm text-on-surface-variant">
                    Toggle the timer on. While mounted it ticks every second and
                    prints "tick"; on unmount the cleanup fires and prints
                    "cleanup: interval cleared".
                </p>
                <div className="flex flex-wrap items-center gap-sm">
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="rounded-md px-md py-xs text-body-sm text-on-primary shadow-button-card hover:shadow-button-card-hover"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        {show ? 'unmount timer' : 'mount timer'}
                    </button>
                </div>
                {show && <Ticker />}
                <LifecycleLog />
            </Example>
        </SectionWrapper>
    );
}

function Ticker() {
    const [secs, setSecs] = useState(0);
    useEffect(() => {
        pushLog('mount: interval started');
        const id = setInterval(() => {
            setSecs((s) => s + 1);
            pushLog('tick');
        }, 1000);
        return () => {
            clearInterval(id);
            pushLog('cleanup: interval cleared');
        };
    }, []);
    return (
        <div
            className="rounded-md border border-outline bg-surface p-md"
            data-testid="ticker"
        >
            <p className="font-mono text-title-sm text-on-surface">
                {secs}s
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Cleanup on update (the often-missed case)                              */
/* -------------------------------------------------------------------------- */

function CleanupSection() {
    return (
        <SectionWrapper title="Cleanup also runs on every re-run">
            <ContentGroupWrapper title="Not just unmount — before the next effect too">
                <TextBlock>
                    {`If an effect has dependencies and re-runs, React calls the PREVIOUS effect's
cleanup BEFORE running the new one. So the pattern is always: set up → (deps
change) → tear down old → set up new → … → final tear down on unmount. This is
why fetching in an effect should cancel the in-flight request in cleanup — when
userId changes fast, the stale response can't overwrite the fresh one. The demo
shows cleanup firing between re-runs, not only at the end.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`useEffect(() => {
  const controller = new AbortController();
  fetch('/users/' + userId, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(() => {});            // abort throws — swallow it
  return () => controller.abort(); // cancel the previous fetch on re-run/unmount
}, [userId]);`}
                />
            </ContentGroupWrapper>
            <CleanupDemo />
        </SectionWrapper>
    );
}

function CleanupDemo() {
    const [version, setVersion] = useState(1);
    useEffect(() => {
        pushLog(`setup v${version}`);
        return () => pushLog(`cleanup v${version}`);
    }, [version]);
    return (
        <Example label="Re-run an effect — cleanup fires each time">
            <p className="text-body-sm text-on-surface-variant">
                Each click bumps <code className="font-mono">version</code>; the
                effect re-runs, and you see setup / cleanup alternate (cleanup
                runs before the next setup, not after).
            </p>
            <button
                type="button"
                onClick={() => setVersion((v) => v + 1)}
                className="rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
            >
                bump version ({version})
            </button>
            <LifecycleLog />
        </Example>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Class lifecycle vs hooks                                               */
/* -------------------------------------------------------------------------- */

const CLASS_VS_HOOKS = [
    {
        cls: 'constructor',
        hook: 'useState / useRef initializer',
        when: 'first state setup',
    },
    {
        cls: 'componentDidMount',
        hook: 'useEffect(fn, [])',
        when: 'after first render',
    },
    {
        cls: 'componentDidUpdate',
        hook: 'useEffect(fn, [deps])',
        when: 'after a dep-driven update',
    },
    {
        cls: 'componentWillUnmount',
        hook: 'return () => {} from useEffect',
        when: 'removed from DOM',
    },
    {
        cls: 'render',
        hook: 'the function body itself',
        when: 'compute output (pure)',
    },
    {
        cls: 'getDerivedStateFromProps',
        hook: 'derive during render',
        when: 'compute from props',
    },
];

function ClassVsHooksSection() {
    return (
        <SectionWrapper title="Class lifecycle methods vs hooks">
            <ContentGroupWrapper title="The same moments, different syntax">
                <TextBlock>
                    {`Old class components overrode named methods (componentDidMount,
componentDidUpdate, componentWillUnmount). Function components with hooks hit
the exact same moments with useEffect — usually one effect doing the work of
several methods, because setup and teardown live together. You will still see
the class names in tutorials and legacy code; here is the translation. New code
should use hooks.`}
                </TextBlock>
                <div className="overflow-hidden rounded-md border border-outline">
                    <table className="w-full border-collapse text-body-sm">
                        <thead>
                            <tr className="bg-surface-variant text-on-surface-variant">
                                <th className="px-md py-xs text-left font-semibold">
                                    class method
                                </th>
                                <th className="px-md py-xs text-left font-semibold">
                                    hook equivalent
                                </th>
                                <th className="px-md py-xs text-left font-semibold">
                                    fires when
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {CLASS_VS_HOOKS.map((r) => (
                                <tr
                                    key={r.cls}
                                    className="border-t border-outline"
                                >
                                    <td className="px-md py-xs font-mono text-on-surface">
                                        {r.cls}
                                    </td>
                                    <td className="px-md py-xs font-mono text-primary">
                                        {r.hook}
                                    </td>
                                    <td className="px-md py-xs text-on-surface-variant">
                                        {r.when}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. StrictMode double-invoke                                              */
/* -------------------------------------------------------------------------- */

function StrictModeSection() {
    return (
        <SectionWrapper title="StrictMode: effects run twice in dev">
            <ContentGroupWrapper title="A dev-only check, not a bug">
                <TextBlock>
                    {`React's <StrictMode> (wrapping this app in main.tsx) deliberately mounts,
unmounts, and remounts each component once in development — so mount/setup and
unmount/cleanup each fire twice on first paint. This is intentional: it surfaces
effects whose cleanup doesn't truly reverse their setup (the bugs that bite in
production when a component is reused). It does NOT happen in production builds.
If your logs above look doubled on first interaction in dev, that's why — and a
sign your effect should be idempotent (safe to run twice).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// main.tsx — StrictMode wraps the app (dev-only extra invocations)
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// make effects idempotent so double-invoke is harmless:
useEffect(() => {
  let cancelled = false;
  loadData().then(d => { if (!cancelled) setResult(d); });
  return () => { cancelled = true; };
}, []);`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* Shared event-log — a tiny module-scoped bus so multiple demos can append.  */
/* -------------------------------------------------------------------------- */

type LogListener = (lines: string[]) => void;
let logLines: string[] = [];
const listeners = new Set<LogListener>();

function pushLog(line: string) {
    logLines = [line, ...logLines].slice(0, 8);
    listeners.forEach((fn) => fn(logLines));
}

function LifecycleLog() {
    const [lines, setLines] = useState<string[]>(logLines);
    useEffect(() => {
        const fn: LogListener = (next) => setLines(next);
        listeners.add(fn);
        return () => {
            listeners.delete(fn);
        };
    }, []);
    return (
        <div className="rounded-md border border-outline bg-surface p-md">
            <p className="text-overline text-on-surface-variant">
                lifecycle log (newest first)
            </p>
            <ul
                className="mt-xs flex flex-col gap-xs font-mono text-caption text-on-surface"
                data-testid="lifecycle-log"
            >
                {lines.length === 0 ? (
                    <li className="text-on-surface-variant">— waiting for events —</li>
                ) : (
                    lines.map((line, i) => <li key={i}>{line}</li>)
                )}
            </ul>
        </div>
    );
}
