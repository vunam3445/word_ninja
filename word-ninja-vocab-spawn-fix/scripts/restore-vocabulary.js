'use strict';
const { Pool } = require('pg');
const { loadEnv } = require('./vocabulary-source');
const { createPool, restoreVocabularyBackup } = require('./vocabulary-db-lib');

async function main() {
  loadEnv();
  const arg = process.argv.find(value => value.startsWith('--backup='));
  if (!arg) throw new Error('Cách dùng: npm run restore:vocab -- --backup=wn_vocab_backup_YYYYMMDDhhmmss_xxxxxx');
  const backupName = arg.slice('--backup='.length);
  const pool = createPool(Pool);
  try {
    const result = await restoreVocabularyBackup(pool, backupName);
    console.log(JSON.stringify(result, null, 2));
    console.log('Đã khôi phục chỉ bảng wn_vocab. Một backup an toàn của trạng thái trước khôi phục cũng đã được tạo.');
  } finally { await pool.end(); }
}
main().catch(error => { console.error('Khôi phục từ vựng thất bại:', error.message || error); process.exitCode = 1; });
