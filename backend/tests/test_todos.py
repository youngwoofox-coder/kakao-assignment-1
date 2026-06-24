from datetime import date


def create_todo(client, auth_headers, **overrides):
    payload = {"title": "테스트 할 일", "date": "2026-06-24"}
    payload.update(overrides)
    return client.post("/todos", json=payload, headers=auth_headers)


# ---------------------------------------------------------------------------
# 인증
# ---------------------------------------------------------------------------
def test_get_todos_without_api_key_returns_422(client):
    response = client.get("/todos")
    assert response.status_code == 422


def test_get_todos_with_wrong_api_key_returns_401(client):
    response = client.get("/todos", headers={"X-API-Key": "wrong"})
    assert response.status_code == 401


def test_get_todos_with_correct_api_key_returns_200(client, auth_headers):
    response = client.get("/todos", headers=auth_headers)
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# 생성
# ---------------------------------------------------------------------------
def test_create_todo_success(client, auth_headers):
    response = create_todo(client, auth_headers, title="React 공부하기")
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "React 공부하기"
    assert body["completed"] is False
    assert body["version"] == 0


def test_create_todo_empty_title_returns_422(client, auth_headers):
    response = create_todo(client, auth_headers, title="")
    assert response.status_code == 422


def test_create_todo_title_too_long_returns_422(client, auth_headers):
    response = create_todo(client, auth_headers, title="a" * 256)
    assert response.status_code == 422


def test_create_todo_invalid_date_format_returns_422(client, auth_headers):
    response = create_todo(client, auth_headers, date="2026/06/24")
    assert response.status_code == 422


def test_create_todo_nonexistent_calendar_date_returns_422(client, auth_headers):
    response = create_todo(client, auth_headers, date="2026-02-30")
    assert response.status_code == 422


def test_create_todo_includes_created_at(client, auth_headers):
    response = create_todo(client, auth_headers)
    assert response.status_code == 201
    assert response.json()["created_at"]


