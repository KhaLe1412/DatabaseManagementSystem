-- File: sp_reject_request.sql
/* Mô tả: Từ chối một yêu cầu dời lịch học của sinh viên. Khi gia sư từ chối 
        yêu cầu, trạng thái của yêu cầu sẽ được cập nhật thành 'rejected' và một 
        thông báo sẽ được gửi đến sinh viên để thông báo về việc yêu cầu đã bị từ chối. */
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_request_id
-- Returns: Không trả về kết quả, nhưng sẽ cập nhật trạng thái yêu cầu và tạo thông báo cho sinh viên.

USE dbms_project;

-- -----------------------------------------------------------------------------
-- Từ chối Request (Gia sư gọi)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_reject_request;
DELIMITER //
CREATE PROCEDURE sp_reject_request(
    IN p_request_id INT
)
BEGIN
    DECLARE v_student_id CHAR(36);

    -- Lấy student_id để gửi thông báo
    SELECT student_id INTO v_student_id FROM requests WHERE request_id = p_request_id;

    -- Đổi trạng thái
    UPDATE requests SET status = 'rejected' WHERE request_id = p_request_id;

    -- Thông báo cho sinh viên
    INSERT INTO notifications (receiver_id, content, type)
    VALUES (v_student_id, 'Yêu cầu dời lịch học của bạn đã bị từ chối.', 'request-rejected');
END //
DELIMITER ;