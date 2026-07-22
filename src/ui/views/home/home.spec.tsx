import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { container } from '../../../core/container';
import { createAppConfig } from '../../../core/config';
import { createAppRouter } from '../../routing/router';

/**
 * Smoke test: the whole provider + data router + shared layout + home tree
 * mounts without throwing and renders the navigation hub. Guards against
 * white-screen runtime errors that type-checking can't catch (broken context
 * wiring, container init, layout/outlet wiring, router config, etc.).
 */
beforeAll(() => {
    // jsdom has no matchMedia; ThemeProvider guards for it, but be explicit.
    if (!window.matchMedia) {
        window.matchMedia = () =>
            ({
                matches: false,
                addEventListener() {},
                removeEventListener() {},
            }) as unknown as MediaQueryList;
    }
    container.initialize(createAppConfig());
});

describe('App / Home', () => {
    it('renders the shared layout title and the navigation grid', async () => {
        const router = createAppRouter(['/']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        // The data router resolves the initial route asynchronously.
        await waitFor(() => {
            expect(
                screen.getAllByText("React developer's guide").length,
            ).toBeGreaterThanOrEqual(1);
        });
        // A representative nav card is present.
        expect(screen.getByText('React fundamentals')).toBeInTheDocument();
        expect(screen.getByText('API handling')).toBeInTheDocument();
    });
});
