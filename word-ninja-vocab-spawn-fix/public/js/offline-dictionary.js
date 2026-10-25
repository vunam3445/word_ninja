// Offline dictionary adapter used by the Android APK. The database itself is fetched
// from bundled app assets; there are no dictionary API calls in native/offline mode.
(function () {
  let dbPromise = null;
  let db = null;

  function isVietnameseMeaning(value) {
    const text = String(value || '').trim();
    if (text.length < 2 || text.length > 500) return false;
    // Avoid the known failure mode where English-only glosses are labelled as Vietnamese.
    // Vietnamese diacritics are a strong signal; common Vietnamese words cover short ASCII glosses.
    if (/[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i.test(text)) return true;
    return /\b(của|người|động|thực|được|việc|sự|làm|cho|một|cái|con|và|hoặc|khi|trong|ngoài|thuộc|liên quan|có|không|để|với|từ|bằng|trạng thái|hành động|vật|loại|chỉ|nói|dùng|là)\b/i.test(text);
  }

  function isAndroid() {
    try { return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()); }
    catch (_) { return false; }
  }

  async function openDatabase() {
    if (db) return db;
    if (!dbPromise) {
      dbPromise = (async () => {
        if (typeof window.initSqlJs !== 'function') throw new Error('Không tải được bộ máy SQLite ngoại tuyến.');
        const SQL = await window.initSqlJs({ locateFile: (file) => 'vendor/' + file });
        const response = await fetch('data/dictionary_en_vi.db', { cache: 'force-cache' });
        if (!response.ok) throw new Error('Không tìm thấy dữ liệu từ điển ngoại tuyến trong APK.');
        const bytes = new Uint8Array(await response.arrayBuffer());
        const database = new SQL.Database(bytes);
        // Fail early if the bundled database is incompatible or corrupt.
        database.exec('SELECT word FROM words LIMIT 1');
        db = database;
        return db;
      })().catch((error) => {
        dbPromise = null;
        throw error;
      });
    }
    return dbPromise;
  }

  function collectRows(statement) {
    const rows = [];
    try {
      while (statement.step()) {
        const row = statement.getAsObject();
        if (!isVietnameseMeaning(row.definition)) continue;
        rows.push({
          word: String(row.word || ''),
          definition: String(row.definition || '').trim(),
          pos: String(row.pos || '').trim(),
          subPos: String(row.sub_pos || '').trim(),
          ipa: String(row.ipa || '').trim(),
          region: String(row.region || '').trim(),
          example: String(row.example || '').trim(),
        });
      }
    } finally {
      statement.free();
    }
    const seen = new Set();
    return rows.filter((row) => {
      const key = `${row.definition}\u0000${row.pos}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function lookup(word, limit = 12) {
    const query = String(word || '').trim().toLowerCase();
    if (!query) return [];
    const database = await openDatabase();
    const statement = database.prepare(`
      SELECT w.word, d.definition, d.pos, d.sub_pos, p.ipa, p.region, wd.example
      FROM words w
      JOIN word_definitions wd ON wd.word_id = w.id
      JOIN definitions d ON d.id = wd.definition_id
      LEFT JOIN pronunciations p ON p.word_id = w.id
      WHERE w.word = ?
        AND w.lang_code = 'en'
        AND COALESCE(d.definition_lang, 'vi') = 'vi'
      ORDER BY CASE WHEN lower(COALESCE(p.region, '')) IN ('br', 'bre', 'uk', 'british') THEN 0 ELSE 1 END,
               d.pos, d.id
      LIMIT ?
    `);
    statement.bind([query, Math.max(1, Math.min(30, Number(limit) || 12))]);
    return collectRows(statement);
  }

  async function search(query, limit = 12) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const exact = await lookup(q, limit);
    if (exact.length) return exact;
    const database = await openDatabase();
    const statement = database.prepare(`
      SELECT w.word, d.definition, d.pos, d.sub_pos, p.ipa, p.region, wd.example
      FROM words w
      JOIN word_definitions wd ON wd.word_id = w.id
      JOIN definitions d ON d.id = wd.definition_id
      LEFT JOIN pronunciations p ON p.word_id = w.id
      WHERE w.word LIKE ? ESCAPE '\\'
        AND w.lang_code = 'en'
        AND COALESCE(d.definition_lang, 'vi') = 'vi'
      ORDER BY w.word, d.pos, d.id
      LIMIT ?
    `);
    const prefix = q.replace(/[\\%_]/g, (match) => '\\' + match) + '%';
    statement.bind([prefix, Math.max(1, Math.min(30, Number(limit) || 12))]);
    return collectRows(statement);
  }

  async function enrich(entries) {
    if (!isAndroid() || !Array.isArray(entries)) return entries;
    try {
      await openDatabase();
      for (const entry of entries) {
        try {
          const matches = await lookup(entry.w, 20);
          if (!matches.length) continue;
          const meanings = [...new Set(matches.map((item) => item.definition).filter(isVietnameseMeaning))];
          if (meanings.length) entry.meaningsVi = meanings;
          // Preserve the already curated display translation; SQLite provides the extra
          // dictionary senses and IPA/examples for the offline notebook and word details.
          const pronunciation = matches.find((item) => item.ipa);
          const example = matches.find((item) => item.example);
          if (!entry.ipa && pronunciation) entry.ipa = pronunciation.ipa;
          if (!entry.dbExample && example) entry.dbExample = example.example;
          if (!entry.dbPos) {
            const pos = matches.find((item) => item.pos);
            if (pos) entry.dbPos = pos.pos;
          }
        } catch (error) {
          console.warn('Không thể đối chiếu mục từ ngoại tuyến:', entry.w, error);
        }
      }
      return entries;
    } catch (error) {
      console.error('Không mở được SQLite từ điển trong APK:', error);
      // The game can still start with the reviewed vocabulary bundled in its scripts.
      return entries;
    }
  }

  window.WNOfflineDictionary = {
    isAvailable: () => isAndroid() && !!db,
    lookup,
    search,
    enrich,
    close() {
      if (db) db.close();
      db = null;
      dbPromise = null;
    },
  };
})();
