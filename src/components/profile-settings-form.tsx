"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, RefreshCw, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function ProfileSettingsForm({ embedded = false }: { embedded?: boolean }) {
  const { data: session, isPending } = authClient.useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(
    () => () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview],
  );

  function chooseImage(file: File | null) {
    if (!file) {
      setImageFile(null);
      setImagePreview("");
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
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = (name ?? session?.user.name ?? "").trim();
    if (!nextName) {
      toast.error("Enter your name.");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      let image = session?.user.image ?? undefined;
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

      const nextBusinessName = (
        businessName ??
        session?.user.businessName ??
        ""
      ).trim();
      const response = await apiFetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          ...(image ? { image } : {}),
          ...(session?.user.role === "vendor"
            ? { businessName: nextBusinessName }
            : {}),
        }),
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
      setImageFile(null);
      setImagePreview("");
      toast.success("Your profile has been updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profile update failed.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  const Wrapper = embedded ? "div" : "main";

  return (
    <Wrapper className={embedded ? "" : "flex-1 bg-[#faf7f4] px-5 py-12 sm:px-8 sm:py-16"}>
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
          Account
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Profile settings
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Keep your name and profile photo current. Changes are saved to your
          WedPlan account.
        </p>
        {isPending ? (
          <div className="mt-8 space-y-4" aria-label="Loading profile">
            <div className="size-20 animate-pulse rounded-full bg-stone-100" />
            <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
          </div>
        ) : !session ? (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <p>
              Your account details could not be loaded. Please sign in again
              and retry.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center gap-2 font-semibold"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            {saveError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
              >
                <p>{saveError}</p>
                <button
                  type="button"
                  onClick={() => formRef.current?.requestSubmit()}
                  className="mt-3 inline-flex items-center gap-2 font-semibold"
                >
                  <RefreshCw className="size-4" />
                  Try again
                </button>
              </div>
            )}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative size-20 overflow-hidden rounded-full border-4 border-white bg-stone-100 shadow-sm">
                {imagePreview || session.user.image ? (
                  <Image
                    src={imagePreview || session.user.image || ""}
                    alt=""
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center font-serif text-2xl text-rose-800">
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
                  onChange={(event) =>
                    chooseImage(event.currentTarget.files?.[0] ?? null)
                  }
                  className="sr-only"
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-stone-700">
              Full name
              <input
                required
                maxLength={100}
                value={name ?? session?.user.name ?? ""}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            {session?.user.role === "vendor" && (
              <label className="block text-sm font-semibold text-stone-700">
                Business name
                <input
                  value={businessName ?? session.user.businessName ?? ""}
                  onChange={(event) => setBusinessName(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-stone-700">
              Email address
              <input
                value={session?.user.email ?? ""}
                readOnly
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 font-normal text-stone-500"
              />
            </label>
            <Button type="submit" disabled={isSaving || !session}>
              {isSaving && <LoaderCircle className="size-4 animate-spin" />}
              {isSaving ? "Saving changes..." : "Save changes"}
            </Button>
          </form>
        )}
      </section>
    </Wrapper>
  );
}
