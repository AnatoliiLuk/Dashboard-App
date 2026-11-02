#!/usr/bin/env bash
# Stop: run the Jest unit tests related to uncommitted .ts/.tsx changes.
# Integration tests (need Postgres) and e2e are left to `npm test` / CI.
# Exit 2 keeps Claude working until the tests pass.
set -uo pipefail

input=$(cat)
# Already continuing because of this hook: don't loop forever.
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

changed=$(
  {
    git diff --name-only HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | grep -E '^(apps/(api|web)|packages/core)/.*\.(ts|tsx)$' |
    grep -vE '\.integration\.test\.ts$' | sort -u
)
[ -n "$changed" ] || exit 0

# Skip when nothing changed since the last passing run.
stamp="$(git rev-parse --git-dir)/claude-hooks/related-tests.pass"
hash=$(
  while read -r f; do
    [ -f "$f" ] && { echo "$f"; cat "$f"; }
  done <<<"$changed" | shasum | cut -d' ' -f1
)
[ -f "$stamp" ] && [ "$(cat "$stamp")" = "$hash" ] && exit 0

failed=""
for ws in apps/api apps/web packages/core; do
  files=$(grep "^$ws/" <<<"$changed" | while read -r f; do [ -f "$f" ] && echo "$root/$f"; done)
  [ -n "$files" ] || continue

  args=()
  while read -r f; do args+=("$f"); done <<<"$files"

  if ! out=$(cd "$ws" && "$root/node_modules/.bin/jest" --findRelatedTests "${args[@]}" --passWithNoTests --silent 2>&1); then
    failed="$failed $ws"
    echo "Related tests failed in $ws:" >&2
    grep -E '●|FAIL|Expected|Received|Tests:' <<<"$out" | head -40 >&2
  fi
done

if [ -n "$failed" ]; then
  exit 2
fi

mkdir -p "$(dirname "$stamp")" && echo "$hash" >"$stamp"
exit 0
