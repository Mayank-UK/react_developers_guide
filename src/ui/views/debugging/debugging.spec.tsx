import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('Debugging screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/debugging']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/three toolboxes, one missing thing to find/i));
        expect(screen.getByText(/First stop — the app/i)).toBeInTheDocument();
        expect(screen.getByText(/Error boundaries — the production safety net/i)).toBeInTheDocument();
    });

    it('catches a triggered render crash in the error boundary', async () => {
        const router = createAppRouter(['/debugging']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/three toolboxes, one missing thing to find/i));

        expect(screen.getByText(/Healthy subtree/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'crash the subtree' }));
        expect(screen.getByText(/error boundary caught it/i)).toBeInTheDocument();
        expect(screen.getByText(/TypeError: Cannot read properties of undefined/i)).toBeInTheDocument();
    });
});
