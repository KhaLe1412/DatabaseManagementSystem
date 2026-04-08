-- File: 01_init_database.sql
-- Mô tả: Khởi tạo database và cấu hình cơ bản
-- Tác giả: Huỳnh Hữu Nhật
-- Ngày tạo: 2026-04-09

-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS dbms_project
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE dbms_project;

-- Cấu hình time zone sang giờ Việt Nam
SET time_zone = '+07:00';

-- Log xác nhận
SELECT 'Database initialized successfully' AS status;