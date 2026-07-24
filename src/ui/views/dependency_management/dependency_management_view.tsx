import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import { Environment } from '../../../core/config/app-config';
import {
    API_SCENARIOS,
    ApiScenario,
} from '../../../core/scenario/api-scenario';
import {
    DB_SCENARIOS,
    DbScenario,
} from '../../../core/scenario/db-scenario';
import { useWiringDemo } from './dependency_management_hooks';

/**
 * DependencyManagementView — how the app's services are created and connected.
 *
 * "Dependency management" is the question: who constructs the HTTP client, the
 * database, the repository, the use case — and who hands them to whom? This app
 * answers it with a small service-locator container: every service is registered
 * once at startup, and any screen resolves what it needs from the container
 * instead of importing a concrete singleton or building it inline. That keeps
 * construction in one debuggable place and lets the dev build swap fakes in for
 * the real API and database without the consumers noticing.
 *
 * Note (React vs Flutter): Flutter has a standard answer — get_it + @injectable
 * codegen. React does not. The choices and their trade-offs are covered below.
 */
export default function DependencyManagementView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatAndWhySection />
            <NoStandardSection />
            <ContainerSection />
            <WiringGraphSection />
            <ConfigDrivenSection />
            <ScenarioControlSection />
            <BootstrapSection />
            <LiveDemoSection />
            <ReactVsFlutterSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What it is and why                                                      */
/* -------------------------------------------------------------------------- */

