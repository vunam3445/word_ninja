// Word Ninja vocabulary, part 3: the Lv.30-50 regions.
// More B1/B2 words in the topics the chapter-2 monsters ask about, checked by hand.
(function () {
  const V = [];
  const add = (t, list) => list.forEach((e) => V.push(Object.assign({ t }, e)));

  add("nature", [
    { w: "summit", vi: "đỉnh núi", pos: "n", lv: "B1", ipa: "ˈsʌmɪt", def: "The highest point of a mountain.", ex: "They reached the summit before noon.", exVi: "Họ lên tới đỉnh núi trước buổi trưa." },
    { w: "gorge", vi: "hẻm núi, vực", pos: "n", lv: "B2", ipa: "ɡɔːdʒ", def: "A deep narrow valley between mountains.", ex: "A rope bridge crossed the gorge.", exVi: "Một cây cầu dây bắc qua hẻm núi." },
    { w: "mist", vi: "sương mù", pos: "n", lv: "B1", ipa: "mɪst", def: "Thin fog that makes it hard to see far.", ex: "Morning mist covered the forest floor.", exVi: "Sương sớm phủ kín nền rừng." },
    { w: "shower", vi: "trận mưa rào", pos: "n", lv: "B1", ipa: "ˈʃaʊə", def: "A short period of rain.", ex: "A sudden shower caught us on the ridge.", exVi: "Một trận mưa rào bất chợt ập tới khi chúng tôi ở trên sống núi." },
  ]);

  add("travel", [
    { w: "journey", vi: "hành trình", pos: "n", lv: "B1", ipa: "ˈdʒɜːni", def: "An act of travelling from one place to another.", ex: "The journey to the sky sea took three days.", exVi: "Hành trình tới biển mây mất ba ngày." },
    { w: "route", vi: "tuyến đường, lộ trình", pos: "n", lv: "B1", ipa: "ruːt", def: "The path you take to get somewhere.", ex: "We chose the safer route across the cliff.", exVi: "Chúng tôi chọn tuyến đường an toàn hơn qua vách đá." },
    { w: "crossing", vi: "chỗ băng qua, sự vượt qua", pos: "n", lv: "B2", ipa: "ˈkrɒsɪŋ", def: "A place or act of going across something.", ex: "The rope crossing swayed in the wind.", exVi: "Lối băng qua bằng dây đung đưa trong gió." },
    { w: "wander", vi: "đi lang thang", pos: "v", lv: "B1", ipa: "ˈwɒndə", def: "To walk slowly with no clear direction.", ex: "Do not wander off the marked path.", exVi: "Đừng đi lang thang ra khỏi lối đã đánh dấu." },
  ]);

  add("animals", [
    { w: "falcon", vi: "chim ưng", pos: "n", lv: "B1", ipa: "ˈfɔːlkən", def: "A fast bird that hunts other birds.", ex: "A falcon circled above the islands.", exVi: "Một con chim ưng lượn trên các hòn đảo." },
    { w: "wolf", vi: "con sói", pos: "n", lv: "A2", ipa: "wʊlf", def: "A wild animal like a large dog that hunts in groups.", ex: "A wolf howled across the mountain.", exVi: "Một con sói hú vang khắp sườn núi." },
    { w: "beast", vi: "con thú, dã thú", pos: "n", lv: "B1", ipa: "biːst", def: "A dangerous or wild animal.", ex: "The beast guarded the ruin.", exVi: "Con dã thú canh giữ khu phế tích." },
    { w: "prey", vi: "con mồi", pos: "n", lv: "B2", ipa: "preɪ", def: "An animal that is hunted by another.", ex: "The hawk dived on its prey.", exVi: "Con ưng lao xuống con mồi." },
  ]);

  add("feelings", [
    { w: "fearless", vi: "không sợ hãi, gan dạ", pos: "adj", lv: "B1", ipa: "ˈfɪələs", def: "Not afraid at all.", ex: "She was fearless before the final boss.", exVi: "Cô ấy gan dạ trước con boss cuối." },
    { w: "determined", vi: "quyết tâm", pos: "adj", lv: "B1", ipa: "dɪˈtɜːmɪnd", def: "Having made a firm decision to do something.", ex: "He was determined to reach level fifty.", exVi: "Anh ấy quyết tâm đạt cấp năm mươi." },
    { w: "terrified", vi: "kinh hãi, khiếp sợ", pos: "adj", lv: "B2", ipa: "ˈterɪfaɪd", def: "Very frightened.", ex: "The villagers were terrified of the storm.", exVi: "Dân làng kinh hãi trước cơn bão." },
    { w: "reluctant", vi: "miễn cưỡng, ngần ngại", pos: "adj", lv: "B2", ipa: "rɪˈlʌktənt", def: "Not wanting to do something.", ex: "He was reluctant to leave the village.", exVi: "Anh ấy ngần ngại rời làng." },
  ]);

  add("tech", [
    { w: "gear", vi: "bánh răng, cơ cấu", pos: "n", lv: "B1", ipa: "ɡɪə", def: "A wheel with teeth that turns other parts.", ex: "The old trap ran on iron gears.", exVi: "Cái bẫy cổ chạy bằng bánh răng sắt." },
    { w: "mechanism", vi: "cơ chế, bộ máy", pos: "n", lv: "B2", ipa: "ˈmekənɪzəm", def: "A set of moving parts that work together.", ex: "The gate opened by a hidden mechanism.", exVi: "Cổng mở nhờ một cơ chế ẩn." },
    { w: "shield", vi: "khiên, lá chắn", pos: "n", lv: "B1", ipa: "ʃiːld", def: "A cover that protects you from harm.", ex: "The guardian raised a metal shield.", exVi: "Vệ binh giơ một tấm khiên kim loại." },
    { w: "signal", vi: "tín hiệu", pos: "n", lv: "B1", ipa: "ˈsɪɡnəl", def: "A sound or sign that sends a message.", ex: "The lamp flashed a warning signal.", exVi: "Ngọn đèn nháy một tín hiệu cảnh báo." },
  ]);

  add("work", [
    { w: "guard", vi: "canh gác; lính gác", pos: "v", lv: "B1", ipa: "ɡɑːd", def: "To watch and protect a place or person.", ex: "Two soldiers guard the old gate.", exVi: "Hai người lính canh cổng cũ." },
    { w: "duty", vi: "nhiệm vụ, bổn phận", pos: "n", lv: "B1", ipa: "ˈdjuːti", def: "Something you must do.", ex: "It is my duty to warn the village.", exVi: "Đó là nhiệm vụ của tôi là cảnh báo cả làng." },
    { w: "strategy", vi: "chiến lược", pos: "n", lv: "B2", ipa: "ˈstrætədʒi", def: "A plan for reaching a goal.", ex: "He changed his strategy before the boss.", exVi: "Anh ấy đổi chiến lược trước trận boss." },
    { w: "effort", vi: "nỗ lực", pos: "n", lv: "B1", ipa: "ˈefət", def: "The energy you use to do something.", ex: "With more effort, she learned every word.", exVi: "Với nhiều nỗ lực, cô ấy học hết mọi từ." },
  ]);

  add("city", [
    { w: "ruin", vi: "phế tích, tàn tích", pos: "n", lv: "B1", ipa: "ˈruːɪn", def: "A building or place that has been destroyed.", ex: "The temple lay in ruins after the war.", exVi: "Ngôi đền thành phế tích sau chiến tranh." },
    { w: "gateway", vi: "cổng lớn, cửa ngõ", pos: "n", lv: "B2", ipa: "ˈɡeɪtweɪ", def: "A large entrance or opening.", ex: "A stone gateway led into the old city.", exVi: "Một cửa ngõ bằng đá dẫn vào thành cổ." },
    { w: "tower", vi: "tháp, tháp canh", pos: "n", lv: "B1", ipa: "ˈtaʊə", def: "A tall narrow building or part of one.", ex: "A watchman stood on the tower.", exVi: "Một người canh đứng trên tháp canh." },
    { w: "lantern", vi: "đèn lồng", pos: "n", lv: "A2", ipa: "ˈlæntən", def: "A light inside a case you can carry or hang.", ex: "Lanterns lit the empty street.", exVi: "Đèn lồng thắp sáng con phố vắng." },
  ]);

  add("environment", [
    { w: "ancient", vi: "cổ xưa", pos: "adj", lv: "B1", ipa: "ˈeɪnʃənt", def: "Very old, from long ago.", ex: "Ancient roots covered the stone temple.", exVi: "Rễ cây cổ xưa phủ kín ngôi đền đá." },
    { w: "dense", vi: "rậm rạp, dày đặc", pos: "adj", lv: "B1", ipa: "dens", def: "With a lot of things close together.", ex: "The fog was too dense to see the path.", exVi: "Sương quá dày đặc đến mức không thấy lối." },
    { w: "glimmer", vi: "ánh sáng mờ, lấp lánh", pos: "n", lv: "B2", ipa: "ˈɡlɪmə", def: "A weak unsteady light.", ex: "Fireflies gave a faint glimmer in the night forest.", exVi: "Đom đóm phát ra ánh sáng mờ trong rừng đêm." },
    { w: "exposed", vi: "lộ trần, không che chắn", pos: "adj", lv: "B2", ipa: "ɪkˈspəʊzd", def: "Open to wind, weather or danger.", ex: "The summit path is exposed to the wind.", exVi: "Lối lên đỉnh núi không có gì che chắn khỏi gió." },
  ]);

  add("weather", [
    { w: "lightning", vi: "tia chớp, sét", pos: "n", lv: "B1", ipa: "ˈlaɪtnɪŋ", def: "A bright flash of electricity in a storm.", ex: "Lightning struck the stone pillar.", exVi: "Sét đánh trúng cột đá." },
    { w: "storm", vi: "cơn bão", pos: "n", lv: "A2", ipa: "stɔːm", def: "Very bad weather with strong wind and rain.", ex: "A storm rolled over the mountain range.", exVi: "Một cơn bão cuồn cuộn qua dãy núi." },
    { w: "gale", vi: "gió bão", pos: "n", lv: "B2", ipa: "ɡeɪl", def: "A very strong wind.", ex: "A gale tore at the rope bridge.", exVi: "Một cơn gió bão giật tung cây cầu dây." },
    { w: "charged", vi: "tích điện", pos: "adj", lv: "B2", ipa: "tʃɑːdʒd", def: "Holding electricity, ready to discharge.", ex: "The air felt charged before the strike.", exVi: "Không khí như tích điện trước cú đánh." },
  ]);

  add("health", [
    { w: "wound", vi: "vết thương", pos: "n", lv: "B1", ipa: "wuːnd", def: "An injury that cuts or breaks the skin.", ex: "He treated the wound at the camp.", exVi: "Anh ấy xử lý vết thương ở trại." },
    { w: "exhausted", vi: "kiệt sức", pos: "adj", lv: "B1", ipa: "ɪɡˈzɔːstɪd", def: "Extremely tired.", ex: "She felt exhausted after the long climb.", exVi: "Cô ấy kiệt sức sau chặng leo dài." },
    { w: "drained", vi: "bị rút cạn (sức lực)", pos: "adj", lv: "B2", ipa: "dreɪnd", def: "Having no energy left.", ex: "The vampire's bite left him drained.", exVi: "Cú cắn của ma cà rồng khiến anh ấy cạn sức." },
    { w: "recover", vi: "hồi phục", pos: "v", lv: "B1", ipa: "rɪˈkʌvə", def: "To become healthy again.", ex: "Rest at the camp to recover.", exVi: "Nghỉ ở trại để hồi phục." },
  ]);

  add("phrases2", [
    { w: "keep your guard up", vi: "giữ thế phòng bị", pos: "phrase", lv: "B2", ipa: "kiːp jɔː ɡɑːd ʌp", def: "Stay ready to defend yourself.", ex: "Keep your guard up near the boss.", exVi: "Giữ thế phòng bị khi ở gần boss." },
    { w: "out of nowhere", vi: "từ đâu xuất hiện", pos: "phrase", lv: "B2", ipa: "aʊt əv ˈnəʊweə", def: "Suddenly, with no warning.", ex: "The shadow ninja appeared out of nowhere.", exVi: "Ninja bóng xuất hiện từ đâu không rõ." },
    { w: "at all costs", vi: "bằng mọi giá", pos: "phrase", lv: "B2", ipa: "ət ɔːl kɒsts", def: "No matter what happens.", ex: "Protect the seal at all costs.", exVi: "Bảo vệ phong ấn bằng mọi giá." },
  ]);

  const base = VOCAB.length;
  V.forEach((e, k) => { e.id = e.w.replace(/\s+/g, "_"); e.alt = e.alt || []; e.i = base + k; VOCAB.push(e); VOCAB_BY_ID[e.id] = e; });
  Object.assign(POS_VI, { adj: "tính từ", v: "động từ", n: "danh từ", phrase: "cụm từ" });
  window.VOCAB_LV50 = V.length;
})();
