-- File: 08_notifications.sql
-- Mô tả: Tạo bảng notifications để lưu trữ các thông báo liên quan đến các buổi học, yêu cầu, v.v.
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16

USE dbms_project;

DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_id CHAR(36) NOT NULL, -- ID của người dùng (từ bảng users)
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- Vd: 'reschedule-notification', 'cancel-notification'
    is_read BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT fk_notif_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);