// Word Ninja: the rules, in one place. This file runs BOTH in the browser and on the server
// (bundled into world.js), so it must stay pure: no DOM, no localStorage, no fetch, no Date.now.
// Every change to a character goes through apply(), so the client and the server agree by construction.
(function (root) {
  const GD = root.GD;
  const { ITEMS, MATS, POTIONS, MONSTERS, MAPS, QUESTS, CLASSES, SKILLS, NOVICE_SKILL, F, DIFFICULTY, MAX_LV } = GD;

  const CORE = {};
  const now = (env) => (env && env.now) || 0;
  const rand = (env) => ((env && env.rng) || Math.random)();

  // ---------------- state ----------------
  CORE.newState = function (t) {
    return {
      v: 2, level: 1, exp: 0, gold: 30, hp: null, mp: null, cls: null, map: "village", x: 320,
      inv: [{ u: 1, id: "w_bamboo", plus: 0 }, { u: 2, id: "a_cloth", plus: 0 }, { u: 3, id: "w_wood", plus: 0 }],
      nextU: 4, equip: { weapon: 1, armor: 2 }, lock: [],
      mats: { stone: 0, spore: 0, straw: 0, horn: 0, fiber: 0, feather: 0, silk: 0, moon: 0, blood: 0, dark: 0, core: 0, cloudstone: 0, mechcore: 0, spiritseed: 0, thunder: 0, fateseal: 0 },
      pots: { pot_hp: 3, pot_hp2: 0, pot_hp3: 0, pot_hp4: 0, pot_mp: 1, pot_mp2: 0, pot_mp3: 0 },
      quests: { q1: { st: "active", p: 0 } },
      settings: { diff: "normal", press: "normal" },
      stats: { kills: 0, correct: 0, wrong: 0, battles: 0, forged: 0, evolved: 0, words: 0 },
      words: {}, skills: {}, spSpent: 0, hotbar: [],
      unlocked: {}, introDone: false, created: t || 0,
      pos: { x: 320, map: "village" }, vitals: { hp: null, mp: null },
      fights: [], kills: {}, spawnKills: {}, syncRev: 0,
    };
  };

  // ---------------- stats ----------------
  CORE.item = (s, u) => s.inv.find((i) => i.u === u);
  CORE.equipped = (s, slot) => { const u = s.equip[slot]; return u ? CORE.item(s, u) : null; };
  CORE.isEquipped = (s, u) => Object.values(s.equip).includes(u);

  CORE.stats = function (s, unclamped) {
    const b = F.baseStats(s.level);
    const st = { hp: b.hp, mp: b.mp, atk: b.atk, def: b.def, crit: 8, spd: 0, dodge: 0, timeBonus: 0, skillPower: 0, comboDmg: 0 };
    for (const sl of GD.SLOTS) {
      const it = CORE.equipped(s, sl.id); if (!it) continue;
      const v = F.itemStats(it.id, it.plus || 0);
      for (const k in v) st[k] = (st[k] || 0) + v[k];
    }
    if (s.cls === "kiem") st.atk = Math.round(st.atk * 1.1);
    if (s.cls === "anh") st.spd += 15;
    // skill passives
    for (const id in s.skills || {}) {
      const sk = SKILLS[id]; const rk = s.skills[id]; if (!sk || !rk || sk.type !== "passive") continue;
      const fx = sk.fx; const at = (arr) => (Array.isArray(arr) ? arr[Math.min(arr.length, rk) - 1] : arr);
      if (fx.kind === "atkPct") st.atk = Math.round(st.atk * (1 + at(fx.v) / 100));
      if (fx.kind === "critPct") st.crit += at(fx.v);
      if (fx.kind === "spdDodge") { st.spd += at(fx.spd); st.dodge += at(fx.dodge); }
      if (fx.kind === "critCd") st.crit += at(fx.v);
      if (fx.kind === "mpPct") { st.mp = Math.round(st.mp * (1 + at(fx.v) / 100)); st.skillPower += at(fx.skill); }
      if (fx.kind === "skillPct") st.skillPower += at(fx.v);
      if (fx.kind === "comboDmg") st.comboDmg += at(fx.v);
    }
    if (unclamped) return st;
    return st;
  };
  CORE.clampVitals = function (s) {
    const st = CORE.stats(s);
    s.hp = Math.min(st.hp, Math.max(0, s.hp == null ? st.hp : Math.round(s.hp)));
    s.mp = Math.min(st.mp, Math.max(0, s.mp == null ? st.mp : Math.round(s.mp)));
  };
  CORE.weaponLook = (s) => { const w = CORE.equipped(s, "weapon"); return w && ITEMS[w.id] ? ITEMS[w.id].icon : "sword_bamboo"; };

  // ---------------- skills ----------------
  CORE.pointsEarned = (s) => (s.level >= 10 ? s.level - 9 : 0);
  CORE.pointsLeft = (s) => CORE.pointsEarned(s) - (s.spSpent || 0);
  CORE.skillOf = (s, id) => (s.cls && SKILLS[id] && SKILLS[id].cls === s.cls ? SKILLS[id] : null);
  CORE.skillState = function (s, id) {
    const sk = CORE.skillOf(s, id);
    if (!sk) return { id, ok: false, why: "class" };
    const rank = (s.skills || {})[id] || 0;
    if (rank >= sk.max) return { id, sk, rank, ok: false, why: "max", nextLv: F.skillRankLv(sk, rank) };
    const nextRank = rank + 1;
    const nextLv = F.skillRankLv(sk, nextRank);
    const need = (sk.need || []).filter((n) => !(s.skills || {})[n]);
    if (s.level < nextLv) return { id, sk, rank, ok: false, why: "level", nextLv, need };
    if (need.length) return { id, sk, rank, ok: false, why: "need", nextLv, need };
    if (CORE.pointsLeft(s) < 1) return { id, sk, rank, ok: false, why: "points", nextLv, need };
    return { id, sk, rank, ok: true, nextLv, nextRank, need };
  };
  CORE.activeSkills = function (s) {
    if (!s.cls) return [];
    return Object.keys(SKILLS).filter((id) => SKILLS[id].cls === s.cls && SKILLS[id].type === "active" && (s.skills || {})[id])
      .sort((a, b) => SKILLS[a].lv - SKILLS[b].lv);
  };
  // the five slots of the battle hotbar: learned actives in unlock order, or the novice slash
  CORE.hotbar = function (s) {
    if (!s.cls) return [null];
    const learned = CORE.activeSkills(s);
    return learned.length ? learned.slice(0, 9) : [null];
  };
  CORE.skillRead = function (s, id) {
    const sk = id ? CORE.skillOf(s, id) : NOVICE_SKILL;
    const rank = id ? (s.skills || {})[id] || 0 : 1;
    return { id, sk, rank };
  };
  CORE.skillMp = function (s, id, calmPct) {
    const { sk, rank } = CORE.skillRead(s, id);
    const base = sk.mp || 0;
    const calm = 1 - (calmPct || 0) / 100;
    const l = s.cls === "linh" && SKILLS.l12 && (s.skills || {}).l12 ? SKILLS.l12.fx.skill[Math.min(3, s.skills.l12) - 1] : 0;
    return Math.max(1, Math.round(base * calm * (1 - l / 100)));
  };
  CORE.skillCd = function (s, id) {
    const { sk } = CORE.skillRead(s, id);
    let cd = sk.cd || 2;
    if (s.cls === "anh" && (s.skills || {}).a22 >= 3) cd = Math.max(1, cd - 1);
    return cd;
  };

  // ---------------- quests ----------------
  CORE.questDef = (id) => QUESTS.find((q) => q.id === id);
  CORE.qs = (s, id) => s.quests[id];
  CORE.questAvailable = function (s, q) {
    const st = s.quests[q.id];
    if (st && st.st !== "claimed") return false;
    if (st && st.st === "claimed" && !q.repeat) return false;
    if (q.main) { const i = QUESTS.indexOf(q); const prev = QUESTS[i - 1]; if (prev && s.quests[prev.id]?.st !== "claimed") return false; }
    if (q.after && s.quests[q.after]?.st !== "claimed") return false;
    if (q.type === "evolve" && s.level < (GD.EVOLVE[q.tier] || {}).lv) return false;
    return true;
  };
  CORE.questProgress = function (s, q) {
    const st = s.quests[q.id]; if (!st) return 0;
    if (q.type === "collect") return Math.min(q.n, s.mats[q.mat] || 0);
    if (q.type === "forge") return st.p ? 1 : 0;
    if (q.type === "cls") return s.cls ? 1 : 0;
    if (q.type === "level") return Math.min(q.n, s.level);
    if (q.type === "evolve") { const t = (s.equip.weapon && ITEMS[CORE.item(s, s.equip.weapon)?.id]?.tier) || 1; return t >= q.tier ? 1 : 0; }
    return Math.min(q.n, st.p || 0);
  };
  CORE.questGoal = (q) => (q.type === "forge" || q.type === "cls" || q.type === "evolve" ? 1 : q.n);
  CORE.questCheck = function (s) {
    const done = [];
    for (const q of QUESTS) {
      const st = s.quests[q.id];
      if (st && st.st === "active" && CORE.questProgress(s, q) >= CORE.questGoal(q)) { st.st = "done"; done.push(q.id); }
    }
    return done;
  };
  CORE.objectiveText = function (s, q) {
    const p = CORE.questProgress(s, q), n = CORE.questGoal(q);
    const T = root.TOPICS || {};
    if (q.type === "kill") return "Hạ " + MONSTERS[q.m].name + " " + p + "/" + n;
    if (q.type === "killAny") return "Hạ quái bất kỳ " + p + "/" + n;
    if (q.type === "topic") return "Đúng " + p + "/" + n + " từ chủ đề " + (T[q.topic] || q.topic);
    if (q.type === "collect") return "Thu " + MATS[q.mat].name + " " + p + "/" + n;
    if (q.type === "forge") return "Cường hóa một món lên +" + q.plus + " ở Lò rèn";
    if (q.type === "practice") return "Luyện lại trong Sổ tay " + p + "/" + n;
    if (q.type === "cls") return s.cls ? "Đã chọn lớp " + CLASSES[s.cls].name : "Lên cấp 10 và chọn lớp nhân vật";
    if (q.type === "level") return "Đạt cấp " + n + " (đang cấp " + s.level + ")";
    if (q.type === "evolve") { const t = (s.equip.weapon && ITEMS[CORE.item(s, s.equip.weapon)?.id]?.tier) || 0; return "Tiến hóa vũ khí lớp lên bậc " + q.tier + " ở Lò rèn (đang bậc " + Math.max(1, t) + ")"; }
    return "";
  };
  CORE.questEvent = function (s, type, a) {
    for (const q of QUESTS) {
      const st = s.quests[q.id]; if (!st || st.st !== "active") continue;
      if (type === "kill" && q.type === "kill" && q.m === a.m) st.p++;
      if (type === "kill" && q.type === "killAny" && a.m !== "dummy") st.p++;
      if (type === "correct" && q.type === "topic" && a.topic === q.topic && !a.practice) st.p++;
      if (type === "correct" && q.type === "practice" && a.practice) st.p++;
      if (type === "forge" && q.type === "forge" && a.plus >= q.plus) st.p = 1;
    }
    return CORE.questCheck(s);
  };

  // ---------------- rewards ----------------
  CORE.addExp = function (s, n) {
    n = Math.round(n);
    s.exp += n;
    const ups = [];
    while (s.level < MAX_LV && s.exp >= F.expToNext(s.level)) { s.exp -= F.expToNext(s.level); s.level++; ups.push(s.level); }
    if (s.level >= MAX_LV) s.exp = Math.min(s.exp, F.expToNext(MAX_LV));
    if (ups.length) { const st = CORE.stats(s); s.hp = st.hp; s.mp = st.mp; }
    return { got: n, ups };
  };
  CORE.addItem = function (s, id, plus) { const it = { u: s.nextU++, id, plus: plus || 0 }; s.inv.push(it); return it; };
  CORE.addMat = (s, id, n) => { s.mats[id] = (s.mats[id] || 0) + (n || 1); };
  CORE.addPot = (s, id, n) => { s.pots[id] = (s.pots[id] || 0) + (n || 1); };
  CORE.grant = function (s, r) {
    const got = [];
    if (r.exp) { const e = CORE.addExp(s, r.exp); got.push({ t: "exp", n: e.got }); for (const l of e.ups) got.push({ t: "level", n: l }); }
    if (r.gold) { s.gold += r.gold; got.push({ t: "gold", n: r.gold }); }
    for (const k in r.mats || {}) { CORE.addMat(s, k, r.mats[k]); got.push({ t: "mat", id: k, n: r.mats[k] }); }
    for (const k in r.pots || {}) { CORE.addPot(s, k, r.pots[k]); got.push({ t: "pot", id: k, n: r.pots[k] }); }
    for (const id of r.items || []) { const it = CORE.addItem(s, id); got.push({ t: "item", id, u: it.u }); }
    if (r.unlock) s.unlocked[r.unlock] = true;
    return got;
  };
  CORE.rollDrops = function (s, mid, env) {
    const m = MONSTERS[mid]; const out = { mats: {}, pots: {}, items: [] };
    const hard = s.settings.diff === "hard" ? 1.25 : 1;
    for (const [kind, id, p, n] of m.drops) {
      if (rand(env) >= p * (p < 1 ? hard : 1)) continue;
      if (kind === "mat") out.mats[id] = (out.mats[id] || 0) + (n || 1);
      if (kind === "pot") out.pots[id] = (out.pots[id] || 0) + 1;
      if (kind === "item") out.items.push(id);
    }
    const g = m.gold[0] + Math.floor(rand(env) * (m.gold[1] - m.gold[0] + 1));
    const combo = Math.max(0, Math.min(6, (env && env.combo) || 0));
    const comboBonus = 1 + 0.03 * combo;
    out.gold = Math.round(g * hard * comboBonus);
    out.exp = Math.round(m.exp * hard * comboBonus);
    return out;
  };

  // ---------------- equipment ----------------
  CORE.canEquip = function (s, it) {
    const d = it && ITEMS[it.id]; if (!d) return { ok: false, why: "missing" };
    if ((d.lv || 1) > s.level) return { ok: false, why: "level", lv: d.lv };
    if (d.cls && d.cls !== s.cls) return { ok: false, why: "class", cls: d.cls };
    return { ok: true };
  };
  CORE.sellPrice = (it) => Math.max(5, Math.round((ITEMS[it.id].price || [30, 60, 120, 200, 400][GD.RARITY[ITEMS[it.id].rarity].rank]) * 0.3 * (1 + 0.3 * (it.plus || 0))));

  // ---------------- map access ----------------
  CORE.mapAccess = function (s, id) {
    const m = MAPS[id]; if (!m) return { ok: false, why: "map" };
    const req = m.req || {};
    if (req.lv && s.level < req.lv) return { ok: false, why: "level", lv: req.lv };
    if (req.cls && !s.cls) return { ok: false, why: "class" };
    if (req.flag && !s.unlocked[req.flag] && !(req.quest && s.quests[req.quest]?.st === "claimed")) return { ok: false, why: "flag", flag: req.flag };
    if (req.quest && s.quests[req.quest]?.st !== "claimed") return { ok: false, why: "quest", quest: req.quest };
    return { ok: true, reason: req.lv ? "Cần cấp " + req.lv : req.quest ? "Cần hoàn thành nhiệm vụ" : "" };
  };
  CORE.mapsOpen = function (s) { return GD.MAP_ORDER.filter((id) => CORE.mapAccess(s, id).ok); };

  // ---------------- operations ----------------
  // apply() is the only way the character changes. env: { now, rng, combo }. Returns { ok, result, events }.
  const OPS = {
    // vitals: the client says where it thinks hp/mp are; the server only clamps them
    vitals(s, a) { s.hp = a.hp; s.mp = a.mp; CORE.clampVitals(s); s.vitals = { hp: s.hp, mp: s.mp }; return { hp: s.hp, mp: s.mp }; },
    spend(s, a) { // a potion, in a battle or out of one
      if (!(s.pots[a.pot] > 0)) return { ok: false, why: "pots" };
      const p = POTIONS[a.pot]; if (!p) return { ok: false, why: "pot" };
      const st = CORE.stats(s);
      if (p.heal && s.hp >= st.hp && !a.force) return { ok: false, why: "full" };
      if (p.mana && s.mp >= st.mp) return { ok: false, why: "full" };
      s.pots[a.pot]--;
      if (p.heal) s.hp = Math.min(st.hp, s.hp + p.heal);
      if (p.mana) s.mp = Math.min(st.mp, s.mp + p.mana);
      return { hp: s.hp, mp: s.mp, pot: a.pot };
    },
    equip(s, a) {
      const it = CORE.item(s, a.u); if (!it) return { ok: false, why: "item" };
      const c = CORE.canEquip(s, it);
      if (!c.ok) return { ok: false, why: c.why };
      s.equip[ITEMS[it.id].slot] = a.u;
      CORE.clampVitals(s);
      return { slot: ITEMS[it.id].slot, u: a.u };
    },
    unequip(s, a) {
      if (!s.equip[a.slot]) return { ok: false, why: "empty" };
      delete s.equip[a.slot];
      CORE.clampVitals(s);
      return { slot: a.slot };
    },
    lock(s, a) {
      s.lock = s.lock || [];
      const has = s.lock.includes(a.u);
      if (has) s.lock = s.lock.filter((u) => u !== a.u); else s.lock.push(a.u);
      return { u: a.u, locked: !has };
    },
    buy(s, a) {
      const kind = a.kind, id = a.id;
      const pr = kind === "pot" ? POTIONS[id].price : kind === "mat" ? MATS[id].price : ITEMS[id].price;
      if (kind === "pot") {
        const d = POTIONS[id];
        if (d.lv && d.lv > s.level) return { ok: false, why: "level", lv: d.lv };
      }
      if (kind === "item") {
        const d = ITEMS[id];
        if ((d.lv || 1) > s.level) return { ok: false, why: "level", lv: d.lv };
        if (d.cls && d.cls !== s.cls) return { ok: false, why: "class" };
      }
      if (s.gold < pr) return { ok: false, why: "gold", need: pr };
      s.gold -= pr;
      if (kind === "pot") CORE.addPot(s, id, 1);
      else if (kind === "mat") { CORE.addMat(s, id, 1); CORE.questCheck(s); }
      else { const it = CORE.addItem(s, id); return { kind, id, u: it.u, gold: s.gold }; }
      return { kind, id, gold: s.gold };
    },
    sell(s, a) {
      const it = CORE.item(s, a.u); if (!it) return { ok: false, why: "item" };
      if (CORE.isEquipped(s, a.u)) return { ok: false, why: "equipped" };
      if ((s.lock || []).includes(a.u)) return { ok: false, why: "locked" };
      const p = CORE.sellPrice(it);
      s.inv = s.inv.filter((i) => i.u !== a.u);
      s.gold += p;
      return { u: a.u, gold: p };
    },
    sellMat(s, a) {
      if (!(s.mats[a.id] > 0)) return { ok: false, why: "mats" };
      if (a.id === "core" || a.id === "fateseal") return { ok: false, why: "core" }; // the chapter key is never sold
      s.mats[a.id]--; s.gold += MATS[a.id].sell;
      CORE.questCheck(s);
      return { id: a.id, gold: MATS[a.id].sell };
    },
    // forging: the roll happens on the server; the client may only predict it locally
    forge(s, a, env) {
      const it = CORE.item(s, a.u); if (!it) return { ok: false, why: "item" };
      if ((it.plus || 0) >= 5) return { ok: false, why: "max" };
      const c = F.forgeCost(it.id, it.plus || 0);
      if (s.gold < c.gold) return { ok: false, why: "gold" };
      if ((s.mats.stone || 0) < c.stone) return { ok: false, why: "stone" };
      s.gold -= c.gold; s.mats.stone -= c.stone;
      const win = rand(env) < c.rate;
      if (win) { it.plus = (it.plus || 0) + 1; s.stats.forged++; CORE.questEvent(s, "forge", { plus: it.plus }); }
      CORE.clampVitals(s);
      return { u: a.u, win, plus: it.plus, cost: c };
    },
    // evolving the class weapon along its ladder
    evolve(s, a) {
      const it = CORE.item(s, a.u); if (!it) return { ok: false, why: "item" };
      const d = ITEMS[it.id];
      const nextId = d.evolve;
      if (!nextId) return { ok: false, why: "none" };
      if (d.cls && d.cls !== s.cls) return { ok: false, why: "class" };
      const nd = ITEMS[nextId];
      const cost = GD.EVOLVE[nd.tier];
      if (!cost) return { ok: false, why: "tier" };
      if (s.level < cost.lv) return { ok: false, why: "level", lv: cost.lv };
      for (const k in cost.mats) if ((s.mats[k] || 0) < cost.mats[k]) return { ok: false, why: "mats", mat: k };
      if (s.gold < cost.gold) return { ok: false, why: "gold", need: cost.gold };
      s.gold -= cost.gold;
      for (const k in cost.mats) s.mats[k] -= cost.mats[k];
      const wasEq = CORE.isEquipped(s, it.u);
      it.id = nextId;
      s.stats.evolved = (s.stats.evolved || 0) + 1;
      CORE.clampVitals(s);
      const done = CORE.questCheck(s);
      return { u: it.u, id: nextId, tier: nd.tier, equipped: wasEq, quests: done };
    },
    learn(s, a) {
      const st = CORE.skillState(s, a.id);
      if (!st.ok) return { ok: false, why: st.why, need: st.need, nextLv: st.nextLv };
      s.skills[a.id] = st.nextRank;
      s.spSpent = (s.spSpent || 0) + 1;
      const hot = CORE.hotbar(s);
      s.hotbar = hot;
      return { id: a.id, rank: st.nextRank, left: CORE.pointsLeft(s), hotbar: hot };
    },
    pickClass(s, a) {
      if (s.cls) return { ok: false, why: "taken" };
      if (s.level < 10) return { ok: false, why: "level" };
      const c = CLASSES[a.cls]; if (!c) return { ok: false, why: "class" };
      s.cls = a.cls;
      const it = CORE.addItem(s, c.weapon);
      if (!s.equip.weapon || s.equip.weapon === 1 || s.equip.weapon === 3) {
        // the starting swords are replaced, so a pre-class character never keeps a worse blade by accident
        const old = CORE.equipped(s, "weapon");
        if (old && old.u !== it.u) s.inv = s.inv.filter((i) => i.u !== old.u);
        s.equip.weapon = it.u;
      }
      const st = CORE.stats(s); s.hp = st.hp; s.mp = st.mp;
      CORE.questCheck(s);
      return { cls: a.cls, weapon: it.u, wname: ITEMS[c.weapon].name };
    },
    accept(s, a) {
      const q = CORE.questDef(a.id);
      if (!q || !CORE.questAvailable(s, q)) return { ok: false, why: "quest" };
      s.quests[a.id] = { st: "active", p: 0 };
      CORE.questCheck(s);
      return { id: a.id };
    },
    claim(s, a) {
      const q = CORE.questDef(a.id); const st = s.quests[a.id];
      if (!q || !st || st.st !== "done") return { ok: false, why: "quest" };
      if (q.type === "collect") s.mats[q.mat] -= q.n;
      st.st = "claimed";
      const got = CORE.grant(s, q.reward);
      CORE.clampVitals(s);
      return { id: a.id, got };
    },
    travel(s, a) {
      const acc = CORE.mapAccess(s, a.map);
      if (!acc.ok) return { ok: false, why: acc.why, lv: acc.lv, quest: acc.quest };
      s.map = a.map; s.x = Math.max(60, Math.min(MAPS[a.map].width - 60, Math.round(a.x || 60)));
      s.pos = { map: s.map, x: s.x };
      if (a.quest) { /* the quest is checked by questCheck below */ }
      CORE.questCheck(s);
      return { map: s.map, x: s.x };
    },
    pos(s, a) { s.x = Math.round(a.x || 0); s.pos = { map: s.map, x: s.x }; return { x: s.x }; },
    settings(s, a) {
      for (const k of ["diff", "press"]) if (a[k] && (k === "diff" ? DIFFICULTY[a[k]] : (a[k] === "none" || GD.PRESSURE[a[k]]))) s.settings[k] = a[k];
      return { settings: s.settings };
    },
    battle(s, a, env) {
      if (!MONSTERS[a.m]) return { ok: false, why: "monster" };
      if ((s.fights || []).length >= 6) s.fights.shift();
      s.fights.push({ id: a.id, m: a.m, at: now(env), spawnId: String(a.spawnId || "").slice(0, 120) });
      if (a.m !== "dummy") s.stats.battles++;
      return { id: a.id, m: a.m };
    },
    // the only op that pays a kill: min time, one use per fight id, respawn respected
    kill(s, a, env) {
      const m = MONSTERS[a.m]; if (!m || a.m === "dummy") return { ok: false, why: "monster" };
      if ((s.kills || {})[a.id]) return { ok: false, why: "twice" };
      const f = (s.fights || []).find((x) => x.id === a.id);
      if (!f) return { ok: false, why: "nofight" };
      if (f.m !== a.m) return { ok: false, why: "mismatch" };
      const acc = CORE.mapAccess(s, s.map);
      if (!acc.ok && s.map !== "village") return { ok: false, why: "map" };
      const here = (MAPS[s.map].spawns || []).some((sp) => sp.m === a.m);
      if (s.map !== "village" && !here) return { ok: false, why: "nothere" };
      if (a.spawnId && f.spawnId && String(a.spawnId) !== String(f.spawnId)) return { ok: false, why: "mismatch" };
      const secs = (now(env) - f.at) / 1000;
      if (secs < F.minFight(m.tier)) return { ok: false, why: "fast", need: F.minFight(m.tier) };
      // Respawn cooldown belongs to a physical spawn instance, not the monster type.
      // Otherwise killing one radish would incorrectly lock every other radish in the map.
      let fallbackSpawnId = a.spawnId || f.spawnId || '';
      if (!fallbackSpawnId) {
        const spawnIndex = (MAPS[s.map] && MAPS[s.map].spawns || []).findIndex((sp) => sp.m === a.m);
        fallbackSpawnId = `${s.map}:${Math.max(0, spawnIndex)}:${a.m}`;
      }
      const spawnKey = String(fallbackSpawnId).slice(0, 120);
      s.spawnKills = s.spawnKills || {};
      const cd = Number(s.spawnKills[spawnKey] || 0);
      if (cd && now(env) < cd) return { ok: false, why: "respawn", at: cd };
      const drops = CORE.rollDrops(s, a.m, env);
      const got = CORE.grant(s, drops);
      s.stats.kills++;
      s.spawnKills[spawnKey] = now(env) + (m.respawn || 10000);
      s.fights = (s.fights || []).filter((x) => x.id !== a.id);
      const done = CORE.questEvent(s, "kill", { m: a.m });
      return { m: a.m, rewards: got, drops, quests: done };
    },
    // the learning record. The answer itself is typed on the client; this keeps the notebook honest and bounded.
    answer(s, a, env) {
      // Use the bundled vocabulary as the source of truth. Never trust the client-provided
      // `ok`, topic, level or target word when recording learning progress on the server.
      const bank = root.VOCAB_BY_ID || {};
      const canonical = bank[String(a.id || "")];
      if (!canonical) return { ok: false, why: "word" };
      const normalize = (value) => String(value == null ? "" : value).toLowerCase().replace(/[^a-z]/g, "");
      const accepted = [canonical.w, ...(Array.isArray(canonical.alt) ? canonical.alt : [])].map(normalize);
      const answerText = normalize(a.answerText);
      a.ok = !!answerText && accepted.includes(answerText);
      const e = { id: canonical.id, t: canonical.t, lv: canonical.lv, w: canonical.w };
      const mem = s.words[e.id] || (s.words[e.id] = { seen: 0, c: 0, wr: 0, streak: 0, box: 0, due: 0, last: 0 });
      const t = now(env);
      const wasDue = mem.box === 0 || t >= mem.due;
      const before = mem.box;
      mem.seen++; mem.last = t;
      let quests = [];
      if (a.ok) {
        mem.c++; s.stats.correct++;
        if (a.hinted) { mem.streak = 0; mem.due = t + 60e3; }
        else {
          mem.streak++;
          if (wasDue) mem.box = Math.min(5, mem.box + 1);
          mem.due = t + F.SRS_INTERVALS[mem.box] * (mem.box === 0 ? 0 : 1);
        }
        quests = CORE.questEvent(s, "correct", { topic: e.t, practice: !!a.practice, hadWrong: mem.wr > 0 });
      } else {
        mem.wr++; mem.streak = 0; s.stats.wrong++; mem.box = Math.max(0, mem.box - 2); mem.due = t + 30e3;
      }
      if (!a.again) s.stats.words++;
      return { id: e.id, mem, before, after: mem.box, correct: !!a.ok, quests };
    },
    practice(s, a) { s.stats.practice = (s.stats.practice || 0) + 1; return {}; },
    revive(s) {
      const st = CORE.stats(s);
      const lost = Math.floor(s.gold * 0.1);
      s.gold -= lost; s.hp = Math.ceil(st.hp * 0.6); s.mp = Math.ceil(st.mp * 0.6);
      return { lost, hp: s.hp, mp: s.mp };
    },
    reset(s, a, env) { const fresh = CORE.newState(now(env)); fresh.created = s.created; for (const k in fresh) s[k] = fresh[k]; return { reset: true }; },
  };
  CORE.OPS = OPS;
  // ops whose result depends on a server roll: the client must not apply them itself
  CORE.RANDOM_OPS = { kill: true, forge: true };
  CORE.OP_NAMES = Object.keys(OPS);

  // Every path a person typed goes through clean() before another person ever reads it.
  CORE.cleanText = function (txt) {
    const BAD = ["địt", "đụ", "đéo", "lồn", "cặc", "buồi", "đĩ", "điếm", "chó đẻ", "cứt", "đái", "ỉa", "fuck", "shit", "bitch", "dick", "cunt", "asshole", "bastard", "whore", "slut", "rape", "nigger", "faggot"];
    let out = String(txt == null ? "" : txt).slice(0, 200);
    for (const w of BAD) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "•".repeat(Math.min(6, w.length)));
    return out;
  };

  CORE.apply = function (s, op, env) {
    const fn = OPS[op && op.op];
    if (!fn) return { ok: false, why: "op" };
    let res;
    try { res = fn(s, op.a || {}, env || {}); }
    catch (e) { return { ok: false, why: "threw", message: String((e && e.message) || e) }; }
    if (res && res.ok === false) return res;
    s.syncRev = (s.syncRev || 0) + 1;
    // keep the vitals the client sees in step with the authoritative state
    s.vitals = { hp: s.hp, mp: s.mp };
    return { ok: true, result: res || {} };
  };

  // A whole batch, exactly as the server runs it. Same function on both sides.
  CORE.applyBatch = function (s, ops, env) {
    const out = [];
    for (let i = 0; i < ops.length; i++) {
      const r = CORE.apply(s, ops[i], Object.assign({}, env, { opIndex: i }));
      out.push(r);
      if (!r.ok && r.why === "threw") break;
    }
    return out;
  };
  // merged effects the interface wants to know about, worked out from the results
  CORE.eventsOf = function (s, before, after, res, ops) {
    const ev = [];
    if (after.level > before.level) for (let l = before.level + 1; l <= after.level; l++) ev.push({ e: "levelup", level: l });
    const quests = res.map((r) => (r.ok && r.result && r.result.quests) || []).flat();
    for (const id of new Set(quests)) ev.push({ e: "questdone", id });
    if (res.some((r) => r.ok && r.result && r.result.win)) ev.push({ e: "forge_ok" });
    for (const r of res) if (r.ok && r.result && r.result.tier) { ev.push({ e: "evolve", tier: r.result.tier, id: r.result.id }); break; }
    return ev;
  };

  // ---------------- migration and sanitiser ----------------
  // Any save coming from a browser (localStorage or an old private save) may have been edited by hand.
  // Everything here is clamped to something a real player could have, and unknown ids are dropped.
  CORE.sanitize = function (raw, t) {
    const s = CORE.newState(t);
    if (!raw || typeof raw !== "object") return s;
    const num = (v, a, b, d) => (typeof v === "number" && isFinite(v) ? Math.max(a, Math.min(b, Math.round(v))) : d);
    s.level = num(raw.level, 1, MAX_LV, 1);
    s.exp = num(raw.exp, 0, F.expToNext(s.level), 0);
    s.gold = num(raw.gold, 0, 5e6, 30);
    s.cls = CLASSES[raw.cls] ? raw.cls : null;
    s.map = MAPS[raw.map] ? raw.map : "village";
    s.created = num(raw.created, 0, 4e12, t || 0);
    s.introDone = !!raw.introDone;
    const owned = new Map();
    s.inv = [];
    if (Array.isArray(raw.inv)) for (const it of raw.inv.slice(0, 400)) {
      if (!it || !ITEMS[it.id]) continue;
      const u = num(it.u, 1, 1e7, s.nextU);
      if (owned.has(u)) continue;
      owned.set(u, 1);
      s.inv.push({ u, id: it.id, plus: num(it.plus, 0, 5, 0) });
    }
    if (!s.inv.length) s.inv = [{ u: 1, id: "w_bamboo", plus: 0 }];
    s.nextU = num(raw.nextU, 1, 1e7, Math.max(...s.inv.map((i) => i.u)) + 1);
    s.nextU = Math.max(s.nextU, Math.max(...s.inv.map((i) => i.u)) + 1);
    s.hp = raw.hp == null ? null : num(raw.hp, 0, 999999, null);
    s.mp = raw.mp == null ? null : num(raw.mp, 0, 999999, null);
    s.equip = {};
    for (const sl of GD.SLOTS) {
      const u = raw.equip && raw.equip[sl.id];
      const it = owned.has(u) ? s.inv.find((i) => i.u === u) : null;
      if (it && ITEMS[it.id].slot === sl.id) s.equip[sl.id] = u;
    }
    s.lock = Array.isArray(raw.lock) ? raw.lock.filter((u) => owned.has(u)) : [];
    s.mats = {};
    for (const k in MATS) s.mats[k] = num(raw.mats && raw.mats[k], 0, 9999, 0);
    s.pots = {};
    for (const k in POTIONS) s.pots[k] = num(raw.pots && raw.pots[k], 0, 9999, 0);
    s.quests = {};
    for (const q of QUESTS) {
      const st = raw.quests && raw.quests[q.id];
      if (!st || typeof st !== "object") continue;
      const state = ["active", "done", "claimed"].includes(st.st) ? st.st : "active";
      s.quests[q.id] = { st: state, p: num(st.p, 0, q.n || 1, 0) };
    }
    s.words = {};
    let wn = 0;
    for (const id in raw.words || {}) {
      if (wn++ > 500) break;
      const m = raw.words[id]; if (!m || typeof m !== "object") continue;
      s.words[id] = { seen: num(m.seen, 0, 1e5, 0), c: num(m.c, 0, 1e5, 0), wr: num(m.wr, 0, 1e5, 0), streak: num(m.streak, 0, 1e5, 0), box: num(m.box, 0, 5, 0), due: num(m.due, 0, 4e12, 0), last: num(m.last, 0, 4e12, 0) };
    }
    s.skills = {};
    const raw_skills = raw.skills || {};
    s.cls = s.cls || null;
    for (const id in raw_skills) {
      const sk = SKILLS[id];
      if (!sk || sk.cls !== s.cls) continue;
      s.skills[id] = num(raw_skills[id], 1, sk.max, 1);
    }
    s.spSpent = Object.values(s.skills).reduce((a, b) => a + b, 0);
    s.hotbar = CORE.hotbar(s);
    for (const k in s.settings) if (raw.settings && raw.settings[k] != null) s.settings[k] = raw.settings[k];
    if (!DIFFICULTY[s.settings.diff]) s.settings.diff = "normal";
    if (!GD.PRESSURE[s.settings.press]) s.settings.press = "normal";
    s.stats = Object.assign(s.stats, raw.stats && typeof raw.stats === "object" ? {
      kills: num(raw.stats.kills, 0, 1e7, 0), correct: num(raw.stats.correct, 0, 1e7, 0), wrong: num(raw.stats.wrong, 0, 1e7, 0),
      battles: num(raw.stats.battles, 0, 1e7, 0), forged: num(raw.stats.forged, 0, 1e7, 0), evolved: num(raw.stats.evolved, 0, 100, 0), words: num(raw.stats.words, 0, 1e7, 0),
    } : {});
    s.unlocked = {};
    for (const k in raw.unlocked || {}) if (raw.unlocked[k]) s.unlocked[String(k).slice(0, 30)] = true;
    // the short-lived records the server keeps for itself: the fights it has seen and the
    // respawn clocks it set. They are not the player's to write, but they must survive a reload.
    s.fights = [];
    if (Array.isArray(raw.fights)) for (const f of raw.fights.slice(-6)) {
      if (!f || typeof f.id !== "string" || !MONSTERS[f.m]) continue;
      s.fights.push({ id: f.id.slice(0, 64), m: f.m, at: num(f.at, 0, 4e12, 0), spawnId: String(f.spawnId || "").slice(0, 120) });
    }
    s.kills = {};
    for (const m in raw.kills || {}) if (MONSTERS[m]) s.kills[m] = num(raw.kills[m], 0, 4e12, 0);
    s.spawnKills = {};
    let spawnKillN = 0;
    for (const key in raw.spawnKills || {}) {
      if (spawnKillN++ >= 300) break;
      const spawnKey = String(key).slice(0, 120);
      if (/^[a-z0-9_-]+:\d+:[a-z0-9_-]+$/i.test(spawnKey)) s.spawnKills[spawnKey] = num(raw.spawnKills[key], 0, 4e12, 0);
    }
    s.syncRev = num(raw.syncRev, 0, 1e9, 0);
    s.pos = { map: s.map, x: num(raw.pos && raw.pos.x, 0, 1e6, s.x) };
    s.level = num(s.level, 1, MAX_LV, 1);
    if (s.level < 10) s.cls = null; // a class cannot exist before level 10
    if (s.cls && !CORE.item(s, s.equip.weapon)) { /* leave the weapon empty; the bag still has it */ }
    CORE.clampVitals(s);
    s.vitals = { hp: s.hp, mp: s.mp };
    s.imported = !!raw.v;
    return s;
  };

  CORE.wordCount = (s) => Object.keys(s.words || {}).length;

  root.CORE = CORE;
})(typeof window !== "undefined" ? window : globalThis);
