"""FloForge platform: auth (email/password + Emergent Google), client & admin dashboards."""
import os
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path

import bcrypt
import httpx
import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Literal
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")

_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = _client[os.environ["DB_NAME"]]

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
from emailer import notify_email as send_email
NOTIFY_EMAIL = os.environ.get("LEAD_NOTIFY_EMAIL", "")
AZ_TZ = ZoneInfo("America/Phoenix")
SESSION_DAYS = 7

TIER_META = {
    "starter_setup_onetime": {"name": "Starter Setup", "recurring": False, "deliverables": [
        "CRM setup", "Contact organization", "Custom pipeline", "Deal stages", "Basic dashboard", "1 training session"]},
    "business_automation_onetime": {"name": "Business Automation", "recurring": False, "deliverables": [
        "CRM setup", "Contact organization", "Custom pipeline", "Deal stages", "Dashboard customization",
        "Workflow automation", "Lead capture forms", "Automated follow-ups", "Task automation",
        "Internal notifications", "2 training sessions"]},
    "growth_partnership_monthly": {"name": "Growth Partnership", "recurring": True, "deliverables": [
        "Monthly CRM optimization", "New automations", "Workflow improvements", "Dashboard updates",
        "Priority support", "Quarterly business review"]},
}


def deliverables_for(lookup_key):
    labels = TIER_META.get(lookup_key, {}).get("deliverables", [])
    return [{"key": f"d{i}", "label": l, "status": "pending"} for i, l in enumerate(labels)]


# ---------- password / session ----------
def hash_pw(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_pw(p, h):
    try: return bcrypt.checkpw(p.encode(), h.encode())
    except Exception: return False


async def _make_session(resp: Response, user_id: str):
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "session_token": token, "user_id": user_id,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()})
    resp.set_cookie("session_token", token, httponly=True, secure=True, samesite="none",
                    max_age=SESSION_DAYS * 86400, path="/")
    return token


def _clean(u):
    u = dict(u); u.pop("_id", None); u.pop("password_hash", None); return u


