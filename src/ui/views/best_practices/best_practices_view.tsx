import { memo, useCallback, useMemo, useState } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';

/**
 * BestPracticesView — the conventions that keep a React app fast and readable.
 *
 * This is not a list of "rules someone made up"; each item below is the fix for
 * a specific failure mode — a slow list, a stale closure, an inaccessible
 * button, a refactor that breaks because the wrong thing was optimised. The
 * throughline: render is cheap until it isn't, code is readable until it isn't,
 * and both are defended by the same handful of habits.
 */
export default function BestPracticesView() {
    return (
        <div className="flex flex-col gap-md">
            <MentalModelSection />
            <KeysSection />
            <MemoSection />
            <LazySection />
            <EffectsSection />
            <AccessibilitySection />
            <MaintainabilitySection />
            <ReactVsFlutterSection />
            <LiveRenderSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Mental model                                                            */
/* -------------------------------------------------------------------------- */

function MentalModelSection() {
    return (
        <SectionWrapper title="The mental model — render is cheap, until it isn't">
            <ContentGroupWrapper title="Optimise for the common case, measure before the rest">
                <TextBlock>
                    {`React re-runs a component's function body whenever its state or a
parent's render changes it. For a typical component that is fine — a function
call is cheap. The practices below are not "always do this"; they are "reach for
this when render becomes the problem". The worst React code is over-optimised:
useMemo wrapping a literal, React.memo on a component that never re-renders
anyway, useCallback on a handler passed to a div. Write the clear version first,
profile when something is actually slow, then apply the targeted fix. The live
demo at the bottom shows what a real, justified memoization saves.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Keys                                                                    */
/* -------------------------------------------------------------------------- */

function KeysSection() {
    return (
        <SectionWrapper title="Stable keys — the one rule that is never optional">
            <ContentGroupWrapper title="Use a real id, never the array index">
                <TextBlock>
                    {`When you render a list, React matches items between renders by their
key. A stable key (the item's id) lets React reuse the DOM node and preserve
component state when the list reorders, filters, or inserts. Using the array
index as the key works until it doesn't: delete the second of three todos and
React keeps the wrong DOM node, so the third item inherits the second's input
state, checkboxes, and animations. This is not a performance tip — it is a
correctness bug. If the data has no natural id, generate one when you create it,
not when you render it.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// good — stable id from the data
{posts.map((p) => <PostItem key={p.id} post={p} />)}

// bug — index key: deleting a middle item scrambles state below it
{posts.map((p, i) => <PostItem key={i} post={p} />)}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Memoization                                                             */
/* -------------------------------------------------------------------------- */

function MemoSection() {
    return (
        <SectionWrapper title="Memoization — the three tools and when each earns its keep">
            <ContentGroupWrapper title="useMemo, useCallback, React.memo — and the cost they carry">
                <TextBlock>
                    {`Each tool trades one cost for another:

• useMemo(() => fn(a), [a]) caches the RESULT of an expensive computation so it
  isn't re-run on every render. Worth it when the computation is genuinely heavy
  (filtering/sorting a large list) and the inputs rarely change. For a cheap
  derivation it costs more than it saves.

• useCallback(fn, [deps]) caches the FUNCTION IDENTITY so a child that receives
  it as a prop doesn't re-render. Pointless unless the child is itself memoized
  (React.memo) — otherwise the child re-renders anyway because its props object
  changed. The two go together.

• React.memo(Component) skips re-rendering a child when its props are unchanged.
  Pays off for a heavy child rendered in a list. But memo compares props
  shallowly — pass it a new object/array/function every render and it never
  skips, which is why memo + useCallback + useMemo arrive as a set.

The live demo below isolates a justified case: a list whose re-sort is memoized,
so typing in an unrelated input doesn't re-sort on every keystroke.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const ExpensiveItem = memo(function ExpensiveItem({ post }: Props) {
  return <li>{heavyFormat(post)}</li>;           // React.memo: skip if props equal
});

function List({ posts, query }: Props) {
  // useMemo: don't re-run the expensive filter/sort unless inputs change
  const sorted = useMemo(
    () => [...posts].sort(byTitle).filter(matches(query)),
    [posts, query],
  );
  return sorted.map((p) => <ExpensiveItem key={p.id} post={p} />);
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Code splitting / lazy                                                   */
/* -------------------------------------------------------------------------- */

function LazySection() {
    return (
        <SectionWrapper title="Code splitting — load screens on demand">
            <ContentGroupWrapper title="React.lazy + Suspense for route-level chunks">
                <TextBlock>
                    {`A single-page app ships one bundle by default, so a user lands and
downloads every screen before seeing the first one. React.lazy splits a
component into its own chunk loaded on first render; wrap the lazy import in a
<Suspense> boundary to show a fallback while it streams. The biggest win is at
the route level — each screen becomes a separate file the user only fetches when
they navigate to it. This app currently bundles everything into one chunk
(visible in the build output); converting the route elements to React.lazy would
split it per screen with no behaviour change.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// route-level lazy loading — each screen is its own chunk
const ArchitectureView = lazy(() => import('./views/architecture/architecture_view'));

<Suspense fallback={<ScreenSkeleton/>}>
  <Route path="/architecture" element={<ArchitectureView/>} />
</Suspense>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Effects                                                                 */
/* -------------------------------------------------------------------------- */

function EffectsSection() {
    return (
        <SectionWrapper title="Effects — the escape hatch, not the default">
            <ContentGroupWrapper title="Derive in render; sync in effect; never derive in effect">
                <TextBlock>
                    {`useEffect is for synchronising with something outside React (a
subscription, the DOM, a timer) — it is not for transforming data. A common
mistake is "compute X in state, update it in an effect", which causes an extra
render and a flash of stale data. If X can be computed from existing props/state
during render, compute it during render (or useMemo). Effects also need a
correct dependency array: list every reactive value you read, and return a
cleanup for anything you start. The Lifecycle screen covers the rules in depth;
the practice here is simply — reach for an effect last, not first.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// bad — derived data round-tripped through state + effect (double render)
const [filtered, setFiltered] = useState(posts);
useEffect(() => { setFiltered(posts.filter(p => p.done)); }, [posts]);

// good — derived directly in render (single render, always fresh)
const filtered = useMemo(() => posts.filter((p) => p.done), [posts]);`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Accessibility                                                           */
/* -------------------------------------------------------------------------- */

function AccessibilitySection() {
    return (
        <SectionWrapper title="Accessibility — not optional, and it makes tests better too">
            <ContentGroupWrapper title="Semantic HTML is 90% of it; the rest is intent">
                <TextBlock>
                    {`Accessible UI is built from semantic HTML: a <button> (not a div with
onClick) gets keyboard focus, Enter/Space, and screen-reader announcement for
free. <label> wraps its input. Headings form a real outline. Images get alt
text; decorative ones get alt="". Focus-visible styling shows keyboard users
where they are. The bonus: Testing Library queries by role and label, so writing
accessible components makes them testable — getByRole('button', { name: 'Add'})
works precisely because the button is real and labelled. Conversely, a div-based
"button" is neither accessible nor queryable.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// good — real button, real label, focus-visible
<button type="button" onClick={add} className="focus-visible:outline …">Add</button>
<label className="…">Email <input type="email" /></label>

// bad — div "button": no keyboard, no role, not queryable by name
<div onClick={add} className="cursor-pointer">Add</div>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Maintainability                                                         */
/* -------------------------------------------------------------------------- */

function MaintainabilitySection() {
    return (
        <SectionWrapper title="Maintainability — composition and single responsibility">
            <ContentGroupWrapper title="Small components, composed; one job each">
                <TextBlock>
                    {`A component that does one thing is reusable, testable, and readable;
one that does five is none of those. Compose: build the screen from sections,
sections from groups, groups from primitives — the shared components in
ui/components are exactly this layer. Keep state as local as it can be (lift it
only when two siblings need it), name things for what they are not how they're
implemented, and let the architecture's layers carry the cross-cutting concerns
(fetching, errors, wiring) so components stay about presentation. The result,
visible across every screen in this app, is that a new screen is mostly
assembling existing pieces — not writing new ones.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — different runtimes, overlapping habits">
            <ContentGroupWrapper title="Keys map to keys; memoization maps to const; effects map to lifecycle">
                <TextBlock>
                    {`• Keys — Flutter's ListView uses a Key for the same reason React does
  (match items across rebuilds); the index-key bug exists in both.

• Memoization — React's useMemo/useCallback/React.memo have no single Flutter
  analogue; Flutter widgets are immutable and rebuild by diffing, with const
  constructors doing some of what React.memo does. The React habits are more
  explicit because React re-runs function bodies.

• Effects — React's useEffect unifies what Flutter spreads across initState /
  didChangeDependencies / dispose. Same rule: synchronise external systems, and
  always clean up.

• Accessibility — Flutter needs semantics annotations and semantic labels
  manually; the web's semantic HTML gives React a head start, but only if you
  actually use the right elements.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 9. Live — render-count comparison                                          */
/* -------------------------------------------------------------------------- */

function LiveRenderSection() {
    return (
        <SectionWrapper title="Live — see memoization skip a re-render">
            <ContentGroupWrapper title="Type in the box; watch which child re-renders">
                <TextBlock>
                    {`Two identical lists, side by side. The left re-sorts its items on every
parent render (no memo). The right memoizes the sort with useMemo and wraps the
item in React.memo. Type in the input: the parent re-renders on every keystroke,
the left child's render count climbs, the right child's stays flat. That gap —
multiplied across a real list — is the case where memoization earns its keep.
The render counts are real (a ref incremented in the component body).`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="re-render comparison — memoized vs not">
                <RenderComparison />
            </Example>
        </SectionWrapper>
    );
}

/** A child that reports how many times it has rendered, via a ref counter. */
function makeCountedItem(id: string, counter: { n: number }) {
    const Item = function CountedItem({ label }: { label: string }) {
        // Render-counting via a mutable ref is the documented escape hatch for
        // "how many times did this render?" — there is no effect-free way to
        // observe a render, so we intentionally mutate during render here.
        // eslint-disable-next-line react-hooks/immutability
        counter.n += 1;
        return (
            <li className="flex items-center justify-between rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface">
                <span>{label}</span>
                <span className="font-mono text-caption text-on-surface-variant">
                    render #{counter.n}
                </span>
            </li>
        );
    };
    Item.displayName = `CountedItem-${id}`;
    return Item;
}

const UnmemoItem = makeCountedItem('unmemo', { n: 0 });
const MemoItem = memo(makeCountedItem('memo', { n: 0 }));

function RenderComparison() {
    const [query, setQuery] = useState('');
    const [items] = useState(() => [
        { id: '1', label: 'Zebra' },
        { id: '2', label: 'Apple' },
        { id: '3', label: 'Mango' },
        { id: '4', label: 'Banana' },
    ]);

    // Left: re-sorted on every render (cheap here, but stands in for a heavy op).
    const unmemoSorted = [...items].sort((a, b) => a.label.localeCompare(b.label));

    // Right: sorted only when items change — stable across keystrokes.
    const memoSorted = useMemo(
        () => [...items].sort((a, b) => a.label.localeCompare(b.label)),
        [items],
    );

    // Stable handler so the memoized subtree's props don't churn.
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    }, []);

    return (
        <div className="flex flex-col gap-md">
            <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                parent input
                <input
                    value={query}
                    onChange={onChange}
                    placeholder="type here to re-render the parent…"
                    className="w-full max-w-sm rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                />
            </label>

            <div className="grid gap-md sm:grid-cols-2">
                <Column title="no memo" subtitle="re-sorts + re-renders every keystroke">
                    <ul className="flex flex-col gap-xs">
                        {unmemoSorted.map((it) => (
                            <UnmemoItem key={it.id} label={it.label} />
                        ))}
                    </ul>
                </Column>
                <Column title="useMemo + React.memo" subtitle="skips work when inputs are unchanged">
                    <ul className="flex flex-col gap-xs">
                        {memoSorted.map((it) => (
                            <MemoItem key={it.id} label={it.label} />
                        ))}
                    </ul>
                </Column>
            </div>
            <p className="text-caption text-on-surface-variant">
                The render numbers reset on each full page load. Type a few
                characters: the left numbers climb, the right stay put — that is
                a memoized subtree refusing the parent's re-render.
            </p>
        </div>
    );
}

function Column({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-sm rounded-md border border-outline bg-surface-variant p-md">
            <div className="flex flex-col gap-[2px]">
                <span className="text-body-sm font-semibold text-on-surface">{title}</span>
                <span className="text-caption text-on-surface-variant">{subtitle}</span>
            </div>
            {children}
        </div>
    );
}
