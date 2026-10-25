// Word Ninja: the quest givers of the Lv.30-50 chapter, in the same hand as art_npc.js.
(function () {
  const { P, L, F, E, part, G, INK, SKIN, SKIN_S, BLUSH } = window.ART.H;
  const CLOUD = "#BFE0E6", CLOUD_S = "#8FB6C6";
  const MECH = "#6E7480", MECH_S = "#4C525E";
  const MOSS2 = "#8FB07A", MOSS2_D = "#5E8A46";
  const BOLT = "#F2D479", BOLT_S = "#E0A526";
  const SPIRIT = "#7FE6C0";

  Object.assign(window.ART.NPC_LOOKS, {
    // Vân Du: the sky-sea guide
    guide: {
      hood: false,
      top: "#4E7A8A", topS: "#365A68", sleeve: "#4E7A8A", sleeveS: "#365A68",
      pants: "#3A5A66", pantsS: "#2A424C", belt: "#E0A526", beltS: "#B8841A", collar: "#EAF6F8",
      wrap: "#CDB88E", shoe: "#2A2320",
      hair: P("M-30,0 C-31,-24 -12,-34 2,-34 C24,-34 33,-22 31,-2 Q20,-12 2,-12 Q-14,-12 -26,2 Q-24,-4 -30,0Z", "#5E7A86", 2.4),
      face:
        eyesBandHalf() +
        L("M-2,2 Q4,-4 11,1 M15,1 Q22,-4 29,2", 2.6, "#4E7A8A") +
        L("M9,20 Q13,23 17,20", 1.6),
      headTop:
        // a feathered sky hat with a little cloud crest
        part("M-42,-8 Q0,-46 42,-8 Q0,-18 -42,-8Z", CLOUD, "M-42,-28 L42,-28 L42,-4 L-42,-4Z", CLOUD_S, 2.8) +
        L("M-30,-14 Q0,-36 30,-14", 1.4, "#8FB6C6") + E(0, -28, 5, 3, "#EAF6F8", 1.8) +
        P("M-14,-34 C-20,-46 -10,-52 -4,-44 C0,-50 10,-48 8,-40 C14,-40 14,-32 8,-30Z", "#F3E6C8", 2.2),
      backItem: (p) => G(`translate(92,${112 + p.bob}) rotate(22)`,
        part("M-2.6,-46 L2.6,-46 L3,46 L-3,46Z", "#8A7A5E", "M0.8,-46 L4.4,-46 L4.4,48 L0.8,48Z", "#6E6149", 2.4) +
        L("M-3,-20 L3,-20 M-3,6 L3,6", 1.4, "#5E5540")),
      front: (p) => G(`translate(84,${104 + p.bob}) rotate(12)`,
        part("M-2.6,-70 L2.6,-70 L3,40 L-3,40Z", "#6B4329", "M0.8,-70 L4.2,-70 L4.2,42 L0.8,42Z", "#4E3020", 2.4) +
        E(0, -78, 13, 13, CLOUD, 0, 'opacity="0.3"') + E(0, -78, 9, 9, CLOUD_S, 2.6) + E(0, -78, 4, 4, "#EAF6F8", 0) +
        G("translate(0,8)", E(0, 0, 5.6, 5.6, SKIN, 2.4))),
    },

    // Thủ Cổ Thiên Cơ: keeper of the old citadel
    keeper: {
      hood: false,
      top: MECH, topS: MECH_S, sleeve: MECH, sleeveS: MECH_S,
      pants: "#3E4658", pantsS: "#2A3040", apron: "#5A616E", apronS: "#3E4658",
      belt: BOLT_S, beltS: "#8A5A12", collar: "#9AA1AE",
      bracer: "#4C525E", wrap: "#8C94A0", shoe: "#2A2320", hand: SKIN,
      hair: "",
      face:
        L("M-2,1 Q4,-4 11,1 M15,1 Q22,-4 29,2", 3, MECH_S) +
        L("M28,6 L24,18", 1.6, "#B4574A") + L("M9,20 Q13,22 17,20", 1.6) + L("M6,26 Q13,32 20,26", 1.6, "#8A8178"),
      headTop:
        // a riveted bronze helm
        part("M-34,-6 C-34,-34 32,-34 32,-6 Q0,-16 -34,-6Z", "#8C6A4A", "M-34,-28 L34,-28 L34,-10 L-34,-10Z", "#664B32", 2.8) +
        L("M-30,-14 Q0,-24 30,-14", 1.3, "#C9A46A") +
        P("M-35,-4 Q0,-14 35,-4 L35,4 Q0,-6 -35,4Z", BOLT_S, 2.4) +
        E(0, -28, 3.4, 3.4, BOLT, 1.8) + E(-16, -22, 2.4, 2.4, "#C9A46A", 1.6) + E(16, -22, 2.4, 2.4, "#C9A46A", 1.6),
      front: (p) => G(`translate(84,${102 + p.bob}) rotate(14)`,
        part("M-2.8,-74 L2.8,-74 L3,42 L-3,42Z", "#5A4A3E", "M0.8,-74 L4.4,-74 L4.4,44 L0.8,44Z", "#3E332A", 2.4) +
        E(0, -82, 12, 12, "#2A2320", 2.6) + E(0, -82, 6, 6, BOLT, 0) + E(0, -82, 3, 3, "#FFF3C8", 0) +
        L("M-6,-82 L-2,-82 M2,-82 L6,-82", 1.6, BOLT)),
    },

    // Linh Tăng: the forest monk
    forestmonk: {
      hood: false,
      robe: "#5E7A4E", robeS: "#445C38", sleeve: "#5E7A4E", sleeveS: "#445C38",
      belt: "#C9A44E", beltS: "#A8862E", collar: "#DCE8C8",
      wrap: "#CDB88E", shoe: "#3E332A",
      hair: "",
      face:
        L("M-2,1 Q4,-4 11,1 M15,1 Q22,-4 29,2", 3.2, "#4E6A40") +
        L("M-1,10 Q3,6 7,10 M17,10 Q21,6 25,10", 2.4) +
        L("M9,21 Q13,24 17,21", 1.6) +
        E(-4, 18, 4, 2.2, BLUSH, 0, 'opacity="0.85"') + E(27, 17, 3.4, 2, BLUSH, 0, 'opacity="0.85"'),
      headTop: L("M-24,-8 Q0,-22 24,-8", 1.6, "#B9B0A4") + L("M-14,-16 Q0,-22 14,-16", 1.2, "#C6BEB2") + E(14, -18, 4, 4, SPIRIT, 0, 'opacity="0.6"'),
      backItem: (p) => G(`translate(30,${58 + p.bob}) rotate(-8)`,
        part("M-2.6,0 L2.6,0 L3,86 L-3,86Z", "#7E6A4E", "M0.6,0 L4,0 L4,88 L0.6,88Z", "#5E5038", 2.4) +
        E(0, 10, 12, 12, MOSS2, 0, 'opacity="0.9"') + L("M-4,5 Q0,-6 4,5", 1.8, MOSS2_D)),
      front: (p) =>
        G(`translate(0,${p.bob})`,
          L("M48,88 Q62,104 78,88", 2.2, INK) +
          [0, 1, 2, 3, 4, 5, 6].map((i) => { const t = i / 6, x = 48 + 30 * t, y = 88 + Math.sin(t * Math.PI) * 16; return E(x, y, 3.6, 3.6, i === 3 ? SPIRIT : "#7E6A4E", 1.8); }).join("")) +
        G(`translate(84,${100 + p.bob}) rotate(14)`,
          part("M-2.6,-70 L2.6,-70 L3,42 L-3,42Z", "#7E6A4E", "M0.8,-70 L4.2,-70 L4.2,44 L0.8,44Z", "#5E5038", 2.4) +
          E(0, -78, 13, 13, SPIRIT, 0, 'opacity="0.28"') + E(0, -78, 9, 9, "#3E8C6E", 2.6) +
          P("M-4,-84 Q0,-70 4,-84 Q0,-90 -4,-84Z", SPIRIT, 2) +
          G("translate(0,8)", E(0, 0, 5.6, 5.6, SKIN, 2.4))),
    },

    // Lôi Tướng: the thunder-range general
    thundergeneral: {
      hood: false,
      top: "#3E4658", topS: "#2A3040", sleeve: "#3E4658", sleeveS: "#2A3040",
      pants: "#333A4A", pantsS: "#232838",
      belt: BOLT_S, beltS: "#8A5A12", collar: "#9AA1AE",
      bracer: "#4C525E", wrap: "#8C94A0", shoe: "#2A2320", hand: SKIN,
      hair: P("M-30,0 C-31,-24 -12,-34 2,-34 C24,-34 33,-22 31,-2 Q20,-12 2,-12 Q-14,-12 -26,2 Q-24,-4 -30,0Z", "#4A4560", 2.4),
      brows: L("M-4,2 L8,6 M16,6 L28,0", 3.6, "#2A2320"),
      face:
        P("M2,22 Q11,44 20,22 Q21,34 11,41 Q5,35 2,22Z", "#6B6560", 2.2) +
        L("M4,24 Q2,29 6,31 M28,22 Q30,26 26,29", 1.4, "#C0B4A6") + L("M9,20 Q13,23 17,20", 1.6),
      headTop:
        // a storm helm with two lightning horns
        part("M-32,-8 C-32,-34 32,-34 32,-8 Q0,-18 -32,-8Z", "#4A4F58", "M-32,-28 L32,-28 L32,-12 L-32,-12Z", "#333840", 2.8) +
        P("M-26,-14 L-40,-40 L-18,-20Z M26,-14 L40,-40 L18,-20Z", BOLT, 2.4) +
        part("M-33,-6 Q0,-16 33,-6 L33,3 Q0,-7 -33,3Z", BOLT_S, 2.4) + E(0, -28, 3.6, 3.6, BOLT, 1.8),
      front: (p) => G(`translate(86,${102 + p.bob}) rotate(16)`,
        part("M-2.8,-76 L2.8,-76 L2.8,30 L-2.8,30Z", "#4A3A30", "M0.8,-76 L4.6,-76 L4.6,32 L0.8,32Z", "#33281F", 2.4) +
        P("M-2.8,-78 L0,-96 L2.8,-78Z", "#E6E4DE", 2.2) +
        P("M2.8,-76 C-12,-80 -22,-72 -19,-58 C-11,-62 -4,-64 2.8,-60Z", "#B9B6AE", 2.6) +
        P("M-6,-46 L8,-42 L0,-30 L8,-22 L-4,-24 L0,-36Z", BOLT, 2.2)),
    },

    // Trưởng Lão Thiên Mệnh: the fate-hall elder
    fateElder: {
      hood: false,
      robe: "#C9D4E8", robeS: "#9AB0CE", sleeve: "#C9D4E8", sleeveS: "#9AB0CE",
      belt: "#E0A526", beltS: "#B8841A", collar: "#F3F6FC",
      wrap: "#CDB88E", shoe: "#4A3A30",
      hair:
        P("M-33,-4 C-34,-28 -12,-38 4,-37 C26,-36 36,-22 33,-4 C28,-16 18,-22 4,-22 C-12,-22 -26,-14 -33,-4Z", "#DCE4F0", 2.4) +
        P("M-33,-6 C-40,14 -40,36 -34,52 C-26,38 -24,20 -25,-2Z", "#C3D0E4", 2.2) +
        P("M33,-6 C40,14 40,36 34,52 C26,38 24,20 25,-2Z", "#DCE4F0", 2.2),
      face:
        L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 3.4, "#AEC0DC") + L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 1.2) +
        P("M0,19 Q14,50 28,19 Q27,36 14,45 Q4,36 0,19Z", "#DCE4F0", 2.4) +
        L("M2,24 Q8,29 13,24 M16,24 Q21,29 26,24", 1.4, "#AEC0DC") +
        E(-4, 18, 4, 2.2, BLUSH, 0, 'opacity="0.85"') + E(27, 17, 3.4, 2, BLUSH, 0, 'opacity="0.85"'),
      headTop:
        // a tall fate crown with a floating seal
        part("M-30,-10 L-24,-30 L-12,-16 L0,-34 L12,-16 L24,-30 L30,-10 Z", "#8FA4C4", "M-30,-30 L30,-30 L30,-8 L-30,-8Z", "#6E86AC", 2.6) +
        E(0, -30, 6, 6, "#C8F4FC", 0, 'opacity="0.5"') + E(0, -30, 3, 3, "#FFF6D8", 0),
      backItem: (p) =>
        P("M42,84 C24,88 10,98 2,126 C22,132 42,126 54,112Z", "#9AB0CE", "M34,80 L60,80 L60,130 L34,130Z", "#7E94B4", 2.8) +
        G(`translate(88,${100 + p.bob}) rotate(10)`,
          part("M-2.8,-72 L2.8,-72 L3,34 L-3,34Z", "#8A7A5E", "M0.8,-72 L4.4,-72 L4.4,36 L0.8,36Z", "#6E6149", 2.4) +
          E(0, -80, 13, 13, "#C8F4FC", 0, 'opacity="0.3"') + E(0, -80, 9, 9, "#8FA4C4", 2.6) +
          L("M0,-86 L0,-74", 1.6, "#FFF6D8") + E(0, -88, 3.4, 3.4, "#FFF6D8", 0)),
    },
  });

  // the half-lidded eye band, shared by the calm elders
  function eyesBandHalf() {
    return F("M-8,-4 L34,-4 L34,18 L-8,18Z", SKIN) + F("M22,-4 L34,-4 L34,18 L22,18Z", SKIN_S) +
      L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 3.2, "#8A8178") +
      E(-4, 18, 4, 2.2, BLUSH, 0, 'opacity="0.85"') + E(27, 17, 3.4, 2, BLUSH, 0, 'opacity="0.85"');
  }
})();
