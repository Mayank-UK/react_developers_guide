import { Outlet, useLocation, useNavigate } from 'react-router';
import { ThemeToggle } from './theme-toggle';
import { useRouteTitle } from '../hooks/use-route-title';

/**
 * RootLayout — the single shared app shell: a header (home link + current page
 * title + theme toggle) and a centered, scrolling content area via <Outlet/>.
 *
 * This replaces the per-screen `PageScaffold` (a Flutter `Scaffold`/`AppBar`
 * pattern). On the web the browser already provides back/forward navigation and
 * scrolling, so the chrome is declared once here and every route renders into
 * the outlet — the idiomatic React Router layout pattern.
 *
 * Header is deliberately quiet: surface background with a hairline border and a
 * single accent on the logo, so the content (not the chrome) carries the page.
 */

export function RootLayout() {
    const title = useRouteTitle();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on the home page.
    const canGoBack = location.pathname !== '/';

    return (
        <div className="flex min-h-full flex-col bg-surface-tint text-on-surface">
            <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center gap-md border-b border-outline bg-surface px-lg">
                {canGoBack && (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="cursor-pointer rounded-md px-sm py-xxs hover:bg-surface-variant"
                        aria-label="Go back"
                    >
                        ←
                    </button>
                )}

                <h1 className="flex-1 truncate font-[var(--font-body)] text-[var(--text-body)] font-medium text-on-surface-variant">
                    {title}
                </h1>

                <ThemeToggle />
            </header>

            <main className="mx-auto w-full max-w-[var(--content-max-width)] flex-1 px-md py-xl">
                <Outlet />
            </main>
        </div>
    );
}
