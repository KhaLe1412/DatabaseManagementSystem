-- File: 06_comment.sql
-- Mô tả: Seed dữ liệu nhận xét mẫu
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;
SET NAMES utf8mb4;


INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (3, 1, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 5),
    (6, 2, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (9, 3, 'Nội dung API thực tế, nhất là phần request validation và response format.', 4),
    (12, 4, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 5),
    (15, 5, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 5),
    (18, 6, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4),
    (21, 7, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4),
    (24, 8, 'Buổi này gỡ cho em nhiều chỗ chưa chắc về cấu trúc backend.', 5),
    (27, 9, 'Nội dung API thực tế, nhất là phần request validation và response format.', 5),
    (30, 10, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 4);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (33, 11, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 4),
    (36, 12, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 5),
    (39, 13, 'Phần thao tác từng bước giúp em làm lại trên máy cá nhân khá dễ.', 5),
    (42, 14, 'Nội dung ngắn gọn nhưng đủ để em áp dụng cho bài nhóm.', 4),
    (45, 15, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 4),
    (48, 16, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 5),
    (3, 17, 'Buổi học giúp em hiểu rõ hơn cách thiết kế endpoint và xử lý lỗi.', 5),
    (6, 18, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4),
    (9, 19, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 4),
    (12, 20, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 5);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (15, 21, 'Phần phân tích trade-off rất hay, em hiểu vấn đề sâu hơn trước.', 5),
    (18, 22, 'Ví dụ service và controller rất rõ ràng, đúng phần em đang cần.', 4),
    (21, 23, 'Buổi học giúp em hiểu rõ hơn cách thiết kế endpoint và xử lý lỗi.', 4),
    (24, 24, 'Phần phân tích trade-off rất hay, em hiểu vấn đề sâu hơn trước.', 5),
    (27, 25, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 5),
    (30, 26, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (33, 27, 'Nội dung API thực tế, nhất là phần request validation và response format.', 4),
    (36, 28, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 5),
    (39, 29, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 5),
    (42, 30, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (45, 31, 'Em thích cách thầy/cô minh họa luồng API bằng ví dụ gần với dự án.', 4),
    (48, 32, 'Em đánh giá cao cách thầy/cô chia nhỏ bài toán trước khi chọn giải pháp.', 5),
    (3, 33, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 5),
    (6, 34, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4),
    (9, 35, 'Buổi học giúp em hiểu rõ hơn cách thiết kế endpoint và xử lý lỗi.', 4),
    (12, 36, 'Phần phân tích trade-off rất hay, em hiểu vấn đề sâu hơn trước.', 5),
    (15, 37, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 5),
    (18, 38, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (21, 39, 'Nội dung API thực tế, nhất là phần request validation và response format.', 4),
    (24, 40, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 5);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (13, 1, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 4),
    (18, 2, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4),
    (23, 3, 'Em thích cách thầy/cô minh họa luồng API bằng ví dụ gần với dự án.', 4),
    (28, 4, 'Em đánh giá cao cách thầy/cô chia nhỏ bài toán trước khi chọn giải pháp.', 4),
    (33, 5, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 3),
    (38, 6, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4),
    (43, 7, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (48, 8, 'Phần Spring Boot dễ hiểu, em làm lại project demo được ngay sau buổi.', 4),
    (5, 9, 'Em thích cách thầy/cô minh họa luồng API bằng ví dụ gần với dự án.', 4),
    (10, 10, 'Em đánh giá cao cách thầy/cô chia nhỏ bài toán trước khi chọn giải pháp.', 3);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (15, 11, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 4),
    (20, 12, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4),
    (25, 13, 'Nội dung ngắn gọn nhưng đủ để em áp dụng cho bài nhóm.', 4),
    (30, 14, 'Buổi hướng dẫn công cụ rất thực tế và tiết kiệm thời gian tự mò.', 4),
    (35, 15, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 3),
    (40, 16, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (45, 17, 'Nội dung API thực tế, nhất là phần request validation và response format.', 4),
    (2, 18, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4),
    (7, 19, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 4),
    (13, 20, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 3);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (17, 21, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 4),
    (22, 22, 'Buổi này gỡ cho em nhiều chỗ chưa chắc về cấu trúc backend.', 4),
    (27, 23, 'Nội dung API thực tế, nhất là phần request validation và response format.', 4),
    (32, 24, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 4),
    (37, 25, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 3),
    (42, 26, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4),
    (47, 27, 'Em thích cách thầy/cô minh họa luồng API bằng ví dụ gần với dự án.', 4),
    (4, 28, 'Em đánh giá cao cách thầy/cô chia nhỏ bài toán trước khi chọn giải pháp.', 4),
    (9, 29, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 4),
    (14, 30, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 3);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (19, 31, 'Buổi học giúp em hiểu rõ hơn cách thiết kế endpoint và xử lý lỗi.', 4),
    (24, 32, 'Phần phân tích trade-off rất hay, em hiểu vấn đề sâu hơn trước.', 4),
    (29, 33, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 4),
    (34, 34, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (39, 35, 'Nội dung API thực tế, nhất là phần request validation và response format.', 3),
    (44, 36, 'Buổi system design có nhiều ví dụ thực tế nên dễ hình dung hơn.', 4),
    (1, 37, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 4),
    (6, 38, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4),
    (11, 39, 'Em thích cách thầy/cô minh họa luồng API bằng ví dụ gần với dự án.', 4),
    (16, 40, 'Em đánh giá cao cách thầy/cô chia nhỏ bài toán trước khi chọn giải pháp.', 3);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (19, 1, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 5),
    (26, 2, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4),
    (33, 3, 'Buổi học giúp em hiểu rõ hơn cách thiết kế endpoint và xử lý lỗi.', 5),
    (40, 4, 'Phần phân tích trade-off rất hay, em hiểu vấn đề sâu hơn trước.', 4),
    (47, 5, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 5),
    (6, 6, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (13, 7, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 5),
    (20, 8, 'Ví dụ service và controller rất rõ ràng, đúng phần em đang cần.', 4),
    (28, 9, 'Buổi học giúp em hiểu rõ hơn cách thiết kế endpoint và xử lý lỗi.', 5),
    (34, 10, 'Phần phân tích trade-off rất hay, em hiểu vấn đề sâu hơn trước.', 4);

INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    (41, 11, 'Em hiểu hơn sau khi được đi qua từng bước debug trong bài Java.', 5),
    (48, 12, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (7, 13, 'Buổi hướng dẫn công cụ rất thực tế và tiết kiệm thời gian tự mò.', 5),
    (14, 14, 'Phần thao tác từng bước giúp em làm lại trên máy cá nhân khá dễ.', 4),
    (21, 15, 'Phần luyện tập Java vừa sức và giúp em sửa lại tư duy OOP.', 5),
    (28, 16, 'Ví dụ SQL bám sát bài lab nên em áp dụng được ngay sau buổi học.', 4),
    (35, 17, 'Em thích cách thầy/cô minh họa luồng API bằng ví dụ gần với dự án.', 5),
    (42, 18, 'Buổi này giúp em tự tin hơn khi viết truy vấn và kiểm tra kết quả.', 4),
    (1, 19, 'Buổi Java này giải thích rất rõ, đặc biệt là phần ví dụ code thực tế.', 5),
    (8, 20, 'Phần giải thích query từng bước rất dễ theo dõi và hữu ích.', 4);
