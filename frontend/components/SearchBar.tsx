"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    setKeyword(searchParams.get("search") ?? "");
  }, [searchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const trimmed = keyword.trim();

    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    router.push(query ? `/todos?${query}` : "/todos");
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    setKeyword("");

    const query = params.toString();
    router.push(query ? `/todos?${query}` : "/todos");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="제목으로 검색..."
        className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#672be0] focus:ring-2 focus:ring-[#672be0]/20"
      />
      <button
        type="submit"
        className="rounded-lg bg-[#672be0] px-4 py-2 text-sm text-white transition hover:bg-[#5a24c4]"
      >
        검색
      </button>
      {searchParams.get("search") && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm transition hover:bg-zinc-50"
        >
          초기화
        </button>
      )}
    </form>
  );
}
