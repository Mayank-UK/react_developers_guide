import { RoutePaths } from './routes';

/**
 * route-chunks.ts — the single home of every route's dynamic import.
 *
 * Each lazy screen's chunk is imported through ONE named thunk, referenced
 * from two places:
 *
 * 1. `router.tsx` builds both the React.lazy route element and its router-level
 *    `lazy` companion from the same thunk. The router awaits the chunk while
 *    navigating (`useNavigation().state === 'loading'`, which drives the top
 *    progress bar in RootLayout) and delays committing the new location until
 *    it arrives — the old view stays on screen with feedback instead of
 *    freezing after an instant URL change.
 * 2. The delegated hover/focus prefetch listener in RootLayout resolves a
 *    link's pathname against the section map below and fires the section's
 *    chunks before the click, so by click time the chunk is in flight or
 *    cached.
 *
 * A thunk is started at most once per session here (`started`); the module
 * system additionally caches the underlying import promise, so the router's
 * own `lazy` await re-uses the same in-flight chunk.
 */

/**
 * A view chunk's dynamic import. Left inferred on each thunk below (so
 * React.lazy sees the module's exact default-export type); this alias only
 * widens it for the section registry and the prefetch entry points.
 */
export type ChunkImport = () => Promise<unknown>;

export const importHomeView = () => import('../views/home/home_view');
export const importAboutView = () => import('../views/about/about_view');
export const importReactFundamentalsView = () =>
    import('../views/react_fundamentals/react_fundamentals_view');
export const importTsJsFundamentalsView = () =>
    import('../views/ts_js_fundamentals/ts_js_fundamentals_view');
export const importUiHubView = () => import('../views/ui_hub/ui_hub_view');
export const importLayoutStructureView = () =>
    import('../views/ui_hub/sub_views/layout_structure/layout_structure_view');
export const importCssView = () => import('../views/ui_hub/sub_views/css/css_view');
export const importBootstrapView = () =>
    import('../views/ui_hub/sub_views/bootstrap/bootstrap_view');
export const importTailwindView = () =>
    import('../views/ui_hub/sub_views/tailwind/tailwind_view');
export const importInteractiveView = () =>
    import('../views/ui_hub/sub_views/interactive/interactive_view');
export const importResponsiveView = () =>
    import('../views/ui_hub/sub_views/responsive/responsive_view');
export const importDesignSystemView = () =>
    import('../views/ui_hub/sub_views/design_system/design_system_view');
export const importLifecycleView = () => import('../views/lifecycle/lifecycle_view');
export const importNavigationView = () =>
    import('../views/navigation/navigation_view');
export const importStateManagementView = () =>
    import('../views/state_management/state_management_view');
export const importHooksView = () =>
    import('../views/state_management/hooks/hooks_view');
export const importReduxView = () =>
    import('../views/state_management/redux/redux_view');
export const importZustandView = () =>
    import('../views/state_management/zustand/zustand_view');
export const importTanstackQueryView = () =>
    import('../views/state_management/tanstack_query/tanstack_query_view');
export const importApiHandlingView = () =>
    import('../views/api_handling/api_handling_view');
export const importDatabaseHandlingView = () =>
    import('../views/database_handling/database_handling_view');
export const importExceptionHandlingView = () =>
    import('../views/exception_handling/exception_handling_view');
export const importDependencyManagementView = () =>
    import('../views/dependency_management/dependency_management_view');
export const importArchitectureView = () =>
    import('../views/architecture/architecture_view');
export const importTestingView = () => import('../views/testing/testing_view');
export const importDebuggingView = () => import('../views/debugging/debugging_view');
export const importEnvironmentsView = () =>
    import('../views/environments/environments_view');
export const importBestPracticesView = () =>
    import('../views/best_practices/best_practices_view');

/**
 * Chunks to warm per route. Every route in this app is a self-contained
 * screen with its own chunk (no shared content-registry chunk like the
 * sibling software guide), so each entry is exactly the one chunk its link
 * needs — section grouping would eagerly fetch siblings the user never
 * asked for. Keys are the RoutePaths constants, so the map cannot drift from
 * the route table.
 */
const SECTION_CHUNKS: Readonly<Record<string, readonly ChunkImport[]>> = {
    [RoutePaths.home]: [importHomeView],
    [RoutePaths.about]: [importAboutView],
    [RoutePaths.reactFundamentals]: [importReactFundamentalsView],
    [RoutePaths.tsJsFundamentals]: [importTsJsFundamentalsView],
    [RoutePaths.ui]: [importUiHubView],
    [RoutePaths.layoutStructure]: [importLayoutStructureView],
    [RoutePaths.css]: [importCssView],
    [RoutePaths.bootstrap]: [importBootstrapView],
    [RoutePaths.tailwind]: [importTailwindView],
    [RoutePaths.interactive]: [importInteractiveView],
    [RoutePaths.responsive]: [importResponsiveView],
    [RoutePaths.designSystem]: [importDesignSystemView],
    [RoutePaths.lifecycle]: [importLifecycleView],
    [RoutePaths.navigation]: [importNavigationView],
    [RoutePaths.stateManagement]: [importStateManagementView],
    [RoutePaths.hooks]: [importHooksView],
    [RoutePaths.redux]: [importReduxView],
    [RoutePaths.zustand]: [importZustandView],
    [RoutePaths.tanstackQuery]: [importTanstackQueryView],
    [RoutePaths.apiHandling]: [importApiHandlingView],
    [RoutePaths.databaseHandling]: [importDatabaseHandlingView],
    [RoutePaths.exceptionHandling]: [importExceptionHandlingView],
    [RoutePaths.dependencyManagement]: [importDependencyManagementView],
    [RoutePaths.architecture]: [importArchitectureView],
    [RoutePaths.testing]: [importTestingView],
    [RoutePaths.debugging]: [importDebuggingView],
    [RoutePaths.environments]: [importEnvironmentsView],
    [RoutePaths.bestPractices]: [importBestPracticesView],
};

/**
 * Longest-prefix lookup of a pathname's chunks: `/state-management/hooks/x`
 * → `/state-management/hooks` (match). Exact RoutePaths match first; deeper
 * or trailing-slash variants fall back to their nearest ancestor. Paths
 * outside the map (e.g. the not-found wildcard) resolve to none.
 */
function chunksFor(pathname: string): readonly ChunkImport[] | undefined {
    let path = pathname.replace(/\/+$/, '') || '/';
    for (;;) {
        const chunks = SECTION_CHUNKS[path];
        if (chunks) return chunks;
        if (path === '/') return undefined;
        path = path.slice(0, path.lastIndexOf('/')) || '/';
    }
}

/** Chunks already started (in flight or done) — each fires at most once. */
const started = new Set<ChunkImport>();

/**
 * Start fetching every chunk of the route `pathname` belongs to. Intended
 * for hover/focus intent on in-app links (see RootLayout). Returns the thunks
 * it newly started (empty when the route is already warm or the path maps to
 * no route chunk) so callers and specs can observe what fired.
 */
export function preloadRouteChunks(pathname: string): readonly ChunkImport[] {
    const chunks = chunksFor(pathname);
    if (!chunks) return [];
    const fresh = chunks.filter((chunk) => !started.has(chunk));
    for (const chunk of fresh) {
        started.add(chunk);
        // A failed prefetch is best-effort: forget it so a later intent can
        // retry, and never surface as an unhandled rejection (the navigation
        // itself reports real load errors through the router's `lazy` await).
        chunk().catch(() => started.delete(chunk));
    }
    return fresh;
}
