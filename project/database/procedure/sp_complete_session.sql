-- File: sp_complete_session.sql
-- Mo ta: Danh dau session da hoan thanh
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
-- Parameters: session_id
-- Returns: thong bao ket qua

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_complete_session//

CREATE PROCEDURE sp_complete_session(
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
proc_main: BEGIN
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

    -- If already completed, return benign message (idempotent)
    IF v_current_status = 'completed' THEN
        SELECT 'Session already completed' AS message;
        LEAVE proc_main;
    END IF;

    -- If cancelled, raise error
    IF v_current_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot complete a cancelled session';
    END IF;

    START TRANSACTION;

    UPDATE sessions
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    COMMIT;

    SELECT 'Session completed successfully' AS message;
END proc_main//

DELIMITER ;

-- Test procedure
-- CALL sp_complete_session(2);
