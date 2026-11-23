"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Search, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  adminApiFetch,
  normalizeAdminUsers,
  type AdminUser,
} from "@/lib/admin-api";

export function AdminUsers() {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [details, setDetails] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (
    signal?: AbortSignal,
    searchValue = "",
    roleValue = "all",
  ) => {
    const params = new URLSearchParams({ limit: "100" });
    if (searchValue.trim()) params.set("q", searchValue.trim());
    if (roleValue !== "all") params.set("role", roleValue);
    const response = await adminApiFetch(`/api/admin/users?${params}`, { signal });
    return normalizeAdminUsers(await response.json());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void load(controller.signal, search, role)
      .then((result) => {
        if (!controller.signal.aborted) setUsers(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          const message =
            cause instanceof Error ? cause.message : "Unable to load users.";
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }, 250);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [load, search, role]);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await load(undefined, search, role));
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unable to load users.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(user: AdminUser) {
    if (
      user.id === session?.user.id &&
      !user.isBlocked
    ) {
      toast.error("You cannot block your own admin account.");
      return;
    }
    if (
      !window.confirm(
        user.isBlocked
          ? `Unblock "${user.name}"?`
          : `Block "${user.name}"? They will lose access to protected features.`,
      )
    ) {
      return;
    }
    setBusyId(user.id);
    setError(null);
    try {
      await adminApiFetch(`/api/admin/users/${encodeURIComponent(user.id)}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      const updated = { ...user, isBlocked: !user.isBlocked };
      setUsers((current) => current?.map((item) => item.id === user.id ? updated : item) ?? null);
      if (details?.id === user.id) setDetails(updated);
      toast.success(updated.isBlocked ? "User blocked." : "User unblocked.");
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Could not update this user.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">User administration</p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">Manage users</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Search accounts, review details, and control access across the platform.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search users</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(event) => {
            setSearch(event.target.value);
            setLoading(true);
            setError(null);
          }} placeholder="Search name or email..." className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
        </label>
        <select value={role} onChange={(event) => {
          setRole(event.target.value);
          setLoading(true);
          setError(null);
        }} className="h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          <p>{error}</p>
          <button type="button" onClick={() => void retry()} className="inline-flex items-center gap-2 font-semibold"><RefreshCw className="size-4" />Try again</button>
        </div>
      )}

      {loading ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 border-b border-stone-100 last:border-0 animate-pulse bg-stone-50/40" />)}
        </div>
      ) : users?.length ? (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-stone-200 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setDetails(user)} className="flex items-center gap-3 text-left">
                      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-100 text-sm font-bold text-rose-800">
                        {user.image ? <Image src={user.image} alt="" fill unoptimized sizes="40px" className="object-cover" /> : user.name.charAt(0).toUpperCase()}
                      </span>
                      <span><span className="block font-semibold text-stone-800">{user.name}</span><span className="block text-xs text-stone-500">{user.email}</span></span>
                    </button>
                  </td>
                  <td className="px-5 py-4 capitalize text-stone-600">{user.role}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.isBlocked ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{user.isBlocked ? "Blocked" : "Active"}</span></td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" disabled={busyId === user.id || (user.id === session?.user.id && !user.isBlocked)} onClick={() => void toggleBlock(user)} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-stone-200 px-3 font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60">
                      {busyId === user.id ? <LoaderCircle className="size-4 animate-spin" /> : <Shield className="size-4" />}
                      {user.isBlocked ? "Unblock" : user.id === session?.user.id ? "You" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="mt-6 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-stone-900">No matching users</h2>
          <p className="mt-2 text-sm text-stone-600">Try changing your search or role filter.</p>
        </section>
      )}

      {details && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && setDetails(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={() => setDetails(null)} aria-label="Close user details" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"><X className="size-5" /></button>
            <h2 id="user-details-title" className="pr-10 font-serif text-3xl text-stone-900">{details.name}</h2>
            <dl className="mt-6 space-y-4 border-t border-stone-100 pt-5 text-sm">
              <div><dt className="text-xs font-bold uppercase text-stone-400">Email</dt><dd className="mt-1 text-stone-700">{details.email}</dd></div>
              <div><dt className="text-xs font-bold uppercase text-stone-400">Role</dt><dd className="mt-1 capitalize text-stone-700">{details.role}</dd></div>
              {details.businessName && <div><dt className="text-xs font-bold uppercase text-stone-400">Business</dt><dd className="mt-1 text-stone-700">{details.businessName}</dd></div>}
              {details.role === "vendor" && <div><dt className="text-xs font-bold uppercase text-stone-400">Plan</dt><dd className="mt-1 capitalize text-stone-700">{details.subscriptionPlan}</dd></div>}
              <div><dt className="text-xs font-bold uppercase text-stone-400">Status</dt><dd className="mt-1 text-stone-700">{details.isBlocked ? "Blocked" : "Active"}</dd></div>
              {details.createdAt && <div><dt className="text-xs font-bold uppercase text-stone-400">Joined</dt><dd className="mt-1 text-stone-700">{formatDate(details.createdAt)}</dd></div>}
            </dl>
            <button
              type="button"
              disabled={
                busyId === details.id ||
                (details.id === session?.user.id && !details.isBlocked)
              }
              onClick={() => void toggleBlock(details)}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busyId === details.id ? <LoaderCircle className="size-4 animate-spin" /> : <Shield className="size-4" />}
              {details.isBlocked ? "Unblock user" : "Block user"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}
