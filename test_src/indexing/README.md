# Indexing giữa MySQL và Redis

Mục đích: Khởi tạo môi trường (MySQL + Redis), nạp dữ liệu mẫu và chạy các test `test1.py`..`test5.py` để so sánh hiệu năng truy vấn/indexing.

**Yêu cầu trước khi chạy**
- **Docker**: cần chạy và có quyền sử dụng `docker` từ dòng lệnh.
- **Python 3.8+** và các package: `mysql-connector-python`, `redis`.
- Cổng mặc định: MySQL `3306`, Redis `6379` (được dùng trong script).

**Chuẩn bị môi trường**
1. (Windows PowerShell) Kích hoạt virtualenv nếu có:

```powershell
& .venv\Scripts\Activate.ps1
```

2. Cài package cần thiết:

```powershell
pip install mysql-connector-python redis
```

**Khởi động Docker containers và nạp dữ liệu mẫu**
- Script tiện lợi để tạo container và nạp dữ liệu nằm ở `test_src/indexing/setup.py`.
- Từ thư mục gốc dự án chạy:

```powershell
python test_src/indexing/setup.py
```

Script trên sẽ:
- Tạo container `mysql_benchmark` (MySQL 8.0) với `MYSQL_ROOT_PASSWORD=123456` và database `sales_benchmark`.
- Tạo container `redis_benchmark` (Redis).
- Chờ ~10s cho MySQL khởi động và nạp file SQL mẫu.

Nếu bạn muốn tự chạy Docker bằng tay, các lệnh tương đương:

```powershell
docker rm -f mysql_benchmark redis_benchmark || echo 'no existing'
docker run -d --name mysql_benchmark -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=sales_benchmark mysql:8.0
docker run -d --name redis_benchmark -p 6379:6379 redis:latest
```

Sau khi MySQL sẵn sàng, nạp SQL mẫu (nếu chưa được nạp bởi `setup.py`) bằng cách chạy nội dung file SQL trong `mysql/` vào container MySQL.

**Chạy các test**
- Tất cả test nằm trong `test_src/indexing/`.
- Các file chính:
- [test_src/indexing/test1.py](test_src/indexing/test1.py) — So sánh tìm theo brand (indexed fetch) giữa MySQL và Redis.
- [test_src/indexing/test2.py](test_src/indexing/test2.py) — So sánh range queries (MySQL index vs Redis scan/ZSET).
- [test_src/indexing/test3.py](test_src/indexing/test3.py) — So sánh text search (LIKE / FULLTEXT vs Redis Lua scan).
- [test_src/indexing/test4.py](test_src/indexing/test4.py) — So sánh truy vấn composite (composite index vs Redis set+lua).
- [test_src/indexing/test5.py](test_src/indexing/test5.py) — So sánh tốc độ insert: MySQL (bulk SQL) vs Redis (pipeline HSET + SADD).

Chạy từng test bằng lệnh (từ gốc dự án):

```powershell
python test_src/indexing/test1.py
python test_src/indexing/test2.py
python test_src/indexing/test3.py
python test_src/indexing/test4.py
python test_src/indexing/test5.py
```

