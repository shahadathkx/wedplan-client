"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const publicLinks = [
  { label: "Why WedPlan", href: "/#how-it-works" },
  { label: "How it works", href: "/#how-it-works" },
];

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;

  async function handleSignOut() {
    const result = await authClient.signOut();
    if (result.error) {
      toast.error(result.error.message || "Could not sign out.");
      return;
    }
    toast.success("You have been signed out.");
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#fffdfa]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="WedPlan home"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-rose-100 text-rose-800">
            <Heart className="size-5 fill-rose-800" strokeWidth={1.6} />
          </span>
          <span className="font-serif text-[1.65rem] font-semibold tracking-tight text-stone-900">
            WedPlan
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {publicLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-stone-600 transition hover:text-rose-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <span className="h-10 w-28 animate-pulse rounded-full bg-stone-100" />
          ) : user ? (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-rose-200 [&::-webkit-details-marker]:hidden">
                <Avatar name={user.name} image={user.image} />
                <span className="max-w-28 truncate text-sm font-semibold text-stone-700">
                  {user.name}
                </span>
                <ChevronDown className="size-4 text-stone-400 transition group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.65rem)] w-60 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/10">
                <div className="border-b border-stone-100 px-3 py-3">
                  <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
                  <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
                <Link
                  href={`/${user.role ?? "customer"}/dashboard`}
                  className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile-settings"
                  className="block rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-900"
                >
                  Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-rose-800 hover:bg-rose-50"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3 py-2 text-sm font-semibold text-stone-700 hover:text-rose-800"
              >
                Sign in
              </Link>
              <Button asChild className="h-10 px-5">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-stone-200 text-stone-700 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-100 bg-[#fffdfa] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-stone-700 hover:bg-rose-50"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="my-2 flex items-center gap-3 border-y border-stone-100 py-3">
                  <Avatar name={user.name} image={user.image} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
                    <p className="truncate text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={`/${user.role ?? "customer"}/dashboard`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-stone-700 hover:bg-rose-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile-settings"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-stone-700 hover:bg-rose-50"
                >
                  Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-rose-800 hover:bg-rose-50"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Avatar({ name, image }: { name: string; image?: string | null }) {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 text-xs font-bold text-rose-800">
      {image ? (
        <Image src={image} alt="" fill sizes="32px" unoptimized />
      ) : (
        name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}
