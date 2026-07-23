import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

/**
 * Smoke + interaction test for the TS/JS fundamentals screen. Renders the
 * section headings and drives the small counter demo to guard the interactive
 * example against regressions.
 */
describe('TS/JS fundamentals screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/typescript-javascript-fundamentals']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(
                screen.getByText('Variables: let, const, var'),
            ).toBeInTheDocument();
        });
        expect(screen.getByText('Primitive types')).toBeInTheDocument();
        expect(
            screen.getByText('Async: Promises & async/await'),
        ).toBeInTheDocument();
    });

    it('counter demo increments and recomputes doubled', async () => {
        const router = createAppRouter(['/typescript-javascript-fundamentals']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => screen.getByText('Variables: let, const, var'));

        const btn = screen.getByRole('button', { name: /n = 0/ });
        fireEvent.click(btn);
        expect(screen.getByTestId('doubled-value')).toHaveTextContent('2');
    });
});
