"use client";

import { createTodo } from "@/app/actions";
import { ApiError } from "@/lib/errors";
import type { Todo } from "@/lib/types";
import { useState } from "react";

interface UseCreateTodoFormOptions {
  initialCompleted?: boolean;
  onSuccess?: (todo: Todo) => void;
}

/** TodoInput, TodoCreateForm이 공유하는 생성 폼 로직 — 멱등키로 중복 생성도 함께 막는다 */
export function useCreateTodoForm({
  initialCompleted = false,
  onSuccess,
}: UseCreateTodoFormOptions = {}) {
  const [title, setTitle] = useState("");
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  async function submit(selectedDate: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("할 일 내용을 입력해 주세요.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const todo = await createTodo(
        { title: trimmed, completed, date: selectedDate },
        idempotencyKey,
      );
      setTitle("");
      setCompleted(initialCompleted);
      setIdempotencyKey(crypto.randomUUID());
      onSuccess?.(todo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Todo 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    title,
    setTitle,
    completed,
    setCompleted,
    error,
    setError,
    isSubmitting,
    submit,
  };
}