async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        h = request.headers.get("Authorization", "")
        if h.startswith("Bearer "): token = h[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    sess = await db.user_sessions.find_one({"session_token": token})
    if not sess:
        raise HTTPException(401, "Invalid session")
    exp = sess["expires_at"]
    exp = datetime.fromisoformat(exp) if isinstance(exp, str) else exp
    if exp.tzinfo is None: exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(401, "Session expired")
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return _clean(user)


async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user


router = APIRouter(prefix="/api")


# ---------- models ----------
class RegisterReq(BaseModel):
    email: EmailStr; password: str = Field(min_length=6); name: str = Field(min_length=1)
class LoginReq(BaseModel):
    email: EmailStr; password: str
class BookingReq(BaseModel):
    slot_start: str
class MessageReq(BaseModel):
    body: str = Field(min_length=1)
class AdminMessageReq(BaseModel):
    user_id: str; body: str = Field(min_length=1)
class DeliverableReq(BaseModel):
    session_id: str; key: str; status: Literal["pending", "in_progress", "complete"]
class ClientNotesReq(BaseModel):
    notes: str | None = None; next_quarterly_review: str | None = None
class LeadStatusReq(BaseModel):
    status: Literal["new", "contacted", "converted"]
class GrowthUpdateReq(BaseModel):
    user_id: str; body: str = Field(min_length=1)
class ResourceReq(BaseModel):
    user_id: str | None = None; title: str = Field(min_length=1); url: str = Field(min_length=1); description: str = ""


# ---------- auth ----------
@router.post("/auth/register")
async def register(body: RegisterReq, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "An account with this email already exists")
    role = "admin" if email == ADMIN_EMAIL else "client"
    uid = f"user_{uuid.uuid4().hex[:12]}"
    await db.users.insert_one({"user_id": uid, "email": email, "name": body.name,
                               "password_hash": hash_pw(body.password), "role": role,
                               "auth_provider": "password", "notes": "", "next_quarterly_review": None,
                               "created_at": datetime.now(timezone.utc).isoformat()})
    await _make_session(response, uid)
    u = await db.users.find_one({"user_id": uid}, {"_id": 0})
    return _clean(u)


LOGIN_MAX_FAILS = 5
LOGIN_LOCK_MINUTES = 15


@router.post("/auth/login")
async def login(body: LoginReq, response: Response):
    email = body.email.lower()
    now = datetime.now(timezone.utc)
    rec = await db.login_attempts.find_one({"email": email})
    if rec and rec.get("lock_until"):
        lock_until = datetime.fromisoformat(rec["lock_until"])
        if lock_until.tzinfo is None:
            lock_until = lock_until.replace(tzinfo=timezone.utc)
        if lock_until > now:
            raise HTTPException(429, "Too many failed attempts. Please try again later.")
    user = await db.users.find_one({"email": email})
    ok = bool(user and user.get("password_hash") and verify_pw(body.password, user["password_hash"]))
    if not ok:
        fails = (rec.get("fails", 0) if rec else 0) + 1
        upd = {"email": email, "fails": fails, "updated_at": now.isoformat()}
        if fails >= LOGIN_MAX_FAILS:
            upd["lock_until"] = (now + timedelta(minutes=LOGIN_LOCK_MINUTES)).isoformat()
        await db.login_attempts.update_one({"email": email}, {"$set": upd}, upsert=True)
        raise HTTPException(401, "Invalid email or password")
    await db.login_attempts.delete_one({"email": email})
    await _make_session(response, user["user_id"])
    return _clean(user)


@router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


@router.get("/auth/providers")
async def auth_providers():
    return {"hubspot": bool(os.environ.get("HUBSPOT_CLIENT_ID") and os.environ.get("HUBSPOT_CLIENT_SECRET")),
            "google": False, "microsoft": False, "apple": False}


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------- client ----------
@router.get("/client/orders")
async def client_orders(user=Depends(get_current_user)):
    txns = await db.payment_transactions.find(
        {"customer_email": user["email"], "payment_status": "paid"}, {"_id": 0}).to_list(100)
    out = []
    for t in txns:
        out.append({"session_id": t["session_id"], "tier": t.get("lookup_key"),
                    "tier_name": t.get("tier_name") or TIER_META.get(t.get("lookup_key"), {}).get("name", "Package"),
                    "amount": t.get("amount", 0), "currency": t.get("currency", "usd"),
                    "purchase_date": t.get("updated_at") or t.get("created_at"),
                    "recurring": TIER_META.get(t.get("lookup_key"), {}).get("recurring", False),
                    "deliverables": t.get("deliverables") or deliverables_for(t.get("lookup_key"))})
    return out


@router.get("/client/updates")
async def client_updates(user=Depends(get_current_user)):
    ups = await db.growth_updates.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"updates": ups, "next_quarterly_review": user.get("next_quarterly_review")}


def _slots_for_date(date_str):
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        raise HTTPException(400, "Invalid date format (use YYYY-MM-DD)")
    if d.weekday() > 4:  # Mon-Fri only
        return []
    slots = []
    cur = d.replace(hour=9, minute=0, tzinfo=AZ_TZ)
    end = d.replace(hour=16, minute=0, tzinfo=AZ_TZ)
    while cur < end:
        slots.append(cur)
        cur += timedelta(minutes=30)
    return slots


@router.get("/bookings/availability")
async def availability(date: str):
    slots = _slots_for_date(date)
    booked = await db.bookings.find({"status": {"$ne": "cancelled"}}, {"_id": 0, "slot_start": 1}).to_list(1000)
    booked_dt = []
    for b in booked:
        try:
            booked_dt.append(datetime.fromisoformat(b["slot_start"]))
        except Exception:
            pass
    now = datetime.now(timezone.utc)
    out = []
    for s in slots:
        if s <= now:
            continue
        # 30-min slot + 30-min buffer => must be >=60 min from any booking
        if any(abs((s - b).total_seconds()) < 3600 for b in booked_dt):
            continue
        out.append({"start": s.isoformat(), "label": s.strftime("%I:%M %p")})
    return out


