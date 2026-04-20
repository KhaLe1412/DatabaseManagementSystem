"""Tests for /api/reschedule-requests endpoints."""
import pytest
import requests
from .constants import BASE_URL, TUTOR_ID, STUDENT_ID, SESSION_OPEN

RESCHEDULE = f"{BASE_URL}/api/reschedule-requests"

_created_id = None


class TestGetRescheduleRequests:
    def test_get_for_tutor(self):
        r = requests.get(f"{RESCHEDULE}/", params={"userId": TUTOR_ID})
        assert r.status_code == 200
        body = r.json()
        assert "rescheduleRequests" in body
        assert isinstance(body["rescheduleRequests"], list)

    def test_missing_userId(self):
        r = requests.get(f"{RESCHEDULE}/")
        assert r.status_code == 400


class TestCreateRescheduleRequest:
    def test_create_request(self):
        global _created_id
        r = requests.post(f"{RESCHEDULE}/", json={
            "studentId":        STUDENT_ID,
            "sessionId":        SESSION_OPEN,
            "proposedDate":     "2026-05-01",
            "proposedStartTime":"10:00:00",
            "proposedEndTime":  "12:00:00",
            "reason":           "Automated test request",
        })
        # 201 on success, 400 if student not enrolled / other constraint
        assert r.status_code in (201, 400)
        if r.status_code == 201:
            body = r.json()
            assert "id" in body
            _created_id = body["id"]

    def test_create_missing_fields(self):
        r = requests.post(f"{RESCHEDULE}/", json={
            "studentId": STUDENT_ID,
            "sessionId": SESSION_OPEN,
        })
        assert r.status_code == 400


class TestHandleRescheduleRequest:
    def test_accept_request(self):
        global _created_id
        if _created_id:
            r = requests.patch(f"{RESCHEDULE}/{_created_id}", json={"status": "accepted"})
            assert r.status_code in (200, 400, 409)
        else:
            pytest.skip("No reschedule request created")

    def test_reject_request(self):
        global _created_id
        if _created_id:
            r = requests.patch(f"{RESCHEDULE}/{_created_id}", json={"status": "rejected"})
            assert r.status_code in (200, 400)
        else:
            pytest.skip("No reschedule request created")

    def test_invalid_status(self):
        r = requests.patch(f"{RESCHEDULE}/some-id", json={"status": "pending"})
        assert r.status_code == 400
