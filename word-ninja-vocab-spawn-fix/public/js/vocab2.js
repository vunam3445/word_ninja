// Word Ninja vocabulary, part 2: the demo set for the Lv.10-30 regions.
// Five words per topic, B1/B2, checked by hand. Enough to show how the harder maps read;
// the full list can be filled in later without touching any code.
(function () {
  const V = [];
  const add = (t, list) => list.forEach((e) => V.push(Object.assign({ t }, e)));

  add("health", [
    { w: "illness", vi: "bệnh tật, sự ốm đau", pos: "n", lv: "B1", ipa: "ˈɪlnəs", def: "The state of being ill.", ex: "He missed two weeks of school because of illness.", exVi: "Cậu ấy nghỉ học hai tuần vì bệnh." },
    { w: "headache", vi: "cơn đau đầu", pos: "n", lv: "B1", ipa: "ˈhedeɪk", def: "A pain in your head.", ex: "I have a bad headache today.", exVi: "Hôm nay tôi bị đau đầu dữ dội." },
    { w: "symptom", vi: "triệu chứng", pos: "n", lv: "B1", ipa: "ˈsɪmptəm", def: "A sign that you may have an illness.", ex: "A high temperature is a common symptom of flu.", exVi: "Sốt cao là một triệu chứng phổ biến của bệnh cúm." },
    { w: "treatment", vi: "sự điều trị", pos: "n", lv: "B1", ipa: "ˈtriːtmənt", def: "Medical care given to cure an illness.", ex: "She is having treatment for her back.", exVi: "Cô ấy đang được điều trị bệnh ở lưng." },
    { w: "recover", vi: "hồi phục (sức khỏe)", pos: "v", lv: "B2", ipa: "rɪˈkʌvə", def: "To become healthy again after an illness.", ex: "It took him a month to recover from the flu.", exVi: "Anh ấy mất một tháng để hồi phục sau cơn cúm." },
  ]);

  add("feelings", [
    { w: "anxious", vi: "lo lắng, bồn chồn", pos: "adj", lv: "B1", ipa: "ˈæŋkʃəs", def: "Worried about something that may happen.", ex: "She felt anxious before the exam.", exVi: "Cô ấy thấy lo lắng trước kỳ thi." },
    { w: "proud", vi: "tự hào", pos: "adj", lv: "B1", ipa: "praʊd", def: "Pleased about something good you or others did.", ex: "His parents are proud of him.", exVi: "Bố mẹ cậu ấy tự hào về cậu ấy." },
    { w: "jealous", vi: "ghen tị", pos: "adj", lv: "B2", ipa: "ˈdʒeləs", def: "Unhappy because someone has what you want.", ex: "He was jealous of his brother's new bike.", exVi: "Cậu ấy ghen tị với chiếc xe mới của anh trai." },
    { w: "disappointed", vi: "thất vọng", pos: "adj", lv: "B1", ipa: "ˌdɪsəˈpɔɪntɪd", def: "Sad because something was not as good as you hoped.", ex: "I was disappointed with the film.", exVi: "Tôi thất vọng về bộ phim đó." },
    { w: "relieved", vi: "nhẹ nhõm", pos: "adj", lv: "B2", ipa: "rɪˈliːvd", def: "Happy because a worry has gone away.", ex: "We were relieved when the storm passed.", exVi: "Chúng tôi nhẹ nhõm khi cơn bão đi qua." },
  ]);

  add("weather", [
    { w: "forecast", vi: "dự báo thời tiết", pos: "n", lv: "B1", ipa: "ˈfɔːkɑːst", def: "What the weather is expected to be like.", ex: "The forecast says it will rain tomorrow.", exVi: "Dự báo nói mai trời sẽ mưa." },
    { w: "drought", vi: "hạn hán", pos: "n", lv: "B2", ipa: "draʊt", def: "A long period with no rain.", ex: "The drought ruined the rice crop.", exVi: "Hạn hán đã phá hỏng vụ lúa." },
    { w: "thunderstorm", vi: "bão có sấm sét", pos: "n", lv: "B1", ipa: "ˈθʌndəstɔːm", def: "A storm with thunder and lightning.", ex: "A thunderstorm woke the whole village.", exVi: "Một trận bão sấm sét đánh thức cả làng." },
    { w: "humid", vi: "ẩm ướt (không khí)", pos: "adj", lv: "B2", ipa: "ˈhjuːmɪd", def: "With a lot of water in the air.", ex: "Summer here is hot and humid.", exVi: "Mùa hè ở đây nóng và ẩm." },
    { w: "breeze", vi: "gió nhẹ", pos: "n", lv: "B1", ipa: "briːz", def: "A light pleasant wind.", ex: "A cool breeze came off the river.", exVi: "Một cơn gió mát thổi từ sông lên." },
  ]);

  add("city", [
    { w: "traffic", vi: "giao thông, xe cộ", pos: "n", lv: "B1", ipa: "ˈtræfɪk", def: "The vehicles moving along a road.", ex: "The traffic is terrible at six o'clock.", exVi: "Giờ cao điểm sáu giờ thì giao thông rất tệ." },
    { w: "neighbourhood", alt: ["neighborhood"], vi: "khu phố, xóm", pos: "n", lv: "B1", ipa: "ˈneɪbəhʊd", def: "The area of a town where people live.", ex: "Our neighbourhood is quiet at night.", exVi: "Khu phố của chúng tôi yên tĩnh về đêm." },
    { w: "crowded", vi: "đông đúc", pos: "adj", lv: "B1", ipa: "ˈkraʊdɪd", def: "Full of people.", ex: "The market was crowded this morning.", exVi: "Chợ sáng nay rất đông." },
    { w: "pedestrian", vi: "người đi bộ", pos: "n", lv: "B2", ipa: "pəˈdestriən", def: "A person who is walking, not driving.", ex: "Pedestrians should use the crossing.", exVi: "Người đi bộ nên đi ở vạch sang đường." },
    { w: "skyscraper", vi: "nhà cao tầng", pos: "n", lv: "B2", ipa: "ˈskaɪskreɪpə", def: "A very tall building in a city.", ex: "The skyscraper has forty floors.", exVi: "Toà nhà cao tầng đó có bốn mươi tầng." },
  ]);

  add("sports", [
    { w: "compete", vi: "thi đấu, cạnh tranh", pos: "v", lv: "B1", ipa: "kəmˈpiːt", def: "To try to win against others.", ex: "Ten schools compete in this race.", exVi: "Mười trường thi đấu trong cuộc đua này." },
    { w: "referee", vi: "trọng tài", pos: "n", lv: "B1", ipa: "ˌrefəˈriː", def: "The person who makes sure a game follows the rules.", ex: "The referee stopped the match.", exVi: "Trọng tài đã dừng trận đấu." },
    { w: "opponent", vi: "đối thủ", pos: "n", lv: "B1", ipa: "əˈpəʊnənt", def: "The person or team you are playing against.", ex: "My opponent was faster than me.", exVi: "Đối thủ của tôi chạy nhanh hơn tôi." },
    { w: "stamina", vi: "sức bền", pos: "n", lv: "B2", ipa: "ˈstæmɪnə", def: "The strength to keep going for a long time.", ex: "Running every day builds stamina.", exVi: "Chạy bộ mỗi ngày giúp tăng sức bền." },
    { w: "tournament", vi: "giải đấu", pos: "n", lv: "B2", ipa: "ˈtʊənəmənt", def: "A competition with many games or matches.", ex: "The village holds a tournament every spring.", exVi: "Làng tổ chức một giải đấu mỗi độ xuân về." },
  ]);

  add("work", [
    { w: "employer", vi: "người chủ, nhà tuyển dụng", pos: "n", lv: "B1", ipa: "ɪmˈplɔɪə", def: "A person or company that pays people to work.", ex: "My employer lets us work from home.", exVi: "Chủ của tôi cho phép làm việc ở nhà." },
    { w: "deadline", vi: "hạn cuối", pos: "n", lv: "B1", ipa: "ˈdedlaɪn", def: "The time by which work must be finished.", ex: "The deadline is Friday afternoon.", exVi: "Hạn cuối là chiều thứ Sáu." },
    { w: "shift", vi: "ca làm việc", pos: "n", lv: "B1", ipa: "ʃɪft", def: "A period of time that you work.", ex: "He works the night shift at the forge.", exVi: "Anh ấy làm ca đêm ở lò rèn." },
    { w: "promotion", vi: "sự thăng chức", pos: "n", lv: "B2", ipa: "prəˈməʊʃn", def: "A move to a more important job.", ex: "She got a promotion after two years.", exVi: "Cô ấy được thăng chức sau hai năm." },
    { w: "colleague", vi: "đồng nghiệp", pos: "n", lv: "B1", ipa: "ˈkɒliːɡ", def: "A person you work with.", ex: "My colleagues helped me learn the job.", exVi: "Đồng nghiệp giúp tôi học công việc." },
  ]);

  add("tech", [
    { w: "device", vi: "thiết bị", pos: "n", lv: "B1", ipa: "dɪˈvaɪs", def: "A machine made for a particular purpose.", ex: "This device measures the temperature.", exVi: "Thiết bị này đo nhiệt độ." },
    { w: "battery", vi: "pin, ắc quy", pos: "n", lv: "B1", ipa: "ˈbætri", def: "The part that stores power in a machine.", ex: "My phone battery is almost empty.", exVi: "Pin điện thoại của tôi gần hết." },
    { w: "download", vi: "tải về (máy)", pos: "v", lv: "B1", ipa: "ˌdaʊnˈləʊd", def: "To copy a file from the internet to your machine.", ex: "Download the map before you travel.", exVi: "Tải bản đồ về trước khi lên đường." },
    { w: "encrypted", vi: "được mã hoá", pos: "adj", lv: "B2", ipa: "ɪnˈkrɪptɪd", def: "Written in a secret code so others cannot read it.", ex: "The message is encrypted.", exVi: "Tin nhắn đó đã được mã hoá." },
    { w: "software", vi: "phần mềm", pos: "n", lv: "B2", ipa: "ˈsɒftweə", def: "The programs that a computer runs.", ex: "The new software is easier to use.", exVi: "Phần mềm mới dễ dùng hơn." },
  ]);

  add("environment", [
    { w: "pollution", vi: "sự ô nhiễm", pos: "n", lv: "B1", ipa: "pəˈluːʃn", def: "Dirty air, water or land caused by people.", ex: "Pollution from the factory killed the fish.", exVi: "Ô nhiễm từ nhà máy đã làm cá chết." },
    { w: "recycle", vi: "tái chế", pos: "v", lv: "B1", ipa: "ˌriːˈsaɪkl", def: "To use something again instead of throwing it away.", ex: "We recycle paper and glass.", exVi: "Chúng tôi tái chế giấy và thuỷ tinh." },
    { w: "forest", vi: "rừng", pos: "n", lv: "B1", ipa: "ˈfɒrɪst", def: "A large area covered with trees.", ex: "The bamboo forest is quiet at dawn.", exVi: "Rừng trúc yên tĩnh lúc bình minh." },
    { w: "endangered", vi: "có nguy cơ tuyệt chủng", pos: "adj", lv: "B2", ipa: "ɪnˈdeɪndʒəd", def: "In danger of no longer existing.", ex: "These birds are endangered.", exVi: "Những con chim này có nguy cơ tuyệt chủng." },
    { w: "waste", vi: "rác thải; lãng phí", pos: "n", lv: "B1", ipa: "weɪst", def: "Things that are thrown away, or using more than you need.", ex: "Do not leave waste in the ruins.", exVi: "Đừng để rác lại trong phế tích." },
  ]);

  add("phrases2", [
    { w: "make up your mind", vi: "quyết định đi", pos: "phrase", lv: "B1", ipa: "meɪk ʌp jɔː maɪnd", def: "To decide something.", ex: "Make up your mind before we leave.", exVi: "Quyết định đi trước khi chúng ta đi." },
    { w: "a piece of cake", vi: "chuyện dễ như ăn kẹo", pos: "phrase", lv: "B1", ipa: "ə piːs əv keɪk", def: "Something very easy to do.", ex: "The first level was a piece of cake.", exVi: "Màn đầu tiên dễ như ăn kẹo." },
    { w: "on purpose", vi: "cố ý", pos: "phrase", lv: "B1", ipa: "ɒn ˈpɜːpəs", def: "Doing something deliberately, not by accident.", ex: "He did not push you on purpose.", exVi: "Cậu ấy không cố ý đẩy bạn đâu." },
    { w: "keep an eye on", vi: "để mắt tới, trông chừng", pos: "phrase", lv: "B1", ipa: "kiːp ən aɪ ɒn", def: "To watch something carefully.", ex: "Keep an eye on the boss while I heal.", exVi: "Để mắt tới con boss trong lúc tôi hồi máu." },
    { w: "out of the blue", vi: "bất ngờ, không báo trước", pos: "phrase", lv: "B2", ipa: "aʊt əv ðə bluː", def: "Suddenly and unexpectedly.", ex: "The old villager appeared out of the blue.", exVi: "Ông lão trong làng xuất hiện bất ngờ." },
  ]);

  const base = VOCAB.length;
  V.forEach((e, k) => { e.id = e.w.replace(/\s+/g, "_"); e.alt = e.alt || []; e.i = base + k; VOCAB.push(e); VOCAB_BY_ID[e.id] = e; });
  Object.assign(TOPICS, {
    health: "Sức khỏe", feelings: "Cảm xúc", weather: "Thời tiết", city: "Thành phố",
    sports: "Thể thao", work: "Công việc", tech: "Công nghệ", environment: "Môi trường", phrases2: "Thành ngữ và cụm từ",
  });
  Object.assign(POS_VI, { adv: "trạng từ", prep: "giới từ", "phrasal verb": "cụm động từ" });
  window.VOCAB_DEMO = V.length;
})();
