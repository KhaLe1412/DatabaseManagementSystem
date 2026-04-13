-- File: 02_seed_users.sql
-- Mô tả: Dữ liệu mẫu cho bảng users
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10
USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO users (id, name, email, role, avatar) VALUES
('11111111-1111-1111-1111-111111111111', 'An Student',    'an.student@hcmut.edu.vn', 'student', NULL),
('22222222-2222-2222-2222-222222222222', 'Binh Student',  'binh.student@hcmut.edu.vn', 'student', NULL),
('33333333-3333-3333-3333-333333333333', 'Cuong Student', 'cuong.student@hcmut.edu.vn', 'student', NULL),
('44444444-4444-4444-4444-444444444444', 'Dung Student',  'dung.student@hcmut.edu.vn', 'student', NULL),
('55555555-5555-5555-5555-555555555555', 'Hung Tutor',    'hung.tutor@hcmut.edu.vn', 'tutor', NULL),
('66666666-6666-6666-6666-666666666666', 'Linh Tutor',    'linh.tutor@hcmut.edu.vn', 'tutor', NULL),
('77777777-7777-7777-7777-777777777777', 'AA Staff',      'aa.staff@hcmut.edu.vn', 'academic-affairs', NULL),
('88888888-8888-8888-8888-888888888888', 'Root Admin',    'admin@hcmut.edu.vn', 'admin', NULL);

SET FOREIGN_KEY_CHECKS = 1;

SELECT COUNT(*) AS users_inserted FROM users;
SELECT 'Sample users data loaded successfully' AS status;
