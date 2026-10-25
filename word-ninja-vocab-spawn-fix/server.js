'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { URL } = require('node:url');

// Load a local .env without adding another runtime dependency.
const rootDir = __dirname;
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || m[1].startsWith('#')) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[m[1]] == null) process.env[m[1]] = value;
  }
}

const { Pool } = require('pg');
const { PLAYABLE_VOCAB_SQL, toGameVocabulary } = require('./server/vocabulary-api');
const scrypt = promisify(crypto.scrypt);
const publicDir = path.join(rootDir, 'public');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5173);
const sessionDays = Math.max(1, Math.min(90, Number(process.env.SESSION_DAYS || 30)));
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'word_ninja',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  ssl: String(process.env.PGSSL || 'false').toLowerCase() === 'true' ? { rejectUnauthorized: true } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const authAttempts = new Map();
let gameAct = null;

function send(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    ...extraHeaders,
  });
  res.end(body);
}
function digestToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function ipKey(req) { return req.socket.remoteAddress || 'unknown'; }
function authRateLimited(req) {
  const key = ipKey(req);
  const now = Date.now();
  let rec = authAttempts.get(key);
  if (!rec || now - rec.start > 15 * 60_000) rec = { start: now, count: 0 };
  rec.count++;
  authAttempts.set(key, rec);
  return rec.count > 15;
}
async function readJson(req, maxBytes = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const err = new Error('Request body quá lớn.'); err.status = 413; throw err;
    }
    chunks.push(chunk);
  }
  if (!size) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const err = new Error('JSON không hợp lệ.'); err.status = 400; throw err; }
}
function bearer(req) {
  const raw = req.headers.authorization || '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}
async function findUserByToken(token, db = pool) {
  if (!token || token.length > 300) return null;
  const result = await db.query(
    `SELECT u.id, u.username FROM wn_sessions s JOIN wn_users u ON u.id=s.user_id
     WHERE s.token_hash=$1 AND s.expires_at > NOW()`, [digestToken(token)]
  );
  return result.rows[0] || null;
}
async function createSession(userId, username, res) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + sessionDays * 86400_000);
  await pool.query('DELETE FROM wn_sessions WHERE expires_at <= NOW()');
  await pool.query('INSERT INTO wn_sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)', [digestToken(token), userId, expires]);
  send(res, 200, { ok: true, token, user: { id: String(userId), username }, expiresAt: expires.toISOString() });
}
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}
async function verifyPassword(password, encoded) {
  const parts = String(encoded || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const actual = await scrypt(password, parts[1], 64);
  const expected = Buffer.from(parts[2], 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
async function requireUser(req, res) {
  const token = bearer(req);
  if (!token) { send(res, 401, { error: 'Bạn cần đăng nhập.' }); return null; }
  const user = await findUserByToken(token);
  if (!user) { send(res, 401, { error: 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.' }); return null; }
  return user;
}


async function handleWorld(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  const input = await readJson(req);
  if (!gameAct) return send(res, 503, { error: 'Luật game chưa sẵn sàng.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize operations for one character so two tabs cannot spend the same materials at once.
    const locked = await client.query('SELECT id FROM wn_users WHERE id=$1 FOR UPDATE', [user.id]);
    if (!locked.rowCount) { await client.query('ROLLBACK'); return send(res, 401, { error: 'Tài khoản không còn tồn tại.' }); }
    const saveQ = await client.query('SELECT state, rev, history FROM wn_game_saves WHERE user_id=$1', [user.id]);
    const wordsQ = await client.query('SELECT words, rev FROM wn_word_progress WHERE user_id=$1', [user.id]);
    const combatQ = await client.query('SELECT state, rev FROM wn_combat_sessions WHERE user_id=$1', [user.id]);
    const needsVocab = ['vocabQuestion', 'vocabAnswer', 'vocabHint', 'combatSkill', 'combatRetreat'].includes(input.cmd);
    const vocabQ = needsVocab ? await client.query(PLAYABLE_VOCAB_SQL) : { rows: [] };
    const map = new Map();
    const coreKey = `core:${String(user.id)}`;
    const wordsKey = `words:${String(user.id)}`;
    const combatKey = `combat:${String(user.id)}`;
    if (saveQ.rows[0]) {
      const r = saveQ.rows[0];
      map.set(coreKey, { data: r.state, rev: Number(r.rev), history: r.history || [], v: 2 });
    }
    if (wordsQ.rows[0]) {
      const r = wordsQ.rows[0];
      map.set(wordsKey, { words: r.words || {}, rev: Number(r.rev), v: 2 });
    }
    if (combatQ.rows[0]) {
      const r = combatQ.rows[0];
      map.set(combatKey, r.state || null);
    }
    const vocab = toGameVocabulary(vocabQ.rows);
    const world = {
      who: { id: String(user.id) }, now: Date.now(), rng: Math.random, vocab,
      get(key) { return map.has(key) ? map.get(key) : null; },
      put(key, value) { map.set(key, value == null ? null : JSON.parse(JSON.stringify(value))); },
    };
    const answer = gameAct(world, input);
    const updatedCore = map.get(coreKey);
    if (updatedCore && updatedCore.data) {
      await client.query(
        `INSERT INTO wn_game_saves(user_id,state,rev,history,updated_at)
         VALUES($1,$2::jsonb,$3,$4::jsonb,NOW())
         ON CONFLICT(user_id) DO UPDATE SET state=EXCLUDED.state, rev=EXCLUDED.rev, history=EXCLUDED.history, updated_at=NOW()`,
        [user.id, JSON.stringify(updatedCore.data), Number(updatedCore.rev || 1), JSON.stringify(updatedCore.history || [])]
      );
    }
    const updatedWords = map.get(wordsKey);
    if (updatedWords && updatedWords.words) {
      await client.query(
        `INSERT INTO wn_word_progress(user_id,words,rev,updated_at)
         VALUES($1,$2::jsonb,$3,NOW())
         ON CONFLICT(user_id) DO UPDATE SET words=EXCLUDED.words, rev=EXCLUDED.rev, updated_at=NOW()`,
        [user.id, JSON.stringify(updatedWords.words), Number(updatedWords.rev || 1)]
      );
    }
    if (map.has(combatKey)) {
      const updatedCombat = map.get(combatKey);
      if (updatedCombat == null) {
        await client.query('DELETE FROM wn_combat_sessions WHERE user_id=$1', [user.id]);
      } else {
        await client.query(
          `INSERT INTO wn_combat_sessions(user_id,state,rev,updated_at) VALUES($1,$2::jsonb,1,NOW())
           ON CONFLICT(user_id) DO UPDATE SET state=EXCLUDED.state, rev=wn_combat_sessions.rev+1, updated_at=NOW()`,
          [user.id, JSON.stringify(updatedCombat)]
        );
      }
    }
    await client.query('COMMIT');
    send(res, 200, answer);
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('game api error:', e);
    send(res, 500, { error: 'Không xử lý được thao tác game. Tiến trình chưa được xác nhận lưu.' });
  } finally { client.release(); }
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/vocab') {
    try {
      const q = await pool.query(PLAYABLE_VOCAB_SQL);
      const vocab = toGameVocabulary(q.rows);
      return send(res, 200, { ok: true, total: vocab.length, vocab });
    } catch (e) {
      console.error('vocabulary API failed:', e);
      return send(res, 503, { ok: false, error: 'Chưa tải được bộ từ vựng đã đối soát.' });
    }
  }

  if (req.method === 'GET' && pathname === '/api/vocab/stats') {
    try {
      const q = await pool.query(`SELECT
        COUNT(*) FILTER (WHERE cefr_source='oxford3000-cefr')::int AS total,
        COUNT(*) FILTER (WHERE battle_ready AND NOT needs_manual_review AND meaning_vi<>'' AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr' AND dictionary_word_id<>'' AND dictionary_sense_id<>'' AND lower(trim(dictionary_word))=word_key)::int AS playable,
        COUNT(*) FILTER (WHERE is_common AND battle_ready AND NOT needs_manual_review AND meaning_vi<>'' AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr' AND dictionary_word_id<>'' AND dictionary_sense_id<>'' AND lower(trim(dictionary_word))=word_key)::int AS common,
        COUNT(*) FILTER (WHERE cefr_level='A1' AND battle_ready AND NOT needs_manual_review AND meaning_vi<>'' AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr' AND dictionary_word_id<>'' AND dictionary_sense_id<>'' AND lower(trim(dictionary_word))=word_key)::int AS a1,
        COUNT(*) FILTER (WHERE cefr_level='A2' AND battle_ready AND NOT needs_manual_review AND meaning_vi<>'' AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr' AND dictionary_word_id<>'' AND dictionary_sense_id<>'' AND lower(trim(dictionary_word))=word_key)::int AS a2,
        COUNT(*) FILTER (WHERE cefr_level='B1' AND battle_ready AND NOT needs_manual_review AND meaning_vi<>'' AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr' AND dictionary_word_id<>'' AND dictionary_sense_id<>'' AND lower(trim(dictionary_word))=word_key)::int AS b1,
        COUNT(*) FILTER (WHERE cefr_level='B2' AND battle_ready AND NOT needs_manual_review AND meaning_vi<>'' AND source='skypedia-sqlite+oxford3000' AND cefr_source='oxford3000-cefr' AND dictionary_word_id<>'' AND dictionary_sense_id<>'' AND lower(trim(dictionary_word))=word_key)::int AS b2,
        COUNT(*) FILTER (WHERE needs_manual_review)::int AS needs_manual_review
        FROM public.wn_vocab`);
      return send(res, 200, { ok: true, ...q.rows[0] });
    } catch (e) { return send(res, 503, { ok: false, error: 'Chưa đọc được thống kê từ vựng.' }); }
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    try {
      await pool.query('SELECT 1');
      return send(res, 200, { ok: true, service: 'word-ninja', database: 'connected', timestamp: new Date().toISOString() });
    } catch {
      return send(res, 503, { ok: false, service: 'word-ninja', database: 'disconnected' });
    }
  }

  if (req.method === 'POST' && (pathname === '/api/auth/register' || pathname === '/api/auth/login')) {
    if (authRateLimited(req)) return send(res, 429, { error: 'Quá nhiều lần thử. Hãy đợi 15 phút rồi thử lại.' });
    const body = await readJson(req, 32_000);
    const username = String(body.username || '').trim();
    const usernameKey = username.toLowerCase();
    const password = String(body.password || '');
    if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) return send(res, 400, { error: 'Tên tài khoản phải dài 3–24 ký tự, chỉ gồm chữ, số và dấu gạch dưới.' });
    if (password.length < 10 || password.length > 200) return send(res, 400, { error: 'Mật khẩu cần từ 10 đến 200 ký tự.' });

    if (pathname.endsWith('/register')) {
      const passwordHash = await hashPassword(password);
      try {
        const result = await pool.query(
          'INSERT INTO wn_users(username,username_key,password_hash) VALUES($1,$2,$3) RETURNING id,username',
          [username, usernameKey, passwordHash]
        );
        return createSession(result.rows[0].id, result.rows[0].username, res);
      } catch (e) {
        if (e.code === '23505') return send(res, 409, { error: 'Tên tài khoản đã được sử dụng.' });
        throw e;
      }
    }

    const result = await pool.query('SELECT id,username,password_hash FROM wn_users WHERE username_key=$1', [usernameKey]);
    const account = result.rows[0];
    const matches = account ? await verifyPassword(password, account.password_hash) : false;
    if (!matches) return send(res, 401, { error: 'Tên tài khoản hoặc mật khẩu không đúng.' });
    return createSession(account.id, account.username, res);
  }

  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = await requireUser(req, res);
    if (user) return send(res, 200, { user: { id: String(user.id), username: user.username } });
    return;
  }
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const token = bearer(req);
    if (token) await pool.query('DELETE FROM wn_sessions WHERE token_hash=$1', [digestToken(token)]);
    return send(res, 200, { ok: true });
  }
  if (req.method === 'POST' && pathname === '/api/world') return handleWorld(req, res);
  if (pathname.startsWith('/api/')) return send(res, 404, { error: 'API không tồn tại.' });

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method không được hỗ trợ.' });
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return send(res, 400, { error: 'URL không hợp lệ.' }); }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const filePath = path.resolve(publicDir, relative);
  if (filePath !== publicDir && !filePath.startsWith(publicDir + path.sep)) return send(res, 403, { error: 'Forbidden.' });
  let stat;
  try { stat = await fs.promises.stat(filePath); } catch { return send(res, 404, { error: 'Không tìm thấy tài nguyên.' }); }
  if (!stat.isFile()) return send(res, 404, { error: 'Không tìm thấy tài nguyên.' });
  const type = mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Cache-Control': /\.(html|js|css)$/.test(filePath) ? 'no-cache' : 'public, max-age=86400',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).pipe(res);
}

async function main() {
  await pool.query(fs.readFileSync(path.join(rootDir, 'server/schema.sql'), 'utf8'));
  // Import the same deterministic game rules the frontend uses, but keep them out of public/.
  // Load compatibility vocabulary needed by the bundled game rules. It is not copied into
  // PostgreSQL and never supplies meanings for server-authoritative combat questions.
  global.window = globalThis;
  require('./public/js/vocab.js');
  require('./public/js/vocab2.js');
  require('./public/js/vocab3.js');
  gameAct = (await import('./server/game-world.mjs')).act;
  // Runtime vocabulary is sourced only from PostgreSQL rows carrying verified SQLite + Oxford provenance.
  // Bundled frontend glosses and hand-entered translations are never copied into wn_vocab at startup.
  const server = http.createServer((req, res) => {
    Promise.resolve(route(req, res)).catch((e) => {
      console.error('request failed:', e);
      if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : 'Lỗi máy chủ.' });
      else res.destroy();
    });
  });
  server.listen(port, host, () => {
    console.log(`Word Ninja đang chạy tại http://${host}:${port}`);
    console.log('Backend: PostgreSQL | API: /api/health | Frontend: thư mục public/');
  });
  const shutdown = async () => { server.close(); await pool.end(); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => {
  console.error('\nKhông thể khởi động Word Ninja. Hãy kiểm tra PostgreSQL và file .env.');
  console.error(e.message || e);
  console.error('Gợi ý: tạo database word_ninja, đặt PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD rồi chạy lại.');
  process.exit(1);
});
