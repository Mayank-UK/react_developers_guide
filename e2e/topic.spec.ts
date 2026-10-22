import { expect, test } from '@playwright/test';

/**
 * One guide topic, rendered end-to-end: the lazy-loaded view chunk resolves,
 * the shared layout's h1 carries the route title, the sections render from
 * the real bundle, and the CodeBlock component still behaves (collapsed by
 * default, expands to the real shipped source). A wrong or broken build —
 * missing chunk, stale asset hash, SPA fallback returning the wrong
 * document — fails at the first assertion.
 */
test('a guide topic renders its sections', async ({ page }) => {
    // Walk in the way a reader does: home index card → topic page (index →
    // content wiring, not just a deep URL that happens to answer).
    await page.goto('/');
    await page.getByRole('link', { name: /React fundamentals/ }).click();
    await expect(page).toHaveURL(/\/react-fundamentals$/);

    // The shared layout's h1 carries the route's title.
    await expect(
        page.getByRole('heading', { level: 1, name: 'React fundamentals' }),
    ).toBeVisible();

    // Sections render from the lazy view chunk — spot checks across the
    // whole (long) page: the first, a mid, and the last section.
    await expect(
        page.getByRole('heading', { level: 2, name: 'What is React?' }),
    ).toBeVisible();
    await expect(
        page.getByRole('heading', { level: 2, name: 'State with useState' }),
    ).toBeVisible();
    await expect(
        page
            .getByRole('heading', { level: 2, name: 'Composition: props.children' }),
    ).toBeVisible();
});

test('code blocks start collapsed and expand to the real source', async ({
    page,
}) => {
    await page.goto('/react-fundamentals');

    await expect(
        page.getByRole('heading', { level: 2, name: 'JSX' }),
    ).toBeVisible();

    // Collapsed by default: every language toggle is aria-expanded=false
    // and NO source <pre> is in the DOM yet (open blocks render the pre,
    // collapsed ones render nothing).
    const firstTsToggle = page.getByRole('button', { name: /tsx/ }).first();
    await expect(firstTsToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('pre')).toHaveCount(0);

    // Expanding reveals the real shipped code.
    await firstTsToggle.click();
    await expect(firstTsToggle).toHaveAttribute('aria-expanded', 'true');
    const firstTsSource = page.locator('pre').first();
    await expect(firstTsSource).toBeVisible();
    await expect(firstTsSource).toContainText('Hello, {name}!');
});
