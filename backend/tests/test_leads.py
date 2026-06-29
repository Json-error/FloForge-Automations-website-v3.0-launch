"""Backend tests for FloForge Leads API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://lead-automation-hub-19.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health check
def test_root_health(api_client):
    r = api_client.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# Lead create + persistence verification
class TestLeads:
    def test_create_lead_and_verify_persistence(self, api_client):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "full_name": f"TEST_User_{unique}",
            "company_name": f"TEST_Co_{unique}",
            "email": f"test_{unique}@example.com",
            "bottleneck": "Leads",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
        data = r.json()
        # Data assertions on response
        assert data["full_name"] == payload["full_name"]
        assert data["company_name"] == payload["company_name"]
        assert data["email"] == payload["email"]
        assert data["bottleneck"] == payload["bottleneck"]
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert "_id" not in data, "Mongo _id should not be exposed"

        lead_id = data["id"]

        # GET to verify persisted
        r2 = api_client.get(f"{API}/leads")
        assert r2.status_code == 200
        leads = r2.json()
        assert isinstance(leads, list)
        found = [l for l in leads if l.get("id") == lead_id]
        assert len(found) == 1, "Created lead not found via GET /api/leads"
        assert found[0]["email"] == payload["email"]
        # _id should not leak
        for l in leads:
            assert "_id" not in l

    def test_invalid_email_rejected(self, api_client):
        payload = {
            "full_name": "TEST_Bad",
            "company_name": "TEST_BadCo",
            "email": "not-an-email",
            "bottleneck": "Leads",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 422, f"expected 422, got {r.status_code} body={r.text}"

    def test_missing_fields_rejected(self, api_client):
        payload = {"full_name": "", "company_name": "", "email": "", "bottleneck": ""}
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 422

    def test_partial_payload_rejected(self, api_client):
        payload = {"full_name": "TEST_Partial"}
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 422

    def test_leads_sorted_desc(self, api_client):
        # Create two leads, ensure newest first
        for i in range(2):
            unique = uuid.uuid4().hex[:8]
            api_client.post(f"{API}/leads", json={
                "full_name": f"TEST_Sort_{i}_{unique}",
                "company_name": f"TEST_SortCo_{unique}",
                "email": f"sort_{unique}@example.com",
                "bottleneck": "Operations",
            })
        r = api_client.get(f"{API}/leads")
        assert r.status_code == 200
        leads = r.json()
        if len(leads) >= 2:
            assert leads[0]["created_at"] >= leads[1]["created_at"]
