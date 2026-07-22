import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5174';
const routes = ['/', '/react-fundamentals', '/api-handling', '/state-management'];

const browser = await chromium.launch();
const page = await browser.newPage();

const errors = [];
const messages = [];

page.on('console', (msg) => {
  messages.push(`[${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  errors.push(`PAGEERROR: ${err.name}: ${err.message}\n${err.stack ?? ''}`);
});
page.on('requestfailed', (req) => {
  errors.push(`REQUESTFAILED: ${req.url()} — ${req.failure()?.errorText}`);
});

for (const route of routes) {
  const url = BASE + route;
  console.log(`\n=== Navigating to ${url} ===`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    // Give React + effects a moment to run.
    await page.waitForTimeout(1500);
    const bodyText = (await page.locator('body').innerText()).slice(0, 200);
    console.log(`BODY: ${bodyText.replace(/\n/g, ' | ')}`);
  } catch (e) {
    console.log(`NAV ERROR: ${e.message}`);
  }
}

console.log('\n===== CONSOLE MESSAGES =====');
for (const m of messages) console.log(m);

console.log('\n===== PAGE / REQUEST ERRORS =====');
if (errors.length === 0) console.log('(none)');
for (const e of errors) console.log(e);

await browser.close();
