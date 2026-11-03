import { expect, test } from '@playwright/test';

test('opens the account page from the menu and changes the name', async ({
  page,
}) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('link', { name: 'Account' }).click();
  await page.waitForURL('**/account');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Account');
  await expect(
    page.getByRole('heading', { level: 2 }).allTextContents(),
  ).resolves.toEqual(['Profile', 'Danger zone']);

  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status')).toHaveText('Profile saved.');

  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue('Ada Lovelace');
});

test('moves between the account tabs, each with its own URL', async ({
  page,
}) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL((url) => url.pathname === '/');

  await page.goto('/account');
  const tabs = page.getByRole('navigation', { name: 'Account settings' });

  await tabs.getByRole('link', { name: 'Security' }).click();
  await page.waitForURL('**/account/security');
  await expect(
    page.getByRole('heading', { level: 2 }).allTextContents(),
  ).resolves.toEqual(['Password']);

  await tabs.getByRole('link', { name: 'AI & apps' }).click();
  await page.waitForURL('**/account/ai');
  await expect(
    page.getByRole('heading', { level: 2 }).allTextContents(),
  ).resolves.toEqual(['AI Coach', 'Connected apps']);
  await expect(
    page.getByLabel('Command that adds Habits+ to Claude Code'),
  ).toContainText('claude mcp add --transport http habits-plus');

  await page.reload();
  await expect(
    tabs.getByRole('link', { name: 'AI & apps' }),
  ).toHaveAttribute('aria-current', 'page');
});

test('sends a signed-out visitor to sign in', async ({ page }) => {
  await page.goto('/account');

  // cspell:disable-next-line
  await page.waitForURL(/\/login\?next=%2Faccount$/);
});

test('deletes the account after confirming the password', async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;

  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('link', { name: 'Account' }).click();
  await page.waitForURL('**/account');

  await page.getByRole('button', { name: 'Delete account' }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete your account?' });
  await dialog.getByLabel('Password').fill('wrong-password');
  await dialog.getByRole('button', { name: 'Delete forever' }).click();
  await expect(dialog.getByText('The password is incorrect.')).toBeVisible();

  await dialog.getByLabel('Password').fill('long-enough');
  await dialog.getByRole('button', { name: 'Delete forever' }).click();
  await page.waitForURL((url) => url.pathname === '/login');
  expect(new URL(page.url()).search).toBe('');

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
