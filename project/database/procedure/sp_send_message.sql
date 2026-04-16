-- File: sp_send_message.sql
-- Mô tả: Gửi một tin nhắn mới
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_sender_id BIGINT, p_receiver_id BIGINT, p_content TEXT
-- Returns: Tin nhắn vừa tạo

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_send_message//

CREATE PROCEDURE sp_send_message(
    IN p_sender_id BIGINT,
    IN p_receiver_id BIGINT,
    IN p_content TEXT
)
BEGIN
    DECLARE v_message_id BIGINT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_sender_id IS NULL OR p_sender_id <= 0 OR p_receiver_id IS NULL OR p_receiver_id <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid sender_id or receiver_id';
    END IF;

    IF p_sender_id = p_receiver_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sender and receiver must be different';
    END IF;

    IF p_content IS NULL OR CHAR_LENGTH(TRIM(p_content)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Message content is required';
    END IF;

    START TRANSACTION;

    INSERT INTO message (sender_id, receiver_id, content, status)
    VALUES (p_sender_id, p_receiver_id, TRIM(p_content), 'SENT');

    SET v_message_id = LAST_INSERT_ID();

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
