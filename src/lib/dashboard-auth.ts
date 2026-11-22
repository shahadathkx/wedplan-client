import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/roles";

export type DashboardRole = "customer" | "vendor" | "admin";

export async function requireDashboardUser(role: DashboardRole) {
  await connection();

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    console.error(`[auth] Unable to load session for ${role} dashboard`, error);
    throw new Error("We couldn't verify your sign-in. Please try again.");
  }

  if (!session) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(dashboardPath(role))}`);
  }
  if (session.user.isBlocked) {
    redirect("/sign-in?blocked=1");
  }
  if (session.user.role !== role) {
    redirect(dashboardPath(session.user.role));
  }
  return session.user;
}
