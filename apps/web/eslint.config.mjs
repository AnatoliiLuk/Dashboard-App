import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  {
    settings: {
      next: {
        rootDir: 'apps/web',
      },
    },
    rules: {
      'no-nested-ternary': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/dist/**',
    '**/next-env.d.ts',
  ]),
]);

export default eslintConfig;
