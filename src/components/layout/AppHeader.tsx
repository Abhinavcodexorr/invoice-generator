"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useThemeMode } from "@/components/theme/ThemeProvider";

interface AppHeaderProps {
  userEmail?: string | null;
  onSignOut?: () => void;
}

function NavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-xl px-2.5 py-1.5 font-medium transition-colors ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </Link>
  );
}

export function AppHeader({ userEmail, onSignOut }: AppHeaderProps) {
  const pathname = usePathname();
  const { mode, toggle } = useThemeMode();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/history", label: "History" },
    { href: "/pricing", label: "Pricing" },
    { href: "/guides", label: "Guides" },
    { href: "/help", label: "Help" },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_55%,transparent)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <BrandLogo size={36} />
          <span className="brand-mark font-display truncate text-[1.02rem] font-bold tracking-[-0.03em] sm:text-[1.12rem]">
            Invoice <span className="text-[var(--accent)]">Generator</span>
          </span>
        </Link>

        <nav className="desktop-nav ml-auto items-center gap-1 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={pathname.startsWith(link.href)}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={toggle}
            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
            aria-label="Toggle color mode"
          >
            {mode === "light" ? "Dark" : "Light"}
          </button>
          {userEmail ? (
            <>
              <span className="hidden max-w-[140px] truncate text-[var(--muted)] xl:inline">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-xl px-2.5 py-1.5 font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-xl px-2.5 py-1.5 font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Sign In
              </Link>
              <Link href="/auth/sign-up" className="btn btn-primary !px-3.5 !py-1.5 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="mobile-menu-btn ml-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div className="mobile-drawer border-t border-[var(--border)] px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={pathname.startsWith(link.href)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                toggle();
                setOpen(false);
              }}
              className="rounded-xl px-2.5 py-1.5 text-left text-[var(--muted)]"
            >
              {mode === "light" ? "Enable Dark Mode" : "Enable Light Mode"}
            </button>
            {userEmail ? (
              <button
                type="button"
                onClick={() => {
                  onSignOut?.();
                  setOpen(false);
                }}
                className="rounded-xl px-2.5 py-1.5 text-left"
              >
                Sign Out ({userEmail})
              </button>
            ) : (
              <>
                <NavLink href="/auth/sign-in" onClick={() => setOpen(false)}>
                  Sign In
                </NavLink>
                <NavLink href="/auth/sign-up" onClick={() => setOpen(false)}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
