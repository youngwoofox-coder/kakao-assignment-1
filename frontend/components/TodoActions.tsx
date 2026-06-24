"use client";

import DeleteTodoButton from "@/components/DeleteTodoButton";
import ToggleTodoButton from "@/components/ToggleTodoButton";
import Link from "next/link";
import { useState } from "react";

interface TodoActionsProps {
  todoId: number;
  completed: boolean;
  version: number;
}

/** 삭제 확인 중에는 완료/수정 버튼을 숨겨 한 줄에 버튼이 난잡하게 몰리지 않게 한다 */
export default function TodoActions({ todoId, completed, version }: TodoActionsProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {!isConfirmingDelete && (
        <>
          <ToggleTodoButton todoId={todoId} completed={completed} version={version} />
          <Link
            href={`/todos/${todoId}`}
            className="rounded-lg border border-zinc-300 px-3 py-1 text-sm transition hover:bg-zinc-50"
          >
            수정
          </Link>
        </>
      )}
      <DeleteTodoButton todoId={todoId} onConfirmingChange={setIsConfirmingDelete} />
    </div>
  );
}
