-- File: sp_reject_reschedule_request.sql
-- Description: Reject a pending reschedule request without changing session time.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_request_id BIGINT UNSIGNED
-- Returns: ResultSet with status message.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_reject_reschedule_request//
CREATE PROCEDURE sp_reject_reschedule_request(
    IN p_request_id BIGINT UNSIGNED
)
BEGIN
    UPDATE session_requests
    SET status = 'rejected',
        handled_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id
      AND status = 'pending';

    IF ROW_COUNT() = 0 THEN
        SELECT 'No pending request to reject (unchanged)' AS message;
    ELSE
        SELECT 'Request rejected (session unchanged)' AS message;
    END IF;
END//

DELIMITER ;
