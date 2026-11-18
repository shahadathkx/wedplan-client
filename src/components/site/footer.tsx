import Link from "next/link";
import {
  Heart,
  Mail,
  MapPin,
  Phone,
  Camera,
  UsersRound,
} from "lucide-react";

const footerLinks = [
  { label: "Explore WedPlan", href: "/#how-it-works" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Create an account", href: "/sign-up" },
  { label: "Sign in", href: "/sign-in" },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#f7f2ee]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16 md:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-rose-100 text-rose-800">
              <Heart className="size-5 fill-rose-800" strokeWidth={1.6} />
            </span>
            <span className="font-serif text-2xl font-semibold text-stone-900">
              WedPlan
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
            Your wedding, your way. Find trusted local vendors and keep every
            meaningful detail in one beautiful place.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialLink label="Instagram" href="https://instagram.com">
              <Camera className="size-4" />
            </SocialLink>
            <SocialLink label="Facebook" href="https://facebook.com">
              <UsersRound className="size-4" />
            </SocialLink>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-stone-900">Explore</h2>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-stone-600 transition hover:text-rose-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-stone-900">Say hello</h2>
          <ul className="mt-4 space-y-4 text-sm text-stone-600">
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-rose-700" />
              <a href="mailto:hello@wedplan.com" className="hover:text-rose-800">
                hello@wedplan.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-rose-700" />
              <a href="tel:+15550148200" className="hover:text-rose-800">
                +1 (555) 014-8200
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-rose-700" />
              <span>Here for your big day, wherever you are</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200/80">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-stone-500 sm:px-8">
          © 2026 WedPlan. Made for your forever.
        </p>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
    >
      {children}
    </a>
  );
}
