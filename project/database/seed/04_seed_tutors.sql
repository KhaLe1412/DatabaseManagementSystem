-- File: 04_seed_tutors.sql
-- Mô tả: Dữ liệu mẫu cho bảng tutors
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO tutors (user_id, tutor_id, department, expertise, rating, total_sessions) VALUES
('55555555-5555-5555-5555-555555555555', 'TUT001', 'Computer Science', JSON_ARRAY('OOP','Algorithms'), 4.70, 12),
('66666666-6666-6666-6666-666666666666', 'TUT002', 'Mathematics', JSON_ARRAY('Calculus'), 4.50, 9);

SELECT COUNT(*) AS tutors_inserted FROM tutors;
SELECT 'Sample tutors data loaded successfully' AS status;
-- File: 04_seed_tutors.sql
-- Mo ta: Du lieu mau cho bang tutors
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO tutors (user_id, tutor_id, department, expertise, rating, total_sessions) VALUES
('55555555-5555-5555-5555-555555555555', 'TUT001', 'Computer Science', JSON_ARRAY('OOP','Algorithms'), 4.70, 12),
('66666666-6666-6666-6666-666666666666', 'TUT002', 'Mathematics', JSON_ARRAY('Calculus'), 4.50, 9);

SELECT COUNT(*) AS tutors_inserted FROM tutors;
SELECT 'Sample tutors data loaded successfully' AS status;
