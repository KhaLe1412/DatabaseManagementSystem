-- File: sp_add_document.sql
-- Mô tả: Thêm tài liệu mới vào thư viện
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_title VARCHAR(255), p_author VARCHAR(255), p_type VARCHAR(100), p_url TEXT
-- Returns: Tài liệu vừa được tạo

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_add_document//

CREATE PROCEDURE sp_add_document(
    IN p_title VARCHAR(255),
    IN p_author VARCHAR(255),
    IN p_type VARCHAR(100),
    IN p_url TEXT
)
BEGIN
    DECLARE v_resource_id CHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_title IS NULL OR CHAR_LENGTH(TRIM(p_title)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Document title is required';
    END IF;

    IF p_author IS NULL OR CHAR_LENGTH(TRIM(p_author)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Document author is required';
    END IF;

    IF p_type IS NULL OR CHAR_LENGTH(TRIM(p_type)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Document type is required';
    END IF;

    IF p_url IS NULL OR CHAR_LENGTH(TRIM(p_url)) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Document url is required';
    END IF;

    START TRANSACTION;

    SET v_resource_id = UUID();

    INSERT INTO resource (resource_id, title, author, `type`, url)
    VALUES (v_resource_id, TRIM(p_title), TRIM(p_author), UPPER(TRIM(p_type)), TRIM(p_url));

    COMMIT;

    SELECT
        resource_id,
        title,
        author,
        `type`,
        url
    FROM resource
    WHERE resource_id = v_resource_id;
END//

DELIMITER ;
