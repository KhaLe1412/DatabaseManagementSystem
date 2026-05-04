# Concurrency Tests — MySQL vs Redis

Bộ test so sánh cơ chế xử lý đồng thời giữa **MySQL (InnoDB)** và **Redis** trên dataset Sales Transactions (536K records).

---

## Cấu hình môi trường

| Thành phần              | Giá trị            |
| ----------------------- | ------------------ |
| MySQL host              | `127.0.0.1:3306`   |
| MySQL database          | `sales_benchmark`  |
| Redis host              | `localhost:6379`   |
| Tổng số transactions    | 536,295            |
| Connection pool (MySQL) | tối đa 32          |
| Connection pool (Redis) | `num_threads + 10` |

### Các bảng MySQL cần có

| Bảng            | Mô tả                                  |
| --------------- | -------------------------------------- |
| `transactions`  | Dữ liệu giao dịch bán hàng (536K rows) |
| `product_stock` | Tồn kho sản phẩm, dùng cho write tests |
| `lock_test`     | 3 rows dùng để kiểm tra cơ chế locking |
| `account_mvcc`  | 1 row `balance` dùng để kiểm tra MVCC  |

---

## Danh sách các bài test

### TEST 1 — Read Scale Test (Threads vs Throughput)

**Mục tiêu:** Đo throughput đọc khi tăng số luồng đồng thời.

**Cách thực hiện:**

- Mỗi luồng thực hiện 500 lần đọc ngẫu nhiên
- MySQL: `SELECT * FROM transactions WHERE id = ?`
- Redis: `HGETALL transaction:{id}`
- Số luồng: `[1, 2, 3, 4, 5, 10, 20, 30]`

**Kết quả mong đợi:** MySQL tăng throughput tốt theo số luồng nhờ multi-threading; Redis đạt đỉnh sớm hơn do single-threaded event loop.

---

### TEST 2 — Write Scale Test (Threads vs Throughput)

**Mục tiêu:** Đo throughput ghi khi tăng số luồng đồng thời.

**Cách thực hiện:**

- Mỗi luồng thực hiện 50 lần ghi
- MySQL: `UPDATE product_stock SET quantity = quantity - 1` (kèm `COMMIT`)
- Redis: `HINCRBY stock:{id} quantity -1`
- Số luồng: `[1, 2, 3, 4, 5, 10, 20, 30]`
- Reset stock về 1,000,000 trước mỗi lượt đo

**Kết quả mong đợi:** Redis nhanh hơn nhiều lần vì ghi vào RAM, không cần disk commit, không có row lock.

---

### TEST 3 — Mixed Read-Write Scale Test (Varying Ratio)

**Mục tiêu:** Đo throughput và độ trễ P95 ở các tỷ lệ đọc/ghi khác nhau.

**Cách thực hiện:**

- 3 luồng, 500 ops/luồng
- 5 tỷ lệ R/W: `100/0`, `90/10`, `50/50`, `10/90`, `0/100`
- MySQL: đọc từ `transactions`, ghi vào `product_stock`
- Redis: đọc/ghi `stock:{id}`
- Đo throughput (ops/s) và P95 latency (ms)

**Kết quả mong đợi:** Redis thắng ở mọi tỷ lệ; MySQL cạnh tranh hơn khi read chiếm đa số nhờ InnoDB buffer pool.

---

### TEST 4 — Multiple Shared Locks (FOR SHARE) — Compatible

**Mục tiêu:** Kiểm tra tính tương thích của S-Lock (Shared Lock).

**Cách thực hiện:**

- 3 transaction song song cùng thực hiện `SELECT ... FOR SHARE` trên row `id=1`
- Dùng `threading.Barrier` để đồng bộ cả 3 luồng bắt đầu cùng lúc
- Đo thời gian mỗi transaction lấy được lock

**Kết quả mong đợi:** Cả 3 lấy được S-Lock gần như đồng thời vì S-Lock tương thích với nhau.

---

### TEST 5 — Shared Lock Blocks Exclusive Lock

**Mục tiêu:** Kiểm tra rằng S-Lock ngăn X-Lock (Exclusive Lock).

**Cách thực hiện:**

- T1: `SELECT ... FOR SHARE` giữ lock trong 2 giây
- T2: `SELECT ... FOR UPDATE` yêu cầu X-Lock sau khi T1 đã lock
- Đo thời gian T2 phải chờ

**Kết quả mong đợi:** T2 bị chặn khoảng 2 giây cho đến khi T1 `COMMIT`.

---

### TEST 6 — Exclusive Lock Blocks Shared Lock

**Mục tiêu:** Kiểm tra rằng X-Lock ngăn cả S-Lock.

**Cách thực hiện:**

- T1: `SELECT ... FOR UPDATE` giữ X-Lock trong 2 giây
- T2: `SELECT ... FOR SHARE` yêu cầu S-Lock sau khi T1 đã lock
- Đo thời gian T2 phải chờ

