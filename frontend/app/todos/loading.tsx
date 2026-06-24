export default function TodosLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="flex flex-col gap-3">
        <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
      </div>
      <p className="text-center text-sm text-zinc-500">Todo 목록을 불러오는 중...</p>
    </main>
  );
}
