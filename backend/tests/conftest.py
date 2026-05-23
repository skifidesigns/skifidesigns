"""Shared pytest config: provide asyncio mode and load backend .env for direct DB access."""
import os
from pathlib import Path

# Load /app/backend/.env so MONGO_URL/DB_NAME are available for direct DB tests
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except Exception:
    pass

# pytest-asyncio: enable function-scoped mode automatically for @pytest.mark.asyncio
import pytest_asyncio  # noqa: F401
