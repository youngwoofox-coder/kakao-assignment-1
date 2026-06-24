import TodoCreateForm from "@/components/TodoCreateForm";
import Link from "next/link";

export default function NewTodoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#672be0]">새 Todo</h1>
        <Link
          href="/todos"
          className="text-sm text-zinc-600 transition hover:text-[#672be0]"
        >
          ← 목록으로
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 p-6">
        <TodoCreateForm />
      </div>
    </main>
  );
}
