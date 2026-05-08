"""
Redis Concurrency Tests — Locking, MVCC, Deadlock Equivalents

Bộ test này là phiên bản Redis tương đương với MySQL Tests 4–10.
Mục tiêu: kiểm tra Redis có các cơ chế Lock/MVCC/Deadlock không và xử lý ra sao.

  TEST R4  – Concurrent Reads     ↔ MySQL Test 4  (Multiple Shared Locks)
  TEST R5  – Read Does Not Block Write ↔ MySQL Test 5  (S blocks X)
  TEST R6  – Write Does Not Block Read ↔ MySQL Test 6  (X blocks S)
  TEST R7  – Race Condition: Unprotected Concurrent Writes ↔ MySQL Test 7 (X blocks X)
  TEST R8  – No MVCC: Always Reads Latest ↔ MySQL Test 8  (Repeatable Read)
  TEST R9  – No Snapshot Isolation  ↔ MySQL Test 9  (Multiple Snapshots)
  TEST R10 – No Deadlock Possible   ↔ MySQL Test 10 (Deadlock Detection)
  TEST R11 – WATCH/MULTI/EXEC — Optimistic Locking (Redis alternative to X-Lock)

Requirements:
  pip install redis

Redis prerequisites:
  - Redis running at localhost:6379
"""

import threading
import time
from datetime import datetime
import redis

# ═══════════════════════════════════════════════════════════════
# CONFIG & HELPERS
# ═══════════════════════════════════════════════════════════════

REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'password': None,
    'decode_responses': True,
}

TEST_KEY      = "redis_test:value"
TEST_STOCK    = "redis_test:stock"


def get_redis() -> redis.Redis:
    return redis.Redis(**REDIS_CONFIG)


def log(session: str, msg: str):
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"  [{ts}] {session}: {msg}")


def reset_value(val: int = 1000):
    get_redis().set(TEST_KEY, val)


def reset_stock(val: int = 100):
    get_redis().set(TEST_STOCK, val)


# ═══════════════════════════════════════════════════════════════
# TEST R4: Concurrent Reads — No Locking Required
# ═══════════════════════════════════════════════════════════════

def test_r4_concurrent_reads():
    print("\n" + "=" * 70)
    print("TEST R4: Concurrent Reads — No Locking Required")
    print("         (MySQL equivalent: Test 4 — Multiple Shared Locks)")
    print("=" * 70)
    print("""
MySQL: Mỗi thread phải "xin" S-Lock từ lock manager.
Redis: Không có khái niệm S-Lock — mọi GET đều tức thì, không cần xin phép.

Scenario:
  T1, T2, T3 cùng đọc key "redis_test:value" đồng thời
  Expected: Tất cả đọc được ngay, không có thread nào phải chờ
""")

    reset_value(1000)
    results = {}
    all_ready = threading.Barrier(3)

    def reader(tid: str):
        r = get_redis()
        all_ready.wait()              # đồng bộ: cả 3 bắt đầu cùng lúc
        t0 = time.perf_counter()
        val = r.get(TEST_KEY)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        results[tid] = {'value': val, 'elapsed_ms': elapsed_ms}
        log(tid, f"GET = {val}  (took {elapsed_ms:.2f}ms — no lock wait)")

    threads = [threading.Thread(target=reader, args=(f"T{i}",)) for i in range(1, 4)]
    print("Execution:")
    print("-" * 60)
    for t in threads: t.start()
    for t in threads: t.join()
    print("-" * 60)

    times = [results[f"T{i}"]['elapsed_ms'] for i in range(1, 4)]
    print(f"""
Results:
  T1 response time : {times[0]:.2f}ms
  T2 response time : {times[1]:.2f}ms
  T3 response time : {times[2]:.2f}ms

Conclusion:
  ✓ Redis KHÔNG có S-Lock — không có lock acquisition overhead
  ✓ Mọi read đều tức thì, không có thread nào bị block
  ✗ Không có cơ chế "lock compatibility matrix" như MySQL
""")


