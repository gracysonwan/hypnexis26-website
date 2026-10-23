#!/usr/bin/env bash
# Runs every check that must pass before a change is allowed to merge or deploy.
# Exits non-zero on the first failing check.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/5  Required files present =="
for f in hypnexis-main.html hypnexis-team.html index.html; do
  if [ ! -f "$f" ]; then
    echo "✖ Missing required file: $f"
    exit 1
  fi
done
echo "✓ All required files present."
echo

echo "== 2/5  HTML validity =="
npx --yes html-validate hypnexis-main.html hypnexis-team.html
echo

echo "== 3/5  Internal links resolve =="
node scripts/check-internal-links.js
echo

echo "== 4/5  Inline JavaScript syntax =="
node scripts/check-inline-js.js
echo

echo "== 5/5  Problem statements file =="
node scripts/check-problem-statements.js
echo

echo "✓ All checks passed."
