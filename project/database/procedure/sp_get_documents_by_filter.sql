-- File: sp_get_documents_by_filter.sql
-- Mô tả: Lọc tài liệu theo tiêu đề và loại
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_title VARCHAR(255), p_type VARCHAR(100)
-- Returns: ResultSet tài liệu phù hợp

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_documents_by_filter//

CREATE PROCEDURE sp_get_documents_by_filter(
    IN p_title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_type VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
)
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
    WHERE (p_title IS NULL OR CHAR_LENGTH(TRIM(p_title)) = 0 OR title LIKE CONCAT('%', TRIM(p_title), '%'))
      AND (p_type IS NULL OR CHAR_LENGTH(TRIM(p_type)) = 0 OR `type` = UPPER(TRIM(p_type)))
    ORDER BY created_at DESC, resource_id DESC;
END//

DELIMITER ;

