# Word Ninja — vocabulary import and question clarity update

## What changed

- Oxford 3000 is used only to select eligible headwords and attach CEFR. English/Vietnamese SQLite rows supply the English entry, Vietnamese gloss, POS, examples, pronunciation, and sense IDs.
- A gloss that is clearly not Vietnamese (such as `Very; much.`) is not accepted as a playable Vietnamese meaning. It stays empty/not battle-ready until the source data has a valid Vietnamese gloss; the game does not silently invent a translation.
- `npm run import:vocab` now backs up `public.wn_vocab`, then deletes/rebuilds only that table in one transaction. On any insert failure, PostgreSQL rolls back the delete/rebuild. Old non-Oxford vocabulary rows are removed from that table. User accounts, saves, progress, combat sessions, equipment, and all other tables are untouched.
- Battle prompts explicitly label the Vietnamese meaning and use a masked dictionary example when available. Pronoun pairs such as `they/them` include a subject/object grammar hint and an example with the answer blanked out.

## Apply on an existing Windows checkout

Extract the updated project ZIP over the existing project directory, allowing files to be overwritten. The ZIP does not contain `.env`, `node_modules`, or your local database, so keep those local files.

From PowerShell in the project directory:

```powershell
npm run check
npm test
npm run import:vocab -- --dry-run
npm run import:vocab
npm run audit:vocab
```

`--dry-run` does not write to PostgreSQL. The real import prints the table backup name; keep that name in case you need to run `npm run restore:vocab -- --backup=...`.

The import has not been executed against your local PostgreSQL from this development environment; run the commands above on the machine where your database is configured.
