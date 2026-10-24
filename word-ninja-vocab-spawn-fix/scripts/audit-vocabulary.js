'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { normalizeWord, lookupDictionarySenses } = require('./vocabulary-import-lib');
const { loadEnv, loadOxford, loadDictionary, loadSenseHints, allOxfordEntries } = require('./vocabulary-source');
const { createPool } = require('./vocabulary-db-lib');
const { evaluateAuditRow } = require('./vocabulary-audit-lib');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports');
const COLUMNS = [
  'english', 'in_oxford_3000', 'oxford_cefr', 'db_meaning_vi', 'db_pos', 'db_cefr', 'db_cefr_source', 'db_source',
  'db_dictionary_word', 'db_dictionary_word_id', 'db_dictionary_sense_id', 'db_dictionary_sense_ids',
  'db_dictionary_meanings_vi', 'db_battle_ready', 'db_needs_manual_review',
  'dictionary_preferred_meaning_vi', 'dictionary_all_meanings_vi', 'dictionary_pos', 'dictionary_word',
  'dictionary_word_id', 'dictionary_sense_id', 'dictionary_sense_ids', 'status', 'needs_manual_review', 'notes',
];
function csvCell(value) {
  const str = value == null ? '' : (typeof value === 'string' ? value : JSON.stringify(value));
  return `"${str.replace(/"/g, '""')}"`;
}
function writeCsv(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [COLUMNS.map(csvCell).join(','), ...rows.map(row => COLUMNS.map(col => csvCell(row[col])).join(','))].join('\r\n') + '\r\n', 'utf8');
}
function decodeJsonb(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : fallback; } catch {} }
  return fallback;
}
async function main() {
  loadEnv();
  const grouped = await loadOxford();
  const oxfordEntries = allOxfordEntries(grouped);
  const oxfordMap = new Map(oxfordEntries.map(row => [row.key, row.cefr]));
  const dictionary = await loadDictionary();
  const hints = loadSenseHints();
  const pool = createPool(Pool);
  try {
    const existence = await pool.query("SELECT to_regclass('public.wn_vocab') AS table_name");
    if (!existence.rows[0]?.table_name) throw new Error('Không tìm thấy public.wn_vocab. Hãy chạy npm run import:vocab trước.');
    const dbResult = await pool.query('SELECT * FROM public.wn_vocab ORDER BY word_key');
    const dbMap = new Map(dbResult.rows.map(row => [normalizeWord(row.word_key || row.word), row]));
    const unionKeys = new Set([...oxfordMap.keys(), ...dbMap.keys()]);
    const report = [];
    for (const key of [...unionKeys].sort()) {
      const dbRowRaw = dbMap.get(key) || null;
      const dbRow = dbRowRaw ? {
        ...dbRowRaw,
        dictionary_sense_ids: decodeJsonb(dbRowRaw.dictionary_sense_ids),
        dictionary_meanings_vi: decodeJsonb(dbRowRaw.dictionary_meanings_vi),
      } : null;
      const candidates = lookupDictionarySenses(dictionary.lookup, key);
      report.push(evaluateAuditRow({ word: key, oxfordCefr: oxfordMap.get(key) || '', dbRow, candidates, senseHints: hints }));
    }
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const csvPath = path.join(REPORT_DIR, `vocabulary-audit-${stamp}.csv`);
    const jsonPath = path.join(REPORT_DIR, `vocabulary-audit-${stamp}.json`);
    writeCsv(csvPath, report);
    const statusCounts = {};
    for (const row of report) statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    const summary = {
      generatedAt: new Date().toISOString(), totalRowsReviewed: report.length,
      oxfordWords: oxfordEntries.length,
      postgresRows: dbResult.rowCount,
      matched: statusCounts.MATCH || 0,
      recordsNeedingManualReview: report.filter(row => row.needs_manual_review).length,
      statusCounts,
      csvReport: path.relative(ROOT, csvPath), jsonReport: path.relative(ROOT, jsonPath),
    };
    fs.writeFileSync(jsonPath, JSON.stringify({ summary, rows: report }, null, 2), 'utf8');
    console.log(JSON.stringify(summary, null, 2));
    console.log('Báo cáo CSV có cột: từ tiếng Anh, nghĩa DB, nghĩa ưu tiên từ SQLite, toàn bộ gloss SQLite, POS, CEFR, nguồn và trạng thái.');
  } finally {
    dictionary.db.close();
    await pool.end();
  }
}
main().catch(error => { console.error('Đối soát từ vựng thất bại:', error.message || error); process.exitCode = 1; });
