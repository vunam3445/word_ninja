'use strict';

// All translation text in this module is copied from the English–Vietnamese SQLite
// dictionary. A preference is only allowed to select an exact gloss already returned by
// that dictionary; it can never supply or overwrite a translation.
function normalizeWord(value) {
  return String(value || '').normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
}
function normalizeMeaning(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}
function hasVietnameseDiacritics(value) {
  return /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(String(value || ''));
}
// Some SQLite rows are incorrectly labelled as Vietnamese even though their gloss is English.
// For game vocabulary, prefer a false negative (hold the word for review) over displaying an
// English definition as Vietnamese. Vietnamese usually carries tone/shape diacritics; permit a
// very small allowlist for common valid unaccented glosses rather than accepting arbitrary ASCII.
const UNACCENTED_VIETNAMESE_GLOSSES = new Set(['ba']);
function hasVietnameseMeaningSignal(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return hasVietnameseDiacritics(text) || UNACCENTED_VIETNAMESE_GLOSSES.has(normalizeMeaning(text));
}
function looksLikeEnglishGloss(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return !!text && !hasVietnameseMeaningSignal(text);
}
function usableVietnameseMeaning(word, value) {
  const vi = String(value || '').replace(/\s+/g, ' ').trim();
  if (!vi || vi.length < 2 || vi.length > 320) return false;
  if (!/[\p{L}]/u.test(vi)) return false;
  if (/^\(Oxford 3000\)/i.test(vi)) return false;
  if (normalizeWord(vi) === normalizeWord(word)) return false;
  if (/^(undefined|null|n\/a|none|unknown)$/i.test(vi)) return false;
  if (/^[\d\W_]+$/u.test(vi)) return false;
  // The SQLite language tag alone is not trustworthy: e.g. quite -> 'Very; much.' was
  // incorrectly tagged as vi in one source row. Never mark a non-Vietnamese gloss playable.
  if (looksLikeEnglishGloss(vi)) return false;
  return true;
}
function normalizeCandidateWord(candidate) {
  return normalizeWord(candidate && (candidate.dictionary_word ?? candidate.word));
}
function belongsToWord(word, candidate) {
  const actual = normalizeCandidateWord(candidate);
  // Real SQLite query results always include dictionary_word. If a caller supplies that
  // field, require an exact normalized match; never associate by row order or array index.
  return !actual || actual === normalizeWord(word);
}
function getValidCandidates(word, candidates) {
  const key = normalizeWord(word);
  return (Array.isArray(candidates) ? candidates : []).filter(candidate =>
    candidate && belongsToWord(key, candidate) && usableVietnameseMeaning(key, candidate.vi)
  );
}
function uniqueBy(values, valueFn) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const k = valueFn(value);
    if (k == null || k === '' || seen.has(String(k))) continue;
    seen.add(String(k));
    result.push(value);
  }
  return result;
}
function selectDictionaryEntryCandidates(word, candidates, preferredGloss = '') {
  const valid = getValidCandidates(word, candidates);
  if (!valid.length) return { picked: null, candidates: [] };
  const picked = selectDictionaryCandidate(word, valid, preferredGloss);
  const pickedWordId = picked && String(picked.dictionary_word_id ?? '');
  const scoped = pickedWordId
    ? valid.filter(candidate => String(candidate.dictionary_word_id ?? '') === pickedWordId)
    : valid;
  return { picked: scoped.find(candidate => candidate === picked) || selectDictionaryCandidate(word, scoped, preferredGloss), candidates: scoped };
}
function collectDictionaryMeanings(word, candidates, preferredGloss = '') {
  const scoped = selectDictionaryEntryCandidates(word, candidates, preferredGloss).candidates;
  return uniqueBy(scoped, c => normalizeMeaning(c.vi))
    .map(c => String(c.vi).replace(/\s+/g, ' ').trim());
}
function looksLikeSpecializedSense(word, candidate) {
  const metadata = `${candidate.sub_pos || ''} ${candidate.example_en || ''}`;
  if (/\b(grammar|grammatical|linguistic|linguistics|phonetic|phonology)\b/i.test(metadata)) return true;
  // In a general-purpose learner, terminology about grammatical person is a less useful
  // primary gloss than the everyday noun. The gloss still remains in dictionary_meanings_vi.
  if (normalizeWord(word) === 'person' && /\b(first|second|third) person\b|\b(person|persons)\s+(singular|plural)\b/i.test(metadata)) return true;
  return false;
}
function candidateScore(word, candidate, index) {
  let score = 0;
  const pos = String(candidate.pos || '').trim().toLowerCase();
  const subPos = String(candidate.sub_pos || '').trim().toLowerCase();
  if (/^(n|noun|v|verb|adj|adjective|adv|adverb|pronoun|preposition|determiner|conjunction|interjection|modal verb|auxiliary verb)$/i.test(pos)) score += 2;
  if (pos || subPos) score += 1;
  if (String(candidate.example_en || '').trim()) score += 0.25;
  if (looksLikeSpecializedSense(word, candidate)) score -= 8;
  // Preserve source ordering as the final tie-breaker; the small penalty does not rank by
  // translation length and cannot promote a gloss from a different headword.
  score -= Math.max(0, index) * 0.001;
  return score;
}
function selectDictionaryCandidate(word, candidates, preferredGloss = '') {
  const valid = getValidCandidates(word, candidates);
  if (!valid.length) return null;

  // Human-reviewed preferences (if present) are selectors, not translation data. They only
  // match when the exact gloss is present on an entry for this exact English headword.
  const wanted = normalizeMeaning(preferredGloss);
  if (wanted) {
    const match = valid.find(c => normalizeMeaning(c.vi) === wanted);
    if (match) return match;
  }

  return valid
    .map((candidate, index) => ({ candidate, score: candidateScore(word, candidate, index), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].candidate;
}
function hasAmbiguousTopMeaning(word, candidates) {
  const ranked = getValidCandidates(word, candidates)
    .map((candidate, index) => ({ candidate, score: candidateScore(word, candidate, index) }))
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return false;
  const best = ranked[0];
  // Polysemy alone is not an error. If metadata clearly distinguishes a common learner
  // sense from a specialist/grammatical sense, use that primary sense and keep all SQLite
  // glosses. Hold back only when a different gloss is nearly tied with the selected sense.
  const competitor = ranked.slice(1).find(item => normalizeMeaning(item.candidate.vi) !== normalizeMeaning(best.candidate.vi));
  return !!competitor && (best.score - competitor.score) < 0.5;
}

function meaningForOxfordWord(word, candidates, senseHints = {}) {
  const key = normalizeWord(word);
  const hintedValue = senseHints && senseHints[key];
  const hint = typeof hintedValue === 'string' ? hintedValue : String(hintedValue?.meaning_vi || '');
  const selectedEntry = selectDictionaryEntryCandidates(key, candidates, hint);
  const valid = selectedEntry.candidates;
  const picked = selectedEntry.picked;
  const senses = collectDictionaryMeanings(key, valid, hint);
  const senseIds = uniqueBy(valid, c => c.dictionary_sense_id ?? c.sense_order)
    .map(c => String(c.dictionary_sense_id ?? c.sense_order));
  if (!picked) {
    const hasExactSourceRows = (Array.isArray(candidates) ? candidates : []).some(candidate =>
      candidate && belongsToWord(key, candidate)
    );
    return {
      meaning_vi: '', definition_en: '', example_en: '', example_vi: '', pos: '', alt_answers: [],
      source: hasExactSourceRows ? 'skypedia-sqlite-invalid-vi-gloss' : 'oxford3000-no-dictionary-match',
      ready: false,
      dictionary_word: '', dictionary_word_id: '', dictionary_sense_id: '',
      dictionary_sense_ids: [], dictionary_meanings_vi: [], needs_manual_review: hasExactSourceRows,
    };
  }
  const preferredHintMatched = !!hint && normalizeMeaning(picked.vi) === normalizeMeaning(hint);
  const needsManualReview = senses.length > 1 && !preferredHintMatched && hasAmbiguousTopMeaning(key, valid);
  return {
    // Crucially, this is always candidate.vi from SQLite, never the hint itself.
    meaning_vi: String(picked.vi || '').replace(/\s+/g, ' ').trim(),
    definition_en: '', // This dictionary query intentionally fetches only vi definitions.
    example_en: String(picked.example_en || '').trim(),
    example_vi: '',
    pos: String(picked.pos || picked.sub_pos || '').trim(),
    alt_answers: [],
    source: 'skypedia-sqlite+oxford3000',
    ready: !needsManualReview,
    dictionary_word: String(picked.dictionary_word || picked.word || key),
    dictionary_word_id: String(picked.dictionary_word_id ?? ''),
    dictionary_sense_id: String(picked.dictionary_sense_id ?? picked.sense_order ?? ''),
    dictionary_sense_ids: senseIds,
    dictionary_meanings_vi: senses,
    needs_manual_review: needsManualReview,
  };
}

const DICTIONARY_LOOKUP_SQL = `
  SELECT w.word AS dictionary_word,
         CAST(w.id AS TEXT) AS dictionary_word_id,
         CAST(wd.id AS TEXT) AS dictionary_sense_id,
         CAST(d.id AS TEXT) AS dictionary_definition_id,
         d.definition AS vi,
         COALESCE(d.pos, '') AS pos,
         COALESCE(d.sub_pos, '') AS sub_pos,
         COALESCE(wd.example, '') AS example_en,
         COALESCE((SELECT p.ipa FROM pronunciations p WHERE p.word_id=w.id
           ORDER BY CASE WHEN lower(COALESCE(p.region,'')) IN ('bre','uk','british','uk english','en-gb') THEN 0
                         WHEN lower(COALESCE(p.region,'')) IN ('ame','us','american','us english','en-us') THEN 1 ELSE 2 END, p.id LIMIT 1), '') AS ipa
  FROM words w
  JOIN word_definitions wd ON wd.word_id=w.id
  JOIN definitions d ON d.id=wd.definition_id
  WHERE lower(trim(w.word))=?
    AND lower(COALESCE(w.lang_code, ''))='en'
    AND lower(COALESCE(d.definition_lang, 'vi'))='vi'
  ORDER BY w.id, wd.id, d.id
`;
function createDictionaryLookup(db) {
  return db.prepare(DICTIONARY_LOOKUP_SQL);
}
function lookupDictionarySenses(lookup, word) {
  const key = normalizeWord(word);
  if (!key) return [];
  // The SQL predicate finds the headword; this exact-key post-filter prevents accidental
  // attachment if a source DB contains case/space variants. Nothing is paired by position.
  return lookup.all(key).filter(candidate => normalizeCandidateWord(candidate) === key);
}

module.exports = {
  normalizeWord, normalizeMeaning, hasVietnameseDiacritics, hasVietnameseMeaningSignal, looksLikeEnglishGloss, usableVietnameseMeaning,
  getValidCandidates, collectDictionaryMeanings, selectDictionaryCandidate, selectDictionaryEntryCandidates,
  meaningForOxfordWord, DICTIONARY_LOOKUP_SQL, createDictionaryLookup, lookupDictionarySenses,
};
