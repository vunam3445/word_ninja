# Word Ninja — báo cáo sửa pipeline từ vựng Anh–Việt

## Kết quả đã thực hiện trong mã nguồn

- Loại bỏ việc server tự seed/ghi đè `wn_vocab` bằng gloss từ `public/js/vocab*.js` và `vocab-curated-overrides.json` khi khởi động.
- `vocab-curated-overrides.json` chỉ được dùng làm gợi ý chọn sense nếu gloss khớp chính xác dữ liệu SQLite của đúng headword; nội dung override không bao giờ được ghi vào `meaning_vi`.
- Truy vấn SQLite trả cả headword, `dictionary_word_id`, `dictionary_sense_id`, POS, gloss và ví dụ. Pipeline lọc lại theo khóa tiếng Anh chuẩn hóa; các sense được giữ trong cùng `dictionary_word_id`, không ghép theo vị trí dòng/mảng.
- Oxford 3000 chỉ cung cấp danh sách từ và CEFR. Nếu không tìm được gloss nguồn hợp lệ, nghĩa được để trống và từ không được đưa vào câu hỏi chiến đấu.
- Từ đa nghĩa giữ các gloss SQLite thuộc cùng mục từ. Sense thông dụng rõ ràng có thể được dùng làm nghĩa chính; nếu các gloss khác nhau có điểm gần ngang nhau, từ được đưa vào hàng chờ duyệt thủ công.
- PostgreSQL lưu nguồn, headword/sense ID, danh sách sense, POS, CEFR và cờ duyệt. `/api/vocab` và câu hỏi chiến đấu chỉ dùng bản ghi đủ provenance; sổ tay và chiến đấu lấy từ cùng danh sách API.
- Import có chế độ `--dry-run`, backup bền vững của riêng `wn_vocab` và transaction cho batch cập nhật. Có script khôi phục chỉ bảng `wn_vocab`; không xóa tài khoản, nhân vật, save, tiến trình học, combat session, trang bị hoặc các bảng khác.
- `audit:vocab` tạo CSV và JSON, đối chiếu nghĩa hiện tại với nghĩa SQLite, và phát hiện lệch nghĩa, headword/sense ID, POS, CEFR, nguồn, trạng thái battle-ready và cờ duyệt thủ công.

## Kiểm thử trong môi trường thực hiện sửa mã

- `npm test`: **24/24 test thành công** sau khi tích hợp hoạt ảnh kỹ năng.
- `npm run check`: **37 tệp JavaScript qua kiểm tra cú pháp**.
- Bộ fixture SQLite kiểm tra cụ thể `mum` không nhận gloss của `mute`; `person` ưu tiên nghĩa danh từ thông dụng thay vì nghĩa ngữ pháp “ngôi”; `the` không lấy nghĩa của `port`; sense trùng headword nhưng khác `dictionary_word_id` không bị trộn; hint không thể tự tạo nghĩa; dữ liệu word/translation/POS/CEFR/sense ID qua import plan, database mapper, API và UI; audit nhận diện lệch sense ID, POS và CEFR.

## Số bản ghi PostgreSQL thực tế

**Chưa có số liệu thực tế trong gói này.** ZIP không chứa `data/dictionary_en_vi.db`, cache Oxford `data/oxford-3000-cefr.json` hoặc `.env`/quyền kết nối PostgreSQL. Do vậy chưa thể chạy import thật, xuất báo cáo đối soát thật hoặc khẳng định số bản ghi DB đã sửa/số cần duyệt; các con số này không được ước lượng từ fixture test.

Sau khi giải nén trên máy có nguồn SQLite và kết nối PostgreSQL, chạy tại thư mục dự án:

```powershell
npm run import:vocab -- --dry-run
npm run import:vocab
npm run audit:vocab
npm test
npm run check
```

`import:vocab` in ra số bản ghi chèn mới, số bản ghi cập nhật, số nghĩa thay đổi/xóa, số bản ghi cần duyệt và tên bảng backup. `audit:vocab` ghi CSV/JSON trong `reports/`, kèm tổng số và phân loại trạng thái. Để rollback, sử dụng đúng tên backup được importer in ra:

```powershell
npm run restore:vocab -- --backup=wn_vocab_backup_YYYYMMDDhhmmss_xxxxxx
```


## Tích hợp hoạt ảnh kỹ năng từ bản frontend tham chiếu

- Chuyển hệ VFX từ `js/world.js` của bản frontend tham chiếu sang `public/js/world.js` của bản fullstack, gồm các mảnh hiệu ứng (đường chém, bán nguyệt, vòng, vụ nổ, bóng phân thân), nhát thường/kỹ năng, nhiều nhịp, linh đạn, ám khí, lưỡi liềm, xoáy, tối thượng, cùng hoạt ảnh buff và trạng thái: hộ thể, đỡ đòn, trói, linh trận, tĩnh tâm, né tránh, lướt, liên hoàn, tích lực, chí mạng, độc, khiên và đòn đánh nối tiếp.
- Nối `public/js/battle.js` với phản hồi trận đấu authoritative: chỉ dùng sát thương, chí mạng, tag và metadata kỹ năng trả về từ server để chọn/hiển thị hoạt ảnh; không chuyển phép tính sát thương trở lại frontend.
- Giữ lại các hàm vòng đời, gọi quái phụ, quái chết và hiệu ứng chiến đấu của bản fullstack; thêm dọn dẹp VFX trạng thái khi scene shutdown, và cho phép hiệu ứng của nhát cuối hoàn tất khi quái chuyển sang trạng thái chết.
- Sửa bộ đếm `charge`: câu kích hoạt được tính là nhịp đúng thứ nhất, để kỹ năng `a25` hoàn thành ở câu đúng thứ ba như mô tả “10 nhát”. Không thay đổi hệ số sát thương do server tính.
- Bổ sung test pipeline animation và test tích hợp server xác minh kỹ năng `a25` phát tag hoàn thành đúng ở câu thứ ba.
- Đối chiếu tĩnh xác nhận **47/47 phương thức hoạt ảnh liên quan** từ bản tham chiếu đều có mặt trong `public/js/world.js` sau hợp nhất.

Các giới hạn kiểm thử: đã chạy test Node và kiểm tra cú pháp; chưa thực hiện visual smoke test trong trình duyệt/Phaser ở runtime này, nên hiệu ứng cần được xác nhận thêm trong một trận game thực tế (đặc biệt màn hình nhỏ và `prefers-reduced-motion`).
