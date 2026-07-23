import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../design-system/theme-provider';
import { createAppRouter } from '../../../routing/router';

// The demo's fake API resolves after ~450ms (mutation + invalidate/refetch),
// so these waits allow a comfortable margin over the default.
const WAIT = { timeout: 5000 };

describe('State management — TanStack Query screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/state-management/tanstack-query']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Server state is a different problem'));
        expect(screen.getByText('The cache is the point')).toBeInTheDocument();
    });

    it('shows the loading state then surfaces the fetched todos', async () => {
        const router = createAppRouter(['/state-management/tanstack-query']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Server state is a different problem'));

        await waitFor(
            () =>
                expect(
                    screen.getByText('Fetch the list with useQuery'),
                ).toBeInTheDocument(),
            WAIT,
        );
    });

    it('runs a mutation and refetches the list', async () => {
        const router = createAppRouter(['/state-management/tanstack-query']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Server state is a different problem'));

        const input = screen.getByLabelText('Add a todo');
        fireEvent.change(input, { target: { value: 'Server-side todo' } });
        fireEvent.click(screen.getByText('Add'));

        await waitFor(
            () =>
                expect(screen.getByText('Server-side todo')).toBeInTheDocument(),
            WAIT,
        );
    });
});
