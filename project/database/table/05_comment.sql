-- File: 05_comment.sql
-- Mô tả: Tạo bảng đánh giá và nhận xét sau phiên học
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `comment`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `comment` (
    student_id CHAR(36) NOT NULL COMMENT 'Mã sinh viên (UUID)',
    session_id CHAR(36) NOT NULL COMMENT 'Mã phiên học (UUID)',
    `comment` TEXT NOT NULL COMMENT 'Nội dung nhận xét',
    rating TINYINT UNSIGNED NOT NULL COMMENT 'Điểm đánh giá từ 1 đến 5',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, session_id),
    CONSTRAINT chk_comment_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_comment_student FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_comment_session FOREIGN KEY (session_id) REFERENCES sessions(session_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_comment_session_rating ON `comment`(session_id, rating);

ALTER TABLE `comment` COMMENT = 'Bảng đánh giá của sinh viên cho từng phiên học';
