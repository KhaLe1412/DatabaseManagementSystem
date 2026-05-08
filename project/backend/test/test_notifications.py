"""Tests for /api/notifications endpoints."""
import pytest
import requests
from .constants import BASE_URL, STUDENT_ID, TUTOR_ID

NOTIFICATIONS = f"{BASE_URL}/api/notifications"


class TestGetNotifications:
    def test_get_for_student(self):
        r = requests.get(f"{NOTIFICATIONS}/", params={"userId": STUDENT_ID})
        assert r.status_code == 200
        body = r.json()
        assert "notifications" in body
        assert isinstance(body["notifications"], list)

    def test_get_for_tutor(self):
        r = requests.get(f"{NOTIFICATIONS}/", params={"userId": TUTOR_ID})
        assert r.status_code == 200

    def test_missing_userId(self):
        r = requests.get(f"{NOTIFICATIONS}/")
        assert r.status_code == 400
        assert "error" in r.json()
