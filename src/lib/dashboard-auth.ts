import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";

export type DashboardRole = "customer" | "vendor" | "admin";

type DashboardUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>["user"];

export type DashboardAuthResult =
  | { status: "ready"; user: DashboardUser }
  | { status: "error"; message: string };

export async function requireDashboardUser(role: DashboardRole) {
  await connection();

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
  } catch (error) {
    console.error(`[auth] Unable to load session for ${role} dashboard`, {
      role,
      error,
    });
    return {
      status: "error",
      message:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "We couldn't verify your sign-in. Please try again.",
    } satisfies DashboardAuthResult;
  }

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
