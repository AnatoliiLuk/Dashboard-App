#!/usr/bin/env bash
# Notification: show a macOS notification when Claude needs input. No-op elsewhere.
set -uo pipefail

command -v osascript >/dev/null || exit 0

message=$(jq -r '.message // "Claude Code needs your attention"')

osascript \
  -e 'on run argv' \
  -e 'display notification (item 1 of argv) with title "Claude Code" subtitle "Habits+" sound name "Glass"' \
  -e 'end run' \
  "$message" >/dev/null 2>&1

exit 0
