-- File: 07_seed_session_participants.sql
-- Mô tả: Dữ liệu mẫu cho bảng session_participants
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO session_participants (session_id, student_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333');

SELECT COUNT(*) AS participants_inserted FROM session_participants;
SELECT 'Sample session participants data loaded successfully' AS status;
