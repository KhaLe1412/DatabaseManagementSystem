# 🚀 DBMS Project - Complete Usage Guide

**Hướng dẫn sử dụng hoàn chỉnh môi trường phát triển database với Docker**

---

## 📋 Tổng quan

Dự án này cung cấp môi trường Docker hoàn chỉnh cho team phát triển database với:

- **MySQL 8.0** database server
- **phpMyAdmin** web interface
- **Workflow** chuẩn cho team collaboration
- **Templates** và **examples** cho tables, procedures, seed data, tests

---

## ⚡ Quick Start (5 phút)

### 1. Clone và Setup

```bash
git clone [repository-url]
cd DBMS/project
docker-compose up -d
```

### 2. Kiểm tra hoạt động

```bash
# Kiểm tra containers
docker-compose ps

# Test database connection
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "SELECT 'Connection OK' as status;"
```

### 3. Truy cập Web Interface

- **phpMyAdmin**: http://localhost:8080
- **Login**: dbuser / dbpassword

---

## 🏗️ Cấu trúc Project

```
project/
├── 📄 docker-compose.yml          # Docker services configuration
├── 📄 README.md                   # Project overview
├── 📄 USAGE_GUIDE.md              # File này - Complete guide
├── 📄 .gitignore                  # Git ignore rules
└── 📁 database/
    ├── 📁 table/                  # 🗺️ SQL table definitions
    │   ├── 📄 README.md          # Templates & guidelines
    │   └── 📄 01_example_users.sql # Example table
    ├── 📁 procedure/               # ⚙️ Stored procedures & functions
    │   ├── 📄 README.md          # Templates & examples
    │   └── 📄 sp_example_get_user_info.sql # Example procedure
    ├── 📁 seed/                    # 🌱 Initialization & sample data
    │   ├── 📄 README.md          # Auto-load instructions
    │   └── 📄 01_example_init_data.sql # Example data
    └── 📁 test/                    # 🧪 Test cases & validation
        ├── 📄 README.md          # Testing framework
        └── 📄 01_example_test_users.sql # Example tests
```

---

## 🎯 Workflow cho Team Members

### 🆕 Thành viên mới tham gia

#### Bước 1: Environment Setup

```bash
# Clone repository
git clone [repository-url]
cd DBMS/project

# Khởi động Docker (lần đầu sẽ download images)
docker-compose up -d

# Kiểm tra tất cả services đã chạy
docker-compose ps
```

#### Bước 2: Làm quen với Examples

```bash
# Xem example table
cat database/table/01_example_users.sql

# Chạy example để tạo table
docker cp database/table/01_example_users.sql dbms_mysql:/tmp/table.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "source /tmp/table.sql"

# Load sample data
docker cp database/seed/01_example_init_data.sql dbms_mysql:/tmp/seed.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "source /tmp/seed.sql"

# Chạy tests
docker cp database/test/01_example_test_users.sql dbms_mysql:/tmp/test.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "source /tmp/test.sql"
```

#### Bước 3: Truy cập phpMyAdmin

- Mở http://localhost:8080
- Login: `dbuser` / `dbpassword`
- Chọn database `example`
- Explore tables và data

---

### 📝 Daily Development Workflow

#### 1️⃣ Tạo Database Tables

```bash
# Tạo file SQL mới (theo naming convention)
# Format: [số_thứ_tự]_[tên_table].sql
vi database/table/02_products.sql
```

**Template cho table:**

```sql
-- File: 02_products.sql
-- Mô tả: Tạo bảng sản phẩm
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

USE example;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa bảng nếu tồn tại (cẩn thận!)
DROP TABLE IF EXISTS products;

-- Tạo bảng products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên sản phẩm',
    price DECIMAL(10,2) NOT NULL COMMENT 'Giá',
    category VARCHAR(50) COMMENT 'Danh mục',
    stock INT DEFAULT 0 COMMENT 'Số lượng tồn kho',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo index
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);

-- Comments cho bảng
ALTER TABLE products COMMENT = 'Bảng thông tin sản phẩm';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Products table created successfully!' as result;
```

**Chạy table SQL:**

```bash
docker cp database/table/02_products.sql dbms_mysql:/tmp/table.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "source /tmp/table.sql"
```

#### 2️⃣ Tạo Stored Procedures

**Template cho procedure:**

