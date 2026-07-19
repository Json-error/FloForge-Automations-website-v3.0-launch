"""Backend tests for FloForge Stripe payments API (Flow A sandbox)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestPaymentsCheckout:
    def test_checkout_starter_onetime(self, api_client):
        r = api_client.post(f"{API}/payments/checkout", json={
            "lookup_key": "starter_setup_onetime",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
        data = r.json()
        assert "checkout_url" in data and data["checkout_url"].startswith("https://")
        assert "checkout.stripe.com" in data["checkout_url"]
        assert "session_id" in data and data["session_id"].startswith("cs_")
        pytest.starter_session_id = data["session_id"]

    def test_checkout_business_onetime(self, api_client):
        r = api_client.post(f"{API}/payments/checkout", json={
            "lookup_key": "business_automation_onetime",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
        data = r.json()
        assert data["session_id"].startswith("cs_")
        assert "checkout.stripe.com" in data["checkout_url"]

    def test_checkout_growth_subscription(self, api_client):
        r = api_client.post(f"{API}/payments/checkout", json={
            "lookup_key": "growth_partnership_monthly",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
        data = r.json()
        assert data["session_id"].startswith("cs_")
        assert "checkout.stripe.com" in data["checkout_url"]
        pytest.sub_session_id = data["session_id"]

    def test_checkout_invalid_lookup_key(self, api_client):
        r = api_client.post(f"{API}/payments/checkout", json={
            "lookup_key": "nonexistent_key_xyz",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 500, f"expected 500, got {r.status_code} body={r.text}"

    def test_checkout_missing_fields(self, api_client):
        r = api_client.post(f"{API}/payments/checkout", json={})
        assert r.status_code == 422


class TestPaymentStatus:
    def test_status_for_created_session(self, api_client):
        # ensure a session exists
        sid = getattr(pytest, "starter_session_id", None)
        if not sid:
            r = api_client.post(f"{API}/payments/checkout", json={
                "lookup_key": "starter_setup_onetime",
                "origin_url": "https://example.com",
            })
            sid = r.json()["session_id"]
        r = api_client.get(f"{API}/payments/status/{sid}")
        assert r.status_code == 200
        data = r.json()
        assert data["session_id"] == sid
        assert data["payment_status"] == "pending"
        assert data["status"] == "initiated"

    def test_status_for_unknown_session(self, api_client):
        r = api_client.get(f"{API}/payments/status/cs_test_unknown_session_id_xxx")
        assert r.status_code == 404
