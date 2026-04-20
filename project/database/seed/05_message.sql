-- File: 05_message.sql
-- Mo ta: Seed du lieu tin nhan mau
-- Tac gia: Nguyen Huu Thoi
-- Ngay tao: 2026-04-04

USE dbms_project;
SET NAMES utf8mb4;

-- Hoi thoai giua gia su Binh (USER-TUTO-...001) va sinh vien Nhat (USER-STUD-...001)
INSERT INTO message (message_id, sender_id, receiver_id, content, status, `timestamp`) VALUES
    ('msg-0001-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000001', 'Em doc truoc tai lieu Lap trinh can ban trong thu vien, neu kip thi lam hai bai dau.', 'READ', '2026-04-05 20:00:00'),
    ('msg-0001-0000-0000-000000000002', 'USER-STUD-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'Da, em co can lam truoc bai lab hay chi doc tai lieu thoi a?', 'READ', '2026-04-05 20:07:00'),
    ('msg-0001-0000-0000-000000000003', 'USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000001', 'Em xem lai phan nen tang va chuan bi mot vi du tu bai tap hien tai la on.', 'READ', '2026-04-05 20:14:00'),
    ('msg-0001-0000-0000-000000000004', 'USER-STUD-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'Em dang hoi vuong o cho polymorphism, em nen on phan nao truoc?', 'READ', '2026-04-05 20:21:00'),
    ('msg-0001-0000-0000-000000000005', 'USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000001', 'Co em, buoi OOP van giu lich. Minh se tap trung vao phan polymorphism.', 'READ', '2026-04-05 20:28:00'),
    ('msg-0001-0000-0000-000000000006', 'USER-STUD-0000-0000-000000000001', 'USER-TUTO-0000-0000-000000000001', 'Da ro roi, em se chuan bi day du va vao dung gio.', 'SENT', '2026-04-05 20:35:00');

-- Hoi thoai giua gia su Binh (USER-TUTO-...001) va sinh vien An (USER-STUD-...002)
INSERT INTO message (message_id, sender_id, receiver_id, content, status, `timestamp`) VALUES
    ('msg-0002-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000001', 'Chao thay Binh, em muon xac nhan buoi Lap trinh can ban luc 9:00 con dien ra khong?', 'READ', '2026-04-05 19:00:00'),
    ('msg-0002-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000002', 'Co em, buoi hoc van dien ra dung lich. Em nho chuan bi bai truoc nhe.', 'READ', '2026-04-05 19:07:00'),
    ('msg-0002-0000-0000-000000000003', 'USER-STUD-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000001', 'Da, em se den som 10 phut de chuan bi a.', 'SENT', '2026-04-05 19:14:00');

-- Hoi thoai giua gia su Cuong (USER-TUTO-...002) va sinh vien Long (USER-STUD-...004)
INSERT INTO message (message_id, sender_id, receiver_id, content, status, `timestamp`) VALUES
    ('msg-0003-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000004', 'USER-TUTO-0000-0000-000000000002', 'Hi thay Cuong, sau buoi Giai tich 1 hom truoc em van con mot cho chua hieu ro.', 'READ', '2026-04-05 18:00:00'),
    ('msg-0003-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000002', 'USER-STUD-0000-0000-000000000004', 'Em cu hoi cu the di, phan nao dang gay kho cho em?', 'READ', '2026-04-05 18:07:00'),
    ('msg-0003-0000-0000-000000000003', 'USER-STUD-0000-0000-000000000004', 'USER-TUTO-0000-0000-000000000002', 'Em chua hieu ro phan gioi han day so, nhat la L Hopital.', 'READ', '2026-04-05 18:14:00'),
    ('msg-0003-0000-0000-000000000004', 'USER-TUTO-0000-0000-000000000002', 'USER-STUD-0000-0000-000000000004', 'Duoc, buoi toi minh se on lai phan do cho em. Hen em luc 9:30 nhe.', 'SENT', '2026-04-05 18:21:00');

-- Hoi thoai giua gia su Binh (USER-TUTO-...001) va sinh vien Hoa (USER-STUD-...003)
INSERT INTO message (message_id, sender_id, receiver_id, content, status, `timestamp`) VALUES
    ('msg-0004-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000003', 'USER-TUTO-0000-0000-000000000001', 'Chao thay Binh, em muon hoi ve buoi Cau truc du lieu sap toi.', 'READ', '2026-04-05 17:00:00'),
    ('msg-0004-0000-0000-000000000002', 'USER-TUTO-0000-0000-000000000001', 'USER-STUD-0000-0000-000000000003', 'Buoi hoc se tap trung vao Linked list va Stack. Em doc truoc bai ghi nhe.', 'READ', '2026-04-05 17:07:00'),
    ('msg-0004-0000-0000-000000000003', 'USER-STUD-0000-0000-000000000003', 'USER-TUTO-0000-0000-000000000001', 'Da, em se chuan bi ky truoc buoi hoc a.', 'SENT', '2026-04-05 17:14:00');
