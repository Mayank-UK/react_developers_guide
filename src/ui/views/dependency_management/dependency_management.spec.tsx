import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { container } from '../../../core/container';
import { createAppRouter } from '../../routing/router';
import { ApiScenario } from '../../../core/scenario/api-scenario';

describe('Dependency management screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/dependency-management']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText(
                'What dependency management is, and why it matters',
            ),
        );
        expect(
            screen.getByText('React has no DI standard — so what are the options'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('The wiring graph — one file owns every constructor call'),
        ).toBeInTheDocument();
    });

    it('inspects the real container and shows the dev fakes', async () => {
        const router = createAppRouter(['/dependency-management']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText(
                'What dependency management is, and why it matters',
            ),
        );
        // In dev the container wires the fakes.
        expect(screen.getByText('FakeApiService')).toBeInTheDocument();
        expect(screen.getByText('FakeAppDatabase')).toBeInTheDocument();
    });

    it('flips the API scenario at runtime via the container', async () => {
        const router = createAppRouter(['/dependency-management']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText(
                'What dependency management is, and why it matters',
            ),
        );

        fireEvent.change(screen.getByLabelText('API scenario'), {
            target: { value: ApiScenario.ServerError },
        });
        expect(container.getApiScenario()).toBe(ApiScenario.ServerError);

        // reset for other tests
        container.setApiScenario(ApiScenario.Success);
    });
});
