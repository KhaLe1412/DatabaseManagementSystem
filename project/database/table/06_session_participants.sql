-- Description: Participants join table for sessions
-- Author: Nhan
-- Date: 2026-04-10
USE dbms_project;
DROP TABLE IF EXISTS session_participants;

CREATE TABLE session_participants (
    session_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL COMMENT 'UUID của sinh viên',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, student_id),

    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
