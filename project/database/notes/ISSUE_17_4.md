# ISSUE_17_4.md — Danh sách lỗi tồn đọng

> Kiểm tra tổng hợp ngày: **2026-04-17** (cập nhật lần 2)  
> Đối chiếu với: `DATA_MODELS.md` (bản mẫu), `SYSTEM_OVERVIEW.md`, code thực tế trong `table/`, `procedure/`, `seed/`  
> Các lỗi đã được ghi trong `ISSUES.md` (2026-04-13) — file này **cập nhật trạng thái** và bổ sung lỗi mới phát hiện.

---

## Tóm tắt nhanh (TL;DR)

### Phần A — Sai lệch Code vs DATA_MODELS

| #   | Lỗi                                                                            | Mức độ      | Trạng thái         | Người xử lý |
| --- | ------------------------------------------------------------------------------ | ----------- | ------------------ | ----------- |
| 1   | `message` FK trỏ `accounts` không tồn tại                                      | 🔴 CRITICAL | **Chưa sửa**       | Thời        |
| 2   | `comment`/`message` dùng `BIGINT` cho ID thay vì `CHAR(36)`                    | 🔴 CRITICAL | **Chưa sửa**       | Thời        |
| 3   | `sp_comment_by_session` JOIN bảng `accounts` không tồn tại                     | 🔴 CRITICAL | **Chưa sửa**       | Thời        |
| 4   | `sp_get_tutor_requests` dùng `s.subject_name` sai tên cột                      | 🔴 CRITICAL | **Chưa sửa**       | Nhật        |
| 5   | `sp_cancel_session` dùng `DELETE` thay vì `UPDATE status`                      | 🟡 HIGH     | **Chưa sửa**       | Nhật        |
| 6   | `resource_subject` không FK đến `subjects`, lưu text tùy ý                     | 🟡 HIGH     | **Chưa sửa**       | Thời        |
| 7   | Tên cột `users` không khớp DATA_MODELS (`id`/`name` vs `userID`/`full_name`)   | 🟡 HIGH     | **Mới phát hiện**  | Nhóm        |
| 8   | Seed data: `message`/`comment` dùng integer ID, không khớp CHAR(36)            | 🟡 HIGH     | **Sửa một phần** ⚠ | Thời / Nhân |
| 9   | `session_participants` có cột `comment`/`rating` trùng lặp với bảng `comment`  | 🟢 LOW      | **Chưa sửa**       | Nhóm        |
| 10  | `students`/`tutors` DATA_MODELS thiếu khai báo nhiều cột thực tế               | 🟡 HIGH     | **Mới phát hiện**  | Nhóm        |
| 11  | `sessions.subject` lưu VARCHAR, không FK đến `Subjects` như model yêu cầu      | 🔴 CRITICAL | **Mới phát hiện**  | Nhân        |
| 12  | `sessions` tên cột không khớp DATA_MODELS (5 cột)                              | 🟡 HIGH     | **Mới phát hiện**  | Nhóm        |
| 13  | `resources`/`notifications`/`requests` PK dùng AUTO_INCREMENT thay vì char(36) | 🟡 HIGH     | **Mới phát hiện**  | Nhóm        |
| 14  | Study/Teach tách riêng trong model, code gộp thành `user_subjects`             | 🟢 LOW      | **Mới phát hiện**  | Nhóm        |
| 15  | Bảng `comment` tách riêng trong code, không có trong DATA_MODELS               | 🟢 LOW      | **Mới phát hiện**  | Nhóm        |

### Phần B — Chỉ tiêu còn thiếu so với SYSTEM_OVERVIEW

| #   | Thiếu                                                                          | Mức độ  | Trạng thái        | Người xử lý |
| --- | ------------------------------------------------------------------------------ | ------- | ----------------- | ----------- |
| 16  | `notifications` thiếu cột `session_id` (SYSTEM_OVERVIEW: "Gắn với 1 buổi học") | 🟡 HIGH | **Mới phát hiện** | Nhật        |
| 17  | Notification format không khớp SYSTEM_OVERVIEW (cả cancel & reschedule)        | 🟡 HIGH | **Mới phát hiện** | Nhật        |
| 18  | `sp_add_student_session` không kiểm tra sinh viên đã đăng ký môn phù hợp       | 🟡 HIGH | **Mới phát hiện** | Nhân        |
| 19  | `sp_add_comment` không kiểm tra session đã completed                           | 🟡 HIGH | **Mới phát hiện** | Thời        |
| 20  | Thiếu procedure cập nhật `summary`/`recording_url` sau khi hoàn thành session  | 🟡 HIGH | **Mới phát hiện** | Nhân        |
| 21  | Thiếu seed data cho `requests`, `notifications`, `resource_subject`            | 🟢 LOW  | **Mới phát hiện** | Nhóm        |

