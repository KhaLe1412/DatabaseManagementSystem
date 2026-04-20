-- File: sp_mark_as_read.sql
-- Mô tả: Đánh dấu tin nhắn từ một người gửi tới một người nhận là đã đọc
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_sender_id CHAR(36), p_receiver_id CHAR(36)
-- Returns: Số bản ghi được cập nhật

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_mark_as_read//

CREATE PROCEDURE sp_mark_as_read(
    IN p_sender_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_receiver_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE v_updated_rows INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_sender_id IS NULL OR p_receiver_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid sender_id or receiver_id';
    END IF;

    START TRANSACTION;

    UPDATE message
    SET status = 'READ',
        updated_at = CURRENT_TIMESTAMP
    WHERE sender_id = p_sender_id
      AND receiver_id = p_receiver_id
      AND status <> 'READ';

    SET v_updated_rows = ROW_COUNT();

    COMMIT;

    SELECT v_updated_rows AS updated_messages;
END//

DELIMITER ;

