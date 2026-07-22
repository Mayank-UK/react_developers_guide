import {
    createBrowserRouter,
    createMemoryRouter,
    Navigate,
    type RouteObject,
} from 'react-router';
import { RoutePaths } from './routes';
import { RootLayout } from '../components/root-layout';
import HomeView from '../views/home/home';
import ReactFundamentalsView from '../views/react_fundamentals/react-fundamentals';
import TsJsFundamentalsView from '../views/ts_js_fundamentals/ts-js-fundamentals';
import LayoutStructureView from '../views/ui_hub/sub_views/layout_structure/layout-structure';
import CssView from '../views/ui_hub/sub_views/css/css';
import BootstrapView from '../views/ui_hub/sub_views/bootstrap/bootstrap';
import TailwindView from '../views/ui_hub/sub_views/tailwind/tailwind';
import InteractiveView from '../views/ui_hub/sub_views/interactive/interactive';
import UiHubView from '../views/ui_hub/ui-hub';
import { PlaceholderView } from '../views/placeholder/_placeholder';

/**
 * Route table as data — mirrors the Flutter `router.dart` GoRouter config.
 *
 * Note (React vs Flutter): Flutter uses `go_router`; React Router v7's idiomatic
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
        element: <PlaceholderView phase="M2" />,
        handle: { title: 'Responsive layout' },
    },
    {
        path: RoutePaths.designSystem,
        element: <PlaceholderView phase="M2" />,
        handle: { title: 'Design system' },
    },
    {
        path: RoutePaths.lifecycle,
        element: <PlaceholderView phase="M2" />,
        handle: { title: 'Lifecycle' },
    },
    {
        path: RoutePaths.navigation,
        element: <PlaceholderView phase="M2" />,
        handle: { title: 'Navigation and routing' },
    },

    // Data & state (M3)
    {
        path: RoutePaths.stateManagement,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'State management' },
    },
    {
        path: RoutePaths.hooks,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'State management — Hooks' },
    },
    {
        path: RoutePaths.redux,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'State management — Redux' },
    },
    {
        path: RoutePaths.zustand,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'State management — Zustand' },
    },
    {
        path: RoutePaths.tanstackQuery,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'State management — TanStack Query' },
    },
    {
        path: RoutePaths.apiHandling,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'API handling' },
    },
    {
        path: RoutePaths.databaseHandling,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'Database handling' },
    },
    {
        path: RoutePaths.exceptionHandling,
        element: <PlaceholderView phase="M3" />,
        handle: { title: 'Exception handling' },
    },

    // Engineering (M4)
    {
        path: RoutePaths.dependencyManagement,
        element: <PlaceholderView phase="M4" />,
        handle: { title: 'Dependency management' },
    },
    {
        path: RoutePaths.architecture,
        element: <PlaceholderView phase="M4" />,
        handle: { title: 'Architecture' },
    },
    {
        path: RoutePaths.testing,
        element: <PlaceholderView phase="M4" />,
        handle: { title: 'Testing' },
    },
    {
        path: RoutePaths.debugging,
        element: <PlaceholderView phase="M4" />,
        handle: { title: 'Debugging' },
    },
    {
        path: RoutePaths.environments,
        element: <PlaceholderView phase="M4" />,
        handle: { title: 'Environments / Flavours' },
    },
    {
        path: RoutePaths.bestPractices,
        element: <PlaceholderView phase="M4" />,
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
