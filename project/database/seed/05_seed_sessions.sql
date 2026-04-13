-- File: 06_seed_sessions.sql
-- Mô tả: Dữ liệu mẫu cho bảng sessions
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO sessions (
    session_id,
    tutor_id,
    subject,
    date,
    start_time,
    end_time,
    type,
    location,
    meeting_link,
    max_students,
    status,
    notes
)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Programming Fundamentals', '2026-04-12', '09:00:00', '11:00:00', 'online', NULL, 'https://meet.example.com/s1', 2, 'full', 'OOP basics'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'Data Structures', '2026-04-12', '13:00:00', '15:00:00', 'in-person', 'B1-203', NULL, 3, 'open', 'Linked list and stack'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 'Calculus 1', '2026-04-12', '09:30:00', '11:00:00', 'online', NULL, 'https://meet.example.com/s3', 2, 'scheduled', 'Limits'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'Programming Fundamentals', '2026-04-10', '09:00:00', '10:30:00', 'online', NULL, 'https://meet.example.com/s4', 3, 'completed', 'Completed class');

SELECT COUNT(*) AS sessions_inserted FROM sessions;
SELECT 'Sample sessions data loaded successfully' AS status;