# ═══════════════════════════════════════════════════════════════
# TEST R5: Read Does Not Block Write
# ═══════════════════════════════════════════════════════════════

def test_r5_read_does_not_block_write():
    print("\n" + "=" * 70)
    print("TEST R5: Read Does Not Block Write")
    print("         (MySQL equivalent: Test 5 — S-Lock blocks X-Lock)")
    print("=" * 70)
    print("""
MySQL: T1 giữ S-Lock 2 giây → T2 muốn X-Lock phải CHỜ 2 giây.
Redis: Không có lock → T2 (write) không cần đợi T1 (read) hoàn thành.

Scenario:
  T1: liên tục GET trong 2 giây (giả lập "đang đọc lâu")
  T2: SET value = 999 ngay sau khi T1 bắt đầu
  Expected: T2 ghi thành công ngay, không bị block bởi T1
""")

    reset_value(1000)
    results = {}
    t1_reading = threading.Event()

    def slow_reader():
        r = get_redis()
        log("T1 (reader)", "Bắt đầu đọc liên tục trong 2 giây...")
        t1_reading.set()
        start = time.time()
        read_count = 0
        while time.time() - start < 2.0:
            r.get(TEST_KEY)
            read_count += 1
        log("T1 (reader)", f"Kết thúc sau {read_count} lần đọc")
        results['T1'] = {'read_count': read_count}

    def writer():
        t1_reading.wait()
        time.sleep(0.1)              # để T1 đang đọc chắc chắn
        r = get_redis()
        log("T2 (writer)", "Muốn SET value = 999 — đợi không?")
        t0 = time.perf_counter()
        r.set(TEST_KEY, 999)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        results['T2'] = {'elapsed_ms': elapsed_ms}
        log("T2 (writer)", f"SET hoàn thành sau {elapsed_ms:.2f}ms (KHÔNG bị block!)")

    print("Execution:")
    print("-" * 60)
    t1 = threading.Thread(target=slow_reader)
    t2 = threading.Thread(target=writer)
    t1.start(); t2.start()
    t1.join(); t2.join()
    print("-" * 60)

    final = get_redis().get(TEST_KEY)
    print(f"""
Results:
  T2 write latency : {results['T2']['elapsed_ms']:.2f}ms  (MySQL: ~2000ms)
  Final value      : {final}  (Writer succeeded mid-read)

Conclusion:
  ✓ Redis: Read KHÔNG block Write
  ✗ MySQL: S-Lock CHẶN X-Lock cho đến khi S-Lock được release
  → Redis có throughput cao hơn nhưng KHÔNG đảm bảo read isolation
""")


# ═══════════════════════════════════════════════════════════════
# TEST R6: Write Does Not Block Read
# ═══════════════════════════════════════════════════════════════

