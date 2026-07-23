import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

describe('Responsive layout screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/responsive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Tailwind responsive breakpoints'));
        expect(
            screen.getByText('CSS media queries — the engine under Tailwind'),
        ).toBeInTheDocument();
        expect(
            screen.getByText("When CSS isn't enough: useMediaQuery"),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Container queries — adapt to a parent box'),
        ).toBeInTheDocument();
    });

    it('renders the breakpoint table with all six prefixes', async () => {
        const router = createAppRouter(['/ui/responsive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Tailwind responsive breakpoints'));
        for (const prefix of ['base', 'sm:', 'md:', 'lg:', 'xl:', '2xl:']) {
            expect(screen.getByText(prefix)).toBeInTheDocument();
        }
    });

    it('the container-query slider resizes the container width', async () => {
        const router = createAppRouter(['/ui/responsive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Container queries — adapt to a parent box'));

        const slider = screen.getByTestId('cq-slider');
        const containerEl = screen.getByTestId('cq-container');

        // initial width is 40%
        expect(containerEl.style.width).toBe('40%');

        fireEvent.change(slider, { target: { value: '80' } });
        expect(containerEl.style.width).toBe('80%');
    });

    it('the useMediaQuery re-check button forces a re-render', async () => {
        const router = createAppRouter(['/ui/responsive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText("When CSS isn't enough: useMediaQuery"));

        const button = screen.getByRole('button', { name: /re-check/ });
        expect(button.textContent).toContain('#0');
        fireEvent.click(button);
        expect(button.textContent).toContain('#1');
    });
});
