"""AI Lab tests: palette extraction, template generation, admin leads + CSV, rate limits."""
import io
import os
import uuid

import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://presentation-studio-22.preview.emergentagent.com").rstrip("/")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "SkiFi7878OpenSeasame")


def _png_bytes(color=(220, 30, 30), size=(80, 80)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"admin login failed: {r.status_code} {r.text[:120]}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- Palette extraction ----------------
class TestPaletteExtraction:
    def test_extract_palette_ok(self):
        files = {"logo": ("logo.png", _png_bytes((10, 110, 220)), "image/png")}
        r = requests.post(f"{BASE_URL}/api/ai-lab/template/extract-palette", files=files, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "palette" in body and isinstance(body["palette"], list) and len(body["palette"]) >= 1
        assert body["primary"].startswith("#") and len(body["primary"]) == 7
        assert body["accent"].startswith("#") and len(body["accent"]) == 7

    def test_extract_palette_bad_mime(self):
        files = {"logo": ("file.txt", b"not an image", "text/plain")}
        r = requests.post(f"{BASE_URL}/api/ai-lab/template/extract-palette", files=files, timeout=15)
        assert r.status_code == 400

    def test_extract_palette_too_large(self):
        # 9 MB image triggers 413
        big = _png_bytes((10, 10, 10), (3500, 3500))  # likely >8MB
        if len(big) <= 8 * 1024 * 1024:
            # pad bytes after PNG signature won't be valid; just use a raw 9MB buffer with image/png
            big = b"\x89PNG\r\n\x1a\n" + (b"0" * (9 * 1024 * 1024))
        files = {"logo": ("big.png", big, "image/png")}
        r = requests.post(f"{BASE_URL}/api/ai-lab/template/extract-palette", files=files, timeout=30)
        assert r.status_code == 413, f"expected 413, got {r.status_code}"


# ---------------- Template generation + rate limit ----------------
class TestTemplateGeneration:
    def test_generate_returns_pptx(self):
        unique = f"TEST_qa+{uuid.uuid4().hex[:8]}@skifidesigns.com"
        data = {
            "name": "QA Bot", "email": unique, "company": "TEST_Co",
            "project_name": "TEST_Project", "primary": "#2A7AFE",
            "dark": "#0A0F1E", "light": "#F5F4EE",
        }
        files = {"logo1": ("logo.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/ai-lab/template/generate", data=data, files=files, timeout=60)
        assert r.status_code == 200, r.text[:300]
        assert "officedocument.presentationml.presentation" in r.headers.get("content-type", "")
        assert r.content[:2] == b"PK", "should be a .pptx (zip) file"
        assert "attachment" in r.headers.get("content-disposition", "").lower()

    def test_template_daily_limit_returns_429(self):
        unique = f"TEST_rl+{uuid.uuid4().hex[:8]}@skifidesigns.com"
        # Default TEMPLATE_GEN_DAILY_LIMIT=3 -> 4th should 429
        last_status = None
        for i in range(4):
            data = {"name": "RL", "email": unique, "company": "TEST_Co",
                    "project_name": f"TEST_RL_{i}", "primary": "#2A7AFE",
                    "dark": "#0A0F1E", "light": "#F5F4EE"}
            files = {"logo1": ("l.png", _png_bytes(), "image/png")}
            r = requests.post(f"{BASE_URL}/api/ai-lab/template/generate", data=data, files=files, timeout=60)
            last_status = r.status_code
            if i < 3:
                assert r.status_code == 200, f"call {i+1} should succeed, got {r.status_code}: {r.text[:200]}"
            else:
                assert r.status_code == 429, f"4th call should be rate-limited, got {r.status_code}: {r.text[:200]}"
                assert "Daily limit" in r.json().get("detail", "")


# ---------------- Deck review validation ----------------
class TestDeckReviewValidation:
    def test_deck_review_rejects_non_pdf(self):
        data = {"name": "QA", "email": f"TEST_qa+{uuid.uuid4().hex[:6]}@skifidesigns.com", "company": "TEST_Co"}
        files = {"pdf": ("not.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/ai-lab/deck-review", data=data, files=files, timeout=30)
        assert r.status_code == 400


# ---------------- Admin endpoints ----------------
class TestAdminAILabLeads:
    def test_unauthorized_leads_list(self):
        r = requests.get(f"{BASE_URL}/api/admin/ai-lab/leads", timeout=15)
        assert r.status_code in (401, 403)

    def test_unauthorized_csv(self):
        r = requests.get(f"{BASE_URL}/api/admin/ai-lab/leads.csv", timeout=15)
        assert r.status_code in (401, 403)

    def test_list_leads(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/ai-lab/leads", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and isinstance(body["items"], list)
        # Should contain at least one template_generator lead from the earlier test
        assert any(i.get("tool") == "template_generator" for i in body["items"]), "expected template_generator leads"
        for it in body["items"]:
            assert "_id" not in it, "MongoDB _id leaked"
            assert "email" in it and "tool" in it

    def test_filter_leads_by_tool(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/ai-lab/leads?tool=template_generator",
                         headers=admin_headers, timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(i["tool"] == "template_generator" for i in items)

    def test_csv_export(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/ai-lab/leads.csv", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        ctype = r.headers.get("content-type", "")
        assert "text/csv" in ctype, f"content-type was {ctype}"
        assert "attachment" in r.headers.get("content-disposition", "").lower()
        text = r.text
        assert "created_at" in text and "tool" in text and "email" in text
