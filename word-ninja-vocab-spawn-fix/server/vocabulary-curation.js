'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { normalizeWord } = require('../scripts/vocabulary-import-lib');

const HINTS_PATH = path.resolve(__dirname, '..', 'data', 'vocab-curated-overrides.json');

// Compatibility name retained for callers/tools: these are sense-selection hints only.
// This module deliberately contains no PostgreSQL writes and never returns a gloss to persist.
function loadCuratedOverrides() {
  if (!fs.existsSync(HINTS_PATH)) return new Map();
  const raw = JSON.parse(fs.readFileSync(HINTS_PATH, 'utf8'));
  const hints = new Map();
  for (const [word, entry] of Object.entries(raw || {})) {
    const key = normalizeWord(word);
    const gloss = String(entry?.meaning_vi || '').trim();
    if (key && gloss) hints.set(key, gloss);
  }
  return hints;
}
module.exports = { normalizeWord, loadCuratedOverrides };
