// Word Ninja: original art, drawn as SVG and rasterised into textures at load.
// One ink filter gives every outline its uneven, brushed weight.
(function () {
  const INK = "#2A2320";
  const SKIN = "#F7D9BC", SKIN_S = "#E9BC98", BLUSH = "#F0A28C";
  let uid = 0;

  const DEFS = `<filter id="ib" x="-15%" y="-15%" width="130%" height="130%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="0.5" result="d"/>
    <feOffset in="d" dx="1" dy="1.2" result="o"/>
    <feFlood flood-color="${INK}"/><feComposite in2="o" operator="in" result="s"/>
    <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  function svg(w, h, body, scale = 2, filter = true) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w * scale)}" height="${Math.round(h * scale)}" viewBox="0 0 ${w} ${h}"><defs>${DEFS}</defs><g ${filter ? 'filter="url(#ib)"' : ""}>${body}</g></svg>`;
  }
  const P = (d, fill, sw = 3, extra = "") =>
    `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const L = (d, sw = 2.2, col = INK, extra = "") =>
    `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const F = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const E = (cx, cy, rx, ry, fill, sw = 3, extra = "") =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra.includes("stroke=") ? "" : `stroke="${sw ? INK : "none"}"`} stroke-width="${sw}" ${extra}/>`;
  // a part with a flat shade clipped inside it, then its outline
  function part(d, fill, shadeD, shade, sw = 3) {
    const id = "c" + uid++;
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${fill}"/>` +
      (shadeD ? `<g clip-path="url(#${id})"><path d="${shadeD}" fill="${shade}"/></g>` : "") +
      `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  const G = (t, body) => `<g transform="${t}">${body}</g>`;

  // ---------------- faces ----------------
  function eyes(x1, x2, y, mood, s = 1) {
    const one = (x) => {
      if (mood === "closed" || mood === "happy") return L(`M${x - 4 * s},${y + 1} Q${x},${y - 3 * s} ${x + 4 * s},${y + 1}`, 2.4);
      if (mood === "hurt") return L(`M${x - 4 * s},${y - 4 * s} L${x + 3 * s},${y} L${x - 4 * s},${y + 4 * s}`, 2.4);
      if (mood === "dead") return L(`M${x - 3.5 * s},${y - 3.5 * s} L${x + 3.5 * s},${y + 3.5 * s} M${x + 3.5 * s},${y - 3.5 * s} L${x - 3.5 * s},${y + 3.5 * s}`, 2.4);
      return E(x, y, 4.2 * s, 6 * s, INK, 0) + E(x + 0.2 * s, y + 2.6 * s, 2.6 * s, 2.4 * s, "#7A4A32", 0) +
        E(x - 1.4 * s, y - 2.4 * s, 1.7 * s, 1.9 * s, "#fff", 0) + E(x + 1.6 * s, y + 2.8 * s, 0.8 * s, 0.8 * s, "#fff", 0);
    };
    return one(x1) + one(x2);
  }

  // ---------------- chibi (player and NPCs share one body) ----------------
  const WEAPON_LOOK = {
    sword_bamboo: { blade: "#9CC46A", shade: "#6E9A44", guard: "#C8A26A", len: 40, node: true },
    sword_iron: { blade: "#E6E4DE", shade: "#B9B6AE", guard: "#E0A526", len: 46 },
    sword_jade: { blade: "#BFE3CF", shade: "#7DB89A", guard: "#3E8C6E", len: 48 },
    blade_horn: { blade: "#F0E4C8", shade: "#CDBB92", guard: "#8A5A3A", len: 50, wide: true },
    sword_ink: { blade: "#3B3330", shade: "#2A2320", guard: "#E0A526", len: 52, ink: true },
    sword_kiem: { blade: "#F1D9D2", shade: "#D2462E", guard: "#D2462E", len: 50 },
    kunai_anh: { blade: "#DDEBE3", shade: "#3E8C6E", guard: "#3E8C6E", len: 30, kunai: true },
    brush_linh: { blade: "#8A5A3A", shade: "#5E3C26", guard: "#E0A526", len: 46, brush: true },
  };

  function weaponInHand(look) {
    const w = WEAPON_LOOK[look] || WEAPON_LOOK.sword_bamboo;
    const y0 = 24, y1 = y0 + w.len;
    if (w.brush) {
      return part(`M-2.6,14 L2.6,14 L2.6,${y1 - 10} L-2.6,${y1 - 10}Z`, w.blade, `M0.6,14 L2.6,14 L2.6,${y1} L0.6,${y1}Z`, w.shade, 2.4) +
        P(`M-3.4,${y1 - 12} L3.4,${y1 - 12} Q6,${y1 - 2} 0,${y1 + 6} Q-6,${y1 - 2} -3.4,${y1 - 12}Z`, INK, 2) +
        E(0, y0 - 2, 4.5, 2.6, w.guard, 2);
    }
    const bw = w.wide ? 5 : 3;
    const blade = w.kunai
      ? `M-3,${y0} L3,${y0} L4.5,${y0 + 12} L0,${y1} L-4.5,${y0 + 12}Z`
      : `M-${bw},${y0} L${bw},${y0} L${bw + 0.6},${y1 - 8} Q0,${y1 + 2} -${bw},${y1 - 6}Z`;
    let s = P(`M-2.4,12 L2.4,12 L2.4,${y0} L-2.4,${y0}Z`, "#2E3A5C", 2.2);
    s += part(blade, w.blade, `M0.8,${y0} L${bw + 2},${y0} L${bw + 2},${y1 + 4} L0.8,${y1 + 4}Z`, w.shade, 2.6);
    if (w.node) s += L(`M-3,${y0 + 14} L3,${y0 + 14} M-3,${y0 + 28} L3,${y0 + 28}`, 1.8);
    if (w.ink) s += L(`M0,${y0 + 6} L0,${y1 - 10}`, 1.4, "#E0A526");
    s += E(0, y0, w.kunai ? 4 : 6.5, 2.6, w.guard, 2.2);
    if (w.kunai) s += E(0, 9, 3.2, 3.2, "none", 2);
    return s;
  }

  // pose: {legF, legB, armF, armB, tilt, bob, head, mood, weapon:"hand"|"back"|null}
  function chibi(o, pose) {
    const p = Object.assign({ legF: 0, legB: 0, armF: 8, armB: -8, tilt: 0, bob: 0, head: 0, mood: "open", weapon: null }, pose);
    const W = 120, H = 150;
    const top = o.top || "#2E3A5C", topS = o.topS || "#232C47";
    const pants = o.pants || top, pantsS = o.pantsS || topS;
    const sleeve = o.sleeve || top, sleeveS = o.sleeveS || topS;
    const robe = o.robe; // long robe hides legs
    const hipX = 60, hipY = 114 + p.bob;
    let s = "";

    const leg = (ang, x) => G(`translate(${x},${hipY}) rotate(${ang})`,
      part("M-8,-3 L8,-3 L7.4,20 L-7.4,20Z", pants, "M2,-3 L8,-3 L8,22 L2,22Z", pantsS) +
      part("M-7.2,19 L7.2,19 L6.8,27 L-6.8,27Z", o.wrap || "#E4D2AA", "M2,19 L8,19 L8,27 L2,27Z", "#CDB88E", 2.6) +
      P("M-7,26 Q-8.5,33 -2,33 L9,33 Q13.5,33 12.5,29 Q11.5,25.5 6,25.5 L-6,25.5Z", o.shoe || "#4A3A30", 2.6));

    const arm = (ang, x, front) => G(`translate(${x},${88 + p.bob}) rotate(${ang})`,
      (front && p.weapon === "hand" ? weaponInHand(o.weaponLook) : "") +
      part("M-6.5,-4 Q6.5,-6 7.5,4 L6,17 L-6,17 L-7.5,4Z", sleeve, "M2,-6 L9,-6 L9,18 L2,18Z", sleeveS) +
      E(0, 21, 6.2, 6.2, o.hand || SKIN, 2.6) + (o.bracer ? P("M-6.4,13 L6.4,13 L6.1,18 L-6.1,18Z", o.bracer, 2.2) : ""));

    // sword on the back
    if (p.weapon === "back") {
      const w = WEAPON_LOOK[o.weaponLook] || WEAPON_LOOK.sword_bamboo;
      s += G(`translate(${44},${68 + p.bob}) rotate(-38)`,
        P(`M-2.6,0 L2.6,0 L2.6,13 L-2.6,13Z`, "#2E3A5C", 2.2) +
        P(`M-3.4,13 L3.4,13 L3.6,${13 + w.len * 0.8} L-3.6,${13 + w.len * 0.8}Z`, w.brush ? w.blade : "#6B4A36", 2.4) + E(0, 13, 5.5, 2.4, w.guard, 2));
    }
    if (o.backItem) s += o.backItem(p);
    s += arm(p.armB + p.tilt, 46, false);
    if (!robe) s += leg(p.legB, 54);

    // torso
    const torso = robe
      ? `M44,86 Q60,80 76,86 L84,138 Q60,146 36,138Z`
      : `M44,86 Q60,81 76,86 L80,112 Q60,118 40,112Z`;
    let t = part(torso, robe || top, robe ? "M64,80 L90,80 L90,150 L64,150Z" : "M64,80 L84,80 L84,120 L64,120Z", o.robeS || topS);
    t += L("M52,85 L60,98 L68,85", 2.4) + F("M53,85.5 L60,96 L67,85.5Z", o.collar || "#F3E6C8");
    if (o.apron) t += part("M48,96 L72,96 L76,134 Q60,138 44,134Z", o.apron, "M62,96 L80,96 L80,140 L62,140Z", o.apronS || "#5E3C26", 2.6);
    if (o.belt !== false) t += part(robe ? "M40,106 Q60,111 80,106 L81,113 Q60,118 39,113Z" : "M41,104 Q60,109 79,104 L80,111 Q60,116 40,111Z",
      o.belt || "#E0A526", "M60,100 L90,100 L90,120 L60,120Z", o.beltS || "#B8841A", 2.6) + P("M58,106 L64,106 L66,116 L60,118Z", o.belt || "#E0A526", 2);
    if (robe) t += P("M48,137 L50,146 L58,146 L58,140Z M72,137 L70,146 L62,146 L62,140Z", o.shoe || "#4A3A30", 2.4);
    s += G(`rotate(${p.tilt},60,${hipY})`, t);
    if (!robe) s += leg(p.legF, 66);

    // head
    let h = "";
    h += o.headBack ? o.headBack : "";
    if (o.hood !== false) {
      h += part("M-34,4 C-36,-26 -14,-37 2,-37 C24,-37 36,-23 34,2 C33,22 18,32 0,32 C-20,32 -33,22 -34,4Z", o.hood || top,
        "M10,-40 C40,-30 40,30 10,40 L40,40 L40,-40Z", o.hoodS || topS);
    } else {
      h += part("M-30,4 C-31,-24 -12,-33 2,-33 C22,-33 32,-20 31,2 C30,22 17,31 0,31 C-18,31 -30,22 -30,4Z", SKIN, "M12,-36 C36,-20 36,26 12,36 L40,36 L40,-36Z", SKIN_S);
    }
    if (o.hood !== false) h += part("M-12,-6 Q8,-15 30,-6 L31,10 Q28,28 8,29 Q-10,28 -13,12Z", SKIN, "M22,-12 L34,-12 L34,30 L22,30Z", SKIN_S, 2.6);
    if (o.hair) h += o.hair;
    else if (o.hood !== false) h += P("M-14,-3 L-9,-15 L-3,-7 L3,-18 L9,-8 L16,-17 L21,-7 L29,-11 L30,-4 Q8,-11 -14,-1Z", "#3B2B25", 2.4);
    if (o.band) h += part("M-34,-10 Q0,-20 34,-12 L34,-4 Q0,-12 -34,-2Z", o.band, "M-40,-4 L40,-4 L40,4 L-40,4Z", o.bandS || "#B8B2A4", 2.6) +
      P("M9,-15.5 L25,-13.5 L25,-5.5 L9,-7.5Z", "#C9CCD1", 2.2) + L("M14,-11 Q17,-14 20,-11 Q17,-8 15,-10", 1.4);
    h += eyes(3, 21, 8, p.mood);
    if (o.brows) h += o.brows;
    h += E(-4, 18, 4, 2.2, BLUSH, 0, 'opacity="0.85"') + E(27, 17, 3.4, 2, BLUSH, 0, 'opacity="0.85"');
    if (p.mood === "hurt" || p.mood === "dead") h += P("M10,20 Q13,17 16,20 Q13,23 10,20Z", "#8A3A2E", 2);
    else if (p.mood === "shout") h += P("M9,19 Q13,18 17,19 Q16,25 13,25 Q10,25 9,19Z", "#8A3A2E", 2);
    else h += L("M10,20 Q13,22.5 16,20", 2);
    if (o.face) h += o.face;
    if (o.headTop) h += o.headTop;
    s += G(`translate(${62},${52 + p.bob}) rotate(${p.head + p.tilt * 0.5},-2,32)`, h);

    s += arm(p.armF + p.tilt, 74, true);
    if (o.front) s += o.front(p);
    return svg(W, H, s);
  }

  // ---------------- the player ----------------
  const NINJA_POSES = (() => {
    const out = {};
    out.idle0 = { legF: -5, legB: 6, armF: 10, armB: -10, weapon: "back" };
    out.idle1 = { legF: -5, legB: 6, armF: 13, armB: -13, bob: 1.6, weapon: "back" };
    out.blink = Object.assign({}, out.idle0, { mood: "closed" });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2, sn = Math.sin(a);
      out["run" + i] = { legF: -34 * sn, legB: 34 * sn, armF: 38 * sn, armB: -38 * sn, tilt: 7, bob: -2.6 * Math.abs(Math.cos(a)), weapon: "back" };
    }
    out.jump = { legF: -38, legB: 26, armF: -125, armB: 120, tilt: 4, weapon: "back" };
    out.fall = { legF: -12, legB: 16, armF: -150, armB: 150, tilt: -2, weapon: "back" };
    out.atk0 = { legF: -18, legB: 22, armF: 150, armB: -30, tilt: -7, weapon: "hand", mood: "open" };
    out.atk1 = { legF: -38, legB: 34, armF: -98, armB: 40, tilt: 11, weapon: "hand", mood: "shout" };
    out.atk2 = { legF: -30, legB: 28, armF: -42, armB: 30, tilt: 7, weapon: "hand", mood: "open" };
    out.cast = { legF: -14, legB: 14, armF: -92, armB: -78, tilt: 3, weapon: "hand", mood: "closed" };
    out.hurt = { legF: 10, legB: -16, armF: -50, armB: 60, tilt: -14, head: -8, weapon: "back", mood: "hurt" };
    out.dead = { legF: 20, legB: -10, armF: -70, armB: 80, tilt: -10, head: -12, weapon: null, mood: "dead" };
    out.win = { legF: -6, legB: 8, armF: 165, armB: -20, bob: -1, weapon: "hand", mood: "happy" };
    return out;
  })();

  function ninjaOutfit(look) {
    const cls = look.cls;
    const band = cls === "kiem" ? "#D2462E" : cls === "anh" ? "#3E8C6E" : cls === "linh" ? "#E0A526" : "#F3E6C8";
    return {
      top: "#2E3A5C", topS: "#232C47", band, bandS: cls ? "#00000033" : "#CDB88E",
      belt: cls === "linh" ? "#D2462E" : "#E0A526", beltS: cls === "linh" ? "#9E2F1E" : "#B8841A",
      weaponLook: look.weapon || "sword_bamboo", bracer: "#E4D2AA",
    };
  }
  function ninjaFrames(look) {
    const o = ninjaOutfit(look); const out = {};
    for (const k in NINJA_POSES) out[k] = chibi(o, NINJA_POSES[k]);
    return out;
  }
  function ninjaPortrait(look, scarf, pose) {
    const o = ninjaOutfit(look);
    o.backItem = () => P("M46,84 C30,86 18,80 6,92 C2,96 4,100 8,99 C18,92 28,94 44,92Z", scarf, 2.6) + P("M44,88 C32,96 26,108 12,112 C8,113 8,118 12,118 C28,114 38,104 48,94Z", scarf, 2.6);
    return chibi(o, NINJA_POSES[pose || "idle0"]);
  }
  // where the scarf hangs from, in texture px (frame is 120x150 at scale 2)
  const SCARF_ANCHOR = { x: 50, y: 84 };

  // ---------------- NPCs ----------------
  const NPC_LOOKS = {
    elder: {
      hood: false, robe: "#8A5A3A", robeS: "#6B4329", sleeve: "#8A5A3A", sleeveS: "#6B4329", belt: "#3E8C6E", beltS: "#2A6650",
      collar: "#E4D2AA",
      brows: L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 3.4, "#F4F1EA") + L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 1.2),
      face: P("M-4,22 Q12,30 30,21 Q30,40 14,52 Q8,44 2,50 Q-6,38 -4,22Z", "#F4F1EA", 2.4) + L("M8,26 Q13,30 18,26", 1.6),
      headTop: L("M-12,-24 Q-4,-30 6,-28", 1.6),
      backItem: (p) => G(`translate(30,${60 + p.bob}) rotate(-6)`, P("M-2.5,0 L2.5,0 L3,88 L-3,88Z", "#8A5A3A", 2.4) +
        part("M0,-6 C-9,-6 -10,4 -5,8 C-12,12 -12,26 0,27 C12,26 12,12 5,8 C10,4 9,-6 0,-6Z", "#E0A526", "M3,-10 L14,-10 L14,30 L3,30Z", "#B8841A", 2.4) + L("M-5,8 L5,8", 2, "#D2462E")),
    },
    shop: {
      top: "#E07A62", topS: "#B9583F", sleeve: "#E07A62", sleeveS: "#B9583F", pants: "#2E3A5C", pantsS: "#232C47", belt: "#3E8C6E", beltS: "#2A6650",
      hood: false, collar: "#F3E6C8",
      hair: P("M-30,2 C-33,-26 -10,-33 4,-33 C22,-33 33,-22 31,-4 Q22,-14 6,-12 Q-12,-10 -22,6 Q-26,20 -24,28 Q-32,18 -30,2Z", "#3B2B25", 2.6),
      headTop: P("M-46,-6 Q0,-62 48,-8 Q0,-18 -46,-6Z", "#E3C16A", 2.8) + L("M-30,-10 Q0,-44 32,-12 M-14,-14 Q0,-36 16,-14", 1.4, "#B8963E") + E(0, -36, 3, 3, "#D2462E", 2),
      front: (p) => G(`translate(84,${108 + p.bob})`, part("M-14,-6 L14,-6 L11,14 Q0,18 -11,14Z", "#C89A5A", "M2,-8 L16,-8 L16,18 L2,18Z", "#A67A40", 2.6) +
        L("M-12,0 L12,0 M-11,7 L11,7 M-6,-6 L-5,15 M4,-6 L3,15", 1.3) + E(-6, -9, 5, 4, "#D2462E", 2.2) + E(5, -9, 4.4, 3.8, "#9CC97A", 2.2)),
    },
    smith: {
      top: SKIN, topS: SKIN_S, sleeve: SKIN, sleeveS: SKIN_S, pants: "#4A3A30", pantsS: "#382B23", apron: "#7A4E32", apronS: "#5E3C26", belt: "#2A2320", beltS: "#2A2320",
      hood: false, collar: SKIN, band: "#F3E6C8", bandS: "#CDB88E",
      hair: P("M-28,-6 L-26,-24 L-16,-20 L-12,-34 L-2,-26 L6,-36 L12,-26 L22,-32 L22,-20 L31,-18 L30,-6 Q4,-18 -28,-6Z", "#3B2B25", 2.4),
      brows: L("M-1,0 L8,2 M15,2 L25,-1", 3, INK),
      face: P("M-2,20 Q13,34 29,19 Q28,30 13,31 Q0,31 -2,20Z", "#3B2B25", 2),
      backItem: (p) => G(`translate(92,${66 + p.bob}) rotate(28)`, P("M-2.6,0 L2.6,0 L2.6,46 L-2.6,46Z", "#8A5A3A", 2.4) + part("M-12,-12 L12,-12 L12,4 L-12,4Z", "#8C94A0", "M2,-14 L14,-14 L14,6 L2,6Z", "#6E7784", 2.6)),
    },
    scholar: {
      robe: "#3E8C6E", robeS: "#2A6650", sleeve: "#3E8C6E", sleeveS: "#2A6650", belt: "#F3E6C8", beltS: "#CDB88E", collar: "#F3E6C8",
      hood: false,
      hair: P("M-30,0 C-31,-14 -26,-20 -20,-22 L-22,8 Q-28,14 -30,0Z", "#3B2B25", 2.2),
      headTop: part("M-32,-8 C-32,-34 32,-34 32,-8 Q0,-16 -32,-8Z", "#2E3A5C", "M-32,-26 L32,-26 L32,-20 L-32,-20Z", "#232C47", 2.8) + L("M-30,-14 Q0,-22 30,-14 M-28,-20 Q0,-28 28,-20", 1.3, "#5A6A8E"),
      face: E(3, 8, 7, 7, "none", 2) + E(21, 8, 7, 7, "none", 2) + L("M10,8 L14,8", 2) + L("M3,28 Q4,40 -2,46 M23,28 Q24,40 30,44", 1.6, "#8A8178"),
      front: (p) => G(`translate(86,${96 + p.bob}) rotate(-20)`, P("M-2,-30 L2,-30 L2,6 L-2,6Z", "#8A5A3A", 2.2) + P("M-3.4,6 L3.4,6 Q6,16 0,22 Q-6,16 -3.4,6Z", INK, 2)),
    },
  };
  function npcFrames(id) {
    const o = Object.assign({}, NPC_LOOKS[id]);
    return { a: chibi(o, { armF: 10, armB: -8 }), b: chibi(o, { armF: 14, armB: -12, bob: 1.5 }), c: chibi(o, { armF: 10, armB: -8, mood: "closed" }) };
  }

  // ---------------- monsters ----------------
  function monsterFace(cx, cy, mood, gap = 22, s = 1, brow = "none") {
    let f = "";
    const m = mood === "hit" ? "hurt" : mood === "dead" ? "dead" : "open";
    f += eyes(cx - gap / 2, cx + gap / 2, cy, m, s);
    if (brow === "angry" && m === "open") f += L(`M${cx - gap / 2 - 5 * s},${cy - 9 * s} L${cx - gap / 2 + 4 * s},${cy - 6 * s} M${cx + gap / 2 + 5 * s},${cy - 9 * s} L${cx + gap / 2 - 4 * s},${cy - 6 * s}`, 2.6);
    f += E(cx - gap / 2 - 4 * s, cy + 9 * s, 4 * s, 2.2 * s, BLUSH, 0, 'opacity="0.85"') + E(cx + gap / 2 + 4 * s, cy + 9 * s, 4 * s, 2.2 * s, BLUSH, 0, 'opacity="0.85"');
    if (mood === "atk") f += P(`M${cx - 6 * s},${cy + 9 * s} Q${cx},${cy + 7 * s} ${cx + 6 * s},${cy + 9 * s} Q${cx + 4 * s},${cy + 17 * s} ${cx},${cy + 17 * s} Q${cx - 4 * s},${cy + 17 * s} ${cx - 6 * s},${cy + 9 * s}Z`, "#8A3A2E", 2);
    else if (mood === "hit") f += P(`M${cx - 3 * s},${cy + 11 * s} Q${cx},${cy + 7 * s} ${cx + 3 * s},${cy + 11 * s} Q${cx},${cy + 14 * s} ${cx - 3 * s},${cy + 11 * s}Z`, "#8A3A2E", 2);
    else f += L(`M${cx - 4 * s},${cy + 9 * s} Q${cx - 2 * s},${cy + 12 * s} ${cx},${cy + 9.5 * s} Q${cx + 2 * s},${cy + 12 * s} ${cx + 4 * s},${cy + 9 * s}`, 2);
    return f;
  }

  const MONSTER_ART = {
    radish: { w: 110, h: 122, draw: (mood) =>
      part("M52,46 C36,32 28,14 38,8 C50,8 56,28 53,46Z", "#7DBA5C", "M46,6 L60,6 L60,48 L46,48Z", "#5A9A44", 2.6) +
      part("M56,44 C52,24 56,6 65,3 C72,14 66,32 59,44Z", "#8FC86A", "M64,0 L76,0 L76,46 L64,46Z", "#6AA84E", 2.6) +
      part("M58,46 C70,30 86,24 90,32 C88,42 72,46 60,48Z", "#7DBA5C", "M70,40 L96,40 L96,52 L70,52Z", "#5A9A44", 2.6) +
      L("M50,40 C44,30 40,20 40,14 M60,40 C60,26 62,16 65,9 M62,46 C72,38 80,34 86,33", 1.4, "#3F7A33") +
      part("M55,40 C82,40 93,62 89,82 C85,100 69,108 59,116 C56,119 54,119 51,116 C41,108 24,100 21,82 C17,62 28,40 55,40Z", "#F7F1E6",
        "M80,44 C100,70 92,110 60,120 L110,120 L110,40Z", "#E3D6C4") +
      F("M30,52 C40,42 70,42 80,52 C70,48 40,48 30,52Z", "#CFE2A8") +
      L("M30,90 Q34,92 36,90 M76,88 Q78,91 82,89 M50,104 Q53,106 56,104", 1.4, "#B9AA94") +
      P(mood === "atk" ? "M20,72 Q8,66 6,58" : "M21,78 Q10,80 8,88", "none", 3) + P(mood === "atk" ? "M89,72 Q100,64 102,56" : "M89,78 Q100,80 102,88", "none", 3) +
      L("M54,116 Q50,122 56,121", 2.4) +
      monsterFace(55, 74, mood, 24, 1, "angry") },
    dew: { w: 110, h: 112, draw: (mood) =>
      E(55, 104, 34, 5, "#79BCCB", 0, 'opacity="0.55"') +
      part(mood === "atk" ? "M55,6 C62,24 96,50 96,76 C96,96 78,106 55,106 C32,106 14,96 14,76 C14,50 48,24 55,6Z" : "M55,10 C61,26 92,52 92,76 C92,96 76,106 55,106 C34,106 18,96 18,76 C18,52 49,26 55,10Z",
        "#A9DDE7", "M70,30 C100,60 100,110 50,112 L110,112 L110,20Z", "#7FC0CF") +
      E(36, 62, 6, 10, "#fff", 0, 'opacity="0.85" transform="rotate(25,36,62)"') + E(44, 48, 3, 4, "#fff", 0, 'opacity="0.85"') +
      E(70, 92, 3.4, 3.4, "#D8F0F4", 2) + E(80, 82, 2, 2, "#D8F0F4", 1.6) +
      part("M55,10 C50,2 42,0 40,4 C42,10 50,12 55,10Z", "#9CC97A", "", "", 2.2) + part("M55,10 C60,1 68,0 70,4 C68,10 60,12 55,10Z", "#7DBA5C", "", "", 2.2) +
      monsterFace(55, 74, mood, 26, 1.05) },
    mush: { w: 124, h: 132, draw: (mood) =>
      part("M38,66 C35,90 37,110 45,120 L79,120 C87,110 89,90 86,66Z", "#EEDDBB", "M70,60 L96,60 L96,124 L70,124Z", "#D6C09A") +
      P("M42,118 Q40,127 50,127 L58,127 L58,118Z M66,118 L66,127 L74,127 Q84,127 82,118Z", "#8A7A68", 2.6) +
      part("M12,64 C10,30 38,10 62,10 C90,10 114,30 112,64 C112,72 98,75 62,75 C26,75 12,72 12,64Z", "#A69886",
        "M80,6 C120,20 124,70 100,80 L124,80 L124,6Z M12,60 L112,60 L112,80 L12,80Z", "#857767") +
      part("M30,34 C34,26 44,26 46,32 C48,40 38,44 32,42 C28,40 28,38 30,34Z", "#8FB07A", "", "", 2.2) +
      part("M66,22 C72,16 82,18 82,26 C80,32 70,32 66,28Z", "#8FB07A", "", "", 2.2) +
      part("M88,44 C94,40 100,44 98,50 C94,54 88,52 88,44Z", "#9DBE86", "", "", 2) +
      L("M52,40 L58,48 L54,56 M74,46 L80,52", 1.6) + E(44, 56, 2.4, 2.4, "#6E6256", 0) + E(100, 32, 2, 2, "#6E6256", 0) +
      monsterFace(62, 92, mood, 22, 0.95, "angry") },
    elite: { w: 160, h: 200, draw: (mood) =>
      P("M76,120 L84,120 L85,198 L75,198Z", "#8A5A3A", 2.8) +
      part("M44,96 Q80,86 116,96 L110,150 Q80,158 50,150Z", "#47557A", "M84,86 L120,86 L120,160 L84,160Z", "#36425F") +
      P("M58,110 L72,110 L72,124 L58,124Z", "#E4D2AA", 2.2) + L("M58,117 L72,117 M65,110 L65,124", 1.2) + P("M92,128 L104,126 L105,138 L93,140Z", "#D2462E", 2.2) +
      P(mood === "atk" ? "M44,100 L8,78 L10,88 L44,110Z" : "M44,100 L6,104 L6,114 L46,112Z", "#47557A", 2.6) +
      P(mood === "atk" ? "M116,100 L152,78 L150,88 L116,110Z" : "M116,100 L154,104 L154,114 L114,112Z", "#47557A", 2.6) +
      P(mood === "atk" ? "M10,80 L-0,70 L4,82 L-2,88 L10,88Z" : "M6,104 L-4,98 L0,108 L-4,118 L6,114Z", "#E3C16A", 2.2) +
      P(mood === "atk" ? "M150,80 L160,70 L156,82 L162,88 L150,88Z" : "M154,104 L164,98 L160,108 L164,118 L154,114Z", "#E3C16A", 2.2) +
      P("M52,148 L46,166 L58,158 L64,170 L70,156 L80,172 L88,156 L96,170 L100,156 L112,166 L108,148Z", "#E3C16A", 2.4) +
      part("M50,62 C50,36 110,36 110,62 C110,86 98,98 80,98 C62,98 50,86 50,62Z", "#D9B77A", "M90,30 L120,30 L120,100 L90,100Z", "#BE9A5E") +
      L("M56,70 L62,72 M100,74 L104,70 M66,92 L70,88", 1.4, "#8A6A3A") +
      part("M56,58 C56,40 104,40 104,58 L102,80 Q80,92 58,80Z", "#D2462E", "M86,36 L110,36 L110,92 L86,92Z", "#A93524") +
      P("M60,46 L54,26 L68,40Z", "#F3E6C8", 2.4) + P("M100,46 L106,26 L92,40Z", "#F3E6C8", 2.4) +
      P(mood === "hit" ? "M64,58 L76,62 L64,64Z M96,58 L84,62 L96,64Z" : "M62,54 L78,60 L64,64Z M98,54 L82,60 L96,64Z", "#F3E6C8", 2.2) +
      E(70, 60, 2.2, 2.2, INK, 0) + E(90, 60, 2.2, 2.2, INK, 0) +
      P(mood === "atk" ? "M66,72 L94,72 L90,84 L70,84Z" : "M66,74 L94,74 L91,80 L69,80Z", "#2A2320", 2.2) + L("M71,74 L73,80 M78,74 L79,80 M84,74 L83,80 M89,74 L87,80", 1.6, "#F3E6C8") +
      P("M28,44 Q80,4 132,44 Q80,34 28,44Z", "#E3C16A", 3) + L("M48,38 Q80,14 112,38 M62,32 Q80,20 98,32", 1.4, "#B8963E") },
    boss: { w: 330, h: 270, draw: (mood) => {
      let s = "";
      s += P("M300,120 Q326,128 320,160 Q318,170 312,166 Q314,140 296,132Z", "#6E7784", 2.6);
      s += part("M96,202 L94,256 L122,256 L124,202Z M236,202 L234,256 L262,256 L264,202Z", "#7C8592", "M110,200 L130,200 L130,258 L110,258Z M250,200 L270,200 L270,258 L250,258Z", "#5F6875");
      s += part("M70,110 C80,70 160,58 230,64 C290,70 316,104 312,150 C308,196 270,214 200,216 C130,218 84,206 72,176 C66,156 66,130 70,110Z", "#8D96A3",
        "M180,160 C240,200 300,180 320,120 L330,230 L150,230Z", "#6F7885");
      s += part("M140,80 C160,66 196,64 210,76 C200,92 166,96 140,80Z", "#7FA45E", "", "", 2.4);
      s += part("M248,90 C262,84 282,92 286,104 C272,108 256,104 248,90Z", "#8FB07A", "", "", 2.2);
      s += L("M150,130 L166,146 L160,166 M250,140 L262,150 M220,180 L232,190 L228,204 M110,150 L124,160", 2);
      s += part("M120,202 L118,258 L146,258 L148,204Z M206,206 L204,258 L232,258 L234,206Z", "#8D96A3", "M134,200 L154,200 L154,260 L134,260Z M220,200 L240,200 L240,260 L220,260Z", "#6F7885");
      s += P("M116,250 L150,250 L150,262 L114,262Z M202,250 L236,250 L236,262 L200,262Z M92,250 L124,250 L124,260 L92,260Z M232,250 L264,250 L264,260 L232,260Z", "#4A4F58", 2.6);
      // seal emblem
      s += G("rotate(-6,214,140)", P("M188,114 L240,114 L240,166 L188,166Z", "#D2462E", 3) + L("M196,122 L232,122 L232,158 L196,158Z", 1.6, "#F3E6C8") +
        L("M204,130 L224,130 M214,130 L214,152 M204,142 L224,142 M206,152 L222,152", 3, "#F3E6C8"));
      // rope and bell
      s += L("M86,150 Q110,176 132,170", 5, "#C89A5A") + L("M86,150 Q110,176 132,170", 1.4, INK);
      s += part("M118,170 C118,160 134,160 134,170 L136,184 L116,184Z", "#E0A526", "M128,156 L140,156 L140,190 L128,190Z", "#B8841A", 2.6) + E(126, 186, 3, 3, INK, 0);
      // head
      s += part("M20,120 C18,92 40,72 74,74 C104,76 118,98 116,124 C114,150 100,172 70,174 C38,176 22,152 20,120Z", "#8D96A3", "M80,70 C130,90 120,170 70,180 L130,180 L130,70Z", "#6F7885");
      s += part("M14,140 C14,124 30,118 48,120 C66,122 74,134 72,150 C70,166 54,174 38,172 C22,170 14,158 14,140Z", "#A7AFBA", "M50,116 L80,116 L80,180 L50,180Z", "#8D96A3");
      s += E(30, 142, 4, 5, INK, 0) + E(52, 144, 4, 5, INK, 0);
      s += L("M26,160 Q40,170 56,162", 2.4);
      s += E(41, 168, 9, 7, "none", 0) + L("M33,162 Q41,180 50,163", 3.4, "#E0A526") + L("M33,162 Q41,180 50,163", 1.2, INK);
      // horns
      s += part("M58,82 C40,60 12,52 2,30 C0,20 8,16 14,22 C24,40 48,46 74,70Z", "#EFE3C8", "M0,40 C20,60 50,70 70,80 L40,90 L0,60Z", "#D2C3A0", 3);
      s += part("M92,80 C112,58 140,48 150,26 C154,16 146,12 140,18 C128,36 104,44 82,70Z", "#EFE3C8", "M150,30 C140,50 110,62 90,78 L110,84 L156,40Z", "#D2C3A0", 3);
      s += L("M24,44 L30,38 M40,56 L46,50 M126,40 L132,46 M110,52 L116,58", 1.6, "#A8977A");
      // eyes and brow
      const angry = mood !== "hit" && mood !== "dead";
      if (mood === "hit") s += L("M50,104 L60,110 L50,116 M84,104 L74,110 L84,116", 3);
      else if (mood === "dead") s += L("M48,104 L60,116 M60,104 L48,116 M76,104 L88,116 M88,104 L76,116", 3);
      else s += E(56, 110, 7, 8, "#F3E6C8", 2.4) + E(82, 110, 7, 8, "#F3E6C8", 2.4) + E(57, 112, 3.4, 4.4, "#D2462E", 0) + E(83, 112, 3.4, 4.4, "#D2462E", 0) + E(55, 109, 1.2, 1.2, "#fff", 0) + E(81, 109, 1.2, 1.2, "#fff", 0);
      if (angry) s += L("M44,96 L64,104 M94,96 L74,104", 4);
      if (mood === "atk") s += P("M26,178 Q42,170 58,176 Q50,190 40,190 Q30,190 26,178Z", "#8A3A2E", 2.4);
      s += part("M12,96 C4,90 2,100 8,106 C14,110 20,104 20,100Z", "#8D96A3", "", "", 2.4) + part("M112,94 C122,88 126,98 120,104 C114,108 108,102 108,98Z", "#8D96A3", "", "", 2.4);
      return s;
    } },
    dummy: { w: 100, h: 150, draw: (mood) =>
      P("M46,60 L54,60 L55,148 L45,148Z", "#8A5A3A", 2.6) + P("M14,76 L86,76 L86,84 L14,84Z", "#8A5A3A", 2.6) +
      part("M28,70 Q50,62 72,70 L70,120 Q50,126 30,120Z", "#E3C16A", "M56,62 L80,62 L80,130 L56,130Z", "#C9A44E") +
      L("M34,82 L66,82 M32,96 L68,96 M32,110 L68,110", 1.4, "#A8863A") +
      part("M30,44 C30,22 70,22 70,44 C70,62 62,70 50,70 C38,70 30,62 30,44Z", "#E4D2AA", "M56,20 L76,20 L76,72 L56,72Z", "#CDB88E") +
      E(50, 46, 12, 12, "none", 2.6, 'stroke="#D2462E"') + E(50, 46, 5, 5, "#D2462E", 0) +
      (mood === "hit" ? L("M36,36 L42,40 M64,36 L58,40", 2) : "") },
  };
  function monsterFrames(id) {
    const a = MONSTER_ART[id];
    return { idle: svg(a.w, a.h, a.draw("idle")), hit: svg(a.w, a.h, a.draw("hit")), atk: svg(a.w, a.h, a.draw("atk")), dead: svg(a.w, a.h, a.draw("dead")) };
  }

  // ---------------- item icons (64x64) ----------------
  const I = {
    sword_bamboo: () => G("rotate(45,32,32)", P("M29,6 L35,6 L35,44 L29,44Z", "#9CC46A", 2.6) + L("M29,18 L35,18 M29,30 L35,30", 2) + P("M24,44 L40,44 L40,48 L24,48Z", "#C8A26A", 2.4) + P("M29.5,48 L34.5,48 L34.5,60 L29.5,60Z", "#2E3A5C", 2.4)),
    sword_iron: () => G("rotate(45,32,32)", part("M29,4 L35,4 L36,44 L28,44Z", "#E6E4DE", "M32,0 L40,0 L40,46 L32,46Z", "#B9B6AE", 2.6) + E(32, 46, 9, 3.2, "#E0A526", 2.4) + P("M29.5,48 L34.5,48 L34.5,60 L29.5,60Z", "#2E3A5C", 2.4) + L("M30,51 L34,54 M30,55 L34,58", 1.2, "#E4D2AA")),
    sword_jade: () => G("rotate(45,32,32)", part("M28,4 Q32,0 36,4 L37,44 L27,44Z", "#BFE3CF", "M32,0 L40,0 L40,46 L32,46Z", "#7DB89A", 2.6) + E(32, 46, 10, 3.6, "#3E8C6E", 2.4) + P("M29.5,48 L34.5,48 L34.5,60 L29.5,60Z", "#E4D2AA", 2.4) + E(32, 61, 3, 3, "#3E8C6E", 2)),
    blade_horn: () => G("rotate(45,32,32)", part("M26,4 Q40,8 38,44 L26,44Z", "#F0E4C8", "M33,0 L44,0 L44,46 L33,46Z", "#CDBB92", 2.6) + L("M30,14 L34,16 M30,24 L35,26", 1.4, "#A8977A") + P("M22,44 L42,44 L42,49 L22,49Z", "#8A5A3A", 2.4) + P("M29,49 L35,49 L35,60 L29,60Z", "#2A2320", 2.4)),
    sword_ink: () => G("rotate(45,32,32)", part("M29,2 L35,2 L36,44 L28,44Z", "#3B3330", "", "", 2.6) + L("M32,8 L32,40", 1.6, "#E0A526") + E(32, 46, 10, 3.6, "#E0A526", 2.4) + P("M29.5,48 L34.5,48 L34.5,60 L29.5,60Z", "#D2462E", 2.4)) + E(48, 50, 3, 3, INK, 0) + E(54, 44, 2, 2, INK, 0),
    sword_kiem: () => G("rotate(45,32,32)", part("M29,3 L35,3 L36,44 L28,44Z", "#F1D9D2", "M32,0 L40,0 L40,46 L32,46Z", "#D2462E", 2.6) + P("M23,44 L41,44 L39,49 L25,49Z", "#D2462E", 2.4) + P("M29.5,49 L34.5,49 L34.5,60 L29.5,60Z", "#2A2320", 2.4)),
    kunai_anh: () => G("rotate(30,24,30)", part("M24,6 L30,22 L24,40 L18,22Z", "#DDEBE3", "M24,0 L34,0 L34,44 L24,44Z", "#9CC4B0", 2.4) + P("M21,40 L27,40 L27,52 L21,52Z", "#3E8C6E", 2.2) + E(24, 56, 4, 4, "none", 2)) +
      G("rotate(-30,40,30)", part("M40,6 L46,22 L40,40 L34,22Z", "#DDEBE3", "M40,0 L50,0 L50,44 L40,44Z", "#9CC4B0", 2.4) + P("M37,40 L43,40 L43,52 L37,52Z", "#3E8C6E", 2.2) + E(40, 56, 4, 4, "none", 2)),
    brush_linh: () => G("rotate(40,32,32)", P("M29.5,4 L34.5,4 L34.5,44 L29.5,44Z", "#8A5A3A", 2.4) + E(32, 6, 4, 2.4, "#E0A526", 2) + P("M28,44 L36,44 Q40,54 32,62 Q24,54 28,44Z", INK, 2.2)) + E(48, 16, 3, 3, "#E0A526", 0) + E(14, 46, 2, 2, "#E0A526", 0),
    hat_straw: () => part("M4,42 Q32,4 60,42 Q32,50 4,42Z", "#E3C16A", "M32,0 L64,0 L64,52 L32,52Z", "#C9A44E", 2.8) + L("M14,38 Q32,14 50,38 M22,30 Q32,16 42,30", 1.4, "#A8863A") + L("M18,44 Q32,58 46,44", 2),
    hat_hood: () => part("M10,38 C8,14 22,6 32,6 C44,6 56,14 54,38 C54,52 44,58 32,58 C20,58 10,52 10,38Z", "#2E3A5C", "M38,0 L64,0 L64,60 L38,60Z", "#232C47") + part("M18,30 Q32,24 46,30 L46,44 Q32,52 18,44Z", "#F3E6C8", "", "", 2.4) + P("M8,28 L56,24 L56,30 L8,34Z", "#D2462E", 2.2),
    armor_cloth: () => part("M18,12 L26,8 Q32,14 38,8 L46,12 L56,24 L48,30 L46,56 L18,56 L16,30 L8,24Z", "#2E3A5C", "M36,8 L60,8 L60,60 L36,60Z", "#232C47") + L("M26,8 L32,22 L38,8", 2.2) + P("M17,38 L47,38 L47,43 L17,43Z", "#E0A526", 2),
    armor_padded: () => part("M18,10 L26,6 Q32,12 38,6 L46,10 L58,24 L48,32 L46,58 L18,58 L16,32 L6,24Z", "#8A6A4A", "M36,6 L62,6 L62,60 L36,60Z", "#6B4F36") + L("M18,24 L46,24 M18,34 L46,34 M18,44 L46,44 M18,52 L46,52", 1.4, "#E4D2AA") + L("M26,6 L32,18 L38,6", 2.2),
    armor_lacquer: () => part("M14,12 L50,12 L54,30 L50,58 L14,58 L10,30Z", "#D2462E", "M36,8 L60,8 L60,60 L36,60Z", "#A93524") + L("M12,24 L52,24 M11,36 L53,36 M12,48 L52,48", 2) + L("M20,24 L20,58 M32,24 L32,58 M44,24 L44,58", 1.2, "#F3E6C8") + P("M22,4 L42,4 L46,12 L18,12Z", "#E0A526", 2.4),
    gloves_wrap: () => part("M14,22 L32,18 L34,48 Q24,54 14,48Z", "#E4D2AA", "M26,14 L40,14 L40,56 L26,56Z", "#CDB88E") + L("M15,28 L33,26 M15,36 L33,34 M15,44 L33,42", 1.4) + part("M34,24 L50,22 L52,50 Q42,56 34,50Z", "#E4D2AA", "M44,18 L56,18 L56,58 L44,58Z", "#CDB88E") + L("M35,30 L51,28 M35,38 L51,36", 1.4),
    gloves_leather: () => part("M12,26 C12,14 30,12 32,22 L34,48 L14,50Z", "#8A5A3A", "M24,10 L40,10 L40,54 L24,54Z", "#6B4329") + P("M12,46 L34,44 L35,54 L12,56Z", "#E0A526", 2.2) + part("M34,24 C34,14 52,12 52,22 L54,48 L36,48Z", "#8A5A3A", "M46,10 L58,10 L58,54 L46,54Z", "#6B4329") + P("M35,46 L54,44 L55,54 L35,56Z", "#E0A526", 2.2),
    boots_straw: () => part("M8,40 C8,30 28,28 36,34 L36,48 L10,50Z", "#E3C16A", "M24,26 L40,26 L40,52 L24,52Z", "#C9A44E") + L("M12,38 L32,36 M12,44 L34,42 M20,32 L20,48 M28,32 L28,48", 1.2, "#A8863A") + P("M28,40 L56,40 L56,48 L28,48Z", "#E3C16A", 2.4) + L("M30,30 Q40,22 50,30", 2, "#8A5A3A"),
    boots_tabi: () => part("M18,8 L34,8 L34,36 L52,40 Q58,46 54,52 L18,52Z", "#E4D2AA", "M28,4 L60,4 L60,56 L28,56Z", "#CDB88E") + L("M40,38 L40,52", 2) + P("M16,52 L56,52 L56,57 L16,57Z", "#4A3A30", 2.2),
    boots_wind: () => part("M18,8 L34,8 L34,36 L52,40 Q58,46 54,52 L18,52Z", "#3E8C6E", "M28,4 L60,4 L60,56 L28,56Z", "#2A6650") + L("M6,20 Q14,16 18,22 M4,32 Q12,28 18,34 M8,44 Q14,40 18,46", 2, "#BFE0E6") + P("M16,52 L56,52 L56,57 L16,57Z", "#2A2320", 2.2),
    neck_bead: () => L("M14,12 Q8,40 32,52 Q56,40 50,12", 2.4) + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const t = i / 8; const x = 14 + (50 - 14) * t + Math.sin(t * Math.PI) * (t < 0.5 ? -6 : 6); const y = 12 + Math.sin(t * Math.PI) * 38; return E(x.toFixed(1), y.toFixed(1), 4.4, 4.4, i === 4 ? "#D2462E" : "#8A5A3A", 2); }).join(""),
    neck_jade: () => L("M14,8 Q12,30 32,36 Q52,30 50,8", 2.2, "#8A5A3A") + part("M32,34 C44,36 46,52 32,60 C18,52 20,36 32,34Z", "#6FBF94", "M34,30 L50,30 L50,62 L34,62Z", "#3E8C6E", 2.6) + L("M32,40 L32,54 M32,46 L38,42 M32,50 L26,46", 1.4, "#2A6650"),
    ring_copper: () => E(32, 38, 18, 14, "none", 7, 'stroke="#C27A42"') + E(32, 38, 18, 14, "none", 1.6) + E(32, 38, 11.5, 8, "none", 1.6) + part("M26,16 L38,16 L42,24 L32,30 L22,24Z", "#C27A42", "", "", 2.4),
    ring_moon: () => E(32, 40, 18, 14, "none", 7, 'stroke="#C9CCD1"') + E(32, 40, 18, 14, "none", 1.6) + E(32, 40, 11.5, 8, "none", 1.6) + part("M32,6 C44,6 48,22 38,28 C44,20 38,10 30,12 C30,10 30,8 32,6Z", "#E0A526", "", "", 2.2) + E(32, 20, 7, 7, "#BFE0E6", 2.2),
    mask_fox: () => part("M10,10 L24,22 Q32,20 40,22 L54,10 L54,34 Q48,52 32,58 Q16,52 10,34Z", "#F6F1E6", "M36,6 L60,6 L60,60 L36,60Z", "#E4D8C4") + P("M16,32 Q22,26 28,32 Q22,34 16,32Z M36,32 Q42,26 48,32 Q42,34 36,32Z", "#D2462E", 2) + L("M14,16 L20,24 M50,16 L44,24", 2, "#D2462E") + E(32, 46, 3, 2.4, INK, 0),
    mask_oni: () => part("M12,22 C12,8 52,8 52,22 L50,44 Q32,58 14,44Z", "#D2462E", "M36,4 L60,4 L60,60 L36,60Z", "#A93524") + P("M16,16 L8,0 L24,12Z M48,16 L56,0 L40,12Z", "#F3E6C8", 2.2) + P("M18,26 L30,30 L19,33Z M46,26 L34,30 L45,33Z", "#F3E6C8", 2) + P("M20,40 L44,40 L41,48 L23,48Z", INK, 2) + L("M25,40 L26,48 M32,40 L32,48 M39,40 L38,48", 1.4, "#F3E6C8"),
    mat_stone: () => part("M14,30 L26,10 L42,8 L54,26 L48,50 L24,54Z", "#7BA4C9", "M34,4 L60,4 L60,58 L34,58Z", "#5A82A8") + L("M26,10 L32,28 L42,8 M32,28 L24,54 M32,28 L54,26", 1.6) + E(24, 22, 3, 4, "#fff", 0, 'opacity="0.8"'),
    mat_spore: () => part("M10,34 C10,18 54,18 54,34 Q32,38 10,34Z", "#A69886", "M34,14 L60,14 L60,40 L34,40Z", "#857767") + P("M26,35 L38,35 L40,52 L24,52Z", "#EEDDBB", 2.4) + E(16, 12, 2.6, 2.6, "#E0A526", 1.6) + E(32, 8, 2, 2, "#E0A526", 1.4) + E(48, 14, 2.6, 2.6, "#E0A526", 1.6),
    mat_straw: () => [10, 18, 26, 34, 42, 50].map((x, i) => L(`M${x},56 Q${x + 4},30 ${x + 2 + (i % 2) * 4},8`, 4, "#E3C16A") + L(`M${x},56 Q${x + 4},30 ${x + 2 + (i % 2) * 4},8`, 1.2)).join("") + P("M8,38 L56,36 L56,44 L8,46Z", "#D2462E", 2.2),
    mat_horn: () => part("M10,54 C18,50 30,40 36,26 C40,16 46,8 56,6 C50,16 50,30 44,42 C38,52 24,58 10,54Z", "#EFE3C8", "M30,40 C40,50 50,30 56,6 L64,6 L64,60 L30,60Z", "#D2C3A0", 2.8) + L("M22,48 L26,44 M32,40 L36,34 M40,28 L44,22", 1.6, "#A8977A"),
    pot_hp: () => part("M24,14 L40,14 L40,22 C52,26 54,40 50,48 C46,56 18,56 14,48 C10,40 12,26 24,22Z", "#D2462E", "M36,10 L60,10 L60,60 L36,60Z", "#A93524") + P("M22,6 L42,6 L42,14 L22,14Z", "#8A5A3A", 2.4) + E(24, 34, 3, 6, "#fff", 0, 'opacity="0.75"') + L("M28,40 L36,40 M32,36 L32,44", 2.4, "#F3E6C8"),
    pot_hp2: () => part("M22,12 L42,12 L42,20 C58,26 60,44 54,52 C48,60 16,60 10,52 C4,44 6,26 22,20Z", "#D2462E", "M36,8 L64,8 L64,62 L36,62Z", "#A93524") + P("M20,4 L44,4 L44,12 L20,12Z", "#8A5A3A", 2.4) + P("M14,30 L50,30 L52,40 L12,40Z", "#F3E6C8", 2) + L("M28,35 L36,35", 2.4, "#D2462E"),
    pot_mp: () => part("M10,24 L54,24 C54,44 46,54 32,54 C18,54 10,44 10,24Z", "#3E8C6E", "M36,20 L60,20 L60,58 L36,58Z", "#2A6650") + P("M54,30 Q64,30 62,38 Q60,44 52,42", "none", 2.6) + P("M8,22 L56,22 L56,27 L8,27Z", "#E4D2AA", 2.2) + L("M24,16 Q20,10 26,4 M34,16 Q30,10 36,4", 2, "#8A8178"),
    scroll: () => part("M12,10 L48,10 L48,54 L12,54Z", "#F3E6C8", "M34,6 L52,6 L52,58 L34,58Z", "#E4D2AA", 2.6) + P("M8,6 L52,6 L52,13 L8,13Z M8,51 L52,51 L52,58 L8,58Z", "#8A5A3A", 2.4) + L("M18,22 L42,22 M18,30 L40,30 M18,38 L36,38", 2) + E(40, 44, 5, 5, "#D2462E", 0),
    book: () => part("M6,14 Q20,8 32,14 L32,56 Q20,50 6,56Z", "#F3E6C8", "", "", 2.6) + part("M32,14 Q44,8 58,14 L58,56 Q44,50 32,56Z", "#E4D2AA", "", "", 2.6) + L("M12,24 L26,22 M12,32 L26,30 M38,22 L52,24 M38,30 L52,32", 1.6) + P("M44,8 L50,8 L50,22 L47,19 L44,22Z", "#D2462E", 1.8),
    basket: () => part("M8,28 L56,28 L50,56 L14,56Z", "#C89A5A", "M34,26 L60,26 L60,58 L34,58Z", "#A67A40", 2.6) + L("M10,38 L54,38 M12,47 L52,47 M22,28 L24,56 M32,28 L32,56 M42,28 L40,56", 1.3) + L("M16,28 Q32,4 48,28", 3) + E(24, 24, 6, 5, "#D2462E", 2) + E(38, 23, 5, 5, "#9CC97A", 2),
    anvil: () => part("M6,20 L50,20 Q58,20 60,14 L62,24 Q58,32 46,32 L40,32 L40,42 L48,52 L16,52 L24,42 L24,32 L14,32 Q6,30 6,20Z", "#5A5F68", "M34,16 L64,16 L64,54 L34,54Z", "#44484F", 2.8) + L("M10,22 L46,22", 1.4, "#8C94A0"),
    coin: () => E(32, 32, 22, 22, "#E0A526", 3) + E(32, 32, 15, 15, "none", 1.6) + P("M27,27 L37,27 L37,37 L27,37Z", "#F3E6C8", 2),
    gear: () => { let t = ""; for (let i = 0; i < 8; i++) t += G(`rotate(${i * 45},32,32)`, P("M27,4 L37,4 L38,14 L26,14Z", "#E4D2AA", 2.4)); return t + E(32, 32, 19, 19, "#E4D2AA", 3) + E(32, 32, 7, 7, "#8A5A3A", 2.6); },
    sound: () => P("M10,24 L22,24 L36,12 L36,52 L22,40 L10,40Z", "#E4D2AA", 2.6) + L("M44,22 Q52,32 44,42 M50,16 Q62,32 50,48", 3),
    help: () => E(32, 32, 26, 26, "#E4D2AA", 3) + L("M23,24 Q23,14 32,14 Q42,14 42,23 Q42,30 33,33 L33,40", 4.5) + E(33, 49, 3.4, 3.4, INK, 0),
    exp: () => P("M32,6 L38,26 L58,32 L38,38 L32,58 L26,38 L6,32 L26,26Z", "#E0A526", 2.6),
  };
  const ICON_LIST = Object.keys(I);
  function icon(key, scale = 1.5) { const f = I[key] || I.coin; return svg(64, 64, f(), scale); }

  // ---------------- world props ----------------
  const ROOF = "#9E4A36", ROOF_S = "#7A3528", WOOD = "#8A5A3A", WOOD_S = "#6B4329", WALL = "#F1E2C0", WALL_S = "#DCC79E";
  function tiles(x0, x1, y0, y1, step, col) { let s = ""; for (let x = x0; x <= x1; x += step) s += L(`M${x},${y0} Q${x + step * 0.5},${y0 + (y1 - y0) * 0.5} ${x + 2},${y1}`, 1.4, col); return s; }
  const PROPS = {
    house: (v = 0) => {
      const w = 300, h = 240; const roof = v ? "#3E6A6E" : ROOF, roofS = v ? "#2C4E52" : ROOF_S;
      let s = P(`M40,120 L260,120 L262,236 L38,236Z`, WALL, 3) + F("M190,120 L262,120 L262,236 L190,236Z", WALL_S) + L("M40,120 L260,120 L262,236 L38,236Z", 3);
      s += P("M38,226 L262,226 L262,238 L38,238Z", WOOD, 2.6);
      [40, 110, 190, 258].forEach((x) => (s += P(`M${x - 6},118 L${x + 6},118 L${x + 6},236 L${x - 6},236Z`, WOOD, 2.6)));
      s += P("M128,150 L172,150 L172,236 L128,236Z", WOOD_S, 2.6) + L("M150,150 L150,236", 2);
      s += P("M60,146 L96,146 L96,186 L60,186Z", "#F7EEDA", 2.6) + L("M78,146 L78,186 M60,166 L96,166", 1.6) + P("M206,146 L242,146 L242,186 L206,186Z", "#F7EEDA", 2.6) + L("M224,146 L224,186 M206,166 L242,166", 1.6);
      s += part("M6,124 Q20,112 30,80 L270,80 Q280,112 294,124 Q150,112 6,124Z", roof, "M150,70 L300,70 L300,130 L150,130Z", roofS, 3);
      s += tiles(40, 260, 84, 118, 14, "#00000040");
      s += part("M40,82 Q150,40 260,82 Q150,74 40,82Z", roof, "", "", 3) + P("M24,82 Q20,64 34,62 L40,82Z M276,82 Q280,64 266,62 L260,82Z", roof, 2.6);
      s += L("M40,82 Q150,40 260,82", 4);
      return { w, h, s };
    },
    gate: () => {
      const w = 260, h = 300; let s = "";
      s += part("M44,80 L64,80 L66,298 L42,298Z M196,80 L216,80 L218,298 L194,298Z", "#B5523B", "M56,80 L70,80 L70,300 L56,300Z M208,80 L222,80 L222,300 L208,300Z", "#8E3D2C");
      s += P("M20,96 L240,96 L240,112 L20,112Z", "#B5523B", 3) + P("M70,130 L190,130 L190,146 L70,146Z", "#B5523B", 3);
      s += P("M96,112 L164,112 L164,130 L96,130Z", "#F3E6C8", 2.6);
      s += part("M0,84 Q10,70 24,40 L236,40 Q250,70 260,84 Q130,66 0,84Z", "#3B3330", "M130,30 L260,30 L260,90 L130,90Z", "#2A2320", 3);
      s += L("M24,40 Q130,18 236,40", 4);
      return { w, h, s };
    },
    lanternPost: () => {
      const w = 60, h = 220; let s = P("M27,30 L33,30 L34,218 L26,218Z", WOOD, 2.6) + P("M10,30 L50,30 L50,36 L10,36Z", WOOD, 2.4);
      s += L("M44,36 L44,52", 1.6) + part("M32,52 C32,44 56,44 56,52 L58,80 C58,90 30,90 30,80Z", "#D2462E", "M46,40 L62,40 L62,94 L46,94Z", "#A93524", 2.6);
      s += L("M31,62 L57,62 M30,72 L58,72", 1.2, "#F3E6C8") + P("M38,88 L50,88 L50,94 L38,94Z", "#2A2320", 1.8) + L("M44,94 L44,102", 2, "#E0A526");
      return { w, h, s };
    },
    stall: () => {
      const w = 260, h = 200; let s = "";
      s += P("M30,60 L36,60 L36,198 L30,198Z M224,60 L230,60 L230,198 L224,198Z", WOOD, 2.6);
      s += part("M20,130 L240,130 L240,196 L20,196Z", WOOD, "M180,128 L244,128 L244,200 L180,200Z", WOOD_S);
      s += L("M20,152 L240,152 M20,174 L240,174", 1.4);
      [50, 80, 110, 150, 180, 206].forEach((x, i) => (s += E(x, 124, 12, 9, ["#D2462E", "#E0A526", "#9CC97A", "#D2462E", "#F3E6C8", "#E0A526"][i], 2.4)));
      s += P("M70,118 L80,96 L92,118Z", "#3E8C6E", 2.2) + P("M160,118 L170,100 L180,118Z", "#8A5A3A", 2.2);
      let aw = ""; for (let i = 0; i < 8; i++) aw += P(`M${10 + i * 30},40 L${40 + i * 30},40 L${40 + i * 30},64 Q${25 + i * 30},76 ${10 + i * 30},64Z`, i % 2 ? "#F3E6C8" : "#D2462E", 2.4);
      s += aw + P("M6,30 L254,30 L254,42 L6,42Z", WOOD, 2.6);
      return { w, h, s };
    },
    forge: () => {
      const w = 320, h = 260; let s = "";
      s += part("M190,40 L226,40 L230,180 L186,180Z", "#9A8F84", "M212,40 L232,40 L232,182 L212,182Z", "#7C7268");
      s += L("M190,70 L226,70 M188,110 L228,110 M187,150 L229,150 M206,40 L206,70 M200,110 L200,150 M214,70 L214,110", 1.4);
      s += P("M40,80 L46,80 L46,258 L40,258Z M270,80 L276,80 L276,258 L270,258Z", WOOD, 2.6);
      s += part("M20,92 Q40,84 50,64 L270,64 Q280,84 300,92 Q160,80 20,92Z", "#5E5550", "M160,60 L300,60 L300,96 L160,96Z", "#48413D", 3);
      s += part("M120,170 C120,140 200,140 200,170 L206,258 L114,258Z", "#7C7268", "M170,140 L210,140 L210,260 L170,260Z", "#625A52");
      s += P("M138,200 Q160,176 182,200 L182,236 L138,236Z", "#2A2320", 2.6) + P("M146,232 Q150,206 160,198 Q164,212 172,208 Q176,222 174,232Z", "#E0A526", 2) + P("M152,232 Q156,218 160,212 Q164,222 168,232Z", "#D2462E", 1.6);
      s += part("M228,216 L282,216 L278,226 L262,228 L266,246 L276,250 L234,250 L244,246 L248,228 L232,226Z", "#5A5F68", "M256,212 L290,212 L290,252 L256,252Z", "#44484F", 2.8);
      s += P("M60,226 L104,226 L100,258 L64,258Z", "#8A5A3A", 2.6) + E(82, 226, 22, 5, "#7BA4C9", 2.4);
      return { w, h, s };
    },
    board: () => {
      const w = 160, h = 200; let s = P("M22,40 L30,40 L32,198 L20,198Z M130,40 L138,40 L140,198 L128,198Z", WOOD, 2.6);
      s += part("M10,44 L150,44 L150,140 L10,140Z", "#A8774E", "M110,40 L154,40 L154,144 L110,144Z", "#8A5A3A");
      s += P("M22,56 L66,54 L68,96 L24,98Z", "#F3E6C8", 2.4) + P("M78,60 L136,58 L136,112 L80,114Z", "#F3E6C8", 2.4) + P("M30,104 L70,104 L68,132 L30,130Z", "#F3E6C8", 2.4);
      s += L("M30,68 L58,67 M30,78 L60,77 M30,88 L52,87 M88,72 L126,71 M88,84 L128,83 M88,96 L114,95 M36,114 L62,114 M36,122 L56,122", 1.4, "#8A8178");
      s += E(45, 56, 3, 3, "#D2462E", 1.6) + E(107, 60, 3, 3, "#D2462E", 1.6) + E(50, 105, 3, 3, "#D2462E", 1.6);
      s += part("M0,46 Q80,20 160,46 L160,36 Q80,10 0,36Z", "#3B3330", "", "", 2.6);
      return { w, h, s };
    },
    pavilion: () => {
      const w = 300, h = 270; let s = "";
      s += P("M20,250 L280,250 L284,268 L16,268Z", "#B8AFA4", 2.6);
      [50, 120, 180, 250].forEach((x) => (s += P(`M${x - 6},120 L${x + 6},120 L${x + 6},250 L${x - 6},250Z`, "#B5523B", 2.6)));
      s += P("M60,160 L240,160 L240,250 L60,250Z", "#E4D2AA", 2.6) + L("M60,190 L240,190 M60,220 L240,220", 1.6, "#B8A47E");
      for (let i = 0; i < 9; i++) s += P(`M${72 + i * 18},164 L${84 + i * 18},164 L${84 + i * 18},188 L${72 + i * 18},188Z`, ["#D2462E", "#3E8C6E", "#2E3A5C", "#E0A526"][i % 4], 1.8);
      for (let i = 0; i < 9; i++) s += P(`M${72 + i * 18},194 L${84 + i * 18},194 L${84 + i * 18},218 L${72 + i * 18},218Z`, ["#3E8C6E", "#E0A526", "#D2462E", "#2E3A5C"][i % 4], 1.8);
      s += part("M0,124 Q16,110 30,76 L270,76 Q284,110 300,124 Q150,108 0,124Z", "#3E6A6E", "M150,70 L300,70 L300,130 L150,130Z", "#2C4E52", 3);
      s += part("M40,80 Q150,30 260,80 Q150,70 40,80Z", "#3E6A6E", "", "", 3) + L("M40,80 Q150,30 260,80", 4);
      s += P("M126,90 L174,90 L174,112 L126,112Z", "#F3E6C8", 2.4);
      return { w, h, s };
    },
    tree: (v = 0) => {
      const w = 220, h = 280; const g = v === 1 ? "#7FB065" : "#6FA858", gs = v === 1 ? "#5E9049" : "#4F8A41";
      let s = part("M98,150 L122,150 L128,278 L92,278Z", WOOD, "M112,150 L132,150 L132,280 L112,280Z", WOOD_S);
      s += L("M110,200 L86,170 M112,180 L140,156", 4) + L("M110,200 L86,170 M112,180 L140,156", 1.6, WOOD);
      s += part("M30,140 C10,120 20,80 50,76 C50,40 90,20 118,34 C140,12 190,30 186,70 C214,84 210,130 186,144 C180,170 140,176 120,164 C100,180 54,172 30,140Z", g,
        "M110,110 C150,130 200,110 210,90 L220,180 L100,180Z", gs);
      s += L("M60,110 Q70,104 80,110 M140,80 Q150,74 160,80 M120,130 Q130,124 140,130 M70,70 Q80,64 90,70", 1.6, gs);
      return { w, h, s };
    },
    bush: () => {
      const w = 140, h = 70; return { w, h, s: part("M6,68 C0,48 16,36 30,40 C34,20 60,14 72,28 C84,12 114,18 116,38 C134,38 142,58 134,68Z", "#7FB065", "M70,40 C100,56 130,52 140,40 L140,70 L60,70Z", "#5E9049") + L("M30,52 Q36,48 42,52 M80,40 Q86,36 92,40", 1.4, "#4F8A41") };
    },
    fence: () => {
      const w = 140, h = 70; let s = "";
      [12, 70, 128].forEach((x) => (s += part(`M${x - 6},6 L${x + 6},6 L${x + 6},68 L${x - 6},68Z`, "#B08458", `M${x + 1},0 L${x + 8},0 L${x + 8},70 L${x + 1},70Z`, "#8A6440", 2.6) + P(`M${x - 6},6 L${x},0 L${x + 6},6Z`, "#B08458", 2.4)));
      s += P("M0,20 L140,18 L140,28 L0,30Z", "#C89A6A", 2.6) + P("M0,44 L140,42 L140,52 L0,54Z", "#C89A6A", 2.6);
      return { w, h, s };
    },
    haystack: () => {
      const w = 150, h = 110; let s = part("M8,106 C2,60 30,10 76,8 C122,10 148,60 142,106Z", "#E3C16A", "M90,4 C140,30 150,90 140,110 L150,110 L150,0Z", "#C9A44E");
      s += L("M24,90 Q40,60 36,30 M50,96 Q60,60 62,20 M80,100 Q86,60 82,14 M104,96 Q108,64 100,24 M124,92 Q126,70 116,40", 1.4, "#A8863A");
      s += P("M14,70 Q76,58 136,70 L138,80 Q76,68 12,80Z", "#8A5A3A", 2.4);
      return { w, h, s };
    },
    rock: () => {
      const w = 120, h = 80; return { w, h, s: part("M6,78 C2,50 20,24 48,20 C64,6 98,14 108,38 C118,52 118,68 114,78Z", "#9A9488", "M70,10 C120,30 124,70 114,80 L120,80 L120,0Z", "#7A746A") + L("M40,40 L52,50 L48,62 M80,30 L88,42", 1.6) + part("M20,40 C28,30 40,28 44,32 C40,38 28,42 20,40Z", "#8FB07A", "", "", 2) };
    },
    boulder: () => {
      const w = 190, h = 130; return { w, h, s: part("M6,128 C0,80 30,30 80,22 C110,4 160,20 176,60 C192,84 190,110 184,128Z", "#8F8A80", "M120,10 C190,40 196,110 184,130 L190,130 L190,0Z", "#706B62") + L("M60,60 L80,76 L74,100 M130,50 L144,66 M100,100 L112,112", 1.8) + part("M40,50 C56,32 84,30 92,38 C80,48 56,54 40,50Z", "#7FA45E", "", "", 2.2) };
    },
    bamboo: () => {
      const w = 160, h = 340; let s = "";
      [[30, 0], [70, -4], [112, 2], [140, 6]].forEach(([x, lean], i) => {
        const c = i % 2 ? "#7FA45E" : "#6E9A52";
        s += G(`rotate(${lean},${x},340)`, part(`M${x - 6},20 L${x + 6},20 L${x + 6},340 L${x - 6},340Z`, c, `M${x + 1},0 L${x + 9},0 L${x + 9},340 L${x + 1},340Z`, "#557E3E", 2.6) +
          [80, 150, 220, 290].map((y) => L(`M${x - 6},${y} L${x + 6},${y}`, 2)).join(""));
      });
      [[30, 60, -1], [70, 110, 1], [112, 40, 1], [140, 150, -1], [30, 180, 1], [70, 230, -1]].forEach(([x, y, d]) => {
        s += part(`M${x},${y} C${x + 20 * d},${y - 14} ${x + 44 * d},${y - 10} ${x + 54 * d},${y - 2} C${x + 40 * d},${y + 6} ${x + 18 * d},${y + 6} ${x},${y}Z`, "#8FB07A", "", "", 2.2);
      });
      return { w, h, s };
    },
    stoneLantern: () => {
      const w = 80, h = 160; let s = P("M24,140 L56,140 L60,158 L20,158Z", "#9A9488", 2.6) + P("M32,90 L48,90 L48,140 L32,140Z", "#9A9488", 2.6);
      s += part("M18,56 L62,56 L58,92 L22,92Z", "#A8A296", "M44,52 L66,52 L66,96 L44,96Z", "#86807A") + P("M30,64 L50,64 L50,84 L30,84Z", "#E0A526", 2.2);
      s += part("M4,58 Q40,24 76,58Z", "#8F8A80", "", "", 2.8) + E(40, 28, 6, 6, "#8F8A80", 2.4);
      return { w, h, s };
    },
    stoneGate: () => {
      const w = 300, h = 330; let s = "";
      s += part("M50,90 L78,90 L82,328 L46,328Z M222,90 L250,90 L254,328 L218,328Z", "#8F8A80", "M66,90 L86,90 L86,330 L66,330Z M238,90 L258,90 L258,330 L238,330Z", "#706B62");
      s += P("M30,110 L270,110 L270,130 L30,130Z", "#8F8A80", 3);
      s += part("M0,92 Q16,80 24,58 L276,58 Q284,80 300,92 Q150,74 0,92Z", "#7A746A", "M150,50 L300,50 L300,96 L150,96Z", "#5E5952", 3);
      s += P("M118,130 L182,130 L182,176 L118,176Z", "#D2462E", 2.8) + L("M130,142 L170,142 M150,142 L150,170 M132,158 L168,158", 3, "#F3E6C8");
      s += L("M60,160 L70,176 M234,200 L242,212", 1.6) + L("M150,176 L150,200", 1.6);
      return { w, h, s };
    },
    pond: () => {
      const w = 340, h = 60; let s = E(170, 30, 166, 26, "#A9D3D8", 3) + E(170, 34, 140, 16, "#8EC1C8", 0);
      s += L("M60,28 Q80,24 100,28 M200,24 Q220,20 240,24 M150,38 Q170,34 190,38", 1.6, "#F3F8F4");
      s += E(80, 30, 16, 6, "#7FB065", 2.2) + E(250, 34, 18, 6, "#7FB065", 2.2) + part("M246,30 C246,20 258,16 262,24 C266,18 272,24 268,30Z", "#F2A8B6", "", "", 2);
      return { w, h, s };
    },
    rice: () => {
      const w = 120, h = 60; let s = "";
      for (let i = 0; i < 9; i++) { const x = 8 + i * 13; s += L(`M${x},58 Q${x + 2},30 ${x + (i % 2 ? 8 : -6)},10`, 3.6, i % 3 ? "#E3C16A" : "#C9A44E") + L(`M${x},58 Q${x + 2},30 ${x + (i % 2 ? 8 : -6)},10`, 1, INK); s += E(x + (i % 2 ? 8 : -6), 10, 3, 5, "#E0A526", 1.4); }
      return { w, h, s };
    },
    flowers: () => {
      const w = 90, h = 40; let s = "";
      [[12, 26, "#D2462E"], [32, 20, "#F3E6C8"], [52, 28, "#E0A526"], [72, 22, "#F2A8B6"]].forEach(([x, y, c]) => (s += L(`M${x},40 L${x},${y}`, 2) + E(x, y, 6, 6, c, 2) + E(x, y, 2, 2, "#E0A526", 0)));
      return { w, h, s };
    },
    well: () => {
      const w = 140, h = 170; let s = P("M24,44 L30,44 L30,168 L24,168Z M110,44 L116,44 L116,168 L110,168Z", WOOD, 2.6);
      s += part("M10,48 L70,20 L130,48Z", ROOF, "M70,16 L134,16 L134,50 L70,50Z", ROOF_S, 2.8);
      s += part("M14,110 L126,110 L122,168 L18,168Z", "#A8A296", "M90,108 L130,108 L130,170 L90,170Z", "#86807A") + L("M16,130 L124,130 M17,150 L123,150 M50,110 L50,130 M90,130 L90,150 M60,150 L60,168", 1.4);
      s += L("M70,48 L70,90", 1.6) + P("M60,90 L80,90 L78,106 L62,106Z", WOOD, 2.2);
      return { w, h, s };
    },
    signpost: () => {
      const w = 160, h = 170; let s = P("M76,30 L84,30 L86,168 L74,168Z", WOOD, 2.6);
      s += part("M10,40 L134,40 L152,58 L134,76 L10,76Z", "#C89A6A", "M10,62 L156,62 L156,80 L10,80Z", "#A8774E", 2.8);
      return { w, h, s };
    },
    signBoard: () => {
      const w = 150, h = 74; let s = L("M30,0 L30,14 M120,0 L120,14", 2.4);
      s += part("M6,14 L144,14 L144,70 L6,70Z", "#B08458", "M6,56 L144,56 L144,72 L6,72Z", "#8A6440", 3);
      s += P("M12,20 L52,20 L52,64 L12,64Z", "#F3E6C8", 2.2);
      return { w, h, s };
    },
    terrace: (wd, ht) => {
      const w = wd, h = ht; let s = part(`M0,12 L${w},12 L${w},${h} L0,${h}Z`, "#9A9488", `M0,${h * 0.6} L${w},${h * 0.6} L${w},${h} L0,${h}Z`, "#7A746A");
      for (let y = 26, r = 0; y < h; y += 22, r++) { s += L(`M0,${y} L${w},${y}`, 1.6); for (let x = (r % 2) * 24; x < w; x += 48) s += L(`M${x},${y - 22 < 12 ? 12 : y - 22} L${x},${y}`, 1.6); }
      s += part(`M-2,0 Q${w / 2},-6 ${w + 2},0 L${w + 2},16 L-2,16Z`, "#8FBF6A", `M-2,10 L${w + 2},10 L${w + 2},18 L-2,18Z`, "#6E9A52", 3);
      for (let x = 10; x < w - 10; x += 26) s += L(`M${x},2 L${x + 3},-8 M${x + 6},2 L${x + 10},-6`, 1.6);
      return { w, h, s };
    },
    spawn: () => ({ w: 160, h: 30, s: `<ellipse cx="80" cy="15" rx="74" ry="11" fill="none" stroke="${INK}" stroke-width="2.4" stroke-dasharray="10 7" opacity="0.35"/>` }),
    bang: () => ({ w: 40, h: 64, s: E(20, 26, 18, 24, "#F3E6C8", 2.6) + P("M16,8 Q20,4 25,8 L22,32 Q20,35 18,32Z", INK, 1) + E(20, 41, 3.6, 3.6, INK, 0) + P("M14,48 L20,62 L26,48Z", "#F3E6C8", 2.4) }),
  };
  function prop(key, ...args) { const p = PROPS[key](...args); return { svg: svg(p.w, p.h, p.s, 2, key !== "spawn"), w: p.w, h: p.h }; }

  // ---------------- backgrounds (tile horizontally, periodic) ----------------
  function ridge(W, baseY, amp, seeds, step = 16) {
    let d = `M0,${baseY}`;
    for (let x = 0; x <= W; x += step) {
      let y = baseY;
      seeds.forEach(([k, a, ph]) => (y -= amp * a * (0.5 + 0.5 * Math.sin((x / W) * Math.PI * 2 * k + ph))));
      d += ` L${x},${y.toFixed(1)}`;
    }
    return d;
  }
  const BG = {
    far: (theme) => {
      const W = 2048, H = 420; const dusk = theme === "farm2";
      const c1 = dusk ? "#A9B4C4" : "#B9CFD6", c2 = dusk ? "#8E9AAE" : "#9DBAC4", c3 = dusk ? "#77839A" : "#86A7B0";
      let s = F(ridge(W, 420, 260, [[2, 0.6, 0.3], [5, 0.25, 1.1], [11, 0.12, 2]]) + ` L${W},${H} L0,${H}Z`, c1, 'opacity="0.9"');
      s += F(ridge(W, 420, 200, [[3, 0.55, 2.2], [7, 0.3, 0.4], [13, 0.1, 1]]) + ` L${W},${H} L0,${H}Z`, c2, 'opacity="0.9"');
      s += L(ridge(W, 420, 200, [[3, 0.55, 2.2], [7, 0.3, 0.4], [13, 0.1, 1]]), 2, INK, 'opacity="0.18"');
      s += F(ridge(W, 420, 120, [[4, 0.5, 1.4], [9, 0.3, 2.6], [17, 0.12, 0.2]]) + ` L${W},${H} L0,${H}Z`, c3);
      s += L(ridge(W, 420, 120, [[4, 0.5, 1.4], [9, 0.3, 2.6], [17, 0.12, 0.2]]), 2.4, INK, 'opacity="0.22"');
      // snow caps / mist bands
      s += `<rect x="0" y="300" width="${W}" height="120" fill="${dusk ? "#C7B8B0" : "#E8EFE8"}" opacity="0.35"/>`;
      return { svg: svg(W, H, s, 1, false), w: W, h: H };
    },
    clouds: (theme) => {
      const W = 2048, H = 260; let s = "";
      const col = theme === "farm2" ? "#EBD9C6" : "#FBF6EA";
      [[180, 80, 1], [620, 140, 0.8], [1020, 60, 1.2], [1460, 120, 0.9], [1840, 70, 1]].forEach(([x, y, k]) => {
        const d = `M${x - 90 * k},${y + 20 * k} C${x - 100 * k},${y - 4 * k} ${x - 60 * k},${y - 20 * k} ${x - 36 * k},${y - 8 * k} C${x - 24 * k},${y - 44 * k} ${x + 30 * k},${y - 44 * k} ${x + 40 * k},${y - 12 * k} C${x + 70 * k},${y - 24 * k} ${x + 104 * k},${y} ${x + 90 * k},${y + 20 * k}Z`;
        s += F(d, col, 'opacity="0.95"') + L(d, 2, INK, 'opacity="0.25"');
      });
      return { svg: svg(W, H, s, 1, false), w: W, h: H };
    },
    mid: (theme) => {
      const W = 2048, H = 320; let s = "";
      if (theme === "village") {
        s += F(ridge(W, 320, 110, [[6, 0.5, 0.5], [14, 0.3, 1.5], [29, 0.15, 0.1]], 12) + ` L${W},${H} L0,${H}Z`, "#8DB98A");
        s += L(ridge(W, 320, 110, [[6, 0.5, 0.5], [14, 0.3, 1.5], [29, 0.15, 0.1]], 12), 2.4, INK, 'opacity="0.3"');
        [140, 520, 900, 1300, 1700].forEach((x, i) => {
          const r = i % 2 ? "#A45A44" : "#6E8E8A";
          s += F(`M${x},250 L${x + 150},250 L${x + 150},320 L${x},320Z`, "#E8D8B4") + L(`M${x},250 L${x + 150},250 L${x + 150},320 L${x},320Z`, 2, INK, 'opacity="0.4"');
          s += F(`M${x - 30},254 Q${x - 18},244 ${x - 10},222 L${x + 160},222 Q${x + 168},244 ${x + 180},254 Q${x + 75},244 ${x - 30},254Z`, r) + L(`M${x - 30},254 Q${x - 18},244 ${x - 10},222 L${x + 160},222 Q${x + 168},244 ${x + 180},254`, 2, INK, 'opacity="0.45"');
          s += F(`M${x + 40},300 L${x + 60},300 L${x + 60},320 L${x + 40},320Z`, "#8A5A3A", 'opacity="0.7"');
        });
        [360, 760, 1120, 1520, 1940].forEach((x) => (s += F(`M${x},320 C${x - 40},300 ${x - 50},240 ${x},220 C${x + 50},240 ${x + 40},300 ${x},320Z`, "#6E9E68") + L(`M${x},320 C${x - 40},300 ${x - 50},240 ${x},220 C${x + 50},240 ${x + 40},300 ${x},320`, 2, INK, 'opacity="0.3"')));
      } else if (theme === "farm1") {
        s += F(ridge(W, 320, 90, [[5, 0.5, 2], [12, 0.3, 0.7]], 12) + ` L${W},${H} L0,${H}Z`, "#A8C77C");
        s += L(ridge(W, 320, 90, [[5, 0.5, 2], [12, 0.3, 0.7]], 12), 2.4, INK, 'opacity="0.28"');
        for (let i = 0; i < 4; i++) s += F(`M0,${250 + i * 18} L${W},${246 + i * 18} L${W},${258 + i * 18} L0,${262 + i * 18}Z`, i % 2 ? "#E3C16A" : "#D9B85A", 'opacity="0.8"');
        [200, 700, 1180, 1640].forEach((x, i) => {
          s += F(`M${x},250 C${x - 60},246 ${x - 70},190 ${x - 20},178 C${x - 10},140 ${x + 60},140 ${x + 70},180 C${x + 110},190 ${x + 100},246 ${x + 40},250Z`, i % 2 ? "#7FB065" : "#6FA858") + L(`M${x},250 C${x - 60},246 ${x - 70},190 ${x - 20},178 C${x - 10},140 ${x + 60},140 ${x + 70},180 C${x + 110},190 ${x + 100},246 ${x + 40},250`, 2, INK, 'opacity="0.3"');
        });
        [460, 1420].forEach((x) => (s += F(`M${x},252 L${x + 70},252 L${x + 70},230 L${x},230Z`, "#E8D8B4") + F(`M${x - 14},232 L${x + 35},208 L${x + 84},232Z`, "#A45A44") + L(`M${x - 14},232 L${x + 35},208 L${x + 84},232`, 2, INK, 'opacity="0.45"')));
      } else {
        for (let k = 0; k < 4; k++) {
          const y = 160 + k * 40; const d = ridge(W, y + 40, 50, [[3 + k, 0.6, k], [8 + k, 0.2, 2 * k]], 12);
          s += F(d + ` L${W},${H} L0,${H}Z`, ["#9CB08E", "#8DA67E", "#7F9A72", "#728E66"][k]) + L(d, 2, INK, 'opacity="0.3"');
        }
        for (let x = 30; x < W; x += 70 + ((x * 7) % 50)) { const hgt = 120 + ((x * 13) % 80); s += F(`M${x},320 L${x + 6},320 L${x + 5},${320 - hgt} L${x + 1},${320 - hgt}Z`, "#5E7E56", 'opacity="0.85"'); s += F(`M${x + 3},${320 - hgt} C${x + 20},${310 - hgt} ${x + 30},${318 - hgt} ${x + 34},${326 - hgt} C${x + 20},${330 - hgt} ${x + 10},${326 - hgt} ${x + 3},${320 - hgt}Z`, "#6E8E62", 'opacity="0.85"'); }
      }
      return { svg: svg(W, H, s, 1, false), w: W, h: H };
    },
    ground: (theme) => {
      const W = 512, H = 200; let s = "";
      const top = theme === "farm2" ? "#7FA45E" : theme === "farm1" ? "#9CC97A" : "#A9C98A";
      const dirt = theme === "farm2" ? "#8E7A64" : theme === "farm1" ? "#B8946A" : "#C9A97C";
      const dirtS = theme === "farm2" ? "#76644F" : theme === "farm1" ? "#9E7B55" : "#B08F64";
      s += F(`M0,14 L${W},14 L${W},${H} L0,${H}Z`, dirt);
      s += F(`M0,80 L${W},80 L${W},${H} L0,${H}Z`, dirtS);
      for (let i = 0; i < 18; i++) { const x = (i * 97) % W, y = 40 + ((i * 53) % 140); s += E(x, y, 6 + (i % 4) * 2, 3 + (i % 3), theme === "farm2" ? "#A69C8E" : "#D9C29C", 1.4); }
      if (theme === "village") for (let x = 0; x < W; x += 64) s += F(`M${x + 4},20 L${x + 60},20 L${x + 58},34 L${x + 6},34Z`, "#D9C29C") + L(`M${x + 4},20 L${x + 60},20 L${x + 58},34 L${x + 6},34Z`, 1.4, INK, 'opacity="0.5"');
      s += F(`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${W / 2},18 Q${W / 4},12 0,18Z`, top);
      s += L(`M0,0 L${W},0`, 3.4) + L(`M0,18 Q${W / 4},12 ${W / 2},18 Q${W * 0.75},24 ${W},18`, 1.6, INK, 'opacity="0.5"');
      for (let x = 8; x < W; x += 22) s += L(`M${x},1 L${x - 3},-9 M${x + 5},1 L${x + 7},-7`, 2, "#4F8A41");
      return { svg: svg(W, H + 12, G("translate(0,10)", s), 1, false), w: W, h: H + 12 };
    },
  };

  // ---------------- seals (class glyphs) ----------------
  const SEALS = {
    kiem: (c) => P("M6,6 L58,6 L58,58 L6,58Z", c, 3) + L("M12,12 L52,12 L52,52 L12,52Z", 1.6, "#F3E6C8") + L("M20,46 L44,18 M26,22 L42,38 M18,48 L24,42", 4, "#F3E6C8"),
    anh: (c) => E(32, 32, 27, 27, c, 3) + E(32, 32, 21, 21, "none", 1.6, 'stroke="#F3E6C8"') + L("M18,24 Q32,14 46,24 M16,34 Q32,24 48,34 M20,44 Q32,36 44,44", 3.4, "#F3E6C8"),
    linh: (c) => P("M32,4 C46,4 50,16 44,24 C58,30 58,58 32,60 C6,58 6,30 20,24 C14,16 18,4 32,4Z", c, 3) + L("M32,26 C40,26 42,36 34,40 C28,42 24,36 28,32 C30,30 34,31 33,34", 3, "#F3E6C8") + E(32, 14, 3, 3, "#F3E6C8", 0),
    novice: (c) => P("M6,6 L58,6 L58,58 L6,58Z", c, 3) + L("M20,20 L44,20 M32,20 L32,46 M20,46 L44,46", 4, "#F3E6C8"),
  };
  function seal(key, color, scale = 2) { return svg(64, 64, SEALS[key](color), scale); }

  // ---------------- rasterising ----------------
  function toURL(svgText) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText); }
  function loadImage(svgText) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = toURL(svgText); });
  }

  // H: the drawing helpers, so extension files (art_*.js) draw in exactly the same hand.
  const H = { svg, P, L, F, E, part, G, eyes, monsterFace, INK, SKIN, SKIN_S, BLUSH, ROOF, ROOF_S, WOOD, WOOD_S, WALL, WALL_S, ridge, tiles };
  window.ART = { chibi, ninjaFrames, ninjaPortrait, NINJA_POSES, SCARF_ANCHOR, npcFrames, NPC_LOOKS, monsterFrames, MONSTER_ART, icon, I, ICON_LIST, prop, PROPS, BG, seal, SEALS, toURL, loadImage, WEAPON_LOOK, H };
})();
