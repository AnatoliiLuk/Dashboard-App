import path from 'node:path';

const webRoot = path.join(process.cwd(), 'apps/web');

/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,tsx,js,jsx,mjs,json,md,yml,yaml}': [
    'cspell lint --no-must-find-files --show-suggestions --relative',
    'prettier --write',
  ],
  'apps/web/**/*.{ts,tsx,js,jsx,mjs}': (filenames) => {
    const files = filenames
      .map((filename) => path.relative(webRoot, filename))
      .map((filename) => JSON.stringify(filename))
      .join(' ');

    // Run eslint inside the web workspace so it finds eslint.config.mjs.
    // JSON.stringify keeps route groups like app/(auth)/... safe for the shell.
    return `npm run lint -w @habit-tracker/web -- --fix --max-warnings=0 -- ${files}`;
  },
  '*.css': 'prettier --write',
};
