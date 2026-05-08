import time
import socket
import mysql.connector
import redis
from config import MYSQL_CONFIG, REDIS_CONFIG, MYSQL_DATA_FILE, REDIS_DATA_FILE

def connect_mysql():
    return mysql.connector.connect(**MYSQL_CONFIG)

def connect_redis():
    return redis.Redis(**REDIS_CONFIG)

def test_case_1_storage_footprint():
    print("\n--- TEST CASE 1: STORAGE FOOTPRINT ---")
    conn = connect_mysql()
    cursor = conn.cursor()
    query = """
        SELECT table_schema AS 'Database', 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
        FROM information_schema.TABLES 
        WHERE table_schema IN ('production', 'sales') 
        GROUP BY table_schema;
    """
    cursor.execute(query)
    for (db, size) in cursor:
        print(f"MySQL - {db}: {size} MB")
    cursor.close()
    conn.close()

    r = connect_redis()
    print(f"Redis - Tổng số Keys: {r.dbsize()}")
    print(f"Redis - Dung lượng RAM: {r.info('memory')['used_memory_human']}")

def test_case_2_bulk_insert():
    print("\n--- TEST CASE 2: BULK INSERT PERFORMANCE ---")
    
    # 1. MySQL (Giữ nguyên)
    print(">> Đang nạp dữ liệu vào MySQL...")
    conn = connect_mysql()
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE transactions ENGINE = InnoDB;")
    cursor.execute("TRUNCATE TABLE transactions;") 
    
    start_time = time.time()
    safe_mysql_path = MYSQL_DATA_FILE.replace('\\', '/')
    load_query = f"""
        LOAD DATA LOCAL INFILE '{safe_mysql_path}'
        INTO TABLE transactions
        FIELDS TERMINATED BY ',' ENCLOSED BY '"'
        LINES TERMINATED BY '\\n'
        IGNORE 1 ROWS
        (transaction_no, @var_date, product_no, @dummy, price, quantity, customer_no, country)
        SET transaction_date = STR_TO_DATE(@var_date, '%m/%d/%Y');
    """
    try:
        cursor.execute(load_query)
        conn.commit()
        print(f"MySQL - Hoàn tất nạp dữ liệu trong: {time.time() - start_time:.2f} giây")
    except Exception as e:
        print(f"Lỗi MySQL: {e}")
    finally:
        cursor.close()
        conn.close()

    # 2. Redis (Dùng Raw Socket)
    print("\n>> Đang nạp dữ liệu vào Redis...")
    r = connect_redis()
    r.flushdb() 
    
    start_time = time.time()
    
    # Kết nối trực tiếp vào socket của Redis
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((REDIS_CONFIG['host'], REDIS_CONFIG['port']))
    # Cấu hình buffer size lớn để gửi dữ liệu nhanh hơn
    sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

    # Hàm tự chế chuyển lệnh text thành chuẩn nhị phân (RESP) của Redis
    def gen_redis_protocol(cmd_string):
        # Tách lệnh bằng dấu cách, nhưng bỏ qua các dấu cách trong ngoặc kép (cách làm thủ công cực nhanh thay vì dùng shlex)
        import re
        parts = re.findall(r'(?:[^\s,"]|"(?:\\.|[^"])*")+', cmd_string)
        
        # Xóa dấu ngoặc kép thừa
        parts = [p.strip('"') for p in parts]
        
        # Build RESP protocol
        resp = f"*{len(parts)}\r\n"
        for p in parts:
            resp += f"${len(p.encode('utf-8'))}\r\n{p}\r\n"
        return resp.encode('utf-8')

    buffer = bytearray()
    buffer_size = 1024 * 1024 * 2 # 2MB buffer
    
    try:
        with open(REDIS_DATA_FILE, 'r', encoding='utf-8') as fin:
            for line in fin:
                if line.strip() and not line.strip().startswith('#'):
                    # Đóng gói lệnh thành nhị phân
                    buffer.extend(gen_redis_protocol(line.strip()))
                    
                    # Nếu buffer đầy 2MB thì xả qua mạng 1 lần
                    if len(buffer) > buffer_size:
                        sock.sendall(buffer)
                        buffer.clear()
                        
        # Gửi nốt phần còn lại
        if buffer:
            sock.sendall(buffer)
            
        print(f"Redis - Gửi xong gói tin trong: {time.time() - start_time:.2f} giây. Đang chờ server xử lý...")
        
        # Đợi Redis xử lý xong (Đọc phản hồi để chắc chắn nó đã làm xong)
        sock.settimeout(5.0) # Timeout 5 giây nếu nó không phản hồi nữa
        try:
            while sock.recv(4096):
                pass
        except socket.timeout:
            pass # Chờ hết timeout nghĩa là nó đã xử lý xong rỗng ruột
            
        print(f"Redis - HOÀN TẤT TẤT CẢ trong: {time.time() - start_time:.2f} giây")
        
    except Exception as e:
        print(f"Lỗi Redis Raw Socket: {e}")
    finally:
        sock.close()

