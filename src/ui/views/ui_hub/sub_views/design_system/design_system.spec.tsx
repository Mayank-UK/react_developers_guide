import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

describe('Design system screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/design-system']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('What a design system is, and why'));
        expect(screen.getByText('Color tokens')).toBeInTheDocument();
        expect(screen.getByText('Typography scale')).toBeInTheDocument();
        expect(screen.getByText('Spacing scale')).toBeInTheDocument();
        expect(screen.getByText('Radius & elevation')).toBeInTheDocument();
        expect(
            screen.getByText('Light / dark theming'),
        ).toBeInTheDocument();
    });

    it('renders the live swatches reading real tokens', async () => {
        const router = createAppRouter(['/ui/design-system']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Color tokens'));
        const swatches = screen.getByTestId('color-swatches');
        // primary swatch's inline style must resolve to the token var
        const primary = swatches.querySelector('[style*="--color-primary"]');
        expect(primary).not.toBeNull();
    });

    it('the theme toggle button flips mode and the data-theme attribute', async () => {
        const router = createAppRouter(['/ui/design-system']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Light / dark theming'));

        const btn = screen.getByTestId('theme-toggle-demo');
        // initial mode is light in jsdom (no stored pref, matchMedia=false)
        expect(btn.textContent).toContain('switch to dark');

        fireEvent.click(btn);
        expect(btn.textContent).toContain('switch to light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
});
