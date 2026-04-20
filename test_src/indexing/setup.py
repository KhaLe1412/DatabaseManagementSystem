import mysql.connector
import redis
import time
import subprocess
from pathlib import Path

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

def create_server():
    print("=" * 40)
    print("🐳 ĐANG TỰ ĐỘNG KHỞI TẠO DOCKER SERVER")
    print("=" * 40)

    # Danh sách các lệnh cần chạy
    commands = [
        # 1. Dọn dẹp container cũ (nếu có) để tránh lỗi "name already exists"
        ("Dọn dẹp container cũ (nếu có)", "docker rm -f mysql_benchmark redis_benchmark"),
        
        # 2. Khởi tạo MySQL
        ("Khởi động MySQL container", "docker run -d --name mysql_benchmark -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=sales_benchmark mysql:8.0"),
        
        # 3. Khởi tạo Redis
        ("Khởi động Redis container", "docker run -d --name redis_benchmark -p 6379:6379 redis:latest")
    ]

    for desc, cmd in commands:
        print(f"⏳ {desc}...")
        
        # Chạy lệnh ngầm trong hệ thống
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        # Nếu lệnh chạy thất bại và lỗi KHÔNG PHẢI là "không tìm thấy container cũ"
        if result.returncode != 0 and "No such container" not in result.stderr:
            print(f"❌ Lỗi khi chạy lệnh: {result.stderr}")
            return False
            
    print("✅ Cả hai container đã được tạo thành công!")
    
    print("⏳ Đang chờ 10 giây để MySQL khởi động hoàn tất...")
    time.sleep(10)
    print("🚀 Các server đã sẵn sàng để nhận dữ liệu!\n")
    return True


def _run_sql_file(file_path: Path):
    print(f"🔄 Đang nạp nguyên bản DB từ file: {file_path.name}...")
    
    # Đọc nội dung gốc 
    sql_script = file_path.read_text(encoding="utf-8-sig")

    sql_script = "SET FOREIGN_KEY_CHECKS = 0;\n" + sql_script + "\nSET FOREIGN_KEY_CHECKS = 1;"

    # Câu lệnh KHÔNG điền tên database ở cuối, để file SQL tự quyết định
    command = [
        "docker", "exec", "-i", "mysql_benchmark", 
        "mysql", "-uroot", "-p123456"
    ]
    
    try:
        # Bơm chuỗi SQL trực tiếp vào MySQL
        result = subprocess.run(
            command, 
            input=sql_script, 
            text=True, 
            encoding="utf-8",
            capture_output=True
        )
        
        if result.returncode == 0:
            print(f"✅ Đã nạp thành công: {file_path.name}")
        else:
            print(f"❌ Lỗi từ MySQL: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Lỗi hệ thống: {e}")


def init_mysql(load_data: bool = True):
    base_config = MYSQL_CONFIG.copy()
    db_name = base_config.pop("database", None)

    conn = mysql.connector.connect(**base_config)
    cursor = conn.cursor()

    if load_data:
        project_root = Path(__file__).resolve().parents[2]
        create_sql = project_root / "mysql" / "BikeStores Sample Database - create objects.sql"
        load_sql = project_root / "mysql" / "BikeStores Sample Database - load data.sql"

        _run_sql_file(create_sql)
        _run_sql_file(load_sql)

    cursor.close()
    return conn

def init_redis():
    client = redis.Redis(**REDIS_CONFIG)

    # Optionally load initial data from redis_db/bikestores_redis_commands.txt
    try:
        project_root = Path(__file__).resolve().parents[2]
        commands_file = project_root / "redis_db" / "bikestores_redis_commands.txt"

        if commands_file.exists():
            import shlex

            print(f"🔄 Loading Redis commands from: {commands_file}")
            with commands_file.open(encoding="utf-8") as f:
                for raw in f:
                    line = raw.strip()
                    if not line or line.startswith('#'):
                        continue
                    try:
                        parts = shlex.split(line)
                        if not parts:
                            continue
                        client.execute_command(*parts)
                    except Exception as e:
                        print(f"❌ Failed to execute Redis command: '{line}' -> {e}")
            print("✅ Redis data load complete.")
        else:
            print(f"⚠️ Redis commands file not found: {commands_file}")
    except Exception as e:
        print(f"❌ Error while loading Redis data: {e}")

    return client



if __name__ == "__main__":
    try:
        create_server()
        init_mysql(load_data=True)
        init_redis()
    except Exception as e:
        print(f"❌ Lỗi trong quá trình chạy benchmark: {e}")