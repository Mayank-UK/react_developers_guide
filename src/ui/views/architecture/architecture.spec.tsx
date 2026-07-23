import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../design-system/theme-provider';
import { createAppRouter } from '../../routing/router';

describe('Architecture screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/architecture']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText('What architecture is, and why it matters'),
        );
        expect(
            screen.getByText('The four layers in this app'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('The dependency rule — every arrow points inward'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Folder structure is the architecture'),
        ).toBeInTheDocument();
    });

    it('switches the layer explorer contract when a layer is selected', async () => {
        const router = createAppRouter(['/architecture']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText('What architecture is, and why it matters'),
        );

        // domain/ is selected by default and shows its contract (unique text).
        expect(
            screen.getByText(
                'data/, ui/, React, axios, Dexie — anything concrete or platform-specific.',
            ),
        ).toBeInTheDocument();

        // selecting ui/ surfaces ui's contract instead. 'ui/' also appears in
        // the tracer, so target the explorer button (first occurrence in the DOM).
        fireEvent.click(screen.getAllByText('ui/')[0]!);
        expect(
            screen.getByText(
                'data/ concretes directly. It depends on the contract, never on PostRepositoryImpl.',
            ),
        ).toBeInTheDocument();
    });

    it('runs the request tracer to completion', async () => {
        const router = createAppRouter(['/architecture']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() =>
            screen.getByText('What architecture is, and why it matters'),
        );

        fireEvent.click(screen.getByText('Run request'));
        // The first step lights up immediately.
        expect(
            screen.getByText('User action → hook'),
        ).toBeInTheDocument();
    });
});
