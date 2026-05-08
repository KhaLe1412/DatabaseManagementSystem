import threading

import redis

from transaction_test_utils import (
    keep_demo_data,
    redis_conn,
    redis_stock_quantity,
    require_redis,
    restore_redis_hash,
    section,
    step,
)


def main() -> None:
    require_redis()
    section("DEMO: Redis WATCH conflict aborts EXEC")

    r = redis_conn()
    stock_key = "production:stock:1:1"
    before_stock_hash = r.hgetall(stock_key)

    try:
        step("BEFORE")
        r.hset(stock_key, "quantity", 50)
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        ready = threading.Event()
        changed = threading.Event()
        result: dict[str, str] = {}

        def client_1() -> None:
            rc = redis_conn()
            with rc.pipeline() as pipe:
                try:
                    print("client 1: WATCH stock key")
                    pipe.watch(stock_key)
                    ready.set()
                    changed.wait(timeout=3)
                    print("client 1: MULTI; HINCRBY quantity -1; EXEC")
                    pipe.multi()
                    pipe.hincrby(stock_key, "quantity", -1)
                    pipe.execute()
                    result["status"] = "committed"
                except redis.WatchError:
                    result["status"] = "aborted"
                    print("client 1: EXEC aborted because watched key changed")
                finally:
                    pipe.reset()

        def client_2() -> None:
            ready.wait(timeout=3)
            print("client 2: HSET quantity 100 before client 1 EXEC")
            redis_conn().hset(stock_key, "quantity", 100)
            changed.set()

        step("RUN WATCH CONFLICT")
        t1 = threading.Thread(target=client_1)
        t2 = threading.Thread(target=client_2)
        t1.start()
        t2.start()
        t1.join(timeout=5)
        t2.join(timeout=5)

        step("AFTER")
        after_stock = redis_stock_quantity(r, stock_key)
        print(f"client 1 result = {result.get('status')}")
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RESULT")
        if result.get("status") == "aborted" and after_stock == 100:
            print("OK: WATCH detected conflict, so EXEC did not apply -1.")
        else:
            print("FAILED: WATCH conflict was not demonstrated as expected.")
    finally:
        if not keep_demo_data():
            restore_redis_hash(r, stock_key, before_stock_hash)
            step("CLEANUP")
            print("Demo data restored. Set KEEP_DEMO_DATA=1 to keep after-state.")


if __name__ == "__main__":
    main()
