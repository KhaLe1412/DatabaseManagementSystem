import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DB_HOST     = os.getenv('DB_HOST', 'localhost')
    DB_PORT     = int(os.getenv('DB_PORT', 3307))
    DB_NAME     = os.getenv('DB_NAME', 'dbms_project')
    DB_USER     = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    FLASK_PORT  = int(os.getenv('FLASK_PORT', 5001))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
