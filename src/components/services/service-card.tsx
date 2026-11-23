"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Crown, ImageOff, MapPin } from "lucide-react";
import type { WeddingService } from "@/lib/services";
import { serviceDetailsHref } from "@/lib/services";
import { Button } from "@/components/ui/button";

type ServiceCardProps = {
  service: WeddingService;
  isAuthenticated: boolean;
  index?: number;
};

const imageTones = [
  "from-[#f1ddd4] via-[#dfc4b8] to-[#a88073]",
  "from-[#e6ecdf] via-[#c8d3c0] to-[#81927e]",
  "from-[#eee7da] via-[#d9c8ac] to-[#ad8f68]",
  "from-[#f3e2e4] via-[#ddbfc4] to-[#b47d89]",
];

const imageHosts = new Set([
  "images.unsplash.com",
  "i.ibb.co",
  "ibb.co",
  "lh3.googleusercontent.com",
]);

function isSupportedImage(source: string | null | undefined) {
  if (!source) {
    return false;
  }
  try {
    const url = new URL(source);
    return url.protocol === "https:" && imageHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export function ServiceCard({
  service,
  isAuthenticated,
  index = 0,
}: ServiceCardProps) {
  const href = serviceDetailsHref(service.id, isAuthenticated);
  const image = service.images[0];
  const vendorImage = service.vendor?.image;
  const [imageFailed, setImageFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const vendorName =
    service.vendor?.businessName || service.vendor?.name || "Wedding professional";
  const showImage = isSupportedImage(image) && !imageFailed;
  const showAvatar = isSupportedImage(vendorImage) && !avatarFailed;
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(service.price);

  return (
    <article className="group overflow-hidden rounded-[1.65rem] border border-stone-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(74,38,34,0.32)]">
      <Link href={href} className="block">
        <div
          className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${
            imageTones[index % imageTones.length]
          }`}
        >
          {showImage ? (
            <Image
              src={image ?? ""}
              alt={service.serviceName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_55%_30%,rgba(255,255,255,.75),transparent_58%)]">
              <ImageOff className="size-10 text-stone-500/60" />
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-stone-700 backdrop-blur">
            {service.category}
          </span>
          <span className="absolute bottom-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition group-hover:bg-rose-700 group-hover:text-white">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 font-serif text-xl text-stone-900">
              {service.serviceName}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
              <MapPin className="size-3.5 shrink-0 text-rose-700" />
              <span className="truncate">{service.location}</span>
            </p>
          </div>
          <p className="shrink-0 text-right text-sm font-bold text-rose-800">
            From {price}
          </p>
        </div>
        <div className="mt-4 flex min-w-0 items-center gap-2.5 border-t border-stone-100 pt-3">
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-50 text-xs font-bold text-rose-800">
            {showAvatar ? (
              <Image
                src={vendorImage ?? ""}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              vendorName.charAt(0).toUpperCase()
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-stone-700">
            {vendorName}
          </span>
          {service.vendor?.subscriptionPlan === "premium" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
              <Crown className="size-3" />
              Premium
            </span>
          )}
        </div>
        <Button asChild className="mt-4 w-full">
          <Link href={href}>
            View Details
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
