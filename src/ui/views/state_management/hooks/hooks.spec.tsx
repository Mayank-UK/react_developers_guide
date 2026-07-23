import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../design-system/theme-provider';
import { createAppRouter } from '../../../routing/router';

describe('State management — Hooks screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/state-management/hooks']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('useState — one value, one setter'));
        expect(
            screen.getByText(/Derive, don.t duplicate/),
        ).toBeInTheDocument();
        expect(
            screen.getByText('useReducer — many transitions? group them'),
        ).toBeInTheDocument();
    });

    it('adds a todo to the useState list and updates the remaining count', async () => {
        const router = createAppRouter(['/state-management/hooks']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('useState — one value, one setter'));

        // Scope to the useState demo — the useReducer demo renders the same seed.
        const scope = within(screen.getByTestId('usestate-demo'));
        fireEvent.change(scope.getByLabelText('Add a todo'), {
            target: { value: 'Write a spec' },
        });
        fireEvent.click(scope.getByText('Add'));

        await waitFor(() =>
            expect(scope.getByText('Write a spec')).toBeInTheDocument(),
        );
    });

    it('filters the useState list by state', async () => {
        const router = createAppRouter(['/state-management/hooks']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('useState — one value, one setter'));

        const scope = within(screen.getByTestId('usestate-demo'));
        // The first seed todo is done; the "done" filter keeps it visible while
        // hiding the not-done ones in THIS demo only.
        fireEvent.click(scope.getByText('done'));
        await waitFor(() =>
            expect(
                scope.getByText('Read the React docs on state'),
            ).toBeInTheDocument(),
        );
        expect(scope.queryByText('Build the todo demo')).not.toBeInTheDocument();
    });
});
