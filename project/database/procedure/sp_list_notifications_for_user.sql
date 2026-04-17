-- File: sp_list_notifications_for_user.sql
-- Description: List all notifications for a user.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15
-- Parameters: p_user_id VARCHAR(36)
-- Returns: ResultSet of notification rows for the user.
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_list_notifications_for_user//
CREATE PROCEDURE sp_list_notifications_for_user(
    IN p_user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    SELECT
        notification_id,
        session_id,
        sent_time,
        content,
        type
    FROM notifications
    WHERE receiver_user_id = p_user_id COLLATE utf8mb4_unicode_ci
    ORDER BY sent_time DESC, notification_id DESC;
END//

DELIMITER ;
