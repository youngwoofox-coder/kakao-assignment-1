"use server";

import { getBackendApiKey, getBackendUrl } from "@/lib/config";
import { ApiError } from "@/lib/errors";
import type { Todo, TodoCreateInput, TodoListParams, TodoUpdateInput } from "@/lib/types";
import { revalidatePath } from "next/cache";

/** FastAPI 인증 헤더 — 모든 요청에 공통으로 붙인다 */
function authHeaders(): Record<string, string> {
  return { "X-API-Key": getBackendApiKey() };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // FastAPI는 직접 던진 HTTPException의 detail은 문자열로 주지만,
    // Pydantic 검증 실패(422)의 detail은 객체 배열이라 그대로 노출하면 안 된다.
    const detail = typeof body?.detail === "string" ? body.detail : null;
    throw new ApiError(response.status, detail ?? `API 요청 실패: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildTodosUrl(params?: TodoListParams): string {
  const searchParams = new URLSearchParams();

  if (params?.date) {
    searchParams.set("date", params.date);
  } else {
    if (params?.fromDate) {
      searchParams.set("from_date", params.fromDate);
    }
    if (params?.toDate) {
      searchParams.set("to_date", params.toDate);
    }
  }

  if (params?.filter && params.filter !== "all") {
    searchParams.set("filter", params.filter);
  }

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  return query
    ? `${getBackendUrl()}/todos?${query}`
    : `${getBackendUrl()}/todos`;
}

/** Server Component에서 Todo 목록 조회 */
export async function getTodos(params?: TodoListParams): Promise<Todo[]> {
  const response = await fetch(buildTodosUrl(params), {
    cache: "no-store",
    headers: authHeaders(),
  });
  return handleResponse<Todo[]>(response);
}

/** Server Component에서 단일 Todo 조회 */
export async function getTodoById(id: number): Promise<Todo | null> {
  const response = await fetch(`${getBackendUrl()}/todos/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  return handleResponse<Todo>(response);
}

/** Client Component에서 Todo 생성 — idempotencyKey를 주면 같은 키로 재요청 시 중복 생성을 막는다 */
export async function createTodo(
  data: TodoCreateInput,
  idempotencyKey?: string,
): Promise<Todo> {
  const response = await fetch(`${getBackendUrl()}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(data),
  });

  const todo = await handleResponse<Todo>(response);
  revalidatePath("/todos");
  return todo;
}

/** Client Component에서 Todo 완료 토글 */
export async function toggleTodo(
  id: number,
  completed: boolean,
  version: number,
): Promise<Todo> {
  return updateTodo(id, { completed: !completed, version });
}

/** Client Component에서 Todo 수정 */
export async function updateTodo(
  id: number,
  data: TodoUpdateInput,
): Promise<Todo> {
  const response = await fetch(`${getBackendUrl()}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });

  const todo = await handleResponse<Todo>(response);
  revalidatePath("/todos");
  revalidatePath(`/todos/${id}`);
  return todo;
}

/** Client Component에서 Todo 삭제 */
export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${getBackendUrl()}/todos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  await handleResponse<void>(response);
  revalidatePath("/todos");
}
