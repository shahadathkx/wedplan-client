import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/roles";

export const instant = false;

export default async function DashboardRedirect() {
  await connection();
  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    console.error("[auth] Unable to resolve dashboard redirect", error);
    redirect("/sign-in?callbackURL=%2Fdashboard");
  }
  if (!session) {
    redirect("/sign-in?callbackURL=%2Fdashboard");
  }
  if (session.user.isBlocked) {
    redirect("/sign-in?blocked=1");
  }
  redirect(dashboardPath(session.user.role));
}
