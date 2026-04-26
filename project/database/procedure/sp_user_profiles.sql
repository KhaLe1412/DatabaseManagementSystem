-- File: database/procedure/02_sp_user_profiles.sql
-- Mô tả: Lấy thông tin chi tiết và cập nhật hồ sơ người dùng (SV/Gia sư)
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09
-- Parameters: p_user_id, p_name, p_department
-- Returns: ResultSet chứa thông tin cá nhân hoặc danh sách tất cả SV/Gia sư

USE dbms_project;

DELIMITER //

-- =================================================================
-- CASE 3: Lấy thông tin cá nhân (Sinh viên hoặc Gia sư)
-- Mô tả: Dùng LEFT JOIN để gộp dữ liệu từ bảng users và bảng con
-- dựa theo role của người dùng.
-- =================================================================
DROP PROCEDURE IF EXISTS sp_get_user_info//
CREATE PROCEDURE sp_get_user_info(
    IN p_user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    SELECT 
        u.name, 
        u.email, 
        u.role,
        -- Dùng COALESCE để lấy mssv nếu là SV, hoặc tutor_code nếu là GS
        COALESCE(s.mssv, t.tutor_code) AS code,
        COALESCE(s.department, t.department) AS department
    FROM users u
    LEFT JOIN students s ON u.id = s.student_id
    LEFT JOIN tutors t ON u.id = t.tutor_id
    WHERE u.id = p_user_id;
END//

-- =================================================================
-- CASE 4: Cập nhật thông tin cá nhân
-- Mô tả: Cập nhật bảng users, sau đó check role để update bảng con
-- =================================================================
DROP PROCEDURE IF EXISTS sp_update_user_profile//
CREATE PROCEDURE sp_update_user_profile(
    IN p_user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_department VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE v_role VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    -- Lấy role của user để biết đường rẽ nhánh
    SELECT role INTO v_role FROM users WHERE id = p_user_id COLLATE utf8mb4_unicode_ci;

    -- 1. Cập nhật bảng gốc
    UPDATE users SET name = p_name WHERE id = p_user_id COLLATE utf8mb4_unicode_ci;

    -- 2. Rẽ nhánh cập nhật bảng con
    IF v_role = 'student' THEN
        UPDATE students SET department = p_department WHERE student_id = p_user_id COLLATE utf8mb4_unicode_ci;
    ELSEIF v_role = 'tutor' THEN
        UPDATE tutors SET department = p_department WHERE tutor_id = p_user_id COLLATE utf8mb4_unicode_ci;
    END IF;
END//

-- =================================================================
-- CASE 7: Lấy thông tin tất cả Sinh viên
-- =================================================================
DROP PROCEDURE IF EXISTS sp_get_all_students//
CREATE PROCEDURE sp_get_all_students()
BEGIN
    SELECT u.id, u.name, u.email, s.mssv, s.department, s.year, s.gpa
    FROM users u
    JOIN students s ON u.id = s.student_id;
END//

-- =================================================================
-- CASE 8: Lấy thông tin tất cả Gia sư
-- =================================================================
DROP PROCEDURE IF EXISTS sp_get_all_tutors//
CREATE PROCEDURE sp_get_all_tutors()
BEGIN
    SELECT
        u.id, u.name, u.email, t.tutor_code, t.department,
        COALESCE(
            (SELECT AVG(c.rating)
             FROM comment c
             JOIN sessions s ON c.session_id = s.session_id
             WHERE s.tutor_id = t.tutor_id),
            0.0
        ) AS rating,
        (SELECT COUNT(*)
         FROM sessions
         WHERE tutor_id = t.tutor_id AND status = 'completed'
        ) AS total_sessions
    FROM users u
    JOIN tutors t ON u.id = t.tutor_id;
END//

DELIMITER ;
