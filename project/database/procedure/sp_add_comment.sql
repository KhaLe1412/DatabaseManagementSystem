-- File: sp_add_comment.sql
-- Mô tả: Thêm mới hoặc cập nhật nhận xét cho một phiên học
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_student_id BIGINT, p_session_id BIGINT, p_comment TEXT, p_rating INT
-- Returns: Bản ghi nhận xét sau khi upsert

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_add_comment//

CREATE PROCEDURE sp_add_comment(
    IN p_student_id BIGINT,
    IN p_session_id BIGINT,
    IN p_comment TEXT,
    IN p_rating INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_student_id IS NULL OR p_student_id <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid student_id';
    END IF;

    IF p_session_id IS NULL OR p_session_id <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    IF p_comment IS NULL OR CHAR_LENGTH(TRIM(p_comment)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Comment content is required';
    END IF;

    IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;

    START TRANSACTION;

    INSERT INTO `comment` (student_id, session_id, `comment`, rating)
    VALUES (p_student_id, p_session_id, TRIM(p_comment), p_rating)
    ON DUPLICATE KEY UPDATE
        `comment` = VALUES(`comment`),
        rating = VALUES(rating),
        updated_at = CURRENT_TIMESTAMP;

    COMMIT;

    SELECT
        student_id,
        session_id,
        `comment`,
        rating,
        updated_at
    FROM `comment`
    WHERE student_id = p_student_id
      AND session_id = p_session_id;
END//

DELIMITER ;
