import Link from "next/link";
import { HomeHero } from "@/components/site/home-hero";
import { FeaturedServices } from "@/components/site/featured-services";
import { CategoriesSection } from "@/components/site/categories-section";
import { HomeValueSections } from "@/components/site/home-value-sections";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1">
      <HomeHero />
      <FeaturedServices />
      <CategoriesSection />
      <HomeValueSections />
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
