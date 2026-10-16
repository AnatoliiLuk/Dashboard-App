import { expect, test } from '@playwright/test';

test('logs a linked habit on the goal timeline without moving the day', async ({
  page,
}) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.getByRole('link', { name: 'Log habits' }).click();
  await page.waitForURL('**/log');
  await page.getByRole('textbox', { name: 'Habit' }).fill('Read');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Read' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'My goals' }).click();
  await page.waitForURL('**/goals');
  await page.getByRole('textbox', { name: 'Goal' }).fill('October focus');
  await page.getByRole('combobox', { name: 'Habits' }).click();
  await page.getByRole('option', { name: 'Read' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Add' }).click();

  const goal = page.getByRole('listitem').filter({ hasText: 'October focus' });
  await expect(goal.getByText('Read')).toBeVisible();
  await expect(goal.getByText('100%')).toBeVisible();
  await expect(goal.getByRole('progressbar')).toHaveAttribute(
    // cspell:disable-next-line
    'aria-valuenow',
    '100',
  );
  await expect(
    goal.getByRole('group', { name: /Today is still open/ }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Log habits' }).click();
  const card = page.getByRole('listitem').filter({ hasText: 'Read' });
  await card.getByRole('button', { name: 'Done today' }).click();
  await expect(card.getByText('Nice. Today is done.')).toBeVisible();

  await page.getByRole('link', { name: 'My goals' }).click();
  const updated = page
    .getByRole('listitem')
    .filter({ hasText: 'October focus' });
  await expect(updated.getByText('100%')).toBeVisible();
  await expect(updated.getByRole('progressbar')).toHaveAttribute(
    // cspell:disable-next-line
    'aria-valuenow',
    '100',
  );
  await expect(
    updated.getByRole('group', { name: /Logged today/ }),
  ).toBeVisible();
});
