import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardAuthError } from "@/components/dashboard/dashboard-auth-error";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { getServerSession } from "@/lib/dashboard-auth";
import { getDashboardPath } from "@/lib/roles";

export const instant = false;

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardRedirect />
    </Suspense>
  );
}

async function DashboardRedirect() {
  const result = await getServerSession();
  if (result.status === "error") {
    return (
      <DashboardAuthError
        message={
          process.env.NODE_ENV === "development" &&
          result.error instanceof Error
            ? result.error.message
            : "We couldn't verify your sign-in. Please try again."
        }
      />
    );
  }

  const session = result.session;
  if (!session) {
    redirect("/sign-in?callbackURL=%2Fdashboard");
  }
  if (session.user.isBlocked) {
    redirect("/sign-in?blocked=1");
  }
  redirect(getDashboardPath(session.user.role));
}
