# Transaction giữa MySQL và Redis

Mục đích: ghi lại các bài test dùng trong phần report `report/figures/Thời/transaction.tex` theo dạng markdown để dễ đọc, dễ đối chiếu và dễ cho AI sinh script test sau này.

## Phạm vi

Phần này mô tả các kịch bản transaction đã dùng trong báo cáo:

1. MySQL transaction thành công.
2. MySQL transaction thất bại và rollback.
3. Redis transaction thành công với `MULTI/EXEC`.
4. Redis thực thi nguyên tử bằng Lua script.
5. Redis chặn cập nhật không hợp lệ bằng Lua script.
6. Redis dùng `WATCH` để phát hiện xung đột.

## Nguồn tham chiếu trong report

- `report/figures/Thời/transaction.tex`
- Các hình minh họa trong `report/figures/Thời/`

## Giả định môi trường

- MySQL có sẵn dataset `sales` và `production`.
- Redis đã được nạp dữ liệu tương ứng với các key:
  - `sales:order:*`
  - `sales:order_item:*`
  - `sales:orders:*`
  - `production:stock:*`
- Có thể chạy lệnh SQL trong MySQL client và lệnh Redis trong `redis-cli`.

## Test Case 1: MySQL transaction thành công

### Mục tiêu

Kiểm tra MySQL đảm bảo tính nguyên tử khi tạo đơn hàng mới, thêm chi tiết đơn hàng và trừ tồn kho trong cùng một transaction.

### Tiền điều kiện

- `production.stocks` có bản ghi với:
  - `store_id = 1`
  - `product_id = 1`
- Tồn kho đủ để trừ `2`.

### Các bước thực hiện

```sql
START TRANSACTION;

INSERT INTO sales.orders(customer_id, order_status, order_date, required_date, shipped_date, store_id, staff_id)
VALUES(1, 1, '2026-03-02', '2026-03-10', NULL, 1, 1);

SET @new_order_id = LAST_INSERT_ID();

INSERT INTO sales.order_items(order_id, item_id, product_id, quantity, list_price, discount)
VALUES(@new_order_id, 1, 1, 2, 379.99, 0.10);

UPDATE production.stocks 
SET quantity = quantity - 2
WHERE store_id = 1 AND product_id = 1;

COMMIT;
```

### Kết quả mong đợi

- Có bản ghi mới trong `sales.orders`.
- Có bản ghi mới trong `sales.order_items` tham chiếu đến `@new_order_id`.
- `production.stocks.quantity` của `store_id = 1`, `product_id = 1` giảm đúng `2`.
- Không có trạng thái trung gian.

### Bằng chứng trong report

- `order-before-transaction.png`
- `item-before-transaction.png`
- `stock-before-transaction.png`
- `after-transaction.png`
- `order-after-transaction.png`
- `item-after-transaction.png`
- `stock-after-transaction.png`

## Test Case 2: MySQL rollback khi tồn kho không đủ

### Mục tiêu

Kiểm tra transaction bị hủy hoàn toàn khi điều kiện nghiệp vụ không hợp lệ.

### Tiền điều kiện

- `production.stocks` có bản ghi với:
  - `store_id = 1`
  - `product_id = 6`
- Tồn kho hiện tại nhỏ hơn `5`.

### Các bước thực hiện

```sql
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
    ELSE
        COMMIT;
    END IF;

END //

DELIMITER ;

CALL test_tx();
```

### Kết quả mong đợi

- Procedure chạy xong nhưng transaction không được commit.
- `production.stocks.quantity` của `store_id = 1`, `product_id = 6` giữ nguyên như ban đầu.
- Không phát sinh thay đổi tồn kho âm.

### Bằng chứng trong report

- `stock-before-rollback.png`
- `after-excute-rollback.png`
- `stock-after-rollback.png`

## Test Case 3: Redis transaction thành công với MULTI/EXEC

### Mục tiêu

Kiểm tra Redis thực thi tuần tự một nhóm lệnh tạo order, tạo order item và cập nhật tồn kho.

### Tiền điều kiện

- Order `1616` chưa tồn tại.
- Key `production:stock:1:1` tồn tại và đủ số lượng để trừ `2`.

### Các bước thực hiện

```text
MULTI
INCR sales:orders:next_id
HSET sales:order:1616 customer_id 1 order_status 1 order_date "2026-03-02" required_date "2026-03-10" shipped_date "" store_id 1 staff_id 1
SADD sales:orders:ids 1616
SADD sales:orders:customer:1 1616
SADD sales:orders:store:1 1616
HSET sales:order_item:1616:1 product_id 1 quantity 2 list_price 379.99 discount 0.10
SADD sales:order_items:order:1616 1
HINCRBY production:stock:1:1 quantity -2
EXEC
```

