-- File: 03_seed_users.sql
-- Mô tả: Dữ liệu mẫu cho bảng users (Gồm Admin, SV và Gia sư)
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample data (UUID cố định để tham chiếu)
INSERT IGNORE INTO users (id, username, password, email, name, role) VALUES
-- 1 Admin
('USER-ADMIN-0000-0000-000000000001', 'admin', 'hash123', 'admin@hcmut.edu.vn', 'Quản trị viên', 'admin'),
-- 2 Sinh viên
('USER-STUD-0000-0000-000000000001', 'nhat.huynh', 'hash123', 'nhat.huynh@hcmut.edu.vn', 'Huỳnh Hữu Nhật', 'student'),
('USER-STUD-0000-0000-000000000002', 'an.nguyen', 'hash123', 'an.nguyen@hcmut.edu.vn', 'Nguyễn Văn An', 'student'),
-- 2 Gia sư
('USER-TUTO-0000-0000-000000000001', 'tutor.binh', 'hash123', 'binh.tran@hcmut.edu.vn', 'Trần Thị Bình', 'tutor'),
('USER-TUTO-0000-0000-000000000002', 'tutor.cuong', 'hash123', 'cuong.le@hcmut.edu.vn', 'Lê Văn Cường', 'tutor');

SET FOREIGN_KEY_CHECKS = 1;

-- Verify data
SELECT COUNT(*) AS 'Users inserted' FROM users;
SELECT 'Sample users data loaded successfully' AS status;