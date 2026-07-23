import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('State management hub', () => {
    it('renders the landscape section and links to all four tools', async () => {
        const router = createAppRouter(['/state-management']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Which state are you managing?'));
        expect(screen.getByText('One todo, four ways')).toBeInTheDocument();
        expect(screen.getByText('Hooks')).toBeInTheDocument();
        expect(screen.getByText('Redux')).toBeInTheDocument();
        expect(screen.getByText('Zustand')).toBeInTheDocument();
        expect(screen.getByText('TanStack Query')).toBeInTheDocument();
    });
});
