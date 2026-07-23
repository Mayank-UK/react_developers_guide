import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

/**
 * Smoke + interaction test for the CSS screen: headings render and the custom
 * property demo propagates a token change to both tiles.
 */
describe('CSS screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/styling/css']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(
                screen.getByText('The cascade & specificity'),
            ).toBeInTheDocument();
        });
        expect(
            screen.getByText('Custom properties (CSS variables)'),
        ).toBeInTheDocument();
    });

    it('specificity demo: inline style overrides the class', async () => {
        const router = createAppRouter(['/ui/styling/css']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() => screen.getByText('The cascade & specificity'));

        const target = screen.getByTestId('spec-target');
        // class only → primary background
        expect(target.style.backgroundColor).toBe('');

        fireEvent.click(screen.getByText('class + inline'));
        // inline style set → secondary token
        expect(target.style.backgroundColor).toBe('var(--color-secondary)');
    });

    it('custom-property demo propagates the token to both tiles', async () => {
        const router = createAppRouter(['/ui/styling/css']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );

        await waitFor(() =>
            screen.getByText('Custom properties (CSS variables)'),
        );

        const tiles = screen.getAllByTestId('cp-tile');
        expect(tiles).toHaveLength(2);
        // initial hue = primary
        expect(tiles[0]!.style.backgroundColor).toBe('var(--demo-color)');

        fireEvent.click(screen.getByText('warning'));
        expect(screen.getByText(/--demo-color =/).textContent).toContain(
            '#ff9800',
        );
    });
});
