"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/plans";
import { Spinner } from "@/components/ui/Spinner";

export function PricingCards() {
  const router = useRouter();
  const { user, plan, refreshSession } = useAuth();
  const [yearly, setYearly] = useState(true);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async (target: PlanId) => {
    setMessage(null);
    setError(null);

    if (target === "free") {
      router.push("/");
      return;
    }

    if (!user) {
      router.push(`/auth/sign-up?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setBusy(target);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: target,
          interval: yearly ? "year" : "month",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      await refreshSession?.();
      setMessage(data.message || `${PLANS[target].name} is now active.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setYearly(false)}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
            !yearly
              ? "bg-[var(--foreground)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setYearly(true)}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
            yearly
              ? "bg-[var(--foreground)] text-white"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Yearly <span className="text-[var(--accent)]">save ~30%</span>
        </button>
      </div>

      {message ? (
        <p className="mb-4 rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const price = yearly ? p.priceYearly : p.priceMonthly;
          const current = plan === id && Boolean(user);
          return (
            <article
              key={id}
              className={`panel relative flex flex-col p-5 sm:p-6 ${
                p.highlighted
                  ? "border-[color-mix(in_oklab,var(--accent)_55%,var(--border))] shadow-[var(--shadow-lift)]"
                  : ""
              }`}
            >
              {p.highlighted ? (
                <span className="absolute -top-3 left-5 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white">
                  Most popular
                </span>
              ) : null}
              <p className="font-display text-xl font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{p.tagline}</p>
              <p className="mt-5 font-display text-4xl font-bold tracking-tight">
                {price === 0 ? (
                  "$0"
                ) : (
                  <>
                    ${price}
                    <span className="text-base font-semibold text-[var(--muted)]">
                      /{yearly ? "yr" : "mo"}
                    </span>
                  </>
                )}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-[var(--muted)]">
                {p.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-0.5 text-[var(--accent)]">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={busy === id || current}
                onClick={() => upgrade(id)}
                className={`btn mt-6 w-full ${
                  p.highlighted ? "btn-primary" : "btn-ghost"
                }`}
              >
                {busy === id ? (
                  <>
                    <Spinner size={16} /> Working…
                  </>
                ) : current ? (
                  "Current plan"
                ) : (
                  p.cta
                )}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        PDF download always stays free —{" "}
        <Link href="/" className="font-semibold text-[var(--accent)] hover:underline">
          create an invoice now
        </Link>
        . No login needed.
      </p>
    </div>
  );
}