def test_r6_write_does_not_block_read():
    print("\n" + "=" * 70)
    print("TEST R6: Write Does Not Block Read")
    print("         (MySQL equivalent: Test 6 — X-Lock blocks S-Lock)")
    print("=" * 70)
    print("""
MySQL: T1 giữ X-Lock 2 giây → T2 muốn S-Lock phải CHỜ 2 giây.
Redis: SET một lệnh tức thì (microseconds) — không "giữ lock" lâu được.

Scenario:
  T1: SET value = 500 (write — xong ngay)
  T2: GET liên tục trong suốt quá trình — không bị chặn lần nào
  Expected: T2 không bao giờ bị block; thấy giá trị cũ hoặc mới tùy timing
""")

    reset_value(1000)
    results = {'T2_values': [], 'T2_blocked': False}
    t1_done = threading.Event()

    def writer():
        r = get_redis()
        time.sleep(0.3)              # chờ T2 đang đọc ổn định
        log("T1 (writer)", "SET value = 500")
        t0 = time.perf_counter()
        r.set(TEST_KEY, 500)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        log("T1 (writer)", f"SET hoàn thành sau {elapsed_ms:.3f}ms")
        t1_done.set()

    def continuous_reader():
        r = get_redis()
        log("T2 (reader)", "Bắt đầu đọc liên tục...")
        deadline = time.time() + 1.0
        while time.time() < deadline:
            t0 = time.perf_counter()
            val = r.get(TEST_KEY)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            results['T2_values'].append((val, elapsed_ms))
            if elapsed_ms > 50:      # >50ms là dấu hiệu bị block
                results['T2_blocked'] = True
        log("T2 (reader)", f"Kết thúc sau {len(results['T2_values'])} lần đọc")

    print("Execution:")
    print("-" * 60)
    t1 = threading.Thread(target=writer)
    t2 = threading.Thread(target=continuous_reader)
    t1.start(); t2.start()
    t1.join(); t2.join()
    print("-" * 60)

    values_seen = sorted(set(v for v, _ in results['T2_values']))
    max_latency = max(ms for _, ms in results['T2_values'])
    print(f"""
Results:
  T2 số lần đọc      : {len(results['T2_values'])}
  Giá trị T2 thấy    : {values_seen}  (thấy cả 1000 và 500 — không bị block)
  T2 max latency     : {max_latency:.2f}ms
  T2 bị block        : {'CÓ' if results['T2_blocked'] else 'KHÔNG'}

Conclusion:
  ✓ Redis: Write KHÔNG block Read
  ✗ MySQL: X-Lock CHẶN S-Lock cho đến khi X-Lock được release
  → T2 thấy được cả giá trị cũ (1000) và mới (500) — đây là "read uncommitted"
    tương đương, Redis không có isolation level cho reads thông thường
""")


# ═══════════════════════════════════════════════════════════════
# TEST R7: Race Condition — Unprotected Concurrent Writes
# ═══════════════════════════════════════════════════════════════

def test_r7_race_condition():
    print("\n" + "=" * 70)
    print("TEST R7: Race Condition — Unprotected Concurrent Writes (GET+SET)")
    print("         (MySQL equivalent: Test 7 — X-Lock blocks X-Lock)")
    print("=" * 70)
    print("""
MySQL: X-Lock đảm bảo chỉ 1 writer tại một thời điểm → không mất update.
Redis: Không có X-Lock — GET+SET không atomic → có thể mất update (lost update).

Scenario: 3 threads, mỗi thread thực hiện 50 lần: GET → giảm 1 → SET
  Nếu không có race condition: stock cuối = 1000 - (3 × 50) = 850
  Nếu có race condition:       stock cuối > 850  (một số updates bị mất)
""")

    THREADS    = 3
    OPS        = 50
    INITIAL    = 1000
    EXPECTED   = INITIAL - THREADS * OPS

    reset_value(INITIAL)
    results = {'lost_updates': 0}
    lock = threading.Lock()

    def unsafe_worker(tid: str):
        r = get_redis()
        local_lost = 0
        for _ in range(OPS):
            current = int(r.get(TEST_KEY) or 0)
            time.sleep(0.0001)       # giả lập xử lý giữa GET và SET → tăng xác suất race
            new_val = current - 1
            r.set(TEST_KEY, new_val)
        with lock:
            results['lost_updates'] += local_lost
        log(tid, f"Hoàn thành {OPS} ops (unsafe GET+SET)")

    print("Execution (unsafe GET+SET without protection):")
    print("-" * 60)
    threads = [threading.Thread(target=unsafe_worker, args=(f"T{i}",))
               for i in range(1, THREADS + 1)]
    for t in threads: t.start()
    for t in threads: t.join()
    print("-" * 60)

    actual = int(get_redis().get(TEST_KEY) or 0)
    lost   = actual - EXPECTED
    print(f"""
Results (Unprotected GET+SET):
  Initial stock  : {INITIAL}
  Expected final : {EXPECTED}  ({THREADS} threads × {OPS} ops)
  Actual final   : {actual}
  Lost updates   : {lost}  (actual > expected → race condition xảy ra)

Giải thích:
  T1 GET=950, T2 GET=950 (cùng lúc)
  T1 SET=949, T2 SET=949  (cả hai ghi 949 thay vì T2 phải ghi 948)
  → Một lần giảm bị mất!

Conclusion:
  ✗ Redis GET+SET KHÔNG atomic → lost update khi concurrent write
  ✓ MySQL X-Lock đảm bảo serialized write, không mất update
  → Redis cần dùng INCR/DECR hoặc Lua script để đảm bảo atomicity
""")

    # Phần 2: Dùng DECR (atomic) → không race condition
    print("-" * 60)
    print("Bonus: Dùng DECR (atomic command) — không race condition")
    print("-" * 60)

    reset_value(INITIAL)

    def safe_worker(tid: str):
        r = get_redis()
        for _ in range(OPS):
            r.decr(TEST_KEY)
        log(tid, f"Hoàn thành {OPS} ops (atomic DECR)")

    threads = [threading.Thread(target=safe_worker, args=(f"T{i}",))
               for i in range(1, THREADS + 1)]
    for t in threads: t.start()
    for t in threads: t.join()

    actual_safe = int(get_redis().get(TEST_KEY) or 0)
    print(f"""
Results (Atomic DECR):
  Initial stock  : {INITIAL}
  Expected final : {EXPECTED}
  Actual final   : {actual_safe}
  Correct        : {'✓ YES — no race condition' if actual_safe == EXPECTED else '✗ NO'}
""")


