import { lazy } from 'react';
import {
    createBrowserRouter,
    createMemoryRouter,
    Navigate,
    type RouteObject,
} from 'react-router';
import { RoutePaths } from './routes';
import {
    importAboutView,
    importApiHandlingView,
    importArchitectureView,
    importBestPracticesView,
    importBootstrapView,
    importCssView,
    importDatabaseHandlingView,
    importDebuggingView,
    importDependencyManagementView,
    importDesignSystemView,
    importEnvironmentsView,
    importExceptionHandlingView,
    importHomeView,
    importHooksView,
    importInteractiveView,
    importLayoutStructureView,
    importLifecycleView,
    importNavigationView,
    importReactFundamentalsView,
    importReduxView,
    importResponsiveView,
    importStateManagementView,
    importTailwindView,
    importTanstackQueryView,
    importTestingView,
    importTsJsFundamentalsView,
    importUiHubView,
    importZustandView,
    type ChunkImport,
} from './route-chunks';
import { RootLayout } from '../components/root-layout';

/**
 * Each screen is lazy-loaded so the initial bundle ships only the shell + the
 * landing view; the rest are fetched on demand as separate chunks. The shared
 * <Suspense> boundary lives in <RootLayout/> around the <Outlet/>. Every
 * dynamic import lives in route-chunks.ts so the route table, its router-level
 * `lazy` companions, and the hover/focus prefetcher share one thunk per chunk.
 */
const HomeView = lazy(importHomeView);
const AboutView = lazy(importAboutView);
const ReactFundamentalsView = lazy(importReactFundamentalsView);
const TsJsFundamentalsView = lazy(importTsJsFundamentalsView);
const LayoutStructureView = lazy(importLayoutStructureView);
const CssView = lazy(importCssView);
const BootstrapView = lazy(importBootstrapView);
const TailwindView = lazy(importTailwindView);
const InteractiveView = lazy(importInteractiveView);
const ResponsiveView = lazy(importResponsiveView);
const DesignSystemView = lazy(importDesignSystemView);
const LifecycleView = lazy(importLifecycleView);
const NavigationView = lazy(importNavigationView);
const StateManagementView = lazy(importStateManagementView);
const HooksView = lazy(importHooksView);
const ReduxView = lazy(importReduxView);
const ZustandView = lazy(importZustandView);
const TanstackQueryView = lazy(importTanstackQueryView);
const ApiHandlingView = lazy(importApiHandlingView);
const DatabaseHandlingView = lazy(importDatabaseHandlingView);
const ExceptionHandlingView = lazy(importExceptionHandlingView);
const DependencyManagementView = lazy(importDependencyManagementView);
const ArchitectureView = lazy(importArchitectureView);
const TestingView = lazy(importTestingView);
const DebuggingView = lazy(importDebuggingView);
const EnvironmentsView = lazy(importEnvironmentsView);
const BestPracticesView = lazy(importBestPracticesView);
const UiHubView = lazy(importUiHubView);

/**
 * Router-level `lazy` companion for a React.lazy route element, built from the
 * same chunk thunk. The router awaits the chunk while navigating, which keeps
 * `useNavigation().state === 'loading'` true for the whole fetch — the top
 * progress bar in <RootLayout/> appears immediately — and delays committing
 * the new location until the chunk arrives, so the old view stays on screen
 * with feedback instead of freezing after an instant URL change. It returns no
 * route properties: the React.lazy element remains the render path and the
 * shared <Suspense> still covers initial loads (the hydration navigation does
 * not surface a loading state). After the first resolution the router clears
 * `lazy`, so repeat visits commit instantly with no bar.
 */
function routeChunk(importChunk: ChunkImport): NonNullable<RouteObject['lazy']> {
    return () => importChunk().then(() => ({}));
}

/**
 * Route table as data — mirrors the Flutter `router.dart` GoRouter config.
 *
 * Note (React vs Flutter): Flutter uses `go_router`; React Router v8's idiomatic
 * API is the data router (`createBrowserRouter` + `<RouterProvider>`). A single
 * parent route renders the shared `RootLayout` (header + theme toggle) and every
 * screen renders into its `<Outlet/>`, so app chrome lives in one place instead
 * of being repeated per screen. Each route sets a `handle.title` that the layout
 * surfaces via `useMatches()`.
 *
 * Routes for screens arriving in later milestones point at <PlaceholderView/>.
 */
