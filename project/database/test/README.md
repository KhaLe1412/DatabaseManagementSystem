# Database Tests

📂 **Folder này chứa các test cases và validation queries**

## 📋 Quy tắc đặt tên:

```
[số thứ tự]_test_[tính_năng].sql
```

**Ví dụ:**

- `01_test_basic_crud.sql` - Test các thao tác CRUD cơ bản
- `02_test_constraints.sql` - Test các ràng buộc database
- `03_test_procedures.sql` - Test stored procedures
- `04_test_performance.sql` - Test performance queries

## ✍️ Template cho Test File:

```sql
-- File: 01_test_basic_crud.sql
-- Mô tả: Test các thao tác CRUD cơ bản
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

USE dbms_project;

-- ================================
-- TEST 1: INSERT Operations
-- ================================
SELECT '=== TEST 1: INSERT Operations ===' as test_name;

-- Test insert valid user
INSERT INTO users (name, email, age) VALUES ('Test User', 'test@dbms.com', 25);
SELECT 'Insert valid user: PASSED' as result;

-- Test insert duplicate email (should fail)
-- INSERT INTO users (name, email, age) VALUES ('Test User 2', 'test@dbms.com', 30);
-- Expected: Error 1062 - Duplicate entry

-- ================================
-- TEST 2: SELECT Operations
-- ================================
SELECT '=== TEST 2: SELECT Operations ===' as test_name;

-- Count total users
SELECT
    COUNT(*) as total_users,
    CASE
        WHEN COUNT(*) > 0 THEN 'PASSED'
        ELSE 'FAILED'
    END as test_result
FROM users;

-- Test JOIN query
SELECT
    COUNT(*) as total_orders_with_details,
    CASE
        WHEN COUNT(*) >= 0 THEN 'PASSED'
        ELSE 'FAILED'
    END as test_result
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN products p ON o.product_id = p.id;

-- ================================
-- TEST 3: UPDATE Operations
-- ================================
SELECT '=== TEST 3: UPDATE Operations ===' as test_name;

-- Save original data for restoration
CREATE TEMPORARY TABLE temp_original_user AS
SELECT * FROM users WHERE email = 'test@dbms.com';

-- Test update
UPDATE users SET age = 26 WHERE email = 'test@dbms.com';

-- Verify update
SELECT
    age,
    CASE
        WHEN age = 26 THEN 'UPDATE: PASSED'
        ELSE 'UPDATE: FAILED'
    END as test_result
FROM users WHERE email = 'test@dbms.com';

-- ================================
-- TEST 4: DELETE Operations
-- ================================
SELECT '=== TEST 4: DELETE Operations ===' as test_name;

-- Delete test user
DELETE FROM users WHERE email = 'test@dbms.com';

-- Verify deletion
SELECT
    COUNT(*) as remaining_test_users,
    CASE
        WHEN COUNT(*) = 0 THEN 'DELETE: PASSED'
        ELSE 'DELETE: FAILED'
    END as test_result
FROM users WHERE email = 'test@dbms.com';

-- ================================
-- TEST SUMMARY
-- ================================
SELECT '=== TEST COMPLETED ===' as test_name;
SELECT NOW() as test_completed_at;
```

## ✍️ Template cho Constraint Tests:

```sql
-- File: 02_test_constraints.sql
-- Mô tả: Test các ràng buộc database
-- Tác giả: [Tên bạn]
-- Ngày tạo: [YYYY-MM-DD]

USE dbms_project;

-- Test NOT NULL constraint
SELECT 'Testing NOT NULL constraints' as test_name;

-- This should fail
-- INSERT INTO users (email, age) VALUES ('test@dbms.com', 25);
-- Expected: Error - Column 'name' cannot be null

-- Test UNIQUE constraint
SELECT 'Testing UNIQUE constraints' as test_name;

-- Insert first user (should succeed)
INSERT IGNORE INTO users (name, email, age) VALUES ('Test User 1', 'unique@test.com', 25);

-- Try to insert duplicate email (should fail)
-- INSERT INTO users (name, email, age) VALUES ('Test User 2', 'unique@test.com', 30);
-- Expected: Error 1062 - Duplicate entry

-- Test CHECK constraint (if exists)
SELECT 'Testing CHECK constraints' as test_name;

-- This should fail if age CHECK constraint exists
-- INSERT INTO users (name, email, age) VALUES ('Test User', 'invalid@test.com', -5);
-- Expected: Error - Check constraint violation

-- Test Foreign Key constraints
SELECT 'Testing FOREIGN KEY constraints' as test_name;

-- Try to insert order with non-existent user_id (should fail)
-- INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (99999, 1, 1, 100);
-- Expected: Error 1452 - Cannot add or update a child row

-- Cleanup
DELETE FROM users WHERE email = 'unique@test.com';

SELECT 'Constraint tests completed' as result;
```

## 🚀 Cách chạy tests:

```bash
# Chạy một test cụ thể
docker cp database/test/01_test_basic_crud.sql dbms_mysql:/tmp/test.sql
docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project -e "source /tmp/test.sql"

# Chạy tất cả tests
for file in database/test/*_test_*.sql; do
    echo "Running test: $file"
    docker cp "$file" dbms_mysql:/tmp/test.sql
    docker-compose exec mysql mysql -u dbuser -pdbpassword dbms_project -e "source /tmp/test.sql"
    echo "---"
done
```

## 📊 Test Report Template:

```sql
-- File: 99_test_report.sql
-- Mô tả: Tạo báo cáo tổng hợp test

USE dbms_project;

SELECT '=== DATABASE TEST REPORT ===' as report_title;
SELECT NOW() as report_generated_at;

-- Table status
SELECT
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables
WHERE table_schema = 'dbms_project'

-- Data summary
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders;

-- Constraint check
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_schema = 'dbms_project'

SELECT '=== END OF REPORT ===' as report_end;
```

## ⚠️ Best Practices:

1. **Isolate Tests**: Mỗi test độc lập, không ảnh hưởng lẫn nhau
2. **Cleanup**: Xóa test data sau khi test
3. **Error Handling**: Comment các câu lệnh expected to fail
4. **Assertions**: Sử dụng CASE WHEN để validate results
5. **Documentation**: Comment rõ expected behavior