# ═══════════════════════════════════════════════════════════════
# TEST R8: No MVCC — Always Reads Latest Value
# ═══════════════════════════════════════════════════════════════

def test_r8_no_mvcc():
    print("\n" + "=" * 70)
    print("TEST R8: No MVCC — Redis Always Reads Latest Value")
    print("         (MySQL equivalent: Test 8 — MVCC Repeatable Read)")
    print("=" * 70)
    print("""
MySQL (REPEATABLE READ): Reader thấy snapshot tại thời điểm BEGIN transaction.
Redis: KHÔNG có transaction isolation — mỗi GET trả về giá trị HIỆN TẠI nhất.

Scenario (mirror Test 8):
  balance = 1000
  Reader: đọc balance 3 lần (trước/sau/sau khi Writer commit)
  Writer: SET balance = 500 và kết thúc

  MySQL: Reader thấy [1000, 1000, 1000] (snapshot isolation)
  Redis: Reader thấy [1000, 500, 500]   (luôn đọc giá trị mới nhất)
""")

    reset_value(1000)
    results = {'reader_values': [], 'writer_done': False}
    reader_first_read  = threading.Event()
    writer_committed   = threading.Event()

    def reader():
        r = get_redis()
        log("Reader", "Bắt đầu đọc (không có 'BEGIN TRANSACTION' trong Redis)")

        val1 = int(r.get(TEST_KEY))
        results['reader_values'].append(val1)
        log("Reader", f"Lần 1: GET = {val1}")
        reader_first_read.set()

        writer_committed.wait()      # đợi Writer thay đổi giá trị
        time.sleep(0.05)

        val2 = int(r.get(TEST_KEY))
        results['reader_values'].append(val2)
        log("Reader", f"Lần 2: GET = {val2}  {'(thấy giá trị MỚI — khác MySQL!)' if val2 != val1 else '(giống cũ)'}")

        time.sleep(0.3)
        val3 = int(r.get(TEST_KEY))
        results['reader_values'].append(val3)
        log("Reader", f"Lần 3: GET = {val3}")
        log("Reader", "Kết thúc")

    def writer():
        reader_first_read.wait()
        time.sleep(0.1)
        r = get_redis()
        log("Writer", "SET balance = 500")
        r.set(TEST_KEY, 500)
        log("Writer", "Xong (không có COMMIT — không có transaction)")
        results['writer_done'] = True
        writer_committed.set()

    print("\nTimeline:")
    print("-" * 60)
    t_r = threading.Thread(target=reader)
    t_w = threading.Thread(target=writer)
    t_r.start(); t_w.start()
    t_r.join(); t_w.join()
    print("-" * 60)

    print(f"""
Results:
  Reader thấy      : {results['reader_values']}
  Writer đã đổi    : 1000 → 500

  MySQL (REPEATABLE READ): Reader thấy [1000, 1000, 1000]  ← snapshot cũ
  Redis (không MVCC)     : Reader thấy {results['reader_values']}  ← luôn latest

Conclusion:
  ✗ Redis KHÔNG có MVCC — không có snapshot, không có transaction isolation
  ✗ Redis KHÔNG có BEGIN/COMMIT cho isolation (MULTI/EXEC chỉ là batching)
  → Mỗi GET là một lần đọc độc lập, luôn trả về giá trị hiện tại
  → Nếu cần "read your own writes" hoặc consistent view, phải dùng Lua
""")


