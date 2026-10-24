// Word Ninja: icons for the Lv.30-50 chapter, in the same 64x64 pen as art_icons.js.
// Every icon here is appended to window.ART.I before the textures are built.
(function () {
  const { P, L, F, E, part, G, INK } = window.ART.H;
  const add = (obj) => Object.assign(window.ART.I, obj);

  const STEEL = "#E6E4DE", STEEL_S = "#B9B6AE", STEEL_D = "#8E8B84";
  const JADE = "#6FBF94", JADE_S = "#3E8C6E", JADE_D = "#2A6650", JADE_L = "#CFEDDB";
  const GOLD = "#E0A526", GOLD_S = "#B8841A", GOLD_L = "#F2D479";
  const VERM = "#D2462E", VERM_S = "#9E2F1E";
  const IND = "#2E3A5C", IND_S = "#232C47";
  const DARK = "#3B3330";
  const VOID = "#2C2634", VOID_S = "#171122";
  const FLAME = "#5FD0E8", FLAME_S = "#2E8FB5", FLAME_L = "#C8F4FC";
  const MOON = "#CFE6EE", MOON_S = "#8FB6C6";
  const CLOUD = "#BFE0E6", CLOUD_S = "#8FB6C6", CLOUD_L = "#EAF6F8";
  const MECH = "#6E7480", MECH_S = "#4C525E", MECH_L = "#9AA1AE";
  const BARK2 = "#6B5A48", BARK2_S = "#4E4034", MOSS2 = "#8FB07A";
  const IRON2 = "#4A4F58", IRON2_S = "#333840";
  const PURP2 = "#7C4A9E", PURP2_S = "#54306E";
  const KC = "#D2462E", AC = "#3E8C6E", LC = "#E0A526";

  const rot = (a, x, y) => `rotate(${a},${x},${y})`;
  const spark = (x, y, r, col) =>
    P(`M${x},${y - r} L${x + r * 0.3},${y - r * 0.3} L${x + r},${y} L${x + r * 0.3},${y + r * 0.3} L${x},${y + r} L${x - r * 0.3},${y + r * 0.3} L${x - r},${y} L${x - r * 0.3},${y - r * 0.3}Z`, col, 1.4);
  const star = (x, y, r, col, sw) => L(`M${x},${y - r} L${x},${y + r} M${x - r},${y} L${x + r},${y}`, sw || 2.2, col);
  const rays = (cx, cy, r0, r1_, col, n, sw) => {
    let s = "";
    for (let i = 0; i < (n || 12); i++) { const a = (i / (n || 12)) * Math.PI * 2; s += L(`M${cx + Math.cos(a) * r0},${cy + Math.sin(a) * r0} L${cx + Math.cos(a) * r1_},${cy + Math.sin(a) * r1_}`, sw || 2, col, 'opacity="0.8"'); }
    return s;
  };
  const glow = (x, y, rx, ry, col, op) => E(x, y, rx, ry, col, 0, `opacity="${op}"`);
  const ring = (c) =>
    E(32, 32, 29.6, 29.6, "#241D22", 0) + E(30, 27, 25, 21, "#3A3138", 0, 'opacity="0.55"') +
    E(32, 32, 29.6, 29.6, "none", 2.4, `stroke="${c}"`) + E(32, 32, 26, 26, "none", 1.2, `stroke="${c}" opacity="0.35"`);

  // ---------------- weapons: tiers 6-9 ----------------
  // palette per tier, so each rung reads differently at a glance
  const TP = {
    6: { blade: "#F3E0C0", edge: "#D9BE8E", metal: STEEL, rich: GOLD_L, gem: CLOUD, gemD: CLOUD_S },
    7: { blade: "#EAF4FF", edge: "#AEC6E0", metal: STEEL, rich: "#AEC6E0", gem: FLAME, gemD: FLAME_S },
    8: { blade: "#EDE6FF", edge: "#B9A6E0", metal: "#D8D2E8", rich: GOLD, gem: PURP2, gemD: PURP2_S },
    9: { blade: "#FFF6D8", edge: "#E6C97A", metal: "#F2E6C0", rich: GOLD, gem: GOLD_L, gemD: GOLD_S },
  };
  const kiemIcon = (t) => { const p = TP[t];
    return G(rot(45, 32, 32),
      glow(32, 24, 13, 20, p.gem, 0.22) +
      part("M28.7,4 Q32,0 35.3,4 L36,43 L28,43Z", p.blade, "M32,0 L38.5,0 L38.5,45 L32,45Z", p.edge, 2.6) +
      L("M32,7 L32,40", 2, p.gem) + L("M29.6,14 L34.4,17 M29.6,24 L34.4,27 M29.6,34 L34.4,37", 1.2, p.rich) +
      P("M21,42 L43,42 L46,45.5 L43,49 L21,49 L18,45.5Z", p.rich, 2.4) +
      part("M29.2,49 L34.8,49 L34.8,61 L29.2,61Z", VOID, "M32.6,48 L36.4,48 L36.4,62 L32.6,62Z", VOID_S, 2.4) +
      L("M29.6,52 L34.4,54.4 M29.6,56.5 L34.4,58.9", 1.2, p.gem) +
      P("M37,50 L49,50 L49,62 L43,58 L37,62Z", VERM, 2.2)) + spark(52, 14, 4, p.rich) + spark(14, 44, 3.4, p.rich);
  };
  const tantoIcon = (t, x) => { const p = TP[t];
    let s = glow(x, 22, 8, 19, p.gem, 0.24) +
      part(`M${x},4 Q${x + 3.2},11 ${x + 3.2},15 L${x + 3.4},42 L${x - 3.4},42 L${x - 3.2},15 Q${x - 3.2},11 ${x},4Z`, p.blade,
        `M${x},3 L${x + 4.8},13 L${x + 4.8},43 L${x},43Z`, p.edge, 2.4) +
      L(`M${x},9 L${x},38`, 1.8, p.gem) + L(`M${x - 1.6},16 L${x + 1.6},19 M${x - 1.6},26 L${x + 1.6},29`, 1.1, p.rich);
    s += P(`M${x - 5.6},41 L${x + 5.6},41 L${x + 6.6},43.5 L${x + 5.6},46 L${x - 5.6},46 L${x - 6.6},43.5Z`, p.rich, 2.2);
    s += part(`M${x - 2.6},46 L${x + 2.6},46 L${x + 2.6},58 L${x - 2.6},58Z`, VOID, `M${x + 0.6},45 L${x + 4.4},45 L${x + 4.4},59 L${x + 0.6},59Z`, VOID_S, 2.2);
    s += L(`M${x - 2.6},49 L${x + 2.6},51.4 M${x - 2.6},53.5 L${x + 2.6},55.9`, 1.2, p.gem);
    return s;
  };
  const anhIcon = (t) => G(rot(30, 24, 30), tantoIcon(t, 24)) + G(rot(-30, 40, 30), tantoIcon(t, 40)) +
    spark(52, 44, 3.4, TP[t].rich) + spark(12, 44, 3.4, TP[t].rich);
  const linhIcon = (t) => { const p = TP[t];
    let s = part("M28.6,26 L35.4,26 L34.6,62 L29.4,62Z", DARK, "M32.4,24 L36.8,24 L36.8,63 L32.4,63Z", "#241F1D", 2.6) +
      L("M29,36 L35,38 M29,44 L35,46 M29,52 L35,54", 1.5, p.gem);
    s += glow(32, 16, 13, 13, p.gem, 0.28) + E(32, 16, 10, 10, p.gemD, 2.6);
    s += E(32, 16, 6.4, 6.4, p.gem, 2.2) + E(30.4, 14.2, 2.2, 2.2, "#fff", 0);
    s += L("M20,16 C18,4 46,4 44,16", 2.2, p.rich) + E(20, 16, 3.2, 3.2, p.rich, 2) + E(44, 16, 3.2, 3.2, p.rich, 2);
    s += E(32, 28, 2.6, 2.6, p.gem, 1.8);
    return s;
  };
  const WEAPONS = {};
  for (let t = 6; t <= 9; t++) {
    WEAPONS["wkiem" + t] = () => kiemIcon(t);
    WEAPONS["wanh" + t] = () => anhIcon(t);
    WEAPONS["wlinh" + t] = () => linhIcon(t);
  }

  // ---------------- equipment: one shape per slot, recoloured per item ----------------
  const gear = {
    armor: (m, s, a) => part("M16,12 L26,7 Q32,14 38,7 L48,12 L58,26 L48,34 L46,58 L18,58 L16,34 L6,26Z", m, "M36,6 L62,6 L62,60 L36,60Z", s, 2.6) +
      L("M18,26 L46,26 M18,36 L46,36 M18,46 L46,46", 1.6, a) + E(32, 18, 4, 4, a, 1.6),
    boots: (m, s, a) => part("M18,8 L34,8 L34,36 L52,40 Q58,46 54,52 L18,52Z", m, "M28,4 L60,4 L60,56 L28,56Z", s, 2.6) +
      L("M16,52 L56,52 L56,58 L16,58Z", 1.4, a) + L("M22,16 L30,22 M22,28 L30,34", 1.6, a),
    necklace: (m, s, a) => L("M14,8 Q12,30 32,36 Q52,30 50,8", 2.2, s) +
      part("M32,34 C44,36 46,52 32,60 C18,52 20,36 32,34Z", m, "M34,30 L50,30 L50,62 L34,62Z", s, 2.6) +
      L("M32,40 L32,54 M32,46 L38,42 M32,50 L26,46", 1.4, a) + E(32, 30, 2.2, 2.2, a, 1.4),
    mask: (m, s, a) => part("M10,10 L24,22 Q32,20 40,22 L54,10 L54,34 Q48,52 32,58 Q16,52 10,34Z", m, "M36,6 L60,6 L60,60 L36,60Z", s, 2.6) +
      P("M16,32 Q22,26 28,32 Q22,34 16,32Z M36,32 Q42,26 48,32 Q42,34 36,32Z", a, 2) + L("M14,16 L20,24 M50,16 L44,24", 2, a) + E(32, 46, 3, 2.4, INK, 0),
    ring: (m, s, a) => E(32, 40, 18, 14, "none", 7, `stroke="${s}"`) + E(32, 40, 18, 14, "none", 1.6) +
      part("M26,14 L38,14 L43,24 L32,31 L21,24Z", m, "", "", 2.4) + E(32, 24, 5, 5, a, 2.2) + E(32, 24, 2, 2, "#fff", 0),
    gloves: (m, s, a) => part("M12,26 C12,14 30,12 32,22 L34,48 L14,50Z", m, "M24,10 L40,10 L40,54 L24,54Z", s, 2.6) +
      part("M34,24 C34,14 52,12 52,22 L54,48 L36,48Z", m, "M46,10 L58,10 L58,54 L46,54Z", s, 2.6) +
      P("M12,46 L34,44 L35,54 L12,56Z", a, 2.2) + P("M35,46 L54,44 L55,54 L35,56Z", a, 2.2) + L("M16,28 L30,26 M38,26 L52,28", 1.4, a),
    jade: (m, s, a) => L("M16,6 Q15,26 32,30 Q49,26 48,6", 2.2, s) +
      part("M22,28 Q32,23 42,28 L42,53 Q32,59 22,53Z", m, "M34,22 L50,22 L50,58 L34,58Z", s, 2.6) +
      L("M25,40 Q29,36 32,39 Q35,36 39,40", 1.6, a) + E(32, 30, 2.2, 2.2, a, 1.4) + L("M28,56 L24,63 M36,56 L40,63", 1.8, s),
    hat: (m, s, a) => part("M10,38 C8,14 22,6 32,6 C44,6 56,14 54,38 C54,52 44,58 32,58 C20,58 10,52 10,38Z", m, "M38,0 L64,0 L64,60 L38,60Z", s) +
      P("M8,28 L56,24 L56,31 L8,35Z", a, 2.2) + E(32, 14, 3, 4, a, 1.6),
    belt: (m, s, a) => G(rot(-38, 32, 32),
      L("M8,32 L56,32", 12, m) + L("M8,32 L56,32", 2, INK) + P("M24,24 L40,24 L42,40 L22,40Z", a, 2.6) + E(32, 32, 5, 5, "#fff", 0, 'opacity="0.6"') + E(32, 32, 2.6, 2.6, m, 0)),
  };

  // ---------------- materials ----------------
  const MATS2 = {
    mat_cloud: () => glow(32, 32, 22, 22, CLOUD, 0.3) +
      part("M32,4 L46,20 L38,58 L24,52 L18,20Z", CLOUD, "M36,2 L52,2 L52,60 L36,60Z", CLOUD_S, 2.6) +
      L("M32,4 L32,56 M32,24 L18,20 M32,24 L46,20 M32,44 L38,58", 1.4, CLOUD_L) + spark(50, 14, 3.4, CLOUD_L) + spark(16, 46, 3, CLOUD_L),
    mat_mech: () => E(32, 32, 22, 22, "none", 6, `stroke="${MECH_S}"`) + E(32, 32, 22, 22, "none", 1.6) +
      E(32, 32, 12, 12, MECH, 3) + E(32, 32, 6, 6, IRON2_S, 2.4) + E(32, 32, 2.6, 2.6, MECH_L, 0) +
      [0, 60, 120, 180, 240, 300].map((a) => G(rot(a, 32, 32), P("M30,10 L34,10 L34,16 L30,16Z", MECH_L, 1.6))).join(""),
    mat_seed: () => glow(32, 34, 18, 18, MOSS2, 0.28) +
      part("M32,6 C46,12 50,30 40,50 C36,58 28,58 24,50 C14,30 18,12 32,6Z", "#B8D48C", "M34,4 L50,4 L50,58 L34,58Z", "#7E9A5C", 2.6) +
      L("M32,12 C30,26 30,40 32,52", 1.8, "#5E8A46") + L("M32,24 L24,18 M32,34 L40,28 M32,44 L24,40", 1.4, "#5E8A46") + E(32, 52, 3, 3, "#5E8A46", 1.6),
    mat_thunder: () => glow(32, 30, 20, 22, GOLD, 0.3) +
      part("M30,4 L44,24 L36,58 L22,54 L16,24Z", GOLD_S, "M34,2 L50,2 L50,60 L34,60Z", "#8A5A12", 2.6) +
      P("M30,10 L38,26 L31,26 L38,44 L26,30 L33,30Z", GOLD_L, 1.8) + spark(48, 14, 3.4, GOLD_L) + spark(16, 44, 3, GOLD_L),
    mat_seal: () => glow(32, 32, 22, 22, FLAME, 0.22) +
      part("M14,10 L50,10 L50,54 L14,54Z", "#F0E2C0", "M34,6 L54,6 L54,58 L34,58Z", "#CDBB92", 2.6) +
      L("M20,16 L44,16 M20,24 L44,24", 1.6, "#8A7A5E") +
      G("rotate(-8,32,38)", P("M22,28 L42,28 L42,50 L22,50Z", VERM, 2.6) + L("M26,33 L38,33 M32,33 L32,45 M26,40 L38,40 M27,45 L37,45", 2.4, "#F3E6C8")),
  };

  // ---------------- skills: class motif + rank pips ----------------
  const pips = (n, col) => { let s = ""; for (let i = 0; i < n; i++) s += E(16 + i * 8, 56, 3, 3, col, 1.6); return s; };
  const SKILLS2 = {
    // Kiếm Ảnh
    sk_k33: () => ring(KC) + glow(32, 28, 14, 18, KC, 0.2) + P("M32,6 L36,18 L33,44 L31,44 L28,18Z", STEEL, 2.4) + L("M32,10 L32,40", 1.6, KC) + L("M20,52 Q32,44 44,52", 3, GOLD_L) + pips(2, KC),
    sk_k35: () => ring(KC) + glow(30, 30, 18, 16, GOLD, 0.18) + P("M8,50 C18,18 40,8 58,14 C38,18 22,32 12,54Z", STEEL, 2.6) + L("M14,46 C24,26 40,18 52,18", 1.6, "#FFFFFFAA") + P("M8,50 C18,30 32,20 46,18", 1.6, KC) + spark(50, 12, 3.6, KC) + pips(2, KC),
    sk_k38: () => ring(KC) + part("M32,8 C48,13 53,19 53,31 C53,45 44,53 32,59 C20,53 11,45 11,31 C11,19 16,13 32,8Z", "#93A4C8", "M36,6 L56,6 L56,60 L36,60Z", "#7486AC", 2.6) + L("M32,14 L32,52 M20,32 L44,32", 2.2, "#47557A") + E(32, 32, 8, 8, "none", 1.8, 'stroke="#47557A"') + spark(46, 16, 3, GOLD_L) + pips(2, KC),
    sk_k40: () => ring(KC) + rays(32, 30, 12, 20, GOLD, 10, 1.8) + P("M32,6 L36,16 L33,46 L31,46 L28,16Z", "#FDF6E2", 2.4) + L("M32,12 Q40,28 32,44", 2, GOLD) + pips(2, KC),
    sk_k45: () => { let s = ring(KC); for (let i = 0; i < 4; i++) s += P(`M${12 + i * 11},52 L${20 + i * 11},14 L${26 + i * 11},14 L${18 + i * 11},52Z`, i % 2 ? "#CFCBC2" : STEEL, 1.8); s += L("M10,54 L54,14", 2.2, KC) + spark(52, 12, 3.6, GOLD_L) + pips(2, KC); return s; },
    sk_k50: () => { let s = ring(KC); s += rays(32, 30, 18, 27, KC, 12, 2); s += P("M8,52 L30,10 L36,18 L14,56Z", STEEL, 2.6) + L("M14,46 L32,18", 2, "#FFFFFFBB") + P("M30,10 L36,18 L34,8Z", GOLD_L, 2); s += star(52, 12, 8, GOLD_L, 2.4); return s; },
    // Ảnh Hành
    sk_a33: () => { let s = ring(AC); s += L("M12,20 L40,14 M8,34 L36,30 M14,48 L38,46", 3, AC) + L("M12,20 L40,14 M8,34 L36,30 M14,48 L38,46", 1, "#BFE0E6"); s += E(44, 30, 8, 8, JADE, 2.4) + star(44, 30, 12, JADE_L, 1.6); return s; },
    sk_a35: () => ring(AC) + G("translate(20,32) rotate(-6)", E(0, -11, 4.6, 4.6, "#2A6650", 2)) + G("translate(44,30) rotate(8)", E(0, -11, 4.6, 4.6, "#BFE0E6", 2.2)) + L("M10,16 Q4,32 12,48", 2.4, AC) + L("M46,10 Q54,20 52,32", 2, AC) + pips(2, AC),
    sk_a38: () => { let s = ring(AC); s += P("M10,46 L24,14 L30,20 L16,52Z", STEEL, 2.2) + P("M54,46 L40,14 L34,20 L48,52Z", "#CFCBC2", 2.2); s += E(46, 22, 4, 4, VERM, 2) + E(18, 22, 4, 4, VERM, 2) + spark(52, 14, 3.2, GOLD_L); return s; },
    sk_a40: () => ring(AC) + L("M12,50 Q18,20 40,14", 2.6, AC) + L("M6,44 L14,40 M8,54 L16,50", 2.4, AC) + E(42, 32, 8, 8, "#BFE0E6", 2.4) + star(50, 16, 4, GOLD_L) + pips(2, AC),
    sk_a45: () => { let s = ring(AC); for (let i = 0; i < 5; i++) s += G(rot(-42 + i * 21, 32, 56), P("M32,52 L34,38 L32,22 L30,38Z", i % 2 ? STEEL : "#CFCBC2", 2)); s += E(32, 54, 9, 4, "#2A6650", 2.2) + pips(2, AC); return s; },
    sk_a50: () => { let s = ring(AC) + rays(32, 32, 14, 26, AC, 8, 1.8); for (let i = 0; i < 10; i++) s += G(rot(i * 36, 32, 32), P("M32,30 L34.2,22 L32,8 L29.8,22Z", i % 2 ? STEEL : "#CFCBC2", 1.8)); s += E(32, 32, 6, 6, "#2A6650", 2.4) + star(32, 32, 4, GOLD_L, 1.8); return s; },
    // Linh Ẩn
    sk_l33: () => ring(LC) + L("M10,14 Q22,10 26,20 Q30,30 18,32 Q8,34 12,46 Q16,54 30,54 L44,54", 4.4, GOLD_L) + L("M10,14 Q22,10 26,20 Q30,30 18,32 Q8,34 12,46 Q16,54 30,54 L44,54", 1.4, GOLD_S) + E(46, 52, 10, 6, JADE_D, 2.4) + pips(2, LC),
    sk_l35: () => ring(LC) + glow(40, 24, 18, 16, GOLD, 0.25) + P("M20,44 C22,34 28,28 38,26 L42,30 C32,32 26,38 24,46Z", GOLD_L, 2.2) + E(42, 24, 10, 10, "#A8771A", 2.6) + E(42, 24, 6.4, 6.4, LC, 2.2) + star(42, 24, 14, GOLD_L, 1.8) + pips(2, LC),
    sk_l38: () => ring(LC) + E(32, 42, 22, 12, "none", 2.4, `stroke="${GOLD}"`) + E(32, 42, 14, 7, "none", 1.6, `stroke="${GOLD}" opacity="0.6"`) + E(32, 42, 6, 3, LC, 1.6) + P("M10,40 L10,22 L22,22 L22,36Z", "#8A5A3A", 2.2) + P("M42,36 L42,22 L54,22 L54,40Z", "#8A5A3A", 2.2) + P("M28,36 L28,16 L36,16 L36,36Z", "#4A3A30", 2.2) + pips(2, LC),
    sk_l40: () => ring(LC) + glow(32, 36, 16, 16, JADE_L, 0.25) + L("M54,14 Q56,30 40,32 Q24,34 22,22 Q20,12 32,12", 4.4, GOLD_L) + P("M54,6 L58,16 L48,16Z", JADE_S, 2) + E(32, 44, 11, 11, "#A8771A", 2.6) + E(32, 44, 7, 7, JADE_L, 2.2) + L("M32,38 L32,50 M26,44 L38,44", 2.6, GOLD_S) + pips(2, LC),
    sk_l45: () => { let s = ring(LC); s += P("M28,58 L36,58 L34,46 L30,46Z", "#8A5A3A", 2); for (let i = 0; i < 6; i++) s += G(rot(-45 + i * 18, 32, 50), P("M32,48 L34,38 L32,20 L30,38Z", i % 2 ? "#4A4256" : PURP2, 2) + L("M32,22 L32,40", 1, "#C79BE0")); s += star(32, 26, 7, PURP2, 2.2) + pips(2, LC); return s; },
    sk_l50: () => ring(LC) + glow(32, 34, 20, 20, FLAME, 0.22) + P("M32,2 L40,16 L34,18 L42,32 L34,32 L40,46 L30,42 L32,54 L22,38 L30,36 L22,24 L30,22Z", FLAME_S, 2.4) + P("M32,6 L36,16 L31,18 L36,30 L30,30 L34,42 L28,40 L30,50 L24,38 L30,36 L24,26 L30,24Z", FLAME_L, 1.6) + E(32, 56, 14, 6, "#2E8FB5", 2.4) + star(46, 12, 5, FLAME_L, 2) + pips(2, LC),
    // passives added at Lv 38/43/48
    sk_k43: () => ring(KC) + glow(32, 30, 16, 18, GOLD, 0.2) + P("M32,6 L36,18 L33,46 L31,46 L28,18Z", STEEL, 2.4) + L("M32,12 L32,42", 1.6, KC) + star(32, 28, 14, GOLD_L, 2) + pips(2, KC),
    sk_a43: () => ring(AC) + glow(32, 30, 16, 16, JADE, 0.2) + L("M12,50 Q18,20 40,14", 2.6, AC) + L("M6,44 L14,40", 2.2, AC) + star(42, 30, 14, JADE_L, 2) + pips(2, AC),
    sk_l43: () => ring(LC) + glow(32, 34, 16, 16, GOLD, 0.2) + L("M54,14 Q56,30 40,32 Q24,34 22,22 Q20,12 32,12", 4.4, GOLD_L) + E(32, 44, 10, 10, "#A8771A", 2.4) + E(32, 44, 6, 6, LC, 2) + star(32, 44, 14, GOLD_L, 1.8) + pips(2, LC),
    sk_k48: () => ring(KC) + rays(32, 32, 16, 26, GOLD, 12, 1.6) + P("M32,4 L36,16 L33,48 L31,48 L28,16Z", "#FDF6E2", 2.4) + star(32, 30, 10, GOLD_L, 2) + pips(3, KC),
    sk_a48: () => ring(AC) + rays(32, 32, 14, 24, AC, 10, 1.6) + L("M12,50 Q18,20 40,14", 2.6, "#BFE0E6") + E(42, 30, 8, 8, JADE, 2.4) + star(42, 30, 12, JADE_L, 1.8) + pips(3, AC),
    sk_l48: () => ring(LC) + rays(32, 32, 14, 24, GOLD, 10, 1.6) + L("M10,14 Q22,10 26,20 Q30,30 18,32 Q8,34 12,46 Q16,54 30,54 L44,54", 4.4, GOLD_L) + star(46, 52, 10, JADE_L, 1.8) + pips(3, LC),
  };

  add(Object.assign({}, WEAPONS, SKILLS2, MATS2, {
    // equipment icons
    a_cloud: () => gear.armor("#BFE0E6", CLOUD_S, CLOUD_L), b_cloud: () => gear.boots("#D8EEF2", CLOUD_S, CLOUD_L), n_cloud: () => gear.necklace(CLOUD, CLOUD_S, GOLD_L),
    a_mech: () => gear.armor(MECH, MECH_S, "#F2D479"), m_mech: () => gear.mask(MECH_L, MECH_S, "#F2D479"), r_mech: () => gear.ring(MECH, MECH_S, "#F2D479"),
    a_spirit: () => gear.armor("#7FE6C0", JADE_S, JADE_L), j_spirit: () => gear.jade("#7FE6C0", JADE_S, JADE_L), b_spirit: () => gear.boots("#7FE6C0", JADE_S, JADE_L),
    a_thunder: () => gear.armor("#8E97AC", "#5E667A", GOLD_L), n_thunder: () => gear.necklace(GOLD_S, "#8A5A12", GOLD_L), g_thunder: () => gear.gloves("#6E7790", "#4E566E", GOLD_L),
    h_fate: () => gear.hat("#C3D6EC", "#9AB0CE", GOLD_L), a_fate: () => gear.armor("#C3D6EC", "#9AB0CE", "#FFF6D8"), bl_fate: () => gear.belt("#4A3A30", IRON2_S, GOLD_L),
    r_fate: () => gear.ring("#DCE8F8", "#9AB0CE", "#FFF6D8"), j_fate: () => gear.jade("#DCE8F8", "#9AB0CE", "#FFF6D8"),
  }));
})();
