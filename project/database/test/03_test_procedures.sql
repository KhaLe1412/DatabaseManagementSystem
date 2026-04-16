-- File: 03_test_procedures.sql
-- Mô tả: Test các stored procedure cho resource, message và comment
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;

-- ================================
-- TEST SETUP
-- ================================
SELECT '=== TEST SETUP ===' AS test_name;

SET @doc_url_add = 'https://proc-test.local/library/add-document-20260405';
SET @doc_url_delete = 'https://proc-test.local/library/delete-document-20260405';
SET @msg_text_1 = '[PROC_TEST] Xin chao, day la tin nhan test 01';
SET @msg_text_2 = '[PROC_TEST] Day la phan hoi test 02';
SET @comment_text_1 = 'Buổi test procedure đầu tiên cho phần comment.';
SET @comment_text_2 = 'Buổi test procedure cập nhật lại phần comment.';

DELETE FROM message
WHERE content IN (@msg_text_1, @msg_text_2);

DELETE FROM resource
WHERE url IN (@doc_url_add, @doc_url_delete);

SELECT
    s.student_id,
    se.session_id
INTO @test_student_id, @test_session_id
FROM students s
CROSS JOIN sessions se
LEFT JOIN `comment` c
    ON c.student_id = s.student_id
   AND c.session_id = se.session_id
WHERE c.student_id IS NULL
LIMIT 1;

SELECT
    a1.user_id,
    a2.user_id
INTO @msg_sender_id, @msg_receiver_id
FROM accounts a1
JOIN accounts a2
    ON a1.user_id <> a2.user_id
LEFT JOIN message m1
    ON m1.sender_id = a1.user_id
   AND m1.receiver_id = a2.user_id
LEFT JOIN message m2
    ON m2.sender_id = a2.user_id
   AND m2.receiver_id = a1.user_id
WHERE a1.role = 'STUDENT'
  AND a2.role = 'TUTOR'
  AND m1.message_id IS NULL
  AND m2.message_id IS NULL
LIMIT 1;

SELECT
    @test_student_id AS test_student_id,
    @test_session_id AS test_session_id,
    @msg_sender_id AS msg_sender_id,
    @msg_receiver_id AS msg_receiver_id,
    CASE
        WHEN @test_student_id IS NOT NULL
         AND @test_session_id IS NOT NULL
         AND @msg_sender_id IS NOT NULL
         AND @msg_receiver_id IS NOT NULL
        THEN 'SETUP: PASSED'
        ELSE 'SETUP: FAILED'
    END AS setup_result;

-- ================================
-- TEST 1: sp_add_document
-- ================================
SELECT '=== TEST 1: sp_add_document ===' AS test_name;

CALL sp_add_document(
    'Procedure Test Document Add',
    'Codex QA',
    'PDF',
    @doc_url_add
);

SELECT
    COUNT(*) AS inserted_documents,
    CASE
        WHEN COUNT(*) = 1 THEN 'sp_add_document: PASSED'
        ELSE 'sp_add_document: FAILED'
    END AS test_result
FROM resource
WHERE url = @doc_url_add
  AND title = 'Procedure Test Document Add'
  AND author = 'Codex QA'
  AND type = 'PDF';

-- ================================
-- TEST 2: sp_get_all_documents
-- ================================
SELECT '=== TEST 2: sp_get_all_documents ===' AS test_name;

CALL sp_get_all_documents();

SELECT
    COUNT(*) AS total_documents,
    CASE
        WHEN COUNT(*) > 0 THEN 'sp_get_all_documents: PASSED'
        ELSE 'sp_get_all_documents: FAILED'
    END AS test_result
FROM resource;

-- ================================
-- TEST 3: sp_get_documents_by_filter
-- ================================
SELECT '=== TEST 3: sp_get_documents_by_filter ===' AS test_name;

CALL sp_get_documents_by_filter('Procedure Test Document Add', 'PDF');

SELECT
    COUNT(*) AS matched_documents,
    CASE
        WHEN COUNT(*) = 1 THEN 'sp_get_documents_by_filter: PASSED'
        ELSE 'sp_get_documents_by_filter: FAILED'
    END AS test_result
FROM resource
WHERE title LIKE '%Procedure Test Document Add%'
  AND type = 'PDF'
  AND url = @doc_url_add;

-- ================================
-- TEST 4: sp_delete_document
-- ================================
SELECT '=== TEST 4: sp_delete_document ===' AS test_name;

CALL sp_add_document(
    'Procedure Test Document Delete',
    'Codex QA',
    'DOC',
    @doc_url_delete
);

SELECT resource_id
INTO @delete_doc_id
FROM resource
WHERE url = @doc_url_delete
LIMIT 1;

CALL sp_delete_document(@delete_doc_id);

SELECT
    COUNT(*) AS remaining_documents,
    CASE
        WHEN COUNT(*) = 0 THEN 'sp_delete_document: PASSED'
        ELSE 'sp_delete_document: FAILED'
    END AS test_result
FROM resource
WHERE url = @doc_url_delete;

-- ================================
-- TEST 5: sp_send_message
-- ================================
SELECT '=== TEST 5: sp_send_message ===' AS test_name;

CALL sp_send_message(@msg_sender_id, @msg_receiver_id, @msg_text_1);
CALL sp_send_message(@msg_receiver_id, @msg_sender_id, @msg_text_2);

SELECT
    COUNT(*) AS inserted_messages,
    CASE
        WHEN COUNT(*) = 2 THEN 'sp_send_message: PASSED'
        ELSE 'sp_send_message: FAILED'
    END AS test_result
