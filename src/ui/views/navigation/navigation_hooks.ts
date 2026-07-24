import { useEffect, useState } from 'react';

/**
 * Navigation screen custom hooks — own the simulated mini-router's state + logic
 * so MiniApp (the view) is a pure render. This is a state-driven router
 * simulation (history stack + parsed params/search + an auth guard) because
 * React Router forbids nesting a real <RouterProvider> inside the app router.
 *
 * Kept free of any JSX / view imports so the view can depend on it without a
 * cycle: parseLocation/matchRoute are pure, and useAuth subscribes to a tiny
 * module-scoped auth store shared across mini-app instances.
 */

export type NavOpts = { replace?: boolean };

/** Parsed out of the simulated URL string, mirroring what the real hooks give. */
export interface MiniLocation {
    pathname: string;
    search: URLSearchParams;
    raw: string;
}

export function parseLocation(path: string): MiniLocation {
    const [pathname = '', query = ''] = path.split('?');
    return { pathname, search: new URLSearchParams(query), raw: path };
}

/** Match a pathname against the mini route table → which screen + its params. */
export function matchRoute(pathname: string): { screen: string; id?: string } {
    if (pathname === '/' || pathname === '') return { screen: 'home' };
    if (pathname === '/users') return { screen: 'users' };
    const m = pathname.match(/^\/users\/([^/]+)$/);
    if (m) return { screen: 'userDetail', id: decodeURIComponent(m[1] ?? '') };
    if (pathname === '/search') return { screen: 'search' };
    if (pathname === '/dashboard') return { screen: 'dashboard' };
    if (pathname === '/login') return { screen: 'login' };
    return { screen: 'notFound' };
}

/* A tiny module-scoped auth store shared across mini-app instances, so the
 * guards demo behaves like a real session (sign in once, stay signed in). */
let authed = false;
const authListeners = new Set<() => void>();
export function setAuthed(v: boolean) {
    authed = v;
    authListeners.forEach((fn) => fn());
}
export function useAuth() {
    const [, force] = useState(0);
    useEffect(() => {
        const fn = () => force((n) => n + 1);
        authListeners.add(fn);
        return () => {
            authListeners.delete(fn);
        };
    }, []);
    return authed;
}

export interface MiniRouter {
    loc: MiniLocation;
    /** Guarded screen (e.g. dashboard → login when not authed). */
    screen: string;
    id?: string;
    redirectedFrom: string | null;
    navigate: (to: string, opts?: NavOpts) => void;
    back: () => void;
    canGoBack: boolean;
}

/** Owns the URL history stack + the matched/guarded screen for one mini-app. */
export function useMiniRouter(initialEntries: string[]): MiniRouter {
    const [stack, setStack] = useState<string[]>(() => [...initialEntries]);
    const [idx, setIdx] = useState(0);
    const authedNow = useAuth();

    const navigate = (to: string, opts?: NavOpts) => {
        if (opts?.replace) {
            setStack((s) => s.map((p, i) => (i === idx ? to : p)));
        } else {
            setStack((s) => [...s.slice(0, idx + 1), to]);
            setIdx((i) => i + 1);
        }
    };
    const back = () => setIdx((i) => Math.max(0, i - 1));

    const loc = parseLocation(stack[idx] ?? '');
    const matched = matchRoute(loc.pathname);
    const id = matched.id;
    let screen = matched.screen;

    // Guard: /dashboard requires auth — mirror <RequireAuth><Navigate/></RequireAuth>
    let redirectedFrom: string | null = null;
    if (screen === 'dashboard' && !authedNow) {
        redirectedFrom = '/dashboard';
        screen = 'login';
    }

    return { loc, screen, id, redirectedFrom, navigate, back, canGoBack: idx > 0 };
}
