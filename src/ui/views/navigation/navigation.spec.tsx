import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

async function renderNavigation() {
    const router = createAppRouter(['/navigation-routing']);
    render(
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>,
    );
    await waitFor(() => screen.getByText('What routing solves'));
}

describe('Navigation and routing screen', () => {
    it('renders the section headings', async () => {
        await renderNavigation();
        expect(
            screen.getByText('Routes as data & nested outlets'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Dynamic route params — :id & useParams'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Query strings — useSearchParams'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Guards & protected routes'),
        ).toBeInTheDocument();
    });

    it('the params demo reads :id via useParams', async () => {
        await renderNavigation();
        // click user 42 (the handles demo already shows user 7, so assert on 42)
        const alanLink = screen.getAllByTestId('user-42')[0]!;
        fireEvent.click(alanLink);
        await waitFor(() =>
            expect(
                screen
                    .getAllByTestId('user-detail')
                    .some((el) => el.textContent?.includes('42')),
            ).toBe(true),
        );
    });

    it('the search demo writes the ?q= query param', async () => {
        await renderNavigation();
        const input = screen.getByPlaceholderText('filter by name…');
        fireEvent.change(input, { target: { value: 'al' } });
        await waitFor(() =>
            expect(screen.getByTestId('search-screen').textContent).toContain(
                '?q=al',
            ),
        );
    });

    it('the guards demo redirects to /login when signed out', async () => {
        await renderNavigation();
        await waitFor(() =>
            expect(screen.getByTestId('login')).toBeInTheDocument(),
        );
        // sign in → lands on the dashboard
        fireEvent.click(screen.getByTestId('sign-in'));
        await waitFor(() =>
            expect(screen.getByTestId('dashboard')).toBeInTheDocument(),
        );
    });
});
