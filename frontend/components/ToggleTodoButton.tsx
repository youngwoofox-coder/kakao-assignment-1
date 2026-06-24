"use client";

import { toggleTodo } from "@/app/actions";
import { useToast } from "@/components/ToastProvider";
import { ApiError } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ToggleTodoButtonProps {
  todoId: number;
  completed: boolean;
  version: number;
}

export default function ToggleTodoButton({
  todoId,
  completed,
  version,
}: ToggleTodoButtonProps) {
  const router = useRouter();
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);

    try {
      await toggleTodo(todoId, completed, version);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message, "error");
        if (err.status === 409) {
          router.refresh();
        }
      } else {
        showToast("상태 변경에 실패했습니다.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`rounded-lg px-3 py-1 text-sm transition disabled:opacity-50 ${
        completed
          ? "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          : "border border-[#672be0]/20 bg-[#f3edff] text-[#672be0] hover:bg-[#e8dcff]"
      }`}
    >
      {isLoading ? "..." : completed ? "취소" : "완료"}
    </button>
  );
}
