-- File: 04_message.sql
-- Mo ta: Tao bang tin nhan giua nguoi dung
-- Tac gia: Nguyen Huu Thoi
-- Ngay tao: 2026-04-04

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS message;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE message (
    message_id CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'Ma tin nhan (UUID)',
    sender_id CHAR(36) NOT NULL COMMENT 'ID nguoi gui',
    receiver_id CHAR(36) NOT NULL COMMENT 'ID nguoi nhan',
    content TEXT NOT NULL COMMENT 'Noi dung tin nhan',
    status ENUM('SENT', 'READ') NOT NULL DEFAULT 'SENT' COMMENT 'Trang thai tin nhan',
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem gui',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id),
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_message_conversation ON message(sender_id, receiver_id, `timestamp`);
CREATE INDEX idx_message_status ON message(status);

ALTER TABLE message COMMENT = 'Bang luu tru tin nhan giua nguoi dung';
