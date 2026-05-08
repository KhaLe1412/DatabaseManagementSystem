# Stored Procedures Integration

Tài liệu này mô tả cách các stored procedure của database được ánh xạ vào các API endpoint của backend Flask.

---

## Tổng quan

| Module              | File route                      | Số endpoint đã implement |
| ------------------- | ------------------------------- | ------------------------ |
| Auth                | `routes/auth.py`                | 2                        |
| Users               | `routes/users.py`               | 8                        |
| Sessions            | `routes/sessions.py`            | 9                        |
| Messages            | `routes/messages.py`            | 3                        |
| Library             | `routes/library.py`             | 3                        |
| Notifications       | `routes/notifications.py`       | 1                        |
| Reschedule Requests | `routes/reschedule_requests.py` | 3                        |

> **Ngoài scope:** `evaluations.py` và `match_requests.py` chưa có stored procedure tương ứng, giữ nguyên 501 stubs.

---

## Cơ chế gọi procedure

`Database.call_procedure(name, params)` tại `db/connection.py` sử dụng MySQL connection pool và trả về `list[dict]`. Mọi lỗi SQL đều được propagate dưới dạng `mysql.connector.Error`.

`Database.execute_dml(query, params)` (thêm mới) thực thi câu lệnh DML và trả về `rowcount` — dùng cho DELETE trực tiếp thay thế những procedure bị lỗi kiểu dữ liệu.

---

## Pattern xử lý lỗi

Tất cả các route đều bắt `mysql.connector.Error` theo pattern sau:

```python
except mysql.connector.Error as err:
    msg = err.msg if hasattr(err, 'msg') else str(err)
    # Business-logic errors từ SIGNAL SQLSTATE '45000'
    if 'not found' in msg.lower():   return 404
    if 'overlap'   in msg.lower():   return 409
    if err.errno   == 1062:          return 409  # Duplicate key (MySQL native)
    return 400
```

Các lỗi không bị bắt sẽ được propagate lên `@app.errorhandler(500)` đã có sẵn trong `app.py`.

---

## Auth — `routes/auth.py`

| Endpoint           | Method | Stored Procedure                   | Ghi chú                          |
| ------------------ | ------ | ---------------------------------- | -------------------------------- |
| `/api/auth/login`  | POST   | `sp_login(p_username, p_password)` | Trả 401 nếu không có row kết quả |
| `/api/auth/logout` | POST   | _(không có)_                       | Stateless — trả 200 tĩnh         |

### `sp_login`

- **Input:** `username`, `password` (plaintext, collation utf8mb4_unicode_ci)
- **Output:** `userID`, `role`, `name`
- **Lưu ý:** Procedure so sánh password trực tiếp (không hash). Nếu cần bảo mật cao hơn, phải thêm hashing ở tầng backend.

---

## Users — `routes/users.py`

| Endpoint                       | Method | Stored Procedure / Query                                        | Ghi chú                                 |
| ------------------------------ | ------ | --------------------------------------------------------------- | --------------------------------------- |
| `/api/users`                   | GET    | `sp_get_all_students()`, `sp_get_all_tutors()`                  | Lọc `search` và phân trang trong Python |
| `/api/users/:id`               | GET    | `sp_get_user_info(p_user_id)`                                   | 404 nếu rỗng                            |
| `/api/users`                   | POST   | `sp_register_user(...)` + direct INSERT vào `students`/`tutors` | 409 nếu duplicate username/email        |
| `/api/users/:id`               | PUT    | `sp_update_user_profile(p_user_id, p_name, p_department)`       |                                         |
| `/api/users/:id`               | DELETE | `DELETE FROM users WHERE id = ?` _(direct)_                     | 404 nếu `rowcount == 0`                 |
| `/api/users/:id/subjects`      | GET    | `sp_get_user_subjects(p_user_id)`                               |                                         |
| `/api/users/:id/subjects`      | POST   | `sp_add_user_subject(p_user_id, p_subject_id)`                  | `INSERT IGNORE` — idempotent            |
| `/api/users/:id/subjects/:sid` | DELETE | `sp_remove_user_subject(p_user_id, p_subject_id)`               |                                         |

### `POST /api/users` — Luồng 2 bước

1. `sp_register_user` tạo row trong bảng `users`.
2. Direct `INSERT INTO students` hoặc `INSERT INTO tutors` với thông tin chi tiết role.

---

## Sessions — `routes/sessions.py`

