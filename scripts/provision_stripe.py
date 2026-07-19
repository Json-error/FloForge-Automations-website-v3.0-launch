import os, json, urllib.request

base = os.environ["INTEGRATION_PROXY_URL"]
job_id = "c86b7a6c-7a61-44ec-ad55-94b34a6eb3a7"
key = "sk-emergent-125BcB6E57e4a08A54"
req = urllib.request.Request(
    base + "/stripe/sandboxes",
    data=json.dumps({"job_id": job_id}).encode(),
    headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as r:
    sandbox = json.load(r)

print(json.dumps({
    "sandbox_secret_key": sandbox.get("sandbox_secret_key"),
    "sandbox_publishable_key": sandbox.get("sandbox_publishable_key"),
    "sandbox_account_id": sandbox.get("sandbox_account_id"),
    "preview_webhook_secret": sandbox.get("preview_webhook_secret"),
    "onboarding_url": sandbox.get("onboarding_url"),
}, indent=2))
