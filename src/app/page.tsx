import Link from "next/link";
import {
  CalendarDays,
  Compass,
  HeartHandshake,
  MessageCircleHeart,
} from "lucide-react";
import { HomeHero } from "@/components/site/home-hero";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1">
      <HomeHero />
      <section id="how-it-works" className="bg-white px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
              A better kind of planning
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
              Less overwhelm, more <span className="italic">I do.</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-600">
              A thoughtful place to find your people, make your plans, and
              celebrate the little wins along the way.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Compass className="size-5" />}
              number="01"
              title="Find your people"
              description="Explore a curated community of wedding professionals who make your vision feel possible."
            />
            <FeatureCard
              icon={<CalendarDays className="size-5" />}
              number="02"
              title="Keep it together"
              description="Bring the important details and conversations into one calm, organized space."
            />
            <FeatureCard
              icon={<HeartHandshake className="size-5" />}
              number="03"
              title="Book with confidence"
              description="Connect directly with vendors and keep track of your requests as they come together."
            />
            <FeatureCard
              icon={<MessageCircleHeart className="size-5" />}
              number="04"
              title="Enjoy the journey"
              description="Spend less time juggling tabs and more time looking forward to your celebration."
            />
          </div>
        </div>
      </section>
      <section className="bg-[#f7f2ee] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-[2rem] bg-[#4d3936] px-7 py-10 text-white sm:px-12 sm:py-14 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200">
              Your next chapter starts here
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              Find a little more magic in wedding planning.
            </h2>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="shrink-0 border-white/40 bg-transparent text-white hover:bg-white hover:text-stone-900"
            asChild
          >
            <Link href="/sign-up">Join WedPlan</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  number,
  title,
  description,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-stone-200/80 bg-[#fffdfa] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5">
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-800">
          {icon}
        </span>
        <span className="font-serif text-lg text-stone-300">{number}</span>
      </div>
      <h3 className="mt-6 font-serif text-xl text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </article>
  );
}
