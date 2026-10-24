# Word Ninja — Frontend + Backend local

Bản này được dựng từ file FE Word Ninja cấp 1–50 người dùng cung cấp. Giao diện, sprite vẽ bằng SVG, dữ liệu map/vũ khí/kỹ năng và luật game hiện có được giữ lại. Backend dùng Node.js + PostgreSQL; frontend và backend chạy cùng một địa chỉ/port.

> Đây là bản backend single-player có tài khoản và lưu cloud tự host. Các luật rèn/evolve/quest/kill đi qua `server/game-world.mjs`, dùng cùng bộ luật được đóng gói từ game. Tuy vậy, một số chi tiết nhập từ và sát thương hiển thị vẫn tính ở FE, nên không coi đây là backend chống gian lận hoàn chỉnh cho PvP/public MMORPG.

## Bản sửa lỗi lò rèn

- Khai báo `evo` ở đúng phạm vi của `VIEWS.forge`, tránh lỗi `ReferenceError: evo is not defined` khi mở lò rèn.
- Thêm regression test để phát hiện lỗi phạm vi biến này nếu code bị sửa lại.

## Hoạt ảnh kỹ năng trong trận đấu

Bản hợp nhất đã chuyển hệ hoạt ảnh chiêu thức từ bản frontend tham chiếu vào `public/js/world.js` và nối với luồng trận đấu trong `public/js/battle.js`. Bao gồm nhát kiếm/chém, lưỡi liềm, linh đạn, ám khí, vòng chém, chiêu nhiều nhịp/tối thượng, cùng hiệu ứng buff/trạng thái như hộ thể, né tránh, trói, linh trận, liên hoàn và tích lực. Các hoạt ảnh chỉ trình bày sự kiện từ kết quả server; sát thương, chí mạng và thời điểm hoàn thành chiêu vẫn do server xác định. Khi xem lại hoặc mở rộng chiêu thức, kiểm tra đồng thời `public/js/data.js` (metadata `fx`), `server/game-world.mjs` (logic thực chiến) và `public/js/world.js` (VFX).

Kiểm thử thêm kiểm tra hoạt ảnh tồn tại, mapping battle → VFX và kỹ năng tích lực `a25` hoàn thành ở câu trả lời đúng thứ ba. `npm test` hiện có 24 bài test; `npm run check` xác nhận 37 tệp JavaScript hợp lệ cú pháp. Bản này chưa được visual smoke test trong trình duyệt tại môi trường đóng gói.

## 1. Yêu cầu

- Node.js **22.5 trở lên** (khuyến nghị Node 22 LTS mới nhất).
- PostgreSQL Server đang chạy. Java không bắt buộc để chạy bản này.
- Trình duyệt hiện đại.
- Kết nối Internet nếu Phaser 3.90 CDN chưa được cache; các file game khác nằm trong `public/`.

## 2. Tạo database

Dùng pgAdmin hoặc `psql`, tạo database UTF-8 có tên `word_ninja`.

Ví dụ trong PowerShell nếu `psql` có trong PATH:

```powershell
psql -U postgres -c "CREATE DATABASE word_ninja ENCODING 'UTF8';"
```

Nếu database đã tồn tại thì bỏ qua. Không cần tạo bảng bằng tay; backend tự chạy `server/schema.sql` khi khởi động.

## 3. Cấu hình môi trường

Tại thư mục dự án, sao chép `.env.example` thành `.env`:

```powershell
Copy-Item .env.example .env
notepad .env
```

Sửa `PGPASSWORD` thành mật khẩu user PostgreSQL của bạn. Mặc định:

```dotenv
HOST=127.0.0.1
PORT=5173
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=word_ninja
PGUSER=postgres
PGPASSWORD=MAT_KHAU_POSTGRES_CUA_BAN
PGSSL=false
SESSION_DAYS=30
```

Nếu PostgreSQL dùng port khác hoặc tài khoản khác, điều chỉnh cho đúng. Không đưa `.env` lên Git hoặc chia sẻ file này vì nó chứa mật khẩu.

