# Database Seed Data

📂 **Folder này chứa dữ liệu khởi tạo và sample data**

## 📋 Quy tắc đặt tên:

```
[số thứ tự]_[loại_data]_[table_name].sql
```

**Ví dụ:**

- `01_init_database.sql` - Khởi tạo database và cấu hình
- `02_seed_users.sql` - Dữ liệu mẫu cho bảng users
- `03_seed_products.sql` - Dữ liệu mẫu cho bảng products
- `04_sample_orders.sql` - Dữ liệu đơn hàng mẫu

## ✍️ Template cho Init Database:

```sql
-- File: 01_init_database.sql
-- Mô tả: Khởi tạo database và cấu hình cơ bản
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS dbms_project
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE dbms_project;
-- Cấu hình time zone
SET time_zone = '+07:00';

-- Log
SELECT 'Database initialized successfully' as status;
```

## ✍️ Template cho Sample Data:

```sql
-- File: 02_seed_users.sql
-- Mô tả: Dữ liệu mẫu cho bảng users
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

USE dbms_project;

-- Xóa dữ liệu cũ (nếu cần)
-- TRUNCATE TABLE users; -- Cẩn thận!

-- Disable foreign key checks tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample data
INSERT IGNORE INTO users (id, name, email, age) VALUES
(1, 'Nguyễn Văn An', 'nvan.an@email.com', 25),
(2, 'Trần Thị Bình', 'tran.binh@email.com', 30),
(3, 'Lê Văn Cường', 'le.cuong@email.com', 28),
(4, 'Phạm Thị Dung', 'pham.dung@email.com', 22),
(5, 'Hoàng Văn Em', 'hoang.em@email.com', 35);

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify data
SELECT COUNT(*) as 'Users inserted' FROM users;
SELECT 'Sample users data loaded successfully' as status;
```

## 🚀 Cách chạy tất cả seed files:

```bash
# Chạy tất cả files theo thứ tự
for file in database/seed/*.sql; do
    echo "Loading: $file"
    docker cp "$file" dbms_mysql:/tmp/seed.sql
    docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project -e "source /tmp/seed.sql"
done
```

## 🔄 Reset Database Script:

Tạo file `reset_database.sql` để reset toàn bộ:

```sql
-- File: reset_database.sql
-- Mô tả: Reset toàn bộ database về trạng thái ban đầu

USE dbms_project;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database reset completed' as status;
```

## ⚠️ Lưu ý:

1. **Thứ tự quan trọng**: Chạy files theo số thứ tự
2. **Foreign Keys**: Disable khi cần thiết
3. **INSERT IGNORE**: Tránh duplicate key errors
4. **Backup**: Luôn backup trước khi reset
5. **Environment**: Chỉ reset trên development, không bao giờ trên production