**Kết quả mong đợi:** T2 bị chặn khoảng 2 giây — X-Lock chặn tất cả các loại lock khác.

---

### TEST 7 — Exclusive Lock Blocks Exclusive Lock

**Mục tiêu:** Kiểm tra rằng chỉ có duy nhất một X-Lock tồn tại tại một thời điểm.

**Cách thực hiện:**

- T1: `SELECT ... FOR UPDATE` giữ X-Lock trong 2 giây
- T2: `SELECT ... FOR UPDATE` yêu cầu X-Lock ngay sau khi T1 lock
- Đo thời gian T2 phải chờ

**Kết quả mong đợi:** T2 chờ ~2 giây, lấy được X-Lock sau khi T1 `COMMIT`.

---

### TEST 8 — MVCC: Repeatable Read — Consistent Snapshot

**Mục tiêu:** Minh họa cơ chế snapshot isolation của MVCC trong MySQL.

**Cách thực hiện:**

- `balance` khởi tạo = 1000
- Reader (`REPEATABLE READ`): đọc balance 3 lần (trước/sau/sau khi Writer commit)
- Writer: `UPDATE balance = 500` và `COMMIT` giữa lần đọc 1 và 2 của Reader
- Isolation level: `REPEATABLE READ`

**Kết quả mong đợi:** Reader luôn thấy 1000 (snapshot lúc bắt đầu transaction); DB thực tế là 500.

---

### TEST 9 — MVCC: Multiple Readers — Different Snapshots

**Mục tiêu:** Minh họa nhiều reader thấy các phiên bản dữ liệu khác nhau tùy thời điểm bắt đầu transaction.

**Cách thực hiện:**

- `balance` khởi tạo = 1000
- R1 bắt đầu → W1 update 800 → R2 bắt đầu → W2 update 600 → R3 bắt đầu
- Mỗi reader đọc lại balance sau khi tất cả writer đã commit

**Kết quả mong đợi:**

| Reader | Snapshot         | Giá trị thấy |
| ------ | ---------------- | ------------ |
| R1     | Trước W1         | 1000         |
| R2     | Sau W1, trước W2 | 800          |
| R3     | Sau W2           | 600          |

MySQL duy trì **version chain**: `v3(600) ← v2(800) ← v1(1000)`.

---

### TEST 10 — Deadlock Detection in MySQL

**Mục tiêu:** Kiểm tra cơ chế phát hiện và xử lý deadlock của MySQL.

**Cách thực hiện:**

- T1: Lock `LOCK_A` → đợi 0.5s → cố lock `LOCK_B`
- T2: Lock `LOCK_B` → cố lock `LOCK_A`
- Tạo circular wait: T1 chờ T2, T2 chờ T1

**Kết quả mong đợi:** MySQL tự phát hiện deadlock và rollback 1 trong 2 transaction, transaction còn lại hoàn thành bình thường.

> **Redis:** Không thể xảy ra deadlock do single-threaded — mọi lệnh được xử lý tuần tự.

---

### TEST 11 — Redis Lua Script Atomicity

**Mục tiêu:** Kiểm tra tính nguyên tử (atomicity) của Lua script trong Redis khi nhiều luồng cùng trừ tồn kho.

**Lua script:**

```lua
local qty = tonumber(redis.call('GET', KEYS[1]))
if qty == nil then return -2 end
if qty <= 0   then return -1 end
return redis.call('DECRBY', KEYS[1], tonumber(ARGV[1]))
```

**Cách thực hiện:**

- Stock khởi tạo = 100
- 10 luồng × 15 ops = 150 yêu cầu trừ 1 đơn vị
- Kiểm tra: đúng 100 ops thành công, 50 ops bị từ chối, stock cuối = 0

**Kết quả mong đợi:** Không xảy ra oversell (stock < 0), tổng số thành công = 100, Lua script thực thi atomic.

---

## Tổng kết

| Tiêu chí          | MySQL                                                  | Redis                                   |
| ----------------- | ------------------------------------------------------ | --------------------------------------- |
| Read concurrency  | Scale tốt với nhiều luồng (multi-threaded)             | Đạt đỉnh sớm, ổn định (single-threaded) |
| Write concurrency | Chậm hơn do disk commit + row lock                     | Nhanh hơn nhiều lần nhờ ghi RAM         |
| Mixed workload    | Cạnh tranh khi read chiếm đa số                        | Thắng ở mọi tỷ lệ R/W                   |
| Locking           | S-Lock tương thích; X-Lock chặn tất cả                 | Không có cơ chế lock truyền thống       |
| MVCC              | Snapshot isolation, readers không bị block bởi writers | Không hỗ trợ MVCC                       |
| Deadlock          | Tự phát hiện và rollback                               | Không thể xảy ra (single-threaded)      |
| Atomicity         | Transaction ACID                                       | Lua script atomic                       |
