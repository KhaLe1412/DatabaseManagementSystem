-- File: sp_cancel_session.sql
/* Mô tả: Hủy một buổi học (session) và tự động tạo thông báo (notification) 
        cho tất cả sinh viên tham gia buổi học đó. */
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_session_id
-- Returns: Không trả về kết quả, nhưng sẽ xóa buổi học và tạo thông báo cho sinh viên.

USE dbms_project;

-- -----------------------------------------------------------------------------
-- Hủy session + Tự động tạo Notification
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_cancel_session;
DELIMITER //
CREATE PROCEDURE sp_cancel_session(
    IN p_session_id CHAR(36)
)
BEGIN
    -- Gửi thông báo cho sinh viên TRƯỚC KHI xóa/hủy session
    INSERT INTO notifications (receiver_id, content, type)
    SELECT student_id, 
           'Một buổi học của bạn đã bị gia sư hủy.', 
           'cancel-notification'
    FROM session_participants
    WHERE session_id = p_session_id;

    -- Xóa buổi học (Nếu nhóm bạn dùng cột status thay vì xóa cứng thì đổi thành UPDATE)
    DELETE FROM sessions WHERE session_id = p_session_id;
END //
DELIMITER ;