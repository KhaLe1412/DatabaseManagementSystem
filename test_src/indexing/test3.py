import time
import mysql.connector
import redis

# Cấu hình kết nối (Giữ nguyên)
MYSQL_CONFIG = {
    'host': '127.0.0.1', 'port': 3306, 'user': 'root', 'password': '123456', 'database': 'sales_benchmark',
}
REDIS_CONFIG = {
    'host': 'localhost', 'port': 6379, 'password': None, 'decode_responses': True, 
}

def test_text_search_engine_time(search_query: str = "Trek Domane", iterations: int = 1000):
    print("\n" + "="*70)
    print(f"🚀 TEST 3: FULL-TEXT SEARCH PERFORMANCE")
    print(f"Query: '{search_query}' | Iterations: {iterations}")
    print("="*70)
    
    # ==========================================
    # 1. MYSQL: BẰNG STORED PROCEDURE
    # ==========================================
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()

    # Procedure đo thời gian
    sp_sql = """
    CREATE PROCEDURE measure_mysql_text(IN p_query VARCHAR(255), IN p_iters INT, IN p_mode INT, OUT p_time_sec DECIMAL(10,4))
    BEGIN
        DECLARE v_start TIMESTAMP(6);
        DECLARE v_end TIMESTAMP(6);
        DECLARE i INT DEFAULT 0;
        DECLARE dummy TEXT;
        DECLARE search_pattern VARCHAR(260);
        SET search_pattern = CONCAT('%', REPLACE(p_query, ' ', '%'), '%');

        SET v_start = SYSDATE(6);
        WHILE i < p_iters DO
            IF p_mode = 0 THEN
                SELECT GROUP_CONCAT(product_id) INTO dummy 
                FROM production.products 
                WHERE product_name LIKE search_pattern;
            ELSE
                SELECT GROUP_CONCAT(product_id) INTO dummy 
                FROM production.products 
                WHERE MATCH(product_name) AGAINST('Trek Domane');
            END IF;
            SET i = i + 1;
        END WHILE;
        SET v_end = SYSDATE(6);
        SET p_time_sec = TIMESTAMPDIFF(MICROSECOND, v_start, v_end) / 1000000.0;
    END
    """
    mysql_cursor.execute("DROP PROCEDURE IF EXISTS measure_mysql_text;")
    mysql_cursor.execute(sp_sql)

    # --- Case A: Sử dụng LIKE (Full Table Scan) ---
    mysql_cursor.execute("CALL measure_mysql_text(%s, %s, 0, @p_time_sec)", (search_query, iterations))
    while mysql_cursor.nextset(): pass # Đảm bảo đọc hết kết quả trước khi SELECT biến OUT
    mysql_cursor.execute("SELECT @p_time_sec")
    mysql_like_time = mysql_cursor.fetchone()[0]
    print(f"--- MySQL (Dùng LIKE) --- \t\tTime: {mysql_like_time:.4f}s")

    # --- Case B: Sử dụng Full-text Index ---
    try:
        # Kiểm tra và tạo Full-text Index nếu chưa có
        mysql_cursor.execute("CREATE FULLTEXT INDEX idx_products_name ON production.products(product_name);")
        mysql_conn.commit()
    except:
        pass # Đã tồn tại
    
    mysql_cursor.execute("CALL measure_mysql_text(%s, %s, 1, @p_time_sec)", (search_query, iterations))
    while mysql_cursor.nextset(): pass
    
    # SỬA LỖI TYPO: @p_p_time_sec -> @p_time_sec
    mysql_cursor.execute("SELECT @p_time_sec")
    mysql_ft_time = mysql_cursor.fetchone()[0]
    print(f"--- MySQL (Dùng FULL-TEXT INDEX) --- \tTime: {mysql_ft_time:.4f}s")

    mysql_cursor.close()
    mysql_conn.close()

    # ==========================================
    # 2. REDIS: FULL SCAN + STRING MATCH
    # ==========================================
    redis_client = redis.Redis(**REDIS_CONFIG)
    
    REDIS_LUA_TEXT_SCAN = """
    local query = string.lower(ARGV[1])
    local iters = tonumber(ARGV[2])
    local words = {}
    for word in string.gmatch(query, "%S+") do table.insert(words, word) end
    local pids = redis.call('SMEMBERS', 'production:products:ids')

    for iter = 1, iters do
        local result_count = 0
        for _, pid in ipairs(pids) do
            local name = string.lower(redis.call('HGET', 'production:product:' .. pid, 'product_name') or "")
            local match = true
            for _, word in ipairs(words) do
                if not string.find(name, word, 1, true) then
                    match = false
                    break
                end
            end
            if match then result_count = result_count + 1 end
        end
    end
    return "DONE"
    """
    
    query_script = redis_client.register_script(REDIS_LUA_TEXT_SCAN)
    
    print("\n⏳ Đang chạy Redis (Lua Full Scan)...")
    start_redis = time.time()
    query_script(args=[search_query, iterations])
    redis_pure_time = time.time() - start_redis
    
    print(f"--- Redis (Full Scan + Lua) --- \tTime: {redis_pure_time:.4f}s")

if __name__ == "__main__":
    test_text_search_engine_time(search_query="Trek Domane", iterations=1000)