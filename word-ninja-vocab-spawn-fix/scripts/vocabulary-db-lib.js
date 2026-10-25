'use strict';
const crypto = require('node:crypto');

function quoteIdent(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}
function createPool(Pool) {
  return new Pool({
    host: process.env.PGHOST || '127.0.0.1',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'word_ninja',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: String(process.env.PGSSL || 'false').toLowerCase() === 'true' ? { rejectUnauthorized: true } : false,
    max: 4,
    connectionTimeoutMillis: 8000,
  });
}
async function createVocabularyBackup(pool) {
  const check = await pool.query("SELECT to_regclass('public.wn_vocab') AS table_name");
  if (!check.rows[0]?.table_name) throw new Error('Không tìm thấy bảng public.wn_vocab để sao lưu.');
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const backupName = `wn_vocab_backup_${stamp}_${crypto.randomBytes(3).toString('hex')}`;
  const backup = `public.${quoteIdent(backupName)}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TABLE ${backup} (LIKE public.wn_vocab INCLUDING ALL)`);
    const copied = await client.query(`INSERT INTO ${backup} SELECT * FROM public.wn_vocab`);
    await client.query('COMMIT');
    return { backupName, rows: copied.rowCount };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally { client.release(); }
}
async function listColumns(pool, tableName) {
  const result = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position
  `, [tableName]);
  return result.rows.map(row => row.column_name);
}
async function restoreVocabularyBackup(pool, backupName) {
  if (!/^wn_vocab_backup_[0-9]{14}_[a-f0-9]{6}$/.test(String(backupName || ''))) {
    throw new Error('Tên backup không hợp lệ. Dùng đúng tên wn_vocab_backup_... do script import đã in ra.');
  }
  const exists = await pool.query('SELECT to_regclass($1) AS table_name', [`public.${backupName}`]);
  if (!exists.rows[0]?.table_name) throw new Error(`Không tìm thấy backup public.${backupName}.`);
  const safety = await createVocabularyBackup(pool);
  const targetCols = await listColumns(pool, 'wn_vocab');
  const backupCols = await listColumns(pool, backupName);
  const commonCols = targetCols.filter(c => backupCols.includes(c));
  if (!commonCols.includes('word_key') || !commonCols.includes('meaning_vi')) throw new Error('Backup thiếu các cột từ vựng bắt buộc.');
  const cols = commonCols.map(quoteIdent).join(', ');
  const backup = `public.${quoteIdent(backupName)}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE public.wn_vocab IN EXCLUSIVE MODE');
    await client.query('DELETE FROM public.wn_vocab');
    await client.query(`INSERT INTO public.wn_vocab (${cols}) SELECT ${cols} FROM ${backup}`);
    await client.query('COMMIT');
    return { restoredFrom: backupName, safetyBackup: safety.backupName };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally { client.release(); }
}
module.exports = { quoteIdent, createPool, createVocabularyBackup, listColumns, restoreVocabularyBackup };
