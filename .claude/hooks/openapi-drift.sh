#!/usr/bin/env bash
# Stop: if API routes or validators changed but openapi.yaml didn't, ask Claude
# to update the contract. Fires once per distinct change so a deliberate
# "no contract change" answer isn't nagged again.
set -uo pipefail

input=$(cat)
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

changed=$(
  {
    git diff --name-only HEAD 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  } | sort -u
)

api=$(grep -E '^apps/api/src/(routes|validators)/.*\.ts$' <<<"$changed" | grep -vE '\.test\.ts$')
[ -n "$api" ] || exit 0
grep -qx 'apps/api/openapi.yaml' <<<"$changed" && exit 0

stamp="$(git rev-parse --git-dir)/claude-hooks/openapi-drift.seen"
hash=$(git diff HEAD -- $api 2>/dev/null | cat - $api | shasum | cut -d' ' -f1)
[ -f "$stamp" ] && [ "$(cat "$stamp")" = "$hash" ] && exit 0
mkdir -p "$(dirname "$stamp")" && echo "$hash" >"$stamp"

{
  echo "API routes/validators changed but apps/api/openapi.yaml did not:"
  sed 's/^/  - /' <<<"$api"
  echo "Update openapi.yaml if the contract changed (paths, bodies, responses, status codes)."
  echo "If it is an internal change with no contract impact, say so and finish."
} >&2
exit 2