function WhatAndWhySection() {
    return (
        <SectionWrapper title="What dependency management is, and why it matters">
            <ContentGroupWrapper title="Separate 'build it' from 'use it'">
                <TextBlock>
                    {`A use case needs a repository; a repository needs a remote source,
a database, and a logger; the remote source needs an HTTP client. If every class
constructs its own dependencies, those couplings are scattered and untestable —
PostRepositoryImpl would hard-code "new JsonPlaceholderPostRemoteDataSource(...)"
and you could never feed it a fake. Dependency management pulls all of that
construction into one place (the container) and hands already-built dependencies
to constructors. Each class declares what it needs; the container decides what
concrete thing to give it. The win is threefold: one place to see and change the
wiring; the ability to swap implementations (real ↔ fake) per environment; and
trivial testability, because tests construct the class with fakes.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. React has no DI standard                                                */
/* -------------------------------------------------------------------------- */

function NoStandardSection() {
    return (
        <SectionWrapper title="React has no DI standard — so what are the options">
            <ContentGroupWrapper title="Three common approaches, and the trade-off of each">
                <TextBlock>
                    {`Unlike Flutter (get_it + injectable) or Angular (a built-in DI
hierarchy), React ships no dependency-injection mechanism. The community uses
three approaches, and the app picks deliberately:

• React Context — great for services that live with the component tree and need
  to trigger re-renders (theme, auth state, the current locale). But these
  services (HTTP client, database, repository) are not reactive — nothing
  re-renders when "the use case" changes — so Context's re-render machinery is
  the wrong fit. It also can't be used outside components (e.g. inside a plain
  data-source class).

• A full DI library (InversifyJS / TSyringe) — decorators, reflect-metadata, a
  container that auto-wires by type. Powerful, but heavy: it pulls in runtime
  metadata reflection for what is, in this app, a handful of singletons wired in
  one file. Overkill.

• A hand-rolled service locator — what this app uses. A tiny Container class:
register singletons at startup, resolve them anywhere. Explicit, dependency-free,
debuggable, and enough. The cost is manual wiring — you write the constructor
calls yourself. For an app this size that is a feature, not a burden.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The container                                                           */
/* -------------------------------------------------------------------------- */

function ContainerSection() {
    return (
        <SectionWrapper title="The container — register once, resolve anywhere">
            <ContentGroupWrapper title="A map keyed by symbol, plus typed accessors">
                <TextBlock>
                    {`The container holds a registry — a Map keyed by unique symbols,
one per service name. register(name, instance) stores a singleton; resolve(name)
reads it back (throwing a clear error if nothing was registered). On top of that
sit typed getters (container.getPostsUseCase, container.appDatabase, …) so
callers get full type inference and never type a magic string. Because it is a
module-level singleton (export const container), any file resolves from it
without prop-drilling or imports of concrete implementations.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/container.ts (trimmed)
class Container {
  private readonly registry = new Map<symbol, unknown>();

  private register<T>(name: string, instance: T): void {
    this.registry.set(key(name), instance);   // key() → a unique Symbol
  }
  private resolve<T>(name: string): T {
    const instance = this.registry.get(key(name));
    if (instance === undefined)
      throw new Error(\`Dependency "\${name}" is not registered\`);
    return instance as T;
  }

  // typed accessors — callers use these
  get getPostsUseCase(): GetPostsUseCase { return this.resolve('GetPostsUseCase'); }
  get postRepository(): PostRepository    { return this.resolve('PostRepository'); }
}
export const container = new Container();`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. The wiring graph                                                        */
/* -------------------------------------------------------------------------- */

function WiringGraphSection() {
    return (
        <SectionWrapper title="The wiring graph — one file owns every constructor call">
            <ContentGroupWrapper title="initialize() builds singletons in dependency order">
                <TextBlock>
                    {`All construction happens inside initialize(), in dependency order:
config and logger first (they have no deps), then the HTTP client (needs config +
logger), then the sources that need the client/database, then the repository
that needs them, and finally the use case that needs the repository. Each wiring
helper (createPostRepository, createGetPostsUseCase) takes already-resolved
dependencies and returns the wired instance. Reading this one file top-to-bottom
is reading the app's entire object graph.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/container.ts — initialize() (trimmed)
this.register('AppConfig', config);
this.register('Logger', new Logger(config.environment, config.enableLogs));
this.register('HttpClient', createHttpClient({
  config, logger: this.resolve('Logger'), getScenario: () => this.scenario.api,
}));
this.register('PostRemoteDataSource', this.createPostRemoteDataSource());
this.register('AppDatabase', this.createAppDatabase());
this.register('PostRepository', this.createPostRepository());
this.register('GetPostsUseCase', this.createGetPostsUseCase());

private createPostRepository() {
  return new PostRepositoryImpl(
    this.postRemoteDataSource,  // the remote source registered above
    this.appDatabase,           // the database registered above
    this.logger,
  );
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="The graph at a glance">
                <CodeBlock
                    language="text"
                    defaultOpen
                    code={`GetPostsUseCase
  └─ PostRepositoryImpl
       ├─ PostRemoteDataSource   (FakeApiService  | JsonPlaceholder…DataSource)
       │     └─ HttpClient (axios, interceptors)
       ├─ AppDatabase             (FakeAppDatabase | AppDatabaseImpl/Dexie)
       └─ Logger`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Configuration-driven implementation selection                           */
/* -------------------------------------------------------------------------- */

function ConfigDrivenSection() {
    return (
        <SectionWrapper title="Configuration-driven wiring — same consumers, different impl">
            <ContentGroupWrapper title="useFakeApi / useFakeDatabase swap the implementation">
                <TextBlock>
                    {`This is the payoff of depending on interfaces. The wiring helpers
branch on config: in dev (or when VITE_USE_FAKE_API is set) createPostRemoteDataSource
returns a FakeApiService; otherwise it returns the real JsonPlaceholder data
source backed by axios. The repository above neither knows nor cares which one
it received — it talks to the PostRemoteDataSource interface. So the same
repository, same use case, same UI run against either a canned fake (fast,
offline, failure-injectable) or the real REST API, selected entirely by
environment config at startup.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`private createPostRemoteDataSource(): PostRemoteDataSource {
  if (this.config.useFakeApi) {
    this.fakeApi = new FakeApiService(this.scenario.api); // dev stand-in
    return this.fakeApi;
  }
  return new JsonPlaceholderPostRemoteDataSource(this.httpClient); // real
}

private createAppDatabase(): AppDatabase {
  if (this.config.useFakeDatabase) {
    this.fakeDb = new FakeAppDatabase(this.scenario.db);
    return this.fakeDb;
  }
  return new AppDatabaseImpl(); // real Dexie/IndexedDB
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Runtime scenario control (dev)                                         */
/* -------------------------------------------------------------------------- */

function ScenarioControlSection() {
    return (
        <SectionWrapper title="Runtime scenario control — flipping failures at runtime">
            <ContentGroupWrapper title="A mutable holder captured by reference">
                <TextBlock>
                    {`The container owns a scenario holder ({ api, db }) that the dev
screens mutate at runtime via setApiScenario / setDbScenario. The clever part is
how the HTTP client and fakes see the change: the client was given getScenario:
() => this.scenario.api — a function that reads the holder live, by reference —
so the next request picks up the new value with nothing re-registered. The
fakes get setScenario called directly. That is how the API / Exception screens
flip a fetch from success to network-error to server-error without reloading.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// the holder is a plain mutable object on the container
private readonly scenario = { api: ApiScenario.Success, db: DbScenario.Success };

// the HTTP client reads it live via a getter function captured at wiring time:
createHttpClient({ getScenario: () => this.scenario.api, ... });

// dev screens mutate it; the next request/execute observes the new value
setApiScenario(s: ApiScenario) {
  this.scenario.api = s;
  this.fakeApi?.setScenario(s);   // fakes update too
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Bootstrap                                                               */
/* -------------------------------------------------------------------------- */

function BootstrapSection() {
    return (
        <SectionWrapper title="Bootstrap — initialize before the first render">
            <ContentGroupWrapper title="One line in main.tsx wires the whole app">
                <TextBlock>
                    {`Before React renders anything, main.tsx calls container.initialize(createAppConfig()).
createAppConfig reads Vite's import.meta.env (selected by --mode) into an
AppConfig; initialize uses it to build and register every singleton. By the time
the component tree mounts, every service exists and every screen can resolve
what it needs. The container is also where app-lifecycle concerns live: in a
real app this is where you'd open the database connection, fetch an auth token,
or warm a cache before paint. dispose() is the symmetric teardown — it closes
the Dexie connection and clears the registry (used in tests).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// src/main.tsx
import { container } from './core/container';
import { createAppConfig } from './core/config';

container.initialize(createAppConfig());   // wire everything, once

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider><RouterProvider router={router} /></ThemeProvider>
  </StrictMode>,
);

// any screen, any hook resolves what it needs:
const { state } = usePosts();              // default arg: container.getPostsUseCase`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Live — the wiring inspector                                             */
/* -------------------------------------------------------------------------- */

const API_LABEL: Record<ApiScenario, string> = {
    [ApiScenario.Success]: 'success',
    [ApiScenario.NetworkError]: 'network error',
    [ApiScenario.Timeout]: 'timeout',
    [ApiScenario.ServerError]: 'server error (500)',
    [ApiScenario.InvalidJson]: 'invalid JSON',
};
const DB_LABEL: Record<DbScenario, string> = {
    [DbScenario.Success]: 'success',
    [DbScenario.Empty]: 'empty cache',
    [DbScenario.ReadError]: 'read error',
    [DbScenario.WriteError]: 'write error',
};

function LiveDemoSection() {
    return (
        <SectionWrapper title="Live — inspect the real container">
            <ContentGroupWrapper title="See what's wired, and steer the dev scenarios">
                <TextBlock>
                    {`This reads the actual container — the same singleton the rest of the
app resolves from. The tree shows the resolved object graph and which
implementation each swappable slot is using (fake in dev). The two selectors
call container.setApiScenario / setDbScenario live, so the next pipeline run
(API / Exception screens, or a refetch elsewhere) observes the new value — the
runtime-mutable half of dependency management. Swapping fake ↔ real, by
contrast, is a startup decision driven by environment config, not changeable
here.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="container.resolve(...) — the live object graph">
                <WiringDemo />
            </Example>
        </SectionWrapper>
    );
}

function WiringDemo() {
    const {
        environment,
        useFakeApi,
        useFakeDatabase,
        apiScenario,
        dbScenario,
        remoteIsFake,
        dbIsFake,
        setApiScenario,
        setDbScenario,
    } = useWiringDemo();

    const envLabel: Record<string, string> = {
        [Environment.Dev]: 'dev',
        [Environment.Staging]: 'staging',
        [Environment.Prod]: 'prod',
    };

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-xs">
                <span className="rounded-pill border border-outline px-sm py-[2px] text-overline uppercase tracking-[0.08em] text-on-surface-variant">
                    env: {envLabel[environment]}
                </span>
                <span className="text-caption text-on-surface-variant">
                    useFakeApi: {String(useFakeApi)} · useFakeDatabase:{' '}
                    {String(useFakeDatabase)}
                </span>
            </div>

            <div className="rounded-md border border-outline bg-surface-variant px-md py-md font-mono text-body-sm leading-relaxed text-on-surface">
                <p>GetPostsUseCase</p>
                <p className="pl-md">└─ PostRepositoryImpl</p>
                <p className="pl-lg">
                    ├─ PostRemoteDataSource →{' '}
                    <span className="font-semibold text-on-surface">
                        {remoteIsFake
                            ? 'FakeApiService'
                            : 'JsonPlaceholderPostRemoteDataSource'}
                    </span>{' '}
                    <span className="text-on-surface-variant">
                        {remoteIsFake ? '(dev stand-in)' : '(real REST)'}
                    </span>
                </p>
                <p className="pl-lg">
                    ├─ AppDatabase →{' '}
                    <span className="font-semibold text-on-surface">
                        {dbIsFake ? 'FakeAppDatabase' : 'AppDatabaseImpl'}
                    </span>{' '}
                    <span className="text-on-surface-variant">
                        {dbIsFake ? '(in-memory)' : '(Dexie/IndexedDB)'}
                    </span>
                </p>
                <p className="pl-lg">
                    └─ Logger
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-xs">
                <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                    API scenario
                    <select
                        value={apiScenario}
                        onChange={(e) =>
                            setApiScenario(e.target.value as ApiScenario)
                        }
                        className="rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    >
                        {API_SCENARIOS.map((s) => (
                            <option key={s} value={s}>
                                {API_LABEL[s]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                    DB scenario
                    <select
                        value={dbScenario}
                        onChange={(e) =>
                            setDbScenario(e.target.value as DbScenario)
                        }
                        className="rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    >
                        {DB_SCENARIOS.map((s) => (
                            <option key={s} value={s}>
                                {DB_LABEL[s]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <p className="text-caption text-on-surface-variant">
                Flipped at runtime via container.setApiScenario / setDbScenario —
                the next fetch observes the new value. (Fake ↔ real is decided at
                initialize() from env config; the API-handling screen can also
                swap the remote live via container.setUseFakeApi.)
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 9. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — same need, different conventions">
            <ContentGroupWrapper title="get_it + @injectable vs a hand-rolled locator">
                <TextBlock>
                    {`The goal is identical: build services once, inject them, swap impls
per environment. The Flutter guide uses get_it as the locator plus @injectable
for code generation — annotate a class with @injectable and a builder generates
the registration calls, auto-wiring constructors by type. React/TypeScript has
no equivalent codegen standard, so this app wires by hand. The practical
differences:

• Registration — Flutter: @injectable annotation + generated getIt.register calls.
  React: explicit register(name, instance) lines in initialize(). More typing,
  zero magic, trivial to step through.

• Context vs locator — Flutter also has Provider/Context for reactive services.
  React has Context for the same purpose, and it's the right tool when a service
  changing should re-render the tree (theme, auth). The locator is for stable,
  non-reactive services — the HTTP client doesn't change, so nothing should
  re-render when it's read.

• Testing — both swap fakes via the locator. Flutter tests register a fake with
  getIt before the test; React tests either do the same with the container or,
  more simply, pass a fake directly to a hook/class constructor (the default
  argument: usePosts(fakeUseCase)). Constructor injection makes this especially
  ergonomic in React.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
