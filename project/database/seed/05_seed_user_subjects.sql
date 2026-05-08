-- File: 05_seed_user_subjects.sql
-- Mô tả: Dữ liệu mẫu mô phỏng sinh viên/gia sư đăng ký môn học
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO user_subjects (user_id, subject_id) VALUES
-- Nhật (SV) đăng ký Hệ quản trị CSDL & Cấu trúc dữ liệu & Lập trình căn bản
('USER-STUD-0000-0000-000000000001', 'SUBJ-0000-0000-0000-000000000001'),
('USER-STUD-0000-0000-000000000001', 'SUBJ-0000-0000-0000-000000000002'),
('USER-STUD-0000-0000-000000000001', 'SUBJ-0000-0000-0000-000000000005'),

-- An (SV) đăng ký Lập trình căn bản
('USER-STUD-0000-0000-000000000002', 'SUBJ-0000-0000-0000-000000000005'),

-- Hoa (SV) đăng ký Cấu trúc dữ liệu và giải thuật
('USER-STUD-0000-0000-000000000003', 'SUBJ-0000-0000-0000-000000000002'),

-- Long (SV) đăng ký Giải tích 1
('USER-STUD-0000-0000-000000000004', 'SUBJ-0000-0000-0000-000000000006'),

-- Gia sư Bình dạy Hệ quản trị CSDL & Lập trình căn bản & Cấu trúc dữ liệu
('USER-TUTO-0000-0000-000000000001', 'SUBJ-0000-0000-0000-000000000001'),
('USER-TUTO-0000-0000-000000000001', 'SUBJ-0000-0000-0000-000000000002'),
('USER-TUTO-0000-0000-000000000001', 'SUBJ-0000-0000-0000-000000000005'),

-- Gia sư Cường dạy Giải tích 1
('USER-TUTO-0000-0000-000000000002', 'SUBJ-0000-0000-0000-000000000006');

SET FOREIGN_KEY_CHECKS = 1;

-- Verify data
SELECT COUNT(*) AS 'User_Subjects mappings inserted' FROM user_subjects;
SELECT 'Sample user_subjects data loaded successfully' AS status;