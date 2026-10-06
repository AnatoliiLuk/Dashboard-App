/** @type {import('jest').Config} */
module.exports = {
  displayName: '@repo/core',
  preset: '../../jest.preset.cjs',
  moduleNameMapper: {
    '^@repo/types$': '<rootDir>/../types/src/index.ts',
  },
};
