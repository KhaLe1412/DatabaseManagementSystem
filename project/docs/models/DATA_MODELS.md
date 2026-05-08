# Data Models - HCMUT Tutoring System

## 1. Users (Tài khoản)

Bảng lưu trữ thông tin chung cho tất cả người dùng.

| Field      | Type         | Key | Description                         |
| ---------- | ------------ | --- | ----------------------------------- |
| userID     | char(36)     | PK  | Mã định danh người dùng             |
| full_name  | varchar      |     | Họ và tên                           |
| username   | varchar      |     | Tên đăng nhập                       |
| password   | varchar      |     | Mật khẩu (đã hash)                  |
| email      | varchar      |     | Địa chỉ email (unique)              |
| department | varchar      |     | Phòng ban / Khoa                    |
| role       | enum/varchar |     | Vai trò: Admin, Student, Tutor, ... |

---

## 2. Students (Sinh viên)

| Field     | Type     | Key | Description                        |
| --------- | -------- | --- | ---------------------------------- |
| studentID | char(36) | PK  | Mã định danh sinh viên             |
| userID    | char(36) | FK1 | Tham chiếu đến bảng Users (userID) |

---

## 3. Tutors (Gia sư / Giảng viên)

| Field   | Type     | Key | Description                        |
| ------- | -------- | --- | ---------------------------------- |
| tutorID | char(36) | PK  | Mã định danh gia sư                |
| userID  | char(36) | FK1 | Tham chiếu đến bảng Users (userID) |

---

## 4. Subjects (Môn học)

| Field        | Type     | Key | Description |
| ------------ | -------- | --- | ----------- |
| subjectID    | char(36) | PK  | Mã môn học  |
| subject_name | varchar  |     | Tên môn học |

---

## 5. Resources (Tài liệu)

| Field      | Type     | Key | Description                        |
| ---------- | -------- | --- | ---------------------------------- |
| resourceID | char(36) | PK  | Mã tài liệu                        |
| title      | varchar  |     | Tiêu đề tài liệu                   |
| author     | varchar  |     | Tác giả                            |
| type       | varchar  |     | Loại tài liệu: PDF, Video, Doc ... |
| url        | varchar  |     | Đường dẫn đến tài liệu             |

---

## 6. Sessions (Buổi học / Phiên làm việc)

| Field       | Type     | Key | Description                                  |
| ----------- | -------- | --- | -------------------------------------------- |
| sessionID   | char(36) | PK  | Mã buổi học                                  |
| tutorID     | char(36) | FK1 | Gia sư đứng lớp (tham chiếu Tutors.tutorID)  |
| subjectID   | char(36) | FK2 | Môn học (tham chiếu Subjects.subjectID)      |
| date        | date     |     | Ngày diễn ra                                 |
| start_time  | time     |     | Giờ bắt đầu                                  |
| end_time    | time     |     | Giờ kết thúc                                 |
| type        | varchar  |     | Hình thức: Online / Offline                  |
| status      | varchar  |     | Trạng thái: open, full, completed, cancelled |
| max_student | int      |     | Số lượng sinh viên tối đa                    |
| note        | text     |     | Ghi chú                                      |
| summary     | text     |     | Tóm tắt nội dung buổi học                    |
| record_url  | varchar  |     | Đường dẫn bản ghi (nếu có)                   |
| meeting_url | varchar  |     | Link họp trực tuyến (Online session)         |
| room        | varchar  |     | Phòng học (Offline session)                  |

---

## 7. Messages (Tin nhắn)

| Field      | Type     | Key | Description                             |
| ---------- | -------- | --- | --------------------------------------- |
| messageID  | char(36) | PK  | Mã tin nhắn                             |
| senderID   | char(36) | FK1 | ID người gửi (tham chiếu Users.userID)  |
| receiverID | char(36) | FK2 | ID người nhận (tham chiếu Users.userID) |
| timestamp  | datetime |     | Thời gian gửi                           |
| content    | text     |     | Nội dung tin nhắn                       |
| status     | varchar  |     | Trạng thái: Đã gửi, Đã xem, ...         |

---

## 8. Notifications (Thông báo)

| Field          | Type     | Key | Description                             |
| -------------- | -------- | --- | --------------------------------------- |
| notificationID | char(36) | PK  | Mã thông báo                            |
| receiverID     | char(36) | FK1 | ID người nhận (tham chiếu Users.userID) |
| timestamp      | datetime |     | Thời gian thông báo                     |
| content        | text     |     | Nội dung thông báo                      |
| type           | varchar  |     | Loại thông báo                          |
| is_read        | boolean  |     | Trạng thái đã đọc (mặc định: false)     |

---

## 9. Requests (Yêu cầu)

