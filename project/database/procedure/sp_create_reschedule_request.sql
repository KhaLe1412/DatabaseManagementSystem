-- File: sp_create_reschedule_request.sql
-- Description: Create a reschedule request for an enrolled student.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_student_id VARCHAR(36), p_session_id VARCHAR(36), p_proposed_date DATE, p_proposed_start TIME, p_proposed_end TIME, p_reason TEXT
-- Returns: ResultSet with new request_id.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_create_reschedule_request//
CREATE PROCEDURE sp_create_reschedule_request(
    IN p_student_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_proposed_date DATE,
    IN p_proposed_start TIME,
    IN p_proposed_end TIME,
    IN p_reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_proposed_start >= p_proposed_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid proposed time range';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM session_participants sp
        WHERE sp.session_id = p_session_id COLLATE utf8mb4_unicode_ci
          AND sp.student_id = p_student_id COLLATE utf8mb4_unicode_ci
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is not enrolled in this session';
    END IF;

    INSERT INTO session_requests (
        student_id, session_id, proposed_date, proposed_start_time, proposed_end_time, reason, status
    ) VALUES (
        p_student_id, p_session_id, p_proposed_date, p_proposed_start, p_proposed_end, p_reason, 'pending'
    );

    SELECT LAST_INSERT_ID() AS request_id;
END//

DELIMITER ;
