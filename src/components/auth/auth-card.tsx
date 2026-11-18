import Link from "next/link";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerHref: string;
};

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLink,
  footerHref,
}: AuthCardProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#faf7f4] px-4 py-14 sm:py-20">
      <section className="w-full max-w-[500px] rounded-[2rem] border border-stone-200/80 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(74,38,34,0.28)] sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-rose-700">
            Welcome to WedPlan
          </p>
          <h1 className="font-serif text-4xl tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500">
            {description}
          </p>
        </div>
        {children}
        <p className="mt-7 text-center text-sm text-stone-500">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-semibold text-rose-800 underline-offset-4 hover:underline"
          >
            {footerLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
