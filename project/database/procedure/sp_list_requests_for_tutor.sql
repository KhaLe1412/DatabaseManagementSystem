-- File: sp_list_requests_for_tutor.sql
-- Description: List all session reschedule requests for a tutor.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_tutor_id VARCHAR(36)
-- Returns: ResultSet of request rows for the tutor.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_list_requests_for_tutor//
CREATE PROCEDURE sp_list_requests_for_tutor(
    IN p_tutor_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    SELECT
        r.request_id,
        r.student_id,
        r.session_id,
        r.proposed_date,
        r.proposed_start_time,
        r.proposed_end_time,
        r.reason,
        r.status,
        r.created_at,
        r.handled_at,
        s.subject,
        s.date AS current_session_date,
        s.start_time AS current_start,
        s.end_time AS current_end
    FROM session_requests r
    INNER JOIN sessions s ON s.session_id = r.session_id
    WHERE s.tutor_id = p_tutor_id COLLATE utf8mb4_unicode_ci
    ORDER BY r.created_at DESC;
END//

DELIMITER ;