---

## PHẦN A — SAI LỆCH CODE VS DATA_MODELS

---

### Lỗi #1 — `message` FK trỏ bảng `accounts` không tồn tại

**Mức độ:** 🔴 CRITICAL — Không thể khởi tạo database  
**Trạng thái:** Chưa sửa  
**File:** `table/04_message.sql`

**Vấn đề:**  
`04_message.sql` khai báo khóa ngoại trỏ đến bảng `accounts(user_id)` — bảng này **không tồn tại** trong hệ thống. DATA_MODELS khai báo FK trỏ đến `Users.userID`. Bảng người dùng thực tế là `users` với PK là `id`.

```sql
-- Hiện tại (SAI):
CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES accounts(user_id)
CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES accounts(user_id)
```

**Cần sửa thành:**

```sql
CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id)
CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
```

---

### Lỗi #2 — Kiểu dữ liệu ID không nhất quán: `BIGINT` vs `CHAR(36)`

**Mức độ:** 🔴 CRITICAL — FK constraint sẽ fail khi tạo bảng  
**Trạng thái:** Chưa sửa  
**File:** `table/04_message.sql`, `table/05_comment.sql`, `procedure/sp_send_message.sql`, `procedure/sp_get_messages_between.sql`, `procedure/sp_mark_as_read.sql`, `procedure/sp_add_comment.sql`, `procedure/sp_comment_by_session.sql`

**Vấn đề:**  
DATA_MODELS quy định tất cả ID là `char(36)`. Toàn bộ code module Message và Comment (tác giả: Thời) dùng `BIGINT`.

| File                          | Cột sai kiểu                   | Kiểu thực tế | Kiểu đúng (theo model) |
| ----------------------------- | ------------------------------ | ------------ | ---------------------- |
| `04_message.sql`              | `sender_id`, `receiver_id`     | `BIGINT`     | `CHAR(36)`             |
| `05_comment.sql`              | `student_id`, `session_id`     | `BIGINT`     | `CHAR(36)`             |
| `sp_send_message.sql`         | `p_sender_id`, `p_receiver_id` | `BIGINT`     | `CHAR(36)`             |
| `sp_get_messages_between.sql` | `p_user_1`, `p_user_2`         | `BIGINT`     | `CHAR(36)`             |
| `sp_mark_as_read.sql`         | `p_sender_id`, `p_receiver_id` | `BIGINT`     | `CHAR(36)`             |
| `sp_add_comment.sql`          | `p_student_id`, `p_session_id` | `BIGINT`     | `CHAR(36)`             |
| `sp_comment_by_session.sql`   | `p_session_id`                 | `BIGINT`     | `CHAR(36)`             |

> **Lưu ý:** `message_id` và `resource_id` là `BIGINT AUTO_INCREMENT` — **giữ nguyên**, không sửa.

**Ngoài ra**, các procedure message cũng cần bỏ validation `<= 0` (vì CHAR(36) không so sánh số được):

```sql
-- SAI (sp_send_message.sql):
IF p_sender_id IS NULL OR p_sender_id <= 0 ...
-- ĐÚNG:
IF p_sender_id IS NULL OR CHAR_LENGTH(TRIM(p_sender_id)) = 0 ...
```

---

### Lỗi #3 — `sp_comment_by_session` JOIN bảng `accounts` không tồn tại

**Mức độ:** 🔴 CRITICAL — Procedure sẽ lỗi runtime  
**Trạng thái:** Chưa sửa  
**File:** `procedure/sp_comment_by_session.sql`

**Vấn đề:**  
Procedure JOIN vào bảng `accounts` để lấy `full_name` — bảng này không tồn tại. Ngoài ra tên cột cũng sai (`full_name` vs `name` trong bảng `users` thực tế).

```sql
-- Hiện tại (SAI):
JOIN students s ON s.student_id = c.student_id
JOIN accounts a ON a.user_id = s.user_id
...
a.full_name AS student_name
```

**Cần sửa thành:**

```sql
JOIN students s ON s.student_id = c.student_id
JOIN users u ON u.id = s.student_id
...
u.name AS student_name
```

