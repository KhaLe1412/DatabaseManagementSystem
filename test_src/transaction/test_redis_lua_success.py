from transaction_test_utils import (
    cleanup_redis_order,
    keep_demo_data,
    redis_conn,
    redis_stock_quantity,
    require_redis,
    restore_redis_hash,
    section,
    step,
)


ORDER_ID = "tx_test_lua_900002"


def main() -> None:
    require_redis()
    section("DEMO: Redis Lua success")

    r = redis_conn()
    stock_key = "production:stock:1:1"
    before_stock_hash = r.hgetall(stock_key)
    cleanup_redis_order(r, ORDER_ID)

    try:
        step("BEFORE")
        before_stock = redis_stock_quantity(r, stock_key)
        print(f"EXISTS sales:order:{ORDER_ID} = {r.exists(f'sales:order:{ORDER_ID}')}")
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RUN LUA")
        script = """
        local oid = ARGV[1]
        local stock_key = KEYS[1]
        redis.call('HSET', 'sales:order:' .. oid,
            'customer_id', '1', 'order_status', '1',
            'order_date', '2026-03-02', 'required_date', '2026-03-10',
            'shipped_date', '', 'store_id', '1', 'staff_id', '1')
        redis.call('SADD', 'sales:orders:ids', oid)
        redis.call('HINCRBY', stock_key, 'quantity', -2)
        return 'OK'
        """
        result = r.eval(script, 1, stock_key, ORDER_ID)
        print(f"EVAL result = {result}")

        step("AFTER")
        after_stock = redis_stock_quantity(r, stock_key)
        print(f"sales:order:{ORDER_ID} = {r.hgetall(f'sales:order:{ORDER_ID}')}")
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RESULT")
        if result == "OK" and after_stock == before_stock - 2:
            print("OK: Lua script executed atomically and reduced stock by 2.")
        else:
            print("FAILED: Lua result or stock value is not expected.")
    finally:
        if not keep_demo_data():
            cleanup_redis_order(r, ORDER_ID)
            restore_redis_hash(r, stock_key, before_stock_hash)
            step("CLEANUP")
            print("Demo data restored. Set KEEP_DEMO_DATA=1 to keep after-state.")


if __name__ == "__main__":
    main()
