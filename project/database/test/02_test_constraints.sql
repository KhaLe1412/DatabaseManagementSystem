-- File: 02_test_constraints.sql
-- Mô tả: Test các ràng buộc database (UNIQUE, ENUM, FOREIGN KEY)
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET collation_connection = 'utf8mb4_unicode_ci';

-- ================================
-- TEST UNIQUE CONSTRAINTS
-- ================================
SELECT 'Testing UNIQUE constraints (Email & Username)' AS test_name;

-- Insert user mồi (thành công)
INSERT IGNORE INTO users (id, username, password, email, name, role) 
VALUES ('TEST-DUP-0001', 'dup_user', 'pass', 'dup@hcmut.edu.vn', 'User 1', 'student');

-- Bỏ comment dòng dưới để test lỗi Duplicate Email/Username (khi chạy thực tế nó sẽ văng lỗi đỏ)
-- INSERT INTO users (id, username, password, email, name, role) 
-- VALUES ('TEST-DUP-0002', 'dup_user', 'pass2', 'dup2@hcmut.edu.vn', 'User 2', 'student');
-- Expected: Error 1062 - Duplicate entry for key 'username'

-- ================================
-- TEST ENUM CONSTRAINTS
-- ================================
SELECT 'Testing ENUM constraints (Role)' AS test_name;

-- Bỏ comment dòng dưới để test lỗi Enum
-- INSERT INTO users (id, username, password, email, name, role) 
-- VALUES ('TEST-ENUM', 'enum_user', 'pass', 'enum@hcmut.edu.vn', 'User 3', 'invalid_role');
-- Expected: Error 1265 - Data truncated for column 'role'

-- ================================
-- TEST FOREIGN KEY CONSTRAINTS
-- ================================
SELECT 'Testing FOREIGN KEY constraints' AS test_name;

-- Cố tình thêm gia sư với user_id không tồn tại trong bảng users
-- Bỏ comment dòng dưới để test
-- INSERT INTO tutors (tutor_id, tutor_code, department) 
-- VALUES ('GHOST-ID-000', 'T999', 'Khoa Ảo');
-- Expected: Error 1452 - Cannot add or update a child row (Foreign key constraint fails)

-- ================================
-- CLEANUP
-- ================================
DELETE FROM users WHERE id = 'TEST-DUP-0001';

SELECT 'Constraint tests completed (Xem các comment để check expected error)' AS result;