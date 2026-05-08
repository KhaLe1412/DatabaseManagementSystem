"""
TEST 4 — QUERY PROCESSING  (Large Data)
Q4: Top-N — 5 san pham ban chay nhat (theo tong so luong)
Goal: Tim 5 product_id co tong oi.quantity cao nhat tren tat ca don hang.

MySQL:  SELECT oi.product_id, SUM(oi.quantity) AS total_sold
        FROM sales.large_order_items oi
        GROUP BY oi.product_id
        ORDER BY total_sold DESC
        LIMIT 5;

Redis:  Quet toan bo orders -> order_items -> cong don qty theo product_id
        -> sort -> lay top 5  (khong co native LIMIT / GROUP BY)

Dataset: 5 000 products | ~90 000 order_items
"""
import mysql.connector
import redis

MYSQL_CONFIG = {
    'host': '127.0.0.1', 'port': 3307, 'user': 'root',
    'password': '123456', 'database': 'sales_benchmark',
}
REDIS_CONFIG = {
    'host': '127.0.0.1', 'port': 6379, 'password': None, 'decode_responses': True,
}


def _cmd_usec(stats: dict, cmd: str) -> int:
    return int(stats.get(f"cmdstat_{cmd}", {}).get("usec", 0))


def test_q4_top_n(top_n: int = 5, iterations: int = 10):
    print("\n" + "=" * 70)
    print(f"TEST 4: TOP-{top_n} BEST-SELLING PRODUCTS")
    print(f"Query : SELECT product_id, SUM(quantity) AS total_sold")
    print(f"        FROM large_order_items")
    print(f"        GROUP BY product_id ORDER BY total_sold DESC LIMIT {top_n}")
    print(f"Data  : 5 000 products | ~90 000 order_items")
    print(f"Iters : {iterations}  |  Engine-side time only")
    print("=" * 70)

    # ── MYSQL ────────────────────────────────────────────────────────────────
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur  = conn.cursor()

    sp = """
    CREATE PROCEDURE lq4_mysql(IN p_n INT, IN p_iters INT, OUT p_sec DECIMAL(12,6))
    BEGIN
        DECLARE v0 TIMESTAMP(6);
        DECLARE v1 TIMESTAMP(6);
        DECLARE i  INT DEFAULT 0;
        DECLARE d  TEXT;
        SET v0 = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(CONCAT(product_id,':', total_sold) ORDER BY total_sold DESC)
            INTO d
            FROM (
                SELECT oi.product_id, SUM(oi.quantity) AS total_sold
                FROM sales.large_order_items oi
                GROUP BY oi.product_id
                ORDER BY total_sold DESC
                LIMIT p_n
            ) AS top_n;
            SET i = i + 1;
        END WHILE;
        SET v1 = SYSDATE(6);
        SET p_sec = TIMESTAMPDIFF(MICROSECOND, v0, v1) / 1000000.0;
    END
    """
    cur.execute("DROP PROCEDURE IF EXISTS lq4_mysql;")
    cur.execute(sp)
    cur.execute("SET SESSION group_concat_max_len = 1048576;")
    cur.execute("CALL lq4_mysql(%s, %s, @t)", (top_n, iterations))
    while cur.nextset():
        pass
    cur.execute("SELECT @t")
    mysql_time = float(cur.fetchone()[0])
    cur.close()
    conn.close()

    per_ms = mysql_time / iterations * 1000
    print(f"--- MySQL (GROUP BY product_id + ORDER BY + LIMIT {top_n}) ---")
    print(f"    Total : {mysql_time:.4f}s  |  Per-iter : {per_ms:.3f} ms")

    # ── REDIS ─────────────────────────────────────────────────────────────────
    r = redis.Redis(**REDIS_CONFIG)

    LUA = """
    local top_n = tonumber(ARGV[1])
    local iters = tonumber(ARGV[2])

    for _ = 1, iters do
        local pids  = redis.call('SMEMBERS', 'large:products:ids')
        local sales = {}
        for _, pid in ipairs(pids) do sales[pid] = 0 end

        local oids = redis.call('SMEMBERS', 'large:orders:ids')
        for _, oid in ipairs(oids) do
            local iids = redis.call('SMEMBERS', 'large:order_items:order:' .. oid)
            for _, iid in ipairs(iids) do
                local key = 'large:order_item:' .. oid .. ':' .. iid
                local pid = redis.call('HGET', key, 'product_id')
                local qty = tonumber(redis.call('HGET', key, 'quantity') or 0)
                if pid and sales[pid] ~= nil then
                    sales[pid] = sales[pid] + qty
                end
            end
        end

        local sorted = {}
        for pid, qty in pairs(sales) do
            if qty > 0 then table.insert(sorted, {qty, pid}) end
        end
        table.sort(sorted, function(a, b) return a[1] > b[1] end)
        local result = {}
        for i = 1, math.min(top_n, #sorted) do
            result[i] = sorted[i][2] .. ':' .. sorted[i][1]
        end
    end
    return "DONE"
    """
    script = r.register_script(LUA)

    r.ping()
    r.execute_command("CONFIG RESETSTAT")
    script(args=[top_n, iterations])
    stats = r.info("commandstats")

    redis_usecs = sum(
        _cmd_usec(stats, c) for c in ("eval", "evalsha", "smembers", "hget")
    )
    redis_time = redis_usecs / 1_000_000
    per_ms_r   = redis_time / iterations * 1000
    print(f"--- Redis (full scan products+orders+items -> Lua accumulate -> sort -> top {top_n}) ---")
    print(f"    Total : {redis_time:.4f}s  |  Per-iter : {per_ms_r:.3f} ms")

    _print_winner(mysql_time, redis_time)


def _print_winner(mysql_t: float, redis_t: float):
    print()
    if mysql_t <= redis_t:
        print(f">>> MySQL nhanh hon {redis_t / mysql_t:.2f}x so voi Redis")
    else:
        print(f">>> Redis nhanh hon {mysql_t / redis_t:.2f}x so voi MySQL")
    print("    (Top-N can scan toan bo order_items — MySQL toi uu bang optimizer;")
    print("     Redis phai duyet thu cong tat ca key -> chenh lech tang theo data size)")


if __name__ == "__main__":
    test_q4_top_n(top_n=5, iterations=10)
