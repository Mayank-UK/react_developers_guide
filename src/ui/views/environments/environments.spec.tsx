import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('Environments screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/environments']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/What an environment is, and why you need three/i));
        expect(screen.getByText(/one build flag selects the whole environment/i)).toBeInTheDocument();
        expect(screen.getByText(/env vars to a wired container in one function/i)).toBeInTheDocument();
    });

    it('shows the per-environment resolved config', async () => {
        const router = createAppRouter(['/environments']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/What an environment is, and why you need three/i));

        expect(screen.getAllByText('development').length).toBeGreaterThan(0);
        expect(screen.getAllByText('staging').length).toBeGreaterThan(0);
        expect(screen.getAllByText('production').length).toBeGreaterThan(0);
        expect(screen.getByText('this running build')).toBeInTheDocument();
    });
});
