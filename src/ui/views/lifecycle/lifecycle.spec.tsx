import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

// NOTE: the lifecycle screen keeps a module-scoped event log that persists
// across renders. These tests assert substrings (not exact counts) so they
// stay independent of ordering across the shared log.

describe('Lifecycle screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/lifecycle']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('The three phases'));
        expect(
            screen.getByText('The dependency array decides everything'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Mount & unmount — set up, then tear down'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Class lifecycle methods vs hooks'),
        ).toBeInTheDocument();
    });

    it('renders the class→hooks mapping table', async () => {
        const router = createAppRouter(['/lifecycle']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Class lifecycle methods vs hooks'));
        expect(screen.getByText('componentDidMount')).toBeInTheDocument();
        expect(screen.getByText('componentWillUnmount')).toBeInTheDocument();
    });

    it('mounting/unmounting the timer logs setup then cleanup', async () => {
        const router = createAppRouter(['/lifecycle']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Mount & unmount — set up, then tear down'));

        fireEvent.click(screen.getByText('mount timer'));
        await waitFor(() =>
            expect(
                screen
                    .getAllByTestId('lifecycle-log')
                    .some((el) => el.textContent?.includes('mount: interval started')),
            ).toBe(true),
        );

        fireEvent.click(screen.getByText('unmount timer'));
        await waitFor(() =>
            expect(
                screen
                    .getAllByTestId('lifecycle-log')
                    .some((el) => el.textContent?.includes('cleanup: interval cleared')),
            ).toBe(true),
        );
    });

    it('the deps demo only fires when a dependency changes', async () => {
        const router = createAppRouter(['/lifecycle']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('The dependency array decides everything'));

        // multiplier is the only dep; bumping it must increment effect runs.
        const multBtn = screen.getByTestId('mult-btn');
        const before = screen.getByText(/effect fired/, { exact: false }).textContent;
        fireEvent.click(multBtn);
        await waitFor(() => {
            const after = screen.getByText(/effect fired/, { exact: false }).textContent;
            expect(after).not.toEqual(before);
        });
    });
});
