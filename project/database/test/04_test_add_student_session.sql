-- File: 04_test_add_student_session.sql
-- Mô tả: Test stored procedure sp_add_student_session (thêm sinh viên, kiểm tra full)
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10

USE dbms_project;

SELECT '=== TEST 04: ADD STUDENT TO SESSION (10 happy-path cases) ===' AS suite;

-- Prepare helpers (use seeded UUID users)
SET @tutor1 = (SELECT user_id FROM tutors ORDER BY user_id LIMIT 1);
SET @tutor2 = (SELECT user_id FROM tutors ORDER BY user_id DESC LIMIT 1);
SET @s1 = (SELECT user_id FROM students ORDER BY user_id LIMIT 1);
SET @s2 = (SELECT user_id FROM students ORDER BY user_id LIMIT 1 OFFSET 1);
SET @s3 = (SELECT user_id FROM students ORDER BY user_id LIMIT 1 OFFSET 2);
SET @s4 = (SELECT user_id FROM students ORDER BY user_id LIMIT 1 OFFSET 3);

-- TEST CASE 1
SELECT '=== TEST CASE 1 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Programming Fundamentals', '2026-05-01', '08:00:00', '09:00:00', 'online', NULL, 'https://meet.example/test04-1', 3, 'TEST_ADD_1');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_1' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s1);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 2
SELECT '=== TEST CASE 2 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Programming Fundamentals', '2026-05-01', '09:30:00', '10:30:00', 'in-person', 'Room 101', NULL, 5, 'TEST_ADD_2');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_2' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s2);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 3
SELECT '=== TEST CASE 3 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Data Structures', '2026-05-02', '08:00:00', '09:30:00', 'online', NULL, 'https://meet.example/test04-3', 4, 'TEST_ADD_3');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_3' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s3);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 4
SELECT '=== TEST CASE 4 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Calculus 1', '2026-05-03', '10:00:00', '11:30:00', 'in-person', 'Room 202', NULL, 10, 'TEST_ADD_4');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_4' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s4);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 5
SELECT '=== TEST CASE 5 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Programming Fundamentals', '2026-05-04', '08:00:00', '09:00:00', 'online', NULL, 'https://meet.example/test04-5', 2, 'TEST_ADD_5');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_5' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s1);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 6
SELECT '=== TEST CASE 6 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Data Structures', '2026-05-04', '09:30:00', '10:30:00', 'in-person', 'Room 303', NULL, 4, 'TEST_ADD_6');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_6' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s2);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 7
SELECT '=== TEST CASE 7 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Calculus 1', '2026-05-05', '11:00:00', '12:30:00', 'online', NULL, 'https://meet.example/test04-7', 6, 'TEST_ADD_7');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_7' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s3);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 8
SELECT '=== TEST CASE 8 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Programming Fundamentals', '2026-05-06', '14:00:00', '15:30:00', 'in-person', 'Room 101', NULL, 8, 'TEST_ADD_8');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_8' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s4);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 9
SELECT '=== TEST CASE 9 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Data Structures', '2026-05-07', '08:00:00', '09:30:00', 'online', NULL, 'https://meet.example/test04-9', 5, 'TEST_ADD_9');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_9' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s1);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 10
SELECT '=== TEST CASE 10 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Calculus 1', '2026-05-08', '10:00:00', '11:30:00', 'in-person', 'Room 404', NULL, 3, 'TEST_ADD_10');
SET @sid = (SELECT session_id FROM sessions WHERE notes = 'TEST_ADD_10' LIMIT 1);
SELECT 'before' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_before;
CALL sp_add_student_session(@sid, @s2);
SELECT 'after' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS participants_after;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

SELECT '=== TEST 04 COMPLETED (10 cases) ===' AS suite_result;
