import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, connectAuthDatabase } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";

export type DashboardRole = "customer" | "vendor" | "admin";

type DashboardUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>["user"];

export type DashboardAuthResult =
  | { status: "ready"; user: DashboardUser }
  | { status: "error"; message: string };

type SessionLookup =
  | {
      status: "ready";
      session: Awaited<ReturnType<typeof auth.api.getSession>>;
    }
  | { status: "error"; error: unknown };

export const getServerSession = cache(async () => {
  await connection();
  const requestHeaders = await headers();
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await connectAuthDatabase();
      return {
        status: "ready",
        session: await auth.api.getSession({ headers: requestHeaders }),
      } satisfies SessionLookup;
    } catch (error) {
      lastError = error;
      console.error("[auth] Server session read failed", {
        attempt,
        databaseName: process.env.DB_NAME || process.env.MONGODB_DB || "wedplan",
        error,
      });
    }
  }

  return { status: "error", error: lastError } satisfies SessionLookup;
});

export async function requireDashboardUser(role: DashboardRole) {
  const sessionResult = await getServerSession();
  if (sessionResult.status === "error") {
    return {
      status: "error",
      message:
        process.env.NODE_ENV === "development" &&
        sessionResult.error instanceof Error
          ? sessionResult.error.message
          : "We couldn't verify your sign-in. Please try again.",
    } satisfies DashboardAuthResult;
  }

  const session = sessionResult.session;
  if (!session) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(getDashboardPath(role))}`);
  }
  if (session.user.isBlocked) {
    redirect("/sign-in?blocked=1");
  }
  if (session.user.role !== role) {
    redirect(getDashboardPath(session.user.role));
  }
  return { status: "ready", user: session.user } satisfies DashboardAuthResult;
}
