from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta

import stripe as stripe_sdk

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

from email_service import send_payment_emails  # noqa: E402

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
STRIPE_MONTHLY_PRICE_ID = os.environ.get('STRIPE_MONTHLY_PRICE_ID', '').strip()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'skifi-admin-2026')

stripe_sdk.api_key = STRIPE_API_KEY

# Fixed pricing packages
PACKAGES = {
    "per_slide": {
        "name": "Per Slide",
        "price": 15.00,
        "currency": "usd",
        "type": "per_unit",
    },
    "monthly_retainer": {
        "name": "Monthly Retainer",
        "price": 999.00,
        "currency": "usd",
        "type": "subscription",
    },
}

# In-memory admin sessions (token -> expires_at iso)
ADMIN_SESSIONS: Dict[str, str] = {}

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ===================== Models =====================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class OnboardingRequest(BaseModel):
    package_id: str
    slide_count: Optional[int] = Field(None, ge=1, le=500)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=120)
    project_type: str = Field(..., max_length=80)
    timeline: str = Field(..., max_length=80)
    description: str = Field(..., min_length=10, max_length=2000)
    origin_url: str


class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    package_id: str
    amount: float
    currency: str
    quantity: int = 1
    email: str
    full_name: str
    company: Optional[str] = None
    project_type: str
    timeline: str
    description: str
    slide_count: Optional[int] = None
    payment_status: str = "pending"
    status: str = "initiated"
    mode: str = "payment"           # payment | subscription
    emails_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, str] = Field(default_factory=dict)


class AdminLogin(BaseModel):
    password: str


# ===================== Routes =====================
@api_router.get("/")
async def root():
    return {"message": "SkiFi Designs API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ===================== Onboarding + Payment =====================
def _build_metadata(payload: OnboardingRequest) -> Dict[str, str]:
    return {
        "package_id": payload.package_id,
        "full_name": payload.full_name,
        "email": payload.email,
        "company": payload.company or "",
        "project_type": payload.project_type,
        "timeline": payload.timeline,
        "slide_count": str(payload.slide_count or 0),
        "description": payload.description[:480],   # Stripe metadata size limit
        "source": "skifi_onboarding",
    }


def _create_subscription_session(payload: OnboardingRequest, success_url: str,
                                 cancel_url: str, metadata: Dict[str, str]) -> dict:
    """Creates a Stripe subscription checkout session via Stripe SDK directly."""
    if STRIPE_MONTHLY_PRICE_ID:
        line_items = [{"price": STRIPE_MONTHLY_PRICE_ID, "quantity": 1}]
    else:
        # Ad-hoc recurring price via price_data
        line_items = [{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": "SkiFi Designs · Monthly Retainer"},
                "unit_amount": 99900,   # cents
                "recurring": {"interval": "month"},
            },
            "quantity": 1,
        }]

    session = stripe_sdk.checkout.Session.create(
        mode="subscription",
        line_items=line_items,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
        customer_email=payload.email,
        subscription_data={"metadata": metadata},
    )
    return {"url": session.url, "session_id": session.id}


