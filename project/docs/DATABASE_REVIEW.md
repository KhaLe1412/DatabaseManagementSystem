# Database Review — Tables, Procedures, Seeds

> Ngày kiểm tra: 2026-04-12  
> Phạm vi: `project/database/table/`, `project/database/procedure/`, `project/database/seed/`

---

## 1. Tổng quan cấu trúc

### 1.1 Bảng dữ liệu (`table/`)

| File                      | Bảng tạo ra                   | PK type                                 | Ghi chú                        |
| ------------------------- | ----------------------------- | --------------------------------------- | ------------------------------ |
| `01_users.sql`            | `users`                       | `CHAR(36)` (UUID)                       | Bảng gốc cho tất cả người dùng |
| `02_subjects.sql`         | `subjects`                    | `CHAR(36)` (UUID)                       | Danh mục môn học               |
| `03_resources.sql`        | `resource` + view `resources` | `BIGINT AUTO_INCREMENT`                 | Tài nguyên thư viện            |
| `03_students_tutors.sql`  | `students`, `tutors`          | `CHAR(36)` — FK → `users(id)`           | Profile chi tiết               |
| `04_message.sql`          | `message`                     | `BIGINT AUTO_INCREMENT`                 | Tin nhắn giữa người dùng       |
| `04_user_subjects.sql`    | `user_subjects`               | `(user_id, subject_id)` composite       | Môn học của user               |
| `05_comment.sql`          | `comment`                     | `(student_id, session_id)` composite    | Đánh giá buổi học              |
| `06_resource_subject.sql` | `resource_subject`            | `(resource_id, subject_name)` composite | Liên kết tài nguyên–chủ đề     |

### 1.2 Stored Procedures (`procedure/`)

| File                             | Procedure                                                                                | Bảng thao tác                        |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------ |
| `sp_auth.sql`                    | `sp_register_user`, `sp_login`                                                           | `users`                              |
| `sp_user_profiles.sql`           | `sp_get_user_info`, `sp_update_user_profile`, `sp_get_all_students`, `sp_get_all_tutors` | `users`, `students`, `tutors`        |
| `sp_user_subjects.sql`           | `sp_get_user_subjects`, `sp_add_user_subject`, `sp_remove_user_subject`                  | `user_subjects`, `subjects`          |
| `sp_send_message.sql`            | `sp_send_message`                                                                        | `message`                            |
| `sp_get_messages_between.sql`    | `sp_get_messages_between`                                                                | `message`                            |
| `sp_mark_as_read.sql`            | `sp_mark_as_read`                                                                        | `message`                            |
| `sp_add_comment.sql`             | `sp_add_comment`                                                                         | `comment`                            |
| `sp_comment_by_session.sql`      | `sp_comment_by_session`                                                                  | `comment`, `students`, `accounts` ⚠️ |
| `sp_add_document.sql`            | `sp_add_document`                                                                        | `resource`                           |
| `sp_get_all_documents.sql`       | `sp_get_all_documents`                                                                   | `resource`                           |
| `sp_get_documents_by_filter.sql` | `sp_get_documents_by_filter`                                                             | `resource`                           |
| `sp_delete_document.sql`         | `sp_delete_document`                                                                     | `resource`                           |

### 1.3 Seed data (`seed/`)

| File                        | Bảng được seed       | Ghi chú                                        |
| --------------------------- | -------------------- | ---------------------------------------------- |
| `01_init_database.sql`      | —                    | Tạo database `dbms_project`                    |
| `02_seed_subjects.sql`      | `subjects`           | 4 môn học mẫu, UUID cố định                    |
| `03_seed_users.sql`         | `users`              | 5 user mẫu (1 admin, 2 SV, 2 GS), UUID cố định |
| `04_seed_profiles.sql`      | `students`, `tutors` | Tham chiếu UUID từ `03_seed_users.sql`         |
| `04_library.sql`            | `resource`           | ~100 tài nguyên mẫu                            |
| `05_seed_user_subjects.sql` | `user_subjects`      | Tham chiếu UUID từ users và subjects           |
| `05_message.sql`            | `message`            | Dùng integer ID ⚠️                             |
| `06_comment.sql`            | `comment`            | Dùng integer ID ⚠️                             |

---

## 2. Xung đột và lỗi phát hiện

### 🔴 CRITICAL — Gây lỗi khi chạy

#### [C1] `04_message.sql` — FK tham chiếu bảng không tồn tại

```sql
-- Sai: bảng accounts không tồn tại trong schema
CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES accounts(user_id)
CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES accounts(user_id)
```

**Nguyên nhân:** Bảng người dùng trong schema hiện tại là `users(id)`, không phải `accounts(user_id)`.  
**Sửa:** Đổi thành `REFERENCES users(id)`.

