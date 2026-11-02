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

  await page.getByRole('link', { name: 'Account' }).click();
  await page.waitForURL('**/account');
  await expect(page.getByRole('link', { name: 'Account' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page.getByRole('heading', { level: 2 }).allTextContents(),
  ).resolves.toEqual(['Profile', 'Password', 'AI Coach', 'Danger zone']);

  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('status')).toHaveText('Profile saved.');

  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue('Ada Lovelace');
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