# ═══════════════════════════════════════════════════════════════
# TEST R9: No Snapshot Isolation — All Readers See Current State
# ═══════════════════════════════════════════════════════════════

def test_r9_no_snapshot_isolation():
    print("\n" + "=" * 70)
    print("TEST R9: No Snapshot Isolation — All Readers See Current State")
    print("         (MySQL equivalent: Test 9 — Multiple Readers, Different Snapshots)")
    print("=" * 70)
    print("""
MySQL: R1 bắt trước W1 → thấy 1000; R2 bắt sau W1 → thấy 800.
Redis: Tất cả readers đều thấy GIÁ TRỊ HIỆN TẠI tại thời điểm GET.
       Không có "snapshot theo transaction start time".

Scenario (mirror Test 9):
  balance = 1000
  R1 bắt đầu, W1 SET 800, R2 bắt đầu, W2 SET 600, R3 bắt đầu
  Tất cả đọc lại → Redis: cả 3 đều thấy 600 (current value)
""")

    reset_value(1000)
    results   = {'R1': [], 'R2': [], 'R3': []}
    events = {
        'r1_read1': threading.Event(),
        'w1_done':  threading.Event(),
        'r2_read1': threading.Event(),
        'w2_done':  threading.Event(),
    }

    def reader1():
        r = get_redis()
        v = int(r.get(TEST_KEY))
        results['R1'].append(v)
        log("R1", f"Lần 1: GET = {v}")
        events['r1_read1'].set()
        events['w2_done'].wait()
        time.sleep(0.1)
        v = int(r.get(TEST_KEY))
        results['R1'].append(v)
        log("R1", f"Lần 2 (final): GET = {v}  (không có snapshot — thấy giá trị mới!)")

    def reader2():
        events['w1_done'].wait()
        time.sleep(0.05)
        r = get_redis()
        v = int(r.get(TEST_KEY))
        results['R2'].append(v)
        log("R2", f"Lần 1: GET = {v}  (after W1)")
        events['r2_read1'].set()
        events['w2_done'].wait()
        time.sleep(0.1)
        v = int(r.get(TEST_KEY))
        results['R2'].append(v)
        log("R2", f"Lần 2 (final): GET = {v}")

    def reader3():
        events['w2_done'].wait()
        time.sleep(0.1)
        r = get_redis()
        v = int(r.get(TEST_KEY))
        results['R3'].append(v)
        log("R3", f"Lần 1: GET = {v}  (after W2)")

    def writer1():
        events['r1_read1'].wait()
        time.sleep(0.05)
        r = get_redis()
        r.set(TEST_KEY, 800)
        log("W1", "SET = 800")
        events['w1_done'].set()

    def writer2():
        events['r2_read1'].wait()
        time.sleep(0.05)
        r = get_redis()
        r.set(TEST_KEY, 600)
        log("W2", "SET = 600")
        events['w2_done'].set()

    print("\nTimeline:")
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
  R1 thấy : {results['R1']}
  R2 thấy : {results['R2']}
  R3 thấy : {results['R3']}

  MySQL (MVCC):
    R1 → [1000, 1000]   (snapshot khi BEGIN)
    R2 → [800,  800 ]   (snapshot sau W1)
    R3 → [600       ]   (snapshot sau W2)

  Redis (no snapshot):
    R1 → {results['R1']} ← thấy 600 ở lần đọc cuối dù "bắt đầu" trước W1!
    R2 → {results['R2']}
    R3 → {results['R3']}

