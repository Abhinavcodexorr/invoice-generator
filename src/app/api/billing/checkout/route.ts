import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { activatePlan } from "@/lib/billing";
import { normalizePlan, type PlanId } from "@/lib/plans";

/**
 * Activates a plan for the signed-in user.
 * When STRIPE_SECRET_KEY is present later, swap this for Stripe Checkout.
 * For now this is demo/self-serve activation so the product model works end-to-end.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sign in to upgrade your plan" },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      plan?: string;
      interval?: "month" | "year";
    };
    const plan = normalizePlan(body.plan) as PlanId;
    if (plan === "free") {
      return NextResponse.json(
        { error: "Choose Pro or Business to upgrade" },
        { status: 400 },
      );
    }

    // Stripe hook point:
    // if (process.env.STRIPE_SECRET_KEY) { create Checkout Session; return { url } }

    await activatePlan(session.user.id, plan);

    return NextResponse.json({
      ok: true,
      plan,
      mode: "demo",
      message: `${plan === "pro" ? "Pro" : "Business"} activated. Stripe can replace this demo checkout later.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
