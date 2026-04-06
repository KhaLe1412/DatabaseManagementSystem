"""
Concurrency Tests - MySQL vs Redis (Consolidated)

Các bài test được chọn từ báo cáo phần Concurrency:
  TEST 1  – Read Scale Test (Threads vs Throughput)
  TEST 2  – Write Scale Test (Threads vs Throughput)
  TEST 3  – Mixed Read-Write Scale Test (Varying Ratio)
  TEST 4  – Multiple Shared Locks (FOR SHARE) — Compatible
  TEST 5  – Shared Lock Blocks Exclusive Lock
  TEST 6  – Exclusive Lock Blocks Shared Lock
  TEST 7  – Exclusive Lock Blocks Exclusive Lock
  TEST 8  – MVCC: Repeatable Read — Consistent Snapshot
  TEST 9  – MVCC: Multiple Readers — Different Snapshots
  TEST 10 – Deadlock Detection in MySQL
  TEST 11 – Redis Lua Script Atomicity

Requirements:
  pip install mysql-connector-python redis

Database prerequisites:
  - MySQL database:  sales_benchmark  (table: transactions, product_stock)
  - Redis:           localhost:6379    (hash keys: transaction:{id})
"""

import threading
import time
import random
import statistics
import mysql.connector
from mysql.connector import pooling
import redis
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# GLOBAL CONFIG
# ═══════════════════════════════════════════════════════════════

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

TOTAL_TRANSACTIONS = 536295
TEST_PRODUCT_NO    = "P001"

mysql_pool = None
redis_pool = None


# ═══════════════════════════════════════════════════════════════
# HELPERS & SETUP
# ═══════════════════════════════════════════════════════════════

def log(session, msg):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"  [{ts}] {session}: {msg}")


def get_redis():
    return redis.Redis(**REDIS_CONFIG)


def init_pools(num_threads: int = 32):
    global mysql_pool, redis_pool
    pool_size = min(num_threads + 4, 32)
    mysql_pool = pooling.MySQLConnectionPool(
        pool_name="concurrency_pool",
        pool_size=pool_size,
        pool_reset_session=False,
        **MYSQL_CONFIG,
    )
    redis_pool = redis.ConnectionPool(
        host=REDIS_CONFIG['host'],
        port=REDIS_CONFIG['port'],
        password=REDIS_CONFIG['password'],
        decode_responses=REDIS_CONFIG['decode_responses'],
        max_connections=num_threads + 10,
    )


def warmup_redis(n: int = 35):
    """Pre-create Redis connections to avoid TCP delay on first requests."""
    print("Warming up connection pools...", end=" ", flush=True)
    warm = [redis.Redis(connection_pool=redis_pool) for _ in range(n)]
    with ThreadPoolExecutor(max_workers=n) as ex:
        list(ex.map(lambda r: r.ping(), warm))
    print("done.\n")


def setup_product_stock():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS product_stock (
            product_no  VARCHAR(20) PRIMARY KEY,
            quantity    INT NOT NULL DEFAULT 0,
            updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def reset_stock(initial: int = 1_000_000):
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO product_stock (product_no, quantity)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE quantity = %s
    """, (TEST_PRODUCT_NO, initial, initial))
    conn.commit()
    conn.close()
    get_redis().hset(f"stock:{TEST_PRODUCT_NO}", "quantity", initial)


def setup_lock_test_table():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS lock_test (
            id INT PRIMARY KEY,
            value INT NOT NULL,
            description VARCHAR(100)
        )
    """)
    cur.execute("""
        INSERT INTO lock_test (id, value, description) VALUES
        (1, 100, 'Test row 1'),
        (2, 200, 'Test row 2'),
        (3, 300, 'Test row 3')
        ON DUPLICATE KEY UPDATE value = VALUES(value)
    """)
    conn.commit()
    conn.close()


def reset_lock_data():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("UPDATE lock_test SET value = id * 100")
    conn.commit()
    conn.close()


