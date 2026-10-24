'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Capacitor package configuration points to the prepared web directory and has a stable app id', () => {
  const config = JSON.parse(read('capacitor.config.json'));
  assert.equal(config.appId, 'com.wordninja.game');
  assert.equal(config.appName, 'Word Ninja');
  assert.equal(config.webDir, 'www');
  assert.equal(config.server.androidScheme, 'https');
});

test('Android workflow downloads licensed offline SQLite data and uploads a built APK', () => {
  const workflow = read('.github/workflows/android-apk.yml');
  assert.match(workflow, /npm run android:dictionary/);
  assert.match(workflow, /npm run android:prepare/);
  assert.match(workflow, /npx cap add android/);
  assert.match(workflow, /assembleDebug/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /app-debug\.apk/);
});

test('Android assets are prepared with local Phaser, sql.js and the full dictionary file', () => {
  const prepare = read('scripts/prepare-android.mjs');
  assert.match(prepare, /phaser\.min\.js/);
  assert.match(prepare, /sql-wasm\.wasm/);
  assert.match(prepare, /dictionary_en_vi\.db/);
  assert.match(prepare, /dictionary-ATTRIBUTION\.md/);
});

test('native Android mode uses bundled vocabulary and exposes offline dictionary search', () => {
  const state = read('public/js/state.js');
  const dictionary = read('public/js/offline-dictionary.js');
  const panels = read('public/js/panels.js');
  assert.match(state, /isOfflineAndroidApp/);
  assert.match(state, /WNOfflineDictionary\.enrich/);
  assert.match(dictionary, /fetch\('data\/dictionary_en_vi\.db'/);
  assert.match(dictionary, /window\.WNOfflineDictionary/);
  assert.match(panels, /Từ điển Anh–Việt ngoại tuyến/);
});
