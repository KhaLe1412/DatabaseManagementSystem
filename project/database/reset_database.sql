-- File: reset_database.sql
-- Mô tả: Reset toàn bộ cấu trúc bảng thuộc Nhiệm vụ 2 về trạng thái ban đầu
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tất cả các bảng (Theo thứ tự từ bảng con đến bảng cha)
DROP TABLE IF EXISTS user_subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS tutors;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;

-- Lưu ý: Nếu các thành viên khác đã thêm các bảng Session, Message...
-- thì thêm DROP TABLE tương ứng vào đây luôn.

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database reset completed. All specified tables dropped.' AS status;