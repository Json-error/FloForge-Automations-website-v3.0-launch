from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import stripe
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe configuration
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
# Digital services in an SMP-supported country (US) -> Stripe manages tax (SMP)
TAX_MODE = "full"

# HubSpot configuration
HUBSPOT_ACCESS_TOKEN = os.environ.get("HUBSPOT_ACCESS_TOKEN", "")
HUBSPOT_BASE_URL = "https://api.hubapi.com"

# Emergent-managed email (Resend)
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMERGENT_EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "FloForge Automations")
LEAD_NOTIFY_EMAIL = os.environ.get("LEAD_NOTIFY_EMAIL", "")


async def send_lead_notification_email(lead: "LeadCreate"):
    """Email the business owner about a new lead. Never raises."""
    if not EMERGENT_EMAIL_KEY or not LEAD_NOTIFY_EMAIL:
        return False, "Email not configured"
    html = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;padding:24px;font-family:Arial,sans-serif;">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #312E81;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#5B21B6;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold;">New Lead — FloForge Automations</td></tr>
          <tr><td style="padding:28px;color:#E2E8F0;">
            <p style="margin:0 0 18px;font-size:15px;color:#94A3B8;">You have a new contact form submission:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#F8FAFC;">
              <tr><td style="padding:8px 0;color:#94A3B8;width:150px;">Name</td><td style="padding:8px 0;font-weight:bold;">{lead.full_name}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Company</td><td style="padding:8px 0;font-weight:bold;">{lead.company_name}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Email</td><td style="padding:8px 0;font-weight:bold;">{lead.email}</td></tr>
              <tr><td style="padding:8px 0;color:#94A3B8;">Biggest Bottleneck</td><td style="padding:8px 0;font-weight:bold;">{lead.bottleneck}</td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#10B981;">Reply directly to this email to reach {lead.full_name}.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """
    payload = {
        "to": [LEAD_NOTIFY_EMAIL],
        "subject": f"New Lead: {lead.full_name} — {lead.company_name}",
        "html": html,
        "from_name": EMAIL_FROM_NAME,
        "contact_email": lead.email,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as ec:
            resp = await ec.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                 headers={"X-Email-Key": EMERGENT_EMAIL_KEY}, json=payload)
            resp.raise_for_status()
            return True, None
    except Exception as exc:
        logger.warning("Lead notification email failed: %s", exc)
        return False, str(exc)


async def sync_lead_to_hubspot(lead: "LeadCreate"):
    """Upsert a lead as a HubSpot contact. Never raises: failures are logged only."""
    if not HUBSPOT_ACCESS_TOKEN:
        return False, "HubSpot not configured"
    headers = {
        "Authorization": f"Bearer {HUBSPOT_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    parts = lead.full_name.strip().split(" ", 1)
    firstname = parts[0]
    lastname = parts[1] if len(parts) > 1 else ""
    payload = {
        "inputs": [{
            "idProperty": "email",
            "id": lead.email,
            "properties": {
                "email": lead.email,
                "firstname": firstname,
                "lastname": lastname,
                "company": lead.company_name,
            },
        }],
    }
    try:
        async with httpx.AsyncClient(base_url=HUBSPOT_BASE_URL, timeout=10) as hc:
            resp = await hc.post("/crm/v3/objects/contacts/batch/upsert",
                                 json=payload, headers=headers)
            if resp.status_code >= 400:
                logger.warning("HubSpot upsert failed: %s %s", resp.status_code, resp.text)
                return False, f"HubSpot error {resp.status_code}"
            return True, None
    except Exception as exc:
        logger.warning("HubSpot sync error: %s", exc)
        return False, str(exc)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    company_name: str
    email: EmailStr
    bottleneck: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    company_name: str = Field(..., min_length=1, max_length=160)
    email: EmailStr
    bottleneck: str = Field(..., min_length=1, max_length=60)


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/leads", response_model=Lead)
async def create_lead(input: LeadCreate):
    lead = Lead(**input.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    synced, hs_err = await sync_lead_to_hubspot(input)
    doc['hubspot_synced'] = synced
    doc['hubspot_error'] = hs_err
    emailed, em_err = await send_lead_notification_email(input)
    doc['email_sent'] = emailed
    doc['email_error'] = em_err
    await db.leads.insert_one(doc)
    return lead

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads


# ---------------- Stripe payments ----------------
class CheckoutRequest(BaseModel):
    lookup_key: str
    quantity: int = Field(1, ge=1, le=100)
    origin_url: str
    user_id: Optional[str] = None


@api_router.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest):
    prices = stripe.Price.list(lookup_keys=[req.lookup_key], active=True, limit=1).data
    if not prices:
        raise HTTPException(500, f"Price not found: {req.lookup_key}")
    price = prices[0]
    kwargs = dict(
        line_items=[{"price": price.id, "quantity": req.quantity}],
        mode="subscription" if price.recurring else "payment",
        success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{req.origin_url}/payment/cancel",
        metadata={"user_id": req.user_id or "", "lookup_key": req.lookup_key},
    )
    if TAX_MODE == "full":
        try:
            session = stripe.checkout.Session.create(**kwargs, managed_payments={"enabled": True})
        except stripe.error.InvalidRequestError as e:
            msg = (e.user_message or "").lower()
            if "managed payments" in msg or "ineligible" in msg:
                session = stripe.checkout.Session.create(
                    **kwargs, automatic_tax={"enabled": True}, billing_address_collection="required",
                )
            else:
                raise
    elif TAX_MODE == "calc_only":
        session = stripe.checkout.Session.create(
            **kwargs, automatic_tax={"enabled": True}, billing_address_collection="required",
        )
    else:
        session = stripe.checkout.Session.create(**kwargs)

    await db.payment_transactions.insert_one({
        "session_id": session.id, "user_id": req.user_id, "lookup_key": req.lookup_key,
        "amount": (price.unit_amount or 0) * req.quantity, "currency": price.currency,
        "status": "initiated", "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"checkout_url": session.url, "session_id": session.id}


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(404, "Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid",
                              "stripe_subscription_id": s.subscription,
                              "stripe_payment_intent_id": s.payment_intent,
                              "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                record = await db.payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {"session_id": record["session_id"], "status": record["status"],
            "payment_status": record["payment_status"]}


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    now = datetime.now(timezone.utc).isoformat()
    if t == "checkout.session.completed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"),
                      "stripe_subscription_id": obj.get("subscription"),
                      "stripe_payment_intent_id": obj.get("payment_intent"), "updated_at": now}},
        )
    elif t == "checkout.session.async_payment_succeeded":
        await db.payment_transactions.update_one({"session_id": obj["id"]},
            {"$set": {"payment_status": "paid", "updated_at": now}})
    elif t == "checkout.session.async_payment_failed":
        await db.payment_transactions.update_one({"session_id": obj["id"]},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": now}})
    elif t == "checkout.session.expired":
        await db.payment_transactions.update_one({"session_id": obj["id"]},
            {"$set": {"status": "expired", "payment_status": "expired", "updated_at": now}})
    elif t == "charge.refunded":
        await db.payment_transactions.update_one({"stripe_payment_intent_id": obj.get("payment_intent")},
            {"$set": {"status": "refunded", "payment_status": "refunded", "updated_at": now}})
    return {"status": "ok"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
