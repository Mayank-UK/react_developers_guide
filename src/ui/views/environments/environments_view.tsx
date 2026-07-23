import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import { container } from '../../../core/container';
import { createAppConfig } from '../../../core/config';
import { Environment, type AppConfig } from '../../../core/config/app-config';

/**
 * EnvironmentsView — how this app keeps dev, staging, and production apart.
 *
 * Vite replaces Flutter's "one entrypoint per flavour" model with build modes:
 * a single codebase, one `.env.<mode>` file per environment, selected by
 * `--mode` at build time. The selected values flow through one function
 * (createAppConfig) into the AppConfig the container wires from. Nothing in the
 * UI or domain knows which environment it is in — only the container does.
 */
export default function EnvironmentsView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatAndWhySection />
            <ModesSection />
            <EnvFilesSection />
            <ConfigFlowSection />
            <WhatDiffersSection />
            <ScriptsSection />
            <ReactVsFlutterSection />
            <LiveConfigSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What and why                                                            */
/* -------------------------------------------------------------------------- */

function WhatAndWhySection() {
    return (
        <SectionWrapper title="What an environment is, and why you need three">
            <ContentGroupWrapper title="Same code, different facts">
                <TextBlock>
                    {`An environment is the set of facts the app is built with: which API
base URL to call, whether to use the fake backend, whether to log. The code is
identical across environments — only those facts change. Keeping them apart
lets you run the app locally against a fake backend (fast, offline, failure-
injectable), exercise the real pipeline against a staging server (production-
shaped but throwaway), and ship a stripped-down bundle to production (real API,
logs off, no fakes). The rule: no environment-specific branches inside feature
code — all of it reads from AppConfig, so "which environment am I in?" has one
answer, in one place.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Vite modes                                                              */
/* -------------------------------------------------------------------------- */

function ModesSection() {
    return (
        <SectionWrapper title="Vite modes — one build flag selects the whole environment">
            <ContentGroupWrapper title="--mode picks the .env file and import.meta.env.MODE">
                <TextBlock>
                    {`Vite has a built-in notion of a mode. npm run dev runs in development
(the default for serve); npm run build runs in production (the default for
build); and --mode staging selects a third. Vite loads .env.<mode> for the
active mode, exposes the matching MODE to import.meta.env, and that is the
single switch the rest of the app reads. There is no per-environment entrypoint
to forget to update and no separate main file to drift out of sync.`}
                </TextBlock>
                <CodeBlock
                    language="bash"
                    code={`vite                         # serve, mode = development → .env.development
vite --mode staging          # serve, mode = staging       → .env.staging
vite build                   # build, mode = production    → .env.production
vite build --mode staging    # build, mode = staging       → .env.staging`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="VITE_ prefix — only these reach the client">
                <TextBlock>
                    {`Vite only exposes env vars prefixed with VITE_ to client code. A bare
API_KEY in .env stays on the server side and is undefined at runtime — a
deliberate guard against leaking secrets into a public bundle. (Anything truly
secret still must not ship to a client bundle at all; env vars are inlined into
the JS the browser downloads, so they are public the moment they are prefixed
VITE_. Real secrets belong behind a backend.)`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The three env files                                                     */
/* -------------------------------------------------------------------------- */

function EnvFilesSection() {
    return (
        <SectionWrapper title="The three .env files, side by side">
            <ContentGroupWrapper title="One file per mode, same keys, different values">
                <CodeBlock
                    language="bash"
                    defaultOpen
                    code={`# .env.development          # .env.staging             # .env.production
VITE_BASE_URL=\\              VITE_BASE_URL=\\           VITE_BASE_URL=\\
  jsonplaceholder…            https://staging…          https://api.example.com
VITE_USE_FAKE_API=true       VITE_USE_FAKE_API=false   VITE_USE_FAKE_API=false
VITE_USE_FAKE_DB=true        VITE_USE_FAKE_DB=false    VITE_USE_FAKE_DB=false
VITE_ENABLE_LOGS=true        VITE_ENABLE_LOGS=true     VITE_ENABLE_LOGS=false
VITE_API_SCENARIO=success    # (dev-only knob)         # (dev-only knob)
VITE_DB_SCENARIO=success     # (dev-only knob)         # (dev-only knob)`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Read the differences as policy">
                <TextBlock>
                    {`• dev uses fakes + failure injection so the whole error pipeline runs
  without a backend, and logs everything.
• staging points at a real (but throwaway) backend with the real HTTP client
  and real IndexedDB cache, still logging so you can watch it.
• production points at the real backend with logs off and every dev convenience
  (fakes, scenarios) forced off — not just unset.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Config flow                                                             */
/* -------------------------------------------------------------------------- */

function ConfigFlowSection() {
    return (
        <SectionWrapper title="The flow — env vars to a wired container in one function">
            <ContentGroupWrapper title="createAppConfig is the only reader of import.meta.env">
                <TextBlock>
                    {`Every environment fact enters the app through a single function:
createAppConfig. It reads import.meta.env (already mode-selected by Vite),
parses booleans, resolves the Environment, and returns a typed AppConfig. No
other file reads env vars directly — they read container.appConfig instead. That
makes the config testable (a test passes a fake env object) and keeps the
"where did this value come from?" answer to one place.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/core/config/index.ts (trimmed)
export function createAppConfig(env = import.meta.env): AppConfig {
  const environment = resolveEnvironment(env.MODE);     // 'development' → Dev
  return {
    environment,
    baseUrl: env.VITE_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
    useFakeApi:
      environment === Environment.Dev
        ? parseBoolean(env.VITE_USE_FAKE_API, true)     // dev default: fake
        : false,                                         // staging/prod: never
    enableLogs: parseBoolean(env.VITE_ENABLE_LOGS, environment !== Environment.Prod),
    // …apiScenario, dbScenario (dev failure injection)
  };
}

// main.tsx — config feeds the container, once, before render
container.initialize(createAppConfig());`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. What differs across environments                                        */
/* -------------------------------------------------------------------------- */

function WhatDiffersSection() {
    return (
        <SectionWrapper title="What the environment actually controls">
            <ContentGroupWrapper title="Three switches, each with a reason">
                <TextBlock>
                    {`• baseUrl — the API the remote data source calls. The repository does
  not know the URL; the container hands the configured HttpClient to the data
  source, so switching environments moves the target with zero feature-code
  changes.

• useFakeApi / useFakeDatabase — whether the container wires the real sources
  (axios REST + Dexie/IndexedDB) or the in-memory fakes. Forced false outside
  dev: the dev conveniences (failure-injectable fakes) must never reach a real
  user. See the Dependency management screen for how the wiring branches.

• enableLogs — the Logger's gate. dev/staging emit at every level; production
  gates to error-only so the console stays clean and nothing sensitive is
  shipped. See the Debugging screen for how the gate works.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Scripts                                                                 */
/* -------------------------------------------------------------------------- */

function ScriptsSection() {
    return (
        <SectionWrapper title="The npm scripts that drive each environment">
            <ContentGroupWrapper title="One pair per target mode">
                <TextBlock>
                    {`package.json holds a serve + build pair for each environment. The dev
pair runs locally; the staging pair builds a production-shaped bundle pointed at
the staging backend (useful for QA before promoting); the production pair is
what ships. createAppConfig is called in every case — the only difference is
which --mode Vite applies.`}
                </TextBlock>
                <CodeBlock
                    language="json"
                    code={`"scripts": {
  "dev":            "vite",                    // development serve
  "dev:staging":    "vite --mode staging",     // staging serve
  "build":          "tsc -b && vite build",    // production build
  "build:staging":  "tsc -b && vite build --mode staging"
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — build modes vs dart-define entrypoints">
            <ContentGroupWrapper title="Vite --mode vs --flavor / main_*.dart / --dart-define">
                <TextBlock>
                    {`The goal — same code, per-environment facts — is identical. The
mechanism differs sharply:

• Flutter typically uses separate entrypoints (main_dev.dart,
  main_staging.dart, main_prod.dart) each constructing an AppConfig, and/or
  build flavors with native config (Android applicationId suffixes, iOS schemes).
  That is more moving parts per environment.

• React/Vite collapses it to a single switch: --mode picks the .env file, and
  createAppConfig is the one entrypoint that consumes it. There are no native
  flavour configs because there is no native layer — the bundle is the same
  bytes, just inlined with different values.

• Secrets — neither model protects a client-bundled secret; both still need a
  backend for anything sensitive. Vite's VITE_ prefix just makes "this is
  public" explicit by opting in.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Live — resolved config per environment                                  */
/* -------------------------------------------------------------------------- */

const ENV_LABEL: Record<Environment, string> = {
    [Environment.Dev]: 'development',
    [Environment.Staging]: 'staging',
    [Environment.Prod]: 'production',
};

// Simulate each environment's env block (mirrors the real .env.<mode> files).
const ENV_BLOCKS: Record<Environment, Record<string, string>> = {
    [Environment.Dev]: {
        MODE: 'development',
        VITE_BASE_URL: 'https://jsonplaceholder.typicode.com',
        VITE_USE_FAKE_API: 'true',
        VITE_USE_FAKE_DB: 'true',
        VITE_ENABLE_LOGS: 'true',
    },
    [Environment.Staging]: {
        MODE: 'staging',
        VITE_BASE_URL: 'https://staging.example.com',
        VITE_USE_FAKE_API: 'false',
        VITE_USE_FAKE_DB: 'false',
        VITE_ENABLE_LOGS: 'true',
    },
    [Environment.Prod]: {
        MODE: 'production',
        VITE_BASE_URL: 'https://api.example.com',
        VITE_USE_FAKE_API: 'false',
        VITE_USE_FAKE_DB: 'false',
        VITE_ENABLE_LOGS: 'false',
    },
};

function LiveConfigSection() {
    const live = container.appConfig;
    return (
        <SectionWrapper title="Live — what each environment resolves to">
            <ContentGroupWrapper title="createAppConfig, run against each env block">
                <TextBlock>
                    {`The "resolved config" column is the real createAppConfig function
running against a simulated env block for each mode — the same function main.tsx
calls, just fed each environment's values. Compare it with the live app (the
banner below), which reads the actual container wired from the current Vite
mode. Notice how staging and production force the fakes off regardless of the
env var, and how production gates the logs.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="createAppConfig() per mode — live">
                <ConfigTable />
            </Example>
            <div className="flex flex-wrap items-center gap-xs rounded-md border border-outline bg-surface px-md py-sm">
                <span className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                  this running build
                </span>
                <span className="rounded-pill border border-outline px-sm py-[2px] font-mono text-caption text-on-surface">
                    MODE = {ENV_LABEL[live.environment]}
                </span>
                <span className="font-mono text-caption text-on-surface-variant">
                    baseUrl: {live.baseUrl} · useFakeApi: {String(live.useFakeApi)} ·
                    enableLogs: {String(live.enableLogs)}
                </span>
            </div>
        </SectionWrapper>
    );
}

function ConfigTable() {
    const modes = [Environment.Dev, Environment.Staging, Environment.Prod];
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
                <thead>
                    <tr className="text-left text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                        <th className="border-b border-outline px-sm py-xs">AppConfig field</th>
                        {modes.map((m) => (
                            <th key={m} className="border-b border-outline px-sm py-xs">
                                {ENV_LABEL[m]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="font-mono text-caption text-on-surface">
                    <ConfigRow modes={modes} field="environment" render={(c) => ENV_LABEL[c.environment]} />
                    <ConfigRow modes={modes} field="baseUrl" render={(c) => c.baseUrl} />
                    <ConfigRow
                        modes={modes}
                        field="useFakeApi"
                        render={(c) => String(c.useFakeApi)}
                    />
                    <ConfigRow
                        modes={modes}
                        field="useFakeDatabase"
                        render={(c) => String(c.useFakeDatabase)}
                    />
                    <ConfigRow
                        modes={modes}
                        field="enableLogs"
                        render={(c) => String(c.enableLogs)}
                    />
                </tbody>
            </table>
        </div>
    );
}

function ConfigRow({
    modes,
    field,
    render,
}: {
    modes: Environment[];
    field: string;
    render: (c: AppConfig) => string;
}) {
    return (
        <tr>
            <td className="border-b border-outline px-sm py-xs text-on-surface-variant">
                {field}
            </td>
            {modes.map((m) => {
                const cfg = createAppConfig(ENV_BLOCKS[m] as unknown as never);
                return (
                    <td key={m} className="border-b border-outline px-sm py-xs">
                        {render(cfg)}
                    </td>
                );
            })}
        </tr>
    );
}
