# DATABASE.md — Tài liệu kỹ thuật CSDL hệ thống HCMUT Tutoring

> Cơ sở dữ liệu: `dbms_project`  
> Engine: InnoDB, Charset: `utf8mb4`, Collation: `utf8mb4_unicode_ci`  
> Cập nhật: 2026-04-20 (sau đợt sửa lỗi FIX_20_4)

---

## MỤC LỤC

1. [Sơ đồ quan hệ tổng quan](#sơ-đồ-quan-hệ-tổng-quan)
2. [Bảng dữ liệu](#bảng-dữ-liệu)
   - [users](#1-users)
   - [students](#2-students)
   - [tutors](#3-tutors)
   - [subjects](#4-subjects)
   - [user_subjects](#5-user_subjects)
   - [sessions](#6-sessions)
   - [session_participants](#7-session_participants)
   - [resource](#8-resource)
   - [resource_subject](#9-resource_subject)
   - [message](#10-message)
   - [comment](#11-comment)
   - [session_requests](#12-session_requests)
   - [notifications](#13-notifications)
3. [Stored Procedures](#stored-procedures)
   - [Xác thực & Người dùng](#xác-thực--người-dùng)
   - [Buổi học (Sessions)](#buổi-học-sessions)
   - [Tin nhắn (Messages)](#tin-nhắn-messages)
   - [Thư viện tài liệu](#thư-viện-tài-liệu)
   - [Nhận xét & Đánh giá](#nhận-xét--đánh-giá)
   - [Yêu cầu dời lịch (Requests)](#yêu-cầu-dời-lịch-requests)
   - [Thông báo (Notifications)](#thông-báo-notifications)

---

## Sơ đồ quan hệ tổng quan

```
users (id PK)
 ├── students (student_id FK→users.id)
 │    ├── user_subjects (user_id FK→users.id)
 │    ├── session_participants (student_id FK→students.student_id)
 │    ├── comment (student_id FK→students.student_id)
 │    └── session_requests (student_id FK→students.student_id)
 ├── tutors (tutor_id FK→users.id)
 │    └── sessions (tutor_id FK→tutors.tutor_id)
 │         ├── session_participants (session_id FK→sessions.session_id)
 │         ├── comment (session_id FK→sessions.session_id)
 │         ├── session_requests (session_id FK→sessions.session_id)
 │         └── notifications (session_id FK→sessions.session_id)
 ├── message (sender_id, receiver_id FK→users.id ✓)
 └── notifications (receiver_user_id FK→users.id)

subjects (id PK)
 ├── user_subjects (subject_id FK→subjects.id)
 └── sessions (subject_id FK→subjects.id)

resource (resource_id PK)
 └── resource_subject (resource_id FK→resource.resource_id,
                        subject_id FK→subjects.id ✓)
```

---

## Bảng dữ liệu

### 1. `users`

> File: `table/01_users.sql` | Tác giả: Huỳnh Hữu Nhật

Bảng gốc lưu thông tin tài khoản cho tất cả loại người dùng.

| Cột          | Kiểu           | Ràng buộc        | Mô tả                                                              |
| ------------ | -------------- | ---------------- | ------------------------------------------------------------------ |
| `id`         | `CHAR(36)`     | PK               | UUID duy nhất                                                      |
| `username`   | `VARCHAR(50)`  | UNIQUE, NOT NULL | Tên đăng nhập                                                      |
| `password`   | `VARCHAR(255)` | NOT NULL         | Mật khẩu (đã hash)                                                 |
| `email`      | `VARCHAR(100)` | UNIQUE, NOT NULL | Email liên hệ                                                      |
| `name`       | `VARCHAR(100)` | NOT NULL         | Họ và tên đầy đủ                                                   |
| `role`       | `ENUM`         | NOT NULL         | `student`, `tutor`, `academic-affairs`, `student-affairs`, `admin` |
| `avatar`     | `VARCHAR(255)` | NULL             | URL ảnh đại diện                                                   |
| `created_at` | `TIMESTAMP`    | DEFAULT NOW      | Thời gian tạo                                                      |
| `updated_at` | `TIMESTAMP`    | AUTO UPDATE      | Thời gian cập nhật                                                 |

**Indexes:** `idx_users_username`, `idx_users_email`, `idx_users_role`

---

### 2. `students`

> File: `table/03_students_tutors.sql` | Tác giả: Huỳnh Hữu Nhật

Thông tin chuyên biệt của sinh viên, mở rộng từ `users`.

| Cột             | Kiểu           | Ràng buộc                 | Mô tả                      |
| --------------- | -------------- | ------------------------- | -------------------------- |
| `student_id`    | `CHAR(36)`     | PK, FK→`users.id` CASCADE | Trùng với `users.id`       |
| `mssv`          | `VARCHAR(36)`  | UNIQUE, NOT NULL          | Mã số sinh viên            |
| `department`    | `VARCHAR(100)` | NOT NULL                  | Khoa trực thuộc            |
| `year`          | `INT`          | DEFAULT 1                 | Năm học (1–6)              |
| `gpa`           | `DECIMAL(3,2)` | NULL                      | Điểm GPA (0.0–4.0)         |
| `support_needs` | `JSON`         | NULL                      | Nhu cầu hỗ trợ (mảng JSON) |

**Indexes:** `idx_students_mssv`, `idx_students_department`

---

### 3. `tutors`

> File: `table/03_students_tutors.sql` | Tác giả: Huỳnh Hữu Nhật

Thông tin chuyên biệt của gia sư, mở rộng từ `users`.

| Cột              | Kiểu           | Ràng buộc                 | Mô tả                              |
| ---------------- | -------------- | ------------------------- | ---------------------------------- |
| `tutor_id`       | `CHAR(36)`     | PK, FK→`users.id` CASCADE | Trùng với `users.id`               |
| `tutor_code`     | `VARCHAR(36)`  | UNIQUE, NOT NULL          | Mã gia sư nội bộ                   |
| `department`     | `VARCHAR(100)` | NOT NULL                  | Khoa trực thuộc                    |
| `rating`         | `DECIMAL(3,2)` | DEFAULT 0.0               | Điểm đánh giá trung bình (0.0–5.0) |
| `total_sessions` | `INT`          | DEFAULT 0                 | Tổng buổi đã dạy                   |
| `expertise`      | `JSON`         | NULL                      | Chuyên môn (mảng JSON)             |

**Indexes:** `idx_tutors_code`, `idx_tutors_department`

---

### 4. `subjects`

> File: `table/02_subjects.sql` | Tác giả: Huỳnh Hữu Nhật

Danh mục môn học trong hệ thống.

| Cột          | Kiểu           | Ràng buộc        | Mô tả         |
| ------------ | -------------- | ---------------- | ------------- |
| `id`         | `CHAR(36)`     | PK               | UUID môn học  |
| `name`       | `VARCHAR(100)` | UNIQUE, NOT NULL | Tên môn học   |
| `created_at` | `TIMESTAMP`    | DEFAULT NOW      | Thời gian tạo |

**Indexes:** `idx_subjects_name`

---

### 5. `user_subjects`

> File: `table/04_user_subjects.sql` | Tác giả: Huỳnh Hữu Nhật

Bảng N-N: người dùng (sinh viên hoặc gia sư) đăng ký môn học.

| Cột          | Kiểu        | Ràng buộc                    | Mô tả             |
| ------------ | ----------- | ---------------------------- | ----------------- |
| `user_id`    | `CHAR(36)`  | PK, FK→`users.id` CASCADE    | ID người dùng     |
| `subject_id` | `CHAR(36)`  | PK, FK→`subjects.id` CASCADE | ID môn học        |
| `joined_at`  | `TIMESTAMP` | DEFAULT NOW                  | Thời điểm đăng ký |

**Indexes:** `idx_user_subjects_user`, `idx_user_subjects_subject`

---

### 6. `sessions`

> File: `table/05_sessions.sql` | Tác giả: Nguyễn Hữu Nhân

Buổi học do gia sư tạo ra.

| Cột             | Kiểu           | Ràng buộc                     | Mô tả                                                 |
| --------------- | -------------- | ----------------------------- | ----------------------------------------------------- |
| `session_id`    | `CHAR(36)`     | PK                            | UUID buổi học                                         |
| `tutor_id`      | `CHAR(36)`     | FK→`tutors.tutor_id` RESTRICT | Gia sư phụ trách                                      |
| `subject`       | `VARCHAR(150)` | NOT NULL                      | Tên môn học (lưu trực tiếp)                           |
| `date`          | `DATE`         | NOT NULL                      | Ngày diễn ra                                          |
| `start_time`    | `TIME`         | NOT NULL                      | Giờ bắt đầu                                           |
| `end_time`      | `TIME`         | NOT NULL                      | Giờ kết thúc                                          |
| `type`          | `ENUM`         | NOT NULL                      | `in-person` hoặc `online`                             |
| `location`      | `VARCHAR(255)` | NULL                          | Phòng học (in-person)                                 |
| `meeting_link`  | `VARCHAR(512)` | NULL                          | Link họp (online)                                     |
| `max_students`  | `INT`          | DEFAULT 30                    | Sĩ số tối đa                                          |
| `status`        | `ENUM`         | DEFAULT `open`                | `scheduled`, `completed`, `cancelled`, `open`, `full` |
| `notes`         | `TEXT`         | NULL                          | Ghi chú trước buổi                                    |
| `summary`       | `TEXT`         | NULL                          | Tóm tắt sau buổi                                      |
| `recording_url` | `VARCHAR(512)` | NULL                          | Link video ghi lại                                    |
| `created_at`    | `TIMESTAMP`    | DEFAULT NOW                   | —                                                     |
| `updated_at`    | `TIMESTAMP`    | AUTO UPDATE                   | —                                                     |

**Constraints:** `CHECK (start_time < end_time)`  
**Indexes:** `idx_sessions_tutor_date`, `idx_sessions_subject`, `idx_sessions_status`

---

### 7. `session_participants`

> File: `table/06_session_participants.sql` | Tác giả: Nguyễn Hữu Nhân

Bảng N-N: sinh viên tham gia buổi học. Tách riêng khỏi `comment` để hỗ trợ trường hợp tham gia nhưng chưa đánh giá.

| Cột           | Kiểu        | Ràng buộc                            | Mô tả                      |
| ------------- | ----------- | ------------------------------------ | -------------------------- |
| `session_id`  | `CHAR(36)`  | PK, FK→`sessions.session_id` CASCADE | ID buổi học                |
| `student_id`  | `CHAR(36)`  | PK, FK→`students.student_id` CASCADE | ID sinh viên               |
| `enrolled_at` | `TIMESTAMP` | DEFAULT NOW                          | Thời điểm đăng ký tham gia |

---

### 8. `resource`

> File: `table/03_resources.sql` | Tác giả: Nguyễn Hữu Thời  
> Có VIEW `resources` trỏ toàn bộ cột của bảng này.

Bảng tài nguyên học tập trong thư viện.

| Cột           | Kiểu           | Ràng buộc          | Mô tả                       |
| ------------- | -------------- | ------------------ | --------------------------- |
| `resource_id` | `CHAR(36)`     | PK, DEFAULT UUID() | Mã tài nguyên (UUID)        |
| `title`       | `VARCHAR(255)` | NOT NULL           | Tiêu đề tài liệu            |
| `author`      | `VARCHAR(255)` | NOT NULL           | Tác giả                     |
| `type`        | `VARCHAR(100)` | NOT NULL           | Loại tài liệu (PDF, Video…) |
| `url`         | `VARCHAR(500)` | UNIQUE, NOT NULL   | Đường dẫn                   |
| `subject`     | `VARCHAR(100)` | NULL               | Chủ đề liên quan (lưu text) |
| `created_at`  | `TIMESTAMP`    | DEFAULT NOW        | —                           |
| `updated_at`  | `TIMESTAMP`    | AUTO UPDATE        | —                           |

**Indexes:** `idx_resource_type`, `idx_resource_subject`, `idx_resource_title`

---

### 9. `resource_subject`

> File: `table/06_resource_subject.sql` | Tác giả: Nguyễn Hữu Thời

Bảng ánh xạ N-N giữa tài nguyên và môn học (có FK đến `subjects`).

| Cột           | Kiểu        | Ràng buộc                             | Mô tả             |
| ------------- | ----------- | ------------------------------------- | ----------------- |
| `resource_id` | `CHAR(36)`  | PK, FK→`resource.resource_id` CASCADE | Mã tài nguyên     |
| `subject_id`  | `CHAR(36)`  | PK, FK→`subjects.id` CASCADE          | Mã môn học (UUID) |
| `created_at`  | `TIMESTAMP` | DEFAULT NOW                           | —                 |

**Indexes:** `idx_resource_subject_subject`

### 10. `message`

> File: `table/04_message.sql` | Tác giả: Nguyễn Hữu Thời

Tin nhắn trực tiếp giữa hai người dùng.

| Cột           | Kiểu        | Ràng buộc             | Mô tả              |
| ------------- | ----------- | --------------------- | ------------------ |
| `message_id`  | `CHAR(36)`  | PK                    | Mã tin nhắn (UUID) |
| `sender_id`   | `CHAR(36)`  | FK→`users.id` CASCADE | ID người gửi       |
| `receiver_id` | `CHAR(36)`  | FK→`users.id` CASCADE | ID người nhận      |
| `content`     | `TEXT`      | NOT NULL              | Nội dung tin nhắn  |
| `status`      | `ENUM`      | DEFAULT `SENT`        | `SENT`, `READ`     |
| `timestamp`   | `TIMESTAMP` | DEFAULT NOW           | Thời điểm gửi      |
| `created_at`  | `TIMESTAMP` | DEFAULT NOW           | —                  |
| `updated_at`  | `TIMESTAMP` | AUTO UPDATE           | —                  |

**Indexes:** `idx_message_conversation(sender_id, receiver_id, timestamp)`, `idx_message_status`

---

### 11. `comment`

> File: `table/05_comment.sql` | Tác giả: Nguyễn Hữu Thời

Đánh giá và nhận xét của sinh viên cho từng buổi học (logic chính).

| Cột          | Kiểu               | Ràng buộc                            | Mô tả             |
| ------------ | ------------------ | ------------------------------------ | ----------------- |
| `student_id` | `CHAR(36)`         | PK, FK→`students.student_id` CASCADE | ID sinh viên      |
| `session_id` | `CHAR(36)`         | PK, FK→`sessions.session_id` CASCADE | ID buổi học       |
| `comment`    | `TEXT`             | NOT NULL                             | Nội dung nhận xét |
| `rating`     | `TINYINT UNSIGNED` | NOT NULL, CHECK 1–5                  | Điểm đánh giá     |
| `created_at` | `TIMESTAMP`        | DEFAULT NOW                          | —                 |
| `updated_at` | `TIMESTAMP`        | AUTO UPDATE                          | —                 |

**Indexes:** `idx_comment_session_rating`

---

### 12. `requests`

> File: `table/07_session_requests.sql` | Tác giả: Hà Thanh Trung

Yêu cầu dời lịch học từ phía sinh viên.

| Cột          | Kiểu          | Ràng buộc                        | Mô tả                             |
| ------------ | ------------- | -------------------------------- | --------------------------------- |
| `request_id` | `INT`         | PK, AUTO_INCREMENT               | Mã yêu cầu                        |
| `student_id` | `CHAR(36)`    | FK→`students.student_id` CASCADE | Sinh viên gửi yêu cầu             |
| `session_id` | `CHAR(36)`    | FK→`sessions.session_id` CASCADE | Buổi học liên quan                |
| `date`       | `DATE`        | NOT NULL                         | Ngày đề xuất mới                  |
| `start_time` | `TIME`        | NOT NULL                         | Giờ bắt đầu đề xuất               |
| `end_time`   | `TIME`        | NOT NULL                         | Giờ kết thúc đề xuất              |
| `reason`     | `TEXT`        | NULL                             | Lý do yêu cầu                     |
| `status`     | `VARCHAR(20)` | DEFAULT `pending`                | `pending`, `approved`, `rejected` |
| `created_at` | `DATETIME`    | DEFAULT NOW                      | Thời điểm tạo                     |

---

### 13. `notifications`

> File: `table/08_notifications.sql` | Tác giả: Hà Thanh Trung

Thông báo tự động gửi cho người dùng khi buổi học bị hủy hoặc dời lịch.

| Cột                | Kiểu        | Ràng buộc                        | Mô tả                  |
| ------------------ | ----------- | -------------------------------- | ---------------------- |
| `notification_id`  | `CHAR(36)`  | PK, DEFAULT UUID()               | Mã thông báo (UUID)    |
| `session_id`       | `CHAR(36)`  | FK→`sessions.session_id` CASCADE | Buổi học liên quan     |
| `receiver_user_id` | `CHAR(36)`  | FK→`users.id` CASCADE            | Người nhận thông báo   |
| `sent_time`        | `TIMESTAMP` | DEFAULT NOW                      | Thời điểm gửi          |
| `content`          | `TEXT`      | NOT NULL                         | Nội dung thông báo     |
| `type`             | `ENUM`      | NOT NULL                         | `reschedule`, `cancel` |

**Indexes:** `idx_notifications_receiver_time(receiver_user_id, sent_time DESC)`

> **Lưu ý:** Cột `is_read` và các loại `request-approved`/`request-rejected` chưa được triển khai. Xem [FIX_20_4.md](FIX_20_4.md) — Phần II.

---

## Stored Procedures

### Xác thực & Người dùng

> File: `procedure/sp_auth.sql`, `procedure/sp_user_profiles.sql`, `procedure/sp_user_subjects.sql`

| Procedure                | Parameters                                              | Mô tả                                                        |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------ |
| `sp_register_user`       | `p_id, p_username, p_password, p_email, p_name, p_role` | Tạo tài khoản mới trong `users`                              |
| `sp_login`               | `p_username, p_password`                                | Trả về `userID, role, name` nếu xác thực thành công          |
| `sp_get_user_info`       | `p_user_id`                                             | Lấy thông tin chi tiết người dùng (JOIN `students`/`tutors`) |
| `sp_update_user_profile` | `p_user_id, p_name, p_department`                       | Cập nhật tên và khoa (rẽ nhánh theo role)                    |
| `sp_get_user_subjects`   | `p_user_id`                                             | Lấy danh sách môn học đã đăng ký                             |
| `sp_add_user_subject`    | `p_user_id, p_subject_id`                               | Thêm môn học cho người dùng (INSERT IGNORE)                  |
| `sp_remove_user_subject` | `p_user_id, p_subject_id`                               | Xóa môn học khỏi danh sách                                   |

---

### Buổi học (Sessions)

> File: `procedure/sp_create_session.sql`, `sp_add_student_session.sql`, `sp_remove_student_session.sql`, `sp_complete_session.sql`, `sp_cancel_session.sql`, `sp_filter_sessions.sql`, `sp_update_session_time.sql`, `sp_update_session_summary.sql`

| Procedure                   | Parameters                                                                                                                | Mô tả                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `sp_create_session`         | `p_tutor_id, p_subject_id, p_date, p_start_time, p_end_time, p_type, p_location, p_meeting_link, p_max_students, p_notes` | Tạo buổi học mới. Kiểm tra overlap lịch gia sư. Dùng transaction.                                                                |
| `sp_add_student_session`    | `p_session_id, p_student_id`                                                                                              | Thêm sinh viên vào buổi học. Kiểm tra trạng thái, sĩ số. Kiểm tra sinh viên đã enrolled. Tự cập nhật `status = full` khi đủ.     |
| `sp_remove_student_session` | `p_session_id, p_student_id`                                                                                              | Xóa sinh viên khỏi buổi học. Tự cập nhật `status = open` nếu đang `full`.                                                        |
| `sp_complete_session`       | `p_session_id`                                                                                                            | Đánh dấu buổi học hoàn thành. Idempotent (đã completed thì bỏ qua).                                                              |
| `sp_update_session_summary` | `p_session_id, p_summary, p_recording_url`                                                                                | Cập nhật `summary` và `recording_url`. Chỉ hoạt động khi session đã `completed`. Dùng `COALESCE` nên NULL giữ nguyên giá trị cũ. |
| `sp_cancel_session`         | `p_session_id`                                                                                                            | Hủy buổi học (UPDATE status = cancelled) và gửi thông báo `cancel` cho tất cả sinh viên.                                         |
| `sp_filter_sessions`        | `p_tutor_id, p_student_id, p_subject_id, p_session_date, p_status, p_type`                                                | Lọc buổi học theo nhiều bộ lọc tùy chọn. Trả về kèm `current_students`.                                                          |
| `sp_update_session_time`    | `p_session_id, p_new_date, p_new_start_time, p_new_end_time`                                                              | Cập nhật lịch buổi học và tự động gửi thông báo `reschedule` cho toàn bộ sinh viên.                                              |

---

### Tin nhắn (Messages)

> File: `procedure/sp_send_message.sql`, `sp_get_messages_between.sql`, `sp_mark_as_read.sql`

| Procedure                 | Parameters                                                     | Mô tả                                                                             |
| ------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `sp_send_message`         | `p_sender_id CHAR(36), p_receiver_id CHAR(36), p_content TEXT` | Gửi tin nhắn mới. Trả về bản ghi vừa tạo.                                         |
| `sp_get_messages_between` | `p_user_1 CHAR(36), p_user_2 CHAR(36)`                         | Lấy lịch sử hội thoại hai chiều. Sắp xếp theo `timestamp ASC`.                    |
| `sp_mark_as_read`         | `p_sender_id CHAR(36), p_receiver_id CHAR(36)`                 | Đánh dấu đã đọc toàn bộ tin nhắn từ sender đến receiver. Trả về số dòng cập nhật. |

---

### Thư viện tài liệu

> File: `procedure/sp_add_document.sql`, `sp_get_all_documents.sql`, `sp_get_documents_by_filter.sql`, `sp_delete_document.sql`

| Procedure                    | Parameters                         | Mô tả                                                       |
| ---------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| `sp_add_document`            | `p_title, p_author, p_type, p_url` | Thêm tài liệu mới vào `resource`. `type` tự động uppercase. |
| `sp_get_all_documents`       | —                                  | Lấy toàn bộ tài liệu, sắp xếp `created_at DESC`.            |
| `sp_get_documents_by_filter` | `p_title, p_type`                  | Lọc theo tiêu đề (LIKE) và loại (exact, uppercase).         |
| `sp_delete_document`         | `p_resource_id CHAR(36)`           | Xóa tài liệu. Báo lỗi nếu không tìm thấy.                   |

---

### Nhận xét & Đánh giá

> File: `procedure/sp_add_comment.sql`, `procedure/sp_comment_by_session.sql`

| Procedure               | Parameters                                                                   | Mô tả                                                               |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `sp_add_comment`        | `p_student_id CHAR(36), p_session_id CHAR(36), p_comment TEXT, p_rating INT` | Thêm mới hoặc cập nhật nhận xét (UPSERT). Kiểm tra session tồn tại. |
| `sp_comment_by_session` | `p_session_id CHAR(36)`                                                      | Lấy danh sách nhận xét theo buổi học (JOIN `users`).                |

---

### Yêu cầu dời lịch (Requests)

> File: `procedure/sp_create_reschedule_request.sql`, `procedure/sp_accept_reschedule_request.sql`, `procedure/sp_reject_reschedule_request.sql`, `procedure/sp_list_requests_for_tutor.sql`

| Procedure                      | Parameters                                                                                                            | Mô tả                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `sp_create_reschedule_request` | `p_student_id CHAR(36), p_session_id CHAR(36), p_proposed_date, p_proposed_start_time, p_proposed_end_time, p_reason` | Tạo yêu cầu dời lịch với status `pending`.                                                  |
| `sp_accept_reschedule_request` | `p_request_id CHAR(36)`                                                                                               | Chấp nhận yêu cầu: cập nhật `accepted`, cập nhật lịch session, gửi thông báo cho sinh viên. |
| `sp_reject_reschedule_request` | `p_request_id CHAR(36)`                                                                                               | Từ chối yêu cầu: cập nhật `rejected`, gửi thông báo cho sinh viên.                          |
| `sp_list_requests_for_tutor`   | `p_tutor_id CHAR(36)`                                                                                                 | Lấy tất cả yêu cầu thuộc sessions của gia sư (JOIN `subjects` để lấy tên môn).              |

---

### Thông báo (Notifications)

> File: `procedure/sp_get_user_notifications.sql`

| Procedure                   | Parameters           | Mô tả                                                         |
| --------------------------- | -------------------- | ------------------------------------------------------------- |
| `sp_get_user_notifications` | `p_user_id CHAR(36)` | Lấy toàn bộ thông báo của người dùng, sắp xếp mới nhất trước. |

> **Lưu ý:** Các procedure tạo notification (`sp_cancel_session`, `sp_update_session_time`, `sp_accept_reschedule_request`, `sp_reject_reschedule_request`) gọi trực tiếp `INSERT INTO notifications` nội tuyến, không qua stored procedure riêng.

---

## Thứ tự khởi tạo database

```
01_init_database.sql      ← Tạo database dbms_project
table/01_users.sql
table/02_subjects.sql
table/03_students_tutors.sql
table/03_resources.sql
table/04_user_subjects.sql
table/04_message.sql
table/05_sessions.sql
table/05_comment.sql
table/06_resource_subject.sql
table/06_session_participants.sql
table/07_session_requests.sql
table/08_notifications.sql
procedure/*.sql           ← Tất cả stored procedures
seed/02_seed_subjects.sql
seed/03_seed_users.sql
seed/04_seed_profiles.sql
seed/04_library.sql
seed/05_seed_user_subjects.sql
seed/05_message.sql
seed/06_seed_sessions.sql
seed/06_comment.sql
seed/07_seed_session_participants.sql
```
