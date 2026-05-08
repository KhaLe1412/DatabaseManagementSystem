"""
TEST 2 — QUERY PROCESSING  (Large Data)
Q2: JOIN 3 bang — Chi tiet don hang kem ten san pham
Goal: Lay toan bo dong hang cua don order_id=1, gom ten san pham,
      so luong, don gia, chiet khau va thanh tien.

MySQL:  SELECT o.order_id, p.product_name,
               oi.quantity, oi.list_price, oi.discount,
               (oi.quantity * oi.list_price * (1 - oi.discount)) AS line_total
        FROM sales.large_orders o
        JOIN sales.large_order_items oi ON o.order_id = oi.order_id
        JOIN production.large_products p ON oi.product_id = p.product_id
        WHERE o.order_id = 1;

Redis:  SMEMBERS large:order_items:order:1
        -> HGETALL large:order_item:1:{iid}
        -> HGET large:product:{pid} product_name
        (mo phong JOIN thu cong bang Lua)

Dataset: 30 000 orders, ~90 000 order_items, 5 000 products
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


def test_q2_join(order_id: int = 1, iterations: int = 500):
    print("\n" + "=" * 70)
    print(f"TEST 2: 3-TABLE JOIN  (order_id = {order_id})")
    print(f"Query : SELECT ... FROM large_orders JOIN large_order_items JOIN large_products")
    print(f"        WHERE order_id = {order_id}")
    print(f"Data  : 30 000 orders | ~90 000 order_items | 5 000 products")
    print(f"Iters : {iterations}  |  Engine-side time only")
    print("=" * 70)

    # ── MYSQL ────────────────────────────────────────────────────────────────
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur  = conn.cursor()

    sp = """
    CREATE PROCEDURE lq2_mysql(IN p_oid INT, IN p_iters INT, OUT p_sec DECIMAL(12,6))
    BEGIN
        DECLARE v0 TIMESTAMP(6);
        DECLARE v1 TIMESTAMP(6);
        DECLARE i  INT DEFAULT 0;
        DECLARE d  TEXT;
        SET v0 = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(
                       CONCAT(p.product_name,'|',oi.quantity,'|',
                              oi.list_price,'|',oi.discount,'|',
                              ROUND(oi.quantity*oi.list_price*(1-oi.discount),4))
                   )
            INTO d
            FROM sales.large_orders o
            JOIN sales.large_order_items  oi ON o.order_id   = oi.order_id
            JOIN production.large_products p ON oi.product_id = p.product_id
            WHERE o.order_id = p_oid;
            SET i = i + 1;
        END WHILE;
        SET v1 = SYSDATE(6);
        SET p_sec = TIMESTAMPDIFF(MICROSECOND, v0, v1) / 1000000.0;
    END
    """
    cur.execute("DROP PROCEDURE IF EXISTS lq2_mysql;")
    cur.execute(sp)
    cur.execute("SET SESSION group_concat_max_len = 1048576;")
    cur.execute("CALL lq2_mysql(%s, %s, @t)", (order_id, iterations))
    while cur.nextset():
        pass
    cur.execute("SELECT @t")
    mysql_time = float(cur.fetchone()[0])
    cur.close()
    conn.close()

    per_ms = mysql_time / iterations * 1000
    print(f"--- MySQL (3-table JOIN, FK indexes) ---")
    print(f"    Total : {mysql_time:.4f}s  |  Per-iter : {per_ms:.3f} ms")

    # ── REDIS ─────────────────────────────────────────────────────────────────
    r = redis.Redis(**REDIS_CONFIG)

    LUA = """
    local oid       = ARGV[1]
    local iters     = tonumber(ARGV[2])
    local items_key = 'large:order_items:order:' .. oid

    for _ = 1, iters do
        local iids = redis.call('SMEMBERS', items_key)
        for _, iid in ipairs(iids) do
            local item_key = 'large:order_item:' .. oid .. ':' .. iid
            local fields   = redis.call('HGETALL', item_key)
            local info = {}
            for j = 1, #fields, 2 do info[fields[j]] = fields[j+1] end
            local pname = redis.call('HGET', 'large:product:' .. (info.product_id or ''), 'product_name')
            local qty   = tonumber(info.quantity  or 0)
            local price = tonumber(info.list_price or 0)
            local disc  = tonumber(info.discount   or 0)
            local _total = qty * price * (1 - disc)
        end
    end
    return "DONE"
    """
    script    = r.register_script(LUA)
    order_str = str(order_id)

    r.ping()
    script(args=[order_str, 1])             # warm-up

    r.execute_command("CONFIG RESETSTAT")
    script(args=[order_str, iterations])
    stats = r.info("commandstats")

    redis_usecs = sum(_cmd_usec(stats, c) for c in ("eval", "evalsha", "smembers", "hgetall", "hget"))
    redis_time  = redis_usecs / 1_000_000
    per_ms_r    = redis_time / iterations * 1000
    print(f"--- Redis (SMEMBERS -> HGETALL item -> HGET product_name, manual JOIN) ---")
    print(f"    Total : {redis_time:.4f}s  |  Per-iter : {per_ms_r:.3f} ms")

    _print_winner(mysql_time, redis_time)


def _print_winner(mysql_t: float, redis_t: float):
    print()
    if mysql_t <= redis_t:
        print(f">>> MySQL nhanh hon {redis_t / mysql_t:.2f}x so voi Redis")
    else:
        print(f">>> Redis nhanh hon {mysql_t / redis_t:.2f}x so voi MySQL")


if __name__ == "__main__":
    test_q2_join(order_id=1, iterations=500)
