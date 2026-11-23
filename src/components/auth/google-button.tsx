"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { getDashboardPath } from "@/lib/roles";

export function GoogleButton({
  role,
  callbackURL = "/dashboard",
}: {
  role?: "customer" | "vendor";
  callbackURL?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        additionalData: role ? { role } : undefined,
      });
      if (result.error) {
        throw new Error(result.error.message || "Google sign-in failed.");
      }
      if (result.data?.url) {
        window.location.assign(result.data.url);
        return;
      }
      const sessionResult = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      const rolePath = getDashboardPath(sessionResult.data?.user.role);
      const isDashboardCallback =
        callbackURL === "/dashboard" ||
        /^\/(admin|vendor|customer)(\/|$)/.test(callbackURL);
      router.push(
        rolePath === "/"
          ? "/"
          : isDashboardCallback
            ? rolePath
            : callbackURL,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isLoading}
      onClick={signInWithGoogle}
    >
      <GoogleMark />
      {isLoading ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}

export function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.75 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.15a11 11 0 0 0 0 9.9l3.69-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.03 14.97 1 12 1a11 11 0 0 0-9.85 6.05l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}
