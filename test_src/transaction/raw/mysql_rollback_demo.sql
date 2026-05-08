-- Demo follows report/figures/Thoi/transaction.tex
-- Test Case 2: MySQL rollback khi ton kho khong du
-- Scenario: product_id = 6, store_id = 1 has stock lower than 5.

USE production;

DROP PROCEDURE IF EXISTS test_tx;

DELIMITER //

CREATE PROCEDURE test_tx()
BEGIN
    DECLARE v_stock INT;

    START TRANSACTION;

    UPDATE production.stocks
    SET quantity = quantity - 5
    WHERE store_id = 1 AND product_id = 6;

    SELECT quantity INTO v_stock
    FROM production.stocks
    WHERE store_id = 1 AND product_id = 6;

    IF v_stock < 0 THEN
        ROLLBACK;
        SELECT 'RUN - rollback executed because stock became negative' AS demo_step;
    ELSE
        COMMIT;
        SELECT 'RUN - commit executed' AS demo_step;
    END IF;
END //

DELIMITER ;

SELECT
    'BEFORE - stock product 6 store 1' AS demo_step,
    store_id,
    product_id,
    quantity
FROM production.stocks
WHERE store_id = 1 AND product_id = 6;

CALL test_tx();

SELECT
    'AFTER - stock product 6 store 1' AS demo_step,
    store_id,
    product_id,
    quantity
FROM production.stocks
WHERE store_id = 1 AND product_id = 6;