```sql
-- File: sp_get_product_by_category.sql
-- Mô tả: Lấy sản phẩm theo danh mục
-- Tác giả: [Tên bạn]

USE example;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_get_product_by_category//

CREATE PROCEDURE sp_get_product_by_category(
    IN p_category VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Validate input
    IF p_category IS NULL OR p_category = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category cannot be empty';
    END IF;

    -- Main query
    SELECT
        id,
        name,
        price,
        stock,
        created_at
    FROM products
    WHERE category = p_category
    ORDER BY name;

END//

DELIMITER ;

SELECT 'Procedure sp_get_product_by_category created successfully!' as result;
```

#### 3️⃣ Thêm Sample Data

**Template cho seed data:**

```sql
-- File: 02_seed_products.sql
-- Mô tả: Dữ liệu mẫu cho bảng products

USE example;

SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample products
INSERT IGNORE INTO products (id, name, price, category, stock) VALUES
(1, 'Laptop Dell XPS 13', 25000000.00, 'Electronics', 10),
(2, 'iPhone 15 Pro', 30000000.00, 'Electronics', 15),
(3, 'Áo thun cotton', 200000.00, 'Clothing', 50),
(4, 'Giày thể thao Nike', 2500000.00, 'Footwear', 25);

SET FOREIGN_KEY_CHECKS = 1;

SELECT COUNT(*) as 'Products inserted' FROM products;
SELECT 'Sample products data loaded successfully!' as status;
```

#### 4️⃣ Tạo Test Cases

**Template cho tests:**

```sql
-- File: 02_test_products.sql
-- Mô tả: Test cases cho bảng products

USE example;

SELECT '=== TESTING PRODUCTS TABLE ===' as test_name;

-- Test 1: Table exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'PASS: Products table exists'
        ELSE 'FAIL: Products table not found'
    END as test_result
FROM information_schema.tables
WHERE table_schema = 'example' AND table_name = 'products';

-- Test 2: Insert and verify
INSERT IGNORE INTO products (name, price, category, stock)
VALUES ('Test Product', 100000, 'Test', 5);

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'PASS: Product insert works'
        ELSE 'FAIL: Product insert failed'
    END as test_result
FROM products WHERE name = 'Test Product';

-- Cleanup
DELETE FROM products WHERE name = 'Test Product';

SELECT 'Products tests completed' as final_result;
```

---

## 🔧 Commands Reference

### Docker Management

```bash
# Khởi động environment
docker-compose up -d

# Dừng environment
docker-compose down

# Xem trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs mysql
docker-compose logs phpmyadmin

# Reset toàn bộ (XÓA HẾT DATA!)
docker-compose down -v
docker-compose up -d
```

### Database Operations

```bash
# Kết nối MySQL CLI
docker-compose exec mysql mysql -u dbuser -p example

# Chạy SQL command trực tiếp
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "SHOW TABLES;"

# Chạy SQL file
docker cp your_file.sql dbms_mysql:/tmp/query.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword example -e "source /tmp/query.sql"

# Backup database
docker-compose exec mysql mysqldump -u dbuser -pdbpassword example > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T mysql mysql -u dbuser -pdbpassword example < backup.sql
```

---

## 📋 Naming Conventions

### 📁 **File Naming Rules**

| Type           | Format                           | Example                           |
| -------------- | -------------------------------- | --------------------------------- |
| **Tables**     | `[số]_[tên_table].sql`           | `01_users.sql`, `02_products.sql` |
| **Procedures** | `sp_[chức_năng]_[đối_tượng].sql` | `sp_get_user_info.sql`            |
| **Functions**  | `fn_[chức_năng].sql`             | `fn_calculate_total.sql`          |
| **Seed Data**  | `[số]_seed_[table].sql`          | `02_seed_products.sql`            |
| **Tests**      | `[số]_test_[feature].sql`        | `01_test_users.sql`               |

### 🏗️ **SQL Code Style**

```sql
-- ✅ Good
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên người dùng',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email duy nhất',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ✅ Good procedure
DELIMITER //
CREATE PROCEDURE sp_get_user_info(IN p_user_id INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT * FROM users WHERE id = p_user_id;
END//
DELIMITER ;
```

---

## 🔄 Git Workflow

### 🌿 Branch Strategy

```bash
# Tạo branch cho feature mới
git checkout -b feature/add-products-table

# Hoặc cho bugfix
git checkout -b bugfix/fix-user-constraints

# Hoặc cho procedure
git checkout -b procedure/add-user-management
```

### 📝 Commit Guidelines

```bash
# Commit format tốt
git add database/table/02_products.sql
git commit -m "Add products table with indexes and constraints"

git add database/procedure/sp_manage_products.sql
git commit -m "Add stored procedure for product management"

git add database/test/02_test_products.sql
git commit -m "Add comprehensive test cases for products table"
```

