# Data Models - HCMUT Tutoring System

## 1. Accounts (Tài khoản)

Bảng lưu trữ thông tin chung cho tất cả người dùng.

| Field      | Type         | Key | Description                         |
| ---------- | ------------ | --- | ----------------------------------- |
| userID     | int          | PK  | Mã định danh người dùng             |
| full_name  | varchar      |     | Họ và tên                           |
| username   | varchar      |     | Tên đăng nhập                       |
| password   | varchar      |     | Mật khẩu (đã hash)                  |
| email      | varchar      |     | Địa chỉ email (unique)              |
| department | varchar      |     | Phòng ban / Khoa                    |
| role       | enum/varchar |     | Vai trò: Admin, Student, Tutor, ... |

---

## 2. Students (Sinh viên)

| Field     | Type     | Key | Description                           |
| --------- | -------- | --- | ------------------------------------- |
| studentID | char(36) | PK  | Mã định danh sinh viên                |
| userID    | int      | FK1 | Tham chiếu đến bảng Accounts (userID) |

---

## 3. Tutors (Gia sư / Giảng viên)

| Field   | Type     | Key | Description                           |
| ------- | -------- | --- | ------------------------------------- |
| tutorID | char(36) | PK  | Mã định danh gia sư                   |
| userID  | int      | FK1 | Tham chiếu đến bảng Accounts (userID) |

---

## 4. Subjects (Môn học)

| Field        | Type    | Key | Description |
| ------------ | ------- | --- | ----------- |
| subjectID    | int     | PK  | Mã môn học  |
| subject_name | varchar |     | Tên môn học |

---

## 5. Resources (Tài liệu)

| Field      | Type    | Key | Description                        |
| ---------- | ------- | --- | ---------------------------------- |
| resourceID | int     | PK  | Mã tài liệu                        |
| title      | varchar |     | Tiêu đề tài liệu                   |
| author     | varchar |     | Tác giả                            |
| type       | varchar |     | Loại tài liệu: PDF, Video, Doc ... |
| url        | varchar |     | Đường dẫn đến tài liệu             |

---

## 6. Sessions (Buổi học / Phiên làm việc)

| Field       | Type     | Key | Description                                 |
| ----------- | -------- | --- | ------------------------------------------- |
| sessionID   | char(36) | PK  | Mã buổi học                                 |
| tutorID     | char(36) | FK1 | Gia sư đứng lớp (tham chiếu Tutors.tutorID) |
| date        | date     |     | Ngày diễn ra                                |
| start_time  | time     |     | Giờ bắt đầu                                 |
| end_time    | time     |     | Giờ kết thúc                                |
| type        | varchar  |     | Hình thức: Online / Offline                 |
| max_student | int      |     | Số lượng sinh viên tối đa                   |
| note        | text     |     | Ghi chú                                     |
| summary     | text     |     | Tóm tắt nội dung buổi học                   |
| record_url  | varchar  |     | Đường dẫn bản ghi (nếu có)                  |
| meeting_url | varchar  |     | Link họp trực tuyến (Online session)        |
| room        | varchar  |     | Phòng học (Offline session)                 |

---

## 7. Messages (Tin nhắn)

| Field      | Type     | Key | Description                                |
| ---------- | -------- | --- | ------------------------------------------ |
| messageID  | int      | PK  | Mã tin nhắn                                |
| senderID   | int      | FK1 | ID người gửi (tham chiếu Accounts.userID)  |
| receiverID | int      | FK2 | ID người nhận (tham chiếu Accounts.userID) |
| timestamp  | datetime |     | Thời gian gửi                              |
| content    | text     |     | Nội dung tin nhắn                          |
| status     | varchar  |     | Trạng thái: Đã gửi, Đã xem, ...            |

---

## 8. Notifications (Thông báo)

| Field          | Type     | Key | Description                                |
| -------------- | -------- | --- | ------------------------------------------ |
| notificationID | int      | PK  | Mã thông báo                               |
| receiverID     | int      | FK1 | ID người nhận (tham chiếu Accounts.userID) |
| timestamp      | datetime |     | Thời gian thông báo                        |
| content        | text     |     | Nội dung thông báo                         |
| type           | varchar  |     | Loại thông báo                             |

---

## 9. Requests (Yêu cầu)

| Field      | Type     | Key | Description                                    |
| ---------- | -------- | --- | ---------------------------------------------- |
| requestID  | int      | PK  | Mã yêu cầu                                     |
| studentID  | char(36) | FK1 | ID sinh viên gửi yêu cầu (tham chiếu Students) |
| sessionID  | char(36) | FK2 | ID buổi học được yêu cầu (tham chiếu Sessions) |
| date       | date     |     | Ngày yêu cầu                                   |
| start_time | time     |     | Giờ bắt đầu mong muốn                          |
| end_time   | time     |     | Giờ kết thúc mong muốn                         |
| reason     | text     |     | Lý do yêu cầu                                  |

---

## 10. Bảng trung gian (Quan hệ N-M)

### 10.1 Study (Sinh viên cần hỗ trợ môn)

| Field     | Type     | Key     | Description                   |
| --------- | -------- | ------- | ----------------------------- |
| studentID | char(36) | PK, FK1 | Tham chiếu Students.studentID |
| subjectID | int      | PK, FK2 | Tham chiếu Subjects.subjectID |

### 10.2 Teach (Gia sư có thể dạy môn)

| Field     | Type     | Key     | Description                   |
| --------- | -------- | ------- | ----------------------------- |
| tutorID   | char(36) | PK, FK1 | Tham chiếu Tutors.tutorID     |
| subjectID | int      | PK, FK2 | Tham chiếu Subjects.subjectID |

### 10.3 Resource_Subject (Tài liệu thuộc môn)

| Field      | Type | Key     | Description                     |
| ---------- | ---- | ------- | ------------------------------- |
| resourceID | int  | PK, FK1 | Tham chiếu Resources.resourceID |
| subjectID  | int  | PK, FK2 | Tham chiếu Subjects.subjectID   |

### 10.4 Joins (Sinh viên tham gia buổi học)

| Field     | Type     | Key     | Description                   |
| --------- | -------- | ------- | ----------------------------- |
| studentID | char(36) | PK, FK1 | Tham chiếu Students.studentID |
| sessionID | char(36) | PK, FK2 | Tham chiếu Sessions.sessionID |
| comment   | text     |         | Nhận xét của sinh viên        |
| rating    | int      |         | Điểm đánh giá (1-5)           |

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────┐
│            Accounts              │
├──────────────────────────────────┤
│ userID (PK, int)                 │
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
│ subjectID (PK, int)              │
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
                            │ requestID (PK, int)              │
                            │ studentID (FK1, char(36))        │
                            │ sessionID (FK2, char(36))        │
                            │ date, start_time, end_time       │
                            │ reason                           │
                            └──────────────────────────────────┘

┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│            Messages              │   │          Notifications           │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│ messageID (PK, int)              │   │ notificationID (PK, int)         │
│ senderID   (FK1 → Accounts)      │   │ receiverID (FK1 → Accounts)      │
│ receiverID (FK2 → Accounts)      │   │ timestamp, content, type         │
│ timestamp, content, status       │   └──────────────────────────────────┘
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            Resources             │
├──────────────────────────────────┤
│ resourceID (PK, int)             │
│ title, author, type, url         │
└──────────────────────────────────┘
  (Resource_Subject → Subjects N-M)
```