---

### Lỗi #4 — `sp_get_tutor_requests` tham chiếu `s.subject_name` sai tên cột

**Mức độ:** 🔴 CRITICAL — Procedure sẽ lỗi runtime (Unknown column)  
**Trạng thái:** Chưa sửa  
**File:** `procedure/sp_get_tutor_requests.sql`

**Vấn đề:**  
Bảng `sessions` có cột tên là `subject` (VARCHAR 150), nhưng procedure SELECT `s.subject_name`.

```sql
-- Hiện tại (SAI):
SELECT r.*, s.subject_name
-- Cần sửa:
SELECT r.*, s.subject AS subject_name
```

---

### Lỗi #5 — `sp_cancel_session` dùng `DELETE` thay vì cập nhật `status`

**Mức độ:** 🟡 HIGH — Mất dữ liệu lịch sử, không nhất quán với luồng hệ thống  
**Trạng thái:** Chưa sửa  
**File:** `procedure/sp_cancel_session.sql`

**Vấn đề:**  
Procedure xóa cứng (`DELETE FROM sessions`) thay vì đổi `status = 'cancelled'`. DATA_MODELS khai báo cột `status` có giá trị `cancelled`.

- Xóa toàn bộ `session_participants` liên quan (dù đã gửi notification trước)
- Xóa `requests` liên quan do CASCADE
- Mâu thuẫn với logic của `sp_complete_session` (chỉ UPDATE status)

```sql
-- Hiện tại:
DELETE FROM sessions WHERE session_id = p_session_id;
-- Cần sửa:
UPDATE sessions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
WHERE session_id = p_session_id;
```

---

### Lỗi #6 — `resource_subject` không có FK đến `subjects`

**Mức độ:** 🟡 HIGH — Mất tính toàn vẹn tham chiếu  
**Trạng thái:** Chưa sửa  
**File:** `table/06_resource_subject.sql`

**Vấn đề:**  
DATA_MODELS (10.3) khai báo `resourceID` + `subjectID FK → Subjects.subjectID`.  
Code thực tế lưu `resource_id BIGINT` + `subject_name VARCHAR(100)` — không dùng FK đến `subjects`.

**Cần sửa:** Đổi `subject_name` → `subject_id CHAR(36)` và thêm FK `REFERENCES subjects(id)`.

---

### Lỗi #7 — `users` cột không khớp DATA_MODELS

**Mức độ:** 🟡 HIGH — Tên cột và cấu trúc khác model  
**Trạng thái:** Mới phát hiện  
**File:** `table/01_users.sql` vs `DATA_MODELS.md §1`

| Điểm         | DATA_MODELS          | Code thực tế               | Ghi chú                   |
| ------------ | -------------------- | -------------------------- | ------------------------- |
| PK           | `userID char(36)`    | `id CHAR(36)`              | Tên khác                  |
| Tên          | `full_name varchar`  | `name VARCHAR(100)`        | Tên khác                  |
| Khoa/Phòng   | `department varchar` | _(không có)_               | Code thiếu cột này        |
| Ảnh đại diện | _(không có)_         | `avatar VARCHAR(255)`      | Code có thêm, model thiếu |
| Timestamps   | _(không có)_         | `created_at`, `updated_at` | Code có thêm              |

**Quyết định cần:** Cập nhật DATA_MODELS cho khớp code, hoặc đổi code theo model. Vì `department` đã nằm ở bảng `students`/`tutors` trong code, nên `department` trong model `Users` có thể bỏ.

---

### Lỗi #8 — Seed data ID không khớp

**Mức độ:** 🟡 HIGH — Seed sẽ lỗi FK violation  
**Trạng thái:** ⚠ **Sửa một phần** — Session/Participants đã dùng UUID đúng; Message/Comment vẫn lỗi

| File                               | Trạng thái  | Chi tiết                                                                                 |
| ---------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `06_seed_sessions.sql`             | ✅ Đã sửa   | UUID `USER-TUTO-0000-0000-000000000001` khớp với `03_seed_users.sql`                     |
| `07_seed_session_participants.sql` | ✅ Đã sửa   | UUID `USER-STUD-...-000000000001/2` khớp với `03_seed_users.sql`                         |
| `05_message.sql`                   | ❌ Chưa sửa | Dùng integer `sender_id = 1, 49, 50…` — bảng `message` phải dùng CHAR(36) sau khi sửa #2 |
| `06_comment.sql`                   | ❌ Chưa sửa | Dùng integer `student_id = 3, 6, 9…` — bảng `comment` phải dùng CHAR(36) sau khi sửa #2  |

