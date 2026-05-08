-- File: database/procedure/03_sp_user_subjects.sql
-- Mô tả: Quản lý môn học mà sinh viên hoặc gia sư đăng ký tham gia
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09
-- Parameters: p_user_id, p_subject_id
-- Returns: ResultSet chứa danh sách môn học của người dùng

USE dbms_project;

DELIMITER //

-- =================================================================
-- CASE 5: Lấy danh sách môn học của 1 User (SV hoặc Gia sư)
-- Mô tả: Inner join từ bảng trung gian ra bảng subjects
-- =================================================================
DROP PROCEDURE IF EXISTS sp_get_user_subjects//
CREATE PROCEDURE sp_get_user_subjects(
    IN p_user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    SELECT s.id AS subject_id, s.name AS subject_name
    FROM subjects s
    JOIN user_subjects us ON s.id = us.subject_id
    WHERE us.user_id = p_user_id COLLATE utf8mb4_unicode_ci;
END//

-- =================================================================
-- CASE 6: Cập nhật danh sách môn học
-- Mô tả: Do danh sách môn học thường được gửi từ Frontend dưới dạng
-- thêm/xóa từng môn, tui chia thành 2 Procedure nhỏ cho thao tác này
-- để Backend gọi cho tiện.
-- =================================================================

-- 6.1: Thêm môn học
DROP PROCEDURE IF EXISTS sp_add_user_subject//
CREATE PROCEDURE sp_add_user_subject(
    IN p_user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_subject_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    -- Dùng INSERT IGNORE để tránh lỗi crash nếu user lỡ add trùng môn đã có
    INSERT IGNORE INTO user_subjects (user_id, subject_id)
    VALUES (p_user_id, p_subject_id);
END//

-- 6.2: Xóa môn học
DROP PROCEDURE IF EXISTS sp_remove_user_subject//
CREATE PROCEDURE sp_remove_user_subject(
    IN p_user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_subject_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DELETE FROM user_subjects 
    WHERE user_id = p_user_id COLLATE utf8mb4_unicode_ci
      AND subject_id = p_subject_id COLLATE utf8mb4_unicode_ci;
END//

DELIMITER ;