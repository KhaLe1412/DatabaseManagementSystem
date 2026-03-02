# PHÂN CÔNG NHÓM — SO SÁNH MySQL vs Redis

## Đề tài: So sánh hai DBMS MySQL và Redis

### Dữ liệu sử dụng: BikeStores Sample Database

> **Tổng quan dữ liệu:** 9 bảng/cấu trúc, ~9,071 bản ghi  
> **MySQL:** Import từ file SQL (`BikeStores Sample Database - create objects.sql` + `load data.sql`)  
> **Redis:** Import từ file `bikestores_redis_commands.txt` (`redis-cli < bikestores_redis_commands.txt`)

---

## MỤC LỤC

1. [Thành viên 1 — Data Storage & Management](#thành-viên-1--data-storage--management)
2. [Thành viên 2 — Indexing](#thành-viên-2--indexing)
3. [Thành viên 3 — Query Processing](#thành-viên-3--query-processing)
4. [Thành viên 4 — Transaction](#thành-viên-4--transaction)
5. [Thành viên 5 — Concurrency Control](#thành-viên-5--concurrency-control)
6. [Định dạng báo cáo chung](#định-dạng-báo-cáo-chung)
7. [Timeline đề xuất](#timeline-đề-xuất)

---

## THÀNH VIÊN 1 — Data Storage & Management

### 1.1. Mục tiêu

So sánh cách MySQL và Redis **lưu trữ, tổ chức và quản lý dữ liệu** BikeStores.

### 1.2. Nhiệm vụ cụ thể

#### Phần A — Mô hình dữ liệu (Data Model)

| Hạng mục | MySQL                        | Redis                           |
| -------- | ---------------------------- | ------------------------------- |
| Mô hình  | Relational (bảng, hàng, cột) | Key-Value / Hash                |
| Schema   | Cố định (CREATE TABLE)       | Schema-free                     |
| Quan hệ  | FK constraints               | Quy ước đặt tên key + Set index |

**Việc cần làm:**

1. Vẽ **sơ đồ ERD** của BikeStores trên MySQL (8 bảng có dữ liệu, bỏ bảng rỗng)
2. Vẽ **sơ đồ cấu trúc key** tương ứng trên Redis
3. So sánh cách biểu diễn **quan hệ 1-nhiều** (ví dụ: 1 brand → nhiều products)
   - MySQL: `FOREIGN KEY (brand_id) REFERENCES production.brands`
   - Redis: `SADD production:products:brand:9 1 2 3 ...`

#### Phần B — Dung lượng lưu trữ (Storage Size)

**Dữ liệu sử dụng:** Toàn bộ 9,071 bản ghi

**Cách thực hiện:**

**MySQL:**

```sql
-- Kiểm tra dung lượng từng bảng
SELECT
    table_schema AS 'Schema',
    table_name AS 'Table',
    table_rows AS 'Rows',
    ROUND(data_length / 1024, 2) AS 'Data (KB)',
    ROUND(index_length / 1024, 2) AS 'Index (KB)',
    ROUND((data_length + index_length) / 1024, 2) AS 'Total (KB)'
FROM information_schema.tables
WHERE table_schema = 'BikeStores'
ORDER BY (data_length + index_length) DESC;
```

**Redis:**

```bash
# Tổng dung lượng bộ nhớ
redis-cli INFO memory | grep used_memory_human

# Dung lượng từng key (lấy mẫu)
redis-cli MEMORY USAGE production:product:1
redis-cli MEMORY USAGE sales:order:1
redis-cli MEMORY USAGE sales:customer:1

# Đếm tổng số key
redis-cli DBSIZE

# Dung lượng trung bình mỗi loại key (dùng script)
redis-cli EVAL "
local types = {'production:brand:', 'production:product:', 'sales:customer:', 'sales:order:', 'sales:order_item:'}
local result = {}
for _, prefix in ipairs(types) do
    local keys = redis.call('KEYS', prefix .. '*')
    local total = 0
    local count = 0
    for _, k in ipairs(keys) do
        if redis.call('TYPE', k).ok == 'hash' then
            total = total + redis.call('MEMORY', 'USAGE', k)
            count = count + 1
        end
    end
    if count > 0 then
        table.insert(result, prefix .. ' | Count: ' .. count .. ' | Avg: ' .. string.format('%.0f', total/count) .. ' bytes | Total: ' .. string.format('%.1f', total/1024) .. ' KB')
    end
end
return result
" 0
```

#### Phần C — CRUD Operations (Thêm/Sửa/Xóa)

**Dữ liệu sử dụng:** Bảng `sales.customers`

| Thao tác   | MySQL                                                                                                                                                                    | Redis                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CREATE** | `INSERT INTO sales.customers(first_name, last_name, phone, email, street, city, state, zip_code) VALUES('Test','User','123','test@mail.com','1 St','NYC','NY','10001');` | `INCR sales:customers:next_id` → lấy ID mới, rồi `HSET sales:customer:{id} first_name "Test" last_name "User" ...` + `SADD sales:customers:ids {id}` |
| **READ**   | `SELECT * FROM sales.customers WHERE customer_id = 5;`                                                                                                                   | `HGETALL sales:customer:5`                                                                                                                           |
| **UPDATE** | `UPDATE sales.customers SET phone = '(999) 000-0000' WHERE customer_id = 5;`                                                                                             | `HSET sales:customer:5 phone "(999) 000-0000"`                                                                                                       |
| **DELETE** | `DELETE FROM sales.customers WHERE customer_id = 1445;`                                                                                                                  | `DEL sales:customer:1445` + `SREM sales:customers:ids 1445`                                                                                          |

**Đo thời gian mỗi thao tác** (chạy 100 lần, lấy trung bình).

### 1.3. Kết quả dự kiến

| Tiêu chí                          | MySQL thắng? | Redis thắng? |
| --------------------------------- | ------------ | ------------ |
| Cấu trúc dữ liệu rõ ràng          | ✅           |              |
| Ràng buộc toàn vẹn (FK, NOT NULL) | ✅           |              |
| Dung lượng lưu trữ nhỏ hơn        | ✅           |              |
| Tốc độ CRUD đơn lẻ                |              | ✅           |
| Linh hoạt schema                  |              | ✅           |

### 1.4. Yêu cầu báo cáo

- [ ] Sơ đồ ERD (MySQL) và sơ đồ Key Structure (Redis)
- [ ] Bảng so sánh dung lượng (KB) từng bảng/cấu trúc
- [ ] Bảng benchmark CRUD (thời gian ms)
- [ ] Nhận xét ưu/nhược điểm mỗi bên

---

## THÀNH VIÊN 2 — Indexing

### 2.1. Mục tiêu

So sánh cơ chế **đánh index** và hiệu quả tìm kiếm giữa MySQL và Redis.

### 2.2. Nhiệm vụ cụ thể

#### Phần A — Các loại index

| MySQL                         | Redis                                           |
| ----------------------------- | ----------------------------------------------- |
| Primary Key (B-Tree, tự động) | Key name chính (truy cập O(1))                  |
| Secondary Index (B-Tree)      | Set index (SADD thủ công)                       |
| Composite Index               | Composite key name (vd: `production:stock:1:5`) |
| Full-text Index               | Không hỗ trợ native (cần RedisSearch)           |

**Việc cần làm:**

1. Liệt kê tất cả index **có sẵn** trong MySQL sau khi tạo schema
2. Liệt kê tất cả Set index **đã tạo** trong Redis
3. Tạo thêm index trên MySQL để so sánh

#### Phần B — Benchmark: Tìm kiếm có index vs không index

**Dữ liệu sử dụng:** `production.products` (321 sản phẩm) + `sales.orders` (1,615 đơn hàng)

**Test Case 1 — Tìm sản phẩm theo brand (có index)**

```sql
-- MySQL (có FK index)
SELECT * FROM production.products WHERE brand_id = 9;
-- Kiểm tra execution plan
EXPLAIN SELECT * FROM production.products WHERE brand_id = 9;
```

```bash
# Redis (có Set index)
redis-cli SMEMBERS production:products:brand:9
# Rồi HGETALL từng product
```

**Test Case 2 — Tìm sản phẩm theo khoảng giá (MySQL có index, Redis không có)**

```sql
-- MySQL
CREATE INDEX idx_products_price ON production.products(list_price);
SELECT * FROM production.products WHERE list_price BETWEEN 1000 AND 2000;
EXPLAIN SELECT * FROM production.products WHERE list_price BETWEEN 1000 AND 2000;
```

```bash
# Redis — phải scan toàn bộ (không có range index)
redis-cli EVAL "
local pids = redis.call('SMEMBERS', 'production:products:ids')
local result = {}
for _, pid in ipairs(pids) do
    local price = tonumber(redis.call('HGET', 'production:product:' .. pid, 'list_price'))
    if price >= 1000 and price <= 2000 then
        local name = redis.call('HGET', 'production:product:' .. pid, 'product_name')
        table.insert(result, pid .. ' | ' .. name .. ' | $' .. price)
    end
end
return result
" 0
```

**Test Case 3 — Tìm sản phẩm theo tên (LIKE / pattern matching)**

```sql
-- MySQL
SELECT * FROM production.products WHERE product_name LIKE '%Trek%Domane%';
-- Hoặc tạo Full-text index
CREATE FULLTEXT INDEX idx_products_name ON production.products(product_name);
SELECT * FROM production.products WHERE MATCH(product_name) AGAINST('Trek Domane');
```

```bash
# Redis — full scan + string match
redis-cli EVAL "
local pids = redis.call('SMEMBERS', 'production:products:ids')
local result = {}
for _, pid in ipairs(pids) do
    local name = redis.call('HGET', 'production:product:' .. pid, 'product_name')
    if string.find(string.lower(name), 'trek') and string.find(string.lower(name), 'domane') then
        table.insert(result, pid .. ' | ' .. name)
    end
end
return result
" 0
```

**Test Case 4 — Tìm đơn hàng theo composite condition**

```sql
-- MySQL: đơn hàng của store 1, trạng thái completed (4), năm 2017
SELECT * FROM sales.orders
WHERE store_id = 1 AND order_status = 4
AND order_date BETWEEN '2017-01-01' AND '2017-12-31';
```

```bash
# Redis — dùng Set intersection + filter
redis-cli EVAL "
local oids = redis.call('SMEMBERS', 'sales:orders:store:1')
local result = {}
for _, oid in ipairs(oids) do
    local status = redis.call('HGET', 'sales:order:' .. oid, 'order_status')
    local date = redis.call('HGET', 'sales:order:' .. oid, 'order_date')
    if status == '4' and date >= '2017-01-01' and date <= '2017-12-31' then
        table.insert(result, oid .. ' | ' .. date .. ' | status=' .. status)
    end
end
return result
" 0
```

#### Phần C — Tạo Sorted Set index trong Redis (nâng cao)

Tạo thêm index giá để Redis hỗ trợ range query:

```bash
# Tạo Sorted Set index theo giá
redis-cli EVAL "
local pids = redis.call('SMEMBERS', 'production:products:ids')
for _, pid in ipairs(pids) do
    local price = tonumber(redis.call('HGET', 'production:product:' .. pid, 'list_price'))
    redis.call('ZADD', 'production:products:by_price', price, pid)
end
return redis.call('ZCARD', 'production:products:by_price')
" 0

# Giờ có thể range query hiệu quả
redis-cli ZRANGEBYSCORE production:products:by_price 1000 2000
```

So sánh tốc độ **trước và sau** khi có Sorted Set index.

### 2.3. Kết quả dự kiến

| Test Case                | MySQL                   | Redis                | Ghi chú     |
| ------------------------ | ----------------------- | -------------------- | ----------- |
| Tìm theo FK (brand_id)   | Nhanh (B-Tree)          | Nhanh (Set O(1))     | Ngang nhau  |
| Range query (giá)        | Nhanh (B-Tree index)    | Chậm (full scan)     | MySQL thắng |
| Range query + Sorted Set | Nhanh                   | Nhanh                | Ngang nhau  |
| Full-text search         | Hỗ trợ native           | Phải scan thủ công   | MySQL thắng |
| Composite condition      | Nhanh (composite index) | Phải filter thủ công | MySQL thắng |

### 2.4. Yêu cầu báo cáo

- [ ] Bảng liệt kê index MySQL vs Redis
- [ ] EXPLAIN output cho từng query MySQL
- [ ] Benchmark thời gian (ms) cho 4 test cases
- [ ] So sánh trước/sau khi thêm Sorted Set index Redis
- [ ] Nhận xét: khi nào Redis cần module bổ sung (RedisSearch)

---

## THÀNH VIÊN 3 — Query Processing

### 3.1. Mục tiêu

So sánh khả năng **xử lý truy vấn** phức tạp giữa MySQL (SQL) và Redis (commands + Lua scripting).

### 3.2. Nhiệm vụ cụ thể

#### Phần A — Truy vấn đơn giản (Single table)

**Dữ liệu:** `production.products` (321 bản ghi)

**Q1: Lấy tất cả sản phẩm thuộc category "Mountain Bikes" (category_id = 6)**

```sql
-- MySQL
SELECT product_id, product_name, list_price
FROM production.products
WHERE category_id = 6
ORDER BY list_price DESC;
```

```bash
# Redis
redis-cli EVAL "
local pids = redis.call('SMEMBERS', 'production:products:category:6')
local result = {}
for _, pid in ipairs(pids) do
    local p = redis.call('HGETALL', 'production:product:' .. pid)
    local info = {}
    for i = 1, #p, 2 do info[p[i]] = p[i+1] end
    table.insert(result, {tonumber(info.list_price), pid .. ' | ' .. info.product_name .. ' | $' .. info.list_price})
end
table.sort(result, function(a,b) return a[1] > b[1] end)
local output = {}
for _, r in ipairs(result) do table.insert(output, r[2]) end
return output
" 0
```

#### Phần B — Truy vấn JOIN (Multi-table)

**Dữ liệu:** `sales.orders` + `sales.order_items` + `production.products`

**Q2: Chi tiết đơn hàng #1 — kèm tên sản phẩm, số lượng, giá, giảm giá**

```sql
-- MySQL
SELECT o.order_id, o.order_date, p.product_name,
       oi.quantity, oi.list_price, oi.discount,
       (oi.quantity * oi.list_price * (1 - oi.discount)) AS line_total
FROM sales.orders o
JOIN sales.order_items oi ON o.order_id = oi.order_id
JOIN production.products p ON oi.product_id = p.product_id
WHERE o.order_id = 1;
```

```bash
# Redis
redis-cli EVAL "
local order = redis.call('HGETALL', 'sales:order:1')
local item_ids = redis.call('SMEMBERS', 'sales:order_items:order:1')
local result = {}
for _, iid in ipairs(item_ids) do
    local item = redis.call('HGETALL', 'sales:order_item:1:' .. iid)
    local info = {}
    for i = 1, #item, 2 do info[item[i]] = item[i+1] end
    local pname = redis.call('HGET', 'production:product:' .. info.product_id, 'product_name')
    local total = tonumber(info.quantity) * tonumber(info.list_price) * (1 - tonumber(info.discount))
    table.insert(result, pname .. ' | qty:' .. info.quantity .. ' | $' .. info.list_price .. ' | disc:' .. info.discount .. ' | total:$' .. string.format('%.2f', total))
end
return result
" 0
```

#### Phần C — Truy vấn Aggregate (GROUP BY, COUNT, SUM, AVG)

**Q3: Tổng doanh thu theo store**

```sql
-- MySQL
SELECT s.store_name,
       COUNT(DISTINCT o.order_id) AS total_orders,
       SUM(oi.quantity * oi.list_price * (1 - oi.discount)) AS revenue
FROM sales.stores s
JOIN sales.orders o ON s.store_id = o.store_id
JOIN sales.order_items oi ON o.order_id = oi.order_id
GROUP BY s.store_name
ORDER BY revenue DESC;
```

```bash
# Redis (Lua script)
redis-cli EVAL "
local stores = redis.call('SMEMBERS', 'sales:stores:ids')
local result = {}
for _, sid in ipairs(stores) do
    local name = redis.call('HGET', 'sales:store:' .. sid, 'store_name')
    local oids = redis.call('SMEMBERS', 'sales:orders:store:' .. sid)
    local revenue = 0
    for _, oid in ipairs(oids) do
        local iids = redis.call('SMEMBERS', 'sales:order_items:order:' .. oid)
        for _, iid in ipairs(iids) do
            local key = 'sales:order_item:' .. oid .. ':' .. iid
            local q = tonumber(redis.call('HGET', key, 'quantity'))
            local p = tonumber(redis.call('HGET', key, 'list_price'))
            local d = tonumber(redis.call('HGET', key, 'discount'))
            revenue = revenue + (q * p * (1 - d))
        end
    end
    table.insert(result, name .. ' | Orders: ' .. #oids .. ' | Revenue: $' .. string.format('%.2f', revenue))
end
return result
" 0
```

**Q4: Top 5 sản phẩm bán chạy nhất (theo số lượng)**

```sql
-- MySQL
SELECT p.product_name, SUM(oi.quantity) AS total_sold
FROM sales.order_items oi
JOIN production.products p ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_sold DESC
LIMIT 5;
```

```bash
# Redis
redis-cli EVAL "
local pids = redis.call('SMEMBERS', 'production:products:ids')
local sales = {}
for _, pid in ipairs(pids) do sales[pid] = 0 end

local oids = redis.call('SMEMBERS', 'sales:orders:ids')
for _, oid in ipairs(oids) do
    local iids = redis.call('SMEMBERS', 'sales:order_items:order:' .. oid)
    for _, iid in ipairs(iids) do
        local key = 'sales:order_item:' .. oid .. ':' .. iid
        local pid = redis.call('HGET', key, 'product_id')
        local qty = tonumber(redis.call('HGET', key, 'quantity'))
        if sales[pid] then sales[pid] = sales[pid] + qty end
    end
end

local sorted = {}
for pid, qty in pairs(sales) do
    if qty > 0 then
        local name = redis.call('HGET', 'production:product:' .. pid, 'product_name')
        table.insert(sorted, {qty, name, pid})
    end
end
table.sort(sorted, function(a,b) return a[1] > b[1] end)

local result = {}
for i = 1, math.min(5, #sorted) do
    table.insert(result, '#' .. i .. ' | ' .. sorted[i][2] .. ' | Sold: ' .. sorted[i][1])
end
return result
" 0
```

#### Phần D — Truy vấn Subquery / Nested

**Q5: Khách hàng chưa có đơn hàng nào**

```sql
-- MySQL
SELECT c.customer_id, c.first_name, c.last_name
FROM sales.customers c
WHERE c.customer_id NOT IN (SELECT DISTINCT customer_id FROM sales.orders WHERE customer_id IS NOT NULL);
```

```bash
# Redis
redis-cli EVAL "
local cids = redis.call('SMEMBERS', 'sales:customers:ids')
local result = {}
for _, cid in ipairs(cids) do
    local oids = redis.call('SMEMBERS', 'sales:orders:customer:' .. cid)
    if #oids == 0 then
        local fname = redis.call('HGET', 'sales:customer:' .. cid, 'first_name')
        local lname = redis.call('HGET', 'sales:customer:' .. cid, 'last_name')
        table.insert(result, cid .. ' | ' .. fname .. ' ' .. lname)
    end
end
return result
" 0
```

### 3.3. Đo benchmark

Chạy mỗi query **50 lần**, ghi lại thời gian trung bình:

```sql
-- MySQL: dùng profiling
SET profiling = 1;
-- chạy query
SHOW PROFILES;
```

```bash
# Redis: dùng --latency hoặc time
time redis-cli EVAL "..." 0
```

### 3.4. Kết quả dự kiến

| Query                        | MySQL    | Redis       | Ai thắng?      |
| ---------------------------- | -------- | ----------- | -------------- |
| Q1: Single filter + sort     | ~1-5 ms  | ~1-3 ms     | Redis (nhỏ)    |
| Q2: JOIN 3 bảng              | ~1-5 ms  | ~2-5 ms     | Ngang nhau     |
| Q3: Aggregate + GROUP BY     | ~5-15 ms | ~50-200 ms  | MySQL thắng    |
| Q4: Aggregate + Sort + Limit | ~5-15 ms | ~100-500 ms | MySQL thắng rõ |
| Q5: Subquery / NOT IN        | ~5-10 ms | ~20-50 ms   | MySQL thắng    |

### 3.5. Yêu cầu báo cáo

- [ ] 5 cặp query MySQL vs Redis (code + kết quả)
- [ ] Bảng benchmark thời gian cho từng query
- [ ] Biểu đồ cột so sánh thời gian
- [ ] Phân tích: MySQL mạnh ở đâu, Redis mạnh ở đâu
- [ ] Kết luận: loại query nào nên dùng hệ nào

---

## THÀNH VIÊN 4 — Transaction

### 4.1. Mục tiêu

So sánh cơ chế **giao dịch (transaction)** và đảm bảo tính ACID giữa MySQL và Redis.

### 4.2. Nhiệm vụ cụ thể

#### Phần A — Lý thuyết ACID

| Tính chất       | MySQL (InnoDB)                | Redis                                        |
| --------------- | ----------------------------- | -------------------------------------------- |
| **Atomicity**   | Đầy đủ (ROLLBACK)             | MULTI/EXEC (atomic nhưng không rollback)     |
| **Consistency** | FK, CHECK, UNIQUE constraints | Không có constraint — app tự quản lý         |
| **Isolation**   | 4 mức isolation level         | Single-threaded → serializable mặc định      |
| **Durability**  | WAL + redo log                | AOF / RDB (tùy cấu hình, có thể mất dữ liệu) |

#### Phần B — Test Transaction thành công

**Kịch bản:** Tạo đơn hàng mới (order + order_items + giảm stock) — tất cả phải thành công hoặc tất cả thất bại.

**Dữ liệu sử dụng:** `sales.orders`, `sales.order_items`, `production.stocks`

**MySQL:**

```sql
START TRANSACTION;

-- Tạo order
INSERT INTO sales.orders(customer_id, order_status, order_date, required_date, shipped_date, store_id, staff_id)
VALUES(1, 1, '2026-03-02', '2026-03-10', NULL, 1, 1);

SET @new_order_id = LAST_INSERT_ID();

-- Thêm order item
INSERT INTO sales.order_items(order_id, item_id, product_id, quantity, list_price, discount)
VALUES(@new_order_id, 1, 1, 2, 379.99, 0.10);

-- Giảm stock
UPDATE production.stocks SET quantity = quantity - 2
WHERE store_id = 1 AND product_id = 1;

COMMIT;

-- Kiểm tra
SELECT * FROM sales.orders WHERE order_id = @new_order_id;
SELECT * FROM sales.order_items WHERE order_id = @new_order_id;
SELECT quantity FROM production.stocks WHERE store_id = 1 AND product_id = 1;
```

**Redis:**

```bash
# Dùng MULTI/EXEC
redis-cli MULTI
redis-cli INCR sales:orders:next_id
redis-cli HSET sales:order:1616 customer_id 1 order_status 1 order_date "2026-03-02" required_date "2026-03-10" shipped_date "" store_id 1 staff_id 1
redis-cli SADD sales:orders:ids 1616
redis-cli SADD sales:orders:customer:1 1616
redis-cli SADD sales:orders:store:1 1616
redis-cli HSET sales:order_item:1616:1 product_id 1 quantity 2 list_price 379.99 discount 0.10
redis-cli SADD sales:order_items:order:1616 1
redis-cli HINCRBY production:stock:1:1 quantity -2
redis-cli EXEC
```

Hoặc dùng Lua script (atomic):

```bash
redis-cli EVAL "
local oid = 1616
redis.call('HSET', 'sales:order:' .. oid,
    'customer_id', '1', 'order_status', '1',
    'order_date', '2026-03-02', 'required_date', '2026-03-10',
    'shipped_date', '', 'store_id', '1', 'staff_id', '1')
redis.call('SADD', 'sales:orders:ids', oid)
redis.call('SADD', 'sales:orders:customer:1', oid)
redis.call('SADD', 'sales:orders:store:1', oid)
redis.call('HSET', 'sales:order_item:' .. oid .. ':1',
    'product_id', '1', 'quantity', '2', 'list_price', '379.99', 'discount', '0.10')
redis.call('SADD', 'sales:order_items:order:' .. oid, '1')
redis.call('HINCRBY', 'production:stock:1:1', 'quantity', -2)
return 'OK: Order ' .. oid .. ' created'
" 0
```

#### Phần C — Test Transaction thất bại (ROLLBACK)

**Kịch bản:** Tạo đơn hàng nhưng stock không đủ → phải rollback.

**MySQL:**

```sql
START TRANSACTION;

-- Kiểm tra stock trước
SELECT quantity FROM production.stocks WHERE store_id = 1 AND product_id = 6;
-- Giả sử quantity = 0 → không đủ

-- Thử giảm stock
UPDATE production.stocks SET quantity = quantity - 5
WHERE store_id = 1 AND product_id = 6;

-- Kiểm tra: stock âm → ROLLBACK
SELECT quantity FROM production.stocks WHERE store_id = 1 AND product_id = 6;
-- Nếu < 0 thì:
ROLLBACK;

-- Xác nhận dữ liệu không thay đổi
SELECT quantity FROM production.stocks WHERE store_id = 1 AND product_id = 6;
```

**Redis (Lua — tự kiểm tra trước khi thao tác):**

```bash
redis-cli EVAL "
local stock = tonumber(redis.call('HGET', 'production:stock:1:6', 'quantity'))
if stock < 5 then
    return 'FAILED: Not enough stock (have ' .. stock .. ', need 5)'
end
redis.call('HINCRBY', 'production:stock:1:6', 'quantity', -5)
return 'OK: Stock reduced to ' .. (stock - 5)
" 0
```

#### Phần D — Test WATCH (Optimistic Locking trong Redis)

```bash
# Terminal 1
redis-cli WATCH production:stock:1:1
redis-cli MULTI
redis-cli HINCRBY production:stock:1:1 quantity -1
# Trước khi EXEC, ở Terminal 2 chạy:
# redis-cli HSET production:stock:1:1 quantity 100
redis-cli EXEC
# → Trả về (nil) vì key đã bị thay đổi
```

### 4.3. Kết quả dự kiến

| Tính năng                     | MySQL                  | Redis                           |
| ----------------------------- | ---------------------- | ------------------------------- |
| Transaction đầy đủ (ROLLBACK) | ✅ Hỗ trợ native       | ❌ Phải tự xử lý trong Lua      |
| Atomicity                     | ✅ COMMIT/ROLLBACK     | ✅ MULTI/EXEC hoặc Lua (atomic) |
| Constraint enforcement        | ✅ FK, CHECK, UNIQUE   | ❌ App phải tự kiểm tra         |
| Optimistic locking            | ✅ SELECT...FOR UPDATE | ✅ WATCH                        |
| Tốc độ transaction            | Trung bình             | Rất nhanh                       |

### 4.4. Yêu cầu báo cáo

- [ ] Bảng so sánh ACID
- [ ] Screenshot/log transaction thành công (cả 2 hệ)
- [ ] Screenshot/log transaction thất bại + rollback
- [ ] Demo WATCH race condition
- [ ] Nhận xét: khi nào cần MySQL, khi nào Redis đủ

---

## THÀNH VIÊN 5 — Concurrency Control

### 5.1. Mục tiêu

So sánh cách MySQL và Redis **xử lý truy cập đồng thời** từ nhiều client.

### 5.2. Nhiệm vụ cụ thể

#### Phần A — Lý thuyết Concurrency

| Khái niệm        | MySQL                           | Redis                                 |
| ---------------- | ------------------------------- | ------------------------------------- |
| Kiến trúc        | Multi-threaded                  | Single-threaded (event loop)          |
| Lock granularity | Row-level, Table-level          | Không cần lock (single-thread)        |
| Isolation levels | READ UNCOMMITTED → SERIALIZABLE | Mặc định serializable (single-thread) |
| Deadlock         | Có thể xảy ra                   | Không xảy ra                          |

#### Phần B — Test đồng thời đọc (Read Concurrency)

**Dữ liệu:** `production.products` (321 bản ghi)

Viết script Python mô phỏng **10 client đồng thời** đọc sản phẩm:

**Tạo file `benchmark_concurrency.py`:**

```python
import threading
import time
import mysql.connector
import redis

NUM_THREADS = 10
NUM_READS = 100  # mỗi thread đọc 100 lần

# ─── MySQL ───
def mysql_read_worker(results, thread_id):
    conn = mysql.connector.connect(host='localhost', user='root', password='yourpassword', database='BikeStores')
    cursor = conn.cursor()
    start = time.time()
    for i in range(NUM_READS):
        pid = (i % 321) + 1
        cursor.execute("SELECT * FROM production.products WHERE product_id = %s", (pid,))
        cursor.fetchall()
    elapsed = time.time() - start
    results[thread_id] = elapsed
    conn.close()

# ─── Redis ───
def redis_read_worker(results, thread_id):
    r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    start = time.time()
    for i in range(NUM_READS):
        pid = (i % 321) + 1
        r.hgetall(f"production:product:{pid}")
    elapsed = time.time() - start
    results[thread_id] = elapsed

def benchmark(worker_func, name):
    results = {}
    threads = []
    start = time.time()
    for i in range(NUM_THREADS):
        t = threading.Thread(target=worker_func, args=(results, i))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    total = time.time() - start
    avg = sum(results.values()) / len(results)
    print(f"[{name}] {NUM_THREADS} threads x {NUM_READS} reads")
    print(f"  Total wall time : {total:.3f}s")
    print(f"  Avg per thread  : {avg:.3f}s")
    print(f"  Throughput      : {NUM_THREADS * NUM_READS / total:.0f} reads/sec")

if __name__ == "__main__":
    print("=== READ CONCURRENCY ===")
    benchmark(mysql_read_worker, "MySQL")
    benchmark(redis_read_worker, "Redis")
```

#### Phần C — Test đồng thời ghi (Write Concurrency — Race Condition)

**Dữ liệu:** `production.stocks` (store_id=1, product_id=1)

**Kịch bản:** 10 client đồng thời giảm stock 1 đơn vị. Stock ban đầu = 27. Kết quả đúng phải = 17.

```python
# ─── MySQL (có thể bị race condition nếu không lock) ───
def mysql_write_worker_unsafe(results, thread_id):
    conn = mysql.connector.connect(host='localhost', user='root', password='yourpassword', database='BikeStores')
    cursor = conn.cursor()
    for _ in range(1):
        cursor.execute("SELECT quantity FROM production.stocks WHERE store_id=1 AND product_id=1")
        qty = cursor.fetchone()[0]
        cursor.execute("UPDATE production.stocks SET quantity=%s WHERE store_id=1 AND product_id=1", (qty - 1,))
        conn.commit()
    conn.close()

# ─── MySQL (an toàn với transaction + row lock) ───
def mysql_write_worker_safe(results, thread_id):
    conn = mysql.connector.connect(host='localhost', user='root', password='yourpassword', database='BikeStores')
    cursor = conn.cursor()
    for _ in range(1):
        cursor.execute("START TRANSACTION")
        cursor.execute("UPDATE production.stocks SET quantity = quantity - 1 WHERE store_id=1 AND product_id=1")
        cursor.execute("COMMIT")
    conn.close()

# ─── Redis (atomic — không cần lock) ───
def redis_write_worker(results, thread_id):
    r = redis.Redis(host='localhost', port=6379, db=0)
    for _ in range(1):
        r.hincrby("production:stock:1:1", "quantity", -1)
```

**So sánh kết quả:**

- MySQL unsafe: stock có thể **sai** (lost update)
- MySQL safe: stock **đúng** (row lock)
- Redis: stock **luôn đúng** (HINCRBY atomic, single-threaded)

#### Phần D — Deadlock Test (chỉ MySQL)

```sql
-- Terminal 1
START TRANSACTION;
UPDATE production.stocks SET quantity = quantity - 1 WHERE store_id = 1 AND product_id = 1;
-- Đợi...
UPDATE production.stocks SET quantity = quantity - 1 WHERE store_id = 1 AND product_id = 2;

-- Terminal 2 (chạy đồng thời)
START TRANSACTION;
UPDATE production.stocks SET quantity = quantity - 1 WHERE store_id = 1 AND product_id = 2;
-- Đợi...
UPDATE production.stocks SET quantity = quantity - 1 WHERE store_id = 1 AND product_id = 1;
-- → MySQL phát hiện deadlock, abort 1 trong 2 transaction
```

```bash
# Redis: Không bao giờ xảy ra deadlock (single-threaded)
# Mọi command thực thi tuần tự
```

#### Phần E — Throughput Test

Mở rộng benchmark: tăng dần số thread (1, 5, 10, 20, 50) và đo throughput:

```python
for num_threads in [1, 5, 10, 20, 50]:
    NUM_THREADS = num_threads
    benchmark(mysql_read_worker, f"MySQL-{num_threads}t")
    benchmark(redis_read_worker, f"Redis-{num_threads}t")
```

### 5.3. Kết quả dự kiến

| Test                            | MySQL                    | Redis                      |
| ------------------------------- | ------------------------ | -------------------------- |
| Read concurrency (throughput)   | ~5,000-20,000 r/s        | ~50,000-100,000 r/s        |
| Write race condition (unsafe)   | ❌ Kết quả sai           | ✅ Luôn đúng               |
| Write race condition (safe)     | ✅ Đúng (nhưng chậm hơn) | ✅ Đúng (và nhanh hơn)     |
| Deadlock                        | ⚠️ Có thể xảy ra         | ✅ Không bao giờ           |
| Throughput scale (nhiều thread) | Tốt vừa                  | Rất tốt (I/O multiplexing) |

### 5.4. Yêu cầu báo cáo

- [ ] Bảng lý thuyết concurrency model
- [ ] Code Python benchmark (đính kèm)
- [ ] Bảng kết quả throughput (1/5/10/20/50 threads)
- [ ] Biểu đồ đường: threads vs throughput (MySQL vs Redis)
- [ ] Screenshot deadlock MySQL + giải thích
- [ ] Demo race condition: kết quả unsafe vs safe
- [ ] Kết luận: ưu/nhược mô hình single-thread vs multi-thread

---

## ĐỊNH DẠNG BÁO CÁO CHUNG

Mỗi thành viên gửi lại **1 file** theo định dạng sau:

### Tên file

```
[SốTT]_[TenLinhVuc]_[HoTen].md
```

Ví dụ: `01_DataStorage_NguyenVanA.md`

### Cấu trúc bắt buộc

```markdown
# [Tên lĩnh vực]

## Người thực hiện: [Họ tên]

## 1. Tổng quan lý thuyết

(Bảng so sánh lý thuyết MySQL vs Redis ở lĩnh vực này)

## 2. Thực nghiệm

### 2.1. Môi trường test

- MySQL version: ...
- Redis version: ...
- OS: ...
- RAM: ...
- CPU: ...

### 2.2. Test Case 1: [Tên]

**Mô tả:** ...
**MySQL:** (code + kết quả + thời gian)
**Redis:** (code + kết quả + thời gian)
**Nhận xét:** ...

### 2.3. Test Case 2: [Tên]

...

## 3. Bảng tổng hợp kết quả

| Test Case | MySQL | Redis | Thắng |
| --------- | ----- | ----- | ----- |
| ...       | ...   | ...   | ...   |

## 4. Biểu đồ (nếu có)

(Đính kèm ảnh hoặc link)

## 5. Kết luận

- MySQL phù hợp khi: ...
- Redis phù hợp khi: ...
- Khuyến nghị: ...
```

---

## TIMELINE ĐỀ XUẤT

| Tuần   | Công việc                                      | Ai                  |
| ------ | ---------------------------------------------- | ------------------- |
| Tuần 1 | Setup môi trường (MySQL + Redis + import data) | Cả nhóm             |
| Tuần 2 | Nghiên cứu lý thuyết + viết phần lý thuyết     | Mỗi người phần mình |
| Tuần 3 | Thực nghiệm + benchmark                        | Mỗi người phần mình |
| Tuần 4 | Viết báo cáo cá nhân → gửi lại                 | Mỗi người           |
| Tuần 5 | Tổng hợp + slide trình bày                     | Cả nhóm             |

---

## GHI CHÚ CHUNG

1. **Import dữ liệu MySQL:** Chạy 2 file SQL theo thứ tự:
   - `BikeStores Sample Database - create objects.sql`
   - `BikeStores Sample Database - load data.sql`

2. **Import dữ liệu Redis:**

   ```bash
   redis-cli < bikestores_redis_commands.txt
   ```

3. **Kiểm tra dữ liệu đã import:**
   - MySQL: `SELECT COUNT(*) FROM sales.orders;` → 1,615
   - Redis: `redis-cli SCARD sales:orders:ids` → 1,615

4. **Tất cả benchmark nên chạy trên cùng 1 máy** để kết quả công bằng.

5. **Ghi lại phiên bản phần mềm** (MySQL 8.x, Redis 7.x, Python 3.x, OS).
