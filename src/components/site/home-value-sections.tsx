"use client";

import { CalendarCheck, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const reasons = [
  {
    icon: HeartHandshake,
    title: "Thoughtful connections",
    description:
      "Find a team of wedding professionals who listen, understand your vision, and care about the details.",
  },
  {
    icon: ShieldCheck,
    title: "A little more confidence",
    description:
      "Keep your service inquiries organized and make your next planning step feel clear.",
  },
  {
    icon: Sparkles,
    title: "Made for your celebration",
    description:
      "Explore a range of services to shape a day that feels personal, meaningful, and beautifully yours.",
  },
];

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Picture your day",
    description: "Start with the moments, style, and feelings you want to bring to life.",
  },
  {
    number: "02",
    icon: HeartHandshake,
    title: "Find your people",
    description: "Browse service categories and get to know the professionals behind them.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Make it happen",
    description: "Send a booking request and keep the conversation moving toward your day.",
  },
];

export function HomeValueSections() {
  return (
    <>
      <section id="why-wedplan" className="bg-white px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="max-w-xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
              A calmer way to celebrate
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
              Why couples choose WedPlan
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
              Planning a wedding is full of big feelings and little details.
              WedPlan helps you focus on what matters: finding the right people
              to make it yours.
            </p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-3">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.article
                  key={reason.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-3xl border border-stone-200/80 bg-[#fffdfa] p-5 sm:p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-800">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-stone-900">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {reason.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f7f2ee] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
              Three gentle steps
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base">
              A little structure for the big day ahead.
            </p>
          </div>
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.09 }}
                  className="relative rounded-3xl border border-stone-200/80 bg-white p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e6eee2] text-[#42634a]">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-serif text-2xl text-stone-300">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl text-stone-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {step.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
