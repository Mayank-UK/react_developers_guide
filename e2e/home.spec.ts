import { expect, test } from '@playwright/test';

/** The 15 section cards the home hub links out to — the guide's index. */
const EXPECTED_SECTION_COUNT = 15;

/**
 * Home is the guide's navigation hub: the shared layout's h1 carries the
 * route title and a grid of cards links to every section. These specs pin
 * the deployment wiring, not the design: that the server returns the right
 * document, that React actually mounted and rendered the full index, and
 * that the page boots without a single console error — the fastest signals
 * that the nginx image serves the RIGHT build (hashed asset paths resolve,
 * the SPA fallback works, nothing 404s).
 */
test('the document served is the guide home page', async ({ page }) => {
    const response = await page.goto('/');

    // SPA fallback: / hits index.html directly.
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('React Developers Guide');
});

test('the home hub renders the full guide index', async ({ page }) => {
    await page.goto('/');

    // React mounted: the shared layout's h1 carries the home route title.
    await expect(
        page.getByRole('heading', { level: 1, name: "React developer's guide" }),
    ).toBeVisible();

    // The index is a nav grid of link cards — every section present, none
    // dropped or doubled. The count pins the map's completeness.
    const cards = page.getByRole('navigation').getByRole('link');
    await expect(cards).toHaveCount(EXPECTED_SECTION_COUNT);

    // Spot checks across the whole guide: the first and last topics plus
    // the hub links. A broken asset load (missing chunk) leaves the grid
    // empty, so any visible card here means the build is wired.
    await expect(cards.filter({ hasText: 'React fundamentals' })).toBeVisible();
    await expect(cards.filter({ hasText: 'Best practices' })).toBeVisible();
    await expect(cards.filter({ hasText: 'State management' })).toBeVisible();
});

test('the page boots with zero console errors', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'error') {
            problems.push(message.text());
        }
    });
    page.on('pageerror', (error) => {
        problems.push(String(error));
    });

    await page.goto('/');
    // Give the lazy home chunk a beat to finish loading before judging the
    // console.
    await expect(
        page.getByRole('heading', { level: 1, name: "React developer's guide" }),
    ).toBeVisible();
    await page.waitForTimeout(1_000);

    expect(problems).toEqual([]);
});
