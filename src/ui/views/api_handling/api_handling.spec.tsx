import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { container } from '../../../core/container';
import { createAppRouter } from '../../routing/router';
import { ApiScenario } from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';

// The fake API resolves after ~600ms; allow a comfortable margin.
const WAIT = { timeout: 5000 };

// Reset the shared dev scenario holders between tests so a previous run's
// cache-read-error / empty / failure scenario doesn't bleed into the next.
beforeEach(() => {
    container.setApiScenario(ApiScenario.Success);
    container.setDbScenario(DbScenario.Success);
});

describe('API handling screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/api-handling']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText('The whole pipeline at a glance'),
        );
        expect(
            screen.getByText('The Result type — failures are values, not exceptions'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('React vs Flutter — same architecture, different idioms'),
        ).toBeInTheDocument();
    });

    it('fetches posts through the real pipeline and shows them', async () => {
        // Ensure a clean success path.
        container.setApiScenario(ApiScenario.Success);

        const router = createAppRouter(['/api-handling']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText('The whole pipeline at a glance'),
        );

        // The fake API returns "Clean architecture in React" on success.
        await waitFor(
            () =>
                expect(
                    screen.getByText('Clean architecture in React'),
                ).toBeInTheDocument(),
            WAIT,
        );
        expect(screen.getByTestId('posts-list')).toBeInTheDocument();
    });

    it('falls back to the cache (non-blocking) when the remote fails', async () => {
        // Seed the cache with a successful fetch first.
        container.setApiScenario(ApiScenario.Success);
        const seed = createAppRouter(['/api-handling']);
        render(
            <ThemeProvider>
                <RouterProvider router={seed} />
            </ThemeProvider>,
        );
        await waitFor(
            () =>
                expect(
                    screen.getByText('Clean architecture in React'),
                ).toBeInTheDocument(),
            WAIT,
        );

        // Now break the remote. The repository should serve the cached posts.
        const select = screen.getByLabelText('API scenario');
        fireEvent.change(select, { target: { value: ApiScenario.NetworkError } });

        await waitFor(
            () =>
                expect(
                    screen.getByText(
                        /served .+ posts from cache \(remote failed\)/,
                    ),
                ).toBeInTheDocument(),
            WAIT,
        );
        // Posts are still visible — non-blocking fallback.
        expect(screen.getByText('Clean architecture in React')).toBeInTheDocument();
    });
});
