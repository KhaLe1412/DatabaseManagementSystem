-- File: sp_get_user_notifications.sql
/* Mô tả: Lấy danh sách tất cả thông báo (notifications) mà người dùng 
        đã nhận được. Khi người dùng gọi thủ tục này, nó sẽ trả về tất cả 
        thông báo thuộc về người dùng đó, bao gồm thông tin về nội dung thông báo, 
        thời gian nhận, và trạng thái đã đọc/chưa đọc. */
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_user_id
/* Returns: Trả về một tập hợp các thông báo liên quan đến người dùng, 
        có thể bao gồm thông tin về nội dung thông báo, thời gian nhận, 
        và trạng thái đã đọc/chưa đọc. */

USE dbms_project;

-- -----------------------------------------------------------------------------
-- 7. Lấy danh sách Notification của user
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_user_notifications;
DELIMITER //
CREATE PROCEDURE sp_get_user_notifications(
    IN p_user_id CHAR(36)
)
BEGIN
    SELECT * FROM notifications
    WHERE receiver_id = p_user_id
    ORDER BY timestamp DESC;
END //
DELIMITER ;