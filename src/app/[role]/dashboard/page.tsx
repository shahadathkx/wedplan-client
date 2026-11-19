import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const instant = false;

type RoleDashboardProps = {
  params: Promise<{ role: string }>;
};

const roleTitles: Record<string, string> = {
  customer: "Your wedding workspace",
  vendor: "Your business workspace",
  admin: "Admin workspace",
};

export async function generateMetadata({
  params,
}: RoleDashboardProps): Promise<Metadata> {
  const { role } = await params;
  return { title: roleTitles[role] ?? "Dashboard" };
}

export default async function RoleDashboard({ params }: RoleDashboardProps) {
  const { role } = await params;
  if (role !== "admin") {
    notFound();
  }

  const user = await requireDashboardUser(role);

  return (
    <DashboardShell role={role} userName={user.name}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          {role} dashboard
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
          {roleTitles[role]}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
          Welcome back, {user.name}. Your WedPlan tools and activity will
          be right here as you get started.
        </p>
        <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-8">
          <h2 className="font-serif text-2xl text-stone-900">
            A lovely place to begin
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
            Your account is ready. Browse the site to discover wedding
            professionals and keep your planning moving at your own pace.
          </p>
          <Link
            href="/#how-it-works"
            className="mt-5 inline-flex rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Explore WedPlan
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
