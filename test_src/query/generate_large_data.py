"""
generate_large_data.py — Sinh dữ liệu lớn cho benchmark hiệu năng Query Processing

Tạo dataset tổng hợp ~30× lớn hơn BikeStores mặc định:
  • 10  stores   (large:store:{id})
  • 10  categories, 10 brands
  • 5 000 products (large:product:{id})
  • 5 000 customers (large:customer:{id})
  • 30 000 orders  (large:order:{id})   → ~20× BikeStores
  • 90 000 order_items                   → ~19× BikeStores

MySQL: bảng large_* trong schema production / sales (trong sales_benchmark)
Redis: key prefix  large:*

Chạy lệnh:
    python generate_large_data.py
"""
import random
import time
import mysql.connector
import redis

MYSQL_CONFIG = {
    'host': '127.0.0.1', 'port': 3307, 'user': 'root',
    'password': '123456', 'database': 'sales_benchmark',
}
REDIS_CONFIG = {
    'host': '127.0.0.1', 'port': 6379, 'password': None, 'decode_responses': True,
}

# ── Kích thước dataset ────────────────────────────────────────────────────────
N_STORES     = 10
N_CATEGORIES = 10
N_BRANDS     = 10
N_PRODUCTS   = 5_000
N_CUSTOMERS  = 5_000
N_ORDERS     = 30_000
AVG_ITEMS    = 3       # số dòng hàng trung bình mỗi đơn
# Đảm bảo một số khách chưa có đơn (để Q5 có kết quả thực)
N_CUSTOMERS_NO_ORDER = 200

BATCH = 500            # kích thước mỗi batch insert


# ─────────────────────────────────────────────────────────────────────────────
# MySQL helpers
# ─────────────────────────────────────────────────────────────────────────────

def _create_mysql_tables(cur, conn):
    ddl = """
    CREATE TABLE IF NOT EXISTS production.large_products (
        product_id   INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        brand_id     INT          NOT NULL,
        category_id  INT          NOT NULL,
        model_year   SMALLINT     NOT NULL,
        list_price   DECIMAL(10,2) NOT NULL,
        INDEX idx_lp_cat (category_id),
        INDEX idx_lp_brand (brand_id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS sales.large_stores (
        store_id   INT AUTO_INCREMENT PRIMARY KEY,
        store_name VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS sales.large_customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name  VARCHAR(50),
        last_name   VARCHAR(50)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS sales.large_orders (
        order_id     INT AUTO_INCREMENT PRIMARY KEY,
        customer_id  INT          NOT NULL,
        order_status TINYINT      NOT NULL DEFAULT 4,
        order_date   DATE         NOT NULL,
        store_id     INT          NOT NULL,
        INDEX idx_lo_store    (store_id),
        INDEX idx_lo_customer (customer_id)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS sales.large_order_items (
        order_id   INT            NOT NULL,
        item_id    INT            NOT NULL,
        product_id INT            NOT NULL,
        quantity   INT            NOT NULL,
        list_price DECIMAL(10,2)  NOT NULL,
        discount   DECIMAL(4,2)   NOT NULL,
        PRIMARY KEY (order_id, item_id),
        INDEX idx_loi_product (product_id)
    ) ENGINE=InnoDB;
    """
    for stmt in ddl.strip().split(";"):
        stmt = stmt.strip()
        if stmt:
            cur.execute(stmt)
    conn.commit()
    print("✅ MySQL: Các bảng large_* đã được tạo.")


def _truncate_mysql_tables(cur, conn):
    for t in [
        "sales.large_order_items",
        "sales.large_orders",
        "sales.large_customers",
        "sales.large_stores",
        "production.large_products",
    ]:
        cur.execute(f"TRUNCATE TABLE {t};")
    conn.commit()
    print("🔄 MySQL: Đã xoá dữ liệu cũ trong bảng large_*.")


def _batch_insert(cur, conn, sql: str, rows: list):
    for i in range(0, len(rows), BATCH):
        cur.executemany(sql, rows[i : i + BATCH])
    conn.commit()