| Endpoint                    | Method | Stored Procedure / Query                                                                                                 | Ghi chú                                     |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `/api/sessions`             | GET    | `sp_filter_sessions(tutor_id, student_id, subject_id, date, status, type)`                                               | Param `subjectId` (UUID)                    |
| `/api/sessions/:id`         | GET    | Direct SELECT JOIN + `sp_comment_by_session(session_id)`                                                                 | Bao gồm `enrolledStudents[]` và `reviews[]` |
| `/api/sessions`             | POST   | `sp_create_session(tutor_id, subject_id, date, start_time, end_time, type, location, meeting_link, max_students, notes)` | 409 nếu trùng lịch                          |
| `/api/sessions/:id`         | PATCH  | Rẽ nhánh theo fields (xem bên dưới)                                                                                      |                                             |
| `/api/sessions/:id`         | DELETE | `sp_cancel_session_notify(session_id)`                                                                                   | Tự động tạo notification cho sinh viên      |
| `/api/sessions/:id/join`    | POST   | `sp_add_student_session(session_id, student_id)`                                                                         | 400 nếu full/không mở/sai môn               |
| `/api/sessions/:id/leave`   | POST   | `sp_remove_student_session(session_id, student_id)`                                                                      | Tự động mở lại status nếu đang `full`       |
| `/api/sessions/:id/review`  | POST   | `sp_add_comment(student_id, session_id, comment, rating)`                                                                | UPSERT — ghi đè nếu đã có                   |
| `/api/sessions/:id/reviews` | GET    | `sp_comment_by_session(session_id)`                                                                                      |                                             |

### `PATCH /api/sessions/:id` — Logic rẽ nhánh

```
updateData có date | startTime | endTime
    → sp_update_session_time_notify(session_id, date, start, end)
      (kiểm tra overlap + tạo notification cho sinh viên)

updateData có status == 'completed'
    → sp_complete_session(session_id)

updateData có summary | recordingUrl
    → sp_update_session_summary(session_id, summary, recording_url)
      (chỉ hoạt động khi session đã completed)

updateData chỉ có notes
    → UPDATE sessions SET notes = ? WHERE session_id = ?  (direct query)
```

### Lưu ý về kiểu dữ liệu

MySQL trả về `TIME` dưới dạng `datetime.timedelta` trong Python. Các route sessions tự động chuyển đổi sang chuỗi `HH:MM` trước khi trả JSON.

---

## Messages — `routes/messages.py`

| Endpoint                 | Method | Stored Procedure / Query                                  | Ghi chú                                           |
| ------------------------ | ------ | --------------------------------------------------------- | ------------------------------------------------- |
| `/api/messages`          | GET    | `sp_get_messages_between(p_user_1, p_user_2)`             | Thêm field `read: bool` từ `status`               |
| `/api/messages`          | POST   | `sp_send_message(p_sender_id, p_receiver_id, p_content)`  |                                                   |
| `/api/messages/:id/read` | PATCH  | Direct SELECT → `sp_mark_as_read(sender_id, receiver_id)` | Đánh dấu **tất cả** tin nhắn từ sender đó là READ |

> **Thay đổi route:** `/<int:message_id>/read` đổi thành `/<string:message_id>/read` vì `message_id` là UUID CHAR(36).

---

## Library — `routes/library.py`

| Endpoint           | Method | Stored Procedure / Query                                                    | Ghi chú                    |
| ------------------ | ------ | --------------------------------------------------------------------------- | -------------------------- |
| `/api/library`     | GET    | `sp_get_documents_by_filter(p_title, p_type)` hoặc `sp_get_all_documents()` | Lọc `subject` trong Python |
| `/api/library`     | POST   | `sp_add_document(p_title, p_author, p_type, p_url)`                         | 409 nếu URL đã tồn tại     |
| `/api/library/:id` | DELETE | `DELETE FROM resource WHERE resource_id = ?` _(direct)_                     | Xem bug bên dưới           |

> **Thay đổi route:** `/<int:resource_id>` đổi thành `/<string:resource_id>` vì `resource_id` là UUID CHAR(36).

### Bug đã phát hiện: `sp_delete_document`

Procedure `sp_delete_document` khai báo tham số `p_resource_id BIGINT` nhưng bảng `resource` dùng `resource_id CHAR(36) DEFAULT (UUID())`. Gọi procedure với UUID string sẽ gây lỗi type mismatch.

**Workaround:** `DELETE /api/library/:id` dùng direct query `execute_dml()` thay vì gọi procedure.

---

## Notifications — `routes/notifications.py`

| Endpoint             | Method | Stored Procedure                            | Ghi chú                      |
| -------------------- | ------ | ------------------------------------------- | ---------------------------- |
| `/api/notifications` | GET    | `sp_list_notifications_for_user(p_user_id)` | Lọc `sessionId` trong Python |

Notification được tạo tự động bởi:

- `sp_cancel_session_notify` → type `'cancel'`
- `sp_update_session_time_notify` → type `'reschedule'`
- `sp_accept_reschedule_request` → type `'reschedule'`

---

## Reschedule Requests — `routes/reschedule_requests.py`

