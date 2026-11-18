"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/roles";

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/dashboard",
      });
      if (result.error) {
        throw new Error(result.error.message || "Sign-in failed.");
      }

      toast.success("You are signed in.");
      const callbackURL = searchParams.get("callbackURL");
      const safeCallback =
        callbackURL?.startsWith("/") && !callbackURL.startsWith("//")
          ? callbackURL
          : dashboardPath(result.data?.user.role);
      router.push(safeCallback);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to pick up right where your wedding plans left off."
      footerText="New to WedPlan?"
      footerLink="Create an account"
      footerHref="/sign-up"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {searchParams.get("blocked") === "1" && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            This account is currently blocked. Please contact support for help.
          </p>
        )}
        <div>
          <label htmlFor="signin-email" className="text-sm font-semibold text-stone-700">
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="signin-password" className="text-sm font-semibold text-stone-700">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className={fieldClassName}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <LoaderCircle className="size-4 animate-spin" />}
          {isLoading ? "Signing you in..." : "Sign in"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        OR
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <GoogleButton />
    </AuthCard>
  );
}
