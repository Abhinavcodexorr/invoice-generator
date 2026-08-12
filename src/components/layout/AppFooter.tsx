import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";

const productLinks = [
  { href: "/", label: "Invoice Generator" },
  { href: "/history", label: "Invoice History" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "PDF Download Help" },
];

const resourceLinks = [
  { href: "/guides", label: "Invoicing Guides" },
  { href: "/help", label: "Help" },
  { href: "/pricing", label: "Upgrade to Pro" },
  { href: "/auth/sign-in", label: "Sign In" },
  { href: "/auth/sign-up", label: "Sign Up" },
];

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto border-t border-white/10 bg-[linear-gradient(180deg,#171717_0%,#0a0a0a_100%)] text-white">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <h3 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white/55">
            Use Invoice Generator
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {productLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="text-white/85 transition-colors hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white/55">
            Resources
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {resourceLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="text-white/85 transition-colors hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="group inline-flex items-center gap-3">
            <BrandLogo size={40} variant="onDark" />
            <span className="font-display text-xl font-bold tracking-[-0.03em]">
              Invoice <span className="text-[var(--accent)]">Generator</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-white/60">
            Create a clean professional invoice, download a premium PDF, and keep
            history on this device or in the cloud when you sign in.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {year} Invoice Generator</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
