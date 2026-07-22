import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './ui/routing/router';
import { ThemeProvider } from './ui/design-system/theme-provider';
import { container } from './core/container';
import { createAppConfig } from './core/config';

/**
 * Initialize the dependency container from the active Vite environment before
 * rendering. In a real app this is also where you'd open the DB, fetch an auth
 * token, etc. Here the container eagerly wires all singletons.
 */
container.initialize(createAppConfig());

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    </StrictMode>,
);