## 4. Cài và chạy

Mở PowerShell ở thư mục chứa `package.json`:

```powershell
npm install
npm run check
npm test
npm start
```

Lần đầu `npm install` cần kết nối npm registry để tải dependency `pg`. Sau khi chạy, terminal sẽ in địa chỉ server. Mặc định mở:

- Game: http://127.0.0.1:5173/
- Backend health: http://127.0.0.1:5173/api/health

Health nên trả JSON với `"ok": true` và `"database": "connected"`.

### Nếu cổng 5173 đang được dùng

```powershell
$env:PORT=5174
npm start
```

Sau đó mở `http://127.0.0.1:5174/`.

## 5. Tạo tài khoản và nhập save localStorage cũ

1. Mở game, bấm nút **Đăng nhập / Lưu cloud** ở góc trên.
2. Chọn **Tạo tài khoản** hoặc **Đăng nhập**. Username dài 3–24 ký tự, chỉ chữ/số/dấu gạch dưới; mật khẩu tối thiểu 10 ký tự.
3. Khi đăng nhập lần đầu và tài khoản chưa có save, game sẽ thử nhập save cũ từ localStorage `wordninja_progress`.
4. Nếu server đã có save, save server được ưu tiên; bản local cũ không tự ghi đè save server.
5. Tải lại trang/đăng nhập lại để xác nhận cấp, lớp, vật phẩm, kỹ năng, nhiệm vụ và từ đã học vẫn còn.

Nên sao lưu save cũ trước lần đăng nhập đầu tiên. Người dùng có thể bấm **Đăng xuất** để quay về chơi bằng localStorage trên trình duyệt đó.

## 6. Chuyển Oxford 3000 từ database server cũ sang database game mới

Trong `server.zip` cũ, bảng từ vựng là `vocabularies` trong database `ninja_english_db` (mặc định port `5433`). Bản game mới dùng bảng `wn_vocab` trong database `word_ninja` (mặc định port `5432`). Script `scripts/migrate-old-vocabulary.js` đọc database cũ, sau đó chèn/cập nhật từ sang database mới. Script không sửa hoặc xóa dữ liệu ở database nguồn.

1. Kiểm tra PostgreSQL cũ vẫn chạy và database cũ còn bảng `vocabularies`.
2. Mở `.env`, cấu hình các biến `OLD_PGHOST`, `OLD_PGPORT`, `OLD_PGDATABASE`, `OLD_PGUSER`, `OLD_PGPASSWORD` cho database cũ. Giữ `PG*` là cấu hình database game mới.
3. Chạy tại thư mục dự án:

```powershell
npm run migrate:old-vocab
```

4. Kiểm tra thống kê tại `http://127.0.0.1:5173/api/vocab/stats`. Bản ghi từ legacy có thể vẫn được giữ trong `wn_vocab` để đối chiếu, nhưng không được phục vụ cho câu hỏi authoritative nếu không có provenance SQLite + Oxford hợp lệ.

Script đánh dấu `is_common` dựa trên `data/common-words.txt`. Trong mỗi chu kỳ 10 câu chiến đấu, server xáo ngẫu nhiên 4 vị trí từ thông dụng và 6 vị trí từ vựng theo CEFR phù hợp cấp độ. CEFR nâng dần theo cấp nhân vật; nếu DB chưa có C1/C2, game tự rơi về nhóm CEFR cao nhất hiện có.

## 6A. Nguồn từ vựng, đối soát và khôi phục an toàn