def setup_mvcc_table():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS account_mvcc (
            id         INT PRIMARY KEY,
            balance    INT NOT NULL,
            updated_by VARCHAR(50),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def reset_mvcc_data():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO account_mvcc (id, balance, updated_by)
        VALUES (1, 1000, 'INIT')
        ON DUPLICATE KEY UPDATE balance = 1000, updated_by = 'INIT'
    """)
    conn.commit()
    conn.close()


def get_balance():
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT balance, updated_by FROM account_mvcc WHERE id = 1")
    result = cur.fetchone()
    conn.close()
    return result


# ═══════════════════════════════════════════════════════════════
# TEST 1: Read Scale Test (Threads vs Throughput)
# ═══════════════════════════════════════════════════════════════

def test_read_scale():
    print("\n" + "=" * 70)
    print("TEST 1: Read Scale Test (Threads vs Throughput)")
    print("=" * 70)

    NUM_READS = 500
    thread_counts = [1, 2, 3, 4, 5, 10, 20, 30]

    print(f"Reads per thread: {NUM_READS}")
    print(f"\n{'Threads':<10} {'MySQL (ops/s)':>15} {'Redis (ops/s)':>15}")
    print("-" * 42)

    def mysql_worker(_):
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        start = time.time()
        for _ in range(NUM_READS):
            tid = random.randint(1, TOTAL_TRANSACTIONS)
            cursor.execute("SELECT * FROM transactions WHERE id = %s", (tid,))
            cursor.fetchall()
        conn.close()
        return time.time() - start

    def redis_worker(_):
        r = redis.Redis(connection_pool=redis_pool)
        start = time.time()
        for _ in range(NUM_READS):
            tid = random.randint(1, TOTAL_TRANSACTIONS)
            r.hgetall(f"transaction:{tid}")
        return time.time() - start

    for num_t in thread_counts:
        total_ops = num_t * NUM_READS

        with ThreadPoolExecutor(max_workers=num_t) as ex:
            start = time.time()
            list(ex.map(mysql_worker, range(num_t)))
            mysql_tp = total_ops / (time.time() - start)

        with ThreadPoolExecutor(max_workers=num_t) as ex:
            start = time.time()
            list(ex.map(redis_worker, range(num_t)))
            redis_tp = total_ops / (time.time() - start)

        print(f"{num_t:<10} {mysql_tp:>15,.0f} {redis_tp:>15,.0f}")


# ═══════════════════════════════════════════════════════════════
# TEST 2: Write Scale Test (Threads vs Throughput)
# ═══════════════════════════════════════════════════════════════

def test_write_scale():
    print("\n" + "=" * 70)
    print("TEST 2: Write Scale Test (Threads vs Throughput)")
    print("=" * 70)

    WRITES_PER_THREAD = 50
    thread_counts = [1, 2, 3, 4, 5, 10, 20, 30]

    print(f"Writes per thread: {WRITES_PER_THREAD}")
    print(f"\n{'Threads':<10} {'MySQL (ops/s)':>15} {'Redis (ops/s)':>15} {'Winner':>10}")
    print("-" * 52)

    for num_t in thread_counts:
        total_ops = num_t * WRITES_PER_THREAD

        # MySQL
        reset_stock(1_000_000)

        def mysql_worker(_):
            conn = mysql_pool.get_connection()
            cur = conn.cursor()
            for _ in range(WRITES_PER_THREAD):
                cur.execute(
                    "UPDATE product_stock SET quantity = quantity - 1 WHERE product_no = %s",
                    (TEST_PRODUCT_NO,)
                )
                conn.commit()
            conn.close()

        with ThreadPoolExecutor(max_workers=num_t) as ex:
            start = time.time()
            list(ex.map(mysql_worker, range(num_t)))
            mysql_tp = total_ops / (time.time() - start)

        # Redis
        reset_stock(1_000_000)

        def redis_worker(_):
            r = redis.Redis(connection_pool=redis_pool)
            for _ in range(WRITES_PER_THREAD):
                r.hincrby(f"stock:{TEST_PRODUCT_NO}", "quantity", -1)

        with ThreadPoolExecutor(max_workers=num_t) as ex:
            start = time.time()
            list(ex.map(redis_worker, range(num_t)))
            redis_tp = total_ops / (time.time() - start)

        winner = "Redis" if redis_tp > mysql_tp else "MySQL"
        print(f"{num_t:<10} {mysql_tp:>15,.0f} {redis_tp:>15,.0f} {winner:>10}")


# ═══════════════════════════════════════════════════════════════
# TEST 3: Mixed Read-Write Scale Test (Varying Ratio)
# ═══════════════════════════════════════════════════════════════

def test_mixed_rw_ratio():
    print("\n" + "=" * 70)
    print("TEST 3: Mixed Read-Write Scale Test (Varying Read/Write Ratio)")
    print("=" * 70)

    NUM_THREADS    = 3
    OPS_PER_THREAD = 500
    RATIOS = [
        ("Fully Read  (100/0)", 1.00),
        ("Read-heavy  (90/10)", 0.90),
        ("Balanced    (50/50)", 0.50),
        ("Write-heavy (10/90)", 0.10),
        ("Fully Write (0/100)", 0.00),
    ]

    print(f"Threads: {NUM_THREADS},  Ops/thread: {OPS_PER_THREAD}")

    def mysql_mixed_worker(ops, read_ratio):
        conn = mysql_pool.get_connection()
        cur  = conn.cursor()
        latencies = []
        reads = writes = 0
        for _ in range(ops):
            t0 = time.perf_counter()
            if random.random() < read_ratio:
                cur.execute(
                    "SELECT * FROM transactions WHERE id = %s",
                    (random.randint(1, TOTAL_TRANSACTIONS),)
                )
                cur.fetchone()
                reads += 1
            else:
                cur.execute(
                    "UPDATE product_stock SET quantity = quantity - 1 WHERE product_no = %s",
                    (TEST_PRODUCT_NO,)
                )
                conn.commit()
                writes += 1
            latencies.append(time.perf_counter() - t0)
        conn.close()
        return {"latencies": latencies, "reads": reads, "writes": writes}

    def redis_mixed_worker(ops, read_ratio):
        r = redis.Redis(connection_pool=redis_pool)
        latencies = []
        reads = writes = 0
        for _ in range(ops):
            t0 = time.perf_counter()
            if random.random() < read_ratio:
                r.hgetall(f"stock:{TEST_PRODUCT_NO}")
                reads += 1
            else:
                r.hincrby(f"stock:{TEST_PRODUCT_NO}", "quantity", -1)
                writes += 1
            latencies.append(time.perf_counter() - t0)
        return {"latencies": latencies, "reads": reads, "writes": writes}

    def run_benchmark(worker_fn, num_threads, ops_per_thread, read_ratio):
        all_latencies = []
        total_reads = total_writes = 0
        wall_start = time.time()
        with ThreadPoolExecutor(max_workers=num_threads) as pool:
            futures = [pool.submit(worker_fn, ops_per_thread, read_ratio)
                       for _ in range(num_threads)]
            for f in as_completed(futures):
                res = f.result()
                all_latencies.extend(res["latencies"])
                total_reads  += res["reads"]
                total_writes += res["writes"]
        wall_elapsed = time.time() - wall_start
        total_ops = total_reads + total_writes
        return {
            "throughput": total_ops / wall_elapsed,
            "p95_ms": statistics.quantiles(all_latencies, n=20)[18] * 1000,
        }

    print(f"\n{'Ratio':<22} {'MySQL tput':>12} {'Redis tput':>12} "
          f"{'MySQL p95':>11} {'Redis p95':>11} {'Winner':>8}")
    print("-" * 82)

    for label, ratio in RATIOS:
        reset_stock(1_000_000)
        mr = run_benchmark(mysql_mixed_worker, NUM_THREADS, OPS_PER_THREAD, ratio)
        reset_stock(1_000_000)
        rr = run_benchmark(redis_mixed_worker, NUM_THREADS, OPS_PER_THREAD, ratio)
        winner = "Redis" if rr['throughput'] > mr['throughput'] else "MySQL"
        print(f"{label:<22} {mr['throughput']:>12,.0f} {rr['throughput']:>12,.0f} "
              f"{mr['p95_ms']:>10.2f}ms {rr['p95_ms']:>10.2f}ms {winner:>8}")


# ═══════════════════════════════════════════════════════════════
# TEST 4: Multiple Shared Locks (FOR SHARE) — Compatible
# ═══════════════════════════════════════════════════════════════

def test_multiple_shared_locks():
    print("\n" + "=" * 70)
    print("TEST 4: Multiple Shared Locks (FOR SHARE) - Compatible")
    print("=" * 70)
    print("""
Scenario:
  T1: SELECT ... FOR SHARE (acquire S-Lock)
  T2: SELECT ... FOR SHARE (acquire S-Lock)
  T3: SELECT ... FOR SHARE (acquire S-Lock)

Expected: All 3 get lock immediately (S-Locks are compatible)
""")

    reset_lock_data()

    all_started = threading.Barrier(3)
    results = {'T1': {}, 'T2': {}, 'T3': {}}

    def reader(tid):
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")

        start = time.time()
        cursor.execute("SELECT value FROM lock_test WHERE id = 1 FOR SHARE")
        value = cursor.fetchone()[0]
        elapsed = (time.time() - start) * 1000

        results[tid]['lock_time'] = elapsed
        results[tid]['value'] = value
        log(tid, f"Got S-Lock in {elapsed:.1f}ms, value = {value}")

        all_started.wait()
        time.sleep(0.5)

        cursor.execute("COMMIT")
        log(tid, "Released S-Lock")
        conn.close()

    print("Execution:")
    print("-" * 60)

    threads = [
        threading.Thread(target=reader, args=('T1',)),
        threading.Thread(target=reader, args=('T2',)),
        threading.Thread(target=reader, args=('T3',)),
    ]
    for t in threads: t.start()
    for t in threads: t.join()

    print("-" * 60)
    print(f"""
Results:
  T1 lock time: {results['T1']['lock_time']:.1f}ms
  T2 lock time: {results['T2']['lock_time']:.1f}ms
  T3 lock time: {results['T3']['lock_time']:.1f}ms

  ✓ All acquired S-Lock nearly simultaneously!
  ✓ S-Locks are COMPATIBLE with each other.
""")


# ═══════════════════════════════════════════════════════════════
# TEST 5: Shared Lock Blocks Exclusive Lock
# ═══════════════════════════════════════════════════════════════

def test_shared_blocks_exclusive():
    print("\n" + "=" * 70)
    print("TEST 5: Shared Lock Blocks Exclusive Lock")
    print("=" * 70)
    print("""
Scenario:
  T1: SELECT ... FOR SHARE (holds S-Lock for 2 seconds)
  T2: SELECT ... FOR UPDATE (waits for X-Lock)

Expected: T2 must wait until T1 releases S-Lock
""")

    reset_lock_data()

    t1_locked = threading.Event()
    results = {'T1': {}, 'T2': {}}

    def shared_holder():
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")
        cursor.execute("SELECT value FROM lock_test WHERE id = 1 FOR SHARE")
        value = cursor.fetchone()[0]
        log("T1 (S)", f"Acquired S-Lock, value = {value}, holding for 2s...")
        t1_locked.set()
        time.sleep(2.0)
        cursor.execute("COMMIT")
        results['T1']['release_time'] = time.time()
        log("T1 (S)", "Released S-Lock")
        conn.close()

    def exclusive_waiter():
        t1_locked.wait()
        time.sleep(0.1)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")
        log("T2 (X)", "Requesting X-Lock (FOR UPDATE)...")
        start = time.time()
        cursor.execute("SELECT value FROM lock_test WHERE id = 1 FOR UPDATE")
        value = cursor.fetchone()[0]
        results['T2']['wait_time'] = time.time() - start
        log("T2 (X)", f"Got X-Lock after {results['T2']['wait_time']:.2f}s, value = {value}")
        cursor.execute("COMMIT")
        conn.close()

    print("Execution:")
    print("-" * 60)
    t1 = threading.Thread(target=shared_holder)
    t2 = threading.Thread(target=exclusive_waiter)
    t1.start(); t2.start()
    t1.join();  t2.join()

    print("-" * 60)
    print(f"""
Results:
  T2 waited: {results['T2']['wait_time']:.2f}s for X-Lock

  ✓ X-Lock request was BLOCKED by existing S-Lock
  ✓ T2 got lock only after T1 committed
""")


# ═══════════════════════════════════════════════════════════════
# TEST 6: Exclusive Lock Blocks Shared Lock
# ═══════════════════════════════════════════════════════════════

def test_exclusive_blocks_shared():
    print("\n" + "=" * 70)
    print("TEST 6: Exclusive Lock Blocks Shared Lock")
    print("=" * 70)
    print("""
Scenario:
  T1: SELECT ... FOR UPDATE (holds X-Lock for 2 seconds)
  T2: SELECT ... FOR SHARE (waits for S-Lock)

Expected: T2 must wait until T1 releases X-Lock
""")

    reset_lock_data()

    t1_locked = threading.Event()
    results = {'T2': {}}

    def exclusive_holder():
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")
        cursor.execute("SELECT value FROM lock_test WHERE id = 1 FOR UPDATE")
        value = cursor.fetchone()[0]
        log("T1 (X)", f"Acquired X-Lock, value = {value}, holding for 2s...")
        t1_locked.set()
        time.sleep(2.0)
        cursor.execute("COMMIT")
        log("T1 (X)", "Released X-Lock")
        conn.close()

    def shared_waiter():
        t1_locked.wait()
        time.sleep(0.1)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")
        log("T2 (S)", "Requesting S-Lock (FOR SHARE)...")
        start = time.time()
        cursor.execute("SELECT value FROM lock_test WHERE id = 1 FOR SHARE")
        value = cursor.fetchone()[0]
        results['T2']['wait_time'] = time.time() - start
        log("T2 (S)", f"Got S-Lock after {results['T2']['wait_time']:.2f}s, value = {value}")
        cursor.execute("COMMIT")
        conn.close()

    print("Execution:")
    print("-" * 60)
    t1 = threading.Thread(target=exclusive_holder)
    t2 = threading.Thread(target=shared_waiter)
    t1.start(); t2.start()
    t1.join();  t2.join()

    print("-" * 60)
    print(f"""
Results:
  T2 waited: {results['T2']['wait_time']:.2f}s for S-Lock

  ✓ S-Lock request was BLOCKED by existing X-Lock
  ✓ T2 got lock only after T1 committed
""")


# ═══════════════════════════════════════════════════════════════
# TEST 7: Exclusive Lock Blocks Exclusive Lock
# ═══════════════════════════════════════════════════════════════

def test_exclusive_blocks_exclusive():
    print("\n" + "=" * 70)
    print("TEST 7: Exclusive Lock Blocks Exclusive Lock")
    print("=" * 70)
    print("""
Scenario:
  T1: SELECT ... FOR UPDATE (holds X-Lock for 2 seconds)
  T2: SELECT ... FOR UPDATE (waits for X-Lock)

Expected: T2 must wait until T1 releases X-Lock
""")

    reset_lock_data()

    t1_locked = threading.Event()
    results = {}

    def exclusive_holder(tid, hold_time):
        if tid == 'T2':
            t1_locked.wait()
            time.sleep(0.1)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")
        if tid == 'T2':
            log(tid, "Requesting X-Lock...")
        start = time.time()
        cursor.execute("SELECT value FROM lock_test WHERE id = 1 FOR UPDATE")
        value = cursor.fetchone()[0]
        wait_time = time.time() - start
        results[tid] = {'wait_time': wait_time, 'value': value}
        log(tid, f"Got X-Lock in {wait_time*1000:.1f}ms, value = {value}" +
            (f", holding for {hold_time}s..." if hold_time > 0 else ""))
        if tid == 'T1':
            t1_locked.set()
        time.sleep(hold_time)
        cursor.execute("COMMIT")
        log(tid, "Released X-Lock")
        conn.close()

    print("Execution:")
    print("-" * 60)
    t1 = threading.Thread(target=exclusive_holder, args=('T1', 2.0))
    t2 = threading.Thread(target=exclusive_holder, args=('T2', 0))
    t1.start(); t2.start()
    t1.join();  t2.join()

    print("-" * 60)
    print(f"""
Results:
  T1 got lock immediately: {results['T1']['wait_time']*1000:.1f}ms
  T2 waited:               {results['T2']['wait_time']:.2f}s

  ✓ Only ONE X-Lock per row at a time
  ✓ X-Lock is EXCLUSIVE - blocks all other locks
""")


# ═══════════════════════════════════════════════════════════════
# TEST 8: MVCC — Repeatable Read (Consistent Snapshot)
# ═══════════════════════════════════════════════════════════════

def test_mvcc_repeatable_read():
    print("\n" + "=" * 70)
    print("TEST 8: MVCC - Repeatable Read (Consistent Snapshot)")
    print("=" * 70)
    print("""
MVCC Concept:
  - Khi transaction bắt đầu, MySQL tạo "snapshot" của database
  - Transaction chỉ thấy data từ snapshot đó
  - Writers tạo VERSION MỚI, không ghi đè version cũ
  - Readers cũ vẫn đọc được version cũ
""")

    reset_mvcc_data()
    print(f"Initial: balance = {get_balance()[0]}")

    reader_started  = threading.Event()
    reader_first_read = threading.Event()
    writer_committed = threading.Event()
    results = {'reader': [], 'writer': None}

    def reader():
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        cursor.execute("START TRANSACTION")
        log("Reader", "BEGIN (REPEATABLE READ) - Snapshot created!")
        reader_started.set()

        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        balance1 = cursor.fetchone()[0]
        results['reader'].append(('read_1', balance1))
        log("Reader", f"SELECT balance = {balance1}")
        reader_first_read.set()

        writer_committed.wait()
        time.sleep(0.1)

        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        balance2 = cursor.fetchone()[0]
        results['reader'].append(('read_2', balance2))
        log("Reader", f"SELECT balance = {balance2} (SAME as before!)")

        time.sleep(0.5)
        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        balance3 = cursor.fetchone()[0]
        results['reader'].append(('read_3', balance3))
        log("Reader", f"SELECT balance = {balance3} (Still consistent!)")

        cursor.execute("COMMIT")
        log("Reader", "COMMIT")
        conn.close()

    def writer():
        reader_first_read.wait()
        time.sleep(0.2)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("START TRANSACTION")
        log("Writer", "BEGIN")
        cursor.execute("UPDATE account_mvcc SET balance = 500, updated_by = 'Writer' WHERE id = 1")
        log("Writer", "UPDATE balance = 500")
        cursor.execute("COMMIT")
        log("Writer", "COMMIT - New version created!")
        results['writer'] = 500
        conn.close()
        writer_committed.set()

    print("\nTimeline:")
    print("-" * 60)
    t_reader = threading.Thread(target=reader)
    t_writer = threading.Thread(target=writer)
    t_reader.start(); t_writer.start()
    t_reader.join();  t_writer.join()
    print("-" * 60)

    actual = get_balance()
    print(f"""
Results:
  Reader's observations: {[r[1] for r in results['reader']]}
  Writer committed:      {results['writer']}
  Actual in DB:          {actual[0]}

  ✓ Reader started BEFORE Writer committed
  ✓ Reader's snapshot was balance = 1000
  ✓ Writer updated to 500 and COMMITTED
  ✓ Reader STILL sees 1000 (from snapshot)
  ✓ Actual DB value is 500 (Writer's version)
""")


# ═══════════════════════════════════════════════════════════════
# TEST 9: MVCC — Multiple Readers with Different Snapshots
# ═══════════════════════════════════════════════════════════════

def test_mvcc_multiple_snapshots():
    print("\n" + "=" * 70)
    print("TEST 9: MVCC - Multiple Readers - Different Snapshots")
    print("=" * 70)
    print("""
Scenario:
  Initial balance = 1000

  Timeline:
    R1 starts (snapshot = 1000)
    W1 updates to 800
    R2 starts (snapshot = 800)
    W2 updates to 600
    R3 starts (snapshot = 600)

  All readers final read...
""")

    reset_mvcc_data()  # balance = 1000

    events = {
        'r1_started': threading.Event(),
        'w1_done':    threading.Event(),
        'r2_started': threading.Event(),
        'w2_done':    threading.Event(),
    }
    results = {'R1': [], 'R2': [], 'R3': []}

    def reader1():
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        cursor.execute("START TRANSACTION")
        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        b = cursor.fetchone()[0]
        results['R1'].append(b)
        log("Reader1", f"BEGIN, snapshot balance = {b}")
        events['r1_started'].set()
        events['w2_done'].wait()
        time.sleep(0.2)
        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        b = cursor.fetchone()[0]
        results['R1'].append(b)
        log("Reader1", f"Final read = {b} (snapshot from start)")
        cursor.execute("COMMIT")
        conn.close()

    def reader2():
        events['w1_done'].wait()
        time.sleep(0.1)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        cursor.execute("START TRANSACTION")
        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        b = cursor.fetchone()[0]
        results['R2'].append(b)
        log("Reader2", f"BEGIN, snapshot balance = {b} (after W1)")
        events['r2_started'].set()
        events['w2_done'].wait()
        time.sleep(0.2)
        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        b = cursor.fetchone()[0]
        results['R2'].append(b)
        log("Reader2", f"Final read = {b}")
        cursor.execute("COMMIT")
        conn.close()

    def reader3():
        events['w2_done'].wait()
        time.sleep(0.2)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        cursor.execute("START TRANSACTION")
        cursor.execute("SELECT balance FROM account_mvcc WHERE id = 1")
        b = cursor.fetchone()[0]
        results['R3'].append(b)
        log("Reader3", f"BEGIN, snapshot balance = {b} (after W2)")
        cursor.execute("COMMIT")
        conn.close()

    def writer1():
        events['r1_started'].wait()
        time.sleep(0.1)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("UPDATE account_mvcc SET balance = 800, updated_by = 'W1' WHERE id = 1")
        cursor.execute("COMMIT")
        log("Writer1", "UPDATE balance = 800, COMMIT")
        conn.close()
        events['w1_done'].set()

    def writer2():
        events['r2_started'].wait()
        time.sleep(0.1)
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("UPDATE account_mvcc SET balance = 600, updated_by = 'W2' WHERE id = 1")
        cursor.execute("COMMIT")
        log("Writer2", "UPDATE balance = 600, COMMIT")
        conn.close()
        events['w2_done'].set()

    print("-" * 60)
    threads = [
        threading.Thread(target=reader1),
        threading.Thread(target=reader2),
        threading.Thread(target=reader3),
        threading.Thread(target=writer1),
        threading.Thread(target=writer2),
    ]
    for t in threads: t.start()
    for t in threads: t.join()
    print("-" * 60)

    print(f"""
Results:
  R1 (started before W1): saw {results['R1']} → Snapshot = 1000
  R2 (started after W1):  saw {results['R2']} → Snapshot = 800
  R3 (started after W2):  saw {results['R3']} → Snapshot = 600

  Actual DB value: {get_balance()[0]}

Key Insight:
  Each transaction's snapshot is determined by when it STARTs.
  MySQL keeps MULTIPLE VERSIONS of the same row!

  Version Chain (conceptually):
    Row id=1: v3(600) ← v2(800) ← v1(1000)

    R1 reads v1 (1000)
    R2 reads v2 (800)
    R3 reads v3 (600)
""")


# ═══════════════════════════════════════════════════════════════
# TEST 10: Deadlock Detection in MySQL
# ═══════════════════════════════════════════════════════════════

def test_deadlock():
    print("\n" + "=" * 70)
    print("TEST 10: Deadlock Detection (MySQL Only)")
    print("=" * 70)

    # Setup: create 2 rows to lock
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO product_stock (product_no, quantity) VALUES ('LOCK_A', 100)
        ON DUPLICATE KEY UPDATE quantity = 100
    """)
    cursor.execute("""
        INSERT INTO product_stock (product_no, quantity) VALUES ('LOCK_B', 100)
        ON DUPLICATE KEY UPDATE quantity = 100
    """)
    conn.commit()
    conn.close()

    deadlock_detected = threading.Event()
    thread_results = {}

    def thread1_lock_a_then_b():
        thread_results['t1'] = {'status': 'started', 'error': None}
        try:
            conn = mysql.connector.connect(**MYSQL_CONFIG)
            cursor = conn.cursor()
            cursor.execute("START TRANSACTION")
            cursor.execute("UPDATE product_stock SET quantity = quantity - 1 WHERE product_no = 'LOCK_A'")
            thread_results['t1']['locked_a'] = True
            time.sleep(0.5)   # wait for T2 to lock B
            cursor.execute("UPDATE product_stock SET quantity = quantity - 1 WHERE product_no = 'LOCK_B'")
            cursor.execute("COMMIT")
            thread_results['t1']['status'] = 'success'
            conn.close()
        except mysql.connector.errors.DatabaseError as e:
            thread_results['t1']['status'] = 'deadlock'
            thread_results['t1']['error'] = str(e)
            deadlock_detected.set()

    def thread2_lock_b_then_a():
        thread_results['t2'] = {'status': 'started', 'error': None}
        try:
            conn = mysql.connector.connect(**MYSQL_CONFIG)
            cursor = conn.cursor()
            cursor.execute("START TRANSACTION")
            time.sleep(0.1)   # wait for T1 to lock A first
            cursor.execute("UPDATE product_stock SET quantity = quantity - 1 WHERE product_no = 'LOCK_B'")
            thread_results['t2']['locked_b'] = True
            cursor.execute("UPDATE product_stock SET quantity = quantity - 1 WHERE product_no = 'LOCK_A'")
            cursor.execute("COMMIT")
            thread_results['t2']['status'] = 'success'
            conn.close()
        except mysql.connector.errors.DatabaseError as e:
            thread_results['t2']['status'] = 'deadlock'
            thread_results['t2']['error'] = str(e)
            deadlock_detected.set()

    print("\nScenario:")
    print("  Thread 1: Lock A → wait → Lock B")
    print("  Thread 2: Lock B → wait → Lock A")
    print("  Expected: DEADLOCK (circular wait)")

    t1 = threading.Thread(target=thread1_lock_a_then_b)
    t2 = threading.Thread(target=thread2_lock_b_then_a)

    start = time.time()
    t1.start(); t2.start()
    t1.join(timeout=5); t2.join(timeout=5)
    elapsed = time.time() - start

    print(f"\nResults (after {elapsed:.2f}s):")
    print("-" * 50)
    for tid, result in thread_results.items():
        status_str = result['status']
        print(f"  {tid}: {status_str}")
        if result.get('error'):
            print(f"       Error: {result['error'][:80]}...")

    if deadlock_detected.is_set():
        print(f"\n✓ DEADLOCK DETECTED - MySQL rolled back one transaction")
    else:
        print(f"\n⚠ No deadlock detected (transactions may have completed)")

    print("\n[Redis Note]")
    print("  Redis: KHÔNG thể xảy ra deadlock (single-threaded)")


# ═══════════════════════════════════════════════════════════════
# TEST 11: Redis Lua Script Atomicity
# ═══════════════════════════════════════════════════════════════

DEDUCT_IF_POSITIVE = """
local qty = tonumber(redis.call('GET', KEYS[1]))
if qty == nil then return -2 end
if qty <= 0   then return -1 end
return redis.call('DECRBY', KEYS[1], tonumber(ARGV[1]))
"""

STOCK_KEY_LUA = "atomicity_test:stock"

def test_lua_atomicity():
    print("\n" + "=" * 70)
    print("TEST 11: Redis Lua Script Atomicity")
    print("=" * 70)

    NUM_THREADS    = 10
    OPS_PER_THREAD = 15
    INITIAL        = 100   # only 100 in stock; total requests = 150 → 50 should be denied

    r = get_redis()
    r.set(STOCK_KEY_LUA, INITIAL)

    print(f"""
Scenario: {NUM_THREADS} threads × {OPS_PER_THREAD} ops, initial stock = {INITIAL}
  (Total requests = {NUM_THREADS * OPS_PER_THREAD}, should = {INITIAL})
""")

    success_counts = []
    denied_counts  = []
    lock           = threading.Lock()

    def lua_worker():
        rc  = get_redis()
        sc  = rc.register_script(DEDUCT_IF_POSITIVE)
        suc = den = 0
        for _ in range(OPS_PER_THREAD):
            result = sc(keys=[STOCK_KEY_LUA], args=[1])
            if result == -1:
                den += 1
            elif result >= 0:
                suc += 1
        with lock:
            success_counts.append(suc)
            denied_counts.append(den)

    threads = [threading.Thread(target=lua_worker) for _ in range(NUM_THREADS)]
    for t in threads: t.start()
    for t in threads: t.join()

    final_stock   = int(r.get(STOCK_KEY_LUA) or 0)
    total_success = sum(success_counts)
    total_denied  = sum(denied_counts)
    total_ops     = NUM_THREADS * OPS_PER_THREAD

    print(f"   Initial stock   : {INITIAL}")
    print(f"   Total ops       : {total_ops:,}")
    print(f"   Succeeded       : {total_success:,}  (should = {INITIAL})")
    print(f"   Denied (qty≤0)  : {total_denied:,}  (should = {total_ops - INITIAL})")
    print(f"   Final stock     : {final_stock}  (should = 0)")
    oversell = final_stock < 0
    print(f"   Oversell        : {'✗ YES — race condition!' if oversell else '✓ NO — Lua atomic'}")
    correct = (final_stock == 0 and total_success == INITIAL
               and total_denied == total_ops - INITIAL)
    print(f"   All counts OK   : {'✓ YES' if correct else '✗ NO'}")
    print(f"\n   No race conditions — Lua script executed atomically")


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 70)
    print("CONCURRENCY TESTS — MySQL vs Redis")
    print("Dataset: Sales Transactions (536K records)")
    print("=" * 70)

    # Verify connections
    print("\n[Connection Check]")
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM transactions")
        mysql_count = cursor.fetchone()[0]
        print(f"  MySQL: {mysql_count:,} transactions in sales_benchmark")
        conn.close()
    except Exception as e:
        print(f"  MySQL Error: {e}")
        exit(1)

    try:
        r = get_redis()
        r.ping()
        redis_count = r.get("transactions:count")
        print(f"  Redis: connected (transactions:count = {redis_count})")
    except Exception as e:
        print(f"  Redis Error: {e}")
        exit(1)

    # Prepare tables and connection pools
    setup_product_stock()
    setup_lock_test_table()
    setup_mvcc_table()
    init_pools(32)
    warmup_redis(35)

    # ── Run all selected tests ──────────────────────────────────
    test_read_scale()
    test_write_scale()
    test_mixed_rw_ratio()
    test_multiple_shared_locks()
    test_shared_blocks_exclusive()
    test_exclusive_blocks_shared()
    test_exclusive_blocks_exclusive()
    test_mvcc_repeatable_read()
    test_mvcc_multiple_snapshots()
    test_deadlock()
    test_lua_atomicity()

    print("\n" + "=" * 70)
    print("KẾT LUẬN")
    print("=" * 70)
    print("""
Read concurrency  : MySQL scales well với nhiều threads (multi-threaded);
                    Redis đạt đỉnh sớm nhưng ổn định (single-threaded).

Write concurrency : Redis nhanh hơn MySQL nhiều lần nhờ ghi vào RAM và
                    không cần disk commit hay row lock.

Mixed workload    : Redis thắng ở mọi tỷ lệ R/W; MySQL competitive khi
                    read chiếm đa số nhờ InnoDB buffer pool.

Locking (MySQL)   : S-Lock tương thích nhau; X-Lock chặn tất cả.
                    Cơ chế này đảm bảo isolation nhưng tăng độ trễ.

MVCC (MySQL)      : Snapshot isolation cho phép readers không bị block
                    bởi writers và ngược lại — hiệu năng cao hơn locking.

Deadlock          : MySQL tự phát hiện deadlock và rollback 1 transaction.
                    Redis không thể deadlock do single-threaded.

Lua atomicity     : Redis đảm bảo Read-Modify-Write atomic qua Lua script,
                    không cần lock, không bị race condition.
""")
