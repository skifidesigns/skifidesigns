"""Backend tests for SkiFi Designs onboarding + Stripe payment integration."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to reading the frontend .env so pytest can run without env injection
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


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _payload(**overrides):
    base = {
        "package_id": "monthly_retainer",
        "full_name": "TEST User",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "company": "TEST Co",
        "project_type": "Pitch Deck",
        "timeline": "ASAP",
        "description": "TEST description for onboarding flow integration test.",
        "origin_url": "https://example.com",
    }
    base.update(overrides)
    return base


# ===================== Root sanity =====================
class TestRoot:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ===================== Onboarding create-checkout =====================
class TestCreateCheckout:
    def test_invalid_package_id_returns_400(self, session):
        r = session.post(f"{API}/onboarding/create-checkout", json=_payload(package_id="bogus"))
        assert r.status_code == 400, r.text
        assert "Invalid package" in r.json().get("detail", "")

    def test_per_slide_missing_slide_count_returns_400(self, session):
        # slide_count omitted -> server should reject
        p = _payload(package_id="per_slide")
        r = session.post(f"{API}/onboarding/create-checkout", json=p)
        assert r.status_code == 400, r.text
        assert "Slide count" in r.json().get("detail", "")

    def test_per_slide_amount_is_15_times_slide_count(self, session):
        p = _payload(package_id="per_slide", slide_count=12)
        r = session.post(f"{API}/onboarding/create-checkout", json=p)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 15 * 12
        assert data["currency"] == "usd"
        assert "session_id" in data and data["session_id"]
        assert "url" in data and data["url"].startswith("http")

        # Verify persistence by polling status endpoint (must find tx)
        # Use the status endpoint - it should at least find the tx in DB.
        sid = data["session_id"]
        rs = session.get(f"{API}/payments/status/{sid}")
        # Either Stripe returns a real status (200) OR Stripe call fails (500) but
        # importantly NOT 404 - that would mean the transaction was not persisted.
        assert rs.status_code != 404, f"Transaction was not persisted: {rs.text}"

    def test_monthly_retainer_amount_is_999(self, session):
        p = _payload(package_id="monthly_retainer")
        r = session.post(f"{API}/onboarding/create-checkout", json=p)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 999
        assert data["currency"] == "usd"
        assert data["session_id"]
        assert data["url"].startswith("http")

        # Persistence check
        sid = data["session_id"]
        rs = session.get(f"{API}/payments/status/{sid}")
        assert rs.status_code != 404, f"Transaction was not persisted: {rs.text}"

    def test_invalid_email_returns_422(self, session):
        p = _payload(email="not-an-email")
        r = session.post(f"{API}/onboarding/create-checkout", json=p)
        assert r.status_code == 422

    def test_missing_required_fields_returns_422(self, session):
        r = session.post(f"{API}/onboarding/create-checkout", json={"package_id": "monthly_retainer"})
        assert r.status_code == 422


# ===================== Payment status =====================
class TestPaymentStatus:
    def test_unknown_session_returns_404(self, session):
        r = session.get(f"{API}/payments/status/cs_test_does_not_exist_{uuid.uuid4().hex}")
        assert r.status_code == 404
        assert r.json().get("detail") == "Transaction not found"

    def test_known_session_returns_status(self, session):
        # Create a session first
        p = _payload(package_id="monthly_retainer")
        c = session.post(f"{API}/onboarding/create-checkout", json=p)
        assert c.status_code == 200, c.text
        sid = c.json()["session_id"]

        r = session.get(f"{API}/payments/status/{sid}")
        # Accept 200 (Stripe returned status) OR 500 (Stripe call failed for sk_test_emergent),
        # but NOT 404 - that would mean persistence failed.
        assert r.status_code in (200, 500), r.text
        if r.status_code == 200:
            data = r.json()
            assert data["session_id"] == sid
            assert "payment_status" in data
            assert "status" in data
            assert data["amount"] == 999
            assert data["currency"] == "usd"


# ===================== Stripe webhook =====================
class TestStripeWebhook:
    def test_webhook_handles_invalid_payload_gracefully(self, session):
        # Sending mock data - signature verification expected to fail.
        # Endpoint must exist and either return {received: True} or 400 (handled error).
        r = session.post(
            f"{API}/webhook/stripe",
            data=b'{"id":"evt_test","type":"checkout.session.completed"}',
            headers={"Content-Type": "application/json", "Stripe-Signature": "t=0,v1=invalid"},
        )
        # The endpoint must exist (no 404/405)
        assert r.status_code not in (404, 405), f"Webhook endpoint missing or wrong method: {r.status_code}"
        # Either it accepted ({received:True}) or gracefully returned 400
        assert r.status_code in (200, 400), r.text
        if r.status_code == 200:
            assert r.json() == {"received": True}
