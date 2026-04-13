-- File: 03_seed_students.sql
-- Mô tả: Dữ liệu mẫu cho bảng students
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO students (user_id, student_id, department, year, gpa, support_needs) VALUES
('11111111-1111-1111-1111-111111111111', '2210001', 'Computer Science', 2, 3.40, NULL),
('22222222-2222-2222-2222-222222222222', '2210002', 'Computer Science', 2, 3.10, NULL),
('33333333-3333-3333-3333-333333333333', '2210003', 'Information Systems', 3, 3.55, NULL),
('44444444-4444-4444-4444-444444444444', '2210004', 'Electrical Engineering', 1, 3.00, NULL);

SELECT COUNT(*) AS students_inserted FROM students;
SELECT 'Sample students data loaded successfully' AS status;
-- File: 03_seed_students.sql
-- Mo ta: Du lieu mau cho bang students
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
USE dbms_project;

INSERT IGNORE INTO students (user_id, student_id, department, year, gpa, support_needs) VALUES
('11111111-1111-1111-1111-111111111111', '2210001', 'Computer Science', 2, 3.40, NULL),
('22222222-2222-2222-2222-222222222222', '2210002', 'Computer Science', 2, 3.10, NULL),
('33333333-3333-3333-3333-333333333333', '2210003', 'Information Systems', 3, 3.55, NULL),
('44444444-4444-4444-4444-444444444444', '2210004', 'Electrical Engineering', 1, 3.00, NULL);

SELECT COUNT(*) AS students_inserted FROM students;
SELECT 'Sample students data loaded successfully' AS status;
