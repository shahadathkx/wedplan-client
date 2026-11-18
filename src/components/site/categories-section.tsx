"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Camera,
  Flower2,
  Shirt,
  Sparkles,
  Utensils,
} from "lucide-react";
import { motion } from "motion/react";
import { weddingCategories } from "@/lib/categories";

const categoryIcons = [
  Camera,
  Building2,
  Flower2,
  Utensils,
  Sparkles,
  Shirt,
];

export function CategoriesSection() {
  return (
    <section className="bg-[#faf7f4] px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
            Start with what you love
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
            Find your kind of wonderful
          </h2>
          <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base">
            Browse the details that make a celebration unmistakably yours.
          </p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weddingCategories.map((category, index) => {
            const Icon = categoryIcons[index];
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="group flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 transition hover:border-rose-200 hover:bg-rose-50/60 hover:shadow-md hover:shadow-rose-900/5"
                >
                  <span className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7f2ee] text-rose-800 transition group-hover:bg-rose-100">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-semibold text-stone-800">{category}</span>
                  </span>
                  <span className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-rose-700">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
