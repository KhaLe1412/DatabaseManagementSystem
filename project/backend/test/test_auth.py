"""Tests for POST /api/auth/login and POST /api/auth/logout."""
import pytest
import requests
from .constants import BASE_URL, TUTOR_ID


AUTH = f"{BASE_URL}/api/auth"


class TestLogin:
    def test_login_success_tutor(self):
        r = requests.post(f"{AUTH}/login", json={"username": "tutor.binh", "password": "hash123"})
        assert r.status_code == 200
        body = r.json()
        assert body["userId"] == TUTOR_ID
        assert body["role"] == "tutor"
        assert "name" in body

    def test_login_success_student(self):
        r = requests.post(f"{AUTH}/login", json={"username": "nhat.huynh", "password": "hash123"})
        assert r.status_code == 200
        body = r.json()
        assert body["role"] == "student"

    def test_login_wrong_password(self):
        r = requests.post(f"{AUTH}/login", json={"username": "tutor.binh", "password": "wrong"})
        assert r.status_code == 401
        assert "error" in r.json()

    def test_login_unknown_user(self):
        r = requests.post(f"{AUTH}/login", json={"username": "nobody", "password": "x"})
        assert r.status_code == 401

    def test_login_missing_fields(self):
        r = requests.post(f"{AUTH}/login", json={"username": "tutor.binh"})
        assert r.status_code == 400


class TestLogout:
    def test_logout(self):
        r = requests.post(f"{AUTH}/logout")
        assert r.status_code == 200
        assert "message" in r.json()
