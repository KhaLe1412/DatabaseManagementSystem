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
    -- Cập nhật trạng thái buổi học thành 'cancelled'
    UPDATE sessions
    SET status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id;

    -- Gửi thông báo cho tất cả sinh viên đang tham gia buổi học
    INSERT INTO notifications (session_id, receiver_user_id, content, type)
    SELECT p_session_id,
           student_id,
           'Một buổi học của bạn đã bị gia sư hủy.',
           'cancel'
    FROM session_participants
    WHERE session_id = p_session_id;
END //
DELIMITER ;