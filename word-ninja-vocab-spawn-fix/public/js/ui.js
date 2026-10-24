// Word Ninja: HUD, plates, floating effects, the battle overlay and the learning card.
(function () {
  const { MONSTERS, CLASSES, ITEMS, MATS, POTIONS, RARITY, F } = GD;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const iconCache = {};
  const POS = window.POS_VI;

  const UI = {
    esc,
    icon(k) {
      if (iconCache[k]) return iconCache[k];
      if (ART.I[k]) return (iconCache[k] = ART.toURL(ART.icon(k, 1.5)));
      if (ART.PROPS[k]) return (iconCache[k] = ART.toURL(ART.prop(k).svg));
      return (iconCache[k] = ART.toURL(ART.icon("coin", 1.5)));
    },
    sealUrl(cls, color) { const k = "seal_" + cls + color; return iconCache[k] || (iconCache[k] = ART.toURL(ART.seal(cls, color, 2))); },
    portrait(cls, weapon, scarf, pose, head) {
      const k = ["por", cls, weapon, scarf, pose, head].join("_");
      if (iconCache[k]) return iconCache[k];
      let s = ART.ninjaPortrait({ cls, weapon }, scarf, pose);
      if (head) s = s.replace(/width="240" height="300" viewBox="0 0 120 150"/, 'width="160" height="160" viewBox="20 12 84 84"');
      return (iconCache[k] = ART.toURL(s));
    },
    npcUrl(id) { const k = "npc_" + id; return iconCache[k] || (iconCache[k] = ART.toURL(ART.npcFrames(id).a)); },
    monUrl(id, mood = "idle") { const k = "mon_" + id + mood; return iconCache[k] || (iconCache[k] = ART.toURL(ART.monsterFrames(id)[mood])); },
    itemIcon(id) { return UI.icon(ITEMS[id] ? ITEMS[id].icon : MATS[id] ? MATS[id].icon : POTIONS[id] ? POTIONS[id].icon : "coin"); },
    coin() { return `<img src="${UI.icon("coin")}" alt="">`; },
  };

  // ---------------- setup ----------------
  UI.init = function () {
    document.querySelectorAll("img[data-ic]").forEach((im) => (im.src = UI.icon(im.dataset.ic)));
    document.querySelectorAll("#tokens .token").forEach((b) => b.addEventListener("click", () => { if (!BATTLE.active) PANELS.open(b.dataset.open); }));
    $("#hudSeal").addEventListener("click", () => { if (BATTLE.active) return; if (S.d.level >= 10 && !S.d.cls) PANELS.classPick(); else PANELS.open("bag"); });
    $("#goal").addEventListener("click", () => { if (!BATTLE.active) PANELS.open("quests"); });
    $("#bHint").onclick = () => BATTLE.hint();
    $("#bPot").onclick = () => BATTLE.potion("hp");
    $("#bMana").onclick = () => BATTLE.potion("mp");
    $("#bFlee").onclick = () => BATTLE.retreat();
    $("#bGo").onclick = () => BATTLE.submit();
    buildKb();
    let q = false;
    S.on("change", () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; UI.refresh(); }); });
    S.on("quest", () => UI.refresh());
    S.on("questdone", (qd) => { UI.toast(`Hoàn thành nhiệm vụ “${esc(qd.name)}”. Về gặp ${esc(GD.NPCS[qd.giver].name)} để nhận thưởng.`, "good"); SND.play("stamp"); });
    S.on("memo", (e) => UI.toast(e.level >= 5 ? `Đã thuộc từ <b>${esc(e.entry.w)}</b>! Đóng dấu ngọc vào Sổ tay.` : `Đang nhớ dần từ <b>${esc(e.entry.w)}</b>.`, e.level >= 5 ? "good" : "info"));
    S.on("status", () => UI.refreshSave());
    S.on("refused", (r) => {
      const why = r.why;
      const say = why === "level" ? `Chưa đủ cấp ${r.r && r.r.lv ? r.r.lv : ""}` : why === "class" ? "Trang bị này dành cho lớp khác" : why === "gold" ? "Không đủ vàng" : why === "mats" ? "Không đủ nguyên liệu" : why === "points" ? "Hết điểm kỹ năng" : why === "max" ? "Đã tối đa" : why === "need" ? "Cần học kỹ năng trước" : null;
      if (say) UI.toast(say + ".", "warn");
    });
    S.on("evolved", (e) => UI.banner("Vũ khí tiến hóa!", "Bậc " + e.tier + ": " + (GD.ITEMS[e.id] ? GD.ITEMS[e.id].name : "")));
    S.on("look", () => G.refreshLook && G.started && G.refreshLook());
    setInterval(padHint, 220);
    let last = performance.now();
    const loop = (t) => { const dt = Math.min(0.1, (t - last) / 1000); last = t; if (BATTLE.active) BATTLE.tick(dt); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };
  UI.titleArt = function () {
    const c = $("#tChars");
    c.innerHTML = `<img class="m" src="${UI.monUrl("radish")}" alt=""><img src="${UI.portrait(null, "sword_bamboo", "#E4D2AA", "win")}" alt=""><img class="m" src="${UI.monUrl("dew")}" alt=""><img class="m" src="${UI.monUrl("mush")}" alt="">`;
  };
  UI.showWorldUi = function (on) { $("#hud").hidden = !on; $("#tokens").hidden = !on; $("#pad").hidden = !on; UI.refresh(); };
  UI.blocking = () => PANELS.isOpen() || PANELS.overOpen() || G.transitioning;
  UI.layout = function () { if (BATTLE.active && BATTLE.entry) UI.battleBoxes(BATTLE); };

  // ---------------- HUD ----------------
  UI.refreshPortrait = function () {
    const url = UI.portrait(S.d.cls, S.weaponLook(), G.scarfColor(), "idle0", true);
    $("#hudSeal").style.backgroundImage = `url("${url}")`;
    $("#hudSeal").classList.toggle("pick", S.d.level >= 10 && !S.d.cls);
  };
  UI.refresh = function () {
    if (!S.d) return;
    const st = S.stats(); const d = S.d;
    const pct = (a, b) => Math.max(0, Math.min(100, (a / b) * 100)) + "%";
    $("#hpFill").style.width = pct(d.hp, st.hp); $("#hpTxt").textContent = `${Math.ceil(d.hp)}/${st.hp}`;
    $("#mpFill").style.width = pct(d.mp, st.mp); $("#mpTxt").textContent = `${Math.floor(d.mp)}/${st.mp}`;
    const need = F.expToNext(d.level);
    $("#xpFill").style.width = pct(d.exp, need); $("#xpTxt").textContent = `EXP ${d.exp}/${need}`;
    document.querySelector(".bar.hp").classList.toggle("low", d.hp / st.hp < 0.3);
    $("#hudLv").textContent = "Lv " + d.level + (d.cls ? " · " + CLASSES[d.cls].name : "");
    $("#hudGold").innerHTML = `${UI.coin()}${d.gold}`;
    $("#hudMap").textContent = GD.MAPS[d.map]?.name || "";
    const g = S.currentGoal();
    $("#goalTxt").textContent = g.line;
    $("#goal").classList.toggle("done", g.state === "done");
    const anyDone = GD.QUESTS.some((q) => S.qs(q.id)?.st === "done");
    const anyNew = GD.QUESTS.some((q) => q.main && S.questAvailable(q));
    $("#qDot").hidden = !(anyDone || anyNew); $("#qDot").classList.toggle("gold", anyDone);
    const due = VOCAB.filter((e) => S.isDue(S.w(e.id))).length;
    $("#bDot").hidden = !due; $("#bDot").classList.add("gold");
    const pts = S.pointsLeft ? S.pointsLeft() : 0;
    $("#sDot").hidden = !(pts > 0); $("#sDot").classList.add("gold");
    UI.refreshSave();
    UI.refreshPortrait();
    if (BATTLE.active) UI.battleSide(BATTLE);
  };
  UI.refreshSave = function () {
    const el = $("#hudSave"); if (!el || !S.d) return;
    const st = S.status.state;
    const map = { saving: ["...", "Đang lưu"], saved: ["✓", "Đã lưu"], error: ["!", "Chưa lưu"] };
    const [ic, title] = map[st] || ["", ""];
    el.textContent = st === "saved" ? "✓" : st === "saving" ? "..." : st === "error" ? "!" : "";
    el.className = "hud-save " + (st || "idle");
    const scope = S.mode === "world" ? "máy chủ (theo tài khoản)" : "trình duyệt này";
    el.title = (st === "error" ? "Chưa lưu được: " + (S.status.text || "") : st === "saving" ? "Đang lưu lên " + scope : st === "saved" ? "Đã lưu lên " + scope : "") ;
  };
  function padHint() {
    const sc = G.scene; if (!sc || !sc.pz || !G.started) return;
    const act = $("#padAct"), hint = $("#padHint");
    if (BATTLE.active || UI.blocking()) return;
    const x = sc.pz.x; let best = null, bd = 170;
    for (const n of sc.npcs || []) { const dd = Math.abs(n.x - x); if (dd < bd) { bd = dd; best = { k: "npc", n }; } }
    for (const m of (sc.monsters || []).concat(sc.dummy ? [sc.dummy] : [])) { if (m.state !== "wander") continue; const dd = Math.abs(m.x - x); if (dd < bd) { bd = dd; best = { k: "m", m }; } }
    const touch = document.body.classList.contains("touch");
    let txt;
    if (best && best.k === "npc") { act.textContent = "Nói"; act.className = "pbtn act npc"; txt = touch ? `Bấm Nói để gặp ${GD.NPCS[best.n.id].name}` : `Bấm E để gặp ${GD.NPCS[best.n.id].name}`; }
    else if (best && best.k === "m") {
      const isD = best.m.mid === "dummy";
      act.textContent = isD ? "Luyện" : "Đánh"; act.className = "pbtn act";
      txt = isD ? (touch ? "Bấm Luyện để ôn từ với hình nộm" : "Bấm E để ôn từ với hình nộm") : (touch ? `Bấm Đánh để chiến đấu với ${best.m.def.name}` : `Bấm E để đánh ${best.m.def.name}`);
    } else {
      act.textContent = "E"; act.className = "pbtn act none";
      txt = touch ? "◀ ▶ để chạy, ▲ để nhảy. Chạm vào quái hoặc NPC để tới gần." : "← → (A D) chạy · ↑ (W, Space) nhảy · E tương tác · hoặc bấm chuột vào quái, NPC";
    }
    if (hint.textContent !== txt) hint.textContent = txt;
  }

  // ---------------- toasts, banners ----------------
  UI.toast = function (html, kind = "info") {
    const t = document.createElement("div"); t.className = "toast paper " + kind; t.innerHTML = html;
    const box = $("#toasts"); box.appendChild(t); while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => t.remove(), 3500);
  };
  UI.banner = function (title, sub) {
    const b = document.createElement("div"); b.className = "banner";
    b.innerHTML = `<div class="bn">${esc(title)}</div>${sub ? `<br><div class="bs">${esc(sub)}</div>` : ""}`;
    document.body.appendChild(b); setTimeout(() => b.remove(), 2700);
  };
  UI.mapBanner = (t, s) => UI.banner(t, s);

  // ---------------- plates ----------------
  const plates = new Map();
  UI.makePlate = function (m) {
    const el = document.createElement("div");
    const tier = m.def.tier;
    el.className = "plate " + tier;
    const name = tier === "boss" ? "Boss · " + m.def.name : tier === "elite" ? m.def.name : m.def.name;
    el.innerHTML = `<div class="pn">${esc(name)}${m.def.lv ? `<small>Lv${m.def.lv}${tier === "elite" ? " · Tinh anh" : ""}</small>` : ""}</div><div class="ph"><i></i></div><div class="php"></div>`;
    $("#plates").appendChild(el);
    m.plate = { el, fill: el.querySelector(".ph i"), txt: el.querySelector(".php"), x: -1, y: -1, hp: -1, vis: null, fight: null };
    plates.set(m, m.plate);
  };
  UI.removePlate = (m) => { if (m.plate) m.plate.el.remove(); plates.delete(m); };
  UI.clearPlates = () => { plates.forEach((p) => p.el.remove()); plates.clear(); };
  UI.updatePlates = function (sc) {
    plates.forEach((p, m) => {
      const vis = (m.state === "wander" || m.state === "battle") && m.sprite.visible && !(G.battle?.active && G.battle.m !== m);
      if (vis !== p.vis) { p.vis = vis; p.el.style.display = vis ? "" : "none"; }
      if (!vis) return;
      const top = m.sprite.y - m.sprite.displayHeight * (m.mid === "elite" ? 0.95 : 1) - 4;
      const s = sc.worldToScreen(m.x, top);
      if (Math.abs(s.x - p.x) > 0.4 || Math.abs(s.y - p.y) > 0.4) { p.x = s.x; p.y = s.y; p.el.style.transform = `translate(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px) translate(-50%,-100%)`; }
      const f = m.state === "battle"; if (f !== p.fight) { p.fight = f; p.el.classList.toggle("fight", f); }
      if (m.hp !== p.hp) { p.hp = m.hp; p.fill.style.width = Math.max(0, (m.hp / m.maxHp) * 100) + "%"; p.txt.textContent = `${Math.max(0, Math.ceil(m.hp))}/${m.maxHp}`; }
    });
  };

  // ---------------- floating fx ----------------
  UI.damageNumber = function (m, val, kind) {
    const sc = G.scene; if (!sc) return;
    const h = m.sprite ? m.sprite.displayHeight : 60;
    const s = sc.worldToScreen(m.x + (Math.random() - 0.5) * 20, (m.y || 0) - h * 0.75);
    const d = document.createElement("div"); d.className = "dmg " + kind;
    d.textContent = kind === "taken" ? "-" + val : val; d.style.left = s.x + "px"; d.style.top = s.y + "px";
    $("#fx").appendChild(d); setTimeout(() => d.remove(), 1300);
  };
  UI.floatTag = function (m, text, i) {
    const sc = G.scene; if (!sc) return;
    const s = sc.worldToScreen(m.x + 50, m.y - m.sprite.displayHeight * 0.4 + i * 18);
    const d = document.createElement("div"); d.className = "dmg tag"; d.textContent = text; d.style.left = s.x + "px"; d.style.top = s.y + "px";
    $("#fx").appendChild(d); setTimeout(() => d.remove(), 1400);
  };
  UI.rewardFly = function (m, got) {
    const sc = G.scene; if (!sc) return;
    const s = sc.worldToScreen(m.x, m.y - m.sprite.displayHeight * 0.5);
    const goldEl = $("#hudGold").getBoundingClientRect(), xpEl = $("#xpFill").parentElement.getBoundingClientRect();
    const fly = (icon, n, tx, ty, delay) => {
      for (let i = 0; i < n; i++) {
        const e = document.createElement("img"); e.className = "mote"; e.src = UI.icon(icon);
        e.style.left = s.x + "px"; e.style.top = s.y + "px"; $("#fx").appendChild(e);
        const ox = (Math.random() - 0.5) * 70, oy = (Math.random() - 0.7) * 50;
        e.style.transform = `translate(${ox}px,${oy}px)`;
        setTimeout(() => { e.style.transform = `translate(${tx - s.x}px,${ty - s.y}px) scale(.6)`; e.style.opacity = "0"; }, 120 + delay + i * 50);
        setTimeout(() => e.remove(), 1200 + delay + i * 50);
      }
    };
    const g = got.find((x) => x.t === "gold"); if (g) { fly("coin", Math.min(8, 3 + Math.floor(g.n / 20)), goldEl.left + 20, goldEl.top + 8, 0); setTimeout(() => SND.play("coin"), 500); }
    if (got.find((x) => x.t === "exp")) fly("exp", 5, xpEl.left + xpEl.width * 0.6, xpEl.top + 4, 150);
    const items = got.filter((x) => x.t === "item");
    items.forEach((x) => { const it = ITEMS[x.id]; setTimeout(() => UI.toast(`Rơi ra: <b>${esc(it.name)}</b> <span style="color:${RARITY[it.rarity].color}">(${RARITY[it.rarity].vi})</span>`, "gold"), 600); });
  };

  // ---------------- battle overlay ----------------
  const bt = { card: $("#bCard") };
  function buildSkillBar(B) {
    const box = $("#bSkills");
    const slots = typeof B.skillSlots === "function" ? B.skillSlots() : [];
    if (B.practice || !slots.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = slots.map((sl, i) => `<button class="sk${sl.ready ? "" : " dis"}${B.armed && (B.armed === sl.id || (!sl.id && B.armed === "novice")) ? " armed" : ""}" data-sk="${i}" title="${esc(sl.name)}${sl.rank > 1 ? " bậc " + sl.rank : ""}">
      <img src="${UI.icon(sl.icon)}" alt=""><b>${(window.SKILL_KEYS || [])[i] || (i + 2)}</b><small>${sl.rank > 1 ? "b" + sl.rank + " · " : ""}${sl.mp} MP</small>${sl.cd ? `<em>${sl.cd}</em>` : ""}</button>`).join("")
      + (B.hotbar()[0] ? "" : `<span class="sk-none">Học kỹ năng ở cây kỹ năng để dùng</span>`);
    box.querySelectorAll("[data-sk]").forEach((b) => (b.onclick = () => BATTLE.useSkill(+b.dataset.sk)));
  }
  UI.buildSkillBar = buildSkillBar;
  UI.openBattle = function (B) {
    $("#battle").hidden = false; $("#tokens").hidden = true; $("#pad").hidden = true; $("#goal").hidden = true;
    buildSkillBar(B);
    $("#bReveal").hidden = true; $("#learn").hidden = true;
    $("#bVi").textContent = "…"; $("#bBoxes").innerHTML = ""; $("#bNote").textContent = ""; $("#bNote").className = "b-note";
    $("#bFleeTxt").textContent = B.practice ? "Dừng luyện" : "Rút lui";
    $("#bPot").style.display = B.practice ? "none" : "";
    $("#bMana").style.display = B.practice ? "none" : "";
    document.querySelector("#battle").classList.remove("learning");
    UI.battleSide(B);
  };
  UI.closeBattle = function () {
    $("#battle").hidden = true; $("#learn").hidden = true; $("#learn").innerHTML = "";
    $("#tokens").hidden = false; $("#pad").hidden = false; $("#goal").hidden = false;
    UI.refresh();
  };
  UI.battleBand = function () {
    const H = G.cssH;
    const c = bt.card.getBoundingClientRect();
    const bb = $("#bBottom").getBoundingClientRect();
    const landscapeShort = G.cssW > G.cssH && G.cssH < 560;
    let top = landscapeShort ? 58 : c.bottom + 44;
    let bottom = bb.height ? bb.top - 4 : H - 10;
    if (bottom - top < 120) top = Math.max(40, bottom - 120);
    return { top, bottom };
  };
  const PRONOUN_CONTEXT_UI = {
    i: "Đại từ chủ ngữ — chỉ người nói, thường đứng trước động từ.",
    me: "Đại từ tân ngữ — chỉ người nói, thường đứng sau động từ hoặc giới từ.",
    he: "Đại từ chủ ngữ — chỉ người được nói đến, thường đứng trước động từ.",
    him: "Đại từ tân ngữ — chỉ người được nói đến, thường đứng sau động từ hoặc giới từ.",
    she: "Đại từ chủ ngữ — chỉ người được nói đến, thường đứng trước động từ.",
    her: "Đại từ tân ngữ — chỉ người được nói đến, thường đứng sau động từ hoặc giới từ.",
    we: "Đại từ chủ ngữ — chỉ nhóm có người nói, thường đứng trước động từ.",
    us: "Đại từ tân ngữ — chỉ nhóm có người nói, thường đứng sau động từ hoặc giới từ.",
    they: "Đại từ chủ ngữ — là chủ thể thực hiện hành động, thường đứng trước động từ.",
    them: "Đại từ tân ngữ — chỉ người/vật nhận tác động, thường đứng sau động từ hoặc giới từ."
  };
  function maskQuestionExample(example, word) {
    const sentence = String(example || "").replace(/\s+/g, " ").trim();
    const target = String(word || "").trim();
    if (!sentence || !target || target.includes("*") || target.includes("_") || target.includes("•")) return "";
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])(${escaped})(?=$|[^\\p{L}\\p{N}_])`, "giu");
    let replaced = false;
    const masked = sentence.replace(pattern, (_match, prefix) => { replaced = true; return `${prefix}_____`; });
    return replaced ? masked : "";
  }
  UI.battleQuestion = function (B) {
    const e = B.entry;
    $("#bPromptLabel").textContent = "Nghĩa tiếng Việt — gõ từ tiếng Anh tương ứng";
    $("#bVi").textContent = e.vi;
    $("#bVi").classList.toggle("phrase", /\s/.test(e.w));
    const contextEl = $("#bContext");
    const grammarHint = e.contextHint || PRONOUN_CONTEXT_UI[String(e.w || "").toLowerCase()] || "";
    const exampleHint = e.exampleHint || maskQuestionExample(e.ex, e.w);
    const contextParts = [];
    if (grammarHint) contextParts.push(grammarHint);
    if (exampleHint) contextParts.push("Ví dụ: " + exampleHint);
    contextEl.textContent = contextParts.join("  ·  ");
    contextEl.hidden = !contextParts.length;
    $("#bTopic").textContent = TOPICS[e.t] || "";
    $("#bPos").textContent = POS[e.pos] || e.pos || "";
    $("#bQn").textContent = B.practice ? `Ôn ${B.qn}/${B.qn + B.list.length}` : `Câu ${B.qn}`;
    $("#bStamp").className = "b-stamp"; $("#bStamp").innerHTML = "";
    $("#bReveal").hidden = true; $("#battle").classList.remove("learning");
    UI.battleBoxes(B); UI.battleTimer(B);
    const n = $("#bNote"); n.className = "b-note";
    const phrase = /\s/.test(e.w);
    const tries = (GD.DIFFICULTY[S.d.settings.diff] || GD.DIFFICULTY.normal).tries;
    n.textContent = B.telegraph ? "Quái đang tụ lực: trả lời đúng câu này để ngắt đòn mạnh!"
      : phrase ? `Cụm ${e.w.split(" ").length} từ: gõ cả dấu cách giữa các từ.`
      : B.qn === 1 && S.d.stats.correct < 3 ? "Gõ từ tiếng Anh phù hợp với nghĩa và gợi ý ngữ cảnh. Gõ đủ chữ là chém."
      : tries > 1 ? "Sai thì chữ sai hiện đỏ, bạn được sửa lại (còn " + tries + " lần thử)." : "";
    if (!reduced()) { bt.card.animate([{ transform: "translateY(-8px)", opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 180, easing: "cubic-bezier(.2,1.4,.5,1)" }); }
  };
  UI.battleReady = function (B) { UI.battleBoxes(B); };
  UI.battleTimer = function (B) {
    const el = $("#bTime");
    if (!B.total) { el.className = "incense none"; $("#bTimeTxt").textContent = "∞"; return; }
    const f = Math.max(0, B.left / B.total);
    $("#bTimeFill").style.width = (f * 100).toFixed(2) + "%";
    $("#bEmber").style.left = (f * 100).toFixed(2) + "%";
    el.className = "incense" + (f < 0.3 ? " late" : "");
    $("#bTimeTxt").textContent = Math.ceil(B.left) + "s";
  };
  UI.battleBoxes = function (B, mode) {
    const w = B.entry.w; const buf = B.buf || "";
    const box = $("#bBoxes");
    const n = Math.max(w.length, buf.length);
    const avail = Math.min(560, G.cssW - 20) - 40;
    const gap = n > 10 ? 3 : 5;
    const units = [...w].reduce((a, c) => a + (c === " " ? 0.45 : 1), 0) + Math.max(0, buf.length - w.length);
    const bw = Math.max(16, Math.min(G.cssH < 560 ? 30 : 40, (avail - gap * (n - 1)) / units));
    box.style.setProperty("--bw", bw.toFixed(1) + "px"); box.style.setProperty("--gap", gap + "px");
    let html = "";
    const active = B.state === "ask" || B.state === "intro";
    for (let i = 0; i < n; i++) {
      const wc = w[i]; const bc = buf[i];
      if (wc === " ") { html += `<div class="lb sp"></div>`; continue; }
      let cls = "lb", ch = bc && bc !== " " ? bc : "";
      if (mode === "reveal") { cls += " jade"; ch = wc || ""; }
      else if (mode === "ok") cls += " ok";
      else {
        if (i < B.given) cls += " given";
        if (i >= w.length) cls += " extra";
        if (B.wrongIdx >= 0 && i === B.wrongIdx) cls += " bad";
        if (active && i === buf.length) cls += " on";
      }
      html += `<div class="${cls}">${esc(ch)}</div>`;
    }
    box.innerHTML = html;
  };
  UI.battleNote = function (text, kind = "info") { const n = $("#bNote"); n.textContent = text; n.className = "b-note " + kind; };
  UI.battleShake = function () {
    SND.play("wrong");
    if (reduced()) return;
    const b = $("#bBoxes"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
  };
  UI.battleStamp = function (B, r) {
    UI.battleBoxes(B, "ok");
    SND.play("slash");
    setTimeout(() => {
      const st = $("#bStamp");
      st.innerHTML = `<img src="${UI.sealUrl(S.d.cls || "novice", "#D2462E")}" width="64" height="64" alt="">`;
      st.className = "b-stamp"; void st.offsetWidth; st.className = "b-stamp go"; SND.play("stamp");
    }, 200);
    if (!B.practice) r.tags.forEach((t, i) => setTimeout(() => UI.floatTag(B.m, t, i), 260 + i * 120));
    const n = $("#bNote"); n.className = "b-note good"; n.textContent = B.practice ? "Đúng rồi!" : `Trúng đòn! -${r.dmg} HP` + (r.tags.length ? " · " + r.tags.join(" · ") : "");
  };
  UI.battleReveal = function (B, reason, dmg) {
    const e = B.entry;
    UI.battleBoxes(B, "reveal");
    const typed = (B.buf || "").trim();
    const r = $("#bReveal");
    r.innerHTML = `<h4>${reason === "timeout" ? "Hết giờ! Nén hương đã tàn." : "Chưa đúng!"}</h4>
      <div class="rw">${esc(e.w)}</div>
      ${e.ipa ? `<div class="lc-ipa">/${esc(e.ipa)}/</div>` : ""}
      <p>${esc(e.vi)} · ${esc(e.def)}${reason !== "timeout" && typed ? `<br><span class="muted">Bạn gõ: “${esc(typed)}”</span>` : ""}${dmg ? `<br><b style="color:var(--ver)">${esc(B.m.def.name)} phản công: -${dmg} HP</b>` : ""}
      <br><span class="muted">Từ này sẽ được hỏi lại sớm.</span></p>
      <button class="btn" id="rvGo">Đánh tiếp (Enter)</button>`;
    r.hidden = false; $("#battle").classList.add("learning");
    r.querySelector("#rvGo").onclick = () => BATTLE.cont();
    UI.battleTimer(B);
  };
  UI.battleSide = function (B) {
    buildSkillBar(B);
    const hp = (S.d.pots.pot_hp || 0) + (S.d.pots.pot_hp2 || 0) + (S.d.pots.pot_hp3 || 0);
    const mp = (S.d.pots.pot_mp || 0) + (S.d.pots.pot_mp2 || 0);
    $("#bPotN").textContent = "còn " + hp; $("#bPot").classList.toggle("dis", !hp);
    $("#bMpN").textContent = "còn " + mp; $("#bMana").classList.toggle("dis", !mp);
    const st2 = S.stats();
    const active = [];
    for (const k of ["guard", "evade", "bind", "zone", "calm", "chain"]) {
      const t = B.st && B.st[k]; if (t && t.turns > 0) active.push(k + " " + t.turns);
    }
    const el = $("#bBuff");
    if (el) { el.hidden = !active.length; el.textContent = active.length ? "Hiệu lực: " + active.join(" · ") : ""; }
  };
  UI.keyFlash = function (k) {
    const el = document.querySelector(`.k[data-k="${k === " " ? "space" : k.toLowerCase()}"]`);
    if (el) { el.classList.add("on"); setTimeout(() => el.classList.remove("on"), 90); }
  };
  function buildKb() {
    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    let h = rows.map((r, i) => `<div class="kr">${[...r].map((c) => `<button class="k" data-k="${c}">${c}</button>`).join("")}${i === 2 ? `<button class="k wide" data-k="backspace">⌫</button>` : ""}</div>`).join("");
    h += `<div class="kr"><button class="k wide" data-k="hint">Gợi ý</button><button class="k space" data-k="space">dấu cách</button><button class="k wide enter" data-k="enter">Chém</button></div>`;
    const kb = $("#kb"); kb.innerHTML = h;
    kb.addEventListener("pointerdown", (ev) => {
      const b = ev.target.closest(".k"); if (!b) return; ev.preventDefault();
      if (!BATTLE.active) return;
      const k = b.dataset.k;
      if (k === "hint") return BATTLE.hint();
      const key = k === "space" ? " " : k === "backspace" ? "Backspace" : k === "enter" ? "Enter" : k;
      BATTLE.key({ key }); SND.play("tick");
    });
  }

  // ---------------- learning card ----------------
  function underline(ex, w) {
    const toks = w.split(/\s+/).map((t) => t.replace(/[^a-z']/gi, "")).filter(Boolean);
    const stem = (t) => (t.length > 4 && /e$/.test(t) ? t.slice(0, -1) : t);
    const re = new RegExp("\\b(" + toks.map((t, i) => esc(stem(t)) + "[a-z]*").join("\\s+") + ")\\b", "i");
    const m = ex.match(re);
    if (!m) return esc(ex);
    return esc(ex.slice(0, m.index)) + "<u>" + esc(m[0]) + "</u>" + esc(ex.slice(m.index + m[0].length));
  }
  UI.underline = underline;
  UI.dots = function (box) { let s = '<span class="dots">'; for (let i = 1; i <= 5; i++) s += `<i class="${i <= box ? "f" + i : ""}"></i>`; return s + "</span>"; };
  UI.memText = (box) => ["Mới gặp", "Mới học", "Đang học", "Đang nhớ", "Nhớ khá", "Đã thuộc"][box] || "";
  UI.entryHtml = function (e) {
    return `<div class="lc-head"><span class="lc-word">${esc(e.w)}</span>${e.ipa ? `<span class="lc-ipa">/${esc(e.ipa)}/</span>` : ""}<span class="lc-pos">${esc(POS[e.pos] || e.pos)} · ${e.lv}</span></div>
      <div class="lc-vi">${esc(e.vi)}</div>
      <p class="lc-def"><b>Definition</b>${esc(e.def)}</p>
      <div class="lc-ex"><div class="en">${underline(e.ex, e.w)}</div><div class="vi">${esc(e.exVi)}</div></div>
      ${e.alt && e.alt.length ? `<p class="muted" style="margin:-4px 0 8px">Cũng chấp nhận: ${e.alt.map(esc).join(", ")}</p>` : ""}`;
  };
  UI.chips = function (got) {
    return got.map((g) => {
      if (g.t === "exp") return `<span class="chip"><img src="${UI.icon("exp")}" alt="">+${g.n} EXP</span>`;
      if (g.t === "gold") return `<span class="chip"><img src="${UI.icon("coin")}" alt="">+${g.n} vàng</span>`;
      if (g.t === "mat") return `<span class="chip"><img src="${UI.icon(MATS[g.id].icon)}" alt="">${esc(MATS[g.id].name)} x${g.n}</span>`;
      if (g.t === "pot") return `<span class="chip"><img src="${UI.icon(POTIONS[g.id].icon)}" alt="">${esc(POTIONS[g.id].name)} x${g.n}</span>`;
      if (g.t === "item") { const it = ITEMS[g.id]; return `<span class="chip r-${it.rarity}"><img src="${UI.icon(it.icon)}" alt="">${esc(it.name)}</span>`; }
      return "";
    }).join("");
  };
  UI.showLearn = function (e, info) {
    const L = $("#learn");
    const mem = info.mem || { before: 0, after: 0 };
    const mastered = mem.after >= 5;
    const sealSrc = mastered ? UI.sealUrl("anh", "#3E8C6E") : UI.sealUrl(S.d.cls || "novice", "#D2462E");
    let info1 = "";
    if (!info.practice) info1 += `<span class="tags">-${info.dmg} HP${info.tags && info.tags.length ? " · " + esc(info.tags.join(" · ")) : ""}</span><br>`;
    info1 += `Ghi nhớ: ${UI.dots(mem.after)} ${UI.memText(mem.after)}${mem.after > mem.before ? ' <span class="up">▲</span>' : ""}${info.hinted ? ' <span class="muted">(dùng gợi ý nên chưa tăng)</span>' : ""}`;
    let rew = "";
    if (info.final) rew = `<h3 style="margin:4px 0">Đã hạ ${esc(info.monster.def.name)}!</h3><div class="lc-rew">${UI.chips(info.rewards || [])}</div>`;
    const btnTxt = info.final ? "Về bản đồ" : info.practice ? "Từ tiếp theo" : "Đánh tiếp";
    L.innerHTML = `<div class="lc paper"><img class="lc-seal" src="${sealSrc}" alt="">${UI.entryHtml(e)}${rew}
      <div class="lc-foot"><div class="lc-info">${info1}</div><button class="btn ${info.final ? "jade" : ""}" id="lcGo">${btnTxt} <small style="opacity:.75;font-size:12px">(Enter)</small></button></div></div>`;
    L.hidden = false; $("#battle").classList.add("learning");
    L.querySelector("#lcGo").onclick = () => BATTLE.cont();
    SND.play("page");
  };
  UI.hideLearn = function () { $("#learn").hidden = true; $("#bReveal").hidden = true; $("#battle").classList.remove("learning"); };
  UI.learnOpen = () => !$("#learn").hidden || !$("#bReveal").hidden;
  UI.deathVeil = (m) => { document.body.classList.add("dead"); PANELS.death(m); };

  window.UI = UI;
})();