### Kết quả mong đợi

- Key order `sales:order:1616` được tạo.
- Các set index liên quan đến order `1616` được cập nhật.
- `production:stock:1:1.quantity` giảm `2`.
- Các lệnh được thực thi liên tiếp, không bị client khác chen vào giữa.

### Bằng chứng trong report

- `redis-order-before-success.png`
- `redis-stock-before-success.png`
- `redis-after-excute.png`
- `redis-stock-after-success.png`
- `redis-order-after-success.png`

## Test Case 4: Redis Lua script thành công

### Mục tiêu

Kiểm tra khả năng gom logic vào một block nguyên tử bằng Lua script.

### Các bước thực hiện

```text
EVAL "
local oid = 1617
redis.call('HSET', 'sales:order:' .. oid,
    'customer_id', '1', 'order_status', '1',
    'order_date', '2026-03-02', 'required_date', '2026-03-10',
    'shipped_date', '', 'store_id', '1', 'staff_id', '1')
redis.call('SADD', 'sales:orders:ids', oid)
redis.call('HINCRBY', 'production:stock:1:1', 'quantity', -2)
return 'OK'
" 0
```

### Kết quả mong đợi

- Redis trả về `OK`.
- Order `1617` được tạo.
- Tồn kho `production:stock:1:1` giảm `2`.
- Toàn bộ logic được thực thi nguyên tử trong một script.

### Bằng chứng trong report

- `redis-lua-success.png`

## Test Case 5: Redis Lua script thất bại do không đủ tồn kho

### Mục tiêu

Kiểm tra cách Redis ngăn cập nhật không hợp lệ bằng kiểm tra điều kiện trước khi ghi.

### Tiền điều kiện

- Key `production:stock:1:6` tồn tại.
- Giá trị `quantity` hiện tại nhỏ hơn `5`.

### Các bước thực hiện

```text
EVAL "
local stock = tonumber(redis.call('HGET', 'production:stock:1:6', 'quantity'))
if stock < 5 then
    return 'FAILED: Not enough stock (have ' .. stock .. ', need 5)'
end
redis.call('HINCRBY', 'production:stock:1:6', 'quantity', -5)
return 'OK: Stock reduced to ' .. (stock - 5)
" 0
```

### Kết quả mong đợi

- Redis trả về thông báo `FAILED: Not enough stock ...`.
- `production:stock:1:6.quantity` không thay đổi.
- Đây là cơ chế phòng ngừa trước khi cập nhật, không phải rollback sau khi đã ghi.

### Bằng chứng trong report

- `redis-stock-before-fail.png`
- `redis-stock-after-fail.png`

## Test Case 6: Redis WATCH phát hiện xung đột

### Mục tiêu

Kiểm tra optimistic locking trong Redis bằng `WATCH`.

### Kịch bản

- Terminal 1 theo dõi key stock và chuẩn bị trừ tồn kho.
- Terminal 2 sửa cùng key trước khi Terminal 1 gọi `EXEC`.
- Khi đó `EXEC` ở Terminal 1 phải thất bại.

### Các bước thực hiện

```text
-- Terminal 1
redis-cli WATCH production:stock:1:1
redis-cli MULTI
redis-cli HINCRBY production:stock:1:1 quantity -1

-- Terminal 2
redis-cli HSET production:stock:1:1 quantity 100

-- Terminal 1
redis-cli EXEC
```

### Kết quả mong đợi

- `EXEC` trả về `nil` hoặc trạng thái tương đương cho biết transaction bị hủy.
- Redis phát hiện key đã bị thay đổi sau khi `WATCH`.
- Không áp dụng lệnh trừ tồn kho của Terminal 1.

### Bằng chứng trong report

- `redis-watch.png`

## Gợi ý cho AI sinh test tự động

Nếu muốn AI tạo script test từ tài liệu này, nên yêu cầu theo mẫu:

```text
Viết script test cho Test Case X trong test_src/transaction/README.md.
Yêu cầu:
- giữ nguyên dữ liệu đầu vào như tài liệu
- tách rõ phần setup, execute, assert, cleanup
- in ra before/after
- ưu tiên Python hoặc SQL script độc lập
```

## Ghi chú

- Đây là tài liệu mô tả test case theo report, chưa phải test script chạy tự động.
- Nếu cần, bước tiếp theo có thể là viết:
  - `mysql_success.sql`
  - `mysql_rollback.sql`
  - `redis_multi_exec.txt`
  - `redis_lua_success.txt`
  - `redis_lua_fail.txt`
  - `redis_watch.txt`
