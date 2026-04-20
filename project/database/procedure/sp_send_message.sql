-- File: sp_send_message.sql
-- Mô tả: Gửi một tin nhắn mới
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_sender_id CHAR(36), p_receiver_id CHAR(36), p_content TEXT
-- Returns: Tin nhắn vừa tạo

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_send_message//

CREATE PROCEDURE sp_send_message(
    IN p_sender_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_receiver_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_content TEXT
)
BEGIN
    DECLARE v_message_id CHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_sender_id IS NULL OR p_receiver_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid sender_id or receiver_id';
    END IF;

    IF p_sender_id = p_receiver_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sender and receiver must be different';
    END IF;

    IF p_content IS NULL OR CHAR_LENGTH(TRIM(p_content)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Message content is required';
    END IF;

    START TRANSACTION;

    SET v_message_id = UUID();

    INSERT INTO message (message_id, sender_id, receiver_id, content, status)
    VALUES (v_message_id, p_sender_id, p_receiver_id, TRIM(p_content), 'SENT');

    COMMIT;

    SELECT
        message_id,
        sender_id,
        receiver_id,
        content,
        status,
        `timestamp`
    FROM message
    WHERE message_id = v_message_id;
END//

DELIMITER ;

