import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router';
import { ThemeProvider } from '../design-system/theme-provider';
import { createAppRouter, routes } from './router';
import { preloadRouteChunks } from './route-chunks';
import { RoutePaths } from './routes';

/**
 * Lazy-navigation loading UX specs. Every route carries a router-level `lazy`
 * companion (router.tsx), so while a route chunk loads
 * `useNavigation().state === 'loading'` — RootLayout renders the top progress
 * bar for exactly that window — and the commit is delayed until the chunk
 * arrives. To make that window observable, these specs gate ONE route's chunk
 * with a manually-resolved promise on a CLONED route table (the shared
 * `routes` export stays untouched for every other spec).
 */

/** Clone the route table with the about route's chunk behind `gate`. */
function tableWithGatedAbout(gate: Promise<void>): RouteObject[] {
    const layout = routes[0];
    if (!layout?.children) {
        throw new Error('route table has no layout children');
    }
    // Copy the children array, then swap the about route for a gated copy —
    // the shared `routes` export is never mutated.
    const children = [...layout.children];
    const aboutIndex = children.findIndex(
        (child) => child.path === RoutePaths.about,
    );
    const about = aboutIndex >= 0 ? children[aboutIndex] : undefined;
    if (!about) {
        throw new Error('about route not found in the route table');
    }
    children[aboutIndex] = {
        path: about.path,
        element: about.element,
        lazy: () => gate.then(() => ({})),
        handle: about.handle,
    };
    return [{ path: layout.path, element: layout.element, children }];
}

describe('lazy navigation loading UX', () => {
    it('shows the progress bar while a lazy route chunk loads, then hides it on commit', async () => {
        let releaseChunk = () => {};
        const gate = new Promise<void>((resolve) => {
            releaseChunk = resolve;
        });
        const router = createMemoryRouter(tableWithGatedAbout(gate), {
            initialEntries: [RoutePaths.home],
        });
        const { container } = render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        // Home is up and idle: no bar.
        await waitFor(() => screen.getByText('React fundamentals'));
        expect(container.querySelector('.route-progress--active')).toBeNull();

        // Click About: the router awaits the gated chunk, so the loading
        // state is visible immediately (the bar) while the view is unchanged.
        fireEvent.click(screen.getByRole('link', { name: 'About' }));
        await waitFor(() =>
            expect(container.querySelector('.route-progress--active')).not.toBeNull(),
        );

        // The chunk arrives → the new view commits and the bar is gone.
        releaseChunk();
        await waitFor(() => screen.getByText('What this app is'));
        expect(container.querySelector('.route-progress--active')).toBeNull();
    });

    it('prefetches the hovered link route chunk, at most once per chunk', async () => {
        const router = createAppRouter([RoutePaths.home]);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('React fundamentals'));

        // Hovering the header's About link (delegated mouseover listener)
        // starts that route's chunk — so a direct call afterwards fires
        // nothing new.
        fireEvent.mouseOver(screen.getByRole('link', { name: 'About' }));
        expect(preloadRouteChunks(RoutePaths.about)).toHaveLength(0);

        // Longest-prefix route matching + once-per-chunk: an untouched route
        // fires exactly its own chunk, and a deeper path under an already
        // warmed route fires nothing further.
        expect(preloadRouteChunks(RoutePaths.hooks)).toHaveLength(1);
        expect(
            preloadRouteChunks(`${RoutePaths.hooks}/any/deeper/path`),
        ).toHaveLength(0);
    });
});
