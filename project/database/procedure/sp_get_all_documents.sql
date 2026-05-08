-- File: sp_get_all_documents.sql
-- Mô tả: Lấy toàn bộ tài liệu trong thư viện
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Returns: ResultSet tài liệu thư viện

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_all_documents//

CREATE PROCEDURE sp_get_all_documents()
BEGIN
    SELECT
        r.resource_id,
        r.title,
        r.author,
        r.`type`,
        r.url,
        GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS subject,
        r.created_at,
        r.updated_at
    FROM resource r
    LEFT JOIN resource_subject rs
        ON rs.resource_id = r.resource_id
    LEFT JOIN subjects s
        ON s.id = rs.subject_id
    GROUP BY
        r.resource_id,
        r.title,
        r.author,
        r.`type`,
        r.url,
        r.created_at,
        r.updated_at
    ORDER BY r.created_at DESC, r.resource_id DESC;
END//

DELIMITER ;
