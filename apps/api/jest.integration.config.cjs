const base = require('./jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  displayName: '@habit-tracker/api-integration',
  globalSetup: '<rootDir>/src/integration/global-setup.cjs',
  maxWorkers: 1,
  setupFiles: ['<rootDir>/src/integration/env.setup.cjs'],
  testMatch: ['**/*.integration.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/'],
  testTimeout: 20000,
};
