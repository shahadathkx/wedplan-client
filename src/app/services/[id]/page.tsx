import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardAuthError } from "@/components/dashboard/dashboard-auth-error";
import { ServiceDetail } from "@/components/services/service-detail";
import { ServiceDetailLoading } from "@/components/services/service-detail-loading";
import { getServerSession } from "@/lib/dashboard-auth";
import { serviceDetailsPath } from "@/lib/services";

export const instant = false;

type ServicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ServicePageProps) {
  const { id } = await params;
  return { title: `Wedding service ${id}` };
}

export default function ServicePage(props: ServicePageProps) {
  return (
    <Suspense fallback={<ServiceDetailLoading />}>
      <ServicePageContent params={props.params} />
    </Suspense>
  );
}

async function ServicePageContent({ params }: ServicePageProps) {
  const { id } = await params;
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
  if (!session || session.user.isBlocked) {
    const signIn = new URLSearchParams({
      callbackURL: serviceDetailsPath(id),
    });
    if (session?.user.isBlocked) {
      signIn.set("blocked", "1");
    }
    redirect(`/sign-in?${signIn.toString()}`);
  }

  return (
    <ServiceDetail
      serviceId={id}
      currentUser={{
        id: session.user.id,
        role: session.user.role ?? "",
      }}
    />
  );
}
