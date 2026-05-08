"""Tests for /api/messages endpoints."""
import pytest
import requests
from .constants import BASE_URL, TUTOR_ID, STUDENT_ID, MSG_ID

MESSAGES = f"{BASE_URL}/api/messages"

_sent_id = None


class TestGetMessages:
    def test_get_conversation(self):
        r = requests.get(f"{MESSAGES}/", params={
            "userId":    STUDENT_ID,
            "partnerId": TUTOR_ID,
        })
        assert r.status_code == 200
        body = r.json()
        assert "messages" in body
        msgs = body["messages"]
        assert len(msgs) >= 4  # 4 seed messages between these two users

    def test_missing_userId(self):
        r = requests.get(f"{MESSAGES}/", params={"partnerId": TUTOR_ID})
        assert r.status_code == 400

    def test_missing_partnerId(self):
        r = requests.get(f"{MESSAGES}/", params={"userId": STUDENT_ID})
        assert r.status_code == 400


class TestSendMessage:
    def test_send_message(self):
        global _sent_id
        r = requests.post(f"{MESSAGES}/", json={
            "senderId":   STUDENT_ID,
            "receiverId": TUTOR_ID,
            "content":    "Test message from automated test",
        })
        assert r.status_code in (200, 201)
        body = r.json()
        assert "id" in body or "messageId" in body or "message_id" in body
        _sent_id = body.get("id") or body.get("messageId") or body.get("message_id")

    def test_send_missing_content(self):
        r = requests.post(f"{MESSAGES}/", json={
            "senderId":   STUDENT_ID,
            "receiverId": TUTOR_ID,
        })
        assert r.status_code == 400


class TestMarkAsRead:
    def test_mark_as_read(self):
        # Use the known seed message
        r = requests.patch(f"{MESSAGES}/{MSG_ID}/read")
        # The procedure marks all messages from that sender→receiver as READ
        assert r.status_code in (200, 400, 404)

    def test_mark_sent_message_as_read(self):
        global _sent_id
        if _sent_id:
            r = requests.patch(f"{MESSAGES}/{_sent_id}/read")
            assert r.status_code in (200, 400, 404)
        else:
            pytest.skip("No sent message id")
