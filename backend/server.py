from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header, Cookie, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from bson import ObjectId
import os
import io
import logging
import secrets
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl
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
fs_bucket = AsyncIOMotorGridFSBucket(db, bucket_name="onboarding_uploads")

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
    file_ids: List[str] = Field(default_factory=list, max_length=10)


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
    file_ids: List[str] = Field(default_factory=list)
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
        # True Stripe subscription - requires a real Stripe key + recurring Price ID
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
        file_ids=payload.file_ids or [],
        metadata=metadata,
    )
    doc = tx.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.payment_transactions.insert_one(doc)

    # Tag GridFS files with this session for traceability
    if payload.file_ids:
        for fid in payload.file_ids:
            try:
                await db["onboarding_uploads.files"].update_one(
                    {"_id": ObjectId(fid)},
                    {"$set": {"metadata.session_id": session_id, "metadata.email": payload.email}},
                )
            except Exception:
                pass

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
        # Look up attached files (if any) for admin notification
        files_info = []
        for fid in (tx.get("file_ids") or []):
            try:
                fdoc = await db["onboarding_uploads.files"].find_one(
                    {"_id": ObjectId(fid)}, {"filename": 1, "length": 1}
                )
                if fdoc:
                    files_info.append({
                        "filename": fdoc.get("filename"),
                        "size": fdoc.get("length", 0),
                    })
            except Exception:
                pass

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
            files=files_info,
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
    # Check both payment_transactions (projects) and template_purchases (templates)
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    template_tx = None
    if not tx:
        template_tx = await db.template_purchases.find_one({"session_id": session_id}, {"_id": 0})
        if not template_tx:
            raise HTTPException(status_code=404, detail="Transaction not found")

    active_tx = tx or template_tx
    is_template = tx is None

    if active_tx.get("payment_status") in ("paid", "failed", "expired"):
        if active_tx.get("payment_status") == "paid" and not is_template:
            await _maybe_send_emails(active_tx)
        return {
            "session_id": session_id,
            "payment_status": active_tx["payment_status"],
            "status": active_tx.get("status", "complete"),
            "amount": active_tx["amount"],
            "currency": active_tx["currency"],
            "kind": "template" if is_template else "project",
        }

    # Poll Stripe - use direct SDK for both paths (avoids emergentintegrations
    # Pydantic ValidationError on Stripe's StripeObject metadata field).
    new_payment_status = "pending"
    new_status = "open"
    try:
        session = stripe_sdk.checkout.Session.retrieve(session_id)
        new_payment_status = session.payment_status or "pending"
        new_status = session.status or "open"
    except Exception as e:
        logger.exception("Failed to fetch Stripe status")
        raise HTTPException(status_code=500, detail=str(e))

    # Update whichever collection this session belongs to
    if not is_template:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": new_payment_status, "status": new_status,
                      "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        if new_payment_status == "paid":
            updated_tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            if updated_tx:
                await _maybe_send_emails(updated_tx)
    else:
        await db.template_purchases.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": new_payment_status,
                      "status": "complete" if new_payment_status == "paid" else new_status,
                      "updated_at": datetime.now(timezone.utc).isoformat()}}
        )

    return {
        "session_id": session_id,
        "payment_status": new_payment_status,
        "status": new_status,
        "amount": active_tx["amount"],
        "currency": active_tx["currency"],
        "kind": "template" if is_template else "project",
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
        # First check payment_transactions
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
        else:
            # Then check template_purchases
            await db.template_purchases.update_one(
                {"session_id": event.session_id, "payment_status": {"$ne": "paid"}},
                {"$set": {"payment_status": event.payment_status,
                          "status": "complete" if event.payment_status == "paid" else "open",
                          "updated_at": datetime.now(timezone.utc).isoformat()}}
            )

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


# ===================== Auth (Google via Emergent) =====================
EMERGENT_AUTH_SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


class UserModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


async def _get_user_from_token(session_token: Optional[str]) -> Optional[dict]:
    if not session_token:
        return None
    sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at)
        except Exception:
            return None
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return user


