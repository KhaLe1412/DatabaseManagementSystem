-- File: sp_accept_reschedule_request.sql
-- Description: Accept a reschedule request, update session time, and notify participants.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_request_id CHAR(36)
-- Returns: ResultSet with status message.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_accept_reschedule_request//
CREATE PROCEDURE sp_accept_reschedule_request(
    IN p_request_id CHAR(36)
)
proc_main: BEGIN
    DECLARE v_session_id CHAR(36);
    DECLARE v_student_id CHAR(36);
    DECLARE v_date DATE;
    DECLARE v_start TIME;
    DECLARE v_end TIME;
    DECLARE v_status VARCHAR(20);
    DECLARE v_tutor_id CHAR(36);
    DECLARE v_subject_name VARCHAR(100);
    DECLARE v_overlap INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT session_id, student_id, proposed_date, proposed_start_time, proposed_end_time, status
    INTO v_session_id, v_student_id, v_date, v_start, v_end, v_status
    FROM session_requests
    WHERE request_id = p_request_id
    LIMIT 1;

    IF v_session_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request not found';
    END IF;

    IF v_status <> 'pending' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request is not pending';
    END IF;

    SELECT s.tutor_id, subj.name, s.status
    INTO v_tutor_id, v_subject_name, v_status
    FROM sessions s
    JOIN subjects subj ON subj.id = s.subject_id
    WHERE s.session_id = v_session_id COLLATE utf8mb4_unicode_ci
    LIMIT 1;

    IF v_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session is cancelled';
    END IF;

    SELECT COUNT(*) INTO v_overlap
    FROM sessions s
    WHERE s.tutor_id = v_tutor_id COLLATE utf8mb4_unicode_ci
      AND s.session_id <> v_session_id COLLATE utf8mb4_unicode_ci
      AND s.status IN ('open', 'scheduled', 'full')
      AND s.date = v_date
      AND NOT (s.end_time <= v_start OR s.start_time >= v_end);

    IF v_overlap > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Accepted schedule overlaps another session';
    END IF;

    START TRANSACTION;

    UPDATE sessions
    SET date = v_date,
        start_time = v_start,
        end_time = v_end,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = v_session_id COLLATE utf8mb4_unicode_ci;

    INSERT INTO notifications (session_id, receiver_user_id, content, type)
    SELECT
        v_session_id,
        sp.student_id,
        CONCAT(
            'Lich hoc mon ', v_subject_name, ' (', v_session_id, ') da chuyen sang ',,
            DATE_FORMAT(v_date, '%Y-%m-%d'),
            ' tu ',
            DATE_FORMAT(v_start, '%H:%i'),
            ' den ',
            DATE_FORMAT(v_end, '%H:%i'),
            '.'
        ),
        'reschedule'
    FROM session_participants sp
    WHERE sp.session_id = v_session_id COLLATE utf8mb4_unicode_ci;

    UPDATE session_requests
    SET status = 'accepted',
        handled_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id;

    COMMIT;

    SELECT 'Request accepted; session updated' AS message;
END proc_main//

DELIMITER ;
