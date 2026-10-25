'use strict';
// Migrate existing rows from the legacy server's public.vocabularies table into the
// current game's wn_vocab table. This is intentionally read-only against the old DB.
// Source connection defaults match server.zip's postgres.ts; override with OLD_PG* vars.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const ROOT = path.resolve(__dirname, '..');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || m[1].startsWith('#')) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] == null) process.env[m[1]] = value;
  }
}
loadEnv(path.join(ROOT, '.env'));

const COMMON = new Set(fs.readFileSync(path.join(ROOT, 'data/common-words.txt'), 'utf8')
  .split(/\r?\n/).map(s => s.trim().toLowerCase()).filter(Boolean));
const norm = v => String(v || '').toLowerCase().trim().replace(/\s+/g, ' ');
const cleanCefr = v => ['A1','A2','B1','B2','C1','C2'].includes(String(v || '').trim().toUpperCase()) ? String(v).trim().toUpperCase() : 'A1';
const sourcePool = new Pool({
  host: process.env.OLD_PGHOST || process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.OLD_PGPORT || process.env.DB_PORT || 5433),
  database: process.env.OLD_PGDATABASE || process.env.DB_NAME || 'ninja_english_db',
  user: process.env.OLD_PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.OLD_PGPASSWORD ?? process.env.DB_PASSWORD ?? 'postgres',
  ssl: String(process.env.OLD_PGSSL || 'false').toLowerCase() === 'true' ? { rejectUnauthorized: true } : false,
  max: 2, connectionTimeoutMillis: 8000,
});
const targetPool = new Pool({
  host: process.env.PGHOST || '127.0.0.1', port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'word_ninja', user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  ssl: String(process.env.PGSSL || 'false').toLowerCase() === 'true' ? { rejectUnauthorized: true } : false,
  max: 2, connectionTimeoutMillis: 8000,
});

