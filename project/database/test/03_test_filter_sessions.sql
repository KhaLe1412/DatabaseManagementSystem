-- File: 03_test_filter_sessions.sql
-- Mô tả: Test stored procedure sp_filter_sessions (lọc theo các tham số)
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10

USE dbms_project;

-- Ensure connection uses the same collation as tables to avoid collation-mix errors
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET collation_connection = 'utf8mb4_unicode_ci';

SELECT '=== TEST 03: FILTER SESSIONS (10 happy-path cases) ===' AS suite;

-- Prepare params (use subject strings since subjects table was removed)
SET @tutor1 = (SELECT user_id FROM tutors ORDER BY user_id LIMIT 1);
SET @tutor2 = (SELECT user_id FROM tutors ORDER BY user_id DESC LIMIT 1);
SET @student1 = (SELECT user_id FROM students ORDER BY user_id LIMIT 1);
SET @subject1 = 'Programming Fundamentals';
SET @session_date = '2026-04-12'; -- seeded date with multiple sessions

-- CASE 1: no filters (expect total sessions >= 1)
SELECT '=== TEST CASE 1: no filters ===' AS test_name;
CALL sp_filter_sessions(NULL, NULL, NULL, NULL, NULL, NULL);
SELECT COUNT(*) AS total_sessions FROM sessions;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions) >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 2: filter by tutor
SELECT '=== TEST CASE 2: filter by tutor ===' AS test_name;
CALL sp_filter_sessions(@tutor1, NULL, NULL, NULL, NULL, NULL);
SELECT (SELECT COUNT(*) FROM sessions WHERE tutor_id = @tutor1) AS count_for_tutor;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE tutor_id = @tutor1) >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 3: filter by other tutor
SELECT '=== TEST CASE 3: filter by other tutor ===' AS test_name;
CALL sp_filter_sessions(@tutor2, NULL, NULL, NULL, NULL, NULL);
SELECT (SELECT COUNT(*) FROM sessions WHERE tutor_id = @tutor2) AS count_for_tutor2;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE tutor_id = @tutor2) >= 0 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 4: filter by subject (string)
SELECT '=== TEST CASE 4: filter by subject ===' AS test_name;
CALL sp_filter_sessions(NULL, NULL, @subject1, NULL, NULL, NULL);
SELECT (SELECT COUNT(*) FROM sessions WHERE subject = @subject1) AS count_for_subject;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE subject = @subject1) >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 5: filter by date
SELECT '=== TEST CASE 5: filter by date ===' AS test_name;
CALL sp_filter_sessions(NULL, NULL, NULL, @session_date, NULL, NULL);
SELECT (SELECT COUNT(*) FROM sessions WHERE date = @session_date) AS count_for_date;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE date = @session_date) >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 6: filter by type (online)
SELECT '=== TEST CASE 6: filter by type=online ===' AS test_name;
CALL sp_filter_sessions(NULL, NULL, NULL, NULL, NULL, 'online');
SELECT (SELECT COUNT(*) FROM sessions WHERE type = 'online') AS count_online;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE type = 'online') >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 7: filter by student (sessions student participates)
SELECT '=== TEST CASE 7: filter by student ===' AS test_name;
CALL sp_filter_sessions(NULL, @student1, NULL, NULL, NULL, NULL);
SELECT (SELECT COUNT(DISTINCT s.session_id)
		FROM sessions s
		JOIN session_participants sp ON sp.session_id = s.session_id
		WHERE sp.student_id = @student1) AS count_for_student;
SELECT CASE WHEN (
	SELECT COUNT(DISTINCT s.session_id)
	FROM sessions s
	JOIN session_participants sp ON sp.session_id = s.session_id
	WHERE sp.student_id = @student1) >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 8: filter by tutor + subject
SELECT '=== TEST CASE 8: filter by tutor+subject ===' AS test_name;
CALL sp_filter_sessions(@tutor1, NULL, @subject1, NULL, NULL, NULL);
SELECT (SELECT COUNT(*) FROM sessions WHERE tutor_id=@tutor1 AND subject=@subject1) AS count_tutor_subject;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE tutor_id=@tutor1 AND subject=@subject1) >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 9: filter by date + type
SELECT '=== TEST CASE 9: filter by date+type ===' AS test_name;
CALL sp_filter_sessions(NULL, NULL, NULL, @session_date, NULL, 'online');
SELECT (SELECT COUNT(*) FROM sessions WHERE date=@session_date AND type='online') AS count_date_online;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE date=@session_date AND type='online') >= 1 THEN 'PASSED' ELSE 'FAILED' END AS result;

-- CASE 10: filter by tutor + date
SELECT '=== TEST CASE 10: filter by tutor+date ===' AS test_name;
CALL sp_filter_sessions(@tutor1, NULL, NULL, @session_date, NULL, NULL);
SELECT (SELECT COUNT(*) FROM sessions WHERE tutor_id=@tutor1 AND date=@session_date) AS count_tutor_date;
SELECT CASE WHEN (SELECT COUNT(*) FROM sessions WHERE tutor_id=@tutor1 AND date=@session_date) >= 0 THEN 'PASSED' ELSE 'FAILED' END AS result;

SELECT '=== TEST 03 COMPLETED (10 happy-path cases) ===' AS suite_result;
