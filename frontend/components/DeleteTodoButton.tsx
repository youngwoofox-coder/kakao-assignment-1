"use client";

import { deleteTodo } from "@/app/actions";
import { useToast } from "@/components/ToastProvider";
import { ApiError } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteTodoButtonProps {
  todoId: number;
  /** 삭제 확인 단계로 들어가거나 빠져나갈 때 호출 — 부모가 옆 버튼들을 숨기는 데 사용 */
  onConfirmingChange?: (isConfirming: boolean) => void;
}

export default function DeleteTodoButton({
  todoId,
  onConfirmingChange,
}: DeleteTodoButtonProps) {
  const router = useRouter();
  const showToast = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function updateConfirming(next: boolean) {
    setIsConfirming(next);
    onConfirmingChange?.(next);
  }

  async function handleConfirmedDelete() {
    setIsDeleting(true);

    try {
      await deleteTodo(todoId);
      router.refresh();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "삭제에 실패했습니다.", "error");
    } finally {
      setIsDeleting(false);
      updateConfirming(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-zinc-600">정말 삭제할까요?</span>
        <button
          type="button"
          onClick={handleConfirmedDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-600 px-2.5 py-1 text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "삭제 중..." : "확정"}
        </button>
        <button
          type="button"
          onClick={() => updateConfirming(false)}
          disabled={isDeleting}
          className="rounded-lg border border-zinc-300 px-2.5 py-1 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => updateConfirming(true)}
      className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 transition hover:bg-red-50"
    >
      삭제
    </button>
  );
}
