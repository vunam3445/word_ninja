// Word Ninja: the far side of the map. Bamboo forest, dark valley, moonlit ruins, dark fortress.
// Levels 10-30. Props, background layers and the DIRT colour per theme.
// Everything is drawn with the shared helpers in ART.H, so it comes out in the village's hand.
(function () {
  const H = window.ART.H;
  const { svg, P, L, F, E, part, G, ridge, tiles, INK, ROOF, ROOF_S, WOOD, WOOD_S, WALL, WALL_S } = H;

  // one palette for the four new regions, so they read as one world
  const STONE = "#9A9488", STONE_M = "#A8A296", STONE_S = "#7A746A", STONE_D = "#5E5952";
  const GHOST = "#5FD8E0", GHOST_P = "#CFFAF0";
  const BARK = "#6B5A48", BARK_S = "#4E4034";
  const VERM = "#B2432E", VERM_S = "#8A2F1F";
  const IRON = "#4A4F58", IRON_S = "#333840", IRON_L = "#5A5F68";
  const CLOTH = "#7C7058", CLOTH_S = "#5E5540";

  // ================= props =================
  const PROPS = {
    // a small wooden shrine: tiled roof, doorway, hanging rope with a bell
    shrine: () => {
      const w = 260, h = 260; let s = "";
      // stone plinth and step
      s += part("M30,232 L230,232 L240,260 L20,260Z", STONE_M, "M178,228 L244,228 L244,262 L178,262Z", STONE_S);
      s += P("M96,236 L164,236 L164,248 L96,248Z", STONE, 2.4) + L("M110,248 L150,248", 1.4, STONE_D);
      s += L("M26,244 L232,244 M40,252 L220,252", 1.4, STONE_D);
      // back wall (plaster between the posts)
      s += part("M58,108 L202,108 L202,234 L58,234Z", WALL, "M156,104 L206,104 L206,238 L156,238Z", WALL_S);
      s += L("M58,140 L202,140 M58,188 L202,188", 1.4, "#C9B48C");
      // posts
      s += part("M50,96 L68,96 L70,238 L48,238Z", WOOD, "M62,92 L76,92 L76,242 L62,242Z", WOOD_S);
      s += part("M192,96 L210,96 L212,238 L190,238Z", WOOD, "M202,92 L216,92 L216,242 L202,242Z", WOOD_S);
      // cross beam under the eaves
      s += part("M38,92 L222,92 L222,106 L38,106Z", WOOD, "M160,88 L226,88 L226,110 L160,110Z", WOOD_S);
      // doorway
      s += part("M104,150 L156,150 L158,234 L102,234Z", "#3B3330", "M142,146 L162,146 L162,238 L142,238Z", "#241F1D");
      s += P("M98,142 L162,142 L162,152 L98,152Z", WOOD, 2.4) + P("M98,142 L104,142 L104,238 L98,238Z M156,142 L162,142 L162,238 L156,238Z", WOOD, 2.2);
      s += L("M110,162 L150,162 M110,178 L150,178", 1.2, "#5A4A3E");
      // hanging rope and bell
      s += L("M72,140 Q130,178 188,140", 4.4, "#C89A5A") + L("M72,140 Q130,178 188,140", 1.4);
      s += P("M122,170 C122,160 138,160 138,170 L140,186 L120,186Z", "#E0A526", 2.6);
      s += P("M124,182 L136,182 L134,192 L126,192Z", "#B8841A", 2) + E(130,194,3.4,3.4, "#E0A526", 2);
      s += L("M118,188 L142,188", 2, "#F3E6C8");
      // roof
      s += part("M8,110 Q34,96 46,60 L214,60 Q226,96 252,110 Q130,92 8,110Z", ROOF, "M130,50 L262,50 L262,116 L130,116Z", ROOF_S, 3);
      s += tiles(42, 220, 64, 104, 14, "#00000040");
      s += part("M46,62 Q130,14 214,62 Q130,50 46,62Z", ROOF, "", "", 3) + L("M46,62 Q130,14 214,62", 4);
      // eave finials and a gold cap on the ridge
      s += P("M36,68 Q32,52 50,44 L56,64Z M224,68 Q228,52 210,44 L204,64Z", ROOF, 2.6) + L("M40,64 Q38,54 50,48 M220,64 Q222,54 210,48", 1.2, ROOF_S);
      s += E(130,22,7,7, "#E0A526", 2.4) + P("M130,10 L134,20 L126,20Z", "#E0A526", 2);
      // a little offering bowl at the step
      s += part("M112,226 Q130,222 148,226 L144,238 Q130,242 116,238Z", "#8A5A3A", "M136,222 L152,222 L152,242 L136,242Z", WOOD_S, 2.4);
      s += E(130,224,11,3, "#6E4A2E", 0);
      return { w, h, s };
    },

    // a wooden plank footbridge: piers at both ends, arched planks, rope railings
    bridge: () => {
      const w = 360, h = 120; let s = "";
      const deckTop = (t) => 84 - 34 * Math.sin(Math.PI * t);
      const deckX = (t) => 20 + 320 * t;
      // stone abutments
      s += part("M0,84 L56,84 L62,120 L-4,120Z", STONE, "M38,80 L66,80 L66,122 L38,122Z", STONE_S);
      s += part("M304,84 L360,84 L364,120 L298,120Z", STONE, "M318,80 L346,80 L346,122 L318,122Z", STONE_S);
      s += L("M4,96 L58,96 M302,96 L356,96 M8,110 L60,110 M300,110 L352,110", 1.4, STONE_D);
      s += L("M18,90 L14,108 M338,90 L344,106", 1.6, STONE_D);
      // the stringers under the deck, then the planks on top of them
      let stringer = `M14,${(deckTop(0) + 13).toFixed(1)}`;
      for (let i = 1; i <= 24; i++) { const t = i / 24; stringer += ` L${deckX(t).toFixed(1)},${(deckTop(t) + 13).toFixed(1)}`; }
      stringer += ` L346,${(deckTop(1) + 21).toFixed(1)}`;
      for (let i = 24; i >= 0; i--) { const t = i / 24; stringer += ` L${deckX(t).toFixed(1)},${(deckTop(t) + 21).toFixed(1)}`; }
      stringer += "Z";
      s += part(stringer, WOOD_S, "", "", 2.8);
      // planks
      let planks = `M14,${deckTop(0).toFixed(1)}`;
      for (let i = 1; i <= 24; i++) planks += ` L${deckX(i / 24).toFixed(1)},${deckTop(i / 24).toFixed(1)}`;
      planks += ` L346,${deckTop(1).toFixed(1)} L346,${(deckTop(1) + 13).toFixed(1)}`;
      for (let i = 24; i >= 0; i--) planks += ` L${deckX(i / 24).toFixed(1)},${(deckTop(i / 24) + 13).toFixed(1)}`;
      planks += "Z";
      s += part(planks, "#A8774E", "M180,10 L360,10 L360,120 L180,120Z", WOOD_S, 2.8);
      for (let i = 0; i <= 22; i++) { const t = i / 22, x = deckX(t), y = deckTop(t); s += L(`M${x.toFixed(1)},${(y - 1).toFixed(1)} L${(x + 3.4).toFixed(1)},${(y + 15).toFixed(1)}`, 1.4); }
      // rope railings: posts, rails and vertical ties
      const railY = (t) => deckTop(t) - 30 + 6 * Math.sin(Math.PI * t);
      [[0, 20], [0.5, 180], [1, 340]].forEach(([t]) => {
        const x = deckX(t), y = deckTop(t);
        s += P(`M${x - 3.4},${(railY(t) - 6).toFixed(1)} L${x + 3.4},${(railY(t) - 6).toFixed(1)} L${x + 3.4},${(y + 4).toFixed(1)} L${x - 3.4},${(y + 4).toFixed(1)}Z`, WOOD, 2.4);
      });
      let rail = `M20,${railY(0).toFixed(1)}`;
      for (let i = 1; i <= 20; i++) rail += ` Q${(deckX((i - 0.5) / 20)).toFixed(1)},${(railY((i - 0.5) / 20) - 5).toFixed(1)} ${deckX(i / 20).toFixed(1)},${railY(i / 20).toFixed(1)}`;
      s += L(rail, 2.6, "#C89A5A") + L(rail.replace(/ Q[^Q]*/g, (m) => m), 0.9, INK);
      let rail2 = `M20,${(railY(0) + 15).toFixed(1)}`;
      for (let i = 1; i <= 16; i++) rail2 += ` L${deckX(i / 16).toFixed(1)},${(railY(i / 16) + 15).toFixed(1)}`;
      s += L(rail2, 2.2, "#C89A5A");
      for (let i = 1; i < 16; i++) { const t = i / 16; s += L(`M${deckX(t).toFixed(1)},${railY(t).toFixed(1)} L${deckX(t).toFixed(1)},${(deckTop(t) + 2).toFixed(1)}`, 1.6, "#C89A5A"); }
      return { w, h, s };
    },

    // a bare gnarled tree
    deadTree: () => {
      const w = 200, h = 260; let s = "";
      s += L("M86,260 C70,253 58,245 52,232", 7, BARK_S) + L("M114,260 C132,253 146,245 152,234", 7, BARK_S);
      s += part("M82,260 C78,212 88,182 92,148 L112,148 C116,184 122,214 120,260Z", BARK, "M106,146 L120,146 L124,262 L106,262Z", BARK_S);
      const br = (d, sw) => L(d, sw, BARK_S) + L(d, sw * 0.55, BARK);
      s += br("M100,160 C86,142 66,134 46,112", 9);
      s += br("M104,140 C118,126 140,120 158,102", 8);
      s += br("M100,122 C96,102 104,86 98,68", 6.4);
      s += br("M46,112 C40,98 30,92 24,78", 5);
      s += br("M46,112 C58,100 62,88 78,80", 4.4);
      s += br("M158,102 C164,90 176,86 184,74", 4.6);
      s += br("M158,102 C150,90 148,80 156,66", 4);
      s += br("M98,68 C92,58 94,50 88,42", 3.4);
      s += br("M78,80 C84,70 92,68 96,60", 3);
      s += br("M24,78 C20,68 22,60 16,54", 3);
      s += br("M184,74 C190,66 188,58 194,50", 2.8);
      s += br("M156,66 C160,58 168,56 170,50", 2.6);
      // fine twigs
      s += L("M16,54 C12,46 14,42 10,38 M88,42 C84,34 86,30 82,26 M194,50 C198,42 196,38 200,34", 1.8, BARK_S);
      s += L("M60,126 C54,120 50,116 44,114 M132,120 C138,114 142,112 148,108", 1.6, BARK_S);
      // knots and roots
      s += E(101,178,7,5, BARK_S, 2) + E(105,196,4,3, BARK_S, 1.6);
      s += L("M84,260 C74,257 68,250 64,244 M116,260 C126,255 132,248 136,242", 3, BARK_S);
      s += part("M70,246 C80,238 92,238 100,242 C92,248 78,250 70,246Z", "#7FA45E", "", "", 2);
      return { w, h, s };
    },

    // a post lantern burning blue-green ghost light
    blueLantern: () => {
      const w = 70, h = 230; let s = "";
      s += E(35, 104, 30, 36, GHOST, 0, 'opacity="0.16"');
      s += part("M12,216 L58,216 L62,230 L8,230Z", STONE_M, "M36,214 L62,214 L62,232 L36,232Z", STONE_S);
      s += L("M14,222 L58,222", 1.4, STONE_D);
      s += part("M31,92 L39,92 L41,218 L29,218Z", WOOD, "M36,88 L44,88 L44,220 L36,220Z", WOOD_S);
      s += L("M30,140 L40,140 M30,180 L40,180", 1.6, WOOD_S);
      // lantern housing
      s += part("M14,86 L56,86 L50,142 L20,142Z", STONE_M, "M36,82 L60,82 L60,146 L36,146Z", STONE_S);
      s += part("M21,94 L49,94 L45,134 L25,134Z", "#1E2A32", "M36,90 L52,90 L52,138 L36,138Z", "#101820", 2.4);
      s += P("M35,128 C27,118 30,106 35,96 C40,106 43,118 35,128Z", GHOST, 2.2) + P("M35,124 C31,117 32,110 35,103 C38,110 39,117 35,124Z", GHOST_P, 1.4);
      s += E(35,112,4,5, "#FFFFFF", 0, 'opacity="0.8"');
      s += L("M22,110 L48,110 M22,120 L48,120", 1.2, "#3E4A52");
      // cap and finial
      s += part("M6,90 Q35,60 64,90Z", STONE, "M36,58 L66,58 L66,94 L36,94Z", STONE_S, 2.8);
      s += P("M10,86 L60,86 L60,94 L10,94Z", STONE_M, 2.6);
      s += E(35,64,5.5,5.5, STONE, 2.4) + P("M35,54 L38,62 L32,62Z", STONE, 1.8);
      // two hanging tags
      s += L("M20,140 L10,150 L14,164 M50,140 L60,150 L56,166", 1.6, "#8A5A3A");
      s += P("M4,150 L18,150 L18,166 L4,166Z", "#E4D2AA", 2) + L("M7,156 L15,156 M11,156 L11,163", 1.2, "#8A8178");
      s += P("M52,152 L66,152 L66,168 L52,168Z", "#E4D2AA", 2) + L("M55,158 L63,158 M59,158 L59,165", 1.2, "#8A8178");
      return { w, h, s };
    },

    // a broken stone pillar; v=1 is the taller, intact one
    pillar: (v = 0) => {
      const tall = v === 1, w = 110, h = tall ? 330 : 250; let s = "";
      const base = h;
      s += part(`M12,${base - 26} L98,${base - 26} L104,${base} L6,${base}Z`, STONE_M, `M74,${base - 30} L106,${base - 30} L106,${base + 2} L74,${base + 2}Z`, STONE_S);
      s += L(`M10,${base - 16} L100,${base - 16} M14,${base - 7} L98,${base - 7}`, 1.4, STONE_D);
      s += L(`M26,${base - 26} L20,${base} M84,${base - 26} L90,${base}`, 1.6, STONE_D);
      const shaftTop = tall ? 96 : 96;
      s += part(`M26,${shaftTop} L84,${shaftTop} L81,${base - 24} L29,${base - 24}Z`, STONE, `M62,${shaftTop - 2} L88,${shaftTop - 2} L88,${base - 20} L62,${base - 20}Z`, STONE_S);
      // carved bands
      [0.18, 0.42, 0.66, 0.88].forEach((k) => {
        const y = shaftTop + (base - 24 - shaftTop) * k;
        s += P(`M23,${y.toFixed(1)} L87,${y.toFixed(1)} L87,${(y + 6).toFixed(1)} L23,${(y + 6).toFixed(1)}Z`, STONE_M, 2.2);
        s += L(`M27,${(y + 9).toFixed(1)} L83,${(y + 9).toFixed(1)}`, 1.2, STONE_D);
      });
      // carved lotus panels and a worn inscription
      // a carved lotus medallion on the face of the drum
      const my = shaftTop + 34;
      s += E(55, my, 20, 20, "none", 1.8, `stroke="${STONE_D}"`) +
        P(`M55,${my - 16} C${40},${my - 12} ${36},${my + 6} ${55},${my + 16} C${74},${my + 6} ${70},${my - 12} ${55},${my - 16}Z`, STONE_M, 2) +
        P(`M55,${my - 15} C${44},${my - 8} ${44},${my + 8} ${55},${my + 15}`, 1.6, STONE_D) +
        P(`M55,${my - 11} C${50},${my - 5} ${50},${my + 5} ${55},${my + 11}`, 1.4, STONE_D);
      s += L(`M33,${shaftTop + 68} L77,${shaftTop + 68} M38,${shaftTop + 76} L72,${shaftTop + 76}`, 1.6, STONE_D);
      s += L(`M38,${base - 74} L44,${base - 62} L52,${base - 74} L60,${base - 62} L66,${base - 74} M40,${base - 84} L70,${base - 84}`, 1.6, STONE_D);
      s += L(`M30,${base - 124} L64,${base - 120} L40,${base - 104}`, 1.6, STONE_D);
      if (tall) {
        // flared lotus capital
        s += part("M18,96 L92,96 L84,74 L26,74Z", STONE, "M62,70 L96,70 L96,100 L62,100Z", STONE_S);
        s += P("M22,60 Q55,40 88,60 L88,76 L22,76Z", STONE_M, 2.6) + L("M32,60 L32,74 M44,54 L44,74 M56,50 L56,74 M68,54 L68,74 M80,60 L80,74", 1.4, STONE_D);
        s += P("M14,58 L96,58 L96,68 L14,68Z", STONE, 2.8);
        s += E(55, 44, 12, 6, STONE_M, 2.4) + E(55, 36, 7, 5, STONE, 2.2) + E(55, 30, 4, 3.5, "#E0A526", 2);
        s += L("M24,86 L86,86", 1.4, STONE_D);
      } else {
        // a jagged break, with the fallen piece leaning at the foot
        s += P("M26,96 L40,74 L52,88 L66,60 L78,82 L84,96Z", STONE, 3);
        s += F("M26,96 L40,74 L52,88 L66,60 L78,82 L84,96Z", "none") + L("M40,74 L46,96 M66,60 L64,96", 1.4, STONE_D);
        s += part(`M62,${base - 30} L94,${base - 40} L102,${base - 24} L70,${base - 14}Z`, STONE, `M86,${base - 42} L106,${base - 42} L106,${base - 18} L86,${base - 18}Z`, STONE_S);
        s += E(38, 116, 3.4, 3.4, "#7FA45E", 0) + E(74, 104, 2.6, 2.6, "#8FB07A", 0);
      }
      s += E(34, base - 40, 4, 3, "#7FA45E", 0) + E(74, base - 60, 3, 2.4, "#8FB07A", 0);
      return { w, h, s };
    },

    // a tall stone gate with a crescent moon carved in it
    moonGate: () => {
      const w = 300, h = 330; let s = "";
      s += part("M48,104 L80,104 L84,330 L44,330Z", STONE, "M66,100 L88,100 L88,332 L66,332Z", STONE_S);
      s += part("M220,104 L252,104 L256,330 L216,330Z", STONE, "M238,100 L260,100 L260,332 L238,332Z", STONE_S);
      s += L("M44,330 L84,330 M216,330 L256,330", 2, STONE_D);
      s += L("M52,150 L80,150 M52,200 L80,200 M52,250 L80,250 M220,150 L248,150 M220,210 L248,210", 1.4, STONE_D);
      // a chipped bite out of the right pillar
      s += P("M252,196 L256,232 L240,238 L236,200Z", "#2A2B2E", 2);
      s += part("M26,120 L274,120 L274,142 L26,142Z", STONE_M, "M150,116 L278,116 L278,146 L150,146Z", STONE_S);
      s += L("M30,132 L270,132", 1.4, STONE_D);
      // carved moon panel
      s += P("M108,142 L192,142 L192,214 L108,214Z", STONE_D, 2.8);
      s += L("M114,148 L186,148 L186,208 L114,208Z", 1.6, "#8F8A80");
      s += E(150, 178, 36, 36, "#BFE0E6", 0, 'opacity="0.18"');
      s += P("M152,150 Q182,168 152,206 Q170,178 152,150Z", "#C9D8E4", 2.4);
      s += E(134, 162, 2.6, 2.6, "#C9D8E4", 0) + E(140, 194, 2, 2, "#C9D8E4", 0) + E(128, 186, 1.6, 1.6, "#C9D8E4", 0);
      // roof slab and the broken skyline
      s += part("M0,104 Q16,92 24,66 L276,66 Q284,92 300,104 Q150,84 0,104Z", STONE_S, "M150,56 L300,56 L300,110 L150,110Z", STONE_D, 3);
      s += P("M22,70 L276,70 L276,80 L22,80Z", STONE_M, 2.6);
      s += part("M104,74 L124,74 L124,46 L176,46 L176,74 L196,74 L196,58 L204,58 L204,74 L216,74 L216,84 L96,84Z",
        STONE_M, "M150,42 L222,42 L222,88 L150,88Z", STONE_S, 2.8);
      s += P("M120,46 L140,28 L152,46Z", STONE_S, 2.4) + L("M132,46 L132,68 M186,58 L186,78", 1.4, STONE_D);
      s += L("M60,86 L74,100 M240,84 L226,98 M150,90 L150,106", 1.6, STONE_D);
      // vines
      s += L("M60,120 Q56,170 62,210 Q66,240 58,270 M240,124 Q246,150 240,178", 2.4, "#6E8A5E");
      s += E(62, 156, 6, 4, "#7FA45E", 0) + E(60, 206, 5, 3.4, "#8FB07A", 0) + E(241, 152, 5, 3.4, "#7FA45E", 0);
      return { w, h, s };
    },

    // a fortress wall segment
    wall: () => {
      const w = 200, h = 170; let s = "";
      s += part("M6,44 L194,44 L194,170 L6,170Z", "#6E7480", "M130,40 L198,40 L198,172 L130,172Z", "#565C66");
      // merlons
      let mer = "";
      [4, 60, 116, 156].forEach((x) => (mer += `M${x},46 L${x},12 L${x + 30},12 L${x + 30},46 Z `));
      s += part(mer, "#7C8390", "M120,6 L200,6 L200,50 L120,50Z", "#5F6672", 3);
      s += P("M2,44 L198,44 L198,54 L2,54Z", "#8A919E", 2.8);
      // block joints
      for (let y = 74; y <= 154; y += 26) s += L(`M6,${y} L194,${y}`, 1.6, "#4C525C");
      for (let r = 0, y = 74; y <= 154; y += 26, r++) for (let x = 6 + (r % 2) * 34; x < 194; x += 68) s += L(`M${x},${y - 26} L${x},${y}`, 1.6, "#4C525C");
      s += L("M6,44 L6,170 M194,44 L194,170", 1.6, "#4C525C");
      // arrow slit and a patched crack
      s += P("M92,84 L102,84 L102,140 L92,140Z", "#2A2320", 2.4) + P("M94,86 L100,86 L100,138 L94,138Z", "#15171B", 0);
      s += L("M40,60 L52,84 L44,110 L56,136 L48,160", 1.8, "#4C525C");
      s += L("M150,60 L160,80 L152,104", 1.6, "#4C525C");
      // moss and weeds in the joints
      s += E(30, 76, 9, 4, "#6E8A5E", 0) + E(70, 128, 7, 3.4, "#7FA45E", 0) + E(168, 102, 8, 3.4, "#6E8A5E", 0) + E(120, 154, 6, 3, "#7FA45E", 0);
      s += L("M26,72 L22,62 M30,72 L28,60 M166,98 L162,86 M170,98 L172,86", 1.6, "#4F8A41");
      return { w, h, s };
    },

    // an iron brazier burning blue flame
    brazier: () => {
      const w = 100, h = 180; let s = "";
      s += E(50, 104, 36, 48, GHOST, 0, 'opacity="0.15"');
      s += P("M50,132 C26,108 32,82 50,54 C68,82 74,108 50,132Z", GHOST, 2.4);
      s += P("M50,126 C36,110 40,92 50,74 C60,92 64,110 50,126Z", GHOST_P, 1.8);
      s += P("M50,118 C44,110 46,102 50,94 C54,102 56,110 50,118Z", "#FFFFFF", 0, 'opacity="0.75"');
      // drifting embers
      s += E(34, 48, 2.4, 2.4, GHOST, 0, 'opacity="0.7"') + E(66, 34, 2, 2, GHOST, 0, 'opacity="0.55"') + E(46, 24, 1.6, 1.6, GHOST_P, 0, 'opacity="0.6"') + E(74, 62, 1.8, 1.8, GHOST, 0, 'opacity="0.5"');
      // bowl
      s += part("M10,138 Q50,130 90,138 L84,162 Q50,174 16,162Z", IRON, "M56,132 L92,132 L92,166 L56,166Z", IRON_S);
      s += P("M6,132 L94,132 L94,144 L6,144Z", IRON_L, 3);
      s += L("M16,152 L84,152", 1.6, IRON_S);
      // coals
      s += E(34, 138, 7, 3.4, "#8A3A2E", 0) + E(52, 136, 8, 3.6, "#B0432E", 0) + E(68, 139, 6, 3, "#8A3A2E", 0);
      s += E(44, 137, 3.4, 2.4, GHOST, 0, 'opacity="0.85"') + E(60, 136, 2.6, 2, GHOST_P, 0, 'opacity="0.8"');
      // tripod legs and ring
      s += L("M18,158 L82,158", 3, IRON);
      s += P("M20,160 L30,160 L34,180 L16,180Z", IRON, 2.4) + P("M45,166 L55,166 L55,180 L45,180Z", IRON_S, 2.4) + P("M70,160 L80,160 L84,180 L66,180Z", IRON, 2.4);
      s += P("M14,174 L36,174 L36,180 L14,180Z M64,174 L86,174 L86,180 L64,180Z M43,174 L57,174 L57,180 L43,180Z", IRON_S, 2);
      return { w, h, s };
    },

    // a torn war banner on a pole
    flag: () => {
      const w = 90, h = 230; let s = "";
      s += part("M26,14 L36,14 L38,230 L24,230Z", WOOD, "M34,10 L44,10 L44,232 L34,232Z", WOOD_S);
      s += P("M31,2 L40,16 L31,32 L22,16Z", "#B9B6AE", 2.6) + E(31, 40, 5, 5, "#E0A526", 2.2);
      s += L("M24,80 L38,80 M24,140 L38,140 M24,196 L38,196", 1.8, WOOD_S);
      // the banner, hanging off the pole in the wind
      s += part("M36,44 L86,52 L84,120 L74,134 L64,118 L52,140 L42,124 L36,136Z",
        "#B0432E", "M62,48 L88,48 L88,140 L62,140Z", "#8A2F1F", 2.8);
      s += L("M40,64 L84,70 M40,86 L82,92 M40,110 L78,116", 1.4, "#8A2F1F");
      // sigil: a moon over a bar
      s += E(60, 74, 9, 9, "#F3E6C8", 2) + P("M62,66 Q70,74 62,82 Q66,74 62,66Z", "#B0432E", 1.4);
      s += P("M44,96 L76,98 L76,106 L44,104Z", "#F3E6C8", 2);
      // tears and holes
      s += L("M60,110 L58,132 M70,104 L70,120", 1.6, "#6E2418");
      s += P("M48,124 L56,128 L50,134Z M78,112 L84,118 L78,124Z", "#2A2320", 0);
      // rope ties to the pole
      s += L("M30,54 L38,58 M30,64 L38,66 M30,74 L38,78", 1.8, "#C89A5A");
      return { w, h, s };
    },

    // a small camp: a tent, a stool and a lantern. v=1 opens the tent and lights a fire.
    camp: (v = 0) => {
      const w = 260, h = 170; let s = "";
      s += E(130, 164, 122, 16, "#4E4436", 0, 'opacity="0.45"');
      // guy ropes and pegs first, so the canvas sits over them
      s += L("M62,154 L20,164 M200,154 L242,164 M128,34 L166,154", 1.8, "#6E6149");
      s += P("M14,158 L24,158 L24,166 L14,166Z M236,158 L246,158 L246,166 L236,166Z", WOOD, 1.8);
      // tent canvas
      s += part("M50,158 L128,32 L206,158Z", CLOTH, "M138,28 L210,28 L210,162 L138,162Z", CLOTH_S, 3);
      s += L("M128,34 L128,156", 2.2, CLOTH_S);
      s += L("M92,92 L128,36 L164,92", 1.6, "#8C8068");
      // ridge pole and its cap
      s += P("M118,28 L138,28 L138,40 L118,40Z", WOOD, 2.4) + E(128, 26, 4, 4, WOOD_S, 2);
      // doorway
      s += part("M128,158 L128,42 L180,156Z", "#241F1D", "M150,36 L184,36 L184,162 L150,162Z", "#17140F", 2.6);
      s += P("M126,44 L130,44 L130,158 L126,158Z", WOOD_S, 2);
      if (v === 1) {
        // rolled-open flap and a lit fire
        s += part("M132,44 L188,52 L196,152 L138,156Z", CLOTH, "M160,48 L200,48 L200,158 L160,158Z", CLOTH_S, 2.6);
        s += L("M140,60 L190,68 M138,90 L192,98 M138,120 L194,128", 1.4, "#8C8068");
        s += G("translate(30,0)", P("M40,148 Q50,140 60,148 Q50,156 40,148Z", "#4E4436", 2) + L("M42,146 Q50,132 58,146", 2.4, "#B0432E") + L("M46,146 Q50,136 54,146", 1.6, "#E0A526") +
          P("M34,140 L38,140 L40,150 L32,150Z M62,140 L66,140 L68,150 L60,150Z", IRON, 2));
        s += part("M104,156 L194,156 L198,170 L100,170Z", CLOTH_S, "M150,152 L200,152 L200,172 L150,172Z", "#4C4634", 2.6);
      } else {
        s += P("M120,154 L192,154 L196,168 L116,168Z", "#E4D2AA", 2.4) + L("M132,170 L176,170", 2);
      }
      // stool
      s += E(222, 116, 17, 6, WOOD, 2.6) + P("M222,116 L222,158", 3.4, WOOD_S) +
        P("M206,156 L218,156 L216,170 L204,170Z", WOOD, 2.2) + P("M226,156 L238,156 L240,170 L228,170Z", WOOD, 2.2) +
        L("M210,124 L234,126", 1.6, WOOD_S);
      // lantern on a short post
      s += E(42, 132, 20, 24, "#E0A526", 0, 'opacity="0.14"');
      s += P("M38,120 L46,120 L47,156 L37,156Z", WOOD, 2.4);
      s += part("M28,88 L56,88 L52,122 L32,122Z", "#B8B2A4", "M46,84 L62,84 L62,126 L46,126Z", STONE_S, 2.6);
      s += part("M33,94 L51,94 L48,116 L36,116Z", "#1E2A32", "M44,90 L56,90 L56,120 L44,120Z", "#101820", 2);
      s += P("M42,112 C37,106 39,98 42,92 C45,98 47,106 42,112Z", "#E0A526", 1.8) + E(42, 102, 3, 4, "#FFF3C8", 0, 'opacity="0.85"');
      s += P("M22,86 Q42,66 62,86Z", STONE, 2.6) + E(42, 72, 4, 4, STONE_S, 2);
      s += L("M40,156 L40,170 M44,156 L44,168", 1.6, WOOD_S);
      return { w, h, s };
    },

    // a red-vermillion wood portal
    torii: () => {
      const w = 280, h = 300; let s = "";
      // pillars, leaning in towards the top
      s += part("M52,300 L84,300 L96,80 L70,80Z", VERM, "M76,76 L104,76 L104,304 L76,304Z", VERM_S, 3);
      s += part("M196,300 L228,300 L210,80 L184,80Z", VERM, "M204,76 L232,76 L232,304 L204,304Z", VERM_S, 3);
      // base stones
      s += part("M44,282 L92,282 L96,300 L40,300Z", STONE_M, "M74,278 L100,278 L100,302 L74,302Z", STONE_S);
      s += part("M188,282 L236,282 L240,300 L184,300Z", STONE_M, "M214,278 L240,278 L240,302 L214,302Z", STONE_S);
      s += L("M50,290 L90,290 M194,290 L234,290", 1.4, STONE_D);
      // nuki (the straight lower beam)
      s += part("M30,116 L250,116 L250,136 L30,136Z", VERM, "M150,112 L254,112 L254,140 L150,140Z", VERM_S, 3);
      s += L("M36,126 L244,126", 1.4, "#8A2F1F");
      // gakuzuka (the little tablet between the beams)
      s += P("M128,96 L152,96 L152,118 L128,118Z", "#F3E6C8", 2.4) + L("M136,102 L144,102 M140,102 L140,112", 2, "#8A2F1F");
      // kasagi (the curved top beam) and its dark end caps
      s += part("M4,96 Q18,78 32,58 L248,58 Q262,78 276,96 Q140,78 4,96Z", VERM, "M140,52 L280,52 L280,100 L140,100Z", VERM_S, 3);
      s += P("M4,96 Q18,78 32,58 L54,62 Q38,82 24,100Z", "#2A2320", 2.6);
      s += P("M276,96 Q262,78 248,58 L226,62 Q242,82 256,100Z", "#2A2320", 2.6);
      s += L("M40,84 Q140,68 240,84", 1.6, "#8A2F1F");
      s += P("M32,58 L248,58 L248,66 L32,66Z", "#2A2320", 2.4);
      // shimaki (the second, thinner beam under the kasagi)
      s += part("M22,74 L258,74 L258,86 L22,86Z", VERM, "M150,70 L262,70 L262,90 L150,90Z", VERM_S, 2.6);
      // weathering and moss at the feet
      s += L("M60,150 L64,220 M216,160 L212,240 M72,180 L78,260", 1.4, "#8A2F1F");
      s += E(58, 292, 10, 4, "#6E8A5E", 0) + E(226, 294, 8, 3.4, "#7FA45E", 0);
      s += E(70, 100, 4, 5, "#8A2F1F", 0) + E(212, 118, 3.4, 4, "#8A2F1F", 0);
      return { w, h, s };
    },

    // a flat patch of moss and small stones, drawn on the ground
    moss: () => {
      const w = 160, h = 40; let s = "";
      s += E(80, 30, 74, 8, "#4E4436", 0, 'opacity="0.3"');
      s += part("M8,32 C6,22 22,16 36,20 C42,10 66,8 76,16 C86,6 112,8 118,18 C134,16 152,22 152,30 C152,36 120,40 80,40 C40,40 10,37 8,32Z",
        "#6E8A5E", "M84,10 L156,10 L156,40 L84,40Z", "#5A734C", 2.6);
      s += part("M28,30 C30,22 44,20 50,26 C56,20 70,22 70,28 C70,34 40,36 28,30Z", "#7FA45E", "", "", 2.2);
      s += part("M92,26 C98,18 116,18 122,24 C130,20 142,24 140,30 C134,35 100,34 92,26Z", "#8FB07A", "", "", 2.2);
      s += L("M20,28 Q26,24 32,27 M46,24 Q52,20 58,23 M104,24 Q110,20 116,23 M126,28 Q132,25 138,28", 1.2, "#4F8A41");
      s += part("M52,34 C50,26 60,22 68,26 C74,30 68,40 60,40 C55,40 53,38 52,34Z", STONE, "M66,22 L82,22 L82,42 L66,42Z", STONE_S, 2.2);
      s += part("M118,38 C116,32 124,28 132,32 C138,36 132,40 126,40 C122,40 119,40 118,38Z", STONE_M, "", "", 2);
      s += E(96, 36, 4, 2.6, "#8A7A5E", 1.6) + E(40, 38, 3, 2, "#8A7A5E", 1.6);
      return { w, h, s };
    },
  };

  // ================= backgrounds =================
  const bgOut = (W, Hh, s) => ({ svg: svg(W, Hh, s, 1, false), w: W, h: Hh });
  // a bamboo culm for the mid layer
  const culm = (x, top, base, col, shade, lean, ring) => {
    let t = G(`rotate(${lean},${x},${base})`,
      F(`M${x - 5},${top} L${x + 5},${top} L${x + 5},${base} L${x - 5},${base}Z`, col) +
      F(`M${x + 1.5},${top} L${x + 5},${top} L${x + 5},${base} L${x + 1.5},${base}Z`, shade));
    for (let y = top + ring; y < base; y += ring) t += L(`M${x - 5},${y.toFixed(0)} L${x + 5},${y.toFixed(0)}`, 1.6, INK, 'opacity="0.25"');
    return t;
  };
  const leaf = (x, y, d, col, sc = 1) =>
    F(`M${x},${y} C${x + 26 * d * sc},${y - 13 * sc} ${x + 54 * d * sc},${y - 9 * sc} ${x + 64 * d * sc},${y - 1 * sc} C${x + 48 * d * sc},${y + 7 * sc} ${x + 22 * d * sc},${y + 6 * sc} ${x},${y}Z`, col) +
    L(`M${x},${y} C${x + 26 * d * sc},${y - 13 * sc} ${x + 54 * d * sc},${y - 9 * sc} ${x + 64 * d * sc},${y - 1 * sc}`, 1.2, INK, 'opacity="0.28"');
  // a fan of leaves from one point, so a grove reads as foliage and not as lollipops
  const leafFan = (x, y, col, sc = 1) =>
    leaf(x, y, 1, col, sc) + leaf(x, y - 5 * sc, 1, col, sc * 0.82) + leaf(x, y + 6 * sc, 1, col, sc * 0.7) +
    leaf(x, y + 2 * sc, -1, col, sc * 0.9) + leaf(x, y - 4 * sc, -1, col, sc * 0.68) +
    L(`M${x},${y} L${x},${y + 12 * sc}`, 1, INK, 'opacity="0.25"');
  // a sky wash: opaque at one end of the layer, gone at the other, so the four dark
  // themes do not float on the village's pale sky
  let uid = 0;
  const wash = (stops, W, Hh, x, y, h) => {
    const id = "wn" + uid++;
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
      stops.map(([o, c]) => `<stop offset="${o * 100}%" stop-color="${c}"/>`).join("") +
      `</linearGradient></defs><rect x="${x}" y="${y}" width="${W}" height="${h}" fill="url(#${id})"/>`;
  };
  // a distant bamboo clump
  const farClump = (x, base, sc) => {
    let t = "";
    for (let k = 0; k < 4; k++) {
      const cx = x + (k - 1.5) * 8 * sc, top = base - (74 + (k % 3) * 15 + (k === 3 ? 10 : 0)) * sc;
      t += F(`M${cx - 1.8 * sc},${base} L${cx + 1.8 * sc},${base} L${cx + 1.6 * sc},${top} L${cx - 1.6 * sc},${top}Z`, "#7E9A7C", 'opacity="0.75"');
      t += leaf(cx + 1, top + 3 * sc, 1, "#8CA888", 0.55 * sc) + leaf(cx - 1, top + 8 * sc, -1, "#7E9A7C", 0.5 * sc);
    }
    return t;
  };
  // a stepped canyon wall: a sheer two-tone rock face
  const plateau = (x, w0, base, top, col, colS) => {
    let d = `M${x},${base} L${x},${(top + 22).toFixed(0)}`;
    for (let i = 0; i < 5; i++) {
      const xa = x + (w0 / 5) * i, xb = x + (w0 / 5) * (i + 1);
      d += ` L${xa.toFixed(0)},${(top + ((i * 37) % 22)).toFixed(0)} L${xb.toFixed(0)},${(top + ((i * 53) % 26)).toFixed(0)}`;
    }
    d += ` L${(x + w0).toFixed(0)},${base}Z`;
    let t = F(d, col);
    t += F(`M${(x + w0 * 0.46).toFixed(0)},${base} L${(x + w0 * 0.46).toFixed(0)},${(top + 16).toFixed(0)} L${(x + w0).toFixed(0)},${(top + 24).toFixed(0)} L${(x + w0).toFixed(0)},${base}Z`, colS);
    t += L(d, 2, INK, 'opacity="0.3"');
    t += L(`M${(x + w0 * 0.46).toFixed(0)},${(top + 16).toFixed(0)} L${(x + w0 * 0.46).toFixed(0)},${base}`, 1.6, INK, 'opacity="0.22"');
    for (let k = 1; k <= 3; k++) t += L(`M${(x + 14).toFixed(0)},${(top + 34 + k * 42).toFixed(0)} L${(x + w0 - 18).toFixed(0)},${(top + 40 + k * 42).toFixed(0)}`, 1.5, INK, 'opacity="0.16"');
    return t;
  };
  // a ruined temple on the skyline: stylobate, uneven columns, a pediment with a bite out of it
  const farTemple = (x, base, k, col, colD) => {
    let t = "";
    const hgt = 96, gap = 34;
    t += F(`M${x - 8 * k},${base} L${x - 4 * k},${base - hgt * 0.26} L${x + (gap * 3 + 34) * k},${base - hgt * 0.26} L${x + (gap * 3 + 38) * k},${base}Z`, col);
    for (let i = 0; i < 4; i++) {
      const cx = x + (6 + i * gap) * k, top = base - (hgt * (0.72 + ((i * 29) % 24) / 100));
      t += F(`M${cx},${base - hgt * 0.26} L${cx + 3 * k},${top.toFixed(0)} L${cx + 18 * k},${top.toFixed(0)} L${cx + 21 * k},${base - hgt * 0.26}Z`, col);
    }
    const ax = x - 4 * k, aw = (gap * 3 + 42) * k, ay = base - hgt * 0.96;
    t += F(`M${ax},${ay} L${ax + aw * 0.32},${ay} L${ax + aw * 0.32},${(ay - 16 * k).toFixed(0)} L${ax + aw * 0.66},${(ay - 16 * k).toFixed(0)} L${ax + aw * 0.66},${ay} L${ax + aw},${ay} L${ax + aw},${(ay + 14 * k).toFixed(0)} L${ax},${(ay + 14 * k).toFixed(0)}Z`, colD);
    t += F(`M${ax - 6 * k},${(ay - 16 * k).toFixed(0)} L${ax + aw * 0.5},${(ay - 54 * k).toFixed(0)} L${ax + aw + 6 * k},${(ay - 16 * k).toFixed(0)}Z`, col);
    t += F(`M${ax + aw * 0.42},${(ay - 42 * k).toFixed(0)} L${ax + aw * 0.62},${(ay - 30 * k).toFixed(0)} L${ax + aw * 0.5},${(ay - 16 * k).toFixed(0)}Z`, colD);
    return t;
  };

  const FAR = {
    // soft misty green ridges, layered haze
    bamboo: () => {
      const W = 2048, Hh = 420; let s = "";
      const r1 = ridge(W, Hh, 300, [[2, 0.6, 0.3], [5, 0.25, 1.1], [11, 0.12, 2]]);
      const r2 = ridge(W, Hh, 230, [[3, 0.55, 2.2], [7, 0.3, 0.4], [13, 0.1, 1]]);
      const r3 = ridge(W, Hh, 140, [[4, 0.5, 1.4], [9, 0.3, 2.6], [17, 0.12, 0.2]]);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#BBD0B6", 'opacity="0.85"');
      s += F(r2 + ` L${W},${Hh} L0,${Hh}Z`, "#A3BD9E", 'opacity="0.9"');
      s += L(r2, 2, INK, 'opacity="0.14"');
      s += F(r3 + ` L${W},${Hh} L0,${Hh}Z`, "#8CA888");
      s += L(r3, 2.4, INK, 'opacity="0.2"');
      // bamboo clumps standing in the last ridge
      for (let i = 0; i < 12; i++) s += farClump(80 + i * 166 + ((i * 37) % 31), 336 + ((i * 53) % 54), 0.9 + ((i * 17) % 25) / 100);
      s += `<rect x="0" y="292" width="${W}" height="128" fill="#E8F0E2" opacity="0.42"/>`;
      s += `<rect x="0" y="368" width="${W}" height="52" fill="#F2F7EC" opacity="0.3"/>`;
      return bgOut(W, Hh, wash([[0, "#DCEDE200"], [0.5, "#DCEDE259"], [1, "#CFE3D499"]], W, Hh, 0, 0, Hh) + s);
    },
    // steep dark canyon walls
    valley: () => {
      const W = 2048, Hh = 420; let s = "";
      const r1 = ridge(W, Hh, 360, [[2, 0.7, 0.5], [4, 0.22, 1.4], [9, 0.1, 2.6]], 10);
      const r2 = ridge(W, Hh, 280, [[3, 0.6, 2], [6, 0.28, 0.6], [12, 0.12, 1.8]], 10);
      const r3 = ridge(W, Hh, 180, [[5, 0.55, 1.1], [11, 0.3, 2.4], [19, 0.14, 0.3]], 10);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#4E5A66", 'opacity="0.9"');
      s += L(r1, 2, INK, 'opacity="0.16"');
      s += F(r2 + ` L${W},${Hh} L0,${Hh}Z`, "#3C4652");
      s += L(r2, 2, INK, 'opacity="0.2"');
      // sheer canyon walls: wide plateaus, kept clear of the tile edges
      [[60, 430, 74], [560, 360, 128], [1000, 400, 58], [1480, 380, 104], [1820, 210, 140]].forEach(([x, w0, top], i) => {
        s += plateau(x, w0, Hh, top, i % 2 ? "#333D49" : "#38434F", "#2A333D");
      });
      s += F(r3 + ` L${W},${Hh} L0,${Hh}Z`, "#2A333D");
      s += L(r3, 2.4, INK, 'opacity="0.22"');
      s += `<rect x="0" y="300" width="${W}" height="120" fill="#5A6672" opacity="0.22"/>`;
      return bgOut(W, Hh, wash([[0, "#3A465300"], [0.45, "#3A465366"], [1, "#2E3844B3"]], W, Hh, 0, 0, Hh) + s);
    },
    // ruined temple silhouettes on the skyline, with a big moon
    ruins: () => {
      const W = 2048, Hh = 420; let s = "";
      // the moon sits high, behind everything
      s += E(1520, 138, 136, 136, "#CFE6E8", 0, 'opacity="0.16"');
      s += E(1520, 138, 96, 96, "#EAF2F0", 0, 'opacity="0.95"');
      s += E(1488, 110, 17, 15, "#D2E0E0", 0, 'opacity="0.7"') + E(1552, 168, 12, 11, "#D2E0E0", 0, 'opacity="0.6"') + E(1546, 100, 7, 7, "#D2E0E0", 0, 'opacity="0.5"');
      const r1 = ridge(W, Hh, 240, [[2, 0.6, 0.3], [5, 0.25, 1.6], [11, 0.12, 2.4]], 12);
      const r2 = ridge(W, Hh, 170, [[3, 0.55, 2.2], [7, 0.3, 0.8], [13, 0.1, 1.4]], 12);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#3A4356");
      s += F(r2 + ` L${W},${Hh} L0,${Hh}Z`, "#2C3546");
      s += L(r2, 2.4, INK, 'opacity="0.2"');
      // ruined temples and a pagoda on the skyline
      [[150, 0.78, 0], [560, 1, 1], [980, 0.7, 0], [1420, 0.9, 0], [1830, 0.66, 1]].forEach(([x, k, tower]) => {
        const base = 396 + (x % 3) * 6;
        s += farTemple(x, base, k, "#26303F", "#1F2836");
        if (tower) {
          const tx = x + 168 * k;
          s += F(`M${tx},${base} L${tx + 6 * k},${base - 130 * k} L${tx + 34 * k},${base - 130 * k} L${tx + 40 * k},${base}Z`, "#26303F");
          s += F(`M${tx - 8 * k},${base - 126 * k} L${tx + 48 * k},${base - 126 * k} L${tx + 40 * k},${base - 148 * k} L${tx},${base - 148 * k}Z`, "#1F2836");
          s += F(`M${tx - 14 * k},${base - 152 * k} L${tx + 54 * k},${base - 152 * k} L${tx + 46 * k},${base - 176 * k} L${tx - 6 * k},${base - 176 * k}Z`, "#26303F");
          s += F(`M${tx + 8 * k},${base - 196 * k} L${tx + 32 * k},${base - 196 * k} L${tx + 32 * k},${base - 176 * k} L${tx + 8 * k},${base - 176 * k}Z`, "#1F2836");
          s += F(`M${tx - 4 * k},${base - 202 * k} L${tx + 44 * k},${base - 202 * k} L${tx + 36 * k},${base - 218 * k} L${tx + 4 * k},${base - 218 * k}Z`, "#26303F");
        }
      });
      s += `<rect x="0" y="330" width="${W}" height="90" fill="#3E4A5C" opacity="0.3"/>`;
      return bgOut(W, Hh, wash([[0, "#232C3E00"], [0.5, "#232C3E73"], [1, "#232C3EB3"]], W, Hh, 0, 0, Hh) + s);
    },
    // jagged black fortress towers against a night sky
    fortress: () => {
      const W = 2048, Hh = 420; let s = "";
      s += wash([[0, "#161A2600"], [0.45, "#161A2680"], [1, "#12161FC4"]], W, Hh, 0, 0, Hh);
      for (let i = 0; i < 70; i++) {
        const x = 26 + ((i * 283) % 2000), y = 8 + ((i * 137) % 250);
        s += E(x, y, 1 + (i % 3) * 0.4, 1 + (i % 3) * 0.4, "#DCE4F0", 0, `opacity="${(0.35 + (i % 5) * 0.12).toFixed(2)}"`)
          + E(x, y, 4, 4, "#BFD0E8", 0, 'opacity="0.08"');
      }
      const r1 = ridge(W, Hh, 220, [[3, 0.6, 0.4], [7, 0.3, 1.2], [15, 0.1, 2.4]], 12);
      s += F(r1 + ` L${W},${Hh} L0,${Hh}Z`, "#232838");
      s += E(1024, 330, 520, 130, "#3E5878", 0, 'opacity="0.16"');
      // towers of four different builds, so the repetition is not obvious
      const tower = (x, top, wide, kind) => {
        const w0 = wide ? 108 : 76, h0 = wide ? 34 : 20;
        let t = F(`M${x},420 L${x},${top + h0} L${x + 14},${top + h0} L${x + 14},${top} L${x + w0 - 14},${top} L${x + w0 - 14},${top + h0} L${x + w0},${top + h0} L${x + w0},420Z`, "#1B202C");
        if (kind === 1) t += F(`M${x},${top + h0} L${x + w0 / 2},${top - 46} L${x + w0},${top + h0}Z`, "#171B26");
        else if (kind === 2) t += F(`M${x - 10},${top + 6} L${x + w0 + 10},${top + 6} L${x + w0},${top} L${x},${top}Z`, "#171B26") +
          F(`M${x + w0 * 0.34},${top + 2} L${x + w0 * 0.5},${top - 40} L${x + w0 * 0.66},${top + 2}Z`, "#12161F");
        else t += F(`M${x + 16},${top} L${x + w0 / 2},${top - 62} L${x + w0 - 16},${top}Z`, "#171B26") +
          F(`M${x + w0 / 2 - 3},${top - 62} L${x + w0 / 2},${top - 92} L${x + w0 / 2 + 3},${top - 62}Z`, "#1B202C");
        for (let k = 0; k < 6; k++) {
          const yy = top + 42 + k * 50; if (yy > 396) break;
          t += F(`M${x + 14},${yy} L${x + 26},${yy} L${x + 26},${yy + 18} L${x + 14},${yy + 18}Z`, "#5FD8E0", 'opacity="0.45"');
          t += F(`M${x + w0 - 26},${yy + 20} L${x + w0 - 14},${yy + 20} L${x + w0 - 14},${yy + 38} L${x + w0 - 26},${yy + 38}Z`, "#5FD8E0", 'opacity="0.26"');
        }
        t += L(`M${x},${top + h0} L${x},420 M${x + w0},${top + h0} L${x + w0},420`, 2, INK, 'opacity="0.4"');
        return t;
      };
      s += tower(120, 150, true, 0) + tower(470, 108, false, 1) + tower(760, 176, true, 2) + tower(1130, 132, false, 3)
        + tower(1420, 164, true, 1) + tower(1790, 118, false, 2);
      const r2 = ridge(W, Hh, 130, [[5, 0.55, 1.6], [11, 0.3, 0.2], [21, 0.12, 2.8]], 12);
      s += F(r2 + ` L${W},${Hh} L0,${Hh}Z`, "#14171F");
      return bgOut(W, Hh, s);
    },
  };

  const CLOUDS = {
    // pale mist bands
    bamboo: () => {
      const W = 2048, Hh = 260; let s = "";
      [[120, 62, 220, 26], [520, 130, 280, 20], [980, 74, 240, 30], [1420, 148, 300, 22], [1820, 92, 200, 26]].forEach(([x, y, rx, ry], i) => {
        s += E(x, y, rx, ry, "#F4F8EF", 0, `opacity="${0.5 + (i % 2) * 0.2}"`);
        s += E(x + 60, y - 14, rx * 0.6, ry * 0.7, "#FAFCF6", 0, 'opacity="0.45"');
      });
      s += E(340, 200, 420, 30, "#E8F0E2", 0, 'opacity="0.4"') + E(1200, 214, 380, 26, "#E8F0E2", 0, 'opacity="0.35"');
      s += E(760, 180, 160, 16, "#F4F8EF", 0, 'opacity="0.4"');
      return bgOut(W, Hh, wash([[0, "#E8F0E200"], [0.55, "#E1EDDF59"], [1, "#D9E8D799"]], W, Hh, 0, 0, Hh) + s);
    },
    // dark low fog
    valley: () => {
      const W = 2048, Hh = 260; let s = "";
      s += E(400, 196, 460, 54, "#4E5A66", 0, 'opacity="0.55"') + E(1300, 210, 420, 46, "#46525E", 0, 'opacity="0.5"');
      s += E(880, 168, 300, 30, "#3E4A56", 0, 'opacity="0.45"') + E(1720, 178, 260, 26, "#3E4A56", 0, 'opacity="0.4"');
      [[180, 120, 240, 20], [700, 96, 210, 17], [1180, 132, 260, 22], [1660, 104, 190, 16]].forEach(([x, y, rx, ry]) => {
        s += E(x, y, rx, ry, "#5A6672", 0, 'opacity="0.3"');
      });
      s += E(240, 232, 340, 26, "#2F3944", 0, 'opacity="0.42"') + E(1500, 236, 300, 22, "#2F3944", 0, 'opacity="0.38"');
      return bgOut(W, Hh, wash([[0, "#2E384400"], [0.5, "#2E3844A6"], [1, "#2E3844D9"]], W, Hh, 0, 0, Hh) + s);
    },
    // thin night clouds around a moon halo
    ruins: () => {
      const W = 2048, Hh = 260; let s = "";
      s += E(1520, 74, 200, 74, "#BFD8E0", 0, 'opacity="0.1"') + E(1520, 74, 140, 52, "#CFE6E8", 0, 'opacity="0.12"');
      [[240, 96, 250, 15], [620, 62, 200, 11], [1010, 118, 230, 13], [1380, 56, 180, 10], [1760, 100, 240, 14], [1960, 138, 150, 9]].forEach(([x, y, rx, ry], i) => {
        s += E(x, y, rx, ry, "#C6D6E2", 0, `opacity="${(0.22 + (i % 3) * 0.1).toFixed(2)}"`);
        s += E(x + 40, y + 8, rx * 0.7, ry * 0.8, "#DCE8F0", 0, 'opacity="0.14"');
      });
      s += E(700, 190, 320, 22, "#AFC0D0", 0, 'opacity="0.16"') + E(1620, 200, 280, 18, "#AFC0D0", 0, 'opacity="0.14"');
      return bgOut(W, Hh, wash([[0, "#232C3E00"], [0.5, "#232C3E99"], [1, "#232C3ECC"]], W, Hh, 0, 0, Hh) + s);
    },
    // smoke and drifting embers
    fortress: () => {
      const W = 2048, Hh = 260; let s = "";
      const puff = (x, y, rx, ry, col, op) =>
        E(x, y, rx, ry, col, 0, `opacity="${op}"`) +
        E(x - rx * 0.5, y - ry * 0.45, rx * 0.5, ry * 0.72, col, 0, `opacity="${op}"`) +
        E(x + rx * 0.42, y - ry * 0.55, rx * 0.46, ry * 0.66, col, 0, `opacity="${op}"`) +
        E(x + rx * 0.16, y + ry * 0.5, rx * 0.6, ry * 0.6, col, 0, `opacity="${op}"`);
      [[200, 130, 130, 34], [640, 96, 150, 30], [1120, 148, 140, 36], [1580, 100, 132, 28], [1960, 156, 112, 26]].forEach(([x, y, rx, ry], i) => {
        s += puff(x, y, rx, ry, "#2A2E3A", (0.4 + (i % 3) * 0.08).toFixed(2));
        s += puff(x - 40, y - 26, rx * 0.6, ry * 0.8, "#363A48", "0.26");
      });
      for (let i = 0; i < 46; i++) {
        const x = 40 + ((i * 173) % 1970), y = 30 + ((i * 89) % 200), r = 1.4 + (i % 4) * 0.7;
        const col = i % 5 === 0 ? "#5FD8E0" : "#E08A46";
        s += E(x, y, r, r, col, 0, `opacity="${(0.3 + (i % 4) * 0.14).toFixed(2)}"`);
        s += E(x, y, r * 2.6, r * 2.6, col, 0, 'opacity="0.1"');
      }
      s += E(900, 226, 460, 34, "#1E222C", 0, 'opacity="0.45"') + E(1700, 236, 380, 28, "#1E222C", 0, 'opacity="0.4"');
      return bgOut(W, Hh, wash([[0, "#161A2600"], [0.5, "#161A26B3"], [1, "#12161FE6"]], W, Hh, 0, 0, Hh) + s);
    },
  };

  // the layer the player walks past
  // silhouettes used inside the mid layers
  const midShrine = (x, base, k, col, colD, colL) => {
    const q = (v) => (base + v * k).toFixed(1), hx = (v) => (x + v * k).toFixed(1);
    let t = "";
    t += F(`M${hx(-100)},${q(0)} L${hx(-92)},${q(-26)} L${hx(92)},${q(-26)} L${hx(100)},${q(0)}Z`, colD);
    t += F(`M${hx(-88)},${q(-24)} L${hx(-88)},${q(-128)} L${hx(-72)},${q(-128)} L${hx(-72)},${q(-24)}Z`, col);
    t += F(`M${hx(72)},${q(-24)} L${hx(72)},${q(-128)} L${hx(88)},${q(-128)} L${hx(88)},${q(-24)}Z`, col);
    t += F(`M${hx(-80)},${q(-124)} L${hx(80)},${q(-124)} L${hx(80)},${q(-28)} L${hx(-80)},${q(-28)}Z`, colD);
    t += F(`M${hx(-28)},${q(-106)} L${hx(28)},${q(-106)} L${hx(30)},${q(-28)} L${hx(-30)},${q(-28)}Z`, "#241F1D");
    t += F(`M${hx(-104)},${q(-152)} Q${hx(-60)},${q(-164)} ${hx(-46)},${q(-196)} L${hx(46)},${q(-196)} Q${hx(60)},${q(-164)} ${hx(104)},${q(-152)} Q${hx(0)},${q(-172)} ${hx(-104)},${q(-152)}Z`, col);
    t += F(`M${hx(-46)},${q(-194)} Q${hx(0)},${q(-238)} ${hx(46)},${q(-194)} Q${hx(0)},${q(-204)} ${hx(-46)},${q(-194)}Z`, col);
    t += L(`M${hx(-104)},${q(-152)} Q${hx(0)},${q(-172)} ${hx(104)},${q(-152)}`, 2.4, INK, 'opacity="0.4"');
    t += L(`M${hx(-46)},${q(-196)} L${hx(46)},${q(-196)}`, 2.2, INK, 'opacity="0.35"');
    t += L(`M${hx(-104)},${q(-152)} Q${hx(0)},${q(-172)} ${hx(104)},${q(-152)} M${hx(-46)},${q(-194)} Q${hx(0)},${q(-232)} ${hx(46)},${q(-194)}`, 1.6, INK, 'opacity="0.3"');
    t += L(`M${hx(-64)},${q(-146)} Q${hx(0)},${q(-116)} ${hx(64)},${q(-146)}`, 2, colL);
    t += F(`M${hx(-10)},${q(-130)} C${hx(-10)},${q(-142)} ${hx(10)},${q(-142)} ${hx(10)},${q(-130)} L${hx(12)},${q(-116)} L${hx(-12)},${q(-116)}Z`, "#E0A526", 'opacity="0.85"');
    return t;
  };
  // a suspension footbridge: towers, two sagging cables and a deck hung under them
  const midBridge = (x0, y0, kx, ky, col, colD) => {
    const hx = (v) => (x0 + v * kx).toFixed(1);
    const q = (v) => (y0 - v * ky).toFixed(1);   // positive v is up
    const sag = (t) => 12 * Math.sin(Math.PI * t);        // the deck drops by this
    const cab = (t) => 54 - 26 * Math.sin(Math.PI * t);   // the cable sits above the deck
    let t = "";
    // towers, standing in the rock on both sides
    t += F(`M${hx(-6)},${q(74)} L${hx(-6)},${q(-56)} L${hx(8)},${q(-56)} L${hx(8)},${q(74)}Z`, colD);
    t += F(`M${hx(132)},${q(74)} L${hx(132)},${q(-56)} L${hx(146)},${q(-56)} L${hx(146)},${q(74)}Z`, colD);
    t += F(`M${hx(-12)},${q(50)} L${hx(14)},${q(50)} L${hx(14)},${q(64)} L${hx(-12)},${q(64)}Z`, col);
    t += F(`M${hx(126)},${q(50)} L${hx(152)},${q(50)} L${hx(152)},${q(64)} L${hx(126)},${q(64)}Z`, col);
    // the deck, sagging, plus its plank ties
    let d = `M${hx(0)},${q(0)}`;
    for (let i = 1; i <= 16; i++) d += ` L${hx(i * 8.75)},${q(-sag(i / 16))}`;
    for (let i = 16; i >= 0; i--) d += ` L${hx(i * 8.75)},${q(-sag(i / 16) - 14)}`;
    d += "Z";
    t += F(d, col);
    t += L(d, 2, INK, 'opacity="0.34"');
    t += L(`M${hx(0)},${q(-2)} L${hx(140)},${q(-2)}`, 1.6, INK, 'opacity="0.2"');
    for (let i = 1; i < 16; i++) t += L(`M${hx(i * 8.75)},${q(-sag(i / 16))} L${hx(i * 8.75 + 2)},${q(-sag(i / 16) - 14)}`, 1.2, INK, 'opacity="0.24"');
    // cables, hanging above the deck, with their hangers
    [0, 1].forEach((side) => {
      const off = side ? 5 : -1;
      let c = `M${hx(-18)},${q(22)} L${hx(off)},${q(cab(0))}`;
      for (let i = 1; i <= 16; i++) c += ` L${hx(off + i * 8.75)},${q(cab(i / 16))}`;
      c += ` L${hx(158)},${q(20)}`;
      t += L(c, 2.6, "#C89A5A", 'opacity="0.7"');
      for (let i = 1; i < 16; i++) t += L(`M${hx(off + i * 8.75)},${q(cab(i / 16))} L${hx(off + i * 8.75)},${q(-sag(i / 16))}`, 1.2, "#C89A5A", 'opacity="0.5"');
    });
    return t;
  };

  const MID = {
    // dense bamboo groves, with a small shrine and a footbridge in the haze
    bamboo: () => {
      const W = 2048, Hh = 320; let s = "";
      // a hazier far grove, so the layer has depth
      for (let i = 0; i < 30; i++) {
        const x = 70 + i * 66 + ((i * 29) % 23), base = 320, top = 74 + ((i * 61) % 66);
        s += F(`M${x},${base} L${x + 7},${base} L${x + 6},${top} L${x + 1},${top}Z`, "#8CAE84", 'opacity="0.5"');
        s += leafFan(x + 3, top + 4, "#93B488", 0.62);
      }
      // four groves, evenly spaced so the tile seam lands in the same gap everywhere
      [170, 670, 1170, 1670].forEach((gx, gi) => {
        s += E(gx, 316, 150, 13, "#3F6A33", 0, 'opacity="0.4"');
        for (let i = 0; i < 8; i++) {
          const x = gx - 86 + i * 25, base = 320, top = 26 + ((i * 47 + gi * 23) % 62), lean = (i % 3 - 1) * 2.4;
          const c = i % 2 ? "#6E9A52" : "#5F8A48", cs = i % 2 ? "#557E3E" : "#4A7038";
          s += culm(x, top, base, c, cs, lean, 58 + (i % 3) * 12);
          s += leafFan(x + 5, top + 8, "#7FB065", 1.05);
          s += leafFan(x + 5, top + 44, "#6E9A52", 0.85);
          if (i % 3 === 0) s += leafFan(x + 5, top + 96, "#7FB065", 0.7);
        }
      });
      s += midShrine(400, 316, 0.62, "#4A5A42", "#3C4A36", "#C89A5A");
      s += midBridge(1360, 320, 1, "#59644E", "#454E3E");
      // grasses along the bottom
      for (let x = 20; x < W; x += 44) s += L(`M${x},320 Q${x + 4},296 ${x + (x % 3 ? 10 : -8)},280`, 2.4, "#4F7A3E");
      return bgOut(W, Hh, s);
    },
    // canyon walls, a hanging bridge and dead trees
    valley: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 120, [[4, 0.5, 1], [9, 0.3, 2.2], [17, 0.12, 0.4]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#3E4A54");
      s += L(r, 2.4, INK, 'opacity="0.28"');
      // two walls with a gorge between them, and the bridge across the gap
      s += plateau(20, 560, Hh, 96, "#333D47", "#2A333C");
      s += plateau(540, 340, Hh, 132, "#39434E", "#303943");
      s += plateau(1220, 340, Hh, 112, "#333D47", "#2A333C");
      s += plateau(1580, 440, Hh, 80, "#39434E", "#303943");
      s += midBridge(880, 132, 2.35, 1, "#333D47", "#262F38");
      // dead trees on the shoulders
      [[300, 1], [1420, -1], [1800, 1], [1990, -1]].forEach(([x, d]) => {
        const by = 320 + ((x * 7) % 10) - 10;
        s += L(`M${x},${by} C${x - 8 * d},${by - 54} ${x + 12 * d},${by - 84} ${x + 4 * d},${by - 118}`, 8, "#2A333B");
        s += L(`M${x},${by} C${x - 8 * d},${by - 54} ${x + 12 * d},${by - 84} ${x + 4 * d},${by - 118}`, 4, "#39434E");
        s += L(`M${x + 4 * d},${by - 110} C${x - 26 * d},${by - 128} ${x - 38 * d},${by - 146} ${x - 48 * d},${by - 170}`, 5, "#333D47");
        s += L(`M${x + 4 * d},${by - 104} C${x + 28 * d},${by - 122} ${x + 38 * d},${by - 142} ${x + 50 * d},${by - 164}`, 4.6, "#333D47");
        s += L(`M${x + 4 * d},${by - 116} C${x + 2 * d},${by - 136} ${x + 12 * d},${by - 148} ${x + 2 * d},${by - 168}`, 3.4, "#333D47");
        s += L(`M${x - 48 * d},${by - 170} C${x - 58 * d},${by - 182} ${x - 60 * d},${by - 192} ${x - 70 * d},${by - 200}`, 2.4, "#2F3941");
        s += L(`M${x + 50 * d},${by - 164} C${x + 58 * d},${by - 176} ${x + 62 * d},${by - 186} ${x + 72 * d},${by - 194}`, 2.2, "#2F3941");
      });
      // boulders and rubble along the bottom
      for (let i = 0; i < 14; i++) {
        const x = 30 + i * 148, y = 306 + ((i * 41) % 12);
        s += F(`M${x},${y} C${x + 10},${y - 24} ${x + 36},${y - 26} ${x + 46},${y - 4} C${x + 48},${y + 4} ${x + 6},${y + 8} ${x},${y}Z`, "#39434E", 'opacity="0.9"');
        s += F(`M${x + 26},${y - 22} C${x + 40},${y - 20} ${x + 52},${y - 8} ${x + 46},${y - 2} C${x + 36},${y + 2} ${x + 22},${y - 6} ${x + 26},${y - 22}Z`, "#2E3841", 'opacity="0.9"');
        s += L(`M${x},${y} C${x + 10},${y - 24} ${x + 36},${y - 26} ${x + 46},${y - 4}`, 1.8, INK, 'opacity="0.3"');
      }
      return bgOut(W, Hh, s);
    },
    // broken pillars, a moon gate and fallen statues
    ruins: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 90, [[4, 0.5, 1.6], [10, 0.3, 0.2], [21, 0.12, 2.6]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#38425A");
      s += L(r, 2.4, INK, 'opacity="0.24"');
      // the paved floor the player walks past
      s += F(`M0,276 L${W},276 L${W},${Hh} L0,${Hh}Z`, "#3E4860");
      s += L(`M0,276 L${W},276`, 2.4, INK, 'opacity="0.34"');
      for (let x = 0; x < W; x += 96) s += L(`M${x},276 L${x},${Hh}`, 1.6, INK, 'opacity="0.2"');
      for (let y = 296; y < Hh; y += 24) s += L(`M0,${y} L${W},${y}`, 1.6, INK, 'opacity="0.18"');
      // broken pillars
      [[120, 208, 1], [300, 148, 0], [1180, 186, 1], [1640, 132, 0], [1930, 176, 1]].forEach(([x, top, brk]) => {
        s += F(`M${x - 30},282 L${x - 26},${top} L${x + 26},${top} L${x + 30},282Z`, "#4E5A74");
        s += F(`M${x + 4},${top} L${x + 26},${top} L${x + 30},282 L${x + 4},282Z`, "#3E4860");
        s += L(`M${x - 30},282 L${x - 26},${top} L${x + 26},${top} L${x + 30},282`, 2.2, INK, 'opacity="0.34"');
        s += F(`M${x - 38},282 L${x + 38},282 L${x + 42},${Hh} L${x - 42},${Hh}Z`, "#44506A");
        s += L(`M${x - 38},282 L${x + 38},282`, 2, INK, 'opacity="0.3"');
        for (let k = 1; k < 3; k++) s += L(`M${x - 24},${top + k * 42} L${x + 24},${top + k * 42}`, 1.8, INK, 'opacity="0.22"');
        if (brk) s += F(`M${x - 26},${top} L${x - 20},${top - 20} L${x - 4},${top - 30} L${x + 12},${top - 22} L${x + 26},${top - 8} L${x + 26},${top}Z`, "#4E5A74") +
          L(`M${x - 26},${top} L${x - 20},${top - 20} L${x - 4},${top - 30} L${x + 12},${top - 22} L${x + 26},${top - 8}`, 2, INK, 'opacity="0.3"') +
          L(`M${x - 20},${top - 20} L${x - 14},${top + 4} M${x - 4},${top - 30} L${x},${top} M${x + 12},${top - 22} L${x + 16},${top + 4}`, 1.4, INK, 'opacity="0.22"');
      });
      // the moon gate
      const gx = 720;
      s += F(`M${gx - 96},${Hh} L${gx - 86},100 L${gx - 50},100 L${gx - 40},${Hh}Z`, "#4E5A74");
      s += F(`M${gx - 86},100 L${gx - 50},100 L${gx - 52},${Hh} L${gx - 88},${Hh}Z`, "#3E4860");
      s += F(`M${gx + 40},${Hh} L${gx + 50},100 L${gx + 86},100 L${gx + 96},${Hh}Z`, "#4E5A74");
      s += F(`M${gx + 50},100 L${gx + 86},100 L${gx + 84},${Hh} L${gx + 48},${Hh}Z`, "#3E4860");
      s += F(`M${gx - 120},108 L${gx + 120},108 L${gx + 120},136 L${gx - 120},136Z`, "#56628A");
      s += F(`M${gx - 134},100 Q${gx},68 ${gx + 134},100 Q${gx},84 ${gx - 134},100Z`, "#44506A");
      s += L(`M${gx - 134},100 Q${gx},68 ${gx + 134},100`, 2.6, INK, 'opacity="0.38"');
      s += F(`M${gx - 44},136 L${gx + 44},136 L${gx + 44},200 L${gx - 44},200Z`, "#333D52");
      s += L(`M${gx - 44},136 L${gx + 44},136 L${gx + 44},200 L${gx - 44},200Z`, 2, INK, 'opacity="0.32"');
      s += F(`M${gx + 2},146 Q${gx + 32},168 ${gx + 2},192 Q${gx + 18},168 ${gx + 2},146Z`, "#BFE0E6", 'opacity="0.85"');
      s += E(gx - 24, 158, 2.6, 2.6, "#BFE0E6", 0, 'opacity="0.6"') + E(gx - 16, 182, 1.8, 1.8, "#BFE0E6", 0, 'opacity="0.5"');
      // a toppled statue and a fallen column
      // a toppled statue: the plinth it fell off, then the body lying across the paving
      s += F(`M${gx + 268},${Hh} L${gx + 272},252 L${gx + 344},252 L${gx + 350},${Hh}Z`, "#4E5A74");
      s += F(`M${gx + 312},252 L${gx + 344},252 L${gx + 350},${Hh} L${gx + 312},${Hh}Z`, "#3E4860");
      s += L(`M${gx + 268},${Hh} L${gx + 272},252 L${gx + 344},252 L${gx + 350},${Hh}`, 2.2, INK, 'opacity="0.34"');
      s += F(`M${gx + 300},272 L${gx + 452},266 L${gx + 458},300 L${gx + 300},306Z`, "#4E5A74");
      s += F(`M${gx + 380},266 L${gx + 452},266 L${gx + 458},300 L${gx + 380},302Z`, "#44506A");
      s += L(`M${gx + 300},272 L${gx + 452},266 L${gx + 458},300 L${gx + 300},306`, 2.2, INK, 'opacity="0.34"');
      s += E(gx + 296, 288, 26, 26, "#4E5A74", 0) + L(`M${gx + 270},288 A26,26 0 0 1 ${gx + 322},288`, 2.2, INK, 'opacity="0.34"');
      s += L(`M${gx + 288},304 L${gx + 306},296 M${gx + 340},270 L${gx + 340},300 M${gx + 404},268 L${gx + 404},300`, 2, INK, 'opacity="0.24"');
      s += F(`M${gx + 452},258 L${gx + 494},296 L${gx + 470},300 L${gx + 442},268Z`, "#44506A");
      s += L(`M${gx + 452},258 L${gx + 494},296 L${gx + 470},300 L${gx + 442},268`, 2, INK, 'opacity="0.3"');
      s += F(`M${gx - 300},${Hh} L${gx - 262},${Hh - 30} L${gx - 160},${Hh - 22} L${gx - 164},${Hh}Z`, "#44506A");
      s += L(`M${gx - 300},${Hh} L${gx - 262},${Hh - 30} L${gx - 160},${Hh - 22}`, 2.2, INK, 'opacity="0.3"');
      s += E(gx - 156, 296, 16, 6, "#3E4860", 0, 'opacity="0.7"');
      // rubble
      for (let i = 0; i < 12; i++) { const x = 60 + i * 172, y = 306 + ((i * 37) % 10); s += F(`M${x},${y} C${x + 14},${y - 26} ${x + 52},${y - 28} ${x + 66},${y - 2} Z`, "#414C64", 'opacity="0.85"') + L(`M${x},${y} C${x + 14},${y - 26} ${x + 52},${y - 28} ${x + 66},${y - 2}`, 1.8, INK, 'opacity="0.26"'); }
      return bgOut(W, Hh, s);
    },
    // fortress walls, banners and braziers
    fortress: () => {
      const W = 2048, Hh = 320; let s = "";
      const r = ridge(W, 320, 80, [[6, 0.5, 0.9], [13, 0.3, 2.1], [27, 0.12, 0.3]], 12);
      s += F(r + ` L${W},${Hh} L0,${Hh}Z`, "#262B39");
      s += L(r, 2.4, INK, 'opacity="0.3"');
      // the wall run: crenellations on a 64 step so the tile meets itself
      let mer = "";
      for (let x = 0; x < W; x += 64) mer += `M${x},232 L${x},186 L${x + 40},186 L${x + 40},232 Z `;
      s += F(`M0,232 L${W},232 L${W},${Hh} L0,${Hh}Z`, "#2E3444");
      s += F(mer, "#394051") + L(mer, 2, INK, 'opacity="0.3"');
      s += F(`M0,232 L${W},232 L${W},246 L0,246Z`, "#454C5E");
      s += L(`M0,232 L${W},232 M0,246 L${W},246`, 2, INK, 'opacity="0.34"');
      for (let x = 0; x < W; x += 96) s += L(`M${x},248 L${x},${Hh}`, 1.6, INK, 'opacity="0.22"');
      for (let y = 272; y < Hh; y += 26) { s += L(`M0,${y} L${W},${y}`, 1.6, INK, 'opacity="0.2"'); for (let x = ((y - 272) / 26 % 2) * 60; x < W; x += 120) s += L(`M${x},${y - 26} L${x},${y}`, 1.6, INK, 'opacity="0.16"'); }
      // arrow slits along the wall
      for (let x = 32; x < W; x += 128) s += F(`M${x},250 L${x + 8},250 L${x + 8},276 L${x},276Z`, "#12141C", 'opacity="0.85"');
      // towers
      [[330, 60], [1330, 84]].forEach(([x, top]) => {
        s += F(`M${x},${Hh} L${x},${top + 20} L${x + 18},${top + 20} L${x + 18},${top} L${x + 52},${top} L${x + 52},${top + 20} L${x + 70},${top + 20} L${x + 70},${top} L${x + 104},${top} L${x + 104},${top + 20} L${x + 122},${top + 20} L${x + 122},${Hh}Z`, "#2A3040");
        s += F(`M${x + 96},${top + 20} L${x + 122},${top + 20} L${x + 122},${Hh} L${x + 96},${Hh}Z`, "#232838");
        s += F(`M${x},${top} L${x + 32},${top - 44} L${x + 122},${top - 44} L${x + 122},${top}Z`, "#1D222E");
        s += L(`M${x},${top} L${x + 32},${top - 44} L${x + 122},${top - 44}`, 2, INK, 'opacity="0.3"');
        for (let k = 0; k < 3; k++) s += F(`M${x + 20},${top + 46 + k * 62} L${x + 34},${top + 46 + k * 62} L${x + 34},${top + 68 + k * 62} L${x + 20},${top + 68 + k * 62}Z`, "#5FD8E0", 'opacity="0.4"');
        for (let k = 0; k < 3; k++) s += F(`M${x + 78},${top + 66 + k * 62} L${x + 92},${top + 66 + k * 62} L${x + 92},${top + 88 + k * 62} L${x + 78},${top + 88 + k * 62}Z`, "#5FD8E0", 'opacity="0.24"');
      });
      // banners on the wall
      [120, 700, 1180, 1760].forEach((x) => {
        s += F(`M${x},236 L${x + 44},236 L${x + 42},286 L${x + 32},296 L${x + 22},284 L${x + 12},298 L${x},288Z`, "#7A2A22", 'opacity="0.92"');
        s += L(`M${x},236 L${x + 44},236 L${x + 42},286 L${x + 32},296 L${x + 22},284 L${x + 12},298 L${x},288`, 2, INK, 'opacity="0.34"');
        s += F(`M${x + 14},250 L${x + 30},250 L${x + 30},274 L${x + 14},274Z`, "#E8E0C8", 'opacity="0.5"');
      });
      // braziers at the foot of the wall
      [240, 960, 1600].forEach((x) => {
        s += E(x, 278, 44, 52, "#5FD8E0", 0, 'opacity="0.16"');
        s += F(`M${x},292 C${x - 20},272 ${x - 14},252 ${x},232 C${x + 14},252 ${x + 20},272 ${x},292Z`, "#5FD8E0", 'opacity="0.95"');
        s += F(`M${x},286 C${x - 11},272 ${x - 7},260 ${x},246 C${x + 7},260 ${x + 11},272 ${x},286Z`, "#CFFAF0", 'opacity="0.9"');
        s += E(x, 246, 3, 4, "#FFFFFF", 0, 'opacity="0.8"');
        s += E(x - 12, 224, 2.4, 2.4, "#5FD8E0", 0, 'opacity="0.7"') + E(x + 10, 212, 2, 2, "#5FD8E0", 0, 'opacity="0.55"');
        s += F(`M${x - 22},292 L${x + 22},292 L${x + 16},312 L${x - 16},312Z`, "#333840");
        s += F(`M${x - 26},288 L${x + 26},288 L${x + 22},298 L${x - 22},298Z`, "#454C5E");
        s += L(`M${x - 22},292 L${x + 22},292`, 2, INK, 'opacity="0.4"');
        s += F(`M${x - 20},310 L${x - 12},310 L${x - 14},${Hh} L${x - 22},${Hh}Z M${x + 12},310 L${x + 20},310 L${x + 22},${Hh} L${x + 14},${Hh}Z`, "#2A2F3A");
      });
      return bgOut(W, Hh, s);
    },
  };

  // the ground band: same construction as art.js, so the ground line lands in the same place
  const GROUND = {
    // dirt path with fallen leaves and bamboo shoots
    bamboo: () => {
      const W = 512, Hh = 200; let s = "";
      const dirt = "#8A7A5E", dirtS = "#6F6249";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, dirt);
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, dirtS);
      for (let i = 0; i < 22; i++) { const x = (i * 97) % W, y = 40 + ((i * 53) % 140); s += E(x, y, 5 + (i % 4) * 2, 3 + (i % 3), "#A6957A", 1.2); }
      // wheel-rut path
      s += F(`M0,26 L${W},26 L${W},54 L0,58Z`, "#9C8B6C", 'opacity="0.7"');
      s += E(140, 42, 30, 5, "#7C6C50", 0, 'opacity="0.5"') + E(390, 46, 26, 4, "#7C6C50", 0, 'opacity="0.45"');
      // fallen leaves
      for (let i = 0; i < 26; i++) {
        const x = (i * 71 + 13) % W, y = 20 + ((i * 43) % 90), a = -30 + (i % 7) * 11;
        s += G(`rotate(${a},${x},${y})`, E(x, y, 6 + (i % 3), 3 + (i % 2), i % 3 === 0 ? "#C9A44E" : i % 3 === 1 ? "#9C8B3E" : "#7E7A34", 1.2));
      }
      // bamboo shoots
      [[64, 36], [228, 60], [406, 32]].forEach(([x, y]) => {
        s += P(`M${x},${y + 24} L${x + 9},${y - 4} L${x + 18},${y + 24}Z`, "#7FA45E", 2);
        s += L(`M${x + 9},${y + 2} L${x + 9},${y + 22}`, 1.4, "#557E3E");
        s += L(`M${x + 9},${y - 4} C${x + 24},${y - 12} ${x + 34},${y - 6} ${x + 40},${y}`, 2, "#6E9A52");
        s += L(`M${x + 9},${y - 4} C${x - 6},${y - 14} ${x - 16},${y - 8} ${x - 22},${y - 2}`, 2, "#6E9A52");
      });
      // top band of leaf litter and grass
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#7E9A5C");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 8; x < W; x += 32) s += L(`M${x},1 L${x - 3},-9 M${x + 5},1 L${x + 7},-7`, 2, "#4F7A3A");
      for (let x = 32; x < W; x += 64) s += L(`M${x},2 Q${x + 6},-12 ${x + 16},-16`, 2, "#9CC97A");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    // dark rock ground with cracks
    valley: () => {
      const W = 512, Hh = 200; let s = "";
      const dirt = "#6B6257", dirtS = "#565049";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, dirt);
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, dirtS);
      for (let i = 0; i < 20; i++) { const x = (i * 89) % W, y = 36 + ((i * 61) % 150); s += E(x, y, 6 + (i % 4) * 2, 3 + (i % 3), "#7E7568", 1.2); }
      // laid slabs
      for (let i = 0; i < 8; i++) { const x = i * 64, y = 22 + ((i * 29) % 22); s += P(`M${x + 4},${y} L${x + 62},${y - 3} L${x + 60},${y + 12} L${x + 6},${y + 15}Z`, "#736A5E", 1.6); }
      // cracks
      s += L("M22,20 L40,52 L28,86 L54,124 L46,166", 2.2, "#3E3A33") + L("M28,86 L60,92 L84,80", 1.8, "#3E3A33");
      s += L("M150,18 L168,44 L156,70 L186,104 L176,148 L200,186", 2.4, "#3E3A33") + L("M186,104 L216,96 L244,110", 1.8, "#3E3A33");
      s += L("M300,16 L318,58 L302,96 L338,140 L330,182", 2.2, "#3E3A33") + L("M302,96 L272,88 L254,96", 1.6, "#3E3A33");
      s += L("M420,22 L438,62 L424,102 L456,146 L448,190", 2.2, "#3E3A33") + L("M424,102 L394,112", 1.6, "#3E3A33");
      // scattered stones
      [[92, 132], [268, 60], [368, 168], [476, 76]].forEach(([x, y], i) => {
        s += part(`M${x},${y + 10} C${x - 12},${y} ${x - 6},${y - 12} ${x + 6},${y - 10} C${x + 18},${y - 8} ${x + 20},${y + 6} ${x + 8},${y + 12}Z`, "#7E7568", "", "", 1.8);
      });
      // top band: hard packed rock with dead grass
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#5E5A50");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 8; x < W; x += 32) s += L(`M${x},1 L${x - 4},-8 M${x + 6},1 L${x + 8},-6`, 1.8, "#6E7A52");
      for (let x = 32; x < W; x += 64) s += L(`M${x},2 Q${x + 10},-10 ${x + 20},-14`, 1.8, "#7A8458");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    // mossy stone flagstones with grass in the joints
    ruins: () => {
      const W = 512, Hh = 200; let s = "";
      const dirt = "#7D7F74", dirtS = "#65675E";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, dirt);
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, dirtS);
      // flagstones, two courses with staggered joints
      [16, 64, 116, 164].forEach((y, r) => {
        for (let x = -(r % 2) * 32; x < W; x += 64) {
          s += P(`M${x + 3},${y} L${x + 60},${y - 2} L${x + 58},${y + 40} L${x + 5},${y + 42}Z`, r % 2 ? "#82847A" : "#8C8E82", 1.6);
        }
      });
      // grass in the joints and moss patches
      for (let x = 6; x < W; x += 32) s += L(`M${x},${20 + ((x * 7) % 8)} L${x + 3},${10 + ((x * 7) % 8)} M${x + 8},${22 + ((x * 5) % 8)} L${x + 12},${12 + ((x * 5) % 8)}`, 1.6, "#5E7A45");
      s += E(70, 118, 26, 9, "#6E8A5E", 0, 'opacity="0.7"') + E(300, 150, 34, 11, "#6E8A5E", 0, 'opacity="0.6"') + E(440, 62, 22, 8, "#7FA45E", 0, 'opacity="0.55"');
      s += E(180, 46, 18, 7, "#7FA45E", 0, 'opacity="0.5"');
      // chips and cracks
      s += L("M120,64 L150,80 L142,116", 1.8, "#55574E") + L("M330,116 L362,132 L356,168", 1.8, "#55574E") + L("M40,164 L74,178", 1.6, "#55574E");
      s += E(240, 96, 5, 3, "#6E7066", 1.2) + E(420, 176, 4, 2.6, "#6E7066", 1.2);
      // top band: moss
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#6E8A5E");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 8; x < W; x += 32) s += L(`M${x},1 L${x - 3},-9 M${x + 5},1 L${x + 7},-7`, 2, "#4F8A41");
      for (let x = 32; x < W; x += 64) s += L(`M${x},2 Q${x + 7},-11 ${x + 18},-15`, 1.8, "#8FB07A");
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
    // black flagstones with blue embers
    fortress: () => {
      const W = 512, Hh = 200; let s = "";
      const dirt = "#4A4A52", dirtS = "#3A3A42";
      s += F(`M0,14 L${W},14 L${W},${Hh} L0,${Hh}Z`, dirt);
      s += F(`M0,80 L${W},80 L${W},${Hh} L0,${Hh}Z`, dirtS);
      [16, 64, 116, 164].forEach((y, r) => {
        for (let x = -(r % 2) * 32; x < W; x += 64) {
          s += P(`M${x + 3},${y} L${x + 60},${y - 2} L${x + 58},${y + 40} L${x + 5},${y + 42}Z`, r % 2 ? "#4E4E58" : "#565660", 1.6);
        }
      });
      for (let i = 0; i < 14; i++) { const x = (i * 113) % W, y = 40 + ((i * 71) % 140); s += E(x, y, 5 + (i % 3) * 2, 2.6 + (i % 2), "#5E5E68", 1.2); }
      s += L("M90,60 L118,84 L110,124", 1.8, "#2E2E36") + L("M300,110 L334,126 L328,164", 1.8, "#2E2E36");
      // blue embers glowing in the joints
      [[52, 72], [180, 128], [268, 52], [360, 166], [452, 96], [110, 176], [410, 30]].forEach(([x, y], i) => {
        s += E(x, y, 12 + (i % 3) * 3, 7 + (i % 2) * 2, "#5FD8E0", 0, 'opacity="0.14"');
        s += E(x, y, 4.4 + (i % 3), 2.6 + (i % 2), "#5FD8E0", 0, 'opacity="0.85"');
        s += E(x, y, 1.8, 1.2, "#CFFAF0", 0, 'opacity="0.9"');
        if (i % 3 === 0) s += E(x + 6, y + 22, 2.4, 1.6, "#5FD8E0", 0, 'opacity="0.5"');
      });
      // top band
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, "#3E4048");
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 12; x < W; x += 32) s += L(`M${x},1 L${x + 4},-7 M${x + 10},1 L${x + 8},-5`, 1.4, "#2E323C");
      for (let x = 64; x < W; x += 128) s += E(x, 4, 3, 2, "#5FD8E0", 0, 'opacity="0.6"');
      return bgOut(W, Hh + 12, G("translate(0,10)", s));
    },
  };

  // ================= install =================
  Object.assign(window.ART.PROPS, PROPS);
  // the solid dirt block under the band, per theme
  window.ART.DIRT = { bamboo: 0x8a7a5e, valley: 0x6b6257, ruins: 0x7d7f74, fortress: 0x4a4a52 };

  (function () {
    const bg = window.ART.BG;
    const farOld = bg.far, cloudsOld = bg.clouds, midOld = bg.mid, groundOld = bg.ground;
    bg.far = (theme) => (FAR[theme] ? FAR[theme]() : farOld(theme));
    bg.clouds = (theme) => (CLOUDS[theme] ? CLOUDS[theme]() : cloudsOld(theme));
    bg.mid = (theme) => (MID[theme] ? MID[theme]() : midOld(theme));
    bg.ground = (theme) => (GROUND[theme] ? GROUND[theme]() : groundOld(theme));
  })();
})();
