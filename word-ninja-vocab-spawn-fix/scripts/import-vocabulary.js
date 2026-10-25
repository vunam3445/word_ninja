'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const {
  ROOT, loadEnv, loadOxford, loadDictionary, loadSenseHints, loadCommonWords, allOxfordEntries,
} = require('./vocabulary-source');
const { createPool, createVocabularyBackup } = require('./vocabulary-db-lib');
const { buildImportPlan } = require('./vocabulary-pipeline-lib');

const DRY_RUN = process.argv.includes('--dry-run');
const COMMON = loadCommonWords();

function changedMeaning(oldRow, next) {
  return String(oldRow?.meaning_vi || '') !== String(next.meaning_vi || '');
}
function comparableJson(value) {
  if (typeof value === 'string') {
    try { return JSON.stringify(JSON.parse(value)); } catch { return value; }
  }
  return JSON.stringify(value == null ? [] : value);
}
function changedProvenance(oldRow, next) {
  const trackedFields = [
    'word', 'definition_en', 'example_en', 'example_vi', 'ipa', 'pos', 'cefr_level', 'cefr_source',
    'topic', 'source', 'dictionary_word', 'dictionary_word_id', 'dictionary_sense_id',
  ];
  if (trackedFields.some(field => String(oldRow?.[field] ?? '') !== String(next[field] ?? ''))) return true;
  if (comparableJson(oldRow?.dictionary_sense_ids) !== comparableJson(next.dictionary_sense_ids || [])) return true;
  if (comparableJson(oldRow?.dictionary_meanings_vi) !== comparableJson(next.dictionary_meanings_vi || [])) return true;
  if (comparableJson(oldRow?.alt_answers) !== comparableJson(next.alt_answers || [])) return true;
  return !!oldRow?.is_common !== !!next.is_common ||
    !!oldRow?.battle_ready !== !!next.battle_ready ||
    !!oldRow?.needs_manual_review !== !!next.needs_manual_review;
}
async function readExisting(pool, entries = null) {
  const exists = await pool.query("SELECT to_regclass('public.wn_vocab') AS table_name");
  if (!exists.rows[0]?.table_name) return new Map();
  // With no entries, read the complete table so the replacement import can report stale
  // rows that no longer belong to Oxford 3000.
  const result = entries
    ? await pool.query('SELECT * FROM public.wn_vocab WHERE word_key=ANY($1::text[])', [entries.map(e => e.word_key)])
    : await pool.query('SELECT * FROM public.wn_vocab');
  return new Map(result.rows.map(row => [row.word_key, row]));
}
async function main() {
  loadEnv();
  const grouped = await loadOxford();
  const entries = allOxfordEntries(grouped);
  const { db, lookup } = await loadDictionary();
  const senseHints = loadSenseHints();
  const plan = buildImportPlan(entries, lookup, senseHints, COMMON);
  db.close();

  const stats = {
    totalOxford: plan.length,
    withDictionaryMeaning: plan.filter(row => !!row.meaning_vi).length,
    withoutDictionaryMeaning: plan.filter(row => !row.meaning_vi).length,
    multipleDictionaryMeanings: plan.filter(row => row.dictionary_meanings_vi.length > 1).length,
    needsManualReview: plan.filter(row => row.needs_manual_review).length,
    commonMarked: plan.filter(row => row.is_common).length,
  };
  const pool = createPool(Pool);
  try {
    if (DRY_RUN) {
      await pool.query('SELECT 1');
      const oldMap = await readExisting(pool);
      const planKeys = new Set(plan.map(row => row.word_key));
      const translationChanged = plan.filter(row => oldMap.has(row.word_key) && changedMeaning(oldMap.get(row.word_key), row)).length;
      const provenanceChanged = plan.filter(row => oldMap.has(row.word_key) && changedProvenance(oldMap.get(row.word_key), row)).length;
      const rowsRemovedByReplacement = [...oldMap.keys()].filter(key => !planKeys.has(key)).length;
      console.log('DRY RUN — không ghi hoặc migrate bất kỳ bảng nào. Import thật sẽ backup rồi thay toàn bộ wn_vocab bằng danh sách Oxford 3000 đã xử lý.');
      console.log(JSON.stringify({ ...stats, existingRows: oldMap.size, rowsToRebuild: plan.length, newOxfordWords: plan.filter(row => !oldMap.has(row.word_key)).length, rowsToRemoveOutsideOxford: rowsRemovedByReplacement, translationChanged, provenanceChanged }, null, 2));
      return;
    }

    // Create/migrate schema first, then back up the vocabulary table. The actual replacement
    // below is a single transaction: if any insert fails, PostgreSQL restores the old table.
    // No user/account/save/progress/combat/equipment table is deleted or rewritten.
    await pool.query(fs.readFileSync(path.join(ROOT, 'server/schema.sql'), 'utf8'));
    const oldMap = await readExisting(pool);
    const planKeys = new Set(plan.map(row => row.word_key));
    const rowsRemovedByReplacement = [...oldMap.keys()].filter(key => !planKeys.has(key)).length;
    const translationChanged = plan.filter(row => oldMap.has(row.word_key) && changedMeaning(oldMap.get(row.word_key), row)).length;
    const provenanceChanged = plan.filter(row => oldMap.has(row.word_key) && changedProvenance(oldMap.get(row.word_key), row)).length;
    const unchanged = plan.filter(row => oldMap.has(row.word_key) && !changedMeaning(oldMap.get(row.word_key), row) && !changedProvenance(oldMap.get(row.word_key), row)).length;
    const backup = await createVocabularyBackup(pool);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('LOCK TABLE public.wn_vocab IN SHARE ROW EXCLUSIVE MODE');
      await client.query('DELETE FROM public.wn_vocab');
      for (const row of plan) {
        const values = [
          row.id, row.word, row.word_key, row.meaning_vi, row.definition_en, row.example_en,
          row.example_vi, row.ipa, row.pos, row.cefr_level, row.cefr_source, row.topic,
          row.is_common, row.battle_ready, row.needs_manual_review, JSON.stringify(row.alt_answers), row.source,
          row.dictionary_word, row.dictionary_word_id, row.dictionary_sense_id,
          JSON.stringify(row.dictionary_sense_ids), JSON.stringify(row.dictionary_meanings_vi),
        ];
        await client.query(`
          INSERT INTO public.wn_vocab
            (id,word,word_key,meaning_vi,definition_en,example_en,example_vi,ipa,pos,cefr_level,cefr_source,topic,
             is_common,battle_ready,needs_manual_review,alt_answers,source,dictionary_word,dictionary_word_id,dictionary_sense_id,
             dictionary_sense_ids,dictionary_meanings_vi,updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17,$18,$19,$20,$21::jsonb,$22::jsonb,NOW())
          ON CONFLICT (word_key) DO UPDATE SET
            word=EXCLUDED.word, meaning_vi=EXCLUDED.meaning_vi,
            definition_en=EXCLUDED.definition_en, example_en=EXCLUDED.example_en,
            example_vi=EXCLUDED.example_vi, ipa=EXCLUDED.ipa, pos=EXCLUDED.pos,
            cefr_level=EXCLUDED.cefr_level, cefr_source=EXCLUDED.cefr_source,
            topic=EXCLUDED.topic, is_common=EXCLUDED.is_common, battle_ready=EXCLUDED.battle_ready,
            needs_manual_review=EXCLUDED.needs_manual_review, alt_answers=EXCLUDED.alt_answers, source=EXCLUDED.source,
            dictionary_word=EXCLUDED.dictionary_word, dictionary_word_id=EXCLUDED.dictionary_word_id,
            dictionary_sense_id=EXCLUDED.dictionary_sense_id,
            dictionary_sense_ids=EXCLUDED.dictionary_sense_ids,
            dictionary_meanings_vi=EXCLUDED.dictionary_meanings_vi, updated_at=NOW()
        `, values);
      }
      await client.query('COMMIT');
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch {}
      throw error;
    } finally { client.release(); }

    console.log(JSON.stringify({
      ...stats,
      previousRows: oldMap.size,
      rowsRebuilt: plan.length,
      rowsRemovedOutsideOxford: rowsRemovedByReplacement,
      meaningsChangedOrCleared: translationChanged,
      provenanceOrMetadataCorrected: provenanceChanged,
      unchangedByComparison: unchanged,
      backupTable: backup.backupName,
      backupRows: backup.rows,
    }, null, 2));
    console.log(`Backup wn_vocab: ${backup.backupName}. Đã thay toàn bộ dữ liệu của riêng wn_vocab bằng ${plan.length} mục Oxford 3000; không xóa/sửa tài khoản, nhân vật, tiến trình, combat session hay trang bị.`);
    console.log('Chạy npm run audit:vocab để xuất báo cáo so sánh PostgreSQL với SQLite.');
  } finally { await pool.end(); }
}
main().catch(err => { console.error('Import từ vựng thất bại:', err.message || err); process.exitCode = 1; });
