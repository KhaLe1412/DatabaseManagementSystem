-- File: 05_comment.sql
-- Mo ta: Tao bang danh gia va nhan xet sau phien hoc
-- Tac gia: Nguyen Huu Thoi
-- Ngay tao: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `comment`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `comment` (
    student_id CHAR(36) NOT NULL COMMENT 'ID sinh vien',
    session_id CHAR(36) NOT NULL COMMENT 'ID phien hoc',
    `comment` TEXT NOT NULL COMMENT 'Noi dung nhan xet',
    rating TINYINT UNSIGNED NOT NULL COMMENT 'Diem danh gia tu 1 den 5',
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

ALTER TABLE `comment` COMMENT = 'Bang luu danh gia cua sinh vien cho tung phien hoc';
