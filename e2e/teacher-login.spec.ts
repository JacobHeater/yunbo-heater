import { test, expect } from '@playwright/test';
import fs from 'fs';

// Read .env.local and extract TEST_ADMIN_ACCOUNT and TEST_ADMIN_PASSWORD
const envRaw = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
function extract(name: string) {
  const m = envRaw.match(new RegExp('^' + name + '=(.*)$', 'm'));
  if (!m) return '';
  return m[1].trim().replace(/^\"(.*)\"$/, '$1');
}
const ADMIN_EMAIL = extract('TEST_ADMIN_ACCOUNT');
const ADMIN_PASSWORD = extract('TEST_ADMIN_PASSWORD');

test('Session persists across navigation', async ({ page }) => {
  // Start at dashboard to verify initial authenticated state
  await page.goto('/teacher/dashboard');
  await expect(page.getByRole('heading', { name: 'Teacher Dashboard' })).toBeVisible();
  if (ADMIN_EMAIL) await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible();

  // Navigate to home and verify page loaded
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);

  // Navigate to piano lessons and verify page loaded
  await page.goto('/piano/lessons');
  await expect(page).toHaveURL(/\/piano\/lessons$/);

  // Return to dashboard and ensure session is still valid
  await page.goto('/teacher/dashboard');
  await expect(page.getByRole('heading', { name: 'Teacher Dashboard' })).toBeVisible();
  if (ADMIN_EMAIL) await expect(page.locator(`text=${ADMIN_EMAIL}`)).toBeVisible();
});
