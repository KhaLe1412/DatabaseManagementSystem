-- File: 07_session_requests.sql
-- Description: Create Task 4 table for session reschedule requests.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15

USE dbms_project;

-- Drop and recreate requests table.
DROP TABLE IF EXISTS session_requests;

CREATE TABLE session_requests (
    request_id CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'Mã yêu cầu (UUID)',
    student_id CHAR(36) NOT NULL COMMENT 'Student who sends the request (users.id / students.student_id)',
    session_id CHAR(36) NOT NULL,
    proposed_date DATE NOT NULL,
    proposed_start_time TIME NOT NULL,
    proposed_end_time TIME NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handled_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (request_id),
    CONSTRAINT chk_request_time_range CHECK (proposed_start_time < proposed_end_time),
    CONSTRAINT fk_session_requests_student
        FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_session_requests_session
        FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_session_requests_tutor_lookup ON session_requests (session_id, status);
CREATE INDEX idx_session_requests_student ON session_requests (student_id, status);