Conclusion:
  ✗ Redis KHÔNG có version chain, KHÔNG lưu lịch sử phiên bản
  ✗ Không có khái niệm "snapshot per transaction"
  → Mỗi GET là independent read, luôn thấy giá trị mới nhất trong DB
""")


# ═══════════════════════════════════════════════════════════════
# TEST R10: No Deadlock Possible — Single-Threaded Event Loop
# ═══════════════════════════════════════════════════════════════

def test_r10_no_deadlock():
    print("\n" + "=" * 70)
    print("TEST R10: No Deadlock Possible — Redis Single-Threaded Event Loop")
    print("          (MySQL equivalent: Test 10 — Deadlock Detection)")
    print("=" * 70)
    print("""
MySQL: T1 lock A → T2 lock B → T1 chờ B → T2 chờ A → DEADLOCK.
Redis: Không có lock → không có circular wait → deadlock không thể xảy ra.

Scenario: Tái hiện y chang Test 10 của MySQL với Redis + WATCH:
  T1: WATCH A → SET A → đợi 0.5s → WATCH B → SET B
  T2: WATCH B → SET B → WATCH A → SET A
  Sẽ không bao giờ bị treo — WATCH chỉ fail EXEC, không gây blocking.
""")

    KEY_A = "redis_test:lock_a"
    KEY_B = "redis_test:lock_b"
    r = get_redis()
    r.set(KEY_A, 100)
    r.set(KEY_B, 100)

    thread_results = {}
    deadlock_detected = threading.Event()

    def thread1():
        rc = get_redis()
        log("T1", "WATCH A, SET A (giả lập lock A)")
        with rc.pipeline() as pipe:
            try:
                pipe.watch(KEY_A)
                val_a = int(pipe.get(KEY_A))
                pipe.multi()
                pipe.set(KEY_A, val_a - 1)
                pipe.execute()
                log("T1", f"SET A = {val_a - 1} OK")
            except redis.WatchError:
                log("T1", "WATCH A failed — retry (không deadlock!)")

        log("T1", "Ngủ 0.5s (giả lập giữ lock A)...")
        time.sleep(0.5)

        log("T1", "WATCH B, SET B (giả lập lock B)")
        with rc.pipeline() as pipe:
            try:
                pipe.watch(KEY_B)
                val_b = int(pipe.get(KEY_B))
                pipe.multi()
                pipe.set(KEY_B, val_b - 1)
                pipe.execute()
                log("T1", f"SET B = {val_b - 1} OK")
                thread_results['T1'] = 'success'
            except redis.WatchError:
                log("T1", "WATCH B failed — T2 đã sửa B trước")
                thread_results['T1'] = 'watch_failed'

    def thread2():
        time.sleep(0.1)
        rc = get_redis()

        log("T2", "WATCH B, SET B (giả lập lock B)")
        with rc.pipeline() as pipe:
            try:
                pipe.watch(KEY_B)
                val_b = int(pipe.get(KEY_B))
                pipe.multi()
                pipe.set(KEY_B, val_b - 1)
                pipe.execute()
                log("T2", f"SET B = {val_b - 1} OK")
            except redis.WatchError:
                log("T2", "WATCH B failed")

        log("T2", "WATCH A, SET A (giả lập lock A)")
        with rc.pipeline() as pipe:
            try:
                pipe.watch(KEY_A)
                val_a = int(pipe.get(KEY_A))
                pipe.multi()
                pipe.set(KEY_A, val_a - 1)
                pipe.execute()
                log("T2", f"SET A = {val_a - 1} OK")
                thread_results['T2'] = 'success'
            except redis.WatchError:
                log("T2", "WATCH A failed")
                thread_results['T2'] = 'watch_failed'

    print("\nScenario (mirror MySQL Test 10):")
    print("  T1: Lock A → sleep 0.5s → Lock B")
    print("  T2: Lock B → Lock A")
    print("  MySQL: DEADLOCK sau ~0.5s → rollback 1 transaction")
    print("  Redis: ???\n")
    print("-" * 60)

    t0 = time.time()
    t1 = threading.Thread(target=thread1)
    t2 = threading.Thread(target=thread2)
    t1.start(); t2.start()
    t1.join(timeout=5)
    t2.join(timeout=5)
    elapsed = time.time() - t0

    print("-" * 60)
    still_running = not (t1.is_alive() == False and t2.is_alive() == False)
    print(f"""
