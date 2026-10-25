const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const {
  createDictionaryLookup, lookupDictionarySenses, meaningForOxfordWord, collectDictionaryMeanings,
} = require('../scripts/vocabulary-import-lib');
const { buildImportPlan, mapDatabaseVocabularyRow } = require('../scripts/vocabulary-pipeline-lib');
const { evaluateAuditRow } = require('../scripts/vocabulary-audit-lib');
const { toGameVocabulary, PLAYABLE_VOCAB_SQL } = require('../server/vocabulary-api');

function createFixtureDictionary() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE words (id INTEGER PRIMARY KEY, word TEXT NOT NULL, lang_code TEXT NOT NULL);
    CREATE TABLE definitions (id INTEGER PRIMARY KEY, definition TEXT, pos TEXT, sub_pos TEXT, definition_lang TEXT);
    CREATE TABLE word_definitions (id INTEGER PRIMARY KEY, word_id INTEGER NOT NULL, definition_id INTEGER NOT NULL, example TEXT);
    CREATE TABLE pronunciations (id INTEGER PRIMARY KEY, word_id INTEGER NOT NULL, ipa TEXT, region TEXT);
    INSERT INTO words VALUES
      (1,'person','en'), (2,'mum','en'), (3,'mute','en'), (4,'the','en'), (5,'port','en'), (6,'bridge','en'), (7,'person','en'), (8,'quite','en');
    INSERT INTO definitions VALUES
      (10,'ngôi','noun','grammar','vi'),
      (11,'người; con người','noun','','vi'),
      (12,'mẹ; má','noun','','vi'),
      (13,'lặng yên, lặng thinh','adjective','','vi'),
      (14,'mạo từ xác định','determiner','','vi'),
      (15,'cảng','noun','','vi'),
      (16,'cây cầu','noun','','vi'),
      (17,'bắc cầu','verb','','vi'),
      (18,'cá nhân cụ thể','noun','','vi'),
      (19,'Very; much.','adverb','','vi');
    INSERT INTO word_definitions VALUES
      (100,1,10,'The first person singular is a grammatical term.'),
      (101,1,11,'Every person needs water.'),
      (102,2,12,'My mum is at home.'),
      (103,3,13,'The room was mute.'),
      (104,4,14,'The book is here.'),
      (105,5,15,'The port is busy.'),
      (106,6,16,'We crossed the bridge.'),
      (107,6,17,'They bridge the gap.'),
      (108,7,18,'Each person is described in this separate dictionary entry.'),
      (109,8,19,'The answer is quite clear.');
    INSERT INTO pronunciations VALUES
      (1,1,'ˈpɜːsən','bre'), (2,2,'mʌm','bre'), (3,4,'ðə','bre');
  `);
  return { db, lookup: createDictionaryLookup(db) };
}

test('SQLite query binds every gloss to its exact English headword; mum is not given mute meaning', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const mum = lookupDictionarySenses(lookup, 'mum');
  assert.equal(mum.length, 1);
  assert.equal(mum[0].dictionary_word, 'mum');
  assert.equal(mum[0].vi, 'mẹ; má');
  assert.doesNotMatch(mum.map(row => row.vi).join(' '), /lặng yên/);
});

test('person prioritizes everyday noun sense and preserves other true SQLite senses for review', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const senses = lookupDictionarySenses(lookup, 'person');
  const selected = meaningForOxfordWord('person', senses, {});
  assert.equal(selected.meaning_vi, 'người; con người');
  assert.deepEqual(new Set(selected.dictionary_meanings_vi), new Set(['ngôi', 'người; con người']));
  assert.equal(selected.ready, true, 'a clear everyday noun sense may be used while all dictionary senses remain attached');
  assert.equal(selected.needs_manual_review, false);
});

test('polysemy with equally plausible SQLite senses is held for manual review', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const selected = meaningForOxfordWord('bridge', lookupDictionarySenses(lookup, 'bridge'), {});
  assert.ok(['cây cầu', 'bắc cầu'].includes(selected.meaning_vi));
  assert.deepEqual(new Set(selected.dictionary_meanings_vi), new Set(['cây cầu', 'bắc cầu']));
  assert.equal(selected.ready, false);
  assert.equal(selected.needs_manual_review, true);
});

test('duplicate SQLite headword rows keep senses scoped to the selected dictionary word ID', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const candidates = lookupDictionarySenses(lookup, 'person');
  assert.ok(candidates.some(row => row.dictionary_word_id === '1'));
  assert.ok(candidates.some(row => row.dictionary_word_id === '7'));

  const everyday = meaningForOxfordWord('person', candidates, {});
  assert.equal(everyday.dictionary_word_id, '1');
  assert.ok(everyday.dictionary_meanings_vi.includes('người; con người'));
  assert.ok(!everyday.dictionary_meanings_vi.includes('cá nhân cụ thể'));
  assert.ok(everyday.dictionary_sense_ids.every(id => ['100', '101'].includes(id)));

  const secondEntry = meaningForOxfordWord('person', candidates, { person: 'cá nhân cụ thể' });
  assert.equal(secondEntry.dictionary_word_id, '7');
  assert.deepEqual(secondEntry.dictionary_meanings_vi, ['cá nhân cụ thể']);
  assert.deepEqual(secondEntry.dictionary_sense_ids, ['108']);
});

test('sense hints select only an exact SQLite gloss and never provide translation text', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const candidates = lookupDictionarySenses(lookup, 'person');
  const exact = meaningForOxfordWord('person', candidates, { person: 'người; con người' });
  assert.equal(exact.meaning_vi, 'người; con người');
  assert.equal(exact.source, 'skypedia-sqlite+oxford3000');
  assert.equal(exact.ready, true);
  const fake = meaningForOxfordWord('person', candidates, { person: 'người do AI tự dịch' });
  assert.notEqual(fake.meaning_vi, 'người do AI tự dịch');
  assert.ok(candidates.some(candidate => candidate.vi === fake.meaning_vi));
});

test('the uses the determiner gloss, not the separate port headword gloss', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const candidates = lookupDictionarySenses(lookup, 'the');
  const selected = meaningForOxfordWord('the', candidates, { the: 'mạo từ xác định' });
  assert.equal(candidates.length, 1);
  assert.equal(selected.meaning_vi, 'mạo từ xác định');
  assert.equal(selected.pos, 'determiner');
});

test('English-only gloss mislabeled as Vietnamese is never battle-ready', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const candidates = lookupDictionarySenses(lookup, 'quite');
  assert.equal(candidates.length, 1, 'the source row remains inspectable');
  const selected = meaningForOxfordWord('quite', candidates, {});
  assert.equal(selected.meaning_vi, '');
  assert.equal(selected.ready, false);
  assert.equal(selected.needs_manual_review, true);
  assert.equal(selected.source, 'skypedia-sqlite-invalid-vi-gloss');
});

test('untranslated entries remain empty and are never made battle-ready', () => {
  const selected = meaningForOxfordWord('unlisted', [], { unlisted: 'nghĩa giả' });
  assert.equal(selected.meaning_vi, '');
  assert.equal(selected.ready, false);
  assert.equal(selected.source, 'oxford3000-no-dictionary-match');
});

test('import plan links translation/POS/sense IDs to the English key and Oxford CEFR', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const plan = buildImportPlan([
    { word: 'person', key: 'person', cefr: 'A2' },
    { word: 'mum', key: 'mum', cefr: 'A1' },
  ], lookup, { person: 'người; con người' }, new Set(['mum']));
  const person = plan.find(row => row.word_key === 'person');
  const mum = plan.find(row => row.word_key === 'mum');
  assert.equal(person.meaning_vi, 'người; con người');
  assert.equal(person.pos, 'noun');
  assert.equal(person.cefr_level, 'A2');
  assert.equal(person.cefr_source, 'oxford3000-cefr');
  assert.equal(person.dictionary_word, 'person');
  assert.equal(person.dictionary_word_id, '1');
  assert.equal(person.dictionary_sense_id, '101');
  assert.equal(mum.meaning_vi, 'mẹ; má');
  assert.equal(mum.cefr_level, 'A1');
  assert.equal(mum.is_common, true);
  assert.equal(mum.source, 'skypedia-sqlite+oxford3000');
});

test('database-to-game API mapping preserves English, primary meaning, POS, CEFR and all dictionary senses', () => {
  const row = {
    id: 'ox3000_person', word: 'person', word_key: 'person', meaning_vi: 'người; con người',
    definition_en: '', example_en: 'Every person needs water.', example_vi: '', ipa: '/p/', pos: 'noun',
    cefr_level: 'A2', topic: 'oxford3000', is_common: true, battle_ready: true,
    alt_answers: [], dictionary_meanings_vi: ['người; con người', 'ngôi'], source: 'skypedia-sqlite+oxford3000',
  };
  const mapped = mapDatabaseVocabularyRow(row);
  assert.equal(mapped.w, 'person');
  assert.equal(mapped.vi, 'người; con người');
  assert.equal(mapped.pos, 'n');
  assert.equal(mapped.lv, 'A2');
  assert.deepEqual(mapped.meaningsVi, ['người; con người', 'ngôi']);
  assert.deepEqual(toGameVocabulary([row]), [mapped]);
  assert.match(PLAYABLE_VOCAB_SQL, /source='skypedia-sqlite\+oxford3000'/);
  assert.match(PLAYABLE_VOCAB_SQL, /needs_manual_review=FALSE/);
  assert.match(PLAYABLE_VOCAB_SQL, /lower\(trim\(dictionary_word\)\)=word_key/);
});

test('audit flags a current database gloss that does not exist on the SQLite headword', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const row = evaluateAuditRow({
    word: 'mum', oxfordCefr: 'A1', candidates: lookupDictionarySenses(lookup, 'mum'),
    dbRow: { word_key: 'mum', meaning_vi: 'lặng yên, lặng thinh', source: 'legacy-vocabularies', cefr_source: 'unknown', cefr_level: 'A1' },
  });
  assert.equal(row.status, 'MEANING_NOT_IN_SQLITE');
  assert.equal(row.db_meaning_vi, 'lặng yên, lặng thinh');
  assert.equal(row.dictionary_preferred_meaning_vi, 'mẹ; má');
  assert.equal(row.needs_manual_review, true);
});

test('audit verifies dictionary sense IDs, POS and CEFR on a correctly linked PostgreSQL row', (t) => {
  const { db, lookup } = createFixtureDictionary(); t.after(() => db.close());
  const candidates = lookupDictionarySenses(lookup, 'person');
  const base = {
    word_key: 'person', meaning_vi: 'người; con người', pos: 'noun', cefr_level: 'A2',
    cefr_source: 'oxford3000-cefr', source: 'skypedia-sqlite+oxford3000',
    dictionary_word: 'person', dictionary_word_id: '1', dictionary_sense_id: '101',
    dictionary_sense_ids: ['100', '101'], dictionary_meanings_vi: ['ngôi', 'người; con người'],
    battle_ready: true, needs_manual_review: false,
  };
  const ok = evaluateAuditRow({ word: 'person', oxfordCefr: 'A2', candidates, senseHints: { person: 'người; con người' }, dbRow: base });
  assert.equal(ok.status, 'MATCH');

  const wrongSense = evaluateAuditRow({ word: 'person', oxfordCefr: 'A2', candidates, senseHints: { person: 'người; con người' }, dbRow: { ...base, dictionary_sense_id: '100' } });
  assert.equal(wrongSense.status, 'SOURCE_PROVENANCE_MISMATCH');

  const wrongPos = evaluateAuditRow({ word: 'person', oxfordCefr: 'A2', candidates, senseHints: { person: 'người; con người' }, dbRow: { ...base, pos: 'verb' } });
  assert.equal(wrongPos.status, 'POS_MISMATCH');

  const wrongCefr = evaluateAuditRow({ word: 'person', oxfordCefr: 'A2', candidates, senseHints: { person: 'người; con người' }, dbRow: { ...base, cefr_level: 'B1' } });
  assert.equal(wrongCefr.status, 'CEFR_MISMATCH');
});

test('combat API and frontend render the meaning returned from the database question, not a positional list entry', () => {
  const root = path.resolve(__dirname, '..');
  const gameWorld = fs.readFileSync(path.join(root, 'server/game-world.mjs'), 'utf8');
  const battle = fs.readFileSync(path.join(root, 'public/js/battle.js'), 'utf8');
  const ui = fs.readFileSync(path.join(root, 'public/js/ui.js'), 'utf8');
  assert.match(gameWorld, /vi:\s*v\.vi/);
  assert.match(battle, /vi:\s*q\.vi\s*\|\|\s*''/);
  assert.match(ui, /\$\("#bVi"\)\.textContent\s*=\s*e\.vi/);
});


test('vocabulary import rebuilds only wn_vocab and keeps a backup before deleting old rows', () => {
  const root = path.resolve(__dirname, '..');
  const importer = fs.readFileSync(path.join(root, 'scripts/import-vocabulary.js'), 'utf8');
  const backupIndex = importer.indexOf('await createVocabularyBackup(pool)');
  const beginIndex = importer.indexOf("await client.query('BEGIN')", backupIndex);
  const deleteIndex = importer.indexOf("await client.query('DELETE FROM public.wn_vocab')", beginIndex);
  assert.ok(backupIndex >= 0 && beginIndex > backupIndex && deleteIndex > beginIndex);
  assert.match(importer, /await client\.query\('COMMIT'\)/);
  assert.doesNotMatch(importer, /DELETE FROM public\.(wn_users|wn_game_saves|wn_word_progress|wn_combat_sessions)/);
});

test('they and them questions provide distinct grammar hints and masked example context', async () => {
  const { createQuestionDisplayHints, maskExampleForQuestion } = await import('../server/vocabulary-question-display.mjs');
  const they = createQuestionDisplayHints('they', 'They are my friends.');
  const them = createQuestionDisplayHints('them', 'I saw them yesterday.');
  assert.match(they.contextHint, /chủ ngữ/);
  assert.match(them.contextHint, /tân ngữ/);
  assert.equal(they.exampleHint, '_____ are my friends.');
  assert.equal(them.exampleHint, 'I saw _____ yesterday.');
  assert.doesNotMatch(they.exampleHint, /\bthey\b/i);
  assert.doesNotMatch(them.exampleHint, /\bthem\b/i);
  assert.equal(maskExampleForQuestion('We saw them.', 'they'), '');
});
