export function ServiceCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[1.65rem] border border-stone-200/80 bg-white"
    >
      <div className="aspect-[1.45] animate-pulse bg-stone-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-stone-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-stone-100" />
      </div>
    </div>
  );
}
