import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (!fs.existsSync(manifestPath)) {
  throw new Error('AndroidManifest.xml not found. Run npx cap add android first.');
}
let xml = fs.readFileSync(manifestPath, 'utf8');
const activity = /<activity\b(?=[^>]*android:name="[^"]*MainActivity")[^>]*>/s;
const match = xml.match(activity);
if (!match) throw new Error('Could not locate the Capacitor MainActivity declaration.');
let tag = match[0];
if (/android:screenOrientation=/.test(tag)) {
  tag = tag.replace(/android:screenOrientation="[^"]*"/, 'android:screenOrientation="landscape"');
} else {
  tag = tag.replace(/\s*\/?\s*>$/, ' android:screenOrientation="landscape">');
}
xml = xml.replace(match[0], tag);
fs.writeFileSync(manifestPath, xml);
console.log('Configured MainActivity to stay in landscape orientation.');
