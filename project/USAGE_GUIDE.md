# DBMS Project - Huong dan su dung

---

## Tong quan

Moi truong Docker cho team phat trien database `dbms_project` voi:

- **MySQL 8.0** - database server (port `3307`)
- **phpMyAdmin** - giao dien web (port `8080`)
- **Init tu dong** - khi container khoi dong lan dau, cac file SQL trong `table/`, `procedure/`, `seed/` duoc chay **theo thu tu**
- **Test thu cong** - cac file trong `test/` chi chay khi can kiem thu

---

## Cau truc thu muc

```
project/
├── docker-compose.yml
├── USAGE_GUIDE.md
└── database/
    ├── init/
    │   └── 00_init.sh          <- Script init tu dong (table -> procedure -> seed)
    ├── table/                  <- SQL tao bang (chay tu dong khi start)
    ├── procedure/              <- SQL stored procedures (chay tu dong khi start)
    ├── seed/                   <- SQL du lieu mau (chay tu dong khi start)
    └── test/                   <- SQL test cases (chay thu cong khi can)
```

> **Luu y:** `docker-entrypoint-initdb.d` chi chay **mot lan duy nhat** khi volume MySQL chua ton tai. Neu container da chay truoc do, init khong chay lai.

---

## Quick Start

```bash
cd DBMS/project

# Lan dau: khoi dong va init database tu dong
docker-compose up -d

# Kiem tra containers dang chay
docker-compose ps

# Xem log init (de xac nhan table/procedure/seed da load)
docker-compose logs mysql
```

Ket qua mong doi trong log:

```
[1/3] Creating tables...
[2/3] Creating stored procedures...
[3/3] Seeding data...
Database initialization complete!
```

**Truy cap phpMyAdmin:** http://localhost:8081  
**Login:** root / rootpassword (toan quyen) hoac dbuser / dbpassword

---

## Them SQL moi vao project

### 1. Them bang - `database/table/`

Dat ten theo format `[so]_[ten_table].sql`. So thu tu quyet dinh thu tu chay - bang co foreign key phai co so **lon hon** bang no tham chieu.

```sql
-- File: database/table/02_sessions.sql
-- Mo ta: Tao bang sessions
-- Tac gia: [Ten ban]
-- Ngay tao: [YYYY-MM-DD]
USE dbms_project;

DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
    session_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    started_at  DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Them stored procedure - `database/procedure/`

Dat ten theo format `sp_[chuc_nang].sql` hoac `fn_[chuc_nang].sql`.

```sql
-- File: database/procedure/sp_create_session.sql
-- Mo ta: Tao buoi hoc moi
-- Tac gia: [Ten ban]
-- Ngay tao: [YYYY-MM-DD]
USE dbms_project;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_create_session//

CREATE PROCEDURE sp_create_session(
    IN p_user_id    INT,
    IN p_started_at DATETIME
)
BEGIN
    INSERT INTO sessions (user_id, started_at) VALUES (p_user_id, p_started_at);
    SELECT LAST_INSERT_ID() AS session_id;
END//

DELIMITER ;
```

### 3. Them seed data - `database/seed/`

Dat ten theo format `[so]_seed_[table].sql`.

```sql
-- File: database/seed/02_seed_sessions.sql
-- Mo ta: Du lieu mau cho bang sessions
-- Tac gia: [Ten ban]
-- Ngay tao: [YYYY-MM-DD]
USE dbms_project;

INSERT IGNORE INTO sessions (session_id, user_id, started_at) VALUES
(1, 1, '2025-01-10 09:00:00'),
(2, 2, '2025-01-11 14:30:00');
```

---

## Ap dung thay doi sau khi da start container

Init script chi chay mot lan khi volume chua ton tai. Khi them file SQL moi, can chay thu cong:

```bash
# Chay 1 file SQL cu the
docker exec -i dbms_mysql mysql -u root -prootpassword < database/table/02_sessions.sql

# Chay lai toan bo mot folder (bash/Linux/Mac)
for f in $(ls database/procedure/*.sql | sort); do
    echo "Running $f..."
    docker exec -i dbms_mysql mysql -u root -prootpassword < "$f"
done
```

Tren **Windows PowerShell**:

```powershell
Get-ChildItem database\procedure\*.sql | Sort-Object Name | ForEach-Object {
    Write-Host "Running $($_.Name)..."
    docker exec -i dbms_mysql mysql -u root -prootpassword < $_.FullName
}
```

### Reset hoan toan (chay lai init tu dau)

```bash
# XOA HET DATA va chay lai init
docker-compose down -v
docker-compose up -d
```

---

## Chay test

Cac file trong `database/test/` **khong tu dong chay**. Thuc thi thu cong khi can kiem thu:

```bash
# Chay mot file test cu the
docker exec -i dbms_mysql mysql -u root -prootpassword < database/test/cleanup_examples.sql

# Chay tat ca test files theo thu tu
for f in $(ls database/test/*.sql | sort); do
    echo "=== Running test: $f ==="
    docker exec -i dbms_mysql mysql -u root -prootpassword < "$f"
done
```

> **Luu y:** Test file nen tu don dep du lieu test sau khi chay (DELETE hoac ROLLBACK) de khong anh huong den du lieu that.

---

## Cac lenh thuong dung

```bash
# Khoi dong
docker-compose up -d

# Dung (giu nguyen data)
docker-compose down

# Xem log realtime
docker-compose logs -f mysql

# Vao MySQL CLI
docker exec -it dbms_mysql mysql -u root -prootpassword dbms_project

# Kiem tra nhanh database
docker exec dbms_mysql mysql -u root -prootpassword -e "USE dbms_project; SHOW TABLES;"

# Backup
docker exec dbms_mysql mysqldump -u root -prootpassword dbms_project > backup_$(date +%Y%m%d).sql

# Restore tu backup
docker exec -i dbms_mysql mysql -u root -prootpassword dbms_project < backup.sql
```

---

## Naming Conventions

| Loai file | Format                      | Vi du                             |
| --------- | --------------------------- | --------------------------------- |
| Table     | `[so]_[ten_table].sql`      | `01_users.sql`, `02_sessions.sql` |
| Procedure | `sp_[chuc_nang].sql`        | `sp_create_session.sql`           |
| Function  | `fn_[chuc_nang].sql`        | `fn_calculate_fee.sql`            |
| Seed data | `[so]_seed_[table].sql`     | `01_seed_users.sql`               |
| Test      | `[so]_test_[tinh_nang].sql` | `01_test_crud.sql`                |

**Quy tac so thu tu:** Bang/seed phu thuoc (foreign key) phai co so **lon hon** bang duoc tham chieu.

---

## Git Workflow

```bash
# Tao branch cho tinh nang moi
git checkout -b feature/add-sessions-table

# Commit sau khi them file
git add database/table/02_sessions.sql database/seed/02_seed_sessions.sql
git commit -m "Add sessions table and seed data"

git push origin feature/add-sessions-table
```

**Checklist truoc khi commit:**

- [ ] File dat dung folder (`table/`, `procedure/`, `seed/`, `test/`)
- [ ] So thu tu dung (phu thuoc truoc, phu thuoc sau)
- [ ] Dau file co comment: ten file, mo ta, tac gia, ngay tao
- [ ] Co `USE dbms_project;` o dau moi file
- [ ] Test file co cleanup sau khi chay
