/** @type {import('jest').Config} */
module.exports = {
  displayName: '@habit-tracker/web',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
