#!/usr/bin/env node
/**
 * Extracts every inline <script>...</script> block from each HTML file
 * and runs `node --check` against it, so a broken edit inside a <script>
 * tag fails CI instead of silently shipping to production.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

let problems = 0;
let checked = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const scriptRegex = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
  let match;
  let idx = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    const code = match[1].trim();
    if (!code) continue; // skip empty or external (src=) script tags
    idx++;
    checked++;
    const tmpFile = path.join(os.tmpdir(), `check-${path.basename(file)}-${idx}.js`);
    fs.writeFileSync(tmpFile, code);
    try {
      execFileSync('node', ['--check', tmpFile], { stdio: 'pipe' });
    } catch (err) {
      console.error(`✖ ${file} (inline script #${idx}):`);
      console.error(err.stderr.toString());
      problems++;
    } finally {
      fs.unlinkSync(tmpFile);
    }
  }
}

if (problems > 0) {
  console.error(`\n${problems} inline script(s) with syntax errors.`);
  process.exit(1);
} else {
  console.log(`✓ All inline scripts are syntactically valid (checked ${checked} script block(s)).`);
}
