import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('Best practices screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/best-practices']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/render is cheap, until it isn/i));
        expect(screen.getByText(/one rule that is never optional/i)).toBeInTheDocument();
        expect(
            screen.getByText(/three tools and when each earns its keep/i),
        ).toBeInTheDocument();
    });

    it('renders the memo comparison and accepts input without error', async () => {
        const router = createAppRouter(['/best-practices']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText(/render is cheap, until it isn/i));

        expect(screen.getByText('no memo')).toBeInTheDocument();
        expect(screen.getByText('useMemo + React.memo')).toBeInTheDocument();

        const input = screen.getByPlaceholderText(
            'type here to re-render the parent…',
        );
        fireEvent.change(input, { target: { value: 'abc' } });
        expect(input).toHaveValue('abc');
    });
});
