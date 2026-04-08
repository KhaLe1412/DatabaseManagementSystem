-- File: sp_get_messages_between.sql
-- Mô tả: Lấy lịch sử hội thoại giữa hai người dùng
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_user_1 BIGINT, p_user_2 BIGINT
-- Returns: ResultSet tin nhắn

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_messages_between//

CREATE PROCEDURE sp_get_messages_between(
    IN p_user_1 BIGINT,
    IN p_user_2 BIGINT
)
BEGIN
    IF p_user_1 IS NULL OR p_user_1 <= 0 OR p_user_2 IS NULL OR p_user_2 <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid user ids';
    END IF;

    IF p_user_1 = p_user_2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Users must be different';
    END IF;

    SELECT
        message_id,
        sender_id,
        receiver_id,
        content,
        status,
        `timestamp`
    FROM message
    WHERE (sender_id = p_user_1 AND receiver_id = p_user_2)
       OR (sender_id = p_user_2 AND receiver_id = p_user_1)
    ORDER BY `timestamp` ASC, message_id ASC;
END//

DELIMITER ;
