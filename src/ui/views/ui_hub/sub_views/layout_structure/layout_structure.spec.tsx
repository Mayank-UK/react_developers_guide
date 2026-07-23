import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

/**
 * Smoke + interaction test for the Layout & structure screen: renders the
 * headings and drives the flex direction + grid column toggles.
 */
describe('Layout & structure screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/layout']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText('The box model')).toBeInTheDocument();
        });
        expect(
            screen.getByText('Flexbox — one-dimensional layout'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('CSS Grid — two-dimensional layout'),
        ).toBeInTheDocument();
    });

    it('flex demo toggles between row and column', async () => {
        const router = createAppRouter(['/ui/layout']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => screen.getByText('The box model'));

        const container = screen.getByTestId('flex-container');
        expect(container.className).toContain('flex-row');

        fireEvent.click(screen.getByTestId('flex-col-btn'));
        expect(container.className).toContain('flex-col');
        expect(container.className).not.toContain('flex-row');
    });

    it('grid demo changes column count', async () => {
        const router = createAppRouter(['/ui/layout']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => screen.getByText('The box model'));

        const container = screen.getByTestId('grid-container');
        expect(
            (container.style.gridTemplateColumns || '').includes('(3,'),
        ).toBe(true);

        fireEvent.click(screen.getByText('1 col'));
        expect(
            (container.style.gridTemplateColumns || '').includes('(1,'),
        ).toBe(true);
    });
});
