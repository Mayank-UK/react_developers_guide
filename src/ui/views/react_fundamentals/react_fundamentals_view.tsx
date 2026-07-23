import { useState, type ReactNode } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';

/**
 * ReactFundamentalsView — one consolidated screen covering the React mental
 * model and its core building blocks. The Flutter guide split these into many
 * sub-screens; React's surface is small enough that a single screen reads
 * better (and matches the request). Deep-dive topics that warrant their own
 * screens — lifecycle/effects, state-management libraries, routing — are
 * introduced here only enough to be "fundamental" and linked out.
 *
 * The screen leans on the shared design-system primitives (SectionWrapper,
 * ContentGroupWrapper, TextBlock, CodeBlock) so styling stays consistent with
 * the rest of the app. Interactive demos are kept as local functions: they're
 * only used in this file (see the "single file → local function" rule).
 */
export default function ReactFundamentalsView() {
    return (
        <div className="flex flex-col gap-md">
            <IntroSection />
            <JsxSection />
            <ComponentsAndPropsSection />
            <StateSection />
            <EventsSection />
            <ConditionalRenderingSection />
            <ListsAndKeysSection />
            <CompositionSection />
            <WhereNextSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What is React                                                           */
/* -------------------------------------------------------------------------- */

function IntroSection() {
    return (
        <SectionWrapper title="What is React?">
            <ContentGroupWrapper title="The mental model">
                <TextBlock>
                    {`React is a library for building user interfaces out of small,
reusable pieces called components. A component is just a function that takes
data (props) and returns a description of what should appear on screen (JSX).
React takes that description, compares it to what's already on screen, and
applies the smallest possible DOM change — that diffing step is the "virtual DOM".`}
                </TextBlock>
            </ContentGroupWrapper>

            <ContentGroupWrapper title="One-way data flow">
                <TextBlock>
                    {`Data flows down the tree from parent to child via props. When a
component's own state changes, React re-runs that component (and anything below
it that depends on the new data) and re-renders. There is no two-way binding by
default — you explicitly handle user input by listening to events and updating
state, which is more code but far more predictable.`}
                </TextBlock>
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Library, not framework">
                <TextBlock>
                    {`React deliberately ships only the view layer. Routing, data
fetching, state management and build tooling are separate concerns — this very
app picks React Router, TanStack Query / a clean-arch pipeline, and Vite. The
flip side: there are settled, idiomatic choices for each (the ones used here),
which the dedicated screens cover.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. JSX                                                                     */
/* -------------------------------------------------------------------------- */

function JsxSection() {
    return (
        <SectionWrapper title="JSX">
            <ContentGroupWrapper title="HTML-like syntax that produces elements">
                <TextBlock>
                    {`JSX looks like HTML inside JavaScript. It compiles down to plain
function calls (React.createElement / jsx). You can drop any JavaScript
expression into it with curly braces { }.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const name = 'React';
// JSX — looks like markup, is actually a function call.
const greeting = <h1>Hello, {name}!</h1>;

// The above is equivalent to:
const greeting2 = createElement('h1', null, 'Hello, ', name, '!');`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Expressions, not statements">
                <TextBlock>
                    {`Inside { } you can put any expression (a value), but not
statements (if/for/while). For logic use the ternary operator, &&, or
.map() — see the conditional and list sections below.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const count = 3;
const items = ['a', 'b', 'c'];

return (
  <div>
    <p>{count > 0 ? \`\${count} items\` : 'empty'}</p>
    <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
  </div>
);`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="className, not class">
                <TextBlock>
                    {`Because JSX maps to DOM objects (and class is a JS keyword), the
HTML class attribute becomes className. This app pairs className with Tailwind
utilities backed by design-system tokens — e.g. bg-surface, text-on-surface.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Components & props                                                      */
/* -------------------------------------------------------------------------- */

function ComponentsAndPropsSection() {
    return (
        <SectionWrapper title="Components & props">
            <ContentGroupWrapper title="A component is a function returning JSX">
                <TextBlock>
                    {`Name components with a Capital letter — lowercase tags are treated
as DOM strings (<div>), capitalized ones as component references (<Button />).
Props are the single argument: an object of whatever the parent passes in.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`type GreetingProps = { name: string };

function Greeting({ name }: GreetingProps) {
  return <p>Hello, {name}!</p>;
}

// Usage — props are passed like HTML attributes:
<Greeting name="Sam" />`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Props are read-only">
                <TextBlock>
                    {`A component must never mutate its own props — they're owned by the
parent. If something needs to change, that's state (next section). This rule is
what keeps components predictable and easy to test.`}
                </TextBlock>
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Live: props drive the output">
                <TextBlock>
                    {`Two Profile components, same code, different props. Change the data
at the call site and React updates only what changed.`}
                </TextBlock>
                <Example label="Props drive the output">
                    <PropsDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

type ProfileProps = { name: string; role: string; online: boolean };

/** Local demo: a presentational component driven entirely by props. */
function Profile({ name, role, online }: ProfileProps) {
    return (
        <div className="flex items-center gap-sm rounded-md border border-outline p-sm">
            <span
                className="inline-block h-[10px] w-[10px] rounded-full"
                style={{
                    backgroundColor: online
                        ? 'var(--color-secondary)'
                        : 'var(--color-outline)',
                }}
                aria-hidden
            />
            <div>
                <p className="text-body font-medium text-on-surface">
                    {name}
                </p>
                <p className="text-caption text-on-surface-variant">
                    {role}
                </p>
            </div>
        </div>
    );
}

function PropsDemo() {
    return (
        <div className="flex flex-col gap-sm">
            <Profile name="Ada Lovelace" role="Engineer" online />
            <Profile name="Alan Turing" role="Researcher" online={false} />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. State (useState)                                                        */
/* -------------------------------------------------------------------------- */

function StateSection() {
    return (
        <SectionWrapper title="State with useState">
            <ContentGroupWrapper title="The useState hook">
                <TextBlock>
                    {`useState gives a component memory that survives re-renders. It
returns the current value and a setter; calling the setter schedules a re-render
with the new value. Hooks only work inside components (or other hooks) and must
be called unconditionally at the top level — never inside conditions or loops.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`import { useState } from 'react';

function Counter() {
  // const [currentValue, setter] = useState(initialValue)
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Live: a working counter">
                <TextBlock>
                    {`Clicking updates state; React re-renders this component only. The
"reset" button shows updating from the previous value (functional update) to
avoid stale-state bugs.`}
                </TextBlock>
                <Example label="A working counter">
                    <CounterDemo />
                </Example>
            </ContentGroupWrapper>

            <ContentGroupWrapper title="State is private and independent">
                <TextBlock>
                    {`Two instances of the same component each own their own state.
Sharing state across the tree is the job of lifting it up (a shared parent) or
a state-management library — covered in the State management screens.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// Functional update — safest when the next value depends on the previous:
setCount((prev) => prev + 1);

// Updating objects/arrays — always replace, never mutate:
setUser((prev) => ({ ...prev, name: 'New' });`}
                    caption="Objects and arrays are replaced (spread), not mutated in place."
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function CounterDemo() {
    const [count, setCount] = useState(0);
    return (
        <div className="flex flex-wrap items-center gap-sm">
            <button
                type="button"
                onClick={() => setCount((c) => c - 1)}
                className="rounded-md border border-outline px-md py-xs text-body text-on-surface hover:bg-surface-variant"
            >
                −
            </button>
            <span className="min-w-[2ch] text-center text-title font-medium tabular-nums text-on-surface">
                {count}
            </span>
            <button
                type="button"
                onClick={() => setCount((c) => c + 1)}
                className="rounded-md px-md py-xs text-on-primary shadow-button-card hover:shadow-button-card-hover"
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                +
            </button>
            <button
                type="button"
                onClick={() => setCount(0)}
                className="rounded-md border border-outline px-sm py-xs text-caption text-on-surface-variant hover:bg-surface-variant"
            >
                reset
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Events                                                                  */
/* -------------------------------------------------------------------------- */

function EventsSection() {
    return (
        <SectionWrapper title="Handling events">
            <ContentGroupWrapper title="onEvent props">
                <TextBlock>
                    {`Events look like inline HTML handlers but are synthetic — React
normalizes them across browsers. Pass a function (not a call) to onClick,
onChange, onSubmit, etc.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`function Search() {
  const [q, setQ] = useState('');
  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}   // controlled input
      onKeyDown={(e) => {
        if (e.key === 'Enter') alert(\`searching: \${q}\`);
      }}
    />
  );
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Live: controlled input">
                <TextBlock>
                    {`The input's value is driven by React state — this is called a
controlled component and is the React-standard way to handle forms.`}
                </TextBlock>
                <Example label="A controlled input">
                    <ControlledInputDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function ControlledInputDemo() {
    const [q, setQ] = useState('');
    return (
        <div className="flex flex-col gap-xs">
            <label className="text-caption text-on-surface-variant">
                Type something
            </label>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="controlled input"
                className="w-full max-w-[320px] rounded-md border border-outline bg-surface px-sm py-xs text-body text-on-surface outline-none focus:border-primary"
            />
            <p className="text-body-sm text-on-surface-variant">
                You typed: <span className="text-on-surface">{q || '—'}</span>{' '}
                <span className="text-caption">
                    ({q.length} chars)
                </span>
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Conditional rendering                                                   */
/* -------------------------------------------------------------------------- */

function ConditionalRenderingSection() {
    return (
        <SectionWrapper title="Conditional rendering">
            <ContentGroupWrapper title="Three idioms">
                <TextBlock>
                    {`Because JSX lets you embed any expression, conditionals are just
JS. Use: (1) ternary for either/or, (2) && for "render only when true", (3)
early return from the component for "none at all".`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// 1. ternary — either/or
{isLoggedIn ? <Dashboard /> : <SignIn />}

// 2. logical AND — render only when truthy
{hasError && <ErrorMessage />}

// 3. early return — render nothing
if (!user) return null;
return <Profile user={user} />;`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Live: toggle visibility">
                <TextBlock>
                    {`Toggling state flips between two renders via the ternary. Watch the
greeting swap without any manual DOM manipulation.`}
                </TextBlock>
                <Example label="Toggle visibility">
                    <ConditionalDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function ConditionalDemo() {
    const [on, setOn] = useState(false);
    return (
        <div className="flex flex-wrap items-center gap-sm">
            <button
                type="button"
                onClick={() => setOn((v) => !v)}
                className="rounded-md px-md py-xs text-on-primary shadow-button-card hover:shadow-button-card-hover"
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                {on ? 'Hide' : 'Show'} message
            </button>
            {on ? (
                <span className="rounded-md bg-surface-tint px-sm py-xs text-body-sm text-on-surface">
                    ✅ The message is visible.
                </span>
            ) : (
                <span className="text-body-sm text-on-surface-variant">
                    (nothing rendered)
                </span>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Lists & keys                                                            */
/* -------------------------------------------------------------------------- */

function ListsAndKeysSection() {
    return (
        <SectionWrapper title="Lists & keys">
            <ContentGroupWrapper title="Map data to elements">
                <TextBlock>
                    {`To render a list, map the array to JSX. Every repeated element
needs a stable, unique key so React can match items across renders and avoid
re-creating the wrong DOM nodes.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`type Task = { id: string; label: string };

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((t) => (
        // key must be stable & unique — prefer the item's id, not the index
        <li key={t.id}>{t.label}</li>
      ))}
    </ul>
  );
}`}
                    caption="Prefer a stable id as key. Array index is fine only for static, never-reordered lists."
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Live: add & remove">
                <TextBlock>
                    {`Adding/removing reuses DOM for unchanged items thanks to keys.
Notice the input resets to empty after each add — that's per-component state.`}
                </TextBlock>
                <Example label="Add & remove with keys">
                    <ListDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

type Task = { id: number; label: string };

function ListDemo() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, label: 'Learn JSX' },
        { id: 2, label: 'Build a component' },
    ]);
    const [draft, setDraft] = useState('');

    const add = () => {
        const label = draft.trim();
        if (!label) return;
        setTasks((prev) => [...prev, { id: Date.now(), label }]);
        setDraft('');
    };

    const remove = (id: number) =>
        setTasks((prev) => prev.filter((t) => t.id !== id));

    return (
        <div className="flex flex-col gap-xs">
            <div className="flex flex-wrap gap-xs">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                    placeholder="Add a task…"
                    className="flex-1 rounded-md border border-outline bg-surface px-sm py-xs text-body text-on-surface outline-none focus:border-primary"
                />
                <button
                    type="button"
                    onClick={add}
                    className="rounded-md px-md py-xs text-on-primary shadow-button-card hover:shadow-button-card-hover"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Add
                </button>
            </div>
            <ul className="flex flex-col gap-xs">
                {tasks.map((t) => (
                    <li
                        key={t.id}
                        className="flex items-center justify-between rounded-md border border-outline px-sm py-xs"
                    >
                        <span className="text-body-sm text-on-surface">
                            {t.label}
                        </span>
                        <button
                            type="button"
                            onClick={() => remove(t.id)}
                            className="rounded-sm px-xs text-caption text-on-surface-variant hover:bg-black/5"
                        >
                            remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Composition (children)                                                  */
/* -------------------------------------------------------------------------- */

function CompositionSection() {
    return (
        <SectionWrapper title="Composition: props.children">
            <ContentGroupWrapper title="The children prop">
                <TextBlock>
                    {`children is React's composition primitive — whatever you nest
between a component's opening and closing tags is passed in as props.children.
It's how every reusable wrapper in this app works (SectionWrapper,
CodeBlock, the layout's <Outlet/>).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}   {/* whatever was nested goes here */}
    </section>
  );
}

// Call site — the <p>...</p> becomes props.children
<Card title="Hello">
  <p>Any JSX can go here.</p>
</Card>`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Prefer composition over config">
                <TextBlock>
                    {`Before reaching for inheritance (which React doesn't have) or deep
prop drilling, ask if you can compose smaller pieces. render props and
"children as a function" are advanced forms of the same idea.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 9. Where next                                                              */
/* -------------------------------------------------------------------------- */

function WhereNextSection() {
    const chips: { label: string; note: ReactNode }[] = [
        { label: 'Lifecycle', note: 'mount / update / unmount via effects' },
        {
            label: 'State management',
            note: 'hooks, Redux, Zustand, TanStack Query',
        },
        { label: 'Navigation', note: 'React Router data router' },
    ];
    return (
        <SectionWrapper title="Where these fundamentals go next">
            <TextBlock>
                {`The building blocks above are enough to read most React code. The
following screens take each advanced topic deeper — they all compose from
exactly the primitives covered here.`}
            </TextBlock>
            <div className="flex flex-col gap-xs">
                {chips.map((c) => (
                    <div
                        key={c.label}
                        className="flex flex-wrap items-center gap-sm rounded-md border border-outline px-sm py-xs"
                    >
                        <span className="text-body-sm font-medium text-on-surface">
                            {c.label}
                        </span>
                        <span className="text-caption text-on-surface-variant">
                            — {c.note}
                        </span>
                    </div>
                ))}
            </div>
        </SectionWrapper>
    );
}
