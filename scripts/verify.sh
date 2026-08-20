#!/usr/bin/env bash
# Runs every check that must pass before a change is allowed to merge or deploy.
# Exits non-zero on the first failing check.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/4  Required files present =="
for f in hypnexis-main.html hypnexis-team.html index.html; do
  if [ ! -f "$f" ]; then
    echo "✖ Missing required file: $f"
    exit 1
  fi
done
echo "✓ All required files present."
echo

echo "== 2/4  HTML validity =="
npx --yes html-validate hypnexis-main.html hypnexis-team.html
echo

echo "== 3/4  Internal links resolve =="
node scripts/check-internal-links.js
echo

echo "== 4/4  Inline JavaScript syntax =="
node scripts/check-inline-js.js
echo

echo "✓ All checks passed."