Results (sau {elapsed:.2f}s):
  T1: {thread_results.get('T1', 'timeout?')}
  T2: {thread_results.get('T2', 'timeout?')}
  Bị treo (deadlock): {'CÓ ⚠' if still_running else 'KHÔNG ✓'}

Giải thích:
  Redis WATCH là "optimistic lock":
  - Không giữ lock liên tục → không có "chờ nhau" giữa 2 threads
  - Nếu key bị thay đổi sau WATCH → EXEC fail ngay (không block)
  - T1 và T2 có thể cùng WATCH A/B mà không ai phải chờ ai

Conclusion:
  ✓ Redis KHÔNG THỂ deadlock — không có blocking lock mechanism
  ✓ WATCH fail nhanh thay vì chờ mãi như MySQL row lock
  ✓ Không cần deadlock detection vì không có điều kiện "circular wait"
  → Đây là ưu điểm của Redis: predictable latency, no lock contention
""")


# ═══════════════════════════════════════════════════════════════
# TEST R11: WATCH/MULTI/EXEC — Optimistic Locking (Redis X-Lock Alternative)
# ═══════════════════════════════════════════════════════════════

def test_r11_watch_optimistic_lock():
    print("\n" + "=" * 70)
    print("TEST R11: WATCH/MULTI/EXEC — Optimistic Locking")
    print("          (Redis alternative to MySQL X-Lock)")
    print("=" * 70)
    print("""
MySQL X-Lock: chặn tất cả writers khác → serialized, không mất update,
              nhưng tăng latency khi nhiều contention.

Redis WATCH:  "optimistic" — không block, nhưng EXEC có thể fail nếu
              key bị thay đổi → phải retry.

Scenario: 5 threads đồng thời deduct stock = 100, mỗi thread deduct 10
  Dùng WATCH + MULTI/EXEC + retry loop
  Expected: stock cuối = 100 - (5 × 10) = 50, không có lost update
""")

    THREADS     = 5
    DEDUCT_PER  = 10
    INITIAL     = 100
    EXPECTED    = INITIAL - THREADS * DEDUCT_PER

    reset_stock(INITIAL)
    results = {'retries': 0, 'success': 0, 'failed': 0}
    lock = threading.Lock()

    def watch_worker(tid: str):
        rc = get_redis()
        local_retries = local_success = local_failed = 0

        for _ in range(DEDUCT_PER):
            while True:
                try:
                    with rc.pipeline() as pipe:
                        pipe.watch(TEST_STOCK)
                        current = int(pipe.get(TEST_STOCK) or 0)
                        if current <= 0:
                            local_failed += 1
                            break
                        pipe.multi()
                        pipe.set(TEST_STOCK, current - 1)
                        pipe.execute()        # EXEC fails with WatchError nếu có race
                        local_success += 1
                        break
                except redis.WatchError:
                    local_retries += 1
                    time.sleep(0.001)         # back-off ngắn trước khi retry

        log(tid, f"Done: {local_success} success, {local_failed} skipped, {local_retries} retries")
        with lock:
            results['retries'] += local_retries
            results['success'] += local_success
            results['failed']  += local_failed

    print("Execution (WATCH + MULTI/EXEC + retry):")
    print("-" * 60)
    threads = [threading.Thread(target=watch_worker, args=(f"T{i}",))
               for i in range(1, THREADS + 1)]
    for t in threads: t.start()
    for t in threads: t.join()
    print("-" * 60)

    final = int(get_redis().get(TEST_STOCK) or 0)
    print(f"""
