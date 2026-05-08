from transaction_test_utils import (
    delete_mysql_order,
    get_mysql_stock,
    keep_demo_data,
    mysql_conn,
    require_mysql,
    restore_mysql_stock,
    section,
    step,
)


def main() -> None:
    require_mysql()
    section("DEMO: MySQL transaction success")

    conn = mysql_conn()
    cur = conn.cursor(dictionary=True)
    order_id = None
    before_stock = None

    try:
        step("BEFORE")
        before_stock = get_mysql_stock(cur, store_id=1, product_id=1)
        print(f"stock(store_id=1, product_id=1) = {before_stock}")
        if before_stock < 2:
            raise RuntimeError("Not enough stock for this demo. Need at least 2.")
        conn.commit()

        step("RUN TRANSACTION")
        conn.start_transaction()
        cur.execute(
            """
            INSERT INTO sales.orders(
                customer_id, order_status, order_date, required_date,
                shipped_date, store_id, staff_id
            )
            VALUES (1, 1, '2026-03-02', '2026-03-10', NULL, 1, 1)
            """
        )
        order_id = cur.lastrowid
        print(f"created sales.orders order_id = {order_id}")

        cur.execute(
            """
            INSERT INTO sales.order_items(
                order_id, item_id, product_id, quantity, list_price, discount
            )
            VALUES (%s, 1, 1, 2, 379.99, 0.10)
            """,
            (order_id,),
        )
        print("created sales.order_items item_id = 1, quantity = 2")

        cur.execute(
            """
            UPDATE production.stocks
            SET quantity = quantity - 2
            WHERE store_id = 1 AND product_id = 1
            """
        )
        conn.commit()
        print("COMMIT executed")

        step("AFTER")
        cur.execute("SELECT * FROM sales.orders WHERE order_id = %s", (order_id,))
        print(f"new order = {cur.fetchone()}")
        cur.execute("SELECT * FROM sales.order_items WHERE order_id = %s", (order_id,))
        print(f"new order item = {cur.fetchone()}")
        after_stock = get_mysql_stock(cur, store_id=1, product_id=1)
        print(f"stock(store_id=1, product_id=1) = {after_stock}")

        step("RESULT")
        if after_stock == before_stock - 2:
            print("OK: order + item were committed and stock decreased by 2.")
        else:
            print("FAILED: stock did not change as expected.")
    finally:
        conn.close()
        if not keep_demo_data():
            if order_id is not None:
                delete_mysql_order(order_id)
            if before_stock is not None:
                restore_mysql_stock(1, 1, before_stock)
            step("CLEANUP")
            print("Demo data restored. Set KEEP_DEMO_DATA=1 to keep after-state.")


if __name__ == "__main__":
    main()