def test_create_todo_without_date_defaults_to_today(client, auth_headers):
    response = client.post(
        "/todos", json={"title": "날짜 없이 생성"}, headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["date"] == date.today().isoformat()


# ---------------------------------------------------------------------------
# 멱등키 (중복 생성 방지)
# ---------------------------------------------------------------------------
def test_create_todo_with_same_idempotency_key_returns_same_todo(client, auth_headers):
    headers = {**auth_headers, "Idempotency-Key": "test-key-1"}

    first = client.post(
        "/todos", json={"title": "중복 방지", "date": "2026-06-24"}, headers=headers
    )
    second = client.post(
        "/todos", json={"title": "중복 방지", "date": "2026-06-24"}, headers=headers
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] == second.json()["id"]

    list_response = client.get(
        "/todos", params={"search": "중복 방지"}, headers=auth_headers
    )
    assert len(list_response.json()) == 1


def test_create_todo_with_different_idempotency_keys_creates_separate_todos(
    client, auth_headers
):
    first = client.post(
        "/todos",
        json={"title": "별개 생성", "date": "2026-06-24"},
        headers={**auth_headers, "Idempotency-Key": "key-a"},
    )
    second = client.post(
        "/todos",
        json={"title": "별개 생성", "date": "2026-06-24"},
        headers={**auth_headers, "Idempotency-Key": "key-b"},
    )

    assert first.json()["id"] != second.json()["id"]


# ---------------------------------------------------------------------------
# 단일 조회
# ---------------------------------------------------------------------------
def test_get_todo_by_id_success(client, auth_headers):
    created = create_todo(client, auth_headers).json()
    response = client.get(f"/todos/{created['id']}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_todo_not_found_returns_404(client, auth_headers):
    response = client.get("/todos/999999", headers=auth_headers)
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# 목록 필터링
# ---------------------------------------------------------------------------
def test_filter_active_excludes_completed(client, auth_headers):
    create_todo(client, auth_headers, title="진행중", completed=False)
    create_todo(client, auth_headers, title="완료됨", completed=True)

    response = client.get("/todos", params={"filter": "active"}, headers=auth_headers)
    titles = [todo["title"] for todo in response.json()]
    assert "진행중" in titles
    assert "완료됨" not in titles


def test_filter_completed_excludes_active(client, auth_headers):
    create_todo(client, auth_headers, title="진행중", completed=False)
    create_todo(client, auth_headers, title="완료됨", completed=True)

    response = client.get(
        "/todos", params={"filter": "completed"}, headers=auth_headers
    )
    titles = [todo["title"] for todo in response.json()]
    assert "완료됨" in titles
    assert "진행중" not in titles


def test_search_filters_by_title_substring(client, auth_headers):
    create_todo(client, auth_headers, title="React 공부하기")
    create_todo(client, auth_headers, title="장보기")

    response = client.get("/todos", params={"search": "React"}, headers=auth_headers)
    titles = [todo["title"] for todo in response.json()]
    assert titles == ["React 공부하기"]


def test_date_filter_returns_only_matching_date(client, auth_headers):
    create_todo(client, auth_headers, title="6월 24일", date="2026-06-24")
    create_todo(client, auth_headers, title="6월 25일", date="2026-06-25")

    response = client.get("/todos", params={"date": "2026-06-24"}, headers=auth_headers)
    titles = [todo["title"] for todo in response.json()]
    assert titles == ["6월 24일"]


def test_get_todos_with_nonexistent_calendar_date_returns_422(client, auth_headers):
    response = client.get("/todos", params={"date": "2026-13-01"}, headers=auth_headers)
    assert response.status_code == 422


def test_date_range_filter(client, auth_headers):
    create_todo(client, auth_headers, title="6월 1일", date="2026-06-01")
    create_todo(client, auth_headers, title="6월 15일", date="2026-06-15")
    create_todo(client, auth_headers, title="7월 1일", date="2026-07-01")

    response = client.get(
        "/todos",
        params={"from_date": "2026-06-01", "to_date": "2026-06-30"},
        headers=auth_headers,
    )
    titles = {todo["title"] for todo in response.json()}
    assert titles == {"6월 1일", "6월 15일"}


# ---------------------------------------------------------------------------
# 페이지네이션
# ---------------------------------------------------------------------------
def test_list_defaults_to_limit_50(client, auth_headers):
    for i in range(60):
        create_todo(client, auth_headers, title=f"todo-{i}")

    response = client.get("/todos", headers=auth_headers)
    assert len(response.json()) == 50


def test_list_respects_limit_and_offset(client, auth_headers):
    for i in range(10):
        create_todo(client, auth_headers, title=f"todo-{i}")

    first_page = client.get(
        "/todos", params={"limit": 3, "offset": 0}, headers=auth_headers
    ).json()
    second_page = client.get(
        "/todos", params={"limit": 3, "offset": 3}, headers=auth_headers
    ).json()

    assert len(first_page) == 3
    assert len(second_page) == 3
    assert {todo["id"] for todo in first_page}.isdisjoint(
        {todo["id"] for todo in second_page}
    )


def test_list_rejects_limit_over_200(client, auth_headers):
    response = client.get("/todos", params={"limit": 201}, headers=auth_headers)
    assert response.status_code == 422


def test_list_rejects_negative_offset(client, auth_headers):
    response = client.get("/todos", params={"offset": -1}, headers=auth_headers)
    assert response.status_code == 422


def test_title_column_has_index():
    import main
    from sqlalchemy import inspect

    indexed_columns = {
        column
        for index in inspect(main.engine).get_indexes("todos")
        for column in index["column_names"]
    }
    assert "title" in indexed_columns


# ---------------------------------------------------------------------------
# 수정 (낙관적 잠금 포함)
# ---------------------------------------------------------------------------
def test_update_todo_success_increments_version(client, auth_headers):
    created = create_todo(client, auth_headers).json()

    response = client.put(
        f"/todos/{created['id']}",
        json={"completed": True, "version": created["version"]},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["completed"] is True
    assert body["version"] == created["version"] + 1


def test_update_todo_with_stale_version_returns_409(client, auth_headers):
    created = create_todo(client, auth_headers).json()

    client.put(
        f"/todos/{created['id']}",
        json={"completed": True, "version": created["version"]},
        headers=auth_headers,
    )

    stale_response = client.put(
        f"/todos/{created['id']}",
        json={"completed": False, "version": created["version"]},
        headers=auth_headers,
    )
    assert stale_response.status_code == 409


def test_update_todo_with_no_fields_returns_400(client, auth_headers):
    created = create_todo(client, auth_headers).json()

    response = client.put(f"/todos/{created['id']}", json={}, headers=auth_headers)
    assert response.status_code == 400


def test_update_todo_not_found_returns_404(client, auth_headers):
    response = client.put(
        "/todos/999999", json={"completed": True}, headers=auth_headers
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# 삭제
# ---------------------------------------------------------------------------
def test_delete_todo_success(client, auth_headers):
    created = create_todo(client, auth_headers).json()

    delete_response = client.delete(f"/todos/{created['id']}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/todos/{created['id']}", headers=auth_headers)
    assert get_response.status_code == 404


def test_delete_todo_not_found_returns_404(client, auth_headers):
    response = client.delete("/todos/999999", headers=auth_headers)
    assert response.status_code == 404