---

#### [C2] `04_message.sql` — Kiểu dữ liệu `sender_id`/`receiver_id` không khớp

```sql
-- Bảng message định nghĩa:
sender_id   BIGINT NOT NULL
receiver_id BIGINT NOT NULL

-- Bảng users định nghĩa:
id CHAR(36) PRIMARY KEY   -- UUID dạng CHAR
```

**Nguyên nhân:** `message.sender_id` là `BIGINT` nhưng `users.id` là `CHAR(36)` — FK không thể tạo được.  
**Sửa:** Đổi kiểu `sender_id` và `receiver_id` trong `message` thành `CHAR(36)`.

---

#### [C3] `05_comment.sql` — FK tham chiếu bảng `sessions` không tồn tại

```sql
CONSTRAINT fk_comment_session FOREIGN KEY (session_id) REFERENCES sessions(session_id)
```

**Nguyên nhân:** Không có file nào trong `table/` định nghĩa bảng `sessions`.  
**Sửa:** Tạo bảng `sessions` hoặc tạm thời bỏ FK này nếu bảng chưa được triển khai.

---

#### [C4] `05_comment.sql` — Kiểu dữ liệu `student_id` không khớp

```sql
-- comment định nghĩa:
student_id BIGINT NOT NULL

-- students định nghĩa:
student_id CHAR(36) PRIMARY KEY
```

**Sửa:** Đổi `student_id` trong `comment` thành `CHAR(36)`.

---

#### [C5] `sp_comment_by_session.sql` — Tham chiếu bảng và cột không tồn tại

```sql
JOIN students s ON s.student_id = c.student_id
JOIN accounts a ON a.user_id = s.user_id   -- 'accounts' không tồn tại
...
a.full_name AS student_name                -- cột 'full_name' không có trong 'users'
```

**Nguyên nhân:**

- Bảng `accounts` không tồn tại, phải dùng `users`.
- Cột `full_name` không có trong `users` (tên cột đúng là `name`).
- Bảng `students` không có cột `user_id` — `student_id` chính là FK sang `users(id)`.

**Sửa:**

```sql
JOIN users u ON u.id = c.student_id
...
u.name AS student_name
```

---

#### [C6] `sp_send_message.sql`, `sp_get_messages_between.sql`, `sp_mark_as_read.sql` — Tham số kiểu `BIGINT`

Các procedure messaging dùng `BIGINT` cho `p_sender_id`, `p_receiver_id`, `p_user_1`, `p_user_2` — nhưng sau khi sửa [C2], các cột này sẽ là `CHAR(36)`.  
**Sửa:** Đổi tham số sang `CHAR(36)` và bỏ validation `<= 0` (không phù hợp với UUID).

---

#### [C7] `sp_add_comment.sql` — Tham số `p_student_id`, `p_session_id` kiểu `BIGINT`

Tương tự [C6], tham số `BIGINT` không khớp với `students.student_id CHAR(36)`.  
**Sửa:** Đổi sang `CHAR(36)` và `CHAR(36)` (hoặc `BIGINT` cho `session_id` khi bảng `sessions` được tạo với `BIGINT` PK).

---

### 🟡 WARNING — Lỗi thiết kế / Không nhất quán

#### [W1] Bảng `sessions` chưa được định nghĩa

Bảng `sessions` được tham chiếu bởi `comment` (FK) và seed `06_comment.sql` nhưng không có file tạo bảng tương ứng.  
Đây có thể là một bảng chưa được triển khai hoặc thuộc phần khác của dự án.

---

#### [W2] `resource_subject` không liên kết với `subjects(id)`

```sql
-- resource_subject dùng freetext
subject_name VARCHAR(100) NOT NULL   -- không FK sang subjects

-- user_subjects dùng FK đúng chuẩn
subject_id CHAR(36) REFERENCES subjects(id)
```

Hai bảng thực hiện cùng mục đích (gán môn học cho entity) nhưng theo cách hoàn toàn khác nhau. Nếu thêm một subject mới, `resource_subject` sẽ không được cập nhật tự động.  
**Khuyến nghị:** Thêm FK từ `resource_subject.subject_name` sang `subjects(name)` (cột `name` đã có `UNIQUE` constraint) hoặc đổi sang dùng `subject_id`.

---

#### [W3] Seed `05_message.sql` dùng integer ID cứng

```sql
INSERT INTO message (sender_id, receiver_id, ...) VALUES (49, 1, ...), (50, 2, ...);
```

Seed này giả định `sender_id`/`receiver_id` là integer auto-increment, không tương thích với schema dùng `CHAR(36)` UUID. Các ID `49`, `50`... không tồn tại trong seed users.  
**Sửa:** Cần viết lại seed dùng UUID từ `03_seed_users.sql`.

