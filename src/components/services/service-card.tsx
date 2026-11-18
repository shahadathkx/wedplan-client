"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { WeddingService } from "@/lib/services";
import { formatServicePrice, serviceDetailsHref } from "@/lib/services";

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

export function ServiceCard({
  service,
  isAuthenticated,
  index = 0,
}: ServiceCardProps) {
  const href = serviceDetailsHref(service.id, isAuthenticated);
  const image = service.images[0];

  return (
    <article className="group overflow-hidden rounded-[1.65rem] border border-stone-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(74,38,34,0.32)]">
      <Link href={href} className="block">
        <div
          className={`relative aspect-[1.45] overflow-hidden bg-gradient-to-br ${
            imageTones[index % imageTones.length]
          }`}
        >
          {image ? (
            <Image
              src={image}
              alt={service.serviceName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_30%,rgba(255,255,255,.75),transparent_58%)]" />
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
          <p className="shrink-0 text-right">
            <span className="block text-[10px] uppercase tracking-wide text-stone-400">
              Starting at
            </span>
            <span className="text-sm font-bold text-rose-800">
              {formatServicePrice(service.price)}
            </span>
          </p>
        </div>
        {service.vendor && (
          <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500">
            By{" "}
            <span className="font-semibold text-stone-700">
              {service.vendor.businessName || service.vendor.name}
            </span>
          </p>
        )}
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rose-800 transition group-hover:gap-2"
        >
          View details
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
