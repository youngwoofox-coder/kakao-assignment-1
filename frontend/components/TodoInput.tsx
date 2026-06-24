"use client";

import { useCreateTodoForm } from "@/hooks/useCreateTodoForm";
import { getTodayKey } from "@/lib/dateUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

export default function TodoInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date") ?? getTodayKey();
  const { title, setTitle, error, isSubmitting, submit } = useCreateTodoForm({
    onSuccess: () => router.refresh(),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(selectedDate);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 rounded-[14px] bg-white p-5 shadow-[0_2px_12px_rgba(103,43,224,0.08)]"
    >
      <div className="flex gap-2.5">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 rounded-lg border-[1.5px] border-zinc-300 px-3.5 py-2.5 text-[15px] outline-none transition focus:border-[#672be0]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg border-0 bg-[#672be0] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "추가 중..." : "추가"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
