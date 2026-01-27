const { chromium } = require('playwright');
const fs = require('fs');

module.exports = async () => {
  const envRaw = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
  const extract = (name) => {
    const m = envRaw.match(new RegExp('^' + name + '=(.*)$', 'm'));
    if (!m) return '';
    return m[1].trim().replace(/^"(.*)"$/, '$1');
  };

  const email = extract('TEST_ADMIN_ACCOUNT');
  const password = extract('TEST_ADMIN_PASSWORD');

  if (!email || !password) {
    console.warn('No test credentials found in .env.local; skipping global setup.');
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/teacher/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard', { timeout: 15000 });

    // Save authenticated storage state for tests
    await context.storageState({ path: 'e2e/storageState.json' });
    console.log('Saved storage state to e2e/storageState.json');
  } catch (err) {
    console.error('Global setup login failed:', err);
  } finally {
    await browser.close();
  }
};
