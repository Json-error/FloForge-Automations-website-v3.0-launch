"""Transactional email via the Resend API (direct, user-owned key)."""
import os
import re
import ipaddress
import logging
import httpx
from html.parser import HTMLParser
from urllib.parse import urlparse
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "FloForge Automations")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host):
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject, html):
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r}")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r}")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Unsafe URL in email: {url!r}")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            shown = m.group(1).lower()
            if not (shown == real or real.endswith("." + shown) or shown.endswith("." + real)):
                raise ValueError(f"Anchor text {shown!r} does not match link host {real!r}")


async def send_email(*, to, subject, html, reply_to=None):
    """Sends via Resend. Raises on failure."""
    if not RESEND_API_KEY or not RESEND_FROM:
        raise RuntimeError("Resend not configured")
    _assert_safe_email(subject, html)
    payload = {"from": f"{EMAIL_FROM_NAME} <{RESEND_FROM}>", "to": [to],
               "subject": subject, "html": html}
    if reply_to:
        payload["reply_to"] = [reply_to]
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(RESEND_API_URL,
                            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                            json=payload)
    resp.raise_for_status()
    return resp.json().get("id")


async def notify_email(to, subject, html, reply_to=None):
    """Best-effort notification. Never raises."""
    if not to:
        return False, "No recipient"
    try:
        await send_email(to=to, subject=subject, html=html, reply_to=reply_to)
        return True, None
    except Exception as exc:
        logger.warning("Email notification failed: %s", exc)
        return False, str(exc)
