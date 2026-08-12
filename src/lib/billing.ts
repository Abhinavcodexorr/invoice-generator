import { connectMongo } from "@/lib/mongodb";
import { InvoiceDoc } from "@/lib/models/InvoiceDoc";
import { User } from "@/lib/models/User";
import {
  cloudInvoiceLimit,
  currentMonthKey,
  emailsPerMonthLimit,
  normalizePlan,
  type PlanId,
} from "@/lib/plans";

export async function getUserPlan(userId: string): Promise<PlanId> {
  await connectMongo();
  const user = await User.findById(userId).select("plan planStatus planPeriodEnd");
  if (!user) return "free";

  if (
    user.planStatus === "canceled" &&
    user.planPeriodEnd &&
    new Date(user.planPeriodEnd).getTime() < Date.now()
  ) {
    return "free";
  }

  return normalizePlan(user.plan);
}

export async function assertCanCreateCloudInvoice(userId: string) {
  const plan = await getUserPlan(userId);
  const limit = cloudInvoiceLimit(plan);
  if (!Number.isFinite(limit)) return { ok: true as const, plan };

  await connectMongo();
  const count = await InvoiceDoc.countDocuments({ userId });
  if (count >= limit) {
    return {
      ok: false as const,
      plan,
      error: `Free plan allows ${limit} cloud invoices. Upgrade to Pro for unlimited sync.`,
    };
  }
  return { ok: true as const, plan, count, limit };
}

export async function assertCanSendEmail(userId: string) {
  await connectMongo();
  const user = await User.findById(userId);
  if (!user) {
    return { ok: false as const, error: "Sign in required", plan: "free" as PlanId };
  }

  const plan = normalizePlan(user.plan);
  const limit = emailsPerMonthLimit(plan);
  if (limit <= 0) {
    return {
      ok: false as const,
      plan,
      error: "Email sending is a Pro feature. Upgrade to send invoices to clients.",
    };
  }

  const month = currentMonthKey();
  let sent = user.emailsSentThisMonth || 0;
  if (user.emailsMonthKey !== month) {
    sent = 0;
    user.emailsMonthKey = month;
    user.emailsSentThisMonth = 0;
    await user.save();
  }

  if (sent >= limit) {
    return {
      ok: false as const,
      plan,
      error: `Monthly email limit reached (${limit}). Upgrade to Business for more sends.`,
    };
  }

  return { ok: true as const, plan, sent, limit, user };
}

export async function recordEmailSent(userId: string) {
  await connectMongo();
  const user = await User.findById(userId);
  if (!user) return;
  const month = currentMonthKey();
  if (user.emailsMonthKey !== month) {
    user.emailsMonthKey = month;
    user.emailsSentThisMonth = 1;
  } else {
    user.emailsSentThisMonth = (user.emailsSentThisMonth || 0) + 1;
  }
  await user.save();
}

export async function activatePlan(userId: string, plan: PlanId) {
  await connectMongo();
  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        plan: normalizePlan(plan),
        planStatus: "active",
        planPeriodEnd: plan === "free" ? null : periodEnd,
      },
    },
    { new: true },
  );
}