> Phụ thuộc vào #2: Sau khi sửa kiểu BIGINT → CHAR(36), seed message/comment phải viết lại hoàn toàn.

---

### Lỗi #9 — Trùng lặp logic `comment`/`rating` giữa `session_participants` và `comment`

**Mức độ:** 🟢 LOW — Không gây crash, nhưng gây nhầm lẫn  
**Trạng thái:** Chưa xử lý  
**File:** `table/06_session_participants.sql`

**Vấn đề:**  
`session_participants` có cột `comment TEXT` và `rating INT`, đồng thời bảng `comment` tách riêng cũng lưu cùng thông tin. Gây hai nguồn dữ liệu cho cùng một hành động.

**Liên quan:** Lỗi #15 (bảng `comment` không có trong DATA_MODELS).

---

### Lỗi #10 — `students`/`tutors` DATA_MODELS thiếu khai báo nhiều cột thực tế

**Mức độ:** 🟡 HIGH — Data model không phản ánh đúng cấu trúc thực  
**Trạng thái:** Mới phát hiện  
**File:** `docs/models/DATA_MODELS.md §2, §3` vs `table/03_students_tutors.sql`

**Vấn đề:**  
DATA_MODELS chỉ khai báo 2 cột cho mỗi bảng (PK + FK), nhưng code có nhiều hơn:

**Students:**

| Cột trong code  | Có trong DATA_MODELS? |
| --------------- | --------------------- |
| `student_id` PK | ✅ (là `studentID`)   |
| FK → `users.id` | ✅ (là `userID`)      |
| `mssv`          | ❌                    |
| `department`    | ❌                    |
| `year`          | ❌                    |
| `gpa`           | ❌                    |
| `support_needs` | ❌                    |

**Tutors:**

| Cột trong code   | Có trong DATA_MODELS? |
| ---------------- | --------------------- |
| `tutor_id` PK    | ✅ (là `tutorID`)     |
| FK → `users.id`  | ✅ (là `userID`)      |
| `tutor_code`     | ❌                    |
| `department`     | ❌                    |
| `rating`         | ❌                    |
| `total_sessions` | ❌                    |
| `expertise`      | ❌                    |

**Ngoài ra**, code dùng `student_id` vừa là PK vừa là FK (references `users.id` trực tiếp), không có cột `userID` riêng biệt như model. Tương tự cho `tutor_id`.

**Cần:** Cập nhật DATA_MODELS để khai báo đầy đủ các cột, và ghi rõ cơ chế FK (PK = FK shared key).

---

### Lỗi #11 — `sessions.subject` lưu VARCHAR, không FK đến Subjects

**Mức độ:** 🔴 CRITICAL — Mất tính toàn vẹn; DATA_MODELS yêu cầu FK  
**Trạng thái:** Mới phát hiện  
**File:** `table/05_sessions.sql` vs `DATA_MODELS.md §6`

**Vấn đề:**  
DATA_MODELS khai báo `subjectID char(36) FK2 → Subjects.subjectID`. Code lưu `subject VARCHAR(150)` (tên môn học dạng text, không FK).

```sql
-- Code hiện tại:
subject VARCHAR(150) NOT NULL COMMENT 'Tên môn học (lưu trực tiếp)'
-- DATA_MODELS yêu cầu:
subjectID char(36) FK2  -- FK → Subjects.subjectID
```

**Hệ quả:**

- Tên môn có thể không khớp với bảng `subjects`
- `sp_create_session` nhận `p_subject VARCHAR` thay vì ID → procedure cũng cần sửa
- `sp_filter_sessions` lọc bằng text matching thay vì ID so sánh

**Cần:** Đổi `subject VARCHAR` → `subject_id CHAR(36)` + FK đến `subjects(id)`, hoặc cập nhật DATA_MODELS bỏ FK cho sessions.

---

### Lỗi #12 — `sessions` tên cột không khớp DATA_MODELS (5 cột)

**Mức độ:** 🟡 HIGH — Gây nhầm lẫn khi code và tài liệu không nhất quán  
**Trạng thái:** Mới phát hiện  
**File:** `table/05_sessions.sql` vs `DATA_MODELS.md §6`

