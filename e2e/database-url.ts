import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const e2eDatabaseName = 'habit_tracker_e2e';

export function e2eDatabaseUrl(): string {
  const configured = process.env.E2E_DATABASE_URL || process.env.DATABASE_URL;
  if (!configured) {
    throw new Error('Set DATABASE_URL before running end-to-end tests');
  }
  if (process.env.E2E_DATABASE_URL) {
    return configured;
  }
  const url = new URL(configured);
  url.pathname = `/${e2eDatabaseName}`;
  return url.toString();
}

export function e2eDatabaseNameFrom(databaseUrl: string): string {
  const name = decodeURIComponent(
    new URL(databaseUrl).pathname.replace(/^\//, ''),
  );
  if (name === 'habit_tracker' || name === 'habit_tracker_test') {
    throw new Error(`Refusing to run end-to-end tests against ${name}`);
  }
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(
      'End-to-end database name must be letters, numbers, and underscores',
    );
  }
  return name;
}
