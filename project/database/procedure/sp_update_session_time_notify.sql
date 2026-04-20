-- File: sp_update_session_time_notify.sql
-- Description: Update a session time and notify all enrolled students.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_session_id VARCHAR(36), p_new_date DATE, p_new_start TIME, p_new_end TIME
-- Returns: ResultSet with status message.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_update_session_time_notify//
CREATE PROCEDURE sp_update_session_time_notify(
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_new_date DATE,
    IN p_new_start TIME,
    IN p_new_end TIME
)
proc_main: BEGIN
    DECLARE v_tutor_id CHAR(36);
    DECLARE v_subject_name VARCHAR(100);
    DECLARE v_status VARCHAR(20);
    DECLARE v_overlap INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_session_id IS NULL OR p_new_date IS NULL OR p_new_start IS NULL OR p_new_end IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required parameters';
    END IF;

    IF p_new_start >= p_new_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid time range';
    END IF;

    SELECT s.tutor_id, subj.name, s.status
    INTO v_tutor_id, v_subject_name, v_status
    FROM sessions s
    JOIN subjects subj ON subj.id = s.subject_id
    WHERE s.session_id = p_session_id COLLATE utf8mb4_unicode_ci
    LIMIT 1;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
    END IF;

    IF v_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot reschedule a cancelled session';
    END IF;

    SELECT COUNT(*) INTO v_overlap
    FROM sessions s
    WHERE s.tutor_id = v_tutor_id COLLATE utf8mb4_unicode_ci
      AND s.session_id <> p_session_id COLLATE utf8mb4_unicode_ci
      AND s.status IN ('open', 'scheduled', 'full')
      AND s.date = p_new_date
      AND NOT (s.end_time <= p_new_start OR s.start_time >= p_new_end);

    IF v_overlap > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'New schedule overlaps another session';
    END IF;

    START TRANSACTION;

    UPDATE sessions
    SET date = p_new_date,
        start_time = p_new_start,
        end_time = p_new_end,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    INSERT INTO notifications (session_id, receiver_user_id, content, type)
    SELECT
        p_session_id,
        sp.student_id,
        CONCAT(
            'Lich hoc mon ', v_subject_name, ' (', p_session_id, ') da chuyen sang ',
            DATE_FORMAT(p_new_date, '%Y-%m-%d'),
            ' tu ',
            DATE_FORMAT(p_new_start, '%H:%i'),
            ' den ',
            DATE_FORMAT(p_new_end, '%H:%i'),
            '.'
        ),
        'reschedule'
    FROM session_participants sp
    WHERE sp.session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    COMMIT;

    SELECT 'Session time updated; notifications sent to participants' AS message;
END proc_main//

DELIMITER ;
