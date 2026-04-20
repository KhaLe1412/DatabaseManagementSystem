-- File: 05_message.sql
-- Mô tả: Seed dữ liệu tin nhắn mẫu
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04

USE dbms_project;
SET NAMES utf8mb4;

INSERT IGNORE INTO message (sender_id, receiver_id, content, status, `timestamp`) VALUES
    ('USER-STUD-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'Em chào thầy, tối nay buổi Hệ quản trị cơ sở dữ liệu vẫn học online đúng không ạ?', 'READ', '2026-04-11 19:00:00'),
    ('USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000001', 'Đúng em. Em xem trước phần SELECT, JOIN và mang theo câu hỏi nếu có.', 'READ', '2026-04-11 19:03:00'),
    ('USER-STUD-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'Dạ, em đang bị rối ở JOIN và GROUP BY. Em sẽ chuẩn bị trước.', 'READ', '2026-04-11 19:06:00'),
    ('USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000001', 'Tốt. Nếu cần thì gửi thẳng bài SQL em đang làm để thầy xem nhanh.', 'SENT', '2026-04-11 19:09:00'),
    ('USER-STUD-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000002', 'Em muốn hỏi buổi học chiều mai có học tại phòng B1-203 không ạ?', 'READ', '2026-04-11 20:10:00'),
    ('USER-TUTO-0000-0000-000000000002', 'USER-STUD-0000-0000-000000000002', 'Có em. Mình học trực tiếp, em đến sớm 10 phút để ôn lại bài cũ.', 'READ', '2026-04-11 20:14:00'),
    ('USER-STUD-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000002', 'Dạ rõ. Em sẽ mang theo notebook và bài tập đang làm dở.', 'READ', '2026-04-11 20:18:00'),
    ('USER-TUTO-0000-0000-000000000002', 'USER-STUD-0000-0000-000000000002', 'Ok em. Nếu cần thì xem thêm tài liệu trong thư viện trước giờ học.', 'SENT', '2026-04-11 20:22:00'),
    ('USER-STUD-0000-0000-000000000001', 'USER-ADMIN-0000-0000-000000000001', 'Em đã đăng ký môn học và cập nhật hồ sơ thành công, nhờ admin kiểm tra giúp.', 'READ', '2026-04-12 08:00:00'),
    ('USER-ADMIN-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000001', 'Hệ thống đã ghi nhận. Nếu không thấy dữ liệu hiển thị, em đăng nhập lại để đồng bộ.', 'READ', '2026-04-12 08:05:00'),
    ('USER-TUTO-0000-0000-000000000001', 'USER-ADMIN-0000-0000-000000000001', 'Tôi đã cập nhật rating và tổng số buổi dạy, nhờ kiểm tra quyền xem báo cáo.', 'READ', '2026-04-12 09:15:00'),
    ('USER-ADMIN-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'Đã kiểm tra. Quyền hiện tại hợp lệ, thầy có thể tiếp tục sử dụng bình thường.', 'SENT', '2026-04-12 09:18:00');

SELECT COUNT(*) AS message_seeded FROM message;