def load_mysql(rng: random.Random):
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur  = conn.cursor()

    _create_mysql_tables(cur, conn)
    _truncate_mysql_tables(cur, conn)

    t0 = time.time()

    # ── Stores ────────────────────────────────────────────────────────────────
    stores = [(f"Large Store {i}",) for i in range(1, N_STORES + 1)]
    _batch_insert(cur, conn, "INSERT INTO sales.large_stores (store_name) VALUES (%s)", stores)
    store_ids = list(range(1, N_STORES + 1))
    print(f"  MySQL: Đã nạp {N_STORES} stores.")

    # ── Products ──────────────────────────────────────────────────────────────
    PRICE_POOLS = [299.99, 499.99, 799.99, 1299.99, 1999.99, 3499.99, 5999.99]
    products = [
        (
            f"LargeBike {i} - {rng.choice(['Trail','Road','Mountain','BMX','Gravel'])}",
            rng.randint(1, N_BRANDS),
            rng.randint(1, N_CATEGORIES),
            rng.randint(2019, 2024),
            round(rng.choice(PRICE_POOLS) + rng.uniform(-50, 50), 2),
        )
        for i in range(1, N_PRODUCTS + 1)
    ]
    _batch_insert(
        cur, conn,
        "INSERT INTO production.large_products (product_name,brand_id,category_id,model_year,list_price) VALUES (%s,%s,%s,%s,%s)",
        products,
    )
    product_ids = list(range(1, N_PRODUCTS + 1))
    print(f"  MySQL: Đã nạp {N_PRODUCTS} products.")

    # ── Customers ─────────────────────────────────────────────────────────────
    FIRST = ["An","Binh","Cuong","Dung","Em","Phuong","Giang","Hoa","Khoa","Lan"]
    LAST  = ["Nguyen","Tran","Le","Pham","Hoang","Vu","Do","Bui","Dang","Dinh"]
    customer_names = [
        (rng.choice(FIRST), rng.choice(LAST))
        for _ in range(N_CUSTOMERS)
    ]
    _batch_insert(
        cur, conn,
        "INSERT INTO sales.large_customers (first_name, last_name) VALUES (%s,%s)",
        customer_names,
    )
    # Tất cả customer_id từ 1 → N_CUSTOMERS; N_CUSTOMERS_NO_ORDER cuối không có đơn
    customers_with_orders = list(range(1, N_CUSTOMERS - N_CUSTOMERS_NO_ORDER + 1))
    print(f"  MySQL: Đã nạp {N_CUSTOMERS} customers "
          f"({N_CUSTOMERS_NO_ORDER} sẽ không có đơn hàng — dành cho Q5).")

    # ── Orders + Order_items ───────────────────────────────────────────────────
    DISCOUNTS  = [0.00, 0.05, 0.10, 0.15, 0.20, 0.25]
    order_rows = []
    item_rows  = []

    for oid in range(1, N_ORDERS + 1):
        cid   = rng.choice(customers_with_orders)
        sid   = rng.choice(store_ids)
        month = rng.randint(1, 12)
        day   = rng.randint(1, 28)
        odate = f"202{rng.randint(0,4)}-{month:02d}-{day:02d}"
        order_rows.append((cid, 4, odate, sid))

        n_items = max(1, int(rng.gauss(AVG_ITEMS, 1)))
        for iid in range(1, n_items + 1):
            pid   = rng.choice(product_ids)
            # price lấy từ products list để nhất quán (dùng list_price định nghĩa trước)
            price = products[pid - 1][4]
            disc  = rng.choice(DISCOUNTS)
            qty   = rng.randint(1, 5)
            item_rows.append((oid, iid, pid, qty, round(price, 2), disc))

    _batch_insert(
        cur, conn,
        "INSERT INTO sales.large_orders (customer_id,order_status,order_date,store_id) VALUES (%s,%s,%s,%s)",
        order_rows,
    )
    _batch_insert(
        cur, conn,
        "INSERT INTO sales.large_order_items (order_id,item_id,product_id,quantity,list_price,discount) VALUES (%s,%s,%s,%s,%s,%s)",
        item_rows,
    )
    elapsed = time.time() - t0
    print(f"  MySQL: Đã nạp {N_ORDERS} orders, {len(item_rows)} order_items.  [{elapsed:.1f}s]")

    cur.close()
    conn.close()
    print(f"✅ MySQL large data load hoàn tất ({elapsed:.1f}s)\n")

    return product_ids, store_ids, customers_with_orders, order_rows, item_rows, products, customer_names


# ─────────────────────────────────────────────────────────────────────────────
# Redis helpers
# ─────────────────────────────────────────────────────────────────────────────

def _flush_large_keys(r: redis.Redis):
    """Xoá toàn bộ key có prefix 'large:' bằng SCAN để tránh FLUSHALL."""
    deleted = 0
    cursor  = 0          # integer, không phải string "0"
    while True:
        cursor, keys = r.scan(cursor=cursor, match="large:*", count=200)
        if keys:
            r.delete(*keys)
            deleted += len(keys)
        if cursor == 0:
            break
    print(f"🔄 Redis: Đã xoá {deleted} key cũ với prefix 'large:'.")


