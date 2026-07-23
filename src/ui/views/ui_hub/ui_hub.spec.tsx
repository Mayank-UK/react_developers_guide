import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('UI hub screen', () => {
    it('renders the sub-screen links', async () => {
        const router = createAppRouter(['/ui']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Layout and structure'));
        expect(screen.getByText('CSS')).toBeInTheDocument();
        expect(screen.getByText('Tailwind')).toBeInTheDocument();
        expect(screen.getByText('Interactive behaviours')).toBeInTheDocument();
    });
});
