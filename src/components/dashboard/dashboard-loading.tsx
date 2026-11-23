export function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-stone-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-stone-100 bg-white"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-stone-100 bg-white" />
    </div>
  );
}
