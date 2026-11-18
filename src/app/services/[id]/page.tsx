import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ServiceDetail } from "@/components/services/service-detail";
import { auth } from "@/lib/auth";
import { serviceDetailsPath } from "@/lib/services";

export const instant = false;

type ServicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ServicePageProps) {
  const { id } = await params;
  return { title: `Wedding service ${id}` };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
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
        role: session.user.role ?? "customer",
      }}
    />
  );
}
