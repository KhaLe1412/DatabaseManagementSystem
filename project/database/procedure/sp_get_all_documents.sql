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
        resource_id,
        title,
        author,
        `type`,
        url,
        subject,
        created_at,
        updated_at
    FROM resource
    ORDER BY created_at DESC, resource_id DESC;
END//

DELIMITER ;
