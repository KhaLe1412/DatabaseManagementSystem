-- File: 06_comment.sql
-- Mo ta: Seed du lieu nhan xet mau
-- Tac gia: Nguyen Huu Thoi
-- Ngay tao: 2026-04-04

USE dbms_project;
SET NAMES utf8mb4;

-- Nhan xet cua sinh vien Nhat (STUD-001) va An (STUD-002) cho buoi OOP (aaaa...)
INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    ('USER-STUD-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Buoi OOP rat hay, em hieu hon ve polymorphism va interface sau buoi nay.', 5),
    ('USER-STUD-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Em hieu hon sau khi duoc di qua tung buoc debug trong bai Java.', 4);

-- Nhan xet cua sinh vien Nhat (STUD-001) cho buoi da hoan thanh (dddd...)
INSERT INTO `comment` (student_id, session_id, `comment`, rating) VALUES
    ('USER-STUD-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Buoi Lap trinh can ban rat huu ich, thay giang rat ro rang va de hieu.', 5);
