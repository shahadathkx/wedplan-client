"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/roles";

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const imagePreviewUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.current) {
        URL.revokeObjectURL(imagePreviewUrl.current);
      }
    };
  }, []);

  function selectImage(file: File | null) {
    if (imagePreviewUrl.current) {
      URL.revokeObjectURL(imagePreviewUrl.current);
    }
    imagePreviewUrl.current = file ? URL.createObjectURL(file) : null;
    setImage(file);
    setImagePreview(imagePreviewUrl.current ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(password)) {
      toast.error(
        "Use at least 6 characters, including an uppercase and a lowercase letter.",
      );
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl: string | undefined;
      if (image) {
        const uploadForm = new FormData();
        uploadForm.set("image", image);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });
        const uploadResult = (await uploadResponse.json()) as {
          url?: string;
          message?: string;
        };
        if (!uploadResponse.ok || !uploadResult.url) {
          throw new Error(uploadResult.message || "Image upload failed.");
        }
        imageUrl = uploadResult.url;
      }

      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: imageUrl,
        role,
        callbackURL: "/dashboard",
      });
      if (result.error) {
        throw new Error(result.error.message || "Account creation failed.");
      }

      toast.success("Your account is ready. Welcome to WedPlan!");
      router.push(dashboardPath(result.data?.user.role));
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Account creation failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title="Plan something beautiful"
      description="Create your free account and bring every wedding detail together."
      footerText="Already have an account?"
      footerLink="Sign in"
      footerHref="/sign-in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-name" className="text-sm font-semibold text-stone-700">
            Full name
          </label>
          <input
            id="signup-name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="text-sm font-semibold text-stone-700">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="text-sm font-semibold text-stone-700">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
            title="At least 6 characters, with an uppercase and lowercase letter."
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className={fieldClassName}
          />
          <p className="mt-2 text-xs text-stone-400">
            Include at least one uppercase and one lowercase letter.
          </p>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-stone-700">
            I am joining as a
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["customer", "vendor"] as const).map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  role === value
                    ? "border-rose-400 bg-rose-50 text-rose-900"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="accent-rose-700"
                />
                <span className="font-medium capitalize">{value}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="signup-image" className="text-sm font-semibold text-stone-700">
            Profile photo <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <div className="mt-2 flex items-center gap-3">
            <label
              htmlFor="signup-image"
              className="flex h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-stone-300 px-4 text-sm text-stone-500 hover:border-rose-400 hover:bg-rose-50/50"
            >
              {imagePreview ? (
                <span
                  aria-label="Selected profile photo preview"
                  className="size-8 shrink-0 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${imagePreview}")` }}
                />
              ) : (
                <ImagePlus className="size-4 shrink-0" />
              )}
              <span className="truncate">
                {image ? image.name : "Choose a JPG, PNG, or WebP"}
              </span>
            </label>
            <input
              id="signup-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => selectImage(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <LoaderCircle className="size-4 animate-spin" />}
          {isLoading ? "Creating your account..." : "Create account"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        OR
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <GoogleButton role={role} />
    </AuthCard>
  );
}