| Endpoint                       | Method | Stored Procedure                                                                                            | Ghi chú                                            |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/api/reschedule-requests`     | GET    | `sp_list_requests_for_tutor(p_tutor_id)`                                                                    | Lọc `sessionId`, `status` trong Python             |
| `/api/reschedule-requests`     | POST   | `sp_create_reschedule_request(student_id, session_id, proposed_date, proposed_start, proposed_end, reason)` | Kiểm tra sinh viên đã enrolled                     |
| `/api/reschedule-requests/:id` | PATCH  | `sp_accept_reschedule_request(request_id)` hoặc `sp_reject_reschedule_request(request_id)`                  | Accept tự động cập nhật session + gửi notification |

### `PATCH` — Giá trị `status` hợp lệ

- `"accepted"` → `sp_accept_reschedule_request` (kiểm tra overlap lịch trước khi chấp nhận)
- `"rejected"` → `sp_reject_reschedule_request` (không thay đổi session)

---

## Danh sách tất cả Stored Procedures

| Procedure                        | File SQL                             | Dùng bởi                                                 |
| -------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| `sp_login`                       | `sp_auth.sql`                        | `POST /api/auth/login`                                   |
| `sp_register_user`               | `sp_auth.sql`                        | `POST /api/users`                                        |
| `sp_get_user_info`               | `sp_user_profiles.sql`               | `GET /api/users/:id`                                     |
| `sp_update_user_profile`         | `sp_user_profiles.sql`               | `PUT /api/users/:id`                                     |
| `sp_get_all_students`            | `sp_user_profiles.sql`               | `GET /api/users`                                         |
| `sp_get_all_tutors`              | `sp_user_profiles.sql`               | `GET /api/users`                                         |
| `sp_get_user_subjects`           | `sp_user_subjects.sql`               | `GET /api/users/:id/subjects`                            |
| `sp_add_user_subject`            | `sp_user_subjects.sql`               | `POST /api/users/:id/subjects`                           |
| `sp_remove_user_subject`         | `sp_user_subjects.sql`               | `DELETE /api/users/:id/subjects/:sid`                    |
| `sp_filter_sessions`             | `sp_filter_sessions.sql`             | `GET /api/sessions`                                      |
| `sp_create_session`              | `sp_create_session.sql`              | `POST /api/sessions`                                     |
| `sp_add_student_session`         | `sp_add_student_session.sql`         | `POST /api/sessions/:id/join`                            |
| `sp_remove_student_session`      | `sp_remove_student_session.sql`      | `POST /api/sessions/:id/leave`                           |
| `sp_complete_session`            | `sp_complete_session.sql`            | `PATCH /api/sessions/:id`                                |
| `sp_cancel_session_notify`       | `sp_cancel_session_notify.sql`       | `DELETE /api/sessions/:id`                               |
| `sp_update_session_time_notify`  | `sp_update_session_time_notify.sql`  | `PATCH /api/sessions/:id`                                |
| `sp_update_session_summary`      | `sp_update_session_summary.sql`      | `PATCH /api/sessions/:id`                                |
| `sp_add_comment`                 | `sp_add_comment.sql`                 | `POST /api/sessions/:id/review`                          |
| `sp_comment_by_session`          | `sp_comment_by_session.sql`          | `GET /api/sessions/:id`, `GET /api/sessions/:id/reviews` |
| `sp_send_message`                | `sp_send_message.sql`                | `POST /api/messages`                                     |
| `sp_get_messages_between`        | `sp_get_messages_between.sql`        | `GET /api/messages`                                      |
| `sp_mark_as_read`                | `sp_mark_as_read.sql`                | `PATCH /api/messages/:id/read`                           |
| `sp_get_all_documents`           | `sp_get_all_documents.sql`           | `GET /api/library`                                       |
| `sp_get_documents_by_filter`     | `sp_get_documents_by_filter.sql`     | `GET /api/library`                                       |
| `sp_add_document`                | `sp_add_document.sql`                | `POST /api/library`                                      |
| `sp_list_notifications_for_user` | `sp_list_notifications_for_user.sql` | `GET /api/notifications`                                 |
| `sp_create_reschedule_request`   | `sp_create_reschedule_request.sql`   | `POST /api/reschedule-requests`                          |
| `sp_accept_reschedule_request`   | `sp_accept_reschedule_request.sql`   | `PATCH /api/reschedule-requests/:id`                     |
| `sp_reject_reschedule_request`   | `sp_reject_reschedule_request.sql`   | `PATCH /api/reschedule-requests/:id`                     |
| `sp_list_requests_for_tutor`     | `sp_list_requests_for_tutor.sql`     | `GET /api/reschedule-requests`                           |

### Procedures có trong database nhưng **không dùng** trong API

| Procedure                | Lý do                                                                      |
| ------------------------ | -------------------------------------------------------------------------- |
| `sp_cancel_session`      | Thay bằng `sp_cancel_session_notify` (có validation + transaction tốt hơn) |
| `sp_update_session_time` | Thay bằng `sp_update_session_time_notify` (có overlap check)               |
| `sp_delete_document`     | Bug kiểu dữ liệu BIGINT vs CHAR(36); dùng direct query                     |

---

## Những thay đổi so với route stubs gốc

| File                       | Thay đổi                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `db/connection.py`         | Thêm method `execute_dml()` trả về `rowcount`                |
| `routes/messages.py`       | Route `/<int:message_id>/read` → `/<string:message_id>/read` |
| `routes/library.py`        | Route `/<int:resource_id>` → `/<string:resource_id>`         |
| `routes/sessions.py`       | Query param `subject` → `subjectId` (UUID CHAR 36 trực tiếp) |
| `routes/evaluations.py`    | Giữ nguyên 501 (ngoài scope)                                 |
| `routes/match_requests.py` | Giữ nguyên 501 (ngoài scope)                                 |
