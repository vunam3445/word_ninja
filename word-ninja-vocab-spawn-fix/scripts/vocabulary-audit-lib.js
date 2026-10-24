'use strict';
const {
  normalizeWord, normalizeMeaning, selectDictionaryEntryCandidates,
  collectDictionaryMeanings, meaningForOxfordWord,
} = require('./vocabulary-import-lib');
const SOURCE = 'skypedia-sqlite+oxford3000';
function equivalentMeaning(a, b) {
  const clean = value => normalizeMeaning(value).replace(/[\s.,;:!?，。；：！？]+$/u, '');
  return !!clean(a) && clean(a) === clean(b);
}
function sameArray(a, b, normalize = value => String(value)) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const left = a.map(normalize).sort();
  const right = b.map(normalize).sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function evaluateAuditRow({ word, oxfordCefr = '', dbRow = null, candidates = [], senseHints = {} }) {
  const key = normalizeWord(word || dbRow?.word_key || dbRow?.word);
  const hint = senseHints && senseHints[key];
  const selectedEntry = selectDictionaryEntryCandidates(key, candidates, hint);
  const valid = selectedEntry.candidates;
  const meanings = collectDictionaryMeanings(key, valid, hint);
  const expected = meaningForOxfordWord(key, candidates, senseHints);
  const current = String(dbRow?.meaning_vi || '').trim();
  const currentSourceMatch = meanings.find(meaning => equivalentMeaning(current, meaning)) || '';
  const currentIsPreferred = equivalentMeaning(current, expected.meaning_vi);
  const rowExists = !!dbRow;
  const isOxford = !!oxfordCefr;
  const currentCandidates = valid.filter(candidate => equivalentMeaning(current, candidate.vi));
  const currentCandidate = currentCandidates.find(candidate =>
    String(candidate.dictionary_sense_id || '') === String(dbRow?.dictionary_sense_id || '') &&
    String(candidate.dictionary_word_id || '') === String(dbRow?.dictionary_word_id || '')
  ) || currentCandidates[0] || null;
  const dbSenseIds = Array.isArray(dbRow?.dictionary_sense_ids) ? dbRow.dictionary_sense_ids : [];
  const dbMeanings = Array.isArray(dbRow?.dictionary_meanings_vi) ? dbRow.dictionary_meanings_vi : [];
  const sourceProvenanceMatch = rowExists && dbRow.source === SOURCE &&
    dbRow.cefr_source === 'oxford3000-cefr' &&
    normalizeWord(dbRow.dictionary_word || '') === key &&
    !!dbRow.dictionary_word_id && !!dbRow.dictionary_sense_id &&
    !!currentCandidate &&
    String(dbRow.dictionary_word_id) === String(currentCandidate.dictionary_word_id) &&
    String(dbRow.dictionary_sense_id) === String(currentCandidate.dictionary_sense_id) &&
    sameArray(dbSenseIds, expected.dictionary_sense_ids || []) &&
    sameArray(dbMeanings, expected.dictionary_meanings_vi || [], normalizeMeaning);
  let status;
  const notes = [];

  if (isOxford && !rowExists) {
    status = 'MISSING_DB_ROW'; notes.push('Có trong Oxford 3000 nhưng chưa có bản ghi PostgreSQL.');
  } else if (!valid.length && current) {
    status = 'MEANING_WITHOUT_DICTIONARY_ENTRY'; notes.push('DB có nghĩa nhưng SQLite không trả nghĩa Việt hợp lệ cho đúng headword.');
  } else if (!valid.length && isOxford) {
    status = 'NO_DICTIONARY_MEANING'; notes.push('Không tìm thấy nghĩa Việt hợp lệ; không được tự tạo nghĩa.');
  } else if (rowExists && !current) {
    status = 'MISSING_DB_MEANING'; notes.push('Bản ghi DB chưa có nghĩa Việt.');
  } else if (rowExists && current && !currentSourceMatch) {
    status = 'MEANING_NOT_IN_SQLITE'; notes.push('Nghĩa hiện tại không khớp gloss nào trên đúng headword/mục từ trong SQLite.');
  } else if (rowExists && current && !sourceProvenanceMatch) {
    status = 'SOURCE_PROVENANCE_MISMATCH'; notes.push('Headword ID, sense ID, toàn bộ gloss hoặc dấu nguồn SQLite/Oxford trong DB không khớp nguồn hiện tại.');
  } else if (isOxford && rowExists && String(dbRow.cefr_level || '').toUpperCase() !== String(oxfordCefr).toUpperCase()) {
    status = 'CEFR_MISMATCH'; notes.push(`CEFR DB=${dbRow.cefr_level || ''}, Oxford=${oxfordCefr}.`);
  } else if (rowExists && currentIsPreferred && String(dbRow.pos || '').trim() !== String(expected.pos || '').trim()) {
    status = 'POS_MISMATCH'; notes.push(`POS DB=${dbRow.pos || ''}, SQLite=${expected.pos || ''}.`);
  } else if (rowExists && current && !currentIsPreferred) {
    status = 'ALTERNATE_DICTIONARY_SENSE'; notes.push('Nghĩa có tồn tại trong SQLite nhưng khác sense ưu tiên theo bộ chọn hiện tại; cần rà soát.');
  } else if (rowExists && !!dbRow.battle_ready !== !!expected.ready) {
    status = 'BATTLE_READY_MISMATCH'; notes.push(`battle_ready DB=${!!dbRow.battle_ready}, dự kiến=${!!expected.ready}.`);
  } else if (rowExists && !!dbRow.needs_manual_review !== !!expected.needs_manual_review) {
    status = 'REVIEW_FLAG_MISMATCH'; notes.push(`needs_manual_review DB=${!!dbRow.needs_manual_review}, dự kiến=${!!expected.needs_manual_review}.`);
  } else if (!isOxford && rowExists) {
    status = 'NOT_IN_OXFORD_3000'; notes.push('Bản ghi ngoài Oxford 3000; không được dùng cho câu hỏi chiến đấu authoritative.');
  } else if (expected.needs_manual_review) {
    status = 'AMBIGUOUS_DICTIONARY_SENSE'; notes.push('Có các nghĩa SQLite gần ngang điểm và chưa có gợi ý chọn sense khớp chính xác gloss nguồn.');
  } else {
    status = 'MATCH';
  }

  return {
    english: key,
    in_oxford_3000: isOxford,
    oxford_cefr: oxfordCefr,
    db_meaning_vi: current,
    db_pos: String(dbRow?.pos || ''),
    db_cefr: String(dbRow?.cefr_level || ''),
    db_cefr_source: String(dbRow?.cefr_source || ''),
    db_source: String(dbRow?.source || ''),
    db_dictionary_word: String(dbRow?.dictionary_word || ''),
    db_dictionary_word_id: String(dbRow?.dictionary_word_id || ''),
    db_dictionary_sense_id: String(dbRow?.dictionary_sense_id || ''),
    db_dictionary_sense_ids: dbSenseIds,
    db_dictionary_meanings_vi: dbMeanings,
    db_battle_ready: !!dbRow?.battle_ready,
    db_needs_manual_review: !!dbRow?.needs_manual_review,
    dictionary_preferred_meaning_vi: expected.meaning_vi,
    dictionary_all_meanings_vi: meanings,
    dictionary_pos: String(expected.pos || ''),
    dictionary_word: String(expected.dictionary_word || ''),
    dictionary_word_id: String(expected.dictionary_word_id || ''),
    dictionary_sense_id: String(expected.dictionary_sense_id || ''),
    dictionary_sense_ids: expected.dictionary_sense_ids || [],
    status,
    needs_manual_review: (status !== 'MATCH' && status !== 'NOT_IN_OXFORD_3000') || expected.needs_manual_review,
    notes: notes.join(' '),
  };
}
module.exports = { SOURCE, equivalentMeaning, sameArray, evaluateAuditRow };