async def require_user(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
) -> dict:
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    user = await _get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api_router.post("/auth/session")
async def auth_session(request: Request, response: Response):
    """Exchange Emergent session_id (sent in X-Session-ID header) for backend session."""
    sess_id = request.headers.get("X-Session-ID") or request.headers.get("x-session-id")
    if not sess_id:
        raise HTTPException(status_code=400, detail="Missing X-Session-ID header")

    # Call Emergent Auth to get user data
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            r = await http_client.get(
                EMERGENT_AUTH_SESSION_DATA_URL,
                headers={"X-Session-ID": sess_id},
            )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = r.json()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Emergent Auth verification failed")
        raise HTTPException(status_code=502, detail=f"Auth service error: {str(e)}")

    email = data.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="No email returned from auth provider")

    # Find existing user or create one
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        # Update name/picture if changed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": data.get("name") or existing.get("name"),
                "picture": data.get("picture") or existing.get("picture"),
                "last_login_at": datetime.now(timezone.utc).isoformat(),
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name"),
            "picture": data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login_at": datetime.now(timezone.utc).isoformat(),
        })

    # Use Emergent's session_token if provided, else generate our own
    session_token = data.get("session_token") or secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )

    return {
        "user_id": user_id,
        "email": email,
        "name": data.get("name"),
        "picture": data.get("picture"),
        "session_token": session_token,
    }


@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(require_user)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture"),
    }


@api_router.post("/auth/logout")
async def auth_logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"success": True}


# ===================== Templates =====================
class TemplateModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: str = Field(..., max_length=80)  # Pitch Deck, Sales Deck, etc.
    type: str = Field(..., pattern="^(free|paid)$")
    price: float = Field(0.0, ge=0)
    thumbnail_url: str
    file_url: Optional[str] = None             # external URL (legacy / preview)
    template_file_id: Optional[str] = None     # GridFS file id (preferred)
    preview_url: Optional[str] = None          # optional online preview link
    tags: List[str] = Field(default_factory=list)
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TemplateCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: str = Field(..., max_length=80)
    type: str = Field(..., pattern="^(free|paid)$")
    price: float = Field(0.0, ge=0)
    thumbnail_url: str
    file_url: Optional[str] = None
    template_file_id: Optional[str] = None
    preview_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_published: bool = True


def _public_template(doc: dict) -> dict:
    """Strip file_url from public response (download requires auth/payment)."""
    return {
        "id": doc["id"],
        "title": doc["title"],
        "description": doc.get("description"),
        "category": doc["category"],
        "type": doc["type"],
        "price": doc.get("price", 0),
        "thumbnail_url": doc["thumbnail_url"],
        "preview_url": doc.get("preview_url"),
        "tags": doc.get("tags", []),
        "created_at": doc.get("created_at"),
    }


@api_router.get("/templates")
async def list_templates(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
):
    query = {"is_published": True}
    if category and category != "all":
        query["category"] = category
    if type and type in ("free", "paid"):
        query["type"] = type
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    docs = await db.templates.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"items": [_public_template(d) for d in docs]}


