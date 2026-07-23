import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

describe('Tailwind screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/styling/tailwind']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Utility-first styling'));
        expect(
            screen.getByText('How this app configures Tailwind v4'),
        ).toBeInTheDocument();
        expect(screen.getByText('Responsive variants')).toBeInTheDocument();
    });
});