| DATA_MODELS   | Code thực tế    | Ghi chú           |
| ------------- | --------------- | ----------------- |
| `record_url`  | `recording_url` | Tên khác          |
| `meeting_url` | `meeting_link`  | Tên khác          |
| `room`        | `location`      | Tên khác          |
| `max_student` | `max_students`  | Số ít vs số nhiều |
| `note`        | `notes`         | Số ít vs số nhiều |

**Cần:** Nhóm thống nhất 1 bộ tên cột (ưu tiên theo code vì đã deploy), cập nhật DATA_MODELS.

---

### Lỗi #13 — `resources`/`notifications`/`requests` PK dùng AUTO_INCREMENT thay vì char(36)

**Mức độ:** 🟡 HIGH — PK type khác DATA_MODELS  
**Trạng thái:** Mới phát hiện  
**File:** `table/03_resources.sql`, `table/08_notifications.sql`, `table/07_requests.sql`

DATA_MODELS quy định tất cả PK là `char(36)` (UUID). Code thực tế dùng AUTO_INCREMENT:

| Bảng            | DATA_MODELS PK            | Code PK                  |
| --------------- | ------------------------- | ------------------------ |
| `resources`     | `resourceID char(36)`     | `resource_id BIGINT AI`  |
| `notifications` | `notificationID char(36)` | `notification_id INT AI` |
| `requests`      | `requestID char(36)`      | `request_id INT AI`      |

**Quyết định cần:** Đổi code sang UUID, hoặc cập nhật DATA_MODELS chấp nhận AUTO_INCREMENT cho các bảng này.

---

### Lỗi #14 — Study/Teach tách riêng trong model, code gộp thành `user_subjects`

**Mức độ:** 🟢 LOW — Thiết kế khác nhưng logic tương đương  
**Trạng thái:** Mới phát hiện  
**File:** `table/04_user_subjects.sql` vs `DATA_MODELS.md §10.1, §10.2`

**Vấn đề:**  
DATA_MODELS khai báo 2 bảng riêng biệt:

- **10.1 Study**: `studentID PK,FK1 → Students` + `subjectID PK,FK2 → Subjects`
- **10.2 Teach**: `tutorID PK,FK1 → Tutors` + `subjectID PK,FK2 → Subjects`

Code gộp thành bảng **`user_subjects`** duy nhất: `user_id FK → users.id` + `subject_id FK → subjects.id`.

**Ưu điểm code:** Đơn giản hơn, 1 bảng thay vì 2.  
**Nhược điểm code:** FK trỏ `users` chung, không phân biệt student/tutor. Cần filter thêm bằng `users.role`.

**Cần:** Cập nhật DATA_MODELS để phản ánh thiết kế gộp `user_subjects`, hoặc nhóm quyết định tách.

---

### Lỗi #15 — Bảng `comment` tách riêng trong code, không có trong DATA_MODELS

**Mức độ:** 🟢 LOW — Bảng tồn tại nhưng model không khai báo  
**Trạng thái:** Mới phát hiện  
**File:** `table/05_comment.sql` vs `DATA_MODELS.md §10.4`

**Vấn đề:**  
DATA_MODELS đặt `comment` + `rating` trong bảng **Session_Participants** (§10.4). Code tách thành bảng **`comment`** riêng (tác giả: Thời) với PK `(student_id, session_id)`.

