from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe key
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Fixed pricing packages - never trust frontend with amounts
PACKAGES = {
    "per_slide": {
        "name": "Per Slide",
        "price": 15.00,  # per slide
        "currency": "usd",
        "type": "per_unit",  # quantity = slides
    },
    "monthly_retainer": {
        "name": "Monthly Retainer",
        "price": 999.00,
        "currency": "usd",
        "type": "fixed",
    },
}

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
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
    """Onboarding form details collected from client."""
    # Plan
    package_id: str  # "per_slide" or "monthly_retainer"
    slide_count: Optional[int] = Field(None, ge=1, le=500)  # only for per_slide

    # Contact
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=120)

    # Project
    project_type: str = Field(..., max_length=80)  # e.g. Pitch Deck, Sales Deck, etc.
    timeline: str = Field(..., max_length=80)  # e.g. ASAP, Within 1 week, Flexible
    description: str = Field(..., min_length=10, max_length=2000)

    # Frontend origin for success/cancel URLs
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
    payment_status: str = "pending"   # pending | paid | failed | expired
    status: str = "initiated"          # initiated | complete | expired
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, str] = Field(default_factory=dict)


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
@api_router.post("/onboarding/create-checkout")
async def create_onboarding_checkout(payload: OnboardingRequest, http_request: Request):
    """
    Creates a Stripe checkout session from onboarding form details.
    Pricing is computed server-side from fixed packages.
    """
    if payload.package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package selection")

    pkg = PACKAGES[payload.package_id]

    # Determine quantity & amount server-side
    if pkg["type"] == "per_unit":
        if not payload.slide_count or payload.slide_count < 1:
            raise HTTPException(status_code=400, detail="Slide count required for per-slide package")
        quantity = payload.slide_count
        unit_amount = pkg["price"]
        total_amount = round(unit_amount * quantity, 2)
    else:
        quantity = 1
        total_amount = pkg["price"]

    # Build success/cancel URLs from frontend origin
    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/?payment=cancelled"

    # Webhook URL
    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    metadata = {
        "package_id": payload.package_id,
        "full_name": payload.full_name,
        "email": payload.email,
        "company": payload.company or "",
        "project_type": payload.project_type,
        "timeline": payload.timeline,
        "slide_count": str(payload.slide_count or 0),
        "source": "skifi_onboarding",
    }

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

    # Persist pending transaction BEFORE returning
    tx = PaymentTransaction(
        session_id=session.session_id,
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
        metadata=metadata,
    )
    doc = tx.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.payment_transactions.insert_one(doc)

    return {
        "url": session.url,
        "session_id": session.session_id,
        "amount": total_amount,
        "currency": pkg["currency"],
    }


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Polls Stripe for session status and updates DB once."""
    # Find existing transaction
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # If already finalized, return without recomputing
    if tx.get("payment_status") in ("paid", "failed", "expired"):
        return {
            "session_id": session_id,
            "payment_status": tx["payment_status"],
            "status": tx.get("status", "complete"),
            "amount": tx["amount"],
            "currency": tx["currency"],
        }

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    try:
        result: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logger.exception("Failed to fetch Stripe status")
        raise HTTPException(status_code=500, detail=str(e))

    # Update DB only once
    new_payment_status = result.payment_status
    new_status = result.status
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "payment_status": new_payment_status,
                "status": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    return {
        "session_id": session_id,
        "payment_status": new_payment_status,
        "status": new_status,
        "amount": tx["amount"],
        "currency": tx["currency"],
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Stripe webhook receiver."""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
    except Exception as e:
        logger.exception("Webhook handling failed")
        raise HTTPException(status_code=400, detail=str(e))

    # Update DB based on event
    if event.session_id:
        tx = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
        if tx and tx.get("payment_status") not in ("paid", "failed", "expired"):
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {
                    "$set": {
                        "payment_status": event.payment_status,
                        "status": "complete" if event.payment_status == "paid" else tx.get("status"),
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                },
            )

    return {"received": True}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
