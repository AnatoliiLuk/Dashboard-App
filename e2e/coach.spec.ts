import { expect, test } from '@playwright/test';

// The chat call is stubbed in the browser, so the test needs no API key and
// always gets the same reply. Everything else, including loading the saved
// conversation and creating the accepted habit, goes through the real API.
test('asks the coach and adds the habit it proposes', async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const sent: unknown[] = [];

  await page.route('**/api/coach/chat', async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        reply:
          'Start with two minutes right after you wake up. I put a card below, you can add it from there.',
        truncated: false,
        proposal: {
          name: 'Meditate 2 minutes',
          color: 'violet',
          reason: 'A tiny start is easy to keep.',
        },
      },
    });
  });

  await page.goto('/register');
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('long-enough');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByRole('region', { name: 'Habit calendar' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'AI Coach' }).click();
  await page.waitForURL('**/coach');
  await page
    .getByRole('textbox', { name: 'Message the coach' })
    .fill('I want to start meditating every morning.');
  await page.getByRole('button', { name: 'Send' }).click();

  const log = page.getByRole('log', { name: 'Conversation with the coach' });
  await expect(log.getByText(/Start with two minutes/)).toBeVisible();
  expect(sent).toEqual([
    expect.objectContaining({
      message: 'I want to start meditating every morning.',
      locale: 'en',
    }),
  ]);

  const card = log.getByRole('region', { name: 'Suggested habit' });
  await card.getByRole('button', { name: 'Add habit' }).click();
  await expect(card.getByText('Added to your habits.')).toBeVisible();

  await page.getByRole('link', { name: 'Log habits' }).click();
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Meditate 2 minutes' }),
  ).toBeVisible();
});