@api_router.post("/onboarding/create-checkout")
async def create_onboarding_checkout(payload: OnboardingRequest, http_request: Request):
    if payload.package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package selection")

    pkg = PACKAGES[payload.package_id]
    metadata = _build_metadata(payload)

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/?payment=cancelled"

    if pkg["type"] == "subscription" and STRIPE_MONTHLY_PRICE_ID:
        # True Stripe subscription — requires a real Stripe key + recurring Price ID
        try:
            session_info = _create_subscription_session(payload, success_url, cancel_url, metadata)
        except Exception as e:
            logger.exception("Stripe subscription creation failed")
            raise HTTPException(status_code=500, detail=f"Payment provider error: {str(e)}")

        quantity = 1
        total_amount = pkg["price"]
        session_url = session_info["url"]
        session_id = session_info["session_id"]
        mode = "subscription"
    elif pkg["type"] == "subscription":
        # Fallback: monthly retainer as one-time $999 charge (until real Stripe price_id is set)
        quantity = 1
        total_amount = pkg["price"]

        host_url = str(http_request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

        checkout_request = CheckoutSessionRequest(
            amount=total_amount,
            currency=pkg["currency"],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={**metadata, "billing_note": "first_month_charge_pending_subscription_setup"},
        )
        try:
            session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        except Exception as e:
            logger.exception("Stripe checkout creation failed")
            raise HTTPException(status_code=500, detail=f"Payment provider error: {str(e)}")

        session_url = session.url
        session_id = session.session_id
        mode = "payment"   # treated as one-time; manual renewal until price_id is wired
    else:
        # Per-slide one-time via emergentintegrations
        if not payload.slide_count or payload.slide_count < 1:
            raise HTTPException(status_code=400, detail="Slide count required for per-slide package")
        quantity = payload.slide_count
        total_amount = round(pkg["price"] * quantity, 2)

        host_url = str(http_request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

        checkout_request = CheckoutSessionRequest(
            amount=total_amount,
            currency=pkg["currency"],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata,
        )
        try:
            session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        except Exception as e:
            logger.exception("Stripe checkout creation failed")
            raise HTTPException(status_code=500, detail=f"Payment provider error: {str(e)}")

        session_url = session.url
        session_id = session.session_id
        mode = "payment"

    # Persist
    tx = PaymentTransaction(
        session_id=session_id,
        package_id=payload.package_id,
        amount=total_amount,
        currency=pkg["currency"],
        quantity=quantity,
        email=payload.email,
        full_name=payload.full_name,
        company=payload.company,
        project_type=payload.project_type,
        timeline=payload.timeline,
        description=payload.description,
        slide_count=payload.slide_count,
        payment_status="pending",
        status="initiated",
        mode=mode,
        metadata=metadata,
    )
    doc = tx.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.payment_transactions.insert_one(doc)

    return {
        "url": session_url,
        "session_id": session_id,
        "amount": total_amount,
        "currency": pkg["currency"],
        "mode": mode,
    }


async def _maybe_send_emails(tx: dict):
    """Send emails once per transaction (idempotent)."""
    if tx.get("emails_sent"):
        return
    try:
        result = await send_payment_emails(
            full_name=tx["full_name"],
            email=tx["email"],
            company=tx.get("company"),
            package_id=tx["package_id"],
            amount=float(tx["amount"]),
            currency=tx["currency"],
            project_type=tx["project_type"],
            timeline=tx["timeline"],
            slide_count=tx.get("slide_count"),
            description=tx["description"],
        )
        await db.payment_transactions.update_one(
            {"session_id": tx["session_id"]},
            {"$set": {"emails_sent": True, "email_result": result,
                      "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        logger.info(f"Emails sent for {tx['session_id']}: {result}")
    except Exception as e:
        logger.exception(f"Email send failed for {tx['session_id']}: {e}")


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.get("payment_status") in ("paid", "failed", "expired"):
        # Ensure emails sent if missed
        if tx.get("payment_status") == "paid":
            await _maybe_send_emails(tx)
        return {
            "session_id": session_id,
            "payment_status": tx["payment_status"],
            "status": tx.get("status", "complete"),
            "amount": tx["amount"],
            "currency": tx["currency"],
        }

    # Poll Stripe — different path for subscription vs payment
    new_payment_status = "pending"
    new_status = "open"
    try:
        if tx.get("mode") == "subscription":
            session = stripe_sdk.checkout.Session.retrieve(session_id)
            new_payment_status = session.payment_status or "pending"
            new_status = session.status or "open"
        else:
            stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
            result: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
            new_payment_status = result.payment_status
            new_status = result.status
    except Exception as e:
        logger.exception("Failed to fetch Stripe status")
        raise HTTPException(status_code=500, detail=str(e))

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"payment_status": new_payment_status, "status": new_status,
                  "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    if new_payment_status == "paid":
        updated_tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if updated_tx:
            await _maybe_send_emails(updated_tx)

    return {
        "session_id": session_id,
        "payment_status": new_payment_status,
        "status": new_status,
        "amount": tx["amount"],
        "currency": tx["currency"],
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
    except Exception as e:
        logger.warning(f"Webhook signature/parse failed: {e}")
        return {"received": True}

    if event.session_id:
        tx = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
        if tx and tx.get("payment_status") not in ("paid", "failed", "expired"):
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {"payment_status": event.payment_status,
                          "status": "complete" if event.payment_status == "paid" else tx.get("status"),
                          "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            if event.payment_status == "paid":
                updated_tx = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
                if updated_tx:
                    await _maybe_send_emails(updated_tx)

    return {"received": True}


# ===================== Admin =====================
async def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid auth header")
    token = authorization.split(" ", 1)[1]
    expires = ADMIN_SESSIONS.get(token)
    if not expires:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    if datetime.fromisoformat(expires) < datetime.now(timezone.utc):
        ADMIN_SESSIONS.pop(token, None)
        raise HTTPException(status_code=401, detail="Session expired")
    return token


@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if not secrets.compare_digest(payload.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid password")
    token = secrets.token_urlsafe(32)
    expires_iso = (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat()
    ADMIN_SESSIONS[token] = expires_iso
    return {"token": token, "expires_at": expires_iso}


@api_router.get("/admin/submissions")
async def admin_list_submissions(
    _: str = Depends(require_admin),
    payment_status: Optional[str] = None,
    limit: int = 200,
):
    query = {}
    if payment_status:
        query["payment_status"] = payment_status
    cursor = db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)

    # Aggregate stats
    total = await db.payment_transactions.count_documents({})
    paid = await db.payment_transactions.count_documents({"payment_status": "paid"})
    pending = await db.payment_transactions.count_documents({"payment_status": "pending"})

    paid_cursor = db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0, "amount": 1})
    paid_docs = await paid_cursor.to_list(length=1000)
    revenue = sum(float(d.get("amount", 0)) for d in paid_docs)

    return {
        "items": items,
        "stats": {
            "total": total,
            "paid": paid,
            "pending": pending,
            "revenue_usd": round(revenue, 2),
        },
    }


@api_router.get("/admin/me")
async def admin_me(_: str = Depends(require_admin)):
    return {"authenticated": True}


# ===================== App wiring =====================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
