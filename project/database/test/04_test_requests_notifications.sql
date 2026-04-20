-- File: 04_test_requests_notifications.sql
-- Description: Run full Task 4 flow test for requests and notifications.
-- Author: Ha Thanh Trung
-- Created on: 2026-04-15

USE dbms_project;
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET collation_connection = 'utf8mb4_unicode_ci';

-- Pick existing records for a full flow:
-- - One session with at least two participants for reschedule/request flow
-- - One different session for cancel flow
-- - Tutor and two students from the chosen session
SET @session_with_participants := (
    SELECT s.session_id
    FROM sessions s
    JOIN session_participants sp ON sp.session_id = s.session_id
    WHERE s.status IN ('open', 'scheduled', 'full')
    GROUP BY s.session_id
    HAVING COUNT(*) >= 2
    ORDER BY s.created_at, s.session_id
    LIMIT 1
);

SET @session_any := (
    SELECT s.session_id
    FROM sessions s
    WHERE s.session_id <> @session_with_participants
    ORDER BY s.created_at, s.session_id
    LIMIT 1
);

SET @tutor_id := (
    SELECT s.tutor_id
    FROM sessions s
    WHERE s.session_id = @session_with_participants
    LIMIT 1
);

SET @student1 := (
    SELECT sp.student_id
    FROM session_participants sp
    WHERE sp.session_id = @session_with_participants
    ORDER BY sp.student_id
    LIMIT 1
);

SET @student2 := (
    SELECT sp.student_id
    FROM session_participants sp
    WHERE sp.session_id = @session_with_participants
      AND sp.student_id <> @student1
    ORDER BY sp.student_id
    LIMIT 1
);

SELECT '=== DEBUG SELECTED IDS ===' AS step;
SELECT @session_with_participants AS session_for_flow, @session_any AS session_for_cancel, @tutor_id AS tutor_id, @student1 AS student1, @student2 AS student2;

-- (6)(7) Before write
SELECT '=== (6)(7) BEFORE WRITE ===' AS step;
CALL sp_list_requests_for_tutor(@tutor_id);
CALL sp_list_notifications_for_user(@student1);
CALL sp_list_notifications_for_user(@student2);

-- (1) Update session time + create reschedule notifications
SELECT '=== (1) UPDATE SESSION TIME + NOTIFICATIONS ===' AS step;
CALL sp_update_session_time_notify(@session_with_participants, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '14:00:00', '16:00:00');

-- (2) Cancel another session + create cancel notifications
SELECT '=== (2) CANCEL SESSION + NOTIFICATIONS ===' AS step;
CALL sp_cancel_session_notify(@session_any);

-- (3) + (5) Create request then reject
SELECT '=== (3)(5) CREATE REQUEST THEN REJECT ===' AS step;
CALL sp_create_reschedule_request(@student1, @session_with_participants, DATE_ADD(CURDATE(), INTERVAL 8 DAY), '09:00:00', '10:30:00', 'Need another slot');
SET @req_reject := (SELECT request_id FROM session_requests WHERE student_id = @student1 ORDER BY created_at DESC LIMIT 1);
CALL sp_reject_reschedule_request(@req_reject);

-- (3) + (4) Create request then accept
SELECT '=== (3)(4) CREATE REQUEST THEN ACCEPT ===' AS step;
CALL sp_create_reschedule_request(@student2, @session_with_participants, DATE_ADD(CURDATE(), INTERVAL 9 DAY), '10:00:00', '11:30:00', 'Prefer this schedule');
SET @req_accept := (SELECT request_id FROM session_requests WHERE student_id = @student2 ORDER BY created_at DESC LIMIT 1);
CALL sp_accept_reschedule_request(@req_accept);

-- (6)(7) After write
SELECT '=== (6)(7) AFTER WRITE ===' AS step;
CALL sp_list_requests_for_tutor(@tutor_id);
CALL sp_list_notifications_for_user(@student1);
CALL sp_list_notifications_for_user(@student2);

SELECT '=== DONE FULL FLOW TASK 4 ===' AS step;
