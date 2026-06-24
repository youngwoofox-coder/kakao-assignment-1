"use client";

import Link from "next/link";
import { useEffect } from "react";

interface TodosErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TodosError({ error, reset }: TodosErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-10 text-center">
      <h1 className="text-xl font-bold text-red-600">오류가 발생했습니다</h1>
      <p className="text-sm text-zinc-600">
        Todo 데이터를 불러오지 못했습니다. FastAPI 서버가 실행 중인지 확인해
        주세요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#672be0] px-4 py-2 text-sm text-white transition hover:bg-[#5a24c4]"
        >
          다시 시도
        </button>
        <Link
          href="/todos"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm transition hover:bg-zinc-50"
        >
          목록으로
        </Link>
      </div>
    </main>
  );
}
