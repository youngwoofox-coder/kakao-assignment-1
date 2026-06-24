import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubEnv("BACKEND_URL", "http://test-backend");
  vi.stubEnv("BACKEND_API_KEY", "test-key");
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getTodos", () => {
  it("인증 헤더와 쿼리스트링을 올바르게 구성한다", async () => {
    const { getTodos } = await import("./actions");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, []));

    await getTodos({ filter: "active", search: "공부", date: "2026-06-24" });

    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(
      "http://test-backend/todos?date=2026-06-24&filter=active&search=%EA%B3%B5%EB%B6%80",
    );
    expect((options?.headers as Record<string, string>)["X-API-Key"]).toBe("test-key");
  });

  it("limit/offset을 쿼리스트링에 포함한다", async () => {
    const { getTodos } = await import("./actions");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, []));

    await getTodos({ limit: 20, offset: 40 });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("http://test-backend/todos?limit=20&offset=40");
  });

  it("문자열 detail은 ApiError 메시지로 그대로 노출한다", async () => {
    const { getTodos } = await import("./actions");
    const { ApiError } = await import("@/lib/errors");
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(401, { detail: "인증에 실패했습니다." }),
    );

    await expect(getTodos()).rejects.toMatchObject(
      new ApiError(401, "인증에 실패했습니다."),
    );
  });

  it("배열 형태의 422 detail은 일반 메시지로 폴백한다 (회귀 테스트)", async () => {
    const { getTodos } = await import("./actions");
    const { ApiError } = await import("@/lib/errors");
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(422, {
        detail: [{ type: "string_too_short", loc: ["body", "title"], msg: "too short" }],
      }),
    );

    await expect(getTodos()).rejects.toMatchObject(
      new ApiError(422, "API 요청 실패: 422"),
    );
  });
});

describe("getTodoById", () => {
  it("404이면 null을 반환한다", async () => {
    const { getTodoById } = await import("./actions");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(404, { detail: "없음" }));

    await expect(getTodoById(999)).resolves.toBeNull();
  });
});

describe("createTodo / updateTodo / deleteTodo", () => {
  it("createTodo는 성공 시 revalidatePath를 호출한다", async () => {
    const { createTodo } = await import("./actions");
    const { revalidatePath } = await import("next/cache");
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(201, { id: 1, title: "a", completed: false, date: "2026-06-24", version: 0 }),
    );

    await createTodo({ title: "a", date: "2026-06-24" }, "idem-key-1");

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>)["Idempotency-Key"]).toBe(
      "idem-key-1",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
  });

  it("deleteTodo는 204 응답을 본문 파싱 없이 처리하고 revalidatePath를 호출한다", async () => {
    const { deleteTodo } = await import("./actions");
    const { revalidatePath } = await import("next/cache");
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(deleteTodo(1)).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/todos");
  });

  it("toggleTodo는 completed를 반전시켜 updateTodo에 위임한다", async () => {
    const { toggleTodo } = await import("./actions");
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(200, { id: 1, title: "a", completed: true, date: "2026-06-24", version: 1 }),
    );

    await toggleTodo(1, false, 0);

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options?.body as string);
    expect(body).toEqual({ completed: true, version: 0 });
  });
});
