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
    IN p_title VARCHAR(255),
    IN p_type VARCHAR(100)
)
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
    WHERE (p_title IS NULL OR CHAR_LENGTH(TRIM(p_title)) = 0 OR r.title LIKE CONCAT('%', TRIM(p_title), '%'))
      AND (p_type IS NULL OR CHAR_LENGTH(TRIM(p_type)) = 0 OR r.`type` = UPPER(TRIM(p_type)))
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
