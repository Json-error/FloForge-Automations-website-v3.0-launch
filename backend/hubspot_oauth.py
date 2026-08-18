"""HubSpot OAuth: Connect HubSpot (CRM reads) and Sign in with HubSpot."""
import os
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlencode

import httpx
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse

from platform_api import get_current_user, _make_session, db, ADMIN_EMAIL

load_dotenv(Path(__file__).parent / ".env")

CLIENT_ID = os.environ.get("HUBSPOT_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("HUBSPOT_CLIENT_SECRET", "")
REDIRECT_URI = os.environ.get("HUBSPOT_REDIRECT_URI", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "").rstrip("/")
_FKEY = os.environ.get("TOKEN_ENCRYPTION_KEY", "")
fernet = Fernet(_FKEY.encode()) if _FKEY else None

AUTHORIZE_URL = "https://app.hubspot.com/oauth/authorize"
TOKEN_URLS = ["https://api.hubapi.com/oauth/2026-03/token", "https://api.hubapi.com/oauth/v1/token"]
HS_API = "https://api.hubapi.com"
CONNECT_SCOPES = "oauth crm.objects.contacts.read crm.objects.deals.read"
LOGIN_SCOPES = "oauth"

router = APIRouter(prefix="/api/hubspot")


def _configured():
    return bool(CLIENT_ID and CLIENT_SECRET and REDIRECT_URI and fernet)


def _enc(v): return fernet.encrypt(v.encode()).decode()
def _dec(v): return fernet.decrypt(v.encode()).decode()


async def _token_request(data):
    body = {**data, "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
    async with httpx.AsyncClient(timeout=20) as c:
        for url in TOKEN_URLS:
            r = await c.post(url, data=body,
                             headers={"Content-Type": "application/x-www-form-urlencoded"})
            if r.status_code == 404:
                continue
            if r.status_code >= 400:
                raise HTTPException(502, "HubSpot token exchange failed")
            return r.json()
    raise HTTPException(502, "HubSpot token endpoint unavailable")


async def _identity(access_token):
    async with httpx.AsyncClient(timeout=20) as c:
        r = await c.post(f"{HS_API}/oauth/2026-03/token/introspect",
                         data={"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET,
                               "token": access_token, "token_type_hint": "access_token"})
        if r.status_code < 400 and r.json().get("active"):
            d = r.json()
            return {"email": d.get("user"), "user_id": str(d.get("user_id", "")),
                    "hub_id": str(d.get("hub_id", "")), "scopes": d.get("scopes", [])}
        r = await c.get(f"{HS_API}/oauth/v1/access-tokens/{access_token}")
    if r.status_code >= 400:
        raise HTTPException(401, "Could not verify HubSpot identity")
    d = r.json()
    return {"email": d.get("user"), "user_id": str(d.get("user_id", "")),
            "hub_id": str(d.get("hub_id", "")), "scopes": d.get("scopes", [])}


@router.get("/config")
async def hubspot_config():
    return {"configured": _configured()}


@router.get("/oauth/start")
async def oauth_start(request: Request, mode: str = "connect"):
    if not _configured():
        raise HTTPException(503, "HubSpot integration is not configured yet")
    if mode not in ("connect", "login"):
        raise HTTPException(400, "Invalid mode")
    user_id = None
    if mode == "connect":
        token = request.cookies.get("session_token")
        if not token:
            raise HTTPException(401, "Not authenticated")
        sess = await db.user_sessions.find_one({"session_token": token})
        if not sess:
            raise HTTPException(401, "Invalid session")
        user_id = sess["user_id"]
    state = secrets.token_urlsafe(32)
    await db.oauth_states.insert_one({
        "state": state, "mode": mode, "app_user_id": user_id,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()})
    params = {"client_id": CLIENT_ID,
              "scope": LOGIN_SCOPES if mode == "login" else CONNECT_SCOPES,
              "redirect_uri": REDIRECT_URI, "state": state}
    return RedirectResponse(f"{AUTHORIZE_URL}?{urlencode(params)}")


@router.get("/oauth/callback")
async def oauth_callback(code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?hubspot_error={error}")
    if not code or not state:
        raise HTTPException(400, "Missing OAuth code or state")
    st = await db.oauth_states.find_one_and_delete({"state": state})
    if not st or datetime.fromisoformat(st["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(400, "Invalid or expired OAuth state")
    tokens = await _token_request({"grant_type": "authorization_code", "code": code,
                                   "redirect_uri": REDIRECT_URI})
    ident = await _identity(tokens["access_token"])

    if st["mode"] == "login":
        email = (ident.get("email") or "").lower()
        if not email:
            return RedirectResponse(f"{FRONTEND_URL}/login?hubspot_error=no_email")
        user = await db.users.find_one({"email": email})
        if not user:
            uid = f"user_{uuid.uuid4().hex[:12]}"
            role = "admin" if email == ADMIN_EMAIL else "client"
            await db.users.insert_one({
                "user_id": uid, "email": email, "name": email.split("@")[0].title(),
                "role": role, "auth_provider": "hubspot",
                "hubspot_user_id": ident["user_id"], "hubspot_hub_id": ident["hub_id"],
                "notes": "", "next_quarterly_review": None,
                "created_at": datetime.now(timezone.utc).isoformat()})
            user = await db.users.find_one({"user_id": uid})
        resp = RedirectResponse(f"{FRONTEND_URL}/admin" if user["role"] == "admin" else f"{FRONTEND_URL}/dashboard")
        await _make_session(resp, user["user_id"])
        return resp

    await db.hubspot_connections.update_one(
        {"app_user_id": st["app_user_id"]},
        {"$set": {"app_user_id": st["app_user_id"], "hub_id": ident["hub_id"],
                  "hubspot_user_id": ident["user_id"], "email": ident.get("email"),
                  "scopes": ident.get("scopes", []),
                  "access_token": _enc(tokens["access_token"]),
                  "refresh_token": _enc(tokens["refresh_token"]),
                  "expires_at": (datetime.now(timezone.utc) +
                                 timedelta(seconds=tokens.get("expires_in", 1800))).isoformat(),
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True)
    user = await db.users.find_one({"user_id": st["app_user_id"]})
    dest = "/admin" if user and user.get("role") == "admin" else "/dashboard"
    return RedirectResponse(f"{FRONTEND_URL}{dest}?hubspot=connected")


async def _valid_access_token(user_id):
    c = await db.hubspot_connections.find_one({"app_user_id": user_id})
    if not c:
        raise HTTPException(404, "Connect your HubSpot account first")
    exp = datetime.fromisoformat(c["expires_at"])
    if exp > datetime.now(timezone.utc) + timedelta(minutes=2):
        return _dec(c["access_token"])
    t = await _token_request({"grant_type": "refresh_token", "refresh_token": _dec(c["refresh_token"])})
    upd = {"access_token": _enc(t["access_token"]),
           "expires_at": (datetime.now(timezone.utc) +
                          timedelta(seconds=t.get("expires_in", 1800))).isoformat(),
           "updated_at": datetime.now(timezone.utc).isoformat()}
    if t.get("refresh_token"):
        upd["refresh_token"] = _enc(t["refresh_token"])
    await db.hubspot_connections.update_one({"app_user_id": user_id}, {"$set": upd})
    return t["access_token"]


async def _hs_get(path, user_id, params):
    token = await _valid_access_token(user_id)
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(f"{HS_API}{path}", params={k: v for k, v in params.items() if v},
                        headers={"Authorization": f"Bearer {token}"})
    if r.status_code == 401:
        raise HTTPException(502, "HubSpot authorization expired. Reconnect your account.")
    if r.status_code >= 400:
        raise HTTPException(502, "HubSpot API error")
    return r.json()


@router.get("/status")
async def hubspot_status(user=Depends(get_current_user)):
    c = await db.hubspot_connections.find_one({"app_user_id": user["user_id"]}, {"_id": 0, "access_token": 0, "refresh_token": 0})
    return {"configured": _configured(), "connected": bool(c),
            "hub_email": c.get("email") if c else None, "hub_id": c.get("hub_id") if c else None}


@router.post("/disconnect")
async def hubspot_disconnect(user=Depends(get_current_user)):
    await db.hubspot_connections.delete_one({"app_user_id": user["user_id"]})
    return {"ok": True}


@router.get("/contacts")
async def hubspot_contacts(after: str | None = None, user=Depends(get_current_user)):
    return await _hs_get("/crm/v3/objects/contacts", user["user_id"],
                         {"limit": 50, "after": after,
                          "properties": "firstname,lastname,email,phone,company,lifecyclestage"})


@router.get("/deals")
async def hubspot_deals(after: str | None = None, user=Depends(get_current_user)):
    return await _hs_get("/crm/v3/objects/deals", user["user_id"],
                         {"limit": 50, "after": after,
                          "properties": "dealname,amount,dealstage,closedate,pipeline"})
