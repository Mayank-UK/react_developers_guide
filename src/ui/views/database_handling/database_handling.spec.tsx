import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { container } from '../../../core/container';
import { createAppRouter } from '../../routing/router';
import { DbScenario } from '../../../core/scenario/db-scenario';

describe('Database handling screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/database-handling']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText('What the local layer is for'),
        );
        expect(
            screen.getByText('AppDatabaseImpl — the Dexie connection that owns the schema'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('React vs Flutter — same shape, different engine'),
        ).toBeInTheDocument();
    });

    it('writes to the cache and reads the posts back', async () => {
        container.setDbScenario(DbScenario.Success);

        const router = createAppRouter(['/database-handling']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('What the local layer is for'));

        fireEvent.click(screen.getByText('write sample posts'));
        fireEvent.click(screen.getByText('↻ read cache'));

        await waitFor(
            () =>
                expect(screen.getByText('Cached post')).toBeInTheDocument(),
            { timeout: 5000 },
        );
        expect(screen.getByText('Offline-first')).toBeInTheDocument();
    });

    it('shows a typed AppDatabaseException on a read error', async () => {
        container.setDbScenario(DbScenario.Success);

        const router = createAppRouter(['/database-handling']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('What the local layer is for'));

        // Flip the DB scenario to read-error, then read.
        fireEvent.change(screen.getByLabelText('DB scenario'), {
            target: { value: DbScenario.ReadError },
        });
        fireEvent.click(screen.getByText('↻ read cache'));

        await waitFor(
            () =>
                expect(screen.getByTestId('cache-error')).toBeInTheDocument(),
            { timeout: 5000 },
        );
        expect(screen.getByTestId('cache-error').textContent).toMatch(
            /AppDatabaseException/,
        );
    });
});
