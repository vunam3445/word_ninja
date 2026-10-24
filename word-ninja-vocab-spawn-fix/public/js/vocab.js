// Word Ninja vocabulary: A1-A2, checked by hand.
// IPA is British (Cambridge-style). An entry without ipa shows none.
// w: answer, alt: other accepted answers, vi: Vietnamese meaning shown first,
// pos: part of speech, lv: CEFR level, t: topic, def: simple English definition,
// ex: example sentence, exVi: its Vietnamese translation.
(function () {
  const V = [];
  const add = (t, list) => list.forEach((e) => V.push(Object.assign({ t }, e)));

  add("animals", [
    { w: "dog", vi: "con chó", pos: "n", lv: "A1", ipa: "dɒɡ", def: "An animal with four legs that people often keep as a pet.", ex: "My dog likes to run in the park.", exVi: "Con chó của tôi thích chạy trong công viên." },
    { w: "cat", vi: "con mèo", pos: "n", lv: "A1", ipa: "kæt", def: "A small furry animal that people often keep as a pet.", ex: "The cat is sleeping on the chair.", exVi: "Con mèo đang ngủ trên ghế." },
    { w: "bird", vi: "con chim", pos: "n", lv: "A1", ipa: "bɜːd", def: "An animal with wings and feathers that can usually fly.", ex: "A bird is singing in the tree.", exVi: "Một con chim đang hót trên cây." },
    { w: "fish", vi: "con cá", pos: "n", lv: "A1", ipa: "fɪʃ", def: "An animal that lives and swims in water.", ex: "There are many fish in the river.", exVi: "Có rất nhiều cá ở dưới sông." },
    { w: "cow", vi: "con bò", pos: "n", lv: "A1", ipa: "kaʊ", def: "A large farm animal that gives us milk.", ex: "The cow is eating grass in the field.", exVi: "Con bò đang ăn cỏ trên cánh đồng." },
    { w: "pig", vi: "con lợn (con heo)", pos: "n", lv: "A1", ipa: "pɪɡ", def: "A farm animal with a fat body and a short flat nose.", ex: "The pig is sleeping in the mud.", exVi: "Con lợn đang ngủ trong bùn." },
    { w: "duck", vi: "con vịt", pos: "n", lv: "A1", ipa: "dʌk", def: "A water bird with short legs and a wide flat beak.", ex: "The ducks are swimming in the pond.", exVi: "Những con vịt đang bơi trong ao." },
    { w: "chicken", vi: "con gà", pos: "n", lv: "A1", ipa: "ˈtʃɪkɪn", def: "A farm bird that people keep for its eggs and meat.", ex: "The chicken laid an egg this morning.", exVi: "Con gà đã đẻ một quả trứng sáng nay." },
    { w: "horse", vi: "con ngựa", pos: "n", lv: "A1", ipa: "hɔːs", def: "A large strong animal that people can ride.", ex: "He rides a horse to the market.", exVi: "Anh ấy cưỡi ngựa ra chợ." },
    { w: "buffalo", vi: "con trâu", pos: "n", lv: "A2", ipa: "ˈbʌfələʊ", def: "A large animal like a cow, with big curved horns.", ex: "The buffalo is working in the rice field.", exVi: "Con trâu đang làm việc trên ruộng lúa." },
    { w: "rabbit", vi: "con thỏ", pos: "n", lv: "A1", ipa: "ˈræbɪt", def: "A small animal with long ears and soft fur.", ex: "The rabbit is eating a carrot.", exVi: "Con thỏ đang ăn một củ cà rốt." },
    { w: "monkey", vi: "con khỉ", pos: "n", lv: "A1", ipa: "ˈmʌŋki", def: "An animal with a long tail that is good at climbing trees.", ex: "The monkey is climbing a tall tree.", exVi: "Con khỉ đang leo lên một cái cây cao." },
    { w: "frog", vi: "con ếch", pos: "n", lv: "A1", ipa: "frɒɡ", def: "A small green animal that lives near water and can jump far.", ex: "A frog jumped into the pond.", exVi: "Một con ếch đã nhảy xuống ao." },
    { w: "snake", vi: "con rắn", pos: "n", lv: "A1", ipa: "sneɪk", def: "A long thin animal with no legs.", ex: "Be careful, there is a snake in the grass.", exVi: "Cẩn thận, có một con rắn trong bãi cỏ." },
    { w: "bee", vi: "con ong", pos: "n", lv: "A1", ipa: "biː", def: "A flying insect that makes honey.", ex: "A bee is flying from flower to flower.", exVi: "Một con ong đang bay từ bông hoa này sang bông hoa khác." },
    { w: "butterfly", vi: "con bướm", pos: "n", lv: "A1", ipa: "ˈbʌtəflaɪ", def: "An insect with large, colourful wings.", ex: "A yellow butterfly landed on my hand.", exVi: "Một con bướm vàng đã đậu trên tay tôi." },
    { w: "mouse", vi: "con chuột", pos: "n", lv: "A1", ipa: "maʊs", def: "A very small animal with a long thin tail.", ex: "The cat is chasing a mouse.", exVi: "Con mèo đang đuổi theo một con chuột." },
    { w: "goat", vi: "con dê", pos: "n", lv: "A1", ipa: "ɡəʊt", def: "A farm animal with horns that is good at climbing rocks.", ex: "The goat is standing on a big rock.", exVi: "Con dê đang đứng trên một tảng đá lớn." },
    { w: "elephant", vi: "con voi", pos: "n", lv: "A1", ipa: "ˈelɪfənt", def: "A very large grey animal with a long nose called a trunk.", ex: "The elephant is drinking water with its trunk.", exVi: "Con voi đang uống nước bằng vòi." },
    { w: "tiger", vi: "con hổ", pos: "n", lv: "A1", ipa: "ˈtaɪɡə", def: "A big wild cat with orange fur and black stripes.", ex: "The tiger lives in the forest.", exVi: "Con hổ sống trong rừng." },
  ]);

  add("food", [
    { w: "rice", vi: "cơm, gạo", pos: "n", lv: "A1", ipa: "raɪs", def: "Small white or brown grains that we cook and eat.", ex: "We eat rice every day.", exVi: "Chúng tôi ăn cơm mỗi ngày." },
    { w: "bread", vi: "bánh mì", pos: "n", lv: "A1", ipa: "bred", def: "A food made from flour and water and baked in an oven.", ex: "I have bread and eggs for breakfast.", exVi: "Tôi ăn bánh mì và trứng vào bữa sáng." },
    { w: "egg", vi: "quả trứng", pos: "n", lv: "A1", ipa: "eɡ", def: "An oval thing that a bird lays, which we can cook and eat.", ex: "She boiled an egg for breakfast.", exVi: "Cô ấy luộc một quả trứng cho bữa sáng." },
    { w: "milk", vi: "sữa", pos: "n", lv: "A1", ipa: "mɪlk", def: "A white drink that comes from cows.", ex: "The children drink milk every morning.", exVi: "Bọn trẻ uống sữa mỗi sáng." },
    { w: "water", vi: "nước", pos: "n", lv: "A1", ipa: "ˈwɔːtə", def: "The clear liquid in rivers and rain that we drink.", ex: "Please give me a glass of water.", exVi: "Làm ơn cho tôi một cốc nước." },
    { w: "apple", vi: "quả táo", pos: "n", lv: "A1", ipa: "ˈæpl", def: "A round fruit with red or green skin.", ex: "She eats an apple after lunch.", exVi: "Cô ấy ăn một quả táo sau bữa trưa." },
    { w: "banana", vi: "quả chuối", pos: "n", lv: "A1", ipa: "bəˈnɑːnə", def: "A long curved fruit with yellow skin.", ex: "Monkeys love bananas.", exVi: "Khỉ rất thích chuối." },
    { w: "orange", vi: "quả cam", pos: "n", lv: "A1", ipa: "ˈɒrɪndʒ", def: "A round fruit with a thick skin and sweet juice.", ex: "He peeled an orange for his sister.", exVi: "Anh ấy bóc một quả cam cho em gái." },
    { w: "carrot", vi: "củ cà rốt", pos: "n", lv: "A1", ipa: "ˈkærət", def: "A long orange vegetable that grows under the ground.", ex: "Rabbits like to eat carrots.", exVi: "Thỏ thích ăn cà rốt." },
    { w: "potato", vi: "củ khoai tây", pos: "n", lv: "A1", ipa: "pəˈteɪtəʊ", def: "A round vegetable with brown skin that grows under the ground.", ex: "My mother cooked potatoes for dinner.", exVi: "Mẹ tôi nấu khoai tây cho bữa tối." },
    { w: "tomato", vi: "quả cà chua", pos: "n", lv: "A1", ipa: "təˈmɑːtəʊ", def: "A soft round red fruit that is often eaten in salads.", ex: "She put a tomato in the salad.", exVi: "Cô ấy cho một quả cà chua vào món salad." },
    { w: "soup", vi: "món súp, canh", pos: "n", lv: "A1", ipa: "suːp", def: "A hot liquid food made by cooking vegetables or meat in water.", ex: "This chicken soup is very hot.", exVi: "Bát súp gà này rất nóng." },
    { w: "noodles", alt: ["noodle"], vi: "mì sợi (mì, bún, phở)", pos: "n", lv: "A1", ipa: "ˈnuːdlz", def: "Long thin strips of food that are cooked in water or soup.", ex: "We had noodles for lunch.", exVi: "Chúng tôi đã ăn mì vào bữa trưa." },
    { w: "meat", vi: "thịt", pos: "n", lv: "A1", ipa: "miːt", def: "The part of an animal that people cook and eat.", ex: "He doesn't eat meat.", exVi: "Anh ấy không ăn thịt." },
    { w: "tea", vi: "trà (chè)", pos: "n", lv: "A1", ipa: "tiː", def: "A hot drink made by pouring water onto dried leaves.", ex: "My grandfather drinks green tea every morning.", exVi: "Ông tôi uống trà xanh mỗi sáng." },
    { w: "cake", vi: "bánh ngọt", pos: "n", lv: "A1", ipa: "keɪk", def: "A sweet food made from flour, eggs, sugar and butter.", ex: "We made a cake for her birthday.", exVi: "Chúng tôi đã làm một chiếc bánh cho sinh nhật cô ấy." },
    { w: "sugar", vi: "đường (ăn)", pos: "n", lv: "A1", ipa: "ˈʃʊɡə", def: "A sweet white or brown food that we put in drinks and cakes.", ex: "Do you want sugar in your coffee?", exVi: "Bạn có muốn cho đường vào cà phê không?" },
    { w: "salt", vi: "muối", pos: "n", lv: "A1", ipa: "sɔːlt", def: "A white substance that we add to food to give it more taste.", ex: "Add a little salt to the soup.", exVi: "Cho thêm một chút muối vào canh." },
    { w: "breakfast", vi: "bữa sáng", pos: "n", lv: "A1", ipa: "ˈbrekfəst", def: "The first meal of the day.", ex: "I eat breakfast at seven o'clock.", exVi: "Tôi ăn sáng lúc bảy giờ." },
    { w: "hungry", vi: "đói (bụng)", pos: "adj", lv: "A1", ipa: "ˈhʌŋɡri", def: "Wanting or needing to eat food.", ex: "I'm hungry. Let's have lunch.", exVi: "Tôi đói rồi. Đi ăn trưa thôi." },
    { w: "delicious", vi: "ngon (món ăn)", pos: "adj", lv: "A2", ipa: "dɪˈlɪʃəs", def: "Having a very good taste.", ex: "This soup is delicious!", exVi: "Món súp này ngon quá!" },
  ]);

  add("nature", [
    { w: "tree", vi: "cái cây", pos: "n", lv: "A1", ipa: "triː", def: "A tall plant with a wooden trunk, branches and leaves.", ex: "There is a big tree in front of my house.", exVi: "Có một cái cây to trước nhà tôi." },
    { w: "flower", vi: "bông hoa", pos: "n", lv: "A1", ipa: "ˈflaʊə", def: "The colourful part of a plant.", ex: "She picked a red flower in the garden.", exVi: "Cô ấy hái một bông hoa đỏ trong vườn." },
    { w: "river", vi: "dòng sông", pos: "n", lv: "A1", ipa: "ˈrɪvə", def: "A long natural line of water that flows to the sea.", ex: "The children swim in the river in summer.", exVi: "Bọn trẻ bơi ở sông vào mùa hè." },
    { w: "mountain", vi: "ngọn núi", pos: "n", lv: "A1", ipa: "ˈmaʊntɪn", def: "A very high hill.", ex: "We climbed the mountain last weekend.", exVi: "Chúng tôi đã leo núi vào cuối tuần trước." },
    { w: "sky", vi: "bầu trời", pos: "n", lv: "A1", ipa: "skaɪ", def: "The space above the earth where we see the sun, moon and clouds.", ex: "The sky is blue today.", exVi: "Hôm nay bầu trời màu xanh." },
    { w: "sun", vi: "mặt trời", pos: "n", lv: "A1", ipa: "sʌn", def: "The big star in the sky that gives us light and heat.", ex: "The sun rises in the east.", exVi: "Mặt trời mọc ở phía đông." },
    { w: "moon", vi: "mặt trăng", pos: "n", lv: "A1", ipa: "muːn", def: "The round object that shines in the sky at night.", ex: "The moon is very bright tonight.", exVi: "Đêm nay trăng rất sáng." },
    { w: "star", vi: "ngôi sao", pos: "n", lv: "A1", ipa: "stɑː", def: "A small bright light that we see in the sky at night.", ex: "I can see many stars tonight.", exVi: "Tối nay tôi có thể thấy rất nhiều ngôi sao." },
    { w: "rain", vi: "mưa", pos: "n", lv: "A1", ipa: "reɪn", def: "Water that falls from the clouds in small drops.", ex: "The rain stopped after lunch.", exVi: "Mưa đã tạnh sau bữa trưa." },
    { w: "wind", vi: "gió", pos: "n", lv: "A1", ipa: "wɪnd", def: "Air that moves quickly outside.", ex: "The wind is very strong today.", exVi: "Hôm nay gió rất mạnh." },
    { w: "cloud", vi: "đám mây", pos: "n", lv: "A1", ipa: "klaʊd", def: "A white or grey shape in the sky, made of very small drops of water.", ex: "A dark cloud covered the sun.", exVi: "Một đám mây đen đã che khuất mặt trời." },
    { w: "grass", vi: "cỏ", pos: "n", lv: "A1", ipa: "ɡrɑːs", def: "A short green plant that covers fields and gardens.", ex: "The cows are eating grass.", exVi: "Những con bò đang ăn cỏ." },
    { w: "leaf", vi: "chiếc lá", pos: "n", lv: "A1", ipa: "liːf", def: "One of the flat green parts that grow on a tree or plant.", ex: "A leaf fell from the tree.", exVi: "Một chiếc lá rơi từ trên cây xuống." },
    { w: "stone", alt: ["rock"], vi: "hòn đá", pos: "n", lv: "A1", ipa: "stəʊn", def: "A small piece of rock.", ex: "He threw a stone into the lake.", exVi: "Anh ấy ném một hòn đá xuống hồ." },
    { w: "forest", vi: "khu rừng", pos: "n", lv: "A1", ipa: "ˈfɒrɪst", def: "A large area of land covered with trees.", ex: "Many animals live in the forest.", exVi: "Nhiều loài động vật sống trong rừng." },
    { w: "lake", vi: "cái hồ", pos: "n", lv: "A1", ipa: "leɪk", def: "A large area of water with land all around it.", ex: "We had a picnic next to the lake.", exVi: "Chúng tôi đã đi dã ngoại bên cạnh hồ." },
    { w: "sea", vi: "biển", pos: "n", lv: "A1", ipa: "siː", def: "The large area of salty water that covers most of the earth.", ex: "We swim in the sea every summer.", exVi: "Chúng tôi bơi ở biển mỗi mùa hè." },
    { w: "snow", vi: "tuyết", pos: "n", lv: "A1", ipa: "snəʊ", def: "Soft white pieces of frozen water that fall from the sky.", ex: "The mountain is covered in snow.", exVi: "Ngọn núi được phủ đầy tuyết." },
    { w: "field", vi: "cánh đồng", pos: "n", lv: "A1", ipa: "fiːld", def: "An area of land used for growing crops or keeping animals.", ex: "The farmer is working in the field.", exVi: "Người nông dân đang làm việc trên cánh đồng." },
    { w: "pond", vi: "cái ao", pos: "n", lv: "A2", ipa: "pɒnd", def: "A small area of still water.", ex: "There are fish in the pond.", exVi: "Có cá ở trong ao." },
    { w: "weather", vi: "thời tiết", pos: "n", lv: "A1", ipa: "ˈweðə", def: "How hot, cold, sunny or rainy it is outside.", ex: "What's the weather like today?", exVi: "Hôm nay thời tiết thế nào?" },
  ]);

  add("family", [
    { w: "mother", alt: ["mum", "mom"], vi: "mẹ", pos: "n", lv: "A1", ipa: "ˈmʌðə", def: "A woman who has a child.", ex: "My mother cooks very well.", exVi: "Mẹ tôi nấu ăn rất ngon." },
    { w: "father", alt: ["dad"], vi: "bố (ba)", pos: "n", lv: "A1", ipa: "ˈfɑːðə", def: "A man who has a child.", ex: "My father works in a hospital.", exVi: "Bố tôi làm việc ở bệnh viện." },
    { w: "brother", vi: "anh trai, em trai", pos: "n", lv: "A1", ipa: "ˈbrʌðə", def: "A boy or man who has the same parents as you.", ex: "My brother is two years older than me.", exVi: "Anh trai tôi lớn hơn tôi hai tuổi." },
    { w: "sister", vi: "chị gái, em gái", pos: "n", lv: "A1", ipa: "ˈsɪstə", def: "A girl or woman who has the same parents as you.", ex: "My sister likes to read books.", exVi: "Em gái tôi thích đọc sách." },
    { w: "grandmother", alt: ["grandma", "granny"], vi: "bà (nội, ngoại)", pos: "n", lv: "A1", ipa: "ˈɡrænmʌðə", def: "The mother of your mother or father.", ex: "My grandmother tells us old stories.", exVi: "Bà tôi kể cho chúng tôi nghe những câu chuyện xưa." },
    { w: "grandfather", alt: ["grandpa", "granddad"], vi: "ông (nội, ngoại)", pos: "n", lv: "A1", ipa: "ˈɡrænfɑːðə", def: "The father of your mother or father.", ex: "My grandfather has a small garden.", exVi: "Ông tôi có một khu vườn nhỏ." },
    { w: "son", vi: "con trai (của bố mẹ)", pos: "n", lv: "A1", ipa: "sʌn", def: "Someone's male child.", ex: "Their son is ten years old.", exVi: "Con trai của họ mười tuổi." },
    { w: "daughter", vi: "con gái (của bố mẹ)", pos: "n", lv: "A1", ipa: "ˈdɔːtə", def: "Someone's female child.", ex: "She has one daughter and two sons.", exVi: "Cô ấy có một con gái và hai con trai." },
    { w: "uncle", vi: "chú, bác, cậu", pos: "n", lv: "A1", ipa: "ˈʌŋkl", def: "The brother of your mother or father, or the husband of your aunt.", ex: "My uncle lives in Ha Noi.", exVi: "Chú tôi sống ở Hà Nội." },
    { w: "aunt", vi: "cô, dì, bác gái", pos: "n", lv: "A1", ipa: "ɑːnt", def: "The sister of your mother or father, or the wife of your uncle.", ex: "My aunt gave me a book.", exVi: "Cô tôi đã tặng tôi một cuốn sách." },
    { w: "baby", vi: "em bé", pos: "n", lv: "A1", ipa: "ˈbeɪbi", def: "A very young child.", ex: "The baby is sleeping.", exVi: "Em bé đang ngủ." },
    { w: "family", vi: "gia đình", pos: "n", lv: "A1", ipa: "ˈfæməli", def: "A group of people who are related, such as parents and their children.", ex: "There are four people in my family.", exVi: "Gia đình tôi có bốn người." },
    { w: "parents", vi: "bố mẹ", pos: "n", lv: "A1", ipa: "ˈpeərənts", def: "Your mother and father.", ex: "My parents are farmers.", exVi: "Bố mẹ tôi là nông dân." },
    { w: "husband", vi: "người chồng", pos: "n", lv: "A1", ipa: "ˈhʌzbənd", def: "The man that a woman is married to.", ex: "Her husband is a teacher.", exVi: "Chồng cô ấy là giáo viên." },
    { w: "wife", vi: "người vợ", pos: "n", lv: "A1", ipa: "waɪf", def: "The woman that a man is married to.", ex: "His wife works at a bank.", exVi: "Vợ anh ấy làm việc ở ngân hàng." },
    { w: "cousin", vi: "anh, chị, em họ", pos: "n", lv: "A2", ipa: "ˈkʌzn", def: "The child of your aunt or uncle.", ex: "My cousin is visiting us this summer.", exVi: "Em họ tôi sẽ đến thăm chúng tôi vào mùa hè này." },
    { w: "friend", vi: "người bạn", pos: "n", lv: "A1", ipa: "frend", def: "A person that you know well and like.", ex: "Lan is my best friend.", exVi: "Lan là bạn thân nhất của tôi." },
  ]);

  add("school", [
    { w: "school", vi: "trường học", pos: "n", lv: "A1", ipa: "skuːl", def: "A place where children go to learn.", ex: "I walk to school every day.", exVi: "Tôi đi bộ đến trường mỗi ngày." },
    { w: "teacher", vi: "giáo viên", pos: "n", lv: "A1", ipa: "ˈtiːtʃə", def: "A person whose job is to teach.", ex: "Our teacher is very kind.", exVi: "Cô giáo của chúng tôi rất tốt bụng." },
    { w: "student", alt: ["pupil"], vi: "học sinh, sinh viên", pos: "n", lv: "A1", ipa: "ˈstjuːdnt", def: "A person who is studying at a school or university.", ex: "There are thirty students in my class.", exVi: "Lớp tôi có ba mươi học sinh." },
    { w: "book", vi: "quyển sách", pos: "n", lv: "A1", ipa: "bʊk", def: "A set of printed pages held together inside a cover.", ex: "I am reading a book about animals.", exVi: "Tôi đang đọc một cuốn sách về động vật." },
    { w: "pen", vi: "cái bút (bút bi, bút mực)", pos: "n", lv: "A1", ipa: "pen", def: "A thing that you use for writing with ink.", ex: "Can I borrow your pen?", exVi: "Tôi có thể mượn bút của bạn không?" },
    { w: "pencil", vi: "bút chì", pos: "n", lv: "A1", ipa: "ˈpensl", def: "A thin wooden stick with a grey centre, used for writing or drawing.", ex: "Please write your name with a pencil.", exVi: "Hãy viết tên của bạn bằng bút chì." },
    { w: "desk", vi: "cái bàn học, bàn làm việc", pos: "n", lv: "A1", ipa: "desk", def: "A table that you sit at to write, read or work.", ex: "My books are on the desk.", exVi: "Sách của tôi ở trên bàn học." },
    { w: "lesson", vi: "bài học, tiết học", pos: "n", lv: "A1", ipa: "ˈlesn", def: "A period of time when you are taught something.", ex: "Our English lesson starts at nine.", exVi: "Tiết tiếng Anh của chúng tôi bắt đầu lúc chín giờ." },
    { w: "homework", vi: "bài tập về nhà", pos: "n", lv: "A1", ipa: "ˈhəʊmwɜːk", def: "School work that you do at home.", ex: "I do my homework after dinner.", exVi: "Tôi làm bài tập về nhà sau bữa tối." },
    { w: "classroom", vi: "phòng học, lớp học", pos: "n", lv: "A1", ipa: "ˈklɑːsruːm", def: "A room where students have lessons.", ex: "Our classroom has big windows.", exVi: "Phòng học của chúng tôi có những ô cửa sổ lớn." },
    { w: "library", vi: "thư viện", pos: "n", lv: "A1", ipa: "ˈlaɪbrəri", def: "A place where you can read or borrow books.", ex: "I borrow books from the library every week.", exVi: "Tôi mượn sách ở thư viện mỗi tuần." },
    { w: "dictionary", vi: "từ điển", pos: "n", lv: "A2", ipa: "ˈdɪkʃənri", def: "A book that tells you what words mean.", ex: "Look up the new word in your dictionary.", exVi: "Hãy tra từ mới trong từ điển của bạn." },
    { w: "question", vi: "câu hỏi", pos: "n", lv: "A1", ipa: "ˈkwestʃən", def: "A sentence or word that asks for an answer.", ex: "Can I ask you a question?", exVi: "Tôi có thể hỏi bạn một câu được không?" },
    { w: "answer", vi: "câu trả lời", pos: "n", lv: "A1", ipa: "ˈɑːnsə", def: "What you say or write when someone asks you a question.", ex: "I don't know the answer.", exVi: "Tôi không biết câu trả lời." },
    { w: "learn", vi: "học (để biết một điều mới)", pos: "v", lv: "A1", ipa: "lɜːn", def: "To get new knowledge or a new skill.", ex: "I want to learn English.", exVi: "Tôi muốn học tiếng Anh." },
    { w: "write", vi: "viết", pos: "v", lv: "A1", ipa: "raɪt", def: "To make letters or words on paper or on a screen.", ex: "Please write your name here.", exVi: "Hãy viết tên của bạn vào đây." },
    { w: "read", vi: "đọc", pos: "v", lv: "A1", ipa: "riːd", def: "To look at words and understand them.", ex: "My sister reads a book every night.", exVi: "Em gái tôi đọc sách mỗi tối." },
    { w: "map", vi: "bản đồ", pos: "n", lv: "A1", ipa: "mæp", def: "A drawing of an area that shows roads, rivers and towns.", ex: "Let's look at the map to find the way.", exVi: "Hãy xem bản đồ để tìm đường." },
  ]);

  add("home", [
    { w: "village", vi: "ngôi làng", pos: "n", lv: "A1", ipa: "ˈvɪlɪdʒ", def: "A small group of houses in the countryside.", ex: "My grandparents live in a small village.", exVi: "Ông bà tôi sống trong một ngôi làng nhỏ." },
    { w: "house", alt: ["home"], vi: "ngôi nhà", pos: "n", lv: "A1", ipa: "haʊs", def: "A building where people live.", ex: "Their house has a red roof.", exVi: "Nhà của họ có mái màu đỏ." },
    { w: "door", vi: "cánh cửa (ra vào)", pos: "n", lv: "A1", ipa: "dɔː", def: "The thing that you open to go into a room or a building.", ex: "Please close the door.", exVi: "Làm ơn đóng cửa lại." },
    { w: "window", vi: "cửa sổ", pos: "n", lv: "A1", ipa: "ˈwɪndəʊ", def: "An opening in a wall, usually with glass, that lets in light.", ex: "Open the window, please. It's hot.", exVi: "Làm ơn mở cửa sổ ra. Trời nóng quá." },
    { w: "kitchen", vi: "nhà bếp", pos: "n", lv: "A1", ipa: "ˈkɪtʃɪn", def: "The room where you cook food.", ex: "My mother is cooking in the kitchen.", exVi: "Mẹ tôi đang nấu ăn trong bếp." },
    { w: "bed", vi: "cái giường", pos: "n", lv: "A1", ipa: "bed", def: "A piece of furniture that you sleep on.", ex: "I go to bed at ten o'clock.", exVi: "Tôi đi ngủ lúc mười giờ." },
    { w: "chair", vi: "cái ghế", pos: "n", lv: "A1", ipa: "tʃeə", def: "A seat for one person, with a back and usually four legs.", ex: "Please sit on this chair.", exVi: "Mời bạn ngồi xuống chiếc ghế này." },
    { w: "table", vi: "cái bàn", pos: "n", lv: "A1", ipa: "ˈteɪbl", def: "A piece of furniture with a flat top on legs.", ex: "Dinner is on the table.", exVi: "Bữa tối đã được dọn lên bàn." },
    { w: "garden", vi: "khu vườn", pos: "n", lv: "A1", ipa: "ˈɡɑːdn", def: "Land next to a house where people grow flowers or vegetables.", ex: "We grow vegetables in our garden.", exVi: "Chúng tôi trồng rau trong vườn." },
    { w: "market", vi: "chợ", pos: "n", lv: "A1", ipa: "ˈmɑːkɪt", def: "A place where people buy and sell food and other things.", ex: "My mother buys fish at the market.", exVi: "Mẹ tôi mua cá ở chợ." },
    { w: "bridge", vi: "cây cầu", pos: "n", lv: "A2", ipa: "brɪdʒ", def: "Something built over a river or road so that people can cross it.", ex: "We walked across the old bridge.", exVi: "Chúng tôi đi bộ qua cây cầu cũ." },
    { w: "road", alt: ["street"], vi: "con đường (cho xe đi)", pos: "n", lv: "A1", ipa: "rəʊd", def: "A wide hard way that cars and people travel on.", ex: "Be careful when you cross the road.", exVi: "Hãy cẩn thận khi băng qua đường." },
    { w: "roof", vi: "mái nhà", pos: "n", lv: "A2", ipa: "ruːf", def: "The top part of a building that covers it.", ex: "The cat is sitting on the roof.", exVi: "Con mèo đang ngồi trên mái nhà." },
    { w: "lantern", vi: "đèn lồng", pos: "n", lv: "A2", ipa: "ˈlæntən", def: "A light inside a case that you can carry or hang up.", ex: "We hang red lanterns for the festival.", exVi: "Chúng tôi treo đèn lồng đỏ cho lễ hội." },
    { w: "farm", vi: "nông trại, trang trại", pos: "n", lv: "A1", ipa: "fɑːm", def: "Land and buildings used for growing crops and keeping animals.", ex: "They keep cows and chickens on their farm.", exVi: "Họ nuôi bò và gà ở trang trại của mình." },
    { w: "key", vi: "chìa khóa", pos: "n", lv: "A1", ipa: "kiː", def: "A small piece of metal that you use to open a lock.", ex: "I can't find my keys.", exVi: "Tôi không tìm thấy chìa khóa của mình." },
  ]);

  add("jobs", [
    { w: "doctor", vi: "bác sĩ", pos: "n", lv: "A1", ipa: "ˈdɒktə", def: "A person whose job is to help sick people get better.", ex: "The doctor told me to rest.", exVi: "Bác sĩ bảo tôi nghỉ ngơi." },
    { w: "nurse", vi: "y tá", pos: "n", lv: "A1", ipa: "nɜːs", def: "A person who looks after sick people, often in a hospital.", ex: "The nurse gave me some medicine.", exVi: "Cô y tá đưa cho tôi một ít thuốc." },
    { w: "farmer", vi: "người nông dân", pos: "n", lv: "A1", ipa: "ˈfɑːmə", def: "A person who owns or works on a farm.", ex: "The farmer grows rice and corn.", exVi: "Người nông dân trồng lúa và ngô." },
    { w: "cook", alt: ["chef"], vi: "đầu bếp", pos: "n", lv: "A1", ipa: "kʊk", def: "A person who prepares and cooks food.", ex: "My uncle is a cook in a restaurant.", exVi: "Chú tôi là đầu bếp ở một nhà hàng." },
    { w: "driver", vi: "tài xế, người lái xe", pos: "n", lv: "A1", ipa: "ˈdraɪvə", def: "A person who drives a car, bus or truck.", ex: "The bus driver said hello to everyone.", exVi: "Bác tài xế xe buýt chào mọi người." },
    { w: "singer", vi: "ca sĩ", pos: "n", lv: "A1", ipa: "ˈsɪŋə", def: "A person who sings, especially as a job.", ex: "She wants to be a singer.", exVi: "Cô ấy muốn trở thành ca sĩ." },
    { w: "artist", vi: "họa sĩ, nghệ sĩ", pos: "n", lv: "A1", ipa: "ˈɑːtɪst", def: "A person who paints or draws pictures.", ex: "The artist painted a picture of the river.", exVi: "Người họa sĩ đã vẽ một bức tranh về dòng sông." },
    { w: "worker", vi: "công nhân, người lao động", pos: "n", lv: "A2", ipa: "ˈwɜːkə", def: "A person who works, especially with their hands.", ex: "The workers are building a new bridge.", exVi: "Các công nhân đang xây một cây cầu mới." },
    { w: "job", vi: "công việc, nghề nghiệp", pos: "n", lv: "A1", ipa: "dʒɒb", def: "The work that you do to earn money.", ex: "My sister has a new job.", exVi: "Chị tôi có một công việc mới." },
    { w: "hospital", vi: "bệnh viện", pos: "n", lv: "A1", ipa: "ˈhɒspɪtl", def: "A place where sick or hurt people get help from doctors and nurses.", ex: "My aunt works at the hospital.", exVi: "Cô tôi làm việc ở bệnh viện." },
    { w: "office", vi: "văn phòng", pos: "n", lv: "A1", ipa: "ˈɒfɪs", def: "A room or building where people work at desks.", ex: "My father goes to the office by bus.", exVi: "Bố tôi đi đến văn phòng bằng xe buýt." },
    { w: "money", vi: "tiền", pos: "n", lv: "A1", ipa: "ˈmʌni", def: "Coins and paper notes that you use to buy things.", ex: "I saved money to buy a new bike.", exVi: "Tôi đã tiết kiệm tiền để mua một chiếc xe đạp mới." },
    { w: "busy", vi: "bận rộn", pos: "adj", lv: "A1", ipa: "ˈbɪzi", def: "Having a lot of things to do.", ex: "My mother is very busy today.", exVi: "Hôm nay mẹ tôi rất bận." },
    { w: "work", vi: "làm việc", pos: "v", lv: "A1", ipa: "wɜːk", def: "To do a job, usually to earn money.", ex: "My parents work on a farm.", exVi: "Bố mẹ tôi làm việc ở trang trại." },
    { w: "pilot", vi: "phi công", pos: "n", lv: "A2", ipa: "ˈpaɪlət", def: "A person who flies a plane.", ex: "The pilot flew the plane to Da Nang.", exVi: "Viên phi công đã lái máy bay đến Đà Nẵng." },
    { w: "dentist", vi: "nha sĩ", pos: "n", lv: "A2", ipa: "ˈdentɪst", def: "A person whose job is to look after people's teeth.", ex: "I go to the dentist twice a year.", exVi: "Tôi đi khám nha sĩ hai lần một năm." },
  ]);

  add("travel", [
    { w: "travel", vi: "đi du lịch, đi xa", pos: "v", lv: "A1", ipa: "ˈtrævl", def: "To go from one place to another, often far away.", ex: "I want to travel around Viet Nam.", exVi: "Tôi muốn đi du lịch khắp Việt Nam." },
    { w: "ticket", vi: "vé", pos: "n", lv: "A1", ipa: "ˈtɪkɪt", def: "A small piece of paper that shows you have paid to travel or to go in somewhere.", ex: "I bought a train ticket to Hue.", exVi: "Tôi đã mua một vé tàu đi Huế." },
    { w: "train", vi: "tàu hỏa", pos: "n", lv: "A1", ipa: "treɪn", def: "A long vehicle that travels on a railway and carries people or goods.", ex: "The train leaves at eight o'clock.", exVi: "Tàu khởi hành lúc tám giờ." },
    { w: "bus", vi: "xe buýt", pos: "n", lv: "A1", ipa: "bʌs", def: "A big vehicle that carries many passengers along a road.", ex: "I go to school by bus.", exVi: "Tôi đi học bằng xe buýt." },
    { w: "plane", alt: ["airplane", "aeroplane"], vi: "máy bay", pos: "n", lv: "A1", ipa: "pleɪn", def: "A vehicle with wings and engines that flies.", ex: "The plane is flying above the clouds.", exVi: "Máy bay đang bay trên những đám mây." },
    { w: "boat", vi: "con thuyền", pos: "n", lv: "A1", ipa: "bəʊt", def: "A small vehicle that travels on water.", ex: "We crossed the river by boat.", exVi: "Chúng tôi qua sông bằng thuyền." },
    { w: "bicycle", alt: ["bike"], vi: "xe đạp", pos: "n", lv: "A1", ipa: "ˈbaɪsɪkl", def: "A vehicle with two wheels that you ride by pushing pedals with your feet.", ex: "He rides his bicycle to school.", exVi: "Cậu ấy đạp xe đến trường." },
    { w: "hotel", vi: "khách sạn", pos: "n", lv: "A1", ipa: "həʊˈtel", def: "A building where you pay to sleep and eat when you travel.", ex: "We stayed at a hotel near the beach.", exVi: "Chúng tôi ở một khách sạn gần bãi biển." },
    { w: "beach", vi: "bãi biển", pos: "n", lv: "A1", ipa: "biːtʃ", def: "An area of sand or small stones next to the sea.", ex: "The children are playing on the beach.", exVi: "Bọn trẻ đang chơi trên bãi biển." },
    { w: "suitcase", vi: "va li", pos: "n", lv: "A2", ipa: "ˈsuːtkeɪs", def: "A large case for carrying clothes when you travel.", ex: "My suitcase is very heavy.", exVi: "Va li của tôi rất nặng." },
    { w: "passport", vi: "hộ chiếu", pos: "n", lv: "A2", ipa: "ˈpɑːspɔːt", def: "An official document that you need to travel to another country.", ex: "Don't forget your passport!", exVi: "Đừng quên hộ chiếu của bạn nhé!" },
    { w: "airport", vi: "sân bay", pos: "n", lv: "A1", ipa: "ˈeəpɔːt", def: "A place where planes land and take off.", ex: "We arrived at the airport early.", exVi: "Chúng tôi đã đến sân bay sớm." },
    { w: "holiday", alt: ["vacation"], vi: "kỳ nghỉ", pos: "n", lv: "A1", ipa: "ˈhɒlədeɪ", def: "A time when you do not work or go to school, and often travel.", ex: "We went to the beach for our summer holiday.", exVi: "Chúng tôi đã đi biển vào kỳ nghỉ hè." },
    { w: "city", vi: "thành phố", pos: "n", lv: "A1", ipa: "ˈsɪti", def: "A large and important town.", ex: "Ho Chi Minh City is very busy.", exVi: "Thành phố Hồ Chí Minh rất nhộn nhịp." },
    { w: "trip", vi: "chuyến đi", pos: "n", lv: "A1", ipa: "trɪp", def: "A journey to a place and back again.", ex: "We took a trip to the mountains.", exVi: "Chúng tôi đã có một chuyến đi lên núi." },
    { w: "tourist", vi: "khách du lịch", pos: "n", lv: "A2", ipa: "ˈtʊərɪst", def: "A person who visits a place for fun.", ex: "Many tourists visit Hoi An every year.", exVi: "Nhiều khách du lịch đến thăm Hội An mỗi năm." },
    { w: "car", vi: "xe ô tô", pos: "n", lv: "A1", ipa: "kɑː", def: "A road vehicle with four wheels and an engine.", ex: "My uncle has a red car.", exVi: "Chú tôi có một chiếc xe ô tô màu đỏ." },
  ]);

  // Phrases: used by the quest boss. No IPA shown for phrases.
  add("phrases", [
    { w: "good morning", vi: "chào buổi sáng", pos: "phrase", lv: "A1", def: "A polite thing to say when you meet someone in the morning.", ex: "Good morning, everyone!", exVi: "Chào buổi sáng mọi người!" },
    { w: "thank you", vi: "cảm ơn bạn", pos: "phrase", lv: "A1", def: "What you say to show that you are happy about something someone did for you.", ex: "Thank you for your help.", exVi: "Cảm ơn bạn đã giúp đỡ." },
    { w: "see you later", alt: ["see you soon"], vi: "hẹn gặp lại (sau)", pos: "phrase", lv: "A1", def: "Something you say when you leave someone you will see again.", ex: "I have to go now. See you later!", exVi: "Tôi phải đi bây giờ. Hẹn gặp lại nhé!" },
    { w: "how are you", vi: "bạn có khỏe không", pos: "phrase", lv: "A1", def: "A question you ask to find out if someone is well.", ex: "Hi Nam, how are you?", exVi: "Chào Nam, bạn có khỏe không?" },
    { w: "excuse me", vi: "xin lỗi, cho tôi hỏi (để gây chú ý lịch sự)", pos: "phrase", lv: "A1", def: "A polite way to get someone's attention.", ex: "Excuse me, where is the bus station?", exVi: "Xin lỗi, cho tôi hỏi bến xe buýt ở đâu?" },
    { w: "get up", vi: "thức dậy, ra khỏi giường", pos: "phrasal verb", lv: "A1", def: "To get out of bed after sleeping.", ex: "I get up at six o'clock.", exVi: "Tôi thức dậy lúc sáu giờ." },
    { w: "go to bed", vi: "đi ngủ", pos: "phrase", lv: "A1", def: "To get into your bed so that you can sleep.", ex: "I usually go to bed at ten.", exVi: "Tôi thường đi ngủ lúc mười giờ." },
    { w: "look after", alt: ["take care of"], vi: "chăm sóc, trông nom", pos: "phrasal verb", lv: "A2", def: "To take care of someone or something.", ex: "She looks after her little brother.", exVi: "Cô ấy chăm sóc em trai nhỏ của mình." },
    { w: "turn on", alt: ["switch on"], vi: "bật (đèn, máy)", pos: "phrasal verb", lv: "A2", def: "To make a light or a machine start working.", ex: "Please turn on the light.", exVi: "Làm ơn bật đèn lên." },
    { w: "a cup of tea", vi: "một tách trà", pos: "phrase", lv: "A1", def: "The amount of tea that fills one cup.", ex: "Would you like a cup of tea?", exVi: "Bạn có muốn một tách trà không?" },
    { w: "every day", vi: "mỗi ngày, hằng ngày", pos: "phrase", lv: "A1", def: "On all days, without missing any.", ex: "I practise English every day.", exVi: "Tôi luyện tiếng Anh mỗi ngày." },
    { w: "happy birthday", vi: "chúc mừng sinh nhật", pos: "phrase", lv: "A1", def: "What you say to someone on the day they were born.", ex: "Happy birthday, Mai!", exVi: "Chúc mừng sinh nhật, Mai!" },
  ]);

  V.forEach((e, i) => { e.id = e.w.replace(/\s+/g, "_"); e.i = i; e.alt = e.alt || []; });
  window.VOCAB = V;
  window.VOCAB_BY_ID = Object.fromEntries(V.map((e) => [e.id, e]));
  window.TOPICS = {
    animals: "Động vật", food: "Thức ăn", nature: "Thiên nhiên", family: "Gia đình",
    school: "Trường học", home: "Nhà và làng", jobs: "Nghề nghiệp", travel: "Du lịch", phrases: "Cụm từ",
  };
  window.POS_VI = { n: "danh từ", v: "động từ", adj: "tính từ", phrase: "cụm từ", "phrasal verb": "cụm động từ" };
})();
