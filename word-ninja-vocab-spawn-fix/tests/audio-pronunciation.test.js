'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('pronunciation setting is independent, persistent and wired into Settings', () => {
  const sound = read('public/js/sound.js');
  const panels = read('public/js/panels.js');
  assert.match(sound, /PRONUNCIATION_KEY = "wn_auto_pronounce"/);
  assert.match(sound, /localStorage\.getItem\(PRONUNCIATION_KEY\) === "1"/);
  assert.match(sound, /localStorage\.setItem\(PRONUNCIATION_KEY/);
  assert.match(sound, /window\.WNPronunciation = WNPronunciation/);
  assert.match(panels, /Đọc từ tiếng Anh khi trả lời đúng/);
  assert.match(panels, /data-pronounce/);
});

test('only confirmed correct-answer paths request English word pronunciation', () => {
  const battle = read('public/js/battle.js');
  assert.match(battle, /this\.entry = r\.learningEntry \|\| this\.entry;\s*\/\/ Speak only after the server confirms this answer is correct\.\s*window\.WNPronunciation\?\.speak\(this\.entry\?\.w\)/);
  assert.match(battle, /S\.answerOp\(\{ id: e\.id, t: e\.t, lv: e\.lv, w: e\.w,[\s\S]*?window\.WNPronunciation\?\.speak\(e\.w\)/);
});
