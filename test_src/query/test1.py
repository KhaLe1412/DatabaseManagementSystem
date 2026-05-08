"""
TEST 1 — QUERY PROCESSING  (Large Data)
Q1: Simple SELECT + ORDER BY
Goal: Lay tat ca san pham thuoc category_id=6, sap xep theo list_price giam dan.

MySQL:  SELECT product_id, product_name, list_price
        FROM production.large_products
        WHERE category_id = 6
        ORDER BY list_price DESC;

Redis:  SMEMBERS large:products:category:6
        -> HGET list_price cho tung id -> sort thu cong bang Lua

Dataset: ~5 000 products (~500 san pham moi category)
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


def test_q1_simple_select_sort(category_id: int = 6, iterations: int = 100):
    print("\n" + "=" * 70)
    print(f"TEST 1: SIMPLE SELECT + ORDER BY  (category_id = {category_id})")
    print(f"Query : SELECT ... FROM production.large_products")
    print(f"        WHERE category_id = {category_id} ORDER BY list_price DESC")
    print(f"Data  : ~5 000 products (~500/category)")
    print(f"Iters : {iterations}  |  Engine-side time only")
    print("=" * 70)

    # ── MYSQL ────────────────────────────────────────────────────────────────
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()

    sp = """
    CREATE PROCEDURE lq1_mysql(IN p_cat INT, IN p_iters INT, OUT p_sec DECIMAL(12,6))
    BEGIN
        DECLARE v0 TIMESTAMP(6);
        DECLARE v1 TIMESTAMP(6);
        DECLARE i  INT DEFAULT 0;
        DECLARE d  TEXT;
        SET v0 = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(CONCAT(product_id,'|',list_price) ORDER BY list_price DESC)
            INTO d
            FROM production.large_products
            WHERE category_id = p_cat;
            SET i = i + 1;
        END WHILE;
        SET v1 = SYSDATE(6);
        SET p_sec = TIMESTAMPDIFF(MICROSECOND, v0, v1) / 1000000.0;
    END
    """
    cur.execute("DROP PROCEDURE IF EXISTS lq1_mysql;")
    cur.execute(sp)
    cur.execute("SET SESSION group_concat_max_len = 1048576;")
    cur.execute("CALL lq1_mysql(%s, %s, @t)", (category_id, iterations))
    while cur.nextset():
        pass
    cur.execute("SELECT @t")
    mysql_time = float(cur.fetchone()[0])
    cur.close()
    conn.close()

    per_ms = mysql_time / iterations * 1000
    print(f"--- MySQL (SELECT + ORDER BY, B-tree index on category_id) ---")
    print(f"    Total : {mysql_time:.4f}s  |  Per-iter : {per_ms:.3f} ms")

    # ── REDIS ─────────────────────────────────────────────────────────────────
    r = redis.Redis(**REDIS_CONFIG)

    LUA = """
    local cat_key = KEYS[1]
    local iters   = tonumber(ARGV[1])
    for _ = 1, iters do
        local pids = redis.call('SMEMBERS', cat_key)
        local rows = {}
        for _, pid in ipairs(pids) do
            local price = redis.call('HGET', 'large:product:' .. pid, 'list_price')
            table.insert(rows, {tonumber(price or '0'), pid})
        end
        table.sort(rows, function(a, b) return a[1] > b[1] end)
    end
    return "DONE"
    """
    script  = r.register_script(LUA)
    cat_key = f"large:products:category:{category_id}"

    r.ping()
    script(keys=[cat_key], args=[1])            # warm-up

    r.execute_command("CONFIG RESETSTAT")
    script(keys=[cat_key], args=[iterations])
    stats = r.info("commandstats")

    redis_usecs = sum(_cmd_usec(stats, c) for c in ("eval", "evalsha", "smembers", "hget"))
    redis_time  = redis_usecs / 1_000_000
    per_ms_r    = redis_time / iterations * 1000
    print(f"--- Redis (SMEMBERS -> HGET list_price -> Lua sort) ---")
    print(f"    Total : {redis_time:.4f}s  |  Per-iter : {per_ms_r:.3f} ms")

    _print_winner(mysql_time, redis_time)


def _print_winner(mysql_t: float, redis_t: float):
    print()
    if mysql_t <= redis_t:
        print(f">>> MySQL nhanh hon {redis_t / mysql_t:.2f}x so voi Redis")
    else:
        print(f">>> Redis nhanh hon {mysql_t / redis_t:.2f}x so voi MySQL")


if __name__ == "__main__":
    test_q1_simple_select_sort(category_id=6, iterations=100)
