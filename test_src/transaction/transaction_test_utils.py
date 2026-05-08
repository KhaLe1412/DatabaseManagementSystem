"""
Shared helpers for transaction demo scripts.

Defaults match the root docker-compose.yml:
  MySQL: 127.0.0.1:3308, user root, password rootpassword
  Redis: 127.0.0.1:6380

Override with environment variables:
  MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
  REDIS_HOST, REDIS_PORT, REDIS_DB

By default, demos restore touched data at the end so they can be rerun.
Set KEEP_DEMO_DATA=1 if you want to inspect the changed data after the demo.
"""

from __future__ import annotations

import os
from typing import Any

try:
    import mysql.connector
    import redis
except ImportError as exc:
    raise SystemExit(
        "Missing dependency. Install with:\n"
        "  python -m pip install -r test_src/transaction/requirements.txt\n"
        f"Original error: {exc}"
    )


MYSQL_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3308")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "rootpassword"),
}

REDIS_CONFIG = {
    "host": os.getenv("REDIS_HOST", "127.0.0.1"),
    "port": int(os.getenv("REDIS_PORT", "6380")),
    "db": int(os.getenv("REDIS_DB", "0")),
    "decode_responses": True,
}


def keep_demo_data() -> bool:
    return os.getenv("KEEP_DEMO_DATA", "").strip().lower() in {"1", "true", "yes", "y"}


def mysql_conn(**kwargs: Any):
    return mysql.connector.connect(**MYSQL_CONFIG, **kwargs)


def redis_conn() -> redis.Redis:
    return redis.Redis(**REDIS_CONFIG)


def section(title: str) -> None:
    print()
    print("=" * 72)
    print(title)
    print("=" * 72)


def step(title: str) -> None:
    print()
    print(f"[{title}]")


def require_mysql() -> None:
    try:
        conn = mysql_conn()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM production.stocks")
        cur.fetchone()
        conn.close()
    except Exception as exc:
        raise SystemExit(f"MySQL is not ready: {exc}")


def require_redis() -> None:
    try:
        r = redis_conn()
        r.ping()
    except Exception as exc:
        raise SystemExit(f"Redis is not ready: {exc}")


def get_mysql_stock(cur, store_id: int, product_id: int) -> int:
    cur.execute(
        """
        SELECT quantity
        FROM production.stocks
        WHERE store_id = %s AND product_id = %s
        """,
        (store_id, product_id),
    )
    row = cur.fetchone()
    if row is None:
        raise RuntimeError(f"Missing stock row store={store_id}, product={product_id}")
    if isinstance(row, dict):
        return int(row["quantity"])
    return int(row[0])


def restore_mysql_stock(store_id: int, product_id: int, quantity: int) -> None:
    conn = mysql_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE production.stocks
            SET quantity = %s
            WHERE store_id = %s AND product_id = %s
            """,
            (quantity, store_id, product_id),
        )
        conn.commit()
    finally:
        conn.close()


def delete_mysql_order(order_id: int) -> None:
    conn = mysql_conn()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM sales.order_items WHERE order_id = %s", (order_id,))
        cur.execute("DELETE FROM sales.orders WHERE order_id = %s", (order_id,))
        conn.commit()
    finally:
        conn.close()


def cleanup_redis_order(r: redis.Redis, order_id: str) -> None:
    r.delete(f"sales:order:{order_id}")
    r.delete(f"sales:order_item:{order_id}:1")
    r.srem("sales:orders:ids", order_id)
    r.srem("sales:orders:customer:1", order_id)
    r.srem("sales:orders:store:1", order_id)
    r.delete(f"sales:order_items:order:{order_id}")


def redis_stock_quantity(r: redis.Redis, key: str) -> int:
    value = r.hget(key, "quantity")
    if value is None:
        raise RuntimeError(f"Missing Redis stock quantity: {key}")
    return int(value)


def restore_redis_hash(r: redis.Redis, key: str, old_value: dict[str, str]) -> None:
    r.delete(key)
    if old_value:
        r.hset(key, mapping=old_value)


def restore_redis_string(r: redis.Redis, key: str, old_value: str | None) -> None:
    if old_value is None:
        r.delete(key)
    else:
        r.set(key, old_value)
