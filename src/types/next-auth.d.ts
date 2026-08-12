import "next-auth";
import type { PlanId } from "@/lib/plans";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      plan: PlanId;
    };
  }

  interface User {
    plan?: PlanId;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: PlanId;
  }
}
