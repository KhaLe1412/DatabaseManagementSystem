-- File: 02_seed_subjects.sql
-- Mô tả: Dữ liệu mẫu cho danh mục môn học
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample data với UUID cố định
INSERT IGNORE INTO subjects (id, name) VALUES
('SUBJ-0000-0000-0000-000000000001', 'Hệ quản trị cơ sở dữ liệu'),
('SUBJ-0000-0000-0000-000000000002', 'Cấu trúc dữ liệu và giải thuật'),
('SUBJ-0000-0000-0000-000000000003', 'Mạng máy tính'),
('SUBJ-0000-0000-0000-000000000004', 'Trí tuệ nhân tạo'),
('SUBJ-0000-0000-0000-000000000005', 'Lập trình căn bản'),
('SUBJ-0000-0000-0000-000000000006', 'Giải tích 1');

SET FOREIGN_KEY_CHECKS = 1;

-- Verify data
SELECT COUNT(*) AS 'Subjects inserted' FROM subjects;
SELECT 'Sample subjects data loaded successfully' AS status;