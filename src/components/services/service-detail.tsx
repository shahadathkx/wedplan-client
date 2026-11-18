"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { BookingForm } from "@/components/services/booking-form";
import { Button } from "@/components/ui/button";
import {
  fetchServiceDetails,
  formatServicePrice,
  type WeddingService,
} from "@/lib/services";

type ServiceDetailProps = {
  serviceId: string;
  currentUser: {
    id: string;
    role: string;
  };
};

export function ServiceDetail({ serviceId, currentUser }: ServiceDetailProps) {
  const [service, setService] = useState<WeddingService | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchServiceDetails(serviceId, controller.signal)
      .then((loadedService) => {
        setService(loadedService);
        setActiveImage(0);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setError(
          cause instanceof Error ? cause.message : "This service could not be loaded.",
        );
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [serviceId, retry]);

  return (
    <main className="flex-1 bg-[#faf7f4] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/services"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-rose-800"
        >
          <ArrowLeft className="size-4" />
          Back to services
        </Link>

        {error ? (
          <div
            role="alert"
            className="mx-auto max-w-2xl rounded-[2rem] border border-rose-200 bg-white px-6 py-12 text-center shadow-sm"
          >
            <Sparkles className="mx-auto size-8 text-rose-700" />
            <h1 className="mt-4 font-serif text-3xl text-stone-900">
              This service isn&apos;t available
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">{error}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoading(true);
                  setError("");
                  setRetry((value) => value + 1);
                }}
              >
                <RefreshCw className="size-4" />
                Try again
              </Button>
              <Button asChild>
                <Link href="/services">Browse services</Link>
              </Button>
            </div>
          </div>
        ) : isLoading || !service ? (
          <ServiceDetailSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"
          >
            <div className="min-w-0">
              <ServiceGallery
                serviceName={service.serviceName}
                images={service.images}
                activeImage={activeImage}
                onSelectImage={setActiveImage}
              />
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-900">
                  {service.category}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-stone-500">
                  <MapPin className="size-4 text-rose-700" />
                  {service.location}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl">
                  {service.serviceName}
                </h1>
                <p className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                    Starting at
                  </span>
                  <span className="font-serif text-2xl text-rose-800">
                    {formatServicePrice(service.price)}
                  </span>
                </p>
              </div>
              <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
                <h2 className="font-serif text-2xl text-stone-900">
                  About this service
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-600">
                  {service.description || "Contact the vendor to learn more about this service."}
                </p>
              </section>
              <VendorInformation service={service} />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(74,38,34,0.38)] sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e6eee2] text-[#42634a]">
                    <CalendarDays className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl text-stone-900">
                      Start a conversation
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-stone-500">
                      Share your plans with the vendor.
                    </p>
                  </div>
                </div>
                <div className="my-6 h-px bg-stone-100" />
                <BookingForm
                  serviceId={service.id}
                  vendorId={service.vendorId}
                  userId={currentUser.id}
                  role={currentUser.role}
                />
                <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-stone-400">
                  <ShieldCheck className="size-3.5 text-[#6e8a70]" />
                  Your request is sent securely through WedPlan.
                </p>
              </section>
            </aside>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function ServiceGallery({
  serviceName,
  images,
  activeImage,
  onSelectImage,
}: {
  serviceName: string;
  images: string[];
  activeImage: number;
  onSelectImage: (index: number) => void;
}) {
  return (
    <div>
      <div className="relative aspect-[1.6] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#f1ddd4] via-[#dfc4b8] to-[#a88073]">
        {images.length ? (
          <Image
            src={images[activeImage]}
            alt={serviceName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 65vw"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_30%,rgba(255,255,255,.75),transparent_58%)]" />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelectImage(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeImage === index}
              className={`relative aspect-[1.4] overflow-hidden rounded-xl border-2 transition ${
                activeImage === index
                  ? "border-rose-700"
                  : "border-transparent opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="120px"
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VendorInformation({ service }: { service: WeddingService }) {
  const vendor = service.vendor;
  return (
    <section className="mt-5 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
        Meet the vendor
      </p>
      <div className="mt-4 flex items-center gap-4">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3e5df] font-serif text-xl text-rose-800">
          {vendor?.image ? (
            <Image
              src={vendor.image}
              alt=""
              fill
              sizes="56px"
              unoptimized
              className="object-cover"
            />
          ) : (
            (vendor?.businessName || vendor?.name || "W").charAt(0).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-serif text-xl text-stone-900">
            {vendor?.businessName || vendor?.name || "Wedding professional"}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {vendor?.name && vendor.businessName
              ? `Presented by ${vendor.name}`
              : "A WedPlan service provider"}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-stone-600">
        Connect directly with this vendor to discuss your event and the details
        that matter most.
      </p>
    </section>
  );
}

function ServiceDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div>
        <div className="aspect-[1.6] animate-pulse rounded-[1.75rem] bg-stone-200" />
        <div className="mt-7 h-8 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 h-48 animate-pulse rounded-3xl bg-white" />
      </div>
      <div className="h-[420px] animate-pulse rounded-[1.75rem] bg-white" />
    </div>
  );
}
