"use client";

import type { TodoFilter } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "completed", label: "완료" },
];

export default function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = (searchParams.get("filter") ?? "all") as TodoFilter;

  function handleFilterChange(filter: TodoFilter) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }

    const query = params.toString();
    router.push(query ? `/todos?${query}` : "/todos");
  }

  return (
    <div className="flex gap-2">
      {FILTERS.map((item) => {
        const isActive = currentFilter === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => handleFilterChange(item.value)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm transition ${
              isActive
                ? "bg-[#672be0] text-white"
                : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
