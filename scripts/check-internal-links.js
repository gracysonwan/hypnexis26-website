#!/usr/bin/env node
/**
 * Verifies every internal href="*.html" reference in the site's HTML files
 * actually points to a file that exists in the repo.
 *
 * This exists because of a real bug we hit: a nav link on one page pointed
 * to a filename that didn't exist under the project's naming scheme. This
 * script makes that class of bug impossible to merge silently again.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

let problems = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const hrefRegex = /href="([^"]+\.html)"/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const target = match[1];
    // Skip absolute URLs (external links) — only check same-repo relative links
    if (/^https?:\/\//i.test(target)) continue;
    const targetPath = path.join(ROOT, target);
    if (!fs.existsSync(targetPath)) {
      console.error(`✖ ${file}: links to "${target}", which does not exist in the repo`);
      problems++;
    }
  }
}

if (problems > 0) {
  console.error(`\n${problems} broken internal link(s) found.`);
  process.exit(1);
} else {
  console.log(`✓ All internal .html links resolve to real files (checked ${htmlFiles.length} file(s)).`);
}
