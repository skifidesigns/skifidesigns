"""
Backend tests for Iteration 3: Resources/Templates + Emergent Google Auth.

Covers:
- Public templates: list (filters), get-by-id, file_url hidden
- Auth: /auth/me, /auth/session (missing header, invalid session), /auth/logout
- Protected: /templates/{id}/access requires auth, /me/library requires auth
- Admin templates: create (free + paid + reject paid w/ price=0), update, delete, list-all (with file_url)
- Smoke: manually seed user_session in DB and call /me/library with Bearer token
"""
import os
import time
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') if os.environ.get('REACT_APP_BACKEND_URL') else None
if not BASE_URL:
    # Read from /app/frontend/.env
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
                break

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'skifi-admin-2026')


# ----------------- Fixtures -----------------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def mongo():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture(scope="module")
def test_user_session(mongo):
    """Manually insert a test user + session, return session_token."""
    uid = f"TEST_user_{uuid.uuid4().hex[:8]}"
    token = f"TEST_sess_{uuid.uuid4().hex}"
    email = f"TEST_{uid}@example.com"
    mongo.users.insert_one({
        "user_id": uid,
        "email": email,
        "name": "Test User",
        "picture": "https://example.com/p.png",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    mongo.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    yield {"user_id": uid, "email": email, "session_token": token}
    # cleanup
    mongo.users.delete_one({"user_id": uid})
    mongo.user_sessions.delete_one({"session_token": token})
    mongo.template_purchases.delete_many({"user_id": uid})
    mongo.template_downloads.delete_many({"user_id": uid})


# Container for IDs created in tests so we can reuse across tests in same module
_state = {}


# ----------------- Auth Tests -----------------
class TestAuthEndpoints:
    def test_auth_me_without_token_returns_401(self, api):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401, r.text

    def test_auth_session_missing_header_returns_400(self, api):
        r = requests.post(f"{BASE_URL}/api/auth/session")
        assert r.status_code == 400, r.text
        assert "X-Session-ID" in r.json().get("detail", "")

    def test_auth_session_invalid_session_id_returns_401(self, api):
        r = requests.post(
            f"{BASE_URL}/api/auth/session",
            headers={"X-Session-ID": "definitely-not-a-real-session-id-xyz123"},
        )
        # Emergent auth verification should fail with 401, or 502 if upstream errors
        assert r.status_code in (401, 502), r.text

    def test_auth_me_with_bearer_token_returns_user(self, test_user_session):
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user_id"] == test_user_session["user_id"]
        assert data["email"] == test_user_session["email"]

    def test_auth_logout_clears_cookie(self, api):
        r = requests.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        assert r.json().get("success") is True


# ----------------- Admin Templates Tests -----------------
class TestAdminTemplates:
    def test_admin_create_template_no_auth_returns_401(self, api):
        r = requests.post(f"{BASE_URL}/api/admin/templates", json={
            "title": "x", "category": "Pitch Deck", "type": "free",
            "thumbnail_url": "https://x/y.png"
        })
        assert r.status_code == 401

    def test_admin_create_free_template(self, api, admin_token):
        payload = {
            "title": "TEST_Free Pitch Deck",
            "description": "A free pitch deck template",
            "category": "Pitch Deck",
            "type": "free",
            "price": 0,
            "thumbnail_url": "https://example.com/thumb.png",
            "file_url": "https://example.com/file.pptx",
            "tags": ["startup", "pitch"],
            "is_published": True,
        }
        r = requests.post(
            f"{BASE_URL}/api/admin/templates",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == payload["title"]
        assert data["type"] == "free"
        assert data["file_url"] == payload["file_url"]
        assert "id" in data
        _state["free_template_id"] = data["id"]

    def test_admin_create_paid_template(self, api, admin_token):
        payload = {
            "title": "TEST_Paid Sales Deck",
            "description": "A premium sales deck",
            "category": "Sales Deck",
            "type": "paid",
            "price": 49.0,
            "thumbnail_url": "https://example.com/thumb2.png",
            "file_url": "https://example.com/paid.pptx",
            "tags": ["premium"],
        }
        r = requests.post(
            f"{BASE_URL}/api/admin/templates",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["type"] == "paid"
        assert data["price"] == 49.0
        _state["paid_template_id"] = data["id"]

    def test_admin_reject_paid_with_zero_price(self, api, admin_token):
        payload = {
            "title": "TEST_Bad Paid",
            "category": "Pitch Deck",
            "type": "paid",
            "price": 0,
            "thumbnail_url": "https://example.com/thumb.png",
        }
        r = requests.post(
            f"{BASE_URL}/api/admin/templates",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 400, r.text
        assert "price" in r.json().get("detail", "").lower()

    def test_admin_patch_template(self, api, admin_token):
        tid = _state.get("free_template_id")
        assert tid
        r = requests.patch(
            f"{BASE_URL}/api/admin/templates/{tid}",
            json={"title": "TEST_Free Pitch Deck UPDATED", "tags": ["updated", "free"]},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["title"] == "TEST_Free Pitch Deck UPDATED"
        assert "updated" in r.json()["tags"]

    def test_admin_patch_no_valid_fields_returns_400(self, api, admin_token):
        tid = _state.get("free_template_id")
        r = requests.patch(
            f"{BASE_URL}/api/admin/templates/{tid}",
            json={"foo": "bar"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 400

    def test_admin_patch_nonexistent_returns_404(self, api, admin_token):
        r = requests.patch(
            f"{BASE_URL}/api/admin/templates/nonexistent-id-xyz",
            json={"title": "x"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 404

    def test_admin_list_templates_shows_file_url(self, api, admin_token):
        r = requests.get(
            f"{BASE_URL}/api/admin/templates",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        items = r.json()["items"]
        free = next((t for t in items if t["id"] == _state.get("free_template_id")), None)
        assert free is not None
        assert free.get("file_url") == "https://example.com/file.pptx"


# ----------------- Public Templates Tests -----------------
class TestPublicTemplates:
    def test_list_templates_excludes_file_url(self, api, admin_token):
        # ensure at least one template exists
        r = requests.get(f"{BASE_URL}/api/templates")
        assert r.status_code == 200, r.text
        items = r.json()["items"]
        assert isinstance(items, list)
        for t in items:
            assert "file_url" not in t, f"file_url leaked in public list: {t}"

    def test_list_templates_filter_by_type_free(self, api):
        r = requests.get(f"{BASE_URL}/api/templates?type=free")
        assert r.status_code == 200
        for t in r.json()["items"]:
            assert t["type"] == "free"

    def test_list_templates_filter_by_type_paid(self, api):
        r = requests.get(f"{BASE_URL}/api/templates?type=paid")
        assert r.status_code == 200
        for t in r.json()["items"]:
            assert t["type"] == "paid"

    def test_list_templates_filter_by_category(self, api):
        r = requests.get(f"{BASE_URL}/api/templates?category=Sales Deck")
        assert r.status_code == 200
        for t in r.json()["items"]:
            assert t["category"] == "Sales Deck"

    def test_list_templates_search(self, api):
        r = requests.get(f"{BASE_URL}/api/templates?search=Pitch")
        assert r.status_code == 200
        # at least we should not 500; results may or may not include our seeded one
        for t in r.json()["items"]:
            assert "pitch" in t["title"].lower()

    def test_get_template_by_id_excludes_file_url(self, api):
        tid = _state.get("free_template_id")
        assert tid
        r = requests.get(f"{BASE_URL}/api/templates/{tid}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"] == tid
        assert "file_url" not in data

    def test_get_template_nonexistent_returns_404(self, api):
        r = requests.get(f"{BASE_URL}/api/templates/totally-not-a-real-template-id")
        assert r.status_code == 404


# ----------------- Protected User Endpoints -----------------
class TestProtectedUserEndpoints:
    def test_access_template_without_auth_returns_401(self, api):
        tid = _state.get("free_template_id") or "any-id"
        r = requests.post(f"{BASE_URL}/api/templates/{tid}/access", json={})
        assert r.status_code == 401, r.text

    def test_access_template_with_auth_nonexistent_returns_404(self, test_user_session):
        r = requests.post(
            f"{BASE_URL}/api/templates/nonexistent-id-xyz/access",
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"},
            json={},
        )
        assert r.status_code == 404

    def test_access_free_template_returns_download_url(self, test_user_session):
        tid = _state.get("free_template_id")
        assert tid
        r = requests.post(
            f"{BASE_URL}/api/templates/{tid}/access",
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"},
            json={},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["type"] == "free"
        assert data.get("download_url") is not None

    def test_my_library_without_auth_returns_401(self, api):
        r = requests.get(f"{BASE_URL}/api/me/library")
        assert r.status_code == 401

    def test_my_library_with_auth_returns_empty(self, test_user_session):
        r = requests.get(
            f"{BASE_URL}/api/me/library",
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"},
        )
        assert r.status_code == 200, r.text
        assert r.json() == {"items": []}


# ----------------- Regression: existing endpoints unchanged -----------------
class TestRegression:
    def test_root(self, api):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

    def test_admin_login_wrong_password(self, api):
        r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong"})
        assert r.status_code == 401

    def test_admin_submissions_with_token(self, admin_token):
        r = requests.get(
            f"{BASE_URL}/api/admin/submissions",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and "stats" in data

    def test_payments_status_unknown_returns_404(self, api):
        r = requests.get(f"{BASE_URL}/api/payments/status/cs_test_does_not_exist_xyz")
        assert r.status_code == 404

    def test_onboarding_invalid_package(self, api):
        r = requests.post(f"{BASE_URL}/api/onboarding/create-checkout", json={
            "package_id": "not_a_package",
            "full_name": "Test User",
            "email": "test@example.com",
            "project_type": "Pitch Deck",
            "timeline": "1 week",
            "description": "Test description here for invalid pkg",
            "origin_url": "https://example.com",
        })
        assert r.status_code == 400

    def test_webhook_stripe_invalid_sig_returns_200(self, api):
        r = requests.post(
            f"{BASE_URL}/api/webhook/stripe",
            data=b"{}",
            headers={"Stripe-Signature": "invalid", "Content-Type": "application/json"},
        )
        # Webhook silently swallows invalid sigs and returns {"received": True}
        assert r.status_code == 200
        assert r.json().get("received") is True

    def test_auth_logout_endpoint(self, api):
        r = requests.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200


# ----------------- Template Purchase Flow (paid) -----------------
class TestPaidTemplatePurchase:
    def test_access_paid_template_creates_checkout(self, test_user_session):
        tid = _state.get("paid_template_id")
        assert tid
        r = requests.post(
            f"{BASE_URL}/api/templates/{tid}/access",
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"},
            json={"origin_url": "https://example.com"},
        )
        # Could be 200 with checkout_url, or 500 if Stripe rejects on test
        if r.status_code == 200:
            data = r.json()
            assert data["type"] == "paid"
            assert "checkout_url" in data
            assert "session_id" in data
            _state["template_session_id"] = data["session_id"]
        else:
            pytest.skip(f"Stripe checkout creation returned {r.status_code}: {r.text}")

    def test_payments_status_for_template_session(self, test_user_session):
        sid = _state.get("template_session_id")
        if not sid:
            pytest.skip("No template session_id created in previous test")
        r = requests.get(f"{BASE_URL}/api/payments/status/{sid}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["session_id"] == sid
        assert data.get("kind") == "template"


# ----------------- Cleanup (admin delete) -----------------
class TestZCleanup:
    def test_admin_delete_free_template(self, admin_token):
        tid = _state.get("free_template_id")
        if not tid:
            pytest.skip("no free template to delete")
        r = requests.delete(
            f"{BASE_URL}/api/admin/templates/{tid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        # verify gone
        r2 = requests.get(f"{BASE_URL}/api/templates/{tid}")
        assert r2.status_code == 404

    def test_admin_delete_paid_template(self, admin_token):
        tid = _state.get("paid_template_id")
        if not tid:
            pytest.skip("no paid template to delete")
        r = requests.delete(
            f"{BASE_URL}/api/admin/templates/{tid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200

    def test_admin_delete_nonexistent_returns_404(self, admin_token):
        r = requests.delete(
            f"{BASE_URL}/api/admin/templates/nope-xyz",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 404
