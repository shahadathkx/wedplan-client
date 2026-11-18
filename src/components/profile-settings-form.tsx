"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function ProfileSettingsForm() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiFetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (name ?? session?.user.name ?? "").trim(),
          businessName: (businessName ?? session?.user.businessName ?? "").trim(),
        }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message || "Profile update failed.");
      }
      toast.success("Your profile has been updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="flex-1 bg-[#faf7f4] px-5 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Account
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Profile settings
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Keep your details current. Changes are saved to your WedPlan account.
        </p>
        {isPending ? (
          <div className="mt-8 space-y-4" aria-label="Loading profile">
            <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold text-stone-700">
              Full name
              <input
                required
                value={name ?? session?.user.name ?? ""}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            {session?.user.role === "vendor" && (
              <label className="block text-sm font-semibold text-stone-700">
                Business name
                <input
                  value={businessName ?? session?.user.businessName ?? ""}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-stone-700">
              Email address
              <input
                value={session?.user.email ?? ""}
                readOnly
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 font-normal text-stone-500"
              />
            </label>
            <Button type="submit" disabled={isSaving || !session}>
              {isSaving && <LoaderCircle className="size-4 animate-spin" />}
              {isSaving ? "Saving changes..." : "Save changes"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
