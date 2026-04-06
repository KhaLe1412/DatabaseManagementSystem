# API Specification - HCMUT Tutoring System

Base URL: `http://localhost:5001/api`

## 1. Authentication API

### POST /auth/login

Đăng nhập vào hệ thống.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200 OK:**

```json
{
  "userId": "string",
  "role": "student | tutor | academic-affairs | student-affairs | admin",
  "name": "string",
  "email": "string",
  "token": "string (JWT, optional)"
}
```

**Response 401 Unauthorized:**

```json
{
  "error": "Invalid credentials"
}
```

---

### POST /auth/logout

Đăng xuất khỏi hệ thống.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200 OK:**

```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Users API

### GET /users

Lấy danh sách người dùng (Admin only).

**Query Parameters:**
| Param | Type | Description |
|----------|----------|--------------------------------|
| role | string | Filter by role (optional) |
| search | string | Search by name/email (optional)|
| page | int | Page number (default: 1) |
| limit | int | Items per page (default: 20) |

**Response 200 OK:**

```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### GET /users/:id

Lấy thông tin chi tiết user.

**Response 200 OK (Student):**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "student",
  "avatar": "string (url, optional)",
  "studentId": "string",
  "department": "string",
  "year": 1,
  "supportNeeds": ["string"],
  "gpa": 3.5
}
```

**Response 200 OK (Tutor):**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "tutor",
  "avatar": "string (url, optional)",
  "tutorId": "string",
  "department": "string",
  "expertise": ["string"],
  "rating": 4.5,
  "totalSessions": 50
}
```

---

### POST /users

Tạo user mới (Admin only).

**Request Body (Student):**

```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "student",
  "studentId": "string",
  "department": "string",
  "year": 1,
  "supportNeeds": ["string"],
  "gpa": 3.5
}
```

**Request Body (Tutor):**

```json
{
  "name": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "tutor",
  "tutorId": "string",
  "department": "string",
  "expertise": ["string"]
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "User created successfully"
}
```

---

### PUT /users/:id

Cập nhật thông tin user.

**Request Body:**

```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "department": "string (optional)",
  "supportNeeds": ["string"] (optional, student only),
  "expertise": ["string"] (optional, tutor only)
}
```

**Response 200 OK:**

```json
{
  "message": "User updated successfully"
}
```

---

### DELETE /users/:id

Xóa user (Admin only).

**Response 200 OK:**

```json
{
  "message": "User deleted successfully"
}
```

---

## 3. Sessions API

### GET /sessions

Lấy danh sách sessions.

**Query Parameters:**
| Param | Type | Description |
|------------|----------|-------------------------------------|
| tutorId | string | Filter by tutor (optional) |
| studentId | string | Filter enrolled student (optional) |
| status | string | Filter by status (optional) |
| subject | string | Filter by subject (optional) |
| startDate | string | Filter from date (optional) |
| endDate | string | Filter to date (optional) |

**Response 200 OK:**

```json
{
  "sessions": [
    {
      "id": "string",
      "tutorId": "string",
      "subject": "string",
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "10:30",
      "type": "in-person | online",
      "status": "scheduled | completed | cancelled | open | full",
      "location": "string (optional)",
      "meetingLink": "string (optional)",
      "maxStudents": 10,
      "enrolledStudents": ["studentId1", "studentId2"]
    }
  ]
}
```

---

### GET /sessions/:id

Lấy chi tiết session.

**Response 200 OK:**

