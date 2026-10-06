/** @type {import('lint-staged').Configuration} */
export default {
  // Match lxp-frontend-monorepo: eslint + cspell + prettier on staged JS/TS.
  // Scope eslint to apps/web (only package with an ESLint config today).
  'apps/web/**/*.{ts,tsx,js,jsx,mjs}': [
    'eslint --fix --max-warnings=0 --config apps/web/eslint.config.mjs',
    'cspell lint --no-must-find-files --show-suggestions --relative',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml,css}': [
    'cspell lint --no-must-find-files --show-suggestions --relative',
    'prettier --write',
  ],
  // API / packages: format + spellcheck only until they get their own ESLint config.
  'apps/api/**/*.{ts,tsx,js,jsx,mjs}': [
    'cspell lint --no-must-find-files --show-suggestions --relative',
    'prettier --write',
  ],
  'packages/**/*.{ts,tsx,js,jsx,mjs}': [
    'cspell lint --no-must-find-files --show-suggestions --relative',
    'prettier --write',
  ],
};