Pipeline có một nguồn nghĩa duy nhất:
- Oxford 3000 chỉ xác định từ đích và CEFR A1/A2/B1/B2.
- `data/dictionary_en_vi.db` (tải từ `skypediacode/english-vietnamese-dictionary`) là nguồn duy nhất của gloss tiếng Việt, POS, ví dụ và IPA khi SQLite có dữ liệu.
- `data/vocab-curated-overrides.json` chỉ còn được dùng như *gợi ý chọn sense*: gợi ý chỉ có hiệu lực khi khớp chính xác một gloss SQLite của đúng headword; nội dung file không được ghi trực tiếp vào DB. Nếu không tìm thấy nghĩa, importer lưu nghĩa rỗng và không bật từ đó. Từ đa nghĩa vẫn giữ toàn bộ gloss thuộc đúng mục từ SQLite; khi POS/ngữ cảnh làm rõ nghĩa ưu tiên thì từ vẫn dùng được, còn các sense ngang điểm hoặc chưa phân biệt an toàn sẽ bị đánh dấu cần duyệt và không xuất hiện trong câu hỏi chiến đấu.

Tra cứu dùng khóa headword tiếng Anh chính xác, ghi lại `dictionary_word_id`, `dictionary_sense_id` và toàn bộ gloss nguồn của chính headword. Pipeline không ghép bằng vị trí dòng/mảng. Bản ghi có nghĩa nhưng không có provenance hợp lệ sẽ không đi qua `GET /api/vocab` hoặc bộ chọn câu hỏi chiến đấu. Ở frontend, sổ tay và trận đấu cùng dùng danh sách PostgreSQL từ API; nếu API không tải được, game không âm thầm rơi về gloss đóng gói cũ.

**Xem trước và cập nhật** (trong thư mục dự án; cần có `.env`, PostgreSQL và quyền đọc/tải từ điển):

```powershell
npm run import:vocab -- --dry-run
npm run import:vocab
npm run audit:vocab
npm test
npm run check
```

`import:vocab` tạo bảng backup riêng `wn_vocab_backup_...` trước khi thay thế toàn bộ `wn_vocab` bằng danh sách hiện có trong Oxford 3000. Thao tác xóa dữ liệu cũ và nạp lại dữ liệu mới chạy trong cùng một transaction: nếu có lỗi thì rollback và giữ nguyên bảng cũ. Các từ ngoài Oxford và bản ghi cũ lỗi thời sẽ bị loại khỏi `wn_vocab`. Chỉ bảng từ vựng này bị thay; không xóa tài khoản, save nhân vật, tiến trình học, combat session, trang bị hay bảng khác. Các gloss không có dấu hiệu là tiếng Việt bị giữ ở trạng thái không sẵn sàng chiến đấu thay vì được hiển thị như nghĩa tiếng Việt. `audit:vocab` xuất CSV và JSON trong thư mục `reports/`.

`repair:vocab` mặc định chỉ xem trước; để áp dụng cần ghi rõ `npm run repair:vocab -- --apply`. Import đã tự backup và xử lý lại các bản ghi Oxford, nên không cần lệnh áp dụng override riêng.

Nếu cần khôi phục một backup đã được in ra bởi importer:

```powershell
npm run restore:vocab -- --backup=wn_vocab_backup_YYYYMMDDhhmmss_xxxxxx
```

Khôi phục chỉ tác động `wn_vocab` và tạo thêm một backup an toàn của trạng thái ngay trước lúc khôi phục. Chạy `npm start` lại rồi tải game bằng `Ctrl+F5`.

## 6B. Cooldown quái được gắn theo từng vị trí spawn

Cooldown hồi sinh hiện được lưu trong save nhân vật bằng khóa riêng theo vị trí, ví dụ `farm1:0:radish`. Giết `farm1:0:radish` không khóa những con `radish` ở `farm1:1:radish`, `farm1:2:radish`, v.v. Backend còn đọc cooldown từ combat session cũ để tương thích, nhưng save theo spawn riêng là nguồn bền vững. Khi giao diện cũ bỏ sót lệnh kết thúc trận, một lần tấn công mới có thể phục hồi khỏi combat session cũ thay vì bị kẹt.

## 8. Ghi chú về logic phía máy chủ và di chuyển

