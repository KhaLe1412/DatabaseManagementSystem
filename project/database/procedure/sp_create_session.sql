-- File: sp_create_session.sql
-- Mo ta: Tao session moi, khong cho phep trung lich theo tutor
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
-- Parameters: tutor_id, subject_id, start_time, end_time, type, location, meeting_link, max_students, notes
-- Returns: session_id moi

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_create_session//

CREATE PROCEDURE sp_create_session(
    -- 1. Ép Collation cho các tham số chuỗi để chống lỗi 1267
    IN p_tutor_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_subject VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_type VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_location VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_meeting_link VARCHAR(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_max_students INT,
    IN p_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE v_overlap_count INT DEFAULT 0;
    -- Khai báo biến cục bộ thay cho biến toàn cục @
    DECLARE v_session_id CHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Các bước Validation
    IF p_tutor_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid tutor_id';
    END IF;

    IF p_subject IS NULL OR TRIM(p_subject) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid subject';
    END IF;

    IF p_date IS NULL OR p_start_time IS NULL OR p_end_time IS NULL OR p_start_time >= p_end_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session time range';
    END IF;
    
    IF p_type NOT IN ('online', 'in-person') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid session type';
    END IF;

    IF p_max_students IS NULL OR p_max_students <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid max_students';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM tutors WHERE user_id = p_tutor_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor not found';
    END IF;

    START TRANSACTION;

        -- Kiểm tra Overlap (Trùng lịch)
        SELECT COUNT(*) INTO v_overlap_count
        FROM sessions s
        WHERE s.tutor_id = p_tutor_id
            AND s.status IN ('open', 'scheduled', 'full')
            AND s.date = p_date
            AND NOT (s.end_time <= p_start_time OR s.start_time >= p_end_time);

    IF v_overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session overlaps existing session';
    END IF;

    -- Tạo UUID mới cho buổi học
    SET v_session_id = UUID();

    INSERT INTO sessions (
        session_id, tutor_id, subject, date, start_time, end_time, 
        type, location, meeting_link, max_students, status, notes
    ) VALUES (
        v_session_id, p_tutor_id, p_subject, p_date, p_start_time, p_end_time, 
        p_type, p_location, p_meeting_link, p_max_students, 'open', p_notes
    );

    COMMIT;

    SELECT v_session_id AS session_id;
END//

DELIMITER ;

-- Test procedure
-- CALL sp_create_session(5, 1, '2026-04-13 09:00:00', '2026-04-13 10:30:00', 'online', NULL, 'https://meet.example.com/s5', 3, 'Test create');
