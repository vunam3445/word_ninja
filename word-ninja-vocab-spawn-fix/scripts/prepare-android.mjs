import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public');
const destination = path.join(root, 'www');
const phaserSource = path.join(root, 'node_modules', 'phaser', 'dist', 'phaser.min.js');
const sqlJsSource = path.join(root, 'node_modules', 'sql.js', 'dist');
const dictionarySource = path.join(root, 'data', 'dictionary_en_vi.db');
const attributionSource = path.join(root, 'data', 'dictionary-ATTRIBUTION.md');

async function copyDirectory(from, to) {
  const st = await fs.stat(from).catch(() => null);
  if (!st || !st.isDirectory()) throw new Error(`Source directory does not exist: ${from}`);
  await fs.mkdir(to, { recursive: true });
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) await copyDirectory(src, dst);
    else await fs.copyFile(src, dst);
  }
}

async function requireFile(file, label) {
  const st = await fs.stat(file).catch(() => null);
  if (!st || !st.isFile() || st.size === 0) throw new Error(`${label} is missing. Expected: ${file}`);
  return st;
}

await requireFile(phaserSource, 'Phaser');
await requireFile(path.join(sqlJsSource, 'sql-wasm.js'), 'sql.js JavaScript');
await requireFile(path.join(sqlJsSource, 'sql-wasm.wasm'), 'sql.js WebAssembly');
const dictionaryStat = await requireFile(dictionarySource, 'Full offline English–Vietnamese SQLite dictionary');
await requireFile(attributionSource, 'Dictionary attribution/license file');
if (dictionaryStat.size < 10_000_000) throw new Error('The SQLite dictionary file is unexpectedly small; refusing to package it.');

await fs.rm(destination, { recursive: true, force: true });
await copyDirectory(source, destination);
const vendorDir = path.join(destination, 'vendor');
const dataDir = path.join(destination, 'data');
await fs.mkdir(vendorDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });
await fs.copyFile(phaserSource, path.join(vendorDir, 'phaser.min.js'));
await fs.copyFile(path.join(sqlJsSource, 'sql-wasm.js'), path.join(vendorDir, 'sql-wasm.js'));
await fs.copyFile(path.join(sqlJsSource, 'sql-wasm.wasm'), path.join(vendorDir, 'sql-wasm.wasm'));
await fs.copyFile(dictionarySource, path.join(dataDir, 'dictionary_en_vi.db'));
await fs.copyFile(attributionSource, path.join(dataDir, 'dictionary-ATTRIBUTION.md'));
console.log(`Android web assets prepared in www/ (SQLite dictionary: ${(dictionaryStat.size / (1024 * 1024)).toFixed(1)} MiB).`);