@router.get("/client/bookings")
async def client_bookings(user=Depends(get_current_user)):
    return await db.bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("slot_start", 1).to_list(100)


@router.post("/bookings")
async def create_booking(body: BookingReq, user=Depends(get_current_user)):
    try:
        s = datetime.fromisoformat(body.slot_start)
    except (ValueError, TypeError):
        raise HTTPException(400, "Invalid slot format")
    if s.tzinfo is None:
        raise HTTPException(400, "Slot must include a timezone offset")
    now = datetime.now(timezone.utc)
    if s <= now:
        raise HTTPException(400, "Cannot book a past time")
    # Must be one of the published Mon-Fri 9am-4pm Arizona 30-min slots
    date_str = s.astimezone(AZ_TZ).strftime("%Y-%m-%d")
    valid_slots = _slots_for_date(date_str)
    if not any(abs((s - v).total_seconds()) < 1 for v in valid_slots):
        raise HTTPException(400, "That time is not an available slot")
    booked = await db.bookings.find({"status": {"$ne": "cancelled"}}, {"_id": 0, "slot_start": 1}).to_list(1000)
    for b in booked:
        try:
            bs = datetime.fromisoformat(b["slot_start"])
        except Exception:
            continue
        if abs((s - bs).total_seconds()) < 3600:
            raise HTTPException(409, "That time is no longer available")
    bid = f"bk_{uuid.uuid4().hex[:10]}"
    doc = {"booking_id": bid, "user_id": user["user_id"], "user_email": user["email"],
           "user_name": user["name"], "slot_start": s.isoformat(),
           "slot_end": (s + timedelta(minutes=30)).isoformat(), "status": "confirmed",
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.bookings.insert_one(doc)
    local = s.astimezone(AZ_TZ).strftime("%A, %B %d at %I:%M %p")
    await send_email(NOTIFY_EMAIL, f"New training booking — {user['name']}",
                     f"<p><b>{user['name']}</b> ({user['email']}) booked a training session for <b>{local} (AZ)</b>.</p>")
    doc.pop("_id", None)
    return doc


@router.get("/client/messages")
async def client_messages(user=Depends(get_current_user)):
    if user.get("role") == "admin":
        raise HTTPException(403, "Admins use the admin inbox")
    return await db.messages.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", 1).to_list(500)


@router.post("/client/messages")
async def client_send_message(body: MessageReq, user=Depends(get_current_user)):
    if user.get("role") == "admin":
        raise HTTPException(403, "Admins must reply from the admin inbox")
    doc = {"message_id": f"msg_{uuid.uuid4().hex[:10]}", "user_id": user["user_id"],
           "user_name": user["name"], "sender": "client", "body": body.body,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.messages.insert_one(doc)
    await send_email(NOTIFY_EMAIL, f"New message from {user['name']}",
                     f"<p><b>{user['name']}</b> ({user['email']}) sent a message:</p><p>{body.body}</p>")
    doc.pop("_id", None)
    return doc


@router.get("/client/timeline")
async def client_timeline(user=Depends(get_current_user)):
    events = []
    txns = await db.payment_transactions.find(
        {"customer_email": user["email"], "payment_status": "paid"}, {"_id": 0}).to_list(100)
    for t in txns:
        name = t.get("tier_name") or TIER_META.get(t.get("lookup_key"), {}).get("name", "Package")
        events.append({"type": "purchase", "label": f"{name} package purchased — setup started",
                       "at": str(t.get("created_at") or t.get("updated_at") or "")})
    for b in await db.bookings.find({"user_id": user["user_id"], "status": {"$ne": "cancelled"}}, {"_id": 0}).to_list(100):
        try:
            local = datetime.fromisoformat(b["slot_start"]).astimezone(AZ_TZ).strftime("%b %d at %I:%M %p")
            events.append({"type": "booking", "label": f"Training session booked for {local} (AZ)",
                           "at": str(b.get("created_at") or "")})
        except Exception:
            pass
    for u in await db.growth_updates.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100):
        events.append({"type": "update", "label": u["body"], "at": str(u.get("created_at") or "")})
    for a in await db.activity_log.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200):
        events.append({"type": a.get("type", "event"), "label": a["label"], "at": str(a.get("created_at") or "")})
    for r in await db.resources.find({"$or": [{"user_id": user["user_id"]}, {"user_id": None}]}, {"_id": 0}).to_list(100):
        events.append({"type": "resource", "label": f"New resource shared: {r['title']}", "at": str(r.get("created_at") or "")})
    events.sort(key=lambda e: e["at"], reverse=True)
    return events[:50]


