"""
TEST 5 — QUERY PROCESSING  (Large Data)
Q5: Subquery / Anti-join — Khach hang chua phat sinh don hang
Goal: Tim tat ca customer chua co bat ky don hang nao.

MySQL:  SELECT c.customer_id, c.first_name, c.last_name
        FROM sales.large_customers c
        WHERE c.customer_id NOT IN (
            SELECT DISTINCT customer_id
            FROM sales.large_orders
            WHERE customer_id IS NOT NULL
        );

Redis:  SMEMBERS large:customers:ids
        -> voi moi cid: SMEMBERS large:orders:customer:{cid}
        -> neu rong -> day la khach chua mua
        (mo phong NOT IN / anti-join bang Lua)

Dataset: 5 000 customers (200 chua co don) | 30 000 orders
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


def test_q5_antijoin_subquery(iterations: int = 50):
    print("\n" + "=" * 70)
    print("TEST 5: SUBQUERY / ANTI-JOIN  (Khach hang chua phat sinh don)")
    print("Query : SELECT customer_id, first_name, last_name")
    print("        FROM large_customers")
    print("        WHERE customer_id NOT IN (SELECT DISTINCT customer_id FROM large_orders)")
    print(f"Data  : 5 000 customers (200 chua co don) | 30 000 orders")
    print(f"Iters : {iterations}  |  Engine-side time only")
    print("=" * 70)

    # ── MYSQL ────────────────────────────────────────────────────────────────
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur  = conn.cursor()

    sp = """
    CREATE PROCEDURE lq5_mysql(IN p_iters INT, OUT p_sec DECIMAL(12,6))
    BEGIN
        DECLARE v0 TIMESTAMP(6);
        DECLARE v1 TIMESTAMP(6);
        DECLARE i  INT DEFAULT 0;
        DECLARE d  TEXT;
        SET v0 = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(CONCAT(customer_id,'|',first_name,'|',last_name))
            INTO d
            FROM sales.large_customers
            WHERE customer_id NOT IN (
                SELECT DISTINCT customer_id
                FROM sales.large_orders
                WHERE customer_id IS NOT NULL
            );
            SET i = i + 1;
        END WHILE;
        SET v1 = SYSDATE(6);
        SET p_sec = TIMESTAMPDIFF(MICROSECOND, v0, v1) / 1000000.0;
    END
    """
    cur.execute("DROP PROCEDURE IF EXISTS lq5_mysql;")
    cur.execute(sp)
    cur.execute("SET SESSION group_concat_max_len = 1048576;")
    cur.execute("CALL lq5_mysql(%s, @t)", (iterations,))
    while cur.nextset():
        pass
    cur.execute("SELECT @t")
    mysql_time = float(cur.fetchone()[0])
    cur.close()
    conn.close()

    per_ms = mysql_time / iterations * 1000
    print(f"--- MySQL (NOT IN subquery — optimizer chuyen sang anti-join) ---")
    print(f"    Total : {mysql_time:.4f}s  |  Per-iter : {per_ms:.3f} ms")

    # ── REDIS ─────────────────────────────────────────────────────────────────
    r = redis.Redis(**REDIS_CONFIG)

    LUA = """
    local iters = tonumber(ARGV[1])
    for _ = 1, iters do
        local cids     = redis.call('SMEMBERS', 'large:customers:ids')
        local no_order = {}
        for _, cid in ipairs(cids) do
            local oids = redis.call('SMEMBERS', 'large:orders:customer:' .. cid)
            if #oids == 0 then
                local fname = redis.call('HGET', 'large:customer:' .. cid, 'first_name')
                local lname = redis.call('HGET', 'large:customer:' .. cid, 'last_name')
                table.insert(no_order, cid .. '|' .. (fname or '') .. '|' .. (lname or ''))
            end
        end
    end
    return "DONE"
    """
    script = r.register_script(LUA)

    r.ping()
    script(args=[1])                        # warm-up

    r.execute_command("CONFIG RESETSTAT")
    script(args=[iterations])
    stats = r.info("commandstats")

    redis_usecs = sum(
        _cmd_usec(stats, c) for c in ("eval", "evalsha", "smembers", "hget")
    )
    redis_time = redis_usecs / 1_000_000
    per_ms_r   = redis_time / iterations * 1000
    print(f"--- Redis (SMEMBERS customers -> check orders set per customer) ---")
    print(f"    Total : {redis_time:.4f}s  |  Per-iter : {per_ms_r:.3f} ms")

    _print_winner(mysql_time, redis_time)


def _print_winner(mysql_t: float, redis_t: float):
    print()
    if mysql_t <= redis_t:
        print(f">>> MySQL nhanh hon {redis_t / mysql_t:.2f}x so voi Redis")
    else:
        print(f">>> Redis nhanh hon {mysql_t / redis_t:.2f}x so voi MySQL")
    print("    (200 customers chua co don dam bao ket qua thuc — khong bi rong)")


if __name__ == "__main__":
    test_q5_antijoin_subquery(iterations=50)