FROM message
WHERE content IN (@msg_text_1, @msg_text_2)
  AND (
        (sender_id = @msg_sender_id AND receiver_id = @msg_receiver_id)
     OR (sender_id = @msg_receiver_id AND receiver_id = @msg_sender_id)
  );

SELECT
    COUNT(*) AS sent_status_messages,
    CASE
        WHEN COUNT(*) = 2 THEN 'sp_send_message status: PASSED'
        ELSE 'sp_send_message status: FAILED'
    END AS test_result
FROM message
WHERE content IN (@msg_text_1, @msg_text_2)
  AND status = 'SENT';

-- ================================
-- TEST 6: sp_get_messages_between
-- ================================
SELECT '=== TEST 6: sp_get_messages_between ===' AS test_name;

CALL sp_get_messages_between(@msg_sender_id, @msg_receiver_id);

SELECT
    COUNT(*) AS matched_messages,
    CASE
        WHEN COUNT(*) = 2 THEN 'sp_get_messages_between: PASSED'
        ELSE 'sp_get_messages_between: FAILED'
    END AS test_result
FROM message
WHERE content IN (@msg_text_1, @msg_text_2)
  AND (
        (sender_id = @msg_sender_id AND receiver_id = @msg_receiver_id)
     OR (sender_id = @msg_receiver_id AND receiver_id = @msg_sender_id)
  );

-- ================================
-- TEST 7: sp_mark_as_read
-- ================================
SELECT '=== TEST 7: sp_mark_as_read ===' AS test_name;

CALL sp_mark_as_read(@msg_sender_id, @msg_receiver_id);

SELECT
    COUNT(*) AS read_messages,
    CASE
        WHEN COUNT(*) = 1 THEN 'sp_mark_as_read: PASSED'
        ELSE 'sp_mark_as_read: FAILED'
    END AS test_result
FROM message
WHERE sender_id = @msg_sender_id
  AND receiver_id = @msg_receiver_id
  AND content = @msg_text_1
  AND status = 'READ';

SELECT
    COUNT(*) AS untouched_reply_messages,
    CASE
        WHEN COUNT(*) = 1 THEN 'sp_mark_as_read selective update: PASSED'
        ELSE 'sp_mark_as_read selective update: FAILED'
    END AS test_result
FROM message
WHERE sender_id = @msg_receiver_id
  AND receiver_id = @msg_sender_id
  AND content = @msg_text_2
  AND status = 'SENT';

-- ================================
-- TEST 8: sp_add_comment
-- ================================
SELECT '=== TEST 8: sp_add_comment ===' AS test_name;

DELETE FROM `comment`
WHERE student_id = @test_student_id
  AND session_id = @test_session_id;

CALL sp_add_comment(@test_student_id, @test_session_id, @comment_text_1, 5);

SELECT
    COUNT(*) AS inserted_comments,
    CASE
        WHEN COUNT(*) = 1 THEN 'sp_add_comment insert: PASSED'
        ELSE 'sp_add_comment insert: FAILED'
    END AS test_result
FROM `comment`
WHERE student_id = @test_student_id
  AND session_id = @test_session_id
  AND `comment` = @comment_text_1
  AND rating = 5;

CALL sp_add_comment(@test_student_id, @test_session_id, @comment_text_2, 4);

SELECT
    COUNT(*) AS updated_comments,
    CASE
        WHEN COUNT(*) = 1 THEN 'sp_add_comment update: PASSED'
        ELSE 'sp_add_comment update: FAILED'
    END AS test_result
FROM `comment`
WHERE student_id = @test_student_id
  AND session_id = @test_session_id
  AND `comment` = @comment_text_2
  AND rating = 4;

-- ================================
-- TEST 9: sp_comment_by_session
-- ================================
SELECT '=== TEST 9: sp_comment_by_session ===' AS test_name;

CALL sp_comment_by_session(@test_session_id);

SELECT
    COUNT(*) AS matched_comments,
    CASE
        WHEN COUNT(*) >= 1 THEN 'sp_comment_by_session: PASSED'
        ELSE 'sp_comment_by_session: FAILED'
    END AS test_result
FROM `comment`
WHERE session_id = @test_session_id
  AND student_id = @test_student_id
  AND `comment` = @comment_text_2
  AND rating = 4;

-- ================================
-- CLEANUP
-- ================================
SELECT '=== CLEANUP ===' AS test_name;

DELETE FROM `comment`
WHERE student_id = @test_student_id
  AND session_id = @test_session_id;

DELETE FROM message
WHERE content IN (@msg_text_1, @msg_text_2);

DELETE FROM resource
WHERE url IN (@doc_url_add, @doc_url_delete);

SELECT
    CASE
        WHEN (SELECT COUNT(*) FROM `comment`
              WHERE student_id = @test_student_id
                AND session_id = @test_session_id) = 0
         AND (SELECT COUNT(*) FROM message
              WHERE content IN (@msg_text_1, @msg_text_2)) = 0
         AND (SELECT COUNT(*) FROM resource
              WHERE url IN (@doc_url_add, @doc_url_delete)) = 0
        THEN 'CLEANUP: PASSED'
        ELSE 'CLEANUP: FAILED'
    END AS cleanup_result;

-- ================================
-- TEST SUMMARY
-- ================================
SELECT '=== TEST COMPLETED ===' AS test_name;
SELECT NOW() AS test_completed_at;