Results:
  Initial stock   : {INITIAL}
  Expected final  : {EXPECTED}
  Actual final    : {final}
  Total successes : {results['success']}  (should = {THREADS * DEDUCT_PER})
  Total retries   : {results['retries']}   (do WatchError — contention)
  Correct         : {'✓ YES — no lost update' if final == EXPECTED else '✗ NO'}

So sánh với MySQL X-Lock:
  MySQL X-Lock: block → 0 retries, nhưng latency tăng khi nhiều threads
  Redis WATCH:  retry → {results['retries']} retries, không block, latency thấp hơn

Conclusion:
  ✓ WATCH/MULTI/EXEC đảm bảo correctness (không lost update)
  ✓ Không block các threads khác — optimistic concurrency
  △ Phải tự implement retry logic (MySQL tự handle trong engine)
  △ Nhiều contention → nhiều retries → overhead tăng
  → Best for: low-contention workloads; dùng Lua nếu contention cao
""")


# ═══════════════════════════════════════════════════════════════
# SUMMARY TABLE
# ═══════════════════════════════════════════════════════════════

def print_summary():
    print("\n" + "=" * 70)
    print("TỔNG KẾT SO SÁNH: MySQL Locking/MVCC vs Redis")
    print("=" * 70)
    print(f"""
┌─────────────────────┬──────────────────────────┬──────────────────────────┐
│ Tính năng           │ MySQL (InnoDB)            │ Redis                    │
├─────────────────────┼──────────────────────────┼──────────────────────────┤
│ Shared Lock (S)     │ ✓ FOR SHARE              │ ✗ Không có              │
│ Exclusive Lock (X)  │ ✓ FOR UPDATE             │ ✗ Không có              │
│ S blocks X          │ ✓ Có                     │ ✗ Read không block Write │
│ X blocks S          │ ✓ Có                     │ ✗ Write không block Read │
│ X blocks X          │ ✓ Serialized write       │ ✗ Race condition GET+SET │
│ MVCC / Snapshot     │ ✓ Repeatable Read        │ ✗ Always latest value    │
│ Version chain       │ ✓ Nhiều phiên bản / row  │ ✗ Chỉ 1 giá trị hiện tại│
│ Deadlock            │ ✓ Tự detect + rollback   │ ✓ Không thể xảy ra      │
│ Atomicity           │ ✓ Transaction ACID       │ ✓ Lua / WATCH+MULTI/EXEC │
│ Optimistic lock     │ △ SELECT ... FOR UPDATE  │ ✓ WATCH/MULTI/EXEC       │
└─────────────────────┴──────────────────────────┴──────────────────────────┘

Redis đảm bảo correctness qua:
  1. Atomic commands   : INCR, DECR, HINCRBY, SETNX, ... (single op)
  2. Lua scripts       : Read-Modify-Write atomic, không interrupt được
  3. WATCH+MULTI/EXEC  : Optimistic CAS với retry (giống "SELECT FOR UPDATE"
                         nhưng không blocking)

Redis KHÔNG có:
  - Row-level locking
  - MVCC / snapshot isolation
  - Transaction isolation levels (READ COMMITTED, REPEATABLE READ, ...)
  - Automatic deadlock detection (không cần vì không có blocking locks)
""")


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 70)
    print("REDIS CONCURRENCY TESTS — Lock / MVCC / Deadlock Equivalents")
    print("=" * 70)

    # Kiểm tra kết nối
    print("\n[Connection Check]")
    try:
        r = get_redis()
        r.ping()
        print("  Redis: connected ✓")
    except Exception as e:
        print(f"  Redis Error: {e}")
        exit(1)

    test_r4_concurrent_reads()
    test_r5_read_does_not_block_write()
    test_r6_write_does_not_block_read()
    test_r7_race_condition()
    test_r8_no_mvcc()
    test_r9_no_snapshot_isolation()
    test_r10_no_deadlock()
    test_r11_watch_optimistic_lock()

    print_summary()