def test_case_3_eviction():
    print("\n--- TEST CASE 3: STORAGE OVERLOAD & EVICTION ---")
    
    print(">> MySQL: Ép dung lượng bộ nhớ (Memory Engine 2MB)...")
    conn = connect_mysql()
    cursor = conn.cursor()
    try:
        cursor.execute("SET max_heap_table_size = 1024 * 1024 * 2;")
        cursor.execute("ALTER TABLE transactions ENGINE = MEMORY;")
    except mysql.connector.Error as err:
        print(f"MySQL phản hồi đúng kịch bản: Lỗi {err.errno} - {err.msg}")
    finally:
        cursor.close()
        conn.close()

    print("\n>> Redis: Kích hoạt chính sách LRU với maxmemory 2MB...")
    r = connect_redis()
    r.flushdb() 
    
    # CHIÊU BÍ MẬT: Reset toàn bộ bộ đếm thống kê về 0 trước khi ép tải
    r.config_resetstat() 
    
    r.config_set('maxmemory', '2mb')
    r.config_set('maxmemory-policy', 'allkeys-lru')
    
    print(">> Đang nạp lại dữ liệu để ép Redis đào thải (Dùng Raw Socket)...")
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((REDIS_CONFIG['host'], REDIS_CONFIG['port']))
    sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

    def gen_redis_protocol(cmd_string):
        import re
        parts = re.findall(r'(?:[^\s,"]|"(?:\\.|[^"])*")+', cmd_string)
        parts = [p.strip('"') for p in parts]
        resp = f"*{len(parts)}\r\n"
        for p in parts:
            resp += f"${len(p.encode('utf-8'))}\r\n{p}\r\n"
        return resp.encode('utf-8')

    buffer = bytearray()
    buffer_size = 1024 * 1024 * 2
    
    try:
        with open(REDIS_DATA_FILE, 'r', encoding='utf-8') as fin:
            for line in fin:
                if line.strip() and not line.strip().startswith('#'):
                    buffer.extend(gen_redis_protocol(line.strip()))
                    if len(buffer) > buffer_size:
                        sock.sendall(buffer)
                        buffer.clear()
        if buffer:
            sock.sendall(buffer)
            
        sock.settimeout(5.0)
        try:
            while sock.recv(4096):
                pass
        except socket.timeout:
            pass
            
    except Exception as e:
        print(f"Lỗi Redis Raw Socket: {e}")
    finally:
        sock.close()

    time.sleep(2)
    # Lần này con số in ra sẽ chuẩn 100% của đúng lần chạy này
    print(f"Redis - Số bản ghi đã tự động bị đào thải (evicted_keys): {r.info('stats')['evicted_keys']}")
    
    r.config_set('maxmemory', '0') 
    r.config_set('maxmemory-policy', 'noeviction')

if __name__ == "__main__":
    test_case_2_bulk_insert()      # Nạp dữ liệu trước
    test_case_1_storage_footprint() # Đo dung lượng sau khi nạp xong
    test_case_3_eviction()         # Ép tải cuối cùng