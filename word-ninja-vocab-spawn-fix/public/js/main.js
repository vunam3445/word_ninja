// Word Ninja: boot, textures, the Phaser game and the glue between world, battle and interface.
(function () {
  const { MAPS, CLASSES, NPCS, MONSTERS, ITEMS } = GD;
  const mb = () => window.mindblown;
  const $ = (s) => document.querySelector(s);

  const G = {
    scene: null, battle: null, touch: { left: false, right: false, jump: false },
    dpr: Math.min(2, window.devicePixelRatio || 1), cssW: innerWidth, cssH: innerHeight,
    transitioning: false, blockUntil: 0, running: false, pendingLv: [], started: false,
    keyBlock() { return performance.now() < this.blockUntil; },
    block(ms = 300) { this.blockUntil = performance.now() + ms; },
  };
  window.G = G;

  // ---------------- tune ----------------
  const fromFile = () => fetch("tune.json").then((r) => r.json())
    .then((f) => Object.fromEntries(Object.entries(f).map(([k, e]) => [k, e.value]))).catch(() => ({}));

  // ---------------- textures ----------------
  const SIGN_ICON = { quest: "scroll", shop: "basket", forge: "anvil", book: "book" };
  const THEMES = ["village", "farm1", "farm2", "bamboo", "valley", "ruins", "fortress", "cloudsea", "citadel", "spiritforest", "thunderrange", "fatehall"];
  function textureJobs() {
    const jobs = [];
    for (const id in NPCS) { const f = ART.npcFrames(id); for (const k in f) jobs.push(["npc_" + id + "_" + k, f[k]]); }
    for (const id in ART.MONSTER_ART) { const f = ART.monsterFrames(id); for (const k in f) jobs.push(["m_" + id + "_" + k, f[k]]); }
    const VARIANTS = { house: 1, tree: 1, pillar: 1, flag: 1, ruinedTower: 1 };
    for (const k in ART.PROPS) {
      if (k === "terrace") { jobs.push(["p_terrace_460_96", ART.prop(k, 460, 96).svg]); continue; }
      jobs.push(["p_" + k, ART.prop(k).svg]);
      if (VARIANTS[k]) jobs.push(["p_" + k + "1", ART.prop(k, 1).svg]);
      if (k === "shrine") jobs.push(["p_shrine1", ART.prop(k, 1).svg]);
    }
    for (const th of THEMES) for (const l of ["far", "mid", "ground", "clouds"]) jobs.push(["bg_" + l + "_" + th, ART.BG[l](th).svg]);
    for (const s in SIGN_ICON) jobs.push(["ic_sign_" + s, ART.icon(SIGN_ICON[s])]);
    return jobs;
  }
  function raster(svgText) {
    return ART.loadImage(svgText).then((im) => {
      const c = document.createElement("canvas"); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); return c;
    });
  }
  async function addTextures(game, jobs) {
    const out = await Promise.all(jobs.map(([k, s]) => (game.textures.exists(k) ? null : raster(s).then((c) => [k, c]).catch((e) => { console.warn("texture", k, e); return null; }))));
    for (const r of out) if (r && !game.textures.exists(r[0])) game.textures.addCanvas(r[0], r[1]);
  }
  G.lookKey = () => (S.d.cls || "n") + "_" + S.weaponLook();
  let lookBusy = null;
  G.refreshLook = async function () {
    const key = G.lookKey(); const game = G.game;
    const sc = G.scene;
    if (!game.textures.exists("nj_" + key + "_idle0")) {
      const f = ART.ninjaFrames({ cls: S.d.cls, weapon: S.weaponLook() });
      const p = addTextures(game, Object.keys(f).map((k) => ["nj_" + key + "_" + k, f[k]]));
      lookBusy = p; await p;
    }
    if (G.scene) G.scene.lookKey = key;
    UI.refreshPortrait();
  };
  G.scarfColor = () => (S.d.cls ? CLASSES[S.d.cls].color : "#E4D2AA");

  // ---------------- Phaser ----------------
  class Boot extends Phaser.Scene { constructor() { super("boot"); } create() { G.bootReady && G.bootReady(); } }
  function makeGame() {
    return new Promise((res) => {
      G.bootReady = res;
      G.game = new Phaser.Game({
        type: Phaser.AUTO, parent: "game", transparent: true, width: Math.round(G.cssW * G.dpr), height: Math.round(G.cssH * G.dpr),
        zoom: 1 / G.dpr, scale: { mode: Phaser.Scale.NONE },
        physics: { default: "arcade", arcade: { gravity: { y: 1750 }, debug: false } },
        render: { antialias: true, roundPixels: false }, fps: { target: 60 }, audio: { noAudio: true },
        input: { keyboard: true, touch: true }, scene: [Boot], banner: false,
      });
    });
  }
  function onResize() {
    G.cssW = innerWidth; G.cssH = innerHeight; G.dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!G.game) return;
    G.game.scale.setZoom(1 / G.dpr);
    G.game.scale.resize(Math.round(G.cssW * G.dpr), Math.round(G.cssH * G.dpr));
    const cv = G.game.canvas; cv.style.width = G.cssW + "px"; cv.style.height = G.cssH + "px";
    if (G.scene && G.scene.view) G.scene.layoutCamera(true);
    UI.layout();
  }
  window.addEventListener("resize", () => { clearTimeout(G._rz); G._rz = setTimeout(onResize, 60); });

  G.onSceneReady = function (sc) {
    G.scene = sc;
    const cv = G.game.canvas; cv.style.width = G.cssW + "px"; cv.style.height = G.cssH + "px";
    sc.lookKey = G.lookKey();
    sc.input.on("pointerdown", (p) => {
      if (UI.blocking() || (G.battle && G.battle.active) || G.transitioning) return;
      const w = sc.screenToWorld(p.x / G.dpr, p.y / G.dpr);
      sc.pointerAt(w.x, w.y);
    });
    document.body.dataset.map = sc.mapId;
    UI.refresh();
    $("#fade").classList.remove("on");
    setTimeout(() => { G.transitioning = false; }, 120);
    UI.mapBanner(MAPS[sc.mapId].name, sc.mapId === "village" ? "Nơi nhận nhiệm vụ, mua đồ, rèn đồ và ôn từ" : mapSub(sc.mapId));
    if (!S.d.introDone) setTimeout(() => PANELS.intro(), 700);
    SND.music("village");
  };
  function mapSub(id) {
    const ms = [...new Set(MAPS[id].spawns.filter((s) => !s.needQuest).map((s) => s.m))].map((m) => MONSTERS[m].name + " Lv" + MONSTERS[m].lv);
    return "Quái: " + ms.join(", ");
  }

  G.travel = function (to, x) {
    if (G.transitioning) return;
    G.transitioning = true;
    $("#fade").classList.add("on");
    S.travel(to, x);            // the rules decide whether this map is open
    S.save();
    setTimeout(() => { UI.clearPlates(); G.scene.scene.restart({ map: to, x }); }, 300);
  };
  G.travelScene = G.travel;

  // ---------------- battle glue ----------------
  G.startBattle = function (m) {
    if (UI.blocking() || G.transitioning) return;
    if (S.d.hp <= 0) { UI.toast("Bạn đang hết máu. Hồi sinh hoặc nghỉ ở làng trước đã.", "warn"); return; }
    G.battle = BATTLE;
    document.body.classList.add("inbattle");
    BATTLE.start(m);
    SND.music("battle");
  };
  G.practice = function (list) {
    if (!list || !list.length) { UI.toast("Chưa có từ nào trong nhóm này.", "info"); return; }
    PANELS.close();
    const sc = G.scene; let m = sc.dummy;
    if (!m || m.state !== "wander" || Math.abs(m.x - sc.pz.x) > 700) {
      const x = Phaser.Math.Clamp(sc.pz.x + 150 * sc.facing, 80, sc.W - 80);
      m = sc.makeMonster("dummy", x, WORLD_CONST.GROUND, 98, {});
      G.tempDummy = m;
    }
    G.battle = BATTLE; document.body.classList.add("inbattle");
    BATTLE.start(m, { practice: true, list });
  };
  G.afterBattle = function (result) {
    document.body.classList.remove("inbattle");
    G.block(350);
    if (G.tempDummy) { const m = G.tempDummy; G.tempDummy = null; m.sprite.destroy(); m.shadow.destroy(); UI.removePlate(m); }
    SND.music("village");
    UI.refresh();
    setTimeout(() => G.flushLevels(), result === "won" ? 500 : 100);
  };
  G.flushLevels = function () {
    if ((G.battle && G.battle.active) || PANELS.overOpen() || PANELS.isOpen()) return;
    if (G.pendingLv.length) { const l = G.pendingLv[G.pendingLv.length - 1]; const from = G.pendingLv[0]; G.pendingLv = []; PANELS.levelUp(from, l); return; }
    if (S.d.level >= 10 && !S.d.cls && !G.classAsked) { G.classAsked = true; PANELS.classPick(); }
  };
  G.runStart = function () { if (G.running) return; G.running = true; G.runT = performance.now(); G.runKills = S.d.stats.kills; G.runWords = S.d.stats.correct; mb()?.run?.start?.(); };
  G.runEnd = function (reason) {
    if (!G.running) return; G.running = false;
    mb()?.run?.end?.({ reason, seconds: Math.round((performance.now() - G.runT) / 1000), level: S.d.level, kills: S.d.stats.kills - G.runKills, words: S.d.stats.correct - G.runWords });
  };
  G.revive = async function () {
    if (BATTLE.active) BATTLE.end("died");
    const mapId = G.scene.mapId;
    const campX = G.scene.respawnX ? G.scene.respawnX() : 200;
    const r = await S.reviveOp();
    const lost = r && r.ok && r.result ? r.result.lost : 0;
    document.body.classList.remove("dead");
    PANELS.closeOver();
    G.scene.revive();
    S.emit("change"); S.save(true);
    G.runStart();                 // a new run starts when the ninja is on their feet again
    if (lost) setTimeout(() => UI.toast(`Bạn tỉnh dậy ở ${GD.MAPS[mapId].name}. Mất ${lost} vàng.`, "warn"), 500);
  };

  // ---------------- input ----------------
  function setupInput() {
    const touch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    if (touch) document.body.classList.add("touch");
    window.addEventListener("touchstart", () => document.body.classList.add("touch"), { once: true, passive: true });
    window.addEventListener("keydown", (e) => {
      if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && document.body.classList.contains("touch") && BATTLE.active) { /* a real keyboard on a touch device works too */ }
      if (!G.started) { if (e.key === "Enter" && !$("#tPlay").disabled) $("#tPlay").click(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (PANELS.overOpen()) { if (PANELS.overKey(e)) e.preventDefault(); return; }
      if (BATTLE.active) {
        if (UI.learnOpen() || BATTLE.state === "learn" || BATTLE.state === "reveal") { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); BATTLE.cont(); } return; }
        if (BATTLE.key(e)) { e.preventDefault(); UI.keyFlash(e.key); }
        return;
      }
      if (PANELS.isOpen()) { if (e.key === "Escape") { PANELS.close(); e.preventDefault(); } else PANELS.key?.(e); return; }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
      if (e.key === "q" || e.key === "Q") PANELS.open("quests");
      if (e.key === "i" || e.key === "I" || e.key === "b" || e.key === "B") PANELS.open("bag");
      if (e.key === "n" || e.key === "N") PANELS.open("book");
    });
    const hold = (el, k) => {
      const on = (e) => { e.preventDefault(); G.touch[k] = true; el.classList.add("on"); };
      const off = () => { G.touch[k] = false; el.classList.remove("on"); };
      el.addEventListener("pointerdown", on); el.addEventListener("pointerup", off); el.addEventListener("pointercancel", off); el.addEventListener("pointerleave", off);
    };
    // Analog-style mobile joystick. The current world is a side-scrolling 2D map,
    // so the horizontal axis drives movement; the visual knob follows the finger.
    const stick = $("#moveStick"), knob = $("#moveStickKnob");
    if (stick && knob) {
      let pointerId = null;
      let jumpGestureActive = false;
      const resetStick = () => {
        pointerId = null; G.touch.left = false; G.touch.right = false;
        jumpGestureActive = false;
        knob.style.transform = "translate(0, 0)"; stick.classList.remove("active");
      };
      const moveStick = (e) => {
        if (pointerId !== e.pointerId) return;
        e.preventDefault();
        const r = stick.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const max = r.width * 0.29, dist = Math.hypot(dx, dy) || 1, scale = Math.min(1, max / dist);
        const x = dx * scale, y = dy * scale;
        knob.style.transform = `translate(${x}px, ${y}px)`;
        G.touch.left = dx < -10; G.touch.right = dx > 10;
        // Flick the joystick upward to jump, like a mobile MOBA control.
        // Trigger once per upward gesture; returning to center rearms it.
        const upward = dy < -Math.max(18, r.height * 0.16);
        if (upward && !jumpGestureActive) {
          G.touch.jump = true;
          jumpGestureActive = true;
        } else if (!upward && dy > -Math.max(8, r.height * 0.07)) {
          jumpGestureActive = false;
        }
      };
      stick.addEventListener("pointerdown", (e) => {
        e.preventDefault(); pointerId = e.pointerId; stick.setPointerCapture?.(pointerId);
        stick.classList.add("active"); moveStick(e);
      });
      stick.addEventListener("pointermove", moveStick);
      stick.addEventListener("pointerup", resetStick);
      stick.addEventListener("pointercancel", resetStick);
      stick.addEventListener("lostpointercapture", resetStick);
    }
    $("#padJump").addEventListener("pointerdown", (e) => { e.preventDefault(); G.touch.jump = true; });
    $("#padAct").addEventListener("click", () => { if (!UI.blocking() && !BATTLE.active && G.scene) G.scene.interactNearest(); });
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("visibilitychange", () => { if (document.hidden) S.save(true); });
    window.addEventListener("pagehide", () => S.save(true));
  }

  // ---------------- boot ----------------
  async function boot() {
    setupInput();
    SND.init();
    UI.init();
    const tuneP = (mb()?.tune ? mb().tune() : fromFile()).then((v) => { S.tune = v || {}; }).catch(() => {});
    mb()?.tune?.on?.((v) => { S.tune = v || {}; });
    mb()?.measure?.([
      { name: "word_correct", kind: "count", label: "Từ trả lời đúng" },
      { name: "monster_defeated", kind: "count", label: "Quái bị hạ" },
      { name: "level_up", kind: "value", label: "Cấp đạt được" },
      { name: "quest_done", kind: "count", label: "Nhiệm vụ hoàn thành" },
      { name: "weapon_evolved", kind: "step", label: "Tiến hóa vũ khí lớp" },
    ]);
    const fontsP = Promise.all(['700 17px "Baloo 2"', '800 17px "Baloo 2"', '700 13px "Be Vietnam Pro"', '400 13px "Be Vietnam Pro"', '600 20px "IBM Plex Mono"', '400 16px "Noto Sans"']
      .map((f) => document.fonts.load(f, "Lựa chọn ʃ").catch(() => {})));
    const loadP = Promise.race([S.boot().catch(() => false), new Promise((r) => setTimeout(() => r("slow"), 12000))]);
    const gameP = makeGame();
    UI.titleArt();
    const [had] = await Promise.all([loadP, tuneP, fontsP]);
    if (had === "slow") console.warn("load slow");
    const existed = had === true;
    if (!S.d) S.newGame();
    await gameP;
    await addTextures(G.game, textureJobs());
    await G.refreshLook();
    const btn = $("#tPlay");
    btn.disabled = false;
    btn.textContent = existed ? `Chơi tiếp (Lv ${S.d.level})` : "Bắt đầu";
    $("#tScope").textContent = S.mode === "world"
      ? (S.migrated ? "Đã chuyển bản lưu cũ lên máy chủ theo tài khoản của bạn." : "Tiến trình được lưu lên máy chủ theo tài khoản của bạn.")
      : S.scope === "account" ? "Tiến trình được lưu vào tài khoản của bạn." : S.scope === "browser" ? "Tiến trình lưu trên trình duyệt này. Đăng nhập để lưu theo tài khoản." : S.scope === "error" ? "Không tải được bản lưu. Tiến trình mới sẽ được lưu khi kết nối lại." : "Tiến trình lưu trên trình duyệt này.";
    btn.onclick = () => start();
    S.on("levelup", (l) => { G.pendingLv.push(l); if (!BATTLE.active) setTimeout(() => G.flushLevels(), 200); });
    // signing in (or out) while the page is open: the saves live in another namespace, so say so
    mb()?.viewer?.onchange?.((who) => {
      if (!G.started) return;
      const nowAccount = !!who.signedIn;
      if (nowAccount && S.mode !== "world") setTimeout(() => UI.toast("Bạn đã đăng nhập. Tải lại trang để tiến trình được lưu theo tài khoản.", "info"), 800);
    });
  }
  function start() {
    if (G.started) return; G.started = true;
    // Browsers may reject orientation locking; Android APK will also lock this
    // in its native Activity configuration when the Capacitor shell is added.
    try { screen.orientation?.lock?.("landscape")?.catch?.(() => {}); } catch {}
    SND.unlock();
    $("#title").hidden = true;
    UI.showWorldUi(true);
    S.clampHp();
    if (S.d.hp <= 0) { S.d.hp = Math.ceil(S.stats().hp * 0.6); }
    G.game.scene.add("world", WorldScene, true, { map: S.d.map || "village", x: S.d.x });
    G.runStart();
    setTimeout(onResize, 50);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
