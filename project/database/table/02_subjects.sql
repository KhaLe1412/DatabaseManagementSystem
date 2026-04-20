-- Tên file: 02_subjects.sql
-- Mô tả: Tạo bảng subjects để lưu thông tin môn học
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

DROP TABLE IF EXISTS subjects;

CREATE TABLE subjects (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID của môn học',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Tên môn học (Vd: Cấu trúc dữ liệu)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_subjects_name ON subjects(name);

ALTER TABLE subjects COMMENT = 'Bảng danh mục các môn học trong hệ thống';