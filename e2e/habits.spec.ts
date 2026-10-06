import { expect, test } from '@playwright/test';

test('registers, logs a habit, and shows it on the calendar', async ({
  page,
}) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(
    page.getByRole('region', { name: 'Habit calendar' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Log habits' }).click();
  await page.waitForURL('**/log');
  await page.getByRole('textbox', { name: 'Habit' }).fill('Read');
  await page.getByRole('button', { name: 'Add' }).click();

  const card = page.getByRole('listitem').filter({ hasText: 'Read' });
  await card.getByRole('button', { name: 'Done today' }).click();
  await expect(card.getByText('Nice. Today is done.')).toBeVisible();

  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(
    page.getByRole('region', { name: 'Habit calendar' }).getByText('Read'),
  ).toBeVisible();
});
