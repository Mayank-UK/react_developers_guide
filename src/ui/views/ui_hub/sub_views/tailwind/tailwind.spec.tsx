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
