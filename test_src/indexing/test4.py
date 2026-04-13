import time
import mysql.connector
import redis
from pathlib import Path

# Cấu hình kết nối
MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',
    'database': 'sales_benchmark',
}

REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'password': None,
    'decode_responses': True, 
}

def test_composite_query_engine_time(store_id=1, status=4, start_date='2017-01-01', end_date='2017-12-31', iterations=1000):
    print("\n" + "="*70)
    print(f"🚀 TEST 4: COMPOSITE QUERY BENCHMARK")
    print(f"Criteria: Store={store_id}, Status={status}, Date: {start_date} to {end_date}")
    print("="*70)
    
    # --- 1. MYSQL BENCHMARK ---
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor()

    # Khai báo Procedure đo đạc
    sp_sql = """
    CREATE PROCEDURE measure_mysql_composite(
        IN p_store INT, IN p_status INT, IN p_start DATE, IN p_end DATE, IN p_iters INT, OUT p_time_sec DECIMAL(10,4)
    )
    BEGIN
        DECLARE v_start TIMESTAMP(6); DECLARE v_end TIMESTAMP(6); DECLARE i INT DEFAULT 0; DECLARE dummy TEXT;
        SET v_start = SYSDATE(6);
        WHILE i < p_iters DO
            SELECT GROUP_CONCAT(order_id) INTO dummy 
            FROM sales.orders
            WHERE store_id = p_store AND order_status = p_status AND order_date BETWEEN p_start AND p_end;
            SET i = i + 1;
        END WHILE;
        SET v_end = SYSDATE(6);
        SET p_time_sec = TIMESTAMPDIFF(MICROSECOND, v_start, v_end) / 1000000.0;
    END
    """
    mysql_cursor.execute("DROP PROCEDURE IF EXISTS measure_mysql_composite;")
    mysql_cursor.execute(sp_sql)

    def get_mysql_time():
        mysql_cursor.execute("CALL measure_mysql_composite(%s, %s, %s, %s, %s, @p_time_sec)", 
                             (store_id, status, start_date, end_date, iterations))
        while mysql_cursor.nextset(): pass
        mysql_cursor.execute("SELECT @p_time_sec")
        return mysql_cursor.fetchone()[0]

    # --- CHUẨN BỊ MÔI TRƯỜNG MYSQL ---
    try:
        # Tạo index đơn để tránh lỗi "Needed in a foreign key constraint" khi xóa Composite Index
        mysql_cursor.execute("CREATE INDEX idx_store_id_fk_guard ON sales.orders(store_id);")
    except:
        pass

    # --- CASE A: KHÔNG CÓ INDEX TỔ HỢP ---
    try:
        mysql_cursor.execute("DROP INDEX idx_orders_composite ON sales.orders;")
    except:
        pass
    mysql_conn.commit()
    
    time_no_index = get_mysql_time()
    print(f"--- MySQL (KHÔNG CÓ Composite Index) --- \tTime: {time_no_index:.4f}s")

    # --- CASE B: CÓ INDEX TỔ HỢP ---
    mysql_cursor.execute("CREATE INDEX idx_orders_composite ON sales.orders(store_id, order_status, order_date);")
    mysql_conn.commit()
    
    time_with_index = get_mysql_time()
    print(f"--- MySQL (CÓ Composite Index) --- \tTime: {time_with_index:.4f}s")

    # --- CLEANUP MYSQL ---
    try:
        mysql_cursor.execute("DROP INDEX idx_orders_composite ON sales.orders;")
        mysql_conn.commit()
    except:
        pass

    mysql_cursor.close()
    mysql_conn.close()

    # --- 2. REDIS BENCHMARK ---
    redis_client = redis.Redis(**REDIS_CONFIG)
    
    REDIS_LUA_COMPOSITE = """
    local store_key = KEYS[1]
    local target_status = ARGV[1]
    local start_d = ARGV[2]
    local end_d = ARGV[3]
    local iters = tonumber(ARGV[4])

    for iter = 1, iters do
        local oids = redis.call('SMEMBERS', store_key)
        local count = 0
        for _, oid in ipairs(oids) do
            local status = redis.call('HGET', 'sales:order:' .. oid, 'order_status')
            local date = redis.call('HGET', 'sales:order:' .. oid, 'order_date')
            
            if status == target_status and date >= start_d and date <= end_d then
                count = count + 1
            end
        end
    end
    return "DONE"
    """
    query_script = redis_client.register_script(REDIS_LUA_COMPOSITE)
    
    store_key = f"sales:orders:store:{store_id}"
    print(f"\n--- Redis (Dùng Set Store + Lọc thủ công bằng Lua) ---")
    
    start_redis = time.time()
    query_script(keys=[store_key], args=[status, start_date, end_date, iterations])
    redis_total_time = time.time() - start_redis
    
    print(f"Total time for {iterations} iters: {redis_total_time:.4f}s")

if __name__ == "__main__":
    test_composite_query_engine_time(iterations=1000)