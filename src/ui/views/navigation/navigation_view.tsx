import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';
import {
    setAuthed,
    useMiniRouter,
    type MiniLocation,
    type NavOpts,
} from './navigation_hooks';

/**
 * NavigationView — how React Router turns a single-page app into something that
 * behaves like a multi-page site: the URL changes, back/forward work, deep
 * links land on the right screen, and only the changed parts re-render.
 *
 * React's standard is React Router (v7+ ships as the `react-router` package,
 * data-router API). Flutter's equivalent is `go_router`; the concepts line up
 * closely but the wiring is data-driven in React.
 *
 * Every concept below ships a LIVE demo built on an isolated in-memory router
 * (createMemoryRouter) so the demos can navigate, read params, and redirect
 * without ever leaving this page.
 */
export default function NavigationView() {
    return (
        <div className="flex flex-col gap-md">
            <MentalModelSection />
            <RouterConfigSection />
            <NavigationSection />
            <ParamsSection />
            <SearchParamsSection />
            <HandlesSection />
            <RedirectAndNotFoundSection />
            <GuardsSection />
            <LazyLoadingSection />
        </div>
    );
}

/* ========================================================================== */
/* 0. Mental model — what routing solves                                      */
/* ========================================================================== */

function MentalModelSection() {
    return (
        <SectionWrapper title="What routing solves">
            <ContentGroupWrapper title="The URL is your source of truth">
                <TextBlock>
                    {`A plain React app is a single HTML page: clicking around swaps components in
memory, but the browser's URL never changes — so refresh breaks, the back button
is dead, and you can't bookmark or share a specific screen. A router fixes that
by treating the URL as state: each path maps to a component, and changing the
path renders the matching screen WITHOUT a full page reload. That is what makes
a single-page app (SPA) feel like a real website.
Flutter's go_router plays the identical role; in React the standard library is
React Router, configured here with its data-router API
(createBrowserRouter + <RouterProvider>).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            How this app boots the router —{' '}
                            <span className="font-mono">src/ui/routing/router.tsx</span>.
                        </span>
                    }
                    code={`import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes';          // the route table (data)

export const router = createBrowserRouter(routes);

// main.tsx — one provider wraps the whole app
<RouterProvider router={router} />`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Declarative vs imperative navigation">
                <TextBlock>
                    {`You navigate two ways. DECLARATIVE: render a <Link to="/x"> — used wherever
navigation is a static UI affordance (a nav bar, a card). IMPERATIVE: call the
useNavigate() hook — used when navigation is a side effect of logic (after a
successful login, a form submit, a timer). Reach for <Link> first; reach for
useNavigate only when there is no element to attach the link to.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// declarative — the element itself is the navigation
<Link to="/users">Users</Link>

// imperative — navigation as a consequence of something happening
const navigate = useNavigate();
function onLoginSuccess() {
  navigate('/dashboard', { replace: true }); // replace = no back-button entry
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 1. Routes as data — the route table + nested <Outlet/>                     */
/* ========================================================================== */

function RouterConfigSection() {
    return (
        <SectionWrapper title="Routes as data & nested outlets">
            <ContentGroupWrapper title="A route tree, not a switch of ifs">
                <TextBlock>
                    {`The whole app is described as a tree of route objects (RouteObject[]). A parent
route renders a LAYOUT component and uses <Outlet/> to say "the matched child
renders here". That is how this app's shared chrome (header, theme toggle) lives
in ONE place — RootLayout is the parent, every screen is a child rendered into
its outlet — instead of being repeated on every screen. Nested paths nest the
URL too: /ui/layout is a child of /ui.
The "index" route is what renders at the parent's exact path (e.g. /ui itself).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,        // shared chrome (header + theme toggle)
    children: [                     // each renders into <Outlet/> below
      { index: true, element: <HomeView /> },           // "/"
      { path: 'users', element: <UsersView /> },         // "/users"
      { path: 'users/:id', element: <UserDetailView /> },// "/users/42"
    ],
  },
];

// RootLayout.jsx — the outlet is where the matched child appears
function RootLayout() {
  return (
    <div className="app-shell">
      <header>…shared header…</header>
      <main><Outlet /></main>   {/* ← child route renders here */}
    </div>
  );
}`}
                />
            </ContentGroupWrapper>
            <Example label="A self-contained mini-app — watch the URL + outlet">
                <p className="text-body-sm text-on-surface-variant">
                    React Router forbids nesting a{' '}
                    <code className="font-mono">RouterProvider</code> inside this
                    page's router, so this mini-app reproduces a router's behaviour
                    in state. Click the links: the URL readout updates, the matched
                    screen renders into the body, but the{' '}
                    <em>shared shell</em> never re-mounts.
                </p>
                <MiniApp initialEntries={['/']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 2. Navigation — <Link>, <NavLink> active state, useNavigate                */
/* ========================================================================== */

function NavigationSection() {
    return (
        <SectionWrapper title="Navigating — Link, NavLink & useNavigate">
            <ContentGroupWrapper title="Three tools, pick by intent">
                <TextBlock>
                    {`<Link> renders an <a> tag that changes the URL without a reload. <NavLink> is a
<Link> that ALSO knows whether it is active — pass a function to className (or
use the children render-prop) to style the current target differently, which is
exactly what nav bars need. useNavigate() returns a function you call from a
handler to navigate programmatically; pass { replace: true } to overwrite the
current history entry (post-login redirects) or a number to go back/forward.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// <NavLink> styles itself when its target matches the current URL
<NavLink
  to="/users"
  className={({ isActive }) =>
    isActive ? 'nav-link nav-link--active' : 'nav-link'
  }
>
  Users
</NavLink>

// imperative navigation from an event handler
const navigate = useNavigate();
<button onClick={() => navigate(-1)}>Back</button>      // history back
<button onClick={() => navigate('/dashboard')}>Go</button>`}
                />
            </ContentGroupWrapper>
            <Example label="NavLink active state + a useNavigate back button">
                <p className="text-body-sm text-on-surface-variant">
                    The nav uses <code className="font-mono">&lt;NavLink&gt;</code>;
                    the matching entry lights up. The Back button uses{' '}
                    <code className="font-mono">useNavigate(-1)</code>.
                </p>
                <MiniApp initialEntries={['/users']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 3. Dynamic route params — :id + useParams                                   */
/* ========================================================================== */

function ParamsSection() {
    return (
        <SectionWrapper title="Dynamic route params — :id & useParams">
            <ContentGroupWrapper title="Put a variable in the path, read it in the component">
                <TextBlock>
                    {`When part of the URL is data (a record id, a slug), declare it as a path
parameter with a colon: path: 'users/:id'. The matched component then reads it
with the useParams() hook, which returns an object of { name: string }. This is
the idiomatic React way to pass a resource identifier through the URL — it is
shareable, bookmarkable, and survives a refresh, unlike passing it through
component state.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// route table
{ path: 'users/:id', element: <UserDetailView /> }

// component — read the param by name
function UserDetailView() {
  const { id } = useParams();          // { id: '42' }
  return <h1>User #{id}</h1>;
}

// link to it — interpolate the value
<Link to={\`/users/\${user.id}\`}>{user.name}</Link>`}
                />
            </ContentGroupWrapper>
            <Example label="Pick a user — the :id param is read live">
                <p className="text-body-sm text-on-surface-variant">
                    Each link targets{' '}
                    <code className="font-mono">/users/&lt;id&gt;</code>; the detail
                    screen reads it with{' '}
                    <code className="font-mono">useParams()</code>.
                </p>
                <MiniApp initialEntries={['/users']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 4. Query / search params — useSearchParams                                  */
/* ========================================================================== */

function SearchParamsSection() {
    return (
        <SectionWrapper title="Query strings — useSearchParams">
            <ContentGroupWrapper title="Optional, filter-style state in the URL">
                <TextBlock>
                    {`Path params are for the resource identity (which record). For OPTIONAL,
filter-style state (a search term, a sort order, a page number), use the query
string — ?q=alice&sort=name. useSearchParams() returns a URLSearchParams object
plus a setter; reading and writing it keeps the URL in sync so the view is
shareable and back-button friendly. This is React's standard answer to "state
that belongs in the address bar".`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`function SearchView() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';          // read ?q=

  return (
    <input
      value={q}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        next.set('q', e.target.value);       // write ?q=
        setParams(next);
      }}
    />
  );
}`}
                />
            </ContentGroupWrapper>
            <Example label="Type a filter — the query string updates live">
                <p className="text-body-sm text-on-surface-variant">
                    The input is bound to the{' '}
                    <code className="font-mono">?q=</code> query param. Watch the URL
                    readout change as you type.
                </p>
                <MiniApp initialEntries={['/search']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 5. Route handles — per-route metadata via useMatches                        */
/* ========================================================================== */

function HandlesSection() {
    return (
        <SectionWrapper title="Route handles — attaching metadata to a route">
            <ContentGroupWrapper title="The bridge this app uses for page titles">
                <TextBlock>
                    {`Every route object accepts an arbitrary handle field — a place to hang
route-specific metadata (a title, a breadcrumb, a crumb label). useMatches()
returns the full chain of matched route objects from the root down, so a parent
layout can read the deepest match's handle without the child passing anything.
This app puts the page title on handle.title and the shared layout surfaces it
through a tiny useRouteTitle() hook — that is how the header always knows the
current page's name.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// route table — tuck a title onto the route
{ path: 'users/:id', element: <UserDetailView />,
  handle: { title: 'User detail' } }

// any component — read the deepest match's handle
import { useMatches } from 'react-router';

export function useRouteTitle() {
  const matches = useMatches();
  const last = matches[matches.length - 1];
  return last?.handle?.title;     // "User detail"
}`}
                />
            </ContentGroupWrapper>
            <Example label="Read the current route's handle">
                <p className="text-body-sm text-on-surface-variant">
                    The readout below mirrors what{' '}
                    <code className="font-mono">useMatches()</code> returns — the
                    deepest matched route's{' '}
                    <code className="font-mono">handle.title</code>. Navigate the
                    mini-app and it updates with the URL.
                </p>
                <MiniApp initialEntries={['/users/7']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 6. Redirects & 404                                                         */
/* ========================================================================== */

function RedirectAndNotFoundSection() {
    return (
        <SectionWrapper title="Redirects & the not-found catch-all">
            <ContentGroupWrapper title="Redirect declaratively, catch unknown paths">
                <TextBlock>
                    {`Render <Navigate to="..." replace /> to redirect — common for "moved"
routes, auth-gated fallbacks, or the index of a section that should land on its
first child. For unknown URLs, add a catch-all route with path: '*'. This app
redirects its '*' to home so a typo never strands the user on a blank screen.
Replace vs push: replace swaps the current history entry (the user can't hit
back into the redirect), push adds one.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// declarative redirect — render <Navigate> instead of real content
function OldUserRoute() {
  return <Navigate to="/users" replace />;
}

// catch-all — must be the LAST child
{ path: '*', element: <NotFoundView /> }

// this app's actual catch-all redirects home:
{ path: '*', element: <Navigate to="/" replace /> }`}
                />
            </ContentGroupWrapper>
            <Example label="Visit an unknown path — the catch-all handles it">
                <p className="text-body-sm text-on-surface-variant">
                    This mini-app starts at{' '}
                    <code className="font-mono">/totally-made-up</code>; the{' '}
                    <code className="font-mono">*</code> route renders a friendly
                    not-found screen instead of a blank page.
                </p>
                <MiniApp initialEntries={['/totally-made-up']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 7. Navigation guards / protected routes                                    */
/* ========================================================================== */

function GuardsSection() {
    return (
        <SectionWrapper title="Guards & protected routes">
            <ContentGroupWrapper title="React has no built-in guard — compose one">
                <TextBlock>
                    {`Unlike Flutter/Android with middleware interceptors, React Router has no
first-class "guard" API. The idiomatic pattern is a WRAPPER COMPONENT that checks
a condition and renders <Navigate to="/login" replace /> when it fails, otherwise
renders its children. Put it on the protected route's element and any
unauthorized visit is redirected. For async checks (is the session valid?), the
data-router's loader/redirect API is the production-grade answer — but the
wrapper component covers the common case and is what this demo shows.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`function RequireAuth({ children }: { children: ReactNode }) {
  const authed = useAuth();                 // your auth store/hook
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// route table — wrap the protected element
{ path: 'dashboard', element: (
    <RequireAuth><DashboardView /></RequireAuth>
) }

// login screen flips the flag, then navigates
const navigate = useNavigate();
<button onClick={() => { signIn(); navigate('/dashboard'); }}>
  Sign in
</button>`}
                />
            </ContentGroupWrapper>
            <Example label="A protected route — blocked until you sign in">
                <p className="text-body-sm text-on-surface-variant">
                    The mini-app starts at{' '}
                    <code className="font-mono">/dashboard</code> while signed out;
                    <code className="font-mono"> &lt;RequireAuth&gt;</code> redirects
                    to <code className="font-mono">/login</code>. Sign in to land on
                    the dashboard; sign out to see the redirect again.
                </p>
                <MiniApp initialEntries={['/dashboard']} />
            </Example>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/* 8. Lazy loading routes                                                     */
/* ========================================================================== */

function LazyLoadingSection() {
    return (
        <SectionWrapper title="Lazy loading routes (code-splitting)">
            <ContentGroupWrapper title="Ship less JS up front">
                <TextBlock>
                    {`Bundling every screen into one file makes the first load slow on a big app.
React's standard fix is per-route code-splitting: wrap each route's element in
React.lazy() (which produces a dynamically-imported chunk) and suspend it with a
<React.Suspense fallback>. The data router also accepts a lazy property directly
on a route object, splitting the WHOLE route module. Users only download the
code for screens they actually visit. This learning app keeps everything eager
for simplicity, but production apps split at the route boundary.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`import { lazy, Suspense } from 'react';

// each screen becomes its own JS chunk, loaded on first navigation
const Dashboard = lazy(() => import('./Dashboard'));
const Settings  = lazy(() => import('./Settings'));

{ path: 'dashboard', element: (
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
) }

// data-router shorthand — splits the route module entirely
{ path: 'settings',
  lazy: () => import('./settings').then(m => ({ Component: m.Settings })) }`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* ========================================================================== */
/*                                                                            */
/*  THE LIVE MINI-APP                                                         */
/*  A tiny in-memory "router" simulated with React state. React Router        */
/*  forbids nesting a <RouterProvider> inside the app's existing one          */
/*  ("You cannot render a <Router> inside another <Router>"), so to demo the   */
/*  concepts LIVE on this page we reproduce a router's behaviour — a URL      */
/*  string, a history stack, parsed path params & query — in plain state. The */
/*  real API (the code blocks above) is what you'd ship; this just lets you    */
/*  click through it without leaving the screen.                              */
/*                                                                            */
/* ========================================================================== */

const MINI_USERS = [
    { id: '7', name: 'Ada' },
    { id: '42', name: 'Alan' },
    { id: '99', name: 'Grace' },
];

const HANDLE_TITLES: Record<string, string> = {
    home: 'Mini app — home',
    users: 'Mini app — users',
    userDetail: 'Mini app — user detail',
    search: 'Mini app — search',
    dashboard: 'Mini app — dashboard (protected)',
    login: 'Mini app — sign in',
    notFound: 'Mini app — not found',
};

/** MiniApp — the simulated router. Owns the URL history stack + renders the
 *  matched screen inside a shared MiniLayout shell. */
function MiniApp({ initialEntries }: { initialEntries: string[] }) {
    const { loc, screen, id, redirectedFrom, navigate, back, canGoBack } =
        useMiniRouter(initialEntries);

    const body = renderScreen(screen, {
        id,
        search: loc.search,
        navigate,
    });

    return (
        <div className="rounded-md border border-outline bg-surface-tint p-md">
            <MiniLayout
                loc={loc}
                screen={screen}
                canGoBack={canGoBack}
                onBack={back}
                onNavigate={navigate}
                redirectedFrom={redirectedFrom}
            >
                {body}
            </MiniLayout>
        </div>
    );
}

/** Context handed to each simulated screen — stands in for the router hooks. */
interface ScreenCtx {
    id?: string;
    search: URLSearchParams;
    navigate: (to: string, opts?: NavOpts) => void;
}

function renderScreen(screen: string, ctx: ScreenCtx) {
    switch (screen) {
        case 'home':
            return (
                <MiniCard data-testid="mini-home">
                    <span className="font-semibold">Home</span> — try the links
                    above.
                    <ul className="mt-xs flex flex-col gap-xs text-on-surface-variant">
                        <li>
                            <MiniLink onClick={() => ctx.navigate('/users')}>
                                /users
                            </MiniLink>{' '}
                            — list with params
                        </li>
                        <li>
                            <MiniLink onClick={() => ctx.navigate('/search')}>
                                /search
                            </MiniLink>{' '}
                            — query string
                        </li>
                        <li>
                            <MiniLink onClick={() => ctx.navigate('/dashboard')}>
                                /dashboard
                            </MiniLink>{' '}
                            — protected
                        </li>
                    </ul>
                </MiniCard>
            );
        case 'users':
            return (
                <MiniCard>
                    <span className="font-semibold">Users</span> — pick one:
                    <ul className="mt-xs flex flex-col gap-xs">
                        {MINI_USERS.map((u) => (
                            <li key={u.id}>
                                <MiniLink
                                    data-testid={`user-${u.id}`}
                                    onClick={() => ctx.navigate(`/users/${u.id}`)}
                                >
                                    {u.name} (#{u.id})
                                </MiniLink>
                            </li>
                        ))}
                    </ul>
                </MiniCard>
            );
        case 'userDetail': {
            const user = MINI_USERS.find((u) => u.id === ctx.id);
            return (
                <MiniCard data-testid="user-detail">
                    <span className="font-semibold">User detail</span>
                    <p className="mt-xs font-mono text-caption text-on-surface-variant">
                        useParams() → &#123; id: "{ctx.id}" &#125;
                    </p>
                    <p className="text-on-surface">
                        {user
                            ? `Hello, ${user.name}.`
                            : `No user with id ${ctx.id}.`}
                    </p>
                    <MiniLink onClick={() => ctx.navigate('/users')}>
                        ← back to list
                    </MiniLink>
                </MiniCard>
            );
        }
        case 'search': {
            const q = ctx.search.get('q') ?? '';
            const matched = MINI_USERS.filter((u) =>
                u.name.toLowerCase().includes(q.toLowerCase()),
            );
            return (
                <MiniCard data-testid="search-screen">
                    <span className="font-semibold">Search</span>
                    <input
                        value={q}
                        placeholder="filter by name…"
                        onChange={(e) => {
                            const v = e.target.value;
                            ctx.navigate(
                                v ? `/search?q=${encodeURIComponent(v)}` : '/search',
                                { replace: true },
                            );
                        }}
                        className="mt-xs w-full rounded-sm border border-outline bg-surface px-sm py-xs text-body-sm text-on-surface outline-none focus:border-primary"
                    />
                    <p className="mt-xs font-mono text-caption text-on-surface-variant">
                        ?q={q || ' '} → {matched.length} match
                        {matched.length === 1 ? '' : 'es'}
                    </p>
                </MiniCard>
            );
        }
        case 'dashboard':
            return (
                <MiniCard data-testid="dashboard">
                    <span className="font-semibold">Dashboard</span> — you are
                    signed in.
                    <button
                        type="button"
                        onClick={() => {
                            setAuthed(false);
                            ctx.navigate('/login');
                        }}
                        className="mt-xs rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                    >
                        Sign out
                    </button>
                </MiniCard>
            );
        case 'login':
            return (
                <MiniCard data-testid="login">
                    <span className="font-semibold">Sign in</span> to reach{' '}
                    <code className="font-mono">/dashboard</code>.
                    <button
                        type="button"
                        onClick={() => {
                            setAuthed(true);
                            ctx.navigate('/dashboard', { replace: true });
                        }}
                        className="mt-xs rounded-md px-md py-xs text-body-sm text-on-primary shadow-button-card hover:shadow-button-card-hover"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                        data-testid="sign-in"
                    >
                        Sign in
                    </button>
                </MiniCard>
            );
        default:
            return (
                <MiniCard data-testid="not-found">
                    <span className="font-semibold">404</span> — no route matched
                    this path.
                    <MiniLink onClick={() => ctx.navigate('/')}>
                        ← go home
                    </MiniLink>
                </MiniCard>
            );
    }
}

/** MiniLayout — the shared shell: address bar, NavLink-style nav, handle readout,
 *  the matched screen, and a back button (useNavigate(-1)). */
function MiniLayout({
    loc,
    screen,
    canGoBack,
    onBack,
    onNavigate,
    redirectedFrom,
    children,
}: {
    loc: MiniLocation;
    screen: string;
    canGoBack: boolean;
    onBack: () => void;
    onNavigate: (to: string) => void;
    redirectedFrom: string | null;
    children: React.ReactNode;
}) {
    const query = loc.search.toString();
    const searchStr = query ? `?${query}` : '';

    const navItem = (to: string, label: string, exact = false) => {
        const active = exact
            ? loc.pathname === to
            : loc.pathname === to || loc.pathname.startsWith(to + '/');
        return (
            <button
                type="button"
                onClick={() => onNavigate(to)}
                data-to={to}
                className={[
                    'rounded-sm px-sm py-xs text-body-sm',
                    active
                        ? 'bg-surface text-on-surface shadow-button-card'
                        : 'text-on-surface-variant hover:bg-surface',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center justify-between gap-sm rounded-md border border-outline bg-surface px-md py-xs">
                <span className="font-mono text-caption text-on-surface-variant">
                    url: <span className="text-primary">{loc.pathname}</span>
                    {searchStr}
                </span>
                <nav className="flex flex-wrap gap-xs">
                    {navItem('/', 'home', true)}
                    {navItem('/users', 'users')}
                    {navItem('/search', 'search')}
                    {navItem('/dashboard', 'dashboard')}
                </nav>
            </div>

            <p className="font-mono text-caption text-on-surface-variant">
                handle.title → "<span className="text-primary">
                    {HANDLE_TITLES[screen]}
                </span>
                "
            </p>

            {redirectedFrom && (
                <p className="font-mono text-caption text-primary">
                    ↳ guard redirected {redirectedFrom} → /login
                </p>
            )}

            {children}

            <div className="flex gap-sm">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={!canGoBack}
                    className="rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant disabled:opacity-40"
                >
                    ← back (useNavigate)
                </button>
            </div>
        </div>
    );
}

/* --- small visual primitives local to this view --- */

function MiniCard({
    children,
    ...rest
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
    // NOTE: a <div>, not a <p> — children often include <ul> or nested <p>,
    // which are invalid inside a <p> and would trigger hydration warnings.
    return (
        <div
            className="flex flex-col gap-xs rounded-md border border-outline bg-surface p-md text-body-sm text-on-surface"
            {...rest}
        >
            <div className="flex flex-col gap-xs text-on-surface">
                {children}
            </div>
        </div>
    );
}

function MiniLink({
    children,
    onClick,
    ...rest
}: {
    children: React.ReactNode;
    onClick: () => void;
} & React.HTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-primary hover:underline"
            {...rest}
        >
            {children}
        </button>
    );
}
