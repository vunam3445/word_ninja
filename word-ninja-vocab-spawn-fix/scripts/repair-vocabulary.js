'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// A repair preview is safe by default. Pass --apply to run the same transactional import
// used by import:vocab (with an automatic wn_vocab backup immediately before writing).
const apply = process.argv.includes('--apply');
const args = [path.join(__dirname, 'import-vocabulary.js')];
if (!apply) args.push('--dry-run');
const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
if (result.error) { console.error(result.error.message); process.exit(1); }
process.exit(result.status == null ? 1 : result.status);
