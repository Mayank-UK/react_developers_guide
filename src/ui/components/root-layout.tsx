import { Suspense, useEffect, useRef, useState } from 'react';
import {
    Link,
    Outlet,
    ScrollRestoration,
    useLocation,
    useNavigate,
    useNavigation,
} from 'react-router';
import { ThemeToggle } from './theme-toggle';
import { useRouteTitle } from '../hooks/use-route-title';
import { RoutePaths } from '../routing/routes';
import { preloadRouteChunks } from '../routing/route-chunks';
import { initAnalytics, trackEvent } from '../analytics/analytics';
import { initCrashTelemetry } from '../analytics/crash-telemetry';

/**
 * RootLayout — the single shared app shell: a header (home link + current page
 * title + about + theme toggle) and a centered, scrolling content area via
 * <Outlet/>.
 *
 * This replaces the per-screen `PageScaffold` (a Flutter `Scaffold`/`AppBar`
 * pattern). On the web the browser already provides back/forward navigation and
 * scrolling, so the chrome is declared once here and every route renders into
 * the outlet — the idiomatic React Router layout pattern.
 *
 * Header is deliberately quiet: surface background with a hairline border and a
 * single accent on the logo, so the content (not the chrome) carries the page.
 *
 * Responsive nav: on desktop (md+) the About link sits inline in the header; on
 * mobile it collapses into a hamburger that opens a slide-in drawer holding the
 * same link. There is no full nav drawer on desktop — the home grid is the nav
 * hub, and About is the only chrome-level link.
 */

export function RootLayout() {
    const title = useRouteTitle();
    const navigate = useNavigate();
    const location = useLocation();
    // Non-idle while a lazy route chunk is loading (every route carries a
    // router-level `lazy` companion — see router.tsx): drives the top progress
    // bar below. Covers link clicks, browser back/forward, and form submits.
    const navigation = useNavigation();
    useRouteChunkPreload();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    // Umami analytics beacon (see ui/analytics/analytics.ts) and the Faro
    // crash-telemetry beacon (see ui/analytics/crash-telemetry.ts): shell-level
    // so they load once per document for EVERY route. Idempotent (StrictMode's
    // dev double-mount and remounts never stack a second script) and a complete
    // no-op unless the build baked both VITE_UMAMI_* / VITE_FARO_* vars in —
    // dev, test, and CI builds without the build args never see a script tag.
    useEffect(() => {
        initAnalytics();
        initCrashTelemetry();
    }, []);

    // Analytics: one topic-open per topic view activation. The effect keys
    // on the pathname, so a deep link, a refresh, and an in-app navigation
    // each report exactly once — RootLayout mounts once per session (only
    // its pathname changes afterwards), and react-router hands it the final
    // location on mount, so there is no transient value to double-fire on.
    // Home is the guide index and About is app chrome — neither is a topic.
    // A no-op in unconfigured builds.
    useEffect(() => {
        if (
            location.pathname === RoutePaths.home ||
            location.pathname === RoutePaths.about
        ) {
            return;
        }
        trackEvent('topic-open', { topic: location.pathname });
    }, [location.pathname]);

    // Show the back arrow everywhere except home (so About, reached from the
    // header, always has a way back to where the user came from).
    const canGoBack = location.pathname !== '/';

    return (
        <div className="flex min-h-full flex-col bg-surface-tint text-on-surface">
            <RouteProgressBar active={navigation.state !== 'idle'} />

            <header className="sticky top-0 z-20 flex h-header items-center gap-md border-b border-outline bg-surface px-lg">
                {canGoBack && (
                    <button
                        type="button"
                        onClick={() => {
                            void navigate(-1);
                        }}
                        className="cursor-pointer rounded-md px-sm py-xxs hover:bg-surface-variant"
                        aria-label="Go back"
                    >
                        ←
                    </button>
                )}

                <h1 className="flex-1 truncate font-body text-body font-medium text-on-surface-variant">
                    {title}
                </h1>

                {/* Desktop: About inline. */}
                <Link
                    to={RoutePaths.about}
                    className="hidden rounded-md px-sm py-xxs font-body text-body font-medium text-on-surface-variant hover:bg-surface-variant hover:text-on-surface md:inline-block"
                >
                    About
                </Link>

                {/* Mobile: hamburger that opens the drawer. */}
                <button
                    ref={hamburgerRef}
                    type="button"
                    onClick={() => setDrawerOpen((o) => !o)}
                    aria-label="Open menu"
                    aria-expanded={drawerOpen}
                    aria-controls="app-drawer"
                    className="rounded-md px-sm py-xxs text-on-surface-variant hover:bg-surface-variant md:hidden"
                >
                    <span className="block text-lg leading-none">☰</span>
                </button>

                <ThemeToggle />
            </header>

            <main className="mx-auto w-full max-w-content flex-1 px-md py-xl">
                <Suspense
                    fallback={
                        <div
                            className="text-body-sm text-on-surface-variant"
                            role="status"
                            aria-live="polite"
                        >
                            Loading…
                        </div>
                    }
                >
                    <Outlet />
                </Suspense>
            </main>

            {/* Reset scroll position on navigation so long pages don't inherit
                the previous page's scroll offset. */}
            <ScrollRestoration />

            {drawerOpen && (
                <Drawer
                    onClose={() => setDrawerOpen(false)}
                    returnFocusRef={hamburgerRef}
                />
            )}
        </div>
    );
}

