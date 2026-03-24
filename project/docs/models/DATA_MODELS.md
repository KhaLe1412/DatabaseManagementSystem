# Data Models - HCMUT Tutoring System

## 1. User Models

### 1.1 Base User

| Field  | Type     | Required | Description              |
| ------ | -------- | -------- | ------------------------ |
| id     | string   | Yes      | Unique identifier (UUID) |
| name   | string   | Yes      | Full name                |
| email  | string   | Yes      | Email address (unique)   |
| role   | UserRole | Yes      | User's role              |
| avatar | string   | No       | Avatar URL               |

**UserRole Enum:**

```
'student' | 'tutor' | 'academic-affairs' | 'student-affairs' | 'admin'
```

---

### 1.2 Student (extends User)

| Field        | Type     | Required | Description                  |
| ------------ | -------- | -------- | ---------------------------- |
| studentId    | string   | Yes      | Student ID (e.g., "2012345") |
| department   | string   | Yes      | Department name              |
| year         | int      | Yes      | Academic year (1-6)          |
| supportNeeds | string[] | No       | Learning support needs       |
| gpa          | float    | Yes      | Current GPA (0.0 - 4.0)      |

---

### 1.3 Tutor (extends User)

| Field         | Type     | Required | Description                |
| ------------- | -------- | -------- | -------------------------- |
| tutorId       | string   | Yes      | Tutor ID                   |
| department    | string   | Yes      | Department name            |
| expertise     | string[] | Yes      | Areas of expertise         |
| rating        | float    | Yes      | Average rating (0.0 - 5.0) |
| totalSessions | int      | Yes      | Total sessions conducted   |

---

### 1.4 Admin (extends User)

| Field      | Type   | Required | Description     |
| ---------- | ------ | -------- | --------------- |
| adminId    | string | Yes      | Admin ID        |
| department | string | Yes      | Department name |

---

## 2. Session Models

### 2.1 Session

| Field            | Type            | Required | Description                      |
| ---------------- | --------------- | -------- | -------------------------------- |
| id               | string          | Yes      | Unique identifier (UUID)         |
| tutorId          | string          | Yes      | Reference to Tutor               |
| subject          | string          | Yes      | Subject being taught             |
| date             | string          | Yes      | Session date (YYYY-MM-DD)        |
| startTime        | string          | Yes      | Start time (HH:mm)               |
| endTime          | string          | Yes      | End time (HH:mm)                 |
| type             | SessionType     | Yes      | In-person or online              |
| status           | SessionStatus   | Yes      | Current status                   |
| location         | string          | No       | Physical location (if in-person) |
| meetingLink      | string          | No       | Meeting URL (if online)          |
| notes            | string          | No       | Session notes                    |
| feedback         | SessionFeedback | No       | Feedback after session           |
| summary          | string          | No       | Session summary                  |
| recordingUrl     | string          | No       | Recording URL                    |
| maxStudents      | int             | Yes      | Max students allowed             |
| enrolledStudents | string[]        | No       | List of enrolled student IDs     |
| reviews          | StudentReview[] | No       | Student reviews                  |

**SessionType Enum:**

```
'in-person' | 'online'
```

**SessionStatus Enum:**

```
'scheduled' | 'completed' | 'cancelled' | 'open' | 'full'
```

---

### 2.2 SessionFeedback

| Field          | Type     | Required | Description                 |
| -------------- | -------- | -------- | --------------------------- |
| id             | string   | Yes      | Unique identifier (UUID)    |
| sessionId      | string   | Yes      | Reference to Session        |
| studentRating  | int      | No       | Rating from student (1-5)   |
| studentComment | string   | No       | Comment from student        |
| tutorProgress  | string   | No       | Progress note from tutor    |
| tutorNotes     | string   | No       | Additional notes from tutor |
| submittedAt    | datetime | Yes      | Submission timestamp        |

---

### 2.3 StudentReview

| Field       | Type     | Required | Description          |
| ----------- | -------- | -------- | -------------------- |
| studentId   | string   | Yes      | Reference to Student |
| rating      | int      | Yes      | Rating (1-5)         |
| comment     | string   | No       | Review comment       |
| submittedAt | datetime | Yes      | Submission timestamp |

---

## 3. Match Request Model

### 3.1 MatchRequest

| Field          | Type               | Required | Description                |
| -------------- | ------------------ | -------- | -------------------------- |
| id             | string             | Yes      | Unique identifier (UUID)   |
| studentId      | string             | Yes      | Reference to Student       |
| subjects       | string[]           | Yes      | Subjects needing help      |
| preferredType  | PreferredType      | Yes      | Session type preference    |
| preferredTimes | string[]           | Yes      | Preferred time slots       |
| status         | MatchRequestStatus | Yes      | Current status             |
| matchedTutorId | string             | No       | Matched tutor (if matched) |

**PreferredType Enum:**

```
'in-person' | 'online' | 'both'
```

**MatchRequestStatus Enum:**

```
'pending' | 'matched' | 'rejected'
```

---

## 4. Messaging Models

### 4.1 Message

| Field            | Type        | Required | Description                     |
| ---------------- | ----------- | -------- | ------------------------------- |
| id               | string      | Yes      | Unique identifier (UUID)        |
| senderId         | string      | Yes      | Reference to sender User        |
| receiverId       | string      | Yes      | Reference to receiver User      |
| content          | string      | Yes      | Message content                 |
| timestamp        | datetime    | Yes      | Send timestamp                  |
| read             | boolean     | Yes      | Read status                     |
| type             | MessageType | No       | Message type                    |
| relatedSessionId | string      | No       | Related session (if applicable) |

