-- File: project/database/table/02_students.sql
-- Description: Students extension table (references users)
-- Author: Nhan
-- Date: 2026-04-10
USE dbms_project;

DROP TABLE IF EXISTS students;

CREATE TABLE students (
    user_id CHAR(36) PRIMARY KEY COMMENT 'UUID từ bảng users',
    student_id VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã số sinh viên (MSSV)',
    department VARCHAR(150) NOT NULL COMMENT 'Khoa',
    year INT NOT NULL COMMENT 'Năm học (1-6)',
    gpa DECIMAL(3,2) NOT NULL COMMENT 'GPA hiện tại',
    support_needs JSON DEFAULT NULL COMMENT 'Mảng JSON lưu nhu cầu học tập',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_students_department ON students(department);
-- Nên index thêm MSSV vì trường học thường xuyên search sinh viên qua mã này
CREATE INDEX idx_students_student_id ON students(student_id);
