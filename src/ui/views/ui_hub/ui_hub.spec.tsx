import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { container } from '../../../core/container';
import { createAppConfig } from '../../../core/config';
import { createAppRouter } from '../../routing/router';

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

describe('UI hub screen', () => {
    it('renders the sub-screen links', async () => {
        const router = createAppRouter(['/ui']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Layout and structure'));
        expect(screen.getByText('CSS')).toBeInTheDocument();
        expect(screen.getByText('Tailwind')).toBeInTheDocument();
        expect(screen.getByText('Interactive behaviours')).toBeInTheDocument();
    });
});
