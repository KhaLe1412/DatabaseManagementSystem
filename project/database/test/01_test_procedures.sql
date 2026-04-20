-- File: 01_test_procedures.sql
-- Mô tả: Test các Stored Procedures (Auth, Profile, Subjects)
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET collation_connection = 'utf8mb4_unicode_ci';

-- Biến dùng chung cho test
SET @test_uuid = 'TEST-USER-0000-0000-000000000001';
SET @test_subject_uuid = 'SUBJ-0000-0000-0000-000000000001'; -- Lấy từ seed data

-- Pre-cleanup to ensure idempotent runs
DELETE FROM users WHERE id = @test_uuid;

-- ================================
-- TEST 1: Register Operations
-- ================================
SELECT '=== TEST 1: sp_register_user ===' AS test_name;

-- Gọi procedure tạo user
CALL sp_register_user(@test_uuid, 'test_student', 'test_pass', 'test@hcmut.edu.vn', 'Test Student', 'student');

-- Validate
SELECT 
    COUNT(*) AS is_created,
    CASE WHEN COUNT(*) = 1 THEN 'REGISTER: PASSED' ELSE 'REGISTER: FAILED' END AS result
FROM users WHERE id = @test_uuid;

-- ================================
-- TEST 2: Login Operations
-- ================================
SELECT '=== TEST 2: sp_login ===' AS test_name;

-- Validate login đúng pass
SELECT 'Đang kiểm tra login đúng thông tin...' AS action;
CALL sp_login('test_student', 'test_pass');

-- ================================
-- TEST 3: Update Profile Operations
-- ================================
SELECT '=== TEST 3: sp_update_user_profile ===' AS test_name;

-- Tạo record student trước khi update
INSERT INTO students (student_id, mssv, department) VALUES (@test_uuid, '9999999', 'Khoa Test');

-- Gọi procedure update
CALL sp_update_user_profile(@test_uuid, 'Updated Name', 'Khoa Khoa học Máy tính');

-- Validate
SELECT 
    COUNT(*) AS updated,
    CASE WHEN COUNT(*) = 1 THEN 'UPDATE PROFILE: PASSED' ELSE 'UPDATE PROFILE: FAILED' END AS result
FROM users u JOIN students s ON u.id = s.student_id 
WHERE u.id = @test_uuid AND u.name IS NOT NULL AND s.department IS NOT NULL;

-- ================================
-- TEST 4: User Subject Operations
-- ================================
SELECT '=== TEST 4: Add & Get User Subjects ===' AS test_name;

-- Thêm môn học cho user
CALL sp_add_user_subject(@test_uuid, @test_subject_uuid);

-- Validate list (Nên hiển thị 1 dòng)
SELECT 'Danh sách môn học của test user:' AS action;
CALL sp_get_user_subjects(@test_uuid);

-- ================================
-- CLEANUP
-- ================================
SELECT '=== CLEANING UP TEST DATA ===' AS action;
-- Xóa user gốc sẽ tự động xóa luôn trong bảng students và user_subjects nhờ ON DELETE CASCADE
DELETE FROM users WHERE id = @test_uuid;

SELECT '=== TEST COMPLETED ===' AS test_name;