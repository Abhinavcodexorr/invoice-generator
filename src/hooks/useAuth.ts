"use client";

import { signOut, useSession } from "next-auth/react";
import { useMemo } from "react";
import { getPlan, normalizePlan, type PlanId } from "@/lib/plans";

export function useAuth() {
  const { data, status, update } = useSession();
  const plan: PlanId = normalizePlan(data?.user?.plan);
  const userId = data?.user?.id || null;
  const userEmail = data?.user?.email || undefined;

  const user = useMemo(
    () =>
      userId
        ? {
            id: userId,
            email: userEmail,
            plan,
          }
        : null,
    [userId, userEmail, plan],
  );

  return {
    user,
    plan,
    planInfo: getPlan(plan),
    loading: status === "loading",
    configured: true,
    refreshSession: update,
    signOut: async () => {
      await signOut({ callbackUrl: "/" });
    },
  };
}
