-- File: 01_init_database.sql
-- Mô tả: Khởi tạo database và cấu hình cơ bản
-- Tác giả: Nhan
-- Ngày tạo: 2026-04-10

-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS dbms_project
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE dbms_project;

-- Cấu hình time zone
SET time_zone = '+07:00';

-- Disable foreign key checks while running seeds (individual seed files may re-enable as needed)
SET FOREIGN_KEY_CHECKS = 0;

SELECT 'Database initialized successfully' AS status;