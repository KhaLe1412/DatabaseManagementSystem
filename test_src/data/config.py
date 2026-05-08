# config.py

MYSQL_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': 'Nhat123456@',
    'database': 'sales_benchmark',
    'allow_local_infile': True # Bắt buộc phải có để chạy LOAD DATA INFILE
}

REDIS_CONFIG = {
    'host': '127.0.0.1',
    'port': 6379,
    'decode_responses': True
}

# Đường dẫn file dataset (nhớ đổi thành đường dẫn tuyệt đối trên máy bạn)
MYSQL_DATA_FILE = r"../../dataset/Sales Transaction v.4a.csv/Sales Transaction v.4a.csv"
REDIS_DATA_FILE = "../../dataset/sales_transactions_redis.txt"