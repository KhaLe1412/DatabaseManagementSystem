-- File: sp_add_student_session.sql
-- Mo ta: Them sinh vien vao session
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
-- Parameters: session_id, student_id
-- Returns: thong bao ket qua

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_add_student_session//

CREATE PROCEDURE sp_add_student_session(
    IN p_session_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_student_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_max_students INT;
    DECLARE v_current_students INT;

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

    IF NOT EXISTS (SELECT 1 FROM students WHERE student_id = p_student_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student not found';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sessions WHERE session_id = p_session_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session not found';
    END IF;

    START TRANSACTION;

    SELECT status, max_students
    INTO v_status, v_max_students
    FROM sessions
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
    FOR UPDATE;

    IF v_status <> 'open' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session is not open';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM session_participants
        WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
          AND student_id = p_student_id 
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student already joined session';
    END IF;

    SELECT COUNT(*)
    INTO v_current_students
    FROM session_participants
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci
    FOR UPDATE;

    IF v_current_students >= v_max_students THEN
        UPDATE sessions
        SET status = 'full',
            updated_at = CURRENT_TIMESTAMP
        WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session is full';
    END IF;

    INSERT INTO session_participants (session_id, student_id)
    VALUES (p_session_id, p_student_id);

    SELECT COUNT(*)
    INTO v_current_students
    FROM session_participants
    WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;

    IF v_current_students >= v_max_students THEN
        UPDATE sessions
        SET status = 'full',
            updated_at = CURRENT_TIMESTAMP
        WHERE session_id = p_session_id COLLATE utf8mb4_unicode_ci;
    END IF;

    COMMIT;

    SELECT 'Student added to session successfully' AS message;
END//

DELIMITER ;

-- Test procedure
-- CALL sp_add_student_session(2, 1);
