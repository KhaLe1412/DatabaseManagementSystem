-- File: 05_message.sql
-- Mô tả: Seed dữ liệu tin nhắn mẫu
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;
SET NAMES utf8mb4;


INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (49, 1, 'Ok em, gặp em lúc 19:00 tối mai nhé.', 'SENT', '2026-04-05 21:30:00'),
    (1, 49, 'Dạ rõ rồi, em sẽ chuẩn bị đầy đủ và vào đúng giờ.', 'SENT', '2026-04-05 21:23:00'),
    (49, 1, 'Tốt, vậy lên buổi học mình dành thời gian cho câu hỏi thực tế hơn.', 'READ', '2026-04-05 21:16:00'),
    (1, 49, 'Em đã thấy Java OOP Handbook rồi. Tài liệu khá rõ ràng.', 'READ', '2026-04-05 21:09:00'),
    (49, 1, 'Em đọc trước tài liệu Java OOP Handbook trong thư viện, nếu kịp thì làm hai bài đầu.', 'READ', '2026-04-05 21:02:00'),
    (1, 49, 'Dạ, em có cần làm trước bài lab hay chỉ đọc tài liệu thôi ạ?', 'READ', '2026-04-05 20:55:00'),
    (49, 1, 'Em xem lại phần nền tảng và chuẩn bị một ví dụ từ bài tập hiện tại là ổn.', 'READ', '2026-04-05 20:48:00'),
    (1, 49, 'Em đang hơi vướng ở chỗ polymorphism, em nên ôn phần nào trước?', 'READ', '2026-04-05 20:41:00'),
    (49, 1, 'Có em, buổi Java OOP vẫn giữ lịch. Mình sẽ tập trung vào phần polymorphism.', 'READ', '2026-04-05 20:34:00'),
    (1, 49, 'Hi thầy Hải Đăng, em muốn xác nhận buổi Java OOP lúc 19:00 tối mai còn diễn ra như kế hoạch không?', 'READ', '2026-04-05 20:27:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (50, 2, 'Không có gì, hẹn em ở buổi SQL joins lúc 19:30 thứ Hai.', 'READ', '2026-04-05 20:20:00'),
    (2, 50, 'Dạ, vậy em yên tâm rồi. Cảm ơn thầy/cô.', 'READ', '2026-04-05 20:13:00'),
    (50, 2, 'Không cần in, em chỉ cần mở bản mềm SQL Joins Practice Pack là đủ.', 'READ', '2026-04-05 20:06:00'),
    (2, 50, 'Em có cần in tài liệu SQL Joins Practice Pack ra không ạ?', 'READ', '2026-04-05 19:59:00'),
    (50, 2, 'Được, em vào sớm và chuẩn bị sẵn notebook hoặc query em đang làm.', 'READ', '2026-04-05 19:52:00'),
    (2, 50, 'Nếu em đến sớm 10 phút thì mình review nhanh requirement được không ạ?', 'READ', '2026-04-05 19:45:00'),
    (50, 2, 'Không sao, thầy/cô sẽ dành khoảng 20 phút đầu để nhắc lại phần GROUP BY sau JOIN.', 'READ', '2026-04-05 19:38:00'),
    (2, 50, 'Phần em yếu nhất vẫn là GROUP BY sau JOIN, em sợ theo không kịp.', 'READ', '2026-04-05 19:31:00'),
    (50, 2, 'Mình dùng một case study nội bộ khá gần với bài tập trên lớp để dễ theo dõi.', 'READ', '2026-04-05 19:24:00'),
    (2, 50, 'Chào cô Thu Phương, em vừa xem lại buổi SQL joins và muốn hỏi lớp sẽ học theo case study nào ạ?', 'READ', '2026-04-05 19:17:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (51, 3, 'Ổn, nếu vẫn vướng thì mình xử lý tiếp trong 15 phút đầu buổi sau.', 'READ', '2026-04-05 19:10:00'),
    (3, 51, 'Em sẽ thử lại tối nay rồi cập nhật kết quả.', 'READ', '2026-04-05 19:03:00'),
    (51, 3, 'Đúng rồi, tài liệu System Design Primer for Students có ví dụ khá sát với tình huống của em.', 'READ', '2026-04-05 18:56:00'),
    (3, 51, 'Dạ. Nếu cần em sẽ đối chiếu thêm với tài liệu System Design Primer for Students.', 'READ', '2026-04-05 18:49:00'),
    (51, 3, 'Gửi được, nhưng nhớ kèm dữ liệu đầu vào hoặc đoạn code tối thiểu để dễ xem.', 'READ', '2026-04-05 18:42:00'),
    (3, 51, 'Em có thể gửi screenshot trước buổi tới không ạ?', 'READ', '2026-04-05 18:35:00'),
    (51, 3, 'Khả năng cao là em thiếu một bước kiểm tra input hoặc điều kiện biên.', 'READ', '2026-04-05 18:28:00'),
    (3, 51, 'Khi em tự làm lại thì phần cache và load balancer cho ra kết quả khác ví dụ trên lớp.', 'READ', '2026-04-05 18:21:00'),
    (51, 3, 'Em cứ hỏi cụ thể đi, phần nào trong cache và load balancer đang gây khó cho em?', 'READ', '2026-04-05 18:14:00'),
    (3, 51, 'Hi thầy Quốc Hưng, sau buổi System Design cơ bản hôm trước em vẫn còn một chỗ chưa hiểu rõ.', 'READ', '2026-04-05 18:07:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (52, 4, 'Ok em, gặp em lúc 18:00 thứ Tư nhé.', 'SENT', '2026-04-05 18:00:00'),
    (4, 52, 'Dạ rõ rồi, em sẽ chuẩn bị đầy đủ và vào đúng giờ.', 'SENT', '2026-04-05 17:53:00'),
    (52, 4, 'Tốt, vậy lên buổi học mình dành thời gian cho câu hỏi thực tế hơn.', 'READ', '2026-04-05 17:46:00'),
    (4, 52, 'Em đã thấy REST API Design Checklist rồi. Tài liệu khá rõ ràng.', 'READ', '2026-04-05 17:39:00'),
    (52, 4, 'Em đọc trước tài liệu REST API Design Checklist trong thư viện, nếu kịp thì làm hai bài đầu.', 'READ', '2026-04-05 17:32:00'),
    (4, 52, 'Dạ, em có cần làm trước bài lab hay chỉ đọc tài liệu thôi ạ?', 'READ', '2026-04-05 17:25:00'),
    (52, 4, 'Em xem lại phần nền tảng và chuẩn bị một ví dụ từ bài tập hiện tại là ổn.', 'READ', '2026-04-05 17:18:00'),
    (4, 52, 'Em đang hơi vướng ở chỗ idempotency, em nên ôn phần nào trước?', 'READ', '2026-04-05 17:11:00'),
    (52, 4, 'Có em, buổi REST API design vẫn giữ lịch. Mình sẽ tập trung vào phần idempotency.', 'READ', '2026-04-05 17:04:00'),
    (4, 52, 'Hi cô Thanh Mai, em muốn xác nhận buổi REST API design lúc 18:00 thứ Tư còn diễn ra như kế hoạch không?', 'READ', '2026-04-05 16:57:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (53, 5, 'Không có gì, hẹn em ở buổi Spring Boot fundamentals lúc 19:00 thứ Tư.', 'READ', '2026-04-05 16:50:00'),
    (5, 53, 'Dạ, vậy em yên tâm rồi. Cảm ơn thầy/cô.', 'READ', '2026-04-05 16:43:00'),
    (53, 5, 'Không cần in, em chỉ cần mở bản mềm Spring Boot Configuration Guide là đủ.', 'READ', '2026-04-05 16:36:00'),
    (5, 53, 'Em có cần in tài liệu Spring Boot Configuration Guide ra không ạ?', 'READ', '2026-04-05 16:29:00'),
    (53, 5, 'Được, em vào sớm và chuẩn bị sẵn notebook hoặc query em đang làm.', 'READ', '2026-04-05 16:22:00'),
    (5, 53, 'Nếu em đến sớm 10 phút thì mình review nhanh requirement được không ạ?', 'READ', '2026-04-05 16:15:00'),
    (53, 5, 'Không sao, thầy/cô sẽ dành khoảng 20 phút đầu để nhắc lại phần dependency injection.', 'READ', '2026-04-05 16:08:00'),
    (5, 53, 'Phần em yếu nhất vẫn là dependency injection, em sợ theo không kịp.', 'READ', '2026-04-05 16:01:00'),
    (53, 5, 'Mình dùng một case study nội bộ khá gần với bài tập trên lớp để dễ theo dõi.', 'READ', '2026-04-05 15:54:00'),
    (5, 53, 'Chào Jennifer, em vừa xem lại buổi Spring Boot fundamentals và muốn hỏi lớp sẽ học theo case study nào ạ?', 'READ', '2026-04-05 15:47:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (54, 6, 'Ổn, nếu vẫn vướng thì mình xử lý tiếp trong 15 phút đầu buổi sau.', 'READ', '2026-04-05 15:40:00'),
    (6, 54, 'Em sẽ thử lại tối nay rồi cập nhật kết quả.', 'READ', '2026-04-05 15:33:00'),
    (54, 6, 'Đúng rồi, tài liệu Docker Basics for Backend Developers có ví dụ khá sát với tình huống của em.', 'READ', '2026-04-05 15:26:00'),
    (6, 54, 'Dạ. Nếu cần em sẽ đối chiếu thêm với tài liệu Docker Basics for Backend Developers.', 'READ', '2026-04-05 15:19:00'),
    (54, 6, 'Gửi được, nhưng nhớ kèm dữ liệu đầu vào hoặc đoạn code tối thiểu để dễ xem.', 'READ', '2026-04-05 15:12:00'),
    (6, 54, 'Em có thể gửi screenshot trước buổi tới không ạ?', 'READ', '2026-04-05 15:05:00'),
    (54, 6, 'Khả năng cao là em thiếu một bước kiểm tra input hoặc điều kiện biên.', 'READ', '2026-04-05 14:58:00'),
    (6, 54, 'Khi em tự làm lại thì phần volume mapping cho ra kết quả khác ví dụ trên lớp.', 'READ', '2026-04-05 14:51:00'),
    (54, 6, 'Em cứ hỏi cụ thể đi, phần nào trong volume mapping đang gây khó cho em?', 'READ', '2026-04-05 14:44:00'),
    (6, 54, 'Hi Michael, sau buổi Docker for backend hôm trước em vẫn còn một chỗ chưa hiểu rõ.', 'READ', '2026-04-05 14:37:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (55, 7, 'Ok em, gặp em lúc 18:30 thứ Sáu nhé.', 'SENT', '2026-04-05 14:30:00'),
    (7, 55, 'Dạ rõ rồi, em sẽ chuẩn bị đầy đủ và vào đúng giờ.', 'SENT', '2026-04-05 14:23:00'),
    (55, 7, 'Tốt, vậy lên buổi học mình dành thời gian cho câu hỏi thực tế hơn.', 'READ', '2026-04-05 14:16:00'),
    (7, 55, 'Em đã thấy Java Collections Quick Reference rồi. Tài liệu khá rõ ràng.', 'READ', '2026-04-05 14:09:00'),
    (55, 7, 'Em đọc trước tài liệu Java Collections Quick Reference trong thư viện, nếu kịp thì làm hai bài đầu.', 'READ', '2026-04-05 14:02:00'),
    (7, 55, 'Dạ, em có cần làm trước bài lab hay chỉ đọc tài liệu thôi ạ?', 'READ', '2026-04-05 13:55:00'),
    (55, 7, 'Em xem lại phần nền tảng và chuẩn bị một ví dụ từ bài tập hiện tại là ổn.', 'READ', '2026-04-05 13:48:00'),
    (7, 55, 'Em đang hơi vướng ở chỗ HashMap và Set, em nên ôn phần nào trước?', 'READ', '2026-04-05 13:41:00'),
    (55, 7, 'Có em, buổi Java collections vẫn giữ lịch. Mình sẽ tập trung vào phần HashMap và Set.', 'READ', '2026-04-05 13:34:00'),
    (7, 55, 'Hi thầy Đức Long, em muốn xác nhận buổi Java collections lúc 18:30 thứ Sáu còn diễn ra như kế hoạch không?', 'READ', '2026-04-05 13:27:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (56, 8, 'Không có gì, hẹn em ở buổi SQL indexing lúc 19:00 thứ Sáu.', 'READ', '2026-04-05 13:20:00'),
    (8, 56, 'Dạ, vậy em yên tâm rồi. Cảm ơn thầy/cô.', 'READ', '2026-04-05 13:13:00'),
    (56, 8, 'Không cần in, em chỉ cần mở bản mềm SQL Indexing Fundamentals là đủ.', 'READ', '2026-04-05 13:06:00'),
    (8, 56, 'Em có cần in tài liệu SQL Indexing Fundamentals ra không ạ?', 'READ', '2026-04-05 12:59:00'),
    (56, 8, 'Được, em vào sớm và chuẩn bị sẵn notebook hoặc query em đang làm.', 'READ', '2026-04-05 12:52:00'),
    (8, 56, 'Nếu em đến sớm 10 phút thì mình review nhanh requirement được không ạ?', 'READ', '2026-04-05 12:45:00'),
    (56, 8, 'Không sao, thầy/cô sẽ dành khoảng 20 phút đầu để nhắc lại phần composite index.', 'READ', '2026-04-05 12:38:00'),
    (8, 56, 'Phần em yếu nhất vẫn là composite index, em sợ theo không kịp.', 'READ', '2026-04-05 12:31:00'),
    (56, 8, 'Mình dùng một case study nội bộ khá gần với bài tập trên lớp để dễ theo dõi.', 'READ', '2026-04-05 12:24:00'),
    (8, 56, 'Chào thầy Minh Quân, em vừa xem lại buổi SQL indexing và muốn hỏi lớp sẽ học theo case study nào ạ?', 'READ', '2026-04-05 12:17:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (57, 9, 'Ổn, nếu vẫn vướng thì mình xử lý tiếp trong 15 phút đầu buổi sau.', 'READ', '2026-04-05 12:10:00'),
    (9, 57, 'Em sẽ thử lại tối nay rồi cập nhật kết quả.', 'READ', '2026-04-05 12:03:00'),
    (57, 9, 'Đúng rồi, tài liệu JWT Authentication Notes có ví dụ khá sát với tình huống của em.', 'READ', '2026-04-05 11:56:00'),
    (9, 57, 'Dạ. Nếu cần em sẽ đối chiếu thêm với tài liệu JWT Authentication Notes.', 'READ', '2026-04-05 11:49:00'),
    (57, 9, 'Gửi được, nhưng nhớ kèm dữ liệu đầu vào hoặc đoạn code tối thiểu để dễ xem.', 'READ', '2026-04-05 11:42:00'),
    (9, 57, 'Em có thể gửi screenshot trước buổi tới không ạ?', 'READ', '2026-04-05 11:35:00'),
    (57, 9, 'Khả năng cao là em thiếu một bước kiểm tra input hoặc điều kiện biên.', 'READ', '2026-04-05 11:28:00'),
    (9, 57, 'Khi em tự làm lại thì phần refresh token flow cho ra kết quả khác ví dụ trên lớp.', 'READ', '2026-04-05 11:21:00'),
    (57, 9, 'Em cứ hỏi cụ thể đi, phần nào trong refresh token flow đang gây khó cho em?', 'READ', '2026-04-05 11:14:00'),
    (9, 57, 'Hi Sarah, sau buổi JWT authentication hôm trước em vẫn còn một chỗ chưa hiểu rõ.', 'READ', '2026-04-05 11:07:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (58, 10, 'Ok em, gặp em lúc 10:00 sáng thứ Bảy nhé.', 'SENT', '2026-04-05 11:00:00'),
    (10, 58, 'Dạ rõ rồi, em sẽ chuẩn bị đầy đủ và vào đúng giờ.', 'SENT', '2026-04-05 10:53:00'),
    (58, 10, 'Tốt, vậy lên buổi học mình dành thời gian cho câu hỏi thực tế hơn.', 'READ', '2026-04-05 10:46:00'),
    (10, 58, 'Em đã thấy Chat System Architecture Overview rồi. Tài liệu khá rõ ràng.', 'READ', '2026-04-05 10:39:00'),
    (58, 10, 'Em đọc trước tài liệu Chat System Architecture Overview trong thư viện, nếu kịp thì làm hai bài đầu.', 'READ', '2026-04-05 10:32:00'),
    (10, 58, 'Dạ, em có cần làm trước bài lab hay chỉ đọc tài liệu thôi ạ?', 'READ', '2026-04-05 10:25:00'),
    (58, 10, 'Em xem lại phần nền tảng và chuẩn bị một ví dụ từ bài tập hiện tại là ổn.', 'READ', '2026-04-05 10:18:00'),
    (10, 58, 'Em đang hơi vướng ở chỗ message ordering, em nên ôn phần nào trước?', 'READ', '2026-04-05 10:11:00'),
    (58, 10, 'Có em, buổi System Design chat service vẫn giữ lịch. Mình sẽ tập trung vào phần message ordering.', 'READ', '2026-04-05 10:04:00'),
    (10, 58, 'Hi David, em muốn xác nhận buổi System Design chat service lúc 10:00 sáng thứ Bảy còn diễn ra như kế hoạch không?', 'READ', '2026-04-05 09:57:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (59, 11, 'Không có gì, hẹn em ở buổi Java unit testing lúc 18:00 Chủ nhật.', 'READ', '2026-04-05 09:50:00'),
    (11, 59, 'Dạ, vậy em yên tâm rồi. Cảm ơn thầy/cô.', 'READ', '2026-04-05 09:43:00'),
    (59, 11, 'Không cần in, em chỉ cần mở bản mềm Java Unit Testing with JUnit là đủ.', 'READ', '2026-04-05 09:36:00'),
    (11, 59, 'Em có cần in tài liệu Java Unit Testing with JUnit ra không ạ?', 'READ', '2026-04-05 09:29:00'),
    (59, 11, 'Được, em vào sớm và chuẩn bị sẵn notebook hoặc query em đang làm.', 'READ', '2026-04-05 09:22:00'),
    (11, 59, 'Nếu em đến sớm 10 phút thì mình review nhanh requirement được không ạ?', 'READ', '2026-04-05 09:15:00'),
    (59, 11, 'Không sao, thầy/cô sẽ dành khoảng 20 phút đầu để nhắc lại phần mock service dependency.', 'READ', '2026-04-05 09:08:00'),
    (11, 59, 'Phần em yếu nhất vẫn là mock service dependency, em sợ theo không kịp.', 'READ', '2026-04-05 09:01:00'),
    (59, 11, 'Mình dùng một case study nội bộ khá gần với bài tập trên lớp để dễ theo dõi.', 'READ', '2026-04-05 08:54:00'),
    (11, 59, 'Chào thầy Nhật Quang, em vừa xem lại buổi Java unit testing và muốn hỏi lớp sẽ học theo case study nào ạ?', 'READ', '2026-04-05 08:47:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (60, 12, 'Ổn, nếu vẫn vướng thì mình xử lý tiếp trong 15 phút đầu buổi sau.', 'READ', '2026-04-05 08:40:00'),
    (12, 60, 'Em sẽ thử lại tối nay rồi cập nhật kết quả.', 'READ', '2026-04-05 08:33:00'),
    (60, 12, 'Đúng rồi, tài liệu OpenAPI Documentation Template có ví dụ khá sát với tình huống của em.', 'READ', '2026-04-05 08:26:00'),
    (12, 60, 'Dạ. Nếu cần em sẽ đối chiếu thêm với tài liệu OpenAPI Documentation Template.', 'READ', '2026-04-05 08:19:00'),
    (60, 12, 'Gửi được, nhưng nhớ kèm dữ liệu đầu vào hoặc đoạn code tối thiểu để dễ xem.', 'READ', '2026-04-05 08:12:00'),
    (12, 60, 'Em có thể gửi screenshot trước buổi tới không ạ?', 'READ', '2026-04-05 08:05:00'),
    (60, 12, 'Khả năng cao là em thiếu một bước kiểm tra input hoặc điều kiện biên.', 'READ', '2026-04-05 07:58:00'),
    (12, 60, 'Khi em tự làm lại thì phần OpenAPI examples cho ra kết quả khác ví dụ trên lớp.', 'READ', '2026-04-05 07:51:00'),
    (60, 12, 'Em cứ hỏi cụ thể đi, phần nào trong OpenAPI examples đang gây khó cho em?', 'READ', '2026-04-05 07:44:00'),
    (12, 60, 'Hi Emma, sau buổi API documentation hôm trước em vẫn còn một chỗ chưa hiểu rõ.', 'READ', '2026-04-05 07:37:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (49, 13, 'Ok em, gặp em lúc 18:30 tối thứ Hai nhé.', 'SENT', '2026-04-05 07:30:00'),
    (13, 49, 'Dạ rõ rồi, em sẽ chuẩn bị đầy đủ và vào đúng giờ.', 'SENT', '2026-04-05 07:23:00'),
    (49, 13, 'Tốt, vậy lên buổi học mình dành thời gian cho câu hỏi thực tế hơn.', 'READ', '2026-04-05 07:16:00'),
    (13, 49, 'Em đã thấy Java Multithreading Basics rồi. Tài liệu khá rõ ràng.', 'READ', '2026-04-05 07:09:00'),
    (49, 13, 'Em đọc trước tài liệu Java Multithreading Basics trong thư viện, nếu kịp thì làm hai bài đầu.', 'READ', '2026-04-05 07:02:00'),
    (13, 49, 'Dạ, em có cần làm trước bài lab hay chỉ đọc tài liệu thôi ạ?', 'READ', '2026-04-05 06:55:00'),
    (49, 13, 'Em xem lại phần nền tảng và chuẩn bị một ví dụ từ bài tập hiện tại là ổn.', 'READ', '2026-04-05 06:48:00'),
    (13, 49, 'Em đang hơi vướng ở chỗ thread pool sizing, em nên ôn phần nào trước?', 'READ', '2026-04-05 06:41:00'),
    (49, 13, 'Có em, buổi Java concurrency vẫn giữ lịch. Mình sẽ tập trung vào phần thread pool sizing.', 'READ', '2026-04-05 06:34:00'),
    (13, 49, 'Hi thầy Hải Đăng, em muốn xác nhận buổi Java concurrency lúc 18:30 tối thứ Hai còn diễn ra như kế hoạch không?', 'READ', '2026-04-05 06:27:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (50, 14, 'Không có gì, hẹn em ở buổi SQL window functions lúc 19:30 tối thứ Hai.', 'READ', '2026-04-05 06:20:00'),
    (14, 50, 'Dạ, vậy em yên tâm rồi. Cảm ơn thầy/cô.', 'READ', '2026-04-05 06:13:00'),
    (50, 14, 'Không cần in, em chỉ cần mở bản mềm SQL Window Functions Workbook là đủ.', 'READ', '2026-04-05 06:06:00'),
    (14, 50, 'Em có cần in tài liệu SQL Window Functions Workbook ra không ạ?', 'READ', '2026-04-05 05:59:00'),
    (50, 14, 'Được, em vào sớm và chuẩn bị sẵn notebook hoặc query em đang làm.', 'READ', '2026-04-05 05:52:00'),
    (14, 50, 'Nếu em đến sớm 10 phút thì mình review nhanh requirement được không ạ?', 'READ', '2026-04-05 05:45:00'),
    (50, 14, 'Không sao, thầy/cô sẽ dành khoảng 20 phút đầu để nhắc lại phần ROW_NUMBER và RANK.', 'READ', '2026-04-05 05:38:00'),
    (14, 50, 'Phần em yếu nhất vẫn là ROW_NUMBER và RANK, em sợ theo không kịp.', 'READ', '2026-04-05 05:31:00'),
    (50, 14, 'Mình dùng một case study nội bộ khá gần với bài tập trên lớp để dễ theo dõi.', 'READ', '2026-04-05 05:24:00'),
    (14, 50, 'Chào cô Thu Phương, em vừa xem lại buổi SQL window functions và muốn hỏi lớp sẽ học theo case study nào ạ?', 'READ', '2026-04-05 05:17:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (51, 15, 'Ổn, nếu vẫn vướng thì mình xử lý tiếp trong 15 phút đầu buổi sau.', 'READ', '2026-04-05 05:10:00'),
    (15, 51, 'Em sẽ thử lại tối nay rồi cập nhật kết quả.', 'READ', '2026-04-05 05:03:00'),
    (51, 15, 'Đúng rồi, tài liệu Notification Service Design Review có ví dụ khá sát với tình huống của em.', 'READ', '2026-04-05 04:56:00'),
    (15, 51, 'Dạ. Nếu cần em sẽ đối chiếu thêm với tài liệu Notification Service Design Review.', 'READ', '2026-04-05 04:49:00'),
    (51, 15, 'Gửi được, nhưng nhớ kèm dữ liệu đầu vào hoặc đoạn code tối thiểu để dễ xem.', 'READ', '2026-04-05 04:42:00'),
    (15, 51, 'Em có thể gửi screenshot trước buổi tới không ạ?', 'READ', '2026-04-05 04:35:00'),
    (51, 15, 'Khả năng cao là em thiếu một bước kiểm tra input hoặc điều kiện biên.', 'READ', '2026-04-05 04:28:00'),
    (15, 51, 'Khi em tự làm lại thì phần retry strategy cho ra kết quả khác ví dụ trên lớp.', 'READ', '2026-04-05 04:21:00'),
    (51, 15, 'Em cứ hỏi cụ thể đi, phần nào trong retry strategy đang gây khó cho em?', 'READ', '2026-04-05 04:14:00'),
    (15, 51, 'Hi thầy Quốc Hưng, sau buổi Notification system design hôm trước em vẫn còn một chỗ chưa hiểu rõ.', 'READ', '2026-04-05 04:07:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (52, 16, 'Ok em, gặp em lúc 18:00 tối thứ Tư nhé.', 'SENT', '2026-04-05 04:00:00'),
    (16, 52, 'Dạ rõ rồi, em sẽ chuẩn bị đầy đủ và vào đúng giờ.', 'SENT', '2026-04-05 03:53:00'),
    (52, 16, 'Tốt, vậy lên buổi học mình dành thời gian cho câu hỏi thực tế hơn.', 'READ', '2026-04-05 03:46:00'),
    (16, 52, 'Em đã thấy API Logging Checklist rồi. Tài liệu khá rõ ràng.', 'READ', '2026-04-05 03:39:00'),
    (52, 16, 'Em đọc trước tài liệu API Logging Checklist trong thư viện, nếu kịp thì làm hai bài đầu.', 'READ', '2026-04-05 03:32:00'),
    (16, 52, 'Dạ, em có cần làm trước bài lab hay chỉ đọc tài liệu thôi ạ?', 'READ', '2026-04-05 03:25:00'),
    (52, 16, 'Em xem lại phần nền tảng và chuẩn bị một ví dụ từ bài tập hiện tại là ổn.', 'READ', '2026-04-05 03:18:00'),
    (16, 52, 'Em đang hơi vướng ở chỗ structured logs, em nên ôn phần nào trước?', 'READ', '2026-04-05 03:11:00'),
    (52, 16, 'Có em, buổi REST API logging vẫn giữ lịch. Mình sẽ tập trung vào phần structured logs.', 'READ', '2026-04-05 03:04:00'),
    (16, 52, 'Hi cô Thanh Mai, em muốn xác nhận buổi REST API logging lúc 18:00 tối thứ Tư còn diễn ra như kế hoạch không?', 'READ', '2026-04-05 02:57:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (53, 17, 'Không có gì, hẹn em ở buổi Spring Boot REST service lúc 19:00 tối thứ Tư.', 'READ', '2026-04-05 02:50:00'),
    (17, 53, 'Dạ, vậy em yên tâm rồi. Cảm ơn thầy/cô.', 'READ', '2026-04-05 02:43:00'),
    (53, 17, 'Không cần in, em chỉ cần mở bản mềm Spring Boot REST API Build Along là đủ.', 'READ', '2026-04-05 02:36:00'),
    (17, 53, 'Em có cần in tài liệu Spring Boot REST API Build Along ra không ạ?', 'READ', '2026-04-05 02:29:00'),
    (53, 17, 'Được, em vào sớm và chuẩn bị sẵn notebook hoặc query em đang làm.', 'READ', '2026-04-05 02:22:00'),
    (17, 53, 'Nếu em đến sớm 10 phút thì mình review nhanh requirement được không ạ?', 'READ', '2026-04-05 02:15:00'),
    (53, 17, 'Không sao, thầy/cô sẽ dành khoảng 20 phút đầu để nhắc lại phần validation annotations.', 'READ', '2026-04-05 02:08:00'),
    (17, 53, 'Phần em yếu nhất vẫn là validation annotations, em sợ theo không kịp.', 'READ', '2026-04-05 02:01:00'),
    (53, 17, 'Mình dùng một case study nội bộ khá gần với bài tập trên lớp để dễ theo dõi.', 'READ', '2026-04-05 01:54:00'),
    (17, 53, 'Chào Jennifer, em vừa xem lại buổi Spring Boot REST service và muốn hỏi lớp sẽ học theo case study nào ạ?', 'READ', '2026-04-05 01:47:00');

INSERT INTO message (sender_id, receiver_id, content, status, timestamp) VALUES
    (54, 18, 'Ổn, nếu vẫn vướng thì mình xử lý tiếp trong 15 phút đầu buổi sau.', 'READ', '2026-04-05 01:40:00'),
    (18, 54, 'Em sẽ thử lại tối nay rồi cập nhật kết quả.', 'READ', '2026-04-05 01:33:00'),
    (54, 18, 'Đúng rồi, tài liệu Git Workflow for Feature Branches có ví dụ khá sát với tình huống của em.', 'READ', '2026-04-05 01:26:00'),
    (18, 54, 'Dạ. Nếu cần em sẽ đối chiếu thêm với tài liệu Git Workflow for Feature Branches.', 'READ', '2026-04-05 01:19:00'),
    (54, 18, 'Gửi được, nhưng nhớ kèm dữ liệu đầu vào hoặc đoạn code tối thiểu để dễ xem.', 'READ', '2026-04-05 01:12:00'),
    (18, 54, 'Em có thể gửi screenshot trước buổi tới không ạ?', 'READ', '2026-04-05 01:05:00'),
    (54, 18, 'Khả năng cao là em thiếu một bước kiểm tra input hoặc điều kiện biên.', 'READ', '2026-04-05 00:58:00'),
    (18, 54, 'Khi em tự làm lại thì phần rebase conflict cho ra kết quả khác ví dụ trên lớp.', 'READ', '2026-04-05 00:51:00'),
    (54, 18, 'Em cứ hỏi cụ thể đi, phần nào trong rebase conflict đang gây khó cho em?', 'READ', '2026-04-05 00:44:00'),
    (18, 54, 'Hi Michael, sau buổi Git workflow hôm trước em vẫn còn một chỗ chưa hiểu rõ.', 'READ', '2026-04-05 00:37:00');
