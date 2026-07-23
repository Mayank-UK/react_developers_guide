import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

/**
 * Smoke + interaction test for the React fundamentals screen. Mounts the full
 * provider + router tree and drives two of the live demos (counter + list) to
 * guard against regressions in the interactive examples, which type-checking
 * can't catch.
 */
describe('React fundamentals screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/react-fundamentals']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('JSX')).toBeInTheDocument();
        });
        expect(screen.getByText('Components & props')).toBeInTheDocument();
        expect(screen.getByText('Lists & keys')).toBeInTheDocument();
    });

    it('counter increments and resets', async () => {
        const router = createAppRouter(['/react-fundamentals']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => screen.getByText('JSX'));

        const inc = screen.getByRole('button', { name: '+' });
        fireEvent.click(inc);
        fireEvent.click(inc);
        expect(screen.getByText('2')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'reset' }));
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('list demo adds and removes a task', async () => {
        const router = createAppRouter(['/react-fundamentals']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => screen.getByText('JSX'));

        const input = screen.getByPlaceholderText(
            'Add a task…',
        );
        fireEvent.change(input, { target: { value: 'My new task' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(screen.getByText('My new task')).toBeInTheDocument();
        fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]!);
        expect(screen.queryByText('Learn JSX')).not.toBeInTheDocument();
    });
});
