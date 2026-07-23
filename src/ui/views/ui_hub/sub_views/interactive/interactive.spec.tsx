import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from '../../../../design-system/theme-provider';
import { createAppRouter } from '../../../../routing/router';

describe('Interactive behaviours screen', () => {
    it('renders the section headings', async () => {
        const router = createAppRouter(['/ui/interactive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Hover & focus'));
        expect(screen.getByText('Transitions')).toBeInTheDocument();
        expect(screen.getByText('Animations')).toBeInTheDocument();
    });

    it('transition demo changes duration and applies hover', async () => {
        const router = createAppRouter(['/ui/interactive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Hover & focus'));

        const box = screen.getByTestId('transition-box');
        expect(box.style.transition).toContain('150ms');

        fireEvent.click(screen.getByText('500ms'));
        expect(box.style.transition).toContain('500ms');

        fireEvent.click(screen.getByText('apply hover'));
        expect(box.style.transform).toContain('translateY(-12px)');
    });

    it('animation demo replays', async () => {
        const router = createAppRouter(['/ui/interactive']);
        render(
            <ThemeProvider>
                <RouterProvider router={router} />
            </ThemeProvider>,
        );
        await waitFor(() => screen.getByText('Hover & focus'));

        // The box is present on mount; clicking replay remounts it (key changes).
        const before = screen.getByTestId('anim-box');
        fireEvent.click(screen.getByText('replay animation'));
        const after = screen.getByTestId('anim-box');
        expect(after).toBeInTheDocument();
        expect(before).not.toBe(after);
    });
});
