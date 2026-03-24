# HCMUT Tutoring System - System Architecture

## 1. Tổng Quan Hệ Thống

Hệ thống quản lý gia sư HCMUT Tutoring System là một ứng dụng web full-stack phục vụ nhu cầu kết nối sinh viên với gia sư tại trường Đại học Bách Khoa TP.HCM.

### 1.1 Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (Vite + React + TypeScript)                  │
│                       Port: 5173                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│                    (Python + Flask)                             │
│                       Port: 5001                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │  Services   │  │     Repositories        │  │
│  │  (API)      │──│  (Logic)    │──│   (Data Access)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                    (MySQL 8.0 / InnoDB)                         │
│                       Port: 3306                                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack

| Layer    | Technology                | Mục đích                  |
| -------- | ------------------------- | ------------------------- |
| Frontend | Vite + React + TypeScript | UI/UX, Single Page App    |
| Backend  | Python 3.11+ + Flask      | REST API, Business Logic  |
| Database | MySQL 8.0 (InnoDB)        | Data persistence          |
| ORM      | SQLAlchemy                | Object-Relational Mapping |
| Testing  | pytest + unittest         | Unit/Integration tests    |

## 2. Các Vai Trò Trong Hệ Thống (Roles)

| Role               | Mô tả                    |
| ------------------ | ------------------------ |
| `student`          | Sinh viên - người học    |
| `tutor`            | Gia sư - người dạy       |
| `academic-affairs` | Phòng đào tạo            |
| `student-affairs`  | Phòng công tác sinh viên |
| `admin`            | Quản trị viên hệ thống   |

## 3. Module Chức Năng

### 3.1 Authentication Module

- Đăng nhập / Đăng xuất
- Phân quyền theo role

### 3.2 User Management Module (Admin)

- CRUD Students
- CRUD Tutors
- Tìm kiếm người dùng

### 3.3 Session Management Module

- Tạo session (Tutor)
- Tham gia session (Student)
- Hủy session
- Reschedule session
- Student reviews & feedback

### 3.4 Matching Module

- Student tạo Match Request
- Tự động/thủ công ghép đôi với Tutor

### 3.5 Messaging Module

- Gửi tin nhắn giữa Student-Tutor
- Thông báo lịch đổi, tài liệu

### 3.6 Library Module

- Quản lý tài liệu học tập
- Tìm kiếm tài liệu

### 3.7 Progress & Evaluation Module

- Tutor đánh giá Student
- Theo dõi tiến độ học tập

## 4. Quy Ước Phát Triển

### 4.1 Naming Conventions

- **Files**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions/Variables**: `snake_case`
- **Constants**: `UPPER_SNAKE_CASE`
- **API endpoints**: `kebab-case` hoặc `snake_case`

### 4.2 Git Workflow

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### 4.3 Code Review

- Tất cả code phải qua Pull Request
- Cần ít nhất 1 reviewer approve
- Phải pass tất cả tests

## 5. Tham Khảo

- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - Chi tiết API
- [DATA_MODELS.md](./DATA_MODELS.md) - Cấu trúc dữ liệu
- [DATABASE_SCHEMA.md](../database/DATABASE_SCHEMA.md) - Database design
