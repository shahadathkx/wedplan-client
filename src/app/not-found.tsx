import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#faf7f4] px-5 py-20">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-800">
          <Heart className="size-6 fill-rose-800" />
        </span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          404 · Page not found
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
          This page took a different turn.
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          The page may have moved, but your wedding plans are still right where
          you left them.
        </p>
        <Button className="mt-7" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to WedPlan
          </Link>
        </Button>
      </div>
    </main>
  );
}