---

#### [W4] Seed `06_comment.sql` dùng integer ID cứng

```sql
INSERT INTO `comment` (student_id, session_id, ...) VALUES (3, 1, ...), (6, 2, ...);
```

Tương tự [W3] — `student_id` và `session_id` không khớp với UUID scheme.

---

### 🟢 OK — Không phát hiện vấn đề

| Thành phần                       | Trạng thái |
| -------------------------------- | ---------- |
| `01_users.sql`                   | ✅         |
| `02_subjects.sql`                | ✅         |
| `03_resources.sql`               | ✅         |
| `03_students_tutors.sql`         | ✅         |
| `04_user_subjects.sql`           | ✅         |
| `sp_auth.sql`                    | ✅         |
| `sp_user_profiles.sql`           | ✅         |
| `sp_user_subjects.sql`           | ✅         |
| `sp_add_document.sql`            | ✅         |
| `sp_get_all_documents.sql`       | ✅         |
| `sp_get_documents_by_filter.sql` | ✅         |
| `sp_delete_document.sql`         | ✅         |
| `01_init_database.sql`           | ✅         |
| `02_seed_subjects.sql`           | ✅         |
| `03_seed_users.sql`              | ✅         |
| `04_seed_profiles.sql`           | ✅         |
| `04_library.sql`                 | ✅         |
| `05_seed_user_subjects.sql`      | ✅         |

---

## 3. Tóm tắt các sửa đổi cần thực hiện

| ID  | File                                                                                  | Mức độ      | Mô tả                                                                   |
| --- | ------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| C1  | `table/04_message.sql`                                                                | 🔴 Critical | Đổi FK tham chiếu từ `accounts(user_id)` → `users(id)`                  |
| C2  | `table/04_message.sql`                                                                | 🔴 Critical | Đổi kiểu `sender_id`, `receiver_id` từ `BIGINT` → `CHAR(36)`            |
| C3  | `table/05_comment.sql`                                                                | 🔴 Critical | Tạo bảng `sessions` hoặc bỏ FK đến `sessions`                           |
| C4  | `table/05_comment.sql`                                                                | 🔴 Critical | Đổi kiểu `student_id` từ `BIGINT` → `CHAR(36)`                          |
| C5  | `procedure/sp_comment_by_session.sql`                                                 | 🔴 Critical | Sửa JOIN dùng `users` thay `accounts`, dùng `u.name` thay `a.full_name` |
| C6  | `procedure/sp_send_message.sql`, `sp_get_messages_between.sql`, `sp_mark_as_read.sql` | 🔴 Critical | Đổi tham số ID từ `BIGINT` → `CHAR(36)`                                 |
| C7  | `procedure/sp_add_comment.sql`                                                        | 🔴 Critical | Đổi `p_student_id` từ `BIGINT` → `CHAR(36)`                             |
| W1  | _(thiếu file)_                                                                        | 🟡 Warning  | Tạo `table/05_sessions.sql` để định nghĩa bảng `sessions`               |
| W2  | `table/06_resource_subject.sql`                                                       | 🟡 Warning  | Cân nhắc thêm FK hoặc đồng nhất cách tham chiếu subject                 |
| W3  | `seed/05_message.sql`                                                                 | 🟡 Warning  | Viết lại seed dùng UUID `CHAR(36)`                                      |
| W4  | `seed/06_comment.sql`                                                                 | 🟡 Warning  | Viết lại seed dùng UUID `CHAR(36)`                                      |

---

## 4. Thứ tự chạy đúng

```
01_init_database.sql        ← Tạo database
table/01_users.sql          ← Tạo bảng users (gốc)
table/02_subjects.sql       ← Tạo bảng subjects
table/03_resources.sql      ← Tạo bảng resource + view resources
table/03_students_tutors.sql ← Tạo students, tutors (FK → users)
table/04_message.sql        ← Tạo message (FK → users) [cần sửa C1, C2]
table/04_user_subjects.sql  ← Tạo user_subjects (FK → users, subjects)
table/05_sessions.sql       ← Tạo sessions [CẦN TẠO MỚI — W1]
table/05_comment.sql        ← Tạo comment (FK → students, sessions) [cần sửa C3, C4]
table/06_resource_subject.sql ← Tạo resource_subject (FK → resource)

seed/02_seed_subjects.sql
seed/03_seed_users.sql
seed/04_seed_profiles.sql
seed/04_library.sql
seed/05_seed_user_subjects.sql
seed/05_message.sql         ← [cần sửa W3]
seed/06_comment.sql         ← [cần sửa W4]

procedure/*.sql             ← Có thể chạy sau khi tất cả bảng đã tồn tại
```
