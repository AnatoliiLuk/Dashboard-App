#!/usr/bin/env bash
# Stop: typecheck every workspace with uncommitted TypeScript changes.
# Exit 2 keeps Claude working until the errors are fixed.
set -uo pipefail

input=$(cat)
# Already continuing because of this hook: don't loop forever.
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

changed=$(
  {
    git diff --name-only HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | grep -E '\.(ts|tsx)$' | sort -u
)
[ -n "$changed" ] || exit 0

workspaces=$(
  grep -oE '^(apps|packages)/[^/]+' <<<"$changed" | sort -u |
    while read -r dir; do
      [ -f "$dir/package.json" ] && jq -r '.name' "$dir/package.json"
    done
)
[ -n "$workspaces" ] || exit 0

filters=()
for ws in $workspaces; do filters+=("--filter=$ws"); done

if ! out=$(node_modules/.bin/turbo run typecheck "${filters[@]}" --output-logs=errors-only 2>&1); then
  echo "Typecheck failed for: $(tr '\n' ' ' <<<"$workspaces")" >&2
  grep -E 'error TS|ERROR' <<<"$out" | head -40 >&2
  exit 2
fi

exit 0