def load_redis(rng: random.Random, product_ids, store_ids,
               customers_with_orders, order_rows, item_rows, products, customer_names):
    r    = redis.Redis(**REDIS_CONFIG)
    pipe = r.pipeline()
    ops  = 0

    _flush_large_keys(r)
    t0 = time.time()

    # ── Stores ────────────────────────────────────────────────────────────────
    for sid in store_ids:
        key = f"large:store:{sid}"
        pipe.hset(key, mapping={"store_id": sid, "store_name": f"Large Store {sid}"})
        pipe.sadd("large:stores:ids", sid)
        ops += 2
        if ops >= BATCH:
            pipe.execute(); pipe = r.pipeline(); ops = 0
    pipe.execute(); pipe = r.pipeline(); ops = 0
    print(f"  Redis: Đã nạp {N_STORES} stores.")

    # ── Products ──────────────────────────────────────────────────────────────
    for pid in product_ids:
        p   = products[pid - 1]
        key = f"large:product:{pid}"
        pipe.hset(key, mapping={
            "product_id":   pid,
            "product_name": p[0],
            "brand_id":     p[1],
            "category_id":  p[2],
            "model_year":   p[3],
            "list_price":   p[4],
        })
        pipe.sadd("large:products:ids", pid)
        pipe.sadd(f"large:products:category:{p[2]}", pid)
        ops += 3
        if ops >= BATCH:
            pipe.execute(); pipe = r.pipeline(); ops = 0
    pipe.execute(); pipe = r.pipeline(); ops = 0
    print(f"  Redis: Đã nạp {N_PRODUCTS} products.")

    # ── Customers — dùng cùng danh sách tên đã sinh cho MySQL ───────────────────
    for cid in range(1, N_CUSTOMERS + 1):
        fname, lname = customer_names[cid - 1]
        key = f"large:customer:{cid}"
        pipe.hset(key, mapping={
            "customer_id": cid,
            "first_name":  fname,
            "last_name":   lname,
        })
        pipe.sadd("large:customers:ids", cid)
        ops += 2
        if ops >= BATCH:
            pipe.execute(); pipe = r.pipeline(); ops = 0
    pipe.execute(); pipe = r.pipeline(); ops = 0
    print(f"  Redis: Đã nạp {N_CUSTOMERS} customers.")

    # ── Orders + Order_items ───────────────────────────────────────────────────
    DISCOUNTS = [0.00, 0.05, 0.10, 0.15, 0.20, 0.25]
    item_idx  = 0
    for oid_idx, (cid, status, odate, sid) in enumerate(order_rows, start=1):
        pipe.hset(f"large:order:{oid_idx}", mapping={
            "order_id":     oid_idx,
            "customer_id":  cid,
            "order_status": status,
            "order_date":   odate,
            "store_id":     sid,
        })
        pipe.sadd("large:orders:ids",                 oid_idx)
        pipe.sadd(f"large:orders:store:{sid}",         oid_idx)
        pipe.sadd(f"large:orders:customer:{cid}",      oid_idx)
        ops += 4

        # Ghi order_items tương ứng
        while item_idx < len(item_rows) and item_rows[item_idx][0] == oid_idx:
            row = item_rows[item_idx]
            _, iid, pid, qty, price, disc = row
            pipe.hset(f"large:order_item:{oid_idx}:{iid}", mapping={
                "order_id":   oid_idx,
                "item_id":    iid,
                "product_id": pid,
                "quantity":   qty,
                "list_price": price,
                "discount":   disc,
            })
            pipe.sadd(f"large:order_items:order:{oid_idx}", iid)
            ops += 2
            item_idx += 1

        if ops >= BATCH:
            pipe.execute(); pipe = r.pipeline(); ops = 0

    pipe.execute()

    elapsed = time.time() - t0
    print(f"  Redis: Đã nạp {N_ORDERS} orders, {len(item_rows)} order_items.  [{elapsed:.1f}s]")
    print(f"✅ Redis large data load hoàn tất ({elapsed:.1f}s)\n")


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    rng = random.Random(42)     # seed cố định để kết quả tái lập được

    print("=" * 60)
    print("🚀 SINH DỮ LIỆU LỚN CHO QUERY BENCHMARK")
    print(f"   Products  : {N_PRODUCTS:,}")
    print(f"   Customers : {N_CUSTOMERS:,}  ({N_CUSTOMERS_NO_ORDER} chưa có đơn)")
    print(f"   Orders    : {N_ORDERS:,}")
    print(f"   Items ≈   : {N_ORDERS * AVG_ITEMS:,}")
    print("=" * 60)

    print("\n[1/2] Nạp vào MySQL...")
    product_ids, store_ids, cust_with_orders, order_rows, item_rows, products, customer_names = load_mysql(rng)

    print("[2/2] Nạp vào Redis (dùng cùng dữ liệu đã sinh cho MySQL)...")
    load_redis(rng, product_ids, store_ids, cust_with_orders, order_rows, item_rows, products, customer_names)

    print("=" * 60)
    print("✅ Hoàn tất!  Chạy `python test_large_data.py` để benchmark.")
    print("=" * 60)


if __name__ == "__main__":
    main()
