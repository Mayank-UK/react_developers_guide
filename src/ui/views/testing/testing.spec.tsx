import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('Testing screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/testing']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/What we test, and why/i));
        expect(screen.getByText(/Vitest \+ jsdom \+ Testing Library/i)).toBeInTheDocument();
        expect(screen.getByText(/Two kinds of test live in this codebase/i)).toBeInTheDocument();
    });

    it('runs the demo suite green, then red when the bug is flipped', async () => {
        const router = createAppRouter(['/testing']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/What we test, and why/i));

        fireEvent.click(screen.getByRole('button', { name: 'run tests' }));
        expect(screen.getByText('3 passed')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText(/introduce a bug/i));
        fireEvent.click(screen.getByRole('button', { name: 'run tests' }));
        expect(screen.getByText(/1 passed · 2 failed/)).toBeInTheDocument();
        expect(screen.getByText(/AssertionError: expected 1, got 0/)).toBeInTheDocument();
    });
});
