'use strict';
const { mapDatabaseVocabularyRow } = require('../scripts/vocabulary-pipeline-lib');

const PLAYABLE_VOCAB_SQL = `
  SELECT id,word,word_key,meaning_vi,definition_en,example_en,example_vi,ipa,pos,cefr_level,topic,
         is_common,battle_ready,alt_answers,source,dictionary_meanings_vi
  FROM public.wn_vocab
  WHERE battle_ready=TRUE AND needs_manual_review=FALSE AND meaning_vi<>''
    AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr'
    AND dictionary_word_id<>'' AND dictionary_sense_id<>''
    AND lower(trim(dictionary_word))=word_key
  ORDER BY cefr_level, word_key
`;
function toGameVocabulary(rows) { return rows.map(mapDatabaseVocabularyRow); }
module.exports = { PLAYABLE_VOCAB_SQL, toGameVocabulary };
