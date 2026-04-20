-- File: sp_filter_sessions.sql
-- Mo ta: Loc session theo tutor / student / subject / ngay / status / type
-- Tac gia: Nhan
-- Ngay tao: 2026-04-10
-- Parameters: tutor_id, student_id, subject_id, session_date, status, type
-- Returns: danh sach sessions

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_filter_sessions//

CREATE PROCEDURE sp_filter_sessions(
    IN p_tutor_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_student_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_subject_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_session_date DATE,
    IN p_status VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_type VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

        SELECT
                s.session_id,
                s.tutor_id,
                subj.name AS subject,
                s.subject_id,
                s.date,
                s.start_time,
                s.end_time,
                s.type,
                s.status,
                s.max_students,
                s.location,
                s.meeting_link,
                COUNT(sp.student_id) AS current_students
        FROM sessions s
        LEFT JOIN subjects subj ON subj.id = s.subject_id
        LEFT JOIN session_participants sp ON sp.session_id = s.session_id
        WHERE (p_tutor_id IS NULL OR s.tutor_id = p_tutor_id)
            AND (p_subject_id IS NULL OR s.subject_id = p_subject_id)
            AND (p_session_date IS NULL OR s.date = p_session_date)
            AND (p_status IS NULL OR s.status = p_status)
            AND (p_type IS NULL OR s.type = p_type)
            AND (
                        p_student_id IS NULL
                        OR EXISTS (
                                SELECT 1
                                FROM session_participants x
                                WHERE x.session_id = s.session_id
                                    AND x.student_id = p_student_id
                        )
            )
        GROUP BY
                s.session_id,
                s.tutor_id,
                subj.name,
                s.subject_id,
                s.date,
                s.start_time,
                s.end_time,
                s.type,
                s.status,
                s.max_students,
                s.location,
                s.meeting_link
        ORDER BY s.date, s.start_time ASC;
END//

DELIMITER ;

-- Test procedure
-- CALL sp_filter_sessions(5, NULL, NULL, '2026-04-12', 'open', NULL);
