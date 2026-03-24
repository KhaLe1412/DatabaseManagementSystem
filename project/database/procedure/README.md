# Database Stored Procedures

📂 **Folder này chứa các stored procedures và functions**

## 📋 Quy tắc đặt tên:

```
[sp|fn]_[chức_năng]_[đối_tượng].sql
```

**Ví dụ:**

- `sp_get_user_orders.sql` - Stored procedure lấy đơn hàng của user
- `fn_calculate_total_price.sql` - Function tính tổng giá
- `sp_update_product_stock.sql` - Procedure cập nhật stock

## ✍️ Template cho Stored Procedure:

```sql
-- File: sp_get_user_orders.sql
-- Mô tả: Lấy danh sách đơn hàng của một user
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]
-- Parameters: user_id INT
-- Returns: ResultSet với thông tin orders

USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_user_orders//

CREATE PROCEDURE sp_get_user_orders(
    IN p_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Validate input
    IF p_user_id IS NULL OR p_user_id <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid user_id';
    END IF;

    -- Main query
    SELECT
        o.id as order_id,
        o.quantity,
        o.total_price,
        o.order_date,
        p.name as product_name,
        p.category
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.user_id = p_user_id
    ORDER BY o.order_date DESC;
END//

DELIMITER ;

-- Test procedure
-- CALL sp_get_user_orders(1);
```

## ✍️ Template cho Function:

```sql
-- File: fn_calculate_order_total.sql
-- Mô tả: Tính tổng tiền của một đơn hàng
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

USE dbms_project;

DELIMITER //

DROP FUNCTION IF EXISTS fn_calculate_order_total//

CREATE FUNCTION fn_calculate_order_total(
    p_product_id INT,
    p_quantity INT
)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_unit_price DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);

    -- Validate inputs
    IF p_product_id IS NULL OR p_quantity IS NULL OR p_quantity <= 0 THEN
        RETURN 0.00;
    END IF;

    -- Get unit price
    SELECT price INTO v_unit_price
    FROM products
    WHERE id = p_product_id;

    -- Calculate total
    SET v_total = COALESCE(v_unit_price, 0.00) * p_quantity;

    RETURN v_total;
END//

DELIMITER ;

-- Test function
-- SELECT fn_calculate_order_total(1, 2) as total;
```

## 🚀 Cách chạy:

```bash
# Copy và execute procedure
docker cp database/procedure/sp_get_user_orders.sql dbms_mysql:/tmp/proc.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project -e "source /tmp/proc.sql"

# Test procedure
docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project -e "CALL sp_get_user_orders(1);"
```

## 📋 Best Practices:

1. **Error Handling**: Luôn có DECLARE EXIT HANDLER
2. **Input Validation**: Validate tất cả parameters
3. **Comments**: Comment rõ ràng logic
4. **Naming**: Sử dụng prefix sp* cho procedure, fn* cho function
5. **Testing**: Luôn include test cases
