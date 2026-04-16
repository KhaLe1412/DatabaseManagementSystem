-- File: sp_accept_request.sql
/* Mô tả: Chấp nhận một yêu cầu dời lịch học từ sinh viên. 
        Khi gia sư chấp nhận yêu cầu, hệ thống sẽ cập nhật trạng thái của yêu cầu, 
        đổi lịch buổi học tương ứng và gửi thông báo cho tất cả 
        sinh viên tham gia buổi học đó. */
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_request_id
-- Returns: Không trả về kết quả, nhưng sẽ cập nhật trạng thái yêu cầu, đổi lịch buổi học và tạo thông báo cho sinh viên.

USE dbms_project;

-- -----------------------------------------------------------------------------
-- Chấp nhận Request (Gia sư gọi)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_accept_request;
DELIMITER //
CREATE PROCEDURE sp_accept_request(
    IN p_request_id INT
)
BEGIN
    DECLARE v_session_id CHAR(36);
    DECLARE v_new_date DATE;
    DECLARE v_new_start TIME;
    DECLARE v_new_end TIME;
    DECLARE v_student_id CHAR(36);

    -- Lấy thông tin từ request
    SELECT session_id, date, start_time, end_time, student_id 
    INTO v_session_id, v_new_date, v_new_start, v_new_end, v_student_id
    FROM requests WHERE request_id = p_request_id;

    -- Cập nhật trạng thái request
    UPDATE requests SET status = 'approved' WHERE request_id = p_request_id;

    -- Đổi lịch buổi học và thông báo cho TẤT CẢ sinh viên trong lớp (dùng procedure 1)
    CALL sp_update_session_time(v_session_id, v_new_date, v_new_start, v_new_end);
    
    -- (Tùy chọn) Có thể gửi thêm 1 thông báo riêng rẽ cho người request
    INSERT INTO notifications (receiver_id, content, type)
    VALUES (v_student_id, 'Yêu cầu dời lịch học của bạn đã được gia sư chấp nhận.', 'request-approved');
END //
DELIMITER ;