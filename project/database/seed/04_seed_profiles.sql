-- File: 04_seed_profiles.sql
-- Mô tả: Dữ liệu mẫu cho bảng students và tutors (Tham chiếu từ users)
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

-- Dữ liệu Sinh viên
INSERT IGNORE INTO students (student_id, mssv, department, year, gpa) VALUES
('USER-STUD-0000-0000-000000000001', '2110000', 'Khoa Khoa học và Kỹ thuật Máy tính', 3, 3.8),
('USER-STUD-0000-0000-000000000002', '2110001', 'Khoa Điện - Điện tử', 2, 3.2),
('USER-STUD-0000-0000-000000000003', '2110002', 'Khoa Khoa học và Kỹ thuật Máy tính', 1, 3.5),
('USER-STUD-0000-0000-000000000004', '2110003', 'Khoa Điện - Điện tử', 2, 3.1);

-- Dữ liệu Gia sư
INSERT IGNORE INTO tutors (tutor_id, tutor_code, department) VALUES
('USER-TUTO-0000-0000-000000000001', 'TUTOR001', 'Khoa Khoa học và Kỹ thuật Máy tính'),
('USER-TUTO-0000-0000-000000000002', 'TUTOR002', 'Khoa Khoa học Ứng dụng');

SET FOREIGN_KEY_CHECKS = 1;

-- Verify data
SELECT COUNT(*) AS 'Students inserted' FROM students;
SELECT COUNT(*) AS 'Tutors inserted' FROM tutors;
SELECT 'Sample profiles data loaded successfully' AS status;