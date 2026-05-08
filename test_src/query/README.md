# Query Processing — Benchmark Tests

So sánh hiệu năng **MySQL** vs **Redis** trên 5 loại truy vấn tiêu biểu,
sử dụng dataset tổng hợp lớn: ~5 000 products, 5 000 customers, 30 000 orders, ~90 000 order_items.

---

## Cấu trúc thư mục

```
query/
├── setup.py               # Khởi tạo Docker container + nạp dữ liệu BikeStores
├── generate_large_data.py # Sinh dataset lớn vào MySQL + Redis (chạy 1 lần trước khi test)
├── test1.py               # Q1: Simple SELECT + ORDER BY
├── test2.py               # Q2: JOIN 3 bảng
├── test3.py               # Q3: GROUP BY + SUM (doanh thu theo cửa hàng)
├── test4.py               # Q4: Top-N (5 sản phẩm bán chạy nhất)
└── test5.py               # Q5: Subquery / Anti-join
```

---

## Thiết lập môi trường

```bash
# 1. Khởi động Docker và nạp dữ liệu BikeStores
python setup.py

# 2. Sinh dataset lớn (chạy 1 lần, mất ~1–2 phút)
python generate_large_data.py
```

---

## Dataset (large_*)

| Thực thể | MySQL | Redis | Số dòng |
|----------|-------|-------|---------|
| products | `production.large_products` | `large:product:{id}` | 5 000 |
| stores | `sales.large_stores` | `large:store:{id}` | 10 |
| customers | `sales.large_customers` | `large:customer:{id}` | 5 000 |
| orders | `sales.large_orders` | `large:order:{id}` | 30 000 |
| order_items | `sales.large_order_items` | `large:order_item:{oid}:{iid}` | ~90 000 |

---

## Cách chạy

```bash
python test1.py
python test2.py
python test3.py
python test4.py
python test5.py
```

---

## Test Cases

### Q1 — Simple SELECT + ORDER BY  (`test1.py`, 100 iterations)

**MySQL:**
```sql
SELECT product_id, product_name, list_price
FROM production.large_products
WHERE category_id = 6
ORDER BY list_price DESC;
```

**Redis (Lua):**
```
SMEMBERS large:products:category:6
  → HGET large:product:{id} list_price  (mỗi id)
  → table.sort() giảm dần theo list_price
```

| | Phương pháp |
|---|---|
| MySQL | B-tree index on `category_id`, ~500 rows/category |
| Redis | SMEMBERS → HGET per product → Lua sort |

---

### Q2 — JOIN 3 bảng  (`test2.py`, 500 iterations)

**MySQL:**
```sql
SELECT o.order_id, p.product_name,
       oi.quantity, oi.list_price, oi.discount,
       (oi.quantity * oi.list_price * (1 - oi.discount)) AS line_total
FROM sales.large_orders o
JOIN sales.large_order_items oi ON o.order_id = oi.order_id
JOIN production.large_products p ON oi.product_id = p.product_id
WHERE o.order_id = 1;
```

**Redis (Lua):**
```
SMEMBERS large:order_items:order:1
  → HGETALL large:order_item:1:{iid}
  → HGET large:product:{pid} product_name
```

| | Phương pháp |
|---|---|
| MySQL | FK indexes, native JOIN engine |
| Redis | SMEMBERS → HGETALL item → HGET product (manual join) |

---

### Q3 — GROUP BY + SUM  (`test3.py`, 10 iterations)

**MySQL:**
```sql
SELECT s.store_name,
       SUM(oi.quantity * oi.list_price * (1 - oi.discount)) AS revenue
FROM sales.large_stores s
JOIN sales.large_orders o ON s.store_id = o.store_id
JOIN sales.large_order_items oi ON o.order_id = oi.order_id
GROUP BY s.store_name
ORDER BY revenue DESC;
```

**Redis (Lua):**
```
SMEMBERS large:stores:ids
  → SMEMBERS large:orders:store:{sid}
    → SMEMBERS large:order_items:order:{oid}
      → HGET quantity / list_price / discount  → cộng dồn revenue
  → table.sort() giảm dần
```

| | Phương pháp |
|---|---|
| MySQL | 3-table JOIN + native GROUP BY + SUM aggregate |
| Redis | Duyệt thủ công toàn bộ cây key → Lua accumulate → sort |

---

### Q4 — Top-N Best Sellers  (`test4.py`, 10 iterations)

**MySQL:**
```sql
SELECT oi.product_id, SUM(oi.quantity) AS total_sold
FROM sales.large_order_items oi
GROUP BY oi.product_id
ORDER BY total_sold DESC
LIMIT 5;
```

**Redis (Lua):**
```
SMEMBERS large:products:ids  → khởi tạo bảng tích lũy {pid: 0}
SMEMBERS large:orders:ids
  → SMEMBERS large:order_items:order:{oid}
    → HGET product_id / quantity  → cộng dồn
→ table.sort() → lấy top 5
```

| | Phương pháp |
|---|---|
| MySQL | GROUP BY + ORDER BY + LIMIT push-down, index on `product_id` |
| Redis | Full scan products + orders + items → Lua accumulate → sort → top N |

---

### Q5 — Anti-join / NOT IN  (`test5.py`, 50 iterations)

**MySQL:**
```sql
SELECT c.customer_id, c.first_name, c.last_name
FROM sales.large_customers c
WHERE c.customer_id NOT IN (
    SELECT DISTINCT customer_id
    FROM sales.large_orders
    WHERE customer_id IS NOT NULL
);
```

**Redis (Lua):**
```
SMEMBERS large:customers:ids
  → SMEMBERS large:orders:customer:{cid}
    → nếu rỗng: HGET first_name / last_name  → thêm vào kết quả
```

| | Phương pháp |
|---|---|
| MySQL | NOT IN subquery → optimizer chuyển sang anti-join |
| Redis | SMEMBERS per customer → kiểm tra set orders có rỗng không |

> **Lưu ý:** 200 customers không có đơn hàng đảm bảo Q5 luôn trả về kết quả thực.

---

## Phương pháp đo lường

- **MySQL**: Stored procedure với `SYSDATE(6)` — đo engine-side time (độ chính xác microsecond).
- **Redis**: Lua script + `CONFIG RESETSTAT` + `INFO commandstats` — tổng `usec` của các lệnh liên quan.
- **Warm-up**: 1 iteration trước khi đo chính thức (loại bỏ chi phí kết nối/script-load).
- Chỉ đo thời gian phía engine — không tính network/client overhead.

---

## Kết quả dự kiến

| Query | MySQL | Redis | Nhận xét |
|-------|-------|-------|---------|
| Q1 (simple select+sort) | ~tương đương | ~tương đương | Redis có set index sẵn, MySQL có B-tree index |
| Q2 (3-table JOIN) | **Nhanh hơn** | Chậm hơn | MySQL native JOIN vs Redis manual join |
| Q3 (GROUP BY+SUM) | **Nhanh hơn đáng kể** | Chậm hơn nhiều | Redis phải scan toàn bộ cây key (~90k keys) |
| Q4 (Top-N) | **Nhanh hơn đáng kể** | Chậm hơn nhiều | MySQL LIMIT push-down; Redis scan all |
| Q5 (anti-join) | **Nhanh hơn** | Chậm hơn | MySQL optimizer vs Redis SMEMBERS per customer |
