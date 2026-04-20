-- File: 06_resource_subject.sql
-- Mo ta: Tao bang anh xa tai lieu voi mon hoc
-- Tac gia: Nguyen Huu Thoi
-- Ngay tao: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS resource_subject;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE resource_subject (
    resource_id BIGINT NOT NULL COMMENT 'Ma tai lieu',
    subject_id CHAR(36) NOT NULL COMMENT 'ID mon hoc',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id, subject_id),
    CONSTRAINT fk_resource_subject_resource FOREIGN KEY (resource_id) REFERENCES resource(resource_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_resource_subject_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_resource_subject_id ON resource_subject(subject_id);

ALTER TABLE resource_subject COMMENT = 'Bang gan tai lieu voi mon hoc';
