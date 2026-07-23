import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../design-system/theme-provider';
import { createAppRouter } from '../../../routing/router';

describe('State management — Zustand screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/state-management/zustand']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('A store you just import — no provider'));
        expect(
            screen.getByText('Select a slice — re-render only what changed'),
        ).toBeInTheDocument();
    });

    it('adds a todo through the store and the list updates', async () => {
        const router = createAppRouter(['/state-management/zustand']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('A store you just import — no provider'));

        const input = screen.getByLabelText('Add a todo');
        fireEvent.change(input, { target: { value: 'No provider needed' } });
        fireEvent.click(screen.getByText('Add'));

        await waitFor(() =>
            expect(screen.getByText('No provider needed')).toBeInTheDocument(),
        );
    });
});
