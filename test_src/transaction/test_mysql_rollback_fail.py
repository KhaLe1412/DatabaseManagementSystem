from transaction_test_utils import (
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
    section("DEMO: MySQL transaction fail and rollback")

    conn = mysql_conn()
    cur = conn.cursor()
    before_stock = None

    try:
        step("BEFORE")
        before_stock = get_mysql_stock(cur, store_id=1, product_id=6)
        print(f"stock(store_id=1, product_id=6) = {before_stock}")
        conn.commit()

        step("RUN TRANSACTION")
        conn.start_transaction()
        cur.execute(
            """
            UPDATE production.stocks
            SET quantity = quantity - 5
            WHERE store_id = 1 AND product_id = 6
            """
        )
        inside_stock = get_mysql_stock(cur, store_id=1, product_id=6)
        print(f"stock inside transaction after deduct 5 = {inside_stock}")

        if inside_stock < 0:
            conn.rollback()
            print("ROLLBACK executed because stock became negative")
        else:
            conn.commit()
            print("COMMIT executed")

        step("AFTER")
        after_stock = get_mysql_stock(cur, store_id=1, product_id=6)
        print(f"stock(store_id=1, product_id=6) = {after_stock}")

        step("RESULT")
        if after_stock == before_stock:
            print("OK: rollback kept stock unchanged.")
        else:
            print("FAILED: stock changed unexpectedly.")
    finally:
        conn.close()
        if not keep_demo_data() and before_stock is not None:
            restore_mysql_stock(1, 6, before_stock)
            step("CLEANUP")
            print("Demo data restored. Set KEEP_DEMO_DATA=1 to keep after-state.")


if __name__ == "__main__":
    main()
