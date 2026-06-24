"use client";

import { useCreateTodoForm } from "@/hooks/useCreateTodoForm";
import { getTodayKey } from "@/lib/dateUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

export default function TodoCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date") ?? getTodayKey();
  const { title, setTitle, completed, setCompleted, error, isSubmitting, submit } =
    useCreateTodoForm({
      onSuccess: () => {
        const query = searchParams.toString();
        router.push(query ? `/todos?${query}` : "/todos");
      },
    });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(selectedDate);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-[#672be0] focus:ring-2 focus:ring-[#672be0]/20"
          placeholder="할 일을 입력하세요"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={completed}
          onChange={(event) => setCompleted(event.target.checked)}
        />
        완료로 생성
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#672be0] px-4 py-2 text-white transition hover:bg-[#5a24c4] disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : "생성하기"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/todos")}
          className="rounded-lg border border-zinc-300 px-4 py-2 transition hover:bg-zinc-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}
