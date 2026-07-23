import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('About screen', () => {
    it('renders the about content', async () => {
        const router = createAppRouter(['/about']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/What this app is/i));
        expect(screen.getByText(/What it covers/i)).toBeInTheDocument();
        expect(screen.getByText(/The stack/i)).toBeInTheDocument();
        expect(screen.getByText(/topic screens/i)).toBeInTheDocument();
    });

    it('opens the mobile drawer and links to About via the hamburger', async () => {
        // jsdom has no layout; the md:hidden/hidden classes don't take effect,
        // so the hamburger button is always present in the test DOM. The drawer
        // panel only renders after the button is clicked.
        const router = createAppRouter(['/']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getAllByText(/React developer's guide/i));

        // Drawer panel is not present until opened.
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
        const dialog = await screen.findByRole('dialog');
        expect(dialog).toBeInTheDocument();
        // The drawer's About link is rendered inside the dialog.
        expect(dialog).toHaveTextContent('About');
    });
});
