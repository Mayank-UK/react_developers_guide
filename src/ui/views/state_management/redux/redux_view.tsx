import { useState } from 'react';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import {
    Provider,
    useDispatch,
    useSelector,
    type TypedUseSelectorHook,
} from 'react-redux';
import { SectionWrapper } from '../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../components/content-group-wrapper';
import { TextBlock } from '../../../components/text-block';
import { CodeBlock } from '../../../components/code-block';
import { Example } from '../../../components/example';

/**
 * ReduxView — a single, predictable, global store for client state.
 *
 * Redux gives the whole app ONE place that holds state (the store) and ONE way
 * to change it (dispatch an action that flows through a reducer). That sounds
 * heavy next to useState — and it is — but it buys you: a serialisable log of
 * every change (time-travel debugging), strict predictability (reducers are
 * pure), and a shape that scales to large teams. Nobody writes raw Redux anymore:
 * Redux Toolkit (RTK) is the standard, and it removes ~90% of the old boilerplate.
 *
 * When to reach for it: the app is large, many distant components share state,
 * and you want middleware (thunks for async) + best-in-class devtools. For a
 * smaller app that just wants to escape prop-drilling, Zustand (next screen) is
 * usually the lighter choice. Same todo, different trade-off.
 *
 * NOTE on providers: in a real Redux app the <Provider> lives at the root
 * (main.tsx, next to <ThemeProvider>), so the whole tree can read the store.
 * Here it is scoped to this one demo so the rest of the guide stays unaffected.
 */

type Todo = { id: number; text: string; done: boolean };

const initialState: Todo[] = [
    { id: 1, text: 'Wire up the store', done: true },
    { id: 2, text: 'Dispatch an action', done: false },
    { id: 3, text: 'Read it with useSelector', done: false },
];

// createSlice bundles the reducer + its action creators + the initial state.
// The "mutating" code inside is safe: RTK runs it through Immer, which produces
// an immutable copy under the hood.
const todosSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        add: {
            reducer: (state, action: { payload: { text: string } }) => {
                state.push({
                    id: Date.now(),
                    text: action.payload.text,
                    done: false,
                });
            },
            prepare: (text: string) => ({ payload: { text } }),
        },
        toggle: (state, action: { payload: number }) => {
            const todo = state.find((t) => t.id === action.payload);
            if (todo) todo.done = !todo.done;
        },
        remove: (state, action: { payload: number }) =>
            state.filter((t) => t.id !== action.payload),
    },
});

const { add, toggle, remove } = todosSlice.actions;

const store = configureStore({
    reducer: { todos: todosSlice.reducer },
});

// Typed hooks so components get autocompletion on state + actions.
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function ReduxView() {
    return (
        <div className="flex flex-col gap-md">
            <MentalModelSection />
            <DemoSection />
            <WhenToUseSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Mental model                                                            */
/* -------------------------------------------------------------------------- */

function MentalModelSection() {
    return (
        <SectionWrapper title="One store, one-way data flow">
            <ContentGroupWrapper title="State lives in the store, not in components">
                <TextBlock>
                    {`The store holds a single tree (here { todos: [...] }). Components READ
slices of it with useSelector and never keep a copy. To change anything you
dispatch an action (add / toggle / remove); the reducer decides the next state;
every subscribed component re-renders with the new slice. Data flows one way —
view → dispatch → reducer → new state → view — which is what makes Redux
predictable and replayable (the devtools can scrub back through every action).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    add:    (state, action) => { state.push({ id: Date.now(), ...action.payload, done: false }) },
    toggle: (state, action) => {
      const t = state.find(t => t.id === action.payload);
      if (t) t.done = !t.done;        // "mutation" — Immer makes it immutable
    },
    remove: (state, action) => state.filter(t => t.id !== action.payload),
  },
});

const store = configureStore({ reducer: { todos: todosSlice.reducer } });`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Live demo — scoped provider                                             */
/* -------------------------------------------------------------------------- */

function DemoSection() {
    return (
        <SectionWrapper title="The todo app, powered by the store">
            <ContentGroupWrapper title="useSelector reads, useDispatch writes">
                <TextBlock>
                    {`Below, <Provider store={store}> wraps the demo so its components can
reach the store via the typed hooks. The component holds NO todo state itself —
it reads the list from the store and dispatches intents. Compare this to the
useState screen: the mechanism is heavier, but the state now lives outside any
component and any other component in the tree could read the exact same list
without a single prop.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Same todos — state is in the store, not the component">
                {/* Scoped provider — real apps put this at the root (main.tsx). */}
                <Provider store={store}>
                    <ReduxTodoDemo />
                </Provider>
            </Example>
        </SectionWrapper>
    );
}

function ReduxTodoDemo() {
    const todos = useAppSelector((s) => s.todos);
    const dispatch = useAppDispatch();
    const [draft, setDraft] = useState('');
    const remaining = todos.filter((t) => !t.done).length;

    const addTodo = () => {
        const text = draft.trim();
        if (!text) return;
        dispatch(add(text));
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
                                    onChange={() => dispatch(toggle(t.id))}
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
                                onClick={() => dispatch(remove(t.id))}
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
/* 3. When to use Redux                                                       */
/* -------------------------------------------------------------------------- */

function WhenToUseSection() {
    return (
        <SectionWrapper title="When is Redux worth it?">
            <ContentGroupWrapper title="Power with ceremony — earn it">
                <TextBlock>
                    {`Redux is a tool for scale, not a default. Reach for it when you
genuinely have: many distant components sharing the same client state; complex
async flows that benefit from thunks / middleware; a team that values a strict,
auditable, serialisable history of every change (the devtools are the killer
feature). For a handful of shared values, Zustand or Context is lighter. And
remember: Redux is for CLIENT state — server data (posts, profiles) belongs in
TanStack Query, which composes cleanly alongside a Redux store.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            Reach for Redux at the right size — not by default.
                        </span>
                    }
                    code={`large app + many shared slices + team + async middleware → Redux Toolkit
a few shared values, want zero ceremony              → Zustand
server data (fetching/caching)                        → TanStack Query`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
