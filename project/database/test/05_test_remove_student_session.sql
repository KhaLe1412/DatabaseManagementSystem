-- File: 05_test_remove_student_session.sql
-- Mô tả: Test stored procedure sp_remove_student_session (bỏ học viên và kiểm tra trạng thái)
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10

-- Run in window: Get-Content database\test\05_test_remove_student_session.sql | docker exec -i dbms_mysql mysql -u root -prootpassword dbms_project

USE dbms_project;
SELECT '=== TEST 05: REMOVE STUDENT FROM SESSION (10 happy-path cases) ===' AS suite;

-- Prepare helpers
SET @tutor1 = (SELECT tutor_id FROM tutors ORDER BY tutor_id LIMIT 1);
SET @tutor2 = (SELECT tutor_id FROM tutors ORDER BY tutor_id DESC LIMIT 1);
SET @s1 = (SELECT student_id FROM students ORDER BY student_id LIMIT 1);
SET @s2 = (SELECT student_id FROM students ORDER BY student_id LIMIT 1 OFFSET 1);
SET @s3 = (SELECT student_id FROM students ORDER BY student_id LIMIT 1 OFFSET 2);
SET @s4 = (SELECT student_id FROM students ORDER BY student_id LIMIT 1 OFFSET 3);

-- TEST CASE 1: add one, remove one
SELECT '=== TEST CASE 1 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Programming Fundamentals', '2026-05-10', '08:00:00', '09:00:00', 'online', NULL, 'https://meet.example/remove-1', 2, 'TEST_REMOVE_1');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_1' LIMIT 1);
SELECT 'before add' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_add_student_session(@sid, @s1);
SELECT 'after add' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_count;
CALL sp_remove_student_session(@sid, @s1);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 2: add two, remove one
SELECT '=== TEST CASE 2 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Data Structures', '2026-05-10', '09:30:00', '10:30:00', 'in-person', 'Room 101', NULL, 3, 'TEST_REMOVE_2');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_2' LIMIT 1);
CALL sp_add_student_session(@sid, @s1);
CALL sp_add_student_session(@sid, @s2);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s1);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 3: remove last participant -> session becomes open
SELECT '=== TEST CASE 3 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Calculus 1', '2026-05-11', '08:00:00', '09:30:00', 'online', NULL, 'https://meet.example/remove-3', 1, 'TEST_REMOVE_3');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_3' LIMIT 1);
CALL sp_add_student_session(@sid, @s3);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s3);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 4: remove when multiple participants remain
SELECT '=== TEST CASE 4 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Programming Fundamentals', '2026-05-11', '10:00:00', '11:00:00', 'in-person', 'Room 202', NULL, 5, 'TEST_REMOVE_4');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_4' LIMIT 1);
CALL sp_add_student_session(@sid, @s1);
CALL sp_add_student_session(@sid, @s2);
CALL sp_add_student_session(@sid, @s3);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s2);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 5: remove from in-person session
SELECT '=== TEST CASE 5 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Data Structures', '2026-05-12', '09:00:00', '10:30:00', 'in-person', 'Room 303', NULL, 3, 'TEST_REMOVE_5');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_5' LIMIT 1);
CALL sp_add_student_session(@sid, @s4);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s4);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
SELECT session_id, status FROM sessions WHERE session_id=@sid;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 6: remove after session marked full
SELECT '=== TEST CASE 6 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Calculus 1', '2026-05-12', '11:00:00', '12:00:00', 'online', NULL, 'https://meet.example/remove-6', 2, 'TEST_REMOVE_6');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_6' LIMIT 1);
CALL sp_add_student_session(@sid, @s1);
CALL sp_add_student_session(@sid, @s2);
-- session should now be full
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count, (SELECT status FROM sessions WHERE session_id=@sid) AS status_before;
CALL sp_remove_student_session(@sid, @s2);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count, (SELECT status FROM sessions WHERE session_id=@sid) AS status_after;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 7: remove when many slots available
SELECT '=== TEST CASE 7 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Programming Fundamentals', '2026-05-13', '08:00:00', '09:30:00', 'in-person', 'Room 101', NULL, 10, 'TEST_REMOVE_7');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_7' LIMIT 1);
CALL sp_add_student_session(@sid, @s1);
CALL sp_add_student_session(@sid, @s2);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s1);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 8: remove same student after re-adding
SELECT '=== TEST CASE 8 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Data Structures', '2026-05-13', '10:00:00', '11:30:00', 'online', NULL, 'https://meet.example/remove-8', 3, 'TEST_REMOVE_8');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_8' LIMIT 1);
CALL sp_add_student_session(@sid, @s3);
CALL sp_remove_student_session(@sid, @s3);
-- re-add then remove again
CALL sp_add_student_session(@sid, @s3);
SELECT 'before final remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s3);
SELECT 'after final remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

-- TEST CASE 9: remove when only one of multiple sessions
SELECT '=== TEST CASE 9 ===' AS test_name;
CALL sp_create_session(@tutor2, 'Calculus 1', '2026-05-14', '09:00:00', '10:00:00', 'in-person', 'Room 202', NULL, 2, 'TEST_REMOVE_9a');
CALL sp_create_session(@tutor2, 'Calculus 1', '2026-05-14', '10:30:00', '11:30:00', 'in-person', 'Room 203', NULL, 2, 'TEST_REMOVE_9b');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_9a' LIMIT 1);
SET @sid2 = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_9b' LIMIT 1);
CALL sp_add_student_session(@sid, @s1);
CALL sp_add_student_session(@sid2, @s2);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count_a, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid2) AS before_count_b;
CALL sp_remove_student_session(@sid, @s1);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_count_a, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid2) AS after_count_b;
DELETE FROM session_participants WHERE session_id IN (@sid,@sid2); DELETE FROM sessions WHERE session_id IN (@sid,@sid2);

-- TEST CASE 10: cleanup and final sanity
SELECT '=== TEST CASE 10 ===' AS test_name;
CALL sp_create_session(@tutor1, 'Programming Fundamentals', '2026-05-15', '08:00:00', '09:00:00', 'online', NULL, 'https://meet.example/remove-10', 2, 'TEST_REMOVE_10');
SET @sid = (SELECT session_id FROM sessions WHERE notes='TEST_REMOVE_10' LIMIT 1);
CALL sp_add_student_session(@sid, @s1);
CALL sp_add_student_session(@sid, @s2);
SELECT 'before remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS before_count;
CALL sp_remove_student_session(@sid, @s2);
SELECT 'after remove' AS stage, (SELECT COUNT(*) FROM session_participants WHERE session_id=@sid) AS after_remove_count;
DELETE FROM session_participants WHERE session_id=@sid; DELETE FROM sessions WHERE session_id=@sid;

SELECT '=== TEST 05 COMPLETED (10 cases) ===' AS suite_result;
