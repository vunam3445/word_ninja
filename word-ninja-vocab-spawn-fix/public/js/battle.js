// Word Ninja: the continuous typing battle, with class skills.
// One target, one continuous fight: every correct word is one strike, and the fight runs
// until the monster dies, the ninja dies, the target is gone, or the player gives up.
(function () {
  const { MONSTERS, CLASSES, SKILLS, NOVICE_SKILL, PRESSURE, F, DIFFICULTY } = GD;
  const $ = (s) => document.querySelector(s);
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "");
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = Math.random;
  const BUFF_KINDS = { chain: 1, charge: 1, guard: 1, evade: 1, bind: 1, zone: 1, calm: 1, dash: 1 };
  const SKILLPCT = { kiem: "k43", anh: "a43", linh: "l43" };
  const VFX_STATUS_KIND = { guard: "endGuardFx", bind: "endBindFx", zone: "endZoneFx" };
  // the keyboard slot for each learned active skill; 1, 7, 8 stay hint/potions
  window.SKILL_KEYS = ["2", "3", "4", "5", "6", "9", "0", "[", "]"];

  const B = {
    active: false, m: null, state: "idle",
    start(m, opts = {}) {
      if (this.active) return;
      this.active = true; this.m = m; this.spawnId = String(m.spawnId || ""); this.practice = !!opts.practice; this.list = opts.list ? opts.list.slice() : null;
      this.qn = 0; this.combo = 0; this.maxCombo = 0; this.recent = []; this.armed = null; this.enraged = false; this.final = false;
      this.answered = 0; this.correctN = 0; this.log = [];
      this.cd = {}; this.st = {}; this.charge = 0; this.phaseIdx = 0; this.phaseMult = 1; this.phaseChip = 0; this.adds = 0; this.addCfg = null;
      this._vfxCharge = null; this._vfxChainTurns = 0; this._vfxChainStep = 0; this._vfxStatusTurns = {}; this.armedVisualFx = null; this.armedVisualId = null;
      this.fightId = "f" + Date.now().toString(36) + Math.floor(rnd() * 1e6).toString(36);
      this.serverAuthoritative = !this.practice && S.mode === "world" && typeof S.serverCombatQuestion === "function";
      this.serverQuestion = false; this.serverToken = null; this._serverBusy = false;
      m.state = "battle"; m.charging = false;
      if (!this.practice && !this.serverAuthoritative) {
        S.d.stats.battles++;
        S.battleOp(m.mid, this.fightId, this.spawnId);
        S.syncVitals();
      }
      G.scene.placeForBattle(m);
      UI.openBattle(this);
      this.renderSide();
      setTimeout(() => this.next(), 380);
    },

    // ---------------- skills ----------------
    hotbar() { return this.practice ? [] : S.hotbar(); },
    skillFx(id) {
      const r = S.skillRead(id);
      const base = id ? SKILLS[id] : NOVICE_SKILL;
      const fx = base.fx;
      const rank = Math.max(1, r.rank);
      const out = {};
      for (const k in fx) {
        const v = fx[k];
        out[k] = Array.isArray(v) ? v[Math.min(v.length, rank) - 1] : v;
      }
      out.name = base.name; out.icon = base.icon; out.kind0 = fx.kind;
      return out;
    },
    resolveVisualFx(serverFx, skillId) {
      const fallback = this.skillFx(skillId && skillId !== "novice" ? skillId : null);
      if (!serverFx) return fallback;
      const raw = serverFx.fx && !serverFx.kind0 ? serverFx.fx : serverFx;
      return Object.assign({}, fallback, raw, {
        kind0: raw.kind0 || raw.kind || fallback.kind0,
        name: raw.name || fallback.name,
        look: raw.look || fallback.look || null,
      });
    },
    tickServerVfxStatuses() {
      const scene = G.scene;
      for (const kind of Object.keys(this._vfxStatusTurns || {})) {
        if (this._vfxStatusTurns[kind] > 0) this._vfxStatusTurns[kind]--;
        if (this._vfxStatusTurns[kind] <= 0) {
          delete this._vfxStatusTurns[kind];
          const method = VFX_STATUS_KIND[kind];
          if (method && scene && typeof scene[method] === "function") scene[method]();
        }
      }
      if (this._vfxChainTurns > 0) this._vfxChainTurns--;
    },
    playServerAnswerVfx(info, skillId, fx, tags) {
      const scene = G.scene; if (!scene || !this.m) return;
      const cls = S.d.cls; const activeKind = fx && fx.kind0;
      const labels = (tags || []).map((x) => String(x).toLowerCase());
      const chargeDone = !!(this._vfxCharge && labels.some((x) => x.includes("hoàn thành")));
      const chainWasActive = this._vfxChainTurns > 0;
      // Existing effects advance once per server-resolved answer; damage is never calculated here.
      this.tickServerVfxStatuses();
      if (this._vfxCharge && !activeKind && !chargeDone) {
        this._vfxCharge.count = (this._vfxCharge.count || 0) + 1;
        scene.fxChargeStepForClass?.(this._vfxCharge.count, this._vfxCharge.cls || cls);
      }
      let handledByCharge = false;
      if (chargeDone) {
        const charge = this._vfxCharge;
        scene.playChargeFinish?.(this.m, charge.fx, info.dmg, charge.cls || cls);
        this._vfxCharge = null; handledByCharge = true;
      }
      if (fx && activeKind === "charge") {
        scene.castBuff?.(this.m, { id: skillId, kind0: "charge", fx, cls });
        this._vfxCharge = { fx, cls, count: 0 };
      }
      // Persistent stance visuals use the server's skill definition only for presentation.
      if (fx && BUFF_KINDS[activeKind] && activeKind !== "charge" && activeKind !== "dash") {
        scene.castBuff?.(this.m, { id: skillId, kind0: activeKind, fx, cls });
        if (activeKind === "chain") { this._vfxChainTurns = Math.max(0, Number(fx.n || 1) - 1); this._vfxChainStep = 0; }
        if (["guard", "bind", "zone"].includes(activeKind)) this._vfxStatusTurns[activeKind] = Math.max(0, Number(fx.turns || 1) - 1);
      } else if (chainWasActive && !handledByCharge) {
        this._vfxChainStep = Math.min(2, (this._vfxChainStep || 0) + 1);
        scene.fxChainStep?.(this.m, this._vfxChainStep);
      }
      if (handledByCharge) return;
      const hits = activeKind === "multi" ? Math.max(1, Number(fx.hits || 1)) : 1;
      const attackKind = activeKind === "strike" || activeKind === "bind" ? "skill" : activeKind === "multi" ? "double" : "hit";
      const visual = { dmg: info.dmg, crit: info.crit, tags: tags || [], kind: attackKind, hits, look: fx && fx.look || null, skillId: skillId || null, cls };
      if (activeKind === "charge") visual.kind = "hit";
      scene.playHit?.(this.m, visual);
      if (info.crit) scene.procCrit?.(this.m);
      if (skillId && this.passive(SKILLPCT[cls])) scene.procSkillPct?.();
      if (!info.hinted && this.passive("k38b")) scene.procComboDmg?.();
    },
    skillSlots() {
      const hot = this.hotbar();
      const calm = this.st.calm && this.st.calm.turns > 0 ? this.st.calm.v : 0;
      return hot.map((id) => {
        const r = S.skillRead(id);
        const cdLeft = Math.max(0, (this.cd[id || "novice"] || 0));
        const mp = S.skillMp(id, calm);
        const why = cdLeft > 0 ? "cd" : S.d.mp < mp ? "mp" : "";
        return { id, name: r.sk.name, icon: r.sk.icon, mp, cd: cdLeft, ready: !why, why, rank: r.rank };
      });
    },
    useSkill(i) {
      if (this.state !== "ask") return;
      const slots = this.skillSlots();
      const slot = slots[i]; if (!slot) { UI.battleNote("Chưa có kỹ năng ở ô này. Mở cây kỹ năng để học.", "info"); return; }
      if (this.practice) { UI.battleNote("Luyện tập không dùng kỹ năng: đây là chế độ ôn từ.", "info"); return; }
      const key = slot.id || "novice";
      if (this.serverAuthoritative) {
        if (this._serverBusy) return;
        this._serverBusy = true;
        const cancel = this.armed === key;
        S.serverCombatSkill({ fightId: this.fightId, questionToken: this.serverToken, skillId: key, cancel })
          .then((r) => {
            if (!r || !r.ok) { UI.battleNote(r && r.why === 'mp' ? 'Không đủ MP để dùng kỹ năng.' : r && r.why === 'skill-locked' ? 'Kỹ năng chưa mở hoặc chưa gán vào ô phím tắt.' : 'Không thể dùng kỹ năng lúc này.', 'warn'); return; }
            this.armed = cancel ? null : key;
            this.armedVisualId = cancel ? null : (r.skillId || key);
            this.armedVisualFx = cancel ? null : this.resolveVisualFx(r.fx, this.armedVisualId);
            if (!cancel && this.armedVisualFx && this.armedVisualFx.kind0 === "dash") G.scene?.fxDash?.();
            if (!cancel) UI.battleNote((slot.name || 'Kỹ năng') + ' đã sẵn sàng cho câu trả lời đúng tiếp theo.', 'good');
            else UI.battleNote('Đã hủy ' + slot.name + '.', 'info');
            this.renderSide();
          }).catch((e) => UI.battleNote('Không kết nối được máy chủ kỹ năng: ' + (e.message || e), 'warn'))
          .finally(() => { this._serverBusy = false; });
        return;
      }
      if (this.armed === key) { this.armed = null; UI.battleNote("Đã hủy " + slot.name + ".", "info"); S.syncVitals(); this.renderSide(); return; }
      if (this.cd[key] > 0) { UI.battleNote(slot.name + " còn hồi " + this.cd[key] + " câu nữa.", "warn"); return; }
      if (S.d.mp < slot.mp) { UI.battleNote("Cần " + slot.mp + " MP để dùng " + slot.name + " (bạn có " + Math.floor(S.d.mp) + ").", "warn"); return; }
      S.d.mp -= slot.mp; S.syncVitals();
      this.armed = key;
      const fx = this.skillFx(slot.id);
      if (fx.kind0 === "dash") G.scene?.fxDash?.();
      const line = {
        strike: "Câu đúng tiếp theo chém x" + fx.mult + " sát thương",
        multi: "Câu đúng tiếp theo đánh " + fx.hits + " nhịp, mỗi nhịp x" + fx.mult,
        chain: fx.n + " câu đúng tiếp theo, mỗi câu thêm " + fx.bonus + "% sát thương",
        charge: "Câu đúng thứ 3 liên tiếp tung đòn tổng x" + fx.mult,
        guard: fx.turns + " câu tới: giảm " + fx.cut + "% sát thương nhận vào, phản " + fx.reflect + "%",
        evade: fx.turns + " câu tới: " + fx.v + "% né đòn",
        bind: "Trói bóng quái " + fx.turns + " câu: đòn của nó yếu " + fx.slow + "%",
        zone: "Lập trận " + fx.turns + " câu: mỗi câu quái mất " + fx.pct + "% công của bạn",
        calm: fx.turns + " câu: kỹ năng rẻ hơn " + fx.v + "% và chặn đòn quét",
      }[fx.kind0] || "Sẵn sàng";
      UI.battleNote(slot.name + (slot.rank > 1 ? " bậc " + slot.rank : "") + " sẵn sàng: " + line + ".", "good");
      this.renderSide();
    },
    // a passive that fires on its own
    passive(id) { const r = S.skillRead(id); if (!r.rank) return null; return this.skillFx(id); },
    tickStatus() {
      for (const k in this.st) { const t = this.st[k]; if (t && t.turns > 0) { t.turns--; if (t.turns <= 0) delete this.st[k]; } }
      for (const k in this.cd) if (this.cd[k] > 0) this.cd[k]--;
      this.syncStatusFx();
    },
    syncStatusFx() {
      const s = this.st;
      if (!(s.guard && s.guard.turns > 0)) G.scene?.endGuardFx?.();
      if (!(s.bind && s.bind.turns > 0)) G.scene?.endBindFx?.();
      if (!(s.zone && s.zone.turns > 0)) G.scene?.endZoneFx?.();
    },

    timeLimit(entry) {
      if (this.practice) return 0;
      const p = PRESSURE[S.d.settings.press] || PRESSURE.normal;
      if (!p.mult) return 0;
      let bonus = 0;
      const bind = this.st.bind;
      if (bind && bind.turns > 0) bonus += 25;
      const rang = this.passive("l15");
      return F.timeFor(entry) * p.mult * (S.tune.time_mult || 1) * (1 + bonus / 100);
    },

    next() {
      if (!this.active) return;
      if (this.serverAuthoritative) { this.nextServerQuestion(); return; }
      this.qn++;
      const m = this.m;
      let entry;
      if (this.practice) {
        if (!this.list.length) return this.finishPractice();
        entry = this.list.shift();
      } else {
        const phrase = m.def.phraseEvery && this.qn % m.def.phraseEvery === 0;
        entry = S.pickWord(S.poolFor(m.mid, phrase), this.recent);
      }
      this.entry = entry; this.recent.push(entry.id);
      this.answers = [entry.w, ...(entry.alt || [])].map(norm);
      this.buf = ""; this.hints = 0; this.tries = 0; this.given = 0; this.wrongIdx = -1;
      this.tries = (DIFFICULTY[S.d.settings.diff] || DIFFICULTY.normal).tries;
      if (S.d.settings.diff === "easy") { this.buf = entry.w[0]; this.given = 1; }
      this.total = this.timeLimit(entry); this.left = this.total;
      // a boss gathers power on a known question; answering it right breaks the blow
      this.telegraph = false;
      if (!this.practice && m.def.telegraph && this.qn % m.def.telegraph.every === 0) this.telegraph = true;
      m.charging = this.telegraph;
      if (this.telegraph && G.scene) G.scene.playAct("cast");
      this.state = "intro";
      UI.battleQuestion(this);
      setTimeout(() => {
        if (!this.active || this.state !== "intro") return;
        this.state = "ask"; this.t0 = performance.now(); UI.battleReady(this);
        if (this.telegraph) UI.banner(m.def.name + " đang tụ lực!", m.def.telegraph.name + ": trả lời đúng câu này để ngắt đòn.");
      }, 360);
    },

    async nextServerQuestion() {
      if (!this.active || !this.serverAuthoritative || this._serverBusy) return;
      this._serverBusy = true; this.state = "loading"; this.qn++;
      try {
        const answer = await S.serverCombatQuestion(this.m.mid, this.fightId, this.spawnId);
        if (!this.active) return;
        if (!answer || !answer.ok || !answer.question) {
          const reason = answer && answer.why;
          const message = reason === 'respawn' ? 'Quái này đang hồi sinh.' : reason === 'not-here' ? 'Quái không ở bản đồ hiện tại.' : reason === 'map-locked' ? 'Bản đồ đang khóa.' : reason === 'player-dead' ? 'Nhân vật đã hết HP.' : 'Máy chủ chưa tạo được câu hỏi. Hãy thử lại hoặc rút lui.';
          UI.battleNote(message, 'warn');
          this.state = 'ask'; this.total = 0; this.left = 0;
          return;
        }
        const q = answer.question;
        this.serverToken = q.questionToken;
        this.serverQuestion = true;
        this.entry = { id: q.id, w: q.mask || q.w, answerLength: Number(q.answerLength || String(q.mask || q.w).replace(/[^a-z]/gi, '').length), alt: [], vi: q.vi || '', pos: q.pos || '', lv: q.lv || 'A1', t: q.t || 'general', ipa: '', contextHint: q.contextHint || '', exampleHint: q.exampleHint || '' };
        this.answers = []; this.buf = q.initialPrefix || ''; this.given = this.buf.length;
        this.hints = 0; this.tries = Number(q.triesLeft || 1); this.wrongIdx = -1;
        this.total = Number(q.timeLimitSec || 0); this.left = this.total;
        this.combo = Number(answer.combo || 0); this.m.hp = Number(answer.enemyHp ?? this.m.hp); this.m.maxHp = Number(answer.enemyMaxHp ?? this.m.maxHp);
        this.m.state = 'battle'; this.m.charging = false;
        this.telegraph = !!(this.m.def.telegraph && this.m.def.telegraph.every && this.qn % this.m.def.telegraph.every === 0);
        this.m.charging = this.telegraph;
        if (this.telegraph && G.scene) G.scene.playAct('cast');
        this.state = 'intro'; UI.battleQuestion(this);
        setTimeout(() => {
          if (!this.active || this.state !== 'intro') return;
          this.state = 'ask'; this.t0 = performance.now(); UI.battleReady(this);
          if (this.telegraph) UI.banner(this.m.def.name + ' đang tụ lực!', 'Trả lời đúng để ngắt đòn mạnh.');
        }, 250);
      } catch (e) {
        if (this.active) { this.state = 'ask'; this.total = 0; this.left = 0; UI.battleNote('Lỗi kết nối máy chủ: ' + (e.message || e), 'warn'); }
      } finally { this._serverBusy = false; }
    },

    async serverHint() {
      if (!this.serverAuthoritative || this.state !== 'ask' || this._serverBusy) return;
      this._serverBusy = true;
      try {
        const r = await S.serverCombatHint({ fightId: this.fightId, questionToken: this.serverToken });
        if (!r || !r.ok) { UI.battleNote(r && r.why === 'hint-limit' ? 'Không thể dùng thêm gợi ý cho từ này.' : 'Không thể lấy gợi ý lúc này.', 'warn'); return; }
        this.buf = String(r.prefix || ''); this.given = this.buf.length; this.hints = Number(r.hints || this.hints + 1);
        UI.battleBoxes(this);
        UI.battleNote('Gợi ý ' + this.hints + ': sát thương câu này giảm còn ' + Math.round(Number(r.penalty || 1) * 100) + '%.', 'info');
      } catch (e) { UI.battleNote('Không tải được gợi ý: ' + (e.message || e), 'warn'); }
      finally { this._serverBusy = false; }
    },

    async serverSubmit(timeout = false) {
      if (!this.serverAuthoritative || this.state !== 'ask' || this._serverBusy) return;
      if (!timeout && (!norm(this.buf) || norm(this.buf).length <= this.given)) {
        UI.battleNote('Gõ từ tiếng Anh rồi bấm Enter.', 'info'); return;
      }
      this._serverBusy = true; this.state = 'resolving';
      const sentAnswer = this.buf;
      const visualSkillId = this.armedVisualId || this.armed || null;
      const visualSkillFx = this.armedVisualFx || (visualSkillId ? this.resolveVisualFx(null, visualSkillId) : null);
      try {
        const r = await S.serverCombatAnswer({ fightId: this.fightId, monsterId: this.m.mid, questionToken: this.serverToken, answerText: timeout ? '' : sentAnswer, timeout });
        if (!this.active) return;
        if (!r || !r.ok) {
          this.state = 'ask';
          const message = r && r.why === 'too-fast' ? 'Đợi câu hỏi hiển thị xong rồi hãy xác nhận đáp án.' : r && r.why === 'question-expired' ? 'Câu hỏi đã hết hiệu lực. Đang tải câu tiếp theo.' : 'Máy chủ chưa xác nhận được đáp án.';
          UI.battleNote(message, 'warn');
          if (r && r.why === 'question-expired') { this.serverQuestion = false; setTimeout(() => this.nextServerQuestion(), 250); }
          return;
        }
        this.serverToken = this.serverToken;
        this.m.hp = Number(r.enemyHp ?? this.m.hp); this.m.maxHp = Number(r.enemyMaxHp ?? this.m.maxHp);
        if (r.state && r.state.hp <= 0) this.m.charging = false;
        if (r.retry) {
          this.tickServerVfxStatuses();
          this.tries = Number(r.triesLeft || 0); this.state = 'ask'; this.wrongIdx = -1;
          this.left = this.total ? this.total : 0;
          this.t0 = performance.now();
          UI.battleShake(); UI.battleNote('Chưa đúng. ' + (r.damageTaken ? ('Quái gây -' + r.damageTaken + ' HP. ') : '') + 'Còn ' + this.tries + ' lần thử, hãy sửa đáp án.', 'warn');
          UI.battleBoxes(this); this.renderSide();
          return;
        }
        if (!r.correct) {
          this.tickServerVfxStatuses();
          this.serverQuestion = false; this.armed = null; this.armedVisualFx = null; this.armedVisualId = null;
          this.entry = r.revealedEntry || this.entry;
          this.answered++; this.combo = 0; this.log.push({ id: this.entry.id, ok: false });
          this.state = 'reveal';
          UI.battleReveal(this, r.timeout ? 'timeout' : 'wrong', Number(r.damageTaken || 0));
          if (r.playerDefeated || (r.state && r.state.hp <= 0)) setTimeout(() => this.lose(), 600);
          return;
        }
        this.serverQuestion = false; this.armed = null; this.armedVisualFx = null; this.armedVisualId = null;
        this.entry = r.learningEntry || this.entry;
        // Speak only after the server confirms this answer is correct.
        window.WNPronunciation?.speak(this.entry?.w);
        this.answered++; this.correctN++;
        this.combo = Number(r.combo || 0); this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.log.push({ id: this.entry.id, ok: true });
        const info = { dmg: Number(r.damage || 0), tags: r.tags || [], crit: !!r.crit, mem: r.learning || null,
          elapsed: Number(r.elapsed || 0), hinted: Number(r.hints || 0) > 0, hits: 1, final: !!r.monsterDefeated, rewards: r.rewards || [] };
        this.final = !!r.monsterDefeated;
        UI.battleStamp(this, { dmg: info.dmg, tags: info.tags, crit: info.crit, kind: 'hit', hits: 1 });
        this.playServerAnswerVfx(info, visualSkillId, visualSkillFx, info.tags);
        window.mindblown?.event?.('word_correct', { topic: this.entry.t, hinted: info.hinted });
        this.state = 'learn';
        if (this.final) {
          this.m.hp = 0; this.m._vfxDying = true;
          setTimeout(() => { if (this.m) this.m._vfxDying = false; }, 950);
          this.m.state = 'dead'; this.m.rewarded = true; this.m.deadAt = Date.now();
          this.m.charging = false;
          if (G.scene) G.scene.monsterDie(this.m);
          if (r.rewards && r.rewards.length) UI.rewardFly(this.m, r.rewards);
          window.mindblown?.event?.('monster_defeated', { monster: this.m.mid });
          if (this.m.def.tier === 'boss') window.mindblown?.event?.('boss_defeated', { monster: this.m.mid });
        }
        setTimeout(() => { if (this.active) { this.renderSide(); this.showLearn(info); } }, 450);
        if (r.playerDefeated || (r.state && r.state.hp <= 0)) setTimeout(() => this.lose(), 800);
      } catch (e) {
        this.state = 'ask';
        UI.battleNote('Lỗi khi xác nhận với máy chủ: ' + (e.message || e) + '. Có thể thử Enter lại.', 'warn');
      } finally { this._serverBusy = false; }
    },

    tick(dt) {
      if (!this.active || this.state !== "ask" || !this.total) return;
      this.left -= dt;
      UI.battleTimer(this);
      if (this.left <= 0) { this.left = 0; this.fail("timeout"); }
    },

    key(e) {
      if (!this.active) return false;
      const k = e.key;
      if (this.state === "learn" || this.state === "reveal") {
        if (k === "Enter" || k === " ") { this.cont(); return true; }
        return k.length === 1;
      }
      if (k === "Escape") { this.retreat(); return true; }
      if (this.state !== "ask") return k.length === 1 || k === "Backspace" || k === "Enter";
      if (k === "1") { this.hint(); return true; }
      if (window.SKILL_KEYS && window.SKILL_KEYS.includes(k)) { this.useSkill(window.SKILL_KEYS.indexOf(k)); return true; }
      if (k === "7") { this.potion("hp"); return true; }
      if (k === "8") { this.potion("mp"); return true; }
      if (k === "Backspace") { if (this.buf.length > this.given) { this.buf = this.buf.slice(0, -1).replace(/\s+$/, ""); this.wrongIdx = -1; UI.battleBoxes(this); } return true; }
      if (k === "Enter") { this.submit(); return true; }
      if (/^[a-zA-Z]$/.test(k) || k === " " || k === "-" || k === "'") { this.type(k); return true; }
      return false;
    },
    type(ch) {
      if (this.state !== "ask") return;
      const w = this.entry.w;
      if (ch === " ") { if (!/\s/.test(w) || this.buf.endsWith(" ") || !this.buf) return; this.buf += " "; }
      else {
        if (this.buf.length >= w.length + 8) return;
        this.buf += ch.toLowerCase();
        if (w[this.buf.length] === " ") this.buf += " ";
      }
      this.wrongIdx = -1;
      UI.battleBoxes(this);
      if (this.serverAuthoritative) {
        const needed = Number(this.entry.answerLength || String(this.entry.w || '').replace(/[^a-z]/gi, '').length);
        if (norm(this.buf).length >= needed) this.submit();
      } else if (this.answers.includes(norm(this.buf)) && norm(this.buf).length >= Math.min(...this.answers.map((a) => a.length))) this.submit();
    },
    submit() {
      if (this.state !== "ask") return;
      if (this.serverAuthoritative) { this.serverSubmit(false); return; }
      if (!norm(this.buf) || norm(this.buf).length <= this.given) { UI.battleNote("Gõ từ tiếng Anh rồi bấm Enter.", "info"); return; }
      if (this.answers.includes(norm(this.buf))) this.win(); else this.wrong();
    },
    hint() {
      if (this.state !== "ask") return;
      if (this.serverAuthoritative) { this.serverHint(); return; }
      const w = this.entry.w;
      let n = 0; while (n < this.buf.length && this.buf[n] === w[n]) n++;
      if (n >= w.length - 1) { UI.battleNote("Chỉ còn một chữ nữa, bạn tự gõ nhé!", "info"); return; }
      this.buf = w.slice(0, n + 1); if (w[this.buf.length] === " ") this.buf += " ";
      this.hints++;
      UI.battleBoxes(this);
      UI.battleNote(`Gợi ý ${this.hints}: sát thương lần này còn ${Math.round(Math.max(0.25, 1 - 0.25 * this.hints) * 100)}%, từ này chưa tính là đã nhớ.`, "info");
    },
    potion(kind) {
      if (this.state !== "ask" || this.practice) return;
      const st = S.stats();
      const need = st.hp - S.d.hp;
      const hpId = need > 700 && S.d.pots.pot_hp4 > 0 ? "pot_hp4" : need > 240 && S.d.pots.pot_hp3 > 0 ? "pot_hp3" : need > 90 && S.d.pots.pot_hp2 > 0 ? "pot_hp2" : S.d.pots.pot_hp > 0 ? "pot_hp" : S.d.pots.pot_hp2 > 0 ? "pot_hp2" : S.d.pots.pot_hp3 > 0 ? "pot_hp3" : S.d.pots.pot_hp4 > 0 ? "pot_hp4" : null;
      const mpNeed = st.mp - S.d.mp;
      const mpId = mpNeed > 160 && S.d.pots.pot_mp3 > 0 ? "pot_mp3" : mpNeed > 60 && S.d.pots.pot_mp2 > 0 ? "pot_mp2" : S.d.pots.pot_mp > 0 ? "pot_mp" : S.d.pots.pot_mp2 > 0 ? "pot_mp2" : S.d.pots.pot_mp3 > 0 ? "pot_mp3" : null;
      const id = kind === "mp" ? mpId : hpId;
      if (!id) { UI.battleNote(kind === "mp" ? "Hết trà linh khí. Mua ở Cửa hàng của Cô Lựu." : "Hết bình máu. Mua ở Cửa hàng của Cô Lựu.", "warn"); return; }
      if (kind === "mp" ? S.d.mp >= st.mp : S.d.hp >= st.hp) { UI.battleNote(kind === "mp" ? "MP đang đầy." : "Máu đang đầy.", "info"); return; }
      const r = S.usePot(id);
      if (r && r.then) r.then((res) => { if (!res.ok) UI.battleNote("Không dùng được.", "warn"); });
      UI.battleNote(`Đã dùng ${GD.POTIONS[id].name}.`, "good");
      this.renderSide();
    },

    // ---------------- damage ----------------
    damage(elapsed) {
      const st = S.stats(); const e = this.entry; const cls = S.d.cls;
      const letters = e.w.replace(/\s/g, "").length; const phrase = /\s/.test(e.w);
      let d = st.atk, crit = st.crit, tags = [];
      const perStack = (cls === "kiem" ? 0.14 : 0.08) + (st.comboDmg || 0) / 100;
      const cb = Math.min(this.combo, 5) * perStack;
      if (cb) { d *= 1 + cb; tags.push(`Chuỗi x${this.combo + 1}`); }
      d *= phrase ? 1.45 : Math.min(1.35, 1 + 0.04 * Math.max(0, letters - 4));
      if (cls === "linh" && (letters >= 7 || phrase)) { d *= 1.4; tags.push("Linh Ẩn"); }
      if (this.total) {
        if (cls === "anh" && elapsed < this.total * 0.5) { d *= 1.25; crit += 10; tags.push("Ảnh Hành"); }
        else if (elapsed < this.total * 0.4) { d *= 1.1; tags.push("Nhanh"); }
      }
      if (this.hints) d *= Math.max(0.25, 1 - 0.25 * this.hints);
      let hits = 1, kind = "hit", armedId = this.armed, fx = null;
      if (armedId) {
        fx = this.skillFx(armedId === "novice" ? null : armedId);
        if (fx.kind0 === "strike") { d *= fx.mult; tags.push(fx.name + " x" + fx.mult); kind = "skill"; this.armed = null; }
        else if (fx.kind0 === "multi") { hits = fx.hits; d *= fx.mult; tags.push(fx.name + " " + fx.hits + " nhịp"); kind = "double"; this.armed = null; }
        else if (fx.kind0 === "chain") { this.st.chain = { turns: fx.n, bonus: fx.bonus }; tags.push(fx.name); this.armed = null; }
        else if (fx.kind0 === "charge") { this.st.chargeSkill = fx; tags.push(fx.name + " đang tích"); this.armed = null; }
        else if (fx.kind0 === "guard") { this.st.guard = { turns: fx.turns, cut: fx.cut, reflect: fx.reflect }; tags.push(fx.name); this.armed = null; kind = "skill"; this.cd[armedId] = S.skillCd(armedId); }
        else if (fx.kind0 === "evade") { this.st.evade = { turns: fx.turns, v: fx.v }; tags.push(fx.name); this.armed = null; this.cd[armedId] = S.skillCd(armedId); }
        else if (fx.kind0 === "bind") { this.st.bind = { turns: fx.turns, slow: fx.slow }; d *= fx.mult; tags.push(fx.name + " x" + fx.mult); this.armed = null; kind = "skill"; this.cd[armedId] = S.skillCd(armedId); }
        else if (fx.kind0 === "zone") { this.st.zone = { turns: fx.turns, pct: fx.pct }; tags.push(fx.name); this.armed = null; this.cd[armedId] = S.skillCd(armedId); }
        else if (fx.kind0 === "calm") { this.st.calm = { turns: fx.turns, v: fx.v }; tags.push(fx.name); this.armed = null; this.cd[armedId] = S.skillCd(armedId); }
        if (armedId && armedId !== "novice") this.cd[armedId] = Math.max(this.cd[armedId] || 0, S.skillCd(armedId));
      }
      if (armedId && st.skillPower) { d *= 1 + st.skillPower / 100; tags.push("Tâm pháp +" + st.skillPower + "%"); }
      const chain = this.st.chain && this.st.chain.turns > 0 ? this.st.chain.bonus : 0;
      if (chain) { d *= 1 + chain / 100; tags.push("Liên hoàn +" + chain + "%"); }
      // Ảnh Hành's own charge, the passive poison, and Ảnh Hành bậc 3 cooldown are handled after the hit
      const isCrit = rnd() * 100 < crit;
      if (isCrit) { d *= 1.6; tags.push("Chí mạng"); }
      d *= 0.92 + rnd() * 0.16;
      if (fx && fx.kind0 === "multi" && fx.look === "ultimate") tags.push("Tối thượng");
      const buff = (armedId && fx && BUFF_KINDS[fx.kind0]) ? { id: armedId, kind0: fx.kind0, fx, cls } : null;
      return { dmg: Math.max(1, Math.round(d)), crit: isCrit, tags, kind, hits, look: fx ? fx.look : null, skillId: armedId || null, cls, buff };
    },
    // a boss calls helpers: they shield it (half damage) and lash out on a timer until broken
    beginAdds(cfg) {
      this.adds = cfg.n; this.addCfg = cfg;
      if (G.scene) G.scene.summonAdds(this.m, cfg);
      UI.banner(this.m.def.name + " triệu hồi!", cfg.name + " xuất hiện (" + cfg.n + "). Mỗi câu đúng phá một con, chúng đang chắn đòn cho boss.");
    },
    breakOneAdd() {
      this.adds--;
      if (G.scene) G.scene.killOneAdd(this.m);
      UI.floatTag(this.m, (this.addCfg ? this.addCfg.name : "Đồng bọn") + " tan", 3);
      if (this.adds <= 0) {
        this.adds = 0; this.addCfg = null;
        UI.battleNote("Đồng bọn của " + this.m.def.name + " đã bị dẹp. Boss hết chắn đòn.", "good");
      }
    },
    // what happens on the monster after a hit lands
    afterHit() {
      const m = this.m;
      const p = this.passive("a18");
      if (p && rnd() * 100 < p.chance) {
        this.st.poisonMon = { turns: p.turns, dmg: Math.max(1, Math.round(S.stats().atk * p.pct / 100)) };
        UI.floatTag(m, "Độc Ảnh", 2);
        G.scene?.procPoison?.(m);
      }
      const fol = this.passive("k15");
      if (fol && (this.cd.k15 || 0) <= 0 && rnd() * 100 < fol.chance) {
        this.cd.k15 = fol.cd || 2;
        const extra = Math.max(1, Math.round(S.stats().atk * fol.mult));
        m.hp = Math.max(0, m.hp - extra);
        G.scene?.procFollowUp?.(m, extra, false);
        UI.floatTag(m, "Liên Trảm", 3);
      }
      // charge: three correct answers in a row while armed
      const ch = this.st.chargeSkill;
      if (ch) {
        this.charge = (this.charge || 0) + 1;
        if (this.charge >= 3) {
          const total = Math.max(1, Math.round(S.stats().atk * ch.mult));
          m.hp = Math.max(0, m.hp - total);
          G.scene?.playChargeFinish?.(m, ch, total, S.d.cls);
          UI.floatTag(m, ch.name + " hoàn thành", 0);
          this.charge = 0; delete this.st.chargeSkill;
        } else UI.battleNote(ch.name + ": " + this.charge + "/3 câu đúng liên tiếp.", "info");
      }
    },
    // non-answer damage over time, applied each question while it lasts
    statusTick() {
      const m = this.m; if (!m) return;
      const z = this.st.zone, po = this.st.poisonMon;
      if (z && z.turns > 0) {
        const d = Math.max(1, Math.round(S.stats().atk * z.pct / 100));
        m.hp = Math.max(0, m.hp - d); UI.damageNumber(m, d, "hit"); G.scene.hitMonster(m); G.scene?.zonePulse?.(m);
        UI.battleNote("Huyễn Ảnh Trận gây " + d + " sát thương.", "good");
      }
      if (po && po.turns > 0) {
        m.hp = Math.max(0, m.hp - po.dmg); UI.damageNumber(m, po.dmg, "hit"); G.scene?.poisonPulse?.(m);
      }
    },

    win() {
      this.state = "resolving";
      const elapsed = (performance.now() - this.t0) / 1000;
      const m = this.m; const e = this.entry;
      const hinted = this.hints > 0;
      const mem = S.record(e, true, hinted, { practice: this.practice });
      S.answerOp({ id: e.id, t: e.t, lv: e.lv, w: e.w, answerText: this.buf, ok: true, hinted, practice: this.practice, again: this.hintedOnce });
      window.WNPronunciation?.speak(e.w);
      this.answered++; this.correctN++;
      const r = this.practice ? { dmg: 0, crit: false, tags: [], kind: "hit", hits: 1 } : this.damage(elapsed);
      if (!this.practice && this.adds > 0) { r.dmg = Math.max(1, Math.round(r.dmg * 0.5)); r.tags = (r.tags || []).concat(this.addCfg ? this.addCfg.name + " chắn -50%" : "Đồng bọn chắn -50%"); }
      if (!hinted) { this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); } else this.combo = 0;
      this.hintedOnce = this.hintedOnce || hinted;
      if (!this.practice) {
        m.hp = Math.max(0, m.hp - r.dmg);
        if (this.adds > 0) this.breakOneAdd();
        S.d.mp = Math.min(S.stats().mp, S.d.mp + (S.d.cls === "linh" ? 4 : 2));
        const smp = this.passive("l18");
        if (smp && this.combo > 0 && this.combo % smp.streak === 0) { S.d.mp = Math.min(S.stats().mp, S.d.mp + smp.v); UI.floatTag(m, "Hồi Linh +" + smp.v + " MP", 1); G.scene?.procStreakMp?.(smp.v); }
        if (r.buff) G.scene?.castBuff?.(m, r.buff);
        G.scene?.playHit?.(m, r);
        if (r.skillId && this.passive(SKILLPCT[S.d.cls])) G.scene?.procSkillPct?.();
        if (r.crit) G.scene?.procCrit?.(m);
        if (this.passive("k38b") && !hinted) G.scene?.procComboDmg?.();
        const chainWas = !!(this.st.chain && this.st.chain.turns > 0);
        if (!r.buff && chainWas && this.st.chain && this.st.chain.turns > 0) { this.chainStep = Math.min(2, (this.chainStep || 0) + 1); G.scene?.fxChainStep?.(m, this.chainStep); }
        if (r.buff && r.buff.kind0 === "chain") this.chainStep = 0;
        this.afterHit();
        this.tickStatus();
        S.syncVitals();
      }
      if (this.practice) UI.damageNumber(m, "✓", "hit");
      window.mindblown?.event?.("word_correct", { topic: e.t, hinted });
      this.log.push({ id: e.id, ok: true });
      UI.battleStamp(this, r);
      S.emit("change");
      const dead = !this.practice && m.hp <= 0;
      const lastInfo = { dmg: r.dmg, tags: r.tags, crit: r.crit, mem, elapsed, hinted, hits: r.hits };
      setTimeout(() => {
        if (!this.active) return;
        this.renderSide();
        if (dead) this.killed(lastInfo);
        else {
          if (m.def.phases) {
            while (this.phaseIdx < m.def.phases.length && m.hp <= m.maxHp * m.def.phases[this.phaseIdx].at) {
              const ph = m.def.phases[this.phaseIdx]; this.phaseIdx++; this.phaseMult = ph.mult;
              if (ph.chip) this.phaseChip = ph.chip;
              UI.banner(m.def.name + " chuyển giai đoạn!", ph.name + ": đòn đánh mạnh hơn.");
              if (ph.summon) this.beginAdds(ph.summon);
            }
          }
          if (m.def.tier === "boss" && !m.def.phases && !this.enraged && m.hp < m.maxHp / 2) {
            this.enraged = true;
            UI.banner(m.def.name + " nổi giận!", "Đòn đánh mạnh hơn và cứ 2 câu nó tung một đòn nặng.");
          }
          this.showLearn(lastInfo);
        }
      }, 620);
    },

    killed(info) {
      const m = this.m;
      this.final = true;
      if (G.scene && G.scene.clearAdds) G.scene.clearAdds();
      this.adds = 0; this.addCfg = null;
      const fightId = this.fightId;
      const combo = this.maxCombo;
      info.pending = true;
      G.scene.monsterDie(m);
      const settle = (r) => {
        if (!this.active) return;
        info.pending = false;
        if (r && r.ok && r.result) {
          info.rewards = r.result.rewards || [];
          window.mindblown?.event?.("monster_defeated", { monster: m.mid });
          if (m.def.tier === "boss") window.mindblown?.event?.("boss_defeated", { monster: m.mid });
        } else {
          info.rewards = [];
          info.reason = (r && r.why) || "offline";
          UI.toast("Máy chủ chưa xác nhận được trận này" + (r && r.why === "fast" ? " (trận đánh quá nhanh)" : r && r.why === "respawn" ? " (quái chưa hồi sinh)" : "") + ". Không có phần thưởng.", "warn");
        }
        UI.rewardFly(m, info.rewards);
        setTimeout(() => { if (this.active) this.showLearn(info); }, 350);
      };
      const p = S.killOp(m.mid, fightId, combo, this.spawnId);
      if (p && p.then) { UI.battleNote("Đang xác nhận phần thưởng với máy chủ...", "info"); p.then(settle); }
      else settle(p);
    },

    showLearn(info) {
      this.state = "learn";
      UI.showLearn(this.entry, Object.assign({ final: this.final, practice: this.practice, monster: this.m }, info));
    },

    monsterHit(scale, chip) {
      const st = S.stats(); const m = this.m;
      const hard = S.d.settings.diff === "hard" ? 1.3 : 1;
      const bind = this.st.bind && this.st.bind.turns > 0 ? (1 - this.st.bind.slow / 100) : 1;
      const atk = m.def.atk * hard * (this.enraged ? 1.3 : 1) * (this.phaseMult || 1) * (this.adds > 0 ? 1.15 : 1) * scale * bind * (this.telegraphHit ? (m.def.telegraph ? m.def.telegraph.mult : 1) : 1);
      this.telegraphHit = false;
      const evade = (this.st.evade && this.st.evade.turns > 0 ? this.st.evade.v : 0) + (st.dodge || 0);
      if (rnd() * 100 < evade) { UI.floatTag({ x: this.pzX(), y: 0, sprite: G.scene.player }, "Né!", 0); UI.battleNote("Bạn né được đòn đó.", "good"); G.scene?.procDodge?.(); return 0; }
      let cut = this.st.guard && this.st.guard.turns > 0 ? this.st.guard.cut : 0;
      const guard = this.passive("k18");
      if (guard && this.combo >= guard.streak) cut = Math.max(cut, guard.v);
      let dmg = Math.max(1, Math.round(atk * (0.9 + rnd() * 0.2) - st.def * 0.6));
      dmg = Math.max(1, Math.round(dmg * (1 - cut / 100)));
      S.d.hp = Math.max(0, S.d.hp - dmg);
      S.syncVitals();
      G.scene.monsterAttackFx(m, dmg, chip);
      if (this.st.guard && this.st.guard.turns > 0 && dmg > 0) {
        G.scene?.guardBlock?.(m, this.st.guard.reflect);
        const back = Math.max(1, Math.round(dmg * this.st.guard.reflect / 100));
        m.hp = Math.max(0, m.hp - back);
        G.scene.hitMonster(m); UI.damageNumber(m, back, "hit"); UI.floatTag(m, "Phản Kích", 1);
      }
      const shield = this.passive("l22");
      if (shield && !this.shieldUsed && S.d.hp < S.stats().hp * 0.35) {
        this.shieldUsed = true; this.shieldLeft = shield.every;
        const heal = Math.round(S.stats().hp * shield.pct / 100);
        S.d.hp = Math.min(S.stats().hp, S.d.hp + heal);
        UI.floatTag({ x: G.scene.pz.x, y: 0, sprite: G.scene.player }, "Linh Giáp +" + heal, 0);
        G.scene?.procShield?.(heal);
      }
      S.emit("change");
      return dmg;
    },
    pzX() { return G.scene ? G.scene.pz.x : 0; },

    // an answer that is wrong but still has a try left: mark the letter, let them fix it
    wrong() {
      if (this.state !== "ask") return;
      const e = this.entry;
      this.tries--;
      UI.battleShake();
      const w = e.w, n = norm(this.buf);
      let bad = 0;
      const bufRaw = this.buf;
      while (bad < bufRaw.length && bad < w.length && bufRaw[bad].toLowerCase() === w[bad].toLowerCase()) bad++;
      this.wrongIdx = bad;
      UI.battleBoxes(this);
      if (this.tries > 0) {
        if (S.d.settings.diff === "easy") {
          const keep = Math.min(w.length - 1, Math.max(this.given, bad) + 1);
          this.buf = w.slice(0, keep); if (w[this.buf.length] === " ") this.buf += " ";
          this.given = this.buf.length;
        }
        const chip = this.monsterHit(0.4, true);
        this.left = Math.max(this.left, (this.total || 0) * 0.5);
        UI.battleNote("Chưa đúng, chữ thứ " + (bad + 1) + " còn sai" + (chip ? " (-" + chip + " HP)" : "") + ". Còn " + this.tries + " lần thử, sửa lại rồi Enter.", "warn");
        if (S.d.hp <= 0) return this.lose();
        UI.battleBoxes(this);
        return;
      }
      this.giveUpWrong();
    },

    fail(reason) {
      if (this.state !== "ask") return;
      this.tries = 0;
      this.giveUpWrong(reason);
    },
    giveUpWrong(reason) {
      const e = this.entry; const m = this.m;
      this.state = "reveal";
      this.combo = 0;
      S.record(e, false, false, { practice: this.practice });
      S.answerOp({ id: e.id, t: e.t, lv: e.lv, w: e.w, answerText: this.buf, ok: false, practice: this.practice });
      this.answered++;
      this.log.push({ id: e.id, ok: false });
      window.mindblown?.event?.("word_wrong", { topic: e.t, timeout: reason === "timeout" });
      this.telegraphHit = this.telegraph;
      let dmg = 0;
      if (!this.practice) {
        dmg = this.monsterHit(1, false);
        this.tickStatus();
        S.syncVitals();
      }
      UI.battleReveal(this, reason || "wrong", dmg);
      S.save();
      if (S.d.hp <= 0) setTimeout(() => this.lose(), 700);
    },

    cont() {
      if (this.state !== "learn" && this.state !== "reveal") return;
      if (S.d.hp <= 0) return this.lose();
      UI.hideLearn();
      if (this.final) return this.end("won");
      if (this.serverAuthoritative) {
        this.state = 'between'; this.hintedOnce = false;
        setTimeout(() => { if (this.active) this.nextServerQuestion(); }, 180);
        return;
      }
      this.state = "between";
      const m = this.m;
      this.hintedOnce = false;
      this.tickStatus();
      const addEvery = this.adds > 0 && this.addCfg ? this.addCfg.every : 0;
      const chipEvery = addEvery || m.def.chip || (this.enraged ? 2 : 0) || this.phaseChip || (this.phaseIdx > 1 ? 2 : 0);
      const calmed = this.st.calm && this.st.calm.turns > 0;
      if (!this.practice && chipEvery && this.qn % chipEvery === 0 && !calmed) {
        setTimeout(() => {
          if (!this.active) return;
          const dmg = this.monsterHit(0.4, true);
          const src = addEvery ? (this.addCfg ? this.addCfg.name : "Đồng bọn") + " của " + m.def.name : m.def.name;
          UI.battleNote(`${src} tung đòn quét! -${dmg} HP` + (this.st.calm ? "" : " (Tĩnh Tâm sẽ chặn đòn này)"), "warn");
          if (S.d.hp <= 0) return setTimeout(() => this.lose(), 600);
          setTimeout(() => this.next(), 650);
        }, 200);
      } else setTimeout(() => this.next(), 140);
    },

    retreat() {
      if (!this.active || this.state === "lost") return;
      if (this.practice) return this.finishPractice();
      if (!this._fleeAsk) {
        this._fleeAsk = setTimeout(() => { this._fleeAsk = null; }, 2200);
        UI.battleNote("Bấm Esc (hoặc nút Rút lui) lần nữa để bỏ trận này. Mục tiêu sẽ hồi đầy máu.", "warn");
        $("#bFlee").classList.add("armed");
        setTimeout(() => $("#bFlee") && $("#bFlee").classList.remove("armed"), 2200);
        return;
      }
      clearTimeout(this._fleeAsk); this._fleeAsk = null;
      if (this.serverAuthoritative) {
        S.serverCombatRetreat({ fightId: this.fightId }).then(() => {
          this.m.hp = this.m.maxHp;
          UI.toast(`Đã rút lui. ${this.m.def.name} hồi đầy máu.`, "info");
          this.end("retreat");
        }).catch((e) => UI.battleNote('Chưa rút lui được vì máy chủ chưa xác nhận: ' + (e.message || e), 'warn'));
        return;
      }
      this.m.hp = this.m.maxHp;
      UI.toast(`Đã rút lui. ${this.m.def.name} hồi đầy máu.`, "info");
      this.end("retreat");
    },
    finishPractice() {
      const n = this.correctN, all = this.answered;
      UI.toast(all ? `Luyện tập xong: đúng ${n}/${all} từ.` : "Đã dừng luyện tập.", "good");
      this.end("practice");
    },

    lose() {
      if (!this.active || this.state === "lost") return;
      this.state = "lost";
      if (this.serverAuthoritative) S.serverCombatRetreat({ fightId: this.fightId }).catch(() => {});
      if (G.scene && G.scene.clearAdds) G.scene.clearAdds();
      this.adds = 0; this.addCfg = null;
      UI.hideLearn();
      G.scene.playerDie();
      this.m.hp = this.m.maxHp;
      this.m.charging = false;
      G.runEnd("died");
      UI.deathVeil(this.m);
    },

    end(result) {
      const m = this.m;
      this.active = false; this.state = "idle";
      m.charging = false;
      if (G.scene && G.scene.clearAdds) G.scene.clearAdds();
      this.adds = 0; this.addCfg = null;
      if (m.state === "battle") m.state = "wander";
      if (result !== "won" && m.state !== "dead") G.scene.respawnMonster(m);
      UI.closeBattle();
      G.scene.endBattlePose();
      if (result === "won") G.scene.playAct("win");
      S.save();
      G.afterBattle(result);
    },
    renderSide() { UI.battleSide(this); },
  };

  window.BATTLE = B;
})();
