-- File: 03_resources.sql
-- Mo ta: Tao bang resource va view tuong thich resources
-- Tac gia: Nguyen Huu Thoi
-- Ngay tao: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS resources;
DROP TABLE IF EXISTS resource;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE resource (
    resource_id CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'Ma tai lieu (UUID)',
    title VARCHAR(255) NOT NULL COMMENT 'Tieu de tai lieu',
    author VARCHAR(255) NOT NULL COMMENT 'Tac gia tai lieu',
    `type` VARCHAR(100) NOT NULL COMMENT 'Loai tai lieu',
    url VARCHAR(500) NOT NULL COMMENT 'Duong dan tai lieu',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id),
    CONSTRAINT uq_resource_url UNIQUE (url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_resource_type ON resource(`type`);
CREATE INDEX idx_resource_title ON resource(title);
CREATE INDEX idx_resource_author ON resource(author);

ALTER TABLE resource COMMENT = 'Bang luu tru tai lieu hoc tap';

CREATE VIEW resources AS
SELECT
    resource_id,
    title,
    author,
    `type`,
    url,
    created_at,
    updated_at
FROM resource;
