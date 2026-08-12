export type PlanId = "free" | "pro" | "business";

export interface PlanLimits {
  cloudInvoices: number;
  emailsPerMonth: number;
  removeBranding: boolean;
  downloadPdf: boolean;
  localHistory: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  highlighted?: boolean;
  cta: string;
  features: string[];
  limits: PlanLimits;
}

/** Product model: PDF download stays free forever (no login). Paid unlocks cloud + email. */
export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Create and download invoices — no login required.",
    priceMonthly: 0,
    priceYearly: 0,
    cta: "Start free",
    features: [
      "Unlimited invoice creation",
      "Unlimited PDF downloads (no login)",
      "All currencies",
      "Local draft & device history",
      "Cloud history up to 25 (with free account)",
    ],
    limits: {
      cloudInvoices: 25,
      emailsPerMonth: 0,
      removeBranding: false,
      downloadPdf: true,
      localHistory: true,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "For freelancers who send invoices every week.",
    priceMonthly: 12,
    priceYearly: 99,
    highlighted: true,
    cta: "Go Pro",
    features: [
      "Everything in Free",
      "Unlimited cloud history sync",
      "Email invoices to clients (100/mo)",
      "Clean PDF without app branding",
      "Priority email delivery",
    ],
    limits: {
      cloudInvoices: Number.POSITIVE_INFINITY,
      emailsPerMonth: 100,
      removeBranding: true,
      downloadPdf: true,
      localHistory: true,
    },
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "For small teams with higher send volume.",
    priceMonthly: 29,
    priceYearly: 249,
    cta: "Go Business",
    features: [
      "Everything in Pro",
      "500 client emails / month",
      "Shared cloud workspace ready",
      "Faster support",
      "Best for agencies & shops",
    ],
    limits: {
      cloudInvoices: Number.POSITIVE_INFINITY,
      emailsPerMonth: 500,
      removeBranding: true,
      downloadPdf: true,
      localHistory: true,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business"];

export function normalizePlan(value: unknown): PlanId {
  if (value === "pro" || value === "business" || value === "free") return value;
  return "free";
}

export function getPlan(plan: PlanId | string | null | undefined): PlanDefinition {
  return PLANS[normalizePlan(plan)];
}

export function planRank(plan: PlanId): number {
  return PLAN_ORDER.indexOf(plan);
}

export function hasMinPlan(current: PlanId, required: PlanId): boolean {
  return planRank(current) >= planRank(required);
}

export function canSendEmail(plan: PlanId): boolean {
  return getPlan(plan).limits.emailsPerMonth > 0;
}

export function canRemoveBranding(plan: PlanId): boolean {
  return getPlan(plan).limits.removeBranding;
}

export function cloudInvoiceLimit(plan: PlanId): number {
  return getPlan(plan).limits.cloudInvoices;
}

export function emailsPerMonthLimit(plan: PlanId): number {
  return getPlan(plan).limits.emailsPerMonth;
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
