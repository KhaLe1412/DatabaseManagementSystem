-- Tên file: 03_students_tutors.sql
-- Mô tả: Tạo bảng students_tutors để lưu thông tin mối quan hệ giữa sinh viên và gia sư
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS tutors;

-- Bảng thông tin sinh viên
CREATE TABLE students (
    student_id CHAR(36) PRIMARY KEY COMMENT 'Khóa ngoại tham chiếu bảng users',
    mssv VARCHAR(20) UNIQUE NOT NULL COMMENT 'Mã số sinh viên',
    department VARCHAR(100) NOT NULL COMMENT 'Khoa trực thuộc',
    year INT NOT NULL DEFAULT 1 COMMENT 'Năm học hiện tại (1-6)',
    gpa DECIMAL(3, 2) COMMENT 'Điểm trung bình tích lũy (0.0 - 4.0)',
    support_needs JSON COMMENT 'Danh sách các nhu cầu hỗ trợ (lưu dạng mảng JSON)',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_students_mssv ON students(mssv);
CREATE INDEX idx_students_department ON students(department);
ALTER TABLE students COMMENT = 'Bảng lưu thông tin chuyên biệt của sinh viên';

-- Bảng thông tin gia sư
CREATE TABLE tutors (
    tutor_id CHAR(36) PRIMARY KEY COMMENT 'Khóa ngoại tham chiếu bảng users',
    tutor_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'Mã gia sư nội bộ',
    department VARCHAR(100) NOT NULL COMMENT 'Khoa trực thuộc',
    rating DECIMAL(3, 2) DEFAULT 0.0 COMMENT 'Điểm đánh giá trung bình (0.0 - 5.0)',
    total_sessions INT DEFAULT 0 COMMENT 'Tổng số buổi đã giảng dạy',
    expertise JSON COMMENT 'Danh sách chuyên môn (lưu dạng mảng JSON)',
    FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tutors_code ON tutors(tutor_code);
CREATE INDEX idx_tutors_department ON tutors(department);
ALTER TABLE tutors COMMENT = 'Bảng lưu thông tin chuyên biệt của gia sư';