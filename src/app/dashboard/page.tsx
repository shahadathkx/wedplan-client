import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/roles";

export const instant = false;

export default async function DashboardRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  redirect(dashboardPath(session.user.role));
}
