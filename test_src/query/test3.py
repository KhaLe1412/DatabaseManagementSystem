"""
TEST 3 — QUERY PROCESSING  (Large Data)
Q3: GROUP BY + SUM — Doanh thu theo tung cua hang
Goal: Tinh tong doanh thu va so don hang cho moi store, sap xep giam dan.

MySQL:  SELECT s.store_name,
               COUNT(DISTINCT o.order_id) AS total_orders,
               SUM(oi.quantity * oi.list_price * (1 - oi.discount)) AS revenue
        FROM sales.large_stores s
        JOIN sales.large_orders     o  ON s.store_id = o.store_id
        JOIN sales.large_order_items oi ON o.order_id = oi.order_id
        GROUP BY s.store_name
        ORDER BY revenue DESC;

Redis:  Quet toan bo stores -> orders tung store -> items tung order -> cong don
        (mo phong GROUP BY + SUM bang Lua, khong co native aggregate)

Dataset: 10 stores | 30 000 orders | ~90 000 order_items
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


def test_q3_group_by_aggregate(iterations: int = 10):
    print("\n" + "=" * 70)
    print("TEST 3: GROUP BY + SUM  (Doanh thu theo cua hang)")
    print("Query : SELECT store_name, COUNT(orders), SUM(revenue)")
    print("        FROM large_stores JOIN large_orders JOIN large_order_items")
    print("        GROUP BY store_name ORDER BY revenue DESC")
    print(f"Data  : 10 stores | 30 000 orders | ~90 000 order_items")
    print(f"Iters : {iterations}  |  Engine-side time only")
    print("=" * 70)

    # ── MYSQL ────────────────────────────────────────────────────────────────
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur  = conn.cursor()

    sp = """
    CREATE PROCEDURE lq3_mysql(IN p_iters INT, OUT p_sec DECIMAL(12,6))
    BEGIN
        DECLARE v0 TIMESTAMP(6);
        DECLARE v1 TIMESTAMP(6);
        DECLARE i  INT DEFAULT 0;
        DECLARE d  TEXT;
        SET v0 = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(
                       CONCAT(store_name,':', ROUND(revenue,2)) ORDER BY revenue DESC
                   )
            INTO d
            FROM (
                SELECT s.store_name,
                       SUM(oi.quantity * oi.list_price * (1 - oi.discount)) AS revenue
                FROM sales.large_stores s
                JOIN sales.large_orders      o  ON s.store_id  = o.store_id
                JOIN sales.large_order_items oi ON o.order_id  = oi.order_id
                GROUP BY s.store_name
            ) AS sub;
            SET i = i + 1;
        END WHILE;
        SET v1 = SYSDATE(6);
        SET p_sec = TIMESTAMPDIFF(MICROSECOND, v0, v1) / 1000000.0;
    END
    """
    cur.execute("DROP PROCEDURE IF EXISTS lq3_mysql;")
    cur.execute(sp)
    cur.execute("SET SESSION group_concat_max_len = 1048576;")
    cur.execute("CALL lq3_mysql(%s, @t)", (iterations,))
    while cur.nextset():
        pass
    cur.execute("SELECT @t")
    mysql_time = float(cur.fetchone()[0])
    cur.close()
    conn.close()

    per_ms = mysql_time / iterations * 1000
    print(f"--- MySQL (3-table JOIN + GROUP BY + SUM + ORDER BY) ---")
    print(f"    Total : {mysql_time:.4f}s  |  Per-iter : {per_ms:.3f} ms")

    # ── REDIS ─────────────────────────────────────────────────────────────────
    r = redis.Redis(**REDIS_CONFIG)

    LUA = """
    local iters = tonumber(ARGV[1])
    for _ = 1, iters do
        local sids = redis.call('SMEMBERS', 'large:stores:ids')
        local rows = {}
        for _, sid in ipairs(sids) do
            local name    = redis.call('HGET', 'large:store:' .. sid, 'store_name')
            local oids    = redis.call('SMEMBERS', 'large:orders:store:' .. sid)
            local revenue = 0
            for _, oid in ipairs(oids) do
                local iids = redis.call('SMEMBERS', 'large:order_items:order:' .. oid)
                for _, iid in ipairs(iids) do
                    local key = 'large:order_item:' .. oid .. ':' .. iid
                    local q   = tonumber(redis.call('HGET', key, 'quantity')   or 0)
                    local p   = tonumber(redis.call('HGET', key, 'list_price') or 0)
                    local d   = tonumber(redis.call('HGET', key, 'discount')   or 0)
                    revenue = revenue + (q * p * (1 - d))
                end
            end
            table.insert(rows, {revenue, #oids, name})
        end
        table.sort(rows, function(a, b) return a[1] > b[1] end)
    end
    return "DONE"
    """
    script = r.register_script(LUA)

    r.ping()
    # Khong chay warm-up de tranh timeout (Lua chay lau voi 90k keys)
    r.execute_command("CONFIG RESETSTAT")
    script(args=[iterations])
    stats = r.info("commandstats")

    redis_usecs = sum(
        _cmd_usec(stats, c) for c in ("eval", "evalsha", "smembers", "hget")
    )
    redis_time = redis_usecs / 1_000_000
    per_ms_r   = redis_time / iterations * 1000
    print(f"--- Redis (SMEMBERS stores->orders->items + Lua sum + sort) ---")
    print(f"    Total : {redis_time:.4f}s  |  Per-iter : {per_ms_r:.3f} ms")

    _print_winner(mysql_time, redis_time)


def _print_winner(mysql_t: float, redis_t: float):
    print()
    if mysql_t <= redis_t:
        print(f">>> MySQL nhanh hon {redis_t / mysql_t:.2f}x so voi Redis")
    else:
        print(f">>> Redis nhanh hon {mysql_t / redis_t:.2f}x so voi MySQL")
    print("    (MySQL co query optimizer va native aggregate;")
    print("     Redis phai duyet thu cong toan bo cay key — bat loi ro o Q3)")


if __name__ == "__main__":
    test_q3_group_by_aggregate(iterations=10)
