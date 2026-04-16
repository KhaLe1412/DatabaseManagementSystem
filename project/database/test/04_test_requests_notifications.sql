-- File: 04_test_requests_notifications.sql
-- Mô tả: Test các Stored Procedures cho Requests và Notifications (Nhiệm vụ 4)
-- Tác giả: Huỳnh Hữu Nhật (bổ sung kịch bản Requests/Notifications)
-- Ngày cập nhật: 2026-04-16

USE dbms_project;

-- ================================
-- SETUP MOCK DATA
-- ================================
SELECT '=== SETUP DỮ LIỆU TEST ===' AS action;

SET @test_tutor_uuid = 'TEST-TUTO-0000-0000-0000-000000000000';
SET @test_student_uuid = 'TEST-STUD-0000-0000-0000-000000000000';
SET @test_session_uuid = 'TEST-SESS-0000-0000-0000-000000000000';

-- 1. Tạo User & Role
INSERT INTO users (id, username, password, email, full_name, role) 
VALUES 
    (@test_tutor_uuid, 'test_tutor', 'pass', 'tutor@test.com', 'Test Tutor', 'tutor'),
    (@test_student_uuid, 'test_student', 'pass', 'student@test.com', 'Test Student', 'student');

INSERT INTO tutors (tutor_id) VALUES (@test_tutor_uuid);
INSERT INTO students (student_id) VALUES (@test_student_uuid);

-- 2. Tạo Session & Đăng ký tham gia
INSERT INTO sessions (session_id, tutor_id, date, start_time, end_time, type, max_student) 
VALUES (@test_session_uuid, @test_tutor_uuid, '2026-05-01', '08:00:00', '10:00:00', 'online', 10);

INSERT INTO session_participants (student_id, session_id) 
VALUES (@test_student_uuid, @test_session_uuid);


-- ================================
-- TEST 1: Sinh viên tạo Request dời lịch
-- ================================
SELECT '=== TEST 1: sp_create_request ===' AS test_name;

CALL sp_create_request(
    @test_student_uuid, 
    @test_session_uuid, 
    '2026-05-02', '14:00:00', '16:00:00', 
    'Bị cấn lịch thi giữa kỳ'
);

-- Lấy ID của request vừa tạo để dùng cho các test sau
SET @new_request_id = LAST_INSERT_ID();

SELECT 
    CASE WHEN status = 'pending' THEN 'CREATE REQUEST: PASSED' ELSE 'CREATE REQUEST: FAILED' END AS result 
FROM requests WHERE request_id = @new_request_id;


-- ================================
-- TEST 2: Gia sư xem danh sách Request
-- ================================
SELECT '=== TEST 2: sp_get_tutor_requests ===' AS test_name;

CALL sp_get_tutor_requests(@test_tutor_uuid);


-- ================================
-- TEST 3: Gia sư chấp nhận Request -> Test Update Session & Notification
-- ================================
SELECT '=== TEST 3: sp_accept_request ===' AS test_name;

CALL sp_accept_request(@new_request_id);

-- Validate 1: Trạng thái request đã đổi thành approved chưa?
-- Validate 2: Giờ học trong session đã đổi thành 2026-05-02 14:00:00 chưa?
SELECT 
    r.status AS request_status, 
    s.date AS new_date,
    CASE 
        WHEN r.status = 'approved' AND s.date = '2026-05-02' THEN 'ACCEPT REQUEST: PASSED' 
        ELSE 'ACCEPT REQUEST: FAILED' 
    END AS result
FROM requests r
JOIN sessions s ON r.session_id = s.session_id
WHERE r.request_id = @new_request_id;


-- ================================
-- TEST 4: Gia sư hủy Session -> Test tự động gửi Notification
-- ================================
SELECT '=== TEST 4: sp_cancel_session ===' AS test_name;

CALL sp_cancel_session(@test_session_uuid);

-- Validate: Session đã bị xóa chưa?
SELECT 
    CASE WHEN COUNT(*) = 0 THEN 'CANCEL SESSION: PASSED' ELSE 'CANCEL SESSION: FAILED' END AS result
FROM sessions WHERE session_id = @test_session_uuid;


-- ================================
-- TEST 5: Sinh viên kiểm tra Notifications
-- ================================
SELECT '=== TEST 5: sp_get_user_notifications ===' AS test_name;

-- Should show at least 3 notifications: 
-- 1. Request Approved (từ Test 3)
-- 2. Reschedule Notification (từ Test 3)
-- 3. Cancel Notification (từ Test 4)
CALL sp_get_user_notifications(@test_student_uuid);


-- ================================
-- CLEANUP
-- ================================
SELECT '=== CLEANING UP TEST DATA ===' AS action;

-- Việc xóa Users sẽ kích hoạt ON DELETE CASCADE xóa sạch dữ liệu liên quan
-- ở các bảng tutors, students, requests, notifications, session_participants.
DELETE FROM users WHERE id IN (@test_tutor_uuid, @test_student_uuid);

SELECT '=== TEST COMPLETED ===' AS test_name;