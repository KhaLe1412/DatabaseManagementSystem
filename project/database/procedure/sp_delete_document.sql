-- File: sp_delete_document.sql
-- Mô tả: Xóa tài liệu khỏi thư viện
-- Tác giả: Nguyễn Hữu Thời
-- Ngày tạo: 2026-04-04
-- Parameters: p_resource_id BIGINT
-- Returns: Trạng thái xóa

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_delete_document//

CREATE PROCEDURE sp_delete_document(
    IN p_resource_id BIGINT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_resource_id IS NULL OR p_resource_id <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid resource_id';
    END IF;

    START TRANSACTION;

    DELETE FROM resource
    WHERE resource_id = p_resource_id;

    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Document not found';
    END IF;

    COMMIT;

    SELECT 'Document deleted successfully' AS status, p_resource_id AS resource_id;
END//

DELIMITER ;
