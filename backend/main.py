import logging
import os
import re
import secrets
import time
import uuid
from datetime import date, datetime
from typing import Annotated, Generator, Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import AfterValidator, BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, String, create_engine, inspect, select, text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

# .env.local 파일에서 환경변수 로드
load_dotenv(".env.local")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("todo_api")

# 커스텀 요청 로깅 미들웨어가 같은 정보를 남기므로 uvicorn 기본 access log는 끈다 (중복 방지)
logging.getLogger("uvicorn.access").disabled = True

# ---------------------------------------------------------------------------
# SQLite + SQLAlchemy 설정
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.critical("DATABASE_URL 환경변수가 설정되지 않아 부팅을 중단합니다.")
    raise RuntimeError(
        "DATABASE_URL 환경변수가 설정되지 않았습니다. backend/.env.local을 확인하세요."
    )

API_KEY = os.getenv("API_KEY")

if not API_KEY:
    logger.critical("API_KEY 환경변수가 설정되지 않아 부팅을 중단합니다.")
    raise RuntimeError(
        "API_KEY 환경변수가 설정되지 않았습니다. backend/.env.local을 확인하세요."
    )

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# check_same_thread=False: FastAPI는 요청마다 다른 스레드에서 DB에 접근할 수 있음
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# DB 모델 (SQLAlchemy) — SQLite 테이블 구조
# ---------------------------------------------------------------------------
class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # 인덱스가 있어도 ilike(f"%{search}%")처럼 앞에 와일드카드가 붙으면 B-tree를 못 타 풀스캔이다.
    # 검색 자체를 빠르게 하려면 FTS5 같은 전용 인덱스가 필요하지만, 지금 규모에서는 과한 작업이라 보류.
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    version: Mapped[int] = mapped_column(default=0, nullable=False)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False)


# 앱 시작 시 todos 테이블이 없으면 자동 생성 → todos.db 파일도 함께 생성됨
Base.metadata.create_all(bind=engine)


def migrate_db() -> None:
    """기존 DB에 date/version 컬럼이 없으면 추가한다."""
    inspector = inspect(engine)
    if not inspector.has_table("todos"):
        return

    columns = [column["name"] for column in inspector.get_columns("todos")]

    if "date" not in columns:
        today = date.today().isoformat()
        # SQLite는 ALTER TABLE ADD COLUMN DEFAULT에 바인드 파라미터를 허용하지 않으므로
        # 보간 전 형식을 강제 검증해 인젝션 경로를 차단한다.
        assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", today), "잘못된 날짜 형식"
        with engine.begin() as conn:
            conn.execute(
                text(f"ALTER TABLE todos ADD COLUMN date VARCHAR(10) NOT NULL DEFAULT '{today}'")
            )

    if "version" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE todos ADD COLUMN version INTEGER NOT NULL DEFAULT 0")
            )

    if "created_at" not in columns:
        now = datetime.now().isoformat()
        assert re.fullmatch(r"\d{4}-\d{2}-\d{2}T[\d:.]+", now), "잘못된 시각 형식"
        with engine.begin() as conn:
            conn.execute(
                text(
                    f"ALTER TABLE todos ADD COLUMN created_at VARCHAR(32) NOT NULL DEFAULT '{now}'"
                )
            )

    existing_indexes = {index["name"] for index in inspector.get_indexes("todos")}
    if "ix_todos_title" not in existing_indexes:
        with engine.begin() as conn:
            conn.execute(text("CREATE INDEX ix_todos_title ON todos (title)"))


migrate_db()


# ---------------------------------------------------------------------------
# Pydantic 스키마 — API 요청/응답 데이터 검증
# ---------------------------------------------------------------------------
def _validate_calendar_date(value: str) -> str:
    """정규식 형식 통과 후에도 2026-02-30처럼 존재하지 않는 날짜는 막는다"""
    try:
        date.fromisoformat(value)
    except ValueError:
        raise ValueError("존재하지 않는 날짜입니다.")
    return value


DateStr = Annotated[
    str,
    Field(pattern=r"^\d{4}-\d{2}-\d{2}$"),
    AfterValidator(_validate_calendar_date),
]


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, examples=["React 공부하기"])
    completed: bool = False
    date: DateStr = Field(
        default_factory=lambda: date.today().isoformat(),
        examples=["2026-06-23"],
    )


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    completed: bool | None = None
    date: DateStr | None = None
    version: int | None = Field(
        default=None, description="낙관적 잠금용 — 클라이언트가 알고 있던 버전"
    )


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    completed: bool
    date: str
    version: int
    created_at: str


