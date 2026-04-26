-- File: 07_seed_session_participants.sql
-- Mô tả: Dữ liệu mẫu cho bảng session_participants
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO session_participants (session_id, student_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'USER-STUD-0000-0000-000000000001'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'USER-STUD-0000-0000-000000000002'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'USER-STUD-0000-0000-000000000001'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'USER-STUD-0000-0000-000000000001');

SELECT COUNT(*) AS participants_inserted FROM session_participants;
SELECT 'Sample session participants data loaded successfully' AS status;
