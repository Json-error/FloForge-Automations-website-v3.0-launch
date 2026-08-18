"""Regression tests for FloForge platform auth, RBAC, dashboards, booking, messaging and admin APIs."""
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import bcrypt
import pytest
import requests
from dotenv import dotenv_values
from pymongo import MongoClient

frontend_env = dotenv_values("/app/frontend/.env")
backend_env = dotenv_values("/app/backend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
if not BASE_URL:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")
API = f"{BASE_URL}/api"
mongo = MongoClient(backend_env["MONGO_URL"])
db = mongo[backend_env["DB_NAME"]]

credentials_text = Path("/app/memory/test_credentials.md").read_text(encoding="utf-8")
admin_section = credentials_text.split("## Test client", 1)[0]
ADMIN_EMAIL_MATCH = re.search(r"(?im)^- Email:\s*(\S+)", admin_section)
ADMIN_PASSWORD_MATCH = re.search(r"(?im)^- Password:\s*(\S+)", admin_section)
if not ADMIN_EMAIL_MATCH or not ADMIN_PASSWORD_MATCH:
    raise RuntimeError("Admin credentials missing from /app/memory/test_credentials.md")
ADMIN_EMAIL = ADMIN_EMAIL_MATCH.group(1)
ADMIN_PASSWORD = ADMIN_PASSWORD_MATCH.group(1)


AZ_TZ = ZoneInfo("America/Phoenix")


def _future_weekday(days=10):
    d = datetime.now(AZ_TZ).date() + timedelta(days=days)
    while d.weekday() > 4:
        d += timedelta(days=1)
    return d


@pytest.fixture(scope="module")
def admin_client():
    """Authenticated admin session; removes only sessions created by this fixture."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    response = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert response.status_code == 200, response.text
    token = session.cookies.get("session_token")
    yield session
    if token:
        db.user_sessions.delete_one({"session_token": token})
    session.close()


@pytest.fixture(scope="module")
def client_context():
    """Register a unique client through the public API and clean all associated test records."""
    unique = uuid.uuid4().hex[:10]
    email = f"test_platform_{unique}@example.com"
    name = f"TEST_Client_{unique}"
    password = "pass123"
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    response = session.post(f"{API}/auth/register", json={"email": email, "password": password, "name": name})
    assert response.status_code == 200, response.text
    user = response.json()
    token = session.cookies.get("session_token")
    context = {"session": session, "user": user, "email": email, "password": password, "token": token}
    yield context
    uid = user["user_id"]
    db.bookings.delete_many({"user_id": uid})
    db.messages.delete_many({"user_id": uid})
    db.growth_updates.delete_many({"user_id": uid})
    db.activity_log.delete_many({"user_id": uid})
    db.resources.delete_many({"user_id": uid})
    db.payment_transactions.delete_many({"customer_email": email, "session_id": {"$regex": "^TEST_"}})
    db.user_sessions.delete_many({"user_id": uid})
    db.users.delete_one({"user_id": uid})
    session.close()


class TestAuthenticationAndRBAC:
    """Cookie auth, registration, bearer support, RBAC, hashing and abuse controls."""

    def test_admin_login_sets_secure_httponly_cookie_and_me(self):
        session = requests.Session()
        response = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert response.status_code == 200, response.text
        user = response.json()
        assert user["email"] == ADMIN_EMAIL
        assert user["role"] == "admin"
        assert "password_hash" not in user and "_id" not in user
        cookie = response.headers.get("set-cookie", "").lower()
        assert "session_token=" in cookie
        assert "httponly" in cookie
        assert "secure" in cookie
        me = session.get(f"{API}/auth/me")
        assert me.status_code == 200
        assert me.json()["user_id"] == user["user_id"]
        token = session.cookies.get("session_token")
        if token:
            db.user_sessions.delete_one({"session_token": token})

    def test_registered_client_has_client_role_cookie_and_me(self, client_context):
        user = client_context["user"]
        assert user["email"] == client_context["email"]
        assert user["name"].startswith("TEST_Client_")
        assert user["role"] == "client"
        assert isinstance(user["user_id"], str)
        assert client_context["token"]
        response = client_context["session"].get(f"{API}/auth/me")
        assert response.status_code == 200
        assert response.json()["email"] == client_context["email"]

    def test_password_hash_is_bcrypt_2b(self, client_context):
        record = db.users.find_one({"user_id": client_context["user"]["user_id"]})
        assert record["password_hash"].startswith("$2b$")
        assert bcrypt.checkpw(client_context["password"].encode(), record["password_hash"].encode())

    def test_bearer_session_is_accepted(self, client_context):
        response = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {client_context['token']}"},
        )
        assert response.status_code == 200
        assert response.json()["user_id"] == client_context["user"]["user_id"]

    @pytest.mark.parametrize("endpoint", ["/admin/clients", "/admin/revenue"])
    def test_client_is_forbidden_from_admin_endpoints(self, client_context, endpoint):
        response = client_context["session"].get(f"{API}{endpoint}")
        assert response.status_code == 403
        assert response.json()["detail"] == "Admin only"

    @pytest.mark.parametrize("endpoint", ["/admin/clients", "/admin/revenue"])
    def test_unauthenticated_admin_endpoint_is_401(self, endpoint):
        response = requests.get(f"{API}{endpoint}")
        assert response.status_code == 401
        assert "detail" in response.json()

    def test_login_rate_limited_after_five_failures(self):
        session = requests.Session()
        email = f"test_lockout_{uuid.uuid4().hex[:10]}@example.com"
        statuses = []
        try:
            for _ in range(6):
                response = session.post(f"{API}/auth/login", json={"email": email, "password": "TEST_wrong_password"})
                statuses.append(response.status_code)
            assert statuses[:5] == [401] * 5
            assert statuses[5] == 429, f"Expected lockout on sixth attempt, got {statuses}"
        finally:
            db.login_attempts.delete_one({"email": email})


class TestAdminData:
    """Admin client list, revenue, deliverables and lead pipeline behavior."""

    def test_admin_clients_contains_registered_client(self, admin_client, client_context):
        response = admin_client.get(f"{API}/admin/clients")
        assert response.status_code == 200, response.text
        clients = response.json()
        assert isinstance(clients, list)
        found = next(c for c in clients if c["user_id"] == client_context["user"]["user_id"])
        assert found["email"] == client_context["email"]
        assert isinstance(found["orders"], list)
        assert "password_hash" not in found and "_id" not in found

    def test_admin_revenue_matches_paid_transactions(self, admin_client):
        response = admin_client.get(f"{API}/admin/revenue")
        assert response.status_code == 200, response.text
        data = response.json()
        paid = list(db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}))
        assert data["total"] == sum(t.get("amount", 0) for t in paid)
        assert data["count"] == len(paid)
        assert isinstance(data["by_tier"], list)
        assert isinstance(data["recent"], list) and len(data["recent"]) <= 10
        assert all(set(item) == {"name", "amount"} for item in data["by_tier"])

    def test_deliverable_update_reflects_in_client_orders(self, admin_client, client_context):
        session_id = f"TEST_order_{uuid.uuid4().hex[:10]}"
        db.payment_transactions.insert_one({
            "session_id": session_id,
            "customer_email": client_context["email"],
            "lookup_key": "starter_setup_onetime",
            "tier_name": "Starter Setup",
            "amount": 149900,
            "currency": "usd",
            "status": "completed",
            "payment_status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        try:
            patch = admin_client.patch(f"{API}/admin/deliverable", json={
                "session_id": session_id, "key": "d0", "status": "complete"
            })
            assert patch.status_code == 200, patch.text
            changed = next(d for d in patch.json()["deliverables"] if d["key"] == "d0")
            assert changed["status"] == "complete"
            orders_response = client_context["session"].get(f"{API}/client/orders")
            assert orders_response.status_code == 200
            order = next(o for o in orders_response.json() if o["session_id"] == session_id)
            assert next(d for d in order["deliverables"] if d["key"] == "d0")["status"] == "complete"
        finally:
            db.payment_transactions.delete_one({"session_id": session_id})

    def test_lead_status_update_persists(self, admin_client):
        lead_id = f"TEST_lead_{uuid.uuid4().hex[:10]}"
        db.leads.insert_one({
            "id": lead_id, "full_name": "TEST Pipeline Lead", "company_name": "TEST Co",
            "email": f"{lead_id.lower()}@example.com", "bottleneck": "Operations",
            "status": "new", "created_at": datetime.now(timezone.utc).isoformat(),
        })
        try:
            before = admin_client.get(f"{API}/admin/leads")
            assert before.status_code == 200
            assert next(l for l in before.json() if l["id"] == lead_id)["status"] == "new"
            patch = admin_client.patch(f"{API}/admin/leads/{lead_id}", json={"status": "contacted"})
            assert patch.status_code == 200 and patch.json() == {"ok": True}
            after = admin_client.get(f"{API}/admin/leads")
            assert next(l for l in after.json() if l["id"] == lead_id)["status"] == "contacted"
        finally:
            db.leads.delete_one({"id": lead_id})

    def test_lead_rejects_unsupported_status(self, admin_client):
        lead_id = f"TEST_lead_{uuid.uuid4().hex[:10]}"
        db.leads.insert_one({"id": lead_id, "status": "new", "created_at": datetime.now(timezone.utc).isoformat()})
        try:
            response = admin_client.patch(f"{API}/admin/leads/{lead_id}", json={"status": "invalid_status"})
            assert response.status_code in (400, 422)
            assert db.leads.find_one({"id": lead_id})["status"] == "new"
        finally:
            db.leads.delete_one({"id": lead_id})


class TestBooking:
    """Availability schedule, authenticated booking persistence and separation buffer."""

    def test_future_weekday_slots_are_half_hour_between_9_and_4_az(self):
        day = _future_weekday(20)
        response = requests.get(f"{API}/bookings/availability", params={"date": day.isoformat()})
        assert response.status_code == 200, response.text
        slots = response.json()
        assert isinstance(slots, list) and slots, "Expected at least one future weekday slot"
        for slot in slots:
            parsed = datetime.fromisoformat(slot["start"]).astimezone(AZ_TZ)
            assert parsed.date() == day
            assert parsed.weekday() < 5
            assert 9 <= parsed.hour < 16
            assert parsed.minute in (0, 30)
            assert isinstance(slot["label"], str) and slot["label"]

    def test_past_date_and_weekend_have_no_availability(self):
        past = (datetime.now(AZ_TZ).date() - timedelta(days=2)).isoformat()
        weekend = _future_weekday(20)
        while weekend.weekday() != 5:
            weekend += timedelta(days=1)
        past_response = requests.get(f"{API}/bookings/availability", params={"date": past})
        weekend_response = requests.get(f"{API}/bookings/availability", params={"date": weekend.isoformat()})
        assert past_response.status_code == 200 and past_response.json() == []
        assert weekend_response.status_code == 200 and weekend_response.json() == []

    def test_booking_removes_selected_and_adjacent_slots_and_persists(self, client_context):
        day = _future_weekday(30)
        response = requests.get(f"{API}/bookings/availability", params={"date": day.isoformat()})
        assert response.status_code == 200
        slots = response.json()
        starts = [datetime.fromisoformat(s["start"]) for s in slots]
        chosen = None
        for candidate in starts:
            if candidate + timedelta(minutes=30) in starts:
                chosen = candidate
                break
        assert chosen is not None, "No adjacent availability pair available for buffer test"
        create = client_context["session"].post(f"{API}/bookings", json={"slot_start": chosen.isoformat()})
        assert create.status_code == 200, create.text
        booking = create.json()
        assert booking["user_id"] == client_context["user"]["user_id"]
        assert booking["status"] == "confirmed"
        assert booking["slot_start"] == chosen.isoformat()
        listed = client_context["session"].get(f"{API}/client/bookings")
        assert listed.status_code == 200
        assert any(b["booking_id"] == booking["booking_id"] for b in listed.json())
        after = requests.get(f"{API}/bookings/availability", params={"date": day.isoformat()}).json()
        after_starts = {datetime.fromisoformat(s["start"]) for s in after}
        assert chosen not in after_starts
        assert chosen - timedelta(minutes=30) not in after_starts
        assert chosen + timedelta(minutes=30) not in after_starts

    def test_malformed_availability_date_returns_client_error(self):
        response = requests.get(f"{API}/bookings/availability", params={"date": "not-a-date"})
        assert response.status_code in (400, 422), response.text

    @pytest.mark.parametrize("kind", ["weekend", "outside_hours", "misaligned"])
    def test_booking_rejects_times_outside_published_schedule(self, client_context, kind):
        day = _future_weekday(40)
        if kind == "weekend":
            while day.weekday() != 6:
                day += timedelta(days=1)
            slot = datetime.combine(day, datetime.min.time(), AZ_TZ).replace(hour=10)
        elif kind == "outside_hours":
            slot = datetime.combine(day, datetime.min.time(), AZ_TZ).replace(hour=3)
        else:
            slot = datetime.combine(day, datetime.min.time(), AZ_TZ).replace(hour=10, minute=15)
        response = client_context["session"].post(f"{API}/bookings", json={"slot_start": slot.isoformat()})
        assert response.status_code in (400, 422), response.text

    def test_booking_rejects_naive_datetime_without_server_error(self, client_context):
        day = _future_weekday(50)
        naive = datetime.combine(day, datetime.min.time()).replace(hour=10).isoformat()
        response = client_context["session"].post(f"{API}/bookings", json={"slot_start": naive})
        assert response.status_code in (400, 422), response.text


class TestMessagingAndGrowth:
    """Bidirectional client/admin messages and admin-to-client growth updates."""

    def test_bidirectional_messages_visible_to_both_roles(self, admin_client, client_context):
        client_body = f"TEST_client_message_{uuid.uuid4().hex[:8]}"
        admin_body = f"TEST_admin_reply_{uuid.uuid4().hex[:8]}"
        sent = client_context["session"].post(f"{API}/client/messages", json={"body": client_body})
        assert sent.status_code == 200, sent.text
        assert sent.json()["sender"] == "client" and sent.json()["body"] == client_body
        admin_view = admin_client.get(
            f"{API}/admin/messages", params={"user_id": client_context["user"]["user_id"]}
        )
        assert admin_view.status_code == 200
        assert any(m["body"] == client_body and m["sender"] == "client" for m in admin_view.json())
        reply = admin_client.post(f"{API}/admin/messages", json={
            "user_id": client_context["user"]["user_id"], "body": admin_body
        })
        assert reply.status_code == 200
        assert reply.json()["sender"] == "admin" and reply.json()["body"] == admin_body
        client_view = client_context["session"].get(f"{API}/client/messages")
        assert client_view.status_code == 200
        assert any(m["body"] == admin_body and m["sender"] == "admin" for m in client_view.json())

    def test_growth_update_visible_to_target_client(self, admin_client, client_context):
        body = f"TEST_growth_update_{uuid.uuid4().hex[:8]}"
        create = admin_client.post(f"{API}/admin/updates", json={
            "user_id": client_context["user"]["user_id"], "body": body
        })
        assert create.status_code == 200, create.text
        update = create.json()
        assert update["user_id"] == client_context["user"]["user_id"]
        assert update["body"] == body
        response = client_context["session"].get(f"{API}/client/updates")
        assert response.status_code == 200
        assert isinstance(response.json()["updates"], list)
        assert any(item["update_id"] == update["update_id"] and item["body"] == body for item in response.json()["updates"])


class TestDashboardSeparationAPIs:
    """Role separation and authentication guards for new client/admin dashboard APIs."""

    @pytest.mark.parametrize("method", ["get", "post"])
    def test_admin_cannot_use_client_messaging(self, admin_client, method):
        if method == "get":
            response = admin_client.get(f"{API}/client/messages")
        else:
            response = admin_client.post(f"{API}/client/messages", json={"body": "TEST_admin_must_not_self_message"})
        assert response.status_code == 403, response.text
        assert "admin" in response.json()["detail"].lower()

    @pytest.mark.parametrize("endpoint", ["/admin/inbox", "/admin/activity", "/admin/resources"])
    def test_client_cannot_access_new_admin_endpoints(self, client_context, endpoint):
        response = client_context["session"].get(f"{API}{endpoint}")
        assert response.status_code == 403, response.text
        assert response.json()["detail"] == "Admin only"

    @pytest.mark.parametrize("endpoint", ["/client/timeline", "/client/resources"])
    def test_new_client_endpoints_require_authentication(self, endpoint):
        response = requests.get(f"{API}{endpoint}")
        assert response.status_code == 401, response.text
        assert "detail" in response.json()


class TestAdminInboxActivityAndRevenue:
    """Admin inbox grouping, activity merge/sort, and revenue chart response data."""

    def test_inbox_groups_thread_and_admin_reply_reaches_client(self, admin_client, client_context):
        client_body = f"TEST_inbox_client_{uuid.uuid4().hex[:8]}"
        admin_body = f"TEST_inbox_reply_{uuid.uuid4().hex[:8]}"
        sent = client_context["session"].post(f"{API}/client/messages", json={"body": client_body})
        assert sent.status_code == 200, sent.text

        inbox_response = admin_client.get(f"{API}/admin/inbox")
        assert inbox_response.status_code == 200, inbox_response.text
        inbox = inbox_response.json()
        assert isinstance(inbox, list)
        assert inbox == sorted(inbox, key=lambda item: item["last_at"], reverse=True)
        thread = next(item for item in inbox if item["user_id"] == client_context["user"]["user_id"])
        assert set(thread) == {"user_id", "user_name", "user_email", "last_message", "last_sender", "last_at", "count"}
        assert thread["user_name"] == client_context["user"]["name"]
        assert thread["user_email"] == client_context["email"]
        assert thread["last_message"] == client_body
        assert thread["last_sender"] == "client"
        assert isinstance(thread["count"], int) and thread["count"] >= 1

        reply = admin_client.post(f"{API}/admin/messages", json={
            "user_id": client_context["user"]["user_id"], "body": admin_body
        })
        assert reply.status_code == 200, reply.text
        assert reply.json()["sender"] == "admin"
        client_messages = client_context["session"].get(f"{API}/client/messages")
        assert client_messages.status_code == 200
        assert any(message["body"] == admin_body and message["sender"] == "admin" for message in client_messages.json())

        refreshed = admin_client.get(f"{API}/admin/inbox").json()
        refreshed_thread = next(item for item in refreshed if item["user_id"] == client_context["user"]["user_id"])
        assert refreshed_thread["last_message"] == admin_body
        assert refreshed_thread["last_sender"] == "admin"
        assert refreshed_thread["count"] == thread["count"] + 1

    def test_activity_merges_four_sources_sorted_and_capped(self, admin_client, client_context):
        marker = uuid.uuid4().hex[:8]
        now = datetime.now(timezone.utc)
        lead_id = f"TEST_activity_lead_{marker}"
        session_id = f"TEST_activity_payment_{marker}"
        booking_id = f"TEST_activity_booking_{marker}"
        message_id = f"TEST_activity_message_{marker}"
        docs = {
            "lead": {"id": lead_id, "full_name": f"TEST Lead {marker}", "company_name": "TEST Co", "created_at": (now - timedelta(minutes=4)).isoformat()},
            "payment": {"session_id": session_id, "customer_email": client_context["email"], "lookup_key": "starter_setup_onetime", "amount": 10000, "payment_status": "paid", "created_at": (now - timedelta(minutes=3)).isoformat(), "updated_at": (now - timedelta(minutes=3)).isoformat()},
            "booking": {"booking_id": booking_id, "user_id": client_context["user"]["user_id"], "user_name": client_context["user"]["name"], "user_email": client_context["email"], "slot_start": (now + timedelta(days=2)).isoformat(), "status": "confirmed", "created_at": (now - timedelta(minutes=2)).isoformat()},
            "message": {"message_id": message_id, "user_id": client_context["user"]["user_id"], "user_name": client_context["user"]["name"], "sender": "client", "body": f"TEST activity message {marker}", "created_at": (now - timedelta(minutes=1)).isoformat()},
        }
        db.leads.insert_one(docs["lead"])
        db.payment_transactions.insert_one(docs["payment"])
        db.bookings.insert_one(docs["booking"])
        db.messages.insert_one(docs["message"])
        try:
            response = admin_client.get(f"{API}/admin/activity")
            assert response.status_code == 200, response.text
            events = response.json()
            assert isinstance(events, list) and len(events) <= 40
            assert events == sorted(events, key=lambda event: event["at"], reverse=True)
            assert any(event["type"] == "lead" and marker in event["label"] for event in events)
            assert any(event["type"] == "payment" and client_context["email"] in event["label"] for event in events)
            assert any(event["type"] == "booking" and client_context["user"]["name"] in event["label"] for event in events)
            assert any(event["type"] == "message" and marker in event["label"] for event in events)
        finally:
            db.leads.delete_one({"id": lead_id})
            db.payment_transactions.delete_one({"session_id": session_id})
            db.bookings.delete_one({"booking_id": booking_id})
            db.messages.delete_one({"message_id": message_id})

    def test_revenue_contains_monthly_series_matching_paid_data(self, admin_client):
        response = admin_client.get(f"{API}/admin/revenue")
        assert response.status_code == 200, response.text
        data = response.json()
        expected = {}
        for txn in db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}):
            month = str(txn.get("updated_at") or txn.get("created_at") or "")[:7]
            if month:
                expected[month] = expected.get(month, 0) + txn.get("amount", 0)
        assert data["by_month"] == [{"month": month, "amount": expected[month]} for month in sorted(expected)]
        assert all(isinstance(item["month"], str) and isinstance(item["amount"], (int, float)) for item in data["by_month"])


class TestResourcesTimelineAndClientAdminTools:
    """Resource CRUD, client timeline logging, deliverable validation, notes and review persistence."""

    def test_resource_create_list_client_visibility_delete(self, admin_client, client_context):
        marker = uuid.uuid4().hex[:8]
        payload = {
            "user_id": client_context["user"]["user_id"],
            "title": f"TEST Resource {marker}",
            "url": f"https://example.com/test-{marker}",
            "description": "TEST resource description",
        }
        created_response = admin_client.post(f"{API}/admin/resources", json=payload)
        assert created_response.status_code == 200, created_response.text
        created = created_response.json()
        assert isinstance(created["resource_id"], str) and created["resource_id"].startswith("res_")
        assert created["user_id"] == payload["user_id"]
        assert created["title"] == payload["title"]
        assert created["url"] == payload["url"]
        resource_id = created["resource_id"]
        try:
            admin_list = admin_client.get(f"{API}/admin/resources", params={"user_id": payload["user_id"]})
            assert admin_list.status_code == 200
            assert any(item["resource_id"] == resource_id and item["title"] == payload["title"] for item in admin_list.json())
            client_list = client_context["session"].get(f"{API}/client/resources")
            assert client_list.status_code == 200
            assert any(item["resource_id"] == resource_id and item["url"] == payload["url"] for item in client_list.json())
            timeline = client_context["session"].get(f"{API}/client/timeline")
            assert timeline.status_code == 200
            assert any(event["type"] == "resource" and payload["title"] in event["label"] for event in timeline.json())

            deleted = admin_client.delete(f"{API}/admin/resources/{resource_id}")
            assert deleted.status_code == 200 and deleted.json() == {"ok": True}
            assert not any(item["resource_id"] == resource_id for item in admin_client.get(f"{API}/admin/resources", params={"user_id": payload["user_id"]}).json())
            assert not any(item["resource_id"] == resource_id for item in client_context["session"].get(f"{API}/client/resources").json())
        finally:
            db.resources.delete_one({"resource_id": resource_id})

    def test_deliverable_changes_log_timeline_and_invalid_status_is_rejected(self, admin_client, client_context):
        marker = uuid.uuid4().hex[:8]
        session_id = f"TEST_timeline_order_{marker}"
        db.payment_transactions.insert_one({
            "session_id": session_id,
            "customer_email": client_context["email"],
            "lookup_key": "starter_setup_onetime",
            "tier_name": "Starter Setup",
            "amount": 149900,
            "currency": "usd",
            "payment_status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        try:
            invalid = admin_client.patch(f"{API}/admin/deliverable", json={"session_id": session_id, "key": "d0", "status": "invalid"})
            assert invalid.status_code == 422, invalid.text
            assert "deliverables" not in db.payment_transactions.find_one({"session_id": session_id})

            started = admin_client.patch(f"{API}/admin/deliverable", json={"session_id": session_id, "key": "d0", "status": "in_progress"})
            assert started.status_code == 200, started.text
            assert next(item for item in started.json()["deliverables"] if item["key"] == "d0")["status"] == "in_progress"
            timeline = client_context["session"].get(f"{API}/client/timeline")
            assert timeline.status_code == 200
            event = next(item for item in timeline.json() if item["type"] == "deliverable" and "CRM setup" in item["label"])
            assert event["label"] == "CRM setup — started"
            assert isinstance(event["at"], str) and event["at"]

            completed = admin_client.patch(f"{API}/admin/deliverable", json={"session_id": session_id, "key": "d0", "status": "complete"})
            assert completed.status_code == 200
            timeline_after = client_context["session"].get(f"{API}/client/timeline").json()
            assert any(item["label"] == "CRM setup — completed" for item in timeline_after)
        finally:
            db.activity_log.delete_many({"user_id": client_context["user"]["user_id"]})
            db.payment_transactions.delete_one({"session_id": session_id})

    def test_notes_and_quarterly_review_save_persist(self, admin_client, client_context):
        uid = client_context["user"]["user_id"]
        notes = f"TEST notes {uuid.uuid4().hex[:8]}"
        review = "2027-01-15"
        response = admin_client.patch(f"{API}/admin/clients/{uid}", json={"notes": notes, "next_quarterly_review": review})
        assert response.status_code == 200 and response.json() == {"ok": True}
        stored = db.users.find_one({"user_id": uid})
        assert stored["notes"] == notes
        assert stored["next_quarterly_review"] == review
        listed = admin_client.get(f"{API}/admin/clients")
        assert listed.status_code == 200
        client = next(item for item in listed.json() if item["user_id"] == uid)
        assert client["notes"] == notes
        assert client["next_quarterly_review"] == review



@pytest.fixture(scope="module")
def seeded_client_session():
    """Authenticated session for the seeded client account from the credentials file."""
    client_section = credentials_text.split("## Test client", 1)[1]
    email_match = re.search(r"(?im)^- Email:\s*(\S+)", client_section)
    password_match = re.search(r"(?im)^- Password:\s*(\S+)", client_section)
    if not email_match or not password_match:
        pytest.skip("Seeded client credentials are missing")
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    response = session.post(f"{API}/auth/login", json={
        "email": email_match.group(1), "password": password_match.group(1)
    })
    assert response.status_code == 200, response.text
    token = session.cookies.get("session_token")
    yield session
    if token:
        db.user_sessions.delete_one({"session_token": token})
    session.close()


class TestOverhaulPublicAndBillingAPIs:
    """Provider deprecation, direct lead persistence, and client billing response coverage."""

    def test_auth_providers_and_removed_session_endpoint(self):
        providers = requests.get(f"{API}/auth/providers")
        assert providers.status_code == 200, providers.text
        assert providers.json() == {"hubspot": False, "google": False, "microsoft": False, "apple": False}
        for method in (requests.get, requests.post):
            removed = method(f"{API}/auth/session")
            assert removed.status_code in (404, 405), removed.text

    def test_client_billing_has_seeded_paid_payment(self, seeded_client_session):
        response = seeded_client_session.get(f"{API}/client/billing")
        assert response.status_code == 200, response.text
        data = response.json()
        assert set(data) == {"subscriptions", "invoices", "payments"}
        assert all(isinstance(data[key], list) for key in data)
        payments = [item for item in data["payments"] if item["tier_name"] == "Business Automation"]
        assert payments, f"Expected seeded Business Automation payment, got {data['payments']}"
        payment = payments[0]
        assert payment["amount"] > 0
        assert payment["currency"] == "usd"
        assert payment["recurring"] is False
        assert isinstance(payment["session_id"], str) and payment["session_id"]

    def test_lead_creation_persists_despite_email_or_hubspot_outcome(self):
        marker = uuid.uuid4().hex[:10]
        email = f"test_lead_overhaul_{marker}@example.com"
        payload = {"full_name": f"TEST Lead {marker}", "company_name": "TEST FloForge QA",
                   "email": email, "bottleneck": "Operations"}
        response = requests.post(f"{API}/leads", json=payload)
        assert response.status_code == 200, response.text
        lead = response.json()
        assert lead["full_name"] == payload["full_name"]
        assert lead["email"] == email
        try:
            stored = db.leads.find_one({"id": lead["id"]})
            assert stored is not None
            assert stored["email"] == email
            assert isinstance(stored.get("email_sent"), bool)
            assert isinstance(stored.get("hubspot_synced"), bool)
        finally:
            db.leads.delete_one({"id": lead["id"]})


class TestHubSpotUnconfiguredState:
    """HubSpot endpoints degrade safely while OAuth credentials are intentionally absent."""

    def test_public_config_and_oauth_start(self):
        config = requests.get(f"{API}/hubspot/config")
        assert config.status_code == 200 and config.json() == {"configured": False}
        start = requests.get(f"{API}/hubspot/oauth/start", allow_redirects=False)
        assert start.status_code == 503, start.text
        assert "not configured" in start.json()["detail"].lower()

    def test_authenticated_status_and_disconnected_resources(self, seeded_client_session):
        status = seeded_client_session.get(f"{API}/hubspot/status")
        assert status.status_code == 200, status.text
        data = status.json()
        assert data["configured"] is False
        assert data["connected"] is False
        contacts = seeded_client_session.get(f"{API}/hubspot/contacts")
        assert contacts.status_code == 404, contacts.text
        assert contacts.json()["detail"] == "Connect your HubSpot account first"
        deals = seeded_client_session.get(f"{API}/hubspot/deals")
        assert deals.status_code == 404, deals.text
        assert deals.json()["detail"] == "Connect your HubSpot account first"
