-- File: 07_requests.sql
-- Mô tả: Tạo bảng requests để lưu trữ các yêu cầu của sinh viên liên quan đến các buổi học
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16

USE dbms_project;

DROP TABLE IF EXISTS requests;

CREATE TABLE requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_req_session FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);