-- File: sp_auth.sql
-- Mô tả: Đăng ký người dùng mới và xử lý đăng nhập (Login)
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09
-- Parameters: p_username, p_password, p_email, p_name, p_role...
-- Returns: ResultSet chứa thông tin đăng nhập (userID, role, name)

USE dbms_project;

DELIMITER //

-- =================================================================
-- CASE 1: Đăng ký người dùng
-- Mô tả: Tạo tài khoản mới trong bảng users. Phần thông tin chi tiết
-- (sinh viên/gia sư) sẽ được thêm sau qua API tạo profile.
-- =================================================================
DROP PROCEDURE IF EXISTS sp_register_user//
CREATE PROCEDURE sp_register_user(
    IN p_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_role ENUM('student', 'tutor', 'academic-affairs', 'student-affairs', 'admin')
)
BEGIN
    INSERT INTO users (id, username, password, email, name, role)
    VALUES (p_id, p_username, p_password, p_email, p_name, p_role);
END//

-- =================================================================
-- CASE 2: Đăng nhập (Login)
-- Mô tả: Trả về userID và role nếu khớp username và password.
-- =================================================================
DROP PROCEDURE IF EXISTS sp_login//
CREATE PROCEDURE sp_login(
    IN p_username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    -- Chỉ select những trường cần thiết để tạo Token/Session phía Backend
    SELECT id AS userID, role, name
    FROM users 
    WHERE username = p_username COLLATE utf8mb4_unicode_ci
      AND password = p_password COLLATE utf8mb4_unicode_ci;
END//

DELIMITER ;
