import time
import subprocess
from pathlib import Path
import mysql.connector
import redis
import shlex

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

def insert_data_mysql(count=10000):
    # Thư mục chứa file SQL
    project_root = Path(__file__).resolve().parents[2]
    load_sql = project_root / "test_src" / "indexing" / "large_insert_data.sql"

    def _run_sql_file_timed(file_path: Path):
        # Kết nối nhanh để dọn dẹp bảng trước khi nạp
        tmp_conn = mysql.connector.connect(**MYSQL_CONFIG) # Dùng config của bạn
        tmp_cursor = tmp_conn.cursor()
        
        # 1. Xóa dữ liệu cũ để đo tốc độ ghi mới hoàn toàn
        tmp_cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        tmp_cursor.execute("TRUNCATE TABLE production.products;")
        
        # 2. Đảm bảo chỉ có 1 index cho brand_id để công bằng với Redis
        try:
            tmp_cursor.execute("ALTER TABLE production.products DROP INDEX IF EXISTS idx_products_brand;")
            tmp_cursor.execute("CREATE INDEX idx_products_brand ON production.products(brand_id);")
        except: pass
        
        tmp_conn.commit()
        tmp_cursor.close()
        tmp_conn.close()

        # 3. Bắt đầu đo thời gian nạp từ file SQL
        print(f"🔄 Đang nạp 10,000 dòng từ file: {file_path.name}...")
        
        sql_script = file_path.read_text(encoding="utf-8-sig")
        # Bọc script bằng lệnh tắt check khóa ngoại để tăng tốc độ ghi (như Redis)
        full_script = "SET FOREIGN_KEY_CHECKS = 0;\n" + sql_script + "\nSET FOREIGN_KEY_CHECKS = 1;"

        command = [
            "docker", "exec", "-i", "mysql_benchmark", 
            "mysql", "-uroot", "-p123456"
        ]

        start_time = time.time() # BẮT ĐẦU ĐO
        try:
            result = subprocess.run(
                command, 
                input=full_script, 
                text=True, 
                encoding="utf-8",
                capture_output=True
            )
            elapsed_time = time.time() - start_time # KẾT THÚC ĐO
            
            if result.returncode == 0:
                print(f"✅ Đã nạp thành công trong: {elapsed_time:.4f}s")
                return elapsed_time
            else:
                print(f"❌ Lỗi từ MySQL: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Lỗi hệ thống: {e}")
            return None

    # Thực hiện nạp và lấy thời gian
    mysql_time = _run_sql_file_timed(load_sql)

    if mysql_time:
        print(f"\n--- Kết quả MySQL ---")
        print(f"Total time to insert {count} rows: {mysql_time:.4f}s")

def insert_data_redis(count=10000):
    client = redis.Redis(**REDIS_CONFIG)
    try:
        project_root = Path(__file__).resolve().parents[2]
        # Sử dụng file minimal đã lọc (chỉ chứa HSET và 1 SADD brand) để công bằng
        commands_file = project_root / "test_src" / "indexing" / "large_insert_data.txt"

        if not commands_file.exists():
            print(f"⚠️ Không tìm thấy file: {commands_file}")
            return

        print(f"🚀 Đang chuẩn bị nạp {count} bản ghi vào Redis bằng Pipeline...")
        
        # 1. Khởi tạo Pipeline
        pipe = client.pipeline(transaction=False)
        
        # Bắt đầu đo thời gian
        start_time = time.time()
        
        command_count = 0
        with commands_file.open(encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith('#'):
                    continue
                
                try:
                    parts = shlex.split(line)
                    if not parts:
                        continue
                    
                    # 2. Đưa lệnh vào hàng chờ pipeline
                    pipe.execute_command(*parts)
                    command_count += 1
                    
                    # Thực thi mỗi batch 500 lệnh để tối ưu bộ nhớ
                    if command_count % 500 == 0:
                        pipe.execute()
                        
                except Exception as e:
                    print(f"❌ Lỗi lệnh: '{line}' -> {e}")

        # Thực thi nốt các lệnh còn lại
        pipe.execute()
        
        # 3. Kết thúc đo thời gian
        end_time = time.time()
        total_time = end_time - start_time

        print("="*60)
        print(f"✅ Redis nạp dữ liệu hoàn tất!")
        print(f"--- Tổng thời gian: {total_time:.4f} giây")
        print("="*60)
        
        return total_time

    except Exception as e:
        print(f"❌ Lỗi hệ thống khi nạp Redis: {e}")
        return None


if __name__ == "__main__":
    print("\n" + "="*70)
    print(f"🚀 TEST 5: INSERT PERFORMANCE (10,000 ROWS + 1 INDEX)")
    print("MySQL: 1 INSERT | Redis: 1 HSET + 1 SADD (Pipeline)")
    print("="*70)

    insert_data_mysql()
    insert_data_redis()