| Field      | Type     | Key | Description                                              |
| ---------- | -------- | --- | -------------------------------------------------------- |
| requestID  | char(36) | PK  | Mã yêu cầu                                               |
| studentID  | char(36) | FK1 | ID sinh viên gửi yêu cầu (tham chiếu Students.studentID) |
| sessionID  | char(36) | FK2 | ID buổi học được yêu cầu (tham chiếu Sessions.sessionID) |
| date       | date     |     | Ngày đề xuất mới                                         |
| start_time | time     |     | Giờ bắt đầu mong muốn                                    |
| end_time   | time     |     | Giờ kết thúc mong muốn                                   |
| reason     | text     |     | Lý do yêu cầu                                            |
| status     | varchar  |     | Trạng thái: pending, approved, rejected                  |

---

## 10. Bảng trung gian (Quan hệ N-M)

### 10.1 Study (Sinh viên cần hỗ trợ môn)

| Field     | Type     | Key     | Description                   |
| --------- | -------- | ------- | ----------------------------- |
| studentID | char(36) | PK, FK1 | Tham chiếu Students.studentID |
| subjectID | char(36) | PK, FK2 | Tham chiếu Subjects.subjectID |

### 10.2 Teach (Gia sư có thể dạy môn)

| Field     | Type     | Key     | Description                   |
| --------- | -------- | ------- | ----------------------------- |
| tutorID   | char(36) | PK, FK1 | Tham chiếu Tutors.tutorID     |
| subjectID | char(36) | PK, FK2 | Tham chiếu Subjects.subjectID |

### 10.3 Resource_Subject (Tài liệu thuộc môn)

| Field      | Type     | Key     | Description                     |
| ---------- | -------- | ------- | ------------------------------- |
| resourceID | char(36) | PK, FK1 | Tham chiếu Resources.resourceID |
| subjectID  | char(36) | PK, FK2 | Tham chiếu Subjects.subjectID   |

### 10.4 Session_Participants (Sinh viên tham gia buổi học)

| Field     | Type     | Key     | Description                   |
| --------- | -------- | ------- | ----------------------------- |
| studentID | char(36) | PK, FK1 | Tham chiếu Students.studentID |
| sessionID | char(36) | PK, FK2 | Tham chiếu Sessions.sessionID |

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────┐
│            Users                 │
├──────────────────────────────────┤
│ userID (PK, char(36))            │
│ full_name, username, password    │
│ email, department, role          │
└───────────┬──────────────────────┘
            │ 1
     ───────┴───────
     │              │
     ▼              ▼
┌──────────┐   ┌──────────┐
│ Students │   │  Tutors  │
├──────────┤   ├──────────┤
│studentID │   │ tutorID  │
│(PK,ch36) │   │(PK,ch36) │
│ userID   │   │ userID   │
│  (FK1)   │   │  (FK1)   │
└────┬─────┘   └────┬─────┘
     │              │
     │N            N│
     ▼              ▼
┌──────────────────────────────────┐
│             Subjects             │
├──────────────────────────────────┤
│ subjectID (PK, char(36))         │
│ subject_name                     │
└──────────────────────────────────┘
     ▲              ▲
     │N            N│
 (Study)        (Teach)
 (Resource_Subject)

┌──────────┐    N        1  ┌──────────────────────────────────┐
│ Students │───────────────▶│            Sessions              │
│          │  (Joins)       ├──────────────────────────────────┤
│studentID │◀──────────     │ sessionID (PK, char(36))         │
└──────────┘    rating,     │ tutorID   (FK1, char(36))        │
                comment     │ date, start_time, end_time       │
                            │ type, max_student, note          │
                            │ summary, record_url              │
                            │ meeting_url, room                │
                            └──────────────────────────────────┘
                                         ▲
                                         │
                            ┌────────────┴─────────────────────┐
                            │           Requests               │
                            ├──────────────────────────────────┤
                            │ requestID (PK, char(36))         │
                            │ studentID (FK1, char(36))        │
                            │ sessionID (FK2, char(36))        │
                            │ date, start_time, end_time       │
                            │ reason, status                   │
                            └──────────────────────────────────┘

┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│            Messages              │   │          Notifications           │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│ messageID (PK, char(36))         │   │ notificationID (PK, char(36))    │
│ senderID   (FK1 → Users)         │   │ receiverID (FK1 → Users)         │
│ receiverID (FK2 → Users)         │   │ timestamp, content, type         │
│ timestamp, content, status       │   │ is_read                          │
└──────────────────────────────────┘   └──────────────────────────────────┘
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            Resources             │
├──────────────────────────────────┤
│ resourceID (PK, char(36))        │
│ title, author, type, url         │
└──────────────────────────────────┘
  (Resource_Subject → Subjects N-M)
```
