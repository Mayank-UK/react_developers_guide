import { Link } from 'react-router';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { RoutePaths } from '../../routing/routes';

/**
 * AboutView — what this app is, what it covers, and how it's built.
 *
 * This is a reference application: a hands-on React developer's guide that
 * demonstrates idiomatic React architecture the way a real, maintained codebase
 * would build it — clean layers, a token-driven design system, a real data
 * pipeline, tests, and environment handling. It mirrors the companion
 * flutter_developers_guide in intent (what each concept is and why) while
 * picking the React-standard shape wherever the two ecosystems differ.
 */
export default function AboutView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatItIsSection />
            <WhatItCoversSection />
            <StackSection />
            <HowItsBuiltSection />
            <ConventionsSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What it is                                                              */
/* -------------------------------------------------------------------------- */

function WhatItIsSection() {
    return (
        <SectionWrapper title="What this app is">
            <ContentGroupWrapper title="A reference app, not a slide deck">
                <TextBlock>
                    {`This is a single-page React application built to be read as
much as used. Every screen teaches one topic — React fundamentals, styling,
state management, the data pipeline, testing, and so on — by implementing it for
real in the same codebase you're looking at, then explaining the how and the
why. The goal is not to list every API; it is to show the shape a maintainable
React app takes, so the patterns are concrete rather than abstract.

It is the sibling of a Flutter guide (flutter_developers_guide). Both cover the
same concepts; both reach for the idiomatic answer in their own ecosystem. Where
Flutter and React genuinely differ — dependency injection, state management,
routing, the widget-vs-element model — each screen says so and uses the
React-standard way, rather than forcing a Flutter pattern onto the web.`}
                </TextBlock>
            </ContentGroupWrapper>
            <ContentGroupWrapper title="At a glance">
                <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
                    <Stat value="17" label="topic screens" />
                    <Stat value="4" label="architecture layers" />
                    <Stat value="71+" label="tests" />
                    <Stat value="1" label="codebase to read" />
                </div>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex flex-col gap-[2px] rounded-md border border-outline bg-surface-variant px-md py-md">
            <span className="font-mono text-title font-semibold text-primary">{value}</span>
            <span className="text-caption text-on-surface-variant">{label}</span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. What it covers                                                          */
/* -------------------------------------------------------------------------- */

const COVERS = [
    { title: 'Fundamentals', to: RoutePaths.reactFundamentals, note: 'JSX, components, hooks, TS/JS basics' },
    { title: 'UI & styling', to: RoutePaths.ui, note: 'Layout, CSS, Bootstrap, Tailwind, interactions' },
    { title: 'State management', to: RoutePaths.stateManagement, note: 'Hooks, Redux, Zustand, TanStack Query' },
    { title: 'Data pipeline', to: RoutePaths.apiHandling, note: 'API, database, exceptions, DI' },
    { title: 'Engineering', to: RoutePaths.architecture, note: 'Architecture, testing, debugging, envs' },
    { title: 'Craft', to: RoutePaths.bestPractices, note: 'Performance, accessibility, maintainability' },
];

function WhatItCoversSection() {
    return (
        <SectionWrapper title="What it covers">
            <ContentGroupWrapper title="Six areas, each a working implementation">
                <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
                    {COVERS.map((c) => (
                        <Link
                            key={c.to}
                            to={c.to}
                            className="group flex flex-col gap-[2px] rounded-md border border-outline bg-surface-variant px-md py-md transition-colors hover:border-primary hover:bg-surface"
                        >
                            <span className="flex items-center gap-sm text-body-sm font-semibold text-on-surface group-hover:text-primary">
                                {c.title}
                                <span className="text-on-surface-variant transition-transform group-hover:translate-x-1">
                                    →
                                </span>
                            </span>
                            <span className="text-caption text-on-surface-variant">{c.note}</span>
                        </Link>
                    ))}
                </div>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The stack                                                               */
/* -------------------------------------------------------------------------- */

function StackSection() {
    return (
        <SectionWrapper title="The stack">
            <ContentGroupWrapper title="Deliberately standard, nothing exotic">
                <TextBlock>
                    {`Every dependency was chosen because it is the current idiomatic
answer for its job, not because it is novel. That keeps the guide honest: what
you read here is what you'd reach for shipping a real app today.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`UI / runtime      React 19, TypeScript
Build / dev        Vite 8
Routing            React Router v8 (data router)
Styling            Tailwind v4 (CSS-variable tokens, @theme inline)
State (local)      hooks + useReducer
State (global)     Redux Toolkit, Zustand  (demonstrated side by side)
Server state       TanStack Query
HTTP               axios + interceptors
Storage            Dexie (IndexedDB)
DI                 hand-rolled service locator (no DI library)
Testing            Vitest + jsdom + React Testing Library`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. How it's built                                                          */
/* -------------------------------------------------------------------------- */

function HowItsBuiltSection() {
    return (
        <SectionWrapper title="How it's built">
            <ContentGroupWrapper title="Clean layers + a token-driven design system">
                <TextBlock>
                    {`The code separates concerns into four layers — domain (enterprise
rules, framework-free), data (the implementations: remote, local, repositories),
core (the shared kernel + the composition root), and ui (presentation). Every
dependency points inward toward the domain, so each layer can change, be swapped,
or be tested without the others moving. The UI is built from a single design
system of CSS-variable tokens surfaced as Tailwind utilities, so the whole app
reads as one system and themes light/dark by flipping data-theme.

Cross-cutting concerns are first-class: a Result<T> type carries success-or-
failure through the data layer; exceptions are converted to severity-tagged
Failures at the boundary; a service-locator container wires everything in one
debuggable place and swaps real implementations for fakes per environment. The
deep-dive screens (API handling, Database handling, Exception handling,
Dependency management, Architecture) walk each of these layer by layer.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Conventions                                                             */
/* -------------------------------------------------------------------------- */

function ConventionsSection() {
    return (
        <SectionWrapper title="Conventions it follows">
            <ContentGroupWrapper title="The habits that keep it readable">
                <TextBlock>
                    {`• Tokens first — design decisions live in tokens.css and surface as
  Tailwind utilities; arbitrary [var(--x)] escapes in JSX are a smell, not a
  shortcut.

• Behaviour tests — assertions read the DOM the way a user does (by role/text),
  never component internals, so a refactor never breaks a test that wasn't about
  correctness.

• Reuse over rebuild — a piece used once is a local function; a piece used across
  files lives in ui/components. New screens are mostly assembling existing
  primitives.

• Every concept ships a visible, interactive example — not just a code listing —
  and each screen is verified by screenshotting it before it's marked done.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
