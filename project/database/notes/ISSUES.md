# Danh sách vấn đề cần giải quyết

> Phân tích tổng hợp từ: table/, procedure/, seed/, test/ so với DATA_MODELS.md và SYSTEM_OVERVIEW.md  
> Ngày kiểm tra: 2026-04-13

---

## 1. Xung đột tên bảng — `accounts` vs `users`

**Mức độ: CRITICAL — Sẽ lỗi runtime**

Nhật đặt tên bảng gốc là `users` (cột PK: `id CHAR(36)`).  
Thời viết code tham chiếu đến bảng `accounts` (cột PK được gọi là `user_id`) — bảng này **không tồn tại**.

| File vi phạm                | Dòng sai                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `04_message.sql`            | `REFERENCES accounts(user_id)` → phải là `REFERENCES users(id)`                            |
| `sp_comment_by_session.sql` | `JOIN accounts a ON a.user_id = s.user_id` → phải là `JOIN users u ON u.id = s.student_id` |

**Giải pháp:** Thời sửa tất cả tham chiếu `accounts` → `users`, `user_id` → `id`.

---

## 2. Xung đột tên cột PK của bảng `students` và `tutors`

**Mức độ: CRITICAL — Sẽ lỗi runtime**

Nhật tạo bảng với PK là `student_id` / `tutor_id`.  
Nhan viết procedure và tạo FK với giả định cột là `user_id`.

| File vi phạm                  | Dòng sai                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `05_sessions.sql`             | `REFERENCES tutors(user_id)` → phải là `REFERENCES tutors(tutor_id)`                             |
| `06_session_participants.sql` | `REFERENCES students(user_id)` → phải là `REFERENCES students(student_id)`                       |
| `sp_create_session.sql`       | `WHERE user_id = p_tutor_id` trong bảng `tutors` → phải là `WHERE tutor_id = p_tutor_id`         |
| `sp_add_student_session.sql`  | `WHERE user_id = p_student_id` trong bảng `students` → phải là `WHERE student_id = p_student_id` |

**Giải pháp:** Nhan sửa các FK và WHERE clause để dùng đúng tên cột `student_id` / `tutor_id`.

---

## 3. Kiểu dữ liệu ID không nhất quán — `CHAR(36)` vs `BIGINT`

**Mức độ: CRITICAL — FK sẽ fail do kiểu không khớp**

| Bảng       | Cột                        | Kiểu thực tế | Kiểu tham chiếu tại FK |
| ---------- | -------------------------- | ------------ | ---------------------- |
| `users`    | `id`                       | `CHAR(36)`   | —                      |
| `students` | `student_id`               | `CHAR(36)`   | —                      |
| `sessions` | `session_id`               | `CHAR(36)`   | —                      |
| `message`  | `sender_id`, `receiver_id` | `BIGINT`     | Nên là `CHAR(36)`      |
| `comment`  | `student_id`, `session_id` | `BIGINT`     | Nên là `CHAR(36)`      |

Toàn bộ code của Thời (`04_message.sql`, `05_comment.sql`, `sp_send_message.sql`, `sp_get_messages_between.sql`, `sp_mark_as_read.sql`, `sp_add_comment.sql`, `sp_comment_by_session.sql`) dùng `BIGINT` cho các ID liên quan đến `users`, `students`, `sessions`.

**Giải pháp:** Thời sửa toàn bộ `BIGINT` → `CHAR(36)` cho các cột ID là FK đến `users`/`students`/`sessions`. `message_id` và `resource_id` AUTO_INCREMENT giữ nguyên `BIGINT`.

---

## 4. Seed data của Nhan không khớp với seed data của Nhật/Thời

**Mức độ: HIGH — Seed sẽ không insert được do FK violation**

- `06_seed_sessions.sql`: Dùng `tutor_id = '55555555-5555-5555-5555-555555555555'` — UUID này không tồn tại trong `03_seed_users.sql`.  
  UUID tutor thực tế là `'USER-TUTO-0000-0000-000000000001'`.
- `07_seed_session_participants.sql`: Dùng `student_id = '11111111-...'`, `'22222222-...'`, ... — không khớp với seed students.  
  UUID student thực tế là `'USER-STUD-0000-0000-000000000001'`.

- `05_message.sql`: Dùng integer ID (1, 49, 50...) cho `sender_id`/`receiver_id` — không khớp với UUID (CHAR(36)) của bảng `users`.
- `06_comment.sql`: Tương tự, dùng integer (3, 6, 9...) cho `student_id` và `session_id`.

