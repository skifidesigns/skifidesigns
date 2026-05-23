"""Backend tests for SkiFi Designs - iteration 2.

Covers:
 - Admin auth endpoints (/api/admin/login, /api/admin/submissions, /api/admin/me)
 - Subscription fallback mode on /api/onboarding/create-checkout (monthly_retainer)
 - payment_transactions doc has new fields: 'mode' and 'emails_sent'
 - _maybe_send_emails code path & idempotency verification via MongoDB
"""
import os
import uuid
import asyncio
import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

# ----------------------------- Config -----------------------------
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"')
                    break
    except FileNotFoundError:
        pass

assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_PASSWORD = "skifi-admin-2026"  # from /app/backend/.env

# MongoDB direct connection for state assertions
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["token"]


def _payload(**overrides):
    base = {
        "package_id": "monthly_retainer",
        "full_name": "TEST AdminCase",
        "email": f"test_admin_{uuid.uuid4().hex[:8]}@example.com",
        "company": "TEST Admin Co",
        "project_type": "Pitch Deck",
        "timeline": "ASAP",
        "description": "TEST description for admin/subscription integration test.",
        "origin_url": "https://example.com",
    }
    base.update(overrides)
    return base


# ===================== Admin auth =====================
class TestAdminAuth:
    def test_admin_login_wrong_password_returns_401(self, session):
        r = session.post(f"{API}/admin/login", json={"password": "wrong-password"})
        assert r.status_code == 401, r.text
        assert "Invalid password" in r.json().get("detail", "")

    def test_admin_login_correct_password_returns_token(self, session):
        r = session.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert "expires_at" in data
        # ISO datetime string
        assert "T" in data["expires_at"]

    def test_admin_login_missing_password_returns_422(self, session):
        r = session.post(f"{API}/admin/login", json={})
        assert r.status_code == 422

    def test_submissions_without_auth_returns_401(self, session):
        r = session.get(f"{API}/admin/submissions")
        assert r.status_code == 401, r.text

    def test_submissions_with_invalid_token_returns_401(self, session):
        r = session.get(
            f"{API}/admin/submissions",
            headers={"Authorization": "Bearer invalid-token-xyz"},
        )
        assert r.status_code == 401

    def test_submissions_with_malformed_header_returns_401(self, session):
        r = session.get(
            f"{API}/admin/submissions",
            headers={"Authorization": "NotBearer abc"},
        )
        assert r.status_code == 401

    def test_admin_me_without_auth_returns_401(self, session):
        r = session.get(f"{API}/admin/me")
        assert r.status_code == 401

    def test_admin_me_with_valid_token_returns_authenticated(self, session, admin_token):
        r = session.get(
            f"{API}/admin/me",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        assert r.json() == {"authenticated": True}


# ===================== Admin Submissions list =====================
class TestAdminSubmissions:
    def test_list_submissions_with_valid_token(self, session, admin_token):
        # Seed at least one submission so list isn't empty
        seed = session.post(f"{API}/onboarding/create-checkout", json=_payload())
        assert seed.status_code == 200, seed.text
        seed_sid = seed.json()["session_id"]

        r = session.get(
            f"{API}/admin/submissions",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "items" in data and isinstance(data["items"], list)
        assert "stats" in data
        stats = data["stats"]
        for key in ("total", "paid", "pending", "revenue_usd"):
            assert key in stats, f"missing stats key {key}"
        assert isinstance(stats["total"], int)
        assert isinstance(stats["paid"], int)
        assert isinstance(stats["pending"], int)
        assert isinstance(stats["revenue_usd"], (int, float))
        assert stats["total"] >= 1
        # Our seeded item should be in the list (sorted by created_at desc)
        assert any(it.get("session_id") == seed_sid for it in data["items"]), \
            "Seeded submission not in list"

        # Validate new fields exist on the item
        found = next(it for it in data["items"] if it["session_id"] == seed_sid)
        assert "mode" in found, "transaction doc missing 'mode' field"
        assert "emails_sent" in found, "transaction doc missing 'emails_sent' field"
        assert found["mode"] in ("payment", "subscription")
        assert found["emails_sent"] is False  # not paid yet → no emails

        # Ensure mongo _id is NOT leaked
        assert "_id" not in found, "MongoDB _id should be stripped"

    def test_filter_by_payment_status_pending(self, session, admin_token):
        # Create one fresh pending tx
        seed = session.post(f"{API}/onboarding/create-checkout", json=_payload())
        assert seed.status_code == 200
        seed_sid = seed.json()["session_id"]

        r = session.get(
            f"{API}/admin/submissions",
            params={"payment_status": "pending"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        # All returned items must have payment_status == pending
        assert all(it.get("payment_status") == "pending" for it in data["items"]), \
            "Filter not respected"
        # And our seed must appear
        assert any(it.get("session_id") == seed_sid for it in data["items"])

    def test_filter_by_payment_status_paid_only_paid(self, session, admin_token):
        r = session.get(
            f"{API}/admin/submissions",
            params={"payment_status": "paid"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(it.get("payment_status") == "paid" for it in items)


# ===================== Subscription fallback (monthly_retainer) =====================
class TestSubscriptionFallback:
    def test_monthly_retainer_returns_payment_mode_when_price_id_empty(self, session):
        r = session.post(f"{API}/onboarding/create-checkout",
                         json=_payload(package_id="monthly_retainer"))
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 999.0
        assert data["currency"] == "usd"
        # STRIPE_MONTHLY_PRICE_ID is empty → fallback to one-time
        assert data["mode"] == "payment", f"Expected fallback mode=payment, got {data.get('mode')}"
        assert data["session_id"]
        assert data["url"].startswith("http")

    def test_per_slide_still_returns_payment_mode_and_correct_amount(self, session):
        r = session.post(f"{API}/onboarding/create-checkout",
                         json=_payload(package_id="per_slide", slide_count=10))
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 150.0
        assert data["mode"] == "payment"


# ===================== DB-level checks on new fields =====================
class TestPaymentTxFields:
    @pytest.mark.asyncio
    async def test_new_fields_persisted_in_mongo(self, session):
        """Create a tx via API, then read the raw document from MongoDB and check fields."""
        r = session.post(f"{API}/onboarding/create-checkout",
                         json=_payload(package_id="monthly_retainer"))
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]

        mongo = AsyncIOMotorClient(MONGO_URL)
        try:
            doc = await mongo[DB_NAME].payment_transactions.find_one({"session_id": sid})
            assert doc is not None, "Transaction not found in MongoDB"
            assert "mode" in doc, "Missing 'mode' field in DB doc"
            assert "emails_sent" in doc, "Missing 'emails_sent' field in DB doc"
            assert doc["mode"] == "payment"
            assert doc["emails_sent"] is False
            assert doc["payment_status"] == "pending"
            assert doc["status"] == "initiated"
            assert doc["amount"] == 999.0
        finally:
            mongo.close()

    @pytest.mark.asyncio
    async def test_maybe_send_emails_idempotent_codepath(self):
        """Directly exercise _maybe_send_emails: insert a fake tx with payment_status=paid
        and emails_sent=False, then invoke the function and verify emails_sent flips to True
        and that re-invoking is a no-op (idempotent).
        """
        import sys
        sys.path.insert(0, "/app/backend")
        import server as srv  # noqa: E402

        sid = f"cs_test_emailpath_{uuid.uuid4().hex}"
        fake_tx = {
            "session_id": sid,
            "package_id": "monthly_retainer",
            "amount": 999.0,
            "currency": "usd",
            "full_name": "TEST EmailPath",
            "email": "test_emailpath@example.com",
            "company": "TEST Co",
            "project_type": "Pitch Deck",
            "timeline": "ASAP",
            "description": "TEST email path verification",
            "slide_count": None,
            "payment_status": "paid",
            "status": "complete",
            "mode": "payment",
            "emails_sent": False,
        }
        # Insert directly via the server's db handle so we use the same connection
        await srv.db.payment_transactions.insert_one(dict(fake_tx))

        try:
            # First invocation — should attempt to send and flip emails_sent
            await srv._maybe_send_emails(fake_tx)
            doc = await srv.db.payment_transactions.find_one({"session_id": sid})
            assert doc is not None
            assert doc["emails_sent"] is True, \
                f"emails_sent did not flip to True; doc={doc}"

            # Second invocation — should be a no-op (early-return); emails_sent stays True
            await srv._maybe_send_emails(doc)
            doc2 = await srv.db.payment_transactions.find_one({"session_id": sid})
            assert doc2["emails_sent"] is True
        finally:
            await srv.db.payment_transactions.delete_one({"session_id": sid})


# ===================== Regression on prior endpoints =====================
class TestRegression:
    def test_root_still_works(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()

    def test_webhook_still_handles_invalid_signature(self, session):
        r = session.post(
            f"{API}/webhook/stripe",
            data=b'{"id":"evt_test","type":"checkout.session.completed"}',
            headers={"Content-Type": "application/json", "Stripe-Signature": "t=0,v1=invalid"},
        )
        assert r.status_code not in (404, 405)
        assert r.status_code in (200, 400)

    def test_status_check_create_and_get(self, session):
        r = session.post(f"{API}/status", json={"client_name": f"TEST_{uuid.uuid4().hex[:8]}"})
        assert r.status_code == 200
        assert "id" in r.json()
        r2 = session.get(f"{API}/status")
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)

    def test_payment_status_unknown_returns_404(self, session):
        r = session.get(f"{API}/payments/status/cs_test_unknown_{uuid.uuid4().hex}")
        assert r.status_code == 404
