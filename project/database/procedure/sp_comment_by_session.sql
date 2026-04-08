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
    IN p_session_id BIGINT
)
BEGIN
    IF p_session_id IS NULL OR p_session_id <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    SELECT
        c.session_id,
        c.student_id,
        a.full_name AS student_name,
        c.`comment`,
        c.rating,
        c.updated_at
    FROM `comment` c
    JOIN students s ON s.student_id = c.student_id
    JOIN accounts a ON a.user_id = s.user_id
    WHERE c.session_id = p_session_id
    ORDER BY c.updated_at DESC, c.student_id ASC;
END//

DELIMITER ;
