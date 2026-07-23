import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

/**
 * Smoke test: the whole provider + data router + shared layout + home tree
 * mounts without throwing and renders the navigation hub. Guards against
 * white-screen runtime errors that type-checking can't catch (broken context
 * wiring, container init, layout/outlet wiring, router config, etc.).
 */
describe('App / Home', () => {
    it('renders the shared layout title and the navigation grid', async () => {
        const router = createAppRouter(['/']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        // The data router resolves the initial route asynchronously, and the
        // view itself is lazy-loaded (Suspense), so wait for its content.
        await waitFor(() => {
            expect(
                screen.getAllByText("React developer's guide").length,
            ).toBeGreaterThanOrEqual(1);
        });
        // Representative nav cards are present once the home chunk loads.
        await waitFor(() =>
            expect(screen.getByText('React fundamentals')).toBeInTheDocument(),
        );
        expect(screen.getByText('API handling')).toBeInTheDocument();
    });
});