@router.get("/client/resources")
async def client_resources(user=Depends(get_current_user)):
    return await db.resources.find({"$or": [{"user_id": user["user_id"]}, {"user_id": None}]},
                                   {"_id": 0}).sort("created_at", -1).to_list(100)


def _sub_period_end(s):
    if s.get("current_period_end"):
        return s["current_period_end"]
    items = (s.get("items") or {}).get("data") or []
    return items[0].get("current_period_end") if items else None


@router.get("/client/billing")
async def client_billing(user=Depends(get_current_user)):
    import asyncio
    out = {"subscriptions": [], "invoices": []}
    txns = await db.payment_transactions.find(
        {"customer_email": user["email"], "payment_status": "paid"}, {"_id": 0}).to_list(100)
    out["payments"] = [{"session_id": t["session_id"],
                        "tier_name": t.get("tier_name") or TIER_META.get(t.get("lookup_key"), {}).get("name", "Package"),
                        "amount": t.get("amount", 0), "currency": t.get("currency", "usd"),
                        "date": t.get("updated_at") or t.get("created_at"),
                        "recurring": TIER_META.get(t.get("lookup_key"), {}).get("recurring", False)} for t in txns]
    if not stripe.api_key:
        return out

    def _fetch():
        subs, invs = [], []
        for cust in stripe.Customer.list(email=user["email"], limit=5).data:
            for s in stripe.Subscription.list(customer=cust.id, status="all", limit=20).data:
                items = (s.get("items") or {}).get("data") or []
                price = items[0].get("price") if items else {}
                subs.append({"id": s["id"], "status": s["status"],
                             "plan_name": (price.get("nickname") or
                                           TIER_META.get(price.get("lookup_key"), {}).get("name") or "Subscription"),
                             "amount": price.get("unit_amount", 0),
                             "currency": price.get("currency", "usd"),
                             "interval": ((price.get("recurring") or {}).get("interval") or "month"),
                             "current_period_end": _sub_period_end(s),
                             "cancel_at_period_end": s.get("cancel_at_period_end", False),
                             "started": s.get("created")})
            for inv in stripe.Invoice.list(customer=cust.id, limit=24).data:
                invs.append({"id": inv["id"], "number": inv.get("number"),
                             "status": inv.get("status"),
                             "amount_due": inv.get("amount_due", 0),
                             "amount_paid": inv.get("amount_paid", 0),
                             "currency": inv.get("currency", "usd"),
                             "date": inv.get("created"),
                             "hosted_invoice_url": inv.get("hosted_invoice_url"),
                             "invoice_pdf": inv.get("invoice_pdf"),
                             "description": (inv.get("lines", {}).get("data") or [{}])[0].get("description")})
        return subs, invs

    try:
        out["subscriptions"], out["invoices"] = await asyncio.to_thread(_fetch)
    except Exception:
        pass
    return out


