'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const targets = [path.join(root, 'server.js'), path.join(root, 'server'), path.join(root, 'scripts'), path.join(root, 'public', 'js')];
const files = [];
function walk(entry) {
  const st = fs.statSync(entry);
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(entry)) walk(path.join(entry, name));
  } else if (/\.(?:js|mjs|cjs)$/.test(entry)) files.push(entry);
}
for (const t of targets) walk(t);
let failed = false;
for (const file of [...new Set(files)]) {
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) {
    failed = true;
    process.stderr.write(`\nSyntax error: ${path.relative(root, file)}\n${r.stderr || r.stdout}`);
  }
}
if (failed) process.exit(1);
console.log(`Syntax check passed: ${new Set(files).size} JavaScript files.`);
