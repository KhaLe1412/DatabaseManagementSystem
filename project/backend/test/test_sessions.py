"""Tests for /api/sessions endpoints."""
import pytest
import requests
from .constants import (
    BASE_URL, TUTOR_ID, TUTOR2_ID, STUDENT_ID, STUDENT2_ID, STUDENT3_ID,
    SESSION_FULL, SESSION_OPEN, SESSION_SCHEDULED, SESSION_COMPLETED,
    SUBJ_OOP, SUBJ_DSA, SUBJ_CALCULUS,
)

SESSIONS = f"{BASE_URL}/api/sessions"


class TestGetSessions:
    def test_get_all(self):
        r = requests.get(f"{SESSIONS}/")
        assert r.status_code == 200
        body = r.json()
        assert "sessions" in body
        assert len(body["sessions"]) >= 4  # 4 seed sessions

    def test_filter_by_tutor(self):
        r = requests.get(f"{SESSIONS}/", params={"tutorId": TUTOR_ID})
        assert r.status_code == 200
        rows = r.json()["sessions"]
        for s in rows:
            assert s.get("tutor_id") == TUTOR_ID

    def test_filter_by_status_open(self):
        r = requests.get(f"{SESSIONS}/", params={"status": "open"})
        assert r.status_code == 200
        rows = r.json()["sessions"]
        for s in rows:
            assert s.get("status") == "open"

    def test_filter_by_subject_id(self):
        r = requests.get(f"{SESSIONS}/", params={"subjectId": SUBJ_OOP})
        assert r.status_code == 200
        # Should include sessions aaaa and dddd
        assert len(r.json()["sessions"]) >= 1

    def test_filter_by_student(self):
        r = requests.get(f"{SESSIONS}/", params={"studentId": STUDENT_ID})
        assert r.status_code == 200


class TestGetSession:
    def test_get_existing_session(self):
        r = requests.get(f"{SESSIONS}/{SESSION_OPEN}")
        assert r.status_code == 200
        body = r.json()
        # Should return session details + enrolledStudents + reviews
        assert "session_id" in body or "id" in body

    def test_get_completed_session(self):
        r = requests.get(f"{SESSIONS}/{SESSION_COMPLETED}")
        assert r.status_code == 200

    def test_get_nonexistent_session(self):
        r = requests.get(f"{SESSIONS}/no-such-session")
        assert r.status_code == 404


class TestCreateSession:
    created_id = None

    def test_create_session(self):
        payload = {
            "tutorId":    TUTOR2_ID,
            "subjectId":  SUBJ_CALCULUS,
            "date":       "2026-05-20",
            "startTime":  "14:00:00",
            "endTime":    "16:00:00",
            "type":       "online",
            "location":   None,
            "meetingLink":"https://meet.example.com/test",
            "maxStudents": 5,
            "notes":      "Test session created by automated test",
        }
        r = requests.post(f"{SESSIONS}/", json=payload)
        assert r.status_code == 201
        body = r.json()
        assert "sessionId" in body or "id" in body or "session_id" in body
        sid = body.get("sessionId") or body.get("id") or body.get("session_id")
        TestCreateSession.created_id = sid

    def test_create_overlapping_session(self):
        # Same tutor, same date/time range as session aaaa
        payload = {
            "tutorId":    TUTOR_ID,
            "subjectId":  SUBJ_OOP,
            "date":       "2026-04-12",
            "startTime":  "09:00:00",
            "endTime":    "11:00:00",
            "type":       "online",
            "location":   None,
            "meetingLink": None,
            "maxStudents": 5,
            "notes":      "",
        }
        r = requests.post(f"{SESSIONS}/", json=payload)
        assert r.status_code == 409


class TestJoinLeaveSession:
    def test_join_open_session(self):
        r = requests.post(f"{SESSIONS}/{SESSION_OPEN}/join",
                          json={"studentId": STUDENT3_ID})
        # 200 ok or 400 if already enrolled / full
        assert r.status_code in (200, 400)

    def test_join_full_session(self):
        r = requests.post(f"{SESSIONS}/{SESSION_FULL}/join",
                          json={"studentId": STUDENT3_ID})
        assert r.status_code in (400, 409)

    def test_leave_session(self):
        r = requests.post(f"{SESSIONS}/{SESSION_OPEN}/leave",
                          json={"studentId": STUDENT3_ID})
        assert r.status_code in (200, 400)


class TestPatchSession:
    def test_update_notes(self):
        r = requests.patch(f"{SESSIONS}/{SESSION_SCHEDULED}",
                           json={"notes": "Updated notes via PATCH"})
        assert r.status_code in (200, 400)

    def test_complete_session(self):
        if TestCreateSession.created_id:
            r = requests.patch(f"{SESSIONS}/{TestCreateSession.created_id}",
                               json={"status": "completed"})
            assert r.status_code in (200, 400)
        else:
            pytest.skip("No created session available")


class TestReviews:
    def test_get_reviews(self):
        r = requests.get(f"{SESSIONS}/{SESSION_COMPLETED}/reviews")
        assert r.status_code == 200
        body = r.json()
        assert "reviews" in body or isinstance(body, list)

    def test_add_review_completed(self):
        r = requests.post(f"{SESSIONS}/{SESSION_COMPLETED}/review", json={
            "studentId": STUDENT_ID,
            "comment":   "Great session!",
            "rating":    5,
        })
        # 200/201 on success, 400 if student not in session or already reviewed
        assert r.status_code in (200, 201, 400)


class TestDeleteSession:
    def test_delete_created_session(self):
        if TestCreateSession.created_id:
            r = requests.delete(f"{SESSIONS}/{TestCreateSession.created_id}")
            assert r.status_code == 200
        else:
            pytest.skip("No created session to delete")

    def test_delete_nonexistent(self):
        r = requests.delete(f"{SESSIONS}/no-such-session")
        assert r.status_code in (400, 404)
