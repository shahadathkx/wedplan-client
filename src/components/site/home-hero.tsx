"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowDown, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const checklist = [
  "Discover trusted local wedding professionals",
  "Keep your plans and bookings in one place",
  "Enjoy more of the moments that matter",
];

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#faf7f4]">
      <div className="absolute -right-36 -top-32 -z-10 size-[500px] rounded-full bg-rose-100/70 blur-3xl" />
      <div className="absolute -bottom-48 -left-36 -z-10 size-[480px] rounded-full bg-[#e6eee2]/80 blur-3xl" />
      <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-rose-800">
            <Sparkles className="size-3.5" />
            A little more joy in every detail
          </div>
          <h1 className="font-serif text-[3.55rem] leading-[1.05] tracking-[-0.045em] text-stone-900 sm:text-6xl lg:text-[4.5rem]">
            Your day.
            <br />
            Your people.
            <br />
            <span className="italic text-rose-800">Your story.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            Find the right people to bring your wedding to life, then keep the
            moving pieces together from the first idea to the final dance.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-14" asChild>
              <Link href="/services">
                Explore Wedding Services
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14"
              asChild
            >
              <Link href="/#how-it-works">See how it works</Link>
            </Button>
          </div>
          <ul className="mt-9 space-y-2.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-stone-600">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#e6eee2] text-[#42634a]">
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <div className="relative aspect-[4/4.5] overflow-hidden rounded-[48%_48%_24px_24px] bg-[#ead5cb]">
            <Image
              src="/wedding-hero.svg"
              alt="Illustration of a couple beneath a flower-covered wedding arch"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 40vw"
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="absolute -left-2 top-[18%] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-stone-900/10 backdrop-blur sm:-left-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Your planning, simplified
            </p>
            <p className="mt-1 font-serif text-lg text-stone-900">
              All the details, together.
            </p>
          </div>
          <div className="absolute -bottom-5 right-2 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl shadow-stone-900/10 sm:-right-8">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#e6eee2] text-[#42634a]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-900">Made for your day</p>
              <p className="text-xs text-stone-500">A calmer way to plan</p>
            </div>
          </div>
        </motion.div>
      </div>
      <a
        href="#how-it-works"
        className="mx-auto mb-7 hidden w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 transition hover:text-rose-800 md:flex"
      >
        Discover WedPlan
        <ArrowDown className="size-3.5" />
      </a>
    </section>
  );
}
