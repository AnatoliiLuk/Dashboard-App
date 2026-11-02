#!/usr/bin/env bash
# PostToolUse (Edit|Write): format the edited file the same way lint-staged does.
# Exit 2 sends ESLint errors back to Claude so it fixes them in the same turn.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"

[ -n "$file" ] && [ -f "$file" ] || exit 0
case "$file" in "$root"/*) ;; *) exit 0 ;; esac
case "$file" in */node_modules/* | */.next/* | */.turbo/*) exit 0 ;; esac

cd "$root" || exit 0
rel="${file#"$root"/}"

case "$rel" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.md | *.yml | *.yaml | *.css)
    node_modules/.bin/prettier --write --log-level warn "$rel" >/dev/null 2>&1
    ;;
esac

case "$rel" in
  apps/web/*.ts | apps/web/*.tsx | apps/web/*.js | apps/web/*.jsx | apps/web/*.mjs)
    if ! out=$(node_modules/.bin/eslint --fix --max-warnings=0 --config apps/web/eslint.config.mjs "$rel" 2>&1); then
      echo "ESLint found problems in $rel:" >&2
      echo "$out" >&2
      exit 2
    fi
    ;;
esac

exit 0
