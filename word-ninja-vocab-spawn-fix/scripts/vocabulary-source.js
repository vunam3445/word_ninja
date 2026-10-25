'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { normalizeWord, createDictionaryLookup } = require('./vocabulary-import-lib');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OXFORD_URL = 'https://raw.githubusercontent.com/Kolia951/The_Oxford_3000_CEFR/main/package.txt';
const DICT_URL = 'https://raw.githubusercontent.com/skypediacode/english-vietnamese-dictionary/main/dictionary_en_vi.db';
const OXFORD_CACHE = path.join(DATA, 'oxford-3000-cefr.json');
const DICT_PATH = path.join(DATA, 'dictionary_en_vi.db');
const SENSE_HINTS_PATH = path.join(DATA, 'vocab-curated-overrides.json');
const COMMON_PATH = path.join(DATA, 'common-words.txt');

function loadEnv(envFile = path.join(ROOT, '.env')) {
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || m[1].startsWith('#')) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] == null) process.env[m[1]] = value;
  }
}
function cleanCefr(raw) {
  const result = {};
  for (const cefr of ['A1', 'A2', 'B1', 'B2']) {
    const bucket = Array.isArray(raw?.[cefr]) ? raw[cefr] : [];
    result[cefr] = [...new Set(bucket.map(normalizeWord).filter(w => /^[a-z][a-z '\-]*[a-z]$|^[a-z]$/i.test(w) && w.length <= 55))];
  }
  return result;
}
function validateOxfordBuckets(grouped, options = {}) {
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const { warn = console.warn } = options;
  const levelByWord = new Map();
  const duplicateLevels = new Map();

  // The upstream package occasionally repeats the same headword in multiple buckets.
  // The game needs exactly one CEFR level, so retain the easiest level deterministically.
  for (const cefr of levels) {
    for (const rawWord of grouped[cefr] || []) {
      const key = normalizeWord(rawWord);
      if (!key) continue;
      const previous = levelByWord.get(key);
      if (previous) {
        const all = duplicateLevels.get(key) || new Set([previous]);
        all.add(cefr);
        duplicateLevels.set(key, all);
        continue;
      }
      levelByWord.set(key, cefr);
    }
  }

  const resolved = Object.fromEntries(levels.map(level => [level, []]));
  for (const [word, cefr] of levelByWord) resolved[cefr].push(word);
  if (duplicateLevels.size) {
    const details = [...duplicateLevels.entries()].map(([word, levelsForWord]) => {
      const sorted = [...levelsForWord].sort((a, b) => levels.indexOf(a) - levels.indexOf(b));
      return { word, levels: sorted, selected: sorted[0] };
    });
    warn(`[Oxford CEFR] Found ${details.length} headword(s) in multiple levels. Keeping the easiest level for each: ` +
      details.slice(0, 20).map(item => `"${item.word}" (${item.levels.join('/') } -> ${item.selected})`).join(', ') +
      (details.length > 20 ? ', ...' : ''));
  }
  return resolved;
}
async function download(url, destination) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(180000) });
  if (!res.ok) throw new Error(`Tải dữ liệu thất bại: HTTP ${res.status} từ ${url}`);
  const tmp = destination + '.download';
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(tmp, buffer);
  fs.renameSync(tmp, destination);
  return buffer.length;
}
async function loadOxford() {
  fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(OXFORD_CACHE)) {
    console.log('Downloading Oxford 3000 CEFR list...');
    await download(OXFORD_URL, OXFORD_CACHE);
  }
  let parsed = JSON.parse(fs.readFileSync(OXFORD_CACHE, 'utf8'));
  if (typeof parsed === 'string') parsed = JSON.parse(parsed);
  const grouped = validateOxfordBuckets(cleanCefr(parsed));
  const count = Object.values(grouped).reduce((n, words) => n + words.length, 0);
  if (count < 2500) throw new Error(`Danh sách Oxford không hợp lệ hoặc thiếu dữ liệu (${count} từ).`);
  return grouped;
}
async function loadDictionary() {
  fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(DICT_PATH)) {
    console.log('Downloading English–Vietnamese dictionary SQLite (about 42 MB)...');
    await download(DICT_URL, DICT_PATH);
  }
  const db = new DatabaseSync(DICT_PATH, { readOnly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x => x.name);
  for (const required of ['words', 'definitions', 'word_definitions', 'pronunciations']) {
    if (!tables.includes(required)) { db.close(); throw new Error(`Dictionary SQLite missing table: ${required}`); }
  }
  // Prepare the query once so the importer and audit script use the exact same lookup.
  // If a different/incompatible SQLite file was downloaded or supplied, close it before
  // surfacing the error; never proceed with guessed column names or fallback translations.
  try {
    const lookup = createDictionaryLookup(db);
    return { db, lookup };
  } catch (error) {
    db.close();
    throw new Error(`Không thể chuẩn bị truy vấn từ điển SQLite (schema không tương thích): ${error.message}`);
  }
}
function loadSenseHints() {
  if (!fs.existsSync(SENSE_HINTS_PATH)) return {};
  const raw = JSON.parse(fs.readFileSync(SENSE_HINTS_PATH, 'utf8'));
  const hints = {};
  for (const [word, entry] of Object.entries(raw || {})) {
    const key = normalizeWord(word);
    const gloss = String(entry?.meaning_vi || '').trim();
    // This is intentionally only a preference hint. The import library uses it only if an
    // exact matching gloss exists in SQLite, and always persists the SQLite value itself.
    if (key && gloss) hints[key] = gloss;
  }
  return hints;
}
function loadCommonWords() {
  return new Set(fs.readFileSync(COMMON_PATH, 'utf8').split(/\r?\n/).map(x => normalizeWord(x)).filter(Boolean));
}
function allOxfordEntries(grouped) {
  const entries = [];
  for (const cefr of ['A1', 'A2', 'B1', 'B2']) {
    for (const word of grouped[cefr] || []) entries.push({ word, key: normalizeWord(word), cefr });
  }
  return entries;
}

module.exports = {
  ROOT, DATA, OXFORD_URL, DICT_URL, OXFORD_CACHE, DICT_PATH, loadEnv, cleanCefr,
  validateOxfordBuckets, download, loadOxford, loadDictionary, loadSenseHints,
  loadCommonWords, allOxfordEntries,
};
