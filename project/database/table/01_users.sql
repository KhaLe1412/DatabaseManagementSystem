-- File: project/database/table/01_users.sql
-- Description: Core users / accounts table
-- Author: Nhan
-- Date: 2026-04-10
USE dbms_project;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, 
    role ENUM('student','tutor','academic-affairs','student-affairs','admin') NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_role ON users(role);
