import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { e2eDatabaseNameFrom, e2eDatabaseUrl } from './database-url';

export default function globalSetup() {
  const databaseUrl = e2eDatabaseUrl();
  const databaseName = e2eDatabaseNameFrom(databaseUrl);
  const repoRoot = path.resolve(__dirname, '..');
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  adminUrl.search = '';

  const existing = execFileSync(
    'psql',
    [
      adminUrl.toString(),
      '-tAc',
      // cspell:disable-next-line
      `SELECT 1 FROM pg_database WHERE datname = '${databaseName}'`,
    ],
    { encoding: 'utf8' },
  ).trim();

  if (existing !== '1') {
    execFileSync(
      'psql',
      [adminUrl.toString(), '-c', `CREATE DATABASE "${databaseName}"`],
      { stdio: 'inherit' },
    );
  }

  const prismaCli = path.join(repoRoot, 'node_modules/prisma/build/index.js');
  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  const appUrl = new URL(databaseUrl);
  appUrl.search = '';
  execFileSync(
    'psql',
    [
      appUrl.toString(),
      '-c',
      'TRUNCATE TABLE "completions", "habits", "users" RESTART IDENTITY CASCADE',
    ],
    { stdio: 'inherit' },
  );
}

globalSetup();
