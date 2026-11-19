import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/roles";

export type DashboardRole = "customer" | "vendor" | "admin";

export async function requireDashboardUser(role: DashboardRole) {
  const session = await auth.api.getSession({ headers: await headers() });
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
