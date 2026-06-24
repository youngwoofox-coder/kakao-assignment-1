import { getTodos } from "@/app/actions";
import DateNavigation from "@/components/DateNavigation";
import FilterTabs from "@/components/FilterTabs";
import SearchBar from "@/components/SearchBar";
import TodoActions from "@/components/TodoActions";
import TodoInput from "@/components/TodoInput";
import {
  buildCountByDate,
  formatDateKey,
  getTodayKey,
  getWeekDates,
  parseDate,
} from "@/lib/dateUtils";
import type { TodoFilter } from "@/lib/types";
import { Suspense } from "react";

interface TodosPageProps {
  searchParams: Promise<{ filter?: string; search?: string; date?: string }>;
}

function getEmptyMessage(filter: TodoFilter): string {
  if (filter === "active") return "진행 중인 할 일이 없습니다.";
  if (filter === "completed") return "완료된 할 일이 없습니다.";
  return "이 날짜의 할 일이 없습니다.";
}

export default async function TodosPage({ searchParams }: TodosPageProps) {
  const params = await searchParams;
  const filter = (params.filter ?? "all") as TodoFilter;
  const search = params.search?.trim() ?? "";
  const selectedDate = params.date ?? getTodayKey();

  const weekDates = getWeekDates(parseDate(selectedDate));
  const fromDate = formatDateKey(weekDates[0]);
  const toDate = formatDateKey(weekDates[6]);

  const [todos, weekTodos] = await Promise.all([
    getTodos({
      date: selectedDate,
      filter,
      search: search || undefined,
    }),
    getTodos({ fromDate, toDate }),
  ]);

  const countByDate = buildCountByDate(weekTodos);

  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-4 py-10">
      <h1 className="text-[28px] font-bold tracking-tight text-[#672be0]">Todo</h1>

      <Suspense fallback={<div className="h-28 animate-pulse rounded-xl bg-zinc-100" />}>
        <DateNavigation countByDate={countByDate} />
      </Suspense>

      <Suspense fallback={<div className="h-16 animate-pulse rounded-xl bg-zinc-100" />}>
        <TodoInput />
      </Suspense>

      <Suspense fallback={<div className="h-10 animate-pulse rounded bg-zinc-100" />}>
        <FilterTabs />
      </Suspense>

      <Suspense fallback={<div className="h-10 animate-pulse rounded bg-zinc-100" />}>
        <SearchBar />
      </Suspense>

      {todos.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-zinc-500 shadow-[0_2px_8px_rgba(103,43,224,0.06)]">
          {search || filter !== "all"
            ? "조건에 맞는 Todo가 없습니다."
            : getEmptyMessage(filter)}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(103,43,224,0.06)] ${
                todo.completed ? "opacity-60" : ""
              }`}
            >
              <span
                className={
                  todo.completed
                    ? "text-zinc-400 line-through"
                    : "font-medium text-zinc-800"
                }
              >
                {todo.title}
              </span>

              <TodoActions
                todoId={todo.id}
                completed={todo.completed}
                version={todo.version}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
