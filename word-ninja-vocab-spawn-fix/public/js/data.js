// Word Ninja: game data (items, monsters, maps, quests, classes, skills) and formulas.
// Pure data: this file is also bundled into world.js, the server rules, so it must not touch the DOM.
(function (root) {
  const C = {
    paper: "#F3E6C8", paperShade: "#E4D2AA", ink: "#2A2320", ver: "#D2462E",
    jade: "#3E8C6E", gold: "#E0A526", indigo: "#2E3A5C", sky: "#BFE0E6", meadow: "#9CC97A",
  };

  const SLOTS = [
    { id: "hat", vi: "Mũ" }, { id: "mask", vi: "Mặt nạ" }, { id: "necklace", vi: "Dây chuyền" },
    { id: "weapon", vi: "Vũ khí" }, { id: "armor", vi: "Áo giáp" }, { id: "pants", vi: "Quần" },
    { id: "gloves", vi: "Găng tay" }, { id: "boots", vi: "Giày" }, { id: "ring", vi: "Nhẫn" },
    { id: "belt", vi: "Thắt lưng" }, { id: "jade", vi: "Ngọc bội" },
  ];
  const SLOT_VI = Object.fromEntries(SLOTS.map((s) => [s.id, s.vi]));

  const RARITY = {
    common: { vi: "Thường", color: "#8A7F6E", rank: 0 },
    good: { vi: "Tốt", color: "#3E8C6E", rank: 1 },
    rare: { vi: "Hiếm", color: "#3A6EA5", rank: 2 },
    epic: { vi: "Sử thi", color: "#9C3D6E", rank: 3 },
    legend: { vi: "Huyền thoại", color: "#E0A526", rank: 4 },
  };

  // icon: art icon key. stats: atk, def, hp, mp, crit (%), spd (%). lv: level needed. cls: class only.
  // src: where it comes from, shown in the bag.
  const ITEMS = {
    // ---- common weapons, before Lv 10
    w_wood: { name: "Kiếm Gỗ Tân Thủ", slot: "weapon", rarity: "common", lv: 1, stats: { atk: 2 }, price: 15, icon: "sword_wood", desc: "Thanh kiếm gỗ để tập những nhát chém đầu tiên.", src: "Cửa hàng Cô Lựu" },
    w_bamboo: { name: "Kiếm Tre", slot: "weapon", rarity: "common", lv: 1, stats: { atk: 4 }, price: 40, icon: "sword_bamboo", desc: "Thanh kiếm tre của mọi ninja tập sự.", src: "Hành trang ban đầu, Cửa hàng" },
    w_iron: { name: "Kiếm Sắt Rèn", slot: "weapon", rarity: "good", lv: 4, stats: { atk: 9 }, price: 220, icon: "sword_iron", desc: "Lưỡi sắt do Thợ Rèn Thiết tự tay rèn.", src: "Cửa hàng Cô Lựu" },
    w_jade: { name: "Kiếm Ngọc Bích", slot: "weapon", rarity: "rare", lv: 6, stats: { atk: 15, crit: 3 }, price: 0, icon: "sword_jade", desc: "Chuôi ngọc mát lạnh, chỉ rơi từ quái tinh anh.", src: "Bù Nhìn Mặt Nạ (10%)" },
    w_buffalo: { name: "Đại Đao Sừng Trâu", slot: "weapon", rarity: "epic", lv: 8, stats: { atk: 22, def: 2 }, price: 0, icon: "blade_horn", desc: "Rèn từ sừng của Trâu Đá Vương.", src: "Trâu Đá Vương" },
    w_legend: { name: "Kiếm Mực Thần", slot: "weapon", rarity: "legend", lv: 8, stats: { atk: 30, crit: 8 }, price: 0, icon: "sword_ink", desc: "Mỗi nhát chém để lại một nét mực không phai.", src: "Trâu Đá Vương (8%)" },

    // ---- class weapons: tier I at Lv10, evolved at the forge at 15, 20, 25, 30
    w_kiem: { name: "Kiếm Ảnh Sơ Tâm", slot: "weapon", rarity: "rare", lv: 10, cls: "kiem", tier: 1, stats: { atk: 26, crit: 4 }, price: 0, icon: "wkiem1", desc: "Thanh kiếm đầu tiên của một Kiếm Ảnh. Lưỡi mỏng, chém dứt khoát.", src: "Nhận khi chọn lớp Kiếm Ảnh", evolve: "w_kiem2" },
    w_kiem2: { name: "Ảnh Thiết Kiếm", slot: "weapon", rarity: "rare", lv: 15, cls: "kiem", tier: 2, stats: { atk: 36, crit: 5 }, price: 0, icon: "wkiem2", desc: "Lưỡi kiếm được gia cố bằng sợi trúc huyền.", src: "Tiến hóa ở Lò rèn", evolve: "w_kiem3" },
    w_kiem3: { name: "Bích Nguyệt Kiếm", slot: "weapon", rarity: "epic", lv: 20, cls: "kiem", tier: 3, stats: { atk: 48, crit: 6, def: 3 }, price: 0, icon: "wkiem3", desc: "Tinh luyện bằng tơ Hắc Nha, lưỡi kiếm ánh xanh như trăng non.", src: "Tiến hóa ở Lò rèn", evolve: "w_kiem4" },
    w_kiem4: { name: "Thiên Ảnh Kiếm", slot: "weapon", rarity: "epic", lv: 25, cls: "kiem", tier: 4, stats: { atk: 62, crit: 8, def: 5 }, price: 0, icon: "wkiem4", desc: "Mỗi nhát chém kéo theo một vệt kiếm ảnh.", src: "Tiến hóa ở Lò rèn", evolve: "w_kiem5" },
    w_kiem5: { name: "Vô Ảnh Kiếm", slot: "weapon", rarity: "legend", lv: 30, cls: "kiem", tier: 5, stats: { atk: 80, crit: 10, def: 8 }, price: 0, icon: "wkiem5", desc: "Vũ khí tối thượng của chương 1. Nhanh đến mức không thấy bóng.", src: "Tiến hóa bằng Lõi U Minh", evolve: "w_kiem6" },
    w_kiem6: { name: "Thiên Khuyết Kiếm", slot: "weapon", rarity: "legend", lv: 35, cls: "kiem", tier: 6, stats: { atk: 100, crit: 12, def: 10 }, price: 0, icon: "wkiem6", desc: "Lưỡi kiếm hứng gió trời, chém ổn định và đều tay.", src: "Tiến hóa ở Lò rèn bằng Tinh Thạch Mây", evolve: "w_kiem7" },
    w_kiem7: { name: "Thần Phong Kiếm", slot: "weapon", rarity: "legend", lv: 40, cls: "kiem", tier: 7, stats: { atk: 126, crit: 15, def: 13 }, price: 0, icon: "wkiem7", desc: "Mỗi nhát chém kéo theo một dải gió sắc như dao.", src: "Tiến hóa bằng Lõi Cơ Quan", evolve: "w_kiem8" },
    w_kiem8: { name: "Cửu Thiên Kiếm", slot: "weapon", rarity: "legend", lv: 45, cls: "kiem", tier: 8, stats: { atk: 156, crit: 18, def: 16 }, price: 0, icon: "wkiem8", desc: "Kiếm khí vươn tới chín tầng trời, tăng uy lực kỹ năng.", src: "Tiến hóa bằng Hạt Linh Mộc", evolve: "w_kiem9" },
    w_kiem9: { name: "Thiên Mệnh Kiếm", slot: "weapon", rarity: "legend", lv: 50, cls: "kiem", tier: 9, stats: { atk: 196, crit: 22, def: 20 }, price: 0, icon: "wkiem9", desc: "Thanh kiếm của mệnh trời, phần thưởng cuối chương 30-50.", src: "Tiến hóa bằng Ấn Thiên Mệnh" },

    w_anh: { name: "Song Đao Tấn Ảnh", slot: "weapon", rarity: "rare", lv: 10, cls: "anh", tier: 1, stats: { atk: 22, crit: 8, spd: 5 }, price: 0, icon: "wanh1", desc: "Cặp đao ngắn, nhẹ như gió.", src: "Nhận khi chọn lớp Ảnh Hành", evolve: "w_anh2" },
    w_anh2: { name: "Song Đao Lưu Phong", slot: "weapon", rarity: "rare", lv: 15, cls: "anh", tier: 2, stats: { atk: 31, crit: 10, spd: 6 }, price: 0, icon: "wanh2", desc: "Lưỡi đao rít như gió chảy.", src: "Tiến hóa ở Lò rèn", evolve: "w_anh3" },
    w_anh3: { name: "Song Đao Bách Ảnh", slot: "weapon", rarity: "epic", lv: 20, cls: "anh", tier: 3, stats: { atk: 42, crit: 12, spd: 8 }, price: 0, icon: "wanh3", desc: "Đánh một nhát, hiện trăm bóng.", src: "Tiến hóa ở Lò rèn", evolve: "w_anh4" },
    w_anh4: { name: "Song Đao Huyễn Vũ", slot: "weapon", rarity: "epic", lv: 25, cls: "anh", tier: 4, stats: { atk: 54, crit: 14, spd: 10 }, price: 0, icon: "wanh4", desc: "Hai lưỡi đao múa như cánh vũ.", src: "Tiến hóa ở Lò rèn", evolve: "w_anh5" },
    w_anh5: { name: "Song Đao Vạn Ảnh", slot: "weapon", rarity: "legend", lv: 30, cls: "anh", tier: 5, stats: { atk: 68, crit: 16, spd: 12 }, price: 0, icon: "wanh5", desc: "Vũ khí tối thượng của chương 1. Vạn bóng cùng chém.", src: "Tiến hóa bằng Lõi U Minh", evolve: "w_anh6" },
    w_anh6: { name: "Song Đao Thiên Ảnh", slot: "weapon", rarity: "legend", lv: 35, cls: "anh", tier: 6, stats: { atk: 86, crit: 22, spd: 16 }, price: 0, icon: "wanh6", desc: "Hai lưỡi đao nhanh tới mức bóng nọ nối bóng kia.", src: "Tiến hóa ở Lò rèn bằng Tinh Thạch Mây", evolve: "w_anh7" },
    w_anh7: { name: "Song Đao Phá Vân", slot: "weapon", rarity: "legend", lv: 40, cls: "anh", tier: 7, stats: { atk: 108, crit: 26, spd: 19 }, price: 0, icon: "wanh7", desc: "Mỗi đường đao xé toạc một tầng mây.", src: "Tiến hóa bằng Lõi Cơ Quan", evolve: "w_anh8" },
    w_anh8: { name: "Song Đao Tuyệt Ảnh", slot: "weapon", rarity: "legend", lv: 45, cls: "anh", tier: 8, stats: { atk: 134, crit: 30, spd: 22 }, price: 0, icon: "wanh8", desc: "Ảnh cuối cùng, chí mạng lên tới đỉnh.", src: "Tiến hóa bằng Hạt Linh Mộc", evolve: "w_anh9" },
    w_anh9: { name: "Song Đao Vô Cực", slot: "weapon", rarity: "legend", lv: 50, cls: "anh", tier: 9, stats: { atk: 170, crit: 36, spd: 26 }, price: 0, icon: "wanh9", desc: "Vô cực bóng đao, phần thưởng cuối chương 30-50.", src: "Tiến hóa bằng Ấn Thiên Mệnh" },

    w_linh: { name: "Trượng U Linh", slot: "weapon", rarity: "rare", lv: 10, cls: "linh", tier: 1, stats: { atk: 22, mp: 30 }, price: 0, icon: "wlinh1", desc: "Cây trượng gỗ đen, đầu trượng giữ một đốm linh quang.", src: "Nhận khi chọn lớp Linh Ẩn", evolve: "w_linh2" },
    w_linh2: { name: "Trượng Linh Mộc", slot: "weapon", rarity: "rare", lv: 15, cls: "linh", tier: 2, stats: { atk: 31, mp: 45 }, price: 0, icon: "wlinh2", desc: "Thân trượng quấn sợi trúc huyền, linh khí dồi dào.", src: "Tiến hóa ở Lò rèn", evolve: "w_linh3" },
    w_linh3: { name: "Trượng Hắc Ngọc", slot: "weapon", rarity: "epic", lv: 20, cls: "linh", tier: 3, stats: { atk: 43, mp: 65, def: 2 }, price: 0, icon: "wlinh3", desc: "Viên hắc ngọc trên đầu trượng hút ánh sáng.", src: "Tiến hóa ở Lò rèn", evolve: "w_linh4" },
    w_linh4: { name: "Trượng Huyễn Linh", slot: "weapon", rarity: "epic", lv: 25, cls: "linh", tier: 4, stats: { atk: 56, mp: 85, def: 4 }, price: 0, icon: "wlinh4", desc: "Quanh trượng luôn có ảo ảnh lơ lửng.", src: "Tiến hóa ở Lò rèn", evolve: "w_linh5" },
    w_linh5: { name: "Trượng U Minh", slot: "weapon", rarity: "legend", lv: 30, cls: "linh", tier: 5, stats: { atk: 70, mp: 110, def: 6 }, price: 0, icon: "wlinh5", desc: "Vũ khí tối thượng của chương 1. Gọi được lửa xanh U Minh.", src: "Tiến hóa bằng Lõi U Minh", evolve: "w_linh6" },
    w_linh6: { name: "Trượng Tinh Vân", slot: "weapon", rarity: "legend", lv: 35, cls: "linh", tier: 6, stats: { atk: 88, mp: 140, def: 8 }, price: 0, icon: "wlinh6", desc: "Đầu trượng giữ một tinh cầu mây, linh thuật mạnh hơn.", src: "Tiến hóa ở Lò rèn bằng Tinh Thạch Mây", evolve: "w_linh7" },
    w_linh7: { name: "Trượng Thiên Linh", slot: "weapon", rarity: "legend", lv: 40, cls: "linh", tier: 7, stats: { atk: 110, mp: 180, def: 10 }, price: 0, icon: "wlinh7", desc: "Thân trượng khắc linh văn, MP dồi dào hơn hẳn.", src: "Tiến hóa bằng Lõi Cơ Quan", evolve: "w_linh8" },
    w_linh8: { name: "Trượng Cửu U", slot: "weapon", rarity: "legend", lv: 45, cls: "linh", tier: 8, stats: { atk: 136, mp: 230, def: 13 }, price: 0, icon: "wlinh8", desc: "Chín tầng u minh quấn quanh đầu trượng.", src: "Tiến hóa bằng Hạt Linh Mộc", evolve: "w_linh9" },
    w_linh9: { name: "Trượng Thiên Đạo", slot: "weapon", rarity: "legend", lv: 50, cls: "linh", tier: 9, stats: { atk: 172, mp: 300, def: 16 }, price: 0, icon: "wlinh9", desc: "Trượng của đạo trời, phần thưởng cuối chương 30-50.", src: "Tiến hóa bằng Ấn Thiên Mệnh" },

    // ---- hats
    h_straw: { name: "Nón Lá", slot: "hat", rarity: "common", lv: 1, stats: { def: 1, hp: 10 }, price: 60, icon: "hat_straw", desc: "Che nắng che mưa trên đồng.", src: "Cửa hàng, Giọt Sương Nhí" },
    h_hood: { name: "Mũ Trùm Ninja", slot: "hat", rarity: "good", lv: 4, stats: { def: 3, hp: 22 }, price: 180, icon: "hat_hood", desc: "Vải chàm dày, buộc chặt sau gáy.", src: "Cửa hàng Cô Lựu" },
    h_bamboo: { name: "Nón Trúc Huyền", slot: "hat", rarity: "rare", lv: 10, stats: { def: 6, hp: 50 }, price: 0, icon: "hat_bamboo", desc: "Đan từ trúc huyền, nhẹ mà cứng.", src: "Sói Trúc (3%)" },
    h_crow: { name: "Mũ Lông Quạ", slot: "hat", rarity: "rare", lv: 15, stats: { def: 9, hp: 75, crit: 2 }, price: 0, icon: "hat_crow", desc: "Lông quạ đen kết thành vành mũ.", src: "Quạ Đen (3%)" },
    h_moon: { name: "Mũ Nguyệt Ảnh", slot: "hat", rarity: "epic", lv: 20, stats: { def: 13, hp: 110, mp: 15 }, price: 0, icon: "hat_moon", desc: "Đính mảnh trăng đá trước trán.", src: "Hộ Vệ Đá (3%)" },
    h_uminh: { name: "Mũ Ám Vệ", slot: "hat", rarity: "epic", lv: 25, stats: { def: 17, hp: 150, crit: 3 }, price: 0, icon: "hat_uminh", desc: "Mũ sắt đen của lính gác U Minh.", src: "Ám Vệ (3%)" },

    // ---- masks
    m_fox: { name: "Mặt Nạ Cáo", slot: "mask", rarity: "good", lv: 3, stats: { def: 2, mp: 10 }, price: 200, icon: "mask_fox", desc: "Mặt nạ cáo trắng của lễ hội làng.", src: "Cửa hàng Cô Lựu" },
    m_oni: { name: "Mặt Nạ Quỷ Đỏ", slot: "mask", rarity: "epic", lv: 7, stats: { atk: 5, def: 4, crit: 5 }, price: 0, icon: "mask_oni", desc: "Chiếc mặt nạ rơi ra từ Bù Nhìn.", src: "Bù Nhìn Mặt Nạ (25%)" },
    m_wolf: { name: "Mặt Nạ Sói Trúc", slot: "mask", rarity: "rare", lv: 12, stats: { atk: 7, def: 5, crit: 4 }, price: 0, icon: "mask_wolf", desc: "Nanh sói khắc trên gỗ trúc.", src: "Sói Trúc (3%)" },
    m_ronin: { name: "Mặt Nạ Lãng Khách", slot: "mask", rarity: "epic", lv: 22, stats: { atk: 12, def: 8, crit: 6 }, price: 0, icon: "mask_ronin", desc: "Mặt nạ của ninja lưu vong, nứt một đường.", src: "Ninja Lưu Vong (3%)" },
    m_shade: { name: "Mặt Nạ Quỷ Ảnh", slot: "mask", rarity: "legend", lv: 27, stats: { atk: 16, def: 10, crit: 8 }, price: 0, icon: "mask_shade", desc: "Đeo vào thì bóng mình như dài thêm.", src: "Quỷ Ảnh (2%)" },

    // ---- armor
    a_cloth: { name: "Áo Vải Thô", slot: "armor", rarity: "common", lv: 1, stats: { def: 2, hp: 15 }, price: 50, icon: "armor_cloth", desc: "Áo vải nhuộm chàm của tân thủ.", src: "Hành trang ban đầu, Cửa hàng" },
    a_padded: { name: "Áo Giáp Chần Bông", slot: "armor", rarity: "good", lv: 4, stats: { def: 5, hp: 35 }, price: 260, icon: "armor_padded", desc: "Nhiều lớp vải chần, đỡ đòn tốt.", src: "Cửa hàng Cô Lựu" },
    a_lacquer: { name: "Giáp Sơn Mài", slot: "armor", rarity: "rare", lv: 7, stats: { def: 9, hp: 60 }, price: 0, icon: "armor_lacquer", desc: "Phiến giáp sơn mài đỏ son.", src: "Bù Nhìn Mặt Nạ (15%)" },
    a_bamboo: { name: "Giáp Trúc Bện", slot: "armor", rarity: "rare", lv: 11, stats: { def: 13, hp: 90 }, price: 0, icon: "armor_bamboo", desc: "Những thanh trúc bện chặt thành giáp.", src: "Hồ Ly Non (3%)" },
    a_crow: { name: "Giáp Hắc Nha", slot: "armor", rarity: "rare", lv: 16, stats: { def: 18, hp: 130 }, price: 0, icon: "armor_crow", desc: "Giáp da đen phủ lông quạ.", src: "Thổ Phỉ (3%), Nhện Hắc Nha" },
    a_moon: { name: "Giáp Nguyệt Thạch", slot: "armor", rarity: "epic", lv: 21, stats: { def: 24, hp: 180, mp: 20 }, price: 0, icon: "armor_moon", desc: "Phiến đá trăng mỏng ghép trên vải lụa.", src: "Ninja Lưu Vong (3%), Thạch Tượng" },
    a_uminh: { name: "Giáp U Minh", slot: "armor", rarity: "legend", lv: 28, stats: { def: 32, hp: 260, crit: 3 }, price: 0, icon: "armor_uminh", desc: "Giáp của Thủ Lĩnh U Minh, viền lửa xanh.", src: "Thủ Lĩnh U Minh (25%)" },

    // ---- pants
    p_cloth: { name: "Quần Vải Chàm", slot: "pants", rarity: "common", lv: 1, stats: { def: 1, hp: 8 }, price: 45, icon: "pants_cloth", desc: "Quần vải rộng, dễ chạy nhảy.", src: "Cửa hàng Cô Lựu" },
    p_hakama: { name: "Quần Ống Rộng", slot: "pants", rarity: "good", lv: 5, stats: { def: 3, hp: 20 }, price: 160, icon: "pants_hakama", desc: "Quần ống rộng xếp ly của võ sinh.", src: "Cửa hàng Cô Lựu" },
    p_bamboo: { name: "Quần Trúc Huyền", slot: "pants", rarity: "rare", lv: 10, stats: { def: 6, hp: 45, spd: 3 }, price: 0, icon: "pants_bamboo", desc: "Ống quần có nẹp trúc, nhẹ chân.", src: "Hồ Ly Non (3%)" },
    p_crow: { name: "Quần Da Quạ", slot: "pants", rarity: "rare", lv: 15, stats: { def: 9, hp: 70 }, price: 0, icon: "pants_crow", desc: "Da thuộc màu khói, chống được đá vụn.", src: "Quạ Đen (3%)" },
    p_moon: { name: "Quần Nguyệt Ảnh", slot: "pants", rarity: "epic", lv: 20, stats: { def: 13, hp: 100, spd: 4 }, price: 0, icon: "pants_moon", desc: "Lụa bạc thêu hoa văn trăng.", src: "Linh Thể (3%)" },
    p_uminh: { name: "Quần Ám Vệ", slot: "pants", rarity: "epic", lv: 25, stats: { def: 17, hp: 140 }, price: 0, icon: "pants_uminh", desc: "Giáp chân bằng sắt đen.", src: "Ám Vệ (3%)" },

    // ---- gloves
    g_wrap: { name: "Băng Tay Vải", slot: "gloves", rarity: "common", lv: 1, stats: { atk: 1, def: 1 }, price: 50, icon: "gloves_wrap", desc: "Băng vải quấn tay cho chắc kiếm.", src: "Cửa hàng Cô Lựu" },
    g_leather: { name: "Găng Da Thuộc", slot: "gloves", rarity: "good", lv: 4, stats: { atk: 3, def: 2 }, price: 170, icon: "gloves_leather", desc: "Da thuộc mềm, cầm kiếm không trượt.", src: "Cửa hàng, Nấm Đá" },
    g_bamboo: { name: "Găng Trúc Huyền", slot: "gloves", rarity: "rare", lv: 11, stats: { atk: 6, def: 4 }, price: 0, icon: "gloves_bamboo", desc: "Nẹp trúc trên mu bàn tay.", src: "Nhện Độc (3%)" },
    g_golem: { name: "Găng Thạch Thủ", slot: "gloves", rarity: "epic", lv: 20, stats: { atk: 11, def: 8 }, price: 0, icon: "gloves_golem", desc: "Nặng như đá nhưng vung rất chắc tay.", src: "Hộ Vệ Đá (3%)" },

    // ---- boots
    b_straw: { name: "Dép Rơm", slot: "boots", rarity: "common", lv: 1, stats: { def: 1, spd: 5 }, price: 40, icon: "boots_straw", desc: "Dép đan bằng rơm, nhẹ chân.", src: "Cửa hàng, Củ Cải Tinh" },
    b_tabi: { name: "Giày Tabi", slot: "boots", rarity: "good", lv: 3, stats: { def: 2, spd: 10 }, price: 150, icon: "boots_tabi", desc: "Giày xẻ ngón, bước đi không tiếng động.", src: "Cửa hàng Cô Lựu" },
    b_wind: { name: "Giày Phong Vân", slot: "boots", rarity: "rare", lv: 6, stats: { def: 4, spd: 15 }, price: 0, icon: "boots_wind", desc: "Phần thưởng của Trưởng Làng.", src: "Nhiệm vụ Bóng đen trên ruộng" },
    b_crow: { name: "Giày Cánh Quạ", slot: "boots", rarity: "rare", lv: 15, stats: { def: 7, spd: 16 }, price: 0, icon: "boots_crow", desc: "Đế giày lót lông, rơi xuống không tiếng.", src: "Quạ Đen (3%)" },
    b_shade: { name: "Giày Quỷ Bộ", slot: "boots", rarity: "epic", lv: 25, stats: { def: 11, spd: 20 }, price: 0, icon: "boots_shade", desc: "Bước đi như bóng trượt trên đá.", src: "Ám Vệ (3%)" },

    // ---- necklaces
    n_bead: { name: "Chuỗi Hạt Gỗ", slot: "necklace", rarity: "common", lv: 1, stats: { hp: 12, mp: 10 }, price: 80, icon: "neck_bead", desc: "Chuỗi hạt gỗ trầm, giúp tĩnh tâm.", src: "Cửa hàng, Thầy Bút" },
    n_jade: { name: "Dây Chuyền Ngọc", slot: "necklace", rarity: "rare", lv: 7, stats: { hp: 40, mp: 20 }, price: 0, icon: "neck_jade", desc: "Mặt ngọc bích chạm hình lá.", src: "Trâu Đá Vương (30%)" },
    n_fox: { name: "Dây Chuyền Hồ Ly", slot: "necklace", rarity: "rare", lv: 13, stats: { hp: 60, mp: 30, crit: 2 }, price: 0, icon: "neck_fox", desc: "Một chiếc răng cáo bọc bạc.", src: "Hồ Ly Non (3%)" },
    n_moon: { name: "Dây Chuyền Nguyệt Quang", slot: "necklace", rarity: "epic", lv: 23, stats: { hp: 110, mp: 45, crit: 3 }, price: 0, icon: "neck_moon", desc: "Mặt dây sáng nhẹ trong đêm.", src: "Linh Thể (3%)" },

    // ---- rings
    r_copper: { name: "Nhẫn Đồng", slot: "ring", rarity: "common", lv: 1, stats: { atk: 2 }, price: 90, icon: "ring_copper", desc: "Nhẫn đồng mộc mạc.", src: "Cửa hàng Cô Lựu" },
    r_moon: { name: "Nhẫn Trăng Khuyết", slot: "ring", rarity: "rare", lv: 3, stats: { atk: 4, crit: 5 }, price: 0, icon: "ring_moon", desc: "Đá trăng lấp lánh trong giọt sương.", src: "Giọt Sương Nhí (3%)" },
    r_spider: { name: "Nhẫn Tơ Độc", slot: "ring", rarity: "rare", lv: 14, stats: { atk: 8, crit: 5 }, price: 0, icon: "ring_spider", desc: "Viên đá tím quấn tơ nhện.", src: "Nhện Độc (3%), Nhện Hắc Nha" },
    r_uminh: { name: "Nhẫn U Minh", slot: "ring", rarity: "epic", lv: 26, stats: { atk: 14, crit: 7 }, price: 0, icon: "ring_uminh", desc: "Ngọn lửa xanh nhỏ cháy trong đá.", src: "Quỷ Ảnh (3%)" },

    // ---- belts
    bl_rope: { name: "Thắt Lưng Dây Thừng", slot: "belt", rarity: "common", lv: 1, stats: { hp: 10, def: 1 }, price: 40, icon: "belt_rope", desc: "Sợi thừng gai buộc ngang hông.", src: "Cửa hàng Cô Lựu" },
    bl_leather: { name: "Đai Da Bò", slot: "belt", rarity: "good", lv: 5, stats: { atk: 2, hp: 20 }, price: 150, icon: "belt_leather", desc: "Đai da dày có khóa đồng.", src: "Cửa hàng Cô Lựu" },
    bl_fox: { name: "Đai Lông Cáo", slot: "belt", rarity: "rare", lv: 12, stats: { mp: 20, crit: 2, hp: 30 }, price: 0, icon: "belt_fox", desc: "Viền lông cáo mềm, ấm lưng.", src: "Hồ Ly Non (4%)" },
    bl_bandit: { name: "Đai Thổ Phỉ", slot: "belt", rarity: "rare", lv: 16, stats: { atk: 5, hp: 40 }, price: 0, icon: "belt_bandit", desc: "Đai to bản, nhiều túi giắt dao.", src: "Thổ Phỉ (4%)" },
    bl_moon: { name: "Đai Nguyệt Lụa", slot: "belt", rarity: "epic", lv: 21, stats: { mp: 40, def: 6 }, price: 0, icon: "belt_moon", desc: "Dải lụa bạc thắt nút trăng.", src: "Ninja Lưu Vong (3%)" },
    bl_uminh: { name: "Đai Hắc Diệm", slot: "belt", rarity: "epic", lv: 26, stats: { atk: 8, hp: 80 }, price: 0, icon: "belt_uminh", desc: "Khóa đai hình đầu quỷ, ấm như than hồng.", src: "Quỷ Ảnh (3%)" },

    // ---- jade pendants (accessory)
    j_wood: { name: "Ngọc Bội Gỗ Trầm", slot: "jade", rarity: "common", lv: 1, stats: { mp: 10, hp: 10 }, price: 100, icon: "jade_wood", desc: "Miếng gỗ trầm khắc chữ An.", src: "Cửa hàng Cô Lựu" },
    j_fox: { name: "Ngọc Bội Hồ Ly", slot: "jade", rarity: "rare", lv: 13, stats: { mp: 25, crit: 3 }, price: 0, icon: "jade_fox", desc: "Ngọc trắng chạm hình đuôi cáo.", src: "Hồ Ly Non (2%)" },
    j_moon: { name: "Ngọc Bội Nguyệt Ảnh", slot: "jade", rarity: "epic", lv: 22, stats: { mp: 40, crit: 4, def: 4 }, price: 0, icon: "jade_moon", desc: "Ngọc xanh bạc, lạnh như sương đêm.", src: "Linh Thể (3%), Thạch Tượng (25%)" },
    j_uminh: { name: "Ngọc Bội U Minh", slot: "jade", rarity: "legend", lv: 30, stats: { mp: 60, crit: 6, atk: 10 }, price: 0, icon: "jade_uminh", desc: "Phần thưởng kết thúc chương 1.", src: "Thủ Lĩnh U Minh (30%), Nhiệm vụ cuối chương" },

    // ---- Biển Mây Phù Vân, Lv 30-34
    a_cloud: { name: "Áo Vân Du", slot: "armor", rarity: "epic", lv: 31, stats: { def: 40, hp: 340, mp: 20 }, price: 0, icon: "a_cloud", desc: "Áo choàng nhẹ như mây, đỡ gió trên đảo đá.", src: "Biển Mây: Khỉ Đá, Vệ Binh Phù Vân" },
    b_cloud: { name: "Giày Phù Vân", slot: "boots", rarity: "epic", lv: 31, stats: { def: 15, spd: 24 }, price: 0, icon: "b_cloud", desc: "Bước như lướt trên mây, nhẹ và êm.", src: "Biển Mây: Linh Điểu, Vệ Binh Phù Vân" },
    n_cloud: { name: "Dây Chuyền Mây Trắng", slot: "necklace", rarity: "epic", lv: 31, stats: { hp: 150, mp: 70 }, price: 0, icon: "n_cloud", desc: "Mặt dây bằng một giọt mây đông lại.", src: "Biển Mây: Khỉ Đá" },
    // ---- Thành Cổ Thiên Cơ, Lv 35-39
    a_mech: { name: "Giáp Cơ Quan", slot: "armor", rarity: "epic", lv: 36, stats: { def: 52, hp: 460 }, price: 0, icon: "a_mech", desc: "Giáp ghép từ những tấm cơ quan cổ còn sáng.", src: "Thành Cổ: Cơ Quan Vệ Binh, Hộ Thành Thiên Cơ" },
    m_mech: { name: "Mặt Nạ Thiên Cơ", slot: "mask", rarity: "epic", lv: 36, stats: { atk: 22, def: 18, crit: 10 }, price: 0, icon: "m_mech", desc: "Mặt nạ máy, mắt sáng như bánh răng xoay.", src: "Thành Cổ: Ninja Lưu Ảnh" },
    r_mech: { name: "Nhẫn Hộ Thành", slot: "ring", rarity: "epic", lv: 36, stats: { atk: 24, crit: 10 }, price: 0, icon: "r_mech", desc: "Nhẫn của lính giữ thành, khắc ấn cơ quan.", src: "Thành Cổ: Ninja Lưu Ảnh, Hộ Thành Thiên Cơ" },
    // ---- Rừng Linh Hồn, Lv 40-44
    a_spirit: { name: "Áo Linh Mộc", slot: "armor", rarity: "legend", lv: 41, stats: { def: 64, hp: 580, mp: 40 }, price: 0, icon: "a_spirit", desc: "Áo dệt từ vỏ linh mộc, ấm và phát sáng nhẹ.", src: "Rừng Linh Hồn: Hồn Mộc, Thủ Hộ Linh Mộc" },
    j_spirit: { name: "Ngọc Bội Linh Hồ", slot: "jade", rarity: "legend", lv: 41, stats: { mp: 100, crit: 9, def: 9 }, price: 0, icon: "j_spirit", desc: "Ngọc của hồ ly rừng, hút sương đêm.", src: "Rừng Linh Hồn: Hồ Ly Linh, Thủ Hộ Linh Mộc" },
    b_spirit: { name: "Giày Linh Ảnh", slot: "boots", rarity: "legend", lv: 41, stats: { def: 20, spd: 30 }, price: 0, icon: "b_spirit", desc: "Giày để lại dấu chân mờ như bóng.", src: "Rừng Linh Hồn: Ma Cà Rồng Rừng" },
    // ---- Sơn Mạch Lôi Đình, Lv 45-49
    a_thunder: { name: "Giáp Lôi Văn", slot: "armor", rarity: "legend", lv: 46, stats: { def: 78, hp: 720 }, price: 0, icon: "a_thunder", desc: "Giáp khắc vân sấm, dẫn lôi ra ngoài.", src: "Sơn Mạch: Lang Lôi, Thạch Tướng, Tướng Quân Lôi Đình" },
    n_thunder: { name: "Dây Chuyền Lôi Tinh", slot: "necklace", rarity: "legend", lv: 46, stats: { hp: 280, mp: 120, crit: 8 }, price: 0, icon: "n_thunder", desc: "Lôi tinh nhỏ cháy trong vỏ đồng.", src: "Sơn Mạch: Ảnh Vệ Lôi" },
    g_thunder: { name: "Găng Lôi Đình", slot: "gloves", rarity: "legend", lv: 46, stats: { atk: 30, def: 20 }, price: 0, icon: "g_thunder", desc: "Nắm đấm tụ sấm, vung là vang.", src: "Sơn Mạch: Thạch Tướng" },
    // ---- Điện Thiên Mệnh: phần thưởng boss Lv.50
    h_fate: { name: "Mũ Thiên Mệnh", slot: "hat", rarity: "legend", lv: 50, stats: { def: 42, hp: 420, mp: 80 }, price: 0, icon: "h_fate", desc: "Mũ của người giữ mệnh, viền sáng linh quang.", src: "Thiên Ảnh Chưởng Môn (30%)" },
    a_fate: { name: "Giáp Thiên Mệnh", slot: "armor", rarity: "legend", lv: 50, stats: { def: 92, hp: 880, mp: 60 }, price: 0, icon: "a_fate", desc: "Giáp vẽ cả một bầu trời sao linh lực.", src: "Thiên Ảnh Chưởng Môn (25%)" },
    bl_fate: { name: "Đai Thiên Mệnh", slot: "belt", rarity: "legend", lv: 50, stats: { atk: 26, hp: 260 }, price: 0, icon: "bl_fate", desc: "Đai khóa bằng ấn thiên mệnh.", src: "Thiên Ảnh Chưởng Môn (25%)" },
    r_fate: { name: "Nhẫn Thiên Mệnh", slot: "ring", rarity: "legend", lv: 50, stats: { atk: 36, crit: 16 }, price: 0, icon: "r_fate", desc: "Nhẫn đá trời, chí mạng lên đỉnh.", src: "Thiên Ảnh Chưởng Môn (25%)" },
    j_fate: { name: "Ngọc Bội Thiên Mệnh", slot: "jade", rarity: "legend", lv: 50, stats: { mp: 150, crit: 12, atk: 16 }, price: 0, icon: "j_fate", desc: "Ngọc bội kết tinh từ thử thách cuối chương.", src: "Thiên Ảnh Chưởng Môn (20%)" },
  };

  const MATS = {
    stone: { name: "Đá Cường Hóa", icon: "mat_stone", price: 90, sell: 20, desc: "Dùng ở Lò Rèn để cường hóa và tiến hóa trang bị." },
    spore: { name: "Bào Tử Nấm", icon: "mat_spore", price: 0, sell: 6, desc: "Bụi nấm phát sáng, rơi từ Nấm Đá." },
    straw: { name: "Rơm Vàng", icon: "mat_straw", price: 0, sell: 15, desc: "Rơm óng ánh từ Bù Nhìn Mặt Nạ." },
    horn: { name: "Sừng Trâu Đá", icon: "mat_horn", price: 0, sell: 80, desc: "Chiến lợi phẩm từ Trâu Đá Vương." },
    fiber: { name: "Sợi Trúc Huyền", icon: "mat_fiber", price: 0, sell: 18, desc: "Sợi trúc dai như thép. Rơi ở Rừng Trúc Huyền. Dùng để tiến hóa vũ khí lớp lên bậc II." },
    feather: { name: "Lông Quạ Đen", icon: "mat_feather", price: 0, sell: 24, desc: "Rơi ở Thung Lũng Hắc Nha. Dùng để tiến hóa vũ khí lớp lên bậc III." },
    silk: { name: "Tơ Hắc Nha", icon: "mat_silk", price: 0, sell: 60, desc: "Tơ của quái tinh anh Nhện Hắc Nha. Cần cho vũ khí bậc III." },
    moon: { name: "Mảnh Nguyệt Thạch", icon: "mat_moon", price: 0, sell: 30, desc: "Rơi ở Phế Tích Nguyệt Ảnh. Dùng để tiến hóa vũ khí lớp lên bậc IV." },
    blood: { name: "Huyết Tinh Thạch", icon: "mat_blood", price: 0, sell: 90, desc: "Đá cường hóa hiếm, rơi từ Thạch Tượng Nguyệt Ảnh và Quỷ Ảnh." },
    dark: { name: "Hắc Diệm Thạch", icon: "mat_dark", price: 0, sell: 40, desc: "Đá cháy lửa xanh ở Pháo Đài U Minh. Dùng cho vũ khí bậc V." },
    core: { name: "Lõi U Minh", icon: "mat_core", price: 0, sell: 0, desc: "Chỉ Thủ Lĩnh U Minh mới có. Cần để tiến hóa vũ khí lớp lên bậc V." },
    cloudstone: { name: "Tinh Thạch Mây", icon: "mat_cloud", price: 0, sell: 48, desc: "Rơi ở Biển Mây Phù Vân. Dùng để tiến hóa vũ khí lớp lên bậc VI." },
    mechcore: { name: "Lõi Cơ Quan", icon: "mat_mech", price: 0, sell: 72, desc: "Rơi từ quái và boss Thành Cổ Thiên Cơ. Cần cho vũ khí bậc VII." },
    spiritseed: { name: "Hạt Linh Mộc", icon: "mat_seed", price: 0, sell: 100, desc: "Thu ở Rừng Linh Hồn. Dùng để tiến hóa vũ khí lớp lên bậc VIII." },
    thunder: { name: "Lôi Tinh", icon: "mat_thunder", price: 0, sell: 140, desc: "Thu ở Sơn Mạch Lôi Đình. Bảo vật để rèn vũ khí bậc VIII." },
    fateseal: { name: "Ấn Thiên Mệnh", icon: "mat_seal", price: 0, sell: 0, desc: "Chỉ Thiên Ảnh Chưởng Môn mới có. Cần để tiến hóa vũ khí lớp lên bậc IX." },
  };
  const POTIONS = {
    pot_hp: { name: "Bình Máu Nhỏ", icon: "pot_hp", price: 20, heal: 50, desc: "Hồi 50 HP. Dùng được khi đang chiến đấu." },
    pot_hp2: { name: "Bình Máu Lớn", icon: "pot_hp2", price: 55, heal: 130, desc: "Hồi 130 HP. Dùng được khi đang chiến đấu." },
    pot_hp3: { name: "Linh Đan Hồi Huyết", icon: "pot_hp3", price: 140, heal: 320, lv: 15, desc: "Hồi 320 HP. Dùng được khi đang chiến đấu." },
    pot_mp: { name: "Trà Linh Khí", icon: "pot_mp", price: 25, mana: 30, desc: "Hồi 30 MP. Dùng được khi đang chiến đấu." },
    pot_mp2: { name: "Linh Trà Thượng Phẩm", icon: "pot_mp2", price: 80, mana: 90, lv: 12, desc: "Hồi 90 MP. Dùng được khi đang chiến đấu." },
    pot_hp4: { name: "Linh Đan Hồi Huyết Thượng Phẩm", icon: "pot_hp3", price: 420, heal: 950, lv: 35, desc: "Hồi 950 HP. Bình máu cấp cao cho chương 30-50." },
    pot_mp3: { name: "Linh Trà Cửu U", icon: "pot_mp2", price: 260, mana: 240, lv: 35, desc: "Hồi 240 MP. Trà linh khí cấp cao cho chương 30-50." },
  };

  // Weapon evolution costs, by the tier being reached.
  const EVOLVE = {
    2: { lv: 15, gold: 400, mats: { fiber: 6, stone: 3 }, note: "Gia cố bằng Sợi Trúc Huyền." },
    3: { lv: 20, gold: 900, mats: { feather: 6, silk: 2, stone: 5 }, note: "Tinh luyện bằng Tơ Hắc Nha của quái tinh anh." },
    4: { lv: 25, gold: 1600, mats: { moon: 6, blood: 3, stone: 6 }, note: "Rèn với Huyết Tinh Thạch, đá cường hóa hiếm." },
    5: { lv: 30, gold: 3000, mats: { core: 1, dark: 6, blood: 2, stone: 8 }, note: "Cần Lõi U Minh của boss chương. Không mua được bằng vàng." },
    6: { lv: 35, gold: 5000, mats: { cloudstone: 8, dark: 4, stone: 10 }, note: "Rèn với Tinh Thạch Mây của Biển Mây." },
    7: { lv: 40, gold: 8000, mats: { mechcore: 8, blood: 4, stone: 12 }, note: "Cần Lõi Cơ Quan lấy từ Thành Cổ Thiên Cơ." },
    8: { lv: 45, gold: 12000, mats: { spiritseed: 8, moon: 6, stone: 15 }, note: "Cần Hạt Linh Mộc của Rừng Linh Hồn." },
    9: { lv: 50, gold: 20000, mats: { fateseal: 1, thunder: 8, stone: 20 }, note: "Cần Ấn Thiên Mệnh của boss cuối. Không mua được bằng vàng." },
  };

  // lvBand: the CEFR levels a monster asks. topics: [primary, secondary].
  // telegraph: a boss gathers power every N questions; answering that question right breaks it.
  const MONSTERS = {
    radish: { name: "Củ Cải Tinh", tier: "normal", lv: 1, hp: 36, atk: 12, exp: 14, gold: [5, 9], topics: ["food", "animals"], lvBand: ["A1", "A1"],
      drops: [["mat", "stone", 0.06], ["pot", "pot_hp", 0.12], ["item", "b_straw", 0.04]], respawn: 10000, desc: "Củ cải ham chơi, hay lăn khắp cánh đồng." },
    dew: { name: "Giọt Sương Nhí", tier: "normal", lv: 3, hp: 64, atk: 15, exp: 22, gold: [8, 13], topics: ["nature", "animals"], lvBand: ["A1", "A1"],
      drops: [["mat", "stone", 0.1], ["pot", "pot_hp", 0.12], ["item", "h_straw", 0.04], ["item", "r_moon", 0.03]], respawn: 10000, desc: "Giọt sương buổi sớm biết nhảy tưng tưng." },
    mush: { name: "Nấm Đá", tier: "normal", lv: 5, hp: 110, atk: 20, exp: 36, gold: [12, 18], topics: ["home", "school"], lvBand: ["A1", "A2"],
      drops: [["mat", "spore", 0.7], ["mat", "stone", 0.14], ["pot", "pot_hp", 0.1], ["item", "g_leather", 0.03]], respawn: 12000, desc: "Nấm mọc trên đá, cứng đầu và khó tính." },
    elite: { name: "Bù Nhìn Mặt Nạ", tier: "elite", lv: 7, hp: 260, atk: 26, exp: 120, gold: [50, 70], topics: ["family", "jobs"], lvBand: ["A1", "A2"], chip: 3,
      drops: [["mat", "stone", 1, 2], ["mat", "straw", 1], ["item", "m_oni", 0.25], ["item", "a_lacquer", 0.15], ["item", "w_jade", 0.1]], respawn: 45000,
      desc: "Quái tinh anh. Cứ 3 câu nó tung một đòn quét rơm, dù bạn trả lời đúng." },
    boss: { name: "Trâu Đá Vương", tier: "boss", lv: 9, hp: 640, atk: 30, exp: 420, gold: [240, 280], topics: ["travel", "phrases"], lvBand: ["A1", "A2"], phraseEvery: 3,
      drops: [["item", "w_buffalo", 1], ["mat", "horn", 1], ["mat", "stone", 1, 4], ["item", "w_legend", 0.08], ["item", "n_jade", 0.3]], respawn: 90000,
      desc: "Boss nhiệm vụ. Cứ 3 câu có 1 cụm từ. Dưới nửa máu sẽ nổi giận: đòn đánh mạnh hơn." },

    // ---- Rừng Trúc Huyền, Lv 10-14
    wolf: { name: "Sói Trúc", tier: "normal", lv: 10, hp: 230, atk: 44, exp: 70, gold: [22, 32], topics: ["feelings", "health"], lvBand: ["A2", "B1"],
      drops: [["mat", "fiber", 0.5], ["mat", "stone", 0.12], ["pot", "pot_hp2", 0.1], ["item", "m_wolf", 0.03], ["item", "h_bamboo", 0.03]], respawn: 12000, desc: "Sói lông xanh trúc, rình trong bóng lá." },
    spider: { name: "Nhện Độc", tier: "normal", lv: 11, hp: 260, atk: 48, exp: 80, gold: [24, 34], topics: ["health", "weather"], lvBand: ["A2", "B1"],
      drops: [["mat", "fiber", 0.5], ["mat", "stone", 0.12], ["pot", "pot_mp", 0.12], ["item", "r_spider", 0.03], ["item", "g_bamboo", 0.03]], respawn: 12000, desc: "Nhện tím giăng tơ giữa các thân trúc." },
    fox: { name: "Hồ Ly Non", tier: "normal", lv: 13, hp: 320, atk: 54, exp: 100, gold: [28, 40], topics: ["feelings", "city"], lvBand: ["A2", "B1"],
      drops: [["mat", "fiber", 0.55], ["mat", "stone", 0.14], ["item", "bl_fox", 0.04], ["item", "n_fox", 0.03], ["item", "j_fox", 0.02], ["item", "a_bamboo", 0.03], ["item", "p_bamboo", 0.03]], respawn: 12000, desc: "Cáo con tinh nghịch, đuôi phát lửa nhỏ." },
    // ---- Thung Lũng Hắc Nha, Lv 15-19
    crow: { name: "Quạ Đen", tier: "normal", lv: 15, hp: 380, atk: 62, exp: 135, gold: [34, 48], topics: ["weather", "city"], lvBand: ["B1", "B1"],
      drops: [["mat", "feather", 0.6], ["mat", "stone", 0.15], ["pot", "pot_hp2", 0.12], ["item", "h_crow", 0.03], ["item", "b_crow", 0.03], ["item", "p_crow", 0.03]], respawn: 12000, desc: "Quạ mắt xanh, kêu to báo động cả thung lũng." },
    bandit: { name: "Thổ Phỉ", tier: "normal", lv: 17, hp: 450, atk: 70, exp: 160, gold: [45, 65], topics: ["work", "sports"], lvBand: ["B1", "B1"],
      drops: [["mat", "feather", 0.4], ["mat", "stone", 0.18], ["pot", "pot_hp3", 0.08], ["item", "bl_bandit", 0.04], ["item", "a_crow", 0.03]], respawn: 13000, desc: "Tên thổ phỉ râu rậm, tay cầm gậy gộc." },
    spiderq: { name: "Nhện Hắc Nha", tier: "elite", lv: 18, hp: 1100, atk: 78, exp: 520, gold: [140, 180], topics: ["sports", "work"], lvBand: ["B1", "B1"], chip: 3,
      drops: [["mat", "silk", 1, 2], ["mat", "stone", 1, 2], ["mat", "feather", 1, 2], ["item", "r_spider", 0.2], ["item", "a_crow", 0.15]], respawn: 45000,
      desc: "Quái tinh anh. Cứ 3 câu nó phun tơ độc, dù bạn trả lời đúng." },
    // ---- Phế Tích Nguyệt Ảnh, Lv 20-24
    golem: { name: "Hộ Vệ Đá", tier: "normal", lv: 20, hp: 520, atk: 80, exp: 230, gold: [55, 75], topics: ["environment", "tech"], lvBand: ["B1", "B2"],
      drops: [["mat", "moon", 0.55], ["mat", "stone", 0.18], ["item", "g_golem", 0.03], ["item", "h_moon", 0.03]], respawn: 13000, desc: "Tượng đá canh đền, tỉnh dậy khi có người lạ." },
    ronin: { name: "Ninja Lưu Vong", tier: "normal", lv: 22, hp: 580, atk: 88, exp: 270, gold: [60, 85], topics: ["work", "tech"], lvBand: ["B1", "B2"],
      drops: [["mat", "moon", 0.5], ["mat", "stone", 0.2], ["pot", "pot_hp3", 0.1], ["item", "m_ronin", 0.03], ["item", "a_moon", 0.03], ["item", "bl_moon", 0.03]], respawn: 13000, desc: "Ninja bỏ làng, kiếm đã mẻ nhưng tay vẫn nhanh." },
    wisp: { name: "Linh Thể", tier: "normal", lv: 23, hp: 600, atk: 92, exp: 290, gold: [62, 88], topics: ["feelings", "environment"], lvBand: ["B1", "B2"],
      drops: [["mat", "moon", 0.5], ["pot", "pot_mp2", 0.15], ["item", "j_moon", 0.03], ["item", "n_moon", 0.03], ["item", "p_moon", 0.03]], respawn: 13000, desc: "Đốm linh hồn lạc giữa phế tích." },
    moonboss: { name: "Thạch Tượng Nguyệt Ảnh", tier: "boss", lv: 24, hp: 3200, atk: 100, exp: 1500, gold: [600, 700], topics: ["phrases2", "environment"], lvBand: ["B1", "B2"], phraseEvery: 3,
      telegraph: { every: 4, mult: 2.2, name: "Nguyệt Quang Chấn" },
      drops: [["mat", "blood", 1, 3], ["mat", "moon", 1, 4], ["mat", "stone", 1, 4], ["item", "a_moon", 0.3], ["item", "j_moon", 0.25]], respawn: 90000,
      desc: "Boss khu vực. Cứ 4 câu nó tụ ánh trăng: trả lời đúng câu đó để ngắt đòn." },
    // ---- Pháo Đài U Minh, Lv 25-30
    guard: { name: "Ám Vệ", tier: "normal", lv: 25, hp: 700, atk: 104, exp: 360, gold: [75, 100], topics: ["tech", "health"], lvBand: ["B2", "B2"],
      drops: [["mat", "dark", 0.5], ["mat", "stone", 0.2], ["pot", "pot_hp3", 0.12], ["item", "h_uminh", 0.03], ["item", "b_shade", 0.03], ["item", "p_uminh", 0.03]], respawn: 13000, desc: "Lính gác pháo đài, áo giáp đen đặc." },
    shade: { name: "Quỷ Ảnh", tier: "normal", lv: 27, hp: 780, atk: 112, exp: 420, gold: [80, 110], topics: ["feelings", "environment"], lvBand: ["B2", "B2"],
      drops: [["mat", "dark", 0.5], ["mat", "blood", 0.08], ["pot", "pot_mp2", 0.15], ["item", "m_shade", 0.02], ["item", "r_uminh", 0.03], ["item", "bl_uminh", 0.03]], respawn: 13000, desc: "Cái bóng tách khỏi chủ, cười khúc khích." },
    lord: { name: "Thủ Lĩnh U Minh", tier: "boss", lv: 30, hp: 5200, atk: 125, exp: 3000, gold: [1400, 1600], topics: ["phrases2", "work"], lvBand: ["B1", "B2"], phraseEvery: 3,
      telegraph: { every: 4, mult: 2.4, name: "U Minh Hỏa Trảm" },
      drops: [["mat", "core", 1], ["mat", "dark", 1, 4], ["mat", "blood", 1, 3], ["item", "a_uminh", 0.25], ["item", "j_uminh", 0.3]], respawn: 120000,
      desc: "Boss chương 1. Cứ 4 câu hắn vung đao lửa xanh: trả lời đúng câu đó để ngắt đòn." },

    // ---- Biển Mây Phù Vân, Lv 30-34
    hawk: { name: "Ưng Phong", tier: "normal", lv: 30, hp: 900, atk: 132, exp: 480, gold: [110, 150], topics: ["nature", "travel"], lvBand: ["A2", "B1"],
      drops: [["mat", "cloudstone", 0.55], ["mat", "stone", 0.2], ["pot", "pot_hp3", 0.12], ["item", "a_cloud", 0.03], ["item", "b_cloud", 0.03]], respawn: 13000, desc: "Ưng cưỡi gió, lượn vòng trên các đảo mây." },
    monkey: { name: "Khỉ Đá", tier: "normal", lv: 32, hp: 1000, atk: 142, exp: 540, gold: [120, 165], topics: ["animals", "nature"], lvBand: ["A2", "B1"],
      drops: [["mat", "cloudstone", 0.5], ["mat", "stone", 0.2], ["item", "n_cloud", 0.03]], respawn: 13000, desc: "Khỉ đá giữ lối lên đền, đánh rất chắc." },
    spiritbird: { name: "Linh Điểu", tier: "normal", lv: 33, hp: 1080, atk: 150, exp: 580, gold: [130, 175], topics: ["nature", "feelings"], lvBand: ["B1", "B1"],
      drops: [["mat", "cloudstone", 0.5], ["item", "b_cloud", 0.03], ["pot", "pot_mp2", 0.12]], respawn: 13000, desc: "Chim linh lao tới rất nhanh, có báo trước bằng vệt sáng." },
    cloudelite: { name: "Vệ Binh Phù Vân", tier: "elite", lv: 34, hp: 2600, atk: 168, exp: 1500, gold: [300, 380], topics: ["nature", "travel"], lvBand: ["B1", "B1"], chip: 3,
      drops: [["mat", "cloudstone", 1, 2], ["mat", "stone", 1, 2], ["item", "a_cloud", 0.15]], respawn: 45000, desc: "Quái tinh anh. Cứ 3 câu nó tung một đòn gió xoáy, dù bạn trả lời đúng." },

    // ---- Thành Cổ Thiên Cơ, Lv 35-39
    mechguard: { name: "Cơ Quan Vệ Binh", tier: "normal", lv: 35, hp: 1250, atk: 168, exp: 720, gold: [150, 200], topics: ["tech", "work"], lvBand: ["B1", "B2"],
      drops: [["mat", "mechcore", 0.5], ["mat", "stone", 0.2], ["pot", "pot_hp3", 0.12], ["item", "a_mech", 0.03]], respawn: 13000, desc: "Giáp dày, đánh chậm nhưng đòn nện có báo trước." },
    shadowninja: { name: "Ninja Lưu Ảnh", tier: "normal", lv: 37, hp: 1350, atk: 180, exp: 800, gold: [160, 215], topics: ["work", "city"], lvBand: ["B1", "B2"],
      drops: [["mat", "mechcore", 0.5], ["item", "m_mech", 0.03], ["item", "r_mech", 0.03]], respawn: 13000, desc: "Áp sát cực nhanh, di chuyển từng đoạn ngắn." },
    stonecannon: { name: "Pháo Thạch", tier: "normal", lv: 38, hp: 1420, atk: 190, exp: 860, gold: [170, 230], topics: ["tech", "environment"], lvBand: ["B1", "B2"],
      drops: [["mat", "mechcore", 0.5], ["mat", "stone", 0.2], ["item", "r_mech", 0.03]], respawn: 13000, desc: "Bắn đá từ xa, có thể né nếu để ý đường đạn." },
    citadelboss: { name: "Hộ Thành Thiên Cơ", tier: "boss", lv: 39, hp: 12000, atk: 210, exp: 5200, gold: [2400, 2800], topics: ["phrases2", "tech"], lvBand: ["B1", "B2"], phraseEvery: 3,
      telegraph: { every: 4, mult: 2.4, name: "Cơ Quan Nộ Pháo" },
      phases: [{ at: 0.5, mult: 1.25, name: "Cơ quan toàn khai", chip: 2, summon: { n: 2, mon: "mechguard", name: "Cơ Quan Nhỏ", every: 3 } }],
      drops: [["mat", "mechcore", 2, 3], ["mat", "stone", 1, 4], ["item", "a_mech", 0.3], ["item", "r_mech", 0.25]], respawn: 120000,
      desc: "Boss Thành Cổ. Nửa máu hắn mở toàn bộ cơ quan, triệu hồi Cơ Quan Nhỏ và đòn mạnh hơn." },
    // ---- Rừng Linh Hồn, Lv 40-44
    woodspirit: { name: "Hồn Mộc", tier: "normal", lv: 40, hp: 1750, atk: 210, exp: 1100, gold: [190, 260], topics: ["environment", "nature"], lvBand: ["B1", "B2"],
      drops: [["mat", "spiritseed", 0.5], ["mat", "stone", 0.2], ["item", "a_spirit", 0.03]], respawn: 13000, desc: "Thân gỗ cứng, đi chậm nhưng rất khó hạ." },
    foxspirit: { name: "Hồ Ly Linh", tier: "normal", lv: 42, hp: 1850, atk: 224, exp: 1200, gold: [200, 275], topics: ["feelings", "nature"], lvBand: ["B2", "B2"],
      drops: [["mat", "spiritseed", 0.5], ["item", "j_spirit", 0.03]], respawn: 13000, desc: "Hồ ly linh hoạt, ra đòn rất nhanh." },
    forestvamp: { name: "Ma Cà Rồng Rừng", tier: "normal", lv: 43, hp: 1950, atk: 236, exp: 1280, gold: [210, 290], topics: ["feelings", "health"], lvBand: ["B2", "B2"],
      drops: [["mat", "spiritseed", 0.5], ["item", "b_spirit", 0.03], ["mat", "blood", 0.08]], respawn: 13000, desc: "Hút một ít máu nhưng có thời gian hồi rõ ràng." },
    forestboss: { name: "Thủ Hộ Linh Mộc", tier: "boss", lv: 44, hp: 15000, atk: 250, exp: 6400, gold: [3000, 3400], topics: ["phrases2", "environment"], lvBand: ["B1", "B2"], phraseEvery: 3,
      telegraph: { every: 4, mult: 2.5, name: "Rễ Cây Trói" },
      phases: [{ at: 0.55, mult: 1.2, name: "Rừng gọi rễ", summon: { n: 2, mon: "woodspirit", name: "Rễ Linh Mộc", every: 3 } }, { at: 0.25, mult: 1.4, name: "Linh mộc cuồng nộ", chip: 2 }],
      drops: [["mat", "spiritseed", 2, 3], ["mat", "stone", 1, 4], ["item", "a_spirit", 0.3], ["item", "j_spirit", 0.25]], respawn: 120000,
      desc: "Boss Rừng Linh Hồn. Vùng tấn công dưới đất luôn báo trước, và hắn gọi Rễ Linh Mộc trồi lên." },
    // ---- Sơn Mạch Lôi Đình, Lv 45-49
    thunderwolf: { name: "Lang Lôi", tier: "normal", lv: 45, hp: 2350, atk: 262, exp: 1550, gold: [230, 310], topics: ["animals", "weather"], lvBand: ["B2", "B2"],
      drops: [["mat", "thunder", 0.5], ["mat", "stone", 0.2], ["item", "a_thunder", 0.03]], respawn: 13000, desc: "Sói lao tới sau dấu hiệu tích điện trên lông." },
    stonegeneral: { name: "Thạch Tướng", tier: "normal", lv: 47, hp: 2500, atk: 278, exp: 1650, gold: [245, 330], topics: ["environment", "tech"], lvBand: ["B2", "B2"],
      drops: [["mat", "thunder", 0.5], ["item", "g_thunder", 0.03]], respawn: 13000, desc: "Máu cao, đòn nện diện rộng có báo trước." },
    thunderguard: { name: "Ảnh Vệ Lôi", tier: "normal", lv: 48, hp: 2600, atk: 290, exp: 1720, gold: [255, 340], topics: ["weather", "work"], lvBand: ["B2", "B2"],
      drops: [["mat", "thunder", 0.5], ["item", "n_thunder", 0.03]], respawn: 13000, desc: "Đánh theo chuỗi ngắn rồi nghỉ, dễ học để né." },
    thunderboss: { name: "Tướng Quân Lôi Đình", tier: "boss", lv: 49, hp: 19000, atk: 310, exp: 8200, gold: [3800, 4300], topics: ["phrases2", "weather"], lvBand: ["B2", "B2"], phraseEvery: 3,
      telegraph: { every: 4, mult: 2.6, name: "Lôi Đình Nộ Sát" },
      phases: [{ at: 0.65, mult: 1.2, name: "Đổi thế đánh" }, { at: 0.35, mult: 1.35, name: "Triệu hồi lôi binh", summon: { n: 3, mon: "thunderguard", name: "Lôi Binh", every: 3 } }, { at: 0.15, mult: 1.5, name: "Lôi đình toàn lực", chip: 2 }],
      drops: [["mat", "thunder", 2, 3], ["mat", "stone", 1, 4], ["item", "a_thunder", 0.3]], respawn: 120000,
      desc: "Boss Sơn Mạch. Nhiều giai đoạn, khi yếu còn triệu hồi Lôi Binh hộ vệ." },
    // ---- Điện Thiên Mệnh, Lv 50
    fateboss: { name: "Thiên Ảnh Chưởng Môn", tier: "boss", lv: 50, hp: 30000, atk: 360, exp: 15000, gold: [6000, 7000], topics: ["phrases2", "feelings"], lvBand: ["B2", "B2"], phraseEvery: 3,
      telegraph: { every: 3, mult: 2.8, name: "Thiên Ảnh Quyết" },
      phases: [{ at: 0.7, mult: 1.2, name: "Ảnh thứ hai", chip: 3 }, { at: 0.4, mult: 1.4, name: "Ảnh thứ ba", summon: { n: 2, mon: "shadowninja", name: "Ảnh Phân Thân", every: 3 } }, { at: 0.15, mult: 1.6, name: "Thiên mệnh giáng lâm", chip: 2 }],
      drops: [["mat", "fateseal", 1], ["item", "h_fate", 0.3], ["item", "a_fate", 0.25], ["item", "r_fate", 0.25], ["item", "j_fate", 0.2], ["item", "bl_fate", 0.25]], respawn: 180000,
      desc: "Boss cuối chương 30-50. Ba giai đoạn: Ảnh thứ hai, Ảnh thứ ba phân thân, và Thiên mệnh giáng lâm." },

    dummy: { name: "Hình Nộm Luyện Tập", tier: "dummy", lv: 0, hp: 1, atk: 0, exp: 0, gold: [0, 0], topics: [], drops: [], desc: "Luyện tập: không mất máu, không giới hạn thời gian." },
  };

  // req: what opens the map. lvRange: the levels it is made for.
  const MAPS = {
    village: { name: "Làng Mộc Bản", width: 2600, theme: "village", lvRange: [1, 9], safe: true,
      spawns: [], exits: [{ side: "right", to: "farm1" }] },
    farm1: { name: "Cánh Đồng Lúa Vàng", width: 3800, theme: "farm1", lvRange: [1, 4],
      spawns: [
        { m: "radish", x: 760 }, { m: "radish", x: 1180 }, { m: "radish", x: 1560 }, { m: "radish", x: 1960 },
        { m: "dew", x: 2360 }, { m: "dew", x: 2760 }, { m: "dew", x: 3120 }, { m: "dew", x: 3420 },
      ],
      exits: [{ side: "left", to: "village" }, { side: "right", to: "farm2" }] },
    farm2: { name: "Ruộng Bậc Thang Đá", width: 4400, theme: "farm2", lvRange: [5, 9], req: { flag: "farm2" },
      spawns: [
        { m: "mush", x: 700 }, { m: "mush", x: 1150 }, { m: "mush", x: 1650 }, { m: "mush", x: 2150 }, { m: "mush", x: 2600 },
        { m: "elite", x: 3080 }, { m: "boss", x: 3980, needQuest: "q8" },
      ],
      exits: [{ side: "left", to: "farm1" }, { side: "right", to: "bamboo" }] },
    bamboo: { name: "Rừng Trúc Huyền", width: 4300, theme: "bamboo", lvRange: [10, 14], req: { lv: 10, cls: true }, camp: 420,
      spawns: [
        { m: "wolf", x: 900 }, { m: "wolf", x: 1300 }, { m: "spider", x: 1750 }, { m: "wolf", x: 2150 },
        { m: "spider", x: 2550 }, { m: "fox", x: 2950 }, { m: "spider", x: 3300 }, { m: "fox", x: 3650 }, { m: "fox", x: 3980 },
      ],
      exits: [{ side: "left", to: "farm2" }, { side: "right", to: "valley" }] },
    valley: { name: "Thung Lũng Hắc Nha", width: 4300, theme: "valley", lvRange: [15, 19], req: { lv: 15, quest: "q13" }, camp: 420,
      spawns: [
        { m: "crow", x: 900 }, { m: "crow", x: 1300 }, { m: "bandit", x: 1750 }, { m: "crow", x: 2150 },
        { m: "bandit", x: 2600 }, { m: "crow", x: 3000 }, { m: "bandit", x: 3350 }, { m: "spiderq", x: 3880 },
      ],
      exits: [{ side: "left", to: "bamboo" }, { side: "right", to: "ruins" }] },
    ruins: { name: "Phế Tích Nguyệt Ảnh", width: 4600, theme: "ruins", lvRange: [20, 24], req: { lv: 20, quest: "q17" }, camp: 420,
      spawns: [
        { m: "golem", x: 900 }, { m: "golem", x: 1300 }, { m: "ronin", x: 1700 }, { m: "wisp", x: 2100 },
        { m: "ronin", x: 2500 }, { m: "golem", x: 2900 }, { m: "wisp", x: 3250 }, { m: "ronin", x: 3550 }, { m: "wisp", x: 3800 },
        { m: "moonboss", x: 4250, needQuest: "q21" },
      ],
      exits: [{ side: "left", to: "valley" }, { side: "right", to: "fortress" }] },
    fortress: { name: "Pháo Đài U Minh", width: 4600, theme: "fortress", lvRange: [25, 30], req: { lv: 25, quest: "q22" }, camp: 420,
      spawns: [
        { m: "guard", x: 900 }, { m: "guard", x: 1300 }, { m: "shade", x: 1700 }, { m: "guard", x: 2100 },
        { m: "shade", x: 2500 }, { m: "guard", x: 2900 }, { m: "shade", x: 3300 }, { m: "shade", x: 3650 },
        { m: "lord", x: 4250, needQuest: "q26" },
      ],
      exits: [{ side: "left", to: "ruins" }, { side: "right", to: "cloudsea" }] },

    // ==== Chương 2: Lv 30-50 ====
    cloudsea: { name: "Biển Mây Phù Vân", width: 4700, theme: "cloudsea", lvRange: [30, 34], req: { lv: 30 }, camp: 460,
      spawns: [
        { m: "hawk", x: 950 }, { m: "monkey", x: 1350 }, { m: "hawk", x: 1750 }, { m: "spiritbird", x: 2100 },
        { m: "monkey", x: 2450 }, { m: "spiritbird", x: 2800 }, { m: "hawk", x: 3100 }, { m: "monkey", x: 3400 },
        { m: "spiritbird", x: 3700 }, { m: "cloudelite", x: 4250, needQuest: "q32" },
      ],
      exits: [{ side: "left", to: "fortress" }, { side: "right", to: "citadel" }] },
    citadel: { name: "Thành Cổ Thiên Cơ", width: 5000, theme: "citadel", lvRange: [35, 39], req: { lv: 35, quest: "q33" }, camp: 460,
      spawns: [
        { m: "mechguard", x: 950 }, { m: "shadowninja", x: 1350 }, { m: "mechguard", x: 1750 }, { m: "stonecannon", x: 2150 },
        { m: "shadowninja", x: 2550 }, { m: "stonecannon", x: 2950 }, { m: "mechguard", x: 3350 }, { m: "shadowninja", x: 3750 },
        { m: "stonecannon", x: 4050 }, { m: "citadelboss", x: 4620, needQuest: "q37" },
      ],
      exits: [{ side: "left", to: "cloudsea" }, { side: "right", to: "spiritforest" }] },
    spiritforest: { name: "Rừng Linh Hồn", width: 5000, theme: "spiritforest", lvRange: [40, 44], req: { lv: 40, quest: "q38" }, camp: 460,
      spawns: [
        { m: "woodspirit", x: 950 }, { m: "foxspirit", x: 1350 }, { m: "woodspirit", x: 1750 }, { m: "forestvamp", x: 2150 },
        { m: "foxspirit", x: 2550 }, { m: "forestvamp", x: 2950 }, { m: "woodspirit", x: 3350 }, { m: "foxspirit", x: 3750 },
        { m: "forestvamp", x: 4050 }, { m: "forestboss", x: 4620, needQuest: "q42" },
      ],
      exits: [{ side: "left", to: "citadel" }, { side: "right", to: "thunderrange" }] },
    thunderrange: { name: "Sơn Mạch Lôi Đình", width: 5100, theme: "thunderrange", lvRange: [45, 49], req: { lv: 45, quest: "q43" }, camp: 460,
      spawns: [
        { m: "thunderwolf", x: 950 }, { m: "thunderguard", x: 1350 }, { m: "stonegeneral", x: 1750 }, { m: "thunderwolf", x: 2150 },
        { m: "thunderguard", x: 2550 }, { m: "stonegeneral", x: 2950 }, { m: "thunderwolf", x: 3350 }, { m: "thunderguard", x: 3750 },
        { m: "stonegeneral", x: 4050 }, { m: "thunderboss", x: 4720, needQuest: "q47" },
      ],
      exits: [{ side: "left", to: "spiritforest" }, { side: "right", to: "fatehall" }] },
    fatehall: { name: "Điện Thiên Mệnh", width: 3800, theme: "fatehall", lvRange: [50, 50], req: { lv: 50, quest: "q47" }, camp: 460,
      spawns: [
        { m: "fateboss", x: 3250, needQuest: "q48" },
      ],
      exits: [{ side: "left", to: "thunderrange" }] },
  };
  const MAP_ORDER = ["village", "farm1", "farm2", "bamboo", "valley", "ruins", "fortress", "cloudsea", "citadel", "spiritforest", "thunderrange", "fatehall"];

  // Quest types: kill {m, n}, killAny {n}, topic {topic, n}, forge {plus}, collect {mat, n}, practice {n},
  // cls (choose a class), evolve {tier}, level {n}
  const QUESTS = [
    { id: "q1", main: true, giver: "elder", name: "Bước chân đầu tiên", type: "kill", m: "radish", n: 3,
      text: "Củ Cải Tinh đang phá ruộng ở Cánh Đồng Lúa Vàng. Ra khỏi làng về phía bên phải và hạ 3 con.",
      reward: { exp: 60, gold: 40, pots: { pot_hp: 2 } } },
    { id: "q2", main: true, giver: "elder", name: "Sương sớm trên đồng", type: "kill", m: "dew", n: 3,
      text: "Phía xa cánh đồng có Giọt Sương Nhí. Hạ 3 con và mang đá cường hóa về.",
      reward: { exp: 100, gold: 60, mats: { stone: 2 } } },
    { id: "q3", main: true, giver: "scholar", name: "Lời dạy của Thầy Bút", type: "topic", topic: "animals", n: 6,
      text: "Một ninja giỏi phải gọi đúng tên muôn loài. Trả lời đúng 6 từ chủ đề Động vật khi chiến đấu.",
      reward: { exp: 90, gold: 30, items: ["n_bead"] } },
    { id: "q4", main: true, giver: "smith", name: "Lửa lò rèn", type: "forge", plus: 1,
      text: "Đem một món trang bị tới lò rèn và cường hóa lên +1. Ruộng Bậc Thang Đá sẽ mở khi xong việc này.",
      reward: { exp: 80, mats: { stone: 2 }, unlock: "farm2" } },
    { id: "q5", main: true, giver: "elder", name: "Nấm trên ruộng đá", type: "collect", mat: "spore", n: 4,
      text: "Nấm Đá mọc kín Ruộng Bậc Thang. Thu 4 Bào Tử Nấm để làng làm thuốc.",
      reward: { exp: 180, gold: 120 } },
    { id: "q6", main: true, giver: "scholar", name: "Sửa lỗi sai", type: "practice", n: 5,
      text: "Mở Sổ tay, bấm Luyện lại và trả lời đúng 5 từ. Từ bạn từng sai sẽ được hỏi trước.",
      reward: { exp: 120, gold: 60, pots: { pot_mp: 2 } } },
    { id: "q7", main: true, giver: "elder", name: "Bóng đen trên ruộng", type: "kill", m: "elite", n: 1,
      text: "Một Bù Nhìn đeo mặt nạ quỷ đứng trên thửa ruộng cao. Hạ nó đi.",
      reward: { exp: 250, items: ["b_wind"], mats: { stone: 2 } } },
    { id: "q8", main: true, giver: "elder", name: "Trâu Đá Vương", type: "kill", m: "boss", n: 1,
      text: "Trâu Đá Vương đã thức giấc ở cuối Ruộng Bậc Thang. Nó nói bằng cả cụm từ. Đánh bại nó!",
      reward: { exp: 500, gold: 300 } },
    { id: "q9", main: true, giver: "elder", name: "Chọn con đường", type: "cls", n: 1,
      text: "Lên cấp 10 rồi chọn một trong ba lớp: Kiếm Ảnh, Ảnh Hành hoặc Linh Ẩn. Bấm vào chân dung ở góc trái khi đủ cấp. Rừng Trúc Huyền mở ra sau Ruộng Bậc Thang.",
      reward: { exp: 200, gold: 200, mats: { stone: 3 }, pots: { pot_hp2: 3 } } },

    // ---- Rừng Trúc Huyền
    { id: "q10", main: true, giver: "hermit", name: "Tiếng hú trong rừng trúc", type: "kill", m: "wolf", n: 4,
      text: "Sói Trúc rình người qua đường. Hạ 4 con giúp ta.", reward: { exp: 320, gold: 150, mats: { fiber: 2 } } },
    { id: "q11", main: true, giver: "hermit", name: "Tơ độc giữa lá", type: "kill", m: "spider", n: 4,
      text: "Nhện Độc giăng tơ kín lối đi. Dọn sạch 4 con.", reward: { exp: 380, gold: 160, mats: { stone: 2 }, pots: { pot_mp: 3 } } },
    { id: "q12", main: true, giver: "hermit", name: "Đuôi lửa nhỏ", type: "kill", m: "fox", n: 3,
      text: "Hồ Ly Non đốt mất mấy bụi trúc non. Bắt chúng ngoan lại: hạ 3 con.", reward: { exp: 450, gold: 200, mats: { fiber: 3 } } },
    { id: "q13", main: true, giver: "hermit", name: "Lưỡi vũ khí thứ hai", type: "evolve", tier: 2,
      text: "Lên cấp 15, gom Sợi Trúc Huyền rồi về Lò rèn ở làng tiến hóa vũ khí lớp lên bậc II. Thung Lũng Hắc Nha mở khi xong.",
      reward: { exp: 500, gold: 250, mats: { stone: 3 } } },
    // ---- Thung Lũng Hắc Nha
    { id: "q14", main: true, giver: "hunter", name: "Bầy quạ báo động", type: "kill", m: "crow", n: 5,
      text: "Quạ Đen kêu inh ỏi, thú trong thung lũng không dám ra. Hạ 5 con.", reward: { exp: 650, gold: 260, mats: { feather: 2 } } },
    { id: "q15", main: true, giver: "hunter", name: "Trại thổ phỉ", type: "kill", m: "bandit", n: 4,
      text: "Thổ Phỉ chặn đường buôn. Đánh lui 4 tên.", reward: { exp: 720, gold: 320, pots: { pot_hp3: 2 } } },
    { id: "q16", main: true, giver: "hunter", name: "Nữ hoàng tơ đen", type: "kill", m: "spiderq", n: 1,
      text: "Nhện Hắc Nha ngự ở cuối thung lũng. Hạ nó để lấy Tơ Hắc Nha.", reward: { exp: 900, gold: 400, mats: { stone: 3 } } },
    { id: "q17", main: true, giver: "hunter", name: "Vũ khí tinh luyện", type: "evolve", tier: 3,
      text: "Lên cấp 20 và tiến hóa vũ khí lớp lên bậc III ở Lò rèn. Phế Tích Nguyệt Ảnh mở khi xong.",
      reward: { exp: 1000, gold: 500, mats: { stone: 4 } } },
    // ---- Phế Tích Nguyệt Ảnh
    { id: "q18", main: true, giver: "monk", name: "Tượng đá thức giấc", type: "kill", m: "golem", n: 4,
      text: "Hộ Vệ Đá tấn công cả người hành hương. Hạ 4 tượng.", reward: { exp: 1100, gold: 420, mats: { moon: 2 } } },
    { id: "q19", main: true, giver: "monk", name: "Kẻ bỏ làng", type: "kill", m: "ronin", n: 4,
      text: "Ninja Lưu Vong lẩn trong phế tích. Hạ 4 tên.", reward: { exp: 1200, gold: 460 } },
    { id: "q20", main: true, giver: "monk", name: "Siêu thoát linh hồn", type: "kill", m: "wisp", n: 4,
      text: "Linh Thể lạc đường khóc suốt đêm. Giải thoát 4 linh thể.", reward: { exp: 1300, gold: 480, pots: { pot_mp2: 3 } } },
    { id: "q21", main: true, giver: "monk", name: "Phong ấn trăng vỡ", type: "kill", m: "moonboss", n: 1,
      text: "Thạch Tượng Nguyệt Ảnh đã phá phong ấn ở cuối phế tích. Đánh bại nó.", reward: { exp: 1600, gold: 700, mats: { blood: 1 } } },
    { id: "q22", main: true, giver: "monk", name: "Vũ khí hiếm", type: "evolve", tier: 4,
      text: "Lên cấp 25 và tiến hóa vũ khí lớp lên bậc IV bằng Huyết Tinh Thạch. Pháo Đài U Minh mở khi xong.",
      reward: { exp: 1800, gold: 800, mats: { stone: 5 } } },
    // ---- Pháo Đài U Minh
    { id: "q23", main: true, giver: "general", name: "Phá vòng vây", type: "kill", m: "guard", n: 5,
      text: "Ám Vệ canh mọi cổng. Hạ 5 tên để mở đường.", reward: { exp: 2000, gold: 800, mats: { dark: 2 } } },
    { id: "q24", main: true, giver: "general", name: "Bóng không chủ", type: "kill", m: "shade", n: 5,
      text: "Quỷ Ảnh bám theo bóng người. Hạ 5 con.", reward: { exp: 2200, gold: 900, mats: { blood: 1 } } },
    { id: "q25", main: true, giver: "general", name: "Ninja cấp 30", type: "level", n: 30,
      text: "Chỉ ninja cấp 30 mới đủ sức vào cổng boss. Luyện tới cấp 30.", reward: { gold: 1000, mats: { stone: 5 } } },
    { id: "q26", main: true, giver: "general", name: "Thủ Lĩnh U Minh", type: "kill", m: "lord", n: 1,
      text: "Cổng boss đã mở. Thủ Lĩnh U Minh đang chờ. Đánh bại hắn và lấy Lõi U Minh.", reward: { gold: 2000, mats: { stone: 5 } } },
    { id: "q27", main: true, giver: "general", name: "Kết thúc chương 1", type: "evolve", tier: 5,
      text: "Dùng Lõi U Minh tiến hóa vũ khí lớp lên bậc V. Đây là nhiệm vụ cuối chương 1.",
      reward: { gold: 3000, items: ["j_uminh"] } },

    // ---- Chương 2: Lv 30-50
    { id: "q28", main: true, giver: "general", name: "Dấu Vết Sau Pháo Đài", type: "kill", m: "hawk", n: 4,
      text: "Sau Pháo Đài U Minh có một luồng năng lượng lạ trên Biển Mây. Hạ 4 Ưng Phong để mở đường qua cổng phải.",
      reward: { exp: 900, gold: 700, mats: { stone: 3 } } },
    { id: "q29", main: true, giver: "guide", name: "Lời Gọi Phù Vân", type: "kill", m: "monkey", n: 4,
      text: "Người dẫn đường Vân Du đang chờ trên Biển Mây. Hạ 4 Khỉ Đá giữ lối lên đền.",
      reward: { exp: 1100, gold: 750, mats: { cloudstone: 2 } } },
    { id: "q30", main: true, giver: "guide", name: "Đàn chim linh", type: "kill", m: "spiritbird", n: 4,
      text: "Linh Điểu quấy phá các cầu treo. Hạ 4 con để Vân Du mở đường an toàn.",
      reward: { exp: 1300, gold: 800, mats: { cloudstone: 3 } } },
    { id: "q31", main: true, giver: "guide", name: "Tinh thạch trên mây", type: "collect", mat: "cloudstone", n: 5,
      text: "Vân Du cần 5 Tinh Thạch Mây để rèn vũ khí bậc VI. Nhặt đủ rồi mang lại.",
      reward: { exp: 1500, gold: 900, pots: { pot_hp3: 3 } } },
    { id: "q32", main: true, giver: "guide", name: "Vệ binh cuối trời", type: "kill", m: "cloudelite", n: 1,
      text: "Vệ Binh Phù Vân canh cổng sang Thành Cổ. Đánh bại nó để mở lối.",
      reward: { exp: 1800, gold: 1200, mats: { stone: 4 } } },
    { id: "q33", main: true, giver: "smith", name: "Cổng Thành Cổ", type: "evolve", tier: 6,
      text: "Lên cấp 35, gom Tinh Thạch Mây rồi về Lò rèn tiến hóa vũ khí lớp lên bậc VI. Thành Cổ Thiên Cơ mở khi xong.",
      reward: { exp: 2000, gold: 1500, mats: { stone: 5 } } },
    { id: "q34", main: true, giver: "keeper", name: "Bí Mật Thiên Cơ", type: "kill", m: "mechguard", n: 5,
      text: "Cơ Quan Vệ Binh canh mọi cổng tháp. Hạ 5 tên để vào sâu trong thành.",
      reward: { exp: 2400, gold: 1600, mats: { mechcore: 2 } } },
    { id: "q35", main: true, giver: "keeper", name: "Lưu ảnh trong ngõ", type: "kill", m: "shadowninja", n: 4,
      text: "Ninja Lưu Ảnh lẩn trong các ngõ nhiều tầng. Hạ 4 tên.",
      reward: { exp: 2700, gold: 1750, mats: { mechcore: 2 } } },
    { id: "q36", main: true, giver: "keeper", name: "Lõi cơ quan", type: "collect", mat: "mechcore", n: 6,
      text: "Thủ Cổ cần 6 Lõi Cơ Quan để sửa cánh cổng phong ấn.",
      reward: { exp: 3000, gold: 1900, mats: { stone: 5 } } },
    { id: "q37", main: true, giver: "keeper", name: "Hộ Thành Thiên Cơ", type: "kill", m: "citadelboss", n: 1,
      text: "Cổng phong ấn đã mở. Hạ Hộ Thành Thiên Cơ để lấy lõi và mở đường sang Rừng Linh Hồn.",
      reward: { exp: 4200, gold: 2600, mats: { blood: 2 } } },
    { id: "q38", main: true, giver: "smith", name: "Phong Ấn Linh Mộc", type: "evolve", tier: 7,
      text: "Lên cấp 40 và tiến hóa vũ khí lớp lên bậc VII ở Lò rèn. Rừng Linh Hồn mở khi xong.",
      reward: { exp: 3200, gold: 2500, mats: { stone: 6 } } },
    { id: "q39", main: true, giver: "forestmonk", name: "Tiếng Gọi Hồn Mộc", type: "kill", m: "woodspirit", n: 4,
      text: "Hồn Mộc thức giấc vì phong ấn vỡ. Hạ 4 cây để dọn lối vào rừng sâu.",
      reward: { exp: 3600, gold: 2100, mats: { spiritseed: 2 } } },
    { id: "q40", main: true, giver: "forestmonk", name: "Hồ ly trong sương", type: "kill", m: "foxspirit", n: 4,
      text: "Hồ Ly Linh hút sương linh lực. Hạ 4 con.",
      reward: { exp: 3900, gold: 2200, mats: { spiritseed: 2 } } },
    { id: "q41", main: true, giver: "forestmonk", name: "Kẻ hút máu rừng", type: "kill", m: "forestvamp", n: 4,
      text: "Ma Cà Rồng Rừng hút máu người đi rừng. Hạ 4 con.",
      reward: { exp: 4200, gold: 2400, pots: { pot_hp3: 3 } } },
    { id: "q42", main: true, giver: "forestmonk", name: "Giải phong ấn cuối rừng", type: "kill", m: "forestboss", n: 1,
      text: "Thủ Hộ Linh Mộc đang gọi rễ cây khắp rừng. Đánh bại nó để mở đường sang Sơn Mạch.",
      reward: { exp: 5000, gold: 3200, mats: { moon: 3 } } },
    { id: "q43", main: true, giver: "smith", name: "Sấm Trên Sơn Mạch", type: "evolve", tier: 8,
      text: "Lên cấp 45 và tiến hóa vũ khí lớp lên bậc VIII bằng Hạt Linh Mộc. Sơn Mạch Lôi Đình mở khi xong.",
      reward: { exp: 4400, gold: 3400, mats: { stone: 7 } } },
    { id: "q44", main: true, giver: "thundergeneral", name: "Lang Lôi tích điện", type: "kill", m: "thunderwolf", n: 5,
      text: "Lang Lôi phóng điện khắp sườn núi. Hạ 5 con.",
      reward: { exp: 4800, gold: 2800, mats: { thunder: 2 } } },
    { id: "q45", main: true, giver: "thundergeneral", name: "Thạch Tướng canh đèo", type: "kill", m: "stonegeneral", n: 4,
      text: "Thạch Tướng chặn lối qua đèo. Hạ 4 tượng đá.",
      reward: { exp: 5200, gold: 3000, mats: { thunder: 2 } } },
    { id: "q46", main: true, giver: "thundergeneral", name: "Lôi Tinh", type: "collect", mat: "thunder", n: 6,
      text: "Lôi Tướng cần 6 Lôi Tinh để rèn giáp dẫn sấm cho trận cuối.",
      reward: { exp: 5600, gold: 3200, mats: { stone: 8 } } },
    { id: "q47", main: true, giver: "thundergeneral", name: "Thử Thách Lôi Đình", type: "kill", m: "thunderboss", n: 1,
      text: "Tướng Quân Lôi Đình đã xuất trận. Đánh bại hắn để mở Điện Thiên Mệnh.",
      reward: { exp: 7000, gold: 4200, mats: { blood: 3 } } },
    { id: "q48", main: true, giver: "fateElder", name: "Điện Thiên Mệnh", type: "kill", m: "fateboss", n: 1,
      text: "Điện đã mở. Thiên Ảnh Chưởng Môn đang chờ ở sân đấu cuối. Đây là trận cuối chương 30-50.",
      reward: { exp: 9000, gold: 6000 } },
    { id: "q49", main: true, giver: "smith", name: "Thiên Mệnh Kiếm", type: "evolve", tier: 9,
      text: "Dùng Ấn Thiên Mệnh tiến hóa vũ khí lớp lên bậc IX. Đây là nhiệm vụ khép lại chương 30-50.",
      reward: { gold: 8000, items: ["r_fate"] } },

    // ---- side quests of chapter 2
    { id: "r7", main: false, repeat: true, after: "q32", giver: "guide", name: "Tuần tra Biển Mây", type: "killAny", n: 10,
      text: "Hạ 10 quái bất kỳ trên Biển Mây. Nhận lại được sau khi trả thưởng.", reward: { exp: 2000, gold: 900, mats: { cloudstone: 2 } } },
    { id: "r8", main: false, repeat: true, after: "q37", giver: "keeper", name: "Dọn Thành Cổ", type: "killAny", n: 10,
      text: "Hạ 10 quái bất kỳ trong Thành Cổ. Nhận lại được sau khi trả thưởng.", reward: { exp: 3200, gold: 1400, mats: { mechcore: 2 } } },
    { id: "r9", main: false, repeat: true, after: "q42", giver: "forestmonk", name: "Gom hạt linh mộc", type: "killAny", n: 10,
      text: "Hạ 10 quái bất kỳ trong Rừng Linh Hồn. Nhận lại được sau khi trả thưởng.", reward: { exp: 4200, gold: 1800, mats: { spiritseed: 2 } } },
    { id: "r10", main: false, repeat: true, after: "q47", giver: "thundergeneral", name: "Thu Lôi Tinh", type: "killAny", n: 10,
      text: "Hạ 10 quái bất kỳ trên Sơn Mạch. Nhận lại được sau khi trả thưởng.", reward: { exp: 5200, gold: 2200, mats: { thunder: 2 } } },

    { id: "r1", main: false, repeat: true, after: "q2", giver: "elder", name: "Săn quái mỗi ngày", type: "killAny", n: 5,
      text: "Hạ 5 quái bất kỳ. Nhận lại được sau khi trả thưởng.", reward: { exp: 40, gold: 50, mats: { stone: 1 } } },
    { id: "r2", main: false, repeat: true, after: "q3", giver: "scholar", name: "Ôn bài mỗi ngày", type: "practice", n: 5,
      text: "Luyện lại 5 từ trong Sổ tay. Nhận lại được sau khi trả thưởng.", reward: { exp: 30, gold: 20 } },
    { id: "r3", main: false, repeat: true, after: "q10", giver: "hermit", name: "Gom trúc huyền", type: "killAny", n: 8,
      text: "Hạ 8 quái bất kỳ. Nhận lại được sau khi trả thưởng.", reward: { exp: 300, gold: 150, mats: { fiber: 2, stone: 1 } } },
    { id: "r4", main: false, repeat: true, after: "q14", giver: "hunter", name: "Săn thung lũng", type: "killAny", n: 8,
      text: "Hạ 8 quái bất kỳ. Nhận lại được sau khi trả thưởng.", reward: { exp: 600, gold: 250, mats: { feather: 2, stone: 1 } } },
    { id: "r5", main: false, repeat: true, after: "q18", giver: "monk", name: "Nhặt nguyệt thạch", type: "killAny", n: 8,
      text: "Hạ 8 quái bất kỳ. Nhận lại được sau khi trả thưởng.", reward: { exp: 1000, gold: 400, mats: { moon: 2, stone: 2 } } },
    { id: "r6", main: false, repeat: true, after: "q23", giver: "general", name: "Tuần tra pháo đài", type: "killAny", n: 8,
      text: "Hạ 8 quái bất kỳ. Nhận lại được sau khi trả thưởng.", reward: { exp: 1600, gold: 600, mats: { dark: 2, stone: 2 } } },
  ];

  const CLASSES = {
    kiem: { name: "Kiếm Ảnh", color: "#D2462E", shade: "#9E2F1E", weapon: "w_kiem", role: "Kiếm sĩ cận chiến",
      desc: "Sát thương ổn định, chém nhanh và liên kích. Chuỗi trả lời đúng liên tiếp tăng sát thương mạnh hơn.",
      pros: ["Sát thương đều tay, dễ chơi", "Chuỗi đúng tăng tới +70% sát thương", "Có kỹ năng giảm sát thương và phản đòn"],
      cons: ["Ít hồi MP", "Không có né tránh"],
      perks: ["Đặc tính: +10% công", "Mỗi chuỗi đúng +14% (tối đa +70%)"] },
    anh: { name: "Ảnh Hành", color: "#3E8C6E", shade: "#2A6650", weapon: "w_anh", role: "Tốc chiến, né tránh",
      desc: "Nhanh nhẹn, thiên về tốc độ, chí mạng và né. Trả lời đúng trong nửa thời gian được thưởng thêm.",
      pros: ["Chí mạng và né tránh cao", "Kỹ năng đánh nhiều nhịp", "Chạy nhanh trên bản đồ"],
      cons: ["Mỗi đòn đơn lẻ nhẹ hơn", "Cần gõ nhanh để tận dụng"],
      perks: ["Đặc tính: +15% tốc chạy", "Đúng trong nửa thời gian: +25% sát thương, +10% chí mạng"] },
    linh: { name: "Linh Ẩn", color: "#E0A526", shade: "#A8771A", weapon: "w_linh", role: "Linh thuật tầm xa",
      desc: "Thiên về năng lượng: đòn tầm xa, làm chậm, lá chắn. Từ dài và cụm từ gây sát thương lớn.",
      pros: ["Kỹ năng mạnh, nhiều MP", "Làm chậm quái để có thêm thời gian", "Lá chắn và hồi MP"],
      cons: ["Máu và thủ thấp hơn", "Phụ thuộc MP"],
      perks: ["Đặc tính: từ 7 chữ cái trở lên, cụm từ: +40%", "+2 MP mỗi câu đúng"] },
  };

  // Skills. type: active | passive. max: highest rank. mp, cd (cooldown in questions).
  // need: skill ids that must be learned first. fx: the effect, read by the battle (client) and by stats (both sides).
  // Each rank above 1 needs the player 3 more levels (capped at 30). One skill point per level from 10.
  const SKILLS = {
    // ---- Kiếm Ảnh
    k10: { cls: "kiem", name: "Trảm Ảnh", lv: 10, type: "active", max: 3, mp: 14, cd: 2, icon: "sk_k10", need: [],
      fx: { kind: "strike", mult: [1.8, 2.0, 2.2] }, desc: "Câu đúng tiếp theo chém mục tiêu x{mult} sát thương." },
    k12: { cls: "kiem", name: "Kiếm Tâm", lv: 12, type: "passive", max: 3, icon: "sk_k12", need: ["k10"],
      fx: { kind: "atkPct", v: [5, 8, 12] }, desc: "Nội tại: tăng {v}% công." },
    k15: { cls: "kiem", name: "Liên Trảm", lv: 15, type: "passive", max: 3, cd: 2, icon: "sk_k15", need: ["k10"],
      fx: { kind: "followUp", chance: [25, 30, 35], mult: [0.5, 0.6, 0.7] }, desc: "Nội tại: sau câu đúng có {chance}% tung thêm một nhát chém phụ x{mult}. Hồi 2 câu." },
    k18: { cls: "kiem", name: "Thủ Kiếm", lv: 18, type: "passive", max: 3, icon: "sk_k18", need: ["k12"],
      fx: { kind: "streakGuard", streak: 3, v: [15, 20, 25] }, desc: "Nội tại: khi đúng liên tiếp từ 3 câu, giảm {v}% sát thương nhận vào." },
    k20: { cls: "kiem", name: "Nguyệt Trảm", lv: 20, type: "active", max: 3, mp: 26, cd: 4, icon: "sk_k20", need: ["k15"],
      fx: { kind: "strike", mult: [2.6, 2.9, 3.2], look: "crescent" }, desc: "Nhát chém lưỡi liềm: câu đúng tiếp theo x{mult} sát thương." },
    k22: { cls: "kiem", name: "Kiếm Ý", lv: 22, type: "passive", max: 3, icon: "sk_k22", need: ["k18"],
      fx: { kind: "critPct", v: [4, 6, 8] }, desc: "Nội tại: tăng {v}% chí mạng." },
    k25: { cls: "kiem", name: "Ảnh Kiếm Liên Hoàn", lv: 25, type: "active", max: 3, mp: 30, cd: 6, icon: "sk_k25", need: ["k20"],
      fx: { kind: "chain", n: 3, bonus: [60, 75, 90] }, desc: "3 câu đúng tiếp theo, mỗi câu thêm {bonus}% sát thương và một nhát kiếm ảnh." },
    k28: { cls: "kiem", name: "Phản Kích", lv: 28, type: "active", max: 3, mp: 22, cd: 6, icon: "sk_k28", need: ["k22"],
      fx: { kind: "guard", turns: 3, cut: 40, reflect: [50, 65, 80] }, desc: "3 câu tới: giảm 40% sát thương nhận vào và phản lại {reflect}% cho quái." },
    k30: { cls: "kiem", name: "Thiên Ảnh Trảm", lv: 30, type: "active", max: 3, mp: 45, cd: 10, icon: "sk_k30", need: ["k25", "k28"],
      fx: { kind: "strike", mult: [4.5, 5.0, 5.5], look: "ultimate" }, desc: "Chiêu tối thượng: câu đúng tiếp theo x{mult} sát thương. Hồi 10 câu." },
    // ---- Ảnh Hành
    a10: { cls: "anh", name: "Song Đao Kích", lv: 10, type: "active", max: 3, mp: 12, cd: 2, icon: "sk_a10", need: [],
      fx: { kind: "multi", hits: 2, mult: [0.9, 1.0, 1.1] }, desc: "Câu đúng tiếp theo đánh 2 lần, mỗi lần x{mult}." },
    a12: { cls: "anh", name: "Bộ Pháp", lv: 12, type: "passive", max: 3, icon: "sk_a12", need: ["a10"],
      fx: { kind: "spdDodge", spd: [8, 12, 16], dodge: [3, 4, 5] }, desc: "Nội tại: +{spd}% tốc chạy, {dodge}% né đòn phản công." },
    a15: { cls: "anh", name: "Ảnh Bộ", lv: 15, type: "active", max: 3, mp: 14, cd: 4, icon: "sk_a15", need: ["a10"],
      fx: { kind: "dash", bonus: [30, 40, 50] }, desc: "Lướt ngắn: né hẳn đòn phản công kế tiếp, câu đúng tiếp theo +{bonus}% sát thương." },
    a18: { cls: "anh", name: "Độc Ảnh", lv: 18, type: "passive", max: 3, icon: "sk_a18", need: ["a12"],
      fx: { kind: "poison", chance: [20, 25, 30], pct: [10, 12, 14], turns: 3 }, desc: "Nội tại: đòn đánh có {chance}% tẩm độc, mỗi câu quái mất {pct}% công của bạn trong 3 câu." },
    a20: { cls: "anh", name: "Toàn Phong Đao", lv: 20, type: "active", max: 3, mp: 22, cd: 4, icon: "sk_a20", need: ["a15"],
      fx: { kind: "strike", mult: [2.4, 2.7, 3.0], look: "whirl" }, desc: "Vòng chém xoáy: câu đúng tiếp theo x{mult} sát thương." },
    a22: { cls: "anh", name: "Thân Pháp", lv: 22, type: "passive", max: 3, icon: "sk_a22", need: ["a18"],
      fx: { kind: "critCd", v: [4, 6, 8], cd: [0, 0, 1] }, desc: "Nội tại: +{v}% chí mạng. Bậc 3: mọi kỹ năng hồi nhanh hơn 1 câu." },
    a25: { cls: "anh", name: "Liên Ảnh Thập Kích", lv: 25, type: "active", max: 3, mp: 30, cd: 6, icon: "sk_a25", need: ["a20"],
      fx: { kind: "charge", n: 3, mult: [3.5, 4.0, 4.5] }, desc: "Tích 3 câu đúng liên tiếp, câu thứ 3 tung 10 nhát tổng x{mult} sát thương." },
    a28: { cls: "anh", name: "Ảnh Thế", lv: 28, type: "active", max: 3, mp: 20, cd: 6, icon: "sk_a28", need: ["a22"],
      fx: { kind: "evade", turns: 3, v: [50, 60, 70] }, desc: "3 câu tới: {v}% né đòn phản công." },
    a30: { cls: "anh", name: "Vạn Ảnh Sát", lv: 30, type: "active", max: 3, mp: 45, cd: 10, icon: "sk_a30", need: ["a25", "a28"],
      fx: { kind: "multi", hits: 8, mult: [0.65, 0.7, 0.75], look: "ultimate" }, desc: "Chiêu tối thượng: câu đúng tiếp theo đánh 8 nhịp, mỗi nhịp x{mult}." },
    // ---- Linh Ẩn
    l10: { cls: "linh", name: "Linh Đạn", lv: 10, type: "active", max: 3, mp: 12, cd: 2, icon: "sk_l10", need: [],
      fx: { kind: "strike", mult: [1.9, 2.1, 2.3], look: "orb" }, desc: "Phóng linh đạn: câu đúng tiếp theo x{mult} sát thương." },
    l12: { cls: "linh", name: "Linh Mạch", lv: 12, type: "passive", max: 3, icon: "sk_l12", need: ["l10"],
      fx: { kind: "mpPct", v: [10, 15, 20], skill: [5, 8, 12] }, desc: "Nội tại: +{v}% MP tối đa, kỹ năng mạnh hơn {skill}%." },
    l15: { cls: "linh", name: "Ảnh Phược", lv: 15, type: "active", max: 3, mp: 16, cd: 5, icon: "sk_l15", need: ["l10"],
      fx: { kind: "bind", turns: 3, mult: [1.3, 1.4, 1.5], slow: 40 }, desc: "Trói bóng quái 3 câu: đòn của nó yếu 40%, bạn có thêm 25% thời gian. Câu đúng tiếp theo x{mult}." },
    l18: { cls: "linh", name: "Hồi Linh", lv: 18, type: "passive", max: 3, icon: "sk_l18", need: ["l12"],
      fx: { kind: "streakMp", streak: 3, v: [6, 9, 12] }, desc: "Nội tại: mỗi 3 câu đúng liên tiếp hồi {v} MP." },
    l20: { cls: "linh", name: "Hắc Vũ", lv: 20, type: "active", max: 3, mp: 24, cd: 4, icon: "sk_l20", need: ["l15"],
      fx: { kind: "multi", hits: 5, mult: [0.52, 0.58, 0.64], look: "needles" }, desc: "Phóng loạt 5 ám khí, mỗi mũi x{mult}." },
    l22: { cls: "linh", name: "Linh Giáp", lv: 22, type: "passive", max: 3, icon: "sk_l22", need: ["l18"],
      fx: { kind: "shield", pct: [15, 20, 25], every: 6 }, desc: "Nội tại: lá chắn đỡ {pct}% máu tối đa, hồi lại sau mỗi 6 câu." },
    l25: { cls: "linh", name: "Huyễn Ảnh Trận", lv: 25, type: "active", max: 3, mp: 30, cd: 6, icon: "sk_l25", need: ["l20"],
      fx: { kind: "zone", turns: 3, pct: [40, 50, 60] }, desc: "Lập trận 3 câu: mỗi câu quái mất {pct}% công của bạn, kể cả khi bạn trả lời sai." },
    l28: { cls: "linh", name: "Tĩnh Tâm", lv: 28, type: "active", max: 3, mp: 10, cd: 7, icon: "sk_l28", need: ["l22"],
      fx: { kind: "calm", turns: 4, v: [40, 50, 60] }, desc: "4 câu tới: kỹ năng tốn ít hơn {v}% MP và không bị đòn quét của quái tinh anh." },
    l30: { cls: "linh", name: "U Minh Thiên Kích", lv: 30, type: "active", max: 3, mp: 48, cd: 10, icon: "sk_l30", need: ["l25", "l28"],
      fx: { kind: "strike", mult: [5.0, 5.5, 6.0], look: "ultimate" }, desc: "Chiêu tối thượng: câu đúng tiếp theo x{mult} sát thương. Hồi 10 câu." },

    // ---- Kiếm Ảnh: Lv 35-50
    k33: { cls: "kiem", name: "Kiếm Tâm Thượng Thừa", lv: 33, type: "passive", max: 2, icon: "sk_k33", need: ["k22"],
      fx: { kind: "atkPct", v: [6, 10] }, desc: "Nội tại: tăng {v}% công." },
    k35: { cls: "kiem", name: "Thiên Khuyết Trảm", lv: 35, type: "active", max: 2, mp: 34, cd: 4, icon: "sk_k35", need: ["k25"],
      fx: { kind: "strike", mult: [3.0, 3.4], look: "arc" }, desc: "Chém cung rộng: câu đúng tiếp theo x{mult} sát thương." },
    k38: { cls: "kiem", name: "Kiếm Khí Hộ Thể", lv: 38, type: "active", max: 2, mp: 30, cd: 6, icon: "sk_k38", need: ["k28"],
      fx: { kind: "guard", turns: 3, cut: 45, reflect: [0, 0] }, desc: "3 câu tới: giảm {cut}% sát thương nhận vào. Hồi 6 câu." },
    k40: { cls: "kiem", name: "Gió Thần Nhập Kiếm", lv: 40, type: "passive", max: 2, icon: "sk_k40", need: ["k35"],
      fx: { kind: "critPct", v: [5, 9] }, desc: "Nội tại: tăng {v}% chí mạng." },
    k45: { cls: "kiem", name: "Cửu Thiên Liên Trảm", lv: 45, type: "active", max: 2, mp: 42, cd: 7, icon: "sk_k45", need: ["k35"],
      fx: { kind: "multi", hits: 4, mult: [1.1, 1.3] }, desc: "Chuỗi 4 nhát chém liên tiếp, mỗi nhát x{mult} sát thương." },
    k50: { cls: "kiem", name: "Thiên Mệnh Nhất Kiếm", lv: 50, type: "active", max: 2, mp: 60, cd: 12, icon: "sk_k50", need: ["k45", "k38"],
      fx: { kind: "strike", mult: [6.5, 7.2], look: "ultimate" }, desc: "Tối thượng: một nhát kiếm khí khổng lồ, câu đúng tiếp theo x{mult} sát thương." },

    // ---- Ảnh Hành: Lv 35-50
    a33: { cls: "anh", name: "Thân Pháp Thượng Thừa", lv: 33, type: "passive", max: 2, icon: "sk_a33", need: ["a22"],
      fx: { kind: "critPct", v: [5, 9] }, desc: "Nội tại: tăng {v}% chí mạng." },
    a35: { cls: "anh", name: "Thiên Ảnh Bộ", lv: 35, type: "active", max: 2, mp: 30, cd: 5, icon: "sk_a35", need: ["a25"],
      fx: { kind: "evade", turns: 2, v: [55, 70] }, desc: "Lướt ngắn: 2 câu tới né {v}% đòn phản công." },
    a38: { cls: "anh", name: "Phá Vân Song Trảm", lv: 38, type: "active", max: 2, mp: 34, cd: 5, icon: "sk_a38", need: ["a28"],
      fx: { kind: "multi", hits: 2, mult: [1.7, 2.0] }, desc: "Hai nhịp chém nhanh, mỗi nhịp x{mult} sát thương." },
    a40b: { cls: "anh", name: "Tốc Ảnh", lv: 40, type: "passive", max: 2, icon: "sk_a40", need: ["a35"],
      fx: { kind: "spdDodge", spd: [10, 16], dodge: [4, 6] }, desc: "Nội tại: +{spd}% tốc chạy, {dodge}% né đòn." },
    a45: { cls: "anh", name: "Tuyệt Ảnh Liên Kích", lv: 45, type: "active", max: 2, mp: 44, cd: 7, icon: "sk_a45", need: ["a35"],
      fx: { kind: "multi", hits: 5, mult: [0.9, 1.05] }, desc: "Chuỗi 5 đòn liên kích, mỗi đòn x{mult} sát thương." },
    a50: { cls: "anh", name: "Vạn Ảnh Quy Nhất", lv: 50, type: "active", max: 2, mp: 60, cd: 12, icon: "sk_a50", need: ["a45", "a38"],
      fx: { kind: "multi", hits: 10, mult: [0.7, 0.8], look: "ultimate" }, desc: "Tối thượng: vạn dư ảnh cùng chém, 10 nhịp mỗi nhịp x{mult}." },

    // ---- Linh Ẩn: Lv 35-50
    l33: { cls: "linh", name: "Linh Mạch Thượng Thừa", lv: 33, type: "passive", max: 2, icon: "sk_l33", need: ["l22"],
      fx: { kind: "mpPct", v: [8, 14], skill: [5, 8] }, desc: "Nội tại: +{v}% MP tối đa, kỹ năng mạnh hơn {skill}%." },
    l35: { cls: "linh", name: "Tinh Vân Chú", lv: 35, type: "active", max: 2, mp: 34, cd: 4, icon: "sk_l35", need: ["l25"],
      fx: { kind: "strike", mult: [3.0, 3.4], look: "orb" }, desc: "Bắn tinh cầu: câu đúng tiếp theo x{mult} sát thương." },
    l38: { cls: "linh", name: "Linh Vực", lv: 38, type: "active", max: 2, mp: 32, cd: 6, icon: "sk_l38", need: ["l28"],
      fx: { kind: "calm", turns: 4, v: [45, 60] }, desc: "4 câu tới: kỹ năng rẻ hơn {v}% MP và chặn đòn quét." },
    l40: { cls: "linh", name: "Hồi Linh Thượng Thừa", lv: 40, type: "passive", max: 2, icon: "sk_l40", need: ["l35"],
      fx: { kind: "streakMp", streak: 2, v: [8, 12] }, desc: "Nội tại: mỗi 2 câu đúng liên tiếp hồi {v} MP." },
    l45: { cls: "linh", name: "Cửu U Hắc Vũ", lv: 45, type: "active", max: 2, mp: 46, cd: 7, icon: "sk_l45", need: ["l35"],
      fx: { kind: "multi", hits: 6, mult: [0.72, 0.86], look: "needles" }, desc: "Phóng loạt 6 ám khí, mỗi mũi x{mult} sát thương." },
    l50: { cls: "linh", name: "Thiên Đạo Linh Kích", lv: 50, type: "active", max: 2, mp: 62, cd: 12, icon: "sk_l50", need: ["l45", "l38"],
      fx: { kind: "strike", mult: [6.2, 7.0], look: "ultimate" }, desc: "Tối thượng: đòn linh thuật khổng lồ, câu đúng tiếp theo x{mult} sát thương." },

    // ---- Nội tại xen giữa Lv 38 / 43 / 48 (tiếp nối cây Lv 30)
    k38b: { cls: "kiem", name: "Kiếm Thế", lv: 38, type: "passive", max: 2, icon: "sk_k38", need: ["k35"], pos: [8, 2],
      fx: { kind: "comboDmg", v: [6, 10] }, desc: "Nội tại: mỗi bậc chuỗi đúng thêm {v}% sát thương." },
    a38b: { cls: "anh", name: "Bộ Pháp Thượng Thừa", lv: 38, type: "passive", max: 2, icon: "sk_a38", need: ["a35"], pos: [8, 2],
      fx: { kind: "spdDodge", spd: [6, 10], dodge: [4, 6] }, desc: "Nội tại: +{spd}% tốc chạy, {dodge}% né đòn." },
    l38b: { cls: "linh", name: "Tĩnh Tâm Thượng Thừa", lv: 38, type: "passive", max: 2, icon: "sk_l38", need: ["l35"], pos: [8, 2],
      fx: { kind: "streakMp", streak: 3, v: [6, 10] }, desc: "Nội tại: mỗi 3 câu đúng liên tiếp hồi {v} MP." },
    k43: { cls: "kiem", name: "Thiên Khuyết Tâm Pháp", lv: 43, type: "passive", max: 2, icon: "sk_k43", need: ["k40"], pos: [9, 1],
      fx: { kind: "skillPct", v: [8, 14] }, desc: "Nội tại: kỹ năng chủ động mạnh hơn {v}%." },
    a43: { cls: "anh", name: "Phá Vân Tâm Pháp", lv: 43, type: "passive", max: 2, icon: "sk_a43", need: ["a40b"], pos: [9, 1],
      fx: { kind: "skillPct", v: [8, 14] }, desc: "Nội tại: kỹ năng chủ động mạnh hơn {v}%." },
    l43: { cls: "linh", name: "Cửu U Tâm Pháp", lv: 43, type: "passive", max: 2, icon: "sk_l43", need: ["l40"], pos: [9, 1],
      fx: { kind: "skillPct", v: [8, 14] }, desc: "Nội tại: kỹ năng chủ động mạnh hơn {v}%." },
    k48: { cls: "kiem", name: "Kiếm Tâm Viên Mãn", lv: 48, type: "passive", max: 2, icon: "sk_k48", need: ["k45"], pos: [10, 2],
      fx: { kind: "atkPct", v: [6, 10] }, desc: "Nội tại chuẩn bị cho Điện Thiên Mệnh: tăng {v}% công." },
    a48: { cls: "anh", name: "Thân Pháp Viên Mãn", lv: 48, type: "passive", max: 2, icon: "sk_a48", need: ["a45"], pos: [10, 2],
      fx: { kind: "critPct", v: [5, 9] }, desc: "Nội tại chuẩn bị cho Điện Thiên Mệnh: tăng {v}% chí mạng." },
    l48: { cls: "linh", name: "Linh Mạch Viên Mãn", lv: 48, type: "passive", max: 2, icon: "sk_l48", need: ["l45"], pos: [10, 2],
      fx: { kind: "mpPct", v: [8, 14], skill: [4, 6] }, desc: "Nội tại chuẩn bị cho Điện Thiên Mệnh: +{v}% MP và kỹ năng mạnh hơn {skill}%." },
  };
  // where each skill sits on the tree: [row, col]; col 0 attack branch, 1 centre, 2 guard branch
  const TREE_POS = { 10: [0, 1], 12: [1, 2], 15: [1, 0], 18: [2, 2], 20: [2, 0], 22: [3, 2], 25: [3, 0], 28: [4, 2], 30: [5, 1],
    33: [6, 1], 35: [7, 0], 38: [7, 2], 40: [8, 1], 45: [9, 0], 50: [10, 1] };
  const NOVICE_SKILL = { name: "Chém Mạnh", mp: 15, cd: 2, icon: "sk_novice", fx: { kind: "strike", mult: [1.6] }, desc: "Câu đúng tiếp theo x1.6 sát thương." };

  const NPCS = {
    elder: { name: "Trưởng Làng Mộc", role: "Nhiệm vụ", sign: "quest", map: "village", x: 560,
      lines: ["Ninja trẻ, làng ta cần con.", "Mỗi từ con nhớ là một nhát kiếm sắc hơn.", "Đừng vội. Đọc kỹ nghĩa rồi hẵng gõ."] },
    shop: { name: "Cô Lựu", role: "Cửa hàng", sign: "shop", map: "village", x: 1000,
      lines: ["Bình máu mới nấu đây, còn nóng hổi!", "Mua gì cứ chọn, cô bớt cho."] },
    smith: { name: "Thợ Rèn Thiết", role: "Lò rèn", sign: "forge", map: "village", x: 1460,
      lines: ["Sắt phải nung, chữ phải luyện.", "Cường hóa thất bại thì mất đá, nhưng đồ vẫn nguyên vẹn.", "Vũ khí lớp thì đem về đây, ta tiến hóa cho."] },
    scholar: { name: "Thầy Bút", role: "Sổ tay", sign: "book", map: "village", x: 1920,
      lines: ["Từ nào sai, ta ghi lại cho con ôn.", "Học một lần thì quên, ôn nhiều lần thì nhớ."] },
    hermit: { name: "Ẩn Sĩ Trúc Lâm", role: "Nhiệm vụ", sign: "quest", map: "bamboo", x: 420,
      lines: ["Rừng trúc nghe được cả tiếng con thở.", "Sợi trúc huyền dai như thép. Gom đủ thì về lò rèn.", "Từ khó thì đọc chậm lại."] },
    hunter: { name: "Thợ Săn Hắc Nha", role: "Nhiệm vụ", sign: "quest", map: "valley", x: 420,
      lines: ["Thung lũng này không dành cho kẻ yếu tim.", "Lông quạ đen rơi khắp nơi, nhặt đi mà rèn.", "Con nhện kia to bằng cái chòi đấy."] },
    monk: { name: "Sư Thầy Nguyệt Ảnh", role: "Nhiệm vụ", sign: "quest", map: "ruins", x: 420,
      lines: ["Phong ấn đã vỡ, trăng cũng buồn.", "Tâm tĩnh thì chữ hiện.", "Nguyệt thạch sáng nhất lúc nửa đêm."] },
    general: { name: "Tướng Quân Vô Danh", role: "Nhiệm vụ", sign: "quest", map: "fortress", x: 420,
      lines: ["Pháo đài này từng là nhà ta.", "Thủ Lĩnh U Minh chỉ ra mặt trước ninja cấp 30.", "Lửa xanh không nóng, nhưng đốt cả bóng."] },
    guide: { name: "Vân Du", role: "Nhiệm vụ", sign: "quest", map: "cloudsea", x: 460,
      lines: ["Biển Mây không có đường, chỉ có gió dẫn lối.", "Tinh Thạch Mây rơi nhiều ở mấy đảo xa.", "Cầu treo rung đấy, nhưng đừng nhìn xuống."] },
    keeper: { name: "Thủ Cổ Thiên Cơ", role: "Nhiệm vụ", sign: "quest", map: "citadel", x: 460,
      lines: ["Thành này im lặng đã trăm năm.", "Cơ quan còn sống, chớ đứng lâu một chỗ.", "Lõi Cơ Quan là chìa khóa của phong ấn."] },
    forestmonk: { name: "Linh Tăng", role: "Nhiệm vụ", sign: "quest", map: "spiritforest", x: 460,
      lines: ["Rừng này sáng về đêm vì hồn nó chưa tan.", "Hạt Linh Mộc chỉ rơi khi cây ngã.", "Bước nhẹ thôi, đừng đánh thức rễ."] },
    thundergeneral: { name: "Lôi Tướng", role: "Nhiệm vụ", sign: "quest", map: "thunderrange", x: 460,
      lines: ["Sấm trên sơn mạch là tiếng trống của trời.", "Lôi Tinh nằm trong đá bị sét đánh.", "Tướng Quân Lôi Đình không nương tay đâu."] },
    fateElder: { name: "Trưởng Lão Thiên Mệnh", role: "Nhiệm vụ", sign: "quest", map: "fatehall", x: 420,
      lines: ["Đây là sân đấu cuối cùng.", "Mệnh trời chỉ mở cho kẻ đã đi hết con đường.", "Hãy chuẩn bị cả từ vựng, không chỉ thanh kiếm."] },
  };

  // ---- Formulas ----
  const MAX_LV = 50;
  // The one place the player's own vitals are set. Straight-line growth holds for the
  // whole game, Lv 1 through 50, so the high levels (30-50) are read from here too.
  const BALANCE = {
    hpBase: 100, hpPerLv: 14, hpPerLvHigh: 18, hpHighFrom: 30,
    mpBase: 30, mpPerLv: 4, mpPerLvHigh: 6, mpHighFrom: 30,
    atkBase: 10, atkPerLv: 2, atkPerLvHigh: 3, atkHighFrom: 30,
    defBase: 2, defPerLv: 1, defPerLvHigh: 1, defHighFrom: 30,
  };
  const grow = (base, lo, hi, from, L) => base + lo * (Math.min(L, from - 1) - 1) + hi * Math.max(0, L - (from - 1));
  const F = {
    expToNext: (L) => 30 + 20 * (L - 1) + 4 * (L - 1) * (L - 1),
    baseStats: (L) => ({
      hp: grow(BALANCE.hpBase, BALANCE.hpPerLv, BALANCE.hpPerLvHigh, BALANCE.hpHighFrom, L),
      mp: grow(BALANCE.mpBase, BALANCE.mpPerLv, BALANCE.mpPerLvHigh, BALANCE.mpHighFrom, L),
      atk: grow(BALANCE.atkBase, BALANCE.atkPerLv, BALANCE.atkPerLvHigh, BALANCE.atkHighFrom, L),
      def: grow(BALANCE.defBase, BALANCE.defPerLv, BALANCE.defPerLvHigh, BALANCE.defHighFrom, L),
    }),
    plusMult: (p) => 1 + 0.15 * p,
    itemStats(id, plus) {
      const it = ITEMS[id]; const s = {};
      if (!it) return s;
      for (const k in it.stats) {
        const v = it.stats[k];
        s[k] = k === "crit" || k === "spd" ? v : v + Math.max(plus, Math.round(v * 0.15 * plus));
      }
      return s;
    },
    forgeCost(id, plus) {
      const r = RARITY[ITEMS[id].rarity].rank;
      const lvK = 1 + Math.max(0, (ITEMS[id].lv || 1) - 9) / 10;
      return { gold: Math.round(30 * (plus + 1) * (1 + 0.5 * r) * lvK), stone: plus + 1, rate: [1, 0.9, 0.75, 0.6, 0.45][plus] };
    },
    // seconds for a word, before the pressure multiplier
    timeFor(entry) {
      const w = entry.w; const len = w.replace(/\s/g, "").length;
      if (/\s/.test(w)) return Math.min(45, Math.round(14 + 1.3 * w.length));
      let t = len <= 4 ? 16 : len <= 6 ? 18 : len <= 8 ? 22 : len <= 10 ? 25 : 28;
      if (entry.lv === "A2") t += 2;
      if (entry.lv === "B1") t += 3;
      if (entry.lv === "B2") t += 4;
      return t;
    },
    skillRankLv: (sk, rank) => Math.min(MAX_LV, sk.lv + 3 * (rank - 1)),
    SRS_INTERVALS: [0, 60e3, 10 * 60e3, 60 * 60e3, 8 * 3600e3, 2 * 86400e3],
    // the shortest real fight, in seconds, the server will pay a reward for
    minFight: (tier) => (tier === "boss" ? 15 : tier === "elite" ? 7 : 2.5),
  };

  const PRESSURE = { relaxed: { vi: "Thong thả", mult: 1.4 }, normal: { vi: "Vừa", mult: 1 }, quick: { vi: "Gấp", mult: 0.75 }, none: { vi: "Luyện tập (không giới hạn)", mult: 0 } };
  const DIFFICULTY = {
    easy: { vi: "Dễ", tries: 3, note: "Hiện sẵn chữ cái đầu. Được thử 3 lần mỗi từ, mỗi lần sai thêm một chữ gợi ý." },
    normal: { vi: "Vừa", tries: 2, note: "Được thử 2 lần mỗi từ: lần đầu sai thì chữ sai hiện đỏ để sửa. Sai lần hai thì quái phản công và hiện đáp án." },
    hard: { vi: "Khó", tries: 1, note: "Chỉ 1 lần thử. Quái máu và đòn mạnh hơn 25%, phần thưởng nhiều hơn 25%." },
  };
  const CEFR = { A1: 1, A2: 2, B1: 3, B2: 4 };

  root.GD = { C, SLOTS, SLOT_VI, RARITY, ITEMS, MATS, POTIONS, EVOLVE, MONSTERS, MAPS, MAP_ORDER, QUESTS, CLASSES, SKILLS, TREE_POS, NOVICE_SKILL, NPCS, F, BALANCE, PRESSURE, DIFFICULTY, CEFR, MAX_LV };
})(typeof window !== "undefined" ? window : globalThis);
