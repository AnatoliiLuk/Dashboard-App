/** @type {import('jest').Config} */
module.exports = {
  displayName: '@habit-tracker/api',
  preset: '../../jest.preset.cjs',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@repo/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@repo/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
};
