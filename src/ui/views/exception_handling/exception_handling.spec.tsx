import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';
import { ApiScenario } from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';

const WAIT = { timeout: 8000 };

async function renderScreen() {
    const router = createAppRouter(['/exception-handling']);
    render(
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>,
    );
    await waitFor(() => screen.getByText('Two types — what broke, and what to tell the user'));
}

describe('Exception handling screen', () => {
    it('renders the section headings', async () => {
        await renderScreen();
        expect(
            screen.getByText('The guards — upgrading, mapping, and wrapping'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Severity drives blocking vs non-blocking UI'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Chaining — preserving the full story'),
        ).toBeInTheDocument();
    });

    it('shows a non-blocking warning when the remote fails but cache has data', async () => {
        await renderScreen();

        fireEvent.change(screen.getByLabelText('API'), {
            target: { value: ApiScenario.NetworkError },
        });
        // cache defaults to success (has data) — the seeded cache is a hit
        fireEvent.click(screen.getByText('run pipeline'));

        await waitFor(
            () => expect(screen.getByTestId('outcome-warning')).toBeInTheDocument(),
            WAIT,
        );
        expect(screen.getByTestId('failure-chain').textContent).toMatch(
            /internet/i,
        );
    });

    it('shows a blocking failure when the remote fails and the cache is empty', async () => {
        await renderScreen();

        fireEvent.change(screen.getByLabelText('API'), {
            target: { value: ApiScenario.NetworkError },
        });
        fireEvent.change(screen.getByLabelText('cache'), {
            target: { value: DbScenario.Empty },
        });
        fireEvent.click(screen.getByText('run pipeline'));

        await waitFor(
            () => expect(screen.getByTestId('outcome-blocking')).toBeInTheDocument(),
            WAIT,
        );
        // severity is critical → the badge shows "critical"
        expect(screen.getByText(/network · critical/i)).toBeInTheDocument();
    });
});
