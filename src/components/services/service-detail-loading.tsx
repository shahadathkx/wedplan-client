export function ServiceDetailLoading() {
  return (
    <main className="flex-1 bg-[#faf7f4] px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-stone-200" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-stone-200" />
          <div className="h-24 animate-pulse rounded bg-stone-100" />
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-stone-100" />
      </div>
    </main>
  );
}
