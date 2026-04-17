-- File: sp_cancel_session_notify.sql
-- Description: Cancel a session and notify all enrolled students.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_session_id VARCHAR(36)
-- Returns: ResultSet with status message.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_cancel_session_notify//
CREATE PROCEDURE sp_cancel_session_notify(
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
proc_main: BEGIN
    DECLARE v_subject VARCHAR(150);
    DECLARE v_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_session_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    SELECT subject, status INTO v_subject, v_status
    FROM sessions
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
    LIMIT 1;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
    END IF;

    IF v_status = 'cancelled' THEN
        SELECT 'Session already cancelled' AS message;
        LEAVE proc_main;
    END IF;

    START TRANSACTION;

    UPDATE sessions
    SET status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    INSERT INTO notifications (session_id, receiver_user_id, content, type)
    SELECT
        p_session_id,
        sp.student_id,
        CONCAT('Lich hoc mon ', v_subject, ' (', p_session_id, ') da bi huy.'),
        'cancel'
    FROM session_participants sp
    WHERE sp.session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    COMMIT;

    SELECT 'Session cancelled and notifications sent' AS message;
END proc_main//

DELIMITER ;
