const { execFileSync } = require('node:child_process');
const path = require('node:path');

module.exports = async function globalSetup() {
  require('./env.setup.cjs');

  const repoRoot = path.resolve(__dirname, '../../../..');
  const databaseUrl = new URL(process.env.DATABASE_URL);
  const databaseName = databaseUrl.pathname.slice(1);
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
    env: process.env,
    stdio: 'inherit',
  });
};
