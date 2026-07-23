import { useEffect, useState } from 'react';
import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';

/**
 * ResponsiveView — how a React web app adapts to phone / tablet / desktop.
 *
 * React itself has no "responsive" API — responsiveness lives in CSS. What
 * React brings is (a) the choice of styling layer (this app uses Tailwind v4,
 * covered on the Tailwind screen) and (b) JS hooks like `useMediaQuery` for the
 * cases where CSS alone can't decide (conditionally rendering whole subtrees,
 * reading the viewport in event handlers, etc.).
 *
 * Standard approaches, in order of preference:
 *   1. CSS / Tailwind responsive utilities (mobile-first)  — always try first.
 *   2. CSS container queries                               — adapt to a parent box.
 *   3. JS `matchMedia` via a `useMediaQuery` hook           — only when logic needs it.
 *
 * Every concept below ships with a visible, resize-aware example.
 */
export default function ResponsiveView() {
    return (
        <div className="flex flex-col gap-md">
            <MobileFirstSection />
            <BreakpointsSection />
            <PatternsSection />
            <MediaQuerySection />
            <UseMediaQuerySection />
            <ContainerQuerySection />
            <TestingSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 0. Mobile-first mental model                                               */
/* -------------------------------------------------------------------------- */

function MobileFirstSection() {
    const { width, active } = useViewportBreakpoint();
    return (
        <SectionWrapper title="Responsive = adapt to the viewport">
            <ContentGroupWrapper title="One codebase, every screen width">
                <TextBlock>
                    {`A responsive layout reflows itself as the viewport (the visible page
area) changes width: one column on a phone, two on a tablet, a full grid on a
desktop. The page is never rebuilt per device — the same DOM restyles itself via
CSS rules that are scoped to width ranges. The browser reports its width; your
CSS picks the right layout. React doesn't drive this; CSS does.`}
                </TextBlock>
                <CodeBlock
                    language="html"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            The viewport meta tag — mandatory in{' '}
                            <code className="font-mono">index.html</code>. Without it a
                            phone renders the desktop layout shrunk to ~980px.
                        </span>
                    }
                    code={`<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1" />`}
                />
                <TextBlock>
                    {`Mobile-first is the mental model: write base styles for the smallest
screen, then ADD overrides as the screen gets wider. You never write "desktop
then scale down" — you write "phone then layer up". Tailwind encodes this in its
variant order: unprefixed = mobile (base), sm: = ≥640px, md: = ≥768px, etc.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Live: your current viewport">
                <p className="text-body-sm text-on-surface-variant">
                    Resize this browser window (or open device emulation in
                    devtools) and watch the readout change. This is the same
                    `matchMedia` API the later hook uses.
                </p>
                <div
                    className="flex flex-wrap items-center gap-md rounded-md border border-outline bg-surface p-md"
                    data-testid="viewport-readout"
                >
                    <div>
                        <p className="text-overline text-on-surface-variant">
                            viewport width
                        </p>
                        <p
                            className="font-mono text-title-sm text-on-surface"
                            data-testid="viewport-width"
                        >
                            {width == null ? '—' : `${width}px`}
                        </p>
                    </div>
                    <div>
                        <p className="text-overline text-on-surface-variant">
                            active breakpoint (mobile-first)
                        </p>
                        <p
                            className="font-mono text-title-sm text-primary"
                            data-testid="active-breakpoint"
                        >
                            {active}
                        </p>
                    </div>
                </div>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Tailwind breakpoints                                                    */
/* -------------------------------------------------------------------------- */

const TAILWIND_BREAKPOINTS = [
    { name: 'base', min: 0, note: 'unprefixed — mobile first' },
    { name: 'sm:', min: 640, note: 'landscape phones' },
    { name: 'md:', min: 768, note: 'tablets' },
    { name: 'lg:', min: 1024, note: 'laptops' },
    { name: 'xl:', min: 1280, note: 'desktops' },
    { name: '2xl:', min: 1536, note: 'large screens' },
];

function BreakpointsSection() {
    return (
        <SectionWrapper title="Tailwind responsive breakpoints">
            <ContentGroupWrapper title="Prefix a utility with a breakpoint">
                <TextBlock>
                    {`Tailwind ships six width thresholds (min-width, mobile-first). Put the
prefix in front of any utility and it only applies from that width up:
grid-cols-1 always, sm:grid-cols-2 from 640px, lg:grid-cols-4 from 1024px. The
thresholds map to CSS @media (min-width: ...) under the hood — that's all a
responsive variant is.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`/* one column on phones, two on tablets, four on laptops+ */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {items.map(i => <Card key={i.id} {...i} />)}
</div>`}
                />
                <div className="overflow-hidden rounded-md border border-outline">
                    <table className="w-full border-collapse text-body-sm">
                        <thead>
                            <tr className="bg-surface-variant text-on-surface-variant">
                                <th className="px-md py-xs text-left font-semibold">
                                    prefix
                                </th>
                                <th className="px-md py-xs text-left font-semibold">
                                    min-width
                                </th>
                                <th className="px-md py-xs text-left font-semibold">
                                    applies to
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {TAILWIND_BREAKPOINTS.map((b) => (
                                <tr
                                    key={b.name}
                                    className="border-t border-outline"
                                >
                                    <td className="px-md py-xs font-mono text-on-surface">
                                        {b.name}
                                    </td>
                                    <td className="px-md py-xs font-mono text-on-surface-variant">
                                        {b.min === 0 ? '—' : `${b.min}px`}
                                    </td>
                                    <td className="px-md py-xs text-on-surface-variant">
                                        {b.note}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ContentGroupWrapper>
            <Example label="Resize to watch columns reflow">
                <p className="text-body-sm text-on-surface-variant">
                    A single grid, <code className="font-mono">grid-cols-1
                    sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4</code>. Narrow
                    the window slowly and count the columns snapping at each
                    threshold.
                </p>
                <div
                    className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    data-testid="reflow-grid"
                >
                    {REFLOW_TILES.map((t) => (
                        <div
                            key={t}
                            className="flex h-[64px] items-center justify-center rounded-md border border-outline bg-surface font-mono text-body-sm text-on-surface-variant"
                        >
                            {t}
                        </div>
                    ))}
                </div>
            </Example>
        </SectionWrapper>
    );
}

const REFLOW_TILES = Array.from({ length: 8 }, (_, i) => `cell ${i + 1}`);

/* -------------------------------------------------------------------------- */
/* 2. Common responsive patterns                                              */
/* -------------------------------------------------------------------------- */

function PatternsSection() {
    return (
        <SectionWrapper title="Everyday responsive patterns">
            <ContentGroupWrapper title="Hide / show, reflow, reorder">
                <TextBlock>
                    {`Most responsive work is three moves, all done with utilities:
hidden / block to show things only at certain widths; changing the column count
of a grid; and order-* to resequence flex/grid children. The example below does
all three — a two-column "sidebar + main" layout on desktop that collapses to a
single stacked column on mobile, with a desktop-only sidebar that is hidden on
phones.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<div className="flex flex-col gap-md lg:flex-row">
  {/* sidebar: hidden on phones, shown ≥1024px */}
  <aside className="hidden w-[240px] shrink-0 lg:block">
    <Nav />
  </aside>

  {/* main: full width on mobile, flex-1 on desktop */}
  <main className="flex-1">
    <Cards className="grid grid-cols-1 sm:grid-cols-2" />
  </main>
</div>

{/* reorder: card renders first in source, but first on desktop, last on mobile */}
<div className="order-2 md:order-1" />`}
                />
            </ContentGroupWrapper>
            <Example label="Sidebar + main, collapsing">
                <p className="text-body-sm text-on-surface-variant">
                    Below 1024px the sidebar vanishes and the cards stack /
                    re-grid. The label badge also swaps: "phone" shows on mobile,
                    "desktop" shows ≥1024px.
                </p>
                <div className="flex flex-col gap-md lg:flex-row">
                    <aside
                        className="hidden w-[220px] shrink-0 rounded-md border border-outline bg-surface-variant p-md lg:block"
                        data-testid="desktop-sidebar"
                    >
                        <p className="text-overline text-on-surface-variant">
                            sidebar
                        </p>
                        <p className="mt-xs text-body-sm text-on-surface">
                            nav item
                        </p>
                        <p className="text-body-sm text-on-surface">
                            nav item
                        </p>
                    </aside>
                    <main className="flex-1">
                        <div className="mb-xs">
                            <span
                                className="rounded-pill bg-surface-variant px-sm py-[2px] text-overline text-on-surface-variant lg:hidden"
                                data-testid="phone-badge"
                            >
                                phone layout
                            </span>
                            <span
                                className="hidden rounded-pill bg-primary-container px-sm py-[2px] text-overline text-on-primary lg:inline"
                                data-testid="desktop-badge"
                            >
                                desktop layout
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
                            <div className="h-[56px] rounded-md border border-outline bg-surface" />
                            <div className="h-[56px] rounded-md border border-outline bg-surface" />
                            <div className="h-[56px] rounded-md border border-outline bg-surface" />
                            <div className="h-[56px] rounded-md border border-outline bg-surface" />
                        </div>
                    </main>
                </div>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Plain CSS @media (the engine under Tailwind)                           */
/* -------------------------------------------------------------------------- */

function MediaQuerySection() {
    return (
        <SectionWrapper title="CSS media queries — the engine under Tailwind">
            <ContentGroupWrapper title="@media (min-width: ...) is all it is">
                <TextBlock>
                    {`A Tailwind responsive variant compiles to a CSS media query. If you ever
write plain CSS (or a .css file in this project), this is the syntax. Min-width
queries = mobile-first: the rule inside only applies once the viewport reaches
that width. There is nothing React-specific here — it's the CSS standard that
every responsive site on the web rests on.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* mobile-first: base = 1 column */
.grid { display: grid; grid-template-columns: 1fr; }

/* ≥640px: 2 columns — Tailwind's sm: */
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* ≥1024px: 4 columns — Tailwind's lg: */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}

/* also useful: orientation and pointer (is the user on touch?) */
@media (orientation: landscape) { ... }
@media (hover: hover) and (pointer: fine) { /* real mouse */ }`}
                />
                <TextBlock>
                    {`Rule of thumb: prefer min-width (mobile-first). Max-width
(max-width: ...) reads as "desktop then override downward" and tends to fight the
cascade — it works, but the mobile-first direction is what Tailwind, Bootstrap,
and modern CSS all assume.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. JS-driven: the useMediaQuery hook                                       */
/* -------------------------------------------------------------------------- */

function UseMediaQuerySection() {
    const [tick, setTick] = useState(0);
    const { matches: isDesktop, recheck } = useMediaQuery('(min-width: 1024px)');
    return (
        <SectionWrapper title="When CSS isn't enough: useMediaQuery">
            <ContentGroupWrapper title="Read the viewport from JS, reactively">
                <TextBlock>
                    {`CSS handles layout 95% of the time. Reach for JS only when you must —
e.g. conditionally rendering an entirely different component, pausing an
animation off-screen, or branching in an event handler. The standard primitive is
window.matchMedia(query) wrapped in a hook that subscribes to changes and
re-renders. Note the cleanup: React 18 StrictMode mounts twice in dev, so the
removeEventListener matters.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`import { useEffect, useState } from 'react';

/** true when the given media query currently matches; updates on change. */
export function useMediaQuery(query: string): boolean {
  const get = () =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();                       // sync once on mount
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// usage — render a different UI shape at the breakpoint:
function Header() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? <FullNav /> : <HamburgerMenu />;
}`}
                />
            </ContentGroupWrapper>
            <Example label="JS branch on viewport width">
                <p className="text-body-sm text-on-surface-variant">
                    This block calls the hook on{' '}
                    <code className="font-mono">(min-width: 1024px)</code> and
                    renders a different component subtree accordingly. Resize
                    across 1024px (or click re-check) to see it flip.
                </p>
                <div
                    className="rounded-md border border-outline bg-surface p-md"
                    data-testid="mq-result"
                >
                    <p className="text-overline text-on-surface-variant">
                        isDesktop = useMediaQuery('(min-width: 1024px)')
                    </p>
                    <p className="mt-xs font-mono text-title-sm text-on-surface">
                        {String(isDesktop)}
                    </p>
                    <p className="mt-xs text-body-sm text-primary">
                        {isDesktop
                            ? '→ rendering FullNav (desktop)'
                            : '→ rendering HamburgerMenu (mobile)'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        recheck();
                        setTick((n) => n + 1);
                    }}
                    className="self-start rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                >
                    re-check (re-read query) #{tick}
                </button>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Container queries (modern CSS)                                          */
/* -------------------------------------------------------------------------- */

function ContainerQuerySection() {
    // The slider controls the container's width — NOT the viewport — so you can
    // see container queries respond to the parent box without resizing the window.
    const [pct, setPct] = useState(40);
    return (
        <SectionWrapper title="Container queries — adapt to a parent box">
            <ContentGroupWrapper title="Component-scoped responsiveness">
                <TextBlock>
                    {`Media queries respond to the viewport. Container queries respond to a
parent element's size — so a card placed in a narrow sidebar or a wide page can
rearrange itself based on the room IT has, regardless of the window. Crucial for
reusable components. Mark the parent with container-type: inline-size, then query
it with @container. Tailwind v4 exposes these as @sm:, @md:, … variants on a
marked container.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* the parent opts in to being a query container */
.card-shell { container-type: inline-size; }

/* children adapt to the PARENT's inline size, not the viewport */
@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 1fr; }
}`}
                />
            </ContentGroupWrapper>
            <Example label="Drag the slider — resize the box, not the window">
                <p className="text-body-sm text-on-surface-variant">
                    The container below is <code className="font-mono">pct</code>%{' '}
                    of the example's width. Past 400px of actual inline size its
                    children flip from one column to two. The viewport never
                    changes.
                </p>
                <input
                    type="range"
                    min={20}
                    max={100}
                    value={pct}
                    onChange={(e) => setPct(Number(e.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                    aria-label="container width"
                    data-testid="cq-slider"
                />
                <div
                    className="cq-shell mx-auto"
                    style={{ width: `${pct}%` }}
                    data-testid="cq-container"
                >
                    <div className="cq-card cq-item">A</div>
                    <div className="cq-card cq-item">B</div>
                    <div className="cq-card cq-item">C</div>
                    <div className="cq-card cq-item">D</div>
                </div>
                <style>{`
          .cq-shell { container-type: inline-size; display: grid; gap: 8px;
                      grid-template-columns: 1fr; transition: width .15s ease; }
          .cq-card { height: 44px; border-radius: var(--radius-md);
                     border: 1px solid var(--color-outline);
                     background: var(--color-surface);
                     display: flex; align-items: center; justify-content: center;
                     font-family: var(--font-mono); color: var(--color-on-surface-variant); }
          @container (min-width: 360px) {
            .cq-shell { grid-template-columns: 1fr 1fr; }
          }
        `}</style>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Testing responsiveness                                                  */
/* -------------------------------------------------------------------------- */

function TestingSection() {
    return (
        <SectionWrapper title="Testing responsive layouts">
            <ContentGroupWrapper title="How you actually verify it">
                <TextBlock>
                    {`Responsiveness is visual, so the verification is visual: open the
browser's device toolbar (Chrome devtools → the phone icon, or its "Responsive"
preset) and drag the width handle across your breakpoints, watching the layout
reflow. For automated checks, Playwright can resize the page
(page.setViewportSize) and screenshot each width — that's how the screens in this
app are verified before being marked done.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            Playwright — capture each breakpoint.
                        </span>
                    }
                    code={`import { test, expect } from '@playwright/test';

const sizes = [['mobile', 375], ['tablet', 768], ['desktop', 1280]] as const;

for (const [name, width] of sizes) {
  test('layout at ' + name, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/ui');
    await expect(page).toHaveScreenshot('ui-' + name + '.png');
  });
}`}
                />
                <TextBlock>
                    {`Avoid reaching for JS to measure width when CSS will do. A common
mistake is a useWindowSize() hook that re-renders on every pixel of resize —
preference order is CSS utilities → container queries → JS hook, and the JS hook
only for genuine render-time branching.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* Shared local hooks — demonstrated here, kept local because they teach the  */
/* concept on this screen. Promote to src/ui/hooks if reused elsewhere.       */
/* -------------------------------------------------------------------------- */

/** Subscribe to a media query; re-render when it flips. Also exposes a
 *  `recheck` to force a fresh read of the current match (e.g. from a button). */
function useMediaQuery(query: string): { matches: boolean; recheck: () => void } {
    const read = () =>
        typeof window !== 'undefined'
            ? window.matchMedia(query).matches
            : false;
    const [matches, setMatches] = useState(read);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);

    return { matches, recheck: () => setMatches(read()) };
}

/** Track both the live pixel width and the active mobile-first breakpoint. */
function useViewportBreakpoint(): {
    width: number | null;
    active: string;
} {
    const [width, setWidth] = useState<number | null>(
        () =>
            typeof window !== 'undefined' ? window.innerWidth : null,
    );

    useEffect(() => {
        // Throttle with requestAnimationFrame so a drag-resize doesn't flood
        // React with a setState per pixel — the very "common mistake" this
        // screen warns against one section up.
        let frame = 0;
        const onResize = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setWidth(window.innerWidth));
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const active = width == null
        ? 'unknown'
        : width >= 1536
          ? '2xl (≥1536px)'
          : width >= 1280
            ? 'xl (≥1280px)'
            : width >= 1024
              ? 'lg (≥1024px)'
              : width >= 768
                ? 'md (≥768px)'
                : width >= 640
                  ? 'sm (≥640px)'
                  : 'base / mobile';
    return { width, active };
}
