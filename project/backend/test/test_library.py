"""Tests for /api/library endpoints."""
import uuid
import pytest
import requests
from .constants import BASE_URL

LIBRARY = f"{BASE_URL}/api/library"

_UNIQUE = uuid.uuid4().hex[:8]
NEW_DOC = {
    "title":  f"Test Document {_UNIQUE}",
    "author": "AutoTest Bot",
    "type":   "PDF",
    "url":    f"https://test.example.com/doc/{_UNIQUE}",
}


class TestGetDocuments:
    def test_get_all(self):
        r = requests.get(f"{LIBRARY}/")
        assert r.status_code == 200
        body = r.json()
        assert "resources" in body
        assert len(body["resources"]) > 0

    def test_filter_by_type_pdf(self):
        r = requests.get(f"{LIBRARY}/", params={"type": "PDF"})
        assert r.status_code == 200
        for doc in r.json()["resources"]:
            assert doc.get("type") == "PDF"

    def test_filter_by_type_video(self):
        r = requests.get(f"{LIBRARY}/", params={"type": "VIDEO"})
        assert r.status_code == 200

    def test_search_by_title(self):
        r = requests.get(f"{LIBRARY}/", params={"search": "java"})
        assert r.status_code == 200
        assert len(r.json()["resources"]) > 0


class TestAddDocument:
    created_id = None

    def test_add_document(self):
        r = requests.post(f"{LIBRARY}/", json=NEW_DOC)
        assert r.status_code == 201
        body = r.json()
        assert "id" in body
        TestAddDocument.created_id = body["id"]

    def test_add_duplicate_url(self):
        r = requests.post(f"{LIBRARY}/", json=NEW_DOC)
        assert r.status_code == 409

    def test_add_missing_fields(self):
        r = requests.post(f"{LIBRARY}/", json={"title": "No URL"})
        assert r.status_code == 400


class TestDeleteDocument:
    def test_delete_created_document(self):
        if TestAddDocument.created_id:
            r = requests.delete(f"{LIBRARY}/{TestAddDocument.created_id}")
            assert r.status_code == 200
        else:
            pytest.skip("No document created")

    def test_delete_nonexistent(self):
        r = requests.delete(f"{LIBRARY}/no-such-doc-id")
        assert r.status_code == 404
