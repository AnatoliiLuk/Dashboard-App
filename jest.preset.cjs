/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          esModuleInterop: true,
          isolatedModules: true,
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          skipLibCheck: true,
          strict: true,
          target: 'ES2022',
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
};
