-- File: 06_resource_subject.sql
-- Mô tả: Tạo bảng ánh xạ tài nguyên với chủ đề
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS resource_subject;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE resource_subject (
    resource_id BIGINT NOT NULL COMMENT 'Mã tài nguyên',
    subject_name VARCHAR(100) NOT NULL COMMENT 'Tên chủ đề',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id, subject_name),
    CONSTRAINT fk_resource_subject_resource FOREIGN KEY (resource_id) REFERENCES resource(resource_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_resource_subject_name ON resource_subject(subject_name);

ALTER TABLE resource_subject COMMENT = 'Bảng gán nhiều chủ đề cho một tài nguyên';
