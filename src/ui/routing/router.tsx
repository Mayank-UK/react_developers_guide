import { lazy } from 'react';
import {
    createBrowserRouter,
    createMemoryRouter,
    Navigate,
    type RouteObject,
} from 'react-router';
import { RoutePaths } from './routes';
import { RootLayout } from '../components/root-layout';

/**
 * Each screen is lazy-loaded so the initial bundle ships only the shell + the
 * landing view; the rest are fetched on demand as separate chunks. The shared
 * <Suspense> boundary lives in <RootLayout/> around the <Outlet/>.
 */
const HomeView = lazy(() => import('../views/home/home_view'));
const AboutView = lazy(() => import('../views/about/about_view'));
const ReactFundamentalsView = lazy(() => import('../views/react_fundamentals/react_fundamentals_view'));
const TsJsFundamentalsView = lazy(() => import('../views/ts_js_fundamentals/ts_js_fundamentals_view'));
const LayoutStructureView = lazy(() => import('../views/ui_hub/sub_views/layout_structure/layout_structure_view'));
const CssView = lazy(() => import('../views/ui_hub/sub_views/css/css_view'));
const BootstrapView = lazy(() => import('../views/ui_hub/sub_views/bootstrap/bootstrap_view'));
const TailwindView = lazy(() => import('../views/ui_hub/sub_views/tailwind/tailwind_view'));
const InteractiveView = lazy(() => import('../views/ui_hub/sub_views/interactive/interactive_view'));
const ResponsiveView = lazy(() => import('../views/ui_hub/sub_views/responsive/responsive_view'));
const DesignSystemView = lazy(() => import('../views/ui_hub/sub_views/design_system/design_system_view'));
const LifecycleView = lazy(() => import('../views/lifecycle/lifecycle_view'));
const NavigationView = lazy(() => import('../views/navigation/navigation_view'));
const StateManagementView = lazy(() => import('../views/state_management/state_management_view'));
const HooksView = lazy(() => import('../views/state_management/hooks/hooks_view'));
const ReduxView = lazy(() => import('../views/state_management/redux/redux_view'));
const ZustandView = lazy(() => import('../views/state_management/zustand/zustand_view'));
const TanstackQueryView = lazy(() => import('../views/state_management/tanstack_query/tanstack_query_view'));
const ApiHandlingView = lazy(() => import('../views/api_handling/api_handling_view'));
const DatabaseHandlingView = lazy(() => import('../views/database_handling/database_handling_view'));
const ExceptionHandlingView = lazy(() => import('../views/exception_handling/exception_handling_view'));
const DependencyManagementView = lazy(() => import('../views/dependency_management/dependency_management_view'));
const ArchitectureView = lazy(() => import('../views/architecture/architecture_view'));
const TestingView = lazy(() => import('../views/testing/testing_view'));
const DebuggingView = lazy(() => import('../views/debugging/debugging_view'));
const EnvironmentsView = lazy(() => import('../views/environments/environments_view'));
const BestPracticesView = lazy(() => import('../views/best_practices/best_practices_view'));
const UiHubView = lazy(() => import('../views/ui_hub/ui_hub_view'));

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
        handle: { title: "React developer's guide" },
    },
    {
        path: RoutePaths.about,
        element: <AboutView />,
        handle: { title: 'About' },
    },

    // Fundamentals & UI (M2)
    {
        path: RoutePaths.reactFundamentals,
        element: <ReactFundamentalsView />,
        handle: { title: 'React fundamentals' },
    },
    {
        path: RoutePaths.tsJsFundamentals,
        element: <TsJsFundamentalsView />,
        handle: { title: 'TypeScript / JavaScript fundamentals' },
    },
    { path: RoutePaths.ui, element: <UiHubView />, handle: { title: 'UI' } },
    {
        path: RoutePaths.layoutStructure,
        element: <LayoutStructureView />,
        handle: { title: 'Layout and structure' },
    },
    { path: RoutePaths.css, element: <CssView />, handle: { title: 'CSS' } },
    {
        path: RoutePaths.bootstrap,
        element: <BootstrapView />,
        handle: { title: 'Bootstrap' },
    },
    {
        path: RoutePaths.tailwind,
        element: <TailwindView />,
        handle: { title: 'Tailwind' },
    },
    {
        path: RoutePaths.interactive,
        element: <InteractiveView />,
        handle: { title: 'Interactive behaviours' },
    },
    {
        path: RoutePaths.responsive,
        element: <ResponsiveView />,
        handle: { title: 'Responsive layout' },
    },
    {
        path: RoutePaths.designSystem,
        element: <DesignSystemView />,
        handle: { title: 'Design system' },
    },
    {
        path: RoutePaths.lifecycle,
        element: <LifecycleView />,
        handle: { title: 'Lifecycle' },
    },
    {
        path: RoutePaths.navigation,
        element: <NavigationView />,
        handle: { title: 'Navigation and routing' },
    },

    // Data & state (M3)
    {
        path: RoutePaths.stateManagement,
        element: <StateManagementView />,
        handle: { title: 'State management' },
    },
    {
        path: RoutePaths.hooks,
        element: <HooksView />,
        handle: { title: 'State management — Hooks' },
    },
    {
        path: RoutePaths.redux,
        element: <ReduxView />,
        handle: { title: 'State management — Redux' },
    },
    {
        path: RoutePaths.zustand,
        element: <ZustandView />,
        handle: { title: 'State management — Zustand' },
    },
    {
        path: RoutePaths.tanstackQuery,
        element: <TanstackQueryView />,
        handle: { title: 'State management — TanStack Query' },
    },
    {
        path: RoutePaths.apiHandling,
        element: <ApiHandlingView />,
        handle: { title: 'API handling' },
    },
    {
        path: RoutePaths.databaseHandling,
        element: <DatabaseHandlingView />,
        handle: { title: 'Database handling' },
    },
    {
        path: RoutePaths.exceptionHandling,
        element: <ExceptionHandlingView />,
        handle: { title: 'Exception handling' },
    },

    // Engineering (M4)
    {
        path: RoutePaths.dependencyManagement,
        element: <DependencyManagementView />,
        handle: { title: 'Dependency management' },
    },
    {
        path: RoutePaths.architecture,
        element: <ArchitectureView />,
        handle: { title: 'Architecture' },
    },
    {
        path: RoutePaths.testing,
        element: <TestingView />,
        handle: { title: 'Testing' },
    },
    {
        path: RoutePaths.debugging,
        element: <DebuggingView />,
        handle: { title: 'Debugging' },
    },
    {
        path: RoutePaths.environments,
        element: <EnvironmentsView />,
        handle: { title: 'Environments / Flavours' },
    },
    {
        path: RoutePaths.bestPractices,
        element: <BestPracticesView />,
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
