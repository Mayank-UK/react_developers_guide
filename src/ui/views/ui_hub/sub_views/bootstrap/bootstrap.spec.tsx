import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

describe('Bootstrap screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/styling/bootstrap']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('What is Bootstrap?'));
        expect(screen.getByText('The 12-column grid')).toBeInTheDocument();
        expect(
            screen.getByText('Bootstrap vs Tailwind — what this app chose'),
        ).toBeInTheDocument();
    });
});
