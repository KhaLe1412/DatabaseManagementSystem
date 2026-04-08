-- Tên file: 01_users.sql
-- Mô tả: Tạo bảng users để lưu thông tin người dùng
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

-- Xóa bảng nếu tồn tại để tránh lỗi khi chạy lại init
DROP TABLE IF EXISTS users;

-- Tạo bảng users gốc
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID duy nhất của người dùng',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Tên đăng nhập',
    password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu (đã hash)',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email liên hệ duy nhất',
    name VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    role ENUM('student', 'tutor', 'academic-affairs', 'student-affairs', 'admin') NOT NULL COMMENT 'Vai trò người dùng',
    avatar VARCHAR(255) COMMENT 'Đường dẫn URL ảnh đại diện',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật gần nhất'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo index để tăng tốc độ tìm kiếm khi login hoặc tra cứu
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Comments cho bảng
ALTER TABLE users COMMENT = 'Bảng lưu trữ thông tin tài khoản người dùng cốt lõi';