/**
 * RouteProgressBar — the thin top bar shown while a lazy route chunk is
 * loading. The element is always mounted and the `route-progress--active`
 * state class drives its CSS transitions (index.css), so it appears the frame
 * a navigation starts and hides the frame the new view commits, errors, or the
 * navigation is interrupted. aria-hidden: purely visual feedback — the shared
 * <Suspense> "Loading…" fallback remains the screen-reader signal.
 */
function RouteProgressBar({ active }: { active: boolean }) {
    return (
        <div
            aria-hidden
            className={`route-progress${active ? ' route-progress--active' : ''}`}
        />
    );
}

/**
 * Intent-based route chunk prefetch: delegated capture-phase listeners on the
 * document (mouseover ≈ delegated mouseenter, focusin for keyboard, pointerdown
 * for touch taps). When pointer or focus lands inside any in-app link, resolve
 * the link's pathname against the route-keyed chunk registry and start its
 * not-yet-fetched chunk (route-chunks.ts fires each at most once) — so by
 * click time the chunk is in flight or cached. Delegation instead of a
 * wrapper <Link> keeps every existing link site (header, drawer, home cards,
 * hub cards) untouched and covers future ones.
 */
function useRouteChunkPreload() {
    useEffect(() => {
        const onIntent = (event: Event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const anchor = target.closest('a[href]');
            if (!(anchor instanceof HTMLAnchorElement)) return;
            // Same-origin paths only — external links and mailto: have no chunk.
            if (anchor.origin !== window.location.origin) return;
            preloadRouteChunks(anchor.pathname);
        };
        document.addEventListener('mouseover', onIntent, { capture: true });
        document.addEventListener('focusin', onIntent, { capture: true });
        document.addEventListener('pointerdown', onIntent, { capture: true });
        return () => {
            document.removeEventListener('mouseover', onIntent, { capture: true });
            document.removeEventListener('focusin', onIntent, { capture: true });
            document.removeEventListener('pointerdown', onIntent, { capture: true });
        };
    }, []);
}

/** Focusable-element selector for the focus trap. */
const FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Drawer — the mobile-only slide-in panel. Holds the About link (the single
 * chrome-level nav entry). Closes on backdrop click, Escape, or a link tap.
 *
 * Accessibility: because the dialog declares `aria-modal`, it must actually
 * behave as modal — on open we move focus into the panel, constrain Tab to it,
 * and on close we restore focus to the hamburger that opened it.
 */
function Drawer({
    onClose,
    returnFocusRef,
}: {
    onClose: () => void;
    returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const panel = panelRef.current;
        // Remember what was focused (the hamburger) so we can return to it.
        const previouslyFocused =
            returnFocusRef.current ??
            (document.activeElement as HTMLElement | null);

        // Move focus into the dialog.
        const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
        focusables?.[0]?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panel) return;
            const items = Array.from(
                panel.querySelectorAll<HTMLElement>(FOCUSABLE),
            );
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (!first || !last) return;
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            // Restore focus to the trigger on close.
            previouslyFocused?.focus();
        };
    }, [onClose, returnFocusRef]);

    return (
        <div
            className="fixed inset-0 z-30 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
        >
            {/* Backdrop. */}
            <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
                tabIndex={-1}
            />

            {/* Panel — slides in from the right. */}
            <div
                ref={panelRef}
                id="app-drawer"
                className="absolute right-0 top-0 flex h-full w-64 flex-col gap-sm border-l border-outline bg-surface p-md shadow-button-card"
            >
                <div className="flex items-center justify-between px-sm py-xs">
                    <span className="text-overline font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                        Menu
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="rounded-md px-xs py-xxs text-on-surface-variant hover:bg-surface-variant"
                    >
                        ✕
                    </button>
                </div>

                <Link
                    to={RoutePaths.about}
                    onClick={onClose}
                    className="rounded-md px-sm py-sm text-body font-medium text-on-surface hover:bg-surface-variant"
                >
                    About
                </Link>
            </div>
        </div>
    );
}
