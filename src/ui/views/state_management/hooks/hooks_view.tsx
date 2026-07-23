import { useReducer, useState } from 'react';
import { SectionWrapper } from '../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../components/content-group-wrapper';
import { TextBlock } from '../../../components/text-block';
import { CodeBlock } from '../../../components/code-block';
import { Example } from '../../../components/example';

/**
 * HooksView — state with React's built-in primitives. No library.
 *
 * This is the foundation and the fallback for ~90% of state in a well-factored
 * app. Two hooks cover local state: useState for one independent value, useReducer
 * for several values that change together. Both demos build the SAME todo app so
 * you can feel where each starts to hurt or help.
 *
 * Rule of thumb shown below: STORE the minimum, DERIVE the rest. "Remaining
 * count" and the filtered list are computed during render from the source-of-
 * truth array — they are never separate pieces of state.
 */

type Todo = { id: number; text: string; done: boolean };
type Filter = 'all' | 'active' | 'done';

const SEED: Todo[] = [
    { id: 1, text: 'Read the React docs on state', done: true },
    { id: 2, text: 'Build the todo demo', done: false },
    { id: 3, text: 'Compare with the other tools', done: false },
];

export default function HooksView() {
    return (
        <div className="flex flex-col gap-md">
            <UseStateTodoSection />
            <DerivedStateSection />
            <UseReducerTodoSection />
            <LiftingAndContextSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. useState — the everyday todo                                            */
/* -------------------------------------------------------------------------- */

function UseStateTodoSection() {
    return (
        <SectionWrapper title="useState — one value, one setter">
            <ContentGroupWrapper title="The bread-and-butter hook">
                <TextBlock>
                    {`useState returns a tuple: the current value and a setter that
schedules a re-render with the next value. For a todo list the source of truth
is a single array; adding, toggling, and removing are all "produce a new array
with the change applied" — never mutate, because React skips re-renders when the
new value is === the old one. The filter and the remaining count below are NOT
stored: they're computed from the array every render.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const [todos, setTodos] = useState<Todo[]>(seed);

const add = (text: string) =>
  setTodos(t => [...t, { id: Date.now(), text, done: false }]);

const toggle = (id: number) =>
  setTodos(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));

const remove = (id: number) =>
  setTodos(t => t.filter(x => x.id !== id));

// derived — never stored
const remaining = todos.filter(t => !t.done).length;`}
                />
            </ContentGroupWrapper>
            <UseStateTodoDemo />
        </SectionWrapper>
    );
}

function UseStateTodoDemo() {
    const [todos, setTodos] = useState<Todo[]>(SEED);
    const [draft, setDraft] = useState('');
    const [filter, setFilter] = useState<Filter>('all');

    const add = () => {
        const text = draft.trim();
        if (!text) return;
        setTodos((t) => [...t, { id: Date.now(), text, done: false }]);
        setDraft('');
    };
    const toggle = (id: number) =>
        setTodos((t) =>
            t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
        );
    const remove = (id: number) =>
        setTodos((t) => t.filter((x) => x.id !== id));

    const remaining = todos.filter((t) => !t.done).length;
    const visible =
        filter === 'all'
            ? todos
            : filter === 'active'
              ? todos.filter((t) => !t.done)
              : todos.filter((t) => t.done);

    return (
        <Example label="The same todo app you'll see on every screen here">
            <div className="flex flex-col gap-sm" data-testid="usestate-demo">
                <div className="flex gap-xs">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && add()}
                        placeholder="Add a todo…"
                        aria-label="Add a todo"
                        className="flex-1 rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    />
                    <button
                        type="button"
                        onClick={add}
                        className="rounded-md px-md py-xs text-body-sm text-on-primary shadow-button-card hover:shadow-button-card-hover"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        Add
                    </button>
                </div>
                <FilterBar filter={filter} onChange={setFilter} />
                <TodoList
                    todos={visible}
                    onToggle={toggle}
                    onRemove={remove}
                    emptyHint={
                        filter === 'all'
                            ? 'Nothing yet — add one above.'
                            : 'Nothing in this filter.'
                    }
                />
                <p
                    className="text-caption text-on-surface-variant"
                    data-testid="remaining"
                >
                    {remaining} remaining · {todos.length} total
                </p>
            </div>
        </Example>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Derived state — compute, don't store                                    */
/* -------------------------------------------------------------------------- */

function DerivedStateSection() {
    return (
        <SectionWrapper title="Derive, don't duplicate">
            <ContentGroupWrapper title="The #1 useState mistake">
                <TextBlock>
                    {`If a value can be computed from state you already hold, compute it
during render — don't store it. A stored copy has to be kept in sync by hand,
and the moment you forget, the UI lies. The remaining count, the filtered list,
a "is the form valid" flag, a formatted price: all derived. This is also why the
todo above keeps only the array + the filter string, nothing else.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// ❌ duplicated state — two sources of truth that can drift
const [todos, setTodos] = useState([]);
const [remaining, setRemaining] = useState(0);   // must hand-update on every change

// ✅ derived — always correct, always free
const [todos, setTodos] = useState([]);
const remaining = todos.filter(t => !t.done).length;`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. useReducer — when transitions get tangled                               */
/* -------------------------------------------------------------------------- */

type Action =
    | { type: 'add'; text: string }
    | { type: 'toggle'; id: number }
    | { type: 'remove'; id: number }
    | { type: 'clearDone' };

function todoReducer(state: Todo[], action: Action): Todo[] {
    switch (action.type) {
        case 'add':
            return [
                ...state,
                { id: Date.now(), text: action.text, done: false },
            ];
        case 'toggle':
            return state.map((x) =>
                x.id === action.id ? { ...x, done: !x.done } : x,
            );
        case 'remove':
            return state.filter((x) => x.id !== action.id);
        case 'clearDone':
            return state.filter((x) => !x.done);
        default:
            return state;
    }
}

function UseReducerTodoSection() {
    return (
        <SectionWrapper title="useReducer — many transitions? group them">
            <ContentGroupWrapper title="Same todos, a reducer instead of setters">
                <TextBlock>
                    {`useState is perfect for one independent value. The moment several
values change together — or the next state depends on a description of what
happened rather than just "the new value" — pull the logic into a reducer. A
reducer is a pure function: (state, action) → nextState. The component just
dispatches intents ("add", "toggle", "clearDone") and stays free of branching
logic. It also makes the transitions trivially unit-testable in isolation.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`type Action =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number }
  | { type: 'clearDone' };

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggle':   return state.map(x => x.id === action.id ? { ...x, done: !x.done } : x);
    case 'remove':   return state.filter(x => x.id !== action.id);
    case 'clearDone':return state.filter(x => !x.done);
  }
}

const [todos, dispatch] = useReducer(todoReducer, SEED);
dispatch({ type: 'toggle', id: 2 });   // intent, not instructions`}
                />
            </ContentGroupWrapper>
            <UseReducerTodoDemo />
        </SectionWrapper>
    );
}

function UseReducerTodoDemo() {
    const [todos, dispatch] = useReducer(todoReducer, SEED);
    const [draft, setDraft] = useState('');

    const add = () => {
        const text = draft.trim();
        if (!text) return;
        dispatch({ type: 'add', text });
        setDraft('');
    };
    const remaining = todos.filter((t) => !t.done).length;

    return (
        <Example label="Same app — dispatched intents instead of setters">
            <div className="flex flex-col gap-sm">
                <div className="flex gap-xs">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && add()}
                        placeholder="Add a todo…"
                        aria-label="Add a todo"
                        className="flex-1 rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    />
                    <button
                        type="button"
                        onClick={add}
                        className="rounded-md px-md py-xs text-body-sm text-on-primary shadow-button-card hover:shadow-button-card-hover"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={() => dispatch({ type: 'clearDone' })}
                        className="rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                    >
                        Clear done
                    </button>
                </div>
                <TodoList
                    todos={todos}
                    onToggle={(id) => dispatch({ type: 'toggle', id })}
                    onRemove={(id) => dispatch({ type: 'remove', id })}
                    emptyHint="Nothing yet — add one above."
                />
                <p className="text-caption text-on-surface-variant">
                    {remaining} remaining · {todos.length} total
                </p>
            </div>
        </Example>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Lifting state up + Context                                              */
/* -------------------------------------------------------------------------- */

function LiftingAndContextSection() {
    return (
        <SectionWrapper title="Sharing beyond one component">
            <ContentGroupWrapper title="Lift it up, or pass it through Context">
                <TextBlock>
                    {`When two siblings need the same state, lift it to their nearest common
parent and pass it down as props. That is "lifting state up" and it is the
default answer. The cost is prop-drilling: passing the value (and its setter)
through components that don't care about it, just to reach a deep descendant.
A few levels is fine; when it becomes a chore, drop a Context in between —
create it once, read it anywhere with useContext, skip the middle layers. This
is exactly what the Redux / Zustand screens solve more completely for
app-wide state.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// Lift shared state to the common parent — siblings stay in sync.
function Parent() {
  const [text, setText] = useState('');
  return (
    <>
      <Writer text={text} onChange={setText} />
      <Reader text={text} />
    </>
  );
}

// When drilling gets deep, cut a layer out with Context.
const DraftContext = createContext('');
function DeepReader() {
  const text = useContext(DraftContext);   // skips every intermediate prop
  return <p>{text}</p>;
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* Shared presentational helpers (this file only).                            */
/* -------------------------------------------------------------------------- */

function FilterBar({
    filter,
    onChange,
}: {
    filter: Filter;
    onChange: (f: Filter) => void;
}) {
    const options: Filter[] = ['all', 'active', 'done'];
    return (
        <div className="flex gap-xs" data-testid="filter-bar">
            {options.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={
                        'rounded-md border px-sm py-xs text-caption ' +
                        (filter === opt
                            ? 'border-primary bg-surface text-primary'
                            : 'border-outline text-on-surface-variant hover:bg-surface-variant')
                    }
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

function TodoList({
    todos,
    onToggle,
    onRemove,
    emptyHint,
}: {
    todos: Todo[];
    onToggle: (id: number) => void;
    onRemove: (id: number) => void;
    emptyHint: string;
}) {
    if (todos.length === 0) {
        return (
            <p className="rounded-md border border-dashed border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant">
                {emptyHint}
            </p>
        );
    }
    return (
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
                            onChange={() => onToggle(t.id)}
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
                        onClick={() => onRemove(t.id)}
                        aria-label={`Remove ${t.text}`}
                        className="rounded-sm px-xs text-caption text-on-surface-variant hover:bg-black/5 hover:text-on-surface"
                    >
                        ✕
                    </button>
                </li>
            ))}
        </ul>
    );
}

