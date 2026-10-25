// Word Ninja: paper panels (NPC, quests, bag, shop, forge, notebook, settings) and full-screen moments (level up, class choice, death).
(function () {
  const { ITEMS, MATS, POTIONS, RARITY, SLOTS, SLOT_VI, QUESTS, NPCS, CLASSES, MONSTERS, MAPS, SKILLS, TREE_POS, EVOLVE, F, PRESSURE, DIFFICULTY } = GD;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => UI.esc(s);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STAT_VI = { atk: "Công", def: "Thủ", hp: "HP", mp: "MP", crit: "Chí mạng", spd: "Tốc chạy" };
  const pctStat = (k) => k === "crit" || k === "spd";
  const statTxt = (k, v) => `${STAT_VI[k]} +${v}${pctStat(k) ? "%" : ""}`;

  const P = { name: null, arg: null, ui: {} };
  const panel = $("#panel"), veil = $("#veil"), over = $("#over");
  panel.classList.add("paper");

  P.isOpen = () => !panel.hidden;
  P.overOpen = () => !over.hidden;

  function frame(title, sub, body, tabs) {
    return `<div class="pn-box"><div class="pn-head"><h2>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ""}</h2><button class="pn-x" data-x aria-label="Đóng">✕</button></div>${tabs || ""}<div class="pn-body">${body}</div></div>`;
  }
  function wire() {
    panel.querySelectorAll("[data-x]").forEach((b) => (b.onclick = () => P.close()));
  }
  function keepScroll(fn) {
    const b = panel.querySelector(".pn-body"); const y = b ? b.scrollTop : 0;
    fn();
    const nb = panel.querySelector(".pn-body"); if (nb) nb.scrollTop = y;
  }

  P.open = function (name, arg) {
    if (BATTLE.active || P.overOpen()) return;
    P.name = name; P.arg = arg;
    document.querySelectorAll(".banner").forEach((b) => b.remove());
    veil.hidden = false; panel.hidden = false; document.body.classList.add("panelopen");
    veil.onclick = () => P.close();
    G.touch.left = G.touch.right = false;
    render();
    SND.play("page");
  };
  // Switching from one visible NPC panel to a connected service (forge/shop/book)
  // is not a new world interaction, so it must not be blocked by the general
  // battle/overlay guard used by P.open().
  P.switchView = function (name, arg = null) {
    if (!VIEWS[name]) { UI.toast("Chức năng này chưa được đăng ký.", "warn"); return; }
    P.name = name; P.arg = arg;
    document.querySelectorAll(".banner").forEach((b) => b.remove());
    veil.hidden = false; panel.hidden = false; document.body.classList.add("panelopen");
    veil.onclick = () => P.close();
    render();
    SND.play("page");
  };
  P.close = function () {
    if (panel.hidden) return;
    panel.hidden = true; veil.hidden = true; panel.innerHTML = ""; document.body.classList.remove("panelopen");
    const was = P.name; P.name = null;
    if (was === "intro" && S.d && !S.d.introDone) { S.d.introDone = true; S.save(); }
    G.block(250);
    UI.refresh();
    if (G.pendingLv.length || (S.d.level >= 10 && !S.d.cls && !G.classAsked)) setTimeout(() => G.flushLevels(), 250);
  };
  P.key = function (e) {
    if (P.name === "intro" && e.key === "Enter") { e.preventDefault(); P.close(); }
  };
  const sig = () => S.d ? JSON.stringify([S.d.gold, S.d.level, S.d.cls, S.d.inv, S.d.equip, S.d.mats, S.d.pots, S.d.quests, S.d.skills, S.d.spSpent, S.d.lock, S.status.state]) : "";
  function render() {
    clearTimeout(P._rt);
    if (panel.hidden) return;
    P._sig = sig();
    const viewName = P.name;
    const f = VIEWS[viewName];
    if (!f) return P.close();
    try {
      keepScroll(() => {
        panel.innerHTML = f(P.arg);
        wire();
        (WIRE[viewName] || (() => {}))(P.arg);
      });
    } catch (err) {
      // Do not leave the previous NPC screen visible when a destination panel fails
      // to render. Report the exact view and show a recoverable message instead.
      console.error("Word Ninja panel render failed:", viewName, err);
      const viewLabel = ({ forge: "lò rèn", shop: "cửa hàng", bag: "túi đồ", skills: "cây kỹ năng", quests: "nhiệm vụ", maps: "bản đồ", book: "sổ tay" })[viewName] || viewName;
      panel.innerHTML = frame("Không mở được giao diện", "Lỗi khi dựng cửa sổ", `<p>Chưa thể mở ${esc(viewLabel)}. Lỗi đã được ghi vào Console. Hãy đóng cửa sổ và thử lại.</p><button class="btn" data-retry-view="${esc(viewName)}">Thử mở lại</button>`);
      wire();
      const retry = panel.querySelector("[data-retry-view]");
      if (retry) retry.onclick = () => { P.name = retry.dataset.retryView; P.arg = null; render(); };
      UI.toast(`Không mở được ${viewLabel}. Hãy xem lỗi trong Console.`, "warn");
    }
  }
  P.render = render;
  S.on("change", () => { if (!panel.hidden && P.name !== "intro" && sig() !== P._sig) { clearTimeout(P._rt); P._rt = setTimeout(render, 30); } });

  // ---------------- helpers ----------------
  const icon = (k) => UI.icon(k);
  function itemCell(it, opts = {}) {
    const d = it && ITEMS[it.id];
    // Old or partially migrated saves must not crash inventory/forge rendering.
    if (!d) return `<div class="cell r-common missing-item" title="Vật phẩm không còn trong dữ liệu game"><span>?</span></div>`;
    return `<button class="cell r-${d.rarity}${opts.sel ? " sel" : ""}" data-u="${it.u}" title="${esc(d.name)}"><img src="${icon(d.icon)}" alt="${esc(d.name)}">${it.plus ? `<span class="plus">+${it.plus}</span>` : ""}${S.isEquipped(it.u) ? '<span class="eq">E</span>' : ""}</button>`;
  }
  function statsLine(id, plus, cmpPlus) {
    const s = F.itemStats(id, plus); const t = cmpPlus != null ? F.itemStats(id, cmpPlus) : null;
    return Object.keys(s).map((k) => `<span>${STAT_VI[k]} <b>+${s[k]}${pctStat(k) ? "%" : ""}</b>${t && t[k] !== s[k] ? ` <span class="up">→ +${t[k]}${pctStat(k) ? "%" : ""}</span>` : ""}</span>`).join("");
  }
  function rewardChips(r) {
    const got = [];
    if (r.exp) got.push({ t: "exp", n: r.exp });
    if (r.gold) got.push({ t: "gold", n: r.gold });
    for (const k in r.mats || {}) got.push({ t: "mat", id: k, n: r.mats[k] });
    for (const k in r.pots || {}) got.push({ t: "pot", id: k, n: r.pots[k] });
    for (const id of r.items || []) got.push({ t: "item", id });
    let h = UI.chips(got);
    if (r.unlock) h += `<span class="chip">Mở: ${esc((MAPS[r.unlock] || {}).name || r.unlock)}</span>`;
    return h;
  }
  function tally(p, n) {
    if (n > 12) return `<span class="tally" aria-hidden="true"></span>`;
    let s = '<span class="tally" aria-hidden="true">'; for (let i = 0; i < n; i++) s += `<i class="${i < p ? "on" : ""}"></i>`; return s + "</span>";
  }
  function questState(q) {
    const st = S.qs(q.id);
    if (!st) return S.questAvailable(q) ? "new" : "locked";
    if (st.st === "claimed") return S.questAvailable(q) ? "new" : "claimed";
    return st.st; // active | done
  }
  const ST_VI = { new: "Có thể nhận", active: "Đang làm", done: "Hoàn thành", claimed: "Đã nhận thưởng", locked: "Chưa mở" };
  function questNote(q, i, atNpc) {
    const state = questState(q); const npc = NPCS[q.giver];
    const p = S.questProgress(q), n = S.questGoal(q);
    let act = "";
    if (state === "new") act = atNpc ? `<button class="btn sm" data-accept="${q.id}">Nhận nhiệm vụ</button>` : `<span class="muted">Gặp ${esc(npc.name)} ở làng để nhận.</span>`;
    if (state === "done") act = atNpc ? `<button class="btn sm jade" data-claim="${q.id}">Nhận thưởng</button>` : `<span class="muted">Về gặp ${esc(npc.name)} ở làng để nhận thưởng.</span>`;
    const obj = state === "active" || state === "done" ? `<div class="obj">${esc(S.objectiveText(q))}${tally(p, n)}</div>` : state === "locked" ? `<div class="muted">${q.type === "evolve" ? "Mở ở cấp " + (EVOLVE[q.tier] || {}).lv + ": " : q.type === "level" ? "Cần cấp " + q.n + ": " : ""}hoàn thành nhiệm vụ chính trước đó.</div>` : "";
    return `<div class="note ${state}" style="--r:${(i % 3 - 1) * 0.7}deg"><div class="row"><h4 class="sp">${esc(q.name)}</h4><span class="st ${state === "active" ? "act" : state}">${ST_VI[state]}</span></div>
      <div class="giver">${q.main ? "Chính tuyến" : "Lặp lại"} · ${esc(npc.name)}</div>
      <div class="qt">${esc(q.text)}</div>${obj}
      <div class="rew">${rewardChips(q.reward)}</div>${act}</div>`;
  }
  function wireQuestButtons() {
    panel.querySelectorAll("[data-accept]").forEach((b) => (b.onclick = () => {
      S.accept(b.dataset.accept); SND.play("stamp");
      UI.toast(`Đã nhận nhiệm vụ “${esc(S.questDef(b.dataset.accept).name)}”.`, "info"); S.save(); render();
    }));
    panel.querySelectorAll("[data-claim]").forEach((b) => (b.onclick = async () => {
      b.disabled = true;
      const q = S.questDef(b.dataset.claim);
      const r = await S.claim(q.id);
      if (!r || !r.ok) { UI.toast("Chưa nhận được thưởng. Kiểm tra kết nối rồi thử lại.", "warn"); render(); return; }
      const got = r.result.got || [];
      SND.play("coin"); UI.toast(`Đã nhận thưởng: ${UI.chips(got)}`, "gold");
      const unlocked = Object.keys(S.d.unlocked).filter((k) => MAPS[k] && MAPS[k].req && MAPS[k].req.flag === k);
      for (const k of unlocked) if (S.d.unlocked[k]) UI.banner("Đã mở " + MAPS[k].name, "Đi tới cổng bên phải của bản đồ trước, hoặc dùng bảng Bản đồ.");
      if (q.id === "q9") UI.banner("Đã có lớp!", "Vũ khí lớp đã ở trong túi đồ. Mở cây kỹ năng để học chiêu đầu tiên.");
      if (q.id === "q27") UI.banner("Hết chương 1!", "Bạn đã hạ Thủ Lĩnh U Minh và rèn vũ khí tối thượng. Làng Mộc Bản nhớ ơn bạn.");
      S.save(true); render();
    }));
  }

  // ---------------- views ----------------
  const VIEWS = {}, WIRE = {};

  // NPC
  VIEWS.npc = function (id) {
    const n = NPCS[id];
    const qs = S.questsFor(id);
    const line = qs.some((q) => questState(q) === "done") ? "Làm tốt lắm! Đây là phần thưởng của con." : qs.some((q) => questState(q) === "new") ? "Ta có việc này nhờ con." : n.lines[Math.floor(Math.random() * n.lines.length)];
    let acts = "";
    if (id === "shop") acts += `<button class="btn" data-go="shop">Mở cửa hàng</button>`;
    if (id === "smith") acts += `<button class="btn" data-go="forge">Mở lò rèn</button>`;
    if (id === "scholar") acts += `<button class="btn" data-go="book">Mở Sổ tay</button><button class="btn ghost" data-go="practice">Luyện lại từ</button>`;
    if (id === "elder") acts += `<button class="btn ghost" data-go="quests">Bảng nhiệm vụ</button>`;
    const notes = qs.length ? `<h3>Nhiệm vụ</h3><div class="board">${qs.map((q, i) => questNote(q, i, true)).join("")}</div>` : "";
    return frame(n.name, n.role, `<div class="npc"><img class="npc-por" src="${UI.npcUrl(id)}" alt=""><div class="npc-say">${esc(line)}</div></div><div class="npc-acts">${acts}</div>${notes}`);
  };
  WIRE.npc = function () {
    panel.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => {
      const g = b.dataset.go;
      if (g === "practice") {
        P.name = "practice"; P.arg = null; render();
        return;
      }
      // Use the canonical panel-opening path rather than mutating the active view
      // in place. This keeps overlay visibility, audio, cleanup and routing consistent.
      P.switchView(g, null);
    }));
    wireQuestButtons();
  };
  UI.openNpc = (id) => P.open("npc", id);

  // Quests
  VIEWS.quests = function () {
    const vis = QUESTS.filter((q) => { const s = questState(q); return s !== "locked" && !(s === "claimed" && q.repeat); });
    vis.sort((a, b) => ["done", "active", "new", "claimed"].indexOf(questState(a)) - ["done", "active", "new", "claimed"].indexOf(questState(b)));
    const inVillage = G.scene && G.scene.mapId === "village";
    const mainDone = QUESTS.filter((q) => q.main && S.qs(q.id)?.st === "claimed").length, mainAll = QUESTS.filter((q) => q.main).length;
    return frame("Bảng nhiệm vụ", `Chính tuyến ${mainDone}/${mainAll}`, `<p class="muted">Nhận và trả nhiệm vụ bằng cách nói chuyện với NPC giao nhiệm vụ ở Làng Mộc Bản${inVillage ? "" : " (bạn đang ở ngoài làng)"}.</p><div class="board">${vis.map((q, i) => questNote(q, i, false)).join("")}</div>`);
  };

  // Bag
  P.ui.bag = { tab: "gear", sel: null };
  VIEWS.bag = function () {
    const u = P.ui.bag; const st = S.stats();
    const L = ["hat", "mask", "necklace", "weapon", "armor"], R = ["pants", "gloves", "boots", "ring", "belt", "jade"];
    const slot = (sid) => {
      const it = S.equipped(sid);
      const tint = () => (S.canEquip(it).ok ? "" : " locked");
      if (!it) return `<button class="slot empty" data-slot="${sid}" title="${SLOT_VI[sid]}"><img class="ghost" src="${icon(SLOT_ICON[sid])}" alt=""><span class="sl">${SLOT_VI[sid]}</span></button>`;
      const d = ITEMS[it.id];
      return `<button class="slot r-${d.rarity}${u.sel === it.u ? " sel" : ""}${tint()}" data-u="${it.u}" title="${esc(d.name)}"><img src="${icon(d.icon)}" alt="${esc(d.name)}">${it.plus ? `<span class="plus">+${it.plus}</span>` : ""}</button>`;
    };
    const por = UI.portrait(S.d.cls, S.weaponLook(), G.scarfColor(), "idle0");
    const doll = `<div><div class="doll"><div class="doll-c">${L.map(slot).join("")}</div><div class="doll-m"><img src="${por}" alt="Ninja"><b style="font-family:var(--f-title)">Lv ${S.d.level}${S.d.cls ? " · " + CLASSES[S.d.cls].name : ""}</b></div><div class="doll-c">${R.map(slot).join("")}</div></div>
      <div class="statl"><span>HP <b>${Math.ceil(S.d.hp)}/${st.hp}</b></span><span>MP <b>${Math.floor(S.d.mp)}/${st.mp}</b></span><span>Công <b>${st.atk}</b></span><span>Thủ <b>${st.def}</b></span><span>Chí mạng <b>${st.crit}%</b></span><span>Tốc chạy <b>+${st.spd}%</b></span></div></div>`;
    const tabs = `<div class="ribbons" style="margin-bottom:8px"><button class="rib${u.tab === "gear" ? " on" : ""}" data-tab="gear">Trang bị</button><button class="rib${u.tab === "mats" ? " on" : ""}" data-tab="mats">Nguyên liệu, thuốc</button><button class="rib${u.tab === "quest" ? " on" : ""}" data-tab="quest">Nhiệm vụ</button></div>`;
    let grid = "", detail = "";
    if (u.tab === "gear") {
      const items = S.d.inv.slice().sort((a, b) => (S.isEquipped(b.u) - S.isEquipped(a.u)) || (RARITY[ITEMS[b.id].rarity].rank - RARITY[ITEMS[a.id].rarity].rank));
      grid = `<div class="grid">${items.map((it) => itemCell(it, { sel: u.sel === it.u })).join("")}</div>
        <p class="muted" style="margin-top:8px">Ô xám là món chưa dùng được: thiếu cấp hoặc của lớp khác. Bán đồ ở Cửa hàng, cường hóa và tiến hóa ở Lò rèn.</p>`;
      const it = u.sel != null ? S.item(u.sel) : null;
      if (it) {
        const d = ITEMS[it.id]; const eq = S.isEquipped(it.u);
        const cur = S.equipped(d.slot);
        const can = S.canEquip(it);
        const lockedTxt = !can.ok ? `<p class="lockmsg">Khóa: ${can.why === "level" ? "cần cấp " + d.lv : can.why === "class" ? "chỉ lớp " + CLASSES[d.cls].name + " dùng được" : "không dùng được"}</p>` : "";
        const cmp = !eq && cur ? `<p class="muted">Đang mặc ở ô ${SLOT_VI[d.slot]}: ${esc(ITEMS[cur.id].name)}${cur.plus ? " +" + cur.plus : ""} (${Object.entries(F.itemStats(cur.id, cur.plus)).map(([k, v]) => statTxt(k, v)).join(", ")})</p>` : "";
        const isLocked = (S.d.lock || []).includes(it.u);
        detail = `<div class="detail"><div class="row"><h4 class="sp">${esc(d.name)}${it.plus ? " +" + it.plus : ""}</h4><span class="rar" style="color:${RARITY[d.rarity].color}">${RARITY[d.rarity].vi}</span></div>
          <div class="muted">${SLOT_VI[d.slot]} · Cường hóa +${it.plus}/5 · Cấp yêu cầu ${d.lv || 1}${d.cls ? " · Lớp " + CLASSES[d.cls].name : ""}${eq ? " · Đang trang bị" : ""}${isLocked ? " · Đã khóa" : ""}</div>
          <div class="sts">${statsLine(it.id, it.plus)}</div><p class="muted" style="margin:0 0 8px">${esc(d.desc)}</p>
          ${d.src ? `<p class="muted" style="margin:0 0 8px">Nguồn: ${esc(d.src)}</p>` : ""}${lockedTxt}${cmp}
          <div class="row">${eq ? `<button class="btn ghost sm" data-unequip="${d.slot}">Tháo ra</button>` : `<button class="btn sm" data-equip="${it.u}"${can.ok ? "" : " disabled"}>Trang bị</button>`}<button class="btn ghost sm" data-lock="${it.u}">${isLocked ? "Mở khóa" : "Khóa"}</button>${d.evolve && d.tier ? `<button class="btn gold sm" data-goto="forge">Tiến hóa ở Lò rèn</button>` : ""}</div></div>`;
      } else detail = `<p class="muted" style="margin-top:10px">Chọn một món để xem chỉ số, trang bị hoặc tháo ra. Bán đồ ở Cửa hàng, cường hóa và tiến hóa ở Lò rèn.</p>`;
    } else if (u.tab === "quest") {
      const rows = [];
      for (const k in S.d.mats) if (S.d.mats[k] > 0) rows.push(`<button class="ware" data-k="${k}"><img src="${icon(MATS[k].icon)}" alt=""><div><div class="wn">${esc(MATS[k].name)}</div><div class="ws">${esc(MATS[k].desc)}</div></div></button>`);
      grid = `<p class="muted" style="margin-bottom:8px">Nguyên liệu nhiệm vụ và nguyên liệu tiến hóa vũ khí.</p>` + (rows.length ? `<div class="shop">${rows.join("")}</div>` : `<p class="muted">Chưa có nguyên liệu nào.</p>`);
      detail = "";
    } else {
      const cells = [];
      for (const k in POTIONS) if (S.d.pots[k] > 0) cells.push(`<button class="cell${u.sel === k ? " sel" : ""}" data-k="${k}" title="${esc(POTIONS[k].name)}"><img src="${icon(POTIONS[k].icon)}" alt=""><span class="n">${S.d.pots[k]}</span></button>`);
      for (const k in MATS) if (S.d.mats[k] > 0) cells.push(`<button class="cell${u.sel === k ? " sel" : ""}" data-k="${k}" title="${esc(MATS[k].name)}"><img src="${icon(MATS[k].icon)}" alt=""><span class="n">${S.d.mats[k]}</span></button>`);
      grid = cells.length ? `<div class="grid">${cells.join("")}</div>` : `<p class="muted">Chưa có nguyên liệu hay thuốc nào.</p>`;
      const k = typeof u.sel === "string" ? u.sel : null;
      if (k && POTIONS[k]) detail = `<div class="detail"><h4>${esc(POTIONS[k].name)}</h4><p class="muted" style="margin:4px 0 8px">${esc(POTIONS[k].desc)} Còn ${S.d.pots[k] || 0}.</p><button class="btn sm jade" data-use="${k}">Dùng</button></div>`;
      else if (k && MATS[k]) detail = `<div class="detail"><h4>${esc(MATS[k].name)}</h4><p class="muted" style="margin:4px 0 0">${esc(MATS[k].desc)} Có ${S.d.mats[k] || 0}.</p></div>`;
    }
    return frame("Túi đồ", `${S.d.gold} vàng`, `<div class="bag">${doll}<div>${tabs}${grid}${detail}</div></div>`);
  };
  const SLOT_ICON = { hat: "hat_straw", mask: "mask_fox", necklace: "neck_bead", weapon: "sword_bamboo", armor: "armor_cloth", ring: "ring_copper", gloves: "gloves_wrap", boots: "boots_straw" };
  WIRE.bag = function () {
    const u = P.ui.bag;
    panel.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { u.tab = b.dataset.tab; u.sel = null; render(); }));
    panel.querySelectorAll("[data-u]").forEach((b) => (b.onclick = () => { u.tab = "gear"; u.sel = +b.dataset.u; render(); }));
    panel.querySelectorAll("[data-slot]").forEach((b) => (b.onclick = () => { const s = b.dataset.slot; const has = S.d.inv.find((i) => ITEMS[i.id].slot === s && !S.isEquipped(i.u)); u.tab = "gear"; u.sel = has ? has.u : null; if (!has) UI.toast(`Chưa có món nào cho ô ${SLOT_VI[s]}. Mua ở Cửa hàng hoặc săn quái để có.`, "info"); render(); }));
    panel.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => { u.sel = b.dataset.k; render(); }));
    panel.querySelectorAll("[data-equip]").forEach((b) => (b.onclick = () => { if (b.disabled) return; S.equip(+b.dataset.equip); SND.play("stamp"); S.save(); render(); }));
    panel.querySelectorAll("[data-unequip]").forEach((b) => (b.onclick = () => { S.unequip(b.dataset.unequip); S.save(); render(); }));
    panel.querySelectorAll("[data-lock]").forEach((b) => (b.onclick = () => { S.lockItem(+b.dataset.lock); SND.play("stamp"); render(); }));
    panel.querySelectorAll("[data-goto]").forEach((b) => (b.onclick = () => { P.name = b.dataset.goto; P.arg = null; render(); }));
    panel.querySelectorAll("[data-use]").forEach((b) => (b.onclick = () => { if (S.usePot(b.dataset.use)) { UI.toast(`Đã dùng ${esc(POTIONS[b.dataset.use].name)}.`, "good"); S.save(); } else UI.toast("Đang đầy, chưa cần dùng.", "info"); render(); }));
  };

  // Shop
  P.ui.shop = { tab: "buy" };
  VIEWS.shop = function () {
    const u = P.ui.shop;
    const tabs = `<div class="ribbons"><button class="rib${u.tab === "buy" ? " on" : ""}" data-tab="buy">Mua</button><button class="rib${u.tab === "sell" ? " on" : ""}" data-tab="sell">Bán</button></div>`;
    let body = "";
    const price = (n) => `<span class="price">${UI.coin()}${n}</span>`;
    if (u.tab === "buy") {
      const wares = [];
      for (const k in POTIONS) { if (POTIONS[k].lv && POTIONS[k].lv > S.d.level) continue; wares.push({ kind: "pot", id: k, name: POTIONS[k].name, ic: POTIONS[k].icon, price: POTIONS[k].price, sub: POTIONS[k].desc, own: S.d.pots[k] || 0 }); }
      wares.push({ kind: "mat", id: "stone", name: MATS.stone.name, ic: MATS.stone.icon, price: MATS.stone.price, sub: MATS.stone.desc, own: S.d.mats.stone || 0 });
      for (const k in ITEMS) { const d = ITEMS[k]; if (!d.price) continue; wares.push({ kind: "item", id: k, name: d.name, ic: d.icon, price: d.price, sub: `${SLOT_VI[d.slot]} · ${Object.entries(d.stats).map(([a, v]) => statTxt(a, v)).join(", ")}`, rar: d.rarity, own: S.d.inv.filter((i) => i.id === k).length }); }
      body = `<div class="shop">${wares.map((w) => `<button class="ware${S.d.gold < w.price ? " no" : ""}${w.rar ? " r-" + w.rar : ""}" data-buy="${w.kind}:${w.id}"><img src="${icon(w.ic)}" alt=""><div><div class="wn">${esc(w.name)}</div><div class="ws">${esc(w.sub)}</div><div class="row" style="gap:6px;margin-top:3px">${price(w.price)}${w.own ? `<span class="muted">Có ${w.own}</span>` : ""}</div></div></button>`).join("")}</div>`;
    } else {
      const items = S.d.inv.filter((i) => !S.isEquipped(i.u));
      const mats = Object.keys(MATS).filter((k) => S.d.mats[k] > 0);
      body = items.length || mats.length ? `<div class="shop">${items.map((it) => { const d = ITEMS[it.id]; return `<button class="ware r-${d.rarity}" data-sell="${it.u}"><img src="${icon(d.icon)}" alt=""><div><div class="wn">${esc(d.name)}${it.plus ? " +" + it.plus : ""}</div><div class="ws">${RARITY[d.rarity].vi} · ${SLOT_VI[d.slot]}</div>${price(S.sellPrice(it))}</div></button>`; }).join("")}
        ${mats.map((k) => `<button class="ware" data-sellm="${k}"><img src="${icon(MATS[k].icon)}" alt=""><div><div class="wn">${esc(MATS[k].name)}</div><div class="ws">Có ${S.d.mats[k]}. Bán 1 cái</div>${price(MATS[k].sell)}</div></button>`).join("")}</div>`
        : `<p class="muted">Không có gì để bán. Đồ đang mặc không bán được.</p>`;
      body = `<p class="muted">Bấm vào một món để bán. Đồ đang mặc không hiện ở đây.</p>` + body;
    }
    return frame("Cửa hàng Cô Lựu", `Bạn có ${S.d.gold} vàng`, tabs + body);
  };
  WIRE.shop = function () {
    const u = P.ui.shop;
    panel.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { u.tab = b.dataset.tab; render(); }));
    panel.querySelectorAll("[data-buy]").forEach((b) => (b.onclick = async () => {
      const [kind, id] = b.dataset.buy.split(":");
      const pr = kind === "pot" ? POTIONS[id].price : kind === "mat" ? MATS[id].price : ITEMS[id].price;
      if (S.d.gold < pr) { UI.toast(`Cần ${pr} vàng, bạn có ${S.d.gold}. Săn quái để kiếm thêm.`, "warn"); return; }
      const r = await S.buy(kind, id);
      if (!r || !r.ok) {
        UI.toast(r && r.why === "level" ? `Món này cần cấp ${r.lv}.` : r && r.why === "class" ? "Món này chỉ dành cho một lớp khác." : "Chưa mua được. Kiểm tra kết nối rồi thử lại.", "warn");
        render(); return;
      }
      if (kind === "item" && r.result.u) P.ui.bag.sel = r.result.u;
      SND.play("coin"); UI.toast(`Đã mua ${esc(kind === "pot" ? POTIONS[id].name : kind === "mat" ? MATS[id].name : ITEMS[id].name)}.${kind === "item" ? " Mở Túi đồ để trang bị." : ""}`, "good");
      window.mindblown?.event?.("shop_buy", { id }); S.save(); render();
    }));
    panel.querySelectorAll("[data-sell]").forEach((b) => (b.onclick = async () => {
      const it = S.item(+b.dataset.sell); if (!it) return;
      const p = S.sellPrice(it);
      const r = await S.sell(it.u);
      if (r && r.ok) { SND.play("coin"); UI.toast(`Đã bán ${esc(ITEMS[it.id].name)} được ${p} vàng.`, "gold"); S.save(); render(); }
      else UI.toast(r && r.why === "equipped" ? "Đồ đang mặc không bán được." : r && r.why === "locked" ? "Món này đang khóa." : "Chưa bán được.", "warn");
    }));
    panel.querySelectorAll("[data-sellm]").forEach((b) => (b.onclick = async () => {
      const k = b.dataset.sellm;
      const r = await S.sellMat(k);
      if (r && r.ok) { SND.play("coin"); UI.toast(`Đã bán 1 ${esc(MATS[k].name)} được ${MATS[k].sell} vàng.`, "gold"); render(); }
      else UI.toast(r && r.why === "core" ? "Lõi U Minh không bán được: nó là chìa khóa của chương." : "Không còn gì để bán.", "warn");
    }));
  };

  // Forge
  P.ui.forge = { sel: null };
  VIEWS.forge = function () {
    const u = P.ui.forge;
    const items = S.d.inv.filter((item) => item && ITEMS[item.id]).slice().sort((a, b) => (Number(S.isEquipped(b.u)) - Number(S.isEquipped(a.u))) || ((b.plus || 0) - (a.plus || 0)));
    const selected = u.sel == null ? null : S.item(u.sel);
    if (!selected || !ITEMS[selected.id]) {
      const equipped = S.equipped("weapon");
      u.sel = equipped && ITEMS[equipped.id] ? equipped.u : ((items[0] || {}).u ?? null);
    }
    const current = u.sel != null ? S.item(u.sel) : null;
    const it = current && ITEMS[current.id] ? current : null;
    let anvil = `<div class="anvil"><img class="big" src="${icon("anvil")}" alt=""><p class="muted">Chọn một món trang bị.</p></div>`;
    // Declare at forge-view scope because the value is included in the final template below.
    let evo = "";
    if (it) {
      const d = ITEMS[it.id];
      evo = evolutionCard(it);
      if (it.plus >= 5) {
        anvil = `<div class="anvil" id="anvil"><div class="pair">${itemCell(it)}</div><img class="big" src="${icon("anvil")}" alt=""><h3 style="margin:2px 0">${esc(d.name)} +5</h3><p class="muted">Đã đạt cấp tối đa của bản này (+5).</p><div class="sts">${statsLine(it.id, 5)}</div></div>`;
      } else {
        const c = F.forgeCost(it.id, it.plus);
        const ok = S.d.gold >= c.gold && (S.d.mats.stone || 0) >= c.stone;
        anvil = `<div class="anvil" id="anvil"><div class="pair">${itemCell(it)}<span class="arrow">→</span><div class="cell r-${d.rarity}"><img src="${icon(d.icon)}" alt=""><span class="plus">+${it.plus + 1}</span></div></div>
          <img class="big" src="${icon("anvil")}" alt="">
          <h3 style="margin:2px 0">${esc(d.name)} +${it.plus} → +${it.plus + 1}</h3>
          <div class="sts" style="justify-content:center">${statsLine(it.id, it.plus, it.plus + 1)}</div>
          <div class="mats"><span class="chip"${S.d.gold < c.gold ? ' style="border-color:var(--ver);color:var(--ver)"' : ""}><img src="${icon("coin")}" alt="">${c.gold} vàng (có ${S.d.gold})</span><span class="chip"${(S.d.mats.stone || 0) < c.stone ? ' style="border-color:var(--ver);color:var(--ver)"' : ""}><img src="${icon("mat_stone")}" alt="">${c.stone} Đá Cường Hóa (có ${S.d.mats.stone || 0})</span></div>
          <div class="rate">Tỷ lệ thành công ${Math.round(c.rate * 100)}%</div>
          <p class="muted" style="text-align:center;margin:4px 0 8px">Thất bại: mất vàng và đá đã dùng. Trang bị không bị phá hủy và không tụt cấp.</p>
          <button class="btn gold" id="doForge"${ok ? "" : " disabled"}>Cường hóa</button>
          ${ok ? "" : `<p class="muted" style="margin:6px 0 0">${(S.d.mats.stone || 0) < c.stone ? "Thiếu Đá Cường Hóa: săn quái, làm nhiệm vụ hoặc mua ở Cửa hàng." : "Thiếu vàng."}</p>`}</div>`;
      }
    }
    const list = `<div><p class="muted" style="margin-bottom:6px">Chọn món muốn cường hóa (E: đang mặc).</p><div class="grid">${items.map((x) => itemCell(x, { sel: x.u === u.sel })).join("")}</div>
      <p class="muted" style="margin-top:10px">Mỗi cấp +15% chỉ số chính (ít nhất +1). Cấp càng cao càng tốn đá và tỷ lệ càng thấp: 100%, 90%, 75%, 60%, 45%. Vũ khí lớp thì tiến hóa ở cột bên, không cường hóa vượt bậc.</p></div>`;
    return frame("Lò rèn Thợ Rèn Thiết", "Cường hóa và tiến hóa vũ khí lớp", `<div class="forge">${anvil}${evo}${list}</div>`);
  };

  // The ladder of the class weapon: what the next blade needs, and the button that forges it.
  function evolutionCard(it) {
    const d = ITEMS[it.id];
    if (!d || !d.evolve) return "";
    const nd = ITEMS[d.evolve];
    const cost = EVOLVE[nd.tier];
    const lvOk = S.d.level >= cost.lv;
    const matRows = Object.keys(cost.mats).map((k) => {
      const have = S.d.mats[k] || 0, need = cost.mats[k];
      return `<span class="chip"${have < need ? ' style="border-color:var(--ver);color:var(--ver)"' : ""}><img src="${icon(MATS[k].icon)}" alt="">${need} ${esc(MATS[k].name)} (có ${have})</span>`;
    }).join("");
    const goldOk = S.d.gold >= cost.gold;
    const ok = lvOk && goldOk && Object.keys(cost.mats).every((k) => (S.d.mats[k] || 0) >= cost.mats[k]);
    const why = !lvOk ? `Cần cấp ${cost.lv} (bạn đang cấp ${S.d.level})` : !goldOk ? "Thiếu vàng" : !ok ? "Thiếu nguyên liệu" : "";
    return `<div class="anvil evo" id="evoBox"><div class="pair">${itemCell(it)}<span class="arrow">→</span><div class="cell r-${nd.rarity}"><img src="${icon(nd.icon)}" alt=""><span class="plus">${nd.tier === 5 ? "V" : ["I", "II", "III", "IV", "V"][nd.tier - 1]}</span></div></div>
      <h3 style="margin:2px 0">Tiến hóa: ${esc(nd.name)}</h3>
      <div class="muted">Bậc ${nd.tier} · cấp yêu cầu ${cost.lv} · ${esc(cost.note)}</div>
      <div class="sts" style="justify-content:center">${statsLine(it.id, it.plus, null)} <span class="up">→</span> ${Object.entries(F.itemStats(d.evolve, it.plus)).map(([k, v]) => `<span>${STAT_VI[k]} <b>+${v}${pctStat(k) ? "%" : ""}</b></span>`).join("")}</div>
      <div class="mats"><span class="chip"${goldOk ? "" : ' style="border-color:var(--ver);color:var(--ver)"'}><img src="${icon("coin")}" alt="">${cost.gold} vàng (có ${S.d.gold})</span>${matRows}</div>
      <button class="btn gold" id="doEvolve"${ok ? "" : " disabled"}>Tiến hóa lên bậc ${nd.tier}</button>
      ${why ? `<p class="muted" style="margin:6px 0 0">${esc(why)}</p>` : ""}
      <p class="muted" style="margin:6px 0 0">Cường hóa +${it.plus} được giữ nguyên sau khi tiến hóa.</p></div>`;
  }
  function wireEvolve() {
    const btn = $("#doEvolve");
    if (!btn) return;
    btn.onclick = async () => {
      btn.disabled = true;
      const u = P.ui.forge.sel;
      const before = S.item(u) ? ITEMS[S.item(u).id] : null;
      const p = S.evolve(u);
      const r = await p;
      if (!r || !r.ok) {
        UI.toast(r && r.why === "mats" ? "Thiếu nguyên liệu: xem danh sách trong ô Tiến hóa." : r && r.why === "gold" ? "Không đủ vàng." : r && r.why === "level" ? "Chưa đủ cấp." : "Chưa tiến hóa được.", "warn");
        render(); return;
      }
      SND.play("forge");
      UI.banner("Tiến hóa thành công!", (before ? before.name : "Vũ khí") + " → " + ITEMS[r.result.id].name);
      window.mindblown?.event?.("weapon_evolved", { tier: r.result.tier });
      render();
    };
  }
  WIRE.forge = function () {
    const u = P.ui.forge;
    panel.querySelectorAll("[data-u]").forEach((b) => (b.onclick = () => { u.sel = +b.dataset.u; render(); }));
    wireEvolve();
    const btn = $("#doForge");
    if (btn) btn.onclick = async () => {
      btn.disabled = true;
      const r = await S.forge(u.sel);
      if (!r || !r.ok) { UI.toast(r && r.why === "gold" ? "Không đủ vàng." : r && r.why === "stone" ? "Không đủ Đá Cường Hóa." : "Đã tối đa.", "warn"); render(); return; }
      const res = r.result;
      const cur = S.item(u.sel); const name = cur ? ITEMS[cur.id].name : "Trang bị";
      S.save(true);
      render();
      const anvil = $("#anvil");
      if (res.win) { SND.play("forge"); sparks(anvil, 26, "#E0A526"); UI.toast(`Cường hóa thành công! ${esc(name)} +${res.plus}`, "gold"); }
      else { SND.play("fizzle"); sparks(anvil, 8, "#8A7F6E"); UI.toast(`Thất bại. ${esc(name)} vẫn giữ +${res.plus}, mất ${res.cost.gold} vàng và ${res.cost.stone} đá.`, "warn"); }
    };
  };
  function sparks(el, n, color) {
    if (!el) return;
    const r = el.getBoundingClientRect(); const cx = r.width / 2, cy = Math.min(r.height * 0.45, 150);
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i"); s.className = "spark"; s.style.left = cx + "px"; s.style.top = cy + "px"; s.style.background = color; el.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 90;
      if (reduced()) { s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).onfinish = () => s.remove(); continue; }
      s.animate([{ transform: "translate(0,0) scale(1.4)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 20}px) scale(.3)`, opacity: 0 }], { duration: 500 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.4,1)" }).onfinish = () => s.remove();
    }
  }

  // Notebook
  P.ui.book = { f: "seen", topic: "all", sel: null, det: false, dictQuery: "", dictResults: [], dictStatus: "" };
  const FILTERS = [
    ["seen", "Đã gặp"], ["wrong", "Hay sai"], ["due", "Cần ôn"], ["mastered", "Đã thuộc"], ["unseen", "Chưa gặp"],
  ];
  function inFilter(e, f) {
    const m = S.w(e.id);
    if (f === "seen") return m && m.seen > 0;
    if (f === "wrong") return m && m.wr > 0 && m.box < 5;
    if (f === "due") return S.isDue(m) && m.box < 5;
    if (f === "mastered") return m && m.box >= 5;
    if (f === "unseen") return !m || !m.seen;
    return true;
  }
  function practiceList(kind, topic) {
    const now = Date.now();
    let pool = VOCAB.filter((e) => S.w(e.id)?.seen && (topic === "all" || e.t === topic));
    if (kind === "wrong") pool = pool.filter((e) => S.w(e.id).wr > 0 && S.w(e.id).box < 5);
    if (kind === "due") pool = pool.filter((e) => now >= S.w(e.id).due && S.w(e.id).box < 5);
    pool.sort((a, b) => (S.w(b.id).wr - S.w(b.id).c) - (S.w(a.id).wr - S.w(a.id).c) || S.w(a.id).box - S.w(b.id).box || S.w(a.id).due - S.w(b.id).due);
    return pool.slice(0, 8);
  }
  VIEWS.book = function () {
    const u = P.ui.book;
    const all = VOCAB;
    const seen = all.filter((e) => S.w(e.id)?.seen).length;
    const remembering = all.filter((e) => (S.w(e.id)?.box || 0) >= 3 && S.w(e.id).box < 5).length;
    const mastered = all.filter((e) => (S.w(e.id)?.box || 0) >= 5).length;
    const wrong = all.filter((e) => inFilter(e, "wrong")).length;
    const counts = Object.fromEntries(FILTERS.map(([k]) => [k, all.filter((e) => inFilter(e, k) && (u.topic === "all" || e.t === u.topic)).length]));
    let list = all.filter((e) => inFilter(e, u.f) && (u.topic === "all" || e.t === u.topic));
    if (u.f === "wrong") list.sort((a, b) => S.w(b.id).wr - S.w(a.id).wr);
    else if (u.f !== "unseen") list.sort((a, b) => (S.w(b.id)?.last || 0) - (S.w(a.id)?.last || 0));
    const topicSel = `<select id="bkTopic" aria-label="Chủ đề"><option value="all">Mọi chủ đề</option>${Object.keys(TOPICS).map((t) => `<option value="${t}"${u.topic === t ? " selected" : ""}>${TOPICS[t]}</option>`).join("")}</select>`;
    const rows = list.length ? list.map((e) => {
      const m = S.w(e.id); const unseen = !m || !m.seen;
      return `<button class="wr${unseen ? " unseen" : ""}${u.sel === e.id ? " sel" : ""}" data-w="${e.id}"><span class="ww">${unseen ? "•".repeat(Math.min(8, e.w.length)) : esc(e.w)}</span><span class="wv">${esc(e.vi)}</span><span class="wd">${m && m.box >= 5 ? `<img class="jseal" src="${UI.sealUrl("anh", "#3E8C6E")}" alt="Đã thuộc">` : ""}${UI.dots(m ? m.box : 0)}</span></button>`;
    }).join("") : `<p class="muted" style="padding:10px 0">${u.f === "seen" ? "Chưa gặp từ nào. Ra cánh đồng đánh quái để học từ đầu tiên." : "Không có từ nào trong mục này."}</p>`;
    const showFullDictionary = document.documentElement.dataset.wordNinjaMode === "offline-android";
    const dictionaryResults = u.dictResults.length
      ? `<div class="offline-dict-results">${u.dictResults.map((item) => `<article class="offline-dict-result"><b>${esc(item.word)}</b>${item.ipa ? ` <small>/${esc(item.ipa)}/</small>` : ""}<div>${esc(item.definition)}</div>${item.pos ? `<small>${esc(item.pos)}${item.subPos ? " · " + esc(item.subPos) : ""}</small>` : ""}${item.example ? `<p>${esc(item.example)}</p>` : ""}</article>`).join("")}</div>`
      : (u.dictStatus ? `<p class="muted offline-dict-status">${esc(u.dictStatus)}</p>` : "");
    const offlineDictionarySearch = showFullDictionary ? `<div class="offline-dict-search"><label for="bkDictQuery">Từ điển Anh–Việt ngoại tuyến</label><div class="row"><input id="bkDictQuery" type="search" maxlength="80" placeholder="Nhập từ tiếng Anh…" value="${esc(u.dictQuery)}"><button type="button" class="btn sm" id="bkDictGo">Tra từ</button></div>${dictionaryResults}<small class="offline-dict-credit">Dữ liệu Skypedia / MinhQND · CC BY-SA 4.0. Xem data/dictionary-ATTRIBUTION.md.</small></div>` : "";
    const left = `<div class="bp list"><div class="wsum"><div><b>${seen}</b>đã gặp /${all.length}</div><div><b>${remembering}</b>đang nhớ</div><div><b>${mastered}</b>đã thuộc</div><div><b>${wrong}</b>hay sai</div></div>
      <div class="ribbons">${FILTERS.map(([k, v]) => `<button class="rib${u.f === k ? " on" : ""}" data-f="${k}">${v} <small>${counts[k]}</small></button>`).join("")}</div>
      <div class="row" style="margin-bottom:6px">${topicSel}<span class="sp"></span></div>${offlineDictionarySearch}<div class="wl">${rows}</div></div>`;
    let right;
    const e = u.sel ? VOCAB_BY_ID[u.sel] : null;
    if (e) {
      const m = S.w(e.id);
      const otherSenses = Array.isArray(e.meaningsVi)
        ? e.meaningsVi.filter((meaning) => String(meaning || "").trim() && String(meaning).trim() !== String(e.vi || "").trim())
        : [];
      const senseDetails = otherSenses.length
        ? `<div class="hist"><b>Các nghĩa khác trong từ điển:</b> ${otherSenses.map((meaning) => esc(meaning)).join("; ")}</div>`
        : "";
      if (!m || !m.seen) {
        right = `<div class="bp dtl"><button class="btn ghost sm bk-back" data-back>← Danh sách</button><h3>Từ chưa gặp</h3><p class="lc-vi">${esc(e.vi)}</p>${senseDetails}<p class="muted">Chủ đề ${TOPICS[e.t] || "Oxford 3000"} · ${esc(POS_VI[e.pos] || e.pos)} · ${e.lv}. Gặp từ này khi chiến đấu để mở trang giải thích.</p></div>`;
      } else {
        const due = m.due <= Date.now() ? "ngay bây giờ" : fmtIn(m.due - Date.now());
        right = `<div class="bp dtl"><button class="btn ghost sm bk-back" data-back>← Danh sách</button><div class="lc" style="animation:none;box-shadow:none;border:0;padding:4px 0 0 18px">${m.box >= 5 ? `<img class="lc-seal" src="${UI.sealUrl("anh", "#3E8C6E")}" alt="">` : ""}${UI.entryHtml(e)}</div>
          ${senseDetails}<div class="hist">Ghi nhớ: ${UI.dots(m.box)} <b>${UI.memText(m.box)}</b><br>Đúng <b>${m.c}</b> · Sai <b>${m.wr}</b> · Đúng liên tiếp <b>${m.streak}</b><br>Lần gần nhất: ${fmtAgo(m.last)} · Ôn lại: ${m.box >= 5 ? "thỉnh thoảng" : due}</div>
          <button class="btn sm" data-pone="${e.id}">Luyện từ này</button></div>`;
      }
    } else {
      const nW = practiceList("wrong", u.topic).length, nD = practiceList("due", u.topic).length, nA = practiceList("all", u.topic).length;
      right = `<div class="bp dtl"><h3 style="margin-top:2px">Luyện lại</h3><p>Luyện với hình nộm: không mất máu, không giới hạn thời gian. Từ hay sai được hỏi trước. Mỗi lượt tối đa 8 từ.</p>
        <div class="row" style="flex-direction:column;align-items:stretch;gap:8px"><button class="btn" data-prac="wrong"${nW ? "" : " disabled"}>Từ hay sai (${nW})</button><button class="btn ghost" data-prac="due"${nD ? "" : " disabled"}>Từ cần ôn (${nD})</button><button class="btn ghost" data-prac="all"${nA ? "" : " disabled"}>Từ đã gặp${u.topic !== "all" ? " · " + TOPICS[u.topic] : ""} (${nA})</button></div>
        <p class="muted" style="margin-top:12px">Năm chấm mực là mức ghi nhớ. Một từ chỉ được đóng dấu ngọc "Đã thuộc" sau nhiều lần đúng, mỗi lần cách nhau lâu hơn: 1 phút, 10 phút, 1 giờ, 8 giờ, 2 ngày. Trả lời sai sẽ tụt 2 chấm và từ được hỏi lại sớm.</p>
        <p class="muted">Chọn một từ trong danh sách để xem giải thích đầy đủ.</p></div>`;
    }
    return frame("Sổ tay từ vựng", `${seen}/${all.length} từ`, `<div class="book${e ? " det" : ""}">${left}${right}</div>`);
  };
  function fmtIn(ms) { const m = Math.round(ms / 60000); if (m < 1) return "sau ít giây"; if (m < 60) return `sau ${m} phút`; const h = Math.round(m / 60); if (h < 24) return `sau ${h} giờ`; return `sau ${Math.round(h / 24)} ngày`; }
  function fmtAgo(t) { if (!t) return "chưa"; const m = Math.round((Date.now() - t) / 60000); if (m < 1) return "vừa xong"; if (m < 60) return `${m} phút trước`; const h = Math.round(m / 60); if (h < 24) return `${h} giờ trước`; return `${Math.round(h / 24)} ngày trước`; }
  WIRE.book = function () {
    const u = P.ui.book;
    const runDictionarySearch = async () => {
      const field = $("#bkDictQuery");
      const query = String(field ? field.value : u.dictQuery).trim();
      u.dictQuery = query;
      u.dictResults = [];
      if (!query) { u.dictStatus = "Nhập từ tiếng Anh cần tra."; render(); return; }
      if (!window.WNOfflineDictionary || typeof window.WNOfflineDictionary.search !== "function") {
        u.dictStatus = "Bộ từ điển ngoại tuyến chưa được tải.";
        render();
        return;
      }
      u.dictStatus = "Đang tra từ điển trên thiết bị…";
      render();
      try {
        u.dictResults = await window.WNOfflineDictionary.search(query, 12);
        u.dictStatus = u.dictResults.length ? "" : "Không tìm thấy từ phù hợp.";
      } catch (error) {
        console.error("Offline dictionary lookup failed:", error);
        u.dictStatus = "Không mở được cơ sở dữ liệu từ điển. Hãy kiểm tra gói APK.";
      }
      render();
    };
    $("#bkDictGo")?.addEventListener("click", runDictionarySearch);
    $("#bkDictQuery")?.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); runDictionarySearch(); } });
    panel.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { u.f = b.dataset.f; u.sel = null; render(); }));
    panel.querySelectorAll("[data-w]").forEach((b) => (b.onclick = () => { u.sel = b.dataset.w; render(); const d = panel.querySelector(".bp.dtl"); if (d && innerWidth <= 720) panel.querySelector(".pn-body").scrollTop = 0; }));
    panel.querySelectorAll("[data-back]").forEach((b) => (b.onclick = () => { u.sel = null; render(); }));
    const ts = $("#bkTopic"); if (ts) ts.onchange = () => { u.topic = ts.value; u.sel = null; render(); };
    panel.querySelectorAll("[data-prac]").forEach((b) => (b.onclick = () => startPractice(practiceList(b.dataset.prac, u.topic))));
    panel.querySelectorAll("[data-pone]").forEach((b) => (b.onclick = () => startPractice([VOCAB_BY_ID[b.dataset.pone]])));
  };
  function startPractice(list) {
    if (!list.length) { UI.toast("Chưa có từ nào để luyện trong mục này.", "info"); return; }
    G.practice(list.slice());
  }

  // Practice picker (from the training dummy or Thầy Bút)
  VIEWS.practice = function () {
    const n = (k) => practiceList(k, "all").length;
    const seen = VOCAB.filter((e) => S.w(e.id)?.seen).length;
    return frame("Hình Nộm Luyện Tập", "Ôn từ, không mất máu", `<div class="npc"><img class="npc-por" src="${UI.monUrl("dummy")}" alt=""><div class="npc-say">Luyện với hình nộm thì không có giới hạn thời gian và không bị phản công. Từ bạn hay sai được hỏi trước.</div></div>
      <div class="npc-acts"><button class="btn" data-prac="wrong"${n("wrong") ? "" : " disabled"}>Từ hay sai (${n("wrong")})</button><button class="btn ghost" data-prac="due"${n("due") ? "" : " disabled"}>Từ cần ôn (${n("due")})</button><button class="btn ghost" data-prac="all"${seen ? "" : " disabled"}>Từ đã gặp (${Math.min(8, seen)})</button></div>
      ${seen ? "" : `<p class="muted">Bạn chưa gặp từ nào. Ra Cánh Đồng Lúa Vàng (đi về bên phải) đánh quái để học từ đầu tiên.</p>`}`);
  };
  WIRE.practice = function () { panel.querySelectorAll("[data-prac]").forEach((b) => (b.onclick = () => startPractice(practiceList(b.dataset.prac, "all")))); };
  UI.openPractice = () => P.open("practice");


  // ---------- Skill tree ----------
  P.ui.skills = { sel: null };
  const ROMAN = ["I", "II", "III", "IV", "V"];
  function skillState(id) {
    const sk = SKILLS[id];
    const mine = S.d.cls === sk.cls;
    const st = S.skillState(id);
    const learned = (S.d.skills || {})[id] || 0;
    if (!mine) return { id, sk, learned, cls: "other", label: "Lớp khác" };
    if (st.ok) return { id, sk, learned, cls: "can", label: "Có thể mở" };
    if (st.why === "level") return { id, sk, learned, cls: "locked", label: "Cần cấp " + st.nextLv };
    if (st.why === "need") return { id, sk, learned, cls: "locked", label: "Cần " + st.need.map((n) => SKILLS[n].name).join(", ") };
    if (st.why === "points") return { id, sk, learned, cls: "locked", label: "Hết điểm kỹ năng" };
    if (st.why === "max") return { id, sk, learned, cls: "learned", label: "Tối đa bậc " + sk.max };
    return { id, sk, learned, cls: "locked", label: "" };
  }
  function skillDetail(id) {
    const st = skillState(id);
    const sk = st.sk;
    const fx = sk.fx;
    const rank = Math.max(1, st.learned + (st.cls === "can" ? 1 : 0));
    const vals = {};
    for (const k in fx) { const v = fx[k]; vals[k] = Array.isArray(v) ? v[Math.min(v.length, rank) - 1] : v; }
    let desc = sk.desc || "";
    for (const k in vals) desc = desc.split("{" + k + "}").join(vals[k]);
    const lines = [];
    if (sk.type === "active") lines.push("Chủ động · tốn " + sk.mp + " MP · hồi " + (sk.cd || 2) + " câu");
    else lines.push("Nội tại · tự áp dụng sau khi học");
    if (st.learned) lines.push("Đang ở bậc " + st.learned + "/" + sk.max);
    if (st.cls === "can") lines.push("Bậc tiếp theo cần cấp " + st.sk.lv + ", " + ((S.skillState(id).need || []).length ? "và học trước " + S.skillState(id).need.map((n) => SKILLS[n].name).join(", ") : "không cần điều kiện khác") + ", tốn 1 điểm");
    if (st.cls === "locked" && st.label) lines.push(st.label);
    return { st, sk, desc, lines };
  }
  // the tree as a grid: a connector for every prerequisite, laid out by SKILLS' need list
  function treeHtml(cls) {
    const ids = Object.keys(SKILLS).filter((id) => SKILLS[id].cls === cls).sort((a, b) => SKILLS[a].lv - SKILLS[b].lv);
    const rowOf = (sk) => sk.pos ? sk.pos[0] : (TREE_POS[sk.lv % 100] ? TREE_POS[sk.lv % 100][0] : 0);
    const colOf = (sk) => { const p = sk.pos || TREE_POS[sk.lv % 100]; return p ? p[1] : 1; };
    const node = (id) => {
      const st = skillState(id);
      const sel = P.ui.skills.sel === id;
      return `<button class="sknod ${st.cls}${sel ? " sel" : ""}" data-sk="${id}" title="${esc(st.sk.name)}">
        <img src="${icon(st.sk.icon)}" alt=""><b>${esc(st.sk.name)}</b><small>Lv${st.sk.lv}${st.learned ? " · " + st.learned + "/" + st.sk.max : ""}</small>
        ${st.learned ? `<em>${ROMAN[Math.min(4, st.learned - 1)]}</em>` : ""}</button>`;
    };
    // edges: a line from each prerequisite to its dependent
    const edges = [];
    for (const id of ids) for (const need of SKILLS[id].need) {
      edges.push({ from: need, to: id, on: ((S.d.skills || {})[need] || 0) > 0 });
    }
    const cells = {};
    for (const id of ids) { const c = colOf(SKILLS[id]), r = rowOf(SKILLS[id]); (cells[r] = cells[r] || {})[c] = id; }
    const rows = Object.keys(cells).map(Number).sort((a, b) => a - b);
    let grid = "";
    for (const r of rows) {
      const cellsRow = ["", "", ""];
      for (let c = 0; c < 3; c++) if (cells[r][c]) cellsRow[c] = node(cells[r][c]);
      grid += `<div class="skrow">${cellsRow.map((h) => `<div class="skcell">${h}</div>`).join("")}</div>`;
    }
    // one path from each skill to the skill it unlocks, drawn as a line once the layout is known
    return `<div class="sktree" id="sktree"><svg class="sklines" id="sklines"></svg>${grid}</div>`;
  }
  VIEWS.skills = function () {
    if (!S.d.cls) {
      const ready = S.d.level >= 10;
      return frame("Cây kỹ năng", ready ? "Chọn lớp để mở cây" : "Mở ở cấp 10", `<p>${ready
        ? "Bạn đã đủ cấp 10. Bấm vào chân dung ở góc trái để chọn lớp, rồi cây kỹ năng của lớp đó mở ra ở đây."
        : "Cây kỹ năng mở ở cấp 10, khi bạn chọn một trong ba lớp: Kiếm Ảnh, Ảnh Hành hoặc Linh Ẩn."}</p>
        <h3>Ba lớp</h3><div class="board">${Object.entries(CLASSES).map(([id, c]) => `<div class="note"><div class="row"><h4 class="sp">${esc(c.name)}</h4></div><div class="giver">${esc(c.role)} · ${esc(ITEMS[c.weapon].name)}</div><div class="qt">${esc(c.desc)}</div></div>`).join("")}</div>`);
    }
    const c = CLASSES[S.d.cls];
    const pts = S.pointsLeft(), earned = S.pointsEarned();
    const det = P.ui.skills.sel ? skillDetail(P.ui.skills.sel) : null;
    let d = `<p class="muted">Lớp ${esc(c.name)} · điểm kỹ năng còn <b>${pts}</b> / đã nhận ${earned} (1 điểm mỗi cấp từ cấp 10).</p>`;
    if (det) {
      let canBtn = "";
      const stt = det.st;
      if (stt.cls === "can") canBtn = `<button class="btn sm" data-learn="${stt.id}">Học (1 điểm)</button>`;
      else if (stt.cls === "learned" && stt.learned < stt.sk.max) canBtn = `<button class="btn sm" data-learn="${stt.id}" disabled>Đã tối đa bậc ${stt.learned}</button>`;
      d += `<div class="detail skdet"><div class="row"><h4 class="sp">${esc(det.sk.name)}</h4><span class="st ${stt.cls}">${stt.label}</span></div>
        <div class="muted">Cấp mở khóa ${det.sk.lv} · ${det.sk.type === "active" ? "chủ động" : "nội tại"} · tối đa bậc ${det.sk.max}</div>
        <div class="skdesc"><img src="${icon(det.sk.icon)}" alt=""><p>${esc(det.desc)}</p></div>
        <ul class="muted">${det.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>${canBtn}</div>`;
    } else d += `<p class="muted">Bấm vào một kỹ năng để xem chi tiết. Nút xám là chưa đủ điều kiện, nút đỏ là của lớp khác.</p>`;
    return frame("Cây kỹ năng", c.name, d + treeHtml(S.d.cls));
  };
  // draw the prerequisite links between the nodes the browser has just laid out
  function drawTreeLines() {
    const tree = panel.querySelector("#sktree"), svg = panel.querySelector("#sklines");
    if (!tree || !svg) return;
    const box = tree.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    const at = (id) => {
      const el = tree.querySelector(`[data-sk="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { cx: r.left - box.left + r.width / 2, top: r.top - box.top, bottom: r.bottom - box.top, cy: r.top - box.top + r.height / 2 };
    };
    let out = "";
    for (const id of Object.keys(SKILLS)) {
      const sk = SKILLS[id]; if (sk.cls !== S.d.cls) continue;
      const to = at(id); if (!to) continue;
      for (const need of sk.need) {
        const from = at(need); if (!from) continue;
        const on = ((S.d.skills || {})[need] || 0) > 0;
        const col = on ? "#3E8C6E" : "rgba(42,35,32,.35)";
        const w = on ? 3 : 2;
        const midY = (from.bottom + to.top) / 2;
        if (Math.abs(from.cx - to.cx) < 4) out += `<line x1="${from.cx}" y1="${from.bottom}" x2="${to.cx}" y2="${to.top}" stroke="${col}" stroke-width="${w}"/>`;
        else out += `<path d="M${from.cx},${from.bottom} V${midY} H${to.cx} V${to.top}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>`;
        out += `<circle cx="${to.cx}" cy="${to.top}" r="${on ? 3.5 : 2.5}" fill="${col}"/>`;
      }
    }
    svg.innerHTML = out;
  }
  WIRE.skills = function () {
    drawTreeLines();
    panel.querySelectorAll("[data-sk]").forEach((b) => (b.onclick = () => { P.ui.skills.sel = b.dataset.sk; render(); }));
    const lb = panel.querySelector("[data-learn]");
    if (lb && !lb.disabled) lb.onclick = async () => {
      lb.disabled = true;
      const id = lb.dataset.learn;
      const r = await S.learn(id);
      if (!r || !r.ok) {
        UI.toast(r && r.why === "points" ? "Đã hết điểm kỹ năng." : r && r.why === "level" ? "Chưa đủ cấp cho bậc tiếp theo." : r && r.why === "need" ? "Cần học kỹ năng trước đó." : "Chưa học được.", "warn");
        render(); return;
      }
      SND.play("stamp"); UI.toast(`Đã học ${esc(SKILLS[id].name)} bậc ${r.result.rank}.`, "good");
      window.mindblown?.event?.("skill_learned", { skill: id, rank: r.result.rank });
      render();
    };
  };

  // ---------- Maps ----------
  VIEWS.maps = function () {
    const here = S.d.map;
    const rows = GD.MAP_ORDER.map((id) => {
      const m = MAPS[id];
      const acc = S.mapAccess(id);
      const lv = m.lvRange ? `Lv.${m.lvRange[0]}-${m.lvRange[1]}` : "";
      const mobs = [...new Set((m.spawns || []).filter((sp) => !sp.needQuest).map((sp) => MONSTERS[sp.m].name + " Lv" + MONSTERS[sp.m].lv))];
      const boss = (m.spawns || []).filter((sp) => sp.needQuest).map((sp) => MONSTERS[sp.m].name);
      const req = m.req || {};
      const cond = !acc.ok ? (req.lv && S.d.level < req.lv ? `Cần cấp ${req.lv}` : req.cls && !S.d.cls ? "Cần chọn lớp" : req.quest ? "Cần hoàn thành “" + (S.questDef(req.quest) || {}).name + "”" : "Chưa mở") : "Đã mở";
      return `<div class="note ${acc.ok ? "" : "locked"}${here === id ? " here" : ""}"><div class="row"><h4 class="sp">${esc(m.name)}</h4><span class="st ${acc.ok ? "active" : "locked"}">${esc(cond)}</span></div>
        <div class="giver">${lv}${here === id ? " · Bạn đang ở đây" : ""}</div>
        <div class="qt">${esc(mobs.join(", ") || "Không có quái")}${boss.length ? " · Boss: " + esc(boss.join(", ")) : ""}</div>
        ${acc.ok && here !== id ? `<button class="btn sm" data-go="${id}">Đi tới ${esc(m.name)}</button>` : ""}</div>`;
    }).join("");
    return frame("Bản đồ", S.d.level >= 10 ? "Cổng mở theo cấp và nhiệm vụ" : "", `<div class="board">${rows}</div>
      <p class="muted">Đi bộ qua cổng ở hai đầu bản đồ, hoặc bấm Đi tới để tới thẳng vùng đã mở. Vùng đã mở thì đi lại không giới hạn; quái vẫn hồi sinh theo thời gian.</p>`);
  };
  WIRE.maps = function () {
    panel.querySelectorAll("[data-go]").forEach((b) => (b.onclick = async () => {
      const id = b.dataset.go;
      b.disabled = true;
      const r = await S.travel(id, 200);
      if (!r || !r.ok) { UI.toast("Chưa tới được vùng đó.", "warn"); b.disabled = false; render(); return; }
      P.close();
      G.travelScene(id, 200);
    }));
  };

  // ---------- the class choice ----------
  function classTreePreview(id) {
    const ids = Object.keys(SKILLS).filter((k) => SKILLS[k].cls === id).sort((a, b) => SKILLS[a].lv - SKILLS[b].lv);
    return `<div class="clskills">${ids.map((k) => `<span class="clskill${SKILLS[k].type === "active" ? " act" : ""}"><img src="${icon(SKILLS[k].icon)}" alt="">Lv${SKILLS[k].lv} ${esc(SKILLS[k].name)}</span>`).join("")}</div>`;
  }

  // Settings
  VIEWS.settings = function () {
    const s = S.d.settings;
    const seg = (key, map) => `<div class="seg">${Object.keys(map).map((k) => `<button class="${s[key] === k ? "on" : ""}" data-set="${key}:${k}">${esc(map[k].vi)}</button>`).join("")}</div>`;
    const scope = S.mode === "world"
      ? (S.status.state === "error" ? "Máy chủ chưa nhận được thay đổi gần nhất. Trang sẽ tự thử lại; tiến trình vẫn còn trên máy này." : "Tiến trình được lưu lên máy chủ theo tài khoản của bạn, nên mở ở máy khác vẫn còn.")
      : S.scope === "error" ? "Chưa tải được bản lưu từ máy chủ." : S.scope === "account" ? "Tiến trình được lưu vào tài khoản của bạn." : "Tiến trình được lưu trên trình duyệt này. Đăng nhập để lưu theo tài khoản.";
    return frame("Cài đặt", "", `<div class="opt"><h4>Áp lực thời gian</h4>${seg("press", PRESSURE)}<p class="muted" style="margin-top:6px">Nén hương cháy theo độ dài của từ: từ ngắn khoảng 16 đến 18 giây, từ dài 22 đến 28 giây, cụm từ lâu hơn (mức Vừa). Thong thả x1.4, Gấp x0.75. Luyện tập: không giới hạn, quái vẫn phản công khi sai.</p></div>
      <div class="opt"><h4>Độ khó</h4>${seg("diff", DIFFICULTY)}<p class="muted" style="margin-top:6px">${esc(DIFFICULTY[s.diff].note)}</p></div>
      <div class="opt"><h4>Âm thanh hiệu ứng</h4><div class="seg"><button class="${SND.on ? "on" : ""}" data-snd="1">Bật</button><button class="${SND.on ? "" : "on"}" data-snd="0">Tắt</button></div><p class="muted" style="margin-top:6px">Nhạc nền và hiệu ứng chiến đấu.</p></div>
      <div class="opt"><h4>Đọc từ tiếng Anh khi trả lời đúng</h4><div class="seg"><button class="${window.WNPronunciation?.enabled ? "on" : ""}" data-pronounce="1">Bật</button><button class="${window.WNPronunciation?.enabled ? "" : "on"}" data-pronounce="0">Tắt</button></div><p class="muted" style="margin-top:6px">Tự phát âm từ tiếng Anh sau khi game xác nhận đáp án đúng. Không đọc khi trả lời sai. Tùy chọn này độc lập với âm thanh hiệu ứng.</p></div>
      <div class="opt"><h4>Cách chơi</h4><button class="btn ghost sm" data-help>Xem hướng dẫn</button></div>
      <div class="opt"><h4>Lưu tiến trình</h4><p class="muted">${esc(scope)}</p>
        <p class="muted">Trạng thái: <b>${S.status.state === "saving" ? "đang lưu..." : S.status.state === "saved" ? "đã lưu" : S.status.state === "error" ? "lỗi lưu" : "chưa có thay đổi"}</b>${S.status.state === "error" && S.status.text ? " (" + esc(S.status.text) + ")" : ""}</p>
        <div class="opt"><h4>Chủ đề từ vựng đang dùng</h4><p class="muted">Bộ từ hiện có ${VOCAB.length} từ: A1-A2 cho Làng Mộc Bản và Cánh Đồng, thêm bộ B1-B2 (bản demo ${typeof VOCAB_DEMO === "number" ? VOCAB_DEMO : 0} từ) cho các bản đồ cấp 10 trở lên.</p></div>
        <button class="btn ghost sm" data-reset>Chơi lại từ đầu</button></div>`);
  };
  WIRE.settings = function () {
    panel.querySelectorAll("[data-set]").forEach((b) => (b.onclick = () => {
      const [k, v] = b.dataset.set.split(":"); S.setSetting(k, v); S.save();
      if (k === "diff" && G.scene) for (const m of G.scene.monsters) { if (m.state === "wander") { const h = v === "hard" ? 1.25 : 1; m.maxHp = Math.round(m.def.hp * h); m.hp = m.maxHp; } }
      render();
    }));
    panel.querySelectorAll("[data-snd]").forEach((b) => (b.onclick = () => { SND.set(b.dataset.snd === "1"); SND.unlock(); render(); }));
    panel.querySelectorAll("[data-pronounce]").forEach((b) => (b.onclick = () => { window.WNPronunciation?.set(b.dataset.pronounce === "1"); render(); }));
    const h = panel.querySelector("[data-help]"); if (h) h.onclick = () => { P.name = "intro"; render(); };
    const r = panel.querySelector("[data-reset]");
    if (r) r.onclick = async () => {
      if (!r.dataset.sure) { r.dataset.sure = "1"; r.textContent = "Bấm lần nữa để xóa hết tiến trình"; r.classList.remove("ghost"); return; }
      await S.reset(); location.reload();
    };
  };

  // How to play (also the first screen of a new game)
  VIEWS.intro = function () {
    const touch = document.body.classList.contains("touch");
    return frame("Cách chơi Word Ninja", "", `<div class="npc"><img class="npc-por" src="${UI.npcUrl("elder")}" alt=""><div class="npc-say">Chào ninja trẻ! Ở đây kiếm của con là tiếng Anh. Đọc nghĩa tiếng Việt, gõ đúng từ tiếng Anh là chém trúng quái.</div></div>
      <div class="t-help" style="margin-top:12px">
      <p><b>Di chuyển:</b> ${touch ? "giữ ◀ ▶ để chạy, ▲ để nhảy, hoặc chạm vào chỗ muốn tới." : "← → hoặc A D để chạy, ↑ W hoặc Space để nhảy, hoặc bấm chuột vào chỗ muốn tới."}</p>
      <p><b>Đánh quái, gặp NPC:</b> ${touch ? "chạm vào quái hoặc NPC, hoặc đứng gần rồi bấm nút Đánh / Nói." : "bấm vào quái hoặc NPC, hoặc đứng gần rồi bấm E."}</p>
      <p><b>Chiến đấu:</b> một lần chọn quái là một trận liên tục. Mỗi câu hiện nghĩa tiếng Việt, bạn ${touch ? "gõ bằng bàn phím trên màn hình" : "gõ bằng bàn phím"} từ tiếng Anh. Gõ đủ chữ đúng là chém, Enter để nộp. Nén hương là thời gian, tắt hẳn được trong Cài đặt.</p>
      <p><b>Trả lời sai:</b> chữ sai hiện đỏ và bạn được sửa lại, còn số lần thử tuỳ độ khó. Hết lượt thì quái phản công và hiện đáp án đúng.</p>
      <p><b>Sau mỗi câu đúng:</b> trang sổ tay hiện định nghĩa, phiên âm, câu ví dụ và bản dịch. Bấm Đánh tiếp để đánh tiếp chính con quái đó.</p>
      <p><b>Cấp 10:</b> chọn một trong ba lớp (Kiếm Ảnh, Ảnh Hành, Linh Ẩn). Mỗi lớp có vũ khí riêng, cây kỹ năng riêng, và mỗi cấp từ 10 trở đi cho 1 điểm kỹ năng.</p>
      <p><b>Kỹ năng:</b> mở nút Kỹ năng ở góc phải để xem cây kỹ năng và học. Trong trận, các ô kỹ năng ở dưới màn hình dùng bằng phím 2-6; 7 là bình máu, 8 là trà MP, Esc hai lần để rút lui.</p>
      <p><b>Cấp 10 đến 30:</b> năm vùng đất mới mở dần theo cấp và nhiệm vụ. Vũ khí lớp tiến hóa ở Lò rèn tại Lv.15, 20, 25 và 30, bậc V cần Lõi U Minh của boss chương.</p>
      <p style="margin:0"><b>Mục tiêu:</b> làm nhiệm vụ của Trưởng Làng, lên cấp 10 để chọn lớp, tiến hóa vũ khí và hạ Thủ Lĩnh U Minh ở Pháo Đài U Minh. Tiến trình được lưu theo tài khoản, nên mở máy khác vẫn còn.</p></div>
      <div class="row" style="justify-content:flex-end"><button class="btn" data-x>Lên đường!</button></div>`);
  };
  P.intro = () => { if (!BATTLE.active && !P.overOpen()) P.open("intro"); };

  // ---------------- full-screen moments ----------------
  let overPrimary = null;
  function showOver(html, primary) {
    P.close();
    over.innerHTML = html; over.hidden = false; overPrimary = primary || null;
    G.touch.left = G.touch.right = false;
  }
  P.closeOver = function () { over.hidden = true; over.innerHTML = ""; veil.hidden = true; overPrimary = null; G.block(300); };
  P.overKey = function (e) {
    if (e.key === "Enter" || e.key === " ") { const b = overPrimary && over.querySelector(overPrimary); if (b && !b.disabled) b.click(); return true; }
    if (e.key === "Escape" && over.querySelector("[data-later]")) { over.querySelector("[data-later]").click(); return true; }
    if (/^[123]$/.test(e.key) && over.querySelector(".classes")) { const c = over.querySelectorAll(".cls")[+e.key - 1]; if (c) c.click(); return true; }
    return true;
  };

  P.levelUp = function (from, to) {
    if (BATTLE.active) return;
    veil.hidden = false; veil.onclick = null;
    const a = F.baseStats(from - 1 >= 1 ? from - 1 : 1), b = F.baseStats(to);
    const cls = to >= 10 && !S.d.cls;
    showOver(`<div class="lvup">${reduced() ? "" : '<div class="burst"></div>'}<div class="bigseal"><b>Lên cấp</b><strong>${to}</strong></div>
      <div class="lv-card paper"><p><b>HP +${b.hp - a.hp} · MP +${b.mp - a.mp} · Công +${b.atk - a.atk} · Thủ +${b.def - a.def}</b><br><span class="muted">Máu và MP đã hồi đầy.</span></p>
      ${cls ? `<p style="color:var(--ver);font-weight:600">Cấp 10! Đã đến lúc chọn lớp nhân vật.</p>` : to < 10 ? `<p class="muted">Lên cấp 10 để chọn lớp nhân vật.</p>` : ""}
      <button class="btn gold" id="lvGo">${cls ? "Chọn lớp" : "Tiếp tục"}</button></div></div>`, "#lvGo");
    veil.hidden = false;
    SND.play("levelup");
    $("#lvGo").onclick = () => { P.closeOver(); setTimeout(() => G.flushLevels(), 120); };
  };

  P.classPick = function () {
    if (BATTLE.active || S.d.cls) return;
    let pick = null;
    const banners = Object.entries(CLASSES).map(([id, c]) => `<button class="cls" data-c="${id}"><div class="rod"></div><div class="sheet">
      <img class="por" src="${UI.portrait(id, ITEMS[c.weapon].icon, c.color, "win")}" alt=""><div><img class="cseal" src="${UI.sealUrl(id, c.color)}" alt=""><h3>${esc(c.name)}</h3><small>${esc(c.role)}</small></div>
      <p>${esc(c.desc)}</p>
      <div class="pc"><div><b>Ưu điểm</b><ul>${c.pros.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div><div><b>Nhược điểm</b><ul>${c.cons.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div>
      <p class="muted">Vũ khí lớp: ${esc(ITEMS[c.weapon].name)} (bậc I) · tiến hóa ở Lv.15, 20, 25, 30 ở Lò rèn.</p>
      ${classTreePreview(id)}</div><div class="rod b"></div></button>`).join("");
    showOver(`<div class="veilmsg" style="max-width:none;padding:10px"><h2>Chọn lớp nhân vật</h2><p style="margin-bottom:8px">Lớp nào cũng chiến đấu bằng tiếng Anh. Chọn một lần, không đổi lại được. Mỗi lớp có vũ khí riêng, cây kỹ năng riêng và tiến hóa vũ khí tới bậc V ở cấp 30.</p>
      <div class="classes">${banners}</div>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="btn gold" id="clsGo" disabled>Chọn một lớp</button><button class="btn ghost" data-later>Để sau</button></div></div>`, "#clsGo");
    veil.hidden = false; veil.onclick = null;
    over.querySelectorAll(".cls").forEach((b) => (b.onclick = () => {
      pick = b.dataset.c; over.querySelectorAll(".cls").forEach((x) => x.classList.toggle("on", x === b));
      const go = $("#clsGo"); go.disabled = false; go.textContent = "Đóng dấu " + CLASSES[pick].name;
    }));
    over.querySelector("[data-later]").onclick = () => { P.closeOver(); UI.toast("Bấm vào chân dung ở góc trái để chọn lớp khi sẵn sàng.", "info"); };
    $("#clsGo").onclick = async () => {
      if (!pick || S.d.cls) return;
      const c = CLASSES[pick];
      const go = $("#clsGo"); go.disabled = true; go.textContent = "Đang đóng dấu...";
      const r = await S.pickClass(pick);
      if (!r || !r.ok) { go.disabled = false; go.textContent = "Chọn một lớp"; UI.toast(r && r.why === "level" ? "Cần cấp 10." : r && r.why === "taken" ? "Bạn đã có lớp rồi." : "Chưa chọn được lớp. Kiểm tra kết nối.", "warn"); return; }
      window.mindblown?.event?.("class_chosen", { cls: pick });
      SND.play("stamp");
      const card = over.querySelector(`.cls[data-c="${pick}"] .sheet`);
      const seal = document.createElement("img"); seal.src = UI.sealUrl(pick, c.color);
      seal.style.cssText = "position:absolute;left:50%;top:40%;width:120px;height:120px;margin:-60px;pointer-events:none;animation:bigStamp .45s cubic-bezier(.3,1.6,.5,1) both";
      card.parentElement.appendChild(seal);
      setTimeout(() => { P.closeOver(); UI.banner(`Bạn là ${c.name}!`, `Đã trang bị ${ITEMS[c.weapon].name}. Mở cây kỹ năng để học ${SKILLS[pick + "10"].name}.`); }, 1100);
    };
  };

  P.death = function (m) {
    veil.hidden = false; veil.onclick = null;
    showOver(`<div class="veilmsg"><h2>Bạn đã gục ngã</h2><p>${esc(m.def.name)} đã thắng trận này. Đừng nản: từ nào bạn trả lời sai đã được ghi vào Sổ tay để ôn lại. Hồi sinh ở làng sẽ mất 10% số vàng đang có.</p><button class="btn big" id="revGo">Hồi sinh ở làng</button></div>`, "#revGo");
    veil.hidden = false;
    $("#revGo").onclick = () => G.revive();
  };

  window.PANELS = P;
})();