Khi đăng nhập bằng **Đăng nhập / Lưu cloud**, các thao tác tiến trình, nhiệm vụ, cường hóa, tiến hóa, câu hỏi chiến đấu, kiểm tra đáp án, sát thương, phần thưởng và tiến trình học từ vựng được xử lý/xác thực qua backend rồi lưu PostgreSQL. Khi chơi chế độ chỉ lưu trình duyệt, game vẫn giữ chế độ offline tương thích cũ; không thể xem đó là authoritative server vì trình duyệt tự chạy logic.

Di chuyển đã được chỉnh để chỉ đổi texture khi frame thật sự thay đổi (tránh đặt lại texture mỗi render frame) và chuyển vận tốc ngang có gia tốc/giảm tốc ngắn để khi đổi hướng A/D bớt giật.

## 9. Các endpoint

- `GET /api/health` — trạng thái backend/database.
- `GET /api/vocab` — danh sách từ đã đối soát từ SQLite + Oxford, dùng bởi sổ tay và câu hỏi game.
- `GET /api/vocab/stats` — thống kê số từ đủ điều kiện và số từ cần duyệt.
- `POST /api/auth/register` — tạo tài khoản.
- `POST /api/auth/login` — đăng nhập và lấy token.
- `GET /api/auth/me` — kiểm tra tài khoản.
- `POST /api/auth/logout` — thu hồi phiên.
- `POST /api/world` — giao thức `init/import/sync` mà `js/state.js` đang sử dụng.

Token phiên được lưu trên trình duyệt; server chỉ lưu SHA-256 của token. Mật khẩu được hash bằng scrypt, không lưu dạng rõ.

## 7. Vị trí dữ liệu

- `server/schema.sql`: schema PostgreSQL.
- `server/game-world.mjs`: luật game phía server (không được phục vụ dưới thư mục public).
- `server.js`: API, phục vụ static FE và kết nối PostgreSQL.
- `public/`: frontend hiện tại và bridge `js/localbe.js`.
- `wn_game_saves`: trạng thái nhân vật, revision và lịch sử batch.
- `wn_word_progress`: trạng thái ôn tập từ vựng.
- `wn_users`, `wn_sessions`: tài khoản và phiên đăng nhập.

Sao lưu database thường xuyên. Ví dụ:

```powershell
pg_dump -U postgres -d word_ninja -F c -f word_ninja_backup.dump
```

## 8. Khắc phục lỗi thường gặp

**`password authentication failed`**: kiểm tra `PGUSER`, `PGPASSWORD` và cấu hình xác thực PostgreSQL.

**`database "word_ninja" does not exist`**: tạo database ở bước 2.

**`Cannot find module 'pg'`**: chạy `npm install` trong đúng thư mục dự án.

**Cổng đang được dùng**: đổi `$env:PORT` sang port khác rồi chạy lại.

**Game trên trình duyệt không tải được Phaser**: chạy `npm install` để cài Phaser; bản APK do workflow tạo sẽ đóng gói Phaser cục bộ nên không phụ thuộc CDN khi chơi.

**Không thấy nút đăng nhập**: hard refresh trình duyệt bằng Ctrl+F5; xác nhận `public/js/localbe.js` được tải và không có lỗi trong DevTools Console.

## 9. Giới hạn cần biết

- Backend chưa phải hệ thống chống gian lận toàn diện: client còn gửi kết quả đúng/sai từ vựng và tính một phần sát thương cục bộ. Với game single-player lưu tiến trình cá nhân, điều này đủ làm nền ban đầu; trước khi mở public cạnh tranh/multiplayer cần chuyển xác minh câu trả lời, damage và combat outcome về server.
- Chạy trên `127.0.0.1` chỉ phục vụ máy hiện tại. Muốn chơi từ máy khác phải triển khai trên máy chủ có thể truy cập, đặt `HOST=0.0.0.0`, cấu hình firewall/HTTPS và bảo vệ database.
- Bản này giữ gameplay/map/kỹ năng cấp 50 có trong FE upload; chỉ bổ sung tài khoản, database và luồng tích hợp lưu tiến trình. Không coi nội dung placeholder hoặc chức năng chưa được kiểm thử là hoàn thiện.


