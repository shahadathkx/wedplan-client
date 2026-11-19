"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  Crown,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { DashboardRole } from "@/lib/dashboard-auth";

type DashboardLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

const navigation: Record<DashboardRole, DashboardLink[]> = {
  vendor: [
    { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard, exact: true },
    { label: "My Services", href: "/vendor/dashboard/services", icon: BriefcaseBusiness, exact: true },
    { label: "Add Service", href: "/vendor/dashboard/services/new", icon: Plus, exact: true },
    { label: "Booking Requests", href: "/vendor/dashboard/bookings", icon: CalendarDays, exact: true },
    { label: "Subscription", href: "/vendor/dashboard/subscription", icon: Crown, exact: true },
    { label: "Profile Settings", href: "/vendor/dashboard/profile", icon: Settings, exact: true },
  ],
  customer: [
    { label: "Overview", href: "/customer/dashboard", icon: LayoutDashboard, exact: true },
    { label: "My Bookings", href: "/customer/dashboard/bookings", icon: CalendarDays, exact: true },
    { label: "Browse Services", href: "/services", icon: Search },
    { label: "Profile Settings", href: "/customer/dashboard/profile", icon: Settings, exact: true },
  ],
  admin: [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Manage Users", href: "/admin/dashboard/users", icon: Users, exact: true },
    { label: "Manage Services", href: "/admin/dashboard/services", icon: BriefcaseBusiness, exact: true },
    { label: "Transactions", href: "/admin/dashboard/transactions", icon: CreditCard, exact: true },
  ],
};

type DashboardShellProps = {
  role: DashboardRole;
  userName: string;
  children: React.ReactNode;
};

export function DashboardShell({
  role,
  userName,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[65vh] flex-1 bg-[#f8f5f2]">
      <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-64 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <DashboardNavigation
          role={role}
          userName={userName}
          pathname={pathname}
        />
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-[76px] z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-rose-50"
          >
            <Menu className="size-4" />
            Dashboard menu
          </button>
          <span className="truncate pl-3 text-xs font-medium text-stone-500">
            {userName}
          </span>
        </div>
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-7 sm:py-10">
          {children}
        </main>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            className="absolute inset-0 bg-stone-950/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-stone-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close dashboard menu"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
            >
              <X className="size-5" />
            </button>
            <DashboardNavigation
              role={role}
              userName={userName}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

function DashboardNavigation({
  role,
  userName,
  pathname,
  onNavigate,
}: {
  role: DashboardRole;
  userName: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-b border-stone-100 px-5 py-6">
        <Link href="/" className="font-serif text-xl font-semibold text-stone-900">
          WedPlan
        </Link>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">
          {role} workspace
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5" aria-label={`${role} dashboard`}>
        {navigation[role].map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-rose-50 text-rose-900"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <Icon className={`size-4 ${isActive ? "text-rose-800" : "text-stone-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#faf7f4] p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-800">
            {userName.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-800">{userName}</p>
            <p className="text-xs capitalize text-stone-500">{role} account</p>
          </div>
        </div>
      </div>
    </>
  );
}