**Giải pháp:**

- Nhan cập nhật lại UUID trong `06_seed_sessions.sql` và `07_seed_session_participants.sql` để khớp với seed của Nhật.
- Thời cập nhật seed message và comment khi kiểu ID đã được đồng bộ về CHAR(36).

---

## 5. Thiếu bảng `Requests` và `Notifications` (Nhiệm vụ 4)

**Mức độ: HIGH — Chưa implement**

Theo SYSTEM_OVERVIEW.md, nhiệm vụ 4 cần:

- Bảng `Requests` (yêu cầu đổi lịch của sinh viên)
- Bảng `Notifications` (thông báo tự động khi gia sư đổi/hủy lịch)

Cả hai bảng đều **chưa có file SQL nào** trong `table/`.

**Procedures cũng thiếu:**
| # | Chức năng | Trạng thái |
|---|---|---|
| 1 | Cập nhật thời gian session + tạo Notification | Chưa có |
| 2 | Hủy session + tạo Notification | Chưa có |
| 3 | Tạo Request dời session | Chưa có |
| 4 | Chấp nhận Request | Chưa có |
| 5 | Từ chối Request | Chưa có |
| 6 | Lấy danh sách Request của gia sư | Chưa có |
| 7 | Lấy danh sách Notification của user | Chưa có |

**Giải pháp:** Cần tạo file `07_requests.sql`, `08_notifications.sql` trong `table/` và các stored procedure tương ứng.

---

## 6. Bảng `resource_subject` không dùng FK đến `subjects`

**Mức độ: MEDIUM — Mất tính toàn vẹn dữ liệu**

`06_resource_subject.sql` lưu `subject_name VARCHAR(100)` thay vì `subject_id CHAR(36)` FK đến bảng `subjects`.  
→ Có thể insert tên môn học tùy ý, không kiểm tra xem môn đó có tồn tại không.

**Giải pháp:** Thêm cột `subject_id CHAR(36)` và FK `REFERENCES subjects(id)`.

---

## 7. `session_participants` thiếu cột `comment` và `rating` so với model

**Mức độ: MEDIUM — Model và implementation khác nhau**

Data model định nghĩa bảng `Joins` có cột `comment` và `rating`.  
Thực tế Nhật/Nhan tách ra bảng riêng: `session_participants` (chỉ có enrollment) + `comment` (có comment + rating).

Cách tách này hợp lý hơn (1 SV có thể join nhưng chưa rate), nhưng cần **cập nhật DATA_MODELS.md** để phản ánh đúng thiết kế.

---

## 8. `05_sessions.sql` thiếu `USE dbms_project`

**Mức độ: LOW — Có thể gây lỗi nếu chạy độc lập**

File `05_sessions.sql` không có `USE dbms_project;` ở đầu file.

---

## 9. `sp_remove_student_session.sql` có `DELIMITER ;` bị lặp hai lần

**Mức độ: LOW — Không ảnh hưởng logic nhưng nên sửa**

```sql
DELIMITER ;

DELIMITER ;   -- dư dòng này
```

---

## Tóm tắt theo người cần xử lý

| Người                    | Việc cần làm                                                                                                                                                                                                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thời**                 | Sửa `accounts` → `users`, `user_id` → `id`; Sửa kiểu BIGINT → CHAR(36) cho sender/receiver/student/session IDs; Cập nhật seed message và comment                                                                                                                                                                                          |
| **Nhan**                 | Sửa FK trong `05_sessions.sql` và `06_session_participants.sql` (`user_id` → `tutor_id`/`student_id`); Sửa WHERE trong `sp_create_session.sql` và `sp_add_student_session.sql`; Cập nhật UUID trong seed sessions và participants; Thêm `USE dbms_project` vào `05_sessions.sql`; Fix DELIMITER lặp trong `sp_remove_student_session.sql` |
| **Cả nhóm (Nhiệm vụ 4)** | Tạo bảng `Requests`, `Notifications` và toàn bộ procedures liên quan                                                                                                                                                                                                                                                                      |
| **Thời**                 | Sửa `resource_subject` để dùng FK đến `subjects` thay vì lưu text                                                                                                                                                                                                                                                                         |
| **Nhóm**                 | Cập nhật DATA_MODELS.md: phản ánh tách `Joins` → `session_participants` + `comment`; đổi tên `Accounts` → `users` cho đúng với thực tế                                                                                                                                                                                                    |
