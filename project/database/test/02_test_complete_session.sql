-- File: 02_test_complete_session.sql
-- Mô tả: Test stored procedure sp_complete_session (đánh dấu session hoàn thành)
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10

-- Run in window: Get-Content database\test\02_test_complete_session.sql | docker exec -i dbms_mysql mysql -u root -prootpassword dbms_project

USE dbms_project;
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET collation_connection = 'utf8mb4_unicode_ci';

SELECT '=== TEST 02: COMPLETE SESSION (10 cases) ===' AS suite_name;

-- Prepare helpers
SET @tutor_id = (SELECT tutor_id FROM tutors ORDER BY tutor_id LIMIT 1);
SET @subject = 'SUBJ-0000-0000-0000-000000000005'; -- Lập trình căn bản
SET @student1 = (SELECT student_id FROM students ORDER BY student_id LIMIT 1);

-- Ensure no leftover
DELETE FROM session_participants WHERE session_id IN (SELECT session_id FROM sessions WHERE notes LIKE 'TEST_COMPLETE_%');
DELETE FROM sessions WHERE notes LIKE 'TEST_COMPLETE_%';

-- ===== TEST CASE 1: complete an open session =====
SELECT '=== TEST CASE 1 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-04-25', '09:00:00', '10:00:00', 'online', NULL, NULL, 3, 'TEST_COMPLETE_1');
SET @sid1 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_1' LIMIT 1);
CALL sp_complete_session(@sid1);
SELECT @sid1 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid1) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid1)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE session_id = @sid1;

-- ===== TEST CASE 2: complete a scheduled session =====
SELECT '=== TEST CASE 2 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-04-26', '10:00:00', '11:30:00', 'online', NULL, NULL, 2, 'TEST_COMPLETE_2');
SET @sid2 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_2' LIMIT 1);
-- Mark scheduled by updating status (simulate pre-existing scheduled state)
UPDATE sessions SET status='scheduled' WHERE session_id=@sid2;
CALL sp_complete_session(@sid2);
SELECT @sid2 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid2) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid2)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE session_id = @sid2;

-- ===== TEST CASE 3: complete a full session =====
SELECT '=== TEST CASE 3 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-04-27', '14:00:00', '15:00:00', 'online', NULL, NULL, 1, 'TEST_COMPLETE_3');
SET @sid3 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_3' LIMIT 1);
-- make it full by inserting one participant
INSERT IGNORE INTO session_participants (session_id, student_id) VALUES (@sid3, @student1);
UPDATE sessions SET status='full' WHERE session_id=@sid3;
CALL sp_complete_session(@sid3);
SELECT @sid3 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid3) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid3)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM session_participants WHERE session_id=@sid3;
DELETE FROM sessions WHERE session_id = @sid3;

-- ===== TEST CASE 4: complete session with participants (multiple) =====
SELECT '=== TEST CASE 4 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-04-28', '09:00:00', '11:00:00', 'in-person', 'Room 200', NULL, 3, 'TEST_COMPLETE_4');
SET @sid4 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_4' LIMIT 1);
INSERT IGNORE INTO session_participants (session_id, student_id) VALUES (@sid4, @student1);
CALL sp_complete_session(@sid4);
SELECT @sid4 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid4) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid4)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM session_participants WHERE session_id=@sid4;
DELETE FROM sessions WHERE session_id = @sid4;

-- ===== TEST CASE 5: complete offline session =====
SELECT '=== TEST CASE 5 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-04-29', '13:00:00', '14:30:00', 'in-person', 'Room 101', NULL, 2, 'TEST_COMPLETE_5');
SET @sid5 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_5' LIMIT 1);
CALL sp_complete_session(@sid5);
SELECT @sid5 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid5) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid5)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE session_id = @sid5;

-- ===== TEST CASE 6: idempotent complete (call twice) =====
SELECT '=== TEST CASE 6 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-05-01', '09:00:00', '10:00:00', 'online', NULL, NULL, 2, 'TEST_COMPLETE_6');
SET @sid6 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_6' LIMIT 1);
CALL sp_complete_session(@sid6);
-- call again (should remain completed)
CALL sp_complete_session(@sid6);
SELECT @sid6 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid6) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid6)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE session_id = @sid6;

-- ===== TEST CASE 7: complete session with max_students edge =====n
SELECT '=== TEST CASE 7 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-05-02', '15:00:00', '16:00:00', 'online', NULL, NULL, 100, 'TEST_COMPLETE_7');
SET @sid7 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_7' LIMIT 1);
CALL sp_complete_session(@sid7);
SELECT @sid7 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid7) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid7)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE session_id = @sid7;

-- ===== TEST CASE 8: complete session created far future date =====
SELECT '=== TEST CASE 8 ===' AS test_name;
CALL sp_create_session(@tutor_id, @subject, '2026-12-01', '09:00:00', '11:00:00', 'online', NULL, NULL, 3, 'TEST_COMPLETE_8');
SET @sid8 = (SELECT session_id FROM sessions WHERE notes = 'TEST_COMPLETE_8' LIMIT 1);
CALL sp_complete_session(@sid8);
SELECT @sid8 AS session_id, (SELECT status FROM sessions WHERE session_id=@sid8) AS status,
    CASE WHEN (SELECT status FROM sessions WHERE session_id=@sid8)='completed' THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE session_id = @sid8;

-- ===== TEST CASE 9: expected failure - non-existent session (commented) =====
SELECT '=== TEST CASE 9: expected failure (non-existent) ===' AS test_name;
-- CALL sp_complete_session(999999); -- Expected: SIGNAL 'Session not found' (error 45000)
SELECT 'CALL commented out; expected to raise 45000 Session not found' AS note;

-- ===== TEST CASE 10: expected failure - invalid id (commented) =====
SELECT '=== TEST CASE 10: expected failure (invalid id) ===' AS test_name;
-- CALL sp_complete_session(0); -- Expected: SIGNAL 'Invalid session_id'
SELECT 'CALL commented out; expected to raise 45000 Invalid session_id' AS note;

SELECT '=== TEST 02 COMPLETED (10 cases) ===' AS suite_result;
