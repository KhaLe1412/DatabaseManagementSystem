-- File: project/database/table/03_tutors.sql
-- Description: Tutors extension table (references users)
-- Author: Nhan
-- Date: 2026-04-10
USE dbms_project;

DROP TABLE IF EXISTS tutors;

CREATE TABLE tutors (
    user_id CHAR(36) PRIMARY KEY COMMENT 'UUID từ bảng users',
    tutor_id VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã gia sư', 
    department VARCHAR(150) NOT NULL COMMENT 'Khoa', 
    expertise JSON NOT NULL COMMENT 'Mảng JSON lưu chuyên môn giảng dạy', 
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.0 COMMENT 'Đánh giá trung bình (0.0 - 5.0)',
    total_sessions INT NOT NULL DEFAULT 0 COMMENT 'Tổng số buổi đã dạy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tutors_department ON tutors(department);
CREATE INDEX idx_tutors_tutor_id ON tutors(tutor_id);
