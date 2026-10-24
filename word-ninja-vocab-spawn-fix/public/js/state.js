// Word Ninja: game state, the op queue, learning memory and saving.
// Every change goes through CORE.apply. When the account has a backend (a world) the
// browser applies the deterministic changes at once and the server confirms them; the
// server is the authority for rewards, forging, evolution and quests.
(function () {
  const { ITEMS, MATS, POTIONS, MONSTERS, MAPS, QUESTS, CLASSES, SKILLS, F, SLOTS } = GD;
  const mb = () => window.mindblown;
  const listeners = {};
  const LS_KEY = "wordninja_progress";
  const PENDING_KEY = "wordninja_pending";

  const S = {
    d: null, tune: {}, mode: "browser", scope: "browser", status: { state: "idle", text: "", at: 0 },
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    emit(ev, a) { (listeners[ev] || []).forEach((f) => { try { f(a); } catch (e) { console.error(e); } }); },
  };

  // ---------------- mode ----------------
  const localBridge = () => (window.LOCALBE && window.LOCALBE.act ? window.LOCALBE : null);
  const worldCall = async function (input) {
    const b = localBridge();
    if (b) return b.act(input);
    const m = mb();
    if (!m || !m.world || !m.world.act) throw new Error("NO_WORLD");
    const r = await m.world.act(input);
    return r && r.answer;
  };
  const canServer = () => {
    const b = localBridge();
    if (b) return b.ready ? !!b.ready() : true;
    return !!(mb() && mb().world && mb().world.act && mb().viewer && mb().viewer.signedIn);
  };

  // ---------------- status ----------------
  S.setStatus = function (state, text) {
    S.status = { state, text: text || "", at: Date.now() };
    S.emit("status", S.status);
  };
  const MODE_TEXT = () => (S.mode === "world"
    ? (S.status.state === "saving" ? "Đang lưu lên máy chủ..." : S.status.state === "error" ? "Chưa lưu được lên máy chủ" : S.status.state === "saved" ? "Đã lưu lên máy chủ" : "Đang kết nối máy chủ")
    : "Tiến trình lưu trên trình duyệt này. Đăng nhập để lưu theo tài khoản.");

  // ---------------- local apply ----------------
  const env = (combo) => ({ now: Date.now(), rng: Math.random, combo: combo || 0 });
  let queue = [], flushing = false, again = false, flushTimer = null, awaiting = [];
  let lastRev = null;

  function snapshot() { return JSON.parse(JSON.stringify(S.d)); }
  function emitAfter(before, res) {
    const evs = CORE.eventsOf(S.d, before, S.d, res, []);
    for (const e of evs) {
      if (e.e === "levelup") S.emit("levelup", e.level);
      if (e.e === "questdone") { const q = CORE.questDef(e.id); S.emit("questdone", q); }
    }
    S.emit("change");
    S.emit("quest");
  }

  // one change, applied here and (when there is a server) recorded there too
  S.op = function (name, a) {
    const op = { op: name, a: a || {} };
    if (S.mode === "world") {
      // Account/cloud mode is server-authoritative: never run gameplay rules in the browser
      // first. The backend validates/applies the operation and returns the resulting state.
      // This prevents client-side gold, XP, item, quest and equipment changes from becoming
      // the source of truth. Offline browser mode below remains available intentionally.
      return new Promise((resolve) => {
        queue.push({ op: op.op, a: op.a, resolve });
        S.setStatus("saving");
        schedule(120);
      });
    }
    const before = { level: S.d.level };
    const r = CORE.apply(S.d, op, env(op.a && op.a.combo));
    if (!r.ok) { S.emit("refused", { op: name, why: r.why, r }); return Promise.resolve(r); }
    emitAfter(before, [r]);
    S.setStatus("saving"); S.save();
    return Promise.resolve(r);
  };
  S.applyLocal = function (op) { return CORE.apply(S.d, op, env()); };

  // ---------------- the queue ----------------
  function schedule(ms) { clearTimeout(flushTimer); flushTimer = setTimeout(flush, ms || 500); }
  function savePending() {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ bid: bid, ops: queue.map((q) => ({ op: q.op, a: q.a })) }));
    } catch (e) { /* storage full or private mode: the queue only lives in memory */ }
  }
  let bid = null;
  function newBid() { bid = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)); }

  async function flush() {
    if (S.mode !== "world") { return doLocalSave(); }
    if (flushing) { again = true; return; }
    if (!queue.length) { if (S.status.state === "saving") S.setStatus("saved"); return; }
    flushing = true;
    const batch = queue.splice(0, 40);
    const ops = batch.map((q) => ({ op: q.op, a: q.a }));
    if (!bid) newBid();
    const myBid = bid;
    try {
      const ans = await worldCall({ cmd: "sync", bid: myBid, ops, combo: S.lastCombo || 0 });
      if (!ans || ans.refused) throw new Error(ans && ans.refused ? ans.refused : "refused");
      lastRev = ans.rev;
      // The server's copy is the truth. Operations queued while this request was in flight
      // remain queued for the next request; do not replay game rules locally for display.
      if (ans.state) {
        const keepPosition = { map: S.d.map, x: S.d.x };
        S.d = CORE.sanitize(ans.state, Date.now());
        if (ans.words) { for (const k in ans.words) S.d.words[k] = ans.words[k]; }
        // Server owns HP/MP and progression. Preserve only the live display position while
        // the physics scene is running, so a save round-trip cannot snap the player backwards.
        if (keepPosition.map === S.d.map && Number.isFinite(keepPosition.x)) {
          S.d.x = keepPosition.x;
          S.d.pos = { map: S.d.map, x: keepPosition.x };
        }
        CORE.clampVitals(S.d);
        S.d.vitals = { hp: S.d.hp, mp: S.d.mp };
      }
      // hand each awaited op its own verdict
      for (let i = 0; i < batch.length; i++) {
        const q = batch[i]; const r = (ans.results || [])[i] || { ok: false, why: "lost" };
        if (q.resolve) q.resolve(r);
      }
      bid = null;
      savePending();
      S.setStatus("saved");
      S.emit("change");
      if (ans.events && ans.events.length) {
        for (const e of ans.events) {
          if (e.e === "levelup") S.emit("levelup", e.level);
          if (e.e === "questdone") { const q = CORE.questDef(e.id); S.emit("questdone", q); }
          if (e.e === "evolve") S.emit("evolved", e);
        }
      }
    } catch (err) {
      // put the batch back at the front and try again: the batch id makes a retry safe
      queue = batch.filter((q) => q.replay !== false).concat(queue);
      savePending();
      S.setStatus("error", String((err && err.message) || err));
      for (const q of batch) if (q.resolve) q.resolve({ ok: false, why: "offline" });
      clearTimeout(flushTimer); flushTimer = setTimeout(flush, 4000);
      flushing = false;
      if (again) { again = false; flush(); }
      return;
    }
    flushing = false;
    if (again) { again = false; flush(); }
    else if (queue.length) schedule(400);
  }
  S.flush = flush;

  // ---------------- browser saving ----------------
  let saveTimer = null, saving = false;
  S.save = function (now) {
    if (S.mode === "world") { S.setStatus("saving"); schedule(now ? 0 : 500); return; }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(doLocalSave, now ? 0 : 1200);
  };
  async function doLocalSave() {
    if (!S.d) return;
    if (saving) return;
    saving = true;
    S.setStatus("saving");
    const value = snapshot();
    const m = mb();
    try {
      if (m && m.save && S.scope === "account") {
        try { await m.save("progress", value); }
        catch (e) {
          if (e && (e.reason === "LOAD_FIRST" || e.reason === "AUTH_CHANGED")) { await m.load("progress"); await m.save("progress", value); }
          else if (e && e.reason === "REVISION_CONFLICT") { await m.save("progress", value); }
          else throw e;
        }
        S.setStatus("saved");
      } else if (m && m.save && S.scope === "browser") {
        const saved = await m.save("progress", value);
        S.scope = saved && saved.scope ? saved.scope : S.scope;
        S.setStatus("saved");
      } else {
        localStorage.setItem(LS_KEY, JSON.stringify(value));
        S.setStatus("saved");
      }
      S.emit("saved", true);
    } catch (e) {
      console.warn("save failed", e);
      S.setStatus("error", String((e && e.message) || e));
      S.emit("saved", false);
    }
    saving = false;
  }

  // ---------------- loading ----------------
  S.load = async function () {
    const m = mb();
    let local = null;
    try { local = JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch (e) { local = null; }
    // 1. an account save in the browser's own namespace
    let saved = null;
    if (m && m.load) {
      try { const r = await m.load("progress"); saved = r ? r.value : null; S.scope = r && r.scope ? r.scope : "account"; }
      catch (e) { saved = null; S.scope = "error"; }
    }
    // 2. the server. A backend bridge may still be finding out who is signed in.
    const lb = localBridge();
    if (lb && lb.whenReady) { try { await lb.whenReady(); } catch (e) { /* nobody is signed in */ } }
    if (canServer()) {
      try {
        const ans = await worldCall({ cmd: "init", init: true });
        if (ans && ans.exists && ans.state) {
          S.mode = "world"; S.scope = "account";
          S.d = CORE.sanitize(ans.state, Date.now());
          for (const k in ans.words || {}) S.d.words[k] = ans.words[k];
          CORE.clampVitals(S.d);
          S.setStatus("saved");
          return true;
        }
        if (ans && !ans.exists) {
          // nothing on the server yet: move the old browser save up, once, with the values clamped
          const old = saved || local;
          S.mode = "world"; S.scope = "account";
          if (old) {
            const up = await worldCall({ cmd: "import", data: old, words: (old.words) || {} });
            if (up && up.refused === "already" && up.state) {
              S.d = CORE.sanitize(up.state, Date.now());
              S.setStatus("saved");
              return true;
            }
            S.d = CORE.sanitize((up && up.state) || old, Date.now());
            for (const k in (up && up.words) || (old.words || {})) S.d.words[k] = ((up && up.words) || old.words)[k];
            CORE.clampVitals(S.d);
            S.migrated = true;
            S.setStatus("saved");
            return true;
          }
          S.d = CORE.newState(Date.now());
          CORE.clampVitals(S.d);
          // Persist a fresh character immediately. This also makes a new account's
          // first save deterministic rather than waiting for the first combat action.
          try {
            const up = await worldCall({ cmd: "import", data: S.d, words: {} });
            if (up && up.state) S.d = CORE.sanitize(up.state, Date.now());
            S.setStatus("saved");
          } catch (e) {
            S.setStatus("error", String((e && e.message) || e));
          }
          return false;
        }
      } catch (e) {
        console.warn("world unavailable, falling back to the account save", e);
      }
    }
    // 3. no backend: the account save, then the browser
    if (saved && saved.v) { S.d = CORE.sanitize(saved, Date.now()); S.mode = "browser"; return true; }
    if (local && local.v) { S.d = CORE.sanitize(local, Date.now()); S.mode = "browser"; S.scope = (m && m.save) ? S.scope : "local"; return true; }
    S.d = CORE.newState(Date.now());
    CORE.clampVitals(S.d);
    return false;
  };
  S.newGame = function () { S.d = CORE.newState(Date.now()); CORE.clampVitals(S.d); };
  S.reset = async function () {
    S.queueReset = true;
    const fresh = CORE.newState(Date.now());
    S.d = fresh;
    CORE.clampVitals(S.d);
    S.emit("change");
    try {
      if (S.mode === "world") { await worldCall({ cmd: "import", data: fresh, words: {} }); S.setStatus("saved"); }
      else {
        const m = mb();
        if (m && m.save && S.scope !== "local") await m.save("progress", snapshot());
        else localStorage.setItem(LS_KEY, JSON.stringify(snapshot()));
        S.setStatus("saved");
      }
    } catch (e) { S.setStatus("error", String((e && e.message) || e)); }
  };

  // ---------------- read helpers (same API the panels already use) ----------------
  S.item = (u) => CORE.item(S.d, u);
  S.equipped = (slot) => CORE.equipped(S.d, slot);
  S.isEquipped = (u) => CORE.isEquipped(S.d, u);
  S.stats = () => CORE.stats(S.d);
  S.weaponLook = () => CORE.weaponLook(S.d);
  S.clampHp = () => CORE.clampVitals(S.d);
  S.pointsLeft = () => CORE.pointsLeft(S.d);
  S.pointsEarned = () => CORE.pointsEarned(S.d);
  S.skillState = (id) => CORE.skillState(S.d, id);
  S.skillRead = (id) => CORE.skillRead(S.d, id);
  S.hotbar = () => CORE.hotbar(S.d);
  S.activeSkills = () => CORE.activeSkills(S.d);
  S.sellPrice = (it) => CORE.sellPrice(it);
  S.mapAccess = (id) => CORE.mapAccess(S.d, id);
  S.canEquip = (it) => CORE.canEquip(S.d, it);
  S.skillMp = (id, calm) => CORE.skillMp(S.d, id, calm);
  S.skillCd = (id) => CORE.skillCd(S.d, id);

  // Apply a response from the authoritative game API. Server HP/MP, inventory, rewards and
  // word progress are never overwritten with client predictions. Keep only the live physics x.
  S.applyServerResult = function (ans) {
    if (ans && ans.state) {
      const oldMap = S.d && S.d.map;
      const oldX = S.d && S.d.x;
      S.d = CORE.sanitize(ans.state, Date.now());
      if (oldMap === S.d.map && Number.isFinite(oldX)) {
        S.d.x = oldX;
        S.d.pos = { map: S.d.map, x: oldX };
      }
      if (ans.words) for (const key in ans.words) S.d.words[key] = ans.words[key];
      S.d.vitals = { hp: S.d.hp, mp: S.d.mp };
      CORE.clampVitals(S.d);
      S.setStatus("saved");
      S.emit("change"); S.emit("quest");
    }
    return ans;
  };
  S.serverAction = async function (cmd, args = {}) {
    if (S.mode !== "world") return { ok: false, why: "not-online" };
    await S.flush();
    const ans = await worldCall(Object.assign({ cmd }, args));
    if (!ans || ans.refused) throw new Error((ans && ans.refused) || "Backend không trả kết quả hợp lệ.");
    return S.applyServerResult(ans);
  };
  S.serverCombatQuestion = (monsterId, fightId, spawnId) => S.serverAction("vocabQuestion", { monsterId, fightId, spawnId });
  S.serverCombatAnswer = (args) => S.serverAction("vocabAnswer", args);
  S.serverCombatHint = (args) => S.serverAction("vocabHint", args);
  S.serverCombatSkill = (args) => S.serverAction("combatSkill", args);
  S.serverCombatRetreat = (args) => S.serverAction("combatRetreat", args);
  S.serverRegen = () => S.serverAction("regen", {});

  // HP/MP are server-owned in account mode. Browser-only mode still saves local changes.
  S.syncVitals = function () {
    S.d.vitals = { hp: S.d.hp, mp: S.d.mp };
    if (S.mode === "world") return;
    S.save();
  };

  // ---------------- mutations: the old call shapes, now queue-backed ----------------
  S.equip = function (u) { return S.op("equip", { u }); };
  S.unequip = function (slot) { return S.op("unequip", { slot }); };
  S.lockItem = function (u) { return S.op("lock", { u }); };
  S.addGold = function (n) { S.d.gold = Math.max(0, S.d.gold + n); S.emit("change"); S.save(); };
  S.addExp = function (n) {
    const before = { level: S.d.level };
    const r = CORE.addExp(S.d, Math.round(n * (S.tune.exp_mult || 1)));
    emitAfter(before, [{ ok: true, result: {} }]);
    if (S.mode !== "world") S.save();
    return r.got;
  };
  S.addItem = function (id, plus) { const it = CORE.addItem(S.d, id, plus || 0); S.emit("change"); S.save(); return it; };
  S.addMat = function (id, n) { CORE.addMat(S.d, id, n || 1); S.emit("change"); S.save(); };
  S.addPot = function (id, n) { CORE.addPot(S.d, id, n || 1); S.emit("change"); S.save(); };
  S.grant = function (r) { const got = CORE.grant(S.d, r); S.emit("change"); S.save(); return got; };
  S.rollDrops = function (mid) { return CORE.rollDrops(S.d, mid, env()); };
  S.buy = function (kind, id) { return S.op("buy", { kind, id }); };
  S.sell = function (u) { return S.op("sell", { u }); };
  S.sellMat = function (id) { return S.op("sellMat", { id }); };
  S.forge = function (u) { return S.op("forge", { u }); };
  S.evolve = function (u) { return S.op("evolve", { u }); };
  S.learn = function (id) { return S.op("learn", { id }); };
  S.pickClass = function (cls) { return S.op("pickClass", { cls }); };
  S.accept = function (id) { return S.op("accept", { id }); };
  S.claim = function (id) { return S.op("claim", { id }); };
  S.travel = function (map, x, quest) { return S.op("travel", { map, x, quest }); };
  S.usePot = function (id) { return S.op("spend", { pot: id }); };
  S.setSetting = function (key, value) { return S.op("settings", { [key]: value }); };
  S.battleOp = function (mid, bid0, spawnId) { return S.op("battle", { m: mid, id: bid0, spawnId }); };
  S.answerOp = function (a) {
    const previousBox = S.mem(a.id).box;
    const result = S.op("answer", a);
    // Keep the vocabulary mastery milestone notification, but only after the single canonical update.
    const current = S.mem(a.id);
    if (current.box > previousBox && (current.box === 3 || current.box === 5)) {
      const entry = (window.VOCAB || []).find((e) => e.id === a.id);
      if (entry) S.emit("memo", { entry, level: current.box });
    }
    return result;
  };
  // the one op that pays: awaited, because the server decides the drops
  S.killOp = function (mid, fightId, combo, spawnId) {
    S.lastCombo = combo || 0;
    if (S.mode !== "world") {
      const before = { level: S.d.level };
      const r = CORE.apply(S.d, { op: "kill", a: { m: mid, id: fightId } }, env(combo));
      if (r.ok) { r.result.rewards = CORE.grant(S.d, r.result.drops); emitAfter(before, [r]); S.save(true); }
      return Promise.resolve(r);
    }
    return S.op("kill", { m: mid, id: fightId, spawnId, combo: combo || 0 });
  };
  S.applyRewardsLocal = function (drops) {
    if (!drops) return [];
    const before = { level: S.d.level };
    const got = CORE.grant(S.d, drops);
    emitAfter(before, [{ ok: true, result: {} }]);
    return got;
  };
  S.reviveOp = function () { return S.op("revive", {}); };

  // ---------------- quest helpers ----------------
  S.questDef = (id) => CORE.questDef(id);
  S.qs = (id) => S.d.quests[id];
  S.questAvailable = (q) => CORE.questAvailable(S.d, q);
  S.questProgress = (q) => CORE.questProgress(S.d, q);
  S.questGoal = (q) => CORE.questGoal(q);
  S.objectiveText = (q) => CORE.objectiveText(S.d, q);
  S.questCheck = () => CORE.questCheck(S.d);
  S.questEvent = (type, a) => CORE.questEvent(S.d, type, a);
  S.questsFor = (npc) => QUESTS.filter((q) => q.giver === npc && (S.questAvailable(q) || (S.qs(q.id) && S.qs(q.id).st !== "claimed")));
  S.npcMark = function (npc) {
    const qs = QUESTS.filter((q) => q.giver === npc);
    if (qs.some((q) => S.qs(q.id)?.st === "done")) return "claim";
    if (qs.some((q) => q.main && S.questAvailable(q))) return "new";
    return null;
  };
  S.currentGoal = function () {
    const act = QUESTS.filter((q) => S.qs(q.id) && S.qs(q.id).st !== "claimed").sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0));
    const q = act[0];
    if (!q) {
      const next = QUESTS.find((x) => x.main && S.questAvailable(x));
      if (next) return { q: next, line: `Gặp ${GD.NPCS[next.giver].name} ở ${MAPS[GD.NPCS[next.giver].map].name} để nhận nhiệm vụ mới`, state: "new" };
      if (S.d.level < 10) return { q: null, line: "Lên cấp 10 để chọn lớp nhân vật", state: "free" };
      if (!S.d.cls) return { q: null, line: "Bấm vào chân dung ở góc trái để chọn lớp", state: "free" };
      return { q: null, line: "Luyện từ, săn quái, cường hóa và tiến hóa trang bị!", state: "free" };
    }
    if (S.qs(q.id).st === "done") { const npc = GD.NPCS[q.giver]; return { q, line: `Về gặp ${npc.name} ở ${MAPS[npc.map].name} để nhận thưởng`, state: "done" }; }
    return { q, line: S.objectiveText(q), state: "active" };
  };

  // ---------------- memory (spaced repetition) ----------------
  S.w = (id) => S.d.words[id];
  S.mem = function (id) { return S.d.words[id] || (S.d.words[id] = { seen: 0, c: 0, wr: 0, streak: 0, box: 0, due: 0, last: 0 }); };
  // Preview the learning transition for combat UI. The real mutation is applied exactly once
  // by S.answerOp/CORE.apply, avoiding duplicated counts in both browser and server modes.
  S.record = function (entry, ok, hinted, ctx) {
    ctx = ctx || {};
    const m = S.mem(entry.id);
    const beforeState = { box: m.box, wr: m.wr, c: m.c, streak: m.streak, seen: m.seen, last: m.last, due: m.due };
    const t = Date.now();
    const wasDue = m.box === 0 || t >= m.due;
    let after = m.box;
    if (ok) {
      if (!hinted && wasDue) after = Math.min(5, after + 1);
    } else after = Math.max(0, after - 2);
    return { before: beforeState.box, after, mem: m, practice: !!ctx.practice };
  };
  S.memLabel = (m) => (!m || !m.seen ? "Chưa gặp" : m.box >= 5 ? "Đã thuộc" : m.box >= 3 ? "Đang nhớ" : m.wr > m.c ? "Hay sai" : "Mới học");
  S.isDue = (m) => m && m.seen > 0 && Date.now() >= m.due;

  const LV = { A1: 1, A2: 2, B1: 3, B2: 4 };
  S.pickWord = function (pool, recent) {
    const now = Date.now(); const avoid = new Set((recent || []).slice(-4));
    let cand = pool.filter((e) => !avoid.has(e.id)); if (!cand.length) cand = pool;
    const seen = cand.filter((e) => S.w(e.id)?.seen);
    const due = seen.filter((e) => now >= S.w(e.id).due).sort((a, b) => (S.w(a.id).box - S.w(b.id).box) || (S.w(b.id).wr - S.w(a.id).wr) || (S.w(a.id).due - S.w(b.id).due));
    const fresh = cand.filter((e) => !S.w(e.id)?.seen).sort((a, b) => (LV[a.lv] - LV[b.lv]) || (a.w.length - b.w.length) || (a.i - b.i));
    if (Math.random() < 0.15) {
      const g = VOCAB.filter((e) => e.t !== "phrases" && e.t !== "phrases2" && !avoid.has(e.id) && S.w(e.id)?.wr > 0 && now >= S.w(e.id).due && S.w(e.id).box < 3);
      if (g.length) return g[Math.floor(Math.random() * g.length)];
    }
    if (due.length && (Math.random() < 0.7 || !fresh.length)) return due[Math.floor(Math.random() * Math.min(3, due.length))];
    if (fresh.length) return fresh[Math.floor(Math.random() * Math.min(4, fresh.length))];
    if (!seen.length) return cand[Math.floor(Math.random() * cand.length)];
    const w = seen.map((e) => Math.pow(6 - S.w(e.id).box, 2)); let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < seen.length; i++) { r -= w[i]; if (r <= 0) return seen[i]; }
    return cand[Math.floor(Math.random() * cand.length)];
  };
  // A monster's pool: its two topics, narrowed to the CEFR band of the map it lives in.
  S.poolFor = function (mid, phrase) {
    const m = MONSTERS[mid];
    if (phrase) {
      const want = (m.lv >= 24) ? "phrases2" : "phrases";
      const p = VOCAB.filter((e) => e.t === want);
      if (p.length) return p;
      return VOCAB.filter((e) => e.t === "phrases");
    }
    const band = m.lvBand || ["A1", "A2"];
    const maxRank = Math.max(LV[band[0]] || 1, LV[band[1]] || 1);
    const pick = (topic, k) => VOCAB.filter((e) => e.t === topic && (LV[e.lv] || 1) <= (LV[band[k]] || 1));
    const a = pick(m.topics[0], 0);
    const b = m.topics[1] && m.topics[1] !== "phrases" ? pick(m.topics[1], 1) : [];
    if (!a.length && !b.length) return VOCAB.filter((e) => (LV[e.lv] || 1) <= maxRank);
    return Math.random() < 0.65 || !b.length ? (a.length ? a : b) : b;
  };

  // ---------------- boot ----------------
  function isOfflineAndroidApp() {
    try {
      return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
    } catch (_) { return false; }
  }

  async function loadDatabaseVocabulary() {
    // The Android package has no PostgreSQL server. In that explicit native mode,
    // use the reviewed English–Vietnamese vocabulary shipped with the game instead
    // of failing closed to an empty combat pool. Browser/cloud mode remains unchanged.
    if (isOfflineAndroidApp()) {
      const bundled = Array.isArray(window.VOCAB) ? window.VOCAB : [];
      let entries = bundled
        .filter((e) => e && String(e.w || "").trim() && String(e.vi || "").trim())
        .map((entry, index) => Object.assign({}, entry, {
          id: String(entry.id || entry.w).trim().replace(/\s+/g, "_"),
          i: index,
          alt: Array.isArray(entry.alt) ? entry.alt : [],
          ready: true,
        }));
      if (entries.length && window.WNOfflineDictionary && typeof window.WNOfflineDictionary.enrich === "function") {
        entries = await window.WNOfflineDictionary.enrich(entries);
      }
      if (entries.length) {
        window.VOCAB = entries;
        window.VOCAB_BY_ID = Object.fromEntries(entries.map((entry) => [entry.id, entry]));
        document.documentElement.dataset.wordNinjaMode = "offline-android";
        S.setStatus("saved", "Chế độ ngoại tuyến");
      } else {
        window.VOCAB = [];
        window.VOCAB_BY_ID = {};
        console.error("Word Ninja Android: không tìm thấy từ vựng được đóng gói.");
      }
      return;
    }

    const bridge = localBridge();
    try {
      const response = bridge && typeof bridge.loadVocabulary === "function"
        ? await bridge.loadVocabulary()
        : await fetch("/api/vocab", { headers: { Accept: "application/json" }, cache: "no-store" }).then(async (res) => {
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.error || ("HTTP " + res.status));
            return payload;
          });
      if (!response || !response.ok || !Array.isArray(response.vocab)) throw new Error("API không trả danh sách từ đã đối soát.");
      // The notebook and both local/server combat paths use the PostgreSQL vocabulary
      // that is backed by SQLite + Oxford. Never display bundled translations as fallback.
      const entries = response.vocab.filter(e => e && e.id && e.w && String(e.vi || "").trim() && e.ready);
      window.VOCAB = entries;
      window.VOCAB_BY_ID = Object.fromEntries(entries.map((entry, index) => { entry.i = index; return [entry.id, entry]; }));
      window.TOPICS = Object.assign(window.TOPICS || {}, { oxford3000: "Oxford 3000" });
      window.POS_VI = Object.assign(window.POS_VI || {}, {
        n: "danh từ", v: "động từ", adj: "tính từ", adv: "trạng từ", pronoun: "đại từ",
        preposition: "giới từ", determiner: "từ hạn định", conjunction: "liên từ",
        interjection: "thán từ", phrase: "cụm từ", "phrasal verb": "cụm động từ",
      });
      if (!entries.length) console.warn("API chưa có từ vựng nào đủ điều kiện chiến đấu; hãy chạy npm run import:vocab.");
    } catch (error) {
      // Fail closed: do not show bundled translations if the authoritative SQLite-backed
      // vocabulary API is unavailable. This avoids silently mixing unrelated vocab sources.
      console.error("Không tải được từ vựng PostgreSQL đã đối soát:", error);
      window.VOCAB = [];
      window.VOCAB_BY_ID = {};
    }
  }

  S.boot = async function () {
    const ok = await S.load();
    if (!S.d) S.newGame();
    await loadDatabaseVocabulary();
    if (S.mode === "world") { try { const p = JSON.parse(localStorage.getItem(PENDING_KEY) || "null"); if (p && p.bid && p.ops && p.ops.length) { bid = p.bid; queue = p.ops.map((o) => ({ op: o.op, a: o.a, replay: true })); schedule(200); } } catch (e) { /* nothing pending */ } }
    S.emit("change");
    return ok;
  };
  window.S = S;
})();