# ---------------------------------------------------------------------------
# FastAPI 앱
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Todo API",
    description="Next.js Todo App을 위한 FastAPI 백엔드",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # 인증은 쿠키가 아니라 X-API-Key 헤더로 하므로 credentials를 허용할 필요가 없다
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-API-Key", "Idempotency-Key"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """요청마다 요청ID·메서드·경로·상태코드·처리시간을 로그로 남긴다"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} {response.status_code} {duration_ms:.1f}ms"
    )
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """처리되지 않은 예외는 서버 로그에만 스택트레이스를 남기고, 클라이언트에는 내부 정보를 노출하지 않는다"""
    request_id = getattr(request.state, "request_id", "-")
    logger.exception(f"[{request_id}] Unhandled error on {request.method} {request.url.path}")
    return JSONResponse(status_code=500, content={"detail": "서버 내부 오류가 발생했습니다."})


def get_db() -> Generator[Session, None, None]:
    """요청마다 DB 세션을 열고, 처리 후 반드시 닫는다."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_api_key(x_api_key: str = Header(...)) -> None:
    """/todos* 라우트 보호용 — 공유 비밀키 검증 (타이밍 공격 방지를 위해 constant-time 비교 사용)"""
    if not secrets.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status_code=401, detail="인증에 실패했습니다.")


def get_todo_or_404(todo_id: int, db: Session) -> Todo:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")
    return todo


# ---------------------------------------------------------------------------
# 멱등키 캐시 — 더블클릭/네트워크 재시도로 인한 중복 생성을 막는다.
# 인메모리이므로 프로세스 재시작 시 초기화된다 (SQLite와 동일하게 단일 인스턴스 가정).
# ---------------------------------------------------------------------------
_IDEMPOTENCY_TTL_SECONDS = 5 * 60
_idempotency_cache: dict[str, tuple[float, int]] = {}


def _cleanup_expired_idempotency_keys() -> None:
    now = time.time()
    expired = [
        key
        for key, (created_at, _) in _idempotency_cache.items()
        if now - created_at > _IDEMPOTENCY_TTL_SECONDS
    ]
    for key in expired:
        del _idempotency_cache[key]


@app.get("/")
def read_root():
    return {"message": "Todo API 서버가 정상 동작 중입니다."}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/todos", response_model=list[TodoResponse])
def get_todos(
    filter: Literal["active", "completed"] | None = Query(default=None),
    search: str | None = Query(default=None),
    date: DateStr | None = Query(default=None),
    from_date: DateStr | None = Query(default=None),
    to_date: DateStr | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key),
):
    """Todo 목록 조회 — 서버에서 날짜·필터·검색·페이지네이션 처리"""
    stmt = select(Todo)

    if date:
        stmt = stmt.where(Todo.date == date)
    else:
        if from_date:
            stmt = stmt.where(Todo.date >= from_date)
        if to_date:
            stmt = stmt.where(Todo.date <= to_date)

    if filter == "active":
        stmt = stmt.where(Todo.completed.is_(False))
    elif filter == "completed":
        stmt = stmt.where(Todo.completed.is_(True))

    if search:
        stmt = stmt.where(Todo.title.ilike(f"%{search}%"))

    stmt = stmt.order_by(Todo.id).limit(limit).offset(offset)
    todos = db.scalars(stmt).all()
    return todos


@app.post("/todos", response_model=TodoResponse, status_code=201)
def create_todo(
    todo_data: TodoCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    """새 Todo 생성 — 같은 Idempotency-Key로 재요청하면 새로 만들지 않고 기존 결과를 반환한다"""
    _cleanup_expired_idempotency_keys()

    if idempotency_key is not None:
        cached = _idempotency_cache.get(idempotency_key)
        if cached is not None:
            _, existing_todo_id = cached
            existing_todo = db.get(Todo, existing_todo_id)
            if existing_todo is not None:
                return existing_todo

    todo = Todo(
        title=todo_data.title,
        completed=todo_data.completed,
        date=todo_data.date,
        created_at=datetime.now().isoformat(),
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)

    if idempotency_key is not None:
        _idempotency_cache[idempotency_key] = (time.time(), todo.id)

    return todo


@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db), _: None = Depends(verify_api_key)):
    """단일 Todo 조회"""
    return get_todo_or_404(todo_id, db)


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key),
):
    """기존 Todo 수정 — version이 함께 오면 낙관적 잠금으로 동시 수정을 감지한다"""
    todo = get_todo_or_404(todo_id, db)

    if todo_data.version is not None and todo_data.version != todo.version:
        raise HTTPException(
            status_code=409,
            detail="다른 곳에서 이미 수정된 항목입니다. 새로고침 후 다시 시도해 주세요.",
        )

    update_data = todo_data.model_dump(exclude_unset=True, exclude={"version"})
    if not update_data:
        raise HTTPException(status_code=400, detail="수정할 데이터가 없습니다.")

    for field, value in update_data.items():
        setattr(todo, field, value)
    todo.version += 1

    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(
    todo_id: int, db: Session = Depends(get_db), _: None = Depends(verify_api_key)
):
    """Todo 삭제"""
    todo = get_todo_or_404(todo_id, db)
    db.delete(todo)
    db.commit()
