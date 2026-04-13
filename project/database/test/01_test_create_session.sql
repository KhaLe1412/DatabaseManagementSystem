-- File: 01_test_create_session.sql
-- Mô tả: Test stored procedure sp_create_session (tạo session, kiểm tra overlap)
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10

USE dbms_project;

-- Ensure no leftover test sessions
DELETE FROM sessions WHERE notes LIKE 'TEST_CREATE_%';

SELECT '=== TEST 01: CREATE SESSION (MULTIPLE CASES) ===' AS suite;

-- Prepare tutors and subjects
SET @tutor1 = (SELECT user_id FROM tutors ORDER BY user_id LIMIT 1);
SET @tutor2 = (SELECT user_id FROM tutors ORDER BY user_id DESC LIMIT 1);
SET @subject1 = 'Programming Fundamentals';
SET @subject2 = 'Data Structures';

-- Helper pattern per-case: call then assert

-- Run 10 isolated test cases following README template

-- TEST CASE 1
SELECT '=== TEST CASE 1: baseline create ===' AS test_name;
CALL sp_create_session(@tutor1, @subject1, '2026-04-20', '09:00:00', '10:00:00', 'online', NULL, 'https://meet.example/test01', 3, 'TEST_CREATE_1');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_1') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_1') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_1';

-- TEST CASE 2
SELECT '=== TEST CASE 2: start at existing end (non-overlap) ===' AS test_name;
CALL sp_create_session(@tutor1, @subject1, '2026-04-12', '11:00:00', '12:00:00', 'online', NULL, 'https://meet.example/test02', 3, 'TEST_CREATE_2');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_2') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_2') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_2';

-- TEST CASE 3
SELECT '=== TEST CASE 3: end at existing start (non-overlap) ===' AS test_name;
CALL sp_create_session(@tutor1, @subject1, '2026-04-12', '07:00:00', '09:00:00', 'online', NULL, 'https://meet.example/test03', 2, 'TEST_CREATE_3');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_3') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_3') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_3';

-- TEST CASE 4
SELECT '=== TEST CASE 4: same slot different tutor (adjusted non-overlap) ===' AS test_name;
CALL sp_create_session(@tutor2, @subject1, '2026-04-12', '11:00:00', '12:00:00', 'online', NULL, 'https://meet.example/test04', 4, 'TEST_CREATE_4');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_4') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_4') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_4';

-- TEST CASE 5
SELECT '=== TEST CASE 5: in-person with location ===' AS test_name;
CALL sp_create_session(@tutor1, @subject2, '2026-04-13', '14:00:00', '16:00:00', 'in-person', 'Room 301', NULL, 5, 'TEST_CREATE_5');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_5') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_5') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_5';

-- TEST CASE 6
SELECT '=== TEST CASE 6: online long link ===' AS test_name;
CALL sp_create_session(@tutor2, @subject2, '2026-04-14', '18:00:00', '20:30:00', 'online', NULL, 'https://meet.example/test06-long-link', 6, 'TEST_CREATE_6');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_6') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_6') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_6';

-- TEST CASE 7
SELECT '=== TEST CASE 7: capacity one ===' AS test_name;
CALL sp_create_session(@tutor1, @subject1, '2026-04-15', '08:00:00', '09:00:00', 'in-person', 'Room 105', NULL, 1, 'TEST_CREATE_7');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_7') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_7') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_7';

-- TEST CASE 8
SELECT '=== TEST CASE 8: non-overlapping different date ===' AS test_name;
CALL sp_create_session(@tutor2, @subject1, '2026-04-16', '10:00:00', '11:30:00', 'online', NULL, 'https://meet.example/test08', 3, 'TEST_CREATE_8');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_8') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_8') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_8';

-- TEST CASE 9
SELECT '=== TEST CASE 9: same time as completed session ===' AS test_name;
CALL sp_create_session(@tutor1, @subject1, '2026-04-10', '09:00:00', '10:30:00', 'online', NULL, 'https://meet.example/test09', 3, 'TEST_CREATE_9');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_9') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_9') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_9';

-- TEST CASE 10
SELECT '=== TEST CASE 10: adjacent different day ===' AS test_name;
CALL sp_create_session(@tutor1, @subject2, '2026-04-17', '12:00:00', '13:00:00', 'in-person', 'Room 404', NULL, 2, 'TEST_CREATE_10');
SELECT (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_10') AS created,
       CASE WHEN (SELECT COUNT(*) FROM sessions WHERE notes = 'TEST_CREATE_10') = 1 THEN 'PASSED' ELSE 'FAILED' END AS result;
DELETE FROM sessions WHERE notes = 'TEST_CREATE_10';

SELECT '=== TEST 01 COMPLETED (10 isolated cases) ===' AS suite_result;

