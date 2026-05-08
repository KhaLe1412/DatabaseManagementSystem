-- Demo follows report/figures/Thoi/transaction.tex
-- Test Case 1: MySQL transaction thanh cong
-- Scenario: create order, create order item, reduce stock.

USE sales;

SET @new_order_id := NULL;

SELECT
    'BEFORE - latest orders' AS demo_step,
    order_id,
    customer_id,
    order_status,
    order_date,
    required_date,
    shipped_date,
    store_id,
    staff_id
FROM sales.orders
ORDER BY order_id DESC
LIMIT 3;

SELECT
    'BEFORE - latest order_items' AS demo_step,
    order_id,
    item_id,
    product_id,
    quantity,
    list_price,
    discount
FROM sales.order_items
ORDER BY order_id DESC, item_id
LIMIT 3;

SELECT
    'BEFORE - stock' AS demo_step,
    store_id,
    product_id,
    quantity
FROM production.stocks
WHERE store_id = 1 AND product_id = 1;

START TRANSACTION;

INSERT INTO sales.orders(
    customer_id,
    order_status,
    order_date,
    required_date,
    shipped_date,
    store_id,
    staff_id
)
VALUES(1, 1, '2026-03-02', '2026-03-10', NULL, 1, 1);

SET @new_order_id := LAST_INSERT_ID();

INSERT INTO sales.order_items(
    order_id,
    item_id,
    product_id,
    quantity,
    list_price,
    discount
)
VALUES(@new_order_id, 1, 1, 2, 379.99, 0.10);

UPDATE production.stocks
SET quantity = quantity - 2
WHERE store_id = 1 AND product_id = 1;

COMMIT;

SELECT
    'RUN - transaction committed' AS demo_step,
    @new_order_id AS new_order_id;

SELECT
    'AFTER - new order' AS demo_step,
    order_id,
    customer_id,
    order_status,
    order_date,
    required_date,
    shipped_date,
    store_id,
    staff_id
FROM sales.orders
WHERE order_id = @new_order_id;

SELECT
    'AFTER - new order_item' AS demo_step,
    order_id,
    item_id,
    product_id,
    quantity,
    list_price,
    discount
FROM sales.order_items
WHERE order_id = @new_order_id;

SELECT
    'AFTER - stock' AS demo_step,
    store_id,
    product_id,
    quantity
FROM production.stocks
WHERE store_id = 1 AND product_id = 1;
