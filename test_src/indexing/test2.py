import time
import mysql.connector
import redis

# Cấu hình giữ nguyên
MYSQL_CONFIG = {
    'host': '127.0.0.1', 'port': 3306, 'user': 'root', 'password': '123456', 'database': 'sales_benchmark',
}
REDIS_CONFIG = {
    'host': 'localhost', 'port': 6379, 'password': None, 'decode_responses': True, 
}

def test_range_query_engine_time(price_min: int = 1000, price_max: int = 2000, iterations: int = 1000):
    print("\n" + "="*70)
    print(f"🚀 TEST 2: RANGE QUERY [{price_min} - {price_max}] (Engine Performance)")
    print("="*70)
    
    # ==========================================
    # 1. MYSQL: BẰNG STORED PROCEDURE
    # ==========================================
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()

    sp_sql = """
    CREATE PROCEDURE measure_mysql_range(IN p_min INT, IN p_max INT, IN p_iters INT, OUT p_time_sec DECIMAL(10,4))
    BEGIN
        DECLARE v_start TIMESTAMP(6); DECLARE v_end TIMESTAMP(6); DECLARE i INT DEFAULT 0; DECLARE dummy TEXT;
        SET v_start = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(product_id) INTO dummy 
            FROM production.products 
            WHERE list_price BETWEEN p_min AND p_max;
            SET i = i + 1;
        END WHILE;
        SET v_end = SYSDATE(6);
        SET p_time_sec = TIMESTAMPDIFF(MICROSECOND, v_start, v_end) / 1000000.0;
    END
    """
    mysql_cursor.execute("DROP PROCEDURE IF EXISTS measure_mysql_range;")
    mysql_cursor.execute(sp_sql)

    # --- Case A: KHÔNG CÓ INDEX ---
    try: mysql_cursor.execute("DROP INDEX idx_products_price ON production.products;")
    except: pass
    mysql_conn.commit()
    
    mysql_cursor.execute("CALL measure_mysql_range(%s, %s, %s, @p_time_sec)", (price_min, price_max, iterations))
    while mysql_cursor.nextset(): pass
    mysql_cursor.execute("SELECT @p_time_sec")
    time_no_index = mysql_cursor.fetchone()[0]
    print(f"--- MySQL (KHÔNG CÓ Index) --- \tTime: {time_no_index:.4f}s")

    # --- Case B: CÓ INDEX ---
    mysql_cursor.execute("CREATE INDEX idx_products_price ON production.products(list_price);")
    mysql_conn.commit()
    
    mysql_cursor.execute("CALL measure_mysql_range(%s, %s, %s, @p_time_sec)", (price_min, price_max, iterations))
    while mysql_cursor.nextset(): pass
    mysql_cursor.execute("SELECT @p_time_sec")
    time_with_index = mysql_cursor.fetchone()[0]
    print(f"--- MySQL (CÓ Index) --- \t\tTime: {time_with_index:.4f}s")

    # Cleanup MySQL
    try: mysql_cursor.execute("DROP INDEX idx_products_price ON production.products;")
    except: pass
    mysql_cursor.close()
    mysql_conn.close()

    # ==========================================
    # 2. REDIS BENCHMARK
    # ==========================================
    redis_client = redis.Redis(**REDIS_CONFIG)
    
    # --- Case C: REDIS SCAN THỦ CÔNG (No Index) ---
    REDIS_LUA_RANGE_SCAN = """
    local min_p = tonumber(ARGV[1])
    local max_p = tonumber(ARGV[2])
    local iters = tonumber(ARGV[3])
    local pids = redis.call('SMEMBERS', 'production:products:ids')
    for iter = 1, iters do
        local count = 0
        for _, pid in ipairs(pids) do
            local price = tonumber(redis.call('HGET', 'production:product:' .. pid, 'list_price'))
            if price and price >= min_p and price <= max_p then count = count + 1 end
        end
    end
    return "DONE"
    """
    
    # --- Case D: REDIS ZSET (Sorted Set Index) ---
    REDIS_LUA_RANGE_ZSET = """
    local min_p = ARGV[1]
    local max_p = ARGV[2]
    local iters = tonumber(ARGV[3])
    for iter = 1, iters do
        -- Lấy IDs từ ZSET theo khoảng điểm (score = price)
        local ids = redis.call('ZRANGEBYSCORE', 'production:products:by_price', min_p, max_p)
    end
    return "DONE"
    """
    
    # Chạy đo đạc Redis Scan
    scan_script = redis_client.register_script(REDIS_LUA_RANGE_SCAN)
    start_scan = time.time()
    scan_script(args=[price_min, price_max, iterations])
    time_redis_scan = time.time() - start_scan
    print(f"\n--- Redis (Scan Toàn Bộ - No Index) ---\tTime: {time_redis_scan:.4f}s")

    # Chạy đo đạc Redis ZSET
    zset_script = redis_client.register_script(REDIS_LUA_RANGE_ZSET)
    start_zset = time.time()
    zset_script(args=[price_min, price_max, iterations])
    time_redis_zset = time.time() - start_zset
    print(f"--- Redis (Sử dụng ZSET Index) --- \tTime: {time_redis_zset:.4f}s")

if __name__ == "__main__":
    test_range_query_engine_time(price_min=1000, price_max=2000, iterations=1000)