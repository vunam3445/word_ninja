'use strict';
const crypto = require('node:crypto');
const { meaningForOxfordWord, normalizeWord, lookupDictionarySenses } = require('./vocabulary-import-lib');

function buildImportPlan(entries, lookup, senseHints, commonWords = new Set()) {
  return entries.map(({ word, key, cefr }) => {
    const candidates = lookupDictionarySenses(lookup, key);
    const selected = meaningForOxfordWord(key, candidates, senseHints);
    // Pronunciation must come from the selected dictionary entry, not another duplicate
    // headword row with the same spelling. If that entry has no IPA, keep it blank.
    const ipaCandidate = selected.dictionary_word_id
      ? candidates.find(c => String(c.dictionary_word_id) === selected.dictionary_word_id && String(c.ipa || '').trim())
      : null;
    const ipa = String((ipaCandidate || {}).ipa || '').trim();
    const id = `ox3000_${crypto.createHash('sha1').update(key).digest('hex').slice(0, 32)}`;
    return {
      id, word, word_key: key, meaning_vi: selected.meaning_vi,
      definition_en: '', example_en: selected.example_en, example_vi: '', ipa, pos: selected.pos,
      cefr_level: cefr, cefr_source: 'oxford3000-cefr', topic: 'oxford3000',
      is_common: commonWords.has(key), battle_ready: !!selected.ready,
      needs_manual_review: !!selected.needs_manual_review,
      alt_answers: [], source: selected.source,
      dictionary_word: selected.dictionary_word,
      dictionary_word_id: selected.dictionary_word_id,
      dictionary_sense_id: selected.dictionary_sense_id,
      dictionary_sense_ids: selected.dictionary_sense_ids,
      dictionary_meanings_vi: selected.dictionary_meanings_vi,
    };
  });
}
function mapDatabaseVocabularyRow(row) {
  const parseJsonArray = value => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') { try { const result = JSON.parse(value); return Array.isArray(result) ? result : []; } catch {} }
    return [];
  };
  const posRaw = String(row.pos || '').trim().toLowerCase().replace(/[.]$/, '');
  const posAliases = {
    n: 'n', noun: 'n', 'proper noun': 'n', v: 'v', verb: 'v', 'phrasal verb': 'phrasal verb',
    adj: 'adj', adjective: 'adj', adv: 'adv', adverb: 'adv', pronoun: 'pronoun',
    preposition: 'preposition', determiner: 'determiner', conjunction: 'conjunction',
    interjection: 'interjection', 'auxiliary verb': 'v', 'modal verb': 'v', phrase: 'phrase',
  };
  const alt = parseJsonArray(row.alt_answers);
  return {
    id: String(row.id), w: String(row.word), word_key: normalizeWord(row.word_key || row.word),
    vi: String(row.meaning_vi || ''), meaningsVi: parseJsonArray(row.dictionary_meanings_vi),
    def: String(row.definition_en || ''), ex: String(row.example_en || ''), exVi: String(row.example_vi || ''),
    ipa: String(row.ipa || ''), pos: posAliases[posRaw] || posRaw, lv: String(row.cefr_level || ''),
    t: String(row.topic || 'oxford3000'), isCommon: !!row.is_common, ready: !!row.battle_ready,
    alt, source: String(row.source || ''),
  };
}
module.exports = { buildImportPlan, mapDatabaseVocabularyRow };
