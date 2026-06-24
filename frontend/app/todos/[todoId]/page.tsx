import { getTodoById } from "@/app/actions";
import TodoEditForm from "@/components/TodoEditForm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TodoDetailPageProps {
  params: Promise<{ todoId: string }>;
}

export default async function TodoDetailPage({ params }: TodoDetailPageProps) {
  const { todoId } = await params;

  if (!/^\d+$/.test(todoId)) {
    notFound();
  }

  const todo = await getTodoById(Number(todoId));

  if (!todo) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#672be0]">Todo 수정</h1>
        <Link
          href="/todos"
          className="text-sm text-zinc-600 transition hover:text-[#672be0]"
        >
          ← 목록으로
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 p-6">
        <TodoEditForm todo={todo} />
      </div>
    </main>
  );
}