Hiện tại cả 2 bảng `session_participants` VÀ `comment` đều có cột comment + rating → trùng lặp (#9).

**Cần:** Nếu giữ bảng `comment` tách riêng, DATA_MODELS cần bổ sung bảng này và xóa cột comment/rating khỏi Session_Participants.

---

## PHẦN B — CHỈ TIÊU CÒN THIẾU SO VỚI SYSTEM_OVERVIEW

---

### Lỗi #16 — `notifications` thiếu cột `session_id`

**Mức độ:** 🟡 HIGH — Không đáp ứng yêu cầu "Gắn với 1 buổi học"  
**Trạng thái:** Mới phát hiện  
**File:** `table/08_notifications.sql`  
**Tham chiếu:** SYSTEM_OVERVIEW §9

**Vấn đề:**  
SYSTEM*OVERVIEW §9 ghi rõ: *"Một thông báo: Gắn với **1 buổi học**"\_.  
Bảng `notifications` hiện tại KHÔNG có cột `session_id`. Không thể truy vết notification thuộc buổi học nào.

**Cần sửa:**

```sql
ALTER TABLE notifications ADD COLUMN session_id CHAR(36) NULL;
ALTER TABLE notifications ADD CONSTRAINT fk_notif_session
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL;
```

Đồng thời cập nhật `sp_cancel_session` và `sp_update_session_time` để insert thêm `session_id`.

---

### Lỗi #17 — Notification format không khớp SYSTEM_OVERVIEW

**Mức độ:** 🟡 HIGH — Nội dung thông báo thiếu thông tin cần thiết  
**Trạng thái:** Mới phát hiện  
**File:** `procedure/sp_cancel_session.sql`, `procedure/sp_update_session_time.sql`  
**Tham chiếu:** SYSTEM_OVERVIEW §9

**SYSTEM_OVERVIEW yêu cầu:**

| Loại     | Format yêu cầu                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Đổi lịch | `Lịch học môn <tên môn học> (<mã buổi học>) đã chuyển sang <ngày mới> từ <giờ bắt đầu mới> đến <giờ kết thúc mới>` |
| Hủy lịch | `Lịch học môn <tên môn học> (<mã buổi học>) đã bị hủy`                                                             |

**Code hiện tại:**

| Procedure                | Nội dung notification hiện tại                                                        | Thiếu gì                              |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------- |
| `sp_update_session_time` | `'Buổi học của bạn đã được dời sang ngày ' + p_new_date + ' lúc ' + p_new_start_time` | Thiếu: tên môn, mã buổi, giờ kết thúc |
| `sp_cancel_session`      | `'Một buổi học của bạn đã bị gia sư hủy.'`                                            | Thiếu: tên môn, mã buổi               |

**Cần sửa `sp_cancel_session`:**

```sql
INSERT INTO notifications (receiver_id, content, type)
SELECT sp.student_id,
       CONCAT('Lịch học môn ', s.subject, ' (', s.session_id, ') đã bị hủy'),
       'cancel-notification'
FROM session_participants sp
JOIN sessions s ON s.session_id = sp.session_id
WHERE sp.session_id = p_session_id;
```

**Cần sửa `sp_update_session_time`:**

```sql
INSERT INTO notifications (receiver_id, content, type)
SELECT sp.student_id,
       CONCAT('Lịch học môn ', s.subject, ' (', s.session_id, ') đã chuyển sang ',
              p_new_date, ' từ ', p_new_start_time, ' đến ', p_new_end_time),
       'reschedule-notification'
FROM session_participants sp
JOIN sessions s ON s.session_id = sp.session_id
WHERE sp.session_id = p_session_id;
```

---

### Lỗi #18 — `sp_add_student_session` không kiểm tra môn học sinh viên

**Mức độ:** 🟡 HIGH — Không đáp ứng ràng buộc nghiệp vụ SYSTEM_OVERVIEW  
**Trạng thái:** Mới phát hiện  
**File:** `procedure/sp_add_student_session.sql`  
**Tham chiếu:** SYSTEM_OVERVIEW §5

**SYSTEM_OVERVIEW §5 ghi:**  
_"Sinh viên có thể tham gia buổi học nếu: **Môn học của buổi học nằm trong danh sách môn muốn học** của sinh viên."_

**Code hiện tại:** Chỉ kiểm tra:

- Session tồn tại ✅
- Student tồn tại ✅
- Session status = 'open' ✅
- Chưa join trùng ✅
- Chưa full ✅
- **Không kiểm tra môn học khớp** ❌

**Cần thêm validation** (giả sử session lưu subject FK hoặc dùng text matching):

```sql
-- Nếu sessions có subject_id FK:
IF NOT EXISTS (
    SELECT 1 FROM user_subjects us
    JOIN sessions s ON s.subject_id = us.subject_id
    WHERE us.user_id = p_student_id AND s.session_id = p_session_id
) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student has not registered for this subject';
END IF;
```

---

### Lỗi #19 — `sp_add_comment` không kiểm tra session đã completed

**Mức độ:** 🟡 HIGH — Cho phép đánh giá buổi học chưa hoàn thành  
**Trạng thái:** Mới phát hiện  
**File:** `procedure/sp_add_comment.sql`  
**Tham chiếu:** SYSTEM_OVERVIEW §5

**SYSTEM_OVERVIEW §5 ghi:**  
_"**Sau khi buổi học hoàn thành**, sinh viên có thể: Đánh giá buổi học (1–5 sao). Bình luận về buổi học."_

**Code hiện tại:** `sp_add_comment` chỉ kiểm tra `student_id`, `session_id`, `comment`, `rating` hợp lệ. **Không kiểm tra session đã completed.**

**Cần thêm:**

```sql
DECLARE v_status VARCHAR(20);
SELECT status INTO v_status FROM sessions WHERE session_id = p_session_id;
IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
END IF;
IF v_status <> 'completed' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot comment on a session that is not completed';
END IF;
```

---

### Lỗi #20 — Thiếu procedure cập nhật summary/recording_url

**Mức độ:** 🟡 HIGH — Gia sư không thể ghi tóm tắt/link record qua procedure  
**Trạng thái:** Mới phát hiện  
**File:** Không tồn tại  
**Tham chiếu:** SYSTEM_OVERVIEW §4

**SYSTEM_OVERVIEW §4 ghi:**

| Thời điểm          | Hành động                           |
| ------------------ | ----------------------------------- |
| Sau khi hoàn thành | Ghi tóm tắt buổi học và link record |

`sp_complete_session` chỉ `UPDATE status = 'completed'` — **không nhận `summary` hay `recording_url`**.

**Cần tạo mới** `sp_update_session_summary`:

```sql
CREATE PROCEDURE sp_update_session_summary(
    IN p_session_id CHAR(36),
    IN p_summary TEXT,
    IN p_recording_url VARCHAR(512)
)
BEGIN
    UPDATE sessions
    SET summary = p_summary, recording_url = p_recording_url, updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id AND status = 'completed';
END;
```

Hoặc mở rộng `sp_complete_session` để nhận thêm 2 tham số.

---

### Lỗi #21 — Thiếu seed data cho `requests`, `notifications`, `resource_subject`

**Mức độ:** 🟢 LOW — Không ảnh hưởng runtime, chỉ thiếu dữ liệu mẫu  
**Trạng thái:** Mới phát hiện  
**File:** `seed/` (thiếu file)

**Các bảng chưa có seed data:**

| Bảng               | Có seed? | Ghi chú                                                                       |
| ------------------ | -------- | ----------------------------------------------------------------------------- |
| `requests`         | ❌       | Cần để test `sp_accept_request`, `sp_reject_request`, `sp_get_tutor_requests` |
| `notifications`    | ❌       | Tự tạo qua procedure nhưng cần data ban đầu                                   |
| `resource_subject` | ❌       | `04_library.sql` chỉ insert `resource`, không insert `resource_subject`       |

---

## PHẦN C — TỔNG HỢP SO SÁNH PROCEDURES VS SYSTEM_OVERVIEW

### Nhiệm vụ 2 — Tài khoản, SV, Gia sư, Môn học

| #   | Yêu cầu               | Procedure                                        | Trạng thái |
| --- | --------------------- | ------------------------------------------------ | ---------- |
| 1   | Đăng ký người dùng    | `sp_register_user`                               | ✅ OK      |
| 2   | Login                 | `sp_login`                                       | ✅ OK      |
| 3   | Lấy thông tin SV/GS   | `sp_get_user_info`                               | ✅ OK      |
| 4   | Cập nhật thông tin    | `sp_update_user_profile`                         | ✅ OK      |
| 5   | Lấy danh sách môn học | `sp_get_user_subjects`                           | ✅ OK      |
| 6   | Cập nhật môn học      | `sp_add_user_subject` + `sp_remove_user_subject` | ✅ OK      |
| 7   | Lấy tất cả sinh viên  | `sp_get_all_students`                            | ✅ OK      |
| 8   | Lấy tất cả gia sư     | `sp_get_all_tutors`                              | ✅ OK      |

### Nhiệm vụ 3 — Session phần 1

| #   | Yêu cầu                  | Procedure                   | Trạng thái                      |
| --- | ------------------------ | --------------------------- | ------------------------------- |
| 1   | Tạo session (no overlap) | `sp_create_session`         | ✅ OK                           |
| 2   | Hoàn thành session       | `sp_complete_session`       | ⚠ Thiếu summary/recording (#20) |
| 3   | Lọc session              | `sp_filter_sessions`        | ✅ OK                           |
| 4   | Thêm SV vào session      | `sp_add_student_session`    | ⚠ Thiếu check môn (#18)         |
| 5   | Bỏ SV khỏi session       | `sp_remove_student_session` | ✅ OK                           |

### Nhiệm vụ 4 — Session phần 2

| #   | Yêu cầu                           | Procedure                   | Trạng thái                                     |
| --- | --------------------------------- | --------------------------- | ---------------------------------------------- |
| 1   | Cập nhật thời gian + notification | `sp_update_session_time`    | ⚠ Sai format notification (#17)                |
| 2   | Hủy session + notification        | `sp_cancel_session`         | ⚠ DELETE thay vì UPDATE (#5), sai format (#17) |
| 3   | Tạo request                       | `sp_create_request`         | ✅ OK                                          |
| 4   | Chấp nhận request                 | `sp_accept_request`         | ✅ OK                                          |
| 5   | Từ chối request                   | `sp_reject_request`         | ✅ OK                                          |
| 6   | Lấy request của gia sư            | `sp_get_tutor_requests`     | ⚠ Sai tên cột (#4)                             |
| 7   | Lấy notification của user         | `sp_get_user_notifications` | ✅ OK                                          |

### Nhiệm vụ 5 — Library, Message, Comment

| #   | Yêu cầu                  | Procedure                                | Trạng thái                                        |
| --- | ------------------------ | ---------------------------------------- | ------------------------------------------------- |
| 1   | Lấy tất cả tài liệu      | `sp_get_all_documents`                   | ✅ OK                                             |
| 2   | Lọc tài liệu title/type  | `sp_get_documents_by_filter`             | ✅ OK                                             |
| 3   | Thêm/xóa tài liệu        | `sp_add_document` + `sp_delete_document` | ✅ OK                                             |
| 4   | Lấy tin nhắn giữa 2 user | `sp_get_messages_between`                | ⚠ BIGINT params (#2)                              |
| 5   | Gửi tin nhắn             | `sp_send_message`                        | ⚠ BIGINT params (#2)                              |
| 6   | Đánh dấu đọc tin nhắn    | `sp_mark_as_read`                        | ⚠ BIGINT params (#2)                              |
| 7   | SV đánh giá buổi học     | `sp_add_comment`                         | ⚠ BIGINT params (#2), thiếu check completed (#19) |
| 8   | Lấy đánh giá của 1 buổi  | `sp_comment_by_session`                  | ⚠ BIGINT (#2), JOIN accounts (#3)                 |

---

## Trạng thái theo người xử lý

### Thời cần sửa

- [ ] `#1` — Sửa FK `accounts(user_id)` → `users(id)` trong `04_message.sql`
- [ ] `#2` — Đổi `BIGINT` → `CHAR(36)` cho tất cả ID FK trong `message`, `comment` và 5 procedures liên quan
- [ ] `#3` — Sửa JOIN `accounts` → `users`, `full_name` → `name` trong `sp_comment_by_session.sql`
- [ ] `#6` — Sửa `resource_subject` dùng FK `subject_id` đến `subjects` thay vì lưu text
- [ ] `#8` — Viết lại `05_message.sql` và `06_comment.sql` seed với UUID (sau khi xong #2)
- [ ] `#19` — Thêm check session completed vào `sp_add_comment`

### Nhật cần sửa

- [ ] `#4` — Sửa `s.subject_name` → `s.subject` trong `sp_get_tutor_requests.sql`
- [ ] `#5` — Sửa `sp_cancel_session.sql` dùng `UPDATE status = 'cancelled'`
- [ ] `#16` — Thêm cột `session_id` vào bảng `notifications` + cập nhật procedures insert notification
- [ ] `#17` — Sửa notification format trong `sp_cancel_session` và `sp_update_session_time` theo SYSTEM_OVERVIEW

### Nhân cần sửa

- [ ] `#11` — Quyết định: sessions dùng FK `subject_id` hay giữ VARCHAR `subject`; sửa procedure liên quan
- [ ] `#18` — Thêm kiểm tra môn học phù hợp trong `sp_add_student_session`
- [ ] `#20` — Tạo procedure `sp_update_session_summary` hoặc mở rộng `sp_complete_session`

### Cả nhóm cần thống nhất

- [ ] `#7` + `#10` + `#12` + `#13` — Cập nhật `DATA_MODELS.md` cho khớp code: tên cột, PK type, cấu trúc students/tutors
- [ ] `#9` + `#15` — Quyết định: giữ bảng `comment` riêng hay dùng `session_participants` → cập nhật model
- [ ] `#14` — Quyết định: giữ `user_subjects` gộp hay tách Study/Teach → cập nhật model
- [ ] `#21` — Bổ sung seed data cho `requests`, `notifications`, `resource_subject`