# ---------- admin ----------
@router.get("/admin/clients")
async def admin_clients(admin=Depends(require_admin)):
    users = await db.users.find({"role": "client"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    out = []
    for u in users:
        orders = await db.payment_transactions.find(
            {"customer_email": u["email"], "payment_status": "paid"}, {"_id": 0}).to_list(50)
        out.append({**u, "orders": [{"session_id": o["session_id"],
                    "tier_name": o.get("tier_name") or TIER_META.get(o.get("lookup_key"), {}).get("name", "Package"),
                    "amount": o.get("amount", 0),
                    "deliverables": o.get("deliverables") or deliverables_for(o.get("lookup_key")),
                    "recurring": TIER_META.get(o.get("lookup_key"), {}).get("recurring", False)} for o in orders]})
    return out


@router.patch("/admin/clients/{user_id}")
async def admin_update_client(user_id: str, body: ClientNotesReq, admin=Depends(require_admin)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if upd:
        await db.users.update_one({"user_id": user_id}, {"$set": upd})
    return {"ok": True}


@router.patch("/admin/deliverable")
async def admin_update_deliverable(body: DeliverableReq, admin=Depends(require_admin)):
    txn = await db.payment_transactions.find_one({"session_id": body.session_id})
    if not txn:
        raise HTTPException(404, "Order not found")
    dels = txn.get("deliverables") or deliverables_for(txn.get("lookup_key"))
    for d in dels:
        if d["key"] == body.key:
            d["status"] = body.status
    await db.payment_transactions.update_one({"session_id": body.session_id}, {"$set": {"deliverables": dels}})
    if body.status in ("in_progress", "complete"):
        u = await db.users.find_one({"email": (txn.get("customer_email") or "").lower()})
        if u:
            label = next((d["label"] for d in dels if d["key"] == body.key), body.key)
            verb = "completed" if body.status == "complete" else "started"
            await db.activity_log.insert_one({"event_id": f"ev_{uuid.uuid4().hex[:10]}", "user_id": u["user_id"],
                                              "type": "deliverable", "label": f"{label} — {verb}",
                                              "created_at": datetime.now(timezone.utc).isoformat()})
    return {"deliverables": dels}


@router.get("/admin/revenue")
async def admin_revenue(admin=Depends(require_admin)):
    txns = await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}).to_list(1000)
    total = sum(t.get("amount", 0) for t in txns)
    by_tier = {}
    for t in txns:
        name = TIER_META.get(t.get("lookup_key"), {}).get("name", t.get("lookup_key", "Other"))
        by_tier[name] = by_tier.get(name, 0) + t.get("amount", 0)
    recent = sorted(txns, key=lambda x: x.get("updated_at") or "", reverse=True)[:10]
    recent_out = [{"tier_name": TIER_META.get(r.get("lookup_key"), {}).get("name", "Package"),
                   "amount": r.get("amount", 0), "email": r.get("customer_email"),
                   "date": r.get("updated_at")} for r in recent]
    by_month = {}
    for t in txns:
        key = str(t.get("updated_at") or t.get("created_at") or "")[:7]
        if key:
            by_month[key] = by_month.get(key, 0) + t.get("amount", 0)
    return {"total": total, "count": len(txns),
            "by_tier": [{"name": k, "amount": v} for k, v in by_tier.items()],
            "by_month": [{"month": k, "amount": by_month[k]} for k in sorted(by_month)],
            "recent": recent_out}


@router.get("/admin/leads")
async def admin_leads(admin=Depends(require_admin)):
    return await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@router.patch("/admin/leads/{lead_id}")
async def admin_update_lead(lead_id: str, body: LeadStatusReq, admin=Depends(require_admin)):
    await db.leads.update_one({"id": lead_id}, {"$set": {"status": body.status}})
    return {"ok": True}


@router.get("/admin/bookings")
async def admin_bookings(admin=Depends(require_admin)):
    return await db.bookings.find({}, {"_id": 0}).sort("slot_start", 1).to_list(1000)


@router.get("/admin/messages")
async def admin_get_messages(user_id: str, admin=Depends(require_admin)):
    return await db.messages.find({"user_id": user_id}, {"_id": 0}).sort("created_at", 1).to_list(500)


@router.post("/admin/messages")
async def admin_send_message(body: AdminMessageReq, admin=Depends(require_admin)):
    doc = {"message_id": f"msg_{uuid.uuid4().hex[:10]}", "user_id": body.user_id,
           "sender": "admin", "body": body.body, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.messages.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.post("/admin/updates")
async def admin_add_update(body: GrowthUpdateReq, admin=Depends(require_admin)):
    doc = {"update_id": f"up_{uuid.uuid4().hex[:10]}", "user_id": body.user_id,
           "body": body.body, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.growth_updates.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/admin/inbox")
async def admin_inbox(admin=Depends(require_admin)):
    msgs = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    threads = {}
    for m in msgs:
        t = threads.setdefault(m["user_id"], {"user_id": m["user_id"], "last_message": m["body"],
                                              "last_sender": m["sender"], "last_at": m["created_at"], "count": 0})
        t["count"] += 1
    if not threads:
        return []
    users = await db.users.find({"user_id": {"$in": list(threads)}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    umap = {u["user_id"]: u for u in users}
    out = [{**t, "user_name": umap.get(uid, {}).get("name", "Unknown"),
            "user_email": umap.get(uid, {}).get("email", "")} for uid, t in threads.items()]
    return sorted(out, key=lambda x: x["last_at"], reverse=True)


@router.get("/admin/activity")
async def admin_activity(admin=Depends(require_admin)):
    events = []
    for l in await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(20):
        events.append({"type": "lead", "label": f"New lead: {l.get('full_name', '')} ({l.get('company_name', '')})",
                       "at": str(l.get("created_at") or "")})
    for t in await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}).sort("updated_at", -1).to_list(20):
        name = t.get("tier_name") or TIER_META.get(t.get("lookup_key"), {}).get("name", "Package")
        events.append({"type": "payment", "label": f"Payment received: {name} — ${t.get('amount', 0) / 100:,.0f} ({t.get('customer_email', '')})",
                       "at": str(t.get("updated_at") or t.get("created_at") or "")})
    for b in await db.bookings.find({"status": {"$ne": "cancelled"}}, {"_id": 0}).sort("created_at", -1).to_list(20):
        try:
            local = datetime.fromisoformat(b["slot_start"]).astimezone(AZ_TZ).strftime("%b %d at %I:%M %p")
        except Exception:
            local = b.get("slot_start", "")
        events.append({"type": "booking", "label": f"{b.get('user_name', '')} booked training for {local} (AZ)",
                       "at": str(b.get("created_at") or "")})
    for m in await db.messages.find({"sender": "client"}, {"_id": 0}).sort("created_at", -1).to_list(20):
        events.append({"type": "message", "label": f"Message from {m.get('user_name', 'client')}: {m.get('body', '')[:90]}",
                       "at": str(m.get("created_at") or "")})
    events.sort(key=lambda e: e["at"], reverse=True)
    return events[:40]


@router.post("/admin/resources")
async def admin_add_resource(body: ResourceReq, admin=Depends(require_admin)):
    doc = {"resource_id": f"res_{uuid.uuid4().hex[:10]}", "user_id": body.user_id, "title": body.title,
           "url": body.url, "description": body.description,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.resources.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/admin/resources")
async def admin_list_resources(user_id: str | None = None, admin=Depends(require_admin)):
    q = {"user_id": user_id} if user_id else {}
    return await db.resources.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@router.delete("/admin/resources/{resource_id}")
async def admin_delete_resource(resource_id: str, admin=Depends(require_admin)):
    await db.resources.delete_one({"resource_id": resource_id})
    return {"ok": True}


async def seed_and_index():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    if ADMIN_EMAIL:
        existing = await db.users.find_one({"email": ADMIN_EMAIL})
        if not existing:
            await db.users.insert_one({"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": ADMIN_EMAIL,
                                       "name": "Jason", "password_hash": hash_pw(ADMIN_PASSWORD), "role": "admin",
                                       "auth_provider": "password", "notes": "", "next_quarterly_review": None,
                                       "created_at": datetime.now(timezone.utc).isoformat()})
        else:
            upd = {"role": "admin"}
            if existing.get("auth_provider") == "password" and not verify_pw(ADMIN_PASSWORD, existing.get("password_hash", "")):
                upd["password_hash"] = hash_pw(ADMIN_PASSWORD)
            await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": upd})
