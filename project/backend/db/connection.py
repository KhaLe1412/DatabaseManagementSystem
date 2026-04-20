import mysql.connector
from mysql.connector import Error, pooling

from config import Config


class Database:
    """
    Singleton class ket noi MySQL, su dung connection pool.

    Usage:
        db = Database.get_instance()
        rows = db.call_procedure('sp_login', ('admin', 'hashed_pw'))
        rows = db.execute_query('SELECT * FROM users WHERE id = %s', (uid,))
    """

    _instance: 'Database | None' = None
    _pool: 'pooling.MySQLConnectionPool | None' = None

    def __init__(self) -> None:
        self._pool = pooling.MySQLConnectionPool(
            pool_name='main_pool',
            pool_size=5,
            pool_reset_session=True,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            charset='utf8mb4',
            autocommit=False,
        )

    @classmethod
    def get_instance(cls) -> 'Database':
        """Tra ve singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_connection(self) -> pooling.PooledMySQLConnection:
        """Lay mot connection tu pool."""
        return self._pool.get_connection()

    def call_procedure(self, procedure_name: str, params: tuple = ()) -> list:
        """
        Goi stored procedure va tra ve toan bo result set dang list[dict].

        Args:
            procedure_name: Ten stored procedure (vd: 'sp_login').
            params: Cac tham so theo dung thu tu.

        Returns:
            list[dict] — danh sach ban ghi ket qua.

        Raises:
            mysql.connector.Error neu co loi SQL.
        """
        conn = cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.callproc(procedure_name, params)
            results = []
            for result_set in cursor.stored_results():
                results.extend(result_set.fetchall())
            conn.commit()
            return results
        except Error:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def execute_query(self, query: str, params: tuple = ()) -> list:
        """
        Thuc thi cau lenh SQL truc tiep (dung khi chua co stored procedure).

        Args:
            query: Cau lenh SQL voi placeholder %s.
            params: Cac tham so tuong ung.

        Returns:
            list[dict] — danh sach ban ghi ket qua.

        Raises:
            mysql.connector.Error neu co loi SQL.
        """
        conn = cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            results = cursor.fetchall()
            conn.commit()
            return results
        except Error:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def execute_dml(self, query: str, params: tuple = ()) -> int:
        """
        Thuc thi cau lenh DML (INSERT/UPDATE/DELETE) va tra ve so hang bi anh huong.

        Returns:
            int — so hang bi anh huong (rowcount).
        """
        conn = cursor = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            rowcount = cursor.rowcount
            conn.commit()
            return rowcount
        except Error:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
