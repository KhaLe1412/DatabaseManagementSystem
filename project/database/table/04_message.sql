-- File: 04_message.sql
-- Mô tả: Tạo bảng tin nhắn giữa người dùng
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS message;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE message (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã tin nhắn',
    sender_id BIGINT NOT NULL COMMENT 'Người gửi',
    receiver_id BIGINT NOT NULL COMMENT 'Người nhận',
    content TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
    status ENUM('SENT', 'READ') NOT NULL DEFAULT 'SENT' COMMENT 'Trạng thái tin nhắn',
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm gửi',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES accounts(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES accounts(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_message_conversation ON message(sender_id, receiver_id, `timestamp`);
CREATE INDEX idx_message_status ON message(status);

ALTER TABLE message COMMENT = 'Bảng hội thoại giữa người dùng';
