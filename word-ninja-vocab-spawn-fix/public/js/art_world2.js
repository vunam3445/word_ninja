// Word Ninja: the far side of the world, Lv.30-50. Five new themes: sky-sea islands,
// a ruined citadel, a spirit forest, a thunder range and the fate hall.
// Same construction as art_world.js, appended before the textures are built.
(function () {
  const H = window.ART.H;
  const { svg, P, L, F, E, part, G, ridge, tiles, INK } = H;

  const STONE = "#9A9488", STONE_M = "#A8A296", STONE_S = "#7A746A", STONE_D = "#5E5952";
  const WOOD = "#8A6A4A", WOOD_S = "#6B4F36";
  const BARK = "#6B5A48", BARK_S = "#4E4034";
  const MOSS = "#6E8A5E", MOSS_L = "#8FB07A", MOSS_D = "#5E8A46";
  const GHOST = "#5FD8E0", GHOST_L = "#CFFAF0";
  const BOLT = "#F2D479", BOLT_S = "#E0A526";
  const IRON = "#4A4F58", IRON_S = "#333840";
  const SPIRIT = "#7FE6C0", SPIRIT_S = "#3E8C6E", SPIRIT_L = "#CFFAF0";
  const CLOUD = "#DCEFF4", CLOUD_S = "#AECEDC";

  const bgOut = (W, Hh, s) => ({ svg: svg(W, Hh, s, 1, false), w: W, h: Hh });
  let uid = 0;
  const wash = (stops, W, Hh) => {
    const id = "wn2_" + uid++;
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
      stops.map(([o, c]) => `<stop offset="${o * 100}%" stop-color="${c}"/>`).join("") +
      `</linearGradient></defs><rect x="0" y="0" width="${W}" height="${Hh}" fill="url(#${id})"/>`;
  };
  // a stepped rock mass with a grass cap, for cliffs and floating islands
  const rock = (x, w0, base, top, col, colS, cap) => {
    let d = `M${x},${base} L${(x + w0 * 0.08).toFixed(0)},${top + 24} `;
    d += `Q${(x + w0 / 2).toFixed(0)},${top - 10} ${(x + w0 * 0.92).toFixed(0)},${top + 24} `;
    d += `L${(x + w0).toFixed(0)},${base}Z`;
    let t = F(d, col);
    t += F(`M${(x + w0 * 0.5).toFixed(0)},${top + 6} Q${(x + w0 * 0.74).toFixed(0)},${top + 20} ${(x + w0).toFixed(0)},${top + 26} L${(x + w0).toFixed(0)},${base} L${(x + w0 * 0.5).toFixed(0)},${base}Z`, colS);
    t += L(d, 2.2, INK, 'opacity="0.3"');
    for (let k = 0; k < 4; k++) t += L(`M${(x + 10).toFixed(0)},${(top + 40 + k * 40).toFixed(0)} Q${(x + w0 * 0.5).toFixed(0)},${(top + 30 + k * 40).toFixed(0)} ${(x + w0 - 12).toFixed(0)},${(top + 44 + k * 40).toFixed(0)}`, 1.6, INK, 'opacity="0.16"');
    if (cap) t += F(`M${(x + w0 * 0.08).toFixed(0)},${top + 24} Q${(x + w0 / 2).toFixed(0)},${top - 10} ${(x + w0 * 0.92).toFixed(0)},${top + 24} Q${(x + w0 / 2).toFixed(0)},${top + 4} ${(x + w0 * 0.08).toFixed(0)},${top + 24}Z`, cap);
    return t;
  };

  // ---------------- props ----------------
  const PROPS2 = {
    // a floating island of rock with a little temple on top
    skyIsland: () => {
      const w = 340, h = 220; let s = "";
      s += F("M170,10 C232,10 292,40 320,84 C286,120 244,130 200,124 C146,150 78,140 44,104 C18,74 44,34 104,20 C126,14 148,10 170,10Z", STONE_M);
      s += F("M170,12 C226,12 282,40 310,82 Q262,110 214,106 Q196,140 150,138 Q86,150 50,106 Q22,72 58,36 Q108,16 170,12Z", STONE_S);
      s += L("M170,10 C232,10 292,40 320,84 C286,120 244,130 200,124 C146,150 78,140 44,104 C18,74 44,34 104,20 C126,14 148,10 170,10Z", 2.4, INK, 'opacity="0.35"');
      s += F("M104,20 C126,14 148,10 170,10 C232,10 292,40 320,84 C300,70 250,56 190,58 C130,60 78,74 50,100 C30,74 44,34 104,20Z", "#3E8C6E", 'opacity="0.55"');
      for (let i = 0; i < 10; i++) { const x = 90 + ((i * 137) % 160), y = 24 + ((i * 71) % 70); s += L(`M${x},${y} L${x},${y - 12}`, 1.8, "#4F7A3A"); }
      // small temple on the crown
      s += part("M132,44 L208,44 L212,96 L128,96Z", "#E4D2AA", "M190,40 L214,40 L214,98 L190,98Z", "#CDB88E", 2.4);
      s += part("M120,50 Q170,20 220,50 Q170,40 120,50Z", "#8A2F1F", "M170,14 L226,14 L226,54 L170,54Z", "#6E2418", 2.6);
      s += L("M132,60 L208,60 M132,74 L208,74", 1.4, "#B9A180") + E(170, 40, 4, 4, BOLT, 2);
      // dangling vines and roots underneath
      s += L("M60,104 C56,132 64,150 58,176 M120,124 C114,150 122,168 116,196 M244,116 C250,146 242,164 248,192", 2.4, "#4E4034", 'opacity="0.8"');
      s += E(58, 176, 6, 4, MOSS, 0) + E(116, 196, 5, 3.4, MOSS_L, 0) + E(248, 192, 6, 4, MOSS, 0);
      return { w, h, s };
    },
    // a wide waterfall pouring into cloud
    waterfall: () => {
      const w = 150, h = 360; let s = "";
      s += part("M40,20 Q75,10 110,20 L108,300 Q75,318 42,300Z", "#8FD8EC", "M92,18 L116,18 L116,304 L92,304Z", "#5FB0CC", 2.6);
      s += L("M52,24 Q52,180 60,296 M76,20 Q76,180 76,298 M98,26 Q98,180 92,296", 2, "#EAF8FC");
      s += P("M30,300 Q75,330 120,300 Q120,326 75,340 Q30,326 30,300Z", "#DFF4FA", 0, 'opacity="0.9"');
      s += P("M22,318 Q75,348 128,318 Q128,344 75,360 Q22,344 22,318Z", "#EFFAFD", 0, 'opacity="0.75"');
      s += E(75, 330, 44, 18, "#FFFFFF", 0, 'opacity="0.25"');
      s += part("M28,14 Q75,2 122,14 L122,24 Q75,14 28,24Z", "#8A7A5E", 2.4);
      return { w, h, s };
    },
    // a half-ruined tower of the citadel
    ruinedTower: () => {
      const w = 170, h = 320; let s = "";
      s += part("M40,90 L130,90 L136,310 L34,310Z", IRON, "M110,86 L140,86 L140,312 L110,312Z", IRON_S, 2.8);
      s += L("M40,130 L130,130 M40,180 L130,180 M40,230 L130,230 M40,280 L130,280", 1.6, IRON_S);
      s += P("M34,90 L44,52 L58,76 L74,44 L92,74 L108,48 L124,78 L136,58 L140,90Z", "#3E4658", 2.6);
      s += L("M34,90 L44,52 L58,76 L74,44 L92,74 L108,48 L124,78 L136,58 L140,90", 1.4, INK, 'opacity="0.4"');
      s += P("M62,150 L84,150 L84,196 L62,196Z", "#15171B", 2.2) + E(73, 172, 6, 8, BOLT, 0, 'opacity="0.8"');
      for (let i = 0; i < 3; i++) s += P(`M${56},${106 + i * 50} L${72},${106 + i * 50} L${72},${120 + i * 50} L${56},${120 + i * 50}Z`, BOLT, 0, 'opacity="0.5"');
      s += L("M120,120 Q126,180 118,240", 1.6, IRON_S);
      s += E(52, 300, 10, 5, MOSS, 0) + E(120, 308, 8, 4, MOSS_L, 0);
      return { w, h, s };
    },
    // a huge glowing spirit tree with lanterns
    spiritTree: () => {
      const w = 240, h = 360; let s = "";
      s += E(120, 150, 96, 70, SPIRIT, 0, 'opacity="0.12"');
      s += L("M120,356 C104,300 132,230 120,150", 22, BARK_S);
      s += L("M120,356 C112,300 130,230 120,150", 14, BARK);
      s += L("M120,230 C86,208 60,192 34,168 M120,200 C152,182 178,164 202,140 M120,168 C100,146 96,120 88,92 M120,164 C140,142 150,118 158,90", 10, BARK_S);
      s += L("M34,168 C24,150 20,132 22,112 M202,140 C210,122 214,104 212,84 M88,92 C82,74 84,56 90,42 M158,90 C164,72 164,54 158,40", 7, BARK_S);
      s += E(120, 120, 66, 40, MOSS, 0, 'opacity="0.85"') + E(88, 92, 30, 22, MOSS_L, 0, 'opacity="0.8"') + E(158, 90, 30, 22, MOSS_D, 0, 'opacity="0.8"');
      s += E(120, 300, 20, 26, "#1E2A22", 0, 'opacity="0.5"');
      s += E(96, 250, 6, 8, SPIRIT, 0, 'opacity="0.7"') + E(150, 236, 5, 7, SPIRIT, 0, 'opacity="0.6"') + E(120, 200, 5, 6, GHOST_L, 0, 'opacity="0.7"');
      // hanging paper lanterns
      s += L("M60,180 L60,204 M180,160 L180,186", 1.6, "#C89A5A");
      s += part("M50,204 L70,204 L66,224 L54,224Z", BOLT, "M64,202 L72,202 L72,226 L64,226Z", BOLT_S, 2.2);
      s += part("M170,186 L190,186 L186,206 L174,206Z", BOLT, "M184,184 L192,184 L192,208 L184,208Z", BOLT_S, 2.2);
      return { w, h, s };
    },
    // a thunder mountain column carved with sigils
    thunderColumn: () => {
      const w = 130, h = 330; let s = "";
      s += part("M22,300 L108,300 L114,330 L16,330Z", "#5E667A", "M84,296 L116,296 L116,332 L84,332Z", IRON_S, 2.6);
      s += part("M30,40 L100,40 L96,300 L34,300Z", "#6E7790", "M84,36 L108,36 L108,302 L84,302Z", "#4E566E", 2.8);
      s += L("M30,70 L100,70 M30,110 L100,110 M30,150 L100,150 M30,210 L100,210 M30,260 L100,260", 1.6, "#3E4658");
      s += E(65, 130, 15, 22, BOLT, 0, 'opacity="0.35"') + P("M65,110 L74,132 L69,132 L76,156 L58,134 L64,134Z", BOLT, 2.2);
      s += P("M30,40 L44,12 L58,36 L72,8 L86,34 L100,16 L100,40Z", "#4E566E", 2.4) + E(72, 10, 5, 5, BOLT, 2);
      s += E(48, 300, 10, 5, MOSS, 0) + E(96, 306, 8, 4, MOSS_L, 0);
      return { w, h, s };
    },
    // the great seal gate of the fate hall
    fateGate: () => {
      const w = 360, h = 380; let s = "";
      s += part("M40,120 L90,120 L96,380 L34,380Z", "#8FA4C4", "M74,116 L104,116 L104,382 L74,382Z", "#6E86AC", 2.8);
      s += part("M270,120 L320,120 L326,380 L264,380Z", "#8FA4C4", "M304,116 L334,116 L334,382 L304,382Z", "#6E86AC", 2.8);
      s += part("M18,138 L342,138 L342,162 L18,162Z", "#AFC4E0", "M180,134 L348,134 L348,166 L180,166Z", "#8FA4C4", 2.8);
      // the seal disc floating between the pillars
      s += E(180, 220, 62, 62, "#C8F4FC", 0, 'opacity="0.16"');
      s += E(180, 220, 50, 50, "none", 3, `stroke="#9CC9E4"`) + E(180, 220, 38, 38, "none", 2, `stroke="#C8F4FC" opacity="0.7"`);
      s += L("M180,176 L180,264 M136,220 L224,220 M148,188 L212,252 M212,188 L148,252", 2.4, "#C8F4FC") +
        P("M180,196 L198,220 L180,244 L162,220Z", "#E8EEF8", 2.4) + E(180, 220, 6, 6, "#FFF6D8", 0);
      // the arch
      s += part("M0,124 Q180,58 360,124 Q180,84 0,124Z", "#9AB0CE", "M180,54 L360,54 L360,130 L180,130Z", "#7E94B4", 3);
      s += P("M150,72 L210,72 L206,96 L154,96Z", "#5E7396", 2.6) + E(180, 84, 5, 5, GHOST_L, 0, 'opacity="0.8"');
      s += L("M52,150 L52,300 M308,150 L308,300", 1.6, "#7E94B4");
      return { w, h, s };
    },
  };

  // ---------------- far layers ----------------
  const FAR = {
    cloudsea: () => {
      const W = 2048, Hh = 440; let s = "";
      s += E(1500, 120, 120, 120, "#FFF3C8", 0, 'opacity="0.5"');
      const r1 = ridge(W, Hh, 360, [[3, 0.6, 0.3], [7, 0.26, 1.6], [15, 0.1, 2.4]], 9);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#9FC4D6", 'opacity="0.55"');
      const r2 = ridge(W, Hh, 300, [[4, 0.55, 2], [9, 0.28, 0.6], [17, 0.12, 1.8]], 9);
      s += F(r2 + ` L${W},${Hh} L0,${Hh}Z`, "#7FA8C0", 'opacity="0.6"');
      s += L(r2, 2, INK, 'opacity="0.16"');
      // floating islands
      [[120, 300, 300], [620, 260, 240], [1080, 330, 320], [1560, 270, 260], [1880, 200, 180]].forEach(([x, top, w0], i) => {
        s += rock(x, w0, top + 96, top, i % 2 ? "#7E9CB0" : "#8AA6BA", "#617E92", "#6FA98A").replace(/opacity/g, "opacity");
      });
      s += `<rect x="0" y="300" width="${W}" height="140" fill="#EAF6F8" opacity="0.4"/>`;
      s += `<rect x="0" y="368" width="${W}" height="72" fill="#F4FBFD" opacity="0.35"/>`;
      return bgOut(W, Hh, wash([[0, "#BFE0E600"], [0.5, "#BFE0E64D"], [1, "#AECEDC99"]], W, Hh) + s);
    },
    citadel: () => {
      const W = 2048, Hh = 440; let s = "";
      const r1 = ridge(W, Hh, 300, [[3, 0.6, 0.4], [8, 0.3, 1.4], [17, 0.12, 2.2]], 11);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#8C8298", 'opacity="0.5"');
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#6E6578", 'opacity="0.6"');
      // broken walls and towers on the skyline
      [[60, 0.9, 1], [420, 0.7, 0], [760, 1, 1], [1120, 0.8, 0], [1500, 0.95, 1], [1820, 0.65, 0]].forEach(([x, k, tow]) => {
        const base = 360;
        const w0 = 150 * k, h0 = 120 * k;
        s += F(`M${x},${base} L${x},${base - h0} L${x + w0},${base - h0 + 12 * k} L${x + w0},${base}Z`, "#4E4658");
        let mer = "";
        for (let m = 0; m < 5; m++) mer += `M${(x + m * 30 * k).toFixed(0)},${(base - h0).toFixed(0)} L${(x + m * 30 * k).toFixed(0)},${(base - h0 - 20 * k).toFixed(0)} L${(x + m * 30 * k + 18 * k).toFixed(0)},${(base - h0 - 20 * k).toFixed(0)} L${(x + m * 30 * k + 18 * k).toFixed(0)},${(base - h0).toFixed(0)}Z `;
        s += F(mer, "#4E4658");
        if (tow) s += F(`M${(x + w0).toFixed(0)},${base} L${(x + w0).toFixed(0)},${(base - h0 - 90 * k).toFixed(0)} L${(x + w0 + 34 * k).toFixed(0)},${(base - h0 - 90 * k).toFixed(0)} L${(x + w0 + 34 * k).toFixed(0)},${base}Z`, "#443C4E");
        for (let kk = 0; kk < 3; kk++) s += F(`M${(x + 20 * k + kk * 42 * k).toFixed(0)},${(base - h0 + 24 * k + kk * 26).toFixed(0)} L${(x + 34 * k + kk * 42 * k).toFixed(0)},${(base - h0 + 24 * k + kk * 26).toFixed(0)} L${(x + 34 * k + kk * 42 * k).toFixed(0)},${(base - h0 + 40 * k + kk * 26).toFixed(0)} L${(x + 20 * k + kk * 42 * k).toFixed(0)},${(base - h0 + 40 * k + kk * 26).toFixed(0)}Z`, BOLT, 'opacity="0.5"');
      });
      s += `<rect x="0" y="340" width="${W}" height="100" fill="#5A5468" opacity="0.25"/>`;
      return bgOut(W, Hh, wash([[0, "#6E657800"], [0.45, "#5A546873"], [1, "#4E4658B3"]], W, Hh) + s);
    },
    spiritforest: () => {
      const W = 2048, Hh = 440; let s = "";
      s += E(1500, 120, 140, 140, "#C8F4FC", 0, 'opacity="0.12"');
      s += E(1500, 120, 96, 96, "#E8EEF8", 0, 'opacity="0.9"');
      const r1 = ridge(W, Hh, 300, [[3, 0.6, 0.4], [8, 0.3, 1.2], [16, 0.12, 2.4]], 12);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#3E5A54", 'opacity="0.85"');
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#2F4A46", 'opacity="0.4"');
      // distant glowing trees
      for (let i = 0; i < 14; i++) {
        const x = 60 + i * 150 + ((i * 37) % 30), top = 120 + ((i * 53) % 60);
        s += F(`M${x - 8},360 L${x - 5},${top} L${x + 5},${top} L${x + 8},360Z`, "#243C3A");
        s += E(x, top + 20, 34, 26, SPIRIT_S, 0, 'opacity="0.35"');
        s += E(x, top + 16, 22, 16, SPIRIT, 0, 'opacity="0.4"');
      }
      s += `<rect x="0" y="300" width="${W}" height="140" fill="#2A4A46" opacity="0.3"/>`;
      return bgOut(W, Hh, wash([[0, "#1E383400"], [0.5, "#1E383473"], [1, "#16302CB3"]], W, Hh) + s);
    },
    thunderrange: () => {
      const W = 2048, Hh = 460; let s = "";
      // storm clouds across the top
      for (let i = 0; i < 8; i++) { const x = 40 + i * 260, y = 30 + ((i * 47) % 50); s += E(x, y, 130, 34, "#4A5266", 0, 'opacity="0.7"'); s += E(x + 60, y - 16, 80, 24, "#5A6480", 0, 'opacity="0.5"'); }
      const r1 = ridge(W, Hh, 380, [[3, 0.7, 0.4], [7, 0.3, 1.4], [14, 0.1, 2.6]], 10);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#3E4658", 'opacity="0.8"');
      // jagged peaks
      [[80, 220, 260], [520, 180, 210], [980, 250, 300], [1440, 190, 230], [1820, 150, 190]].forEach(([x, top, w0], i) => {
        s += F(`M${x},360 L${x + w0 * 0.2},${top} L${x + w0 * 0.42},${top - 30} L${x + w0 * 0.6},${top + 10} L${x + w0},360Z`, i % 2 ? "#2E3444" : "#343B4C");
      });
      // a forked bolt
      s += P("M1000,60 L1014,120 L1000,120 L1022,196 L1006,140 L1020,140 L994,64Z", BOLT, 0, 'opacity="0.8"');
      s += E(1010, 110, 30, 60, BOLT, 0, 'opacity="0.18"');
      s += `<rect x="0" y="320" width="${W}" height="140" fill="#3A4256" opacity="0.28"/>`;
      return bgOut(W, Hh, wash([[0, "#232A3800"], [0.45, "#232A3873"], [1, "#1A2230CC"]], W, Hh) + s);
    },
    fatehall: () => {
      const W = 2048, Hh = 460; let s = "";
      for (let i = 0; i < 60; i++) { const x = 26 + ((i * 311) % 2000), y = 10 + ((i * 149) % 240); s += E(x, y, 1 + (i % 3) * 0.4, 1 + (i % 3) * 0.4, "#E8EEF8", 0, `opacity="${(0.3 + (i % 5) * 0.12).toFixed(2)}"`); }
      const r1 = ridge(W, Hh, 300, [[3, 0.6, 0.4], [9, 0.3, 1.4], [18, 0.12, 2.4]], 13);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#3A4660", 'opacity="0.7"');
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#2E3850", 'opacity="0.5"');
      // a palace on the summit
      const px = 1024, base = 380;
      s += F(`M${px - 220},${base} L${px - 200},${base - 120} L${px + 200},${base - 120} L${px + 220},${base}Z`, "#2A3450");
      s += F(`M${px - 230},${base - 118} L${px + 230},${base - 118} L${px + 200},${base - 150} L${px - 200},${base - 150}Z`, "#3A4660");
      s += F(`M${px - 60},${base - 150} L${px},${base - 210} L${px + 60},${base - 150}Z`, "#2A3450");
      s += E(px, base - 150, 40, 30, "#9CC9E4", 0, 'opacity="0.3"');
      for (let kk = -2; kk <= 2; kk++) s += F(`M${px + kk * 80 - 8},${base} L${px + kk * 80 - 8},${base - 96} L${px + kk * 80 + 8},${base - 96} L${px + kk * 80 + 8},${base}Z`, "#404E70");
      s += `<rect x="0" y="330" width="${W}" height="130" fill="#4A5A80" opacity="0.28"/>`;
      return bgOut(W, Hh, wash([[0, "#1E263A00"], [0.45, "#1E263A80"], [1, "#141B2ECC"]], W, Hh) + s);
    },
  };

  // ---------------- cloud layers ----------------
  const CLOUDS = {
    cloudsea: () => {
      const W = 2048, Hh = 280; let s = "";
      for (let i = 0; i < 9; i++) { const x = 60 + i * 240, y = 60 + ((i * 71) % 140); s += E(x, y, 120 + (i % 3) * 40, 26 + (i % 2) * 8, "#FFFFFF", 0, `opacity="${(0.5 + (i % 3) * 0.12).toFixed(2)}"`); s += E(x + 70, y - 14, 80, 18, "#F4FBFD", 0, 'opacity="0.5"'); }
      s += E(700, 220, 460, 34, "#EAF6F8", 0, 'opacity="0.5"') + E(1500, 232, 420, 30, "#EAF6F8", 0, 'opacity="0.45"');
      return bgOut(W, Hh, wash([[0, "#EAF6F800"], [0.55, "#DCEFF466"], [1, "#CFE6EFA6"]], W, Hh) + s);
    },
    citadel: () => {
      const W = 2048, Hh = 280; let s = "";
      [[200, 60, 240, 20], [700, 96, 210, 17], [1200, 70, 260, 22], [1700, 110, 210, 18]].forEach(([x, y, rx, ry], i) => s += E(x, y, rx, ry, "#8C8298", 0, `opacity="${(0.25 + (i % 3) * 0.08).toFixed(2)}"`));
      s += E(400, 220, 420, 30, "#6E6578", 0, 'opacity="0.3"') + E(1400, 236, 380, 26, "#6E6578", 0, 'opacity="0.28"');
      // drifting embers
      for (let i = 0; i < 26; i++) { const x = 40 + ((i * 193) % 1980), y = 40 + ((i * 97) % 210); s += E(x, y, 2, 2, i % 4 === 0 ? BOLT : "#C9A46A", 0, `opacity="${(0.25 + (i % 4) * 0.12).toFixed(2)}"`); }
      return bgOut(W, Hh, wash([[0, "#4E465800"], [0.5, "#4E465880"], [1, "#3E3850B3"]], W, Hh) + s);
    },
    spiritforest: () => {
      const W = 2048, Hh = 280; let s = "";
      s += E(400, 210, 440, 40, "#2A4A46", 0, 'opacity="0.5"') + E(1300, 226, 400, 34, "#26443F", 0, 'opacity="0.45"');
      s += E(880, 176, 300, 26, "#223E3A", 0, 'opacity="0.4"');
      for (let i = 0; i < 60; i++) { const x = 30 + ((i * 137) % 1990), y = 30 + ((i * 89) % 220); s += E(x, y, 1.6 + (i % 3) * 0.6, 1.6 + (i % 3) * 0.6, i % 3 === 0 ? "#FFF6C8" : SPIRIT, 0, `opacity="${(0.4 + (i % 4) * 0.15).toFixed(2)}"`); }
      return bgOut(W, Hh, wash([[0, "#16302C00"], [0.5, "#16302C99"], [1, "#0E2622CC"]], W, Hh) + s);
    },
    thunderrange: () => {
      const W = 2048, Hh = 280; let s = "";
      const puff = (x, y, rx, ry, col, op) => E(x, y, rx, ry, col, 0, `opacity="${op}"`) + E(x - rx * 0.5, y - ry * 0.5, rx * 0.5, ry * 0.7, col, 0, `opacity="${op}"`) + E(x + rx * 0.45, y - ry * 0.5, rx * 0.5, ry * 0.7, col, 0, `opacity="${op}"`);
      [[240, 90, 160, 40], [720, 70, 180, 36], [1200, 110, 170, 42], [1660, 80, 160, 34]].forEach(([x, y, rx, ry], i) => { s += puff(x, y, rx, ry, "#2E3444", (0.5 + (i % 3) * 0.1).toFixed(2)); s += puff(x, y - 40, rx * 0.6, ry * 0.8, "#3E4658", "0.35"); });
      for (let i = 0; i < 30; i++) { const x = 40 + ((i * 173) % 1970), y = 30 + ((i * 89) % 210), r = 1.4 + (i % 4) * 0.7; s += E(x, y, r, r, BOLT, 0, `opacity="${(0.3 + (i % 4) * 0.14).toFixed(2)}"`); }
      return bgOut(W, Hh, wash([[0, "#1A223000"], [0.5, "#1A2230B3"], [1, "#121A26E6"]], W, Hh) + s);
    },
    fatehall: () => {
      const W = 2048, Hh = 280; let s = "";
      s += E(1024, 90, 260, 90, "#9CC9E4", 0, 'opacity="0.1"') + E(1024, 90, 170, 60, "#C8F4FC", 0, 'opacity="0.12"');
      [[300, 70, 240, 16], [760, 110, 210, 14], [1300, 60, 230, 15], [1760, 100, 200, 13]].forEach(([x, y, rx, ry], i) => s += E(x, y, rx, ry, "#C3D6EC", 0, `opacity="${(0.22 + (i % 3) * 0.1).toFixed(2)}"`));
      for (let i = 0; i < 40; i++) { const x = 30 + ((i * 211) % 1990), y = 30 + ((i * 127) % 220); s += E(x, y, 1.6, 1.6, "#FFF6D8", 0, `opacity="${(0.3 + (i % 4) * 0.15).toFixed(2)}"`); }
      return bgOut(W, Hh, wash([[0, "#141B2E00"], [0.5, "#141B2E99"], [1, "#0E1424CC"]], W, Hh) + s);
    },
  };

  // ---------------- mid layers ----------------
  const MID = {
    cloudsea: () => {
      const W = 2048, Hh = 320; let s = "";
      // nearer floating rocks with bridges and small shrines
      [[90, 90, 320, 1], [560, 60, 260, 0], [1000, 110, 340, 1], [1500, 70, 280, 0], [1840, 120, 220, 1]].forEach(([x, top, w0, br]) => {
        s += rock(x, w0, 320, top, "#7E9CB0", "#5E7C90", "#6FA98A");
        if (br) {
          // a rope footbridge to the next island
          s += L(`M${x + w0 - 10},${top + 30} Q${x + w0 + 70},${top + 60} ${x + w0 + 150},${top + 40}`, 3, "#C89A5A");
          s += L(`M${x + w0 - 10},${top + 40} Q${x + w0 + 70},${top + 70} ${x + w0 + 150},${top + 50}`, 2.4, "#A8774E");
          for (let k = 1; k < 6; k++) s += L(`M${x + w0 - 10 + k * 26},${(top + 30 + k * 6).toFixed(0)} L${x + w0 - 10 + k * 26},${(top + 40 + k * 6).toFixed(0)}`, 1.2, "#C89A5A");
        }
      });
      // a small wooden shrine on one island
      s += part("M1180,214 L1240,214 L1244,258 L1176,258Z", "#E4D2AA", "M1228,210 L1252,210 L1252,260 L1228,260Z", "#CDB88E", 2.4);
      s += part("M1170,220 Q1210,190 1250,220 Q1210,210 1170,220Z", "#8A2F1F", "M1210,186 L1256,186 L1256,224 L1210,224Z", "#6E2418", 2.4);
      s += part("M1170,214 L1250,214 L1254,258 L1166,258Z", "none", 2.2);
      return bgOut(W, Hh, s);
    },
    citadel: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 90, [[4, 0.5, 1.6], [10, 0.3, 0.2], [21, 0.12, 2.6]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#4E4658");
      s += L(r, 2.4, INK, 'opacity="0.24"');
      // paved floor
      s += F(`M0,278 L${W},278 L${W},${Hh} L0,${Hh}Z`, "#4A4356");
      s += L(`M0,278 L${W},278`, 2.4, INK, 'opacity="0.34"');
      for (let x = 0; x < W; x += 90) s += L(`M${x},278 L${x},${Hh}`, 1.6, INK, 'opacity="0.2"');
      // walls and towers
      [[80, 200, 1], [420, 150, 1], [820, 220, 0], [1180, 170, 1], [1560, 210, 0], [1900, 160, 1]].forEach(([x, top, tow]) => {
        s += F(`M${x},282 L${x},${top} L${x + 140},${top} L${x + 140},282Z`, "#565060");
        let mer = ""; for (let m = 0; m < 4; m++) mer += `M${x + 6 + m * 34},${top} L${x + 6 + m * 34},${top - 18} L${x + 26 + m * 34},${top - 18} L${x + 26 + m * 34},${top}Z `;
        s += F(mer, "#615A6C");
        s += L(`M${x},${top} L${x + 140},${top}`, 2, INK, 'opacity="0.3"');
        for (let kk = 0; kk < 3; kk++) s += F(`M${x + 20 + kk * 44},${top + 40} L${x + 34 + kk * 44},${top + 40} L${x + 34 + kk * 44},${top + 58} L${x + 20 + kk * 44},${top + 58}Z`, BOLT, 'opacity="0.45"');
        if (tow) { s += F(`M${x + 50},${top} L${x + 90},${top - 54} L${x + 130},${top}Z`, "#443C4E"); s += L(`M${x + 90},${top - 54} L${x + 90},${top - 82}`, 2.4, "#443C4E") + E(x + 90, top - 86, 5, 5, BOLT, 2); }
      });
      // hanging lanterns
      [200, 700, 1300, 1800].forEach((x) => { const y = 208; s += L(`M${x},${y} L${x},${y + 26}`, 2, "#C89A5A"); s += part(`M${x - 12},${y + 26} L${x + 12},${y + 26} L${x + 9},${y + 46} L${x - 9},${y + 46}Z`, "#E08A46", "", "", 2.4) + E(x, y + 36, 6, 6, BOLT, 0, 'opacity="0.6"'); });
      return bgOut(W, Hh, s);
    },
    spiritforest: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 110, [[4, 0.5, 1], [9, 0.3, 2.2], [17, 0.12, 0.4]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#2A4A46");
      s += L(r, 2.4, INK, 'opacity="0.28"');
      // big glowing trunks in layers
      for (let i = 0; i < 12; i++) {
        const x = 60 + i * 170 + ((i * 41) % 40), top = 40 + ((i * 67) % 70), wv = 12 + (i % 3) * 4;
        s += F(`M${x - wv},320 L${x - wv + 2},${top} L${x + wv - 2},${top} L${x + wv},320Z`, i % 2 ? "#35544C" : "#2E4A44");
        s += F(`M${x + 2},${top + 20} L${x + 12},${top + 10} L${x + 20},${top + 24}Z`, "#26403C");
        s += E(x, top + 26, 30, 22, SPIRIT_S, 0, 'opacity="0.22"');
        s += L(`M${x},${top + 40} Q${x + 20},${top + 20} ${x + 30},${top + 50}`, 2, "#26403C");
      }
      // a stone shrine with moss
      s += part("M900,180 L1000,180 L1004,282 L896,282Z", "#7D7F74", "M970,176 L1010,176 L1010,284 L970,284Z", "#5E6158", 2.6);
      s += part("M880,190 Q950,150 1020,190 Q950,178 880,190Z", "#5E8A46", "M950,146 L1024,146 L1024,194 L950,194Z", "#3E632E", 2.8);
      s += L("M912,214 L990,214 M912,244 L990,244", 1.6, "#55574E") + E(940, 282, 14, 6, MOSS, 0) + E(1000, 286, 12, 5, MOSS_L, 0);
      s += E(950, 250, 26, 20, SPIRIT, 0, 'opacity="0.18"') + E(950, 250, 10, 8, SPIRIT, 0, 'opacity="0.5"');
      // fireflies
      for (let i = 0; i < 40; i++) { const x = 30 + ((i * 151) % 1990), y = 40 + ((i * 97) % 250); s += E(x, y, 1.8, 1.8, i % 3 === 0 ? SPIRIT_L : SPIRIT, 0, `opacity="${(0.4 + (i % 4) * 0.15).toFixed(2)}"`); }
      return bgOut(W, Hh, s);
    },
    thunderrange: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 120, [[4, 0.5, 1.2], [10, 0.3, 2], [18, 0.12, 0.4]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#343B4C");
      s += L(r, 2.4, INK, 'opacity="0.3"');
      // rock shoulders and a hanging bridge
      s += F(`M20,320 L20,150 Q200,120 380,150 L380,320Z`, "#2E3444");
      s += F(`M900,320 L900,150 Q1080,120 1260,150 L1260,320Z`, "#343B4C");
      s += F(`M1620,320 L1620,140 Q1810,110 2000,140 L2000,320Z`, "#2E3444");
      s += L(`M380,180 L460,160 L540,170 L620,150 L700,165 L780,150 L900,175`, 3, "#3E4658");
      s += L(`M380,190 L900,190`, 3, "#5E667A");
      for (let k = 0; k < 10; k++) s += L(`M${400 + k * 52},${(178 + (k % 2) * 12).toFixed(0)} L${400 + k * 52},190`, 1.4, "#5E667A");
      // carved columns with bolts
      [200, 1080, 1780].forEach((x, i) => {
        s += F(`M${x - 24},320 L${x - 18},120 L${x + 18},120 L${x + 24},320Z`, "#6E7790");
        s += L(`M${x - 20},160 L${x + 20},160 M${x - 20},220 L${x + 20},220`, 2, "#4E566E");
        s += P(`M${x},100 L${x + 8},124 L${x + 2},124 L${x + 10},150 L${x - 6},126 L${x},126Z`, BOLT, 2) + E(x, 120, 8, 12, BOLT, 0, 'opacity="0.3"');
      });
      for (let i = 0; i < 34; i++) { const x = 40 + ((i * 181) % 1970), y = 30 + ((i * 103) % 220), rr = 1.4 + (i % 3) * 0.7; s += E(x, y, rr, rr, BOLT, 0, `opacity="${(0.3 + (i % 4) * 0.13).toFixed(2)}"`); }
      return bgOut(W, Hh, s);
    },
    fatehall: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 90, [[4, 0.5, 1.6], [11, 0.3, 0.2], [22, 0.12, 2.6]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#2E3850");
      s += L(r, 2.4, INK, 'opacity="0.24"');
      // the arena floor
      s += E(1024, 292, 640, 40, "#5A6A94", 0, 'opacity="0.6"');
      s += F(`M0,278 L${W},278 L${W},${Hh} L0,${Hh}Z`, "#3E4866");
      s += L(`M0,278 L${W},278`, 2.4, INK, 'opacity="0.34"');
      for (let x = 0; x < W; x += 96) s += L(`M${x},278 L${x},${Hh}`, 1.6, INK, 'opacity="0.2"');
      // columns and floating seals
      [[120, 180, 1], [420, 220, 0], [800, 200, 1], [1300, 200, 1], [1660, 220, 0], [1940, 180, 1]].forEach(([x, top, seal]) => {
        s += F(`M${x - 34},282 L${x - 28},${top} L${x + 28},${top} L${x + 34},282Z`, "#54628C");
        s += F(`M${x - 44},282 L${x + 44},282 L${x + 48},${Hh} L${x - 48},${Hh}Z`, "#48548A");
        s += F(`M${x - 44},${top - 8} L${x - 30},${top - 30} L${x + 30},${top - 30} L${x + 44},${top - 8}Z`, "#6678A4");
        if (seal) { s += E(x, top + 70, 20, 20, "#C8F4FC", 0, 'opacity="0.18"') + E(x, top + 70, 12, 12, "none", 2, 'stroke="#C8F4FC"') + E(x, top + 70, 4, 4, "#FFF6D8", 0); }
      });
      return bgOut(W, Hh, s);
    },
  };

  // ---------------- ground bands ----------------
  const GROUND = {
    cloudsea: () => {
      const W = 512, Hh = 200; let s = "";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, "#9FB6C2");
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, "#8AA2B0");
      for (let i = 0; i < 20; i++) { const x = (i * 89) % W, y = 36 + ((i * 61) % 150); s += E(x, y, 6 + (i % 4) * 2, 3 + (i % 3), "#B8CCD6", 1.2); }
      for (let i = 0; i < 8; i++) { const x = i * 64, y = 22 + ((i * 29) % 22); s += P(`M${x + 4},${y} L${x + 62},${y - 3} L${x + 60},${y + 12} L${x + 6},${y + 15}Z`, "#A6BCC8", 1.6); }
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#6FA98A");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 8; x < W; x += 30) s += L(`M${x},1 L${x - 3},-9 M${x + 5},1 L${x + 7},-7`, 2, "#4F7A3A");
      for (let x = 40; x < W; x += 72) s += L(`M${x},2 Q${x + 8},-14 ${x + 20},-18`, 2, "#8FB07A");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    citadel: () => {
      const W = 512, Hh = 200; let s = "";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, "#5E5A68");
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, "#4E4A58");
      for (let i = 0; i < 18; i++) { const x = (i * 97) % W, y = 40 + ((i * 53) % 140); s += E(x, y, 5 + (i % 4) * 2, 2.6 + (i % 3), "#726E7C", 1.2); }
      [16, 64, 116, 164].forEach((y, r) => { for (let x = -(r % 2) * 32; x < W; x += 64) s += P(`M${x + 3},${y} L${x + 60},${y - 2} L${x + 58},${y + 40} L${x + 5},${y + 42}Z`, r % 2 ? "#605C6A" : "#6A6674", 1.6); });
      s += L("M90,60 L118,84 L110,124", 1.8, "#3A3640") + L("M300,110 L334,126 L328,164", 1.8, "#3A3640");
      [[52, 72], [180, 128], [268, 52], [360, 166], [452, 96], [110, 176]].forEach(([x, y], i) => { s += E(x, y, 12, 7, BOLT, 0, 'opacity="0.16"') + E(x, y, 4, 2.6, BOLT, 0, 'opacity="0.85"') + E(x, y, 1.8, 1.2, "#FFF3C8", 0, 'opacity="0.9"'); });
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#565262");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 12; x < W; x += 30) s += L(`M${x},1 L${x + 4},-7 M${x + 10},1 L${x + 8},-5`, 1.4, "#3E3A46");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    spiritforest: () => {
      const W = 512, Hh = 200; let s = "";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, "#4A5A46");
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, "#3C4A3A");
      for (let i = 0; i < 18; i++) { const x = (i * 89) % W, y = 36 + ((i * 61) % 150); s += E(x, y, 6 + (i % 4) * 2, 3 + (i % 3), "#5E7058", 1.2); }
      // big roots crossing the floor
      s += L("M0,120 Q120,96 240,130 Q360,160 512,120", 14, "#4E4034") + L("M0,120 Q120,96 240,130 Q360,160 512,120", 6, "#6B5A48");
      s += L("M0,60 Q140,44 260,66 Q380,88 512,60", 10, "#4E4034") + L("M0,60 Q140,44 260,66 Q380,88 512,60", 4, "#6B5A48");
      s += P("M180,150 L230,118 L262,150 L240,176 L196,176Z", "#55604E", 2) + E(220, 152, 16, 8, MOSS, 0, 'opacity="0.7"');
      for (let i = 0; i < 14; i++) { const x = (i * 137) % W, y = 40 + ((i * 71) % 130); s += E(x, y, 1.8, 1.8, SPIRIT, 0, `opacity="${(0.4 + (i % 4) * 0.15).toFixed(2)}"`); }
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#6E8A5E");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 8; x < W; x += 30) s += L(`M${x},1 L${x - 3},-9 M${x + 5},1 L${x + 7},-7`, 2, "#4F8A41");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    thunderrange: () => {
      const W = 512, Hh = 200; let s = "";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, "#5A5F70");
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, "#484D5E");
      for (let i = 0; i < 20; i++) { const x = (i * 83) % W, y = 36 + ((i * 67) % 150); s += E(x, y, 6 + (i % 4) * 2, 3 + (i % 3), "#6C7182", 1.2); }
      for (let i = 0; i < 9; i++) { const x = i * 60, y = 20 + ((i * 31) % 20); s += P(`M${x + 4},${y} L${x + 58},${y - 3} L${x + 56},${y + 12} L${x + 6},${y + 15}Z`, "#5C6172", 1.6); }
      // lightning scorch marks
      s += L("M40,24 L58,70 L44,110 L70,170", 2.4, "#2E323C") + L("M300,20 L320,66 L304,108 L336,168", 2.4, "#2E323C") + L("M420,30 L438,74 L424,116 L448,172", 2, "#2E323C");
      s += E(70, 170, 12, 7, BOLT, 0, 'opacity="0.2"') + E(336, 168, 12, 7, BOLT, 0, 'opacity="0.2"');
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#4E5464");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 12; x < W; x += 30) s += L(`M${x},1 L${x + 4},-7 M${x + 10},1 L${x + 8},-5`, 1.4, "#3E4658");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    fatehall: () => {
      const W = 512, Hh = 200; let s = "";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, "#5A6488");
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, "#48527A");
      [16, 64, 116, 164].forEach((y, r) => { for (let x = -(r % 2) * 32; x < W; x += 64) s += P(`M${x + 3},${y} L${x + 60},${y - 2} L${x + 58},${y + 40} L${x + 5},${y + 42}Z`, r % 2 ? "#525C80" : "#5C6690", 1.6); });
      // a great seal engraved in the floor
      s += E(256, 96, 62, 62, "none", 3, 'stroke="#9CC9E4" opacity="0.6"') + E(256, 96, 46, 46, "none", 2, 'stroke="#C8F4FC" opacity="0.5"') +
        L("M256,54 L256,138 M214,96 L298,96 M226,66 L286,126 M286,66 L226,126", 2, "#C8F4FC", 'opacity="0.6"') + E(256, 96, 6, 6, "#FFF6D8", 0, 'opacity="0.7"');
      for (let i = 0; i < 20; i++) { const x = (i * 151) % W, y = 30 + ((i * 79) % 140); s += E(x, y, 1.8, 1.8, "#FFF6D8", 0, `opacity="${(0.35 + (i % 4) * 0.15).toFixed(2)}"`); }
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#6678A4");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 12; x < W; x += 30) s += L(`M${x},1 L${x + 4},-7 M${x + 10},1 L${x + 8},-5`, 1.4, "#3E4866");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
  };

  Object.assign(window.ART.PROPS, PROPS2);
  window.ART.DIRT = Object.assign(window.ART.DIRT || {}, {
    cloudsea: 0x9fb6c2, citadel: 0x5e5a68, spiritforest: 0x4a5a46, thunderrange: 0x5a5f70, fatehall: 0x5a6488,
  });

  (function () {
    const bg = window.ART.BG;
    const farOld = bg.far, cloudsOld = bg.clouds, midOld = bg.mid, groundOld = bg.ground;
    bg.far = (theme) => (FAR[theme] ? FAR[theme]() : farOld(theme));
    bg.clouds = (theme) => (CLOUDS[theme] ? CLOUDS[theme]() : cloudsOld(theme));
    bg.mid = (theme) => (MID[theme] ? MID[theme]() : midOld(theme));
    bg.ground = (theme) => (GROUND[theme] ? GROUND[theme]() : groundOld(theme));
  })();
})();