Trong chiến đấu, phần câu hỏi có nhãn ‘Nghĩa tiếng Việt — gõ từ tiếng Anh tương ứng’. Nếu từ có ví dụ từ SQLite, ví dụ được che mục từ cần trả lời để tránh lộ đáp án. Các cặp đại từ dễ nhầm như `they/them` có thêm ghi chú ngữ pháp chủ ngữ/tân ngữ.


## Mobile landscape controls update

- The mobile world controls now use a virtual analog-style joystick inspired by common MOBA controls. The current world is a side-scrolling 2D map, so horizontal joystick movement drives left/right movement; jump and interact remain separate buttons.
- The page requests landscape orientation after the player presses Start where the browser supports the Orientation API. Browser support is not guaranteed. For a real Android APK, set the native Android Activity to `android:screenOrientation="landscape"` in the Capacitor Android project before building.
- Landscape-specific CSS compacts the HUD and map buttons for short screens.
- The controls change began as a UI-only update. The Android packaging workflow and offline SQLite dictionary steps are now documented in section 10; cloud/account gameplay is still not available in offline Android mode.

## 10. Android APK (landscape + offline)

This source now includes a Capacitor Android build workflow in `.github/workflows/android-apk.yml`. The workflow generates the native Android project on a hosted runner, sets the Activity to landscape, bundles Phaser and sql.js locally, downloads the full Skypedia English–Vietnamese SQLite database and attribution, runs the existing tests, then uploads a debug APK artifact. The downloaded 42 MB-class dictionary is a build input and is intentionally not committed to this source archive.

### Build and download the APK

1. Create a GitHub repository and upload the contents of this project ZIP to its `main` branch (keep the `.github/workflows` directory).
2. Open the repository's **Actions** tab and select **Build Word Ninja Android APK**. Choose **Run workflow** if it has not already run automatically after the push.
3. Open the completed run and download the artifact named `word-ninja-android-debug-apk`. Extract the artifact ZIP to get `app-debug.apk`, then transfer it to your Android device and install it. This is a debug APK for personal testing, not a Play Store release package.

The workflow needs network access to npm, Android SDK distribution servers, and the upstream dictionary repository. It fails explicitly if the dictionary database or attribution cannot be downloaded or validated.

### Offline behavior and scope

- Main game assets and Phaser are bundled into the APK. The Android Activity is forced to landscape.
- Player progress remains local on the device. Account/cloud login is hidden in native offline mode because the current account service requires the Node.js/PostgreSQL backend.
- The notebook can query the bundled SQLite dictionary offline. Database results are filtered so English-only glosses incorrectly marked as Vietnamese are not displayed as Vietnamese meanings. The game battle pool itself still begins with the existing reviewed game vocabulary bundled in `public/js/vocab*.js`; the 100,000+ dictionary headwords are exposed through notebook lookup and enrich meanings/IPA/examples, but they are not all automatically promoted to combat questions because the full dictionary does not contain the game's per-topic/CEFR review metadata.
- The dictionary is distributed under CC BY-SA 4.0. The build includes the upstream `ATTRIBUTION.md` inside the app assets and the existing `LICENSES-VOCABULARY.txt` in the source package. Preserve the attribution and share-alike terms for any redistribution.

### Local prerequisites

For a local Android Studio build, install Node.js 22, JDK 21, Android SDK Platform 35, and Android Build Tools 35.0.0. Then run:

```sh
npm install
npm run android:dictionary
npm run android:prepare
npx cap add android
npm run android:configure
npx cap sync android
cd android
./gradlew assembleDebug
```

On Windows, run `android\\gradlew.bat assembleDebug` from the `android` directory instead of `./gradlew assembleDebug`.
#   w o r d _ n i n j a  
 