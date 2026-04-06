# Database Tables

📂 **Folder này chứa các file SQL để tạo tables cho database**

## 📋 Quy tắc đặt tên file:

```
[số thứ tự]_[tên_table].sql
```

**Ví dụ:**

- `01_users.sql` - Tạo bảng users
- `02_products.sql` - Tạo bảng products
- `03_orders.sql` - Tạo bảng orders

## ✍️ Cách viết SQL:

```sql
-- Tên file: 01_users.sql
-- Mô tả: Tạo bảng người dùng
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

USE dbms_project;

-- Xóa bảng nếu tồn tại (cẩn thận!)
DROP TABLE IF EXISTS users;

-- Tạo bảng users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên người dùng',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email duy nhất',
    age INT CHECK (age >= 0) COMMENT 'Tuổi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);

-- Comments cho bảng
ALTER TABLE users COMMENT = 'Bảng thông tin người dùng';
```

## 🚀 Cách chạy file:

```bash
# Method 1: Copy vào container và chạy
docker cp database/table/01_users.sql dbms_mysql:/tmp/table.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project -e "source /tmp/table.sql"

# Method 2: Chạy trực tiếp (Linux/MacOS)
docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project < database/table/01_users.sql

# Method 3: phpMyAdmin Web Interface
# Mở http://localhost:8080 → SQL tab → Copy/paste → Execute
```

## ⚠️ Lưu ý quan trọng:

1. **Luôn backup** trước khi DROP TABLE
2. **Review code** trước khi commit
3. **Test trên local** trước khi push
4. **Comment đầy đủ** để team hiểu
5. **Tuân thủ naming convention** của project
