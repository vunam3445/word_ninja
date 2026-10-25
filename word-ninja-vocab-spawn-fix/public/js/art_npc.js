// Word Ninja: the four quest givers of levels 10-30.
// Looks only: the frames come from ART.npcFrames + chibi, exactly like the village NPCs.
(function () {
  const H = window.ART.H;
  const { P, L, F, E, part, G, INK, SKIN, SKIN_S, BLUSH } = H;

  // both the sage and the monk look out from under heavy lids, so their eye band is
  // repainted flat (and re-shaded) before the closed/half eyes go on.
  const eyeBand = F("M-8,-4 L34,-4 L34,18 L-8,18Z", SKIN) + F("M22,-4 L34,-4 L34,18 L22,18Z", SKIN_S);
  const blush = E(-4, 18, 4, 2.2, BLUSH, 0, 'opacity="0.85"') + E(27, 17, 3.4, 2, BLUSH, 0, 'opacity="0.85"');

  Object.assign(window.ART.NPC_LOOKS, {
    // Ẩn Sĩ Trúc Lâm: an old bamboo-forest sage
    hermit: {
      hood: false,
      robe: "#CDBFA2", robeS: "#A99B7E", sleeve: "#CDBFA2", sleeveS: "#A99B7E",
      belt: "#8A7A5E", beltS: "#6B5E46", collar: "#F3E6C8",
      wrap: "#CDB88E", shoe: "#4A3A30",
      hair:
        P("M-33,-4 C-34,-28 -12,-38 4,-37 C26,-36 36,-22 33,-4 C28,-16 18,-22 4,-22 C-12,-22 -26,-14 -33,-4Z", "#D2D5DA", 2.4) +
        P("M-33,-6 C-39,12 -39,32 -34,46 C-27,34 -25,18 -25,-2Z", "#B8BBC1", 2.2) +
        P("M33,-6 C39,12 39,32 34,46 C27,34 25,18 25,-2Z", "#D2D5DA", 2.2) +
        L("M-24,-24 Q-10,-30 6,-28 M-30,-12 Q-24,-18 -18,-19", 1.2, "#A9AEB5"),
      headTop:
        // a woven bamboo hat, low over the brow
        part("M-44,-10 Q0,-52 44,-10 Q0,-20 -44,-10Z", "#E3C16A", "M-44,-30 L44,-30 L44,-4 L-44,-4Z", "#C9A44E", 2.8) +
        L("M-32,-16 Q0,-40 32,-16 M-18,-22 Q0,-38 18,-22", 1.4, "#B8963E") +
        L("M-40,-12 Q0,-22 40,-12", 2, INK) + E(0, -32, 3, 3, "#8A7A5E", 1.8),
      face:
        eyeBand +
        L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 3.2, "#C9CCD1") + L("M-2,-1 Q3,-5 8,-1 M16,-1 Q21,-5 27,-2", 1.1) +
        L("M-1,9 Q3,5 7,9 M17,9 Q21,5 25,9", 2.4) +
        P("M0,19 Q14,50 28,19 Q27,36 14,45 Q4,36 0,19Z", "#D2D5DA", 2.4) +
        L("M2,24 Q8,29 13,24", 1.4, "#A9AEB5") + L("M16,24 Q21,29 26,24", 1.4, "#A9AEB5") +
        blush,
      backItem: (p) => G(`translate(30,${58 + p.bob}) rotate(-8)`,
        part("M-2.6,0 L2.6,0 L3,86 L-3,86Z", "#8A7A5E", "M0.6,0 L4,0 L4,88 L0.6,88Z", "#6E6149", 2.4) +
        part("M0,-8 C-10,-8 -11,4 -5,8 C-13,13 -12,28 0,30 C12,28 13,13 5,8 C11,4 10,-8 0,-8Z", "#7FA45E",
          "M3,-12 L14,-12 L14,34 L3,34Z", "#5E8A46", 2.4) +
        L("M-5,9 L5,9", 1.8, "#C89A5A")),
      // a walking stave, held out to the side so it clears the beard
      front: (p) => G(`translate(84,${100 + p.bob}) rotate(16)`,
        part("M-2.8,-76 L2.8,-76 L3,44 L-3,44Z", "#8A7A5E", "M0.8,-76 L4.4,-76 L4.4,46 L0.8,46Z", "#6E6149", 2.4) +
        L("M-3,-50 L3,-50 M-3,-20 L3,-20 M-3,10 L3,10", 1.6, "#5E5540") +
        P("M-3,44 L3,44 L3,52 L-3,52Z", "#C89A5A", 2.2) +
        P("M-4,-76 C-4,-84 6,-86 8,-78 L4,-72Z", "#8A7A5E", 2.2) + L("M-4,-76 C-4,-84 6,-86 8,-78", 1.6, "#5E5540") +
        G("translate(0,8)", E(0, 0, 5.6, 5.6, SKIN, 2.4) + L("M-3.4,-2 Q0,-5 3.4,-2", 1.2))),
    },

    // Thợ Săn Hắc Nha: a valley hunter
    hunter: {
      hood: "#3A3A42", hoodS: "#26282F",
      top: "#5A4232", topS: "#3E2C22", sleeve: "#5A4232", sleeveS: "#3E2C22",
      pants: "#3A2E26", pantsS: "#28201A", belt: "#2A2320", beltS: "#15120F",
      collar: "#8C94A0", bracer: "#6B4329", wrap: "#8A8178", shoe: "#2A2320",
      brows: L("M-3,1 L8,4 M16,4 L27,-2", 3.2, INK) + L("M-1,-2 Q3,-6 7,-2 M17,-2 Q21,-6 26,-3", 1.4, "#6E5A46"),
      face:
        // a keen squint and a small scar on the cheek
        L("M-3,10 L6,8 M17,8 L26,10", 1.6, "#C0A88E") +
        L("M30,6 L26,18", 1.8, "#B4574A") + L("M30,6 L26,18", 0.7, "#8A3A2E") +
        L("M-9,-26 Q-4,-30 1,-27", 1.4, "#241F1D"),
      headTop:
        // crow feathers tucked in the hood
        P("M-6,-32 C-16,-52 -26,-58 -30,-70 C-20,-66 -6,-52 2,-36Z", "#1E1E24", 2.2) +
        P("M6,-34 C2,-56 -4,-66 -8,-78 C0,-70 12,-56 16,-38Z", "#2A2A32", 2.2) +
        P("M16,-30 C18,-50 22,-60 24,-72 C30,-60 30,-44 24,-32Z", "#1E1E24", 2.2) +
        L("M-4,-36 C-12,-50 -20,-58 -26,-66 M8,-38 C4,-54 0,-64 -4,-72 M18,-34 C20,-48 22,-58 23,-66", 1.1, "#4A4A52") +
        P("M12,-30 L24,-30 L24,-20 L12,-20Z", "#E0A526", 2),
      backItem: (p) => G(`translate(92,${112 + p.bob}) rotate(24)`,
        L("M0,-40 Q20,0 0,40", 5, "#3E2C22") + L("M0,-40 Q20,0 0,40", 2.2, "#6B4329") +
        L("M0,-42 L0,42", 1.6, "#E4D2AA") +
        L("M-1,-40 L-1,40", 1, INK) +
        P("M-4,-42 L6,-42 L4,-34 L-6,-34Z", "#8A5A3A", 1.8)),
      // crow feathers tucked into the shoulder strap
      front: (p) => G(`translate(36,${96 + p.bob}) rotate(-18)`,
        P("M0,6 C-12,-6 -24,-14 -34,-26 C-18,-24 -4,-12 4,0Z", "#1E1E24", 2.2) +
        P("M4,4 C-6,-12 -14,-22 -18,-36 C-6,-26 4,-14 9,-2Z", "#2A2A32", 2.2) +
        P("M12,2 C4,-14 2,-26 2,-40 C11,-26 17,-12 18,0Z", "#1E1E24", 2.2) +
        L("M-24,-20 C-16,-16 -8,-8 0,0 M-12,-28 C-4,-20 4,-10 7,0 M4,-32 C10,-22 14,-10 15,2", 1.1, "#4A4A52") +
        P("M-8,4 L22,4 L22,12 L-8,12Z", "#6B4329", 2.2)),
    },

    // Sư Thầy Nguyệt Ảnh: a monk of the moonlit ruins
    monk: {
      hood: false,
      robe: "#E4D2AA", robeS: "#CDB88E", sleeve: "#E4D2AA", sleeveS: "#CDB88E",
      belt: "#8C94A0", beltS: "#6E7784", collar: "#F3E6C8",
      wrap: "#CDB88E", shoe: "#4A3A30",
      hair: "",
      headTop: L("M-24,-8 Q0,-22 24,-8", 1.6, "#B9B0A4") + L("M-14,-16 Q0,-22 14,-16", 1.2, "#C6BEB2"),
      face:
        eyeBand +
        E(3, 11, 4.2, 3.4, INK, 0) + E(21, 11, 4.2, 3.4, INK, 0) +
        E(3.4, 12, 1.6, 1.4, "#7A4A32", 0) + E(21.4, 12, 1.6, 1.4, "#7A4A32", 0) +
        L("M-2,8 Q3,4 8,8 M16,8 Q21,4 26,8", 2.4) +
        L("M-4,-1 Q3,-6 10,-1 M16,-1 Q22,-5 28,-2", 2.6, "#8A8178") +
        L("M10,21 Q14,23 18,21", 1.6) +
        blush,
      front: (p) =>
        // beads on the chest
        G(`translate(0,${p.bob})`,
          L("M48,88 Q62,104 78,88", 2.2, INK) +
          [0, 1, 2, 3, 4, 5, 6].map((i) => { const t = i / 6, x = 48 + 30 * t, y = 88 + Math.sin(t * Math.PI) * 16; return E(x.toFixed(1), y.toFixed(1), 3.6, 3.6, i === 3 ? "#E0A526" : "#8A5A3A", 1.8); }).join("")) +
        // the crescent emblem on the robe
        G(`translate(0,${p.bob})`,
          E(62, 122, 20, 20, "#BFE0E6", 0, 'opacity="0.22"') +
          P("M58,108 Q80,122 58,138 Q70,122 58,108Z", "#6E88AC", 2.4) +
          E(50, 116, 2.2, 2.2, "#6E88AC", 0) + E(52, 132, 1.6, 1.6, "#6E88AC", 0)) +
        // the staff with a moon disc, held out to the side
        G(`translate(84,${100 + p.bob}) rotate(14)`,
          part("M-2.6,-72 L2.6,-72 L3,42 L-3,42Z", "#8A5A3A", "M0.8,-72 L4.2,-72 L4.2,44 L0.8,44Z", "#6B4329", 2.4) +
          L("M-2.6,-40 L2.6,-40 M-2.6,-8 L2.6,-8", 1.6, "#6B4329") +
          P("M-3,42 L3,42 L3,49 L-3,49Z", "#8C94A0", 2.2) +
          E(0, -80, 14, 14, "#BFE0E6", 0, 'opacity="0.25"') +
          E(0, -80, 10.5, 10.5, "#C9D8E4", 2.8) +
          P("M1,-88 Q11,-80 1,-72 Q7,-80 1,-88Z", "#8FA8C4", 2.2) +
          L("M-5,-68 Q0,-62 5,-68", 2.2, "#C89A5A") +
          G("translate(0,8)", E(0, 0, 5.6, 5.6, SKIN, 2.4) + L("M-3.4,-2 Q0,-5 3.4,-2", 1.2))),
    },

    // Tướng Quân Vô Danh: the fortress commander
    general: {
      hood: false,
      top: "#38436E", topS: "#28304F", sleeve: "#38436E", sleeveS: "#28304F",
      pants: "#2A3050", pantsS: "#1E2340",
      apron: "#3A3F4A", apronS: "#262A33",
      belt: "#E0A526", beltS: "#B8841A", collar: "#8C94A0",
      bracer: "#4A4F58", wrap: "#8C94A0", shoe: "#2A2320", hand: SKIN,
      hair: P("M-30,0 C-31,-24 -12,-34 2,-34 C24,-34 33,-22 31,-2 Q20,-12 2,-12 Q-14,-12 -26,2 Q-24,-4 -30,0Z", "#2A2320", 2.4),
      brows: L("M-4,2 L8,6 M16,6 L28,0", 3.6, "#2A2320") + L("M2,-8 Q-8,-12 -18,-7", 1.4, "#6B6560"),
      face:
        P("M2,22 Q11,44 20,22 Q21,34 11,41 Q5,35 2,22Z", "#6B6560", 2.2) +
        P("M0,18 Q7,24 12,18 Q15,21 11,24 Q4,25 0,21Z", "#6B6560", 2) +
        L("M4,24 Q2,29 6,31 M28,22 Q30,26 26,29", 1.4, "#C0B4A6") +
        L("M10,21 Q14,24 18,21", 1.6) +
        L("M-8,-12 Q0,-16 8,-12", 1.4, "#8A8178"),
      headTop:
        // a lacquered helm with horns and a gold brow band
        part("M-34,-8 C-34,-36 32,-36 32,-8 Q0,-18 -34,-8Z", "#4A4F58", "M-34,-30 L34,-30 L34,-12 L-34,-12Z", "#333840", 2.8) +
        L("M-30,-16 Q0,-26 30,-16 M-28,-22 Q0,-32 28,-22", 1.3, "#8C94A0") +
        P("M-30,-8 C-40,-16 -46,-28 -48,-44 C-38,-34 -28,-24 -18,-16Z", "#E6E4DE", 2.6) +
        L("M-42,-34 C-36,-26 -28,-20 -22,-14 M-44,-24 C-38,-18 -32,-14 -28,-10", 1.2, "#A8977A") +
        P("M30,-8 C40,-16 46,-28 48,-44 C38,-34 28,-24 18,-16Z", "#E6E4DE", 2.6) +
        L("M42,-34 C36,-26 28,-20 22,-14 M44,-24 C38,-18 32,-14 28,-10", 1.2, "#A8977A") +
        part("M-35,-6 Q0,-16 35,-6 L35,3 Q0,-7 -35,3Z", "#E0A526", "M0,-14 L36,-14 L36,5 L0,5Z", "#B8841A", 2.4) +
        E(0, -30, 3.4, 3.4, "#D2462E", 1.8),
      backItem: (p) => {
        let b = "";
        // the cape behind the shoulders
        b += part("M48,84 C30,90 14,100 4,128 C22,134 42,128 54,116Z", "#2A2A32", "M36,80 L62,80 L62,132 L36,132Z", "#1C1C22", 2.8);
        b += L("M14,102 C22,112 30,120 46,124", 1.4, "#3A3A44");
        b += P("M6,124 C22,130 40,126 52,116 L50,104 C38,116 20,120 8,114Z", "#7A2A22", 2.2);
        // the halberd, slung up over the left shoulder
        b += G(`translate(36,${98 + p.bob}) rotate(-14)`,
          part("M-2.8,-78 L2.8,-78 L2.8,26 L-2.8,26Z", "#6B4329", "M0.8,-78 L4.6,-78 L4.6,28 L0.8,28Z", "#4E3020", 2.4) +
          L("M-2.8,-56 L2.8,-56 M-2.8,-32 L2.8,-32 M-2.8,-8 L2.8,-8", 1.4, "#4E3020") +
          P("M-2.8,-78 L-1,-96 L2.8,-78Z", "#E6E4DE", 2.2) +
          P("M2.8,-76 C-12,-80 -22,-72 -19,-58 C-11,-62 -4,-64 2.8,-60Z", "#B9B6AE", 2.6) +
          L("M-1,-70 C-8,-72 -14,-68 -17,-62", 1.2, "#8C94A0") +
          P("M-2.8,26 L2.8,26 L2.8,34 L-2.8,34Z", "#E0A526", 2.2));
        return b;
      },
    },
  });
})();