const layoutChildren: RouteObject[] = [
    {
        path: RoutePaths.home,
        element: <HomeView />,
        lazy: routeChunk(importHomeView),
        handle: { title: "React developer's guide" },
    },
    {
        path: RoutePaths.about,
        element: <AboutView />,
        lazy: routeChunk(importAboutView),
        handle: { title: 'About' },
    },

    // Fundamentals & UI (M2)
    {
        path: RoutePaths.reactFundamentals,
        element: <ReactFundamentalsView />,
        lazy: routeChunk(importReactFundamentalsView),
        handle: { title: 'React fundamentals' },
    },
    {
        path: RoutePaths.tsJsFundamentals,
        element: <TsJsFundamentalsView />,
        lazy: routeChunk(importTsJsFundamentalsView),
        handle: { title: 'TypeScript / JavaScript fundamentals' },
    },
    {
        path: RoutePaths.ui,
        element: <UiHubView />,
        lazy: routeChunk(importUiHubView),
        handle: { title: 'UI' },
    },
    {
        path: RoutePaths.layoutStructure,
        element: <LayoutStructureView />,
        lazy: routeChunk(importLayoutStructureView),
        handle: { title: 'Layout and structure' },
    },
    {
        path: RoutePaths.css,
        element: <CssView />,
        lazy: routeChunk(importCssView),
        handle: { title: 'CSS' },
    },
    {
        path: RoutePaths.bootstrap,
        element: <BootstrapView />,
        lazy: routeChunk(importBootstrapView),
        handle: { title: 'Bootstrap' },
    },
    {
        path: RoutePaths.tailwind,
        element: <TailwindView />,
        lazy: routeChunk(importTailwindView),
        handle: { title: 'Tailwind' },
    },
    {
        path: RoutePaths.interactive,
        element: <InteractiveView />,
        lazy: routeChunk(importInteractiveView),
        handle: { title: 'Interactive behaviours' },
    },
    {
        path: RoutePaths.responsive,
        element: <ResponsiveView />,
        lazy: routeChunk(importResponsiveView),
        handle: { title: 'Responsive layout' },
    },
    {
        path: RoutePaths.designSystem,
        element: <DesignSystemView />,
        lazy: routeChunk(importDesignSystemView),
        handle: { title: 'Design system' },
    },
    {
        path: RoutePaths.lifecycle,
        element: <LifecycleView />,
        lazy: routeChunk(importLifecycleView),
        handle: { title: 'Lifecycle' },
    },
    {
        path: RoutePaths.navigation,
        element: <NavigationView />,
        lazy: routeChunk(importNavigationView),
        handle: { title: 'Navigation and routing' },
    },

    // Data & state (M3)
    {
        path: RoutePaths.stateManagement,
        element: <StateManagementView />,
        lazy: routeChunk(importStateManagementView),
        handle: { title: 'State management' },
    },
    {
        path: RoutePaths.hooks,
        element: <HooksView />,
        lazy: routeChunk(importHooksView),
        handle: { title: 'State management — Hooks' },
    },
    {
        path: RoutePaths.redux,
        element: <ReduxView />,
        lazy: routeChunk(importReduxView),
        handle: { title: 'State management — Redux' },
    },
    {
        path: RoutePaths.zustand,
        element: <ZustandView />,
        lazy: routeChunk(importZustandView),
        handle: { title: 'State management — Zustand' },
    },
    {
        path: RoutePaths.tanstackQuery,
        element: <TanstackQueryView />,
        lazy: routeChunk(importTanstackQueryView),
        handle: { title: 'State management — TanStack Query' },
    },
    {
        path: RoutePaths.apiHandling,
        element: <ApiHandlingView />,
        lazy: routeChunk(importApiHandlingView),
        handle: { title: 'API handling' },
    },
    {
        path: RoutePaths.databaseHandling,
        element: <DatabaseHandlingView />,
        lazy: routeChunk(importDatabaseHandlingView),
        handle: { title: 'Database handling' },
    },
    {
        path: RoutePaths.exceptionHandling,
        element: <ExceptionHandlingView />,
        lazy: routeChunk(importExceptionHandlingView),
        handle: { title: 'Exception handling' },
    },

    // Engineering (M4)
    {
        path: RoutePaths.dependencyManagement,
        element: <DependencyManagementView />,
        lazy: routeChunk(importDependencyManagementView),
        handle: { title: 'Dependency management' },
    },
    {
        path: RoutePaths.architecture,
        element: <ArchitectureView />,
        lazy: routeChunk(importArchitectureView),
        handle: { title: 'Architecture' },
    },
    {
        path: RoutePaths.testing,
        element: <TestingView />,
        lazy: routeChunk(importTestingView),
        handle: { title: 'Testing' },
    },
    {
        path: RoutePaths.debugging,
        element: <DebuggingView />,
        lazy: routeChunk(importDebuggingView),
        handle: { title: 'Debugging' },
    },
    {
        path: RoutePaths.environments,
        element: <EnvironmentsView />,
        lazy: routeChunk(importEnvironmentsView),
        handle: { title: 'Environments / Flavours' },
    },
    {
        path: RoutePaths.bestPractices,
        element: <BestPracticesView />,
        lazy: routeChunk(importBestPracticesView),
        handle: { title: 'Best practices' },
    },
];

export const routes: RouteObject[] = [
    { element: <RootLayout />, children: layoutChildren },
    {
        path: RoutePaths.pageNotFound,
        element: <Navigate to={RoutePaths.home} replace />,
    },
];

/** Browser router for the running app. */
export const router = createBrowserRouter(routes);

/** In-memory router for tests / non-DOM rendering. */
export function createAppRouter(initialEntries: string[] = ['/']) {
    return createMemoryRouter(routes, { initialEntries });
}
