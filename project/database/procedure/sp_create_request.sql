-- File: sp_create_request.sql
-- Mô tả: Tạo một yêu cầu (request) dời buổi học (session) từ phía sinh viên. Yêu cầu này sẽ được lưu vào bảng requests và có trạng thái 'pending' để chờ gia sư xem xét.
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-16
-- Parameters: p_student_id, p_session_id, p_date, p_start_time, p_end_time, p_reason
-- Returns: Không trả về kết quả, nhưng sẽ tạo một bản ghi mới trong bảng requests với trạng thái 'pending'.

USE dbms_project;

-- -----------------------------------------------------------------------------
-- Tạo Request dời session (Sinh viên gọi)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_create_request;
DELIMITER //
CREATE PROCEDURE sp_create_request(
    IN p_student_id CHAR(36),
    IN p_session_id CHAR(36),
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_reason TEXT
)
BEGIN
    INSERT INTO requests (student_id, session_id, date, start_time, end_time, reason, status)
    VALUES (p_student_id, p_session_id, p_date, p_start_time, p_end_time, p_reason, 'pending');
END //
DELIMITER ;