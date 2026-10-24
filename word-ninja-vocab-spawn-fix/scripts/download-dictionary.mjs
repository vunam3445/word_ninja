import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const dbPath = path.join(dataDir, 'dictionary_en_vi.db');
const attributionPath = path.join(dataDir, 'dictionary-ATTRIBUTION.md');
const sources = [
  ['database', 'https://raw.githubusercontent.com/skypediacode/english-vietnamese-dictionary/main/dictionary_en_vi.db', dbPath],
  ['attribution', 'https://raw.githubusercontent.com/skypediacode/english-vietnamese-dictionary/main/ATTRIBUTION.md', attributionPath],
];

await fs.mkdir(dataDir, { recursive: true });
for (const [label, url, destination] of sources) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(label === 'database' ? 240_000 : 30_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (label === 'database') {
      const signature = Buffer.from(bytes.subarray(0, 16)).toString('binary');
      if (!signature.startsWith('SQLite format 3')) throw new Error('Downloaded file is not an SQLite database.');
      if (bytes.byteLength < 10_000_000) throw new Error(`Database is unexpectedly small (${bytes.byteLength} bytes).`);
    } else if (!Buffer.from(bytes).toString('utf8').includes('CC BY-SA 4.0')) {
      throw new Error('Attribution file does not contain the expected license statement.');
    }
    const temporary = `${destination}.download`;
    await fs.writeFile(temporary, bytes);
    await fs.rename(temporary, destination);
    console.log(`Downloaded ${label}: ${(bytes.byteLength / (1024 * 1024)).toFixed(1)} MiB`);
  } catch (error) {
    throw new Error(`Unable to download offline dictionary ${label} from ${url}: ${error.message}`);
  }
}
