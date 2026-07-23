import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../design-system/theme-provider';
import { createAppRouter } from '../../../routing/router';

describe('State management — Redux screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/state-management/redux']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('One store, one-way data flow'));
        expect(screen.getByText('When is Redux worth it?')).toBeInTheDocument();
    });

    it('dispatches an add action and the store-driven list updates', async () => {
        const router = createAppRouter(['/state-management/redux']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('One store, one-way data flow'));

        const input = screen.getByLabelText('Add a todo');
        fireEvent.change(input, { target: { value: 'Dispatch this' } });
        fireEvent.click(screen.getByText('Add'));

        await waitFor(() =>
            expect(screen.getByText('Dispatch this')).toBeInTheDocument(),
        );
    });
});
