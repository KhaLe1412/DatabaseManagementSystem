import mysql.connector
import redis

MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'database': 'sales_benchmark',
}

REDIS_CONFIG = {
    'host': '127.0.0.1',
    'port': 6379,
    'password': None,
    'decode_responses': True,
}


def _cmd_usec(stats: dict, cmd: str) -> int:
    return int(stats.get(f"cmdstat_{cmd}", {}).get("usec", 0))


def insert_data_mysql_engine_only(count: int = 10000):
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS production.products_insert_benchmark (
            product_id INT AUTO_INCREMENT PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            brand_id INT NOT NULL,
            list_price DECIMAL(10,2) NOT NULL,
            INDEX idx_products_insert_brand (brand_id)
        ) ENGINE=InnoDB;
        """
    )
    conn.commit()

    sp_sql = """
    CREATE PROCEDURE measure_mysql_insert(IN p_count INT, OUT p_time_sec DECIMAL(10,4))
    BEGIN
        DECLARE v_start TIMESTAMP(6);
        DECLARE v_end TIMESTAMP(6);
        DECLARE i INT DEFAULT 0;

        TRUNCATE TABLE production.products_insert_benchmark;

        SET v_start = SYSDATE(6);
        WHILE i < p_count DO
            INSERT INTO production.products_insert_benchmark(product_name, brand_id, list_price)
            VALUES (CONCAT('bench_mysql_', i), 1 + (i MOD 10), 1000 + (i MOD 100));
            SET i = i + 1;
        END WHILE;
        SET v_end = SYSDATE(6);

        SET p_time_sec = TIMESTAMPDIFF(MICROSECOND, v_start, v_end) / 1000000.0;
    END
    """

    cursor.execute("DROP PROCEDURE IF EXISTS measure_mysql_insert;")
    cursor.execute(sp_sql)

    cursor.execute("CALL measure_mysql_insert(%s, @p_time_sec)", (count,))
    while cursor.nextset():
        pass
    cursor.execute("SELECT @p_time_sec")
    mysql_time = float(cursor.fetchone()[0])

    print("--- MySQL (Engine-side INSERT + Index Update) --- \tTime: {:.4f}s".format(mysql_time))

    cursor.close()
    conn.close()


def insert_data_redis_engine_only(count: int = 10000):
    client = redis.Redis(**REDIS_CONFIG)

    REDIS_LUA_INSERT = """
    local n = tonumber(ARGV[1])
    local run_id = ARGV[2]
    local brand_key = 'benchmark:run:' .. run_id .. ':products:brand:1'

    for i = 1, n do
        local pid = tostring(i)
        local key = 'benchmark:run:' .. run_id .. ':product:' .. pid
        redis.call('HSET', key,
            'product_name', 'bench_redis_' .. pid,
            'brand_id', '1',
            'list_price', tostring(1000 + (i % 100))
        )
        redis.call('SADD', brand_key, pid)
    end
    return 'DONE'
    """

    query_script = client.register_script(REDIS_LUA_INSERT)

    # Warm-up để loại bỏ chi phí kết nối/script-load lần đầu
    client.ping()
    query_script(args=[1, "warmup"])

    run_id = str(client.incr("benchmark:run_id"))

    client.execute_command("CONFIG RESETSTAT")
    query_script(args=[count, run_id])
    stats = client.info("commandstats")

    redis_usecs = (
        _cmd_usec(stats, "eval") +
        _cmd_usec(stats, "evalsha") +
        _cmd_usec(stats, "hset") +
        _cmd_usec(stats, "sadd")
    )
    redis_time = redis_usecs / 1000000.0

    print("--- Redis (Engine-side HSET + SADD) --- \tTime: {:.4f}s".format(redis_time))


def test_insert_engine_time(count: int = 10000):
    print("\n" + "=" * 70)
    print(f"TEST 5: INSERT PERFORMANCE (DBMS-only, {count} rows)")
    print("MySQL: INSERT + 1 B-Tree Index | Redis: HSET + SADD")
    print("=" * 70)

    insert_data_mysql_engine_only(count)
    insert_data_redis_engine_only(count)


if __name__ == "__main__":
    test_insert_engine_time(count=10000)
