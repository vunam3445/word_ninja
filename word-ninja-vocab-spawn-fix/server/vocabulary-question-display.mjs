const PRONOUN_CONTEXT = Object.freeze({
  i: { hint: 'Đại từ chủ ngữ — chỉ người nói và thường đứng trước động từ.', example: 'I am ready.' },
  me: { hint: 'Đại từ tân ngữ — chỉ người nói, thường đứng sau động từ hoặc giới từ.', example: 'She called me.' },
  he: { hint: 'Đại từ chủ ngữ — chỉ người được nói đến và thường đứng trước động từ.', example: 'He is at home.' },
  him: { hint: 'Đại từ tân ngữ — chỉ người được nói đến, thường đứng sau động từ hoặc giới từ.', example: 'I saw him.' },
  she: { hint: 'Đại từ chủ ngữ — chỉ người được nói đến và thường đứng trước động từ.', example: 'She likes music.' },
  her: { hint: 'Đại từ tân ngữ — chỉ người được nói đến, thường đứng sau động từ hoặc giới từ.', example: 'I saw her.' },
  we: { hint: 'Đại từ chủ ngữ — chỉ nhóm có người nói, thường đứng trước động từ.', example: 'We work together.' },
  us: { hint: 'Đại từ tân ngữ — chỉ nhóm có người nói, thường đứng sau động từ hoặc giới từ.', example: 'They helped us.' },
  they: { hint: 'Đại từ chủ ngữ — là chủ thể thực hiện hành động, thường đứng trước động từ.', example: 'They are my friends.' },
  them: { hint: 'Đại từ tân ngữ — chỉ người/vật nhận tác động, thường đứng sau động từ hoặc giới từ.', example: 'I saw them yesterday.' },
});

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Mask the answer in a dictionary example before sending it to the browser. */
export function maskExampleForQuestion(example, word) {
  const sentence = String(example || '').replace(/\s+/g, ' ').trim();
  const target = String(word || '').trim();
  if (!sentence || !target) return '';
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapeRegExp(target)})(?=$|[^\\p{L}\\p{N}_])`, 'giu');
  let replaced = false;
  const masked = sentence.replace(pattern, (_match, prefix) => {
    replaced = true;
    return `${prefix}_____`;
  });
  return replaced ? masked : '';
}

/** Return context-only learning hints; never returns the target as a visible answer. */
export function createQuestionDisplayHints(word, example = '') {
  const key = String(word || '').normalize('NFKC').trim().toLowerCase();
  const curated = PRONOUN_CONTEXT[key];
  let exampleHint = maskExampleForQuestion(example, word);
  if (!exampleHint && curated) exampleHint = maskExampleForQuestion(curated.example, word);
  return {
    contextHint: curated ? curated.hint : '',
    exampleHint,
  };
}
