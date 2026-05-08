-- File: sp_update_session_summary.sql
-- Mo ta: Cap nhat summary va recording_url sau khi hoan thanh session
-- Tac gia: Nhom
-- Ngay tao: 2026-04-20
-- Parameters: p_session_id, p_summary, p_recording_url
-- Returns: thong bao ket qua

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_update_session_summary//

CREATE PROCEDURE sp_update_session_summary(
    IN p_session_id     VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_summary        TEXT,
    IN p_recording_url  VARCHAR(512)
)
BEGIN
    DECLARE v_current_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_session_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    SELECT status INTO v_current_status
    FROM sessions
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    IF v_current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
    END IF;

    IF v_current_status != 'completed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session must be completed before updating summary';
    END IF;

    UPDATE sessions
    SET
        summary       = COALESCE(p_summary, summary),
        recording_url = COALESCE(p_recording_url, recording_url),
        updated_at    = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    SELECT 'Session summary updated successfully' AS message;
END//

DELIMITER ;
