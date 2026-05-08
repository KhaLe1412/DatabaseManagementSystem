from transaction_test_utils import (
    cleanup_redis_order,
    keep_demo_data,
    redis_conn,
    redis_stock_quantity,
    require_redis,
    restore_redis_hash,
    restore_redis_string,
    section,
    step,
)


ORDER_ID = "tx_test_multi_900001"


def main() -> None:
    require_redis()
    section("DEMO: Redis MULTI/EXEC success")

    r = redis_conn()
    stock_key = "production:stock:1:1"
    before_stock_hash = r.hgetall(stock_key)
    before_next_id = r.get("sales:orders:next_id")
    cleanup_redis_order(r, ORDER_ID)

    try:
        step("BEFORE")
        before_stock = redis_stock_quantity(r, stock_key)
        print(f"EXISTS sales:order:{ORDER_ID} = {r.exists(f'sales:order:{ORDER_ID}')}")
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RUN MULTI/EXEC")
        pipe = r.pipeline(transaction=True)
        pipe.incr("sales:orders:next_id")
        pipe.hset(
            f"sales:order:{ORDER_ID}",
            mapping={
                "customer_id": "1",
                "order_status": "1",
                "order_date": "2026-03-02",
                "required_date": "2026-03-10",
                "shipped_date": "",
                "store_id": "1",
                "staff_id": "1",
            },
        )
        pipe.sadd("sales:orders:ids", ORDER_ID)
        pipe.sadd("sales:orders:customer:1", ORDER_ID)
        pipe.sadd("sales:orders:store:1", ORDER_ID)
        pipe.hset(
            f"sales:order_item:{ORDER_ID}:1",
            mapping={
                "product_id": "1",
                "quantity": "2",
                "list_price": "379.99",
                "discount": "0.10",
            },
        )
        pipe.sadd(f"sales:order_items:order:{ORDER_ID}", "1")
        pipe.hincrby(stock_key, "quantity", -2)
        results = pipe.execute()
        print(f"EXEC result = {results}")

        step("AFTER")
        after_stock = redis_stock_quantity(r, stock_key)
        print(f"sales:order:{ORDER_ID} = {r.hgetall(f'sales:order:{ORDER_ID}')}")
        print(f"sales:order_item:{ORDER_ID}:1 = {r.hgetall(f'sales:order_item:{ORDER_ID}:1')}")
        print(f"{stock_key} = {r.hgetall(stock_key)}")

        step("RESULT")
        if after_stock == before_stock - 2:
            print("OK: MULTI/EXEC created order data and reduced stock by 2.")
        else:
            print("FAILED: stock did not change as expected.")
    finally:
        if not keep_demo_data():
            cleanup_redis_order(r, ORDER_ID)
            restore_redis_hash(r, stock_key, before_stock_hash)
            restore_redis_string(r, "sales:orders:next_id", before_next_id)
            step("CLEANUP")
            print("Demo data restored. Set KEEP_DEMO_DATA=1 to keep after-state.")


if __name__ == "__main__":
    main()
