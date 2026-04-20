-- File: sp_add_comment.sql
-- Mô tả: Thêm mới hoặc cập nhật nhận xét cho một phiên học
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_student_id VARCHAR(36), p_session_id VARCHAR(36), p_comment TEXT, p_rating INT
-- Returns: Bản ghi nhận xét sau khi upsert

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_add_comment//

CREATE PROCEDURE sp_add_comment(
    IN p_student_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_comment TEXT,
    IN p_rating INT
)
BEGIN
    DECLARE v_session_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_student_id IS NULL OR CHAR_LENGTH(TRIM(p_student_id)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid student_id';
    END IF;

    IF p_session_id IS NULL OR CHAR_LENGTH(TRIM(p_session_id)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    IF p_comment IS NULL OR CHAR_LENGTH(TRIM(p_comment)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Comment content is required';
    END IF;

    IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;

    SELECT `status`
    INTO v_session_status
    FROM sessions
    WHERE session_id = TRIM(p_session_id)
    LIMIT 1;

    IF v_session_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
    END IF;

    IF v_session_status <> 'completed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only completed sessions can be reviewed';
    END IF;

    START TRANSACTION;

    INSERT INTO `comment` (student_id, session_id, `comment`, rating)
    VALUES (TRIM(p_student_id), TRIM(p_session_id), TRIM(p_comment), p_rating)
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
    WHERE student_id = TRIM(p_student_id)
      AND session_id = TRIM(p_session_id);
END//

DELIMITER ;
