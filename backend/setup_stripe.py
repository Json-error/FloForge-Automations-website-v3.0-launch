"""Idempotent Stripe catalog setup for FloForge Automations service packages."""
import os
import stripe
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"

CATALOG = [
    {
        "emergent_product_id": "starter_setup",
        "name": "Starter Setup",
        "tax_code": "txcd_10103001",
        "prices": [
            {"lookup_key": "starter_setup_onetime", "amount": 29900, "currency": "usd"},
        ],
    },
    {
        "emergent_product_id": "business_automation",
        "name": "Business Automation",
        "tax_code": "txcd_10103001",
        "prices": [
            {"lookup_key": "business_automation_onetime", "amount": 69900, "currency": "usd"},
        ],
    },
    {
        "emergent_product_id": "growth_partnership",
        "name": "Growth Partnership",
        "tax_code": "txcd_10103001",
        "prices": [
            {"lookup_key": "growth_partnership_monthly", "amount": 14900, "currency": "usd", "interval": "month"},
        ],
    },
]


def get_or_create_product(entry):
    for p in stripe.Product.list(active=True).auto_paging_iter():
        if p.to_dict().get("metadata", {}).get("emergent_product_id") == entry["emergent_product_id"]:
            return p
    return stripe.Product.create(
        name=entry["name"],
        tax_code=entry.get("tax_code"),
        metadata={"managed_by": "emergent", "emergent_product_id": entry["emergent_product_id"]},
    )


def main():
    for entry in CATALOG:
        product = get_or_create_product(entry)
        print(f"Product: {entry['name']} -> {product.id}")
        for p in entry["prices"]:
            existing = stripe.Price.list(lookup_keys=[p["lookup_key"]], active=True, limit=1).data
            if existing and (existing[0].unit_amount != p["amount"] or existing[0].currency != p["currency"]):
                stripe.Price.modify(existing[0].id, active=False)
                existing = []
            if not existing:
                kwargs = dict(
                    product=product.id, unit_amount=p["amount"], currency=p["currency"],
                    lookup_key=p["lookup_key"], transfer_lookup_key=True,
                )
                if p.get("interval"):
                    kwargs["recurring"] = {"interval": p["interval"]}
                price = stripe.Price.create(**kwargs)
                print(f"  Created price {p['lookup_key']} -> {price.id}")
            else:
                print(f"  Price {p['lookup_key']} exists -> {existing[0].id}")


if __name__ == "__main__":
    main()
