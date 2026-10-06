import { expect, test } from '@playwright/test';

test.use({ locale: 'uk-UA' });

test('first visit follows the browser language', async ({ page, context }) => {
  await page.goto('/login');

  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.getByRole('button', { name: 'Увійти' })).toBeVisible();

  const cookies = await context.cookies();
  expect(cookies.map((cookie) => cookie.name)).not.toContain('habit-locale');
});
