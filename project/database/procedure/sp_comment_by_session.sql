-- File: sp_comment_by_session.sql
-- Mô tả: Lấy danh sách nhận xét theo phiên học
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_session_id BIGINT
-- Returns: ResultSet nhận xét của phiên học

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_comment_by_session//

CREATE PROCEDURE sp_comment_by_session(
    IN p_session_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    IF p_session_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    SELECT
        c.session_id,
        c.student_id,
        u.name AS student_name,
        c.`comment`,
        c.rating,
        c.updated_at
    FROM `comment` c
    JOIN users u ON u.id = c.student_id
    WHERE c.session_id = p_session_id
    ORDER BY c.updated_at DESC, c.student_id ASC;
END//

DELIMITER ;

