-- File: sp_remove_student_session.sql
-- Mo ta: Bo sinh vien khoi session
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
-- Parameters: session_id, student_id
-- Returns: thong bao ket qua

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_remove_student_session//

CREATE PROCEDURE sp_remove_student_session(
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_student_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_session_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session_id';
    END IF;

    IF p_student_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid student_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sessions WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
    END IF;

    START TRANSACTION;

    -- Kiểm tra sinh viên có thực sự nằm trong buổi học này không
    IF NOT EXISTS (
        SELECT 1
        FROM session_participants
        WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
          AND student_id = p_student_id COLLATE utf8mb4_unicode_ci
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is not in this session';
    END IF;

    -- Xóa sinh viên
    DELETE FROM session_participants
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
      AND student_id = p_student_id COLLATE utf8mb4_unicode_ci;

    -- Cập nhật thẳng trạng thái
    UPDATE sessions
    SET status = 'open'
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
      AND status = 'full';

    COMMIT;

    SELECT 'Student removed from session successfully' AS message;
END//

DELIMITER ;

DELIMITER ;

-- Test procedure
-- CALL sp_remove_student_session(2, 3);
