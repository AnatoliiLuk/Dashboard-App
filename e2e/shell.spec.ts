import { expect, test, type Page } from '@playwright/test';

async function register(page: Page) {
  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(`e2e-${crypto.randomUUID()}@example.com`);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL((url) => url.pathname === '/');
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('moves the sections to a bottom tab bar', async ({ page }) => {
    await register(page);

    const tabs = page.getByRole('navigation', { name: 'Menu' });
    await expect(tabs).toHaveCount(1);
    await expect(tabs).toBeInViewport();

    await tabs.getByRole('link', { name: 'Goals' }).click();
    await page.waitForURL('**/goals');
    await expect(tabs.getByRole('link', { name: 'Goals' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBe(0);
  });
});

test('keeps preferences and sign-out in the account menu', async ({ page }) => {
  await register(page);

  await expect(page.getByRole('group', { name: 'Color theme' })).toBeHidden();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-mui-color-scheme',
    'dark',
  );

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL((url) => url.pathname === '/login');
});
