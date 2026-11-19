"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

export function CustomerProfileSettings() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function chooseImage(file: File | null) {
    if (!file) {
      setImageFile(null);
      setPreview("");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG, or WebP profile image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Your profile image must be 5 MB or smaller.");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      toast.error("Your session could not be loaded.");
      return;
    }
    const nextName = (name ?? session.user.name).trim();
    if (!nextName) {
      toast.error("Enter your name.");
      return;
    }

    setIsSaving(true);
    try {
      let image = session.user.image ?? undefined;
      if (imageFile) {
        const formData = new FormData();
        formData.set("image", imageFile);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadResult = (await uploadResponse.json()) as {
          url?: unknown;
          message?: unknown;
        };
        if (!uploadResponse.ok || typeof uploadResult.url !== "string") {
          throw new Error(
            typeof uploadResult.message === "string"
              ? uploadResult.message
              : "Your profile image could not be uploaded.",
          );
        }
        image = uploadResult.url;
      }

      const response = await apiFetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName, image }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { message?: unknown };
        throw new Error(
          typeof result.message === "string"
            ? result.message
            : "Profile update failed.",
        );
      }
      await authClient.updateUser({
        name: nextName,
        ...(image ? { image } : {}),
      });
      toast.success("Your profile has been updated.");
      setPreview("");
      setImageFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Profile update failed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Account
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        Profile settings
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Keep your name and profile photo up to date.
      </p>

      {isPending ? (
        <div className="mt-8 max-w-2xl space-y-4 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8" aria-label="Loading profile">
          <div className="size-24 animate-pulse rounded-full bg-stone-100" />
          <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
        </div>
      ) : !session ? (
        <p role="alert" className="mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
          Your account details could not be loaded. Please sign in again.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative size-24 overflow-hidden rounded-full border-4 border-white bg-stone-100 shadow-md">
              {preview || session.user.image ? (
                <Image
                  src={preview || session.user.image || ""}
                  alt=""
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center font-serif text-3xl text-rose-800">
                  {(name ?? session.user.name).trim().charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              <UploadCloud className="size-4" />
              Change photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => chooseImage(event.currentTarget.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-stone-700">
            Full name
            <input
              required
              maxLength={100}
              value={name ?? session.user.name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </label>
          <label className="block text-sm font-semibold text-stone-700">
            Email address
            <input
              value={session.user.email}
              readOnly
              className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 font-normal text-stone-500"
            />
          </label>

          <div className="flex justify-end border-t border-stone-100 pt-5">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-800 px-6 text-sm font-semibold text-white hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <LoaderCircle className="size-4 animate-spin" />}
              {isSaving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
