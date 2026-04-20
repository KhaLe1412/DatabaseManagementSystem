-- File: project/database/table/05_sessions.sql
-- Description: Sessions (buoi hoc) table
-- Author: Nhan
-- Date: 2026-04-10

USE dbms_project;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS session_requests;
DROP TABLE IF EXISTS session_participants;
DROP TABLE IF EXISTS sessions;

-- 1. BẢNG BUỔI HỌC (SESSIONS)
CREATE TABLE sessions (
    session_id CHAR(36) PRIMARY KEY COMMENT 'ID của buổi học',
    tutor_id CHAR(36) NOT NULL COMMENT 'ID của gia sư (từ bảng users)',
    subject_id CHAR(36) NOT NULL COMMENT 'ID môn học (FK đến subjects)',
    date DATE NOT NULL COMMENT 'Ngày diễn ra',
    start_time TIME NOT NULL COMMENT 'Giờ bắt đầu',
    end_time TIME NOT NULL COMMENT 'Giờ kết thúc',
    
    type ENUM('in-person', 'online') NOT NULL COMMENT 'Hình thức học',
    location VARCHAR(255) DEFAULT NULL COMMENT 'Phòng học (nếu in-person)',
    meeting_link VARCHAR(512) DEFAULT NULL COMMENT 'Link học (nếu online)',
    
    max_students INT NOT NULL DEFAULT 30,
    status ENUM('scheduled', 'completed', 'cancelled', 'open', 'full') NOT NULL DEFAULT 'open',
    
    notes TEXT DEFAULT NULL COMMENT 'Ghi chú trước buổi',
    summary TEXT DEFAULT NULL COMMENT 'Tóm tắt sau buổi',
    recording_url VARCHAR(512) DEFAULT NULL COMMENT 'Link video record',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tutor_id) REFERENCES tutors(tutor_id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sessions_tutor_date ON sessions(tutor_id, date);
CREATE INDEX idx_sessions_subject ON sessions(subject_id);
CREATE INDEX idx_sessions_status ON sessions(status);