### 🔍 Code Review Checklist

**Reviewer cần kiểm tra:**

- [ ] SQL syntax đúng
- [ ] Comment đầy đủ và rõ ràng
- [ ] Naming convention được tuân thủ
- [ ] Error handling (cho procedures)
- [ ] Test cases cover đủ scenarios
- [ ] Foreign key constraints hợp lý
- [ ] Index được tạo cho các cột query thường xuyên

---

## ⚠️ Best Practices & Safety

### 🛡️ **Database Safety**

```sql
-- ✅ Luôn backup trước khi DROP/ALTER
-- ✅ Sử dụng transactions cho operations phức tạp
BEGIN;
-- Your operations
COMMIT; -- hoặc ROLLBACK nếu có lỗi

-- ✅ Disable FK checks khi cần thiết
SET FOREIGN_KEY_CHECKS = 0;
-- Operations
SET FOREIGN_KEY_CHECKS = 1;

-- ✅ Sử dụng INSERT IGNORE cho seed data
INSERT IGNORE INTO table VALUES (...);
```

### 🧪 **Testing Strategy**

1. **Unit Tests**: Test từng table/procedure riêng biệt
2. **Integration Tests**: Test relationships giữa tables
3. **Data Validation**: Test constraints và business rules
4. **Performance Tests**: Test với large datasets

### 🚀 **Performance Tips**

- **Index**: Tạo index cho các cột được query thường xuyên
- **Query Optimization**: Sử dụng EXPLAIN để analyze queries
- **Constraints**: Validate data ở database level
- **Normalization**: Design tables theo chuẩn 3NF

---

## 🔧 Troubleshooting

### ❓ **Các vấn đề thường gặp**

#### Port 3307 đã được sử dụng

```bash
# Thay đổi port trong docker-compose.yml
ports:
  - "3308:3306"  # Đổi từ 3307 thành 3308
```

#### Container không start

```bash
# Xem logs để debug
docker-compose logs mysql

# Reset containers
docker-compose down
docker-compose up -d
```

#### Quên password

```bash
# Default credentials:
# dbuser / dbpassword
# root / rootpassword
```

#### SQL file bị lỗi syntax

```bash
# Kiểm tra syntax trước khi chạy
docker-compose exec mysql mysql -u dbuser -pdbpassword example --execute="source /tmp/your_file.sql" --verbose
```

#### Foreign key constraint errors

```bash
# Tạm thời disable FK checks
SET FOREIGN_KEY_CHECKS = 0;
-- Your operations
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 🎯 Advanced Usage

### 🔄 **Multiple Databases**

Có thể tạo thêm databases cho các environments khác nhau:

```sql
-- Development
CREATE DATABASE example_dev;

-- Testing
CREATE DATABASE example_test;

-- Production (cẩn thận!)
CREATE DATABASE example_prod;
```

### 📊 **Performance Monitoring**

```sql
-- Xem slow queries
SHOW PROCESSLIST;

-- Analyze table performance
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- Check index usage
SHOW INDEX FROM users;
```

### 🔐 **Security Best Practices**

- Không commit passwords vào git
- Sử dụng environment variables cho production
- Regular backups cho data quan trọng
- Monitor access logs

---

## 📞 Support & Help

### 📚 **Documentation Structure**

- **README.md**: Project overview + quick start
- **USAGE_GUIDE.md**: File này - complete guide
- **database/\*/README.md**: Specific folder instructions
- **Examples**: Templates trong mỗi folder

### 🆘 **Khi gặp vấn đề**

1. Kiểm tra **logs**: `docker-compose logs mysql`
2. Review **README.md** của folder liên quan
3. Check **examples** có sẵn
4. Hỏi team members qua chat
5. Tạo **issue** trong Git repository

### 🔗 **Useful Links**

- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/refman/8.0/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [phpMyAdmin Docs](https://docs.phpmyadmin.net/)
- [SQL Style Guide](https://www.sqlstyle.guide/)

---

## 🎉 Conclusion

**Congratulations!** Bạn đã có môi trường database development hoàn chỉnh với:

✅ **MySQL 8.0** với proper configuration  
✅ **phpMyAdmin** web interface  
✅ **Docker** environment dễ setup  
✅ **Team workflow** chuẩn  
✅ **Templates** và **examples** đầy đủ  
✅ **Testing framework** tích hợp  
✅ **Git workflow** optimization

**Happy coding! 🚀**
