-- Tên file: 04_user_subjects.sql
-- Mô tả: Tạo bảng user_subjects để lưu thông tin mối quan hệ giữa người dùng (sinh viên/gia sư) và môn học
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

DROP TABLE IF EXISTS user_subjects;

CREATE TABLE user_subjects (
    user_id CHAR(36) COMMENT 'ID của sinh viên hoặc gia sư',
    subject_id CHAR(36) COMMENT 'ID của môn học tương ứng',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian đăng ký môn',
    PRIMARY KEY (user_id, subject_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_user_subjects_user ON user_subjects(user_id);
CREATE INDEX idx_user_subjects_subject ON user_subjects(subject_id);

ALTER TABLE user_subjects COMMENT = 'Bảng trung gian (n-n) lưu danh sách môn học của người dùng';