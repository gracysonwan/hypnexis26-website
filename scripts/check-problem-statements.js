#!/usr/bin/env node
/**
 * Checks assets/problem-statements/problem-statements.json before it can go
 * live: valid JSON, every statement has a title, and every "track" matches a
 * real track card (data-track="...") on the home page. A mistake here fails
 * the pull request instead of silently hiding statements on release day.
 * If the file isn't uploaded yet, there's nothing to check.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'assets', 'problem-statements', 'problem-statements.json');
const REL = path.relative(ROOT, FILE);

if (!fs.existsSync(FILE)) {
  console.log(`✓ ${REL} not uploaded yet — nothing to check.`);
  process.exit(0);
}

const html = fs.readFileSync(path.join(ROOT, 'hypnexis-main.html'), 'utf8');
const tracks = [...html.matchAll(/data-track="([^"]+)"/g)].map(m => m[1]);
const text = fs.readFileSync(FILE, 'utf8');
const problems = [];

let data;
try {
  data = JSON.parse(text);
} catch (err) {
  // Turn "position N" into a line number, which is far easier to find.
  const m = /position (\d+)/.exec(err.message);
  const where = m ? ` (around line ${text.slice(0, Number(m[1])).split('\n').length})` : '';
  console.error(`✖ ${REL} is not valid JSON${where}: ${err.message}`);
  // Point at the two most common slips, since newer Node versions don't
  // say where the error is.
  const lineOf = i => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(/,\s*[\]}]/g)) console.error(`  Line ${lineOf(m.index)}: comma before a closing bracket — remove it.`);
  for (const m of text.matchAll(/[}\]"]\s*\n\s*[{"]/g)) console.error(`  Line ${lineOf(m.index)}: looks like a missing comma at the end of this line.`);
  console.error('  Also check for an unescaped " inside text (write it as \\").');
  process.exit(1);
}

const list = Array.isArray(data) ? data : data && data.statements;
if (!Array.isArray(list)) {
  console.error(`✖ ${REL} must contain a "statements" list: { "statements": [ ... ] }`);
  process.exit(1);
}
if (!list.length) problems.push('the "statements" list is empty');

const codes = new Set();
list.forEach((s, i) => {
  const at = `statement #${i + 1}${s && s.title ? ` ("${String(s.title).slice(0, 40)}")` : ''}`;
  if (!s || typeof s !== 'object' || Array.isArray(s)) { problems.push(`${at} is not an object { ... }`); return; }
  if (!tracks.includes(s.track)) problems.push(`${at}: "track" is ${JSON.stringify(s.track)}, must be one of: ${tracks.join(', ')}`);
  if (typeof s.title !== 'string' || !s.title.trim()) problems.push(`${at}: needs a "title"`);
  if (s.description !== undefined && typeof s.description !== 'string') problems.push(`${at}: "description" must be text in quotes`);
  if (s.additional !== undefined && typeof s.additional !== 'boolean') problems.push(`${at}: "additional" must be true or false (no quotes)`);
  if (s.code !== undefined) {
    if (typeof s.code !== 'string' || !s.code.trim()) problems.push(`${at}: "code" must be text in quotes`);
    else if (codes.has(s.code)) problems.push(`${at}: code "${s.code}" is used twice`);
    else codes.add(s.code);
  }
});

if (problems.length) {
  console.error(`✖ ${REL} has ${problems.length} problem(s):`);
  problems.forEach(p => console.error('  - ' + p));
  process.exit(1);
}

const summary = tracks.map(t => {
  const main = list.filter(s => s.track === t && !s.additional).length;
  const extra = list.filter(s => s.track === t && s.additional).length;
  return `${t}: ${main}${extra ? ` + ${extra} additional` : ''}`;
}).join(' · ');
console.log(`✓ ${REL} is valid — ${list.length} statement(s). ${summary}`);
