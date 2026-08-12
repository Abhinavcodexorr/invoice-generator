"use client";

import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/hooks/useAuth";

export function SitePage({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const { user, signOut } = useAuth();

  return (
    <div className="page-shell flex min-h-screen flex-col text-[var(--foreground)]">
      <AppHeader userEmail={user?.email} onSignOut={signOut} />
      <main
        className={`mx-auto w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