**MessageType Enum:**

```
'regular' | 'reschedule-notification' | 'material-request'
```

---

### 4.2 RescheduleRequest

| Field         | Type                    | Required | Description              |
| ------------- | ----------------------- | -------- | ------------------------ |
| id            | string                  | Yes      | Unique identifier (UUID) |
| sessionId     | string                  | Yes      | Reference to Session     |
| requesterId   | string                  | Yes      | Reference to requester   |
| requesterRole | RequesterRole           | Yes      | Role of requester        |
| newDate       | string                  | Yes      | New proposed date        |
| newStartTime  | string                  | Yes      | New proposed start time  |
| newEndTime    | string                  | Yes      | New proposed end time    |
| reason        | string                  | Yes      | Reason for reschedule    |
| status        | RescheduleRequestStatus | Yes      | Current status           |
| createdAt     | datetime                | Yes      | Creation timestamp       |

**RequesterRole Enum:**

```
'student' | 'tutor'
```

**RescheduleRequestStatus Enum:**

```
'pending' | 'approved' | 'rejected'
```

---

## 5. Library Resource Model

### 5.1 LibraryResource

| Field     | Type         | Required | Description              |
| --------- | ------------ | -------- | ------------------------ |
| id        | string       | Yes      | Unique identifier (UUID) |
| title     | string       | Yes      | Resource title           |
| type      | ResourceType | Yes      | Type of resource         |
| subject   | string       | Yes      | Related subject          |
| author    | string       | Yes      | Author/Creator name      |
| url       | string       | Yes      | Resource URL             |
| thumbnail | string       | No       | Thumbnail image URL      |

**ResourceType Enum:**

```
'textbook' | 'document' | 'video' | 'article'
```

---

## 6. Evaluation Model

### 6.1 StudentEvaluation

| Field           | Type       | Required | Description                  |
| --------------- | ---------- | -------- | ---------------------------- |
| id              | string     | Yes      | Unique identifier (UUID)     |
| studentId       | string     | Yes      | Reference to Student         |
| tutorId         | string     | Yes      | Reference to Tutor           |
| sessionId       | string     | Yes      | Reference to Session         |
| skills          | SkillsObj  | Yes      | Skill ratings                |
| attitude        | int        | Yes      | Attitude rating (1-5)        |
| testResults     | TestResult | No       | Test result details          |
| overallProgress | string     | Yes      | Overall progress description |
| recommendations | string     | Yes      | Tutor recommendations        |
| createdAt       | datetime   | Yes      | Creation timestamp           |

### 6.2 Skills Object

| Field         | Type | Required | Range | Description         |
| ------------- | ---- | -------- | ----- | ------------------- |
| understanding | int  | Yes      | 1-5   | Understanding level |
| participation | int  | Yes      | 1-5   | Class participation |
| preparation   | int  | Yes      | 1-5   | Preparation level   |

### 6.3 TestResult Object

| Field    | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| score    | int    | Yes      | Score achieved   |
| maxScore | int    | Yes      | Maximum possible |
| notes    | string | No       | Additional notes |

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│    User     │       │   Session   │       │ LibraryResource │
├─────────────┤       ├─────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)         │
│ name        │       │ tutorId(FK) │───────│ title           │
│ email       │       │ subject     │       │ type            │
│ role        │       │ date        │       │ subject         │
│ avatar      │       │ status      │       │ author          │
└──────┬──────┘       │ maxStudents │       │ url             │
       │              └──────┬──────┘       └─────────────────┘
       │                     │
   Extends                   │
       │              ┌──────┴──────┐
       ▼              ▼             ▼
┌─────────────┐ ┌───────────────┐ ┌────────────────┐
│   Student   │ │SessionFeedback│ │ StudentReview  │
├─────────────┤ ├───────────────┤ ├────────────────┤
│ studentId   │ │ id (PK)       │ │ studentId (FK) │
│ department  │ │ sessionId(FK) │ │ rating         │
│ year        │ │ studentRating │ │ comment        │
│ gpa         │ │ tutorNotes    │ │ submittedAt    │
└──────┬──────┘ └───────────────┘ └────────────────┘
       │
       │        ┌─────────────────┐      ┌────────────────────┐
       │        │  MatchRequest   │      │ StudentEvaluation   │
       └───────▶├─────────────────┤      ├────────────────────┤
                │ id (PK)         │      │ id (PK)             │
                │ studentId (FK)  │      │ studentId (FK)      │
                │ subjects        │      │ tutorId (FK)        │
                │ preferredType   │      │ sessionId (FK)      │
                │ status          │      │ skills              │
                │ matchedTutorId  │      │ attitude            │
                └─────────────────┘      │ overallProgress     │
                                         └────────────────────┘

┌─────────────┐       ┌───────────────────┐
│   Message   │       │ RescheduleRequest │
├─────────────┤       ├───────────────────┤
│ id (PK)     │       │ id (PK)           │
│ senderId(FK)│       │ sessionId (FK)    │
│ receiverId  │       │ requesterId (FK)  │
│ content     │       │ newDate           │
│ timestamp   │       │ status            │
│ read        │       │ reason            │
│ type        │       │ createdAt         │
└─────────────┘       └───────────────────┘
```
