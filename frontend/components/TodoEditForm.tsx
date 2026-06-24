"use client";

import { updateTodo } from "@/app/actions";
import { ApiError } from "@/lib/errors";
import type { Todo } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface TodoEditFormProps {
  todo: Todo;
}

export default function TodoEditForm({ todo }: TodoEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(todo.title);
  const [completed, setCompleted] = useState(todo.completed);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateTodo(todo.id, { title, completed, version: todo.version });
      router.push("/todos");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Todo 수정에 실패했습니다. FastAPI 서버를 확인해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={completed}
          onChange={(event) => setCompleted(event.target.checked)}
        />
        완료
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#672be0] px-4 py-2 text-white transition hover:bg-[#5a24c4] disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : "수정하기"}
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
