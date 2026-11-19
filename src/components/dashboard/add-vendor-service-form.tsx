"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { weddingCategories } from "@/lib/categories";
import { vendorApiFetch } from "@/lib/vendor-api";

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.set("image", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as { url?: unknown; message?: unknown };
  if (!response.ok || typeof result.url !== "string") {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "One of your images could not be uploaded.",
    );
  }
  return result.url;
}

export function AddVendorServiceForm() {
  const router = useRouter();
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<string>(weddingCategories[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [limitError, setLimitError] = useState(false);

  function chooseImages(files: FileList | null) {
    const selected = Array.from(files ?? []);
    const invalid = selected.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      toast.error(
        `${invalid.name}: choose a JPG, PNG, or WebP image up to 5 MB.`,
      );
      return;
    }
    setImages((current) => [
      ...current,
      ...selected,
    ]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLimitError(false);
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error("Enter a valid service price.");
      return;
    }
    if (!serviceName.trim() || !location.trim() || description.trim().length < 10) {
      toast.error("Complete the required service details before submitting.");
      return;
    }

    setIsSaving(true);
    try {
      const imageUrls = await Promise.all(images.map(uploadImage));
      await vendorApiFetch("/api/vendor/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: serviceName.trim(),
          category,
          description: description.trim(),
          price: numericPrice,
          location: location.trim(),
          images: imageUrls,
        }),
      });
      toast.success("Your service has been submitted for review.");
      router.push("/vendor/dashboard/services");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create your service.";
      setLimitError(/free|limit|three|3 available/i.test(message));
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
        Grow your business
      </p>
      <h1 className="mt-3 font-serif text-4xl text-stone-900 sm:text-5xl">
        Add a service
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
        Share the details couples need to imagine working with you.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-3xl space-y-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
      >
        {limitError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="alert">
            <p>Your free plan allows up to 3 available services. Upgrade to Premium to list more.</p>
            <Link
              href="/vendor/dashboard/subscription"
              className="mt-2 inline-flex font-bold text-rose-800 underline underline-offset-2"
            >
              Compare plans
            </Link>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-stone-700 sm:col-span-2">
            Service name
            <input
              required
              maxLength={100}
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="e.g. Garden wedding photography"
              className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </label>
          <label className="block text-sm font-semibold text-stone-700">
            Category
            <select
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            >
              {weddingCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-stone-700">
            Price
            <div className="mt-2 flex h-12 items-center rounded-xl border border-stone-200 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
              <span className="pl-4 text-stone-500">$</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                className="h-full w-full rounded-xl px-2 pr-4 font-normal outline-none"
              />
            </div>
          </label>
          <label className="block text-sm font-semibold text-stone-700 sm:col-span-2">
            Location
            <input
              required
              maxLength={120}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, region, or service area"
              className="mt-2 h-12 w-full rounded-xl border border-stone-200 px-4 font-normal outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </label>
          <label className="block text-sm font-semibold text-stone-700 sm:col-span-2">
            Description
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell couples what makes your service special..."
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 font-normal leading-6 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700">
            Service photos <span className="font-normal text-stone-500">(optional)</span>
            <span className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 text-center transition hover:border-rose-300 hover:bg-rose-50/40">
              <UploadCloud className="size-6 text-rose-800" />
              <span className="mt-2 text-sm font-semibold">Choose JPG, PNG, or WebP photos</span>
              <span className="mt-1 text-xs font-normal text-stone-500">Each image must be 5 MB or less</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  chooseImages(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
                className="sr-only"
              />
            </span>
          </label>
          {images.length > 0 && (
            <ul className="mt-3 space-y-2">
              {images.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate text-stone-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="shrink-0 text-xs font-semibold text-rose-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/vendor/dashboard/services"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-800 px-6 text-sm font-semibold text-white hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <LoaderCircle className="size-4 animate-spin" />}
            {isSaving ? "Saving service..." : "Submit service"}
          </button>
        </div>
      </form>
    </div>
  );
}
