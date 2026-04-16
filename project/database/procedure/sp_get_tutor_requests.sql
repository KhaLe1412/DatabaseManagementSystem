-- File: sp_get_tutor_requests.sql
/* Mô tả: Lấy danh sách tất cả yêu cầu (requests) liên quan đến các buổi học 
        (sessions) mà gia sư đang dạy. Khi gia sư gọi thủ tục này, 
    nó sẽ trả về tất cả yêu cầu thuộc về các session mà gia sư đó dạy, bao gồm 
    thông tin về yêu cầu và có thể thêm thông tin về môn học hoặc sinh viên nếu cần. */
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_tutor_id
-- Returns: Trả về một tập hợp các yêu cầu liên quan đến các buổi học mà gia sư đang dạy, có thể bao gồm thông tin về yêu cầu, môn học, và sinh viên.

USE dbms_project;

-- -----------------------------------------------------------------------------
-- Lấy danh sách Request của gia sư
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_tutor_requests;
DELIMITER //
CREATE PROCEDURE sp_get_tutor_requests(
    IN p_tutor_id CHAR(36)
)
BEGIN
    -- Lấy tất cả request thuộc về các session mà gia sư này dạy
    SELECT r.*, s.subject_name -- Có thể join thêm bảng môn học/sinh viên nếu cần
    FROM requests r
    JOIN sessions s ON r.session_id = s.session_id
    WHERE s.tutor_id = p_tutor_id
    ORDER BY r.created_at DESC;
END //
DELIMITER ;