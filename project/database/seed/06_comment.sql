-- File: 06_comment.sql
-- Mô tả: Seed dữ liệu nhận xét mẫu
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;
SET NAMES utf8mb4;

INSERT IGNORE INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    ('USER-STUD-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Buổi học ôn lại kiến thức nên em theo kịp và hiểu rõ hơn phần cơ bản.', 5),
    ('USER-STUD-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Giảng viên giải thích rõ, ví dụ dễ theo dõi và em có thể làm lại sau buổi học.', 4),
    ('USER-STUD-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nội dung phần data structures rất sát bài tập, em áp dụng được ngay.', 5),
    ('USER-STUD-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Buổi học hữu ích, nhưng em cần thêm bài tập mẫu để tự luyện.', 4),
    ('USER-STUD-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Phần tóm tắt cuối buổi giúp em nhìn lại các ý chính rất nhanh.', 4),
    ('USER-STUD-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Buổi học hoàn thành tốt, em đánh giá cao phần hướng dẫn từng bước.', 5);

SELECT COUNT(*) AS comment_seeded FROM `comment`;
