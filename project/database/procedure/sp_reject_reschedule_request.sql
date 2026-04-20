-- File: sp_reject_reschedule_request.sql
-- Description: Reject a pending reschedule request without changing session time.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_request_id CHAR(36)
-- Returns: ResultSet with status message.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_reject_reschedule_request//
CREATE PROCEDURE sp_reject_reschedule_request(
    IN p_request_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
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