```json
{
  "id": "string",
  "tutorId": "string",
  "subject": "string",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "type": "in-person | online",
  "status": "open",
  "location": "Room A101",
  "meetingLink": null,
  "notes": "string (optional)",
  "maxStudents": 10,
  "enrolledStudents": ["s1", "s2"],
  "feedback": {
    "id": "string",
    "sessionId": "string",
    "studentRating": 5,
    "studentComment": "Great session!",
    "tutorProgress": "Good progress",
    "tutorNotes": "Need more practice",
    "submittedAt": "2024-01-15T10:30:00Z"
  },
  "summary": "string (optional)",
  "recordingUrl": "string (optional)",
  "reviews": [
    {
      "studentId": "s1",
      "rating": 5,
      "comment": "Excellent!",
      "submittedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### POST /sessions

Tạo session mới (Tutor only).

**Request Body:**

```json
{
  "tutorId": "string",
  "subject": "string",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:30",
  "type": "in-person | online",
  "location": "string (optional, required if in-person)",
  "meetingLink": "string (optional, required if online)",
  "notes": "string (optional)",
  "maxStudents": 10
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "Session created successfully"
}
```

---

### PATCH /sessions/:id

Cập nhật session.

**Request Body:**

```json
{
  "updateData": {
    "status": "string (optional)",
    "enrolledStudents": ["string"] (optional),
    "notes": "string (optional)",
    "summary": "string (optional)",
    "date": "string (optional)",
    "startTime": "string (optional)",
    "endTime": "string (optional)"
  }
}
```

**Response 200 OK:**

```json
{
  "message": "Session updated successfully"
}
```

---

### DELETE /sessions/:id

Xóa/Hủy session.

**Response 200 OK:**

```json
{
  "message": "Session deleted successfully"
}
```

---

### POST /sessions/:id/join

Student tham gia session.

**Request Body:**

```json
{
  "studentId": "string"
}
```

**Response 200 OK:**

```json
{
  "message": "Joined session successfully"
}
```

---

### POST /sessions/:id/leave

Student rời khỏi session.

**Request Body:**

```json
{
  "studentId": "string"
}
```

**Response 200 OK:**

```json
{
  "message": "Left session successfully"
}
```

---

### POST /sessions/:id/review

Student đánh giá session.

**Request Body:**

```json
{
  "studentId": "string",
  "rating": 5,
  "comment": "string"
}
```

**Response 201 Created:**

```json
{
  "message": "Review submitted successfully"
}
```

---

## 4. Match Requests API

### GET /match-requests

Lấy danh sách match requests.

**Query Parameters:**
| Param | Type | Description |
|-----------|----------|--------------------------------|
| studentId | string | Filter by student (optional) |
| status | string | Filter by status (optional) |

**Response 200 OK:**

```json
{
  "matchRequests": [
    {
      "id": "string",
      "studentId": "string",
      "subjects": ["Math", "Physics"],
      "preferredType": "online | in-person | both",
      "preferredTimes": ["Monday 9:00-11:00"],
      "status": "pending | matched | rejected",
      "matchedTutorId": "string (optional)"
    }
  ]
}
```

---

### POST /match-requests

Tạo match request mới.

**Request Body:**

```json
{
  "studentId": "string",
  "subjects": ["string"],
  "preferredType": "online | in-person | both",
  "preferredTimes": ["string"],
  "description": "string (optional)"
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "Match request created"
}
```

---

### PATCH /match-requests/:id

Cập nhật match request (approve/reject).

**Request Body:**

```json
{
  "status": "matched | rejected",
  "matchedTutorId": "string (required if matched)"
}
```

**Response 200 OK:**

```json
{
  "message": "Match request updated"
}
```

---

## 5. Messages API

### GET /messages

Lấy tin nhắn của user.

**Query Parameters:**
| Param | Type | Description |
|------------|----------|--------------------------------|
| userId | string | User ID (required) |
| partnerId | string | Conversation partner (optional)|

**Response 200 OK:**

```json
{
  "messages": [
    {
      "id": "string",
      "senderId": "string",
      "receiverId": "string",
      "content": "string",
      "timestamp": "2024-01-15T10:30:00Z",
      "read": false,
      "type": "regular | reschedule-notification | material-request",
      "relatedSessionId": "string (optional)"
    }
  ]
}
```

---

### POST /messages

Gửi tin nhắn mới.

**Request Body:**

```json
{
  "senderId": "string",
  "receiverId": "string",
  "content": "string",
  "type": "regular | reschedule-notification | material-request",
  "relatedSessionId": "string (optional)"
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "Message sent successfully"
}
```

---

### PATCH /messages/:id/read

Đánh dấu tin nhắn đã đọc.

**Response 200 OK:**

```json
{
  "message": "Message marked as read"
}
```

---

## 6. Reschedule Requests API

### GET /reschedule-requests

Lấy danh sách yêu cầu đổi lịch.

**Query Parameters:**
| Param | Type | Description |
|-----------|----------|--------------------------------|
| sessionId | string | Filter by session (optional) |
| userId | string | Filter by requester (optional) |
| status | string | Filter by status (optional) |

**Response 200 OK:**

```json
{
  "rescheduleRequests": [
    {
      "id": "string",
      "sessionId": "string",
      "requesterId": "string",
      "requesterRole": "student | tutor",
      "newDate": "2024-01-20",
      "newStartTime": "14:00",
      "newEndTime": "15:30",
      "reason": "string",
      "status": "pending | approved | rejected",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /reschedule-requests

Tạo yêu cầu đổi lịch.

**Request Body:**

```json
{
  "sessionId": "string",
  "requesterId": "string",
  "requesterRole": "student | tutor",
  "newDate": "2024-01-20",
  "newStartTime": "14:00",
  "newEndTime": "15:30",
  "reason": "string"
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "Reschedule request created"
}
```

---

### PATCH /reschedule-requests/:id

Xử lý yêu cầu đổi lịch.

**Request Body:**

```json
{
  "status": "approved | rejected"
}
```

**Response 200 OK:**

```json
{
  "message": "Reschedule request updated"
}
```

---

## 7. Library Resources API

### GET /library

Lấy danh sách tài liệu.

**Query Parameters:**
| Param | Type | Description |
|---------|----------|--------------------------------|
| search | string | Search by title/author (opt) |
| type | string | Filter by type (optional) |
| subject | string | Filter by subject (optional) |

**Response 200 OK:**

```json
{
  "resources": [
    {
      "id": "string",
      "title": "string",
      "type": "textbook | document | video | article",
      "subject": "string",
      "author": "string",
      "url": "string",
      "thumbnail": "string (optional)"
    }
  ]
}
```

---

### POST /library

Thêm tài liệu mới.

**Request Body:**

```json
{
  "title": "string",
  "type": "textbook | document | video | article",
  "subject": "string",
  "author": "string",
  "url": "string",
  "thumbnail": "string (optional)"
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "Resource added successfully"
}
```

---

## 8. Student Evaluations API

### GET /evaluations

Lấy danh sách đánh giá.

**Query Parameters:**
| Param | Type | Description |
|-----------|----------|--------------------------------|
| studentId | string | Filter by student (optional) |
| tutorId | string | Filter by tutor (optional) |
| sessionId | string | Filter by session (optional) |

**Response 200 OK:**

```json
{
  "evaluations": [
    {
      "id": "string",
      "studentId": "string",
      "tutorId": "string",
      "sessionId": "string",
      "skills": {
        "understanding": 4,
        "participation": 5,
        "preparation": 3
      },
      "attitude": 4,
      "testResults": {
        "score": 85,
        "maxScore": 100,
        "notes": "Good improvement"
      },
      "overallProgress": "string",
      "recommendations": "string",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /evaluations

Tạo đánh giá mới (Tutor only).

**Request Body:**

```json
{
  "studentId": "string",
  "tutorId": "string",
  "sessionId": "string",
  "skills": {
    "understanding": 4,
    "participation": 5,
    "preparation": 3
  },
  "attitude": 4,
  "testResults": {
    "score": 85,
    "maxScore": 100,
    "notes": "string (optional)"
  },
  "overallProgress": "string",
  "recommendations": "string"
}
```

**Response 201 Created:**

```json
{
  "id": "string",
  "message": "Evaluation created successfully"
}
```

---

## Error Responses

Tất cả endpoints trả về error theo format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} (optional)
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|--------------------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |
