-- File: sp_update_session_time.sql
/* Mô tả: Cập nhật thời gian của một buổi học (session) và tự động tạo 
        thông báo (notification) cho tất cả sinh viên tham gia buổi học đó. */
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_session_id, p_new_date, p_new_start_time, p_new_end_time
-- Returns: Không trả về kết quả, nhưng sẽ cập nhật thời gian buổi học và tạo thông báo cho sinh viên.

USE dbms_project;

-- -----------------------------------------------------------------------------
-- Cập nhật thời gian session + Tự động tạo Notification cho sinh viên
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_session_time;
DELIMITER //
CREATE PROCEDURE sp_update_session_time(
    IN p_session_id CHAR(36),
    IN p_new_date DATE,
    IN p_new_start_time TIME,
    IN p_new_end_time TIME
)
BEGIN
    -- Cập nhật thời gian buổi học
    UPDATE sessions 
    SET date = p_new_date, start_time = p_new_start_time, end_time = p_new_end_time 
    WHERE session_id = p_session_id;

    -- Tự động gửi thông báo cho tất cả sinh viên đang tham gia buổi học này
    INSERT INTO notifications (session_id, receiver_user_id, content, type)
    SELECT p_session_id,
           student_id,
           CONCAT('Buổi học của bạn đã được dời sang ngày ', p_new_date, ' lúc ', p_new_start_time),
           'reschedule'
    FROM session_participants
    WHERE session_id = p_session_id;
END //
DELIMITER ;