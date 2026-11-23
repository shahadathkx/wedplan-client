"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function DashboardAuthError({ message }: { message: string }) {
  const router = useRouter();

  return (
    <main className="flex flex-1 items-center justify-center bg-[#faf7f4] px-5 py-16">
      <section
        role="alert"
        className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Session unavailable
        </p>
        <h1 className="mt-3 font-serif text-3xl text-stone-900">
          We couldn&apos;t verify your sign-in
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">{message}</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-800 px-5 text-sm font-semibold text-white hover:bg-rose-900"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      </section>
    </main>
  );
}
