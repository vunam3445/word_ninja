// Word Ninja: the side-scrolling world (Phaser 3).
(function () {
  const { MAPS, MONSTERS, NPCS, C } = GD;
  const GROUND = 600;
  const NINJA_SCALE = 0.4;               // texture is 2x the 120x150 drawing
  // every monster is drawn at its own size; scale it to the width its tier should read at
  const TIER_W = { normal: 54, elite: 78, boss: 190, dummy: 42 };
  function monScale(mid) {
    const a = ART.MONSTER_ART[mid];
    const w = (a && a.w) || 120;
    const tier = (GD.MONSTERS[mid] && GD.MONSTERS[mid].tier) || "normal";
    return (TIER_W[tier] || 54) / w;
  }
  const PROP_S = 0.5;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Skill VFX palette copied from the animation reference build. This is presentation-only.
  const THEME = {
    kiem: { main: 0xd2462e, light: 0xf3e6c8, steel: 0xdfe6ef, guard: 0x5a8fa8, alt: 0x8c2f1e },
    anh: { main: 0x3e8c6e, light: 0xdcf5e8, steel: 0xcfe6dc, guard: 0x2e7d5f, alt: 0x1f5c46 },
    linh: { main: 0xe0a526, light: 0xfff0c8, steel: 0x9fb8ff, guard: 0x6f8fe0, alt: 0x8a5ad8 },
  };
  const themeOf = (cls) => THEME[cls] || THEME.kiem;

  // Each map's dressing. solid: collider box (w, h in world units, from the bottom), plat: can be stood on.
  const LAYOUT = {
    village: [
      ["gate", 110, { s: 1 }], ["house", 360, {}], ["lanternPost", 520, {}], ["board", 680, { s: 0.9 }], ["tree", 820, { s: 0.9, v: 1 }],
      ["stall", 1010, {}], ["house", 1230, { v: 1 }], ["forge", 1500, {}], ["well", 1720, { s: 0.9 }], ["pavilion", 1960, {}],
      ["tree", 2160, { s: 1 }], ["lanternPost", 2400, {}], ["signpost", 2510, { label: "Cánh Đồng →" }],
      ["bush", 260, { front: true, s: 0.8 }], ["flowers", 600, { front: true }], ["bush", 1340, { front: true, s: 0.7 }], ["flowers", 1820, { front: true }], ["bush", 2240, { front: true, s: 0.8 }],
    ],
    farm1: [
      ["signpost", 110, { label: "← Làng", flip: true }], ["tree", 300, {}], ["rice", 420, {}], ["fence", 540, { solid: [130, 52] }],
      ["rice", 660, {}], ["rice", 1020, {}], ["haystack", 900, { solid: [128, 86], plat: true }], ["tree", 1270, { v: 1, s: 0.85 }], ["pond", 1370, { ground: true }],
      ["fence", 1760, { solid: [130, 52] }], ["rice", 1880, {}], ["tree", 2070, {}], ["haystack", 2200, { solid: [128, 86], plat: true }],
      ["rice", 2450, {}], ["fence", 2580, { solid: [130, 52] }], ["rice", 2860, {}], ["haystack", 2960, { solid: [128, 86], plat: true }],
      ["tree", 3260, { v: 1 }], ["rice", 3520, {}], ["signpost", 3660, { label: "Ruộng Bậc Thang →", lock: "farm2" }],
      ["flowers", 760, { front: true }], ["bush", 1500, { front: true, s: 0.7 }], ["flowers", 2700, { front: true }], ["bush", 3380, { front: true, s: 0.7 }],
    ],
    farm2: [
      ["signpost", 110, { label: "← Cánh Đồng", flip: true }], ["bamboo", 280, { s: 0.9 }], ["rock", 470, { solid: [100, 60] }], ["bamboo", 920, {}],
      ["boulder", 1400, { solid: [160, 100], plat: true }], ["rock", 1900, { solid: [100, 60] }], ["bamboo", 2360, { s: 1.1 }], ["stoneLantern", 2720, {}],
      ["terrace", 3075, { tw: 460, th: 96, plat: true }], ["bamboo", 3420, { s: 0.9 }], ["stoneLantern", 3600, {}], ["stoneGate", 3990, { s: 1.15 }],
      ["stoneLantern", 4300, {}], ["bush", 1050, { front: true, s: 0.7 }], ["bush", 2500, { front: true, s: 0.7 }],
    ],
    bamboo: [
      ["signpost", 110, { label: "← Ruộng Bậc Thang", flip: true }], ["torii", 260, { s: 1.05 }],
      ["camp", 560, {}], ["bamboo", 830, { s: 1 }], ["shrine", 1180, {}], ["moss", 1000, { front: true }],
      ["bamboo", 1470, { s: 0.9 }], ["bridge", 1860, { solid: [170, 54], plat: true }], ["rock", 2100, { solid: [100, 60] }],
      ["bamboo", 2330, { s: 1.1 }], ["blueLantern", 2620, {}], ["bamboo", 2900, { s: 0.95 }], ["moss", 3100, { front: true }],
      ["shrine", 3320, { s: 0.9 }], ["boulder", 3560, { solid: [150, 90], plat: true }], ["bamboo", 3800, { s: 1 }],
      ["stoneLantern", 4050, {}], ["signpost", 4200, { label: "Thung Lũng Hắc Nha →" }],
      ["bush", 700, { front: true, s: 0.7 }], ["bush", 2450, { front: true, s: 0.7 }], ["bush", 3430, { front: true, s: 0.7 }],
    ],
    valley: [
      ["signpost", 110, { label: "← Rừng Trúc Huyền", flip: true }], ["camp", 560, {}], ["deadTree", 830, {}],
      ["rock", 1080, { solid: [110, 56] }], ["bridge", 1420, { solid: [170, 54], plat: true }], ["deadTree", 1720, { v: 1 }],
      ["blueLantern", 1960, {}], ["boulder", 2200, { solid: [160, 92], plat: true }], ["deadTree", 2460, {}],
      ["rock", 2700, { solid: [110, 56] }], ["bridge", 3000, { solid: [170, 54], plat: true }], ["deadTree", 3300, { s: 0.9 }],
      ["blueLantern", 3560, {}], ["rock", 3800, { solid: [110, 56] }], ["stoneGate", 4180, { s: 0.95 }],
      ["signpost", 4020, { label: "Phế Tích Nguyệt Ảnh →" }],
      ["bush", 1250, { front: true, s: 0.6 }], ["bush", 2600, { front: true, s: 0.6 }],
    ],
    ruins: [
      ["signpost", 110, { label: "← Thung Lũng Hắc Nha", flip: true }], ["camp", 560, {}], ["moonGate", 900, {}],
      ["pillar", 1180, {}], ["moss", 1300, { front: true }], ["pillar", 1450, { v: 1 }], ["boulder", 1700, { solid: [150, 88], plat: true }],
      ["pillar", 1950, { v: 1 }], ["moonGate", 2260, { s: 0.95 }], ["moss", 2450, { front: true }],
      ["stoneLantern", 2650, {}], ["pillar", 2900, {}], ["bridge", 3180, { solid: [170, 54], plat: true }],
      ["pillar", 3420, { v: 1 }], ["moonGate", 3680, {}], ["stoneLantern", 3960, {}], ["moonGate", 4260, { s: 1.05 }],
      ["signpost", 4080, { label: "Pháo Đài U Minh →" }],
      ["bush", 2080, { front: true, s: 0.55 }], ["bush", 3330, { front: true, s: 0.55 }],
    ],
    fortress: [
      ["signpost", 110, { label: "← Phế Tích Nguyệt Ảnh", flip: true }], ["camp", 560, {}], ["flag", 830, {}],
      ["wall", 1080, { solid: [170, 84], plat: true }], ["brazier", 1290, {}], ["wall", 1500, { solid: [170, 84], plat: true }],
      ["flag", 1720, {}], ["brazier", 1950, {}], ["wall", 2160, { solid: [170, 84], plat: true }],
      ["flag", 2380, { v: 1 }], ["brazier", 2600, {}], ["wall", 2810, { solid: [170, 84], plat: true }],
      ["flag", 3040, {}], ["brazier", 3260, {}], ["wall", 3470, { solid: [170, 84], plat: true }], ["flag", 3690, {}],
      ["moonGate", 3960, { s: 1.1 }], ["brazier", 4150, {}], ["brazier", 4340, {}], ["flag", 4460, { v: 1 }],
      ["stoneGate", 4180, { s: 1.1 }],
    ],
    cloudsea: [
      ["signpost", 110, { label: "← Pháo Đài U Minh", flip: true }], ["camp", 460, {}],
      ["skyIsland", 820, { s: 1.2, solid: [300, 70], plat: true }], ["bridge", 1150, { solid: [170, 54], plat: true }],
      ["waterfall", 1400, {}], ["shrine", 1650, {}], ["skyIsland", 2050, { solid: [300, 70], plat: true }],
      ["blueLantern", 2350, {}], ["bridge", 2650, { solid: [170, 54], plat: true }], ["shrine", 2950, { s: 0.9 }],
      ["skyIsland", 3350, { s: 1.1, solid: [300, 70], plat: true }], ["waterfall", 3650, { s: 0.9 }], ["blueLantern", 3950, {}],
      ["boulder", 4200, { solid: [150, 90], plat: true }], ["signpost", 4480, { label: "Thành Cổ Thiên Cơ →" }],
      ["bush", 1000, { front: true, s: 0.7 }], ["bush", 3000, { front: true, s: 0.7 }],
    ],
    citadel: [
      ["signpost", 110, { label: "← Biển Mây Phù Vân", flip: true }], ["camp", 460, {}], ["ruinedTower", 830, {}],
      ["wall", 1120, { solid: [170, 84], plat: true }], ["flag", 1330, {}], ["wall", 1560, { solid: [170, 84], plat: true }],
      ["stoneGate", 1820, { s: 1 }], ["ruinedTower", 2180, { v: 1 }],
      ["wall", 2520, { solid: [170, 84], plat: true }], ["brazier", 2740, {}], ["wall", 3000, { solid: [170, 84], plat: true }],
      ["flag", 3220, {}], ["ruinedTower", 3520, {}], ["wall", 3850, { solid: [170, 84], plat: true }],
      ["brazier", 4080, {}], ["stoneGate", 4400, { s: 1.15 }], ["signpost", 4780, { label: "Rừng Linh Hồn →" }],
      ["bush", 1900, { front: true, s: 0.6 }], ["bush", 3300, { front: true, s: 0.6 }],
    ],
    spiritforest: [
      ["signpost", 110, { label: "← Thành Cổ Thiên Cơ", flip: true }], ["camp", 460, {}], ["spiritTree", 900, {}],
      ["deadTree", 1200, { s: 0.9 }], ["shrine", 1500, {}], ["moss", 1350, { front: true }],
      ["pillar", 1800, { v: 1 }], ["spiritTree", 2250, { s: 0.85 }], ["moonGate", 2600, { s: 0.95 }],
      ["deadTree", 2900, {}], ["pillar", 3200, {}], ["shrine", 3500, { s: 0.9 }],
      ["spiritTree", 3900, { s: 0.9 }], ["moss", 4100, { front: true }], ["boulder", 4350, { solid: [150, 88], plat: true }],
      ["stoneGate", 4680, { s: 1.05 }], ["signpost", 4900, { label: "Sơn Mạch Lôi Đình →" }],
      ["bush", 2000, { front: true, s: 0.55 }], ["bush", 3400, { front: true, s: 0.55 }],
    ],
    thunderrange: [
      ["signpost", 110, { label: "← Rừng Linh Hồn", flip: true }], ["camp", 460, {}], ["thunderColumn", 880, {}],
      ["bridge", 1250, { solid: [170, 54], plat: true }], ["deadTree", 1550, {}], ["rock", 1850, { solid: [110, 56] }],
      ["thunderColumn", 2250, {}], ["boulder", 2600, { solid: [160, 92], plat: true }], ["bridge", 2980, { solid: [170, 54], plat: true }],
      ["thunderColumn", 3400, {}], ["deadTree", 3700, { s: 0.9 }], ["rock", 3980, { solid: [110, 56] }],
      ["pillar", 4280, { v: 1 }], ["stoneGate", 4620, { s: 1.1 }], ["signpost", 4900, { label: "Điện Thiên Mệnh →" }],
      ["bush", 1700, { front: true, s: 0.6 }], ["bush", 3150, { front: true, s: 0.6 }],
    ],
    fatehall: [
      ["signpost", 110, { label: "← Sơn Mạch Lôi Đình", flip: true }], ["camp", 460, {}], ["fateGate", 950, {}],
      ["pillar", 1350, { v: 1 }], ["brazier", 1600, {}], ["moonGate", 1900, { s: 1 }],
      ["shrine", 2300, { s: 0.95 }], ["pillar", 2600, {}], ["brazier", 2850, {}],
      ["fateGate", 3100, { s: 0.9 }], ["moonGate", 3400, {}], ["brazier", 3560, {}],
      ["bush", 1200, { front: true, s: 0.6 }], ["bush", 2700, { front: true, s: 0.6 }],
    ],
  };
  // A monster spawned over a standable prop stands on top of it, so nothing ever floats or sinks.
  function platformTop(mapId, x) {
    const rows = LAYOUT[mapId] || [];
    for (const [k, px, o] of rows) {
      if (!o || !o.plat || !o.solid) continue;
      const half = (k === "terrace" ? (o.tw - 4) : o.solid[0]) / 2;
      if (x > px - half + 12 && x < px + half - 12) return GROUND - o.solid[1];
    }
    if (mapId === "farm2" && x > 2845 && x < 3305) return GROUND - 96;
    return GROUND;
  }
  const SPAWN_Y = (map, x) => platformTop(map, x);

  class World extends Phaser.Scene {
    constructor() { super("world"); }
    init(data) { this.mapId = data.map || S.d.map || "village"; this.arriveX = data.x; }

    create() {
      const map = MAPS[this.mapId]; this.map = map; this.W = map.width;
      G.scene = this; document.body.dataset.map = this.mapId;
      S.d.map = this.mapId;
      this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
      this.solids = this.physics.add.staticGroup();
      this.physics.world.setBounds(0, -2000, this.W, 4000);

      // parallax layers
      const th = map.theme;
      this.clouds = this.add.tileSprite(0, 0, 4096, 260, "bg_clouds_" + th).setOrigin(0, 0).setDepth(-30);
      this.far = this.add.tileSprite(0, 0, 4096, 420, "bg_far_" + th).setOrigin(0, 1).setDepth(-20);
      this.mid = this.add.tileSprite(0, 0, 4096, 320, "bg_mid_" + th).setOrigin(0, 1).setDepth(-10);
      this.add.tileSprite(-400, GROUND - 10, this.W + 800, 212, "bg_ground_" + th).setOrigin(0, 0).setDepth(5);
      const dirt = (ART.DIRT && ART.DIRT[th]) || (th === "farm2" ? 0x76644f : th === "farm1" ? 0x9e7b55 : 0xb08f64);
      this.add.rectangle(-400, GROUND + 200, this.W + 800, 3000, dirt).setOrigin(0, 0).setDepth(5);
      const floor = this.add.zone(this.W / 2, GROUND + 60, this.W + 800, 120); this.physics.add.existing(floor, true); this.solids.add(floor);

      // props
      this.signs = [];
      for (const [k, x, o] of LAYOUT[this.mapId]) this.placeProp(k, x, o);

      // spawn circles + monsters
      this.monsters = [];
      map.spawns.forEach((sp, i) => {
        const y = SPAWN_Y(this.mapId, sp.x);
        this.add.image(sp.x, y + 2, "p_spawn").setOrigin(0.5, 0.5).setScale(sp.m === "boss" ? 1.4 : 0.6).setDepth(6);
        this.monsters.push(this.makeMonster(sp.m, sp.x, y, i, sp));
      });

      // NPCs: the ones who live on this map. The training dummy stays in the village.
      this.npcs = [];
      for (const id in NPCS) if ((NPCS[id].map || "village") === this.mapId) this.npcs.push(this.makeNpc(id, NPCS[id].x));
      if (this.mapId === "village") this.dummy = this.makeMonster("dummy", 2290, GROUND, 99, {});

      // player
      const startX = this.arriveX ?? S.d.x ?? 320;
      this.pz = this.add.zone(Phaser.Math.Clamp(startX, 60, this.W - 60), GROUND - 60, 34, 96);
      this.physics.add.existing(this.pz);
      this.pz.body.setCollideWorldBounds(true).setMaxVelocity(600, 1400);
      this.physics.add.collider(this.pz, this.solids);
      this.player = this.add.image(0, 0, "nj_idle0").setOrigin(0.5, 146 / 150).setScale(NINJA_SCALE).setDepth(10);
      this.facing = 1; this.act = null; this.actT = 0; this.runDist = 0; this.blinkT = 2000; this.dead = false;
      // Arcade physics advances after Scene.update. Sync the rendered sprite after physics,
      // rather than one frame before it, eliminating the visible one-frame chase/jitter.
      this._lastFrameDt = 1 / 60; this._lastFrameTime = 0;
      this.syncVisiblePlayer = () => {
        if (!this.pz || !this.player || !this.pz.body) return;
        this.player.setPosition(this.pz.x, this.pz.y + 50);
        this.player.setFlipX(this.facing < 0);
        this.updateScarf(this._lastFrameDt, this._lastFrameTime);
        this.layoutCamera(false, this._lastFrameDt);
        if (UI && UI.updatePlates) UI.updatePlates(this);
        if (S.d && S.d.map === this.mapId) {
          S.d.x = this.pz.x;
          S.d.pos = { map: this.mapId, x: this.pz.x };
        }
      };
      this.events.on('postupdate', this.syncVisiblePlayer, this);
      this.events.once('shutdown', () => this.events.off('postupdate', this.syncVisiblePlayer, this));
      this.scarfG = this.add.graphics().setDepth(9);
      this.scarf = null;
      this.lookKey = null; G.refreshLook();
      this.inv = 0;
      this.statusFx = []; this.guardGfx = null; this.bindGfx = null; this.zoneGfx = null;

      this.keys = this.input.keyboard.addKeys("LEFT,RIGHT,UP,A,D,W,SPACE,E,ENTER");
      this.input.keyboard.disableGlobalCapture();
      // A key held while the tab loses focus never sends its keyup, so the player would run on
      // their own when they come back. Both the touch pads and Phaser's key map are cleared here.
      this.onBlur = () => {
        G.touch.left = G.touch.right = G.touch.jump = false;
        for (const k in this.keys) { const key = this.keys[k]; if (key) { key.isDown = false; key.isUp = true; } }
        S.save(true);
      };
      this.onVis = () => { if (document.hidden) this.onBlur(); };
      window.addEventListener("blur", this.onBlur);
      document.addEventListener("visibilitychange", this.onVis);
      this.events.once("shutdown", () => { window.removeEventListener("blur", this.onBlur); document.removeEventListener("visibilitychange", this.onVis); });
      this.moveTarget = null; this.pending = null;
      this.cx = this.pz.x; this.camZoom = 1;
      this.layoutCamera(true);
      G.onSceneReady(this);
      this.events.once("shutdown", () => { UI.clearPlates(); this.clearStatusFx(); });
    }

    // why a gate is shut, in the player's words
    gateReason(to, acc) {
      const m = MAPS[to]; const req = m.req || {};
      if (req.lv && S.d.level < req.lv) return "cần cấp " + req.lv + " (bạn đang cấp " + S.d.level + ")";
      if (req.cls && !S.d.cls) return "cần chọn lớp nhân vật ở cấp 10";
      if (req.quest && S.qs(req.quest)?.st !== "claimed") { const q = S.questDef(req.quest); return "cần hoàn thành nhiệm vụ “" + (q ? q.name : req.quest) + "”"; }
      if (req.flag && !S.d.unlocked[req.flag]) return "cần hoàn thành nhiệm vụ mở đường";
      return "chưa đủ điều kiện";
    }

    placeProp(k, x, o = {}) {
      const s = (o.s || 1) * PROP_S;
      let key = "p_" + k + (o.v ? o.v : "");
      if (k === "terrace") key = "p_terrace_" + o.tw + "_" + o.th;
      const y = o.ground ? GROUND + 14 : o.front ? GROUND + 34 : GROUND + 4;
      const img = this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(o.front ? 30 : o.ground ? 6 : 2);
      img.setScale(k === "terrace" ? 1 : s);
      if (o.flip) img.setFlipX(true);
      if (k === "terrace") { img.setOrigin(0.5, 1); img.y = GROUND + 4; img.setDepth(7); }
      if (o.solid || k === "terrace") {
        const w = k === "terrace" ? o.tw - 4 : o.solid[0], h = k === "terrace" ? o.th - 2 : o.solid[1];
        const z = this.add.zone(x, GROUND - h / 2, w, h); this.physics.add.existing(z, true); this.solids.add(z);
        img.setDepth(k === "terrace" ? 7 : 8);
        if (k !== "terrace") this.add.ellipse(x, GROUND + 2, w * 1.05, 14, 0x2a2320, 0.18).setDepth(6);
      }
      if (o.label) {
        const t = this.add.text(x - (o.flip ? -8 : 8), y - 96, o.label, { fontFamily: "Baloo 2", fontSize: "17px", color: "#2A2320", fontStyle: "700" })
          .setOrigin(0.5, 0.5).setDepth(3).setResolution(3);
        this.signs.push({ t, o, x });
      }
      return img;
    }

    makeNpc(id, x) {
      const n = { id, x, y: GROUND, t: Math.random() * 3 };
      n.sprite = this.add.image(x, GROUND + 2, "npc_" + id + "_a").setOrigin(0.5, 146 / 150).setScale(NINJA_SCALE).setDepth(9);
      n.sprite.setFlipX(true);
      const sx = x + 74, sy = GROUND - 150;
      n.sign = this.add.image(sx, sy, "p_signBoard").setScale(0.5).setDepth(8);
      n.signIcon = this.add.image(sx - 26, sy + 5, "ic_sign_" + NPCS[id].sign).setScale(0.32).setDepth(8);
      n.signText = this.add.text(sx + 12, sy + 5, NPCS[id].role, { fontFamily: "Be Vietnam Pro", fontSize: "13px", color: "#F3E6C8", fontStyle: "700" }).setOrigin(0.5).setDepth(8).setResolution(3);
      this.add.line(0, 0, sx - 22, sy - 18, sx - 22, sy - 150, 0x2a2320).setOrigin(0).setLineWidth(1.4).setDepth(1);
      n.bang = this.add.image(x, GROUND - 150, "p_bang").setScale(0.5).setDepth(12).setVisible(false);
      return n;
    }

    makeMonster(mid, x, y, idx, sp) {
      const def = MONSTERS[mid];
      const hard = S.d.settings.diff === "hard" && mid !== "dummy" ? 1.25 : 1;
      // Every placed monster gets a stable spawn identity. Multiple monsters can share the
      // same type, but their respawn cooldowns and combat sessions must remain independent.
      const spawnId = `${this.mapId}:${idx}:${mid}`;
      const m = { mid, def, idx, spawnId, sx: x, x, y, hp: Math.round(def.hp * hard), maxHp: Math.round(def.hp * hard), state: "wander", dir: Math.random() < 0.5 ? -1 : 1,
        pause: 0, t: Math.random() * 10, sp, rewarded: false, deadAt: 0, scale: monScale(mid) };
      m.sprite = this.add.image(x, y + 2, "m_" + mid + "_idle").setOrigin(0.5, 1).setScale(m.scale).setDepth(mid === "boss" ? 8.5 : 9);
      m.shadow = this.add.ellipse(x, y + 2, m.sprite.displayWidth * 0.7, 12, 0x2a2320, 0.16).setDepth(6.5);
      if (def.tier === "elite") m.aura = this.add.graphics().setDepth(8.4);
      m.hidden = !!(sp.needQuest && !S.qs(sp.needQuest));
      if (m.hidden) { m.sprite.setVisible(false); m.shadow.setVisible(false); m.state = "hidden"; }
      UI.makePlate(m);
      return m;
    }

    // ---------------- per frame ----------------
    update(time, dtms) {
      const dt = Math.min(0.05, Math.max(0, dtms / 1000));
      this._lastFrameDt = dt || 1 / 60; this._lastFrameTime = time;
      const inBattle = !!(G.battle && G.battle.active);
      const ui = UI.blocking();
      const st = S.stats();
      const speed = 250 * (1 + (st.spd || 0) / 100) * (S.tune.move_speed || 1);
      const b = this.pz.body;

      // input
      let mx = 0, jump = false;
      // read every edge each frame, so a key pressed in a menu or a battle never fires later in the world
      const JD = Phaser.Input.Keyboard.JustDown, k = this.keys;
      const jumpKey = JD(k.UP) | JD(k.W) | JD(k.SPACE), useKey = JD(k.E) | JD(k.ENTER);
      const touchJump = G.touch.jump; G.touch.jump = false;
      const free = !inBattle && !ui && !this.dead && !G.keyBlock();
      if (free) {
        if (k.LEFT.isDown || k.A.isDown || G.touch.left) mx -= 1;
        if (k.RIGHT.isDown || k.D.isDown || G.touch.right) mx += 1;
        if (jumpKey || touchJump) jump = true;
        if (useKey) this.interactNearest();
        if (mx) { this.moveTarget = null; this.pending = null; }
        if (!mx && this.moveTarget != null) {
          const d = this.moveTarget - this.pz.x;
          if (Math.abs(d) < 10) { this.moveTarget = null; if (this.pending) { const p = this.pending; this.pending = null; this.doInteract(p); } }
          else mx = Math.sign(d);
          if (this.pending && this.pending.kind === "monster" && Math.abs(this.pending.m.x - this.pz.x) < 150) { const p = this.pending; this.pending = null; this.moveTarget = null; mx = 0; this.doInteract(p); }
        }
      }
      if (!inBattle && !this.dead) {
        b.enable = true;
        // Approach the target horizontal velocity instead of hard-snapping every frame.
        // The acceleration is deliberately high enough to feel responsive, while easing
        // direction changes avoids the stutter commonly seen when reversing A/D quickly.
        const targetVx = mx * speed;
        const accel = mx ? 2200 : 3000;
        const nextVx = Phaser.Math.Linear(b.velocity.x, targetVx, Math.min(1, accel * dt / Math.max(1, speed)));
        b.setVelocityX(Math.abs(nextVx) < 3 && mx === 0 ? 0 : nextVx);
        if (mx) this.facing = mx;
        if (jump && b.blocked.down) b.setVelocityY(-660);
      } else { b.setVelocityX(0); }

      // exits
      if (!inBattle && !this.dead && !G.transitioning) {
        const x = this.pz.x;
        for (const ex of this.map.exits) {
          const hit = ex.side === "left" ? x < 46 : x > this.W - 46;
          if (!hit) continue;
          const acc = S.mapAccess(ex.to);
          if (!acc.ok) {
            this.pz.x = ex.side === "left" ? 60 : this.W - 60; b.setVelocityX(0); this.moveTarget = null;
            UI.toast(MAPS[ex.to].name + " đang khóa: " + this.gateReason(ex.to, acc), "warn");
            G.block(400);
          } else G.travel(ex.to, ex.side === "left" ? MAPS[ex.to].width - 110 : 110);
        }
      }

      // Animation updates here; position/camera/scarf sync after Arcade physics in postupdate.
      this.updatePlayerFrame(dtms, mx);

      // monsters and npcs
      for (const m of this.monsters) this.updateMonster(m, dt, time);
      if (this.dummy) this.updateMonster(this.dummy, dt, time);
      for (const n of this.npcs) {
        n.t += dt;
        const f = n.t % 4 > 3.85 ? "c" : Math.floor(n.t * 1.6) % 2 ? "b" : "a";
        n.sprite.setTexture("npc_" + n.id + "_" + f);
        n.sprite.setFlipX(this.pz.x < n.x);
        const mark = S.npcMark(n.id);
        n.bang.setVisible(!!mark && !inBattle);
        n.bang.setTint(mark === "claim" ? 0xe0a526 : 0xffffff);
        n.bang.y = GROUND - 150 + Math.sin(time / 260) * 5;
      }

      // Regen: server-authoritative for account mode; browser-only mode keeps local regeneration.
      if (!inBattle && !this.dead) {
        this.regenT = (this.regenT || 0) + dt;
        if (this.regenT > (S.mode === 'world' ? 4 : 1)) {
          this.regenT = 0;
          if (S.mode === 'world' && typeof S.serverRegen === 'function') {
            if (!this._regenPromise) this._regenPromise = S.serverRegen().catch((e) => console.warn('server regen failed', e)).finally(() => { this._regenPromise = null; });
          } else {
            const rate = this.mapId === "village" ? 0.05 : 0.01;
            if (S.d.hp < st.hp || S.d.mp < st.mp) { S.d.hp = Math.min(st.hp, S.d.hp + Math.ceil(st.hp * rate)); S.d.mp = Math.min(st.mp, S.d.mp + Math.ceil(st.mp * rate)); S.emit("change"); }
          }
        }
      }
    }

    updatePlayerFrame(dtms, mx) {
      let f;
      if (this.act) {
        this.actT += dtms;
        const seq = { atk: [["atk0", 90], ["atk1", 110], ["atk2", 160]], cast: [["cast", 380], ["atk1", 140], ["atk2", 140]], hurt: [["hurt", 320]], win: [["win", 900]] }[this.act];
        let acc = 0; f = null;
        for (const [k, d] of seq) { acc += d; if (this.actT < acc) { f = k; break; } }
        if (!f) { this.act = null; }
      }
      if (!f) {
        if (this.dead) f = "dead";
        else if (!this.pz.body.blocked.down && this.pz.body.enable) f = this.pz.body.velocity.y < 0 ? "jump" : "fall";
        else if (mx) { this.runDist += Math.abs(this.pz.body.velocity.x) * dtms / 1000; f = "run" + (Math.floor(this.runDist / 26) % 6); }
        else { this.blinkT -= dtms; if (this.blinkT < 0) { f = "blink"; if (this.blinkT < -130) this.blinkT = 2500 + Math.random() * 2500; } else f = Math.floor(performance.now() / 520) % 2 ? "idle1" : "idle0"; }
      }
      const key = "nj" + (this.lookKey ? "_" + this.lookKey : "") + "_" + f;
      // setTexture() on every render frame can repeatedly reset the same texture/frame in
      // Phaser, producing a subtle flicker while holding A/D. Only swap when the visual frame
      // actually changes; physics and the sprite continue updating every frame.
      if (this.textures.exists(key) && this.player.texture.key !== key) this.player.setTexture(key);
      this.frameName = f;
    }
    playAct(a) { this.act = a; this.actT = 0; }

    // a cloth chain pinned at the back of the neck
    updateScarf(dt, time) {
      const N = 9, seg = 7.5;
      const ax = this.player.x - this.facing * 9 * (NINJA_SCALE / 0.4), ay = this.player.y - 50;
      if (!this.scarf) { this.scarf = []; for (let i = 0; i < N; i++) this.scarf.push({ x: ax - this.facing * i * seg, y: ay, px: ax - this.facing * i * seg, py: ay }); }
      const sc = this.scarf; const vx = this.pz.body.velocity.x;
      sc[0].x = ax; sc[0].y = ay; sc[0].px = ax; sc[0].py = ay;
      const wind = -vx * 0.0009 - this.facing * 0.03;
      for (let i = 1; i < N; i++) {
        const p = sc[i]; const nx = p.x + (p.x - p.px) * 0.9 + wind * 60 * dt * 8, ny = p.y + (p.y - p.py) * 0.9 + 260 * dt * dt + Math.sin(time / 180 + i * 0.8) * 0.18 * i;
        p.px = p.x; p.py = p.y; p.x = nx; p.y = ny;
      }
      for (let k = 0; k < 3; k++) for (let i = 1; i < N; i++) {
        const a = sc[i - 1], b = sc[i]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1; const diff = (d - seg) / d;
        if (i === 1) { b.x -= dx * diff; b.y -= dy * diff; } else { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
      }
      const g = this.scarfG; g.clear();
      const col = Phaser.Display.Color.HexStringToColor(G.scarfColor()).color;
      const draw = (w, c) => { g.lineStyle(w, c, 1); g.beginPath(); g.moveTo(sc[0].x, sc[0].y); for (let i = 1; i < N; i++) g.lineTo(sc[i].x, sc[i].y); g.strokePath(); };
      if (this.dead) return;
      draw(10.5, 0x2a2320); draw(6.5, col);
      // knot
      g.fillStyle(0x2a2320, 1); g.fillCircle(ax, ay, 5.5); g.fillStyle(col, 1); g.fillCircle(ax, ay, 3.6);
    }

    updateMonster(m, dt, time) {
      if (m.state === "hidden") {
        if (m.sp.needQuest && S.qs(m.sp.needQuest)) { m.state = "wander"; m.sprite.setVisible(true); m.shadow.setVisible(true); m.hp = m.maxHp; }
        return;
      }
      m.t += dt;
      if (m.state === "dead") {
        if (m.mid !== "dummy" && Date.now() - m.deadAt > (m.def.respawn || 10000)) {
          if (m.sp && m.sp.needQuest && S.qs(m.sp.needQuest)?.st !== "active" && S.qs(m.sp.needQuest)?.st !== "claimed") return;
          m.state = "wander"; m.hp = m.maxHp; m.rewarded = false; m.x = m.sx; m.sprite.setAlpha(0).setVisible(true).setTexture("m_" + m.mid + "_idle");
          m.shadow.setVisible(true); this.tweens.add({ targets: m.sprite, alpha: 1, duration: 500 });
        }
        return;
      }
      if (m.state === "wander" && m.mid !== "dummy" && m.mid !== "boss") {
        if (m.pause > 0) m.pause -= dt;
        else {
          m.x += m.dir * (m.mid === "elite" ? 26 : 34) * dt;
          if (Math.abs(m.x - m.sx) > 72) { m.dir *= -1; m.x = m.sx + Math.sign(m.x - m.sx) * 72; m.pause = 0.6 + Math.random() * 1.4; }
          if (Math.random() < dt * 0.25) m.pause = 0.5 + Math.random();
        }
        m.sprite.setFlipX(m.dir > 0);
      }
      if (m.state === "battle") m.sprite.setFlipX(this.pz.x > m.x);
      if (m.mid === "boss" && m.state === "wander") m.sprite.setFlipX(this.pz.x > m.x + 60);
      // idle motion
      const s = m.scale; let yo = 0, sx = 1, sy = 1, rot = 0;
      if (m.mid === "radish") { yo = -Math.abs(Math.sin(m.t * 5)) * 7; sy = 1 + Math.sin(m.t * 10) * 0.03; }
      else if (m.mid === "dew") { sy = 1 + Math.sin(m.t * 4) * 0.06; sx = 1 - Math.sin(m.t * 4) * 0.05; }
      else if (m.mid === "mush") { rot = Math.sin(m.t * 4) * 0.05; }
      else if (m.mid === "elite" || m.mid === "spiderq") { yo = -6 - Math.sin(m.t * 2.4) * 6; }
      else if (m.mid === "boss" || m.mid === "moonboss" || m.mid === "lord") { sy = 1 + Math.sin(m.t * 1.8) * 0.015; }
      else if (m.mid === "wisp") { yo = -8 - Math.sin(m.t * 2) * 7; }
      else if (m.mid === "shade") { yo = -3 - Math.abs(Math.sin(m.t * 3)) * 4; sx = 1 + Math.sin(m.t * 3) * 0.02; }
      else if (m.mid === "crow") { yo = -Math.abs(Math.sin(m.t * 2.2)) * 5; }
      else if (m.mid === "fox") { yo = -Math.abs(Math.sin(m.t * 4.5)) * 5; rot = Math.sin(m.t * 4.5) * 0.03; }
      else if (m.mid === "wolf" || m.mid === "bandit" || m.mid === "guard" || m.mid === "golem" || m.mid === "ronin" || m.mid === "spider") { sy = 1 + Math.sin(m.t * 3) * 0.02; }
      if (!m.tweening) { m.sprite.setScale(s * sx, s * sy); m.sprite.rotation = rot; m.sprite.x = m.x + (m.ox || 0); }
      m.sprite.y = m.y + 2 + yo;
      m.shadow.x = m.x; m.shadow.setScale(1 + yo / 60, 1);
      if (m.aura) {
        m.aura.clear(); const r = 70 + Math.sin(time / 300) * 5;
        const tele = !!m.charging;
        const col = tele ? 0xd2462e : 0x2e3a5c;
        m.aura.lineStyle(5, col, tele ? 0.85 : 0.55); m.aura.strokeEllipse(m.x, m.y - 2, r * 2, 26);
        m.aura.lineStyle(2, col, tele ? 0.6 : 0.35); m.aura.strokeEllipse(m.x, m.y - 2, r * 2.3, 34);
        if (tele) {
          for (let i = 0; i < 3; i++) {
            const rr = 40 + ((time / 6 + i * 40) % 90);
            m.aura.lineStyle(3, 0xd2462e, 1 - rr / 130); m.aura.strokeCircle(m.x, m.y - m.sprite.displayHeight * 0.5, rr);
          }
        }
      }
    }

    // ---------------- interaction ----------------
    interactNearest() {
      const x = this.pz.x;
      let best = null, bd = 170;
      for (const n of this.npcs) { const d = Math.abs(n.x - x); if (d < bd) { bd = d; best = { kind: "npc", n }; } }
      for (const m of this.monsters.concat(this.dummy ? [this.dummy] : [])) {
        if (m.state !== "wander") continue; const d = Math.abs(m.x - x); if (d < bd) { bd = d; best = { kind: "monster", m }; }
      }
      if (best) this.doInteract(best);
      else UI.toast("Không có ai ở gần. Đi tới một con quái hoặc NPC rồi bấm E.", "info");
    }
    doInteract(p) {
      if (p.kind === "npc") { this.facing = p.n.x > this.pz.x ? 1 : -1; UI.openNpc(p.n.id); }
      if (p.kind === "monster") {
        if (p.m.state !== "wander") return;
        if (p.m.mid === "dummy") { UI.openPractice(); return; }
        G.startBattle(p.m);
      }
    }
    // tap / click in the world
    pointerAt(wx, wy) {
      if (G.battle?.active || this.dead) return;
      const all = this.monsters.concat(this.dummy ? [this.dummy] : []);
      for (const m of all) {
        if (m.state !== "wander") continue;
        const sp = m.sprite; const w = sp.displayWidth * 0.6, h = sp.displayHeight;
        if (Math.abs(wx - m.x) < Math.max(50, w / 2 + 14) && wy < m.y + 24 && wy > m.y - h - 30) { this.goTo(m.x, { kind: "monster", m }); return; }
      }
      for (const n of this.npcs) {
        if (Math.abs(wx - n.x) < 50 && wy < GROUND + 20 && wy > GROUND - 170) { this.goTo(n.x, { kind: "npc", n }); return; }
        if (Math.abs(wx - (n.x + 74)) < 44 && Math.abs(wy - (GROUND - 145)) < 30) { this.goTo(n.x, { kind: "npc", n }); return; }
      }
      this.moveTarget = Phaser.Math.Clamp(wx, 50, this.W - 50); this.pending = null;
      this.tapMark(this.moveTarget);
    }
    goTo(x, p) {
      const side = this.pz.x < x ? -1 : 1;
      const stop = p.kind === "monster" ? x + side * 130 : x + side * 70;
      if (Math.abs(this.pz.x - x) < (p.kind === "monster" ? 150 : 90)) { this.moveTarget = null; this.doInteract(p); return; }
      this.moveTarget = Phaser.Math.Clamp(stop, 50, this.W - 50); this.pending = p;
    }
    tapMark(x) {
      const g = this.add.ellipse(x, GROUND + 4, 40, 12).setStrokeStyle(2.5, 0x2a2320, 0.6).setDepth(6.6);
      this.tweens.add({ targets: g, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 450, onComplete: () => g.destroy() });
    }

    // ---------------- camera ----------------
    layoutCamera(snap, dt = 0.016) {
      const cam = this.cameras.main; const dpr = G.dpr;
      const Wc = G.cssW, Hc = G.cssH;
      const portrait = Hc > Wc;
      let zoom = Math.min(Hc / 560, Wc / 470); zoom = Phaser.Math.Clamp(zoom, 0.45, 2.2);
      let groundFrac = portrait ? 0.71 : 0.8;
      let cx = this.pz.x + this.facing * 40;
      const bt = G.battle && G.battle.active ? G.battle : null;
      if (bt) {
        const r = UI.battleBand();
        const tall = bt.m.mid === "boss" ? 330 : bt.m.mid === "elite" ? 250 : 200;
        const avail = Math.max(80, r.bottom - r.top);
        zoom = Math.min(zoom, avail / tall, Wc / ((bt.m.mid === "boss" ? 620 : 420)));
        zoom = Math.max(0.3, zoom);
        groundFrac = (r.bottom - 6) / Hc;
        cx = (this.pz.x + bt.m.x) / 2 + (bt.m.mid === "boss" ? (bt.m.x > this.pz.x ? 40 : -40) : 0);
        if (Wc > Hc && Hc < 560) cx += (Wc / zoom) * 0.24; // the card sits on the right: keep the fighters in the open left part
      }
      const z = zoom * dpr;
      const k = snap ? 1 : 1 - Math.pow(0.002, dt);
      this.camZoom = snap ? z : this.camZoom + (z - this.camZoom) * k;
      cam.setZoom(this.camZoom);
      const viewW = G.cssW * dpr / this.camZoom, viewH = G.cssH * dpr / this.camZoom;
      this.cx = snap ? cx : this.cx + (cx - this.cx) * (1 - Math.pow(0.02, dt));
      let left = this.cx - viewW / 2; left = Phaser.Math.Clamp(left, 0, Math.max(0, this.W - viewW));
      if (this.W < viewW) left = (this.W - viewW) / 2;
      const top = GROUND - groundFrac * viewH;
      this.gf = snap ? top : (this.gf ?? top) + (top - (this.gf ?? top)) * k;
      // Phaser zooms around the viewport centre: scroll is the centre minus half the canvas
      cam.scrollX = left + viewW / 2 - cam.width / 2; cam.scrollY = this.gf + viewH / 2 - cam.height / 2;
      this.view = { left, top: this.gf, w: viewW, h: viewH };
      // parallax
      const vx = left;
      this.far.x = vx - 2; this.far.y = GROUND - 30; this.far.tilePositionX = vx * 0.15;
      this.mid.x = vx - 2; this.mid.y = GROUND + 6; this.mid.tilePositionX = vx * 0.42;
      this.clouds.x = vx - 2; this.clouds.y = Math.min(GROUND - 560, this.gf + 10); this.clouds.tilePositionX = vx * 0.06 + performance.now() * 0.004;
      const need = viewW + 8; if (this.far.width < need) { this.far.width = need; this.mid.width = need; this.clouds.width = need; }
    }
    worldToScreen(x, y) { const v = this.view; const z = this.camZoom / G.dpr; return { x: (x - v.left) * z, y: (y - v.top) * z }; }
    screenToWorld(sx, sy) { const v = this.view; const z = this.camZoom / G.dpr; return { x: v.left + sx / z, y: v.top + sy / z }; }

    // ---------------- battle effects ----------------
    placeForBattle(m) {
      const side = this.pz.x <= m.x ? -1 : 1;
      const gap = m.mid === "boss" ? 230 : m.mid === "elite" ? 160 : 140;
      let px = Phaser.Math.Clamp(m.x + side * gap, 60, this.W - 60);
      if (Math.abs(px - m.x) < gap * 0.8) px = m.x - side * gap;
      this.pz.body.enable = false; this.pz.body.setVelocity(0, 0);
      const py = SPAWN_Y(this.mapId, px) === GROUND ? GROUND - 50 : this.pz.y;
      this.tweens.add({ targets: this.pz, x: px, y: Math.min(py, this.pz.y > GROUND - 60 ? GROUND - 50 : this.pz.y), duration: 260, ease: "Sine.easeOut" });
      this.facing = m.x > px ? 1 : -1;
      this.moveTarget = null; this.pending = null;
    }
    endBattlePose() { this.pz.body.enable = true; }
    alive(m) { return !!m && (m.state !== "dead" || !!m._vfxDying) && !!(G.battle && G.battle.active); }

    // ---- raw pieces ----
    _blade(cx, cy, ang, len, w, main, light, life = 460) {
      const g = this.add.graphics().setDepth(14);
      const V = (x, y) => new Phaser.Math.Vector2(x, y);
      const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
      const nx = -Math.sin(ang), ny = Math.cos(ang);
      const pts = [V(-dx, -dy), V(nx * w, ny * w), V(dx, dy), V(-nx * w, -ny * w)];
      g.fillStyle(main, 1); g.fillPoints(pts, true);
      g.fillStyle(light, 1); g.fillPoints(pts.map((p) => V(p.x * 0.72, p.y * 0.42)), true);
      g.setPosition(cx, cy).setScale(0.18);
      this.tweens.add({ targets: g, scale: 1, duration: 80, ease: "Quad.easeOut" });
      this.tweens.add({ targets: g, alpha: 0, delay: Math.max(60, life - 240), duration: 240, onComplete: () => g.destroy() });
      return g;
    }
    _crescent(cx, cy, R, r, offx, ang, main, light) {
      const g = this.add.graphics().setDepth(14);
      const V = (x, y) => new Phaser.Math.Vector2(x, y);
      const span = Math.PI, poly = [];
      for (let i = 0; i <= 26; i++) { const a = ang - span / 2 + (i / 26) * span; poly.push(V(R * Math.cos(a), R * Math.sin(a))); }
      for (let i = 26; i >= 0; i--) { const a = ang - span * 0.42 + (i / 26) * span * 0.84; poly.push(V(offx + r * Math.cos(a), r * Math.sin(a))); }
      g.fillStyle(main, 1); g.fillPoints(poly, true);
      g.fillStyle(light, 0.85); g.fillPoints(poly.map((p) => V(p.x * 0.9, p.y * 0.9)), true);
      g.setPosition(cx, cy).setScale(0.4);
      this.tweens.add({ targets: g, scale: 1, duration: 140, ease: "Quad.easeOut" });
      this.tweens.add({ targets: g, alpha: 0, delay: 300, duration: 260, onComplete: () => g.destroy() });
      return g;
    }
    _ring(cx, cy, rx, ry, color, life = 420, lw = 5) {
      const g = this.add.graphics().setDepth(14);
      g.lineStyle(lw, color, 0.95); g.strokeEllipse(0, 0, rx, ry);
      g.setPosition(cx, cy).setScale(0.35);
      this.tweens.add({ targets: g, scale: 1.5, alpha: 0, duration: life, ease: "Quad.easeOut", onComplete: () => g.destroy() });
      return g;
    }
    _burst(cx, cy, n, color, o = {}) {
      if (reduced()) n = Math.ceil(n / 3);
      for (let i = 0; i < n; i++) {
        const d = this.add.circle(cx + (Math.random() - 0.5) * (o.spread || 28), cy + (Math.random() - 0.5) * (o.spread || 28), (o.r || 2.5) + Math.random() * (o.r2 || 3), Math.random() < 0.25 ? (o.alt || color) : color).setDepth(14);
        this.tweens.add({ targets: d, x: d.x + (Math.random() - 0.5) * (o.vx || 120), y: d.y + (Math.random() - 0.55) * (o.vy || 90), alpha: 0, scale: 0.3, duration: (o.life || 420) + Math.random() * 200, onComplete: () => d.destroy() });
      }
    }
    _shadow(x, y, tint, alpha, dx, dy, life) {
      const img = this.add.image(x, y, this.player.texture.key).setOrigin(0.5, 146 / 150).setScale(NINJA_SCALE).setFlipX(this.facing < 0).setDepth(9).setAlpha(alpha);
      if (tint) img.setTint(tint);
      this.tweens.add({ targets: img, x: x + dx, y: y + dy, alpha: 0, duration: life, ease: "Quad.easeOut", onComplete: () => img.destroy() });
      return img;
    }

    // ---- one entry point from the battle ----
    // The battle has already applied every point of damage; this only draws it.
    playHit(m, r) {
      const th = themeOf(r.cls);
      const look = r.look || "", id = r.skillId || "";
      const novice = id === "novice";
      const multi = r.hits > 1;
      const big = (r.kind === "skill") || multi || !!look;
      const delay = novice ? 110 : big ? 260 : 90;
      if (look === "orb" || look === "needles" || multi) this.playAct("cast");
      else this.playAct(big ? "cast" : "atk");
      if (!reduced() && look !== "orb" && look !== "needles") {
        const dir = m.x >= this.pz.x ? 1 : -1;
        this.tweens.add({ targets: this.pz, x: this.pz.x + dir * (look === "whirl" ? 18 : 46), duration: 90, delay: Math.max(0, delay - 60), yoyo: true, hold: 110, ease: "Quad.easeOut" });
      }
      if (look === "orb") return this.fxOrb(m, th, r, delay);
      if (look === "needles") return this.fxNeedles(m, th, r);
      if (look === "crescent") return this.fxCrescent(m, th, r, false);
      if (look === "arc") return this.fxCrescent(m, th, r, true);
      if (look === "whirl") return this.fxWhirl(m, th, r, delay);
      if (look === "ultimate") return this.fxUltimate(m, th, r, delay);
      if (multi) return this.fxMulti(m, th, r, delay);
      return this.fxStrike(m, th, r, delay, novice);
    }

    fxStrike(m, th, r, delay, novice) {
      const dir = m.x >= this.pz.x ? 1 : -1;
      const ang = dir > 0 ? -0.75 : Math.PI + 0.75;
      this.time.delayedCall(delay, () => {
        if (!this.alive(m)) return;
        const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.5;
        const L = Math.max(110, h * 1.15) * (novice ? 0.8 : r.kind === "skill" ? 1.25 : 1);
        this._blade(cx, cy, ang, L, r.crit ? 16 : novice ? 9 : 11, th.main, th.light, novice ? 320 : 460);
        this._burst(cx, cy, novice ? 4 : r.crit ? 10 : 6, th.main, { alt: th.light, life: novice ? 300 : 420 });
        this.hitMonster(m);
        UI.damageNumber(m, r.dmg, r.crit ? "crit" : "hit");
        if (r.crit && !reduced()) this.cameras.main.shake(120, 0.004);
      });
    }

    fxMulti(m, th, r, delay) {
      const n = Math.min(10, r.hits);
      const each = Math.max(1, Math.round(r.dmg / r.hits));
      const ultimate = r.look === "ultimate";
      const step = ultimate ? 62 : 84;
      const twin = r.cls === "anh";
      if (ultimate) this._ultimateIntro(m, th);
      for (let i = 0; i < n; i++) {
        this.time.delayedCall(delay + i * step, () => {
          if (!this.alive(m)) return;
          const h = m.sprite.displayHeight, cx = m.x + (Math.random() - 0.5) * 26, cy = m.y - h * (0.25 + Math.random() * 0.6);
          const base = (m.x >= this.pz.x ? 0 : Math.PI);
          const last = i === n - 1;
          this._blade(cx, cy, base + ((i % 4) * 1.15 - 0.55), Math.max(100, h * 1.05) * (ultimate ? 1.4 : 1), last ? 15 : 10, th.main, th.light, 360);
          if (twin) this._blade(cx, cy, base + ((i % 4) * 1.15 + 1.1), Math.max(95, h), last ? 13 : 9, th.steel, th.light, 340);
          this._burst(cx, cy, last ? 9 : 4, th.main, { alt: th.light, life: 320 });
          this.hitMonster(m);
          UI.damageNumber(m, each, last && r.crit ? "crit" : "hit");
          if (last && (ultimate || r.crit) && !reduced()) this.cameras.main.shake(ultimate ? 150 : 110, ultimate ? 0.005 : 0.003);
        });
      }
      if (ultimate) this.time.delayedCall(delay + n * step + 40, () => { if (this.alive(m)) this._ring(m.x, m.y - m.sprite.displayHeight * 0.5, 110, 84, th.light, 520, 6); });
    }

    // Linh Ẩn: charge an orb, send it to the target, burst on arrival.
    fxOrb(m, th, r, delay) {
      const sx = this.pz.x + this.facing * 22, sy = this.pz.y + 4;
      const orb = this.add.circle(sx, sy, 11, th.main).setDepth(14).setScale(0.2);
      const core = this.add.circle(sx, sy, 5, th.light).setDepth(14.1).setScale(0.2);
      this.tweens.add({ targets: [orb, core], scale: 1, duration: Math.max(120, delay), ease: "Quad.easeOut" });
      this.time.delayedCall(Math.max(120, delay), () => {
        if (!this.alive(m)) { orb.destroy(); core.destroy(); return; }
        const tx = m.x, ty = m.y - m.sprite.displayHeight * 0.5;
        let n = 0;
        this.tweens.add({
          targets: [orb, core], x: tx, y: ty, scale: 0.8, duration: 230, ease: "Sine.easeIn",
          onUpdate: () => { if (++n % 3 === 0) { const d = this.add.circle(orb.x, orb.y, 3, th.steel).setDepth(13.8).setAlpha(0.8); this.tweens.add({ targets: d, alpha: 0, scale: 0.3, duration: 260, onComplete: () => d.destroy() }); } },
          onComplete: () => {
            orb.destroy(); core.destroy();
            if (!this.alive(m)) return;
            this._ring(tx, ty, 54, 42, th.steel, 420, 4);
            this._ring(tx, ty, 30, 24, th.light, 360, 3);
            this._burst(tx, ty, 9, th.main, { alt: th.light });
            this.hitMonster(m);
            UI.damageNumber(m, r.dmg, r.crit ? "crit" : "hit");
          },
        });
      });
    }

    // Linh Ẩn: a fan of needles, one small impact each, one damage number at the end.
    fxNeedles(m, th, r) {
      const n = Math.min(10, r.hits);
      const sx = this.pz.x + this.facing * 20, sy = this.pz.y - 4;
      const tx = m.x, ty = m.y - m.sprite.displayHeight * 0.5;
      for (let i = 0; i < n; i++) {
        this.time.delayedCall(90 + i * 55, () => {
          if (!this.alive(m)) return;
          const jy = (i - (n - 1) / 2) * 15;
          const dart = this.add.triangle(sx, sy, -3, -4, 13, 0, -3, 4, i % 2 ? th.steel : th.main).setDepth(14);
          const tail = this.add.circle(sx, sy, 4, th.light, 0.7).setDepth(13.9);
          this.tweens.add({ targets: tail, alpha: 0, duration: 220, onComplete: () => tail.destroy() });
          this.tweens.add({
            targets: dart, x: tx, y: ty + jy, duration: 190, ease: "Sine.easeIn",
            onComplete: () => {
              dart.destroy();
              if (!this.alive(m)) return;
              this._burst(tx + (Math.random() - 0.5) * 18, ty + jy, 3, th.main, { alt: th.steel, r: 2, r2: 2, life: 260 });
              this.hitMonster(m);
              if (i === n - 1) UI.damageNumber(m, r.dmg, r.crit ? "crit" : "hit");
            },
          });
        });
      }
    }

    fxCrescent(m, th, r, wide) {
      const dir = m.x >= this.pz.x ? 1 : -1;
      const ang = dir > 0 ? -0.5 : Math.PI + 0.5;
      this.time.delayedCall(wide ? 160 : 150, () => {
        if (!this.alive(m)) return;
        const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.5;
        const R = Math.max(150, h * (wide ? 1.75 : 1.35));
        this._crescent(cx, cy, R, R - (wide ? 34 : 26), dir * (wide ? 18 : 12), ang, th.main, th.light);
        for (let i = 0; i < (wide ? 5 : 3); i++) this._burst(cx + dir * (30 + i * 10), cy + (i - 1) * 24, 2, th.light, { alt: th.main, r: 2, r2: 2, life: 340 });
      });
      this.time.delayedCall(wide ? 330 : 310, () => {
        if (!this.alive(m)) return;
        this._burst(m.x + dir * 16, m.y - m.sprite.displayHeight * 0.5, wide ? 10 : 6, th.light, { alt: th.main });
        this.hitMonster(m);
        UI.damageNumber(m, r.dmg, r.crit ? "crit" : "hit");
      });
    }

    fxWhirl(m, th, r, delay) {
      this.time.delayedCall(120, () => {
        if (!this.alive(m)) return;
        const cx = this.pz.x, cy = this.pz.y - 8;
        for (let k = 0; k < 3; k++) {
          const g = this.add.graphics().setDepth(14);
          g.lineStyle(5 - k, k === 0 ? th.light : th.main, 0.9 - k * 0.2);
          g.beginPath(); g.arc(0, 0, 58 + k * 13, 0, Math.PI * 1.5, false); g.strokePath();
          g.setPosition(cx, cy).setRotation(k * 2.1).setScale(0.5);
          this.tweens.add({ targets: g, rotation: g.rotation + (k % 2 ? -1 : 1) * Math.PI * 2, scale: 1.35, alpha: 0, duration: 520, ease: "Cubic.easeOut", onComplete: () => g.destroy() });
        }
      });
      this.time.delayedCall(delay + 60, () => {
        if (!this.alive(m)) return;
        const h = m.sprite.displayHeight;
        this._blade(m.x, m.y - h * 0.5, this.facing < 0 ? Math.PI : 0, Math.max(130, h * 1.2), 12, th.main, th.light);
        this._burst(m.x, m.y - h * 0.5, 9, th.main, { alt: th.light });
        this.hitMonster(m);
        UI.damageNumber(m, r.dmg, r.crit ? "crit" : "hit");
      });
    }

    _ultimateIntro(m, th) {
      const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.5;
      const dark = this.add.circle(cx, cy, Math.max(120, h), 0x120c18, 0.3).setDepth(13);
      this.tweens.add({ targets: dark, alpha: 0, duration: 520, onComplete: () => dark.destroy() });
      const beam = this.add.rectangle(this.pz.x, this.pz.y - 60, 6, 120, th.light, 0.9).setDepth(14).setScale(1, 0.2);
      this.tweens.add({ targets: beam, scaleY: 1, alpha: 0, duration: 380, onComplete: () => beam.destroy() });
    }

    fxUltimate(m, th, r, delay) {
      const dir = m.x >= this.pz.x ? 1 : -1;
      this._ultimateIntro(m, th);
      this.time.delayedCall(Math.max(120, delay - 120), () => {
        if (!this.alive(m)) return;
        const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.5;
        this._crescent(cx, cy, Math.max(200, h * 2), Math.max(150, h * 1.6), dir * 22, dir > 0 ? -0.4 : Math.PI + 0.4, th.main, th.light);
      });
      this.time.delayedCall(delay, () => {
        if (!this.alive(m)) return;
        const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.5;
        this._blade(cx, cy, dir > 0 ? -0.6 : Math.PI + 0.6, Math.max(220, h * 1.9), 20, th.main, th.light, 700);
        this._blade(cx, cy, dir > 0 ? 0.6 : Math.PI - 0.6, Math.max(200, h * 1.7), 14, th.steel, th.light, 700);
        this._ring(cx, cy, 96, 74, th.light, 520, 6);
        this._burst(cx, cy, 16, th.main, { alt: th.light, life: 620, vx: 180, vy: 150 });
        this.hitMonster(m);
        UI.damageNumber(m, r.dmg, "crit");
        if (!reduced()) this.cameras.main.shake(160, 0.006);
      });
    }

    // ---- buff / stance casts, shown the moment the buff is created ----
    castBuff(m, cast) {
      const th = themeOf(cast.cls);
      switch (cast.kind0) {
        case "guard": return this.fxGuard(m, th);
        case "evade": return this.fxEvade(th);
        case "bind": return this.fxBind(m, th, cast);
        case "zone": return this.fxZone(m, th, cast);
        case "calm": return this.fxCalm(th);
        case "chain": return this.fxChainStart(m, th);
        case "charge": return this.fxChargeStart(th);
        case "dash": return this.fxDash(th);
      }
    }
    fxGuard(m, th) {
      const cx = this.pz.x, cy = this.pz.y - 8, dir = this.facing;
      const g = this.add.graphics().setDepth(13.5);
      const a0 = dir > 0 ? -Math.PI * 0.55 : Math.PI * 0.45, a1 = dir > 0 ? Math.PI * 0.55 : Math.PI * 1.55;
      g.lineStyle(9, th.guard, 0.92); g.beginPath(); g.arc(0, 0, 54, a0, a1, false); g.strokePath();
      g.lineStyle(4, th.light, 0.8); g.beginPath(); g.arc(0, 0, 46, a0, a1, false); g.strokePath();
      g.setPosition(cx, cy).setScale(0.6);
      this.tweens.add({ targets: g, scale: 1, duration: 180, ease: "Back.easeOut" });
      this.tweens.add({ targets: g, alpha: 0.25, delay: 700, duration: 700, yoyo: true, repeat: -1 });
      this.guardGfx = g;
      this.statusFx.push(g);
      this._ring(cx + dir * 24, cy, 84, 60, th.guard, 460, 4);
    }
    guardBlock(m, reflect) {
      const th = themeOf(S.d.cls), dir = this.facing;
      this._ring(this.pz.x + dir * 26, this.pz.y - 8, 76, 54, th.guard, 320, 5);
      this._burst(this.pz.x + dir * 30, this.pz.y - 14, 5, th.guard, { alt: th.light, life: 320 });
      if (reflect > 0 && this.alive(m)) {
        this.time.delayedCall(120, () => {
          if (!this.alive(m)) return;
          const h = m.sprite.displayHeight;
          this._blade(m.x, m.y - h * 0.5, dir > 0 ? -0.5 : Math.PI + 0.5, 130, 10, th.guard, 0xffffff, 380);
          this._burst(m.x, m.y - h * 0.5, 6, th.guard, { alt: th.light });
        });
      }
    }
    fxBind(m, th, cast) {
      const R = Math.max(52, m.sprite.displayWidth * 0.62);
      const ring = this.add.graphics().setDepth(13);
      ring.lineStyle(5, th.alt, 0.95); ring.strokeEllipse(0, 0, R * 2, R * 0.62);
      ring.lineStyle(2, th.steel, 0.85); ring.strokeEllipse(0, 0, R * 1.5, R * 0.46);
      ring.setPosition(m.x, m.y + 2).setScale(0.4);
      this.tweens.add({ targets: ring, scale: 1, duration: 200, ease: "Quad.easeOut" });
      this.tweens.add({ targets: ring, rotation: Math.PI * 2, duration: 5000, repeat: -1 });
      this.bindGfx = ring;
      this.statusFx.push(ring);
      for (let i = 0; i < 5; i++) {
        const t = this.add.rectangle(m.x + (i - 2) * 15, m.y, 3, 0, th.alt, 0.85).setOrigin(0.5, 1).setDepth(13);
        this.tweens.add({ targets: t, height: 30 + Math.random() * 22, duration: 220, delay: i * 32, yoyo: true, hold: 320, onComplete: () => t.destroy() });
      }
      m.sprite.setTint(0x9a6fe0);
    }
    fxZone(m, th, cast) {
      const R = Math.max(72, m.sprite.displayWidth * 0.9);
      const g = this.add.graphics().setDepth(7.5);
      g.lineStyle(6, th.main, 0.92); g.strokeEllipse(0, 0, R * 2, R * 0.62);
      g.lineStyle(3, th.steel, 0.85); g.strokeEllipse(0, 0, R * 1.5, R * 0.46);
      g.lineStyle(2, th.light, 0.75); g.strokeEllipse(0, 0, R * 1.05, R * 0.32);
      g.setPosition(m.x, m.y + 2).setScale(0.4);
      this.tweens.add({ targets: g, scale: 1, duration: 260, ease: "Quad.easeOut" });
      this.tweens.add({ targets: g, rotation: Math.PI * 2, duration: 7000, repeat: -1 });
      this.zoneGfx = g;
      this.statusFx.push(g);
    }
    zonePulse(m) {
      if (!this.alive(m)) return;
      const R = Math.max(72, m.sprite.displayWidth * 0.9);
      this._ring(m.x, m.y + 2, R, R * 0.31, themeOf(S.d.cls).light, 420, 4);
      this._burst(m.x, m.y - 6, 4, themeOf(S.d.cls).main, { alt: themeOf(S.d.cls).steel, life: 360 });
    }
    fxCalm(th) {
      const cx = this.pz.x, cy = this.pz.y - 18;
      for (let i = 0; i < 3; i++) {
        const g = this.add.graphics().setDepth(13.5);
        g.lineStyle(4 - i, i ? th.main : th.light, 0.85);
        g.strokeEllipse(0, 0, 70 + i * 20, 108 + i * 24);
        g.setPosition(cx, cy).setScale(0.7);
        this.tweens.add({ targets: g, scale: 1, alpha: 0, delay: 380 + i * 130, duration: 900, onComplete: () => g.destroy() });
      }
      this._burst(cx, cy, 10, th.light, { alt: th.main, vy: -60, life: 700 });
    }
    fxEvade(th) {
      const d = this.facing;
      for (let i = 0; i < 2; i++) this._shadow(this.pz.x - d * (i + 1) * 15, this.player.y, th.steel, 0.45, -d * 12, 0, 500 + i * 90);
      this._ring(this.pz.x, this.pz.y - 20, 66, 54, th.steel, 400, 3);
    }
    fxDash(th) {
      th = th || themeOf(S.d.cls);
      const d = this.facing, sx = this.pz.x, py = this.player.y;
      for (let i = 0; i < 3; i++) this._shadow(sx - d * i * 13, py, th.steel, 0.5, d * 44, 0, 360 + i * 60);
      this.tweens.add({ targets: this.pz, x: sx + d * 38, duration: 140, yoyo: true, hold: 60, ease: "Quad.easeOut" });
      this._burst(sx + d * 12, GROUND - 8, 5, th.steel, { alt: th.light, vy: -40, life: 420 });
    }
    fxChainStart(m, th) { this.addChainMark(m, th, 0); }
    fxChainStep(m, step) { if (this.alive(m)) this.addChainMark(m, themeOf(S.d.cls), step); }
    addChainMark(m, th, step) {
      const dir = m.x >= this.pz.x ? 1 : -1;
      const cx = m.x - dir * 26, cy = m.y - m.sprite.displayHeight * 0.55;
      const a = -0.6 + step * 1.1;
      const g = this.add.graphics().setDepth(13.2);
      g.lineStyle(5, th.light, 0.92); g.beginPath(); g.arc(0, 0, 15, a - 0.5, a + 0.5, false); g.strokePath();
      g.lineStyle(2, th.main, 0.9); g.beginPath(); g.arc(0, 0, 21, a - 0.4, a + 0.4, false); g.strokePath();
      g.setPosition(cx, cy).setScale(0.4);
      this.tweens.add({ targets: g, scale: 1, duration: 160 });
      this.tweens.add({ targets: g, alpha: 0, delay: 780, duration: 300, onComplete: () => g.destroy() });
    }
    fxChargeStart(th) { this._ring(this.pz.x, this.pz.y - 26, 62, 44, th.main, 460, 4); }
    fxChargeStep(step, th) {
      const cx = this.pz.x, cy = this.pz.y - 30 - step * 12;
      const g = this.add.graphics().setDepth(14);
      g.lineStyle(4, th.main, 0.9); g.strokeCircle(0, 0, 7);
      g.setPosition(cx, cy).setScale(0.4);
      this.tweens.add({ targets: g, scale: 1, alpha: 0.2, duration: 400, onComplete: () => g.destroy() });
    }
    fxChargeStepForClass(step, cls) { this.fxChargeStep(step, themeOf(cls)); }
    playChargeFinish(m, fx, total, cls) {
      const th = themeOf(cls), dir = m.x >= this.pz.x ? 1 : -1;
      this.fxDash(th);
      const n = 10;
      for (let i = 0; i < n; i++) {
        this.time.delayedCall(120 + i * 42, () => {
          if (!this.alive(m)) return;
          const h = m.sprite.displayHeight, cx = m.x + (Math.random() - 0.5) * 26, cy = m.y - h * (0.25 + Math.random() * 0.6);
          const base = dir > 0 ? 0 : Math.PI;
          const last = i === n - 1;
          this._blade(cx, cy, base + (i % 2 ? 1.4 : -0.6), Math.max(100, h * 1.05), last ? 15 : 9, th.main, th.light, 340);
          this._burst(cx, cy, last ? 10 : 3, th.main, { alt: th.light, life: 300 });
          this.hitMonster(m);
          if (last) UI.damageNumber(m, total, "crit");
        });
      }
      if (!reduced()) this.cameras.main.shake(150, 0.004);
    }

    // ---- passive proc signals: one short mark per real trigger, never a full cast ----
    procPoison(m) { if (this.alive(m)) this._burst(m.x, m.y - m.sprite.displayHeight * 0.5, 5, 0x9a5ad8, { alt: 0xc79aff, vy: -50, life: 520 }); }
    procFollowUp(m, extra, crit) {
      if (!this.alive(m)) return;
      const dir = m.x >= this.pz.x ? 1 : -1;
      const h = m.sprite.displayHeight;
      this._blade(m.x, m.y - h * 0.5, dir > 0 ? 0.7 : Math.PI - 0.7, Math.max(110, h * 1.05), crit ? 14 : 10, 0xdfe6ef, 0xffffff, 360);
      this._burst(m.x, m.y - h * 0.5, 5, 0xdfe6ef, { alt: 0xffffff, life: 360 });
      this.hitMonster(m);
      UI.damageNumber(m, extra, crit ? "crit" : "hit");
    }
    procStreakMp(n) {
      const cx = this.pz.x, cy = this.pz.y - 28, th = themeOf(S.d.cls);
      for (let i = 0; i < 3; i++) {
        const d = this.add.circle(cx + 44, cy + i * 8, 3.5, th.light).setDepth(14);
        this.tweens.add({ targets: d, x: cx, y: cy, duration: 420, delay: i * 60, alpha: 0.2, onComplete: () => d.destroy() });
      }
      this._ring(cx, cy - 24, 52, 34, th.main, 340, 3);
    }
    procStreakGuard() { this._ring(this.pz.x, this.pz.y - 18, 70, 58, themeOf(S.d.cls).guard, 280, 4); }
    procShield(heal) {
      const th = themeOf(S.d.cls);
      this._ring(this.pz.x, this.pz.y - 26, 82, 70, th.steel, 520, 5);
      this._burst(this.pz.x, this.pz.y - 40, 6, th.steel, { alt: 0xffffff, life: 480 });
    }
    procCrit(m) {
      if (!this.alive(m)) return;
      const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.55, th = themeOf(S.d.cls);
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        const s = this.add.star(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 4, 2, 6, th.light, 1).setDepth(14);
        this.tweens.add({ targets: s, alpha: 0, scale: 1.6, duration: 380, onComplete: () => s.destroy() });
      }
    }
    procComboDmg() { this._ring(this.pz.x, this.pz.y - 22, 54, 42, 0xf3e6c8, 300, 2); }
    procSkillPct() { this._ring(this.pz.x, this.pz.y - 22, 66, 52, 0xffd873, 340, 3); }
    procDodge() { const d = this.facing; this._shadow(this.pz.x, this.player.y, 0xffffff, 0.45, -d * 16, 0, 220); }
    learnAura(cls) {
      const th = themeOf(cls);
      const cx = this.pz.x, cy = this.pz.y - 20;
      this._ring(cx, cy, 90, 74, th.main, 700, 5);
      this._ring(cx, cy, 60, 48, th.light, 620, 3);
      this._burst(cx, cy, 12, th.main, { alt: th.light, vy: -70, life: 760 });
    }
    poisonPulse(m) { if (this.alive(m)) this._burst(m.x, m.y - m.sprite.displayHeight * 0.5, 3, 0x9a5ad8, { alt: 0xc79aff, vy: -30, life: 380, r: 2, r2: 2 }); }

    clearStatusFx() {
      if (this.statusFx) for (const o of this.statusFx) { if (o && o.active) { this.tweens.killTweensOf(o); o.destroy(); } }
      this.statusFx = []; this.guardGfx = null; this.bindGfx = null; this.zoneGfx = null;
      for (const m of this.monsters.concat(this.dummy ? [this.dummy] : [])) { if (m.sprite && m.sprite.clearTint) m.sprite.clearTint(); }
    }
    _endGfx(o, fade) {
      if (!o || !o.active) return;
      this.tweens.killTweensOf(o);
      this.statusFx = (this.statusFx || []).filter((x) => x !== o);
      this.tweens.add({ targets: o, alpha: 0, duration: fade, onComplete: () => o.destroy() });
    }
    endGuardFx() { this._endGfx(this.guardGfx, 260); this.guardGfx = null; }
    endBindFx() { this._endGfx(this.bindGfx, 220); this.bindGfx = null; }
    endZoneFx() { this._endGfx(this.zoneGfx, 320); this.zoneGfx = null; }

    // kept for any older caller: a plain slash on the class colours
    attackFx(m, dmg, crit, kind, r) {
      this.playHit(m, Object.assign({ dmg, crit, kind, hits: kind === "double" ? 2 : 1, look: null, skillId: null, cls: S.d.cls }, r || {}));
    }
    inkSlash(m, crit, big, flip) {
      const th = themeOf(S.d.cls);
      const h = m.sprite.displayHeight, cx = m.x, cy = m.y - h * 0.5;
      const L = Math.max(120, h * 1.2) * (big ? 1.35 : 1);
      this._blade(cx, cy, flip ? 0.6 : -0.75, L, (crit ? 16 : 11) * (big ? 1.4 : 1), th.main, th.light);
      this._burst(cx, cy, crit ? 10 : 6, th.main, { alt: th.light });
      if (crit && !reduced()) this.cameras.main.shake(120, 0.004);
    }
    hitMonster(m) {
      if (!m || !m.sprite) return;
      const isDying = m.state === "dead";
      if (!isDying) m.sprite.setTexture("m_" + m.mid + "_hit");
      m.tweening = true; const s = m.scale;
      this.tweens.add({ targets: m.sprite, scaleX: s * 1.16, scaleY: s * 0.8, duration: 70, yoyo: true, ease: "Quad.easeOut",
        onComplete: () => { m.tweening = false; } });
      this.time.delayedCall(320, () => { if (m.state === "battle") m.sprite.setTexture("m_" + m.mid + "_idle"); });
    }
    monsterAttackFx(m, dmg, chip) {
      const dir = this.pz.x > m.x ? 1 : -1;
      m.sprite.setTexture("m_" + m.mid + "_atk");
      m.tweening = true;
      this.tweens.add({ targets: m.sprite, x: m.x + dir * (chip ? 30 : 60), duration: 130, yoyo: true, ease: "Quad.easeIn", onComplete: () => { m.tweening = false; if (m.state === "battle") m.sprite.setTexture("m_" + m.mid + "_idle"); } });
      this.time.delayedCall(130, () => {
        this.playAct("hurt"); SND.play("hurt");
        if (!reduced()) { this.cameras.main.shake(140, 4 / (this.cameras.main.width)); }
        UI.damageNumber({ x: this.pz.x, y: this.pz.y + 50, sprite: this.player }, dmg, "taken");
        const p = this.add.circle(this.pz.x, this.pz.y, 26, 0xd2462e, 0.35).setDepth(13);
        this.tweens.add({ targets: p, scale: 1.8, alpha: 0, duration: 260, onComplete: () => p.destroy() });
      });
    }
    // helpers a boss calls in: small copies of a monster stand beside it until broken
    summonAdds(m, cfg) {
      this.clearAdds();
      this.adds = [];
      const base = monScale(cfg.mon) * 0.85;
      for (let i = 0; i < cfg.n; i++) {
        const off = (i - (cfg.n - 1) / 2) * 74;
        const x = Phaser.Math.Clamp(m.x + off, 40, this.W - 40);
        const spr = this.add.image(x, m.y + 2, "m_" + cfg.mon + "_idle").setOrigin(0.5, 1).setScale(base).setDepth(9.2);
        spr.setFlipX(x < m.x);
        this.add.ellipse(x, m.y + 2, spr.displayWidth * 0.6, 10, 0x2a2320, 0.16).setDepth(6.4);
        this.tweens.add({ targets: spr, y: spr.y - 9, duration: 620 + i * 40, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.adds.push(spr);
      }
      SND.play("page");
    }
    killOneAdd(m) {
      if (!this.adds || !this.adds.length) return;
      const spr = this.adds.pop();
      this.tweens.killTweensOf(spr);
      const h = spr.displayHeight;
      for (let i = 0; i < 8; i++) {
        const d = this.add.circle(spr.x + (Math.random() - 0.5) * spr.displayWidth * 0.6, spr.y - Math.random() * h, 2 + Math.random() * 4, 0x2a2320, 0.9).setDepth(14);
        this.tweens.add({ targets: d, y: d.y - 24 - Math.random() * 30, x: d.x + (Math.random() - 0.5) * 40, alpha: 0, duration: 380 + Math.random() * 200, onComplete: () => d.destroy() });
      }
      this.tweens.add({ targets: spr, alpha: 0, scaleX: spr.scaleX * 1.3, scaleY: spr.scaleY * 0.35, y: spr.y - 16, duration: 300, ease: "Quad.easeIn", onComplete: () => spr.destroy() });
    }
    clearAdds() {
      if (this.adds) for (const spr of this.adds) { this.tweens.killTweensOf(spr); spr.destroy(); }
      this.adds = [];
    }
    monsterDie(m) {
      m.state = "dead"; m.deadAt = Date.now();
      m.sprite.setTexture("m_" + m.mid + "_dead");
      const h = m.sprite.displayHeight;
      for (let i = 0; i < 22; i++) {
        const d = this.add.circle(m.x + (Math.random() - 0.5) * m.sprite.displayWidth * 0.7, m.y - Math.random() * h, 3 + Math.random() * 6, 0x2a2320, 0.9).setDepth(14);
        this.tweens.add({ targets: d, y: d.y - 30 - Math.random() * 60, x: d.x + (Math.random() - 0.5) * 60, alpha: 0, scale: 0.2, duration: 600 + Math.random() * 500, delay: i * 18, onComplete: () => d.destroy() });
      }
      this.tweens.add({ targets: m.sprite, alpha: 0, scaleY: m.scale * 0.3, scaleX: m.scale * 1.3, duration: 700, delay: 150, ease: "Quad.easeIn",
        onComplete: () => { m.sprite.setVisible(false); m.sprite.setScale(m.scale); } });
      m.shadow.setVisible(false);
      if (m.aura) m.aura.clear();
    }
    respawnMonster(m) { m.state = "wander"; m.hp = m.maxHp; m.sprite.setTexture("m_" + m.mid + "_idle"); }
    playerDie() { this.dead = true; this.scarfG.clear(); }
    // where this map puts a ninja back on their feet: the camp if it has one, else the entrance
    respawnX() {
      const camp = (LAYOUT[this.mapId] || []).find(([k]) => k === "camp");
      if (camp) return camp[1];
      return 200;
    }
    revive() { this.dead = false; this.scarf = null; }
  }

  window.WorldScene = World;
  window.WORLD_CONST = { GROUND, NINJA_SCALE };
})();
