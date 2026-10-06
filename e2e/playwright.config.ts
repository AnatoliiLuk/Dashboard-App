import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { e2eDatabaseUrl } from './database-url';

const repoRoot = path.resolve(__dirname, '..');
const apiPort = 4100;
const webPort = 3101;
const apiOrigin = `http://localhost:${apiPort}`;
const webOrigin = `http://localhost:${webPort}`;
const databaseUrl = e2eDatabaseUrl();

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  outputDir: path.join(__dirname, 'test-results'),
  reporter: 'list',
  use: {
    baseURL: webOrigin,
    locale: 'en-US',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npx tsx e2e/global-setup.ts && npx tsx apps/api/src/server.ts',
      cwd: repoRoot,
      url: `${apiOrigin}/health`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        PORT: String(apiPort),
        DATABASE_URL: databaseUrl,
        CORS_ORIGINS: webOrigin,
        NODE_ENV: 'test',
      },
    },
    {
      command: `npx next dev --port ${webPort}`,
      cwd: path.join(repoRoot, 'apps/web'),
      url: webOrigin,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: `${apiOrigin}/api`,
        NEXT_DIST_DIR: '.next-e2e',
      },
    },
  ],
});
