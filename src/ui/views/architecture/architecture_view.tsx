import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import { useLayerExplorer, useRequestTracer } from './architecture_hooks';

/**
 * ArchitectureView — how this app's code is organised so it stays maintainable.
 *
 * "Architecture" here is the rule about which code may depend on which other
 * code. The app separates concerns into four layers — domain, data, core, ui —
 * and points every dependency in one direction (inward, toward the domain). The
 * payoff is that each layer can change, be swapped, or be tested without the
 * others moving: the UI doesn't know whether posts come from a REST API or a
 * fake, the domain doesn't know it's running in a browser, and the data layer
 * can be exercised against an in-memory fake without rendering a component.
 *
 * This screen is the map; every other screen (API handling, Database handling,
 * Exception handling, Dependency management) is a deep-dive into one seam.
 */
export default function ArchitectureView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatAndWhySection />
            <LayersSection />
            <DependencyRuleSection />
            <FlowSection />
            <FolderStructureSection />
            <WhyItPaysOffSection />
            <ReactVsFlutterSection />
            <LiveExplorerSection />
            <LiveTracerSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What architecture is, and why                                            */
/* -------------------------------------------------------------------------- */

function WhatAndWhySection() {
    return (
        <SectionWrapper title="What architecture is, and why it matters">
            <ContentGroupWrapper title="Separating things that change for different reasons">
                <TextBlock>
                    {`Architecture is not about folders for their own sake — it is a rule
about which code is allowed to know about which other code. As a feature grows,
different parts change at different speeds and for different reasons: the
endpoint URL changes when the backend moves, the loading spinner changes when
the designer restyles, the caching rule changes when the product adds offline
mode. If all of that lives in one place, every change touches everything and
every change risks breaking everything. Separating those concerns into layers
means a change in one layer has no reason to touch the others — and a bug
introduced in one layer cannot silently travel into another, because the
dependency direction forbids the import.`}
                </TextBlock>
            </ContentGroupWrapper>
            <ContentGroupWrapper title="The cost of not doing it">
                <TextBlock>
                    {`The alternative — fetch-and-setState inline in the component — works
for a demo and then rots. The component ends up knowing the endpoint shape, the
DTO-to-model mapping, the cache strategy, the error wording, and the spinner
state all at once. You cannot test the fetch without rendering the component,
cannot swap the real API for a fake without editing the component, and cannot
reuse the logic in a second screen without copying it. Every one of those pains
is a layer boundary that was never drawn.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. The layers                                                               */
/* -------------------------------------------------------------------------- */

function LayersSection() {
    return (
        <SectionWrapper title="The four layers in this app">
            <ContentGroupWrapper title="Each layer owns one concern and may not reach across">
                <TextBlock>
                    {`The codebase splits into four layers. Read this table as a contract:
the "may not touch" column is enforced by import discipline (and would be
enforced by a tool like dependency-cruiser in a larger app). Every file in src/
belongs to exactly one of these.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`domain/   enterprise rules — models, repository contracts, use cases
data/     the implementations of those contracts — remote, local, DTOs, DAOs
core/     shared kernel — Result, error-handling, config, the container
ui/       presentation — views, components, hooks, routing, design system`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="What each layer is, in one line">
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`domain  → "what a post IS, and what the app can do with one"
data    → "how posts are actually fetched and stored"
core    → "the plumbing every layer shares (Result, errors, wiring)"
ui      → "what the user sees and how they drive those actions"`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The dependency rule                                                      */
/* -------------------------------------------------------------------------- */

function DependencyRuleSection() {
    return (
        <SectionWrapper title="The dependency rule — every arrow points inward">
            <ContentGroupWrapper title="Domain depends on nothing framework; data implements domain; ui talks to use cases">
                <TextBlock>
                    {`The single rule that makes the layers work: dependencies point inward,
toward the domain. The domain layer has no imports of React, axios, Dexie, or
anything browser-specific — it is plain TypeScript types and pure functions, so
it could run in Node, in a worker, or in tests with zero setup. The data layer
implements the domain's contracts (PostRepositoryImpl satisfies the
PostRepository interface the domain defines) and is the only place framework
imports live. The ui layer depends on domain use cases and models, never on a
concrete data implementation — it asks the container for GetPostsUseCase and
has no idea whether that resolves to a real REST client or a fake.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`        ┌─────────────────────────────────────────┐
        │  ui/   (views, hooks, components)        │   talks to use cases
        │    └──────────────────────────────────┘ │   + resolves via container
        │       ┌────────────────────────────────┐ │
        │       │  data/  (impls: remote, local) │ │   implements domain contracts
        │       │    └──────────────────────────┘ │   owns all framework imports
        │       │       ┌──────────────────────┐  │ │
        │       │       │  domain/  (models,   │  │   depends on NOTHING outside
        │       │       │  contracts, usecases)│  │   core's pure types
        │       │       └──────────────────────┘  │ │
        │       └────────────────────────────────┘ │
        └─────────────────────────────────────────┘
                 core/  underpins all of the above (Result, errors, config)`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="One exception: the composition root">
                <TextBlock>
                    {`There is exactly one place allowed to know about concrete
implementations: the container (src/core/container.ts). It is the composition
root — the file that wires PostRepositoryImpl to the real or fake sources and
hands the finished GetPostsUseCase to the rest of the app. This is not a
violation of the rule; it is the rule's escape hatch. Every other file depends
on an interface, and this one file is where interfaces meet instances. Dependency
management is a whole screen of its own; here we only note that the container is
the single arrow allowed to point outward.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. The flow of one feature                                                  */
/* -------------------------------------------------------------------------- */

function FlowSection() {
    return (
        <SectionWrapper title="The flow of one feature — GetPosts, layer by layer">
            <ContentGroupWrapper title="A request crosses every seam exactly once">
                <TextBlock>
                    {`Trace fetching the posts list from a button press to pixels. Each hop
is a layer boundary, and each boundary has a reason: the UI stays free of
fetching details, the use case stays free of storage strategy, the repository
implementation stays free of UI state. The return path carries a Result<T> —
never a thrown exception — so the UI can branch on severity without a
try/catch.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// ui/ — the hook owns presentation state, nothing else.
const { state, fetch } = usePosts();            // ui/hooks/use-posts.ts
//   ↓ dispatches 'fetch'; calls the use case

// domain/ — a thin seam for future policy (caching rules, combining repos).
const result = await getPostsUseCase.execute(); // domain/usecases/get-posts-usecase.ts
//   ↓ delegates to the repository CONTRACT (an interface)

// domain/ defines the contract; data/ implements it.
interface PostRepository { getPosts(): Promise<Result<Post[]>>; } // domain/repositories
class PostRepositoryImpl implements PostRepository { … }          // data/repositories

// data/ — the only layer that imports axios / Dexie.
const remotePosts = await this.remote.getPosts();  // data/remote/post-remote-data-source.ts
await this.local.insertPosts(remotePosts);         // data/local/daos/post-dao.ts

// core/ — exceptions are mapped to Failures at the boundary, never thrown past it.
return safeRepositoryCall({ call: …, onNetworkError: … }); // core/error-handling/guards.ts

// ui/ — the hook dispatches 'loaded'/'error'; components branch on severity.
{result.ok ? <PostList posts={result.value}/> : <ShowError failure={result.failure}/>}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Folder structure = the architecture                                      */
/* -------------------------------------------------------------------------- */

function FolderStructureSection() {
    return (
        <SectionWrapper title="Folder structure is the architecture">
            <ContentGroupWrapper title="The src/ tree, grouped by layer">
                <TextBlock>
                    {`Because the dependency rule is enforced by imports, the folder tree
is not just organisation — it is the architecture made visible. You can read
which layer a file belongs to from its path, and you can trust that a file under
domain/ will never import from data/ or ui/. Here is the real tree, annotated.`}
                </TextBlock>
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`src/
├── domain/                      # enterprise rules — plain TS, no framework
│   ├── models/                  #   Post, Link (the nouns of the business)
│   ├── repositories/            #   PostRepository INTERFACE (the contract)
│   └── usecases/                #   GetPostsUseCase (the verbs of the business)
│
├── data/                        # implementations of domain contracts
│   ├── remote/                  #   http-client, interceptors, data source, DTOs
│   ├── local/                   #   app-database contract, post-dao (Dexie/IndexedDB)
│   ├── repositories/            #   PostRepositoryImpl (orchestrates remote + local)
│   └── fake/                    #   FakeApiService, FakeAppDatabase (dev/test stand-ins)
│
├── core/                        # shared kernel + the composition root
│   ├── result.ts                #   Result<T> = Success | Failed
│   ├── error-handling/          #   exceptions → guards → failures (chained, severity)
│   ├── config/                  #   AppConfig, Logger
│   ├── scenario/                #   dev knobs for failure injection
│   └── container.ts             #   the composition root — wires & resolves everything
│
└── ui/                          # presentation
    ├── views/                   #   one folder per screen (+ its spec)
    ├── components/              #   shared, reusable presentational pieces
    ├── hooks/                   #   usePosts, useRouteTitle, useFailureSnackbar
    ├── routing/                 #   router + route table (data-driven)
    └── design-system/           #   tokens, theme, sizes, shadows`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Why it pays off                                                          */
/* -------------------------------------------------------------------------- */

function WhyItPaysOffSection() {
    return (
        <SectionWrapper title="Why these boundaries pay off">
            <ContentGroupWrapper title="Three concrete wins, each a direct consequence of the rule">
                <TextBlock>
                    {`• Testability — every layer is testable in isolation. The repository
  is exercised against FakeApiService + FakeAppDatabase with no network and no
  DOM; the use case is a pure delegation you can call in one line; the hook is
  driven with Testing Library against a fake use case. No layer needs the others
  mounted to be tested.

• Swappability — because ui depends on the contract, not the implementation,
  the same screen runs against the real REST API in production and a canned fake
  in development, selected by one config flag at startup. The screen never
  changes; the wiring in the container does.

• Framework isolation — React, axios, and Dexie appear in exactly one layer
  each. If axios is replaced by fetch, or Dexie by a different store, the
  blast radius is a single data file. The domain and the UI rules do not move,
  because they never knew the framework's name.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. React vs Flutter                                                         */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — same layering, different idioms">
            <ContentGroupWrapper title="Where this app follows the React-standard way, not the Flutter way">
                <TextBlock>
                    {`The layering is the same clean-architecture idea the Flutter guide
uses (domain / data / presentation). What differs is the React-idiomatic shape
of each layer, and the app picks the standard React answer over a literal port:

• Presentation — Flutter uses Cubit/Bloc classes emitting state streams; the
  idiomatic React equivalent is a useReducer store exposed via a custom hook
  (usePosts). Same states, same transitions, no state-management library needed
  for local feature state. (Redux/Zustand/TanStack Query each get their own
  screen; none is forced in here.)

• Dependency injection — Flutter has get_it + @injectable codegen; React has
  no DI standard, so this app wires by hand in a tiny service locator. Pointed
  out rather than hidden, because pretending React has a DI standard would
  mislead.

• Error model — Flutter's sealed Failure classes map directly to TypeScript's
  discriminated unions (Result<T>, Failure with a 'kind' tag), which is the
  type-safe React way to model "success or a categorised failure".

• Routing — Flutter's go_router maps to React Router v8's data router
  (createBrowserRouter + RouterProvider), the current idiomatic API, rather
  than the older <BrowserRouter> component tree.

The principle: when the Flutter pattern and the React-standard pattern differ,
the screen says so and uses the React-standard one. Consistency of intent, not
of syntax.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Live — interactive layer explorer                                        */
/* -------------------------------------------------------------------------- */

type LayerKey = 'domain' | 'data' | 'core' | 'ui';

interface LayerInfo {
    key: LayerKey;
    name: string;
    owns: string;
    mayDepend: string;
    mayNotDepend: string;
    files: string[];
}

const LAYERS: LayerInfo[] = [
    {
        key: 'domain',
        name: 'domain/',
        owns: 'Enterprise rules — the models, the repository contracts (interfaces), and the use cases. The "what the business is" layer.',
        mayDepend: 'core/ only, and only its pure types (Result, Failure). No framework, no browser API.',
        mayNotDepend: 'data/, ui/, React, axios, Dexie — anything concrete or platform-specific.',
        files: [
            'domain/models/post.ts',
            'domain/models/link.ts',
            'domain/repositories/post-repository.ts',
            'domain/usecases/get-posts-usecase.ts',
        ],
    },
    {
        key: 'data',
        name: 'data/',
        owns: 'The implementations of the domain contracts — remote source, local store, DTOs, DAOs, and the repository that orchestrates them.',
        mayDepend: 'domain/ (models + contracts), core/ (guards, result, logger). Owns ALL framework imports (axios, Dexie).',
        mayNotDepend: 'ui/. It must stay unaware that a screen exists.',
        files: [
            'data/remote/{http-client,post-remote-data-source}.ts',
            'data/remote/dtos/post-dto.ts',
            'data/local/app-database.ts · daos/post-dao.ts',
            'data/repositories/post-repository-impl.ts',
            'data/fake/{fake-api-service,fake-app-database}.ts',
        ],
    },
    {
        key: 'core',
        name: 'core/',
        owns: 'The shared kernel every layer uses — Result<T>, the exception→failure pipeline, config, logging — plus the composition root (container).',
        mayDepend: 'Pure core has no deps. The container (composition root) is the ONE place allowed to import domain + data concretes to wire them.',
        mayNotDepend: 'ui/. Even the container never imports a component or hook.',
        files: [
            'core/result.ts',
            'core/error-handling/{exceptions,failures,guards}.ts',
            'core/config/{app-config,logger}.ts',
            'core/scenario/{api,db}-scenario.ts',
            'core/container.ts  ← composition root',
        ],
    },
    {
        key: 'ui',
        name: 'ui/',
        owns: 'Presentation — screens, shared components, hooks that drive use cases, routing, and the design system. Owns the DOM and React.',
        mayDepend: 'domain/ (use cases, models) and core/ (container, failures). It resolves services via the container.',
        mayNotDepend: 'data/ concretes directly. It depends on the contract, never on PostRepositoryImpl.',
        files: [
            'ui/views/<screen>/<screen>_view.tsx',
            'ui/components/* (shared presentational pieces)',
            'ui/hooks/{use-posts,use-route-title,use-failure-snackbar}.ts',
            'ui/routing/{router,routes}.tsx',
            'ui/design-system/* (tokens, theme, sizes)',
        ],
    },
];

function LiveExplorerSection() {
    return (
        <SectionWrapper title="Live — explore the layers">
            <ContentGroupWrapper title="Click a layer to read its contract">
                <TextBlock>
                    {`This is the dependency rule as a clickable contract. Each card is a
layer; selecting it shows what that layer owns, what it may depend on, what it
is forbidden from depending on, and the real files that live in it. The
"may NOT depend on" line is the rule that keeps the architecture from rotting.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="the four layers and their contracts">
                <LayerExplorer />
            </Example>
        </SectionWrapper>
    );
}

function LayerExplorer() {
    const { selected, select } = useLayerExplorer();
    const info = LAYERS.find((l) => l.key === selected);
    if (!info) throw new Error(`No layer info registered for "${selected}"`);

    return (
        <div className="flex flex-col gap-md">
            <div className="grid grid-cols-2 gap-xs sm:grid-cols-4">
                {LAYERS.map((layer) => {
                    const active = layer.key === selected;
                    return (
                        <button
                            key={layer.key}
                            type="button"
                            onClick={() => select(layer.key)}
                            className={[
                                'rounded-md border px-md py-md text-left transition-colors',
                                active
                                    ? 'border-primary bg-surface'
                                    : 'border-outline bg-surface-variant hover:bg-surface',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'block font-mono text-body-sm font-semibold',
                                    active ? 'text-primary' : 'text-on-surface',
                                ].join(' ')}
                            >
                                {layer.name}
                            </span>
                            <span className="mt-[2px] block text-caption text-on-surface-variant">
                                {active ? 'selected' : 'tap to view'}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-md rounded-md border border-outline bg-surface p-md">
                <Field label="Owns" value={info.owns} />
                <Field label="May depend on" value={info.mayDepend} tone="allow" />
                <Field label="May NOT depend on" value={info.mayNotDepend} tone="deny" />
                <div className="flex flex-col gap-xs">
                    <p className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                        Real files
                    </p>
                    <div className="flex flex-col gap-[2px] rounded-md bg-surface-variant px-md py-sm font-mono text-caption text-on-surface">
                        {info.files.map((f) => (
                            <span key={f}>{f}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: 'allow' | 'deny';
}) {
    const toneClass =
        tone === 'allow'
            ? 'border-l-[3px] border-l-primary'
            : tone === 'deny'
              ? 'border-l-[3px] border-l-outline'
              : '';
    return (
        <div className={['flex flex-col gap-[2px]', toneClass].join(' ').trim()}>
            <p className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                {label}
            </p>
            <p className="text-body-sm leading-[1.6] text-on-surface">{value}</p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 9. Live — request flow tracer                                               */
/* -------------------------------------------------------------------------- */

function LiveTracerSection() {
    return (
        <SectionWrapper title="Live — trace a request through the layers">
            <ContentGroupWrapper title="Run GetPosts and watch each layer light up">
                <TextBlock>
                    {`This animates the GetPosts flow from the section above. Each lit step
is a layer boundary the request crosses. Toggle "inject a network failure" to
see the one extra boundary that fires on the error path — the guard that
converts a thrown exception into a Result, which is the whole reason exceptions
never reach the UI.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="request-flow tracer">
                <RequestTracer />
            </Example>
        </SectionWrapper>
    );
}

const LAYER_TONE: Record<string, string> = {
    domain: 'border-primary text-primary',
    data: 'border-primary text-primary',
    core: 'border-primary text-primary',
    ui: 'border-primary text-primary',
};

function RequestTracer() {
    const {
        injectFailure,
        toggleInjectFailure,
        active,
        running,
        steps,
        run,
        reset,
    } = useRequestTracer();

    return (
        <div className="flex flex-col gap-md">
            <div className="flex flex-wrap items-center gap-xs">
                <button
                    type="button"
                    onClick={run}
                    disabled={running}
                    className="rounded-md border border-primary bg-primary px-md py-xs text-body-sm font-semibold text-on-primary disabled:opacity-50"
                >
                    {active === -1 ? 'Run request' : 'Re-run'}
                </button>
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-md border border-outline bg-surface px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                >
                    Reset
                </button>
                <label className="ml-xs flex items-center gap-xs text-caption text-on-surface-variant">
                    <input
                        type="checkbox"
                        checked={injectFailure}
                        onChange={(e) => toggleInjectFailure(e.target.checked)}
                        className="accent-[var(--color-primary)]"
                    />
                    inject a network failure
                </label>
            </div>

            <ol className="flex flex-col gap-xs">
                {steps.map((step, i) => {
                    const done = i <= active;
                    const isActive = i === active;
                    return (
                        <li
                            key={`${step.file}-${i}`}
                            className={[
                                'flex flex-col gap-[2px] rounded-md border px-md py-sm transition-colors',
                                isActive
                                    ? 'border-primary bg-surface'
                                    : done
                                      ? 'border-outline bg-surface'
                                      : 'border-outline bg-surface-variant opacity-60',
                            ].join(' ')}
                        >
                            <div className="flex items-center gap-sm">
                                <span
                                    className={[
                                        'inline-block h-[18px] w-[18px] shrink-0 rounded-pill border text-center font-mono text-[11px] leading-[18px]',
                                        done
                                            ? 'border-primary bg-primary text-on-primary'
                                            : 'border-outline text-on-surface-variant',
                                    ].join(' ')}
                                >
                                    {done ? '✓' : i + 1}
                                </span>
                                <span
                                    className={[
                                        'font-mono text-caption font-semibold uppercase tracking-[0.06em]',
                                        isActive ? LAYER_TONE[step.layer] : 'text-on-surface-variant',
                                    ].join(' ')}
                                >
                                    {step.layer}/
                                </span>
                                <span className="text-body-sm font-semibold text-on-surface">
                                    {step.title}
                                </span>
                            </div>
                            <span className="pl-[34px] font-mono text-caption text-on-surface-variant">
                                {step.file}
                            </span>
                            {isActive && (
                                <span className="pl-[34px] text-body-sm leading-[1.6] text-on-surface">
                                    {step.detail}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>

            <p className="text-caption text-on-surface-variant">
                {active === -1
                    ? 'Press “Run request” to walk the request down through ui → domain → data → core and back.'
                    : active >= steps.length - 1
                      ? injectFailure
                        ? 'Done — the exception was caught at the boundary and returned as a Failure; the UI rendered the error treatment without a try/catch.'
                        : 'Done — the posts returned as a Success and rendered. No layer knew about the ones below its contract.'
                      : `Crossing the ${steps[active]?.layer ?? '?'}/ boundary…`}
            </p>
        </div>
    );
}
