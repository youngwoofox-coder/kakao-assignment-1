import os
import tempfile

import pytest

# main.py를 import하기 전에 테스트용 환경변수를 설정해야 한다.
# load_dotenv는 이미 설정된 환경변수를 덮어쓰지 않으므로 .env.local과 충돌하지 않는다.
_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.close(_db_fd)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db_path}")
os.environ.setdefault("API_KEY", "test-api-key")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000")

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402

TEST_API_KEY = os.environ["API_KEY"]


@pytest.fixture
def client():
    return TestClient(main.app)


@pytest.fixture
def auth_headers():
    return {"X-API-Key": TEST_API_KEY}


@pytest.fixture(autouse=True)
def clean_todos_table():
    """테스트 간 격리를 위해 매 테스트 전후로 todos 테이블을 비운다."""
    with main.engine.begin() as conn:
        conn.execute(main.Todo.__table__.delete())
    yield
    with main.engine.begin() as conn:
        conn.execute(main.Todo.__table__.delete())
