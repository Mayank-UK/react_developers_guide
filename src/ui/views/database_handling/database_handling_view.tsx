import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import {
    DB_SCENARIOS,
    DbScenario,
} from '../../../core/scenario/db-scenario';
import { useCacheDemo } from './database_handling_hooks';

/**
 * DatabaseHandlingView — local persistence in this app.
 *
 * The local layer is a write-through cache: every successful remote fetch is
 * saved locally, and when the network fails the repository serves what was
 * cached. It is not a full SQL store — it's IndexedDB (via Dexie) holding the
 * same DTOs the API returns. The interesting part is the shape: like the remote
 * layer, there's an abstract contract (AppDatabase), a concrete connection that
 * owns the schema (AppDatabaseImpl), and per-table DAOs that own queries — so
 * the repository talks to an interface and never imports Dexie.
 *
 * This mirrors the Flutter guide's AppDatabase + DAOs (sqflite/Moor there).
 */
export default function DatabaseHandlingView() {
    return (
        <div className="flex flex-col gap-md">
            <WhyLocalSection />
            <ContractSection />
            <ConnectionSection />
            <DaoSection />
            <RepositoryUseSection />
            <ErrorMappingSection />
            <LiveDemoSection />
            <ReactVsFlutterSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What the local layer is for                                             */
/* -------------------------------------------------------------------------- */

function WhyLocalSection() {
    return (
        <SectionWrapper title="What the local layer is for">
            <ContentGroupWrapper title="A cache, not a source of truth">
                <TextBlock>
                    {`The server owns the truth; the local database owns a copy so the
app still works when the network doesn't. In this app it is strictly a
write-through cache of posts: the repository fetches from the remote, hands the
result to the UI, and writes the same DTOs to the local store on the way through.
On a later fetch that fails remotely, the repository reads the cache and serves
that instead (with a non-blocking "showing stale data" warning). If the cache is
empty too, only then does the user see a blocking error.

That is the whole job: persist across reloads and survive offline moments. The
rest of the app never asks the database directly — it goes through the
repository, which decides remote-vs-cache.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. AppDatabase — the contract                                              */
/* -------------------------------------------------------------------------- */

function ContractSection() {
    return (
        <SectionWrapper title="AppDatabase — the contract, not the engine">
            <ContentGroupWrapper title="The repository depends on an abstract class">
                <TextBlock>
                    {`Just like PostRepository hides the network behind an interface,
AppDatabase hides the storage engine. It is an abstract class declaring only
what the repository needs — insert and read posts. The repository holds an
AppDatabase, never a Dexie instance, never an IndexedDB request. So the engine
is swappable (the dev build swaps in FakeAppDatabase; production could swap in
anything) and the repository has zero knowledge of how rows are stored.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/local/app-database.ts
export abstract class AppDatabase {
  abstract insertPosts(posts: PostDTO[]): Promise<void>;
  abstract getPosts(): Promise<PostDTO[]>;
}

// the repository is wired against the abstract, in src/core/container.ts:
//   new PostRepositoryImpl(remote, /* AppDatabase */ local, logger)`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. AppDatabaseImpl — the Dexie connection                                  */
/* -------------------------------------------------------------------------- */

function ConnectionSection() {
    return (
        <SectionWrapper title="AppDatabaseImpl — the Dexie connection that owns the schema">
            <ContentGroupWrapper title="One place that knows about IndexedDB">
                <TextBlock>
                    {`AppDatabaseImpl is the only file that imports Dexie. It opens a
named database, declares the schema (version + which tables exist and what their
indexes/primary keys are), grabs a typed table handle, and hands it to a DAO.
Per-table queries live in the DAO, not here — mirroring how the remote layer
splits the http client (connection) from the data source (queries). Splitting
connection from queries keeps each file small and single-purpose.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/local/app-database.ts
import Dexie from 'dexie';

export class AppDatabaseImpl extends Dexie implements AppDatabase {
  private readonly postDAO: PostDAO;

  constructor() {
    super('app_database');
    // schema: table 'posts', primary key 'id', secondary index on 'title'
    this.version(1).stores({ posts: 'id, title' });
    const posts = this.table<PostDTO, number>('posts');
    this.postDAO = new PostDAO(posts);
  }

  async insertPosts(posts: PostDTO[]): Promise<void> {
    await this.postDAO.insertAll(posts);
  }
  async getPosts(): Promise<PostDTO[]> {
    return this.postDAO.getAll();
  }
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Why Dexie on top of IndexedDB">
                <TextBlock>
                    {`IndexedDB is the browser's built-in async database, but its raw
API is callback-based, transaction-heavy, and awkward to use directly. Dexie is
the standard React-side wrapper: it gives a promise-based API, a declarative
schema with versions and migrations, typed tables, and ergonomic queries
(bulkPut, toArray, where). Dexie stores plain JSON-shaped objects directly, so
PostDTO is both the in-memory and the on-disk shape — no extra serialization
layer is needed.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. DAO — one table, direct operations                                      */
/* -------------------------------------------------------------------------- */

function DaoSection() {
    return (
        <SectionWrapper title="PostDAO — one table, direct data-access operations">
            <ContentGroupWrapper title="Owns a single Dexie table; upgrades engine errors">
                <TextBlock>
                    {`A DAO (Data Access Object) owns all queries for one table. It
holds a single Dexie table and exposes insert/read/clear. Two things to notice:
it works with DTOs (the on-disk shape), never domain models — that mapping is
the repository's job one layer up; and it catches any engine error and re-throws
it as a typed AppDatabaseException with the original as cause, so a flaky
IndexedDB never leaks a raw Dexie error upward.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/local/daos/post-dao.ts
export class PostDAO {
  constructor(private readonly posts: Table<PostDTO, number>) {}

  async insertAll(posts: PostDTO[]): Promise<void> {
    try {
      await this.posts.bulkPut(posts);     // upsert by primary key 'id'
    } catch (e) {
      throw new AppDatabaseException(\`Failed to cache posts: \${stringify(e)}\`,
        { cause: e });
    }
  }

  async getAll(): Promise<PostDTO[]> {
    try {
      const rows = await this.posts.toArray();
      return rows.map((r) => postDtoFromJson(r)); // coerce on read too
    } catch (e) {
      throw new AppDatabaseException(\`Failed to read posts: \${stringify(e)}\`,
        { cause: e });
    }
  }
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. How the repository uses it                                              */
/* -------------------------------------------------------------------------- */

function RepositoryUseSection() {
    return (
        <SectionWrapper title="How the repository uses it — write-through + fallback">
            <ContentGroupWrapper title="Remote is primary, cache is the safety net">
                <TextBlock>
                    {`The repository is where remote and local meet. On a successful
fetch it writes the DTOs to the cache (best-effort — a cache write failure is
only logged, never shown to the user). On a network or server failure it reads
the cache instead: a hit yields Success with a non-blocking warning, a miss
surfaces the original blocking failure, and a cache read failure chains a
CacheFailure on top. The API-handling screen drives this live end-to-end; here
we focus on the store itself.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// src/data/repositories/post-repository-impl.ts (trimmed)
const remotePosts = await this.remote.getPosts();   // PostDTO[]
try {
  await this.local.insertPosts(remotePosts);        // write-through cache
} catch (e) {
  this.logger.warning('Failed to cache posts', e);  // non-fatal
}
return remotePosts.map(toPost);

// ...on remote failure, fall back:
const cached = await this.local.getPosts();         // PostDTO[]
if (cached.length > 0) return success(cached.map(toPost), networkFailure);
return forwardNetworkFailure(cause);                // cache miss → blocking`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Errors become typed exceptions → Failures                               */
/* -------------------------------------------------------------------------- */

function ErrorMappingSection() {
    return (
        <SectionWrapper title="Database errors become typed Failures">
            <ContentGroupWrapper title="The same pipeline as remote errors">
                <TextBlock>
                    {`A database failure follows the exact same path as a network
failure: the DAO throws an AppDatabaseException, the guards map it to a Failure,
and the Failure's severity decides how the UI presents it. A read failure during
cache fallback chains a CacheFailure (warning — non-blocking toast) on top of
the network failure that caused the fallback; a standalone database error maps
to a DatabaseFailure (critical — blocking). The UI never sees "DexieError" or a
raw IndexedDB event, only a Failure it can switch on.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// thrown in the DAO:
throw new AppDatabaseException('Failed to read posts', { cause: e });

// mapped by the guards (src/core/error-handling/guards.ts):
if (e instanceof AppDatabaseException) {
  return new DatabaseFailure(e.message, innerCause); // severity: critical
}

// during cache fallback, chained on top of the network failure:
const chained = new CacheFailure(dbError.message, networkFailure);
//   → chain: "No cached data available + caused by: No internet connection"`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Live — read/write the cache directly                                    */
/* -------------------------------------------------------------------------- */

const SCENARIO_LABEL: Record<DbScenario, string> = {
    [DbScenario.Success]: 'success',
    [DbScenario.Empty]: 'empty cache',
    [DbScenario.ReadError]: 'read error',
    [DbScenario.WriteError]: 'write error',
};

function LiveDemoSection() {
    return (
        <SectionWrapper title="Live — read and write the cache directly">
            <ContentGroupWrapper title="Steer the FakeAppDatabase and watch typed errors">
                <TextBlock>
                    {`This talks to the AppDatabase the repository uses (the dev
FakeAppDatabase). Write the sample posts, then read them back. Flip the scenario
to empty / read error / write error to see how the DAO upgrades the failure into
an AppDatabaseException — the same exception the guards later turn into a
DatabaseFailure. The repository write-through and offline fallback live on the
API-handling screen; here you're touching the store itself.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="container.appDatabase.insertPosts / getPosts">
                <CacheDemo />
            </Example>
        </SectionWrapper>
    );
}

function CacheDemo() {
    const { scenario, applyScenario, cache, note, write, read } =
        useCacheDemo();

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-xs">
                <label className="flex items-center gap-xs text-caption text-on-surface-variant">
                    DB scenario
                    <select
                        value={scenario}
                        onChange={(e) =>
                            applyScenario(e.target.value as DbScenario)
                        }
                        className="rounded-md border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    >
                        {DB_SCENARIOS.map((s) => (
                            <option key={s} value={s}>
                                {SCENARIO_LABEL[s]}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="button"
                    onClick={() => void write()}
                    className="rounded-md border border-outline px-sm py-xs text-caption text-on-surface-variant hover:bg-surface-variant"
                >
                    write sample posts
                </button>
                <button
                    type="button"
                    onClick={() => void read()}
                    className="rounded-md border border-outline px-sm py-xs text-caption text-on-surface-variant hover:bg-surface-variant"
                >
                    ↻ read cache
                </button>
            </div>

            {note && (
                <p className="rounded-md border border-outline bg-surface px-md py-xs text-caption text-on-surface-variant">
                    {note}
                </p>
            )}

            {cache.status === 'reading' && (
                <p
                    className="rounded-md border border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant"
                    data-testid="cache-reading"
                >
                    Reading cache…
                </p>
            )}

            {cache.status === 'error' && (
                <p
                    className="rounded-md border border-outline bg-surface-variant px-md py-md text-body-sm text-on-surface"
                    data-testid="cache-error"
                >
                    ⚠ AppDatabaseException: {cache.message}
                </p>
            )}

            {cache.status === 'read' && (
                <div data-testid="cache-contents">
                    {cache.posts.length === 0 ? (
                        <p className="rounded-md border border-dashed border-outline bg-surface px-md py-md text-body-sm text-on-surface-variant">
                            Cache is empty — write posts, then read again.
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-xs">
                            {cache.posts.map((p) => (
                                <li
                                    key={p.id}
                                    className="rounded-md border border-outline bg-surface px-md py-sm"
                                >
                                    <p className="text-body-sm font-medium text-on-surface">
                                        {p.title}
                                    </p>
                                    <p className="text-caption text-on-surface-variant">
                                        {p.body}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. React vs Flutter                                                        */
/* -------------------------------------------------------------------------- */

function ReactVsFlutterSection() {
    return (
        <SectionWrapper title="React vs Flutter — same shape, different engine">
            <ContentGroupWrapper title="The layering is identical; only the storage engine changes">
                <TextBlock>
                    {`The Flutter guide uses the exact same AppDatabase + DAO split,
backed by sqflite (or Moor/drift). The React app keeps the shape and swaps the
engine for IndexedDB via Dexie. Key differences:

• Engine — sqflite gives synchronous-feeling SQL over SQLite; IndexedDB is
  natively async and object/document-oriented, not relational. Dexie tames it
  with promises and a schema, but there's no SQL — queries are method chains.
• On-disk shape — Dexie stores plain JSON objects directly, so PostDTO is both
  the in-memory and persisted shape. With SQLite you typically map rows ↔
  objects in the DAO.
• Schema/migrations — Dexie models these as version(n).stores({...}); bumping
  the version runs the migration. sqflite migrations are handwritten SQL.
• Same everywhere else — abstract contract, DAO-per-table, DTO-not-model, typed
  AppDatabaseException → Failure, repository-driven write-through + fallback.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
