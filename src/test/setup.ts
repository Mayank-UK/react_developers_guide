import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { container } from '../core/container';
import { createAppConfig } from '../core/config';

/**
 * Global test setup, run once per test file (vitest `setupFiles`).
 *
 * Two things every screen spec needs, centralized here so they're not
 * copy-pasted into 20+ beforeAll blocks:
 *  - a jsdom matchMedia polyfill (ThemeProvider queries it for dark-mode),
 *  - a initialized DI container with the default (dev, fake-backed) config.
 */
beforeAll(() => {
    if (!window.matchMedia) {
        window.matchMedia = (query: string) =>
            ({
                matches: false,
                media: query,
                addEventListener() {},
                removeEventListener() {},
            }) as unknown as MediaQueryList;
    }
    // jsdom has no layout, so <ScrollRestoration>'s scrollTo is a no-op here.
    window.scrollTo = () => {};
    container.initialize(createAppConfig());
});

afterEach(() => {
    cleanup();
});
