-- File: 03_resources.sql
-- Mô tả: Tạo bảng resource và view tương thích resources
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS resources;
DROP TABLE IF EXISTS resource;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE resource (
    resource_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã tài nguyên',
    title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tài liệu',
    author VARCHAR(255) NOT NULL COMMENT 'Tác giả hoặc người biên soạn',
    `type` VARCHAR(100) NOT NULL COMMENT 'Loại tài nguyên',
    url VARCHAR(500) NOT NULL COMMENT 'Đường dẫn truy cập',
    subject VARCHAR(100) NULL COMMENT 'Chủ đề liên quan',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_resource_url UNIQUE (url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_resource_type ON resource(`type`);
CREATE INDEX idx_resource_subject ON resource(subject);
CREATE INDEX idx_resource_title ON resource(title);

ALTER TABLE resource COMMENT = 'Bảng lưu trữ tài nguyên học tập';

CREATE VIEW resources AS
SELECT
    resource_id,
    title,
    author,
    `type`,
    url,
    subject,
    created_at,
    updated_at
FROM resource;
