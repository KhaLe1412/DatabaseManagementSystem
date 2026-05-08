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
    section("DEMO: Redis Lua fail because stock is not enough")

    r = redis_conn()
    stock_key = "production:stock:1:6"
    before_stock_hash = r.hgetall(stock_key)

    try:
        step("BEFORE")
        r.hset(stock_key, "quantity", 0)
        before_stock = redis_stock_quantity(r, stock_key)
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RUN LUA")
        script = """
        local stock = tonumber(redis.call('HGET', KEYS[1], 'quantity'))
        if stock < tonumber(ARGV[1]) then
            return 'FAILED: Not enough stock (have ' .. stock .. ', need ' .. ARGV[1] .. ')'
        end
        redis.call('HINCRBY', KEYS[1], 'quantity', -tonumber(ARGV[1]))
        return 'OK'
        """
        result = r.eval(script, 1, stock_key, 5)
        print(f"EVAL result = {result}")

        step("AFTER")
        after_stock = redis_stock_quantity(r, stock_key)
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RESULT")
        if str(result).startswith("FAILED") and after_stock == before_stock:
            print("OK: Lua checked stock first and did not modify invalid data.")
        else:
            print("FAILED: stock changed unexpectedly.")
    finally:
        if not keep_demo_data():
            restore_redis_hash(r, stock_key, before_stock_hash)
            step("CLEANUP")
            print("Demo data restored. Set KEEP_DEMO_DATA=1 to keep after-state.")


if __name__ == "__main__":
    main()