async function main() {
  let read = 0, inserted = 0, updated = 0, skipped = 0, playable = 0, noMeaning = 0;
  try {
    await targetPool.query(fs.readFileSync(path.join(ROOT, 'server/schema.sql'), 'utf8'));
    const table = await sourcePool.query(`
      SELECT table_schema FROM information_schema.tables
      WHERE table_name='vocabularies' AND table_type='BASE TABLE'
      ORDER BY CASE WHEN table_schema='public' THEN 0 ELSE 1 END LIMIT 1`);
    if (!table.rowCount) throw new Error('Không tìm thấy bảng vocabularies trong database nguồn. Kiểm tra OLD_PGDATABASE/OLD_PGPORT.');
    const schema = table.rows[0].table_schema;
    const colsResult = await sourcePool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name='vocabularies'`, [schema]);
    const cols = new Set(colsResult.rows.map(r => r.column_name));
    for (const required of ['word', 'meaning_vi']) if (!cols.has(required)) throw new Error(`Bảng ${schema}.vocabularies thiếu cột ${required}.`);
    const safeSchema = schema.replace(/"/g, '""');
    const rows = await sourcePool.query(`SELECT * FROM "${safeSchema}"."vocabularies" ORDER BY ${cols.has('id') ? 'id' : 'word'}`);
    read = rows.rowCount;
    console.log(`Nguồn: ${process.env.OLD_PGDATABASE || process.env.DB_NAME || 'ninja_english_db'} (${schema}.vocabularies), ${read} dòng.`);
    const client = await targetPool.connect();
    try {
      await client.query('BEGIN');
      for (const row of rows.rows) {
        const word = String(row.word || '').trim();
        const key = norm(word);
        if (!key || key.length > 120 || !/^[a-z][a-z '\-]*[a-z]$|^[a-z]$/i.test(key)) { skipped++; continue; }
        const rawMeaning = String(row.meaning_vi || '').trim();
        // The old importer used these placeholders for words it could not translate.
        const meaning = (!rawMeaning || /^\(Oxford 3000\)/i.test(rawMeaning) || norm(rawMeaning) === key) ? '' : rawMeaning;
        const cefr = cleanCefr(row.level_cefr);
        const topic = String(row.topic || 'legacy-import').trim().slice(0, 80) || 'legacy-import';
        const id = 'legacy_' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 32);
        const common = COMMON.has(key);
        if (meaning) playable++; else noMeaning++;
        const values = [id, word, key, meaning, String(row.en_definition || '').trim(), String(row.example_en || '').trim(), String(row.example_vi || '').trim(), String(row.phonetic || '').trim(), String(row.part_of_speech || '').trim(), cefr, topic, common, !!meaning, '[]', 'legacy-vocabularies'];
        const result = await client.query(`
          INSERT INTO wn_vocab
            (id,word,word_key,meaning_vi,definition_en,example_en,example_vi,ipa,pos,cefr_level,topic,is_common,battle_ready,alt_answers,source,updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,NOW())
          ON CONFLICT (word_key) DO UPDATE SET
            meaning_vi=CASE WHEN wn_vocab.meaning_vi='' AND EXCLUDED.meaning_vi<>'' THEN EXCLUDED.meaning_vi ELSE wn_vocab.meaning_vi END,
            definition_en=CASE WHEN wn_vocab.definition_en='' THEN EXCLUDED.definition_en ELSE wn_vocab.definition_en END,
            example_en=CASE WHEN wn_vocab.example_en='' THEN EXCLUDED.example_en ELSE wn_vocab.example_en END,
            example_vi=CASE WHEN wn_vocab.example_vi='' THEN EXCLUDED.example_vi ELSE wn_vocab.example_vi END,
            ipa=CASE WHEN wn_vocab.ipa='' THEN EXCLUDED.ipa ELSE wn_vocab.ipa END,
            pos=CASE WHEN wn_vocab.pos='' THEN EXCLUDED.pos ELSE wn_vocab.pos END,
            cefr_level=CASE WHEN wn_vocab.source='wordninja-curated' THEN wn_vocab.cefr_level ELSE EXCLUDED.cefr_level END,
            is_common=wn_vocab.is_common OR EXCLUDED.is_common,
            battle_ready=CASE WHEN wn_vocab.source='wordninja-curated' THEN wn_vocab.battle_ready ELSE
              (CASE WHEN wn_vocab.meaning_vi='' OR wn_vocab.meaning_vi LIKE '(Oxford 3000)%' OR lower(wn_vocab.meaning_vi)=lower(wn_vocab.word)
                    THEN EXCLUDED.meaning_vi ELSE wn_vocab.meaning_vi END <> '') END,
            source=CASE WHEN wn_vocab.source IN ('wordninja-curated','oxford3000+skypedia-en-vi') THEN wn_vocab.source ELSE EXCLUDED.source END,
            updated_at=NOW()
          RETURNING (xmax=0) AS was_inserted`, values);
        if (result.rows[0]?.was_inserted) inserted++; else updated++;
      }
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
    const stats = await targetPool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE battle_ready AND meaning_vi<>'')::int AS playable, COUNT(*) FILTER (WHERE is_common AND battle_ready)::int AS common FROM wn_vocab`);
    console.log('\nHoàn tất chuyển từ vựng:');
    console.log(JSON.stringify({ sourceRows: read, inserted, matchedExisting: updated, skipped, sourceRowsWithMeaning: playable, sourceRowsWithoutMeaning: noMeaning, target: stats.rows[0] }, null, 2));
    console.log('Lưu ý: từ không có nghĩa tiếng Việt được giữ trong DB nhưng battle_ready=false nên không xuất hiện khi đánh quái.');
  } finally { await Promise.allSettled([sourcePool.end(), targetPool.end()]); }
}
main().catch(e => { console.error('\nChuyển từ vựng thất bại:', e.message || e); process.exitCode = 1; });