@api_router.get("/templates/{template_id}")
async def get_template(template_id: str):
    doc = await db.templates.find_one({"id": template_id, "is_published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")
    return _public_template(doc)


@api_router.post("/templates/{template_id}/access")
async def access_template(
    template_id: str,
    request: Request,
    user: dict = Depends(require_user),
):
    """For FREE templates → return download URL immediately.
    For PAID templates → create a Stripe checkout session and return its URL.
    """
    doc = await db.templates.find_one({"id": template_id, "is_published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")

    if doc["type"] == "free":
        # Log download
        await db.template_downloads.insert_one({
            "id": str(uuid.uuid4()),
            "template_id": template_id,
            "user_id": user["user_id"],
            "email": user["email"],
            "downloaded_at": datetime.now(timezone.utc).isoformat(),
        })
        download_url = (
            f"/api/templates/{template_id}/file" if doc.get("template_file_id") else doc.get("file_url")
        )
        return {
            "type": "free",
            "download_url": download_url,
        }

    # Paid: check if user already purchased
    existing_purchase = await db.template_purchases.find_one(
        {"template_id": template_id, "user_id": user["user_id"], "payment_status": "paid"},
        {"_id": 0},
    )
    if existing_purchase:
        download_url = (
            f"/api/templates/{template_id}/file" if doc.get("template_file_id") else doc.get("file_url")
        )
        return {
            "type": "paid",
            "already_purchased": True,
            "download_url": download_url,
        }

    # Create Stripe checkout for paid template
    body = await request.json() if request.headers.get("content-length") not in ("0", None) else {}
    origin = (body.get("origin_url") or str(request.base_url)).rstrip("/")
    success_url = f"{origin}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&template=1"
    cancel_url = f"{origin}/resources?payment=cancelled"

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    metadata = {
        "kind": "template_purchase",
        "template_id": template_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "title": doc["title"][:200],
    }
    checkout_request = CheckoutSessionRequest(
        amount=float(doc["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    try:
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    except Exception as e:
        logger.exception("Template checkout creation failed")
        raise HTTPException(status_code=500, detail=f"Payment provider error: {str(e)}")

    await db.template_purchases.insert_one({
        "id": str(uuid.uuid4()),
        "template_id": template_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "session_id": session.session_id,
        "amount": float(doc["price"]),
        "currency": "usd",
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {
        "type": "paid",
        "checkout_url": session.url,
        "session_id": session.session_id,
    }


@api_router.get("/me/library")
async def my_library(user: dict = Depends(require_user)):
    """User's purchased + downloaded templates with full file URLs."""
    purchases = await db.template_purchases.find(
        {"user_id": user["user_id"], "payment_status": "paid"},
        {"_id": 0},
    ).to_list(500)
    template_ids = list({p["template_id"] for p in purchases})
    templates = await db.templates.find({"id": {"$in": template_ids}}, {"_id": 0}).to_list(500)
    by_id = {t["id"]: t for t in templates}
    items = []
    for p in purchases:
        t = by_id.get(p["template_id"])
        if not t:
            continue
        items.append({
            **_public_template(t),
            "download_url": t.get("file_url"),
            "purchased_at": p.get("created_at"),
        })
    return {"items": items}


# ===================== Onboarding File Uploads (GridFS) =====================
ALLOWED_UPLOAD_EXT = {
    ".pdf", ".pptx", ".ppt", ".key", ".doc", ".docx", ".odp",
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
    ".ai", ".psd", ".fig", ".sketch",
    ".zip", ".rar",
    ".txt", ".md", ".csv", ".xlsx",
}
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB per file


def _safe_filename(name: str) -> str:
    name = (name or "upload.bin").replace("\\", "/").split("/")[-1]
    # Strip null bytes & control chars
    return "".join(c for c in name if c.isprintable())[:160] or "upload.bin"


@api_router.post("/onboarding/upload")
async def upload_onboarding_file(file: UploadFile = File(...)):
    """Accepts a single file from the onboarding wizard and stores it in GridFS.
    Returns the file id and metadata so the frontend can attach it to the order."""
    filename = _safe_filename(file.filename)
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if ext not in ALLOWED_UPLOAD_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"File type {ext or 'unknown'} is not allowed.",
        )

    # Stream in chunks while enforcing size limit
    buffer = io.BytesIO()
    total = 0
    chunk_size = 1024 * 256  # 256KB
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB limit.")
        buffer.write(chunk)
    buffer.seek(0)

    if total == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    metadata = {
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "content_type": file.content_type or "application/octet-stream",
        "original_name": filename,
    }
    file_id = await fs_bucket.upload_from_stream(
        filename, buffer, metadata=metadata,
    )
    return {
        "file_id": str(file_id),
        "filename": filename,
        "size": total,
        "content_type": metadata["content_type"],
    }


@api_router.get("/admin/files/{file_id}")
async def admin_download_file(file_id: str, _: str = Depends(require_admin)):
    """Admin-only: stream a previously uploaded onboarding file."""
    try:
        oid = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file id")

    file_doc = await db["onboarding_uploads.files"].find_one({"_id": oid})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")

    stream = await fs_bucket.open_download_stream(oid)
    content_type = (file_doc.get("metadata") or {}).get("content_type", "application/octet-stream")
    filename = file_doc.get("filename", "download.bin")

    async def iterator():
        while True:
            chunk = await stream.readchunk()
            if not chunk:
                break
            yield chunk

    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(iterator(), media_type=content_type, headers=headers)


@api_router.get("/admin/orders/{session_id}/files")
async def admin_list_order_files(session_id: str, _: str = Depends(require_admin)):
    """Admin-only: list files attached to a specific order/session."""
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0, "file_ids": 1})
    if not tx:
        raise HTTPException(status_code=404, detail="Order not found")
    file_ids = tx.get("file_ids") or []
    if not file_ids:
        return {"items": []}

    object_ids = []
    for fid in file_ids:
        try:
            object_ids.append(ObjectId(fid))
        except Exception:
            continue
    docs = await db["onboarding_uploads.files"].find(
        {"_id": {"$in": object_ids}}, {"_id": 1, "filename": 1, "length": 1, "metadata": 1}
    ).to_list(20)
    return {
        "items": [
            {
                "file_id": str(d["_id"]),
                "filename": d.get("filename"),
                "size": d.get("length", 0),
                "content_type": (d.get("metadata") or {}).get("content_type"),
            }
            for d in docs
        ]
    }


# Helper: stream any GridFS file (used by multiple endpoints)
async def _stream_gridfs(file_id: str, force_download: bool = True) -> StreamingResponse:
    try:
        oid = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file id")
    file_doc = await db["onboarding_uploads.files"].find_one({"_id": oid})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    stream = await fs_bucket.open_download_stream(oid)
    content_type = (file_doc.get("metadata") or {}).get("content_type") or "application/octet-stream"
    filename = file_doc.get("filename", "download.bin")

    async def iterator():
        while True:
            chunk = await stream.readchunk()
            if not chunk:
                break
            yield chunk

    disposition = "attachment" if force_download else "inline"
    headers = {"Content-Disposition": f'{disposition}; filename="{filename}"'}
    return StreamingResponse(iterator(), media_type=content_type, headers=headers)


# Public file (images) - used for template thumbnails and blog covers
@api_router.get("/files/{file_id}")
async def public_get_file(file_id: str):
    """Public, inline-served file (designed for images: thumbnails, blog covers, etc.).
    The file id is a non-guessable ObjectId, so files are unlisted but not authenticated."""
    return await _stream_gridfs(file_id, force_download=False)


# Generic admin upload - returns file_id AND a stable public URL
@api_router.post("/admin/upload")
async def admin_upload(
    file: UploadFile = File(...),
    _: str = Depends(require_admin),
):
    filename = _safe_filename(file.filename)
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if ext not in ALLOWED_UPLOAD_EXT:
        raise HTTPException(status_code=400, detail=f"File type {ext or 'unknown'} not allowed.")
    buffer = io.BytesIO()
    total = 0
    while True:
        chunk = await file.read(1024 * 256)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB.")
        buffer.write(chunk)
    buffer.seek(0)
    if total == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    metadata = {
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "content_type": file.content_type or "application/octet-stream",
        "original_name": filename,
        "uploader": "admin",
    }
    file_id = await fs_bucket.upload_from_stream(filename, buffer, metadata=metadata)
    return {
        "file_id": str(file_id),
        "filename": filename,
        "size": total,
        "url": f"/api/files/{file_id}",
        "content_type": metadata["content_type"],
    }


# Gated template file download (free → any logged-in user; paid → must have purchased)
@api_router.get("/templates/{template_id}/file")
async def download_template_file(template_id: str, user: dict = Depends(require_user)):
    doc = await db.templates.find_one({"id": template_id, "is_published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Template not found")
    if not doc.get("template_file_id"):
        raise HTTPException(status_code=404, detail="No file uploaded for this template")
    if doc["type"] == "paid":
        purchase = await db.template_purchases.find_one(
            {"template_id": template_id, "user_id": user["user_id"], "payment_status": "paid"},
            {"_id": 0},
        )
        if not purchase:
            raise HTTPException(status_code=403, detail="Payment required to download this template")
    # Log
    await db.template_downloads.insert_one({
        "id": str(uuid.uuid4()),
        "template_id": template_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "downloaded_at": datetime.now(timezone.utc).isoformat(),
    })
    return await _stream_gridfs(doc["template_file_id"], force_download=True)


# ===================== Project Deliveries =====================
class DeliveryCreate(BaseModel):
    message: Optional[str] = Field(None, max_length=2000)
    file_ids: List[str] = Field(default_factory=list, min_length=1)


@api_router.post("/admin/orders/{session_id}/deliveries")
async def admin_create_delivery(
    session_id: str,
    payload: DeliveryCreate,
    _: str = Depends(require_admin),
):
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Order not found")

    delivery = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "message": (payload.message or "").strip(),
        "file_ids": payload.file_ids,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.deliveries.insert_one(delivery)

    # Tag files
    for fid in payload.file_ids:
        try:
            await db["onboarding_uploads.files"].update_one(
                {"_id": ObjectId(fid)},
                {"$set": {"metadata.kind": "delivery",
                          "metadata.session_id": session_id,
                          "metadata.email": tx.get("email")}},
            )
        except Exception:
            pass

    # Email the client
    try:
        from email_service import send_delivery_email
        files_info = []
        for fid in payload.file_ids:
            try:
                fdoc = await db["onboarding_uploads.files"].find_one(
                    {"_id": ObjectId(fid)}, {"filename": 1, "length": 1}
                )
                if fdoc:
                    files_info.append({
                        "filename": fdoc.get("filename"),
                        "size": fdoc.get("length", 0),
                    })
            except Exception:
                pass
        # Resolve dashboard URL from any field we trust
        dashboard_url = "https://skifidesigns.com/dashboard"
        await send_delivery_email(
            client_email=tx["email"],
            client_name=tx.get("full_name") or "there",
            project_type=tx.get("project_type", "Project"),
            message=delivery["message"],
            files=files_info,
            dashboard_url=dashboard_url,
        )
    except Exception as e:
        logger.warning(f"Delivery email failed (non-fatal): {e}")

    # Mark order as in_delivery
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"status": "delivered", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )

    return {"success": True, "delivery_id": delivery["id"]}


@api_router.get("/admin/orders/{session_id}/deliveries")
async def admin_list_deliveries(session_id: str, _: str = Depends(require_admin)):
    docs = await db.deliveries.find({"session_id": session_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"items": docs}


# ===== Revision request (client-side) =====
class RevisionRequest(BaseModel):
    message: Optional[str] = Field(None, max_length=2000)


@api_router.post("/me/orders/{session_id}/revision-request")
async def request_revision(
    session_id: str,
    payload: RevisionRequest,
    user: dict = Depends(require_user),
):
    """Client asks for a revision on a delivered order.
    Flips status -> 'revision_requested' so the admin sees a re-deliver action."""
    tx = await db.payment_transactions.find_one(
        {"session_id": session_id, "email": user["email"]}, {"_id": 0}
    )
    if not tx:
        raise HTTPException(status_code=404, detail="Order not found")
    if tx.get("status") != "delivered":
        raise HTTPException(
            status_code=400,
            detail="Revision can only be requested on delivered orders",
        )

    note = (payload.message or "").strip()
    now_iso = datetime.now(timezone.utc).isoformat()
    revision_entry = {
        "message": note,
        "requested_at": now_iso,
        "requested_by": user["email"],
    }
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {"status": "revision_requested", "updated_at": now_iso},
            "$push": {"revision_requests": revision_entry},
        },
    )

    # Notify admin via Resend (non-fatal)
    try:
        from email_service import send_revision_request_email
        await send_revision_request_email(
            client_email=user["email"],
            project_type=tx.get("project_type", "Project"),
            message=note,
            session_id=session_id,
        )
    except Exception as e:
        logger.warning(f"Revision admin email failed (non-fatal): {e}")

    return {"success": True, "status": "revision_requested"}


# ===================== Client Dashboard =====================
@api_router.get("/me/orders")
async def my_orders(user: dict = Depends(require_user)):
    """Return all paid project orders for the logged-in user (by email)."""
    cursor = db.payment_transactions.find(
        {"email": user["email"]},
        {"_id": 0},
    ).sort("created_at", -1)
    items = await cursor.to_list(100)

    # Attach file metadata (brief + delivered)
    enriched = []
    for it in items:
        # Brief files (client-uploaded)
        brief_files = []
        for fid in (it.get("file_ids") or []):
            try:
                fdoc = await db["onboarding_uploads.files"].find_one(
                    {"_id": ObjectId(fid)}, {"filename": 1, "length": 1}
                )
                if fdoc:
                    brief_files.append({
                        "file_id": fid,
                        "filename": fdoc.get("filename"),
                        "size": fdoc.get("length", 0),
                    })
            except Exception:
                pass
        # Deliveries (admin-uploaded)
        deliveries = await db.deliveries.find(
            {"session_id": it.get("session_id")}, {"_id": 0}
        ).sort("created_at", -1).to_list(20)
        deliveries_enriched = []
        for d in deliveries:
            d_files = []
            for fid in d.get("file_ids", []):
                try:
                    fdoc = await db["onboarding_uploads.files"].find_one(
                        {"_id": ObjectId(fid)}, {"filename": 1, "length": 1}
                    )
                    if fdoc:
                        d_files.append({
                            "file_id": fid,
                            "filename": fdoc.get("filename"),
                            "size": fdoc.get("length", 0),
                        })
                except Exception:
                    pass
            deliveries_enriched.append({**d, "files": d_files})

        enriched.append({
            "session_id": it.get("session_id"),
            "created_at": it.get("created_at"),
            "project_type": it.get("project_type"),
            "timeline": it.get("timeline"),
            "description": it.get("description"),
            "slide_count": it.get("slide_count"),
            "amount": it.get("amount"),
            "currency": it.get("currency"),
            "payment_status": it.get("payment_status"),
            "status": it.get("status"),
            "package_id": it.get("package_id"),
            "brief_files": brief_files,
            "deliveries": deliveries_enriched,
            "revision_requests": it.get("revision_requests", []),
        })
    return {"items": enriched}


@api_router.get("/me/files/{file_id}")
async def my_download_file(file_id: str, user: dict = Depends(require_user)):
    """Authenticated client download - checks that the file belongs to one of this user's orders."""
    try:
        oid = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file id")
    fdoc = await db["onboarding_uploads.files"].find_one({"_id": oid})
    if not fdoc:
        raise HTTPException(status_code=404, detail="File not found")

    # Verify ownership: file_id must appear in this user's order brief_files or deliveries
    fid_str = str(oid)
    own_tx = await db.payment_transactions.find_one(
        {"email": user["email"], "file_ids": fid_str}, {"_id": 0, "session_id": 1}
    )
    if not own_tx:
        # Check deliveries
        own_session = await db.payment_transactions.find_one(
            {"email": user["email"]}, {"_id": 0, "session_id": 1}
        )
        if own_session:
            delivery = await db.deliveries.find_one(
                {"session_id": own_session["session_id"], "file_ids": fid_str},
                {"_id": 0},
            )
            if not delivery:
                # Also check across all of the user's sessions
                tx_ids = await db.payment_transactions.find(
                    {"email": user["email"]}, {"_id": 0, "session_id": 1}
                ).to_list(100)
                session_ids = [t["session_id"] for t in tx_ids]
                delivery_any = await db.deliveries.find_one(
                    {"session_id": {"$in": session_ids}, "file_ids": fid_str},
                    {"_id": 0},
                )
                if not delivery_any:
                    raise HTTPException(status_code=403, detail="You do not have access to this file")
        else:
            raise HTTPException(status_code=403, detail="You do not have access to this file")

    return await _stream_gridfs(str(oid), force_download=True)


@api_router.post("/me/orders/{session_id}/upload")
async def my_upload_brief_file(
    session_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(require_user),
):
    """Client uploads an additional brief file to an existing order they own."""
    tx = await db.payment_transactions.find_one({"session_id": session_id, "email": user["email"]}, {"_id": 0})
    if not tx:
        raise HTTPException(status_code=404, detail="Order not found")

    filename = _safe_filename(file.filename)
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if ext not in ALLOWED_UPLOAD_EXT:
        raise HTTPException(status_code=400, detail=f"File type {ext or 'unknown'} not allowed.")

    buffer = io.BytesIO()
    total = 0
    while True:
        chunk = await file.read(1024 * 256)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 50 MB.")
        buffer.write(chunk)
    buffer.seek(0)
    if total == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    metadata = {
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "content_type": file.content_type or "application/octet-stream",
        "original_name": filename,
        "session_id": session_id,
        "email": user["email"],
        "kind": "brief_addon",
    }
    file_id = await fs_bucket.upload_from_stream(filename, buffer, metadata=metadata)

    # Append to order's file_ids
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$push": {"file_ids": str(file_id)},
         "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {
        "file_id": str(file_id),
        "filename": filename,
        "size": total,
    }


# ===================== Admin Templates =====================
@api_router.post("/admin/templates")
async def admin_create_template(payload: TemplateCreate, _: str = Depends(require_admin)):
    if payload.type == "paid" and payload.price <= 0:
        raise HTTPException(status_code=400, detail="Paid templates require price > 0")
    tpl = TemplateModel(**payload.model_dump())
    doc = tpl.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.templates.insert_one(doc)
    return _public_template(doc) | {"file_url": doc.get("file_url")}


@api_router.patch("/admin/templates/{template_id}")
async def admin_update_template(template_id: str, payload: dict, _: str = Depends(require_admin)):
    allowed = {"title", "description", "category", "type", "price", "thumbnail_url",
               "file_url", "preview_url", "tags", "is_published"}
    update_data = {k: v for k, v in payload.items() if k in allowed}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    result = await db.templates.update_one({"id": template_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    doc = await db.templates.find_one({"id": template_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/templates/{template_id}")
async def admin_delete_template(template_id: str, _: str = Depends(require_admin)):
    result = await db.templates.delete_one({"id": template_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"success": True}


@api_router.get("/admin/templates")
async def admin_list_templates(_: str = Depends(require_admin)):
    docs = await db.templates.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    # Include file_url for admin
    return {"items": docs}


# ===================== Blog =====================
import re as _re

def _slugify(text: str) -> str:
    s = (text or "").lower().strip()
    s = _re.sub(r"[^a-z0-9\s-]", "", s)
    s = _re.sub(r"[\s_-]+", "-", s)
    s = _re.sub(r"^-+|-+$", "", s)
    return s[:80] or str(uuid.uuid4())[:8]


class BlogPostModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str = Field(..., min_length=2, max_length=200)
    excerpt: str = Field(..., min_length=2, max_length=400)
    content: str = Field(..., min_length=10)  # Markdown
    cover_image_url: Optional[str] = None
    author: str = Field("SkiFi Designs", max_length=100)
    tags: List[str] = Field(default_factory=list)
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    excerpt: str = Field(..., min_length=2, max_length=400)
    content: str = Field(..., min_length=10)
    cover_image_url: Optional[str] = None
    author: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)
    is_published: bool = True


def _public_blog(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "slug": doc["slug"],
        "title": doc["title"],
        "excerpt": doc["excerpt"],
        "content": doc["content"],
        "cover_image_url": doc.get("cover_image_url"),
        "author": doc.get("author", "SkiFi Designs"),
        "tags": doc.get("tags", []),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


@api_router.get("/blog")
async def list_blog_posts(limit: int = 50, tag: Optional[str] = None):
    query = {"is_published": True}
    if tag:
        query["tags"] = tag
    docs = await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).limit(min(limit, 100)).to_list(100)
    return {"items": [_public_blog(d) for d in docs]}


@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    return _public_blog(doc)


# ===================== Admin Blog =====================
async def _generate_unique_slug(title: str, exclude_id: Optional[str] = None) -> str:
    base = _slugify(title)
    candidate = base
    n = 2
    while True:
        query = {"slug": candidate}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.blog_posts.find_one(query, {"_id": 0, "id": 1})
        if not existing:
            return candidate
        candidate = f"{base}-{n}"
        n += 1


@api_router.post("/admin/blog")
async def admin_create_blog(payload: BlogPostCreate, _: str = Depends(require_admin)):
    slug = await _generate_unique_slug(payload.title)
    post = BlogPostModel(
        slug=slug,
        **{k: v for k, v in payload.model_dump().items() if v is not None or k != "author"},
    )
    doc = post.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.blog_posts.insert_one(doc)
    return _public_blog(doc)


@api_router.patch("/admin/blog/{post_id}")
async def admin_update_blog(post_id: str, payload: dict, _: str = Depends(require_admin)):
    allowed = {"title", "excerpt", "content", "cover_image_url",
               "author", "tags", "is_published"}
    update_data = {k: v for k, v in payload.items() if k in allowed}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    if "title" in update_data:
        update_data["slug"] = await _generate_unique_slug(update_data["title"], exclude_id=post_id)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    doc = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    return _public_blog(doc)


@api_router.delete("/admin/blog/{post_id}")
async def admin_delete_blog(post_id: str, _: str = Depends(require_admin)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


@api_router.get("/admin/blog")
async def admin_list_blog(_: str = Depends(require_admin)):
    docs = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"items": [_public_blog(d) | {"is_published": d.get("is_published", True)} for d in docs]}


# ===================== Dynamic Sitemap =====================
@api_router.get("/sitemap.xml")
async def dynamic_sitemap():
    """Dynamic sitemap that includes all published blog posts."""
    base = "https://skifidesigns.com"
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [
        (f"{base}/", today, "1.0", "weekly"),
        (f"{base}/resources", today, "0.8", "weekly"),
        (f"{base}/blog", today, "0.9", "daily"),
        (f"{base}/privacy", today, "0.3", "yearly"),
        (f"{base}/terms", today, "0.3", "yearly"),
        (f"{base}/refund-policy", today, "0.3", "yearly"),
        (f"{base}/cookies", today, "0.3", "yearly"),
    ]
    posts = await db.blog_posts.find(
        {"is_published": True}, {"_id": 0, "slug": 1, "updated_at": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(1000)
    for p in posts:
        last = (p.get("updated_at") or p.get("created_at") or today)[:10]
        urls.append((f"{base}/blog/{p['slug']}", last, "0.7", "monthly"))

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod, priority, changefreq in urls:
        xml_parts.append(
            f"<url><loc>{loc}</loc><lastmod>{lastmod}</lastmod>"
            f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"
        )
    xml_parts.append("</urlset>")
    return Response(content="\n".join(xml_parts), media_type="application/xml")


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
