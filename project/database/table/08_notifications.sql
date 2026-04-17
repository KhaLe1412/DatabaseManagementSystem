-- File: 08_notifications.sql
-- Description: Create Task 4 table for session notifications.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15

USE dbms_project;

-- Drop and recreate notifications table.
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    receiver_user_id CHAR(36) NOT NULL COMMENT 'Target user id (student participating in the session)',
    sent_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    type ENUM('reschedule', 'cancel') NOT NULL,
    CONSTRAINT fk_notifications_session
        FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_receiver
        FOREIGN KEY (receiver_user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_receiver_time ON notifications (receiver_user_id, sent_time DESC);
