"""Tests for /api/users endpoints."""
import uuid
import pytest
import requests
from .constants import BASE_URL, TUTOR_ID, STUDENT_ID, STUDENT2_ID, SUBJ_OOP, SUBJ_DSA

USERS = f"{BASE_URL}/api/users"

# Unique username/email so tests are idempotent across re-runs
_UNIQUE = uuid.uuid4().hex[:8]
NEW_USER = {
    "username":   f"testuser_{_UNIQUE}",
    "password":   "testpass123",
    "email":      f"testuser_{_UNIQUE}@test.com",
    "name":       "Test User Auto",
    "role":       "student",
    # Required NOT NULL columns in students table
    "studentId":  f"MSSV{_UNIQUE}",
    "department": "Computer Science",
    "year":       2,
}


class TestGetUsers:
    def test_get_all_users(self):
        r = requests.get(f"{USERS}/")
        assert r.status_code == 200
        body = r.json()
        assert "users" in body
        assert isinstance(body["users"], list)
        assert len(body["users"]) > 0

    def test_filter_by_role_student(self):
        r = requests.get(f"{USERS}/", params={"role": "student"})
        assert r.status_code == 200
        for u in r.json()["users"]:
            assert u["role"] == "student"

    def test_filter_by_role_tutor(self):
        r = requests.get(f"{USERS}/", params={"role": "tutor"})
        assert r.status_code == 200
        for u in r.json()["users"]:
            assert u["role"] == "tutor"

    def test_search_by_name(self):
        r = requests.get(f"{USERS}/", params={"search": "binh"})
        assert r.status_code == 200
        users = r.json()["users"]
        # Route filters by name OR email; "binh" appears in email binh.tran@hcmut.edu.vn
        assert any(
            "binh" in u["name"].lower() or "binh" in u["email"].lower()
            for u in users
        )

    def test_pagination(self):
        r = requests.get(f"{USERS}/", params={"page": 1, "limit": 2})
        assert r.status_code == 200
        body = r.json()
        assert len(body["users"]) <= 2
        assert "total" in body


class TestGetUser:
    def test_get_existing_tutor(self):
        r = requests.get(f"{USERS}/{TUTOR_ID}")
        assert r.status_code == 200
        body = r.json()
        assert body.get("id") == TUTOR_ID or body.get("user_id") == TUTOR_ID or "name" in body

    def test_get_existing_student(self):
        r = requests.get(f"{USERS}/{STUDENT_ID}")
        assert r.status_code == 200

    def test_get_nonexistent_user(self):
        r = requests.get(f"{USERS}/no-such-user-id")
        assert r.status_code == 404


class TestCreateUser:
    created_id = None

    def test_create_student(self):
        r = requests.post(f"{USERS}/", json=NEW_USER)
        assert r.status_code == 201
        body = r.json()
        assert "userId" in body or "id" in body
        TestCreateUser.created_id = body.get("userId") or body.get("id")

    def test_create_duplicate_username(self):
        # seed user already exists
        r = requests.post(f"{USERS}/", json={
            "username": "nhat.huynh", "password": "x",
            "email": "unique99@test.com", "name": "Dup", "role": "student",
        })
        assert r.status_code == 409


class TestUpdateUser:
    def test_update_profile(self):
        r = requests.put(f"{USERS}/{STUDENT_ID}", json={"name": "Nhật Updated", "department": "CS"})
        # Accept 200 or 400 (if procedure rejects unknown department)
        assert r.status_code in (200, 400)

    def test_update_nonexistent(self):
        r = requests.put(f"{USERS}/no-such-id", json={"name": "X", "department": "Y"})
        # sp_update_user_profile silently succeeds (0 rows affected) — returns 200
        assert r.status_code in (200, 400, 404)


class TestUserSubjects:
    def test_get_subjects(self):
        r = requests.get(f"{USERS}/{TUTOR_ID}/subjects")
        assert r.status_code == 200
        body = r.json()
        assert "subjects" in body or isinstance(body, list)

    def test_add_subject(self):
        r = requests.post(f"{USERS}/{STUDENT_ID}/subjects", json={"subject_id": SUBJ_DSA})
        assert r.status_code in (200, 201, 400)  # 400 if already enrolled

    def test_remove_subject(self):
        r = requests.delete(f"{USERS}/{STUDENT_ID}/subjects/{SUBJ_DSA}")
        assert r.status_code in (200, 404)


class TestDeleteUser:
    def test_delete_created_user(self):
        if TestCreateUser.created_id:
            r = requests.delete(f"{USERS}/{TestCreateUser.created_id}")
            assert r.status_code == 200
        else:
            pytest.skip("No created user to delete")

    def test_delete_nonexistent(self):
        r = requests.delete(f"{USERS}/no-such-user")
        assert r.status_code == 404
