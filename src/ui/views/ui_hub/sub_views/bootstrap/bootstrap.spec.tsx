import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { container } from '../../../../../core/container';
import { createAppConfig } from '../../../../../core/config';
import { createAppRouter } from '../../../../routing/router';

beforeAll(() => {
    if (!window.matchMedia) {
        window.matchMedia = () =>
            ({
                matches: false,
                addEventListener() {},
                removeEventListener() {},
            }) as unknown as MediaQueryList;
    }
    container.initialize(createAppConfig());
});

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
