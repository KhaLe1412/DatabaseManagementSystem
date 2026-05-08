"""pytest configuration: wait for backend to be reachable before running tests."""
import time
import pytest
import requests
from .constants import BASE_URL


def pytest_configure(config):
    """Block until the Flask backend is reachable (max 30 s)."""
    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            requests.get(f"{BASE_URL}/api/auth/login", timeout=2)
            return
        except Exception:
            time.sleep(1)
    pytest.exit(f"Backend at {BASE_URL} did not respond within 30 seconds", returncode=3)
