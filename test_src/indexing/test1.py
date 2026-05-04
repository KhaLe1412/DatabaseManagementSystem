import mysql.connector
import redis

# Cấu hình giữ nguyên như cũ
MYSQL_CONFIG = {
    'host': '127.0.0.1', 'port': 3306, 'user': 'root', 'password': '123456', 'database': 'sales_benchmark'
}
REDIS_CONFIG = {
    'host': '127.0.0.1', 'port': 6379, 'password': None, 'decode_responses': True
}

def test_pure_engine_time(brand_id: int = 9, iterations: int = 1000):
    print("\n" + "="*70)
    print(f"🚀 TEST 1: INDEX COMPARISON (Brand ID = {brand_id})")
    print(f"Goal: Measure engine time for {iterations} iterations")
    print("="*70)
    
    # ==========================================
    # 1. MYSQL: SỬ DỤNG B-TREE INDEX CÓ SẴN
    # ==========================================
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()

    # Procedure mô phỏng SELECT * (Fetch toàn bộ cột của các dòng khớp)
    sp_sql = """
    CREATE PROCEDURE measure_mysql_indexed(IN p_brand INT, IN p_iters INT, OUT p_time_sec DECIMAL(10,4))
    BEGIN
        DECLARE v_start TIMESTAMP(6);
        DECLARE v_end TIMESTAMP(6);
        DECLARE i INT DEFAULT 0;
        DECLARE dummy TEXT;
        SET v_start = SYSDATE(6);
        
        WHILE i < p_iters DO
            -- GROUP_CONCAT các cột để ép MySQL phải tìm và đọc dữ liệu thực từ đĩa/RAM
            SELECT GROUP_CONCAT(CONCAT(product_name, list_price, model_year)) 
            INTO dummy 
            FROM production.products 
            WHERE brand_id = p_brand;
            SET i = i + 1;
        END WHILE;
        
        SET v_end = SYSDATE(6);
        SET p_time_sec = TIMESTAMPDIFF(MICROSECOND, v_start, v_end) / 1000000.0;
    END
    """
    mysql_cursor.execute("DROP PROCEDURE IF EXISTS measure_mysql_indexed;")
    mysql_cursor.execute(sp_sql)

    mysql_cursor.execute("CALL measure_mysql_indexed(%s, %s, @p_time_sec)", (brand_id, iterations))
    while mysql_cursor.nextset(): pass
    mysql_cursor.execute("SELECT @p_time_sec")
    mysql_time = mysql_cursor.fetchone()[0]
    
    print(f"--- MySQL (Indexed Search & Fetch) --- \tTime: {mysql_time:.4f}s")
    mysql_cursor.close()
    mysql_conn.close()

    # ==========================================
    # 2. REDIS: SỬ DỤNG SET INDEX + HGETALL
    # ==========================================
    redis_client = redis.Redis(**REDIS_CONFIG)
    
    # Lua script: 1. SMEMBERS lấy IDs -> 2. HGETALL từng ID
    REDIS_LUA_FETCH = """
    local brand_key = KEYS[1]
    local iters = tonumber(ARGV[1])

    for iter = 1, iters do
        local ids = redis.call('SMEMBERS', brand_key)
        for _, id in ipairs(ids) do
            redis.call('HGETALL', 'production:product:' .. id)
        end
    end
    return "DONE"
    """
    query_script = redis_client.register_script(REDIS_LUA_FETCH)
    brand_key = f"production:products:brand:{brand_id}"

    # Warm-up để loại bỏ chi phí kết nối/script-load ở lần gọi đầu tiên
    redis_client.ping()
    query_script(keys=[brand_key], args=[1])

    # Engine-side time cho Redis: lấy CPU usec tích lũy theo commandstats
    redis_client.execute_command("CONFIG RESETSTAT")
    query_script(keys=[brand_key], args=[iterations])
    stats = redis_client.info("commandstats")

    def get_usec(cmd: str) -> int:
        return int(stats.get(f"cmdstat_{cmd}", {}).get("usec", 0))

    redis_usecs = (
        get_usec("eval") +
        get_usec("evalsha") +
        get_usec("smembers") +
        get_usec("hgetall")
    )
    redis_time = redis_usecs / 1000000.0
    
    print(f"--- Redis (Set Index + Hash Fetch) --- \tTime: {redis_time:.4f}s")

if __name__ == "__main__":
    test_pure_engine_time(brand_id=9, iterations=1000)