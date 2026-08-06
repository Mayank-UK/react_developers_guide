import { useState } from 'react';
import { create } from 'zustand';
import { SectionWrapper } from '../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../components/content-group-wrapper';
import { TextBlock } from '../../../components/text-block';
import { CodeBlock } from '../../../components/code-block';
import { Example } from '../../../components/example';

/**
 * ZustandView — global client state with almost no boilerplate.
 *
 * Zustand is the modern default when state needs to be shared beyond one
 * component but you don't want Redux's store/provider/reducer machinery. You
 * call create() once with a function that returns the state + the actions that
 * mutate it; any component then reads a slice with a hook. There is NO provider
 * to mount — the store is a plain module-level singleton. That alone removes the
 * single biggest piece of Redux ceremony.
 *
 * Same todo app as the other screens. Notice how little setup there is compared
 * to Redux: no slice, no configureStore, no <Provider>, no typed hooks wrapper.
 * For most apps this is the sweet spot for shared client state.
 */

type Todo = { id: number; text: string; done: boolean };

interface TodoStore {
    todos: Todo[];
    add: (text: string) => void;
    toggle: (id: number) => void;
    remove: (id: number) => void;
}

const useTodoStore = create<TodoStore>((set) => ({
    todos: [
        { id: 1, text: 'Create the store', done: true },
        { id: 2, text: 'Read a slice with the hook', done: false },
        { id: 3, text: 'Notice: no provider', done: false },
    ],
    add: (text) =>
        set((state) => ({
            todos: [
                ...state.todos,
                { id: Date.now(), text, done: false },
            ],
        })),
    toggle: (id) =>
        set((state) => ({
            todos: state.todos.map((t) =>
                t.id === id ? { ...t, done: !t.done } : t,
            ),
        })),
    remove: (id) =>
        set((state) => ({
            todos: state.todos.filter((t) => t.id !== id),
        })),
}));

export default function ZustandView() {
    return (
        <div className="flex flex-col gap-md">
            <MentalModelSection />
            <DemoSection />
            <SelectorsSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Mental model                                                            */
/* -------------------------------------------------------------------------- */

function MentalModelSection() {
    return (
        <SectionWrapper title="A store you just import — no provider">
            <ContentGroupWrapper title="create() returns a hook">
                <TextBlock>
                    {`create() takes a function (get, set) => ({ ...state, ...actions })
and returns a hook. The hook is a module-level singleton, so importing it
anywhere reads the same state — there is nothing to mount in the component tree.
set() merges a partial state (or takes the full state via a function), and only
components whose selected slice actually changed re-render. The actions live
beside the state in the store, not scattered across components.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const useTodoStore = create<TodoStore>((set) => ({
  todos: [...],
  add:    (text)  => set(s => ({ todos: [...s.todos, { id: Date.now(), text, done: false }] })),
  toggle: (id)    => set(s => ({ todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
  remove: (id)    => set(s => ({ todos: s.todos.filter(t => t.id !== id) })),
}));

// read a slice anywhere — no <Provider> anywhere in the app
const todos = useTodoStore(s => s.todos);
const add   = useTodoStore(s => s.add);`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Live demo                                                               */
/* -------------------------------------------------------------------------- */

function DemoSection() {
    return (
        <SectionWrapper title="The todo app, no provider in sight">
            <ContentGroupWrapper title="Import the hook, read, call">
                <TextBlock>
                    {`This demo does exactly what the Redux one did — add, toggle,
remove — but the store is just an imported hook. No <Provider>, no dispatch,
no action types. If two distant components both call useTodoStore, they see and
edit the same list. That is the whole appeal: shared state with the lightness of
a local hook.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Same todos — a one-call store, no provider">
                <ZustandTodoDemo />
            </Example>
        </SectionWrapper>
    );
}

function ZustandTodoDemo() {
    const todos = useTodoStore((s) => s.todos);
    const add = useTodoStore((s) => s.add);
    const toggle = useTodoStore((s) => s.toggle);
    const remove = useTodoStore((s) => s.remove);
    const [draft, setDraft] = useState('');
    const remaining = todos.filter((t) => !t.done).length;

    const addTodo = () => {
        const text = draft.trim();
        if (!text) return;
        add(text);
        setDraft('');
    };

    return (
        <div className="flex flex-col gap-sm">
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
                    className="rounded-md px-md py-xs text-body-sm text-on-primary shadow-button-card hover:shadow-button-card-hover"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Add
                </button>
            </div>
            {todos.length === 0 ? (
                <p className="rounded-md border border-dashed border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant">
                    Nothing yet — add one above.
                </p>
            ) : (
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
                                    onChange={() => toggle(t.id)}
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
                                onClick={() => remove(t.id)}
                                aria-label={`Remove ${t.text}`}
                                className="rounded-sm px-xs text-caption text-on-surface-variant hover:bg-on-surface/10 hover:text-on-surface"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <p className="text-caption text-on-surface-variant">
                {remaining} remaining · {todos.length} total
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Selectors — read only what you need                                     */
/* -------------------------------------------------------------------------- */

function SelectorsSection() {
    return (
        <SectionWrapper title="Select a slice — re-render only what changed">
            <ContentGroupWrapper title="Always pass a selector, never the whole store">
                <TextBlock>
                    {`The argument to the hook is a selector: a function that picks the
sliver of state this component cares about. Zustand compares the selected value
across updates (Object.is by default) and re-renders only when that sliver
changed. Select the array, or select an action, or select a computed value —
never call the hook with no selector and read state off the result, or the
component re-renders on every single change to the store. The remaining count
below is a derived selector, computed inside the selector function.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// ✅ select a slice — re-renders only when todos changes
const todos = useTodoStore(s => s.todos);

// ✅ derive inside the selector — no extra state
const remaining = useTodoStore(s => s.todos.filter(t => !t.done).length);

// ❌ no selector — re-renders on EVERY store change
const store = useTodoStore();`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
